import { DISEASES, getDiseaseByKey } from '../data/diseases'
import {
  createScan,
  createUser,
  deleteMyAccount,
  deleteUser,
  getAnalytics,
  getMe,
  getScan,
  getUserStats,
  listScans,
  listUsers,
  loadStoredSession,
  login,
  persistSession,
  register,
  updateMyPassword,
  updateMyProfile,
  updateUser,
} from './apiService'

const runtimeMode = 'supabase-postgres'

function enrichScan(scan) {
  return {
    ...scan,
    disease: {
      ...getDiseaseByKey(scan.diseaseKey),
    },
  }
}

export const platformService = {
  runtimeMode,
  isMockMode: false,
  async getSession() {
    const stored = loadStoredSession()

    if (!stored?.token) {
      return null
    }

    try {
      const data = await getMe(stored.token)
      const session = {
        token: stored.token,
        user: data.user,
        stats: data.stats,
      }
      persistSession(session)
      return session
    } catch {
      persistSession(null)
      return null
    }
  },
  async signIn(payload) {
    const data = await login(payload)
    const session = {
      token: data.token,
      user: data.user,
    }
    persistSession(session)
    return session
  },
  async signUp(payload) {
    const data = await register(payload)
    const session = {
      token: data.token,
      user: data.user,
    }
    persistSession(session)
    return session
  },
  async signOut() {
    persistSession(null)
  },
  async refreshCurrentUser(session) {
    if (!session?.token) {
      return null
    }
    const data = await getMe(session.token)
    const nextSession = {
      token: session.token,
      user: data.user,
      stats: data.stats,
    }
    persistSession(nextSession)
    return nextSession
  },
  async updateOwnProfile(session, payload) {
    const data = await updateMyProfile(session.token, payload)
    const nextSession = {
      token: data.token,
      user: data.user,
    }
    persistSession(nextSession)
    return nextSession
  },
  async updateOwnPassword(session, payload) {
    return updateMyPassword(session.token, payload)
  },
  async deleteOwnAccount(session) {
    const data = await deleteMyAccount(session.token)
    persistSession(null)
    return data
  },
  async listDiseases() {
    return DISEASES
  },
  async getUserScans(session, filters = {}) {
    const data = await listScans(session.token, filters)
    return data.scans.map(enrichScan)
  },
  async getScanById(session, scanId) {
    const data = await getScan(session.token, scanId)
    return enrichScan(data.scan)
  },
  async createScan(session, payload) {
    const data = await createScan(session.token, payload)
    return enrichScan(data.scan)
  },
  async getAnalytics(session) {
    return getAnalytics(session.token)
  },
  async listUsers(session, filters = {}) {
    const data = await listUsers(session.token, filters)
    return data.users
  },
  async createUser(session, payload) {
    const data = await createUser(session.token, payload)
    return data.user
  },
  async updateUser(session, userId, payload) {
    const data = await updateUser(session.token, userId, payload)
    return data.user
  },
  async deleteUser(session, userId) {
    return deleteUser(session.token, userId)
  },
  async getUserStats(session, userId) {
    return getUserStats(session.token, userId)
  },
}
