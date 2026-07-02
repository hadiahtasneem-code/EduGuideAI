# EduGuide AI — Multi‑Agent Learning, Upskilling & Career Mentor

EduGuide AI is a premium, interactive educational web app that generates a personalized learning profile, skill gap analysis, study plan, resources, and career roadmap using multiple specialized “agents”.

This repository includes:
- A Flask backend that exposes a small JSON API and serves the frontend
- A modern, animated frontend UI (light/dark mode, app shell, dashboards, overlays)
- Offline-friendly, deterministic agent logic (no external AI required)

---

## Key Features

### Multi‑Agent Analysis (Server)
- **Profile Agent**: summarizes strengths and improvement areas
- **Learning Gap Agent**: prioritizes technical/soft skill gaps and quick wins
- **Study Planner Agent**: produces a week-by-week plan and checkpoints
- **Resource Recommender Agent**: recommends YouTube, courses, books, and free resources
- **Career Advisor Agent**: creates a staged career roadmap and market insights

### Premium UI/UX (Frontend)
- **SaaS-style app shell** with collapsible sidebar navigation
- **Light/Dark mode** with smooth transitions and per-session persistence
- **Animated widgets** (counters, rings, progress bars)
- **Loading overlay** with agent pipeline animation
- **AI Tutor UI** (ChatGPT-style bubbles, typing animation, quick actions — UI only)
- **Planner UI** (daily checklist, weekly expand/collapse, export tools)
- **Resources UI** (premium tiles with badges, meta tags, hover lift)
- **Career UI** (readiness bar + expandable timeline)
- **Quiz UI** (timer, navigator, progress, completion summary — UI only)
- **Profile + Settings** pages (UI-only editing, grouped cards)

---

## Tech Stack

- **Backend**: Python + Flask
- **Frontend**: HTML + CSS + Vanilla JavaScript (no build step)
- **Data**: SQLite database (`eduguide.db`) for storing analysis results
- **Static assets**: served directly by Flask routes

---

## Project Structure

```text
mul-ai2/
  agents/                  # Multi-agent analysis modules
  css/
    styles.css             # Global theme + components + animations
  js/
    form.js                # App shell UI (dashboard/tutor/analysis/planner/...)
    results.js             # Results page UI rendering + actions
    app.js                 # Dashboard chat UI for offline agent demo
    landing.js             # Landing page animations (reveal + hero slideshow)
    utils.js               # Small DOM helpers and focus trap
    storage.js             # Client-side storage helpers (theme, chat history, etc.)
  resources/               # Local datasets used by recommenders
  tests/                   # Pytest tests for API/agents
  app.py                   # Flask server + API endpoints
  database.py              # SQLite access helpers
  index.html               # Landing page
  form.html                # Main premium app shell UI (single-page navigation)
  results.html             # Analysis results page (tabbed UI)
  dashboard.html           # Offline agent chat demo dashboard
  requirements.txt         # Python deps
  eduguide.db              # SQLite database (local)
```

---

## Getting Started

### 1) Create a virtual environment (recommended)

```bash
python -m venv .venv
```

Activate it:

- Windows (PowerShell):
```bash
.\.venv\Scripts\Activate.ps1
```

### 2) Install dependencies

```bash
pip install -r requirements.txt
```

### 3) Run the server

```bash
python app.py
```

Then open:
- Landing: http://127.0.0.1:5000/
- App Shell: http://127.0.0.1:5000/form
- Results: http://127.0.0.1:5000/results

---

## API Endpoints (Backend)

### POST `/api/analyze`

Runs the multi-agent pipeline and returns a combined payload:
- `timestamp`
- `user_profile`
- `analysis.profile`
- `analysis.gaps`
- `analysis.resources`
- `analysis.study_plan`
- `analysis.career_path`

Example:

```bash
curl -X POST http://127.0.0.1:5000/api/analyze ^
  -H "Content-Type: application/json" ^
  -d "{\"education_level\":\"bachelors\",\"field_of_interest\":\"technology\",\"target_role\":\"frontend_dev\",\"available_hours\":15,\"learning_style\":\"visual\",\"experience_level\":\"some_knowledge\",\"career_timeline\":\"6 months\",\"preferred_resources\":[\"youtube\",\"courses\"]}"
```

### GET `/api/resources/youtube?topic=...&difficulty=...`
Returns filtered YouTube resource items from the local DB/datasets.

### GET `/api/resources/courses?topic=...&cost=free|paid`
Returns filtered course resource items from the local DB/datasets.

### POST `/api/export/pdf`
Returns a message (the UI uses browser print-to-PDF).

---

## Frontend Pages & UX Notes

### Landing (`/`)
- Hero with animated background blobs
- Slide show illustration (SVG data images)
- Feature cards with hover lift + reveal-on-scroll
- Theme toggle stored in session (per tab)

### App Shell (`/form`)
Single-page navigation with sections:
- Dashboard
- AI Tutor (UI-only)
- Learning Analysis (profile form + summary panel)
- Study Planner (task checkboxes + exports)
- Resources (premium recommendation tiles)
- Career Mentor (timeline + readiness)
- Quiz (UI-only)
- Profile (UI-only editor)
- Settings (UI-only)

When you submit **Analyze**:
- A glass overlay appears with an **animated agent pipeline**
- The UI hydrates dashboard widgets + other pages from the analysis result

### Results (`/results`)
Tabbed results view using the last computed analysis stored in the browser session.

### Dashboard Chat (`/dashboard.html`)
Offline “agent chat” demo with:
- agent list (visual identity per agent)
- chat bubbles and thinking indicator
- theme toggle and settings modal (optional API key UI)

---

## Theme Persistence

Theme selection is stored in **sessionStorage** (per browser tab/session) under:
- `eduguide.theme`

This matches the requirement: “theme preference persists during the session”.

---

## Tests

Run tests with:

```bash
pytest -q
```

Tests live under:
- `tests/test_api.py`
- `tests/test_agents.py`

---

## Environment Variables

Optional `.env` values:
- `SECRET_KEY` (Flask secret key)
- `PORT` (default: `5000`)
- `DEBUG` (set to `true` for debug mode)

`.env` is ignored by git (see `.gitignore`).

---

## Accessibility & UX

The UI aims to be:
- keyboard-friendly (focusable buttons/inputs, modal behavior)
- readable in both themes (contrast + spacing)
- responsive (grids collapse and sidebar becomes off-canvas on smaller screens)

---

## Troubleshooting

### “Network error. Make sure the Python server is running.”
- Ensure `python app.py` is running
- Verify you’re opening pages via `http://127.0.0.1:5000/` (not directly from file explorer)

### Getting 404 for `/@vite/client`
This project does not use Vite. If a browser extension injects Vite paths, the server will return 404 safely.

---

## License

This project is provided for educational/demo purposes. Add your preferred license if you plan to distribute it.

