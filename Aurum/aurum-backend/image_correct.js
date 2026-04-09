// fix-gallery-urls.js — run once with: node fix-gallery-urls.js
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const GalleryImage = require('./models/GalleryImage');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const images = await GalleryImage.find();
  for (const img of images) {
    if (img.url.startsWith('http')) {
      const relative = img.url.replace(/^https?:\/\/[^/]+/, '');
      await GalleryImage.findByIdAndUpdate(img._id, { url: relative });
      console.log(`Fixed: ${img.url} → ${relative}`);
    }
  }
  console.log('Done');
  mongoose.disconnect();
});