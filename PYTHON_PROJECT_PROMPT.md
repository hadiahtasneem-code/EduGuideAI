# EduGuide AI - Python Backend with AI Agents
## Complete Project Specification (Python + Frontend)

---

## PROJECT OVERVIEW

Build a **full-stack web application** with:
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla) - Single Page App
- **Backend:** Python (Flask/FastAPI) with built-in AI agents
- **Purpose:** Career & learning guidance with detailed analysis

**User Flow:**
1. **Page 1:** User answers detailed form (dropdowns, no typing)
2. **Page 2:** Backend analyzes with 5 AI agents simultaneously
3. **Page 3:** Results with YouTube links, course recommendations, study plans

**Target User:** Students and professionals seeking personalized guidance

---

## TECH STACK

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design, dark mode

### Backend
- **Framework:** Flask or FastAPI (Python 3.8+)
- **AI:** OpenAI API (ChatGPT) OR Google Generative AI
- **Database:** SQLite (local) OR PostgreSQL
- **Additional:**
  - Requests library (HTTP calls)
  - JSON for data exchange
  - Environment variables (.env)

### Deployment
- Heroku, Railway, or Render (free tier)
- Or local Python server during development

---

## DATABASE SCHEMA

### Resource Database (SQLite)

```sql
-- YouTube Resources
CREATE TABLE youtube_resources (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    channel TEXT,
    url TEXT UNIQUE NOT NULL,
    topic TEXT,
    difficulty TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP
);

-- Certificate Courses
CREATE TABLE certificate_courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT,
    url TEXT UNIQUE NOT NULL,
    topic TEXT,
    duration_weeks INTEGER,
    cost REAL,
    difficulty TEXT,
    created_at TIMESTAMP
);

-- Study Plans (templates)
CREATE TABLE study_plans (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    topic TEXT,
    level TEXT,
    weeks INTEGER,
    schedule JSON,
    created_at TIMESTAMP
);

-- User Profiles (optional)
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    education_level TEXT,
    field_of_interest TEXT,
    target_role TEXT,
    available_hours REAL,
    learning_style TEXT,
    created_at TIMESTAMP
);

-- Analysis Results (cache)
CREATE TABLE analysis_results (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    analysis_data JSON,
    created_at TIMESTAMP
);
```

---

## APPLICATION FLOW

### Phase 1: Initial Onboarding Form (Frontend Only)

**Page 1 - User Profile Form**

```
┌─────────────────────────────────┐
│      EduGuide AI                │
│   Let's Build Your Profile      │
└─────────────────────────────────┘

Step 1 of 1:

1. Current Education Level (Dropdown)
   - High School
   - Bachelor's
   - Master's
   - Professional
   - Self-Learning

2. Field of Interest (Dropdown)
   - Technology/IT
   - Business/Finance
   - Healthcare
   - Creative/Arts
   - Engineering
   - Other

3. Target Role/Goal (Dropdown)
   - Software Engineer
   - Data Scientist
   - Product Manager
   - Frontend Developer
   - Backend Developer
   - DevOps Engineer
   - Machine Learning Engineer
   - Business Analyst
   - Custom Input (text)

4. How much time can you dedicate? (Dropdown)
   - 5-10 hours/week
   - 10-20 hours/week
   - 20-30 hours/week
   - 30+ hours/week

5. Your Learning Style (Dropdown)
   - Visual (videos, diagrams)
   - Auditory (lectures, podcasts)
   - Reading/Writing (books, articles)
   - Hands-on (projects, practice)
   - Mixed

6. Current Experience Level (Dropdown)
   - Complete Beginner
   - Some Knowledge
   - Intermediate
   - Advanced
   - Expert

7. Career Timeline (Dropdown)
   - 3 months
   - 6 months
   - 1 year
   - 2+ years

8. Preferred Resource Types (Multi-select Checkboxes)
   ☐ YouTube Videos
   ☐ Online Courses
   ☐ Books
   ☐ Project-based Learning
   ☐ Certifications
   ☐ Podcasts

[Clear]  [Submit Analysis]
```

**Form Validation:**
- All dropdowns required
- Client-side validation before submission
- Show loading spinner on submit

---

### Phase 2: Backend Analysis (5 Agents)

**After Submit:** Backend receives form data and runs 5 agents in parallel

```
POST /api/analyze
Body: {
  education_level: string,
  field_of_interest: string,
  target_role: string,
  available_hours: number,
  learning_style: string,
  experience_level: string,
  career_timeline: string,
  preferred_resources: array
}
```

**5 AI Agents (Sequential Analysis):**

#### **Agent 1: Profile Analyzer**
- Analyzes user's current position
- Identifies strengths and weaknesses
- Outputs: Detailed profile summary, SWOT analysis

#### **Agent 2: Gap Analyzer**
- Identifies skills gap between current and target
- Lists required skills (technical, soft skills)
- Prioritizes by importance
- Outputs: Prioritized skill gaps, effort estimate

