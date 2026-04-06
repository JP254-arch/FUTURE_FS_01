# Aurum Ristorante — Frontend

A fully separated, multi-page HTML/CSS/JS frontend connected to the Aurum Node.js backend.

---

## Folder Structure

```
aurum-frontend/
├── index.html                  ← Homepage
├── pages/
│   ├── about.html              ← Our Story page
│   ├── menu.html               ← Full menu (live from API)
│   ├── gallery.html            ← Gallery with filter + lightbox
│   └── contact.html            ← Reservations + contact form
└── assets/
    ├── css/
    │   ├── global.css          ← Variables, reset, shared components, footer
    │   ├── nav.css             ← Navigation (shared)
    │   ├── home.css            ← Homepage styles
    │   ├── about.css           ← About page styles
    │   ├── menu.css            ← Menu page styles
    │   ├── gallery.css         ← Gallery + lightbox styles
    │   └── contact.css         ← Contact page styles
    ├── js/
    │   ├── main.js             ← Config, API helper, nav/footer inject, scroll reveal
    │   ├── home.js             ← Homepage: featured dishes, gallery mosaic, open badge
    │   ├── menu.js             ← Menu page: load from API, tabs, fallback
    │   ├── gallery.js          ← Gallery: load, filter, lightbox
    │   └── contact.js          ← Contact: reservation + contact form, location switcher
    └── images/                 ← Put your logo, favicon, hero images here
```

---

## How It Works

Every page:
1. Loads `global.css` + `nav.css` + its own page CSS
2. Has `<div id="nav-placeholder">` and `<div id="footer-placeholder">`
3. Loads `main.js` which injects the shared nav and footer HTML into those placeholders
4. Loads its own page JS for any dynamic behaviour

The nav automatically marks the active page using `<body data-page="...">`.

---

## Connecting to the Backend

Open `assets/js/main.js` and update line 5:

```js
const API_BASE = 'https://your-backend.onrender.com'; // ← your Render URL
```

That's the only change needed. All API calls across all pages go through this single variable.

---

## Pages Overview

| Page | File | Dynamic Content |
|------|------|-----------------|
| Home | `index.html` | Open/closed badge, featured dishes from API, gallery mosaic |
| About | `pages/about.html` | Static — no API calls needed |
| Menu | `pages/menu.html` | Full menu loaded from `/api/menu` with static fallback |
| Gallery | `pages/gallery.html` | Images from `/api/gallery`, filter by category, lightbox |
| Contact | `pages/contact.html` | Location hours from API, reservation + contact form submission |

---

## Running Locally

No build step needed. Just open with a local server:

```bash
# Option 1: VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Option 2: Python
python -m http.server 5500

# Option 3: Node
npx serve .
```

Then visit: `http://localhost:5500`

---

## Deploying the Frontend

### Option A — GitHub Pages (free, static)
```bash
git init
git add .
git commit -m "Aurum frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aurum-frontend.git
git push -u origin main
```
Go to GitHub repo → Settings → Pages → Deploy from `main` branch → `/root`.

### Option B — Netlify (free, drag & drop)
1. Go to https://netlify.com
2. Drag the `aurum-frontend` folder into the deploy zone
3. Done — live in 30 seconds

### Option C — Serve from the backend (Express static)
In `aurum-backend/server.js`, add:
```js
app.use(express.static(path.join(__dirname, '../aurum-frontend')));
```
Then both frontend and backend live at the same URL.

---

## Customisation Checklist

- [ ] Update `API_BASE` in `assets/js/main.js`
- [ ] Replace gallery placeholder divs with real images (upload via admin panel)
- [ ] Add your logo to `assets/images/` and reference it in nav
- [ ] Update phone numbers, addresses, hours in `main.js` footer and `contact.js`
- [ ] Add a `<link rel="icon">` favicon in each `<head>`
