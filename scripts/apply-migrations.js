#!/usr/bin/env node
/**
 * Apply all Supabase migrations in supabase/migrations/ in lexical order.
 * Uses pg over the Supabase direct connection (IPv4 via Session Pooler).
 *
 * Usage: node scripts/apply-migrations.js [--only=NNN]
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const PROJECT_REF = 'qckasnpabjucioiemiot';
const DB_PASSWORD = '&GXmzJY/a9!aTZ?';

const connections = [
  // 1) AWS pooler (Transaction mode, IPv4) — port 6543
  {
    label: 'pooler-transaction',
    host: `aws-0-sa-east-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  },
  // 2) AWS pooler (Session mode, IPv4) — port 5432
  {
    label: 'pooler-session',
    host: `aws-0-sa-east-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  },
  // 3) US pooler as fallback
  {
    label: 'pooler-us-east',
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  },
  // 4) Direct connection
  {
    label: 'direct',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  },
];

async function tryConnect() {
  for (const cfg of connections) {
    const c = new Client({ ...cfg, statement_timeout: 60_000, connectionTimeoutMillis: 10_000 });
    try {
      process.stdout.write(`Trying ${cfg.label} @ ${cfg.host}:${cfg.port} ... `);
      await c.connect();
      const r = await c.query('SELECT current_database() as db, version() as v');
      console.log(`OK (${r.rows[0].db})`);
      return c;
    } catch (e) {
      console.log(`FAILED (${e.code || e.message})`);
      try { await c.end(); } catch (_) {}
    }
  }
  throw new Error('All connection attempts failed');
}

async function main() {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.split('=')[1] : null;

  const migrationsDir = path.resolve(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (only) {
    const keep = files.filter((f) => f.startsWith(only));
    if (!keep.length) {
      console.error(`No migration matches --only=${only}. Available: ${files.join(', ')}`);
      process.exit(1);
    }
    files.length = 0;
    files.push(...keep);
  }

  console.log(`\nMigrations to apply (${files.length}):`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  const client = await tryConnect();

  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, 'utf8');
      const started = Date.now();
      process.stdout.write(`Applying ${file} ... `);
      try {
        await client.query(sql);
        console.log(`OK (${Date.now() - started}ms)`);
      } catch (e) {
        console.log(`FAILED`);
        console.error(`\n--- ERROR applying ${file} ---`);
        console.error(e.message);
        if (e.position) console.error(`Position: ${e.position}`);
        if (e.hint) console.error(`Hint: ${e.hint}`);
        if (e.detail) console.error(`Detail: ${e.detail}`);
        throw e;
      }
    }
    console.log('\nAll migrations applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('\nMigration run failed:', e.message || e);
  process.exit(1);
});
