import 'dotenv/config'
import { createHash, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { DISEASES, getDiseaseByKey } from '../src/data/diseases.js'
import {
  ensureDatabaseSetup,
  getDatabaseConnectionError,
  getDatabaseMode,
  initializeDatabaseConnection,
  mapScanRow,
  mapUserRow,
  query,
} from './db.js'

const app = express()
const port = Number(process.env.PORT || 8787)
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)
const jwtSecret = process.env.JWT_SECRET || 'agro-yordam-local-secret'
const plantNetApiKey = process.env.PLANTNET_API_KEY
const plantNetLanguage = process.env.PLANTNET_LANGUAGE || 'en'
const plantNetOrgan = process.env.PLANTNET_ORGAN || 'leaf'
const defaultModel = process.env.PLANTNET_MODEL_LABEL || 'plantnet-diseases'
const plantNetIdentifyUrl = 'https://my-api.plantnet.org/v2/diseases/identify'

app.use(cors())
app.use(express.json({ limit: '20mb' }))

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: '7d',
    },
  )
}

function extractBearerToken(request) {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return null
  }

  return header.slice(7)
}

async function authMiddleware(request, response, next) {
  try {
    const token = extractBearerToken(request)

    if (!token) {
      return response.status(401).json({ error: 'Autentifikatsiya talab qilinadi.' })
    }

    const decoded = jwt.verify(token, jwtSecret)
    const result = await query(
      `
        select id, full_name, email, role, phone, region, farm_name, status, created_at,
               updated_at, last_login_at
        from app_users
        where id = $1
        limit 1
      `,
      [decoded.sub],
    )

    if (!result.rowCount) {
      return response.status(401).json({ error: 'Foydalanuvchi topilmadi.' })
    }

    request.user = mapUserRow(result.rows[0])
    next()
  } catch {
    return response.status(401).json({ error: "Sessiya muddati tugagan yoki noto'g'ri." })
  }
}

function requireAdmin(request, response, next) {
  if (request.user?.role !== 'admin') {
    return response.status(403).json({ error: 'Bu amal faqat admin uchun.' })
  }

  next()
}

