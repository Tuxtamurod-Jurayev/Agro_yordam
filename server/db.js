import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { newDb } from 'pg-mem'
import { Pool } from 'pg'
import { DISEASES } from '../src/data/diseases.js'

const connectionCandidates = [
  process.env.SUPABASE_SESSION_POOLER_URL,
  process.env.SUPABASE_POOLER_URL,
  process.env.DATABASE_URL,
].filter(Boolean)
let pool = null
let databaseMode = 'uninitialized'
let databaseConnectionError = null

if (!connectionCandidates.length) {
  throw new Error(
    "DATABASE_URL topilmadi. .env ichida Supabase session pooler yoki boshqa Postgres connection string kiriting.",
  )
}

function createRemotePool(connectionString) {
  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

function createMemoryPool() {
  const memoryDb = newDb({
    autoCreateForeignKeyIndices: true,
  })

  memoryDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid',
    implementation: () => randomUUID(),
  })

  memoryDb.registerExtension('pgcrypto', (schema) => {
    schema.registerFunction({
      name: 'gen_random_uuid',
      returns: 'uuid',
      implementation: () => randomUUID(),
    })
  })

  const adapter = memoryDb.adapters.createPg()
  return new adapter.Pool()
}

export async function initializeDatabaseConnection() {
  if (pool) {
    return databaseMode
  }

  const failures = []

  for (const connectionString of connectionCandidates) {
    try {
      const remotePool = createRemotePool(connectionString)
      await remotePool.query('select 1')
      pool = remotePool
      databaseMode = 'supabase-postgres'
      databaseConnectionError = null
      return databaseMode
    } catch (error) {
      failures.push(formatConnectionError(connectionString, error))
    }
  }

  databaseConnectionError = failures.join(' | ')
  console.warn(
    'Supabase Postgres ulanishi amalga oshmadi, pg-mem fallback yoqildi:',
    databaseConnectionError,
  )
  pool = createMemoryPool()
  databaseMode = 'pg-mem-fallback'

  return databaseMode
}

export function getDatabaseMode() {
  return databaseMode
}

export function getDatabaseConnectionError() {
  return databaseConnectionError
}

export async function query(text, params = []) {
  if (!pool) {
    await initializeDatabaseConnection()
  }
  return pool.query(text, params)
}

export async function withTransaction(handler) {
  if (!pool) {
    await initializeDatabaseConnection()
  }
  const client = await pool.connect()

  try {
    await client.query('begin')
    const result = await handler(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export function mapUserRow(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    region: row.region,
    farmName: row.farm_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  }
}

export function mapScanRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    imageSrc: row.image_src,
    diseaseKey: row.disease_key,
    diseaseName: row.disease_name,
    confidence: row.confidence,
    analysisSource: row.analysis_source,
    modelUsed: row.model_used,
    summary: row.summary,
    indicators: row.indicators ?? [],
    createdAt: row.created_at,
    userName: row.user_name,
  }
}

