const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Reservation = require("../models/Reservation");
const MenuItem = require("../models/MenuItem");
const GalleryImage = require("../models/GalleryImage");
const Contact = require("../models/Contact");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ── TOAST SYSTEM (injected into every page) ─────────────
const toastScript = `
<div id="toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;"></div>
<style>
.toast{pointer-events:all;display:flex;align-items:flex-start;gap:12px;padding:14px 18px;min-width:280px;max-width:380px;border:0.5px solid;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:300;letter-spacing:0.05em;line-height:1.5;animation:toastIn .3s ease;position:relative;overflow:hidden;}
.toast::after{content:'';position:absolute;bottom:0;left:0;height:2px;background:currentColor;opacity:0.4;animation:toastBar var(--duration,4s) linear forwards;}
@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}
@keyframes toastBar{from{width:100%}to{width:0%}}
.toast-success{background:rgba(29,158,117,0.12);border-color:rgba(29,158,117,0.35);color:#1D9E75;}
.toast-error{background:rgba(192,57,43,0.12);border-color:rgba(192,57,43,0.35);color:#c0392b;}
.toast-info{background:rgba(201,168,76,0.1);border-color:rgba(201,168,76,0.3);color:#C9A84C;}
.toast-icon{font-size:15px;flex-shrink:0;margin-top:1px;}
.toast-body{flex:1;}
.toast-title{font-weight:500;margin-bottom:2px;letter-spacing:0.1em;text-transform:uppercase;font-size:9px;}
.toast-msg{color:inherit;opacity:0.85;}
.toast-close{background:none;border:none;color:inherit;cursor:pointer;opacity:0.5;font-size:14px;padding:0;line-height:1;flex-shrink:0;}
.toast-close:hover{opacity:1;}
</style>
<script>
function showToast(type, title, message, duration=4000){
  const c=document.getElementById('toast-container');
  const t=document.createElement('div');
  const icons={success:'✓',error:'✕',info:'◈'};
  t.className='toast toast-'+type;
  t.style.setProperty('--duration', duration+'ms');
  t.innerHTML='<span class="toast-icon">'+icons[type]+'</span><div class="toast-body"><div class="toast-title">'+title+'</div><div class="toast-msg">'+message+'</div></div><button class="toast-close" onclick="this.closest(\'.toast\').remove()">×</button>';
  c.appendChild(t);
  setTimeout(()=>{t.style.animation='toastOut .3s ease forwards';setTimeout(()=>t.remove(),300);},duration);
}
</script>`;

