import { LoaderCircle, ShieldAlert } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isNativeApp } from '../services/runtime'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel flex items-center gap-3 px-6 py-4 text-slate-100">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-300" />
          Sessiya yuklanmoqda...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel max-w-lg space-y-4 p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-300" />
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-white">Bu bo'lim faqat admin uchun</h2>
            <p className="text-sm text-slate-300">
              Statistik monitoring panelini ko'rish uchun admin hisobiga kiring.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (requireAdmin && isNativeApp) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel max-w-lg space-y-4 p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-300" />
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-white">Admin panel web uchun ochiladi</h2>
            <p className="text-sm text-slate-300">
              APK oddiy foydalanuvchilar uchun mo'ljallangan. Admin monitoringni web versiyada
              ishlating.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}