export async function ensureDatabaseSetup() {
  await query('create extension if not exists pgcrypto')

  await query(`
    create table if not exists app_users (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      email text unique not null,
      password_hash text not null,
      role text not null default 'user' check (role in ('user', 'admin')),
      phone text,
      region text,
      farm_name text,
      status text not null default 'active' check (status in ('active', 'inactive')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      last_login_at timestamptz
    )
  `)

  await query(`
    create table if not exists diseases (
      id uuid primary key default gen_random_uuid(),
      disease_key text unique not null,
      name text unique not null,
      description text not null,
      causes text,
      treatment text not null,
      prevention text not null,
      fertilizer text,
      pesticide text,
      irrigation text,
      severity text,
      palette jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now()
    )
  `)

  await query(`
    create table if not exists scans (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references app_users(id) on delete cascade,
      image_src text not null,
      disease_key text not null,
      disease_name text not null,
      confidence integer not null check (confidence >= 1 and confidence <= 99),
      analysis_source text not null default 'local',
      model_used text,
      summary text,
      indicators jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now()
    )
  `)

  await query(`
    create table if not exists ai_analysis_cache (
      id uuid primary key default gen_random_uuid(),
      image_hash text unique not null,
      disease_key text not null,
      disease_name text not null,
      confidence integer not null check (confidence >= 1 and confidence <= 99),
      summary text,
      indicators jsonb not null default '[]'::jsonb,
      source text not null default 'openai',
      model_used text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)

  await query('create index if not exists idx_scans_user_created_at on scans(user_id, created_at desc)')
  await query('create index if not exists idx_scans_disease_name on scans(disease_name)')
  await query('create index if not exists idx_users_email on app_users(email)')
  await query('create index if not exists idx_ai_analysis_cache_hash on ai_analysis_cache(image_hash)')

  for (const disease of DISEASES) {
    const diseaseParams = [
      disease.key,
      disease.name,
      disease.description,
      disease.causes,
      disease.treatment,
      disease.prevention,
      disease.fertilizer,
      disease.pesticide,
      disease.irrigation,
      disease.severity,
      JSON.stringify(disease.palette),
    ]

    const existingDisease = await query('select id from diseases where disease_key = $1 limit 1', [
      disease.key,
    ])

    if (existingDisease.rowCount) {
      await query(
        `
          update diseases
          set
            name = $2,
            description = $3,
            causes = $4,
            treatment = $5,
            prevention = $6,
            fertilizer = $7,
            pesticide = $8,
            irrigation = $9,
            severity = $10,
            palette = $11::jsonb
          where disease_key = $1
        `,
        diseaseParams,
      )
    } else {
      await query(
        `
          insert into diseases (
            id, disease_key, name, description, causes, treatment, prevention, fertilizer,
            pesticide, irrigation, severity, palette
          )
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
        `,
        [randomUUID(), ...diseaseParams],
      )
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@agro-yordam.uz').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Agro Admin'

  const existingAdmin = await query(
    `
      select id, full_name, password_hash, role, status
      from app_users
      where email = $1
      limit 1
    `,
    [adminEmail],
  )

  const passwordHash = await bcrypt.hash(adminPassword, 12)

  if (!existingAdmin.rowCount) {
    await query(
      `
        insert into app_users (id, full_name, email, password_hash, role, status)
        values ($1, $2, $3, $4, 'admin', 'active')
      `,
      [randomUUID(), adminName, adminEmail, passwordHash],
    )
    return
  }

  const row = existingAdmin.rows[0]
  const passwordMatches = await bcrypt.compare(adminPassword, row.password_hash).catch(() => false)
  const shouldSyncAdmin =
    row.full_name !== adminName ||
    row.role !== 'admin' ||
    row.status !== 'active' ||
    !passwordMatches

  if (shouldSyncAdmin) {
    await query(
      `
        update app_users
        set full_name = $1, password_hash = $2, role = 'admin', status = 'active', updated_at = now()
        where id = $3
      `,
      [adminName, passwordHash, row.id],
    )
  }
}

function formatConnectionError(connectionString, error) {
  const target = safeConnectionTarget(connectionString)
  const message = error instanceof Error ? error.message : String(error)

  if (
    target.includes('db.') &&
    target.includes('.supabase.co') &&
    ['ENOTFOUND', 'EAI_AGAIN'].includes(error?.code)
  ) {
    return `${target}: ${message}. Supabase direct DB host ko'pincha IPv6 bo'ladi; IPv4 tarmoqda Supabase Connect sahifasidagi session pooler URL'dan foydalaning.`
  }

  return `${target}: ${message}`
}

function safeConnectionTarget(connectionString) {
  try {
    const target = new URL(connectionString)
    return `${target.hostname}:${target.port || '5432'}`
  } catch {
    return 'unknown-database-target'
  }
}
