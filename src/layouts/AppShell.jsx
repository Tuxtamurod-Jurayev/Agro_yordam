import { ArrowLeft, Leaf } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MobileTabBar } from '../components/MobileTabBar'
import { Navbar } from '../components/Navbar'
import { isNativeApp } from '../services/runtime'

export function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const showNativeShell = isNativeApp && user?.role !== 'admin'
  const isRoot = location.pathname === '/'

  const pageTitleMap = {
    '/': 'Agro Yordam',
    '/auth': 'Kirish',
    '/scan': 'Barg skani',
    '/history': 'Scan tarixi',
    '/account': 'Profil',
  }

  const pageTitle = pageTitleMap[location.pathname] ?? 'Agro Yordam'

  return (
    <div className="safe-x min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
      </div>

      {showNativeShell ? (
        <header className="safe-top sticky top-0 z-30 border-b border-white/10 bg-slate-950/88 px-4 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (isRoot ? navigate('/scan') : navigate(-1))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100"
            >
              {isRoot ? <Leaf className="h-5 w-5 text-emerald-200" /> : <ArrowLeft className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate font-display text-lg text-white">{pageTitle}</p>
              <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">
                Smart plant care
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5" />
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      <main
        className={`relative z-10 mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${
          showNativeShell ? 'max-w-md pb-28' : 'max-w-7xl'
        }`}
      >
        <Outlet />
      </main>

      {showNativeShell ? (
        <MobileTabBar />
      ) : (
        <footer className="safe-bottom relative z-10 border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Agro Yordam: productionga tayyor auth, AI scan, analytics va user management tizimi.</p>
            <a
              href="https://t.me/Perfektum_1997"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-200 transition hover:text-emerald-100"
            >
              Admin bilan bog'lanish: @Perfektum_1997
            </a>
          </div>
        </footer>
      )}
    </div>
  )
}