function normalizeUserPayload(payload = {}) {
  return {
    name: String(payload.name || payload.fullName || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    password: String(payload.password || ''),
    role: payload.role === 'admin' ? 'admin' : 'user',
    phone: String(payload.phone || '').trim(),
    region: String(payload.region || '').trim(),
    farmName: String(payload.farmName || '').trim(),
    status: payload.status === 'inactive' ? 'inactive' : 'active',
  }
}

function sanitizeSearch(value) {
  return String(value || '').trim()
}

function getImageHash(imageSrc) {
  return createHash('sha256').update(imageSrc).digest('hex')
}

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

function asDate(value) {
  return value instanceof Date ? value : new Date(value)
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function startOfUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function dateKey(date) {
  return startOfUtcDay(date).toISOString().slice(0, 10)
}

function monthKey(date) {
  const normalized = startOfUtcMonth(date)
  return `${normalized.getUTCFullYear()}-${String(normalized.getUTCMonth() + 1).padStart(2, '0')}`
}

function createDailySeries(scans, days = 7) {
  const today = startOfUtcDay(new Date())
  const countByDay = new Map()

  for (const scan of scans) {
    const createdAt = asDate(scan.created_at)
    countByDay.set(dateKey(createdAt), (countByDay.get(dateKey(createdAt)) ?? 0) + 1)
  }

  return Array.from({ length: days }, (_, index) => {
    const current = new Date(today)
    current.setUTCDate(today.getUTCDate() - (days - 1 - index))
    return {
      label: dayLabelFormatter.format(current),
      scans: countByDay.get(dateKey(current)) ?? 0,
    }
  })
}

function createMonthlySeries(scans, months = 6) {
  const thisMonth = startOfUtcMonth(new Date())
  const countByMonth = new Map()

  for (const scan of scans) {
    const createdAt = asDate(scan.created_at)
    countByMonth.set(monthKey(createdAt), (countByMonth.get(monthKey(createdAt)) ?? 0) + 1)
  }

  return Array.from({ length: months }, (_, index) => {
    const current = new Date(Date.UTC(thisMonth.getUTCFullYear(), thisMonth.getUTCMonth() - (months - 1 - index), 1))
    return {
      label: monthLabelFormatter.format(current),
      scans: countByMonth.get(monthKey(current)) ?? 0,
    }
  })
}

function buildTopDiseases(scans, limit = 10) {
  const counts = new Map()

  for (const scan of scans) {
    counts.set(scan.disease_name, (counts.get(scan.disease_name) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1]
      }
      return left[0].localeCompare(right[0])
    })
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function calculateAverageConfidence(scans) {
  if (!scans.length) {
    return 0
  }

  const total = scans.reduce((sum, scan) => sum + Number(scan.confidence || 0), 0)
  return Math.round(total / scans.length)
}

async function getAnalyticsSnapshot() {
  const [usersResult, scansResult] = await Promise.all([
    query('select id, full_name, role, status, created_at, last_login_at from app_users'),
    query(
      `
        select
          scans.*,
          app_users.full_name as user_name
        from scans
        join app_users on app_users.id = scans.user_id
      `,
    ),
  ])

  const scans = scansResult.rows
  const recentThreshold = new Date()
  recentThreshold.setUTCDate(recentThreshold.getUTCDate() - 30)
  const activeUsers = new Set(
    scans.filter((scan) => asDate(scan.created_at) >= recentThreshold).map((scan) => scan.user_id),
  )
  const topDiseases = buildTopDiseases(scans, 10)
  const recentScans = [...scans]
    .sort((left, right) => asDate(right.created_at) - asDate(left.created_at))
    .slice(0, 8)
  const recentUsers = [...usersResult.rows]
    .sort((left, right) => asDate(right.created_at) - asDate(left.created_at))
    .slice(0, 6)
    .map((row) => ({
      id: row.id,
      name: row.full_name,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    }))
  const userActivity = usersResult.rows
    .map((row) => ({
      id: row.id,
      name: row.full_name,
      role: row.role,
      status: row.status,
      scans: scans.filter((scan) => scan.user_id === row.id).length,
    }))
    .sort((left, right) => {
      if (right.scans !== left.scans) {
        return right.scans - left.scans
      }
      return left.name.localeCompare(right.name)
    })
  const roleBreakdown = {
    admins: usersResult.rows.filter((row) => row.role === 'admin').length,
    users: usersResult.rows.filter((row) => row.role === 'user').length,
  }
  const statusBreakdown = {
    active: usersResult.rows.filter((row) => row.status === 'active').length,
    inactive: usersResult.rows.filter((row) => row.status === 'inactive').length,
  }
  const topUser = userActivity[0] ?? null

  return {
    totals: {
      totalScans: scans.length,
      avgConfidence: calculateAverageConfidence(scans),
      activeUsers: activeUsers.size,
      diseaseLibrary: DISEASES.length,
    },
    topDiseases: topDiseases.map((row) => {
      const disease = DISEASES.find((item) => item.name === row.name) ?? getDiseaseByKey('healthy')
      return {
        name: row.name,
        count: row.count,
        color: disease.palette[0],
      }
    }),
    dailyScans: createDailySeries(scans, 7),
    monthlyScans: createMonthlySeries(scans, 6),
    recentScans: recentScans.map(mapScanRow),
    userActivity,
    recentUsers,
    roleBreakdown,
    statusBreakdown,
    topUser,
  }
}

async function getUserStats(userId) {
  const scansResult = await query(
    `
      select id, user_id, disease_name, confidence, created_at
      from scans
      where user_id = $1
      order by created_at desc
    `,
    [userId],
  )
  const scans = scansResult.rows
  const topDiseases = buildTopDiseases(scans, 5)

  return {
    totals: {
      totalScans: scans.length,
      avgConfidence: calculateAverageConfidence(scans),
    },
    topDiseases,
    monthlyScans: createMonthlySeries(scans, 6),
  }
}

async function getCachedAnalysis(imageHash) {
  const result = await query(
    `
      select disease_key, disease_name, confidence, summary, indicators, source, model_used
      from ai_analysis_cache
      where image_hash = $1
      limit 1
    `,
    [imageHash],
  )

  if (!result.rowCount) {
    return null
  }

  const row = result.rows[0]
  return {
    diseaseKey: row.disease_key,
    diseaseName: row.disease_name,
    confidence: row.confidence,
    summary: row.summary,
    indicators: row.indicators ?? [],
    source: `${row.source}-cache`,
    model: row.model_used,
    cacheHit: true,
  }
}

async function upsertCachedAnalysis(imageHash, analysis) {
  const existing = await query('select id from ai_analysis_cache where image_hash = $1 limit 1', [imageHash])

  if (existing.rowCount) {
    await query(
      `
        update ai_analysis_cache
        set
          disease_key = $2,
          disease_name = $3,
          confidence = $4,
          summary = $5,
          indicators = $6::jsonb,
          source = $7,
          model_used = $8,
          updated_at = now()
        where image_hash = $1
      `,
      [
        imageHash,
        analysis.diseaseKey,
        analysis.diseaseName,
        analysis.confidence,
        analysis.summary ?? '',
        JSON.stringify(analysis.indicators ?? []),
        analysis.source ?? 'plantnet',
        analysis.model ?? defaultModel,
      ],
    )
    return
  }

  await query(
    `
      insert into ai_analysis_cache (
        id, image_hash, disease_key, disease_name, confidence, summary, indicators, source, model_used
      )
      values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9)
    `,
    [
      randomUUID(),
      imageHash,
      analysis.diseaseKey,
      analysis.diseaseName,
      analysis.confidence,
      analysis.summary ?? '',
      JSON.stringify(analysis.indicators ?? []),
      analysis.source ?? 'plantnet',
      analysis.model ?? defaultModel,
    ],
  )
}

function normalizeAnalysis(payload, model = defaultModel) {
  const disease = getDiseaseByKey(payload.diseaseKey)

  return {
    diseaseKey: disease.key,
    diseaseName: disease.name,
    confidence: Math.max(1, Math.min(99, Number(payload.confidence ?? 80))),
    summary:
      payload.summary ??
      `${disease.name} ehtimoli aniqlandi. AI model bargning ko'rinish xususiyatlarini baholadi.`,
    indicators: Array.isArray(payload.indicators)
      ? payload.indicators.filter(Boolean).slice(0, 3)
      : ['AI tahlili yakunlandi'],
    source: 'plantnet',
    model,
  }
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function extractMimeType(imageSrc) {
  const matched = /^data:([^;]+);base64,/i.exec(String(imageSrc || ''))
  const mimeType = matched?.[1]?.toLowerCase()

  if (mimeType === 'image/png' || mimeType === 'image/jpeg') {
    return mimeType
  }

  return 'image/jpeg'
}

async function createImageBlob(imageSrc) {
  const imageResponse = await fetch(imageSrc)

  if (!imageResponse.ok) {
    throw new Error("Rasm ma'lumotini PlantNet uchun tayyorlab bo'lmadi.")
  }

  const mimeType = extractMimeType(imageSrc)
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

  return new Blob([imageBuffer], { type: mimeType })
}

function mapPlantNetResultToDisease(result) {
  const haystack = normalizeText([result?.name, result?.description, ...(result?.categories ?? [])].join(' '))
  const rules = [
    ['powdery_mildew', ['powdery mildew', 'powdery', 'mildew', 'oidium']],
    [
      'bacterial_blight',
      ['bacterial blight', 'bacterial spot', 'bacterial canker', 'xanthomonas', 'pseudomonas', 'erwinia', 'fire blight'],
    ],
    ['early_blight', ['early blight', 'alternaria solani']],
    ['rust', ['rust', 'puccinia', 'tranzschelia', 'uredin', 'melampsora', 'gymnosporangium']],
    ['leaf_spot', ['leaf spot', 'septoria', 'cercospora', 'anthracnose', 'lesion', 'leaf blotch', 'spot', 'blight']],
  ]

  for (const [diseaseKey, keywords] of rules) {
    if (keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      return diseaseKey
    }
  }

  return null
}

function scoreToConfidence(score) {
  return Math.max(55, Math.min(99, Math.round(Number(score || 0) * 100)))
}

function buildPlantNetIndicators(results) {
  return results
    .slice(0, 3)
    .map((result) => result?.description || result?.name)
    .filter(Boolean)
    .map((label) => String(label).trim())
}

function normalizePlantNetAnalysis(payload) {
  const results = Array.isArray(payload?.results) ? payload.results : []
  const bestMatch = results
    .map((result) => ({
      ...result,
      diseaseKey: mapPlantNetResultToDisease(result),
    }))
    .find((result) => result.diseaseKey)

  if (!bestMatch) {
    throw new Error("PlantNet natijasini ilovadagi kasallik turlariga moslab bo'lmadi.")
  }

  const disease = getDiseaseByKey(bestMatch.diseaseKey)
  const indicators = buildPlantNetIndicators(results)

  return normalizeAnalysis(
    {
      diseaseKey: bestMatch.diseaseKey,
      confidence: scoreToConfidence(bestMatch.score),
      summary: `${disease.name} ehtimoli PlantNet disease identification orqali aniqlandi. Eng yaqin moslik: ${
        bestMatch.description || bestMatch.name
      }.`,
      indicators: indicators.length ? indicators : ['PlantNet kasallik belgilarini aniqladi'],
    },
    payload?.version || defaultModel,
  )
}

async function identifyDiseaseWithPlantNet(imageSrc) {
  if (!plantNetApiKey) {
    throw new Error('PLANTNET_API_KEY topilmadi.')
  }

  const imageBlob = await createImageBlob(imageSrc)
  const formData = new FormData()
  formData.append('images', imageBlob, `leaf-scan.${imageBlob.type === 'image/png' ? 'png' : 'jpg'}`)
  formData.append('organs', plantNetOrgan)

  const searchParams = new URLSearchParams({
    'api-key': plantNetApiKey,
    lang: plantNetLanguage,
    'nb-results': '5',
    'include-related-images': 'false',
    'no-reject': 'true',
  })

  const plantNetResponse = await fetch(`${plantNetIdentifyUrl}?${searchParams.toString()}`, {
    method: 'POST',
    body: formData,
  })

  if (!plantNetResponse.ok) {
    const errorText = await plantNetResponse.text()
    throw new Error(`PlantNet ${plantNetResponse.status}: ${errorText || 'nomaʼlum xatolik'}`)
  }

  const payload = await plantNetResponse.json()
  return normalizePlantNetAnalysis(payload)
}

app.get('/api/health', async (_request, response) => {
  try {
    await query('select 1')
    response.json({
      ok: true,
      api: 'agro-yordam-server',
      configured: Boolean(plantNetApiKey),
      aiProvider: 'plantnet',
      model: defaultModel,
      database: getDatabaseMode(),
      databaseError: getDatabaseConnectionError(),
      date: new Date().toISOString(),
    })
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Database xatosi',
    })
  }
})

app.post('/api/auth/register', async (request, response) => {
  const payload = normalizeUserPayload(request.body)

  if (!payload.name || !payload.email || payload.password.length < 6) {
    return response.status(400).json({
      error: "Ism, email va kamida 6 belgilik parol kiritilishi kerak.",
    })
  }

  try {
    const existing = await query('select id from app_users where email = $1 limit 1', [payload.email])

    if (existing.rowCount) {
      return response.status(409).json({ error: "Bu email allaqachon ro'yxatdan o'tgan." })
    }

    const passwordHash = await bcrypt.hash(payload.password, 12)
    const created = await query(
      `
        insert into app_users (
          id, full_name, email, password_hash, role, phone, region, farm_name, status
        )
        values ($1,$2,$3,$4,'user',$5,$6,$7,'active')
        returning id, full_name, email, role, phone, region, farm_name, status, created_at, updated_at, last_login_at
      `,
      [randomUUID(), payload.name, payload.email, passwordHash, payload.phone, payload.region, payload.farmName],
    )

    const user = mapUserRow(created.rows[0])
    const token = createToken(user)
    return response.status(201).json({ token, user })
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Ro'yxatdan o'tkazishda xatolik.",
    })
  }
})

