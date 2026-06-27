const express = require('express');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

router.post('/images', authenticate, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  const files = req.files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
  }));
  res.json({ files });
});

module.exports = router;
