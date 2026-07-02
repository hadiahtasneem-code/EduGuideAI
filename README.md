# 🎓 EduGuide AI – Multi-Agent Learning, Upskilling & Career Mentor

> **An AI-powered educational platform where multiple intelligent agents collaborate to analyze learning gaps, generate personalized study plans, recommend resources, and build career roadmaps.**

---

## ✨ Features

### 🤖 Multi-Agent Intelligence

EduGuide AI uses multiple specialized AI-inspired agents that work together to provide personalized guidance.

* 👤 **Profile Agent** – Analyzes strengths and areas for improvement
* 📊 **Learning Gap Agent** – Identifies technical & soft skill gaps
* 📅 **Study Planner Agent** – Creates structured weekly study plans
* 📚 **Resource Recommender Agent** – Suggests YouTube videos, courses, books & free learning resources
* 🚀 **Career Advisor Agent** – Builds personalized career roadmaps with market insights

---

## 🎨 Premium User Experience

* 🌟 Modern SaaS-style dashboard
* 🌗 Light & Dark mode
* 📈 Animated progress bars, charts & widgets
* ⚡ Interactive loading screen with AI agent pipeline animation
* 💬 AI Tutor (ChatGPT-inspired interface)
* ✅ Study Planner with daily & weekly task management
* 📚 Resource recommendation dashboard
* 🎯 Career roadmap with readiness tracker
* 📝 Quiz interface with timer & progress tracking
* 👤 Profile & Settings pages
* 📱 Fully responsive design

---

## 🛠️ Tech Stack

| Category    | Technology                                           |
| ----------- | ---------------------------------------------------- |
| 🐍 Backend  | Python, Flask                                        |
| 🎨 Frontend | HTML, CSS, Vanilla JavaScript                        |
| 💾 Database | SQLite                                               |
| 🤖 AI Logic | Offline Multi-Agent System (No external AI required) |

---

## 📁 Project Structure

```text
mul-ai2/
│
├── agents/                # Multi-agent modules
├── resources/             # Local datasets
├── tests/                 # API & Agent tests
│
├── css/
├── js/
│
├── app.py                 # Flask server
├── database.py            # SQLite helpers
├── index.html             # Landing page
├── form.html              # Main application
├── results.html           # Analysis results
├── dashboard.html         # Agent chat demo
├── eduguide.db            # SQLite database
└── requirements.txt
```

---

## 🚀 Getting Started

### 1️⃣ Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it (Windows)

```bash
.\.venv\Scripts\Activate.ps1
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Run the Application

```bash
python app.py
```

Open in your browser:

🏠 Landing Page

```
http://127.0.0.1:5000/
```

💻 Main Dashboard

```
http://127.0.0.1:5000/form
```

📊 Analysis Results

```
http://127.0.0.1:5000/results
```

---

## 🔗 API Endpoints

### 📌 Analyze Learning Profile

```
POST /api/analyze
```

Returns:

* User Profile
* Learning Analysis
* Skill Gap Analysis
* Study Plan
* Learning Resources
* Career Roadmap

---

### 📺 YouTube Resources

```
GET /api/resources/youtube
```

---

### 🎓 Course Recommendations

```
GET /api/resources/courses
```

---

### 📄 Export Report

```
POST /api/export/pdf
```

---

## 🌐 Application Pages

🏠 **Landing Page**

* Hero section
* Animated illustrations
* Feature showcase

💻 **Dashboard**

* Personalized overview
* Navigation panel
* Progress widgets

💬 **AI Tutor**

* ChatGPT-inspired interface
* Typing animation
* Quick actions

📊 **Learning Analysis**

* Student profile form
* Multi-agent analysis
* Personalized insights

📅 **Study Planner**

* Weekly planner
* Daily checklist
* Export options

📚 **Resources**

* Recommended videos
* Courses
* Books
* Free learning materials

🚀 **Career Mentor**

* Career roadmap
* Readiness tracker
* Timeline visualization

📝 **Quiz**

* Interactive quiz interface
* Timer
* Progress tracker

👤 **Profile & Settings**

* User profile management
* Theme preferences

---

## 🧪 Running Tests

```bash
pytest -q
```

---

## ⚙️ Environment Variables

Optional `.env`

```text
SECRET_KEY=
PORT=5000
DEBUG=true
```

---

## ♿ Accessibility

* ⌨️ Keyboard-friendly navigation
* 📱 Responsive on desktop & mobile
* 🌗 Optimized for both light & dark themes
* 🎨 Accessible color contrast

---

## 🛠️ Troubleshooting

### ❌ Network Error

* Ensure the Flask server is running.
* Open the application using:

```
http://127.0.0.1:5000/
```

instead of opening HTML files directly.

---

## 📜 License

This project is intended for **educational and demonstration purposes**.

Feel free to add your preferred open-source license before distributing the project.

---