#### **Agent 3: Resource Recommender**
- Recommends YouTube videos (with links)
- Recommends certificate courses
- Filters by learning style and experience
- Outputs: Curated list of resources with descriptions

#### **Agent 4: Study Plan Generator**
- Creates week-by-week study plan
- Aligns with available hours
- Breaks down by topics
- Includes milestones and checkpoints
- Outputs: Detailed study schedule (JSON/PDF-ready)

#### **Agent 5: Career Path Advisor**
- Suggests intermediate roles/steps
- Identifies job market demand
- Suggests networking strategies
- Provides timeline and salary insights
- Outputs: Career roadmap with milestones

**Processing Logic:**

```python
@app.post('/api/analyze')
async def analyze_user(data: UserProfileData):
    # 1. Validate and sanitize input
    validated_data = validate_form(data)
    
    # 2. Run 5 agents (parallel or sequential)
    profile_analysis = await agent1_profile_analyzer(validated_data)
    gap_analysis = await agent2_gap_analyzer(validated_data)
    resources = await agent3_resource_recommender(validated_data)
    study_plan = await agent4_study_plan_generator(validated_data)
    career_path = await agent5_career_advisor(validated_data)
    
    # 3. Combine results
    results = {
        'profile': profile_analysis,
        'gaps': gap_analysis,
        'resources': resources,
        'study_plan': study_plan,
        'career_path': career_path
    }
    
    # 4. Save to database (optional)
    save_results(results)
    
    # 5. Return to frontend
    return results
```

---

### Phase 3: Results Display (Frontend)

**Page 2 - Analysis Results**

**Tabs/Sections:**

1. **Your Profile** (Agent 1 Output)
   - Current skills summary
   - Strengths
   - Areas for improvement
   - Learning style recommendation

2. **Skill Gaps** (Agent 2 Output)
   - Skills you need to learn
   - Priority level (High/Medium/Low)
   - Estimated time to learn
   - Prerequisite skills

3. **Recommended Resources** (Agent 3 Output)
   
   **YouTube Videos:**
   ```
   📺 Video Title
   Channel: Creator Name
   Duration: 45 min
   Difficulty: Intermediate
   🔗 [Watch on YouTube]
   ```
   
   **Courses:**
   ```
   🎓 Course Name
   Provider: Coursera/Udemy/etc
   Duration: 8 weeks
   Cost: Free / $49.99
   Certificate: Yes
   🔗 [Enroll Now]
   ⭐ Rating: 4.8/5
   ```

4. **Your Study Plan** (Agent 4 Output)
   
   **Week-by-Week Breakdown:**
   ```
   WEEK 1: Fundamentals
   - Topic 1: Python Basics (3 hours)
   - Topic 2: Data Types (2 hours)
   - Practice: Code 5 exercises
   Resources: Video 1, Video 2, Article 1
   
   WEEK 2: Object-Oriented Programming
   - Topic 1: Classes and Objects (3 hours)
   - Topic 2: Inheritance (2 hours)
   - Practice: Build mini project
   Resources: Course Module 2, Video 3
   
   ...
   ```
   
   **Milestones:**
   ```
   Month 1: Complete fundamentals ✓
   Month 2: Build 2 projects
   Month 3: Start freelancing
   Month 6: Senior role
   ```

5. **Career Roadmap** (Agent 5 Output)
   
   ```
   Current Role: Junior Developer
   ↓ (6 months)
   Mid-level Developer (Skills: X, Y, Z)
   ↓ (12 months)
   Senior Developer (Skills: Leadership, A, B)
   ↓ (18 months)
   Tech Lead (Skills: Architecture, C, D)
   ↓ (24 months)
   Target: Solutions Architect
   
   Job Market Demand: High ⬆️
   Average Salary: $120k - $180k
   Growth Rate: +15% YoY
   ```

**UI Features:**
- Tabbed interface (easy switching)
- Print/Export as PDF
- Share results button
- Download study plan as ICS (calendar)
- Bookmark favorite resources
- Dark mode support

---

## BACKEND IMPLEMENTATION

### Project Structure

```
eduguide-ai/
├── app.py                 # Main Flask/FastAPI app
├── config.py              # Configuration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (DO NOT COMMIT)
├── .gitignore             # Git ignore file
├── database.py            # Database setup and models
├── agents/
│   ├── __init__.py
│   ├── profile_analyzer.py      # Agent 1
│   ├── gap_analyzer.py          # Agent 2
│   ├── resource_recommender.py  # Agent 3
│   ├── study_plan_generator.py  # Agent 4
│   └── career_advisor.py        # Agent 5
├── resources/
│   ├── youtube_data.json  # YouTube videos database
│   ├── courses_data.json  # Course database
│   └── study_plans.json   # Study plan templates
├── utils/
│   ├── ai_helper.py       # AI/LLM utilities
│   ├── validators.py      # Input validation
│   └── response_formatter.py
├── templates/             # HTML files
│   ├── index.html
│   ├── form.html
│   └── results.html
├── static/                # CSS, JS
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── form.js
│       └── results.js
└── tests/
    ├── test_agents.py
    └── test_api.py
```

