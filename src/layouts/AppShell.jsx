import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-6 sm:px-6 lg:px-8">
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
    </div>
  )
}