app.post('/api/auth/login', async (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase()
  const password = String(request.body?.password || '')

  if (!email || !password) {
    return response.status(400).json({ error: 'Email va parol kiritilishi kerak.' })
  }

  try {
    const result = await query(
      `
        select id, full_name, email, password_hash, role, phone, region, farm_name, status,
               created_at, updated_at, last_login_at
        from app_users
        where email = $1
        limit 1
      `,
      [email],
    )

    if (!result.rowCount) {
      return response.status(401).json({ error: "Email yoki parol noto'g'ri." })
    }

    const row = result.rows[0]
    const matched = await bcrypt.compare(password, row.password_hash)

    if (!matched) {
      return response.status(401).json({ error: "Email yoki parol noto'g'ri." })
    }

    if (row.status !== 'active') {
      return response.status(403).json({ error: 'Hisob vaqtincha nofaol qilingan.' })
    }

    await query('update app_users set last_login_at = now(), updated_at = now() where id = $1', [row.id])
    const user = mapUserRow({ ...row, last_login_at: new Date().toISOString() })
    const token = createToken(user)

    return response.json({ token, user })
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Login xatosi.',
    })
  }
})

app.get('/api/auth/me', authMiddleware, async (request, response) => {
  const stats = await getUserStats(request.user.id)
  response.json({ user: request.user, stats })
})

