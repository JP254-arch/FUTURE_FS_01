/* ═══════════════════════════════════════════════
   AURUM — Contact Page JavaScript
   ═══════════════════════════════════════════════ */

// ── TOAST SYSTEM ─────────────────────────────────────────
(function () {
  const style = document.createElement("style");
  style.textContent = `
    #aurum-toast-container{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}
    .aurum-toast{pointer-events:all;display:flex;align-items:flex-start;gap:12px;padding:16px 20px;min-width:280px;max-width:360px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;letter-spacing:0.04em;line-height:1.5;animation:aurumToastIn .35s ease;position:relative;overflow:hidden;border:0.5px solid;}
    .aurum-toast::after{content:'';position:absolute;bottom:0;left:0;height:1.5px;background:currentColor;opacity:0.35;animation:aurumToastBar var(--dur,4s) linear forwards;}
    @keyframes aurumToastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes aurumToastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(12px)}}
    @keyframes aurumToastBar{from{width:100%}to{width:0%}}
    .aurum-toast-success{background:rgba(10,10,10,0.97);border-color:rgba(29,158,117,0.5);color:#1D9E75;}
    .aurum-toast-error{background:rgba(10,10,10,0.97);border-color:rgba(192,57,43,0.5);color:#c0392b;}
    .aurum-toast-info{background:rgba(10,10,10,0.97);border-color:rgba(201,168,76,0.4);color:#C9A84C;}
    .aurum-toast-icon{font-size:16px;flex-shrink:0;}
    .aurum-toast-body{flex:1;}
    .aurum-toast-title{font-weight:500;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:3px;}
    .aurum-toast-msg{opacity:0.8;font-size:11px;}
    .aurum-toast-close{background:none;border:none;color:inherit;cursor:pointer;opacity:0.4;font-size:16px;line-height:1;flex-shrink:0;padding:0;font-family:inherit;}
    .aurum-toast-close:hover{opacity:1;}
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "aurum-toast-container";
  document.body.appendChild(container);

  window.showToast = function (type, title, message, duration = 4500) {
    const icons = { success: "✓", error: "✕", info: "◈" };
    const t = document.createElement("div");
    t.className = `aurum-toast aurum-toast-${type}`;
    t.style.setProperty("--dur", duration + "ms");
    t.innerHTML = `
      <span class="aurum-toast-icon">${icons[type] || "◈"}</span>
      <div class="aurum-toast-body">
        <div class="aurum-toast-title">${title}</div>
        <div class="aurum-toast-msg">${message}</div>
      </div>
      <button class="aurum-toast-close" onclick="this.closest('.aurum-toast').remove()">×</button>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.animation = "aurumToastOut .35s ease forwards";
      setTimeout(() => t.remove(), 350);
    }, duration);
  };
})();

// ── LOCATION DATA ─────────────────────────────────────────
const LOCATIONS = {
  Nairobi: {
    address: "12 st JP Street<br>Nairobi 20121, Nairobi",
    hours:
      'Tuesday – Sunday<br>Lunch: 12:00 – 15:00<br>Dinner: 19:00 – 23:30<br><span style="color:var(--gray);font-size:0.75rem;">Closed Mondays</span>',
    phone: "+254 740 623 879",
    phoneHref: "tel:+254740623879",
    whatsapp: "https://wa.me/254740623879",
    mapLabel: "12 st JP Street · Nairobi",
    mapLink: "https://maps.google.com/?q=Aurum+Ristorante+Nairobi",
    locationId: "Nairobi",
  },
  Paris: {
    address: "5 Rue Saint-Honoré<br>Paris 75001, France",
    hours:
      'Tuesday – Sunday<br>Lunch: 12:00 – 14:30<br>Dinner: 19:00 – 23:00<br><span style="color:var(--gray);font-size:0.75rem;">Closed Mondays</span>',
    phone: "+254 740 623 879",
    phoneHref: "tel:+254740623879",
    whatsapp: "https://wa.me/254740623879",
    mapLabel: "5 Rue Saint-Honoré · Paris",
    mapLink: "https://maps.google.com/?q=Aurum+Ristorante+Paris",
    locationId: "Paris",
  },
};

let activeLocation = "Nairobi";

