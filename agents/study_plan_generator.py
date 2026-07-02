from typing import Any, Dict, List


def _weeks_from_timeline(career_timeline: str) -> int:
  t = (career_timeline or "").strip().lower()
  if t.startswith("3"):
    return 12
  if t.startswith("6"):
    return 24
  if t.startswith("1 year"):
    return 52
  if t.startswith("2"):
    return 80
  return 12


def _topic_tracks(target_role: str) -> List[str]:
  r = (target_role or "").lower()
  if "data" in r or "analyst" in r or "scientist" in r:
    return ["Foundations (Python/SQL)", "Statistics", "Data analysis workflows", "Projects & portfolio", "Interview prep"]
  if "frontend" in r or "front-end" in r:
    return ["HTML/CSS", "JavaScript", "Accessibility + responsive UI", "Projects", "Interview prep"]
  if "backend" in r:
    return ["HTTP & APIs", "Databases", "Auth + security basics", "Projects", "Deployment"]
  if "product" in r:
    return ["Product thinking", "User research", "Roadmaps + prioritization", "Metrics", "Case interview prep"]
  return ["Fundamentals", "Practice", "Projects", "Portfolio", "Interview prep"]


def generate_study_plan(user_data: Dict[str, Any]) -> Dict[str, Any]:
  target_role = str(user_data.get("target_role", ""))
  learning_style = str(user_data.get("learning_style", ""))
  hours_per_week = float(user_data.get("available_hours") or 0)
  weeks = _weeks_from_timeline(str(user_data.get("career_timeline", "")))
  tracks = _topic_tracks(target_role)

  effective_hours = max(5.0, min(hours_per_week, 30.0))
  per_week = round(effective_hours, 1)

  weekly_plans = []
  total_hours = 0
  plan_weeks = min(weeks, 24)

  for w in range(1, plan_weeks + 1):
    theme = tracks[(w - 1) % len(tracks)]
    topic_a = f"{theme}: Core concepts"
    topic_b = f"{theme}: Practice + exercises"
    topic_c = "Mini-project / milestone"

    topics = [
      {"name": topic_a, "hours": round(per_week * 0.35, 1), "resources": ["youtube", "docs"], "practice": "Summarize 5 key ideas", "milestone": "Explain the concept in your own words"},
      {"name": topic_b, "hours": round(per_week * 0.40, 1), "resources": ["exercises", "projects"], "practice": "Complete 6–10 focused exercises", "milestone": "Solve 2 problems without looking up answers"},
      {"name": topic_c, "hours": round(per_week * 0.25, 1), "resources": ["project"], "practice": "Build a small feature and commit to Git", "milestone": "Publish a weekly update (README or notes)"},
    ]

    week_total = sum(float(t["hours"]) for t in topics)
    total_hours += week_total

    weekly_plans.append(
      {
        "week": w,
        "theme": theme,
        "topics": topics,
        "total_hours": round(week_total, 1),
        "practice_project": f"Week {w} mini-project aligned to {target_role}",
        "checkpoint": "Can you teach the concept + show a working example?",
      }
    )

  milestones = [
    {"month": 1, "goal": "Build momentum and fundamentals", "deliverable": "1 small project + notes"},
    {"month": 3, "goal": "Portfolio proof", "deliverable": "2–3 projects with clear documentation"},
  ]

  daily_example = "Mon/Wed/Fri: 60–90 min focused study, Tue/Thu: 45–60 min practice, Weekend: 2–3 hr project block"
  if learning_style == "hands_on":
    daily_example = "3x/week: 60 min learning + 60 min building, Weekend: 3 hr project block + reflection"

  return {
    "overview": f"A {weeks}-week plan for {target_role} optimized for {per_week:g} hours/week and {learning_style.replace('_', ' ')} learning.",
    "weekly_plans": weekly_plans,
    "milestones": milestones,
    "daily_schedule_example": daily_example,
    "success_metrics": ["hours studied per week", "projects shipped", "practice problems solved", "weekly reflection completed"],
    "estimated_total_hours": round(total_hours * (weeks / plan_weeks), 1),
  }