// ── Helper: render full admin page ──────────────────────
const adminPage = (title, bodyContent, activePage = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Aurum Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--gold:#C9A84C;--gold-l:#E8C96A;--black:#0A0A0A;--char:#1A1A1A;--border:rgba(201,168,76,0.18);--text:#F7F3EC;--muted:#888;--danger:#c0392b;--success:#1D9E75;}
body{background:var(--black);color:var(--text);font-family:'Montserrat',sans-serif;font-weight:300;font-size:14px;display:flex;min-height:100vh;}
a{color:inherit;text-decoration:none;}
/* SIDEBAR */
.sidebar{width:220px;min-height:100vh;background:#0d0d0d;border-right:0.5px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:10;}
.sidebar-logo{padding:28px 20px;border-bottom:0.5px solid var(--border);}
.sidebar-logo span{font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--gold);letter-spacing:0.1em;}
.sidebar-logo small{display:block;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--muted);margin-top:2px;}
.sidebar nav{flex:1;padding:16px 0;}
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 20px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);transition:color .2s,background .2s;cursor:pointer;}
.nav-item:hover{color:var(--text);background:rgba(255,255,255,0.03);}
.nav-item.active{color:var(--gold);background:rgba(201,168,76,0.06);border-right:2px solid var(--gold);}
.nav-icon{width:16px;text-align:center;font-size:14px;}
.nav-badge{margin-left:auto;background:var(--danger);color:#fff;font-size:8px;font-weight:500;padding:2px 6px;border-radius:0;letter-spacing:0.05em;}
.sidebar-footer{padding:16px 20px;border-top:0.5px solid var(--border);}
.logout-btn{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);background:none;border:0.5px solid rgba(136,136,136,0.3);padding:8px 16px;cursor:pointer;width:100%;transition:color .2s,border-color .2s;font-family:'Montserrat',sans-serif;}
.logout-btn:hover{color:var(--danger);border-color:var(--danger);}
/* MAIN */
.main{margin-left:220px;flex:1;display:flex;flex-direction:column;min-height:100vh;}
.topbar{padding:20px 32px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:#0d0d0d;}
.topbar h1{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;}
.topbar-meta{font-size:10px;letter-spacing:0.15em;color:var(--muted);}
.content{padding:32px;flex:1;}
/* CARDS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
.stat-card{background:var(--char);border:0.5px solid var(--border);padding:20px 24px;}
.stat-label{font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
.stat-val{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:var(--gold);}
.stat-sub{font-size:10px;color:var(--muted);margin-top:4px;}
/* TABLE */
.card{background:var(--char);border:0.5px solid var(--border);margin-bottom:24px;}
.card-header{padding:16px 20px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.card-title{font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--gold);}
table{width:100%;border-collapse:collapse;}
th{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);padding:10px 16px;text-align:left;border-bottom:0.5px solid var(--border);}
td{padding:12px 16px;border-bottom:0.5px solid rgba(255,255,255,0.04);font-size:12px;vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,0.02);}
/* BADGES */
.badge{display:inline-block;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;padding:3px 8px;}
.badge-pending{background:rgba(201,168,76,0.12);color:var(--gold);}
.badge-confirmed{background:rgba(29,158,117,0.12);color:var(--success);}
.badge-cancelled{background:rgba(192,57,43,0.12);color:var(--danger);}
.badge-completed{background:rgba(136,136,136,0.12);color:var(--muted);}
.badge-unread{background:rgba(192,57,43,0.12);color:var(--danger);}
.badge-read{background:rgba(136,136,136,0.12);color:var(--muted);}
/* BUTTONS */
.btn{font-size:9px;letter-spacing:0.2em;text-transform:uppercase;padding:7px 14px;cursor:pointer;border:0.5px solid var(--border);background:none;color:var(--text);font-family:'Montserrat',sans-serif;transition:all .2s;}
.btn:hover{border-color:var(--gold);color:var(--gold);}
.btn-gold{background:var(--gold);color:var(--black);border-color:var(--gold);}
.btn-gold:hover{background:var(--gold-l);border-color:var(--gold-l);color:var(--black);}
.btn-danger{border-color:rgba(192,57,43,0.4);color:var(--danger);}
.btn-danger:hover{background:rgba(192,57,43,0.1);}
.btn-sm{padding:4px 10px;font-size:8px;}
/* FORMS */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.form-group{margin-bottom:16px;}
.form-group label{display:block;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;}
.form-group input,.form-group select,.form-group textarea{width:100%;background:rgba(255,255,255,0.03);border:0.5px solid var(--border);color:var(--text);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;padding:9px 12px;outline:none;transition:border-color .2s;}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--gold);}
.form-group textarea{resize:vertical;min-height:80px;}
select option{background:#1a1a1a;}
/* MODAL */
.modal-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:100;align-items:center;justify-content:center;}
.modal-backdrop.open{display:flex;}
.modal{background:var(--char);border:0.5px solid var(--border);padding:32px;width:560px;max-width:95vw;max-height:90vh;overflow-y:auto;}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;margin-bottom:20px;color:var(--gold);}
/* GALLERY GRID */
.gallery-mgmt{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px;}
.gallery-thumb{position:relative;aspect-ratio:1;background:var(--black);border:0.5px solid var(--border);overflow:hidden;}
.gallery-thumb img{width:100%;height:100%;object-fit:cover;}
.gallery-thumb-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;transition:opacity .2s;}
.gallery-thumb:hover .gallery-thumb-overlay{opacity:1;}
.thumb-label{position:absolute;bottom:0;left:0;right:0;padding:6px 8px;background:rgba(0,0,0,0.7);font-size:9px;letter-spacing:0.1em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* MESSAGE CARD */
.msg-card{border:0.5px solid var(--border);padding:20px;margin-bottom:12px;transition:border-color .2s;background:rgba(255,255,255,0.01);}
.msg-card.unread{border-color:rgba(201,168,76,0.35);background:rgba(201,168,76,0.03);}
.msg-card-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;gap:12px;}
.msg-meta{font-size:10px;color:var(--muted);margin-top:3px;letter-spacing:0.05em;}
.msg-subject{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;}
.msg-body{font-size:12px;color:rgba(247,243,236,0.7);line-height:1.7;}
.msg-actions{display:flex;gap:8px;margin-top:12px;}
/* ALERTS */
.alert{padding:12px 16px;margin-bottom:16px;font-size:11px;letter-spacing:0.05em;}
.alert-success{background:rgba(29,158,117,0.1);border:0.5px solid rgba(29,158,117,0.3);color:var(--success);}
.alert-error{background:rgba(192,57,43,0.1);border:0.5px solid rgba(192,57,43,0.3);color:var(--danger);}
/* GOLD LINE */
.gold-divider{height:0.5px;background:linear-gradient(90deg,var(--gold),transparent);margin:20px 0;}
/* TOGGLE */
.toggle{position:relative;width:36px;height:20px;flex-shrink:0;}
.toggle input{opacity:0;width:0;height:0;}
.toggle-slider{position:absolute;inset:0;background:rgba(255,255,255,0.1);border:0.5px solid var(--border);cursor:pointer;transition:.3s;}
.toggle input:checked + .toggle-slider{background:var(--gold);border-color:var(--gold);}
.toggle-slider::before{content:'';position:absolute;width:14px;height:14px;left:2px;top:2px;background:var(--text);transition:.3s;}
.toggle input:checked + .toggle-slider::before{transform:translateX(16px);}
/* FILTER ROW */
.filter-row{display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap;}
.filter-row select,.filter-row input{background:var(--char);border:0.5px solid var(--border);color:var(--text);font-family:'Montserrat',sans-serif;font-size:11px;font-weight:300;padding:7px 10px;outline:none;}
.filter-row select:focus,.filter-row input:focus{border-color:var(--gold);}
</style>
</head>
<body>
<aside class="sidebar">
  <div class="sidebar-logo"><span>Aurum</span><small>Admin Panel</small></div>
  <nav>
    <a href="/admin" class="nav-item ${activePage === "dashboard" ? "active" : ""}"><span class="nav-icon">◈</span> Dashboard</a>
    <a href="/admin/reservations" class="nav-item ${activePage === "reservations" ? "active" : ""}"><span class="nav-icon">◻</span> Reservations</a>
    <a href="/admin/menu" class="nav-item ${activePage === "menu" ? "active" : ""}"><span class="nav-icon">◇</span> Menu</a>
    <a href="/admin/gallery" class="nav-item ${activePage === "gallery" ? "active" : ""}"><span class="nav-icon">◈</span> Gallery</a>
    <a href="/admin/messages" class="nav-item ${activePage === "messages" ? "active" : ""}" id="nav-messages"><span class="nav-icon">✉</span> Messages<span id="unread-badge" class="nav-badge" style="display:none;"></span></a>
    <a href="/admin/locations" class="nav-item ${activePage === "locations" ? "active" : ""}"><span class="nav-icon">◉</span> Locations</a>
  </nav>
  <div class="sidebar-footer">
    <button class="logout-btn" onclick="logout()">Sign Out</button>
  </div>
