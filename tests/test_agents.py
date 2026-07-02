import unittest

from agents.profile_analyzer import analyze_profile
from agents.gap_analyzer import analyze_gaps
from agents.resource_recommender import recommend_resources
from agents.study_plan_generator import generate_study_plan
from agents.career_advisor import advise_career


class TestAgents(unittest.TestCase):
  def setUp(self):
    self.data = {
      "education_level": "bachelors",
      "field_of_interest": "technology",
      "target_role": "software_engineer",
      "available_hours": 15,
      "learning_style": "visual",
      "experience_level": "intermediate",
      "career_timeline": "6 months",
      "preferred_resources": ["youtube", "courses"],
    }

  def test_profile(self):
    result = analyze_profile(self.data)
    self.assertIn("summary", result)
    self.assertIn("strengths", result)
    self.assertIn("estimated_readiness", result)

  def test_gaps(self):
    result = analyze_gaps(self.data)
    self.assertIn("technical_skills", result)
    self.assertTrue(len(result["technical_skills"]) > 0)

  def test_resources(self):
    result = recommend_resources(self.data)
    self.assertIn("youtube_videos", result)
    self.assertIn("online_courses", result)

  def test_plan(self):
    result = generate_study_plan(self.data)
    self.assertIn("weekly_plans", result)
    self.assertTrue(len(result["weekly_plans"]) > 0)

  def test_career(self):
    result = advise_career(self.data)
    self.assertIn("career_roadmap", result)
    self.assertTrue(len(result["career_roadmap"]) > 0)


if __name__ == "__main__":
  unittest.main()