async function switchLocation(locId) {
  activeLocation = locId;
  const loc = LOCATIONS[locId];

  document
    .getElementById("info-address")
    .querySelector(".info-value").innerHTML = loc.address;
  document.getElementById("info-hours").querySelector(".info-value").innerHTML =
    loc.hours;
  document.getElementById("info-phone").querySelector(".info-value").innerHTML =
    `<a href="${loc.phoneHref}">${loc.phone}</a>`;
  document.getElementById("map-label").textContent = loc.mapLabel;
  document.getElementById("map-link").href = loc.mapLink;
  document.getElementById("whatsapp-link").href = loc.whatsapp;

  const statusEl = document.getElementById("live-status");
  statusEl.textContent = "";
  try {
    const data = await api.get(`/api/locations/${loc.locationId}/hours`);
    if (data.success) {
      statusEl.textContent = data.isOpen
        ? `● Open now · ${data.currentSession}`
        : "● Currently closed";
      statusEl.className = `info-status ${data.isOpen ? "status-open" : "status-closed"}`;
    }
  } catch {}
}

// ── FORM TABS ─────────────────────────────────────────────
function initFormTabs() {
  document.querySelectorAll(".form-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".form-tab")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".contact-form")
        .forEach((f) => f.classList.remove("active"));
      btn.classList.add("active");
      document
        .getElementById(`form-${btn.dataset.form}`)
        .classList.add("active");
    });
  });
}

// ── LOCATION TABS ─────────────────────────────────────────
function initLocationTabs() {
  document.querySelectorAll(".loc-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".loc-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      switchLocation(btn.dataset.loc === "Nairobi" ? "Nairobi" : "Paris");
    });
  });
}

async function handleReservation(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-reserve");
  const msg = document.getElementById("msg-reserve");
  const form = document.getElementById("form-reservation");

  btn.disabled = true;
  btn.textContent = "Sending…";
  msg.className = "form-msg";
  msg.textContent = "";

  const body = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch(`${API_BASE}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      msg.className = "form-msg success";
      msg.textContent = `✓ ${data.message} Confirmation: ${data.confirmationId}`;
      form.reset();
      document.querySelector('input[name="date"]').min = new Date()
        .toISOString()
        .split("T")[0];
      showToast("success", "Reservation Requested", `Confirmation ID: ${data.confirmationId}`);
    } else {
      const err = data.errors ? data.errors.map((e) => e.msg).join(", ") : data.message;
      msg.className = "form-msg error";
      msg.textContent = err || "Something went wrong. Please try again.";
      showToast("error", "Reservation Failed", err || "Please check your details and try again.");
    }
  } catch {
    msg.className = "form-msg error";
    msg.textContent = "Connection error. Please call us directly.";
    showToast("error", "Connection Error", "Please call us or try again later.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Request Reservation →";
  }
}

// ── CONTACT SUBMIT ────────────────────────────────────────
async function handleContact(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-contact");
  const msg = document.getElementById("msg-contact");
  const form = document.getElementById("form-contact");

  btn.disabled = true;
  btn.textContent = "Sending…";
  msg.className = "form-msg";
  msg.textContent = "";

  const body = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.status === 429) {
      msg.className = "form-msg error";
      msg.textContent = "Too many attempts. Please try again in an hour.";
      showToast(
        "error",
        "Too Many Attempts",
        "Please wait a while before sending another message."
      );
    } else if (data.success) {
      msg.className = "form-msg success";
      msg.textContent = `✓ ${data.message}`;
      form.reset();
      showToast(
        "success",
        "Message Sent",
        "We'll get back to you within 24 hours."
      );
    } else {
      msg.className = "form-msg error";
      msg.textContent = data.message || "Something went wrong.";
      showToast("error", "Send Failed", data.message || "Please try again.");
    }
  } catch {
    msg.className = "form-msg error";
    msg.textContent = "Connection error. Please email us directly.";
    showToast("error", "Connection Error", "Please email us directly.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send Message →";
  }
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFormTabs();
  initLocationTabs();

  const dateInput = document.querySelector('input[name="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  switchLocation("Nairobi");

  document
    .getElementById("form-reservation")
    .addEventListener("submit", handleReservation);
  document
    .getElementById("form-contact")
    .addEventListener("submit", handleContact);
});
