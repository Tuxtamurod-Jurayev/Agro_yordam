import { House, LogIn, ScanLine, ScrollText, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function MobileTabBar() {
  const { user } = useAuth()

  const navItems = user
    ? [
        { to: '/', label: 'Bosh', icon: House },
        { to: '/history', label: 'Tarix', icon: ScrollText },
        { to: '/scan', label: 'Scan', icon: ScanLine, primary: true },
        { to: '/account', label: 'Profil', icon: UserRound },
      ]
    : [
        { to: '/', label: 'Bosh', icon: House },
        { to: '/auth', label: 'Kirish', icon: LogIn, primary: true },
      ]

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/92 px-4 pb-4 pt-3 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-md items-end justify-around rounded-[2rem] border border-white/10 bg-white/[0.04] px-3 py-2 shadow-glow">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-16 flex-col items-center gap-1 rounded-[1.4rem] px-3 py-2 text-[11px] transition ${
                  item.primary
                    ? isActive
                      ? 'bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-300/12 text-emerald-100'
                    : isActive
                      ? 'bg-white/12 text-white'
                      : 'text-slate-400'
                }`
              }
            >
              <Icon className={item.primary ? 'h-5 w-5' : 'h-4 w-4'} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
