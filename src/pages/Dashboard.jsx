import { useState, useEffect } from 'react'
import { Users, AlertTriangle, Clock, ShieldAlert, TrendingUp, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { api } from '../api/client'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'

const PRIMARY = '#EA8923'
const NAVY    = '#1B2B4B'
const RISK_COLORS   = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' }
const STATUS_COLORS = { Verified: '#10B981', Pending: '#F59E0B', Expired: '#EF4444', Rejected: '#6B7280' }

function StatCard({ icon: Icon, label, value, sub, accentColor = PRIMARY, to }) {
  const inner = (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accentColor + '18' }}>
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 leading-tight">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function Dashboard() {
  const [summary, setSummary]       = useState(null)
  const [expiring, setExpiring]     = useState([])
  const [openAlerts, setOpenAlerts] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/expiring?days=30'),
      api.get('/alerts?status=open'),
    ]).then(([s, e, a]) => {
      setSummary(s)
      setExpiring(e.slice(0, 5))
      setOpenAlerts(a.slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const riskData   = ['Low','Medium','High'].map(n => ({ name: n, value: summary?.riskLevels?.[n.toLowerCase()] || 0 }))
  const statusData = Object.entries(summary?.kycStatus || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
  }))

  return (
    <div className="space-y-6 fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Customers"    value={summary?.totalCustomers || 0}  to="/customers" />
        <StatCard icon={AlertTriangle} label="Open Alerts"        value={summary?.openAlerts || 0}      to="/alerts"    accentColor="#EF4444"  sub={`${summary?.criticalAlerts || 0} critical`} />
        <StatCard icon={Clock}         label="Expiring (30 days)" value={summary?.expiringIn30 || 0}    to="/reports"   accentColor="#F59E0B" />
        <StatCard icon={ShieldAlert}   label="Watchlist Entries"  value={summary?.watchlistEntries || 0} to="/watchlist" accentColor={NAVY} />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle}   label="Verified Customers"     value={summary?.kycStatus?.verified || 0}     accentColor="#10B981" />
        <StatCard icon={AlertTriangle} label="PEP Customers"           value={summary?.pepCustomers || 0}            accentColor="#8B5CF6" to="/customers" />
        <StatCard icon={ShieldAlert}   label="Sanctioned Customers"   value={summary?.sanctionedCustomers || 0}     accentColor="#EF4444" to="/customers" />
        <StatCard icon={TrendingUp}    label="Expiring (60 days)"      value={(summary?.expiringIn30 || 0) + (summary?.expiringIn60 || 0)} accentColor="#F59E0B" to="/reports" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Pie */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} dataKey="value">
                {riskData.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {riskData.map(d => (
              <div key={d.name} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[d.name] }} />
                {d.name} <span className="font-medium text-gray-700">({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* KYC Status Bar */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">KYC Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiring */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Expiring KYC</h3>
            <Link to="/reports" className="text-xs font-medium" style={{ color: PRIMARY }}>View all →</Link>
          </div>
          {expiring.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No expiring documents in 30 days</p>
          ) : (
            <div className="space-y-3">
              {expiring.map(c => (
                <Link key={c.customerId} to={`/customers/${c.customerId}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.customerId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-red-500">
                      {new Date(c.kycExpiryDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </div>
                    <Badge type={c.kycStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Open Alerts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Open Alerts</h3>
          <Link to="/alerts" className="text-xs font-medium" style={{ color: PRIMARY }}>View all →</Link>
        </div>
        {openAlerts.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No open alerts — all clear!</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {openAlerts.map(a => (
              <div key={a._id || a.alertId} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.severity === 'critical' ? '#EF4444' : a.severity === 'high' ? '#F59E0B' : '#6B7280' }} />
                  <div>
                    <Link to={`/customers/${a.customerId}`} className="text-sm font-medium text-gray-700 hover:underline">
                      {a.customerName}
                    </Link>
                    <div className="text-xs text-gray-400">{a.message}</div>
                  </div>
                </div>
                <Badge type={a.severity} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
