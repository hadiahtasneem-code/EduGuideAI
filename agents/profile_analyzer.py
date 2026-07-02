from typing import Any, Dict, List


def _readiness_score(experience_level: str, available_hours: float) -> int:
  exp_map = {
    "complete_beginner": 20,
    "some_knowledge": 35,
    "intermediate": 55,
    "advanced": 75,
    "expert": 90,
  }
  base = exp_map.get(experience_level, 40)
  hours_bonus = min(20, max(0, int(round((available_hours or 0) / 2))))
  return max(10, min(95, base + hours_bonus))


def _strengths(education_level: str, experience_level: str) -> List[str]:
  strengths = []
  if education_level in {"masters", "professional"}:
    strengths.append("Strong learning discipline and ability to handle complex material")
  if education_level in {"bachelors", "masters"}:
    strengths.append("Familiarity with structured learning and long-term goals")
  if experience_level in {"advanced", "expert"}:
    strengths.append("High confidence with applied problem-solving")
  if experience_level in {"intermediate"}:
    strengths.append("Solid foundation with room to specialize quickly")
  if not strengths:
    strengths.append("Curiosity and willingness to build skills step-by-step")
    strengths.append("Ability to learn consistently with the right plan")
  return strengths[:3]


def _areas_to_improve(target_role: str, experience_level: str) -> List[str]:
  t = (target_role or "").lower()
  base = []
  if "data" in t or "analyst" in t or "scientist" in t:
    base = ["SQL fundamentals and data modeling", "Practical projects with real datasets", "Clear storytelling with charts and metrics"]
  elif "frontend" in t or "front-end" in t:
    base = ["Modern JavaScript + DOM mastery", "Responsive UI and accessibility", "Portfolio-quality projects"]
  elif "backend" in t or "api" in t:
    base = ["HTTP/API fundamentals", "Databases and data modeling", "Deployment basics"]
  elif "devops" in t:
    base = ["Linux and networking basics", "CI/CD fundamentals", "Cloud deployment concepts"]
  else:
    base = ["Role-specific fundamentals", "Project experience that proves skills", "Interview and communication readiness"]

  if experience_level in {"advanced", "expert"}:
    return base[:2]
  return base[:3]


def _learning_tips(learning_style: str) -> str:
  style = (learning_style or "").lower()
  if style == "visual":
    return "Prioritize short videos, diagrams, and visual notes; summarize each session with a one-page concept map."
  if style == "auditory":
    return "Use lectures/podcasts for first exposure, then reinforce with a small written summary and 2–3 practice questions."
  if style == "reading_writing":
    return "Lean on structured books/articles, keep a running cheat-sheet, and do end-of-chapter exercises to lock in concepts."
  if style == "hands_on":
    return "Start with tiny projects early; learn one concept, then immediately apply it in a small build or exercise."
  return "Mix formats: learn the concept, do a practice task, and end with a short recap for spaced repetition."


def analyze_profile(user_data: Dict[str, Any]) -> Dict[str, Any]:
  education_level = str(user_data.get("education_level", ""))
  field = str(user_data.get("field_of_interest", ""))
  target_role = str(user_data.get("target_role", ""))
  experience_level = str(user_data.get("experience_level", ""))
  learning_style = str(user_data.get("learning_style", ""))
  available_hours = float(user_data.get("available_hours") or 0)

  readiness = _readiness_score(experience_level, available_hours)

  summary = (
    f"You’re aiming for {target_role} in {field}. "
    f"With {available_hours:g} hours/week and a {learning_style.replace('_', ' ')} learning style, "
    "we can build a realistic plan that compounds quickly."
  )

  return {
    "summary": summary,
    "strengths": _strengths(education_level, experience_level),
    "areas_to_improve": _areas_to_improve(target_role, experience_level),
    "learning_style_tips": _learning_tips(learning_style),
    "recommended_approach": "Focus on fundamentals → deliberate practice → portfolio proof → interview readiness.",
    "estimated_readiness": f"{readiness}%",
    "swot": {
      "strengths": _strengths(education_level, experience_level),
      "weaknesses": _areas_to_improve(target_role, experience_level)[:2],
      "opportunities": ["Leverage a structured weekly plan", "Build a portfolio project aligned to your target role"],
      "threats": ["Inconsistent schedule", "Learning too broadly without role focus"],
    },
  }

