# HealthAI Next

AI-assisted personal health-check web application built with the MERN stack.

**Flow:** Create Profile → Describe Symptoms → Get Suggested Lab Tests → Upload Blood Report → Get AI Analysis → (If attention) Share Location → Get Matched Doctors/Hospitals Nearby

---

## Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Groq API Key** ([get one](https://console.groq.com/keys))
- **Google Places API Key** ([get one](https://console.cloud.google.com/))

---

## Quick Start

### 1. Clone & Navigate

```bash
cd healthai-next
```

### 2. Server Setup

```bash
cd server
cp .env.example .env
# Edit .env with your actual values (see below)
npm install
npm run dev
```

### 3. Client Setup (in a new terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:5000`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string. Use `mongodb://localhost:27017/healthai-next` for local or your Atlas URI |
| `JWT_SECRET` | A long random string for signing JWTs |
| `GROQ_API_KEY` | Your Groq API key (starts with `gsk_`) |
| `GOOGLE_PLACES_API_KEY` | Your Google Places API key (starts with `AIza`) |
| `PORT` | Server port (default: `5000`) |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:5000`) |

---

## Google Places API Key — Setup Guide

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services → Library**
4. Search for and enable **"Places API (New)"**
5. Go to **APIs & Services → Credentials**
6. Click **"Create Credentials" → "API Key"**
7. **Restrict the key** (recommended):
   - Under "API restrictions", select "Restrict key" and choose "Places API (New)" only
   - Under "Application restrictions", optionally restrict by server IP
8. Copy the key to your `server/.env` as `GOOGLE_PLACES_API_KEY`

> **Note:** Google provides ~$200/month in free usage credit, which comfortably covers development and light real-world use.

---

## MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Edition ([guide](https://www.mongodb.com/docs/manual/installation/))
2. Start the MongoDB service
3. Set `MONGO_URI=mongodb://localhost:27017/healthai-next` in `.env`

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Copy the connection string and set it as `MONGO_URI` in `.env`

---

## Project Structure

```
healthai-next/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── pages/               # 8 page components
│       ├── components/          # Shared UI components
│       ├── context/             # Auth context
│       └── api/                 # Axios instance + API endpoints
└── server/                      # Express backend
    ├── models/                  # Mongoose schemas (5 models)
    ├── routes/                  # API route handlers
    ├── services/                # AI + Google Places services
    ├── middleware/               # Auth + file upload
    ├── sockets/                 # Socket.io emergency handler
    └── config/                  # Database config
```

---

## Features

- **Symptom Analysis:** AI-powered symptom checker using Groq openai/gpt-oss-20b
- **Blood Report Analysis:** Upload PDF/image reports, OCR extraction, AI-powered findings
- **Doctor Search:** Live Google Places API search for specialists near you
- **Dashboard:** View history of symptom checks, reports, and appointments
- **Emergency SOS:** Real-time Socket.io emergency alert system
- **Authentication:** JWT-based auth with bcrypt password hashing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Socket.io-client, Lucide |
| Backend | Node.js 20, Express.js, Mongoose, JWT, bcrypt, Helmet, Multer, Socket.io |
| Database | MongoDB |
| AI | Groq API (openai/gpt-oss-20b) |
| Doctor Search | Google Places API (New) |
| OCR | pdf-parse (PDF), tesseract.js (images) |

---

## API Endpoints

```
POST   /auth/register          # Create account
POST   /auth/login             # Login
GET    /api/profile             # Get user profile
PUT    /api/profile             # Update profile

POST   /api/symptoms            # Submit symptoms for AI analysis
GET    /api/symptoms/history    # Get symptom check history

POST   /api/reports/upload      # Upload blood report
POST   /api/reports/:id/analyze # Analyze report with AI
GET    /api/reports/:id         # Get report details
GET    /api/reports             # Get all reports

POST   /api/doctors/nearby      # Search doctors via Google Places

GET    /api/appointments        # Get appointments
POST   /api/appointments        # Create appointment

WS     /emergency               # Socket.io emergency namespace
```

---

## Medical Disclaimer

This tool provides general guidance only and is not a substitute for professional medical diagnosis. Please consult a licensed doctor for medical concerns, especially anything urgent.
