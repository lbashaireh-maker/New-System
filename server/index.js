const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(__dirname, '../uploads');
[dataDir, uploadsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4173'] }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/customers',  require('./routes/customers'));
app.use('/api/alerts',     require('./routes/alerts'));
app.use('/api/watchlist',  require('./routes/watchlist'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/documents',  require('./routes/documents'));
app.use('/api/settings',   require('./routes/settings'));

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`\n🏦  KYC Watch running on http://localhost:${PORT}\n`));
