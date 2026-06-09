const Datastore = require('@seald-io/nedb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../data');

const db = {
  customers: new Datastore({ filename: path.join(dataDir, 'customers.db'), autoload: true }),
  alerts:    new Datastore({ filename: path.join(dataDir, 'alerts.db'),    autoload: true }),
  watchlist: new Datastore({ filename: path.join(dataDir, 'watchlist.db'), autoload: true }),
  documents: new Datastore({ filename: path.join(dataDir, 'documents.db'), autoload: true }),
  settings:  new Datastore({ filename: path.join(dataDir, 'settings.db'),  autoload: true }),
  auditLog:  new Datastore({ filename: path.join(dataDir, 'audit.db'),     autoload: true }),
};

db.customers.ensureIndex({ fieldName: 'customerId', unique: true });
db.customers.ensureIndex({ fieldName: 'nationalId', unique: true });

const now = () => new Date().toISOString();

async function seed() {
  if (await db.customers.countAsync({}) > 0) return;

  await db.customers.insertAsync([
    { customerId:'C0001', name:'Ahmad Al-Rashid',    nameAr:'أحمد الراشد',    nationalId:'9012345678', nationality:'JO', dob:'1985-03-15', gender:'M', phone:'+962791234567', email:'ahmad.rashid@email.com',  address:'123 King Hussein St, Amman',    riskLevel:'low',    kycStatus:'verified',  kycExpiryDate:'2026-03-15', pepStatus:false, sanctionStatus:false, occupation:'Engineer',      employer:'ZAIN',                    monthlyIncome:2500, createdAt:now(), updatedAt:now() },
    { customerId:'C0002', name:'Sara Khalil',        nameAr:'سارة خليل',      nationalId:'9087654321', nationality:'JO', dob:'1992-07-22', gender:'F', phone:'+962797654321', email:'sara.khalil@email.com',   address:'45 Queen Nour St, Zarqa',       riskLevel:'medium', kycStatus:'pending',   kycExpiryDate:'2025-07-22', pepStatus:false, sanctionStatus:false, occupation:'Business Owner', employer:'Self-employed',           monthlyIncome:5000, createdAt:now(), updatedAt:now() },
    { customerId:'C0003', name:'Mohammed Al-Farsi',  nameAr:'محمد الفارسي',   nationalId:'9055512345', nationality:'SA', dob:'1978-11-08', gender:'M', phone:'+962796543210', email:'m.farsi@email.com',       address:'Riyadh, Saudi Arabia',          riskLevel:'high',   kycStatus:'expired',   kycExpiryDate:'2024-11-08', pepStatus:true,  sanctionStatus:false, occupation:'Politician',     employer:'Government',              monthlyIncome:8000, createdAt:now(), updatedAt:now() },
    { customerId:'C0004', name:'Layla Nasser',       nameAr:'ليلى ناصر',      nationalId:'9033398765', nationality:'JO', dob:'1995-01-30', gender:'F', phone:'+962793456789', email:'layla.nasser@email.com',  address:'78 Prince Hamza St, Irbid',     riskLevel:'low',    kycStatus:'verified',  kycExpiryDate:'2027-01-30', pepStatus:false, sanctionStatus:false, occupation:'Teacher',        employer:'Ministry of Education',   monthlyIncome:1200, createdAt:now(), updatedAt:now() },
    { customerId:'C0005', name:'Omar Basim',         nameAr:'عمر باسم',       nationalId:'9044421890', nationality:'JO', dob:'1980-06-17', gender:'M', phone:'+962799876543', email:'omar.basim@email.com',    address:'12 Al-Urdon St, Aqaba',         riskLevel:'medium', kycStatus:'verified',  kycExpiryDate:'2025-10-01', pepStatus:false, sanctionStatus:false, occupation:'Trader',         employer:'Al-Basim Trading',        monthlyIncome:4000, createdAt:now(), updatedAt:now() },
    { customerId:'C0006', name:'Nadia Suleiman',     nameAr:'نادية سليمان',   nationalId:'9076543210', nationality:'JO', dob:'1988-09-12', gender:'F', phone:'+962795432198', email:'nadia.suleiman@email.com', address:'33 Wasfi Al-Tal St, Amman',    riskLevel:'low',    kycStatus:'verified',  kycExpiryDate:'2026-09-12', pepStatus:false, sanctionStatus:false, occupation:'Doctor',         employer:'Jordan Hospital',         monthlyIncome:6000, createdAt:now(), updatedAt:now() },
    { customerId:'C0007', name:'Khalid Al-Haddad',   nameAr:'خالد الحداد',    nationalId:'9098712345', nationality:'SY', dob:'1972-04-25', gender:'M', phone:'+962798765432', email:'k.haddad@email.com',      address:'Damascus, Syria',               riskLevel:'high',   kycStatus:'rejected',  kycExpiryDate:'2024-04-25', pepStatus:false, sanctionStatus:true,  occupation:'Unknown',        employer:'Unknown',                 monthlyIncome:0,    createdAt:now(), updatedAt:now() },
    { customerId:'C0008', name:'Rana Mahmoud',       nameAr:'رنا محمود',      nationalId:'9061234567', nationality:'JO', dob:'1999-12-03', gender:'F', phone:'+962792345678', email:'rana.mahmoud@email.com',  address:'67 University St, Irbid',       riskLevel:'low',    kycStatus:'pending',   kycExpiryDate:'2025-12-03', pepStatus:false, sanctionStatus:false, occupation:'Student',        employer:'University of Jordan',    monthlyIncome:300,  createdAt:now(), updatedAt:now() },
  ]);

  await db.alerts.insertAsync([
    { alertId:uuidv4(), type:'kyc_expiry',      severity:'high',     customerId:'C0002', customerName:'Sara Khalil',       message:'KYC documents will expire in 28 days',                   status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
    { alertId:uuidv4(), type:'kyc_expiry',      severity:'high',     customerId:'C0003', customerName:'Mohammed Al-Farsi', message:'KYC documents have expired',                             status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
    { alertId:uuidv4(), type:'pep_flag',        severity:'critical', customerId:'C0003', customerName:'Mohammed Al-Farsi', message:'Customer identified as Politically Exposed Person (PEP)', status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
    { alertId:uuidv4(), type:'sanction_hit',    severity:'critical', customerId:'C0007', customerName:'Khalid Al-Haddad',  message:'Sanction list match detected',                           status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
    { alertId:uuidv4(), type:'kyc_expiry',      severity:'medium',   customerId:'C0005', customerName:'Omar Basim',        message:'KYC documents will expire in 45 days',                   status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
    { alertId:uuidv4(), type:'kyc_expiry',      severity:'medium',   customerId:'C0008', customerName:'Rana Mahmoud',      message:'KYC documents will expire in 50 days',                   status:'acknowledged', createdAt:now(), resolvedAt:null, resolvedBy:'Officer A' },
    { alertId:uuidv4(), type:'document_missing',severity:'low',      customerId:'C0002', customerName:'Sara Khalil',       message:'Proof of address document is missing',                   status:'open',         createdAt:now(), resolvedAt:null, resolvedBy:null },
  ]);

  await db.watchlist.insertAsync([
    { entryId:uuidv4(), name:'Khalid Haddad', aliases:['K. Haddad','Khaled Haddad'], nationality:'SY', dob:'1972-04-25', reason:'Terrorism financing',   listType:'internal', addedAt:now(), addedBy:'Compliance Officer' },
    { entryId:uuidv4(), name:'Ahmad Zaidi',  aliases:[],                             nationality:'IR', dob:'1965-08-15', reason:'Money laundering',       listType:'UN',       addedAt:now(), addedBy:'System' },
    { entryId:uuidv4(), name:'Tariq Mousa',  aliases:['T. Mousa'],                   nationality:'IQ', dob:'1970-02-10', reason:'Financial crime suspect', listType:'internal', addedAt:now(), addedBy:'Compliance Officer' },
  ]);

  await db.settings.insertAsync([
    { key:'kycExpiryWarningDays',  value:60,       label:'KYC Expiry Warning (days)',      type:'number'  },
    { key:'kycExpiryAlertDays',    value:30,       label:'KYC Expiry Alert (days)',        type:'number'  },
    { key:'enablePEPScreening',    value:true,     label:'Enable PEP Screening',          type:'boolean' },
    { key:'enableSanctionScreen',  value:true,     label:'Enable Sanction Screening',     type:'boolean' },
    { key:'autoAlertOnExpiry',     value:true,     label:'Auto-generate Expiry Alerts',   type:'boolean' },
    { key:'defaultRiskLevel',      value:'medium', label:'Default Risk Level for New Customers', type:'select'  },
  ]);
}

seed().catch(console.error);

module.exports = db;