</aside>
<div class="main">
  <div class="topbar">
    <h1>${title}</h1>
    <span class="topbar-meta" id="current-time"></span>
  </div>
  <div class="content">${bodyContent}</div>
</div>
${toastScript}
<script>
function logout(){fetch('/api/auth/logout',{method:'POST',credentials:'include'}).then(()=>location.href='/admin/login');}
const el=document.getElementById('current-time');
if(el){const tick=()=>{el.textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · '+new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})};tick();setInterval(tick,1000);}

// ── Poll for unread messages every 30s ──
async function checkUnread(){
  try{
    const r=await fetch('/api/contact',{credentials:'include'});
    const d=await r.json();
    if(d.success){
      const n=d.messages.filter(m=>!m.read).length;
      const badge=document.getElementById('unread-badge');
      if(badge){
        if(n>0){badge.textContent=n;badge.style.display='inline-block';}
        else{badge.style.display='none';}
      }
    }
  }catch{}
}
checkUnread();
setInterval(checkUnread,30000);
</script>
</body></html>`;

// ── LOGIN PAGE ──────────────────────────────────────────
router.get("/login", (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login · Aurum</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#0A0A0A;color:#F7F3EC;font-family:'Montserrat',sans-serif;font-weight:300;min-height:100vh;display:flex;align-items:center;justify-content:center;}
.login-box{width:400px;border:0.5px solid rgba(201,168,76,0.25);padding:48px 40px;background:#111;}
.logo{font-family:'Cormorant Garamond',serif;font-size:36px;color:#C9A84C;letter-spacing:0.1em;text-align:center;}
.subtitle{font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#888;text-align:center;margin-top:4px;margin-bottom:36px;}
.gold-bar{height:0.5px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);margin:24px 0;}
label{display:block;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:6px;}
input{width:100%;background:rgba(255,255,255,0.03);border:0.5px solid rgba(201,168,76,0.2);color:#F7F3EC;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:300;padding:11px 14px;outline:none;margin-bottom:16px;transition:border-color .2s;}
input:focus{border-color:#C9A84C;}
button{width:100%;background:#C9A84C;color:#000;border:none;font-family:'Montserrat',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;padding:13px;cursor:pointer;transition:background .2s;margin-top:8px;}
button:hover{background:#E8C96A;}
.error{background:rgba(192,57,43,0.1);border:0.5px solid rgba(192,57,43,0.3);color:#c0392b;padding:10px 14px;font-size:11px;margin-bottom:16px;display:none;}
</style></head>
<body>
<div class="login-box">
  <div class="logo">Aurum</div>
  <div class="subtitle">Admin Panel</div>
  <div class="gold-bar"></div>
  <div class="error" id="err"></div>
  <div><label>Email</label><input type="email" id="email" placeholder="admin@aurum-ristorante.com" autocomplete="username"></div>
  <div><label>Password</label><input type="password" id="pass" placeholder="••••••••" autocomplete="current-password"></div>
  <button onclick="login()">Sign In →</button>
</div>
<script>
async function login(){
  const email=document.getElementById('email').value,pass=document.getElementById('pass').value;
  const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,password:pass})});
  const data=await res.json();
  if(data.success) location.href='/admin';
  else{const e=document.getElementById('err');e.style.display='block';e.textContent=data.message||'Invalid credentials';}
}
document.addEventListener('keydown',e=>{if(e.key==='Enter')login();});
</script>
</body></html>`);
});

