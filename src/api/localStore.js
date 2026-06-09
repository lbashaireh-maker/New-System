// Persistent localStorage-based data store with the same interface as the Express API

const now = () => new Date().toISOString();

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getCollection(name) {
  try { return JSON.parse(localStorage.getItem('kyc_' + name) || '[]'); }
  catch { return []; }
}
function setCollection(name, data) {
  localStorage.setItem('kyc_' + name, JSON.stringify(data));
}

// ─── SEED ────────────────────────────────────────────────────────────────────
export function ensureSeeded() {
  if (localStorage.getItem('kyc_seeded')) return;

  setCollection('customers', [
    { customerId:'C0001', name:'Ahmad Al-Rashid',   nameAr:'أحمد الراشد',   nationalId:'9012345678', nationality:'JO', dob:'1985-03-15', gender:'M', phone:'+962791234567', email:'ahmad.rashid@email.com',  address:'123 King Hussein St, Amman',  riskLevel:'low',    kycStatus:'verified', kycExpiryDate:'2026-03-15', pepStatus:false, sanctionStatus:false, occupation:'Engineer',      employer:'ZAIN',                   monthlyIncome:2500, createdAt:now(), updatedAt:now() },
    { customerId:'C0002', name:'Sara Khalil',        nameAr:'سارة خليل',     nationalId:'9087654321', nationality:'JO', dob:'1992-07-22', gender:'F', phone:'+962797654321', email:'sara.khalil@email.com',   address:'45 Queen Nour St, Zarqa',     riskLevel:'medium', kycStatus:'pending',  kycExpiryDate:'2025-07-22', pepStatus:false, sanctionStatus:false, occupation:'Business Owner', employer:'Self-employed',          monthlyIncome:5000, createdAt:now(), updatedAt:now() },
    { customerId:'C0003', name:'Mohammed Al-Farsi', nameAr:'محمد الفارسي',  nationalId:'9055512345', nationality:'SA', dob:'1978-11-08', gender:'M', phone:'+962796543210', email:'m.farsi@email.com',        address:'Riyadh, Saudi Arabia',        riskLevel:'high',   kycStatus:'expired',  kycExpiryDate:'2024-11-08', pepStatus:true,  sanctionStatus:false, occupation:'Politician',     employer:'Government',             monthlyIncome:8000, createdAt:now(), updatedAt:now() },
    { customerId:'C0004', name:'Layla Nasser',       nameAr:'ليلى ناصر',     nationalId:'9033398765', nationality:'JO', dob:'1995-01-30', gender:'F', phone:'+962793456789', email:'layla.nasser@email.com',  address:'78 Prince Hamza St, Irbid',   riskLevel:'low',    kycStatus:'verified', kycExpiryDate:'2027-01-30', pepStatus:false, sanctionStatus:false, occupation:'Teacher',        employer:'Ministry of Education',  monthlyIncome:1200, createdAt:now(), updatedAt:now() },
    { customerId:'C0005', name:'Omar Basim',          nameAr:'عمر باسم',      nationalId:'9044421890', nationality:'JO', dob:'1980-06-17', gender:'M', phone:'+962799876543', email:'omar.basim@email.com',    address:'12 Al-Urdon St, Aqaba',       riskLevel:'medium', kycStatus:'verified', kycExpiryDate:'2025-10-01', pepStatus:false, sanctionStatus:false, occupation:'Trader',         employer:'Al-Basim Trading',       monthlyIncome:4000, createdAt:now(), updatedAt:now() },
    { customerId:'C0006', name:'Nadia Suleiman',     nameAr:'نادية سليمان',  nationalId:'9076543210', nationality:'JO', dob:'1988-09-12', gender:'F', phone:'+962795432198', email:'nadia.suleiman@email.com', address:'33 Wasfi Al-Tal St, Amman',   riskLevel:'low',    kycStatus:'verified', kycExpiryDate:'2026-09-12', pepStatus:false, sanctionStatus:false, occupation:'Doctor',         employer:'Jordan Hospital',        monthlyIncome:6000, createdAt:now(), updatedAt:now() },
    { customerId:'C0007', name:'Khalid Al-Haddad',  nameAr:'خالد الحداد',   nationalId:'9098712345', nationality:'SY', dob:'1972-04-25', gender:'M', phone:'+962798765432', email:'k.haddad@email.com',      address:'Damascus, Syria',             riskLevel:'high',   kycStatus:'rejected', kycExpiryDate:'2024-04-25', pepStatus:false, sanctionStatus:true,  occupation:'Unknown',        employer:'Unknown',                monthlyIncome:0,    createdAt:now(), updatedAt:now() },
    { customerId:'C0008', name:'Rana Mahmoud',       nameAr:'رنا محمود',     nationalId:'9061234567', nationality:'JO', dob:'1999-12-03', gender:'F', phone:'+962792345678', email:'rana.mahmoud@email.com',  address:'67 University St, Irbid',     riskLevel:'low',    kycStatus:'pending',  kycExpiryDate:'2025-12-03', pepStatus:false, sanctionStatus:false, occupation:'Student',        employer:'University of Jordan',   monthlyIncome:300,  createdAt:now(), updatedAt:now() },
  ]);

  setCollection('alerts', [
    { alertId:uid(), type:'kyc_expiry',       severity:'high',     customerId:'C0002', customerName:'Sara Khalil',       message:'KYC documents will expire in 28 days',                    status:'open',         createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'kyc_expiry',       severity:'high',     customerId:'C0003', customerName:'Mohammed Al-Farsi', message:'KYC documents have expired',                              status:'open',         createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'pep_flag',         severity:'critical', customerId:'C0003', customerName:'Mohammed Al-Farsi', message:'Customer identified as Politically Exposed Person (PEP)',  status:'open',         createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'sanction_hit',     severity:'critical', customerId:'C0007', customerName:'Khalid Al-Haddad',  message:'Sanction list match detected',                            status:'open',         createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'kyc_expiry',       severity:'medium',   customerId:'C0005', customerName:'Omar Basim',        message:'KYC documents will expire in 45 days',                    status:'open',         createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'kyc_expiry',       severity:'medium',   customerId:'C0008', customerName:'Rana Mahmoud',      message:'KYC documents will expire in 50 days',                    status:'acknowledged', createdAt:now(), resolvedAt:null },
    { alertId:uid(), type:'document_missing', severity:'low',      customerId:'C0002', customerName:'Sara Khalil',       message:'Proof of address document is missing',                    status:'open',         createdAt:now(), resolvedAt:null },
  ]);

  setCollection('watchlist', [
    { entryId:uid(), name:'Khalid Haddad', aliases:['K. Haddad','Khaled Haddad'], nationality:'SY', dob:'1972-04-25', reason:'Terrorism financing',   listType:'internal', addedAt:now(), addedBy:'Compliance Officer' },
    { entryId:uid(), name:'Ahmad Zaidi',  aliases:[],                             nationality:'IR', dob:'1965-08-15', reason:'Money laundering',       listType:'UN',       addedAt:now(), addedBy:'System' },
    { entryId:uid(), name:'Tariq Mousa',  aliases:['T. Mousa'],                   nationality:'IQ', dob:'1970-02-10', reason:'Financial crime suspect', listType:'internal', addedAt:now(), addedBy:'Compliance Officer' },
  ]);

  setCollection('settings', { kycExpiryWarningDays:60, kycExpiryAlertDays:30, enablePEPScreening:true, enableSanctionScreen:true, autoAlertOnExpiry:true, defaultRiskLevel:'medium' });
  setCollection('documents', []);
  setCollection('audit', []);

  localStorage.setItem('kyc_seeded', '1');
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
export const customers = {
  list({ search = '', riskLevel = '', kycStatus = '', page = 1, limit = 20 } = {}) {
    let list = getCollection('customers');
    if (riskLevel) list = list.filter(c => c.riskLevel === riskLevel);
    if (kycStatus) list = list.filter(c => c.kycStatus === kycStatus);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(s) || (c.nameAr||'').includes(s) ||
        (c.nationalId||'').includes(s) || (c.customerId||'').toLowerCase().includes(s) ||
        (c.email||'').toLowerCase().includes(s)
      );
    }
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = list.length;
    const skip = (page - 1) * limit;
    return { data: list.slice(skip, skip + limit), total, page, limit };
  },

  get(customerId) {
    const c = getCollection('customers').find(c => c.customerId === customerId);
    if (!c) return null;
    return {
      ...c,
      documents: getCollection('documents').filter(d => d.customerId === customerId),
      alerts: getCollection('alerts').filter(a => a.customerId === customerId),
    };
  },

  create(data) {
    const all = getCollection('customers');
    if (all.find(c => c.nationalId === data.nationalId)) throw new Error('National ID already exists');
    const customerId = 'C' + String(all.length + 1).padStart(4, '0');
    const customer = { customerId, ...data, createdAt: now(), updatedAt: now() };
    setCollection('customers', [...all, customer]);
    _audit('CREATE_CUSTOMER', customerId, `Customer ${data.name} created`);
    return customer;
  },

  update(customerId, data) {
    const all = getCollection('customers');
    const idx = all.findIndex(c => c.customerId === customerId);
    if (idx === -1) throw new Error('Customer not found');
    const updated = { ...all[idx], ...data, customerId, updatedAt: now() };
    all[idx] = updated;
    setCollection('customers', all);
    _audit('UPDATE_CUSTOMER', customerId, `Customer ${customerId} updated`);
    return updated;
  },

  delete(customerId) {
    setCollection('customers', getCollection('customers').filter(c => c.customerId !== customerId));
    setCollection('documents', getCollection('documents').filter(d => d.customerId !== customerId));
    setCollection('alerts', getCollection('alerts').filter(a => a.customerId !== customerId));
  },
};

