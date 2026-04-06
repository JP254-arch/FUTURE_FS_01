/* ═══════════════════════════════════════════════
   AURUM — Contact Page JavaScript
   ═══════════════════════════════════════════════ */

const LOCATIONS = {
  milan: {
    address: '12 Via della Luce<br>Milan 20121, Italy',
    hours: 'Tuesday – Sunday<br>Lunch: 12:00 – 15:00<br>Dinner: 19:00 – 23:30<br><span style="color:var(--gray);font-size:0.75rem;">Closed Mondays</span>',
    phone: '+39 02 8765 4321',
    phoneHref: 'tel:+390287654321',
    whatsapp: 'https://wa.me/390287654321',
    mapLabel: '12 Via della Luce · Milano',
    mapLink: 'https://maps.google.com/?q=Aurum+Ristorante+Milan',
    locationId: 'milan',
  },
  paris: {
    address: '5 Rue Saint-Honoré<br>Paris 75001, France',
    hours: 'Tuesday – Sunday<br>Lunch: 12:00 – 14:30<br>Dinner: 19:00 – 23:00<br><span style="color:var(--gray);font-size:0.75rem;">Closed Mondays</span>',
    phone: '+33 1 4265 1234',
    phoneHref: 'tel:+33142651234',
    whatsapp: 'https://wa.me/33142651234',
    mapLabel: '5 Rue Saint-Honoré · Paris',
    mapLink: 'https://maps.google.com/?q=Aurum+Ristorante+Paris',
    locationId: 'paris',
  },
};

let activeLocation = 'milan';

async function switchLocation(locId) {
  activeLocation = locId;
  const loc = LOCATIONS[locId];

  document.getElementById('info-address').querySelector('.info-value').innerHTML = loc.address;
  document.getElementById('info-hours').querySelector('.info-value').innerHTML   = loc.hours;
  document.getElementById('info-phone').querySelector('.info-value').innerHTML   = `<a href="${loc.phoneHref}">${loc.phone}</a>`;
  document.getElementById('map-label').textContent  = loc.mapLabel;
  document.getElementById('map-link').href          = loc.mapLink;
  document.getElementById('whatsapp-link').href     = loc.whatsapp;

  // Fetch live open/closed
  const statusEl = document.getElementById('live-status');
  statusEl.textContent = '';
  try {
    const data = await api.get(`/api/locations/${loc.locationId}/hours`);
    if (data.success) {
      statusEl.textContent = data.isOpen
        ? `● Open now · ${data.currentSession}`
        : '● Currently closed';
      statusEl.className = `info-status ${data.isOpen ? 'status-open' : 'status-closed'}`;
    }
  } catch {}
}

// ── FORM TABS ────────────────────────────────────────────
function initFormTabs() {
  document.querySelectorAll('.form-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.form-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.contact-form').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`form-${btn.dataset.form}`).classList.add('active');
    });
  });
}

// ── LOCATION TABS ────────────────────────────────────────
function initLocationTabs() {
  document.querySelectorAll('.loc-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.loc-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchLocation(btn.dataset.loc);
    });
  });
}

// ── RESERVATION SUBMIT ───────────────────────────────────
async function handleReservation(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-reserve');
  const msg = document.getElementById('msg-reserve');
  const form = document.getElementById('form-reservation');

  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.className = 'form-msg';

  const body = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await api.post('/api/reservations', body);
    if (data.success) {
      msg.className = 'form-msg success';
      msg.textContent = `✓ ${data.message} Confirmation: ${data.confirmationId}`;
      form.reset();
      document.querySelector('input[name="date"]').min = new Date().toISOString().split('T')[0];
    } else {
      const err = data.errors ? data.errors.map(e => e.msg).join(', ') : data.message;
      msg.className = 'form-msg error';
      msg.textContent = err || 'Something went wrong. Please try again.';
    }
  } catch {
    msg.className = 'form-msg error';
    msg.textContent = 'Connection error. Please call us directly.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Request Reservation →';
  }
}

// ── CONTACT SUBMIT ───────────────────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const btn  = document.getElementById('btn-contact');
  const msg  = document.getElementById('msg-contact');
  const form = document.getElementById('form-contact');

  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.className = 'form-msg';

  const body = Object.fromEntries(new FormData(form).entries());

  try {
    const data = await api.post('/api/contact', body);
    if (data.success) {
      msg.className = 'form-msg success';
      msg.textContent = `✓ ${data.message}`;
      form.reset();
    } else {
      msg.className = 'form-msg error';
      msg.textContent = data.message || 'Something went wrong.';
    }
  } catch {
    msg.className = 'form-msg error';
    msg.textContent = 'Connection error. Please email us directly.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Message →';
  }
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFormTabs();
  initLocationTabs();

  // Set min date
  const dateInput = document.querySelector('input[name="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  // Load initial status
  switchLocation('milan');

  // Form submit handlers
  document.getElementById('form-reservation').addEventListener('submit', handleReservation);
  document.getElementById('form-contact').addEventListener('submit', handleContact);
});