app.patch('/api/auth/me', authMiddleware, async (request, response) => {
  const payload = normalizeUserPayload(request.body)

  if (!payload.name || !payload.email) {
    return response.status(400).json({ error: 'Ism va email kiritilishi kerak.' })
  }

  try {
    const duplicate = await query(
      'select id from app_users where email = $1 and id <> $2 limit 1',
      [payload.email, request.user.id],
    )

    if (duplicate.rowCount) {
      return response.status(409).json({ error: 'Bu email boshqa foydalanuvchi tomonidan ishlatilgan.' })
    }

    const updated = await query(
      `
        update app_users
        set full_name = $1, email = $2, phone = $3, region = $4, farm_name = $5, updated_at = now()
        where id = $6
        returning id, full_name, email, role, phone, region, farm_name, status, created_at, updated_at, last_login_at
      `,
      [payload.name, payload.email, payload.phone, payload.region, payload.farmName, request.user.id],
    )

    const user = mapUserRow(updated.rows[0])
    const token = createToken(user)

    return response.json({ token, user })
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Profilni yangilab bo'lmadi.",
    })
  }
})

app.patch('/api/auth/me/password', authMiddleware, async (request, response) => {
  const currentPassword = String(request.body?.currentPassword || '')
  const nextPassword = String(request.body?.nextPassword || '')

  if (nextPassword.length < 6) {
    return response.status(400).json({ error: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak." })
  }

  const result = await query('select password_hash from app_users where id = $1 limit 1', [request.user.id])
  const matched = await bcrypt.compare(currentPassword, result.rows[0]?.password_hash || '')

  if (!matched) {
    return response.status(401).json({ error: "Joriy parol noto'g'ri." })
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12)
  await query('update app_users set password_hash = $1, updated_at = now() where id = $2', [
    passwordHash,
    request.user.id,
  ])

  return response.json({ ok: true })
})

app.delete('/api/auth/me', authMiddleware, async (request, response) => {
  await query('delete from app_users where id = $1', [request.user.id])
  response.json({ ok: true })
})

app.get('/api/users', authMiddleware, requireAdmin, async (request, response) => {
  const search = sanitizeSearch(request.query.search)
  const role = sanitizeSearch(request.query.role)

  const params = []
  const conditions = []

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`(full_name ilike $${params.length} or email ilike $${params.length})`)
  }

  if (role && ['admin', 'user'].includes(role)) {
    params.push(role)
    conditions.push(`role = $${params.length}`)
  }

  const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : ''
  const result = await query(
    `
      select
        app_users.id,
        app_users.full_name,
        app_users.email,
        app_users.role,
        app_users.phone,
        app_users.region,
        app_users.farm_name,
        app_users.status,
        app_users.created_at,
        app_users.updated_at,
        app_users.last_login_at,
        count(scans.id)::int as scan_count
      from app_users
      left join scans on scans.user_id = app_users.id
      ${whereClause}
      group by app_users.id
      order by app_users.created_at desc
    `,
    params,
  )

  response.json({
    users: result.rows.map((row) => ({
      ...mapUserRow(row),
      scanCount: row.scan_count,
    })),
  })
})