// ── DASHBOARD ───────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const [totalRes, pendingRes, todayRes, totalMenu, unreadMsgs] = await Promise.all([
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: "pending" }),
    Reservation.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    MenuItem.countDocuments({ available: true }),
    Contact.countDocuments({ read: false }),
  ]);
  const recent = await Reservation.find().sort({ createdAt: -1 }).limit(8);
  const rows = recent
    .map(
      (r) => `<tr>
    <td>${r.firstName} ${r.lastName}</td>
    <td>${new Date(r.date).toLocaleDateString("en-GB")}</td>
    <td>${r.time}</td>
    <td>${r.guests}</td>
    <td><span class="badge badge-${r.status}">${r.status}</span></td>
    <td><a href="/admin/reservations" class="btn btn-sm">Manage</a></td>
  </tr>`
    )
    .join("");

  res.send(
    adminPage(
      "Dashboard",
      `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Reservations</div><div class="stat-val">${totalRes}</div><div class="stat-sub">All time</div></div>
      <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-val" style="color:#C9A84C;">${pendingRes}</div><div class="stat-sub">Awaiting confirmation</div></div>
      <div class="stat-card"><div class="stat-label">Today</div><div class="stat-val" style="color:#1D9E75;">${todayRes}</div><div class="stat-sub">Reservations today</div></div>
      <div class="stat-card"><div class="stat-label">Unread Messages</div><div class="stat-val" style="color:${unreadMsgs > 0 ? '#c0392b' : '#C9A84C'};">${unreadMsgs}</div><div class="stat-sub"><a href="/admin/messages" style="color:#888;">View inbox</a></div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Recent Reservations</span><a href="/admin/reservations" class="btn btn-sm">View All</a></div>
      <table><thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#888;padding:24px;">No reservations yet</td></tr>'}</tbody></table>
    </div>`,
      "dashboard"
    )
  );
});

