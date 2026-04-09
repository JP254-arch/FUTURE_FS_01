require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const GalleryImage = require('./models/GalleryImage');

async function fixUrls() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const images = await GalleryImage.find();
  console.log(`Found ${images.length} images`);

  let fixed = 0;
  for (const img of images) {
    if (img.url && img.url.startsWith('http://')) {
      img.url = img.url.replace('http://', 'https://');
      await img.save();
      fixed++;
      console.log(`Fixed: ${img.url}`);
    }
  }

  console.log(`✅ Fixed ${fixed} image URLs`);
  await mongoose.disconnect();
}

fixUrls().catch(err => { console.error(err); process.exit(1); });