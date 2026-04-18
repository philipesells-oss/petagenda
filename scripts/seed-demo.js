#!/usr/bin/env node
/**
 * Seed demo data — clientes, pets e agendamentos falsos para testar o dashboard.
 * Usage: node scripts/seed-demo.js
 */

const SUPABASE_URL = 'https://qckasnpabjucioiemiot.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2FzbnBhYmp1Y2lvaWVtaW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM5MjI2OSwiZXhwIjoyMDkxOTY4MjY5fQ.YEfuOi1H0-NyMjneJxkumDvlqaVf3-FL3z5_xr1HGXo'
const TENANT_ID = '9c2e437c-4bce-4a43-a9bf-24854ce34498'
const USER_ID   = '14d1788f-dcdf-44ff-8946-54d7d3ed1ce1'

const SERVICES = {
  banho:       '0d2ea960-8534-4c7b-97c4-b47a7ccd4fdc',
  tosa:        'ac910f6c-7498-4059-8a4d-68c5c01807cc',
  banhoTosa:   '487f3082-6175-44bd-a3ae-ad54ead537f5',
  unhas:       '0809c1f9-ff23-4237-922b-aab1744b2930',
}

const PRICES    = { banho: 45, tosa: 35, banhoTosa: 70, unhas: 30 }
const DURATIONS = { banho: 60, tosa: 60, banhoTosa: 90, unhas: 60 }

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}:00`
}

async function req(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`)
  return text ? JSON.parse(text) : null
}