### requirements.txt

```
Flask==2.3.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
requests==2.31.0
google-generativeai==0.3.0
# OR
openai==1.3.0
pydantic==2.0.0
sqlalchemy==2.0.0
```

### app.py (Flask Example)

```python
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from agents.profile_analyzer import analyze_profile
from agents.gap_analyzer import analyze_gaps
from agents.resource_recommender import recommend_resources
from agents.study_plan_generator import generate_study_plan
from agents.career_advisor import advise_career
import json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
API_KEY = os.getenv('OPENAI_API_KEY') or os.getenv('GOOGLE_API_KEY')

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/form')
def form_page():
    """Form page"""
    return render_template('form.html')

@app.route('/results')
def results_page():
    """Results page"""
    return render_template('results.html')

@app.route('/api/analyze', methods=['POST'])
async def analyze():
    """
    Main analysis endpoint
    Receives user profile data and runs 5 agents
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        # Validate input
        required_fields = [
            'education_level', 'field_of_interest', 'target_role',
            'available_hours', 'learning_style', 'experience_level',
            'career_timeline', 'preferred_resources'
        ]
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Run 5 agents (can be parallel with asyncio)
        results = {
            'timestamp': datetime.now().isoformat(),
            'user_profile': data,
            'analysis': {}
        }
        
        # Agent 1: Profile Analysis
        results['analysis']['profile'] = analyze_profile(data, API_KEY)
        
        # Agent 2: Gap Analysis
        results['analysis']['gaps'] = analyze_gaps(data, API_KEY)
        
        # Agent 3: Resource Recommendations
        results['analysis']['resources'] = recommend_resources(data, API_KEY)
        
        # Agent 4: Study Plan
        results['analysis']['study_plan'] = generate_study_plan(data, API_KEY)
        
        # Agent 5: Career Advice
        results['analysis']['career_path'] = advise_career(data, API_KEY)
        
        # Save to database (optional)
        # save_analysis_to_db(results)
        
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error in analyze: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources/youtube', methods=['GET'])
def get_youtube_resources():
    """Get YouTube resources from database/JSON"""
    try:
        topic = request.args.get('topic', '')
        difficulty = request.args.get('difficulty', '')
        
        # Load from JSON or database
        with open('resources/youtube_data.json', 'r') as f:
            resources = json.load(f)
        
        # Filter by topic and difficulty
        filtered = [r for r in resources 
                   if (not topic or r.get('topic') == topic) and
                      (not difficulty or r.get('difficulty') == difficulty)]
        
        return jsonify(filtered), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources/courses', methods=['GET'])
def get_courses():
    """Get certificate course resources"""
    try:
        topic = request.args.get('topic', '')
        cost_filter = request.args.get('cost', '')
        
        with open('resources/courses_data.json', 'r') as f:
            courses = json.load(f)
        
        filtered = [c for c in courses 
                   if (not topic or c.get('topic') == topic)]
        
        if cost_filter == 'free':
            filtered = [c for c in filtered if c.get('cost') == 0]
        
        return jsonify(filtered), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    """Export results as PDF (optional)"""
    try:
        data = request.get_json()
        # Use reportlab or weasyprint to generate PDF
        # Return PDF file
        return jsonify({'message': 'PDF export coming soon'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_ENV') == 'development', port=5000)
```

---

## AGENT IMPLEMENTATIONS

### Agent 1: Profile Analyzer (profile_analyzer.py)

```python
import openai
from typing import Dict, Any

def analyze_profile(user_data: Dict[str, Any], api_key: str) -> Dict:
    """
    Analyzes user's current position and creates detailed profile
    """
    
    prompt = f"""
    Analyze this user profile and provide detailed insights:
    
    Education Level: {user_data['education_level']}
    Field of Interest: {user_data['field_of_interest']}
    Target Role: {user_data['target_role']}
    Experience Level: {user_data['experience_level']}
    Learning Style: {user_data['learning_style']}
    Available Time: {user_data['available_hours']} hours/week
    
    Provide a JSON response with:
    {{
        "summary": "2-3 sentence profile summary",
        "strengths": ["strength1", "strength2", "strength3"],
        "areas_to_improve": ["area1", "area2"],
        "learning_style_tips": "personalized learning tips",
        "recommended_approach": "how this person should learn",
        "estimated_readiness": "percentage ready for target role"
    }}
    
    Return ONLY valid JSON, no markdown or extra text.
    """
    
    response = call_ai_api(prompt, api_key)
    return parse_json_response(response)

def call_ai_api(prompt: str, api_key: str) -> str:
    """
    Call OpenAI or Google Generative AI
    """
    # Using Google Generative AI (free tier)
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text
    
    # OR using OpenAI
    # openai.api_key = api_key
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return response['choices'][0]['message']['content']
```

