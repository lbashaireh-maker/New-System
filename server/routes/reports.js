const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.get('/summary', async (req, res) => {
  try {
    const [customers, alerts, watchlist] = await Promise.all([
      db.customers.findAsync({}),
      db.alerts.findAsync({}),
      db.watchlist.findAsync({}),
    ]);
    const today     = new Date();
    const d30       = new Date(today.getTime() + 30 * 864e5);
    const d60       = new Date(today.getTime() + 60 * 864e5);
    const exp30     = customers.filter(c => c.kycExpiryDate && new Date(c.kycExpiryDate) <= d30 && new Date(c.kycExpiryDate) > today).length;
    const exp60     = customers.filter(c => c.kycExpiryDate && new Date(c.kycExpiryDate) <= d60 && new Date(c.kycExpiryDate) > d30).length;
    const kycStatus = customers.reduce((a, c) => { a[c.kycStatus] = (a[c.kycStatus] || 0) + 1; return a; }, {});
    const riskLevels= customers.reduce((a, c) => { a[c.riskLevel]  = (a[c.riskLevel]  || 0) + 1; return a; }, {});
    res.json({
      totalCustomers: customers.length,
      kycStatus, riskLevels,
      expiringIn30: exp30, expiringIn60: exp60,
      openAlerts:     alerts.filter(a => a.status === 'open').length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length,
      watchlistEntries: watchlist.length,
      pepCustomers:       customers.filter(c => c.pepStatus).length,
      sanctionedCustomers:customers.filter(c => c.sanctionStatus).length,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/expiring', async (req, res) => {
  try {
    const { days = 60 } = req.query;
    const cutoff = new Date(Date.now() + parseInt(days) * 864e5);
    const customers = await db.customers.findAsync({});
    res.json(
      customers
        .filter(c => c.kycExpiryDate && new Date(c.kycExpiryDate) <= cutoff)
        .sort((a, b) => new Date(a.kycExpiryDate) - new Date(b.kycExpiryDate))
    );
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/risk-distribution', async (req, res) => {
  try {
    const customers = await db.customers.findAsync({});
    res.json(['low','medium','high'].map(level => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: customers.filter(c => c.riskLevel === level).length,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/audit', async (req, res) => {
  try {
    res.json(await db.auditLog.findAsync({}).sort({ timestamp: -1 }).limit(200));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