// ─── ALERTS ──────────────────────────────────────────────────────────────────
export const alertsStore = {
  list({ status = '', severity = '', type = '' } = {}) {
    let list = getCollection('alerts');
    if (status)   list = list.filter(a => a.status === status);
    if (severity) list = list.filter(a => a.severity === severity);
    if (type)     list = list.filter(a => a.type === type);
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  create(data) {
    const alert = { alertId: uid(), ...data, status: 'open', createdAt: now(), resolvedAt: null };
    setCollection('alerts', [...getCollection('alerts'), alert]);
    return alert;
  },

  acknowledge(alertId, officer = 'Compliance Officer') {
    const all = getCollection('alerts');
    const idx = all.findIndex(a => a.alertId === alertId);
    if (idx !== -1) { all[idx] = { ...all[idx], status: 'acknowledged', acknowledgedBy: officer, acknowledgedAt: now() }; setCollection('alerts', all); }
    return all[idx];
  },

  resolve(alertId, officer = 'Compliance Officer', resolution = '') {
    const all = getCollection('alerts');
    const idx = all.findIndex(a => a.alertId === alertId);
    if (idx !== -1) { all[idx] = { ...all[idx], status: 'resolved', resolvedBy: officer, resolvedAt: now(), resolution }; setCollection('alerts', all); }
    return all[idx];
  },

  delete(alertId) {
    setCollection('alerts', getCollection('alerts').filter(a => a.alertId !== alertId));
  },
};

// ─── WATCHLIST ────────────────────────────────────────────────────────────────
export const watchlistStore = {
  list(search = '') {
    let list = getCollection('watchlist');
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(s) || (e.aliases||[]).some(a => a.toLowerCase().includes(s)));
    }
    return [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  },

  add(data) {
    const entry = { entryId: uid(), ...data, addedAt: now() };
    setCollection('watchlist', [...getCollection('watchlist'), entry]);
    return entry;
  },

  delete(entryId) {
    setCollection('watchlist', getCollection('watchlist').filter(e => e.entryId !== entryId));
  },

  screenCustomer(customerId) {
    const c = customers.get(customerId);
    if (!c) throw new Error('Customer not found');
    const wl = getCollection('watchlist');
    const matches = [];
    for (const entry of wl) {
      const names = [entry.name, ...(entry.aliases||[])];
      const hit = names.find(n => c.name.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(c.name.toLowerCase()));
      if (hit) matches.push({ entry, matchedOn: hit });
    }
    if (matches.length > 0 && !c.sanctionStatus) {
      customers.update(customerId, { sanctionStatus: true, riskLevel: 'high' });
      alertsStore.create({ type: 'sanction_hit', severity: 'critical', customerId, customerName: c.name, message: `Watchlist match: ${matches.map(m=>m.matchedOn).join(', ')}` });
    }
    return { customerId, customerName: c.name, matches, screened: true, screenedAt: now() };
  },

  screenAll() {
    const all = getCollection('customers');
    const newMatches = [];
    for (const c of all) {
      const result = this.screenCustomer(c.customerId);
      if (result.matches.length > 0) newMatches.push({ customer: c.name, matchedEntry: result.matches[0].matchedOn });
    }
    return { screened: all.length, newMatches };
  },
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const reports = {
  summary() {
    const custs  = getCollection('customers');
    const alerts = getCollection('alerts');
    const wl     = getCollection('watchlist');
    const today  = new Date();
    const d30    = new Date(today.getTime() + 30 * 864e5);
    const d60    = new Date(today.getTime() + 60 * 864e5);
    const kycStatus  = custs.reduce((a,c)=>{ a[c.kycStatus]  = (a[c.kycStatus]  ||0)+1; return a; }, {});
    const riskLevels = custs.reduce((a,c)=>{ a[c.riskLevel]  = (a[c.riskLevel]  ||0)+1; return a; }, {});
    return {
      totalCustomers: custs.length, kycStatus, riskLevels,
      expiringIn30: custs.filter(c=>c.kycExpiryDate&&new Date(c.kycExpiryDate)<=d30&&new Date(c.kycExpiryDate)>today).length,
      expiringIn60: custs.filter(c=>c.kycExpiryDate&&new Date(c.kycExpiryDate)<=d60&&new Date(c.kycExpiryDate)>d30).length,
      openAlerts: alerts.filter(a=>a.status==='open').length,
      criticalAlerts: alerts.filter(a=>a.severity==='critical'&&a.status==='open').length,
      watchlistEntries: wl.length,
      pepCustomers: custs.filter(c=>c.pepStatus).length,
      sanctionedCustomers: custs.filter(c=>c.sanctionStatus).length,
    };
  },

  expiring(days = 60) {
    const cutoff = new Date(Date.now() + days * 864e5);
    return getCollection('customers')
      .filter(c => c.kycExpiryDate && new Date(c.kycExpiryDate) <= cutoff)
      .sort((a, b) => new Date(a.kycExpiryDate) - new Date(b.kycExpiryDate));
  },

  audit() { return [...getCollection('audit')].sort((a,b)=>b.timestamp.localeCompare(a.timestamp)); },
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const settingsStore = {
  get()       { return getCollection('settings') || {}; },
  save(data)  { setCollection('settings', { ...this.get(), ...data }); return this.get(); },
};

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
export const documentsStore = {
  list(customerId) { return getCollection('documents').filter(d => d.customerId === customerId); },

  async upload(customerId, file, type, expiryDate) {
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const doc = {
      documentId: uid(), customerId, type,
      originalName: file.name, filename: uid() + '.' + file.name.split('.').pop(),
      dataUrl: base64, size: file.size, mimeType: file.type,
      expiryDate: expiryDate || null,
      uploadedAt: now(), uploadedBy: 'Officer',
    };
    setCollection('documents', [...getCollection('documents'), doc]);
    return doc;
  },

  delete(documentId) {
    setCollection('documents', getCollection('documents').filter(d => d.documentId !== documentId));
  },
};

function _audit(action, customerId, details) {
  setCollection('audit', [...getCollection('audit'), { action, customerId, details, timestamp: now() }]);
}