// ── RESERVATIONS ────────────────────────────────────────
router.get("/reservations", auth, async (req, res) => {
  const { status, date } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (date) {
    const d = new Date(date);
    filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }
  const reservations = await Reservation.find(filter)
    .sort({ date: 1, time: 1 })
    .limit(100);

  const rows = reservations
    .map(
      (r) => `<tr>
    <td><strong style="color:#F7F3EC;">${r.firstName} ${r.lastName}</strong><br><small style="color:#888;">${r.email}</small></td>
    <td>${new Date(r.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</td>
    <td>${r.time}</td>
    <td>${r.guests}</td>
    <td>${r.occasion !== "none" ? r.occasion : "—"}</td>
    <td><span class="badge badge-${r.status}">${r.status}</span></td>
    <td>
      <select onchange="updateStatus('${r._id}',this.value,this)" style="background:#1a1a1a;border:0.5px solid rgba(201,168,76,0.2);color:#F7F3EC;font-size:9px;letter-spacing:0.1em;padding:4px 6px;cursor:pointer;">
        <option ${r.status === "pending" ? "selected" : ""}>pending</option>
        <option ${r.status === "confirmed" ? "selected" : ""}>confirmed</option>
        <option ${r.status === "cancelled" ? "selected" : ""}>cancelled</option>
        <option ${r.status === "completed" ? "selected" : ""}>completed</option>
      </select>
    </td>
    <td><button class="btn btn-sm btn-danger" onclick="deleteRes('${r._id}',this)">Delete</button></td>
  </tr>`
    )
    .join("");

  res.send(
    adminPage(
      "Reservations",
      `
    <div class="filter-row">
      <select onchange="applyFilter()" id="f-status">
        <option value="all" ${!status || status === "all" ? "selected" : ""}>All Statuses</option>
        <option value="pending" ${status === "pending" ? "selected" : ""}>Pending</option>
        <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option>
        <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
        <option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option>
      </select>
      <input type="date" id="f-date" value="${date || ""}" onchange="applyFilter()">
      <button class="btn" onclick="document.getElementById('f-date').value='';applyFilter()">Clear</button>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Reservations (${reservations.length})</span></div>
      <table><thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Guests</th><th>Occasion</th><th>Status</th><th>Update</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#888;padding:24px;">No reservations found</td></tr>'}</tbody></table>
    </div>
    <script>
    function applyFilter(){const s=document.getElementById('f-status').value,d=document.getElementById('f-date').value;location.href='/admin/reservations?status='+s+(d?'&date='+d:'');}
    async function updateStatus(id,status,sel){
      const r=await fetch('/api/reservations/'+id+'/status',{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({status})});
      if(r.ok){showToast('success','Updated','Reservation marked as '+status+'.');}
      else{showToast('error','Error','Failed to update status.');sel.value=sel.dataset.prev||sel.value;}
      sel.dataset.prev=status;
    }
    async function deleteRes(id,btn){
      if(!confirm('Delete this reservation?'))return;
      const r=await fetch('/api/reservations/'+id,{method:'DELETE',credentials:'include'});
      if(r.ok){btn.closest('tr').remove();showToast('info','Deleted','Reservation removed.');}
      else{showToast('error','Error','Could not delete reservation.');}
    }
    </script>`,
      "reservations"
    )
  );
});

