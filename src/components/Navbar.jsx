import {
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  ScanLine,
  Settings2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roleLabel } from '../utils/format'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const brandTarget = isAdmin ? '/dashboard' : '/'
  const navLinks = isAdmin
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tone: 'admin' },
        { to: '/scan', label: 'Skaner', icon: ScanLine },
        { to: '/history', label: 'Tarix', icon: ScanLine },
        { to: '/account', label: 'Account', icon: UserRound },
        { to: '/admin/users', label: 'Userlar', icon: Users, tone: 'users' },
      ]
    : [
        { to: '/', label: 'Bosh sahifa', icon: Leaf },
        { to: '/scan', label: 'Skaner', icon: ScanLine },
        { to: '/history', label: 'Tarix', icon: ScanLine },
        { to: '/account', label: 'Account', icon: UserRound },
      ]

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to={brandTarget} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/25">
            <Leaf className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">Agro Yordam</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Smart Agriculture
            </p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex rounded-2xl border border-white/10 p-3 text-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? link.tone === 'admin'
                        ? 'bg-emerald-300 text-slate-950'
                        : link.tone === 'users'
                          ? 'bg-cyan-300 text-slate-950'
                          : 'bg-white text-slate-950'
                      : link.tone === 'admin'
                        ? 'text-emerald-200 hover:bg-emerald-300/15'
                        : link.tone === 'users'
                          ? 'text-cyan-200 hover:bg-cyan-300/15'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{roleLabel(user.role)}</p>
              </div>
              <button type="button" onClick={handleSignOut} className="button-ghost">
                <LogOut className="h-4 w-4" />
                Chiqish
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/auth" className="button-ghost">
                Kirish
              </NavLink>
              <NavLink to="/scan" className="button-primary">
                <ScanLine className="h-4 w-4" />
                Skan qilish
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          <div className="glass-panel space-y-3 p-4">
            <nav className="grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${
                    link.tone === 'admin'
                      ? 'text-emerald-200 hover:bg-emerald-300/10'
                      : link.tone === 'users'
                        ? 'text-cyan-200 hover:bg-cyan-300/10'
                        : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {user ? (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{roleLabel(user.role)}</p>
                </div>
                <button type="button" onClick={handleSignOut} className="button-ghost w-full">
                  <LogOut className="h-4 w-4" />
                  Chiqish
                </button>
              </div>
            ) : (
              <div className="grid gap-2 border-t border-white/10 pt-3">
                <NavLink to="/auth" onClick={() => setOpen(false)} className="button-ghost">
                  <Settings2 className="h-4 w-4" />
                  Kirish / Ro'yxatdan o'tish
                </NavLink>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
