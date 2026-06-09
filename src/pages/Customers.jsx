import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { customers as store } from '../api/localStore'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

const NATIONALITIES=['JO','SA','AE','KW','BH','QA','OM','EG','SY','IQ','LB','PS','US','GB','DE','FR','OTHER']
const OCCUPATIONS=['Engineer','Doctor','Teacher','Business Owner','Trader','Government','Politician','Student','Self-employed','Other','Unknown']
const LIMIT=15

function CustomerForm({initial={},onSave,onClose,saving,error}){
  const[form,setForm]=useState({name:'',nameAr:'',nationalId:'',nationality:'JO',dob:'',gender:'M',phone:'',email:'',address:'',riskLevel:'medium',kycStatus:'pending',kycExpiryDate:'',occupation:'',employer:'',monthlyIncome:'',pepStatus:false,sanctionStatus:false,...initial})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  return(
    <form onSubmit={e=>{e.preventDefault();onSave(form)}} className="space-y-4">
      {error&&<div className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
          <input required value={form.name} onChange={e=>set('name',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Ahmad Al-Rashid"/></div>
        <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-medium text-gray-600 mb-1">الاسم بالعربي</label>
          <input value={form.nameAr} onChange={e=>set('nameAr',e.target.value)} dir="rtl" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="أحمد الراشد"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">National ID *</label>
          <input required value={form.nationalId} onChange={e=>set('nationalId',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Nationality</label>
          <select value={form.nationality} onChange={e=>set('nationality',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
            {NATIONALITIES.map(n=><option key={n}>{n}</option>)}</select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
          <input required type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <select value={form.gender} onChange={e=>set('gender',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
            <option value="M">Male</option><option value="F">Female</option></select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input value={form.phone} onChange={e=>set('phone',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" placeholder="+962791234567"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input value={form.address} onChange={e=>set('address',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
          <select value={form.occupation} onChange={e=>set('occupation',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
            <option value="">Select...</option>{OCCUPATIONS.map(o=><option key={o}>{o}</option>)}</select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Monthly Income (JOD)</label>
          <input type="number" min="0" value={form.monthlyIncome} onChange={e=>set('monthlyIncome',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none" placeholder="2500"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Employer</label>
          <input value={form.employer} onChange={e=>set('employer',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Risk Level</label>
          <select value={form.riskLevel} onChange={e=>set('riskLevel',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">KYC Status</label>
          <select value={form.kycStatus} onChange={e=>set('kycStatus',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
            <option value="pending">Pending</option><option value="verified">Verified</option><option value="expired">Expired</option><option value="rejected">Rejected</option></select></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">KYC Expiry Date</label>
          <input type="date" value={form.kycExpiryDate} onChange={e=>set('kycExpiryDate',e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"/></div>
        <div className="col-span-2 flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.pepStatus} onChange={e=>set('pepStatus',e.target.checked)} className="w-4 h-4 rounded"/><span className="text-sm">PEP</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.sanctionStatus} onChange={e=>set('sanctionStatus',e.target.checked)} className="w-4 h-4 rounded"/><span className="text-sm">Sanctioned</span></label>
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50" style={{backgroundColor:'#EA8923'}}>
          {saving?'Saving...':'Save Customer'}</button>
      </div>
    </form>
  )
}

export default function Customers(){
  const[state,setState]=useState({list:[],total:0,page:1,search:'',riskFilter:'',statusFilter:'',showAdd:false,deleteId:null,saving:false,error:''})
  const s=u=>setState(prev=>({...prev,...u}))

  const load=useCallback(()=>{
    const r=store.list({search:state.search,riskLevel:state.riskFilter,kycStatus:state.statusFilter,page:state.page,limit:LIMIT})
    s({list:r.data,total:r.total})
  },[state.search,state.riskFilter,state.statusFilter,state.page])

  useEffect(()=>{load()},[load])

  const handleAdd=form=>{
    s({saving:true,error:''})
    try{store.create(form);s({showAdd:false,saving:false});load()}
    catch(e){s({error:e.message,saving:false})}
  }

  const handleDelete=()=>{store.delete(state.deleteId);s({deleteId:null});load()}
  const totalPages=Math.ceil(state.total/LIMIT)

  return(
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={state.search} onChange={e=>s({search:e.target.value,page:1})} placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"/>
        </div>
        <select value={state.riskFilter} onChange={e=>s({riskFilter:e.target.value,page:1})} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
          <option value="">All Risk Levels</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
        <select value={state.statusFilter} onChange={e=>s({statusFilter:e.target.value,page:1})} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
          <option value="">All Statuses</option><option value="verified">Verified</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="rejected">Rejected</option></select>
        <button onClick={()=>s({showAdd:true,error:''})} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium ml-auto" style={{backgroundColor:'#EA8923'}}>
          <Plus size={15}/> Add Customer</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {state.list.length===0?(<EmptyState icon={Users} title="No customers found" description="Try adjusting your filters or add a new customer."/>):(
          <>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Customer ID','Name','National ID','Nationality','KYC Status','Risk','Expiry','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {state.list.map(c=>(
                  <tr key={c.customerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.customerId}</td>
                    <td className="px-4 py-3"><div className="font-medium text-gray-800">{c.name}</div>{c.nameAr&&<div className="text-xs text-gray-400" dir="rtl">{c.nameAr}</div>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.nationalId}</td>
                    <td className="px-4 py-3 text-xs font-medium">{c.nationality}</td>
                    <td className="px-4 py-3"><Badge type={c.kycStatus}/></td>
                    <td className="px-4 py-3"><Badge type={c.riskLevel}/></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.kycExpiryDate?new Date(c.kycExpiryDate).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2">
                      <Link to={`/customers/${c.customerId}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"><Eye size={15}/></Link>
                      <button onClick={()=>s({deleteId:c.customerId})} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Showing {((state.page-1)*LIMIT)+1}–{Math.min(state.page*LIMIT,state.total)} of {state.total}</span>
              <div className="flex items-center gap-1">
                <button disabled={state.page===1} onClick={()=>s({page:state.page-1})} className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">‹</button>
                <span className="px-3 text-sm">{state.page}/{totalPages||1}</span>
                <button disabled={state.page>=totalPages} onClick={()=>s({page:state.page+1})} className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">›</button>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal isOpen={state.showAdd} onClose={()=>s({showAdd:false})} title="Add New Customer" size="lg">
        <CustomerForm onSave={handleAdd} onClose={()=>s({showAdd:false})} saving={state.saving} error={state.error}/>
      </Modal>
      <ConfirmDialog isOpen={!!state.deleteId} onClose={()=>s({deleteId:null})} onConfirm={handleDelete} title="Delete Customer" message="Permanently delete this customer and all their data?" confirmLabel="Delete" danger/>
    </div>
  )
}