// ── MENU MANAGEMENT ─────────────────────────────────────
router.get("/menu", auth, async (req, res) => {
  const items = await MenuItem.find().sort({ category: 1, order: 1 });
  const cats = ["antipasti", "primi", "secondi", "dolci", "bevande"];

  const rows = items
    .map(
      (item) => `<tr>
    <td><strong>${item.name}</strong><br><small style="color:#888;">${item.description.slice(0, 50)}…</small></td>
    <td><span class="badge badge-pending">${item.category}</span></td>
    <td style="color:#C9A84C;font-family:'Cormorant Garamond',serif;font-size:16px;">€${item.price.toFixed(2)}</td>
    <td>${item.tags?.join(", ") || "—"}</td>
    <td>
      <label class="toggle"><input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleAvail('${item._id}',this.checked,this)"><span class="toggle-slider"></span></label>
    </td>
    <td>
      <button class="btn btn-sm" onclick="editItem(${JSON.stringify(item).replace(/"/g, "&quot;")})">Edit</button>
      <button class="btn btn-sm btn-danger" onclick="deleteItem('${item._id}',this)">Del</button>
    </td>
  </tr>`
    )
    .join("");

  const catOptions = cats
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");

  res.send(
    adminPage(
      "Menu",
      `
    <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
      <button class="btn btn-gold" onclick="document.getElementById('add-modal').classList.add('open')">+ Add Item</button>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Menu Items (${items.length})</span></div>
      <table><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Tags</th><th>Available</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>

    <!-- ADD MODAL -->
    <div class="modal-backdrop" id="add-modal">
      <div class="modal">
        <div class="modal-title">Add Menu Item</div>
        <form id="add-form" onsubmit="addItem(event)" enctype="multipart/form-data">
          <div class="form-grid">
            <div class="form-group"><label>Name</label><input name="name" required></div>
            <div class="form-group"><label>Category</label><select name="category">${catOptions}</select></div>
            <div class="form-group"><label>Price (€)</label><input name="price" type="number" step="0.5" required></div>
            <div class="form-group"><label>Order</label><input name="order" type="number" value="0"></div>
          </div>
          <div class="form-group"><label>Description</label><textarea name="description" required></textarea></div>
          <div class="form-group"><label>Image</label><input name="image" type="file" accept="image/*"></div>
          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px;">
            <button type="button" class="btn" onclick="document.getElementById('add-modal').classList.remove('open')">Cancel</button>
            <button type="submit" class="btn btn-gold">Add Item</button>
          </div>
        </form>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div class="modal-backdrop" id="edit-modal">
      <div class="modal">
        <div class="modal-title">Edit Menu Item</div>
        <form id="edit-form" onsubmit="saveItem(event)" enctype="multipart/form-data">
          <input type="hidden" id="edit-id">
          <div class="form-grid">
            <div class="form-group"><label>Name</label><input id="edit-name" name="name" required></div>
            <div class="form-group"><label>Category</label><select id="edit-cat" name="category">${catOptions}</select></div>
            <div class="form-group"><label>Price (€)</label><input id="edit-price" name="price" type="number" step="0.5" required></div>
            <div class="form-group"><label>Order</label><input id="edit-order" name="order" type="number"></div>
          </div>
          <div class="form-group"><label>Description</label><textarea id="edit-desc" name="description" required></textarea></div>
          <div class="form-group"><label>New Image (optional)</label><input name="image" type="file" accept="image/*"></div>
          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px;">
            <button type="button" class="btn" onclick="document.getElementById('edit-modal').classList.remove('open')">Cancel</button>
            <button type="submit" class="btn btn-gold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <script>
    function editItem(item){
      document.getElementById('edit-id').value=item._id;
      document.getElementById('edit-name').value=item.name;
      document.getElementById('edit-cat').value=item.category;
      document.getElementById('edit-price').value=item.price;
      document.getElementById('edit-order').value=item.order||0;
      document.getElementById('edit-desc').value=item.description;
      document.getElementById('edit-modal').classList.add('open');
    }
    async function addItem(e){
      e.preventDefault();
      const fd=new FormData(e.target);
      const r=await fetch('/api/menu',{method:'POST',credentials:'include',body:fd});
      if(r.ok){showToast('success','Added','Menu item added successfully.');setTimeout(()=>location.reload(),800);}
      else{const d=await r.json();showToast('error','Error',d.message||'Could not add item.');}
    }
    async function saveItem(e){
      e.preventDefault();
      const id=document.getElementById('edit-id').value;
      const fd=new FormData(e.target);
      const r=await fetch('/api/menu/'+id,{method:'PUT',credentials:'include',body:fd});
      if(r.ok){showToast('success','Saved','Item updated successfully.');setTimeout(()=>location.reload(),800);}
      else{const d=await r.json();showToast('error','Error',d.message||'Could not save item.');}
    }
    async function deleteItem(id,btn){
      if(!confirm('Delete this item?'))return;
      const r=await fetch('/api/menu/'+id,{method:'DELETE',credentials:'include'});
      if(r.ok){btn.closest('tr').remove();showToast('info','Deleted','Menu item removed.');}
      else{showToast('error','Error','Could not delete item.');}
    }
    async function toggleAvail(id,val,el){
      const r=await fetch('/api/menu/'+id,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({available:val})});
      if(r.ok){showToast('info','Updated',val?'Item marked available.':'Item marked unavailable.');}
      else{showToast('error','Error','Could not update availability.');el.checked=!val;}
    }
    </script>`,
      "menu"
    )
  );
});

