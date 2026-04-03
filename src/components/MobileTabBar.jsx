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
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#dce7d2] bg-[#eef3e2]/94 px-4 pb-4 pt-3 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-md items-end justify-around rounded-[2rem] border border-[#dde8d3] bg-white/90 px-3 py-2 shadow-[0_18px_38px_rgba(71,95,39,0.14)]">
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
                      ? 'bg-[linear-gradient(90deg,#3f7c52,#88b24a)] text-white shadow-[0_12px_24px_rgba(86,126,50,0.25)]'
                      : 'bg-[#edf5df] text-[#567638]'
                    : isActive
                      ? 'bg-[#f3f7eb] text-[#22341d]'
                      : 'text-[#81907a]'
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
