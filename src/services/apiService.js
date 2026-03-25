import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 45000,
})

function extractErrorMessage(error) {
  const responseMessage =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details

  if (responseMessage) {
    return responseMessage
  }

  if (error?.code === 'ECONNABORTED') {
    return "So'rov vaqti tugadi. Iltimos, qayta urinib ko'ring."
  }

  return error?.message || "Server bilan bog'lanishda noma'lum xatolik yuz berdi."
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(extractErrorMessage(error))),
)

export const SESSION_STORAGE_KEY = 'agro_yordam_session'

export function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function persistSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined
}

export async function getMe(token) {
  const { data } = await api.get('/api/auth/me', {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function login(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export async function register(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export async function updateMyProfile(token, payload) {
  const { data } = await api.patch('/api/auth/me', payload, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function updateMyPassword(token, payload) {
  const { data } = await api.patch('/api/auth/me/password', payload, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function deleteMyAccount(token) {
  const { data } = await api.delete('/api/auth/me', {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function listUsers(token, filters = {}) {
  const { data } = await api.get('/api/users', {
    headers: getAuthHeaders(token),
    params: filters,
  })

  return data
}

export async function createUser(token, payload) {
  const { data } = await api.post('/api/users', payload, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function updateUser(token, userId, payload) {
  const { data } = await api.patch(`/api/users/${userId}`, payload, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function deleteUser(token, userId) {
  const { data } = await api.delete(`/api/users/${userId}`, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function getUserStats(token, userId) {
  const { data } = await api.get(`/api/users/${userId}/stats`, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function listScans(token, filters = {}) {
  const { data } = await api.get('/api/scans', {
    headers: getAuthHeaders(token),
    params: filters,
  })

  return data
}

export async function getScan(token, scanId) {
  const { data } = await api.get(`/api/scans/${scanId}`, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function createScan(token, payload) {
  const { data } = await api.post('/api/scans', payload, {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function getAnalytics(token) {
  const { data } = await api.get('/api/analytics', {
    headers: getAuthHeaders(token),
  })

  return data
}

export async function getHealth() {
  const { data } = await api.get('/api/health')
  return data
}
