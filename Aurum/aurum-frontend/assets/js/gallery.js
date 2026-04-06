/* ═══════════════════════════════════════════════
   AURUM — Gallery Page JavaScript
   ═══════════════════════════════════════════════ */

let allImages = [];
let filtered  = [];
let currentIdx = 0;

// Fallback static gallery when API has no images
const FALLBACK_ITEMS = [
  { title: 'The Dining Room', caption: 'Milan, Via della Luce', category: 'dining',   height: 'tall' },
  { title: 'Burrata e Tartufo', caption: 'Antipasti',           category: 'food',     height: 'medium' },
  { title: 'The Wine Cellar',   caption: 'Over 200 labels',     category: 'dining',   height: 'short' },
  { title: 'Chef\'s Table',     caption: 'Private dining',      category: 'kitchen',  height: 'medium' },
  { title: 'Tagliolini',        caption: 'Pasta fresca',        category: 'food',     height: 'tall' },
  { title: 'La Terrazza',       caption: 'Paris rooftop',       category: 'exterior', height: 'medium' },
  { title: 'Tiramisù',          caption: 'Dolci della casa',    category: 'food',     height: 'short' },
  { title: 'Evening Service',   caption: 'The full room',       category: 'dining',   height: 'medium' },
  { title: 'Mise en Place',     caption: 'Morning preparation', category: 'kitchen',  height: 'tall' },
];

function renderGallery(images) {
  const grid = document.getElementById('gallery-grid');

  if (!images.length) {
    // Placeholder state (no real uploads yet)
    grid.innerHTML = FALLBACK_ITEMS.map(item => `
      <div class="gallery-placeholder-item ${item.height}" data-cat="${item.category}">
        <span>${item.title}</span>
      </div>`).join('');
    return;
  }

  grid.innerHTML = images.map((img, i) => `
    <div class="gallery-thumb" data-cat="${img.category}" data-idx="${i}">
      <img src="${img.url}" alt="${img.title}" loading="lazy">
      <div class="gallery-thumb-overlay">
        <span class="gallery-thumb-view">View</span>
        <span class="gallery-thumb-cat">${img.category}</span>
      </div>
    </div>`).join('');

  // Attach lightbox listeners
  grid.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => openLightbox(parseInt(thumb.dataset.idx)));
  });
}

function applyFilter(cat) {
  filtered = cat === 'all' ? [...allImages] : allImages.filter(img => img.category === cat);
  renderGallery(filtered);
}

async function loadGallery() {
  try {
    const data = await api.get('/api/gallery');
    if (!data.success) throw new Error();
    allImages = data.images;
    filtered  = [...allImages];
    renderGallery(filtered);
  } catch {
    allImages = [];
    filtered  = [];
    renderGallery([]);
  }
}

// ── LIGHTBOX ─────────────────────────────────────────────
function openLightbox(idx) {
  currentIdx = idx;
  showLightboxImage();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function showLightboxImage() {
  const img = filtered[currentIdx];
  if (!img) return;
  document.getElementById('lb-img').src     = img.url;
  document.getElementById('lb-img').alt     = img.title;
  document.getElementById('lb-caption').textContent = img.title + (img.caption ? ` — ${img.caption}` : '');
}

function prevImage() {
  currentIdx = (currentIdx - 1 + filtered.length) % filtered.length;
  showLightboxImage();
}
function nextImage() {
  currentIdx = (currentIdx + 1) % filtered.length;
  showLightboxImage();
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadGallery();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.cat);
    });
  });

  // Lightbox controls
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', prevImage);
  document.getElementById('lb-next').addEventListener('click', nextImage);

  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape')    closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight')nextImage();
  });
});