// ── GALLERY MANAGEMENT ──────────────────────────────────
router.get("/gallery", auth, async (req, res) => {
  const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
  const thumbs = images
    .map(
      (img) => `
    <div class="gallery-thumb">
      <img src="${img.url}" alt="${img.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%231a1a1a%22 width=%22100%22 height=%22100%22/></svg>'">
      <div class="gallery-thumb-overlay">
        <span class="badge badge-pending">${img.category}</span>
        <button class="btn btn-sm btn-danger" onclick="delImg('${img._id}',this)">Delete</button>
        ${img.featured ? '<span style="font-size:9px;color:#C9A84C;">★ Featured</span>' : ""}
      </div>
      <div class="thumb-label">${img.title}</div>
    </div>`
    )
    .join("");

  res.send(
    adminPage(
      "Gallery",
      `
    <div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
      <button class="btn btn-gold" onclick="document.getElementById('upload-modal').classList.add('open')">+ Upload Image</button>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Gallery (${images.length} images)</span></div>
      <div style="padding:16px;">
        <div class="gallery-mgmt">${thumbs || '<p style="color:#888;padding:24px;">No images uploaded yet</p>'}</div>
      </div>
    </div>

    <div class="modal-backdrop" id="upload-modal">
      <div class="modal">
        <div class="modal-title">Upload Image</div>
        <form onsubmit="uploadImg(event)" enctype="multipart/form-data">
          <div class="form-group"><label>Image File *</label><input name="image" type="file" accept="image/*" required /></div>
          <div class="form-group"><label>Title</label><input name="title" placeholder="e.g. The Dining Room" /></div>
          <div class="form-group"><label>Caption</label><input name="caption" placeholder="Optional caption" /></div>
          <div class="form-group"><label>Category</label>
            <select name="category">
              <option value="food">Food</option><option value="dining">Dining Room</option>
              <option value="kitchen">Kitchen</option><option value="events">Events</option><option value="exterior">Exterior</option><option value="interior">Interior</option><option value="drink">Drink</option>
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:10px;">
            <label style="margin:0;">Featured</label>
            <label class="toggle"><input type="checkbox" name="featured" value="true" /><span class="toggle-slider"></span></label>
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:20px;">
            <button type="button" class="btn" onclick="document.getElementById('upload-modal').classList.remove('open')">Cancel</button>
            <button type="submit" class="btn btn-gold">Upload</button>
          </div>
        </form>
      </div>
    </div>
    <script>
    async function uploadImg(e){
      e.preventDefault();
      const fd=new FormData(e.target);
      const r=await fetch('/api/gallery',{method:'POST',credentials:'include',body:fd});
      if(r.ok){showToast('success','Uploaded','Image added to gallery.');setTimeout(()=>location.reload(),800);}
      else{const d=await r.json();showToast('error','Upload Failed',d.message||'Could not upload image.');}
    }
    async function delImg(id,btn){
      if(!confirm('Delete this image?'))return;
      const r=await fetch('/api/gallery/'+id,{method:'DELETE',credentials:'include'});
      if(r.ok){btn.closest('.gallery-thumb').remove();showToast('info','Deleted','Image removed from gallery.');}
      else{showToast('error','Error','Could not delete image.');}
    }
    </script>`,
      "gallery"
    )
  );
});

