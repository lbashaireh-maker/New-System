const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.get('/', async (req, res) => {
  try {
    const rows = await db.settings.findAsync({});
    res.json(rows.reduce((a, s) => { a[s.key] = s.value; return a; }, {}));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/full', async (req, res) => {
  try {
    res.json(await db.settings.findAsync({}));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.settings.updateAsync({ key }, { $set: { value } }, { upsert: true });
    }
    const rows = await db.settings.findAsync({});
    res.json(rows.reduce((a, s) => { a[s.key] = s.value; return a; }, {}));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
