from typing import Any, Dict, List

from database import get_course_resources, get_youtube_resources


def _topic_from_profile(user_data: Dict[str, Any]) -> str:
  role = str(user_data.get("target_role", "")).strip()
  field = str(user_data.get("field_of_interest", "")).strip().lower()

  r = role.lower()
  if "python" in r:
    return "Python"
  if "javascript" in r or "frontend" in r or "front-end" in r:
    return "JavaScript"
  if "data" in r or "analyst" in r or "scientist" in r:
    return "Data"
  if "devops" in r:
    return "DevOps"
  if "product" in r:
    return "Product"
  if "technology" in field or "it" in field:
    return "JavaScript"
  if "business" in field or "finance" in field:
    return "Business"
  return "General"


def _difficulty_from_experience(experience_level: str) -> str:
  exp = (experience_level or "").lower()
  if exp in {"complete_beginner"}:
    return "Beginner"
  if exp in {"some_knowledge"}:
    return "Beginner"
  if exp in {"intermediate"}:
    return "Intermediate"
  if exp in {"advanced", "expert"}:
    return "Advanced"
  return "Beginner"


def _why(style: str) -> str:
  s = (style or "").lower()
  if s == "visual":
    return "Video-first pacing with clear visuals and examples."
  if s == "auditory":
    return "Lecture-friendly explanations you can replay and summarize."
  if s == "reading_writing":
    return "Strong written structure and reference quality."
  if s == "hands_on":
    return "Practical exercises and project-oriented learning."
  return "Balanced resource that supports both understanding and practice."


def recommend_resources(user_data: Dict[str, Any]) -> Dict[str, Any]:
  topic = _topic_from_profile(user_data)
  difficulty = _difficulty_from_experience(str(user_data.get("experience_level", "")))
  style = str(user_data.get("learning_style", ""))
  preferred = set(user_data.get("preferred_resources") or [])

  youtube_rows = get_youtube_resources(topic=topic if topic not in {"General", "Business"} else "", difficulty=difficulty if topic != "General" else "")
  course_rows = get_course_resources(topic=topic if topic not in {"General"} else "")

  youtube_videos = []
  for row in youtube_rows[:5]:
    youtube_videos.append(
      {
        "title": row.get("title"),
        "channel": row.get("channel") or "",
        "url": row.get("url"),
        "duration_minutes": row.get("duration_minutes") or 0,
        "difficulty": row.get("difficulty") or difficulty,
        "topic": row.get("topic") or topic,
        "why_recommended": _why(style),
        "estimated_completion": "1–2 weeks (steady sessions)",
      }
    )

  online_courses = []
  for row in course_rows[:5]:
    online_courses.append(
      {
        "title": row.get("title"),
        "provider": row.get("provider") or "",
        "url": row.get("url"),
        "duration_weeks": row.get("duration_weeks") or 0,
        "cost": 0 if row.get("cost") is None else row.get("cost"),
        "difficulty": row.get("difficulty") or difficulty,
        "rating": row.get("rating") or 4.6,
        "why_recommended": _why(style),
        "certificate": bool(row.get("certificate")),
      }
    )

  books = [
    {
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt, David Thomas",
      "topic": "Software Engineering",
      "difficulty": "Intermediate",
      "pages": 352,
      "estimated_reading_hours": 10,
    },
    {
      "title": "Grokking Algorithms",
      "author": "Aditya Bhargava",
      "topic": "Algorithms",
      "difficulty": "Beginner",
      "pages": 256,
      "estimated_reading_hours": 8,
    },
  ]

  free_resources = [
    {"title": "Roadmap.sh (role roadmaps)", "type": "roadmap", "url": "https://roadmap.sh/"},
    {"title": "MDN Web Docs", "type": "documentation", "url": "https://developer.mozilla.org/"},
    {"title": "freeCodeCamp", "type": "course", "url": "https://www.freecodecamp.org/"},
  ]

  if preferred and "youtube" not in preferred:
    youtube_videos = []
  if preferred and "courses" not in preferred:
    online_courses = []
  if preferred and "books" not in preferred:
    books = []
  if preferred and "projects" in preferred:
    free_resources.append({"title": "Project ideas (build portfolio)", "type": "projects", "url": "https://github.com/topics/project-ideas"})

  return {
    "youtube_videos": youtube_videos,
    "online_courses": online_courses,
    "books": books,
    "free_resources": free_resources,
  }

