import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Clock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { alertsStore } from '../api/localStore'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

const TYPE_LABELS={kyc_expiry:'KYC Expiry',pep_flag:'PEP Flag',sanction_hit:'Sanction Hit',document_missing:'Missing Document'}

export default function Alerts(){
  const[alerts,setAlerts]=useState([])
  const[statusF,setStatusF]=useState('')
  const[severityF,setSeverityF]=useState('')
  const[deleteId,setDeleteId]=useState(null)
  const[resolveItem,setResolveItem]=useState(null)
  const[resolution,setResolution]=useState('')

  const load=useCallback(()=>setAlerts(alertsStore.list({status:statusF,severity:severityF})),[statusF,severityF])
  useEffect(()=>{load()},[load])

  const counts={open:alerts.filter(a=>a.status==='open').length,acknowledged:alerts.filter(a=>a.status==='acknowledged').length,resolved:alerts.filter(a=>a.status==='resolved').length,critical:alerts.filter(a=>a.severity==='critical'&&a.status==='open').length}

  return(
    <div className="space-y-5 fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Open',counts.open,'#EF4444'],['Critical',counts.critical,'#B91C1C'],['Acknowledged',counts.acknowledged,'#F59E0B'],['Resolved',counts.resolved,'#10B981']].map(([l,v,c])=>(
          <div key={l} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold" style={{color:c}}>{v}</div>
            <div className="text-sm text-gray-500">{l}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
          <option value="">All Statuses</option><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select>
        <select value={severityF} onChange={e=>setSeverityF(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
          <option value="">All Severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {alerts.length===0?(<EmptyState icon={CheckCircle} title="No alerts" description="No alerts match your current filters."/>):(
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Severity','Customer','Type','Message','Status','Created','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {alerts.map(a=>(
                <tr key={a.alertId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><Badge type={a.severity}/></td>
                  <td className="px-4 py-3"><Link to={`/customers/${a.customerId}`} className="font-medium text-gray-700 hover:underline">{a.customerName}</Link></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{TYPE_LABELS[a.type]||a.type}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">{a.message}</td>
                  <td className="px-4 py-3"><Badge type={a.status}/></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1">
                    {a.status==='open'&&<button onClick={()=>{alertsStore.acknowledge(a.alertId);load()}} title="Acknowledge" className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors"><Clock size={14}/></button>}
                    {a.status!=='resolved'&&<button onClick={()=>{setResolveItem(a);setResolution('')}} title="Resolve" className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><CheckCircle size={14}/></button>}
                    <button onClick={()=>setDeleteId(a.alertId)} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={!!resolveItem} onClose={()=>setResolveItem(null)} title="Resolve Alert" size="sm">
        <p className="text-sm text-gray-600 mb-3">Resolving alert for <strong>{resolveItem?.customerName}</strong>: {resolveItem?.message}</p>
        <label className="block text-xs font-medium text-gray-600 mb-1">Resolution Notes</label>
        <textarea value={resolution} onChange={e=>setResolution(e.target.value)} rows={3} placeholder="Describe the action taken..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none mb-4 resize-none"/>
        <div className="flex gap-3">
          <button onClick={()=>setResolveItem(null)} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600">Cancel</button>
          <button onClick={()=>{alertsStore.resolve(resolveItem.alertId,'Compliance Officer',resolution);setResolveItem(null);load()}} className="flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium" style={{backgroundColor:'#EA8923'}}>Mark Resolved</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{alertsStore.delete(deleteId);load()}} title="Delete Alert" message="Permanently remove this alert?" confirmLabel="Delete" danger/>
    </div>
  )
}
