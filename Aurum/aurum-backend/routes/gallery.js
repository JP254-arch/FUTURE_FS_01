const express  = require('express');
const router   = express.Router();
const GalleryImage = require('../models/GalleryImage');
const auth     = require('../middleware/auth');
const { galleryUpload } = require('../middleware/upload');
const fs       = require('fs');
const path     = require('path');

// GET /api/gallery — public
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gallery — admin, upload image
router.post('/', auth, galleryUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Image file required' });
  try {
    const { title, caption, category, featured, order } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const image = await GalleryImage.create({
      title: title || req.file.originalname,
      caption,
      filename: req.file.filename,
      url: `${baseUrl}/uploads/gallery/${req.file.filename}`,
      category: category || 'food',
      featured: featured === 'true',
      order: parseInt(order) || 0,
    });
    res.status(201).json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/gallery/:id — admin, update metadata
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, caption, category, featured, order } = req.body;
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { title, caption, category, featured: featured === 'true', order: parseInt(order) || 0 },
      { new: true }
    );
    if (!image) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/gallery/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Not found' });
    const filePath = path.join(__dirname, '..', 'uploads', 'gallery', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
