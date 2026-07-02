from typing import Any, Dict, List


def _normalize_role(role: str) -> str:
  r = (role or "").strip()
  if r in {"software_engineer", "Software Engineer"}:
    return "Software Engineer"
  if r in {"data_scientist", "Data Scientist"}:
    return "Data Scientist"
  if r in {"product_manager", "Product Manager"}:
    return "Product Manager"
  if r in {"frontend_dev", "Frontend Developer"}:
    return "Frontend Developer"
  if r in {"backend_dev", "Backend Developer"}:
    return "Backend Developer"
  if r in {"devops", "DevOps Engineer"}:
    return "DevOps Engineer"
  if r in {"business_analyst", "Business Analyst"}:
    return "Business Analyst"
  return r or "Your Target Role"


def _titles_for(role: str) -> List[str]:
  r = role.lower()
  if "data" in r:
    return ["Data Analyst", "Junior Data Scientist", "Data Scientist"]
  if "frontend" in r:
    return ["Frontend Developer", "UI Engineer", "Frontend Developer"]
  if "backend" in r:
    return ["Backend Developer", "API Engineer", "Backend Developer"]
  if "devops" in r:
    return ["DevOps Engineer", "Platform Engineer", "DevOps Engineer"]
  if "product" in r:
    return ["Associate PM", "Product Manager", "Product Manager"]
  return ["Junior Developer", "Software Engineer", "Software Engineer"]


def advise_career(user_data: Dict[str, Any]) -> Dict[str, Any]:
  experience = str(user_data.get("experience_level", ""))
  target = _normalize_role(str(user_data.get("target_role", "")))
  timeline = str(user_data.get("career_timeline", ""))
  titles = _titles_for(target)

  roadmap = [
    {
      "stage": "Current Position",
      "role": experience.replace("_", " ").title(),
      "duration_months": 0,
      "key_skills": ["Consistency", "Fundamentals", "Problem-solving"],
      "focus_areas": ["Clarify target role", "Build weekly learning routine"],
    },
    {
      "stage": "Step 1",
      "role": titles[0],
      "duration_months": 3,
      "key_skills": ["Core tools", "One portfolio project", "Resume basics"],
      "typical_salary_range": "$50k - $90k",
    },
    {
      "stage": "Step 2",
      "role": titles[1],
      "duration_months": 6,
      "key_skills": ["Projects", "Interview skills", "Collaboration"],
      "typical_salary_range": "$80k - $140k",
    },
    {
      "stage": "Final",
      "role": titles[2],
      "duration_months": 12,
      "key_skills": ["Depth in one specialty", "System thinking", "Communication"],
      "typical_salary_range": "$100k - $180k",
    },
  ]

  job_market = {
    "demand": "High",
    "growth_rate": "+10% YoY",
    "average_salary": "$110k",
    "salary_range": ["$70k", "$180k"],
    "top_companies": ["Mid-size tech", "Startups", "Enterprise teams"],
    "job_titles": titles,
  }

  networking = "Reach out to 2–3 people per week, ask role-specific questions, and share your work publicly (projects + short writeups)."

  interview_prep = ["Role fundamentals", "Project deep-dives", "Behavioral stories (STAR)", "Mock interviews weekly"]

  side_projects = [
    f"A portfolio project aligned to {target}",
    "A small tool that solves a real personal problem",
    "A capstone project with README + demo + learnings",
  ]

  certifications = []
  if "data" in target.lower():
    certifications = ["Google Data Analytics (optional)", "SQL certification (optional)"]
  elif "devops" in target.lower():
    certifications = ["AWS Cloud Practitioner (optional)", "Linux foundation basics (optional)"]
  elif "product" in target.lower():
    certifications = ["Product analytics course (optional)"]

  next_steps = [
    "Pick one role-aligned project and define a 2-week milestone",
    "Update resume with measurable bullets and link portfolio",
    "Apply to a small batch of roles weekly and iterate based on feedback",
  ]

  return {
    "career_roadmap": roadmap,
    "job_market_insights": job_market,
    "networking_strategy": networking,
    "interview_prep": interview_prep,
    "side_projects_to_build": side_projects,
    "certifications_to_pursue": certifications,
    "next_steps": next_steps,
    "timeline": timeline,
  }

