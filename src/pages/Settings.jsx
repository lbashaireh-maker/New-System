import { useState, useEffect } from 'react'
import { Save, Info } from 'lucide-react'
import { api } from '../api/client'
import Spinner from '../components/Spinner'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-6">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? '' : 'bg-gray-200'
        }`}
        style={{ backgroundColor: checked ? '#EA8923' : undefined }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function NumberInput({ value, onChange, label, description, min = 1, max = 365 }) {
  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-6">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <input
        type="number" min={min} max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10) || min)}
        className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': '#EA8923' }}
      />
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    api.get('/settings').then(s => { setSettings(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await api.put('/settings', settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl space-y-6 fade-in">
      {saved && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          ✅ Settings saved successfully.
        </div>
      )}

      {/* KYC Expiry */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">KYC Expiry Thresholds</h3>
        </div>
        <div className="px-5 divide-y divide-gray-50">
          <NumberInput
            label="Warning threshold (days)"
            description="Generate a warning alert this many days before KYC expiry"
            value={settings.kycExpiryWarningDays ?? 60}
            onChange={v => set('kycExpiryWarningDays', v)}
          />
          <NumberInput
            label="Alert threshold (days)"
            description="Escalate to a high-priority alert this many days before expiry"
            value={settings.kycExpiryAlertDays ?? 30}
            onChange={v => set('kycExpiryAlertDays', v)}
          />
        </div>
      </div>

      {/* Screening */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Compliance Screening</h3>
        </div>
        <div className="px-5 divide-y divide-gray-50">
          <Toggle
            label="Enable PEP Screening"
            description="Flag customers identified as Politically Exposed Persons"
            checked={!!settings.enablePEPScreening}
            onChange={v => set('enablePEPScreening', v)}
          />
          <Toggle
            label="Enable Sanction Screening"
            description="Screen customers against internal and external sanction lists"
            checked={!!settings.enableSanctionScreen}
            onChange={v => set('enableSanctionScreen', v)}
          />
          <Toggle
            label="Auto-generate expiry alerts"
            description="Automatically create alerts when KYC documents approach expiry"
            checked={!!settings.autoAlertOnExpiry}
            onChange={v => set('autoAlertOnExpiry', v)}
          />
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">Defaults</h3>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Default risk level for new customers</div>
              <div className="text-xs text-gray-400 mt-0.5">Applied when adding a new customer without specifying risk</div>
            </div>
            <select
              value={settings.defaultRiskLevel || 'medium'}
              onChange={e => set('defaultRiskLevel', e.target.value)}
              className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#EA8923' }} />
          <div>
            <div className="text-sm font-medium text-gray-700">KYC Watch — Bank Al Etihad</div>
            <div className="text-xs text-gray-400 mt-1">Version 1.0.0 &nbsp;·&nbsp; KYC Compliance Monitoring System &nbsp;·&nbsp; All data is stored locally.</div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50 shadow-sm"
        style={{ backgroundColor: '#EA8923' }}>
        <Save size={15} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
