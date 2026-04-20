// seed-admin.mjs — Comprehensive seed for tenant admin@petagenda.com
// Run: node scripts/seed-admin.mjs

const SUPABASE_URL = 'https://qckasnpabjucioiemiot.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFja2FzbnBhYmp1Y2lvaWVtaW90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM5MjI2OSwiZXhwIjoyMDkxOTY4MjY5fQ.YEfuOi1H0-NyMjneJxkumDvlqaVf3-FL3z5_xr1HGXo';
const TENANT_ID = '9c2e437c-4bce-4a43-a9bf-24854ce34498';
const ADMIN_USER_ID = 'e8348466-dc25-48f2-b0ba-25d22c8b5917';
const PHILIPE_USER_ID = '14d1788f-dcdf-44ff-8946-54d7d3ed1ce1';

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};
const restHeaders = { ...headers, Prefer: 'return=minimal' };

// ─── Helpers ────────────────────────────────────────────────────────────────

async function authPost(path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`AUTH ${path} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function restPost(table, rows, extra = {}) {
  const body = Array.isArray(rows) ? rows : [rows];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...restHeaders, ...extra },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`REST POST ${table} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function restGet(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`REST GET ${table} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function insertInBatches(table, rows, batchSize = 20) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await restPost(table, batch);
    inserted += batch.length;
    process.stdout.write(`  · ${inserted}/${rows.length}\r`);
  }
  console.log(`  ✓ ${inserted} rows → ${table}                    `);
  return inserted;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

function pad(n) { return String(n).padStart(2, '0'); }

// ─── 1. Veterinários ────────────────────────────────────────────────────────

const VET_DEFS = [
  { name: 'Dr. Carlos Mendes',    email: 'vet1@petagenda.com' },
  { name: 'Dra. Ana Paula Silva', email: 'vet2@petagenda.com' },
  { name: 'Dr. Roberto Lima',     email: 'vet3@petagenda.com' },
  { name: 'Dra. Fernanda Costa',  email: 'vet4@petagenda.com' },
  { name: 'Dr. Miguel Torres',    email: 'vet5@petagenda.com' },
  { name: 'Dra. Juliana Martins', email: 'vet6@petagenda.com' },
];

async function seedVets() {
  console.log('\n[1/4] Criando 6 veterinários...');
  const vetIds = [];

  for (const vet of VET_DEFS) {
    let uid;
    try {
      const authUser = await authPost('/auth/v1/admin/users', {
        email: vet.email,
        password: 'Vet@123456',
        email_confirm: true,
        user_metadata: { full_name: vet.name, role: 'employee', tenant_id: TENANT_ID },
      });
      uid = authUser.id;
      console.log(`  ✓ Auth criado: ${vet.name} (${uid})`);
    } catch (e) {
      const msg = e.message;
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('already exists')) {
        // Fetch existing via list
        const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(vet.email)}`, { headers });
        const data = await res.json();
        uid = data.users?.[0]?.id;
        if (uid) {
          console.log(`  ↩ Auth já existe: ${vet.email} (${uid})`);
        } else {
          console.log(`  ✗ Não encontrado: ${vet.email}`);
          continue;
        }
      } else {
        console.log(`  ✗ ${vet.email}: ${msg.substring(0, 100)}`);
        continue;
      }
    }

    vetIds.push({ ...vet, id: uid });

    // Insert into public.users (schema: id, tenant_id, full_name, role, phone, is_active, permissions)
    try {
      await restPost('users', [{
        id: uid,
        tenant_id: TENANT_ID,
        full_name: vet.name,
        role: 'employee',
        phone: null,
        is_active: true,
        permissions: {},
        force_password_change: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
      console.log(`  ✓ public.users: ${vet.name}`);
    } catch (e) {
      const msg = e.message;
      if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('unique')) {
        console.log(`  ↩ public.users já existe: ${vet.name}`);
      } else {
        console.log(`  ⚠ public.users ${vet.name}: ${msg.substring(0, 100)}`);
      }
    }
  }

  return vetIds;
}

