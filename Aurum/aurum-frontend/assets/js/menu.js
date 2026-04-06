/* ═══════════════════════════════════════════════
   AURUM — Menu Page JavaScript
   ═══════════════════════════════════════════════ */

const CAT_LABELS = {
  antipasti: 'Antipasti',
  primi:     'Primi Piatti',
  secondi:   'Secondi',
  dolci:     'Dolci',
  bevande:   'Bevande',
};

const TAG_MAP = {
  signature:    '<span class="tag-pill tag-signature">★ Signature</span>',
  seasonal:     '<span class="tag-pill tag-seasonal">◎ Seasonal</span>',
  vegetarian:   '<span class="tag-pill tag-vegetarian">◆ Vegetarian</span>',
  'gluten-free':'<span class="tag-pill tag-gluten-free">◈ GF</span>',
};

// Static fallback menu
const FALLBACK = {
  antipasti: [
    { name: 'Burrata e Tartufo',   description: 'Fresh burrata, black truffle shavings, Sicilian olive oil',            price: 24, tags: ['vegetarian'] },
    { name: 'Carpaccio di Manzo',  description: 'Wagyu beef, aged Parmigiano, wild rocket, truffle oil',               price: 28, tags: [] },
    { name: 'Polpo alla Griglia',  description: 'Grilled Sardinian octopus, caperberries, preserved lemon',            price: 22, tags: ['gluten-free'] },
    { name: 'Vitello Tonnato',     description: 'Slow-roasted veal, tuna cream, salted capers, quail egg',             price: 20, tags: [] },
    { name: 'Crostini con Fegato', description: 'Chicken liver mousse, Vin Santo reduction, toasted sourdough',        price: 16, tags: [] },
    { name: 'Insalata di Mare',    description: 'Amalfi seafood medley, citrus dressing, fresh herbs',                 price: 26, tags: ['gluten-free'] },
  ],
  primi: [
    { name: 'Tagliolini al Tartufo',  description: 'Hand-cut egg pasta, white truffle butter, aged Parmigiano',        price: 38, tags: ['signature','vegetarian'] },
    { name: 'Risotto allo Zafferano', description: 'Carnaroli rice, Milanese saffron, ossobuco, gremolata',            price: 32, tags: ['signature'] },
    { name: 'Pappardelle al Cinghiale',description: 'Wild boar ragù, fresh pappardelle, juniper berries',             price: 29, tags: [] },
    { name: 'Spaghetti alle Vongole', description: 'Clams, white wine, chilli, wild garlic, spaghettoni',             price: 27, tags: [] },
    { name: 'Gnocchi di Patate',      description: 'House-made gnocchi, black truffle, fontina cream',                price: 30, tags: ['vegetarian'] },
    { name: 'Linguine all\'Aragosta', description: 'Brittany lobster, cherry tomato, basil, cognac bisque',           price: 48, tags: ['seasonal'] },
  ],
  secondi: [
    { name: 'Filetto di Manzo',        description: 'Dry-aged Fiorentina fillet, rosemary jus, crispy polenta',        price: 58, tags: ['signature','gluten-free'] },
    { name: 'Branzino all\'Acqua Pazza',description: 'Wild sea bass, cherry tomato, olives, capers, white wine',       price: 44, tags: ['gluten-free'] },
    { name: 'Agnello in Crosta',       description: 'Herb-crusted rack of lamb, mint jelly, roasted aubergine',        price: 52, tags: [] },
    { name: 'Piccione Arrosto',        description: 'Roasted pigeon, Barolo reduction, black garlic, farro',           price: 46, tags: ['seasonal'] },
  ],
  dolci: [
    { name: 'Tiramisù della Casa',     description: 'Our original recipe, Sicilian Marsala, Savoiardi, espresso',      price: 14, tags: ['signature'] },
    { name: 'Panna Cotta al Limone',   description: 'Amalfi lemon curd, vanilla cream, candied zest',                 price: 12, tags: ['gluten-free'] },
    { name: 'Cannolo Siciliano',       description: 'Ricotta, candied orange, dark chocolate, pistachio dust',         price: 13, tags: [] },
    { name: 'Fondente al Cioccolato',  description: 'Valrhona 72% chocolate fondant, hazelnut gelato',                price: 15, tags: [] },
  ],
  bevande: [
    { name: 'Spritz Aurum',            description: 'House aperol, prosecco, orange, gold dust rimmed',               price: 14, tags: [] },
    { name: 'Negroni Classico',        description: 'Campari, gin, vermouth rosso, orange peel',                      price: 16, tags: [] },
    { name: 'Acqua Minerale',          description: 'Sparkling or still, 750ml',                                      price:  6, tags: [] },
    { name: 'Espresso & Caffè',        description: 'Single, doppio, macchiato, or lungo',                            price:  5, tags: [] },
  ],
};

function renderTags(tags = []) {
  return tags.filter(t => TAG_MAP[t]).map(t => TAG_MAP[t]).join('');
}

function renderItems(items) {
  if (!items?.length) return '<p style="color:var(--gray);padding:2rem 0;font-size:0.8rem;">No items available.</p>';
  return `<div class="menu-items-grid">
    ${items.map(item => `
      <div class="menu-item">
        <div class="menu-item-info">
          <div class="menu-item-header">
            <span class="menu-item-name">${item.name}</span>
            ${renderTags(item.tags)}
          </div>
          <div class="menu-item-desc">${item.description}</div>
        </div>
        <div class="menu-item-price">€${Number(item.price).toFixed(2)}</div>
      </div>`).join('')}
  </div>`;
}

function buildPanels(menuData) {
  const panelsEl = document.getElementById('menu-panels');
  const tabsEl   = document.getElementById('menu-tabs');
  const cats     = Object.keys(menuData);

  // Sync tabs — remove tabs with no data
  tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
    if (!cats.includes(btn.dataset.tab)) btn.style.display = 'none';
  });

  panelsEl.innerHTML = cats.map((cat, i) => `
    <div class="menu-panel ${i === 0 ? 'active' : ''}" id="tab-${cat}">
      <div class="menu-category-title">${CAT_LABELS[cat] || cat}</div>
      ${renderItems(menuData[cat])}
    </div>`).join('');

  // Tab click handlers
  tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      panelsEl.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

async function loadMenu() {
  try {
    const data = await api.get('/api/menu');
    if (!data.success || !Object.keys(data.menu).length) throw new Error();
    buildPanels(data.menu);
  } catch {
    buildPanels(FALLBACK);
  }
}

document.addEventListener('DOMContentLoaded', loadMenu);
