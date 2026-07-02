import unittest

from app import app
from database import init_db


class TestApi(unittest.TestCase):
  @classmethod
  def setUpClass(cls):
    init_db()

  def setUp(self):
    self.client = app.test_client()

  def test_analyze(self):
    payload = {
      "education_level": "bachelors",
      "field_of_interest": "technology",
      "target_role": "software_engineer",
      "available_hours": 15,
      "learning_style": "visual",
      "experience_level": "intermediate",
      "career_timeline": "6 months",
      "preferred_resources": ["youtube", "courses"],
    }

    res = self.client.post("/api/analyze", json=payload)
    self.assertEqual(res.status_code, 200)
    data = res.get_json()
    self.assertIn("analysis", data)
    self.assertIn("profile", data["analysis"])
    self.assertIn("gaps", data["analysis"])
    self.assertIn("resources", data["analysis"])
    self.assertIn("study_plan", data["analysis"])
    self.assertIn("career_path", data["analysis"])


if __name__ == "__main__":
  unittest.main()

