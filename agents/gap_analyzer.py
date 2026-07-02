from typing import Any, Dict, List


ROLE_SKILLS = {
  "software engineer": [
    ("Data structures", "High"),
    ("Algorithms basics", "High"),
    ("Git & collaboration", "High"),
    ("Debugging & testing", "Medium"),
    ("System design basics", "Medium"),
  ],
  "frontend developer": [
    ("HTML/CSS fundamentals", "High"),
    ("JavaScript fundamentals", "High"),
    ("DOM, events, and state", "High"),
    ("Accessibility (a11y)", "Medium"),
    ("Performance & tooling", "Medium"),
  ],
  "backend developer": [
    ("HTTP & REST APIs", "High"),
    ("Databases (SQL)", "High"),
    ("Authentication basics", "High"),
    ("Testing APIs", "Medium"),
    ("Deployment basics", "Medium"),
  ],
  "data scientist": [
    ("Python", "High"),
    ("Statistics", "High"),
    ("Pandas/NumPy", "High"),
    ("Model evaluation", "Medium"),
    ("Projects & portfolio", "Medium"),
  ],
  "product manager": [
    ("User research", "High"),
    ("Roadmaps & prioritization", "High"),
    ("Metrics & analytics", "Medium"),
    ("Communication & alignment", "High"),
    ("Execution planning", "Medium"),
  ],
  "business analyst": [
    ("SQL", "High"),
    ("Spreadsheets modeling", "Medium"),
    ("Dashboards & visualization", "High"),
    ("Requirements writing", "Medium"),
    ("Stakeholder communication", "High"),
  ],
  "devops engineer": [
    ("Linux fundamentals", "High"),
    ("Networking basics", "High"),
    ("CI/CD pipelines", "High"),
    ("Cloud fundamentals", "Medium"),
    ("Infrastructure as code", "Medium"),
  ],
}


def _normalize_role(role: str) -> str:
  r = (role or "").strip().lower()
  mapping = {
    "software_engineer": "software engineer",
    "frontend_dev": "frontend developer",
    "backend_dev": "backend developer",
    "data_scientist": "data scientist",
    "product_manager": "product manager",
    "business_analyst": "business analyst",
    "devops": "devops engineer",
    "ml_engineer": "data scientist",
  }
  return mapping.get(r, r)


def _time_weeks(importance: str, experience_level: str) -> int:
  base = 6 if importance == "High" else 4
  if experience_level in {"advanced", "expert"}:
    return max(2, base - 3)
  if experience_level == "intermediate":
    return max(3, base - 1)
  if experience_level == "some_knowledge":
    return base
  return base + 2


def analyze_gaps(user_data: Dict[str, Any]) -> Dict[str, Any]:
  role = _normalize_role(str(user_data.get("target_role", "")))
  experience_level = str(user_data.get("experience_level", ""))
  available_hours = float(user_data.get("available_hours") or 0)

  skills = ROLE_SKILLS.get(role) or ROLE_SKILLS.get("software engineer")
  technical = []
  total_hours = 0
  priority = []

  for name, importance in skills:
    weeks = _time_weeks(importance, experience_level)
    learning_hours = int(round(weeks * max(3.0, min(available_hours, 30.0)) * 0.35))
    total_hours += learning_hours
    priority.append(name)
    technical.append(
      {
        "skill": name,
        "importance": importance,
        "learning_time_weeks": weeks,
        "resources": ["youtube", "courses", "projects"],
      }
    )

  soft = [
    {"skill": "Communication (clear updates, writing, explaining)", "importance": "High"},
    {"skill": "Time management & consistency", "importance": "High"},
    {"skill": "Problem decomposition", "importance": "Medium"},
  ]

  quick_wins = [
    "Create a 1-page learning plan and commit to 3 sessions this week",
    "Build a small portfolio artifact (1 feature or 1 notebook) and publish it",
  ]

  long_term = [
    "Complete 2–3 role-aligned projects with clean documentation",
    "Practice interviews weekly (technical + behavioral) and refine your resume",
  ]

  return {
    "technical_skills": technical[:8],
    "soft_skills": soft,
    "total_learning_hours": total_hours,
    "priority_order": priority[:5],
    "quick_wins": quick_wins,
    "long_term_goals": long_term,
    "effort_estimate": {
      "hours_per_week": available_hours,
      "weeks_to_first_offer_ready": max(8, min(52, int(round(total_hours / max(5.0, available_hours))))),
    },
  }

