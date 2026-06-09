const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const db      = require('../database');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.pdf','.jpg','.jpeg','.png'].includes(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only PDF, JPG, PNG files are allowed'));
  },
});

router.get('/:customerId', async (req, res) => {
  try {
    res.json(await db.documents.findAsync({ customerId: req.params.customerId }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/upload/:customerId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const doc = {
      documentId:   uuidv4(),
      customerId:   req.params.customerId,
      type:         req.body.type || 'other',
      originalName: req.file.originalname,
      filename:     req.file.filename,
      path:         `/uploads/${req.file.filename}`,
      size:         req.file.size,
      mimeType:     req.file.mimetype,
      expiryDate:   req.body.expiryDate || null,
      uploadedAt:   new Date().toISOString(),
      uploadedBy:   req.body.uploadedBy || 'Officer',
    };
    res.status(201).json(await db.documents.insertAsync(doc));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:documentId', async (req, res) => {
  try {
    const doc = await db.documents.findOneAsync({ documentId: req.params.documentId });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const fp = path.join(uploadsDir, doc.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await db.documents.removeAsync({ documentId: req.params.documentId }, {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
