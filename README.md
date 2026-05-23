# 🤖 AiMock — AI-Powered Mock Interview Platform

A full-stack MERN application that generates tailored interview questions using **OpenAI GPT-4o-mini**, evaluates your answers with AI scoring, and stores your results in MongoDB.

---

## 🗂️ Project Structure

```
Aimock/
├── server/                   # Node.js + Express backend
│   ├── server.js             # Entry point
│   ├── .env                  # ← YOUR secrets go here
│   ├── models/
│   │   └── Interview.js      # Mongoose schema
│   ├── controllers/
│   │   └── interviewController.js
│   ├── routes/
│   │   └── interviewRoutes.js
│   └── services/
│       └── openaiService.js  # OpenAI API calls
│
└── client/                   # React + Vite frontend
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ScoreGauge.jsx
        │   └── FeedbackCard.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── InterviewPage.jsx
        │   ├── ResultPage.jsx
        │   └── DashboardPage.jsx
        └── services/
            └── api.js        # Axios HTTP client
```

---

## ⚡ Quick Setup (Step-by-Step)

### Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **MongoDB** — either [local install](https://www.mongodb.com/try/download/community) or a free [Atlas](https://www.mongodb.com/atlas) cluster
- **OpenAI API Key** — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

### Step 1 — Configure Environment Variables

Open `server/.env` and fill in your real values:

```env
MONGODB_URI=mongodb://localhost:27017/aimock
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5173
```

> ⚠️ **Never commit your `.env` to GitHub.** It's already listed in `.gitignore`.

---

### Step 2 — Start MongoDB

**Local:**
```bash
# Windows (if installed as a service, it may already be running)
net start MongoDB

# Or run manually:
mongod
```

**MongoDB Atlas:** No local start needed — just paste the Atlas connection string into `MONGODB_URI`.

---

### Step 3 — Start the Backend

```bash
cd server
npm install       # Already done if you just cloned
npm run dev       # Uses nodemon for auto-reload on file changes
# OR
npm start         # Plain node (no auto-reload)
```

Expected output:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5173
```

---

### Step 4 — Start the Frontend

Open a **new terminal tab**:

```bash
cd client
npm install       # Already done if you just cloned
npm run dev
```

Expected output:
```
  VITE v5.x ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

All endpoints are under `http://localhost:5173/api/interview`

| Method | Endpoint            | Body                                  | Response                              |
|--------|---------------------|---------------------------------------|---------------------------------------|
| POST   | `/start`            | `{ role }`                            | `{ interviewId, role, questions[] }` |
| POST   | `/evaluate`         | `{ interviewId, answers[] }`          | `{ answers[], overallScore }`         |
| GET    | `/history`          | —                                     | `{ interviews[] }`                    |
| GET    | `/:id`              | —                                     | `{ interview }`                       |

### Test with curl (optional)

```bash
# Start an interview
curl -X POST http://localhost:5173/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{"role": "Frontend Developer"}'

# Health check
curl http://localhost:5173/health
```

---

## 🖥️ Feature Walkthrough

| Page        | URL              | What it does                                           |
|-------------|------------------|--------------------------------------------------------|
| Home        | `/`              | Pick a role → click Start → AI generates 5 questions   |
| Interview   | `/interview`     | Answer questions one at a time with progress tracking  |
| Results     | `/results/:id`   | See score gauge, AI feedback per answer, summary stats |
| Dashboard   | `/dashboard`     | History of all past interviews with mini gauges        |

---

## 🤖 AI Models Used

| Function           | Model         | Notes                              |
|--------------------|---------------|------------------------------------|
| Question generation | `gpt-4o-mini` | Returns JSON array of 5 questions  |
| Answer evaluation   | `gpt-4o-mini` | Returns `{ score, feedback }` JSON |

---

## 🗄️ MongoDB Schema

```js
Interview {
  role:         String (enum of 8 roles)
  questions:    [String]
  answers: [{
    question:   String,
    answer:     String,
    score:      Number (0–10),
    feedback:   String
  }]
  overallScore: Number (0–10, average)
  status:       "in-progress" | "completed"
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}
```

---

## 🐞 Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerError: connect ECONNREFUSED` | Start MongoDB (`mongod` or `net start MongoDB`) |
| `401 Unauthorized` from OpenAI | Check your `OPENAI_API_KEY` in `server/.env` |
| `CORS error` in browser | Make sure both server (5173) and client (5173) are running |
| Questions not generating | Check server console for OpenAI error messages |
| Page shows blank after refresh on `/results` | Navigate from the interview flow; direct URL loads from DB |

---

## 🚀 Production Considerations

- Add **JWT authentication** to protect interview history per user
- Use **rate limiting** (`express-rate-limit`) to prevent API abuse
- Store **OpenAI costs** tracking per user
- Deploy backend to **Railway / Render**, frontend to **Vercel**
- Use **MongoDB Atlas** for the cloud database

---

Built with ❤️ using MERN + OpenAI GPT-4o-mini
