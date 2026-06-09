const express = require('express');
const router = express.Router();
const db = require('../database');

const now = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const { search, riskLevel, kycStatus, page = 1, limit = 20 } = req.query;
    let query = {};
    if (riskLevel) query.riskLevel = riskLevel;
    if (kycStatus) query.kycStatus = kycStatus;

    let customers = await db.customers.findAsync(query).sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        (c.nameAr || '').includes(s) ||
        (c.nationalId || '').includes(s) ||
        (c.customerId || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s)
      );
    }

    const total = customers.length;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const data  = customers.slice(skip, skip + parseInt(limit));

    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:customerId', async (req, res) => {
  try {
    const customer = await db.customers.findOneAsync({ customerId: req.params.customerId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const documents = await db.documents.findAsync({ customerId: req.params.customerId });
    const alerts    = await db.alerts.findAsync({ customerId: req.params.customerId });
    res.json({ ...customer, documents, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const count = await db.customers.countAsync({});
    const customerId = `C${String(count + 1).padStart(4, '0')}`;
    const customer = { customerId, ...req.body, createdAt: now(), updatedAt: now() };
    const created = await db.customers.insertAsync(customer);
    await db.auditLog.insertAsync({ action: 'CREATE_CUSTOMER', customerId, details: `Customer ${customer.name} created`, timestamp: now() });
    res.status(201).json(created);
  } catch (err) {
    if (err.errorType === 'uniqueViolated') return res.status(409).json({ error: 'National ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = { ...req.body, updatedAt: now() };
    delete updates.customerId; delete updates._id;
    const n = await db.customers.updateAsync({ customerId }, { $set: updates }, {});
    if (n === 0) return res.status(404).json({ error: 'Customer not found' });
    await db.auditLog.insertAsync({ action: 'UPDATE_CUSTOMER', customerId, details: `Customer ${customerId} updated`, timestamp: now() });
    res.json(await db.customers.findOneAsync({ customerId }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const n = await db.customers.removeAsync({ customerId }, {});
    if (n === 0) return res.status(404).json({ error: 'Customer not found' });
    await db.documents.removeAsync({ customerId }, { multi: true });
    await db.alerts.removeAsync({ customerId }, { multi: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