app.post('/api/users', authMiddleware, requireAdmin, async (request, response) => {
  const payload = normalizeUserPayload(request.body)

  if (!payload.name || !payload.email || payload.password.length < 6) {
    return response.status(400).json({ error: "Ism, email va kamida 6 belgilik parol kerak." })
  }

  const duplicate = await query('select id from app_users where email = $1 limit 1', [payload.email])

  if (duplicate.rowCount) {
    return response.status(409).json({ error: 'Bu email bilan foydalanuvchi mavjud.' })
  }

  const passwordHash = await bcrypt.hash(payload.password, 12)
  const created = await query(
    `
      insert into app_users (
        id, full_name, email, password_hash, role, phone, region, farm_name, status
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning id, full_name, email, role, phone, region, farm_name, status, created_at, updated_at, last_login_at
    `,
    [
      randomUUID(),
      payload.name,
      payload.email,
      passwordHash,
      payload.role,
      payload.phone,
      payload.region,
      payload.farmName,
      payload.status,
    ],
  )

  response.status(201).json({ user: mapUserRow(created.rows[0]) })
})

app.patch('/api/users/:id', authMiddleware, requireAdmin, async (request, response) => {
  const payload = normalizeUserPayload(request.body)
  const userId = request.params.id

  if (!payload.name || !payload.email) {
    return response.status(400).json({ error: 'Ism va email majburiy.' })
  }

  const duplicate = await query('select id from app_users where email = $1 and id <> $2 limit 1', [
    payload.email,
    userId,
  ])

  if (duplicate.rowCount) {
    return response.status(409).json({ error: 'Bu email boshqa foydalanuvchi uchun band.' })
  }

  const updated = await query(
    `
      update app_users
      set
        full_name = $1,
        email = $2,
        role = $3,
        phone = $4,
        region = $5,
        farm_name = $6,
        status = $7,
        updated_at = now()
      where id = $8
      returning id, full_name, email, role, phone, region, farm_name, status, created_at, updated_at, last_login_at
    `,
    [payload.name, payload.email, payload.role, payload.phone, payload.region, payload.farmName, payload.status, userId],
  )

  if (!updated.rowCount) {
    return response.status(404).json({ error: 'Foydalanuvchi topilmadi.' })
  }

  response.json({ user: mapUserRow(updated.rows[0]) })
})

