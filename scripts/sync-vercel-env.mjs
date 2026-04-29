import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import dotenv from 'dotenv'

const repoRoot = process.cwd()
const envPath = path.join(repoRoot, '.env')
const vercelProjectPath = path.join(repoRoot, '.vercel', 'project.json')

if (!existsSync(envPath)) {
  console.error(".env topilmadi. Avval lokal env faylini tayyorlang.")
  process.exit(1)
}

if (!existsSync(vercelProjectPath)) {
  console.error(".vercel/project.json topilmadi. Avval `npx vercel link` yoki `npx vercel pull` ishlating.")
  process.exit(1)
}

const parsed = dotenv.parse(readFileSync(envPath))
const requiredKeys = [
  'VITE_API_BASE_URL',
  'VITE_MOBILE_API_BASE_URL',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_KEY',
  'DATABASE_URL',
  'SUPABASE_SESSION_POOLER_URL',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_NAME',
  'PLANTNET_API_KEY',
  'PLANTNET_LANGUAGE',
  'PLANTNET_ORGAN',
  'PLANTNET_MODEL_LABEL',
  'PLANTNET_TIMEOUT_MS',
  'OPENAI_API_KEY',
  'OPENAI_VISION_MODEL',
  'OPENAI_TIMEOUT_MS',
  'AI_PROVIDER_ORDER',
]

const availableEntries = requiredKeys.filter((key) => String(parsed[key] || '').trim())

if (!availableEntries.length) {
  console.error(".env ichida Vercel'ga yuborish uchun tayyor qiymatlar topilmadi.")
  process.exit(1)
}

for (const key of availableEntries) {
  for (const target of ['production']) {
    const removeResult = spawnSync('npx', ['vercel', 'env', 'rm', key, target, '--yes'], {
      cwd: repoRoot,
      stdio: 'pipe',
      encoding: 'utf8',
      shell: process.platform === 'win32',
    })

    if (removeResult.status !== 0 && !/does not exist|not found/i.test(`${removeResult.stdout}\n${removeResult.stderr}`)) {
      console.error(`Vercel env o'chirishda xatolik: ${key}`)
      console.error(removeResult.stdout || removeResult.stderr)
      process.exit(removeResult.status || 1)
    }

    const addResult = spawnSync('npx', ['vercel', 'env', 'add', key, target], {
      cwd: repoRoot,
      input: `${parsed[key]}\n`,
      stdio: 'pipe',
      encoding: 'utf8',
      shell: process.platform === 'win32',
    })

    if (addResult.status !== 0) {
      console.error(`Vercel env qo'shishda xatolik: ${key}`)
      console.error(addResult.stdout || addResult.stderr)
      process.exit(addResult.status || 1)
    }

    console.log(`Synced ${key} -> ${target}`)
  }
}

console.log("Vercel env sync tugadi.")