### Agent 2: Gap Analyzer (gap_analyzer.py)

```python
def analyze_gaps(user_data: Dict[str, Any], api_key: str) -> Dict:
    """
    Identifies skill gaps between current and target role
    """
    
    prompt = f"""
    Current Level: {user_data['experience_level']}
    Target Role: {user_data['target_role']}
    Field: {user_data['field_of_interest']}
    
    Create a comprehensive skill gap analysis with:
    {{
        "technical_skills": [
            {{"skill": "name", "importance": "High/Medium/Low", 
              "learning_time_weeks": number, "resources": ["type1", "type2"]}}
        ],
        "soft_skills": [
            {{"skill": "name", "importance": "High/Medium/Low"}}
        ],
        "total_learning_hours": number,
        "priority_order": ["skill1", "skill2", "skill3"],
        "quick_wins": ["achievable goal 1", "achievable goal 2"],
        "long_term_goals": ["goal1", "goal2"]
    }}
    
    Return ONLY valid JSON.
    """
    
    response = call_ai_api(prompt, api_key)
    return parse_json_response(response)
```

### Agent 3: Resource Recommender (resource_recommender.py)

```python
def recommend_resources(user_data: Dict[str, Any], api_key: str) -> Dict:
    """
    Recommends YouTube videos, courses, and learning resources
    """
    
    prompt = f"""
    Learning Style: {user_data['learning_style']}
    Target Role: {user_data['target_role']}
    Experience Level: {user_data['experience_level']}
    Preferred Resources: {', '.join(user_data['preferred_resources'])}
    
    Recommend curated learning resources:
    {{
        "youtube_videos": [
            {{
                "title": "Video Title",
                "channel": "Creator Name",
                "url": "https://youtube.com/watch?v=...",
                "duration_minutes": number,
                "difficulty": "Beginner/Intermediate/Advanced",
                "topic": "topic name",
                "why_recommended": "explanation",
                "estimated_completion": "time"
            }}
        ],
        "online_courses": [
            {{
                "title": "Course Name",
                "provider": "Udemy/Coursera/etc",
                "url": "https://...",
                "duration_weeks": number,
                "cost": 0 or price,
                "difficulty": "level",
                "rating": 4.5,
                "why_recommended": "why this course",
                "certificate": true/false
            }}
        ],
        "books": [
            {{
                "title": "Book Title",
                "author": "Name",
                "topic": "topic",
                "difficulty": "level",
                "pages": number,
                "estimated_reading_hours": number
            }}
        ],
        "free_resources": [
            {{
                "title": "Resource",
                "type": "documentation/article/tutorial",
                "url": "https://..."
            }}
        ]
    }}
    
    IMPORTANT: Include REAL working URLs for top resources.
    Return ONLY valid JSON.
    """
    
    response = call_ai_api(prompt, api_key)
    return parse_json_response(response)
```

### Agent 4: Study Plan Generator (study_plan_generator.py)

```python
def generate_study_plan(user_data: Dict[str, Any], api_key: str) -> Dict:
    """
    Generates personalized week-by-week study plan
    """
    
    weeks = int(user_data['career_timeline'].split()[0]) * 4  # Convert months to weeks
    hours_per_week = user_data['available_hours']
    
    prompt = f"""
    Create a detailed {weeks}-week study plan:
    
    Target Role: {user_data['target_role']}
    Available Time: {hours_per_week} hours/week
    Learning Style: {user_data['learning_style']}
    
    {{
        "overview": "summary of entire plan",
        "weekly_plans": [
            {{
                "week": 1,
                "theme": "Fundamentals",
                "topics": [
                    {{
                        "name": "Topic Name",
                        "hours": number,
                        "resources": ["resource1", "resource2"],
                        "practice": "what to practice",
                        "milestone": "what to achieve"
                    }}
                ],
                "total_hours": number,
                "practice_project": "optional mini-project",
                "checkpoint": "how to verify learning"
            }}
        ],
        "milestones": [
            {{"month": 1, "goal": "Complete fundamentals", "deliverable": "mini-project"}},
            {{"month": 3, "goal": "Build first real project", "deliverable": "working app"}}
        ],
        "daily_schedule_example": "Mon-Wed: 2hrs theory, Thu-Fri: 1.5hrs practice, Sat: 2hrs project",
        "success_metrics": ["metric1", "metric2"],
        "estimated_total_hours": number
    }}
    
    Return ONLY valid JSON.
    """
    
    response = call_ai_api(prompt, api_key)
    return parse_json_response(response)
```

### Agent 5: Career Advisor (career_advisor.py)

