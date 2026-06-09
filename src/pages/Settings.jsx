import { useState, useEffect } from 'react'
import { Save, Info } from 'lucide-react'
import { settingsStore } from '../api/localStore'

function Toggle({checked,onChange,label,description}){
  return(
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-6"><div className="text-sm font-medium text-gray-700">{label}</div>{description&&<div className="text-xs text-gray-400 mt-0.5">{description}</div>}</div>
      <button type="button" onClick={()=>onChange(!checked)} className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200" style={{backgroundColor:checked?'#EA8923':'#D1D5DB'}}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked?'translate-x-5':'translate-x-0'}`}/>
      </button>
    </div>
  )
}

export default function Settings(){
  const[settings,setSettings]=useState({})
  const[saved,setSaved]=useState(false)
  useEffect(()=>setSettings(settingsStore.get()),[])
  const set=(k,v)=>setSettings(s=>({...s,[k]:v}))
  const handleSave=()=>{settingsStore.save(settings);setSaved(true);setTimeout(()=>setSaved(false),3000)}
  return(
    <div className="max-w-2xl space-y-6 fade-in">
      {saved&&<div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">✅ Settings saved successfully.</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-700">KYC Expiry Thresholds</h3></div>
        <div className="px-5 divide-y divide-gray-50">
          {[['kycExpiryWarningDays','Warning threshold (days)','Generate a warning this many days before expiry'],['kycExpiryAlertDays','Alert threshold (days)','Escalate to high-priority this many days before expiry']].map(([k,label,desc])=>(
            <div key={k} className="flex items-start justify-between py-4">
              <div className="flex-1 pr-6"><div className="text-sm font-medium text-gray-700">{label}</div><div className="text-xs text-gray-400 mt-0.5">{desc}</div></div>
              <input type="number" min={1} max={365} value={settings[k]??60} onChange={e=>set(k,parseInt(e.target.value)||1)}
                className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-300"/>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-700">Compliance Screening</h3></div>
        <div className="px-5 divide-y divide-gray-50">
          <Toggle label="Enable PEP Screening" description="Flag customers identified as Politically Exposed Persons" checked={!!settings.enablePEPScreening} onChange={v=>set('enablePEPScreening',v)}/>
          <Toggle label="Enable Sanction Screening" description="Screen customers against internal and external sanction lists" checked={!!settings.enableSanctionScreen} onChange={v=>set('enableSanctionScreen',v)}/>
          <Toggle label="Auto-generate expiry alerts" description="Automatically create alerts when KYC documents approach expiry" checked={!!settings.autoAlertOnExpiry} onChange={v=>set('autoAlertOnExpiry',v)}/>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-700">Defaults</h3></div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div><div className="text-sm font-medium text-gray-700">Default risk level for new customers</div><div className="text-xs text-gray-400 mt-0.5">Applied when adding a new customer without specifying risk</div></div>
          <select value={settings.defaultRiskLevel||'medium'} onChange={e=>set('defaultRiskLevel',e.target.value)} className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-start gap-3"><Info size={16} className="mt-0.5 flex-shrink-0" style={{color:'#EA8923'}}/>
          <div><div className="text-sm font-medium text-gray-700">KYC Watch — Bank Al Etihad</div><div className="text-xs text-gray-400 mt-1">Version 1.0.0 · KYC Compliance Monitoring System · Data stored in browser localStorage.</div></div>
        </div>
      </div>
      <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium text-sm shadow-sm" style={{backgroundColor:'#EA8923'}}>
        <Save size={15}/> Save Settings</button>
    </div>
  )
}
