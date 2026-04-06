/* ═══════════════════════════════════════════════
   AURUM — Home Page JavaScript
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Open/closed badge in hero
  renderOpenBadge(document.getElementById('hero-status'), 'milan');

  // ── Featured dishes from API
  loadFeaturedDishes();

  // ── Gallery mosaic from API
  loadGalleryMosaic();
});

// ── FEATURED DISHES ──────────────────────────────────────
async function loadFeaturedDishes() {
  const container = document.getElementById('featured-dishes');
  try {
    const data = await api.get('/api/menu');
    if (!data.success) throw new Error();

    // Pick 1 signature from antipasti, primi, secondi
    const picks = [];
    ['antipasti', 'primi', 'secondi'].forEach(cat => {
      const catItems = data.menu[cat] || [];
      const sig = catItems.find(i => i.tags?.includes('signature')) || catItems[0];
      if (sig) picks.push({ ...sig, category: cat });
    });

    if (!picks.length) throw new Error();

    container.innerHTML = picks.map(item => `
      <div class="dish-card reveal">
        <span class="dish-category">${item.category}</span>
        <div class="dish-name">${item.name}</div>
        <p class="dish-desc">${item.description}</p>
        <div class="dish-price">€${item.price.toFixed(2)}</div>
      </div>`).join('');

    // Re-observe new elements
    container.querySelectorAll('.reveal').forEach(el => {
      new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.1 }).observe(el);
    });

  } catch {
    // Static fallback
    container.innerHTML = [
      { cat: 'Antipasti', name: 'Burrata e Tartufo',     desc: 'Fresh burrata, black truffle, Sicilian olive oil', price: '€24' },
      { cat: 'Primi',     name: 'Tagliolini al Tartufo', desc: 'Hand-cut egg pasta, white truffle butter, Parmigiano', price: '€38' },
      { cat: 'Secondi',   name: 'Filetto di Manzo',      desc: 'Dry-aged Fiorentina fillet, rosemary jus, crispy polenta', price: '€58' },
    ].map(item => `
      <div class="dish-card reveal">
        <span class="dish-category">${item.cat}</span>
        <div class="dish-name">${item.name}</div>
        <p class="dish-desc">${item.desc}</p>
        <div class="dish-price">${item.price}</div>
      </div>`).join('');
  }
}

// ── GALLERY MOSAIC ───────────────────────────────────────
async function loadGalleryMosaic() {
  const container = document.getElementById('gallery-mosaic');
  try {
    const data = await api.get('/api/gallery?featured=true');
    if (!data.success || !data.images.length) return;

    const classes = ['mosaic-large', '', '', 'mosaic-wide', ''];
    container.innerHTML = data.images.slice(0, 5).map((img, i) => `
      <div class="mosaic-item ${classes[i] || ''}">
        <div class="mosaic-inner">
          <img src="${img.url}" alt="${img.title}" loading="lazy">
        </div>
        <div class="mosaic-overlay"><span>View</span></div>
      </div>`).join('');
  } catch {}
}
