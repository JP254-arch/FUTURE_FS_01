require('dotenv').config();
const mongoose = require('mongoose');
const Admin    = require('./models/Admin');
const MenuItem = require('./models/MenuItem');

const menuItems = [
  // Antipasti
  { name: 'Burrata e Tartufo', nameIt: 'Burrata e Tartufo', description: 'Fresh burrata, black truffle shavings, Sicilian olive oil', price: 24, category: 'antipasti', tags: ['vegetarian'], order: 1 },
  { name: 'Carpaccio di Manzo', description: 'Wagyu beef, aged Parmigiano, wild rocket, truffle oil', price: 28, category: 'antipasti', order: 2 },
  { name: 'Polpo alla Griglia', description: 'Grilled Sardinian octopus, caperberries, preserved lemon', price: 22, category: 'antipasti', order: 3 },
  { name: 'Vitello Tonnato', description: 'Slow-roasted veal, tuna cream, salted capers, quail egg', price: 20, category: 'antipasti', order: 4 },
  { name: 'Crostini con Fegato', description: 'Chicken liver mousse, Vin Santo reduction, toasted sourdough', price: 16, category: 'antipasti', order: 5 },
  { name: 'Insalata di Mare', description: 'Amalfi seafood medley, citrus dressing, fresh herbs', price: 26, category: 'antipasti', tags: ['gluten-free'], order: 6 },
  // Primi
  { name: 'Tagliolini al Tartufo', description: 'Hand-cut egg pasta, white truffle butter, aged Parmigiano', price: 38, category: 'primi', tags: ['signature','vegetarian'], order: 1 },
  { name: 'Risotto allo Zafferano', description: 'Carnaroli rice, Milanese saffron, ossobuco, gremolata', price: 32, category: 'primi', tags: ['signature'], order: 2 },
  { name: 'Pappardelle al Cinghiale', description: 'Wild boar ragù, fresh pappardelle, juniper berries', price: 29, category: 'primi', order: 3 },
  { name: 'Spaghetti alle Vongole', description: 'Clams, white wine, chilli, wild garlic, spaghettoni', price: 27, category: 'primi', order: 4 },
  { name: 'Gnocchi di Patate', description: 'House-made gnocchi, black truffle, fontina cream', price: 30, category: 'primi', tags: ['vegetarian'], order: 5 },
  { name: 'Linguine all\'Aragosta', description: 'Brittany lobster, cherry tomato, basil, cognac bisque', price: 48, category: 'primi', tags: ['seasonal'], order: 6 },
  // Secondi
  { name: 'Filetto di Manzo', description: 'Dry-aged Fiorentina fillet, rosemary jus, crispy polenta', price: 58, category: 'secondi', tags: ['signature','gluten-free'], order: 1 },
  { name: 'Branzino all\'Acqua Pazza', description: 'Wild sea bass, cherry tomato, olives, capers, white wine', price: 44, category: 'secondi', tags: ['gluten-free'], order: 2 },
  { name: 'Agnello in Crosta', description: 'Herb-crusted rack of lamb, mint jelly, roasted aubergine', price: 52, category: 'secondi', order: 3 },
  { name: 'Piccione Arrosto', description: 'Roasted pigeon, Barolo reduction, black garlic, farro', price: 46, category: 'secondi', tags: ['seasonal'], order: 4 },
  // Dolci
  { name: 'Tiramisù della Casa', description: 'Our original recipe, Sicilian Marsala, Savoiardi, espresso', price: 14, category: 'dolci', tags: ['signature'], order: 1 },
  { name: 'Panna Cotta al Limone', description: 'Amalfi lemon curd, vanilla cream, candied zest', price: 12, category: 'dolci', tags: ['gluten-free'], order: 2 },
  { name: 'Cannolo Siciliano', description: 'Ricotta, candied orange, dark chocolate, pistachio dust', price: 13, category: 'dolci', order: 3 },
  { name: 'Fondente al Cioccolato', description: 'Valrhona 72% chocolate fondant, hazelnut gelato', price: 15, category: 'dolci', order: 4 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: 'Aurum Admin' });
    console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL}`);
  } else {
    console.log('ℹ️  Admin already exists, skipping');
  }

  // Seed menu
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany(menuItems);
    console.log(`✅ Seeded ${menuItems.length} menu items`);
  } else {
    console.log(`ℹ️  Menu already has ${count} items, skipping`);
  }

  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

seed().catch(err => { console.error(err); process.exit(1); });
