import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { api } from '../api/client'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'

const PRIMARY = '#EA8923'
const NAVY    = '#1B2B4B'
const RISK_COLORS   = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' }
const STATUS_COLORS = { Verified:'#10B981', Pending:'#F59E0B', Expired:'#EF4444', Rejected:'#6B7280' }

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Reports() {
  const [summary,  setSummary]  = useState(null)
  const [expiring, setExpiring] = useState([])
  const [audit,    setAudit]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [days,     setDays]     = useState(60)

  const loadExpiring = d => {
    api.get(`/reports/expiring?days=${d}`).then(setExpiring)
  }

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/expiring?days=60'),
      api.get('/reports/audit'),
    ]).then(([s, e, a]) => {
      setSummary(s)
      setExpiring(e)
      setAudit(a)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const riskData   = ['Low','Medium','High'].map(n => ({ name: n, value: summary?.riskLevels?.[n.toLowerCase()] || 0 }))
  const statusData = Object.entries(summary?.kycStatus || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
  }))

  const exportCSV = (rows, filename) => {
    if (!rows.length) return
    const headers = Object.keys(rows[0]).join(',')
    const body = rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(','))
    const blob = new Blob([[headers, ...body].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="KYC Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} margin={{ top:5, right:5, bottom:5, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={PRIMARY} radius={[4,4,0,0]}>
                {statusData.map((d,i) => (
                  <Cell key={i} fill={STATUS_COLORS[d.name] || PRIMARY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Risk Level Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                {riskData.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Compliance Summary */}
      <Section title="Compliance Summary">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Total Customers',     summary?.totalCustomers],
            ['PEP Customers',       summary?.pepCustomers,        '#8B5CF6'],
            ['Sanctioned',          summary?.sanctionedCustomers, '#EF4444'],
            ['Watchlist Entries',   summary?.watchlistEntries,    NAVY],
            ['Open Alerts',         summary?.openAlerts,          '#EF4444'],
            ['Critical Alerts',     summary?.criticalAlerts,      '#B91C1C'],
            ['Expiring (30 days)',  summary?.expiringIn30,        '#F59E0B'],
            ['Expiring (60 days)',  (summary?.expiringIn30 || 0) + (summary?.expiringIn60 || 0), '#F59E0B'],
          ].map(([label, val, color = PRIMARY]) => (
            <div key={label} className="p-4 rounded-lg" style={{ backgroundColor: color + '12' }}>
              <div className="text-2xl font-bold" style={{ color }}>{val ?? '—'}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Expiring KYC */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Expiring KYC Documents</h3>
          <div className="flex items-center gap-3">
            <select value={days} onChange={e => { setDays(+e.target.value); loadExpiring(+e.target.value) }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none">
              {[30,60,90,180].map(d => <option key={d} value={d}>Next {d} days</option>)}
            </select>
            <button onClick={() => exportCSV(expiring, 'expiring-kyc.csv')}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
        {expiring.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No customers expiring within {days} days.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Customer ID','Name','Nationality','KYC Status','Risk Level','Expiry Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expiring.map(c => (
                <tr key={c.customerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.customerId}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-xs">{c.nationality}</td>
                  <td className="px-4 py-3"><Badge type={c.kycStatus} /></td>
                  <td className="px-4 py-3"><Badge type={c.riskLevel} /></td>
                  <td className="px-4 py-3 text-sm font-medium text-red-500">
                    {new Date(c.kycExpiryDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Audit Log</h3>
          <button onClick={() => exportCSV(audit, 'audit-log.csv')}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export
          </button>
        </div>
        {audit.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No audit entries yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {audit.slice(0, 50).map((log, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: '#EA892318', color: '#EA8923' }}>{log.action}</span>
                <span className="text-sm text-gray-600 flex-1">{log.details}</span>
                <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
