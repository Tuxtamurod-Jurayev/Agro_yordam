import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { newDb } from 'pg-mem'
import { Pool } from 'pg'
import { DISEASES } from '../src/data/diseases.js'

const databaseUrl = process.env.DATABASE_URL
let pool = null
let databaseMode = 'uninitialized'

if (!databaseUrl) {
  throw new Error('DATABASE_URL topilmadi. .env ichida Supabase connection string kiriting.')
}

function createRemotePool() {
  return new Pool({
    connectionString: databaseUrl,
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

  try {
    const remotePool = createRemotePool()
    await remotePool.query('select 1')
    pool = remotePool
    databaseMode = 'supabase-postgres'
  } catch (error) {
    console.warn('Supabase Postgres ulanishi amalga oshmadi, pg-mem fallback yoqildi:', error.message)
    pool = createMemoryPool()
    databaseMode = 'pg-mem-fallback'
  }

  return databaseMode
}

export function getDatabaseMode() {
  return databaseMode
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

  await query('create index if not exists idx_scans_user_created_at on scans(user_id, created_at desc)')
  await query('create index if not exists idx_scans_disease_name on scans(disease_name)')
  await query('create index if not exists idx_users_email on app_users(email)')

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
  const existingAdmin = await query('select id from app_users where email = $1 limit 1', [adminEmail])

  if (!existingAdmin.rowCount) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await query(
      `
        insert into app_users (id, full_name, email, password_hash, role, status)
        values ($1, $2, $3, $4, 'admin', 'active')
      `,
      [randomUUID(), adminName, adminEmail, passwordHash],
    )
  }
}
