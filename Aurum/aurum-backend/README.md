# Aurum Ristorante — Full Stack Website

A complete, production-ready website for a luxury Italian restaurant with Node.js/Express backend, MongoDB database, admin panel, and live API integration.

---

## Project Structure

```
aurum-backend/
├── server.js              # Entry point
├── seed.js                # DB seed (admin + menu)
├── render.yaml            # Render.com deployment config
├── .env.example           # Environment variables template
├── config/
│   ├── db.js              # MongoDB connection
│   └── email.js           # Nodemailer + HTML email templates
├── models/
│   ├── Admin.js           # Admin user (bcrypt passwords)
│   ├── Reservation.js     # Reservation schema
│   ├── MenuItem.js        # Menu item schema
│   └── GalleryImage.js    # Gallery image schema
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── upload.js          # Multer file upload
├── routes/
│   ├── auth.js            # Login / logout / me
│   ├── reservations.js    # CRUD reservations
│   ├── menu.js            # CRUD menu items
│   ├── gallery.js         # Upload / manage gallery
│   ├── contact.js         # Contact form + email
│   ├── locations.js       # Location data + open/closed
│   └── adminPanel.js      # Full admin dashboard (HTML)
├── uploads/
│   ├── gallery/           # Uploaded gallery images
│   └── menu/              # Uploaded menu images
└── public/
    └── index.html         # Frontend (connected to API)
```

---

## Quick Start (Local)

### 1. Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier): https://mongodb.com/atlas
- A Gmail account (for email notifications)

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/aurum-backend.git
cd aurum-backend
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `EMAIL_USER` / `EMAIL_PASS` — Gmail + App Password
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your admin login
- `NOTIFY_EMAIL` — where reservation notifications are sent

### 4. Seed the Database
```bash
node seed.js
```
This creates your admin account and populates the menu.

### 5. Run
```bash
npm run dev       # development (nodemon)
npm start         # production
```

Visit:
- Frontend: http://localhost:3000/admin/../public/index.html
- Admin panel: http://localhost:3000/admin
- API health: http://localhost:3000/health

---

## Deploying to Render.com (Free)

### Step 1 — MongoDB Atlas
1. Go to https://mongodb.com/atlas and create a free account
2. Create a free M0 cluster (choose Frankfurt for EU)
3. Create a database user with a password
4. Whitelist `0.0.0.0/0` (allow all IPs) under Network Access
5. Copy your connection string: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/aurum`

### Step 2 — GitHub
```bash
git init
git add .
git commit -m "Initial commit — Aurum Ristorante backend"
git remote add origin https://github.com/YOUR_USERNAME/aurum-backend.git
git push -u origin main
```

### Step 3 — Render
1. Go to https://render.com and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Add all environment variables from `.env.example` in the Render dashboard
6. Click **Deploy**
7. Your API will be live at: `https://aurum-ristorante-api.onrender.com`

### Step 4 — Connect Frontend
In `public/index.html`, update line 1 of the script:
```js
const API_BASE = 'https://aurum-ristorante-api.onrender.com'; // ← your Render URL
```

### Step 5 — Seed on Render
After first deploy, run the seed script via Render's Shell tab:
```bash
node seed.js
```

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reservations` | Submit a reservation |
| `GET`  | `/api/menu` | Get full menu (grouped by category) |
| `GET`  | `/api/gallery` | Get gallery images |
| `POST` | `/api/contact` | Send contact message |
| `GET`  | `/api/locations` | Get all locations |
| `GET`  | `/api/locations/:id` | Get single location |
| `GET`  | `/api/locations/:id/hours` | Is restaurant open right now? |
| `GET`  | `/health` | Server health check |

### Protected Endpoints (require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login |
| `POST` | `/api/auth/logout` | Admin logout |
| `GET`  | `/api/auth/me` | Current admin info |
| `GET`  | `/api/reservations` | List all reservations |
| `PATCH`| `/api/reservations/:id/status` | Update status |
| `DELETE` | `/api/reservations/:id` | Delete reservation |
| `GET`  | `/api/menu/all` | All menu items (incl. unavailable) |
| `POST` | `/api/menu` | Create menu item |
| `PUT`  | `/api/menu/:id` | Update menu item |
| `DELETE` | `/api/menu/:id` | Delete menu item |
| `POST` | `/api/gallery` | Upload image |
| `PUT`  | `/api/gallery/:id` | Update image metadata |
| `DELETE` | `/api/gallery/:id` | Delete image |

### Admin Panel Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Login page |
| `/admin` | Dashboard with stats |
| `/admin/reservations` | Manage reservations |
| `/admin/menu` | Add / edit / delete menu items |
| `/admin/gallery` | Upload and manage images |
| `/admin/locations` | View location info |

---

## Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Search "App passwords" → generate one for "Mail"
4. Use this 16-character password as `EMAIL_PASS` in `.env`

---

## Pitch Notes

**Problem this solves:**
> Aurum Ristorante had no web presence. Customers couldn't find opening hours, couldn't book online, and had no way to view the menu before visiting. The restaurant was losing reservations to competitors with basic websites.

**What the website delivers:**
- Professional online presence that matches the quality of the restaurant
- 24/7 online reservation system with automatic email confirmation
- Live menu that the owner can update from a simple admin panel
- Gallery management — upload real photos in seconds
- Open/closed status so customers always know when to visit
- WhatsApp integration for instant customer contact
- Mobile-friendly for the majority of users who will visit on phones

**How to charge for this:**
- One-time build fee: €800–€2,000 depending on market
- Monthly maintenance / hosting support: €50–€100/month
- Ongoing: menu updates, content changes, feature additions

---

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express 4
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer (Gmail / SMTP)
- **File uploads**: Multer
- **Security**: Helmet, CORS, express-rate-limit
- **Hosting**: Render.com (free tier)
- **DB hosting**: MongoDB Atlas (free tier)
