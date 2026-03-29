#  Client Lead Management System (Mini CRM)

A full-stack **Client Lead Management System (Mini CRM)** built using the MERN stack principles.  
This application helps businesses track, manage, and convert leads generated from website contact forms.

---

##  Overview

This project simulates a real-world CRM used by agencies, freelancers, and startups to:

- Store incoming leads
- Track their progress
- Manage follow-ups
- Convert leads into clients

---

##  Features

### Core Features
-  Secure Admin Authentication (JWT)
-  Lead Management (Create, Read, Update, Delete)
-  Lead Status Tracking (New → Contacted → Converted)
-  Notes & Follow-ups per Lead
-  Live Search & Filtering
-  Dashboard with analytics (conversion rate, loss rate)
-  Lead trends visualization (charts)

---

## Tech Stack

### Frontend
- React (Vite + TypeScript)
- Axios
- React Router
- Recharts (for analytics)

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt (password hashing)

### Database
- MongoDB (Mongoose)

---

## Project Structure
mini-crm/
│
├── client/ # React frontend
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── api/
│
├── server/ # Node.js backend
│ ├── models/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│
└── README.md


---

##  Installation & Setup

### Clone the repository

```bash
git clone https://github.com/JP254-arch/mini-CRM.git
cd mini-crm

```
## BACKEND SETUP
cd server
npm install

# Create a .env file
PORT=5000
MONGO_URI= your database name( mini-crm)
JWT_SECRET=Your_secret_key


## Run Backend
npm run dev


## FRONTEND SETUP
cd client
npm install
npm run dev

