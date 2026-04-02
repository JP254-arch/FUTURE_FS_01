const express    = require('express');
const router     = express.Router();
const { body, validationResult } = require('express-validator');
const MenuItem   = require('../models/MenuItem');
const auth       = require('../middleware/auth');
const { menuUpload } = require('../middleware/upload');
const fs         = require('fs');
const path       = require('path');

// GET /api/menu — public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { available: true };
    if (category) filter.category = category;
    const items = await MenuItem.find(filter).sort({ category: 1, order: 1 });
    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ success: true, menu: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/menu/all — admin, includes unavailable
router.get('/all', auth, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/menu — admin, create item
router.post('/', auth, menuUpload.single('image'), [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').isIn(['antipasti','primi','secondi','dolci','bevande']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const data = { ...req.body, price: parseFloat(req.body.price) };
    if (req.file) {
      data.image = `/uploads/menu/${req.file.filename}`;
    }
    if (req.body.tags && typeof req.body.tags === 'string') data.tags = JSON.parse(req.body.tags);
    if (req.body.allergens && typeof req.body.allergens === 'string') data.allergens = JSON.parse(req.body.allergens);
    const item = await MenuItem.create(data);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/menu/:id — admin, update
router.put('/:id', auth, menuUpload.single('image'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.body.price) update.price = parseFloat(req.body.price);
    if (req.file) update.image = `/uploads/menu/${req.file.filename}`;
    if (req.body.tags && typeof req.body.tags === 'string') update.tags = JSON.parse(req.body.tags);
    if (req.body.allergens && typeof req.body.allergens === 'string') update.allergens = JSON.parse(req.body.allergens);
    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/menu/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    if (item.image) {
      const filePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