app.delete('/api/users/:id', authMiddleware, requireAdmin, async (request, response) => {
  const userId = request.params.id

  if (userId === request.user.id) {
    return response.status(400).json({ error: "Admin o'zini shu bo'limdan o'chira olmaydi." })
  }

  await query('delete from app_users where id = $1', [userId])
  response.json({ ok: true })
})

app.get('/api/users/:id/stats', authMiddleware, async (request, response) => {
  const targetUserId = request.params.id

  if (request.user.role !== 'admin' && request.user.id !== targetUserId) {
    return response.status(403).json({ error: "Bu statistikani ko'rishga ruxsat yo'q." })
  }

  const stats = await getUserStats(targetUserId)
  response.json(stats)
})

app.get('/api/scans', authMiddleware, async (request, response) => {
  const search = sanitizeSearch(request.query.search)
  const params = []
  const conditions = []

  if (request.user.role !== 'admin') {
    params.push(request.user.id)
    conditions.push(`scans.user_id = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`(scans.disease_name ilike $${params.length} or scans.summary ilike $${params.length})`)
  }

  const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : ''
  const result = await query(
    `
      select scans.*, app_users.full_name as user_name
      from scans
      join app_users on app_users.id = scans.user_id
      ${whereClause}
      order by scans.created_at desc
    `,
    params,
  )

  response.json({ scans: result.rows.map(mapScanRow) })
})

app.get('/api/scans/:id', authMiddleware, async (request, response) => {
  const result = await query(
    `
      select scans.*, app_users.full_name as user_name
      from scans
      join app_users on app_users.id = scans.user_id
      where scans.id = $1
      limit 1
    `,
    [request.params.id],
  )

  if (!result.rowCount) {
    return response.status(404).json({ error: 'Natija topilmadi.' })
  }

  const scan = mapScanRow(result.rows[0])

  if (request.user.role !== 'admin' && scan.userId !== request.user.id) {
    return response.status(403).json({ error: "Bu natijani ko'rishga ruxsat yo'q." })
  }

  response.json({
    scan: {
      ...scan,
      disease: {
        ...getDiseaseByKey(scan.diseaseKey),
      },
    },
  })
})

app.post('/api/scans', authMiddleware, async (request, response) => {
  const { imageSrc, analysis } = request.body || {}

  if (!imageSrc || !analysis?.diseaseKey) {
    return response.status(400).json({ error: "Rasm va AI tahlil ma'lumoti kerak." })
  }

  const created = await query(
    `
      insert into scans (
        id, user_id, image_src, disease_key, disease_name, confidence, analysis_source,
        model_used, summary, indicators
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
      returning *
    `,
    [
      randomUUID(),
      request.user.id,
      imageSrc,
      analysis.diseaseKey,
      analysis.diseaseName,
      analysis.confidence,
      analysis.source ?? 'local',
      analysis.model ?? 'local-vision-heuristic',
      analysis.summary ?? '',
      JSON.stringify(analysis.indicators ?? []),
    ],
  )

  const scan = mapScanRow(created.rows[0])

  response.status(201).json({
    scan: {
      ...scan,
      disease: {
        ...getDiseaseByKey(scan.diseaseKey),
      },
    },
  })
})

app.get('/api/analytics', authMiddleware, async (request, response) => {
  if (request.user.role === 'admin') {
    const analytics = await getAnalyticsSnapshot()
    return response.json(analytics)
  }

  const stats = await getUserStats(request.user.id)
  return response.json({
    totals: {
      totalScans: stats.totals.totalScans,
      avgConfidence: stats.totals.avgConfidence,
      activeUsers: 1,
      diseaseLibrary: DISEASES.length,
    },
    topDiseases: stats.topDiseases.map((row) => ({
      name: row.name,
      count: row.count,
      color: (DISEASES.find((item) => item.name === row.name) ?? getDiseaseByKey('healthy')).palette[0],
    })),
    dailyScans: [],
    monthlyScans: stats.monthlyScans,
    recentScans: [],
    userActivity: [],
  })
})

app.post('/api/analyze-plant', async (request, response) => {
  const imageSrc = request.body?.imageSrc

  if (!imageSrc || typeof imageSrc !== 'string') {
    return response.status(400).json({
      error: 'imageSrc yuborilishi kerak.',
      code: 'INVALID_IMAGE',
    })
  }

  try {
    const imageHash = getImageHash(imageSrc)
    const cached = await getCachedAnalysis(imageHash)

    if (cached) {
      return response.json(cached)
    }

    if (!plantNetApiKey) {
      return response.status(503).json({
        error: "PLANTNET_API_KEY topilmadi. Server PlantNet uchun sozlanmagan.",
        code: 'PLANTNET_NOT_CONFIGURED',
      })
    }

    const normalized = await identifyDiseaseWithPlantNet(imageSrc)
    await upsertCachedAnalysis(imageHash, normalized)

    return response.json(normalized)
  } catch (error) {
    const message = error instanceof Error ? error.message : "PlantNet tahlili vaqtida noma'lum xatolik."

    return response.status(502).json({
      error: `AI tahlili muvaffaqiyatsiz tugadi: ${message}`,
      code: 'PLANTNET_ANALYSIS_FAILED',
    })
  }
})

app.use((error, _request, response, next) => {
  void next
  console.error('Unhandled API error:', error)
  response.status(500).json({
    error: error instanceof Error ? error.message : "Serverda noma'lum xatolik yuz berdi.",
  })
})

export async function initializeApp() {
  await initializeDatabaseConnection()
  await ensureDatabaseSetup()
  return app
}

export const appReady = initializeApp()
export default app

async function start() {
  await appReady
  app.listen(port, '127.0.0.1', () => {
    console.log(`AgroYordam server running on http://127.0.0.1:${port}`)
    if (getDatabaseMode() === 'pg-mem-fallback' && getDatabaseConnectionError()) {
      console.log(`Database fallback reason: ${getDatabaseConnectionError()}`)
    }
  })
}

appReady.catch((error) => {
  console.error('Server bootstrap failed:', error)

  if (isDirectRun) {
    process.exit(1)
  }
})

if (isDirectRun) {
  start().catch((error) => {
    console.error('Server startup failed:', error)
    process.exit(1)
  })
}
