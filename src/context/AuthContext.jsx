/* eslint-disable react-refresh/only-export-components */
import { createContext, startTransition, useContext, useEffect, useState } from 'react'
import { platformService } from '../services/platformService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function hydrateSession() {
      try {
        const nextSession = await platformService.getSession()

        if (!mounted) {
          return
        }

        startTransition(() => {
          setSession(nextSession)
          setLoading(false)
        })
      } catch {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    hydrateSession()

    return () => {
      mounted = false
    }
  }, [])

  async function signIn(payload) {
    const nextSession = await platformService.signIn(payload)
    setSession(nextSession)
    return nextSession
  }

  async function signUp(payload) {
    const nextSession = await platformService.signUp(payload)
    setSession(nextSession)
    return nextSession
  }

  async function signOut() {
    await platformService.signOut()
    setSession(null)
  }

  async function refreshSession() {
    const nextSession = await platformService.refreshCurrentUser(session)
    setSession(nextSession)
    return nextSession
  }

  async function updateProfile(payload) {
    const nextSession = await platformService.updateOwnProfile(session, payload)
    setSession(nextSession)
    return nextSession
  }

  async function updatePassword(payload) {
    return platformService.updateOwnPassword(session, payload)
  }

  async function deleteAccount() {
    await platformService.deleteOwnAccount(session)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        updateProfile,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth faqat AuthProvider ichida ishlatiladi.')
  }

  return context
}