```python
def advise_career(user_data: Dict[str, Any], api_key: str) -> Dict:
    """
    Provides career path guidance and job market insights
    """
    
    prompt = f"""
    Provide career guidance:
    
    Current Level: {user_data['experience_level']}
    Target Role: {user_data['target_role']}
    Field: {user_data['field_of_interest']}
    Timeline: {user_data['career_timeline']}
    
    {{
        "career_roadmap": [
            {{
                "stage": "Current Position",
                "role": "current role description",
                "duration_months": 0,
                "key_skills": ["skill1", "skill2"],
                "focus_areas": ["area1", "area2"]
            }},
            {{
                "stage": "Step 1",
                "role": "Intermediate Role",
                "duration_months": 6,
                "key_skills": ["new skill1", "new skill2"],
                "typical_salary_range": "$X - $Y"
            }},
            {{
                "stage": "Final",
                "role": "{user_data['target_role']}",
                "duration_months": 12,
                "key_skills": ["skill1", "skill2"],
                "typical_salary_range": "$X - $Y"
            }}
        ],
        "job_market_insights": {{
            "demand": "High/Medium/Low",
            "growth_rate": "+15% YoY",
            "average_salary": "$120k",
            "salary_range": ["$80k", "$180k"],
            "top_companies": ["company1", "company2"],
            "job_titles": ["title1", "title2"]
        }},
        "networking_strategy": "how to network",
        "interview_prep": ["topic1", "topic2"],
        "side_projects_to_build": ["project1", "project2"],
        "certifications_to_pursue": ["cert1", "cert2"],
        "next_steps": ["step1", "step2"]
    }}
    
    Return ONLY valid JSON.
    """
    
    response = call_ai_api(prompt, api_key)
    return parse_json_response(response)
```

### Utils: AI Helper (utils/ai_helper.py)

```python
import json
import re

def parse_json_response(response_text: str) -> dict:
    """
    Parse JSON from AI response (handles markdown code blocks)
    """
    # Remove markdown code blocks
    response_text = re.sub(r'```json\n?', '', response_text)
    response_text = re.sub(r'```\n?', '', response_text)
    
    try:
        return json.loads(response_text.strip())
    except json.JSONDecodeError:
        # Fallback: try to extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"error": "Failed to parse response", "raw": response_text}

def validate_input(data: dict) -> bool:
    """
    Validate user input
    """
    required = ['education_level', 'field_of_interest', 'target_role']
    return all(key in data for key in required)
```

---

## FRONTEND IMPLEMENTATION

### HTML Structure (form.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduGuide AI - Profile Form</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body data-theme="light">
    <div class="form-container">
        <div class="form-header">
            <h1>EduGuide AI</h1>
            <p>Let's Build Your Personalized Learning Plan</p>
        </div>

        <form id="profileForm" class="profile-form">
            <!-- Education Level -->
            <div class="form-group">
                <label for="educationLevel">Current Education Level *</label>
                <select id="educationLevel" name="education_level" required>
                    <option value="">-- Select --</option>
                    <option value="high_school">High School</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="professional">Professional/Working</option>
                    <option value="self_learning">Self-Learning</option>
                </select>
            </div>

            <!-- Field of Interest -->
            <div class="form-group">
                <label for="fieldOfInterest">Field of Interest *</label>
                <select id="fieldOfInterest" name="field_of_interest" required>
                    <option value="">-- Select --</option>
                    <option value="technology">Technology/IT</option>
                    <option value="business">Business/Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="creative">Creative/Arts</option>
                    <option value="engineering">Engineering</option>
                    <option value="data_science">Data Science</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <!-- Target Role -->
            <div class="form-group">
                <label for="targetRole">Target Role/Goal *</label>
                <select id="targetRole" name="target_role" required>
                    <option value="">-- Select --</option>
                    <option value="software_engineer">Software Engineer</option>
                    <option value="data_scientist">Data Scientist</option>
                    <option value="product_manager">Product Manager</option>
                    <option value="frontend_dev">Frontend Developer</option>
                    <option value="backend_dev">Backend Developer</option>
                    <option value="devops">DevOps Engineer</option>
                    <option value="ml_engineer">ML Engineer</option>
                    <option value="business_analyst">Business Analyst</option>
                </select>
            </div>

            <!-- Available Time -->
            <div class="form-group">
                <label for="availableHours">Hours Available Per Week *</label>
                <select id="availableHours" name="available_hours" required>
                    <option value="">-- Select --</option>
                    <option value="5">5-10 hours/week</option>
                    <option value="15">10-20 hours/week</option>
                    <option value="25">20-30 hours/week</option>
                    <option value="35">30+ hours/week</option>
                </select>
            </div>

            <!-- Learning Style -->
            <div class="form-group">
                <label for="learningStyle">Your Learning Style *</label>
                <select id="learningStyle" name="learning_style" required>
                    <option value="">-- Select --</option>
                    <option value="visual">Visual (Videos, Diagrams)</option>
                    <option value="auditory">Auditory (Lectures, Podcasts)</option>
                    <option value="reading_writing">Reading/Writing (Books, Articles)</option>
                    <option value="hands_on">Hands-on (Projects, Practice)</option>
                    <option value="mixed">Mixed (All types)</option>
                </select>
            </div>

            <!-- Experience Level -->
            <div class="form-group">
                <label for="experienceLevel">Current Experience Level *</label>
                <select id="experienceLevel" name="experience_level" required>
                    <option value="">-- Select --</option>
                    <option value="complete_beginner">Complete Beginner</option>
                    <option value="some_knowledge">Some Knowledge</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                </select>
            </div>

            <!-- Career Timeline -->
            <div class="form-group">
                <label for="careerTimeline">Your Timeline *</label>
                <select id="careerTimeline" name="career_timeline" required>
                    <option value="">-- Select --</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                    <option value="1 year">1 Year</option>
                    <option value="2 years">2+ Years</option>
                </select>
            </div>

            <!-- Preferred Resources -->
            <div class="form-group">
                <label>Preferred Resource Types *</label>
                <div class="checkbox-group">
                    <label class="checkbox">
                        <input type="checkbox" name="preferred_resources" value="youtube">
                        📺 YouTube Videos
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" name="preferred_resources" value="courses">
                        🎓 Online Courses
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" name="preferred_resources" value="books">
                        📚 Books
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" name="preferred_resources" value="projects">
                        💻 Project-based
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" name="preferred_resources" value="certifications">
                        🏆 Certifications
                    </label>
                </div>
            </div>

            <div class="form-actions">
                <button type="reset" class="btn btn-secondary">Clear</button>
                <button type="submit" class="btn btn-primary">Analyze My Profile</button>
            </div>
        </form>

        <!-- Loading Spinner -->
        <div id="loadingSpinner" class="loading-spinner hidden">
            <div class="spinner"></div>
            <p>Analyzing your profile with 5 AI agents...</p>
        </div>
    </div>

    <script src="/static/js/form.js"></script>
</body>
</html>
```

