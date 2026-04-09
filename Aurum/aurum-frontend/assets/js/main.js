/* ═══════════════════════════════════════════════
   AURUM RISTORANTE — Shared JavaScript
   Loaded on every page
   ═══════════════════════════════════════════════ */

// ── API CONFIG ───────────────────────────────────────────
const API_BASE = "https://aurum-30eg.onrender.com";

// ── API HELPER ───────────────────────────────────────────
const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`);
    return res.json();
  },
  // Now returns { status, data } so callers can check HTTP status codes
  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { status: res.status, data };
  },
};

// ── NAV HTML (injected into every page) ─────────────────
const NAV_HTML = `
<nav id="navbar">
  <a class="nav-logo" href="/index.html">Aurum <span>Ristorante</span></a>
  <ul class="nav-links">
    <li><a href="/index.html"      data-page="home">Home</a></li>
    <li><a href="/pages/about.html"    data-page="about">Our Story</a></li>
    <li><a href="/pages/menu.html"     data-page="menu">Menu</a></li>
    <li><a href="/pages/gallery.html"  data-page="gallery">Gallery</a></li>
    <li><a href="/pages/contact.html"  data-page="contact">Contact</a></li>
  </ul>
  <a class="nav-reserve" href="/pages/contact.html">Reserve a Table</a>
  <button class="nav-hamburger" id="hamburger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="nav-drawer" id="nav-drawer">
  <a href="/index.html">Home</a>
  <a href="/pages/about.html">Our Story</a>
  <a href="/pages/menu.html">Menu</a>
  <a href="/pages/gallery.html">Gallery</a>
  <a href="/pages/contact.html">Contact</a>
  <a href="/pages/contact.html" class="nav-reserve-mobile">Reserve a Table</a>
</div>`;

// ── FOOTER HTML ──────────────────────────────────────────
const FOOTER_HTML = `
<footer>
  <div class="footer-grid">
    <div>
      <div class="footer-brand-name">Aurum</div>
      <div class="footer-tagline">Ristorante · Est. 2012</div>
      <p class="footer-desc">Italian fine dining at its most refined. Ingredients sourced from family-owned farms in Tuscany, Sardinia and the Amalfi Coast.</p>
    </div>
    <div>
      <div class="footer-col-title">Navigate</div>
      <ul class="footer-links-list">
        <li><a href="/index.html">Home</a></li>
        <li><a href="/pages/about.html">Our Story</a></li>
        <li><a href="/pages/menu.html">Menu</a></li>
        <li><a href="/pages/gallery.html">Gallery</a></li>
        <li><a href="/pages/contact.html">Contact</a></li>
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Nairobi</div>
      <div class="footer-contact-item"><strong>Address</strong>12 st JP Street, 20121</div>
      <div class="footer-contact-item"><strong>Phone</strong>+254 740 623 879</div>
      <div class="footer-contact-item"><strong>Hours</strong>Tue–Sun 12:00–15:00<br>19:00–23:30</div>
    </div>
    <div>
      <div class="footer-col-title">Paris</div>
      <div class="footer-contact-item"><strong>Address</strong>5 Rue Saint-Honoré, 75001</div>
      <div class="footer-contact-item"><strong>Phone</strong>+33 1 4265 1234</div>
      <div class="footer-contact-item"><strong>Hours</strong>Tue–Sun 12:00–14:30<br>19:00–23:00</div>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© 2026 Aurum Ristorante. All rights reserved.</span>
    <div class="footer-social">
      <a href="#">Instagram</a>
      <a href="#">Facebook</a>
      <a href="#">TripAdvisor</a>
    </div>
  </div>
</footer>`;

// ── INJECT NAV & FOOTER ──────────────────────────────────
function injectLayout() {
  const navPlaceholder = document.getElementById("nav-placeholder");
  if (navPlaceholder) navPlaceholder.innerHTML = NAV_HTML;

  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) footerPlaceholder.innerHTML = FOOTER_HTML;

  // Mark active nav link
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.dataset.page === page) a.classList.add("active");
  });

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("nav-drawer");
  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      drawer.classList.toggle("open");
    });
    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        hamburger.classList.remove("open");
        drawer.classList.remove("open");
      })
    );
  }

  // Navbar scroll behaviour
  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () =>
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}

// ── SCROLL REVEAL ────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ── OPEN / CLOSED BADGE ──────────────────────────────────
async function renderOpenBadge(targetEl, locationId = "Nairobi") {
  if (!targetEl) return;
  try {
    const data = await api.get(`/api/locations/${locationId}/hours`);
    if (!data.success) return;
    targetEl.innerHTML = `
      <span class="open-badge ${data.isOpen ? "is-open" : "is-closed"}">
        ${data.isOpen ? "● Open now" : "● Currently closed"}
      </span>`;
  } catch {}
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  injectLayout();
  initScrollReveal();
});
