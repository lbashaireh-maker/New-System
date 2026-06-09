const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const now = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const { status, severity, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    res.json(await db.alerts.findAsync(query).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const alert = { alertId: uuidv4(), ...req.body, status: 'open', createdAt: now(), resolvedAt: null };
    res.status(201).json(await db.alerts.insertAsync(alert));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:alertId/acknowledge', async (req, res) => {
  try {
    await db.alerts.updateAsync(
      { alertId: req.params.alertId },
      { $set: { status: 'acknowledged', acknowledgedBy: req.body.officer || 'Officer', acknowledgedAt: now() } }, {});
    res.json(await db.alerts.findOneAsync({ alertId: req.params.alertId }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:alertId/resolve', async (req, res) => {
  try {
    await db.alerts.updateAsync(
      { alertId: req.params.alertId },
      { $set: { status: 'resolved', resolvedBy: req.body.officer || 'Officer', resolvedAt: now(), resolution: req.body.resolution || '' } }, {});
    res.json(await db.alerts.findOneAsync({ alertId: req.params.alertId }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:alertId', async (req, res) => {
  try {
    await db.alerts.removeAsync({ alertId: req.params.alertId }, {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
