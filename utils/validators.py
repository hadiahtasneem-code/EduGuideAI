from typing import Any, Dict, List, Tuple


REQUIRED_FIELDS = [
  "education_level",
  "field_of_interest",
  "target_role",
  "available_hours",
  "learning_style",
  "experience_level",
  "career_timeline",
  "preferred_resources",
]


def _as_list(v: Any) -> List[str]:
  if v is None:
    return []
  if isinstance(v, list):
    return [str(x) for x in v]
  return [str(v)]


def validate_and_normalize_profile(raw: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
  missing = [k for k in REQUIRED_FIELDS if k not in raw]
  if missing:
    return False, {"missing_fields": missing}

  preferred = _as_list(raw.get("preferred_resources"))
  preferred = [p.strip().lower() for p in preferred if str(p).strip()]
  if len(preferred) == 0:
    return False, {"preferred_resources": "Select at least one resource type."}

  try:
    hours = float(raw.get("available_hours"))
  except Exception:
    return False, {"available_hours": "Must be a number."}

  if hours <= 0 or hours > 80:
    return False, {"available_hours": "Must be between 1 and 80."}

  data = {
    "education_level": str(raw.get("education_level")).strip(),
    "field_of_interest": str(raw.get("field_of_interest")).strip(),
    "target_role": str(raw.get("target_role")).strip(),
    "available_hours": hours,
    "learning_style": str(raw.get("learning_style")).strip(),
    "experience_level": str(raw.get("experience_level")).strip(),
    "career_timeline": str(raw.get("career_timeline")).strip(),
    "preferred_resources": preferred,
  }

  if not data["education_level"] or not data["field_of_interest"] or not data["target_role"]:
    return False, {"message": "Education level, field of interest, and target role are required."}

  return True, data
