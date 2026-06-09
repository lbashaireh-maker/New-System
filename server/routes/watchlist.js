const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const now = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let entries = await db.watchlist.findAsync({}).sort({ addedAt: -1 });
    if (search) {
      const s = search.toLowerCase();
      entries = entries.filter(e =>
        e.name.toLowerCase().includes(s) ||
        (e.aliases || []).some(a => a.toLowerCase().includes(s))
      );
    }
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const entry = { entryId: uuidv4(), ...req.body, addedAt: now() };
    res.status(201).json(await db.watchlist.insertAsync(entry));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/screen-all', async (req, res) => {
  try {
    const customers  = await db.customers.findAsync({});
    const watchlist  = await db.watchlist.findAsync({});
    const newMatches = [];

    for (const customer of customers) {
      for (const entry of watchlist) {
        const namesToCheck = [entry.name, ...(entry.aliases || [])];
        const hit = namesToCheck.some(n =>
          customer.name.toLowerCase().includes(n.toLowerCase()) ||
          n.toLowerCase().includes(customer.name.toLowerCase())
        );
        if (hit && !customer.sanctionStatus) {
          await db.customers.updateAsync({ customerId: customer.customerId }, { $set: { sanctionStatus: true, riskLevel: 'high', updatedAt: now() } }, {});
          const alert = { alertId: uuidv4(), type: 'sanction_hit', severity: 'critical', customerId: customer.customerId, customerName: customer.name, message: `Watchlist match: ${entry.name}`, status: 'open', createdAt: now(), resolvedAt: null };
          await db.alerts.insertAsync(alert);
          newMatches.push({ customer: customer.name, matchedEntry: entry.name });
        }
      }
    }
    res.json({ screened: customers.length, newMatches });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/screen/:customerId', async (req, res) => {
  try {
    const customer = await db.customers.findOneAsync({ customerId: req.params.customerId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const watchlist = await db.watchlist.findAsync({});
    const matches   = [];
    for (const entry of watchlist) {
      const namesToCheck = [entry.name, ...(entry.aliases || [])];
      const matched = namesToCheck.find(n =>
        customer.name.toLowerCase().includes(n.toLowerCase()) ||
        n.toLowerCase().includes(customer.name.toLowerCase())
      );
      if (matched) matches.push({ entry, matchedOn: matched });
    }
    if (matches.length > 0 && !customer.sanctionStatus) {
      await db.customers.updateAsync({ customerId: customer.customerId }, { $set: { sanctionStatus: true, riskLevel: 'high', updatedAt: now() } }, {});
      await db.alerts.insertAsync({ alertId: uuidv4(), type: 'sanction_hit', severity: 'critical', customerId: customer.customerId, customerName: customer.name, message: `Watchlist match: ${matches.map(m => m.matchedOn).join(', ')}`, status: 'open', createdAt: now(), resolvedAt: null });
    }
    res.json({ customerId: customer.customerId, customerName: customer.name, matches, screened: true, screenedAt: now() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:entryId', async (req, res) => {
  try {
    await db.watchlist.removeAsync({ entryId: req.params.entryId }, {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