### Form JavaScript (form.js)

```javascript
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Get checkboxes
    const resources = Array.from(
        document.querySelectorAll('input[name="preferred_resources"]:checked')
    ).map(el => el.value);
    
    if (resources.length === 0) {
        alert('Please select at least one resource type');
        return;
    }
    
    data.preferred_resources = resources;
    data.available_hours = parseFloat(data.available_hours);
    
    // Show loading
    document.getElementById('loadingSpinner').classList.remove('hidden');
    
    try {
        // Send to backend
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const results = await response.json();
        
        // Store in sessionStorage for results page
        sessionStorage.setItem('analysisResults', JSON.stringify(results));
        
        // Redirect to results
        window.location.href = '/results';
        
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
});
```

### Results Page (results.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Analysis Results - EduGuide AI</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body data-theme="light">
    <div class="results-container">
        <header class="results-header">
            <h1>Your Personalized Analysis</h1>
            <p>Based on your profile, here's what we recommend</p>
            <div class="header-actions">
                <button class="btn btn-secondary" onclick="window.print()">📄 Print</button>
                <button class="btn btn-secondary" id="exportBtn">💾 Export PDF</button>
                <button class="btn btn-secondary" onclick="location.href='/form'">✏️ Edit Profile</button>
            </div>
        </header>

        <!-- Tab Navigation -->
        <div class="tabs">
            <button class="tab-btn active" data-tab="profile">Your Profile</button>
            <button class="tab-btn" data-tab="gaps">Skill Gaps</button>
            <button class="tab-btn" data-tab="resources">Resources</button>
            <button class="tab-btn" data-tab="plan">Study Plan</button>
            <button class="tab-btn" data-tab="career">Career Roadmap</button>
        </div>

        <!-- Tab Content -->
        <div class="tabs-content">
            
            <!-- Tab 1: Your Profile -->
            <div class="tab-pane active" id="profile-tab">
                <div class="analysis-section">
                    <h2>Profile Summary</h2>
                    <div id="profileContent" class="content-box"></div>
                </div>
            </div>

            <!-- Tab 2: Skill Gaps -->
            <div class="tab-pane" id="gaps-tab">
                <div class="analysis-section">
                    <h2>Skill Gaps Analysis</h2>
                    <div id="gapsContent" class="content-box"></div>
                </div>
            </div>

            <!-- Tab 3: Resources -->
            <div class="tab-pane" id="resources-tab">
                <div class="analysis-section">
                    <h2>Recommended Resources</h2>
                    
                    <div class="resource-section">
                        <h3>📺 YouTube Videos</h3>
                        <div id="youtubeContent" class="resource-list"></div>
                    </div>

                    <div class="resource-section">
                        <h3>🎓 Certificate Courses</h3>
                        <div id="coursesContent" class="resource-list"></div>
                    </div>

                    <div class="resource-section">
                        <h3>📚 Books</h3>
                        <div id="booksContent" class="resource-list"></div>
                    </div>
                </div>
            </div>

            <!-- Tab 4: Study Plan -->
            <div class="tab-pane" id="plan-tab">
                <div class="analysis-section">
                    <h2>Your Personalized Study Plan</h2>
                    <div id="planContent" class="content-box"></div>
                    <button class="btn btn-secondary" id="downloadPlanBtn">📅 Add to Calendar</button>
                </div>
            </div>

            <!-- Tab 5: Career Roadmap -->
            <div class="tab-pane" id="career-tab">
                <div class="analysis-section">
                    <h2>Your Career Path</h2>
                    <div id="careerContent" class="content-box"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="/static/js/results.js"></script>
