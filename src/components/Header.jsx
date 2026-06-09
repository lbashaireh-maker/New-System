import { Bell } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from '../api/client'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/alerts':    'Alerts',
  '/watchlist': 'Watchlist',
  '/reports':   'Reports',
  '/settings':  'Settings',
}

export default function Header() {
  const location = useLocation()
  const [openAlerts, setOpenAlerts] = useState(0)

  const title = Object.entries(TITLES).find(([p]) => location.pathname.startsWith(p))?.[1] || 'KYC Watch'

  useEffect(() => {
    api.get('/alerts?status=open')
      .then(a => setOpenAlerts(a.length))
      .catch(() => {})
  }, [location.pathname])

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-5">
        <Link to="/alerts" className="relative">
          <Bell size={20} className="text-gray-400 hover:text-gray-600 transition-colors" />
          {openAlerts > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full text-white flex items-center justify-center font-bold px-0.5"
              style={{ backgroundColor: '#EF4444', fontSize: '9px' }}
            >
              {openAlerts > 9 ? '9+' : openAlerts}
            </span>
          )}
        </Link>
        <span className="text-sm text-gray-400">{today}</span>
      </div>
    </header>
  )
}