// ── MESSAGES ────────────────────────────────────────────
router.get("/messages", auth, async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 }).limit(100);
  const unreadCount = messages.filter(m => !m.read).length;

  const cards = messages.map(m => `
    <div class="msg-card ${m.read ? '' : 'unread'}" id="msg-${m._id}">
      <div class="msg-card-header">
        <div>
          <div style="display:flex;align-items:center;gap:10px;">
            <strong style="font-size:13px;">${m.name}</strong>
            <span class="badge ${m.read ? 'badge-read' : 'badge-unread'}">${m.read ? 'Read' : 'New'}</span>
          </div>
          <div class="msg-meta">${m.email} · ${new Date(m.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
        <div style="display:flex;gap:8px;">
          ${!m.read ? `<button class="btn btn-sm" onclick="markRead('${m._id}',this)">Mark Read</button>` : ''}
          <a href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your Enquiry')}" class="btn btn-sm btn-gold">Reply</a>
          <button class="btn btn-sm btn-danger" onclick="delMsg('${m._id}',this)">Delete</button>
        </div>
      </div>
      <div class="msg-subject">${m.subject || 'Enquiry'}</div>
      <div class="msg-body">${m.message}</div>
    </div>`).join('');

  res.send(adminPage('Messages', `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="font-size:11px;color:var(--muted);">${unreadCount} unread · ${messages.length} total</div>
      ${unreadCount > 0 ? `<button class="btn btn-sm" onclick="markAllRead()">Mark All Read</button>` : ''}
    </div>
    <div id="messages-list">
      ${cards || '<div style="text-align:center;padding:48px;color:#888;">No messages yet</div>'}
    </div>
    <script>
    async function markRead(id,btn){
      const r=await fetch('/api/contact/'+id+'/read',{method:'PATCH',credentials:'include'});
      if(r.ok){
        const card=document.getElementById('msg-'+id);
        card.classList.remove('unread');
        card.querySelector('.badge').className='badge badge-read';
        card.querySelector('.badge').textContent='Read';
        btn.remove();
        showToast('info','Marked Read','Message marked as read.');
      }else{showToast('error','Error','Could not update message.');}
    }
    async function markAllRead(){
      const btns=document.querySelectorAll('[onclick^="markRead"]');
      for(const btn of btns){
        const id=btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        await fetch('/api/contact/'+id+'/read',{method:'PATCH',credentials:'include'});
      }
      showToast('success','Done','All messages marked as read.');
      setTimeout(()=>location.reload(),800);
    }
    async function delMsg(id,btn){
      if(!confirm('Delete this message?'))return;
      const r=await fetch('/api/contact/'+id,{method:'DELETE',credentials:'include'});
      if(r.ok){document.getElementById('msg-'+id).remove();showToast('info','Deleted','Message deleted.');}
      else{showToast('error','Error','Could not delete message.');}
    }
    </script>`, 'messages'));
});

// ── LOCATIONS PAGE ──────────────────────────────────────
router.get("/locations", auth, (req, res) => {
  res.send(
    adminPage(
      "Locations",
      `
    <div class="card">
      <div class="card-header"><span class="card-title">Restaurant Locations</span></div>
      <div style="padding:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div style="border:0.5px solid rgba(201,168,76,0.2);padding:24px;">
            <div style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;">Nairobi</div>
            <div style="font-size:18px;font-family:'Cormorant Garamond',serif;margin-bottom:12px;">Aurum Nairobi</div>
            <div style="font-size:12px;color:#888;line-height:1.9;">12 Via della Luce<br>Nairobi 00100, Kenya<br>+254 740 623 879<br>Tue–Sun: 12:00–15:00, 19:00–23:30</div>
            <div style="margin-top:12px;"><span class="badge badge-confirmed">Open Today</span></div>
          </div>
          <div style="border:0.5px solid rgba(201,168,76,0.2);padding:24px;">
            <div style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;">Paris</div>
            <div style="font-size:18px;font-family:'Cormorant Garamond',serif;margin-bottom:12px;">Aurum Paris</div>
            <div style="font-size:12px;color:#888;line-height:1.9;">5 Rue Saint-Honoré<br>Paris 75001, France<br>+254 740 623 879<br>Tue–Sun: 12:00–14:30, 19:00–23:00</div>
            <div style="margin-top:12px;"><span class="badge badge-confirmed">Open Today</span></div>
          </div>
        </div>
        <div style="margin-top:20px;padding:16px;background:rgba(201,168,76,0.04);border:0.5px solid rgba(201,168,76,0.15);">
          <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">API Endpoint</div>
          <code style="font-size:11px;color:#888;">GET /api/locations · GET /api/locations/:id · GET /api/locations/:id/hours</code>
        </div>
      </div>
    </div>`,
      "locations"
    )
  );
});

module.exports = router;