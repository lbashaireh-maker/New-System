import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, ShieldAlert, RefreshCw } from 'lucide-react'
import { watchlistStore } from '../api/localStore'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

export default function Watchlist(){
  const[entries,setEntries]=useState([])
  const[search,setSearch]=useState('')
  const[showAdd,setShowAdd]=useState(false)
  const[deleteId,setDeleteId]=useState(null)
  const[screening,setScreening]=useState(false)
  const[screenRes,setScreenRes]=useState(null)
  const[saving,setSaving]=useState(false)
  const[form,setForm]=useState({name:'',aliases:'',nationality:'',dob:'',reason:'',listType:'internal'})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))

  const load=useCallback(()=>setEntries(watchlistStore.list(search)),[search])
  useEffect(()=>{load()},[load])

  const handleAdd=e=>{
    e.preventDefault();setSaving(true)
    const payload={...form,aliases:form.aliases?form.aliases.split(',').map(s=>s.trim()).filter(Boolean):[]}
    watchlistStore.add(payload);setShowAdd(false);setForm({name:'',aliases:'',nationality:'',dob:'',reason:'',listType:'internal'});load();setSaving(false)
  }

  const handleScreenAll=()=>{
    setScreening(true);setScreenRes(null)
    setTimeout(()=>{const r=watchlistStore.screenAll();setScreenRes(r);load();setScreening(false)},1000)
  }

  return(
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or alias..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none"/>
        </div>
        <button onClick={handleScreenAll} disabled={screening} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border font-medium" style={{borderColor:'#1B2B4B',color:'#1B2B4B'}}>
          <RefreshCw size={14} className={screening?'animate-spin':''}/>{screening?'Screening...':'Screen All Customers'}</button>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium" style={{backgroundColor:'#EA8923'}}>
          <Plus size={14}/> Add Entry</button>
      </div>
      {screenRes&&(
        <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${screenRes.newMatches.length>0?'bg-red-50 text-red-700 border-red-200':'bg-green-50 text-green-700 border-green-200'}`}>
          Screened {screenRes.screened} customers. {screenRes.newMatches.length>0?`⚠️ ${screenRes.newMatches.length} new match(es): ${screenRes.newMatches.map(m=>m.customer).join(', ')}`:'✅ No new watchlist matches.'}
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {entries.length===0?(<EmptyState icon={ShieldAlert} title="Watchlist is empty" description="Add entries to screen customers against them."/>):(
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Name','Aliases','Nationality','DOB','Reason','List','Added',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map(e=>(
                <tr key={e.entryId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{(e.aliases||[]).join(', ')||'—'}</td>
                  <td className="px-4 py-3 text-xs font-medium">{e.nationality||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.dob||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">{e.reason}</td>
                  <td className="px-4 py-3"><Badge type={e.listType}/></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(e.addedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td className="px-4 py-3"><button onClick={()=>setDeleteId(e.entryId)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add Watchlist Entry">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e=>set('name',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Aliases (comma-separated)</label>
              <input value={form.aliases} onChange={e=>set('aliases',e.target.value)} placeholder="Alt Name, Other Alias" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
              <input value={form.nationality} onChange={e=>set('nationality',e.target.value)} placeholder="JO, SY..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
              <input required value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="Money laundering, Terrorism, etc." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">List Type</label>
              <select value={form.listType} onChange={e=>set('listType',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
                <option value="internal">Internal</option><option value="UN">UN</option><option value="OFAC">OFAC</option></select></div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setShowAdd(false)} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium" style={{backgroundColor:'#EA8923'}}>{saving?'Adding...':'Add to Watchlist'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{watchlistStore.delete(deleteId);setDeleteId(null);load()}} title="Remove Entry" message="Remove this entry from the watchlist?" confirmLabel="Remove" danger/>
    </div>
  )
}
