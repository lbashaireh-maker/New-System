import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureSeeded } from './api/localStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Alerts from './pages/Alerts'
import Watchlist from './pages/Watchlist'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  useEffect(() => { ensureSeeded() }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"             element={<Dashboard />} />
          <Route path="customers"             element={<Customers />} />
          <Route path="customers/:customerId" element={<CustomerDetail />} />
          <Route path="alerts"                element={<Alerts />} />
          <Route path="watchlist"             element={<Watchlist />} />
          <Route path="reports"               element={<Reports />} />
          <Route path="settings"              element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