function dateStr(daysOffset) {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

async function main() {
  console.log('🌱 Iniciando seed de dados demo...\n')

  // ── Clientes ────────────────────────────────────────────────────────────────
  const clientsData = [
    { full_name: 'Ana Lima',      phone: '21987654321', email: 'ana.lima@email.com' },
    { full_name: 'Bruno Carvalho',phone: '11912345678', email: 'bruno.c@email.com' },
    { full_name: 'Carla Mendes',  phone: '31999887766', email: 'carla.m@email.com' },
    { full_name: 'Diego Santos',  phone: '41988776655', email: 'diego.s@email.com' },
    { full_name: 'Fernanda Costa',phone: '51977665544', email: 'fernanda.c@email.com' },
    { full_name: 'Gabriel Rocha', phone: '61966554433', email: 'gabriel.r@email.com' },
  ]

  const clients = await req('POST', '/clients', clientsData.map(c => ({
    ...c, tenant_id: TENANT_ID, status: 'active', whatsapp_opt_in: true,
  })))
  console.log(`✅ ${clients.length} clientes criados`)

  // ── Pets ────────────────────────────────────────────────────────────────────
  const petsData = [
    // Ana Lima — 1 pet (deve auto-selecionar)
    { client: 'Ana Lima',       name: 'Thor',    species: 'dog', breed: 'Golden Retriever', weight: 32, birth_date: '2020-03-15', gender: 'male' },
    // Bruno Carvalho — 2 pets (deve mostrar dropdown)
    { client: 'Bruno Carvalho', name: 'Luna',    species: 'cat', breed: 'Siamês',           weight: 4.2, birth_date: '2021-07-20', gender: 'female' },
    { client: 'Bruno Carvalho', name: 'Max',     species: 'dog', breed: 'Poodle',           weight: 8,  birth_date: '2019-11-05', gender: 'male' },
    // Carla Mendes — 1 pet
    { client: 'Carla Mendes',   name: 'Mel',     species: 'dog', breed: 'Shih Tzu',         weight: 5.5, birth_date: '2022-01-10', gender: 'female' },
    // Diego Santos — 2 pets
    { client: 'Diego Santos',   name: 'Rex',     species: 'dog', breed: 'Pastor Alemão',    weight: 38, birth_date: '2018-06-25', gender: 'male' },
    { client: 'Diego Santos',   name: 'Nina',    species: 'dog', breed: 'Dachshund',        weight: 7,  birth_date: '2023-02-14', gender: 'female' },
    // Fernanda Costa — 1 pet
    { client: 'Fernanda Costa', name: 'Pingo',   species: 'cat', breed: 'Persa',            weight: 3.8, birth_date: '2020-09-30', gender: 'male' },
    // Gabriel Rocha — 1 pet
    { client: 'Gabriel Rocha',  name: 'Belinha', species: 'dog', breed: 'Maltês',           weight: 3.2, birth_date: '2022-05-18', gender: 'female' },
  ]

  const clientMap = {}
  for (const c of clients) clientMap[c.full_name] = c.id

  const petsInsert = petsData.map(p => ({
    tenant_id: TENANT_ID,
    client_id: clientMap[p.client],
    name: p.name,
    species: p.species,
    breed: p.breed,
    weight: p.weight,
    birth_date: p.birth_date,
    gender: p.gender,
    is_active: true,
  }))

  const pets = await req('POST', '/pets', petsInsert)
  console.log(`✅ ${pets.length} pets criados`)

  // pet lookup: client + name → id
  const petMap = {}
  for (const p of pets) {
    const orig = petsData.find(d => d.name === p.name && clientMap[d.client] === p.client_id)
    if (orig) petMap[`${orig.client}|${orig.name}`] = p.id
  }

  // ── Agendamentos ────────────────────────────────────────────────────────────
  // Mistura de: passado (done/cancelled), hoje (confirmed), futuro (scheduled)
  const appts = [
    // Semana passada — done
    { client: 'Ana Lima',       pet: 'Thor',    svc: 'banho',     dOff: -14, time: '09:00', status: 'completed',      price: 45 },
    { client: 'Bruno Carvalho', pet: 'Luna',    svc: 'unhas',     dOff: -12, time: '10:00', status: 'completed',      price: 30 },
    { client: 'Bruno Carvalho', pet: 'Max',     svc: 'banhoTosa', dOff: -10, time: '14:00', status: 'completed',      price: 70 },
    { client: 'Carla Mendes',   pet: 'Mel',     svc: 'banho',     dOff: -9,  time: '11:00', status: 'completed',      price: 45 },
    { client: 'Diego Santos',   pet: 'Rex',     svc: 'tosa',      dOff: -7,  time: '09:00', status: 'completed',      price: 35 },
    { client: 'Fernanda Costa', pet: 'Pingo',   svc: 'banho',     dOff: -7,  time: '15:00', status: 'canceled', price: 45 },
    { client: 'Gabriel Rocha',  pet: 'Belinha', svc: 'banhoTosa', dOff: -5,  time: '13:00', status: 'completed',      price: 70 },
    { client: 'Ana Lima',       pet: 'Thor',    svc: 'tosa',      dOff: -4,  time: '10:00', status: 'completed',      price: 35 },
    { client: 'Diego Santos',   pet: 'Nina',    svc: 'banho',     dOff: -3,  time: '14:00', status: 'completed',      price: 45 },
    { client: 'Bruno Carvalho', pet: 'Max',     svc: 'unhas',     dOff: -2,  time: '16:00', status: 'completed',      price: 30 },
    // Ontem
    { client: 'Carla Mendes',   pet: 'Mel',     svc: 'banhoTosa', dOff: -1,  time: '09:30', status: 'completed',      price: 70 },
    { client: 'Fernanda Costa', pet: 'Pingo',   svc: 'unhas',     dOff: -1,  time: '11:00', status: 'completed',      price: 30 },
    // Hoje
    { client: 'Ana Lima',       pet: 'Thor',    svc: 'banho',     dOff:  0,  time: '09:00', status: 'confirmed', price: 45 },
    { client: 'Gabriel Rocha',  pet: 'Belinha', svc: 'tosa',      dOff:  0,  time: '11:00', status: 'confirmed', price: 35 },
    { client: 'Diego Santos',   pet: 'Rex',     svc: 'banhoTosa', dOff:  0,  time: '14:00', status: 'scheduled', price: 70 },
    // Próximos dias
    { client: 'Bruno Carvalho', pet: 'Luna',    svc: 'banho',     dOff:  1,  time: '10:00', status: 'scheduled', price: 45 },
    { client: 'Carla Mendes',   pet: 'Mel',     svc: 'tosa',      dOff:  2,  time: '09:00', status: 'scheduled', price: 35 },
    { client: 'Fernanda Costa', pet: 'Pingo',   svc: 'banhoTosa', dOff:  3,  time: '15:00', status: 'scheduled', price: 70 },
    { client: 'Ana Lima',       pet: 'Thor',    svc: 'unhas',     dOff:  5,  time: '11:00', status: 'scheduled', price: 30 },
    { client: 'Gabriel Rocha',  pet: 'Belinha', svc: 'banho',     dOff:  7,  time: '13:00', status: 'scheduled', price: 45 },
  ]

  const apptInsert = appts.map(a => ({
    tenant_id:   TENANT_ID,
    client_id:   clientMap[a.client],
    pet_id:      petMap[`${a.client}|${a.pet}`],
    service_id:  SERVICES[a.svc],
    assigned_to: USER_ID,
    date:        dateStr(a.dOff),
    start_time:  a.time + ':00',
    end_time:    addMinutes(a.time, DURATIONS[a.svc]),
    price:       a.price,
    status:      a.status,
    source:      'manual',
  }))

  const created = await req('POST', '/appointments', apptInsert)
  console.log(`✅ ${created.length} agendamentos criados`)

  console.log('\n🎉 Seed concluído! Abra o dashboard para ver os dados.')
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
