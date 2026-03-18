# 🎓 Alumni Connect — Full-Stack Alumni Management Platform

A complete, production-ready web application for managing alumni data, events, mentorship, job postings, and donations.

---

## 🗂️ Project Structure

```
alumni-platform/
├── backend/                  # Node.js + Express REST API
│   ├── server.js             # App entry point
│   ├── .env.example          # Environment variables template
│   ├── database/
│   │   ├── db.js             # SQLite schema + connection
│   │   └── seed.js           # Demo data seeder
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Login, register, /me
│       ├── alumni.js         # Alumni CRUD
│       ├── events.js         # Events + registration
│       ├── jobs.js           # Job board + applications
│       ├── mentorship.js     # Mentors + session requests
│       ├── donations.js      # Donations + summary
│       └── stats.js          # Dashboard stats
│
└── frontend/                 # React + Vite SPA
    ├── index.html
    ├── vite.config.js        # Dev proxy → backend :5000
    └── src/
        ├── main.jsx
        ├── App.jsx           # Router + layout
        ├── api/
        │   └── index.js      # Axios instance with JWT
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── Icon.jsx
        │   └── Toast.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── AlumniDirectory.jsx
        │   ├── Events.jsx
        │   ├── Mentorship.jsx
        │   ├── Jobs.jsx
        │   └── Donations.jsx
        └── styles/
            └── global.css
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Seed the database with demo data
npm run seed

# Start the dev server
npm run dev
```

The API will run on **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will run on **http://localhost:5173**

---

## 🔐 Demo Login Credentials

All accounts use password: `password123`

| Role    | Email                  | Access |
|---------|------------------------|--------|
| Admin   | admin@alumni.edu       | Full access, create events |
| Alumni  | priya@alumni.edu       | Standard alumni access |
| Student | student@alumni.edu     | View-only, apply to jobs |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| POST   | /api/auth/login        | Login |
| POST   | /api/auth/register     | Register |
| GET    | /api/auth/me           | Current user |

### Alumni
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| GET    | /api/alumni            | List all (filter: search, status, batch) |
| GET    | /api/alumni/:id        | Get single profile |
| POST   | /api/alumni            | Create profile |
| PUT    | /api/alumni/:id        | Update profile |
| DELETE | /api/alumni/:id        | Delete (admin only) |

### Events
| Method | Endpoint                   | Description |
|--------|----------------------------|-------------|
| GET    | /api/events                | List events |
| POST   | /api/events/:id/register   | Toggle registration |

### Jobs
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| GET    | /api/jobs            | List jobs |
| POST   | /api/jobs            | Post a job |
| POST   | /api/jobs/:id/apply  | Apply to job |

### Mentorship
| Method | Endpoint                      | Description |
|--------|-------------------------------|-------------|
| GET    | /api/mentorship/mentors       | List mentors |
| POST   | /api/mentorship/request       | Send request |
| GET    | /api/mentorship/requests      | My requests |

### Donations
| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| GET    | /api/donations/summary  | Totals + top donors |
| POST   | /api/donations          | Make a donation |
| GET    | /api/donations/mine     | My history |

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, React Router v6, Axios, Vite |
| Backend   | Node.js, Express.js |
| Database  | SQLite (via better-sqlite3) |
| Auth      | JWT (jsonwebtoken + bcryptjs) |
| Styling   | Pure CSS with CSS Variables |

---

## 🔧 Environment Variables

```env
PORT=5000
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📦 Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables in your platform
2. Set start command: `node server.js`
3. For production, replace SQLite with PostgreSQL (pg + postgres adapter)

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Update `vite.config.js` proxy with your production API URL

---

## ✨ Features

- ✅ JWT authentication with role-based access (Admin / Alumni / Student)
- ✅ Alumni directory with search and filters
- ✅ Event management with capacity tracking and registration
- ✅ Job board with one-click application
- ✅ Mentorship request system
- ✅ Donation portal with leaderboard and purpose tracking
- ✅ Dashboard with stats and charts
- ✅ Fully responsive design

---

## 🔜 Next Steps (Suggested Enhancements)

- [ ] Email notifications (Nodemailer / SendGrid)
- [ ] File uploads for profile photos (Multer + S3)
- [ ] Admin panel for managing all users
- [ ] Real-time chat between alumni (Socket.io)
- [ ] LinkedIn OAuth login
- [ ] Mobile app (React Native)
- [ ] Switch SQLite → PostgreSQL for production
