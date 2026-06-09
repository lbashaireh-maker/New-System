import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, ShieldAlert, BarChart3, Settings, Shield } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts'    },
  { to: '/watchlist', icon: ShieldAlert,     label: 'Watchlist' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports'   },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#1B2B4B' }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EA8923' }}>
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">KYC Watch</div>
            <div className="text-xs leading-tight font-medium" style={{ color: '#EA8923' }}>Bank Al Etihad</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive ? 'text-white shadow-sm' : 'text-white/55 hover:text-white hover:bg-white/8'
              }`
            }
            style={({ isActive }) => isActive
              ? { backgroundColor: '#EA8923' }
              : { ':hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#EA8923' }}
          >
            CO
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">Compliance Officer</div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>KYC Department</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
