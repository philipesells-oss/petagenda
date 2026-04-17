#!/usr/bin/env node
/**
 * Verify the PetAgenda schema after migrations:
 *   - all expected tables exist
 *   - RLS is enabled on tenant-scoped tables
 *   - helper function get_my_tenant_id() exists
 *   - seed data present
 */
const { Client } = require('pg');

const PROJECT_REF = 'qckasnpabjucioiemiot';
const DB_PASSWORD = '&GXmzJY/a9!aTZ?';

async function main() {
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const expectedTables = [
    'tenants', 'users', 'clients', 'pets', 'services',
    'appointments', 'business_hours', 'blocked_slots', 'message_templates',
  ];

  const { rows: tables } = await client.query(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = ANY($1)
    ORDER BY tablename
  `, [expectedTables]);

  console.log('\n=== TABLES & RLS ===');
  for (const t of expectedTables) {
    const row = tables.find((r) => r.tablename === t);
    if (!row) console.log(`  ${t.padEnd(20)} MISSING`);
    else console.log(`  ${t.padEnd(20)} OK  | RLS=${row.rowsecurity}`);
  }

  const { rows: fn } = await client.query(`
    SELECT proname, prosecdef
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname IN ('get_my_tenant_id','handle_new_user','update_updated_at',
                      'update_client_metrics','auto_tag_client')
    ORDER BY proname
  `);
  console.log('\n=== FUNCTIONS ===');
  for (const f of fn) {
    console.log(`  ${f.proname.padEnd(25)} security_definer=${f.prosecdef}`);
  }

  const { rows: trig } = await client.query(`
    SELECT tgname, tgrelid::regclass AS tbl
    FROM pg_trigger
    WHERE NOT tgisinternal
      AND tgname IN (
        'tr_tenants_updated','tr_users_updated','tr_clients_updated',
        'tr_pets_updated','tr_services_updated','tr_appointments_updated',
        'tr_business_hours_updated','tr_appointment_completed',
        'tr_auto_tag_client','on_auth_user_created'
      )
    ORDER BY tgname
  `);
  console.log('\n=== TRIGGERS ===');
  for (const t of trig) console.log(`  ${t.tgname.padEnd(30)} on ${t.tbl}`);

  const { rows: idx } = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE schemaname='public' AND indexname IN (
      'idx_tenants_slug','idx_no_overlap','idx_clients_tags',
      'idx_appointments_tenant_date','idx_appointments_status'
    )
    ORDER BY indexname
  `);
  console.log('\n=== KEY INDEXES ===');
  for (const i of idx) console.log(`  ${i.indexname}`);

  const { rows: pol } = await client.query(`
    SELECT tablename, COUNT(*) AS n
    FROM pg_policies
    WHERE schemaname='public'
    GROUP BY tablename
    ORDER BY tablename
  `);
  console.log('\n=== RLS POLICIES BY TABLE ===');
  for (const p of pol) console.log(`  ${p.tablename.padEnd(20)} ${p.n} policies`);

  const { rows: seeds } = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM public.tenants WHERE slug='petshop-exemplo') AS demo_tenants,
      (SELECT COUNT(*) FROM public.services WHERE tenant_id='00000000-0000-4000-8000-000000000001') AS demo_services,
      (SELECT COUNT(*) FROM public.business_hours WHERE tenant_id='00000000-0000-4000-8000-000000000001') AS demo_hours,
      (SELECT COUNT(*) FROM public.message_templates WHERE tenant_id IS NULL) AS global_templates
  `);
  console.log('\n=== SEED DATA ===');
  console.log(`  demo_tenants:     ${seeds[0].demo_tenants}`);
  console.log(`  demo_services:    ${seeds[0].demo_services}`);
  console.log(`  demo_hours:       ${seeds[0].demo_hours}`);
  console.log(`  global_templates: ${seeds[0].global_templates}`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