// ─── 2. Serviços ────────────────────────────────────────────────────────────
// Schema: id, tenant_id, name, description, duration_minutes, price, price_by_size,
//         category, color, is_active, sort_order, max_capacity

async function seedServices(vetIds) {
  console.log('\n[2/4] Inserindo 15 novos serviços...');

  // Get current sort_order max
  let sortBase = 10;
  try {
    const existing = await restGet('services', `tenant_id=eq.${TENANT_ID}&select=sort_order&order=sort_order.desc&limit=1`);
    if (existing.length > 0 && existing[0].sort_order != null) {
      sortBase = existing[0].sort_order + 1;
    }
  } catch (e) {}

  // We store vet IDs for use in appointments (they ARE assigned via appointments.assigned_to, not services)
  // services table has no assigned_to column — assignment is done at appointment level
  const services = [
    // Grooming
    { id: uuid(), tenant_id: TENANT_ID, name: 'Hidratação Capilar',   description: null, duration_minutes: 60,   price: 50,  price_by_size: null, category: 'grooming',   color: '#EC4899', is_active: true, sort_order: sortBase++,   max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Spa Completo',         description: null, duration_minutes: 90,   price: 90,  price_by_size: null, category: 'grooming',   color: '#A855F7', is_active: true, sort_order: sortBase++,   max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Tosa Higiênica',       description: null, duration_minutes: 45,   price: 40,  price_by_size: null, category: 'grooming',   color: '#F59E0B', is_active: true, sort_order: sortBase++,   max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Escovação e Penteado', description: null, duration_minutes: 30,   price: 35,  price_by_size: null, category: 'grooming',   color: '#F97316', is_active: true, sort_order: sortBase++,   max_capacity: 1 },
    // Veterinary — assigned_to stored separately (used in appointments)
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Clínica Geral',  description: null, duration_minutes: 30,   price: 150, price_by_size: null, category: 'veterinary', color: '#10B981', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Dermatologia',   description: null, duration_minutes: 45,   price: 200, price_by_size: null, category: 'veterinary', color: '#6366F1', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Cardiologia',    description: null, duration_minutes: 60,   price: 250, price_by_size: null, category: 'veterinary', color: '#EF4444', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Ortopedia',      description: null, duration_minutes: 45,   price: 220, price_by_size: null, category: 'veterinary', color: '#0EA5E9', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Oftalmologia',   description: null, duration_minutes: 30,   price: 180, price_by_size: null, category: 'veterinary', color: '#84CC16', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Consulta Nutrição',       description: null, duration_minutes: 45,   price: 160, price_by_size: null, category: 'veterinary', color: '#F59E0B', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Vacinação',               description: null, duration_minutes: 20,   price: 80,  price_by_size: null, category: 'veterinary', color: '#14B8A6', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Microchip',               description: null, duration_minutes: 15,   price: 120, price_by_size: null, category: 'veterinary', color: '#8B5CF6', is_active: true, sort_order: sortBase++, max_capacity: 1 },
    // Daycare / Hotel
    { id: uuid(), tenant_id: TENANT_ID, name: 'Day Care - Diária',       description: null, duration_minutes: 480,  price: 80,  price_by_size: null, category: 'other',      color: '#0EA5E9', is_active: true, sort_order: sortBase++, max_capacity: 5 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Hotel Pet - Por Noite',   description: null, duration_minutes: 1440, price: 120, price_by_size: null, category: 'other',      color: '#6366F1', is_active: true, sort_order: sortBase++, max_capacity: 5 },
    { id: uuid(), tenant_id: TENANT_ID, name: 'Passeio 30min',           description: null, duration_minutes: 30,   price: 45,  price_by_size: null, category: 'other',      color: '#22C55E', is_active: true, sort_order: sortBase++, max_capacity: 1 },
  ];

  // Vet-to-service mapping for use in appointments (index matches VET_DEFS order)
  const vetConsultaNames = [
    'Consulta Clínica Geral', 'Consulta Dermatologia', 'Consulta Cardiologia',
    'Consulta Ortopedia', 'Consulta Oftalmologia', 'Consulta Nutrição',
  ];
  const vetServiceMap = {}; // serviceId → vetUserId
  for (let i = 0; i < 6; i++) {
    const svc = services.find(s => s.name === vetConsultaNames[i]);
    if (svc && vetIds[i]) {
      vetServiceMap[svc.id] = vetIds[i].id;
    }
  }

  await insertInBatches('services', services);
  return { services, vetServiceMap };
}

// ─── 3. Clientes + Pets ──────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Lucas', 'Beatriz', 'Rafael', 'Camila', 'Thiago', 'Mariana', 'Gustavo',
  'Larissa', 'Bruno', 'Patrícia', 'Eduardo', 'Fernanda', 'Diego', 'Amanda',
  'Felipe', 'Juliana', 'Rodrigo', 'Vanessa', 'Leandro', 'Natalia',
  'Vinícius', 'Daniela', 'André', 'Priscila',
];
const LAST_NAMES = [
  'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Rodrigues',
  'Almeida', 'Nascimento', 'Carvalho', 'Ribeiro', 'Pereira', 'Gomes',
  'Moreira', 'Barbosa', 'Cavalcante', 'Cruz', 'Medeiros', 'Teixeira', 'Pinto',
];
const DOG_BREEDS = [
  'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francês', 'Shih Tzu',
  'Yorkshire', 'Beagle', 'Husky Siberiano', 'Pastor Alemão', 'Dachshund',
];
const CAT_BREEDS = ['SRD', 'Maine Coon', 'Siamês', 'Persa', 'Ragdoll', 'British Shorthair', 'Bengal'];
const PET_NAMES = [
  'Luna', 'Thor', 'Bella', 'Max', 'Nina', 'Bob', 'Mel', 'Zeus',
  'Lola', 'Simba', 'Maggie', 'Rocky', 'Mia', 'Buddy', 'Coco',
  'Rex', 'Pipoca', 'Bolinha', 'Toby', 'Princesa', 'Ginger', 'Charlie',
];

let _ni = 0;
function nextName() {
  const fn = FIRST_NAMES[_ni % FIRST_NAMES.length];
  const ln = LAST_NAMES[Math.floor(_ni / FIRST_NAMES.length) % LAST_NAMES.length];
  _ni++;
  return `${fn} ${ln}`;
}

function phone() {
  const n1 = Math.floor(Math.random() * 9000) + 1000;
  const n2 = Math.floor(Math.random() * 9000) + 1000;
  return `(11)9${n1}-${n2}`;
}

function randomPets(clientId, count) {
  const num = count ?? (Math.random() < 0.4 ? 1 : Math.random() < 0.7 ? 2 : 3);
  const pets = [];
  for (let i = 0; i < num; i++) {
    const isdog = Math.random() > 0.35;
    pets.push({
      id: uuid(),
      tenant_id: TENANT_ID,
      client_id: clientId,
      name: PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)],
      species: isdog ? 'dog' : 'cat',
      breed: isdog
        ? DOG_BREEDS[Math.floor(Math.random() * DOG_BREEDS.length)]
        : CAT_BREEDS[Math.floor(Math.random() * CAT_BREEDS.length)],
      size: null,
      weight: parseFloat((Math.random() * 20 + 1).toFixed(1)),
      birth_date: isoDate(addDays(new Date(), -(Math.floor(Math.random() * 3650) + 180))),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      coat_type: null,
      temperament: null,
      health_notes: null,
      photo_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return pets;
}

async function seedClients() {
  console.log('\n[3/4] Inserindo 23 novos clientes e seus pets...');
  const today = new Date('2026-04-19');
  const clients = [];

  // 15 active
  for (let i = 0; i < 15; i++) {
    clients.push({
      id: uuid(),
      tenant_id: TENANT_ID,
      full_name: nextName(),
      phone: phone(),
      email: null,
      cpf: null,
      address: null,
      tags: [],
      notes: null,
      total_spent: 0,
      visit_count: 0,
      last_visit_at: null,
      loyalty_points: 0,
      whatsapp_opt_in: Math.random() > 0.3,
      status: 'active',
      inactive_since: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  // 8 inactive
  for (let i = 0; i < 8; i++) {
    const daysAgo = Math.floor(Math.random() * 90) + 10;
    clients.push({
      id: uuid(),
      tenant_id: TENANT_ID,
      full_name: nextName(),
      phone: phone(),
      email: null,
      cpf: null,
      address: null,
      tags: [],
      notes: null,
      total_spent: 0,
      visit_count: 0,
      last_visit_at: null,
      loyalty_points: 0,
      whatsapp_opt_in: false,
      status: 'inactive',
      inactive_since: addDays(today, -daysAgo).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  await insertInBatches('clients', clients);

  const allPets = clients.flatMap(c => randomPets(c.id));
  await insertInBatches('pets', allPets);

  console.log(`  ✓ ${clients.length} clientes (15 ativos + 8 inativos), ${allPets.length} pets`);
  return { clients, pets: allPets };
}

// ─── 4. Agendamentos ─────────────────────────────────────────────────────────
// Schema: id, tenant_id, client_id, pet_id, service_id, assigned_to,
//         date (DATE), start_time (TIME), end_time (TIME),
//         status, price, notes, confirmation_sent, reminder_sent, source,
//         canceled_reason, completed_at, created_at, updated_at

function weightedPick(pool) {
  const r = Math.random();
  let acc = 0;
  for (const [val, w] of pool) { acc += w; if (r < acc) return val; }
  return pool[pool.length - 1][0];
}

const PAST_STATUS   = [['completed', 0.70], ['canceled', 0.15], ['no_show', 0.10], ['in_progress', 0.05]];
const FUTURE_STATUS = [['scheduled', 0.60], ['confirmed', 0.40]];
const TODAY_STATUS  = [['in_progress', 0.35], ['confirmed', 0.35], ['scheduled', 0.30]];

const CANCEL_REASONS = [
  'Cliente solicitou cancelamento',
  'Emergência do cliente',
  'Pet doente',
  'Conflito de agenda',
  'Problema de transporte',
];

const HOURS = [8, 9, 10, 11, 13, 14, 15, 16, 17];

async function seedAppointments(vetIds, services, vetServiceMap, newClients, newPets) {
  console.log('\n[4/4] Gerando ~180 agendamentos (−30 a +30 dias)...');

  const today = new Date('2026-04-19');

  // Fetch existing pets so we can use ALL pets (not just new ones)
  let existingPets = [];
  try {
    existingPets = await restGet('pets', `tenant_id=eq.${TENANT_ID}&select=id,client_id&limit=2000`);
  } catch (e) {
    console.log('  ⚠ Could not fetch existing pets:', e.message.substring(0, 60));
  }
  const allPets = existingPets.length > 0 ? existingPets : newPets;

  if (allPets.length === 0) {
    console.log('  ✗ Nenhum pet disponível — pulando agendamentos');
    return 0;
  }

  const groomingStaff = [ADMIN_USER_ID, PHILIPE_USER_ID];
  const appointments = [];

  function buildAppt(date, hour, status) {
    const svc = services[Math.floor(Math.random() * services.length)];
    const pet = allPets[Math.floor(Math.random() * allPets.length)];
    const dateStr = isoDate(date);
    // Cap duration so end time never exceeds 23:59 and is always > start_time
    const maxDuration = (23 * 60 + 59) - hour * 60; // minutes until end of day
    const effectiveDuration = Math.min(svc.duration_minutes, maxDuration, 480);
    const endTotalMinutes = hour * 60 + Math.max(effectiveDuration, 1);
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMin  = endTotalMinutes % 60;
    const startTime = `${pad(hour)}:00:00`;
    const endTime   = `${pad(endHour)}:${pad(endMin)}:00`;

    let assignedTo = ADMIN_USER_ID;
    if (vetServiceMap[svc.id]) {
      assignedTo = vetServiceMap[svc.id];
    } else if (svc.category === 'grooming') {
      assignedTo = groomingStaff[Math.floor(Math.random() * groomingStaff.length)];
    } else if (svc.category === 'veterinary') {
      // General vet services → random vet
      const vetList = vetIds.filter(v => v.id);
      if (vetList.length > 0) assignedTo = vetList[Math.floor(Math.random() * vetList.length)].id;
    }

    const completedAt = (status === 'completed')
      ? new Date(`${dateStr}T${startTime}`).toISOString()
      : null;
    const canceledReason = (status === 'canceled')
      ? CANCEL_REASONS[Math.floor(Math.random() * CANCEL_REASONS.length)]
      : null;

    return {
      id: uuid(),
      tenant_id: TENANT_ID,
      client_id: pet.client_id,
      pet_id: pet.id,
      service_id: svc.id,
      assigned_to: assignedTo,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      status,
      price: svc.price,
      notes: null,
      confirmation_sent: false,
      reminder_sent: false,
      source: 'manual',
      canceled_reason: canceledReason,
      completed_at: completedAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Past: -30 to -1
  for (let day = -30; day <= -1; day++) {
    const date = addDays(today, day);
    const slots = Math.floor(Math.random() * 5) + 2; // 2-6 per day
    const shuffled = [...HOURS].sort(() => Math.random() - 0.5).slice(0, slots);
    for (const h of shuffled) {
      appointments.push(buildAppt(date, h, weightedPick(PAST_STATUS)));
    }
  }

  // Today
  const todaySlots = [...HOURS].sort(() => Math.random() - 0.5).slice(0, 7);
  for (const h of todaySlots) {
    appointments.push(buildAppt(today, h, weightedPick(TODAY_STATUS)));
  }

  // Future: +1 to +30
  for (let day = 1; day <= 30; day++) {
    const date = addDays(today, day);
    const slots = Math.floor(Math.random() * 4) + 1; // 1-4 per day
    const shuffled = [...HOURS].sort(() => Math.random() - 0.5).slice(0, slots);
    for (const h of shuffled) {
      appointments.push(buildAppt(date, h, weightedPick(FUTURE_STATUS)));
    }
  }

  console.log(`  Inserindo ${appointments.length} agendamentos em lotes de 20...`);
  await insertInBatches('appointments', appointments, 20);
  return appointments.length;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' PetAgenda — Seed completo para admin@petagenda.com');
  console.log(`  Tenant: ${TENANT_ID}`);
  console.log('═══════════════════════════════════════════════════════════');

  const vetIds = await seedVets();
  console.log(`\n  → ${vetIds.length} vets processados`);

  const { services, vetServiceMap } = await seedServices(vetIds);
  console.log(`  → ${services.length} serviços inseridos`);

  const { clients, pets: newPets } = await seedClients();

  const apptCount = await seedAppointments(vetIds, services, vetServiceMap, clients, newPets);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' SEED CONCLUÍDO COM SUCESSO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Veterinários criados:  ${vetIds.length}`);
  console.log(`  Serviços inseridos:    ${services.length}`);
  console.log(`  Clientes inseridos:    ${clients.length}  (15 ativos + 8 inativos)`);
  console.log(`  Pets inseridos:        ${newPets.length}`);
  console.log(`  Agendamentos criados:  ${apptCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ ERRO FATAL:', err.message);
  process.exit(1);
});
