import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Upload, FileText, X, ShieldAlert, AlertTriangle, Check, RotateCcw } from 'lucide-react'
import { api } from '../api/client'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'

const DOC_TYPES = ['national_id','passport','driving_license','proof_of_address','salary_slip','bank_statement','other']
const DOC_LABELS = { national_id:'National ID', passport:'Passport', driving_license:'Driving Licence', proof_of_address:'Proof of Address', salary_slip:'Salary Slip', bank_statement:'Bank Statement', other:'Other' }

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-700 font-medium">{value}</dd>
    </div>
  )
}

export default function CustomerDetail() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [customer,  setCustomer]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(false)
  const [editForm,  setEditForm]  = useState({})
  const [saving,    setSaving]    = useState(false)
  const [docType,   setDocType]   = useState('national_id')
  const [docExpiry, setDocExpiry] = useState('')
  const [uploading, setUploading] = useState(false)
  const [delCust,   setDelCust]   = useState(false)
  const [delDocId,  setDelDocId]  = useState(null)
  const [screening, setScreening] = useState(false)
  const [screenResult, setScreenResult] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [resolving, setResolving] = useState(null)

  const load = () => {
    setLoading(true)
    api.get(`/customers/${customerId}`)
      .then(c => { setCustomer(c); setEditForm(c) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [customerId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.put(`/customers/${customerId}`, editForm)
      setCustomer(c => ({ ...c, ...updated }))
      setEditing(false)
    } finally { setSaving(false) }
  }

  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('type', docType)
    if (docExpiry) form.append('expiryDate', docExpiry)
    try {
      await api.upload(`/documents/upload/${customerId}`, form)
      load()
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const handleDeleteDoc = async () => {
    await api.delete(`/documents/${delDocId}`)
    load()
  }

  const handleDeleteCustomer = async () => {
    await api.delete(`/customers/${customerId}`)
    navigate('/customers')
  }

  const handleScreen = async () => {
    setScreening(true); setScreenResult(null)
    try {
      const result = await api.post(`/watchlist/screen/${customerId}`)
      setScreenResult(result)
      load()
    } finally { setScreening(false) }
  }

  const handleResolveAlert = async (alertId) => {
    setResolving(alertId)
    try {
      await api.put(`/alerts/${alertId}/resolve`, { officer: 'Compliance Officer', resolution: 'Reviewed and actioned' })
      load()
    } finally { setResolving(null) }
  }

  if (loading) return <Spinner />
  if (!customer) return <div className="text-center py-20 text-gray-400">Customer not found.</div>

  const set = (k, v) => setEditForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/customers" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{customer.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-400 font-mono">{customer.customerId}</span>
              {customer.pepStatus && <Badge type="high" label="PEP" />}
              {customer.sanctionStatus && <Badge type="expired" label="Sanctioned" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleScreen} disabled={screening}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border font-medium transition-colors"
            style={{ borderColor: '#1B2B4B', color: '#1B2B4B' }}>
            <ShieldAlert size={13} /> {screening ? 'Screening...' : 'Screen'}
          </button>
          <button onClick={() => { setEditing(true); setEditForm(customer) }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-white font-medium"
            style={{ backgroundColor: '#EA8923' }}>
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => setDelCust(true)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {screenResult && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          screenResult.matches.length > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {screenResult.matches.length > 0
            ? `⚠️ Watchlist match detected: ${screenResult.matches.map(m => m.matchedOn).join(', ')}`
            : '✅ No watchlist matches found — customer is clear.'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['info','documents','alerts'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
              activeTab === tab ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === tab ? { borderColor: '#EA8923', color: '#EA8923' } : {}}>
            {tab === 'documents' ? `Documents (${customer.documents?.length || 0})` : tab === 'alerts' ? `Alerts (${(customer.alerts || []).filter(a => a.status !== 'resolved').length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Personal Information</h3>
            <dl className="grid grid-cols-2 gap-4">
              <InfoRow label="Full Name (EN)" value={customer.name} />
              <InfoRow label="Full Name (AR)" value={customer.nameAr} />
              <InfoRow label="National ID" value={customer.nationalId} />
              <InfoRow label="Nationality" value={customer.nationality} />
              <InfoRow label="Date of Birth" value={customer.dob} />
              <InfoRow label="Gender" value={customer.gender === 'M' ? 'Male' : 'Female'} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Email" value={customer.email} />
              <div className="col-span-2"><InfoRow label="Address" value={customer.address} /></div>
            </dl>
          </div>

          {/* KYC & Risk */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">KYC & Compliance</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">KYC Status</dt>
                <dd><Badge type={customer.kycStatus} size="md" /></dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Risk Level</dt>
                <dd><Badge type={customer.riskLevel} size="md" /></dd>
              </div>
              <InfoRow label="KYC Expiry Date"
                value={customer.kycExpiryDate
                  ? new Date(customer.kycExpiryDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
                  : undefined} />
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">PEP Status</dt>
                <dd><Badge type={customer.pepStatus ? 'high' : 'verified'} label={customer.pepStatus ? 'PEP' : 'Clear'} /></dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Sanction Status</dt>
                <dd><Badge type={customer.sanctionStatus ? 'expired' : 'verified'} label={customer.sanctionStatus ? 'Hit' : 'Clear'} /></dd>
              </div>
              <InfoRow label="Occupation" value={customer.occupation} />
              <InfoRow label="Employer" value={customer.employer} />
              <InfoRow label="Monthly Income" value={customer.monthlyIncome ? `${Number(customer.monthlyIncome).toLocaleString()} JOD` : undefined} />
            </dl>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Upload Document</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Document Expiry</label>
                <input type="date" value={docExpiry} onChange={e => setDocExpiry(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
              </div>
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#EA8923' }}>
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {(!customer.documents || customer.documents.length === 0) ? (
              <div className="py-12 text-center text-gray-400 text-sm">No documents uploaded yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Type','File Name','Size','Expiry','Uploaded',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customer.documents.map(doc => (
                    <tr key={doc.documentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-400" />
                          <span className="font-medium">{DOC_LABELS[doc.type] || doc.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{doc.originalName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{(doc.size / 1024).toFixed(1)} KB</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{doc.expiryDate || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a href={doc.path} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <FileText size={14} />
                          </a>
                          <button onClick={() => setDelDocId(doc.documentId)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {(!customer.alerts || customer.alerts.length === 0) ? (
            <div className="py-12 text-center text-gray-400 text-sm">No alerts for this customer.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {customer.alerts.map(a => (
                <div key={a._id || a.alertId} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} style={{ color: a.severity === 'critical' ? '#EF4444' : '#F59E0B' }} />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{a.message}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {a.type.replace(/_/g,' ')} · {new Date(a.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge type={a.severity} />
                    <Badge type={a.status} />
                    {a.status !== 'resolved' && (
                      <button onClick={() => handleResolveAlert(a.alertId)} disabled={resolving === a.alertId}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Resolve">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Customer" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['name','Full Name (EN)'],['nameAr','Full Name (AR)'],['phone','Phone'],['email','Email'],['address','Address'],['employer','Employer']].map(([k, label]) => (
              <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input value={editForm[k] || ''} onChange={e => set(k, e.target.value)}
                  dir={k === 'nameAr' ? 'rtl' : 'ltr'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2" />
              </div>
            ))}
            {[['riskLevel','Risk Level',['low','medium','high']],['kycStatus','KYC Status',['pending','verified','expired','rejected']]].map(([k, label, opts]) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <select value={editForm[k] || ''} onChange={e => set(k, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">KYC Expiry Date</label>
              <input type="date" value={editForm.kycExpiryDate || ''} onChange={e => set('kycExpiryDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Income (JOD)</label>
              <input type="number" value={editForm.monthlyIncome || ''} onChange={e => set('monthlyIncome', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editForm.pepStatus} onChange={e => set('pepStatus', e.target.checked)} />
                <span className="text-sm">PEP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!editForm.sanctionStatus} onChange={e => set('sanctionStatus', e.target.checked)} />
                <span className="text-sm">Sanctioned</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setEditing(false)} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium" style={{ backgroundColor: '#EA8923' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={delCust} onClose={() => setDelCust(false)} onConfirm={handleDeleteCustomer}
        title="Delete Customer" message="Permanently delete this customer and all their data?" confirmLabel="Delete" danger />
      <ConfirmDialog isOpen={!!delDocId} onClose={() => setDelDocId(null)} onConfirm={handleDeleteDoc}
        title="Delete Document" message="Remove this document permanently?" confirmLabel="Delete" danger />
    </div>
  )
}
