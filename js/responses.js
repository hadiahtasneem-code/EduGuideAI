(() => {
  const STOPWORDS = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "at",
    "from",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "i",
    "me",
    "my",
    "you",
    "your",
    "we",
    "our",
    "it",
    "this",
    "that",
    "these",
    "those",
    "as",
    "but",
    "so",
    "if",
    "then",
    "than",
    "what",
    "how",
    "why",
    "can",
    "could",
    "should",
    "would",
    "do",
    "does",
    "did",
    "have",
    "has",
    "had",
  ]);

  const RESPONSE_DATABASE = {
    profileSpecialist: {
      keywords: ["background", "goal", "learning", "strength", "experience", "time"],
      templates: [
        "Thanks — that gives me a clearer picture. {summary} {question}",
        "Got it. {summary} {question}",
        "Helpful context. {summary} {question}",
      ],
      prompts: [
        "What career direction are you leaning toward right now?",
        "How many hours per week can you consistently dedicate to learning?",
        "What’s one strength you feel confident about (technical or personal)?",
      ],
    },
    gapAnalyzer: {
      keywords: ["skills", "gap", "target", "role", "resume", "portfolio", "project"],
      templates: [
        "Based on your target, here are the highest-impact gaps to close:\n{gaps}\nWhich one do you want to tackle first?",
        "Here’s a focused gap list to move you toward your target role:\n{gaps}\nWhat’s your current level in these areas (beginner/intermediate/advanced)?",
      ],
      prompts: [
        "What skills do you already have (tools, languages, projects)?",
        "What target role are you aiming for (be specific)?",
        "How much time per week can you invest?",
      ],
    },
    tutorSage: {
      keywords: ["explain", "why", "how", "example", "concept", "understand"],
      templates: [
        "{explanation}\n\nDoes this make sense? Want me to explain further or give a quick practice problem?",
        "{explanation}\n\nDoes this make sense? Want an analogy or a worked example?",
      ],
      prompts: [
        "What topic do you want to learn, and what’s your current level?",
        "What part feels confusing: the definition, the steps, or the intuition?",
      ],
    },
    studyPlanner: {
      keywords: ["schedule", "plan", "week", "day", "deadline", "exam", "time"],
      templates: [
        "Here’s a realistic weekly plan you can start today:\n{plan}\nWhat days are non-negotiable busy days for you?",
        "I built a flexible schedule around your time:\n{plan}\nDo you prefer mornings, afternoons, or evenings for focused study?",
      ],
      prompts: [
        "What’s your goal and deadline?",
        "How many hours per week can you study, and what days are busiest?",
      ],
    },
    careerCoach: {
      keywords: ["career", "industry", "role", "path", "job", "transition", "market"],
      templates: [
        "Here are 2–3 solid paths based on what you shared:\n{paths}\nWhich one sounds closest to your interests right now?",
        "Let’s turn this into a 6–12 month roadmap:\n{paths}\nWhat’s your current experience level (student/early-career/mid-career)?",
      ],
      prompts: [
        "What field interests you and what kind of work do you enjoy doing?",
        "What does success look like for you in 12 months?",
      ],
    },
    progressMonitor: {
      keywords: ["progress", "stuck", "motivation", "habit", "review", "consistency", "challenge"],
      templates: [
        "That’s a real win. {praise} What’s the biggest obstacle you’re facing right now?\nOne optimization: {optimization}",
        "Nice momentum. {praise} What’s been hardest lately?\nOne optimization: {optimization}",
      ],
      prompts: [
        "What did you accomplish this week (even if small)?",
        "Where do you feel stuck right now?",
      ],
    },
    resourceIndexer: {
      keywords: ["resource", "course", "book", "video", "cert", "certification", "practice", "project"],
      templates: [
        "Here are a few strong resources tailored to your level:\n{resources}\nDo you prefer videos, reading, or hands-on projects?",
        "Here are 3–5 recommendations with why they fit:\n{resources}\nWhat’s your budget (free only vs open to paid)?",
      ],
      prompts: [
        "What do you want to learn and what’s your current level?",
        "Do you prefer videos, books, interactive courses, or hands-on projects?",
      ],
    },
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const normalize = (s) => String(s || "").toLowerCase();

  const extractKeywords = (text) => {
    const tokens = normalize(text)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/g)
      .filter(Boolean)
      .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

    return Array.from(new Set(tokens));
  };

  const lastN = (history, n) => {
    if (!Array.isArray(history)) return [];
    return history.slice(Math.max(0, history.length - n));
  };

  const buildMemory = (history) => {
    const mem = {
      timePerWeek: null,
      learningStyle: null,
      targetRole: null,
      goals: [],
      skills: [],
      background: null,
    };

    const text = lastN(history, 16)
      .filter((m) => m && typeof m.text === "string" && m.role === "user")
      .map((m) => m.text)
      .join("\n");

    const t = normalize(text);

    const timeMatch = t.match(/(\d{1,2})\s*(hours|hrs)\s*(per|\/)\s*(week|wk)/) || t.match(/(\d{1,2})\s*(hours|hrs)\s*(a|per)\s*week/);
    if (timeMatch) mem.timePerWeek = Number(timeMatch[1]);

    if (t.includes("visual")) mem.learningStyle = "visual";
    else if (t.includes("auditory")) mem.learningStyle = "auditory";
    else if (t.includes("kinesthetic") || t.includes("hands-on") || t.includes("hands on")) mem.learningStyle = "kinesthetic";

    const roleMatch =
      t.match(/target(ing)?\s+(role|position)\s*[:\-]?\s*([a-z0-9 \/\-\+]{3,60})/i) ||
      t.match(/i\s+want\s+to\s+be\s+a[n]?\s+([a-z0-9 \/\-\+]{3,60})/i) ||
      t.match(/i\s+am\s+aiming\s+for\s+([a-z0-9 \/\-\+]{3,60})/i);
    if (roleMatch) mem.targetRole = roleMatch[3] ? roleMatch[3].trim() : roleMatch[1].trim();

    const goalMatch = t.match(/goal\s*[:\-]?\s*([^\n]{4,120})/i);
    if (goalMatch) mem.goals.push(goalMatch[1].trim());

    const bgMatch = t.match(/background\s*[:\-]?\s*([^\n]{4,120})/i);
    if (bgMatch) mem.background = bgMatch[1].trim();

    const skillsMatch = t.match(/skills?\s*[:\-]?\s*([^\n]{4,200})/i);
    if (skillsMatch) {
      mem.skills = skillsMatch[1]
        .split(/,|;|\|/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 18);
    }

    return mem;
  };

  const fillTemplate = (template, vars) =>
    template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => (vars[key] == null ? "" : String(vars[key])));

  const roleSkillMap = [
    {
      match: ["frontend", "front-end", "web developer", "ui developer"],
      skills: ["HTML/CSS", "JavaScript fundamentals", "DOM & events", "Accessibility", "Responsive design", "Git/GitHub"],
    },
    {
      match: ["backend", "back-end", "api developer"],
      skills: ["HTTP & REST", "Databases (SQL)", "Authentication basics", "API design", "Testing basics", "Deployment basics"],
    },
    {
      match: ["software engineer", "software developer", "developer", "programmer"],
      skills: ["Data structures", "Algorithms basics", "Git workflows", "Debugging", "Testing habits", "System design basics"],
    },
    {
      match: ["data analyst", "business analyst"],
      skills: ["SQL", "Spreadsheets", "Data cleaning", "Visualization", "Basic statistics", "Storytelling with data"],
    },
    {
      match: ["data scientist", "ml", "machine learning"],
      skills: ["Python", "Statistics", "Pandas/NumPy", "Model evaluation", "Feature engineering", "Projects & portfolios"],
    },
    {
      match: ["cybersecurity", "security analyst"],
      skills: ["Networking basics", "Linux basics", "Threat modeling", "Incident response", "Security tooling", "Hands-on labs"],
    },
    {
      match: ["product manager", "pm"],
      skills: ["User research", "Roadmaps", "PRDs", "Metrics & analytics", "Stakeholder communication", "Execution planning"],
    },
  ];

  const inferRoleSkills = (targetRole) => {
    const t = normalize(targetRole || "");
    for (const row of roleSkillMap) {
      if (row.match.some((m) => t.includes(m))) return row.skills;
    }
    return ["Core fundamentals", "Projects/portfolio", "Communication", "Interview readiness"];
  };

  const generateProfileResponse = (userMessage, history) => {
    const mem = buildMemory(history);
    const parts = [];
    if (mem.targetRole) parts.push(`You’re leaning toward ${mem.targetRole}.`);
    if (mem.timePerWeek != null) parts.push(`You can dedicate about ${mem.timePerWeek} hours/week.`);
    if (mem.learningStyle) parts.push(`Your learning style sounds ${mem.learningStyle}.`);
    const summary = parts.length ? parts.join(" ") : "I’m building a quick snapshot of your goals and constraints.";

    const prompt = pick(RESPONSE_DATABASE.profileSpecialist.prompts);
    const template = pick(RESPONSE_DATABASE.profileSpecialist.templates);
    return fillTemplate(template, { summary, question: prompt });
  };

  const generateGapResponse = (userMessage, history) => {
    const mem = buildMemory(history);
    const target = mem.targetRole || userMessage;
    const roleSkills = inferRoleSkills(target);
    const existing = new Set((mem.skills || []).map((s) => normalize(s)));
    const prioritized = roleSkills
      .filter((s) => !existing.has(normalize(s)))
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");

    const gaps = prioritized || roleSkills.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join("\n");
    const template = pick(RESPONSE_DATABASE.gapAnalyzer.templates);
    return fillTemplate(template, { gaps });
  };

  const explainTopic = (topic) => {
    const t = normalize(topic);

    if (t.includes("quadratic")) {
      return (
        "A quadratic equation looks like ax² + bx + c = 0.\n" +
        "To solve it, you often use the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a).\n" +
        "Example: x² - 5x + 6 = 0 → (x-2)(x-3)=0 → x=2 or x=3."
      );
    }

    if (t.includes("newton") || (t.includes("laws") && t.includes("motion"))) {
      return (
        "Newton’s laws (simple):\n" +
        "1) Inertia: objects keep their state unless a force acts.\n" +
        "2) F = m×a: more force → more acceleration; more mass → less acceleration for same force.\n" +
        "3) Action–reaction: forces come in equal and opposite pairs."
      );
    }

    if (t.includes("photosynthesis")) {
      return (
        "Photosynthesis is how plants make food (glucose) using sunlight.\n" +
        "Inputs: CO₂ + water + light. Outputs: glucose + oxygen.\n" +
        "Steps: light reactions capture energy → Calvin cycle uses that energy to build sugar."
      );
    }

    if (t.includes("periodic table")) {
      return (
        "The periodic table organizes elements by atomic number (protons).\n" +
        "Rows (periods) show increasing energy levels; columns (groups) share similar chemical properties.\n" +
        "Example: Group 1 are very reactive metals; Group 18 are stable noble gases."
      );
    }

    if (t.includes("paragraph") || (t.includes("topic sentence") && t.includes("evidence"))) {
      return (
        "A strong paragraph usually follows: Topic sentence → Evidence/Example → Explanation → Link back.\n" +
        "Tip: make the topic sentence one clear claim, then support it with 1–2 specific examples.\n" +
        "If you share your topic, I can help you write a model paragraph."
      );
    }

    if (t.includes("process") && t.includes("thread")) {
      return (
        "A process is a running program with its own memory space.\n" +
        "A thread is a smaller execution unit inside a process that shares memory with other threads.\n" +
        "Processes are more isolated; threads are lighter but need careful synchronization."
      );
    }

    if (t.includes("http") && t.includes("https")) {
      return (
        "HTTP is how browsers and servers communicate using requests and responses.\n" +
        "HTTPS is HTTP + encryption (TLS), which protects data in transit and verifies the server identity.\n" +
        "In practice: HTTPS prevents snooping and tampering on the network."
      );
    }

    if (t.includes("inheritance") || t.includes("composition")) {
      return (
        "Inheritance means a class extends another class (is-a relationship).\n" +
        "Composition means a class contains other objects (has-a relationship).\n" +
        "Composition is often preferred because it’s more flexible and avoids tight coupling."
      );
    }

    if (t.includes("recursion")) {
      return (
        "Recursion is when a function solves a problem by calling itself on a smaller version of the same problem.\n" +
        "Think of it like opening nested boxes: each box contains a smaller box until you reach the smallest one (the base case).\n" +
        "A recursive solution always needs (1) a base case to stop, and (2) a step that makes the input smaller."
      );
    }

    if (t.includes("sql") && (t.includes("join") || t.includes("joins"))) {
      return (
        "A SQL JOIN combines rows from two tables using a matching key.\n" +
        "INNER JOIN keeps only matches; LEFT JOIN keeps all rows from the left table and fills missing matches with NULL.\n" +
        "If you tell me the two tables and the key, I can show the exact query."
      );
    }

    if (t.includes("machine learning") || t.includes("ml")) {
      return (
        "Machine learning is a way to make predictions or decisions by learning patterns from data.\n" +
        "At a high level: you collect data, choose a model, train it to minimize errors, then evaluate it on new data.\n" +
        "The key idea is generalization: doing well on unseen examples, not just memorizing the training set."
      );
    }

    if (t.includes("overfitting")) {
      return (
        "Overfitting happens when a model learns noise in the training data instead of general patterns.\n" +
        "It performs well on training but poorly on new/unseen data.\n" +
        "Fixes: more data, regularization, simpler models, early stopping, and proper validation."
      );
    }

    if (t.includes("bias") && t.includes("variance")) {
      return (
        "Bias is error from overly simple assumptions (underfitting).\n" +
        "Variance is error from being too sensitive to training data (overfitting).\n" +
        "The tradeoff is choosing a model complexity that balances both."
      );
    }

    if (t.includes("git")) {
      return (
        "Git is a version control system that tracks changes to files over time.\n" +
        "You usually work in a loop: edit → commit (save a snapshot) → push (share) and pull (sync).\n" +
        "If you share what you’re trying to do (e.g., undo a commit, create a branch), I’ll give the exact commands and explain why."
      );
    }

    return (
      "Here’s a simple way to think about it:\n" +
      "1) Definition (what it is)\n" +
      "2) Intuition (why it works)\n" +
      "3) Example (how it’s used)\n" +
      "Tell me the exact concept/topic and your current level, and I’ll tailor the explanation."
    );
  };

  const generateTutorResponse = (userMessage) => {
    const explanation = explainTopic(userMessage);
    const template = pick(RESPONSE_DATABASE.tutorSage.templates);
    return fillTemplate(template, { explanation });
  };

  const generateStudyPlan = (userMessage, history) => {
    const mem = buildMemory(history);
    const hours = mem.timePerWeek != null ? mem.timePerWeek : null;
    const weekly = hours != null ? hours : 8;
    const sessions = Math.max(3, Math.min(6, Math.round(weekly / 2)));
    const mins = Math.round((weekly * 60) / sessions);

    const planLines = [
      `- Mon: ${mins} min focused study + 10 min review`,
      `- Tue: ${mins} min practice (exercises/projects)`,
      `- Wed: ${Math.round(mins * 0.8)} min concepts + notes`,
      `- Thu: ${mins} min practice + 10 min recap`,
      `- Fri: ${Math.round(mins * 0.7)} min spaced repetition / flashcards`,
      `- Weekend: 60–120 min mini-project + reflection`,
    ].slice(0, sessions >= 6 ? 6 : 5);

    const plan = planLines.join("\n");
    const template = pick(RESPONSE_DATABASE.studyPlanner.templates);
    return fillTemplate(template, { plan });
  };

  const buildCareerPaths = (userMessage, history) => {
    const mem = buildMemory(history);
    const interest = mem.targetRole || userMessage;
    const roleSkills = inferRoleSkills(interest);

    const paths = [
      `1) ${mem.targetRole ? mem.targetRole : "Path A"}\n   - Skills: ${roleSkills.slice(0, 4).join(", ")}\n   - Milestones (6–12 months): 2 projects + portfolio, role-focused practice, mock interviews`,
      `2) Adjacent role (lower switching cost)\n   - Skills: fundamentals + one specialization\n   - Milestones: internship/volunteer project, strong resume bullets, networking cadence (2–3/week)`,
      `3) Stretch path (high upside)\n   - Skills: deeper specialization + proof via projects\n   - Milestones: capstone project, public writing, targeted applications`,
    ].join("\n");

    const template = pick(RESPONSE_DATABASE.careerCoach.templates);
    return fillTemplate(template, { paths });
  };

  const generateProgressResponse = (userMessage, history) => {
    const t = normalize(userMessage);
    const praise = t.includes("stuck")
      ? "Being stuck is part of learning — noticing it early is a strength."
      : "You’re building consistency, and that compounds fast.";

    const optimizationOptions = [
      "reduce scope: pick one small daily task you can always complete",
      "add a 10-minute review ritual at the end of each session",
      "track one metric (minutes studied or tasks completed) for 7 days",
      "use spaced repetition for key facts and definitions",
      "turn goals into next actions (the very next 20-minute step)",
    ];

    const optimization = pick(optimizationOptions);
    const template = pick(RESPONSE_DATABASE.progressMonitor.templates);
    return fillTemplate(template, { praise, optimization });
  };

  const resourceCatalog = [
    {
      key: "web",
      items: [
        { name: "MDN Web Docs", level: "Beginner → Advanced", why: "Best reference for HTML/CSS/JS", url: "https://developer.mozilla.org/" },
        { name: "freeCodeCamp", level: "Beginner → Intermediate", why: "Hands-on curriculum with projects", url: "https://www.freecodecamp.org/" },
        { name: "JavaScript.info", level: "Beginner → Intermediate", why: "Clear explanations with examples", url: "https://javascript.info/" },
      ],
    },
    {
      key: "data",
      items: [
        { name: "Kaggle Learn", level: "Beginner → Intermediate", why: "Practical short lessons + notebooks", url: "https://www.kaggle.com/learn" },
        { name: "Mode SQL Tutorial", level: "Beginner → Intermediate", why: "Great SQL practice flow", url: "https://mode.com/sql-tutorial/" },
        { name: "StatQuest (YouTube)", level: "Beginner → Intermediate", why: "Intuitive stats/ML explanations", url: "https://www.youtube.com/@statquest" },
      ],
    },
    {
      key: "general",
      items: [
        { name: "Coursera", level: "All levels", why: "Structured courses and certificates", url: "https://www.coursera.org/" },
        { name: "edX", level: "All levels", why: "University-style courses", url: "https://www.edx.org/" },
        { name: "Roadmap.sh", level: "Beginner → Advanced", why: "Role-based learning roadmaps", url: "https://roadmap.sh/" },
      ],
    },
  ];

  const pickResources = (topic) => {
    const t = normalize(topic);
    if (t.includes("web") || t.includes("frontend") || t.includes("html") || t.includes("css") || t.includes("javascript")) return resourceCatalog.find((c) => c.key === "web").items;
    if (t.includes("data") || t.includes("sql") || t.includes("analysis") || t.includes("analytics") || t.includes("machine learning") || t.includes("ml")) return resourceCatalog.find((c) => c.key === "data").items;
    return resourceCatalog.find((c) => c.key === "general").items;
  };

  const generateResourceResponse = (userMessage) => {
    const items = pickResources(userMessage).slice(0, 5);
    const resources = items
      .map((r, idx) => `${idx + 1}. ${r.name} (${r.level})\n   - Why: ${r.why}\n   - Link: ${r.url}`)
      .join("\n");

    const template = pick(RESPONSE_DATABASE.resourceIndexer.templates);
    return fillTemplate(template, { resources });
  };

  const selectAgentResponse = (agentId, userMessage, history) => {
    switch (agentId) {
      case "profileSpecialist":
        return generateProfileResponse(userMessage, history);
      case "gapAnalyzer":
        return generateGapResponse(userMessage, history);
      case "tutorSage":
        return generateTutorResponse(userMessage, history);
      case "studyPlanner":
        return generateStudyPlan(userMessage, history);
      case "careerCoach":
        return buildCareerPaths(userMessage, history);
      case "progressMonitor":
        return generateProgressResponse(userMessage, history);
      case "resourceIndexer":
        return generateResourceResponse(userMessage, history);
      default:
        return "I’m not sure which agent is active. Please select an agent from the sidebar.";
    }
  };

  const simulateDelay = (text, ms) =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve(text), ms);
    });

  const generateAgentResponse = async (userMessage, agent, conversationHistory) => {
    const agentId = agent?.id || agent;
    const db = RESPONSE_DATABASE[agentId] || null;

    const keywords = extractKeywords(userMessage);
    const matched = db ? keywords.filter((k) => db.keywords.includes(k)).length : 0;
    const baseDelay = matched > 0 ? rand(1100, 1600) : rand(1250, 1850);

    const response = selectAgentResponse(agentId, userMessage, conversationHistory);
    return simulateDelay(response, baseDelay);
  };

  window.RESPONSE_DATABASE = RESPONSE_DATABASE;
  window.generateAgentResponse = generateAgentResponse;
})();