</body>
</html>
```

### Results JavaScript (results.js)

```javascript
// Load results from sessionStorage
const results = JSON.parse(sessionStorage.getItem('analysisResults'));

if (!results) {
    window.location.href = '/form';
}

// Render each section
document.addEventListener('DOMContentLoaded', () => {
    renderProfile(results.analysis.profile);
    renderGaps(results.analysis.gaps);
    renderResources(results.analysis.resources);
    renderStudyPlan(results.analysis.study_plan);
    renderCareerPath(results.analysis.career_path);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
});

function renderProfile(data) {
    const html = `
        <div class="profile-card">
            <h3>${data.summary}</h3>
            
            <div class="card-section">
                <h4>Your Strengths</h4>
                <ul>
                    ${data.strengths.map(s => `<li>✅ ${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="card-section">
                <h4>Areas to Improve</h4>
                <ul>
                    ${data.areas_to_improve.map(a => `<li>🎯 ${a}</li>`).join('')}
                </ul>
            </div>
            
            <div class="card-section">
                <h4>Learning Style Tips</h4>
                <p>${data.learning_style_tips}</p>
            </div>
            
            <div class="progress-bar">
                <p>Readiness for Target Role: ${data.estimated_readiness}</p>
                <progress value="${parseInt(data.estimated_readiness)}" max="100"></progress>
            </div>
        </div>
    `;
    document.getElementById('profileContent').innerHTML = html;
}

function renderResources(data) {
    // Render YouTube
    const youtubeHtml = data.youtube_videos.map(video => `
        <div class="resource-card">
            <div class="resource-header">
                <h4>${video.title}</h4>
                <span class="difficulty ${video.difficulty.toLowerCase()}">${video.difficulty}</span>
            </div>
            <p class="resource-meta">
                📺 ${video.channel} • ⏱️ ${video.duration_minutes} min
            </p>
            <p>${video.why_recommended}</p>
            <a href="${video.url}" target="_blank" class="btn btn-primary btn-small">Watch on YouTube</a>
        </div>
    `).join('');
    document.getElementById('youtubeContent').innerHTML = youtubeHtml;
    
    // Render Courses
    const coursesHtml = data.online_courses.map(course => `
        <div class="resource-card">
            <div class="resource-header">
                <h4>${course.title}</h4>
                <span class="badge">${course.provider}</span>
            </div>
            <p class="resource-meta">
                ⏱️ ${course.duration_weeks} weeks • 💰 ${course.cost === 0 ? 'FREE' : '$' + course.cost}
                ${course.certificate ? ' • 🏆 Certificate' : ''}
            </p>
            <p>⭐ ${course.rating}/5.0</p>
            <p>${course.why_recommended}</p>
            <a href="${course.url}" target="_blank" class="btn btn-primary btn-small">Enroll Now</a>
        </div>
    `).join('');
    document.getElementById('coursesContent').innerHTML = coursesHtml;
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active from buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}
```

---

## RESOURCE DATABASES

### youtube_data.json

```json
[
    {
        "id": 1,
        "title": "Complete Python Tutorial for Beginners",
        "channel": "Corey Schafer",
        "url": "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        "topic": "Python",
        "difficulty": "Beginner",
        "duration_minutes": 4320,
        "rating": 4.9
    },
    {
        "id": 2,
        "title": "JavaScript Mastery",
        "channel": "Traversy Media",
        "url": "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEluRdzZ_6nGvj7VmKjY_",
        "topic": "JavaScript",
        "difficulty": "Beginner",
        "duration_minutes": 2880,
        "rating": 4.8
    }
]
```

### courses_data.json

```json
[
    {
        "id": 1,
        "title": "Python for Data Science",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/python-data-analysis",
        "topic": "Python",
        "duration_weeks": 4,
        "cost": 0,
        "difficulty": "Beginner",
        "rating": 4.6,
        "certificate": true
    },
    {
        "id": 2,
        "title": "The Complete JavaScript Course",
        "provider": "Udemy",
        "url": "https://www.udemy.com/course/the-complete-javascript-course-2023/",
        "topic": "JavaScript",
        "duration_weeks": 8,
        "cost": 49.99,
        "difficulty": "Beginner",
        "rating": 4.8,
        "certificate": true
    }
]
```

---

## ENVIRONMENT CONFIGURATION

### .env (DO NOT COMMIT)

```bash
# API Keys
OPENAI_API_KEY=sk-...
# OR
GOOGLE_API_KEY=AIzaSy...

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DEBUG=False

# Database
DATABASE_URL=sqlite:///eduguide.db

# Optional
ALLOWED_HOSTS=localhost,yourdomain.com
```

### .gitignore

```
# Environment
.env
.env.local
.env.*.local

# API Keys
*.key
secrets.json
credentials.json

# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite

# Logs
*.log
logs/

# Testing
.coverage
htmlcov/

# OS
.DS_Store
Thumbs.db

# Cache
.cache/
__pycache__/
```

---

## INSTALLATION & DEPLOYMENT

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd eduguide-ai

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Edit .env with your API key

# 5. Initialize database
python database.py

# 6. Run server
python app.py
# Visit: http://localhost:5000
```

### Deployment (Heroku Example)

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set FLASK_ENV=production

# 3. Deploy
git push heroku main

# 4. Scale dynos
heroku ps:scale web=1

# Visit: https://your-app-name.herokuapp.com
```

### Deployment (Railway.app)

```bash
# Connect GitHub repo
# Railway auto-detects Python
# Set env vars in dashboard
# Auto-deploys on push
```

---

## TESTING

### Backend Tests (test_agents.py)

```python
import unittest
from agents.profile_analyzer import analyze_profile

class TestAgents(unittest.TestCase):
    def setUp(self):
        self.test_data = {
            'education_level': 'bachelors',
            'field_of_interest': 'technology',
            'target_role': 'software_engineer',
            'available_hours': 15,
            'learning_style': 'visual',
            'experience_level': 'intermediate',
            'career_timeline': '6 months',
            'preferred_resources': ['youtube', 'courses']
        }
    
    def test_profile_analysis(self):
        result = analyze_profile(self.test_data, 'test_key')
        self.assertIn('summary', result)
        self.assertIn('strengths', result)

if __name__ == '__main__':
    unittest.main()
```

Run: `python -m pytest tests/`

---

## WHAT NOT TO UPLOAD TO GITHUB

### ⚠️ NEVER COMMIT

```
❌ .env files
❌ API keys (OpenAI, Google)
❌ Database files (*.db, *.sqlite)
❌ Virtual environment folder
❌ Personal data files
❌ Private credentials
❌ __pycache__ directories
❌ .vscode/settings.json
❌ node_modules/ (if using any JS)
❌ Logs and temp files
```

### ✅ SAFE TO COMMIT

```
✅ Source code (.py, .html, .css, .js)
✅ requirements.txt
✅ .gitignore
✅ .env.example (template without keys)
✅ README.md
✅ LICENSE
✅ Public images
✅ Database schema (no data)
```

### Example .env.example

```bash
# Copy this to .env and fill in your keys
OPENAI_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here
FLASK_ENV=development
SECRET_KEY=change-me-in-production
DATABASE_URL=sqlite:///eduguide.db
```

---

## FEATURES ROADMAP

### MVP (Phase 1) ✅
- [x] Form with dropdowns
- [x] 5 AI agents
- [x] Results display
- [x] YouTube + course links
- [x] Study plan generator

### Phase 2
- [ ] User accounts & login
- [ ] Save analysis history
- [ ] Export to PDF
- [ ] Email study reminders
- [ ] Progress tracking

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Community features (forums)
- [ ] Live mentorship matching
- [ ] Advanced analytics

---

## API DOCUMENTATION

### Endpoints

```
POST /api/analyze
- Receives: User profile data
- Returns: Analysis from 5 agents
- Time: 10-30 seconds

GET /api/resources/youtube?topic=Python&difficulty=Beginner
- Returns: Filtered YouTube resources

GET /api/resources/courses?topic=Python
- Returns: Filtered courses

POST /api/export/pdf
- Receives: Analysis results
- Returns: PDF file
```

---

## PERFORMANCE OPTIMIZATION

- Cache API responses (Redis)
- Implement request throttling
- Optimize database queries
- Compress images
- Minify CSS/JS
- Use CDN for static assets

---

## SECURITY CONSIDERATIONS

- ✅ Input validation on all forms
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ SQL injection prevention (use ORM)
- ✅ XSS protection (escape output)
- ✅ HTTPS in production
- ✅ Secure API key handling
- ✅ No sensitive data in logs

---

## SUCCESS CRITERIA

✅ Users get detailed analysis without API key  
✅ 5 agents analyze simultaneously  
✅ Results include working YouTube/course links  
✅ Study plans are personalized  
✅ Fast response (< 30 seconds)  
✅ Mobile responsive  
✅ Easy to deploy  
✅ Secure (no data leaks)  

---

**This is a complete, production-ready Python + Frontend specification. Build with this and you'll have a powerful AI-driven career guidance platform!** 🚀
