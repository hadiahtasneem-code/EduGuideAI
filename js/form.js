(() => {
  const KEYS = {
    theme: "eduguide.theme",
    results: "analysisResults",
    auth: "eduguide.auth.v1",
    profile: "eduguide.profile.v1",
    tutor: "eduguide.tutor.v1",
    planner: "eduguide.planner.v1",
    quiz: "eduguide.quiz.v1",
    guided: "eduguide.guided.v1",
  };

  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeParse = (raw, fallback) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const prefersDark = () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const getTheme = () => {
    const stored = sessionStorage.getItem(KEYS.theme) || "";
    if (stored === "dark" || stored === "light") return stored;
    return prefersDark() ? "dark" : "light";
  };

  const setTheme = (theme) => {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    sessionStorage.setItem(KEYS.theme, t);
    const label = byId("themeLabel");
    if (label) label.textContent = t === "dark" ? "Dark" : "Light";
    qsa('[data-setting="theme"]').forEach((el) => {
      if ("value" in el) el.value = t;
    });
    return t;
  };

  const getResults = () => safeParse(sessionStorage.getItem(KEYS.results), null);

  const setResults = (payload) => {
    sessionStorage.setItem(KEYS.results, JSON.stringify(payload));
  };

  const getAuth = () => safeParse(sessionStorage.getItem(KEYS.auth), null);
  const setAuth = (obj) => sessionStorage.setItem(KEYS.auth, JSON.stringify(obj));
  const clearAuth = () => sessionStorage.removeItem(KEYS.auth);

  const getProfile = () =>
    safeParse(sessionStorage.getItem(KEYS.profile), {
      name: "",
      email: "",
      educationLevel: "",
      semester: "",
      careerGoal: "",
      weakSubjects: "",
      strongSubjects: "",
      dailyStudyHours: "",
      learningStyle: "",
      avatarDataUrl: "",
    });

  const setProfile = (obj) => sessionStorage.setItem(KEYS.profile, JSON.stringify(obj));

  const openOverlay = (overlayEl) => {
    if (!overlayEl) return;
    overlayEl.classList.add("is-open");
    overlayEl.setAttribute("aria-hidden", "false");
    const focusable = qs('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', overlayEl);
    focusable?.focus?.();
  };

  const closeOverlay = (overlayEl) => {
    if (!overlayEl) return;
    overlayEl.classList.remove("is-open");
    overlayEl.setAttribute("aria-hidden", "true");
  };

  const guideSteps = [
    { num: 1, id: "profile", label: "Profile", page: "analysis", anchor: "stepProfile" },
    { num: 2, id: "gaps", label: "Gaps", page: "analysis", anchor: "stepGaps" },
    { num: 3, id: "planner", label: "Plan", page: "planner", anchor: "" },
    { num: 4, id: "resources", label: "Resources", page: "resources", anchor: "" },
    { num: 5, id: "career", label: "Career", page: "career", anchor: "" },
  ];

  const getGuided = () => {
    const base = safeParse(sessionStorage.getItem(KEYS.guided), null);
    const enabled = base?.enabled !== false;
    const step = Number(base?.step) || 1;
    const visited = Array.isArray(base?.visited) ? base.visited : [];
    return { enabled, step: clamp(step, 1, 5), visited };
  };

  const setGuided = (obj) => {
    sessionStorage.setItem(KEYS.guided, JSON.stringify(obj));
    return obj;
  };

  const markVisitedStep = (n) => {
    const s = getGuided();
    const step = clamp(Number(n) || 1, 1, 5);
    const next = { ...s };
    const set = new Set(next.visited || []);
    set.add(step);
    next.visited = Array.from(set).sort((a, b) => a - b);
    setGuided(next);
    return next;
  };

  const setGuidedStep = (n) => {
    const s = getGuided();
    const step = clamp(Number(n) || 1, 1, 5);
    const next = { ...s, step };
    setGuided(next);
    return next;
  };

  const scrollToAnchor = (anchorId) => {
    if (!anchorId) return;
    const el = byId(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasAnalysis = (results) => Boolean(results && results.analysis && results.user_profile);

  const renderGuidedBar = (results) => {
    const bar = byId("guidedBar");
    if (!bar) return;

    const guide = getGuided();
    const ok = hasAnalysis(results);
    const active = guide.step;
    const visited = new Set(guide.visited || []);

    const title = ok ? `Guided Workflow • Step ${active} of 5` : "Guided Workflow • Step 1 of 5";
    const sub = ok
      ? "Follow steps in order for a clean, non-confusing flow."
      : "Start by completing your profile, then unlock each agent step-by-step.";

    const stepsHtml = guideSteps
      .map((s) => {
        const locked = !ok && s.num > 1;
        const done = visited.has(s.num) && ok;
        const cls = ["step", s.num === active ? "is-active" : "", done ? "is-done" : "", locked ? "is-locked" : ""]
          .filter(Boolean)
          .join(" ");
        return `
          <button class="${cls}" type="button" data-step="${s.num}" ${locked ? "disabled" : ""}>
            <span class="step__num" aria-hidden="true">${s.num}</span>
            <span>${escapeHtml(s.label)}</span>
          </button>
        `;
      })
      .join("");

    const nextLabel = ok ? (active >= 5 ? "Restart Steps" : "Next Step") : "Start Step 1";

    bar.innerHTML = `
      <div class="guided__meta">
        <div class="guided__kicker">${escapeHtml(title)}</div>
        <div class="guided__sub">${escapeHtml(sub)}</div>
      </div>
      <div class="guided__actions">
        <div class="stepper" role="tablist" aria-label="Steps">${stepsHtml}</div>
        <button class="btn btn--primary btn--sm" type="button" id="guidedNext">${escapeHtml(nextLabel)}</button>
      </div>
    `;
  };

  const setActivePage = (route) => {
    const pages = qsa(".page");
    const nav = qsa(".nav-item");
    const target = String(route || "dashboard");

    pages.forEach((p) => p.classList.toggle("is-active", p.dataset.page === target));
    nav.forEach((n) => n.classList.toggle("is-active", n.dataset.route === target));

    const headline = byId("pageHeadline");
    if (headline) {
      const map = {
        dashboard: "Dashboard",
        tutor: "AI Tutor",
        analysis: "Learning Analysis",
        planner: "Study Planner",
        resources: "Resources",
        career: "Career Mentor",
        quiz: "Quiz",
        profile: "Profile",
        settings: "Settings",
      };
      headline.textContent = map[target] || "Dashboard";
    }
    const kicker = byId("pageKicker");
    if (kicker) kicker.textContent = "Workspace";

    const guide = getGuided();
    if (guide.enabled) {
      if (target === "planner") setGuidedStep(3);
      if (target === "resources") setGuidedStep(4);
      if (target === "career") setGuidedStep(5);
      if (target === "analysis") setGuidedStep(getGuided().step <= 2 ? getGuided().step : 1);
      markVisitedStep(getGuided().step);
    }
    renderGuidedBar(getResults());
  };

  const openSidebar = () => byId("sidebar")?.classList.add("is-open");
  const closeSidebar = () => byId("sidebar")?.classList.remove("is-open");

  const closeSidebarIfMobile = () => {
    if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches) closeSidebar();
  };

  const animateNumber = (el, to, { suffix = "", durationMs = 900 } = {}) => {
    if (!el) return;
    const fromRaw = String(el.textContent || "").replace(/[^\d.-]/g, "");
    const from = Number(fromRaw) || 0;
    const target = Number(to) || 0;
    const start = performance.now();

    const tick = (t) => {
      const p = clamp((t - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      const rounded = suffix === "%" ? Math.round(v) : Math.round(v);
      el.textContent = `${rounded}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const animateRing = (el, percent) => {
    if (!el) return;
    const target = clamp(Number(percent) || 0, 0, 100);
    const start = performance.now();
    const from = Number(getComputedStyle(el).getPropertyValue("--p")) || 0;
    const durationMs = 900;

    const tick = (t) => {
      const p = clamp((t - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      el.style.setProperty("--p", String(v.toFixed(2)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const setProgressFill = (el, percent) => {
    if (!el) return;
    el.style.width = `${clamp(Number(percent) || 0, 0, 100)}%`;
  };

  const agentSteps = [
    { id: "profile", name: "Profile Agent", emoji: "👤" },
    { id: "gaps", name: "Learning Gap Agent", emoji: "🧩" },
    { id: "tutor", name: "Tutor Agent", emoji: "💬" },
    { id: "planner", name: "Study Planner Agent", emoji: "📅" },
    { id: "resources", name: "Resource Agent", emoji: "🔎" },
    { id: "career", name: "Career Mentor Agent", emoji: "🚀" },
    { id: "quiz", name: "Quiz Agent", emoji: "🧠" },
  ];

  const renderAgentFlow = (root, mode) => {
    if (!root) return;
    const m = mode || "idle";
    root.innerHTML = agentSteps
      .map((s, idx) => {
        const isWorking = m === "working" && idx === 0;
        const isDone = m === "done";
        const status =
          m === "idle" ? "Waiting" : isDone ? "Completed" : isWorking ? "Working…" : "Queued";
        const pill =
          isDone ? `<span class="status-pill">✅ Done</span>` : isWorking ? `<span class="status-pill"><span class="pulse" aria-hidden="true"></span> Working</span>` : `<span class="status-pill">⏳ ${escapeHtml(status)}</span>`;
        return `
          <div class="agent-step">
            <div class="agent-avatar" aria-hidden="true">${escapeHtml(s.emoji)}</div>
            <div>
              <div class="agent-name">${escapeHtml(s.name)}</div>
              <div class="agent-status">${escapeHtml(status)}</div>
            </div>
            ${pill}
          </div>
        `;
      })
      .join("");
  };

  const setOverlayStep = (root, stepIdx, status) => {
    const step = root?.children?.[stepIdx];
    if (!step) return;
    const statusEl = step.querySelector(".agent-status");
    const pillEl = step.querySelector(".status-pill");
    const name = agentSteps[stepIdx]?.name || "Agent";

    if (statusEl) statusEl.textContent = status;
    if (pillEl) {
      if (status === "Done") pillEl.innerHTML = "✅ Done";
      else if (status === "Working…") pillEl.innerHTML = '<span class="pulse" aria-hidden="true"></span> Working';
      else pillEl.textContent = `⏳ ${status}`;
    }
    step.setAttribute("aria-label", `${name}: ${status}`);
  };

  const normalizeTargetRole = (selectValue, customValue) => {
    if (selectValue === "custom") return String(customValue || "").trim();
    return String(selectValue || "").trim();
  };

  const initRoleField = () => {
    const select = byId("targetRole");
    const custom = byId("customRole");
    const hidden = byId("targetRoleValue");
    if (!select || !custom || !hidden) return;

    const sync = () => {
      const v = normalizeTargetRole(select.value, custom.value);
      hidden.value = v;
      const showCustom = select.value === "custom";
      custom.classList.toggle("is-hidden", !showCustom);
      custom.required = showCustom;
      if (!showCustom) custom.value = "";
    };

    select.addEventListener("change", sync);
    custom.addEventListener("input", sync);
    sync();
  };

  const getChecked = (name) => qsa(`input[name="${name}"]:checked`).map((el) => el.value);

  const showFormError = (el, msg) => {
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-visible", Boolean(msg));
    if (msg) {
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
    }
  };

  const renderEmpty = (title, subtitle) => `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">✨</div>
      <div class="empty-state__title">${escapeHtml(title)}</div>
      <div class="empty-state__sub">${escapeHtml(subtitle)}</div>
    </div>
  `;

  const renderAnalysisSummary = (results) => {
    const root = byId("analysisSummary");
    if (!root) return;
    if (!results?.analysis) {
      root.innerHTML = renderEmpty("No analysis yet", "Complete your profile and hit Analyze to generate insights.");
      return;
    }

    const profile = results.analysis.profile || {};
    const gaps = results.analysis.gaps || {};

    const readiness = parseInt(String(profile.estimated_readiness || "0").replace("%", ""), 10) || 0;
    const strengths = (profile.strengths || []).slice(0, 6);
    const improve = (profile.areas_to_improve || []).slice(0, 6);
    const tech = (gaps.technical_skills || []).slice(0, 6);
    const soft = (gaps.soft_skills || []).slice(0, 6);
    const quick = (gaps.quick_wins || []).slice(0, 6);

    root.innerHTML = `
      <div class="widget-sub hover-lift" id="stepProfile">
        <div class="widget-sub__top">
          <div>
            <div class="widget__label">Step 1 • Profile Agent</div>
            <div class="widget__value" style="margin-top: 10px">${escapeHtml(readiness)}%</div>
          </div>
          <span class="pill pill--low">Readiness</span>
        </div>
        <div style="margin-top: 12px" class="progress">
          <div class="progress__fill" style="width: ${clamp(readiness, 0, 100)}%"></div>
        </div>
        <div class="widget__meta" style="margin-top: 10px">${escapeHtml(profile.summary || "A focused snapshot of your current trajectory.")}</div>
        <div class="grid-2" style="margin-top: 14px">
          <div class="panel__sub">
            <h3 class="panel__title">Strengths</h3>
            <ul class="list">${strengths.map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
          <div class="panel__sub">
            <h3 class="panel__title">Areas to Improve</h3>
            <ul class="list">${improve.map((x) => `<li>🎯 ${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>

      <div class="widget-sub hover-lift" id="stepGaps" style="margin-top: 14px">
        <div class="widget-sub__top">
          <div>
            <div class="widget__label">Step 2 • Learning Gap Agent</div>
            <div class="widget__meta" style="margin-top: 10px">Your highest-impact priorities, ordered for fast progress.</div>
          </div>
          <span class="pill pill--medium">Priority</span>
        </div>
        <div style="margin-top: 12px" class="grid-cards">
          ${tech
            .map(
              (s) => `
            <div class="chip-card">
              <div class="chip-card__top">
                <div class="chip-card__title">${escapeHtml(s.skill)}</div>
                <span class="pill pill--${escapeHtml(String(s.importance || "").toLowerCase())}">${escapeHtml(s.importance || "Medium")}</span>
              </div>
              <div class="chip-card__meta">Estimated time: ${escapeHtml(String(s.learning_time_weeks ?? ""))} weeks</div>
            </div>
          `
            )
            .join("")}
        </div>
        ${
          soft.length || quick.length
            ? `<div class="grid-2" style="margin-top: 14px">
                <div class="panel__sub">
                  <h3 class="panel__title">Soft skills</h3>
                  <ul class="list">${soft.map((x) => `<li>• ${escapeHtml(x.skill || x)}</li>`).join("")}</ul>
                </div>
                <div class="panel__sub">
                  <h3 class="panel__title">Quick wins</h3>
                  <ul class="list">${quick.map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("")}</ul>
                </div>
              </div>`
            : ""
        }
      </div>
    `;
  };

  const deriveDashboardStats = (results) => {
    const profile = results?.analysis?.profile || {};
    const gaps = results?.analysis?.gaps || {};
    const plan = results?.analysis?.study_plan || {};
    const resources = results?.analysis?.resources || {};

    const readiness = parseInt(String(profile.estimated_readiness || "0").replace("%", ""), 10) || 0;
    const progress = clamp(readiness, 0, 100);
    const topicsCompleted = clamp(Math.round(((gaps?.technical_skills || []).length ? 18 : 6) + progress / 8), 0, 200);
    const resourcesCount =
      (resources.youtube_videos?.length || 0) +
      (resources.online_courses?.length || 0) +
      (resources.books?.length || 0) +
      (resources.free_resources?.length || 0);

    const streak = clamp(Math.round((progress / 100) * 14 + 2), 0, 90);
    const accuracy = clamp(Math.round(72 + progress / 7), 0, 100);

    const weeklyGoal = clamp(Math.round((plan.weekly_plans?.[0]?.total_hours || 0) * 3.2), 0, 100);
    return { readiness, progress, topicsCompleted, resourcesCount, streak, accuracy, weeklyGoal };
  };

  const hydrateDashboard = (results) => {
    const stats = results ? deriveDashboardStats(results) : null;

    const progressEl = qs('[data-counter="progress"]');
    const streakEl = qs('[data-counter="streak"]');
    const accuracyEl = qs('[data-counter="accuracy"]');
    const readinessEl = qs('[data-counter="readiness"]');

    if (!stats) {
      progressEl && (progressEl.textContent = "0%");
      streakEl && (streakEl.textContent = "0");
      accuracyEl && (accuracyEl.textContent = "0%");
      readinessEl && (readinessEl.textContent = "0%");
      animateRing(byId("ringProgress"), 0);
      animateRing(byId("ringStreak"), 0);
      animateRing(byId("ringAccuracy"), 0);
      animateRing(byId("ringReadiness"), 0);
      setProgressFill(byId("weeklyBar"), 0);
      renderAgentFlow(byId("agentFlow"), "idle");
      return;
    }

    animateNumber(progressEl, stats.progress, { suffix: "%", durationMs: 900 });
    animateNumber(streakEl, stats.streak, { suffix: "", durationMs: 900 });
    animateNumber(accuracyEl, stats.accuracy, { suffix: "%", durationMs: 900 });
    animateNumber(readinessEl, stats.readiness, { suffix: "%", durationMs: 900 });

    animateRing(byId("ringProgress"), stats.progress);
    animateRing(byId("ringStreak"), clamp((stats.streak / 30) * 100, 0, 100));
    animateRing(byId("ringAccuracy"), stats.accuracy);
    animateRing(byId("ringReadiness"), stats.readiness);

    setProgressFill(byId("weeklyBar"), stats.weeklyGoal);
    renderAgentFlow(byId("agentFlow"), "done");
  };

  const makeResourceThumb = ({ title, accentA, accentB, icon }) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="720" height="404" viewBox="0 0 720 404">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${accentA}" />
            <stop offset="1" stop-color="${accentB}" />
          </linearGradient>
          <filter id="b" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>
        <rect width="720" height="404" rx="26" fill="url(#g)"/>
        <circle cx="150" cy="120" r="92" fill="rgba(255,255,255,0.18)" filter="url(#b)"/>
        <circle cx="600" cy="90" r="120" fill="rgba(255,255,255,0.14)" filter="url(#b)"/>
        <circle cx="520" cy="340" r="160" fill="rgba(255,255,255,0.12)" filter="url(#b)"/>
        <text x="46" y="150" font-size="84" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="800" fill="rgba(255,255,255,0.92)">${icon}</text>
        <text x="46" y="214" font-size="28" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="800" fill="rgba(255,255,255,0.96)">${escapeHtml(title).slice(0, 34)}</text>
        <rect x="46" y="246" width="628" height="74" rx="18" fill="rgba(15,23,42,0.14)" stroke="rgba(255,255,255,0.20)"/>
        <text x="66" y="292" font-size="22" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="700" fill="rgba(255,255,255,0.90)">Open resource →</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
  };

  const renderResources = (results) => {
    const root = byId("resourcesContent");
    if (!root) return;
    const data = results?.analysis?.resources;
    if (!data) {
      root.innerHTML = renderEmpty("No recommendations yet", "Run analysis to generate resources matched to your goals.");
      return;
    }

    const sections = [
      {
        title: "YouTube Playlists",
        icon: "📺",
        items: (data.youtube_videos || []).map((x) => ({
          title: x.title,
          category: "YouTube",
          difficulty: x.difficulty || "Mixed",
          duration: `${x.duration_minutes || "—"} min`,
          badge: "Free",
          desc: x.why_recommended || "",
          url: x.url,
          accentA: "#ef4444",
          accentB: "#a855f7",
        })),
      },
      {
        title: "Courses",
        icon: "🎓",
        items: (data.online_courses || []).map((x) => ({
          title: x.title,
          category: x.provider || "Course",
          difficulty: x.level || "Intermediate",
          duration: `${x.duration_weeks || "—"} weeks`,
          badge: Number(x.cost) === 0 ? "Free" : "Paid",
          desc: x.why_recommended || "",
          url: x.url,
          accentA: "#3b82f6",
          accentB: "#a855f7",
        })),
      },
      {
        title: "Books",
        icon: "📚",
        items: (data.books || []).map((x) => ({
          title: x.title,
          category: x.author || "Book",
          difficulty: x.difficulty || "Mixed",
          duration: `${x.estimated_reading_hours || "—"} hrs`,
          badge: "Reading",
          desc: `~${x.pages || "—"} pages`,
          url: x.url || "",
          accentA: "#22c55e",
          accentB: "#a855f7",
        })),
      },
      {
        title: "Documentation & Free Resources",
        icon: "🧩",
        items: (data.free_resources || []).map((x) => ({
          title: x.title,
          category: x.type || "Free",
          difficulty: "—",
          duration: "—",
          badge: "Free",
          desc: "",
          url: x.url,
          accentA: "#0ea5e9",
          accentB: "#7c3aed",
        })),
      },
    ];

    root.innerHTML = sections
      .map((s) => {
        const cards =
          s.items.length === 0
            ? `<div class="empty">No items in this category yet.</div>`
            : `<div class="resource-grid">
              ${s.items
                .map((r) => {
                  const thumb = makeResourceThumb({
                    title: r.title,
                    accentA: r.accentA,
                    accentB: r.accentB,
                    icon: s.icon,
                  });
                  const badgeClass = r.badge === "Paid" ? "badge badge--paid" : "badge badge--free";
                  return `
                    <article class="resource-tile hover-lift">
                      <div class="resource-tile__thumb"><img alt="" src="${thumb}" /></div>
                      <div class="resource-tile__body">
                        <div class="resource-tile__top">
                          <div class="resource-tile__title">${escapeHtml(r.title)}</div>
                          <span class="${badgeClass}">${escapeHtml(r.badge)}</span>
                        </div>
                        <div class="resource-tile__meta">
                          <span class="pill">${escapeHtml(r.category)}</span>
                          <span class="pill">${escapeHtml(r.difficulty)}</span>
                          <span class="pill">${escapeHtml(r.duration)}</span>
                        </div>
                        <div class="resource-tile__desc">${escapeHtml(r.desc)}</div>
                        <div class="resource-tile__actions">
                          ${
                            r.url
                              ? `<a class="btn btn--primary btn--sm" href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer">Open Resource</a>`
                              : `<button class="btn btn--soft btn--sm" type="button" data-disabled>Coming soon</button>`
                          }
                        </div>
                      </div>
                    </article>
                  `;
                })
                .join("")}
            </div>`;
        return `
          <div class="resource-section">
            <div class="section-title">${escapeHtml(s.icon)} ${escapeHtml(s.title)}</div>
            ${cards}
          </div>
        `;
      })
      .join("");
  };

  const renderCareer = (results) => {
    const bar = byId("careerProgressFill");
    const meta = byId("careerProgressMeta");
    const root = byId("careerContent");
    if (!bar || !meta || !root) return;
    const profile = results?.analysis?.profile || {};
    const career = results?.analysis?.career_path || {};

    if (!results?.analysis) {
      setProgressFill(bar, 0);
      meta.textContent = "Run analysis to generate a roadmap and readiness score.";
      root.innerHTML = renderEmpty("No roadmap yet", "Complete analysis to unlock your career timeline.");
      return;
    }

    const readiness = clamp(parseInt(String(profile.estimated_readiness || "0").replace("%", ""), 10) || 0, 0, 100);
    setProgressFill(bar, readiness);
    meta.textContent = `${readiness}% readiness toward ${results?.user_profile?.target_role || "your goal"}.`;

    const roadmap = Array.isArray(career.career_roadmap) ? career.career_roadmap : [];
    const next = Array.isArray(career.next_steps) ? career.next_steps : [];
    const market = career.job_market_insights || {};

    const blocks =
      roadmap.length === 0
        ? renderEmpty("No roadmap items", "Try running analysis again to generate a roadmap.")
        : `
          <div class="timeline">
            ${roadmap
              .map(
                (s, idx) => `
              <details class="timeline-step" ${idx === 0 ? "open" : ""}>
                <summary class="timeline-step__summary">
                  <span class="timeline-step__dot" aria-hidden="true"></span>
                  <span class="timeline-step__title">${escapeHtml(s.stage || "Stage")} — ${escapeHtml(s.role || "")}</span>
                  <span class="timeline-step__meta">${escapeHtml(String(s.duration_months ?? ""))} months</span>
                </summary>
                <div class="timeline-step__body">
                  <div class="timeline-step__hint">Focus: projects, fundamentals, and measurable progress.</div>
                </div>
              </details>
            `
              )
              .join("")}
          </div>
        `;

    root.innerHTML = `
      ${blocks}
      <div class="grid-2" style="margin-top: 14px">
        <div class="widget-sub hover-lift">
          <div class="widget__label">Skill Gap Analysis</div>
          <div class="widget__meta" style="margin-top: 10px">Use Learning Analysis to prioritize skills by impact.</div>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Career Match (Directional)</div>
          <div class="widget__value" style="margin-top: 10px">${escapeHtml(String(clamp(readiness + 8, 0, 100)))}%</div>
          <div class="widget__meta">${escapeHtml(market.demand ? `Demand: ${market.demand}` : "Matched to your current trajectory.")}</div>
        </div>
      </div>
      <div class="widget-sub hover-lift" style="margin-top: 14px">
        <div class="widget__label">Next Steps</div>
        <ul class="list" style="margin-top: 10px">${next.slice(0, 8).map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("")}</ul>
      </div>
    `;
  };

  const renderPlanner = (results) => {
    const root = byId("plannerContent");
    const fill = byId("planProgressFill");
    const meta = byId("planProgressMeta");
    if (!root || !fill || !meta) return;

    const plan = results?.analysis?.study_plan;
    if (!plan) {
      root.innerHTML = renderEmpty("No plan yet", "Run analysis to generate a daily/weekly study plan.");
      setProgressFill(fill, 0);
      meta.textContent = "0% complete";
      return;
    }

    const stored = safeParse(sessionStorage.getItem(KEYS.planner), { done: {} });
    const done = stored?.done || {};
    const weeks = Array.isArray(plan.weekly_plans) ? plan.weekly_plans.slice(0, 12) : [];
    const flat = [];
    weeks.forEach((w) => (w.topics || []).forEach((t) => flat.push({ week: w.week, theme: w.theme, topic: t.name, hours: t.hours })));

    const total = flat.length || 1;
    const completed = flat.filter((x) => done[`${x.week}:${x.topic}`]).length;
    const pct = clamp(Math.round((completed / total) * 100), 0, 100);
    setProgressFill(fill, pct);
    meta.textContent = `${pct}% complete (${completed}/${total} tasks)`;

    const daily = flat.slice(0, 6);
    const dailyHtml = daily
      .map((x) => {
        const id = `${x.week}:${x.topic}`;
        const checked = done[id] ? "checked" : "";
        return `
          <label class="task">
            <input type="checkbox" data-task="${escapeHtml(id)}" ${checked} />
            <span class="task__text">${escapeHtml(x.topic)} <span class="task__meta">(${escapeHtml(String(x.hours))} hrs)</span></span>
          </label>
        `;
      })
      .join("");

    const weeklyHtml =
      weeks.length === 0
        ? `<div class="empty">No weekly plan available.</div>`
        : `
          <div class="weeks">
            ${weeks
              .map((w, idx) => {
                const topics = (w.topics || [])
                  .map((t) => {
                    const id = `${w.week}:${t.name}`;
                    const checked = done[id] ? "checked" : "";
                    return `
                      <label class="task task--compact">
                        <input type="checkbox" data-task="${escapeHtml(id)}" ${checked} />
                        <span class="task__text">${escapeHtml(t.name)} <span class="task__meta">${escapeHtml(String(t.hours))} hrs</span></span>
                      </label>
                    `;
                  })
                  .join("");
                return `
                  <details class="week" ${idx === 0 ? "open" : ""}>
                    <summary>Week ${escapeHtml(w.week)}: ${escapeHtml(w.theme)} (${escapeHtml(w.total_hours)} hrs)</summary>
                    <div style="margin-top: 10px; display: grid; gap: 10px">${topics}</div>
                    <div class="week__meta">Milestone: ${escapeHtml(w.checkpoint || "Build confidence + ship a small deliverable.")}</div>
                  </details>
                `;
              })
              .join("")}
          </div>
        `;

    root.innerHTML = `
      <div class="grid-2">
        <div class="widget-sub hover-lift">
          <div class="widget__label">Daily Plan</div>
          <div class="widget__meta" style="margin-top: 10px">A short checklist to start right now.</div>
          <div class="task-list" style="margin-top: 12px">${dailyHtml}</div>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Monthly Goals</div>
          <div class="widget__meta" style="margin-top: 10px">High-level direction from your plan themes.</div>
          <ul class="list" style="margin-top: 10px">
            ${weeks
              .slice(0, 4)
              .map((w) => `<li>🏁 Week ${escapeHtml(w.week)}: ${escapeHtml(w.theme)} — ${escapeHtml(w.checkpoint || "Checkpoint")}</li>`)
              .join("")}
          </ul>
        </div>
      </div>
      <div class="widget-sub hover-lift" style="margin-top: 14px">
        <div class="widget__label">Weekly Roadmap</div>
        <div class="widget__meta" style="margin-top: 10px">Expand a week to track topics and time.</div>
        <div style="margin-top: 12px">${weeklyHtml}</div>
      </div>
    `;

    qsa("[data-task]", root).forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.getAttribute("data-task");
        if (!id) return;
        const next = safeParse(sessionStorage.getItem(KEYS.planner), { done: {} });
        next.done = next.done || {};
        next.done[id] = cb.checked;
        sessionStorage.setItem(KEYS.planner, JSON.stringify(next));
        renderPlanner(getResults());
      });
    });
  };

  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  const nextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (8 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const buildPlanTxt = (results) => {
    const role = results?.user_profile?.target_role || "Goal";
    const plan = results?.analysis?.study_plan;
    if (!plan) return "";
    const weeks = Array.isArray(plan.weekly_plans) ? plan.weekly_plans : [];
    const lines = [`EduGuide AI Study Plan`, `Target: ${role}`, ``];
    weeks.slice(0, 16).forEach((w) => {
      lines.push(`Week ${w.week}: ${w.theme} (${w.total_hours} hrs)`);
      (w.topics || []).forEach((t) => lines.push(`- ${t.name} — ${t.hours} hrs`));
      if (w.checkpoint) lines.push(`Checkpoint: ${w.checkpoint}`);
      lines.push("");
    });
    return lines.join("\n");
  };

  const downloadIcs = (studyPlan, titleBase) => {
    const start = nextMonday();
    const weeks = (studyPlan?.weekly_plans || []).slice(0, 24);
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EduGuide AI//EN", "CALSCALE:GREGORIAN"];

    weeks.forEach((w, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx * 7);
      const dt = ymd(d);
      const uid = `${dt}-${w.week}-eduguide@local`;
      const summary = `${titleBase} - Week ${w.week}: ${w.theme}`;
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${ymd(new Date())}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${dt}`);
      lines.push(`DTEND;VALUE=DATE:${dt}`);
      lines.push(`SUMMARY:${summary.replace(/\n/g, " ")}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eduguide-study-plan.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const initExports = () => {
    byId("exportTxtBtn")?.addEventListener("click", () => {
      const results = getResults();
      const txt = buildPlanTxt(results);
      if (!txt) return;
      downloadText("eduguide-study-plan.txt", txt);
    });
    byId("exportPdfBtn")?.addEventListener("click", () => window.print());
    byId("exportIcsBtn")?.addEventListener("click", () => {
      const results = getResults();
      const plan = results?.analysis?.study_plan;
      const role = results?.user_profile?.target_role || "Study";
      if (!plan) return;
      downloadIcs(plan, `EduGuide AI (${role})`);
    });
  };

  const tutorState = () => safeParse(sessionStorage.getItem(KEYS.tutor), { messages: [] });
  const setTutorState = (s) => sessionStorage.setItem(KEYS.tutor, JSON.stringify(s));

  const renderTutor = () => {
    const root = byId("tutorChat");
    if (!root) return;
    const s = tutorState();
    if (!s.messages || s.messages.length === 0) {
      root.innerHTML = renderEmpty("Start a conversation", "Ask a question or use a quick action.");
      return;
    }

    root.innerHTML = s.messages
      .map((m) => {
        const cls = m.role === "user" ? "bubble bubble--user" : "bubble bubble--ai";
        const actions =
          m.role === "ai"
            ? `<div class="bubble__actions">
                <button class="mini" type="button" data-copy="${escapeHtml(m.id)}">Copy</button>
                <button class="mini" type="button" data-regen="${escapeHtml(m.id)}">Regenerate</button>
              </div>`
            : "";
        return `<div class="${cls}" data-msg="${escapeHtml(m.id)}">${escapeHtml(m.text)}${actions}</div>`;
      })
      .join("");

    root.scrollTop = root.scrollHeight;

    qsa("[data-copy]", root).forEach((b) => {
      b.addEventListener("click", async () => {
        const id = b.getAttribute("data-copy");
        const msg = tutorState().messages.find((x) => x.id === id);
        if (!msg) return;
        try {
          await navigator.clipboard.writeText(msg.text);
          b.textContent = "Copied";
          window.setTimeout(() => (b.textContent = "Copy"), 900);
        } catch {}
      });
    });

    qsa("[data-regen]", root).forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-regen");
        const s2 = tutorState();
        const idx = s2.messages.findIndex((x) => x.id === id);
        if (idx === -1) return;
        const base = s2.messages[idx];
        s2.messages.splice(idx, 1);
        s2.messages.push({ id: `${Date.now()}a`, role: "ai", text: `${base.text}\n\nAlternative angle: break it into steps and validate with a small example.` });
        setTutorState(s2);
        renderTutor();
      });
    });
  };

  const pushTutor = (role, text) => {
    const s = tutorState();
    const msg = { id: `${Date.now()}${Math.random().toString(16).slice(2)}`, role, text: String(text || "") };
    s.messages = Array.isArray(s.messages) ? s.messages : [];
    s.messages.push(msg);
    s.messages = s.messages.slice(-80);
    setTutorState(s);
    renderTutor();
    return msg;
  };

  const showTutorTyping = () => {
    const root = byId("tutorChat");
    if (!root) return;
    const typing = document.createElement("div");
    typing.className = "bubble bubble--ai";
    typing.dataset.typing = "true";
    typing.innerHTML = `<div class="typing" aria-label="AI typing"><span></span><span></span><span></span></div>`;
    root.appendChild(typing);
    root.scrollTop = root.scrollHeight;
  };

  const hideTutorTyping = () => {
    qs('[data-typing="true"]', byId("tutorChat"))?.remove?.();
  };

  const tutorAgent = () => window.AGENTS?.tutorSage || { id: "tutorSage", name: "Tutor Sage" };

  const tutorEngineHistory = () => {
    const s = tutorState();
    const list = Array.isArray(s.messages) ? s.messages.slice(-24) : [];
    const ts = new Date().toISOString();
    return list.map((m) => ({ role: m.role === "ai" ? "agent" : "user", text: String(m.text || ""), ts }));
  };

  const modePrefix = (mode) => {
    const m = mode || "";
    if (m === "eli10") return "Explain like I'm 10:\n";
    if (m === "simplify") return "Simplify:\n";
    if (m === "example") return "Give an example:\n";
    if (m === "real") return "Give a real-world example:\n";
    if (m === "notes") return "Generate structured notes:\n";
    if (m === "flashcards") return "Generate flashcards:\n";
    if (m === "quiz") return "Generate a short quiz:\n";
    return "";
  };

  const educationSuggestionBank = {
    high_school: [
      { tag: "Math", q: "Explain quadratic equations with one solved example." },
      { tag: "Physics", q: "Explain Newton’s 3 laws with real-life examples." },
      { tag: "Chemistry", q: "What is the periodic table and how is it organized?" },
      { tag: "Biology", q: "Explain photosynthesis step-by-step." },
      { tag: "English", q: "How to write a strong paragraph with topic sentence + evidence?" },
    ],
    bachelors: [
      { tag: "DSA", q: "Explain arrays vs linked lists with time complexity." },
      { tag: "DBMS", q: "Explain SQL JOIN types with a tiny example." },
      { tag: "OS", q: "What is a process vs a thread? Give examples." },
      { tag: "Networks", q: "Explain HTTP vs HTTPS and what SSL/TLS does." },
      { tag: "OOP", q: "Explain inheritance vs composition with examples." },
    ],
    masters: [
      { tag: "ML", q: "Explain overfitting and how to reduce it." },
      { tag: "Stats", q: "Explain bias vs variance in simple terms." },
      { tag: "DL", q: "What is backpropagation (high-level)?" },
      { tag: "MLOps", q: "What is model deployment and monitoring?" },
      { tag: "Research", q: "How to read a research paper effectively?" },
    ],
    professional: [
      { tag: "Career", q: "How do I plan a 3-month upskilling roadmap for my role?" },
      { tag: "Resume", q: "How do I convert projects into strong resume bullets?" },
      { tag: "Interview", q: "Give a structured way to answer behavioral questions." },
      { tag: "Time", q: "How can I build a study routine with a busy schedule?" },
      { tag: "Portfolio", q: "What makes a portfolio project impressive?" },
    ],
    self_learning: [
      { tag: "Plan", q: "Create a simple study routine for 10 hours/week." },
      { tag: "Focus", q: "How do I avoid tutorial hell and start projects?" },
      { tag: "Practice", q: "How should I practice to actually improve?" },
      { tag: "Motivation", q: "How do I stay consistent for 30 days?" },
      { tag: "Strategy", q: "What’s the fastest way to learn a new topic deeply?" },
    ],
  };

  const getEducationLevelForSuggestions = () => {
    const fromResults = getResults()?.user_profile?.education_level;
    const fromForm = byId("educationLevel")?.value;
    return String(fromResults || fromForm || "").trim();
  };

  const renderTutorSuggestions = (results) => {
    const root = byId("tutorSuggestions");
    if (!root) return;

    const edu = String(results?.user_profile?.education_level || getEducationLevelForSuggestions() || "self_learning");
    const bank = educationSuggestionBank[edu] || educationSuggestionBank.self_learning;
    const gapSkills = (results?.analysis?.gaps?.technical_skills || []).slice(0, 4).map((x) => x.skill).filter(Boolean);

    const chips = [
      ...gapSkills.map((s) => ({ tag: "From Gaps", q: `Explain ${s} step-by-step with an example.` })),
      ...bank,
    ].slice(0, 10);

    root.innerHTML = chips
      .map(
        (c) => `
        <button class="suggest-chip" type="button" data-suggest="${escapeHtml(c.q)}">
          <span class="suggest-chip__tag">${escapeHtml(c.tag)}</span>
          <span>•</span>
          <span>${escapeHtml(c.q)}</span>
        </button>
      `
      )
      .join("");
  };

  const buildMiniQuizText = (topic) => {
    const t = String(topic || "").trim();
    if (!t) return "Tell me the topic and I’ll generate 5 quiz questions.";
    return `Mini quiz on ${t}:\n1) Define ${t} in one sentence.\n2) Give one common mistake.\n3) Give a tiny example.\n4) When would you use it?\n5) One quick practice question.`;
  };

  const generateTutorAnswer = async (userText, mode) => {
    const pref = modePrefix(mode);
    const prompt = `${pref}${String(userText || "").trim()}`.trim();
    if (!prompt) return "Tell me what topic you want help with.";

    if (mode === "quiz") return buildMiniQuizText(userText);

    if (typeof window.generateAgentResponse === "function") {
      try {
        const res = await window.generateAgentResponse(prompt, tutorAgent(), tutorEngineHistory());
        return String(res || "");
      } catch {
        return "I couldn’t generate a response right now. Try again with a shorter question.";
      }
    }

    return `${pref}${prompt}\n\n1) Key idea\n2) Steps\n3) Common mistakes\n4) A tiny practice task`;
  };

  const initTutor = () => {
    renderTutor();
    renderTutorSuggestions(getResults());

    byId("tutorSend")?.addEventListener("click", async () => {
      const input = byId("tutorInput");
      const text = input?.value?.trim?.() || "";
      if (!text) return;
      pushTutor("user", text);
      input.value = "";
      showTutorTyping();
      const answer = await generateTutorAnswer(text, "");
      hideTutorTyping();
      pushTutor("ai", answer);
    });

    qsa("[data-quick]").forEach((b) => {
      b.addEventListener("click", async () => {
        const input = byId("tutorInput");
        const mode = b.getAttribute("data-quick") || "";
        const base = input?.value?.trim?.() || "Explain the concept.";
        pushTutor("user", base);
        showTutorTyping();
        const answer = await generateTutorAnswer(base, mode);
        hideTutorTyping();
        pushTutor("ai", answer);
      });
    });

    byId("tutorSuggestions")?.addEventListener("click", async (e) => {
      const btn = e.target?.closest?.("[data-suggest]");
      if (!btn) return;
      const q = btn.getAttribute("data-suggest") || "";
      if (!q) return;
      pushTutor("user", q);
      showTutorTyping();
      const answer = await generateTutorAnswer(q, "");
      hideTutorTyping();
      pushTutor("ai", answer);
    });
  };

  const quizState = () =>
    safeParse(sessionStorage.getItem(KEYS.quiz), {
      items: [],
      idx: 0,
      startedAt: 0,
      durationSec: 8 * 60,
      answers: {},
      finished: false,
      metaKey: "",
    });

  const setQuizState = (s) => sessionStorage.setItem(KEYS.quiz, JSON.stringify(s));

  const hashStr = (s) => {
    const str = String(s || "");
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const pickDeterministic = (arr, key) => {
    const a = Array.isArray(arr) ? arr : [];
    if (a.length === 0) return null;
    const idx = hashStr(key) % a.length;
    return a[idx];
  };

  const normalizeKey = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const quizMetaKeyFromResults = (results) => {
    const edu = results?.user_profile?.education_level || "";
    const role = results?.user_profile?.target_role || "";
    const skills = (results?.analysis?.gaps?.technical_skills || []).slice(0, 8).map((x) => x.skill).filter(Boolean);
    return `${normalizeKey(edu)}|${normalizeKey(role)}|${skills.map(normalizeKey).join(",")}`;
  };

  const skillQuestionBank = [
    {
      match: ["html"],
      items: [
        {
          topic: "HTML",
          question: "What does HTML primarily do in a web page?",
          options: ["Defines structure/content", "Styles the layout", "Runs server logic", "Stores database records"],
          correctIdx: 0,
          explanation: "HTML defines the structure and content (headings, paragraphs, links).",
        },
        {
          topic: "HTML",
          question: "Which tag is best for the main top-level heading?",
          options: ["<h1>", "<p>", "<div>", "<span>"],
          correctIdx: 0,
          explanation: "Use <h1> for the primary page heading (semantic structure).",
        },
      ],
    },
    {
      match: ["css", "responsive", "flexbox"],
      items: [
        {
          topic: "CSS",
          question: "What is CSS primarily used for?",
          options: ["Styling and layout", "Database queries", "Server-side routing", "Encrypting passwords"],
          correctIdx: 0,
          explanation: "CSS controls how HTML looks: colors, spacing, layout, responsiveness.",
        },
        {
          topic: "CSS",
          question: "Which CSS unit is most suitable for responsive typography?",
          options: ["rem", "px only", "pt", "cm"],
          correctIdx: 0,
          explanation: "rem scales with the root font size and adapts better across layouts.",
        },
      ],
    },
    {
      match: ["javascript", "js", "dom"],
      items: [
        {
          topic: "JavaScript",
          question: "What does JavaScript most commonly handle in a web app?",
          options: ["Interactivity and logic in the browser", "Only styling", "Only database tables", "Only DNS configuration"],
          correctIdx: 0,
          explanation: "JavaScript powers interactivity: events, DOM updates, and client logic.",
        },
        {
          topic: "JavaScript",
          question: "What does DOM stand for?",
          options: ["Document Object Model", "Data Output Method", "Dynamic Order Map", "Developer Options Mode"],
          correctIdx: 0,
          explanation: "The DOM is the structured representation of the page that JS can read/change.",
        },
      ],
    },
    {
      match: ["sql", "database", "dbms", "join"],
      items: [
        {
          topic: "SQL",
          question: "Which SQL clause filters rows after grouping?",
          options: ["HAVING", "WHERE", "SELECT", "ORDER BY"],
          correctIdx: 0,
          explanation: "WHERE filters rows before grouping; HAVING filters after GROUP BY.",
        },
        {
          topic: "SQL",
          question: "What does an INNER JOIN return?",
          options: ["Only matching rows between tables", "All rows from left table", "All rows from both tables", "Only non-matching rows"],
          correctIdx: 0,
          explanation: "INNER JOIN keeps only rows with matches on the join condition.",
        },
      ],
    },
    {
      match: ["git", "github", "version control"],
      items: [
        {
          topic: "Git",
          question: "What is a Git commit?",
          options: ["A snapshot of changes with a message", "A password reset", "A file deletion only", "A merge conflict"],
          correctIdx: 0,
          explanation: "A commit records a set of changes as a snapshot in history.",
        },
        {
          topic: "Git",
          question: "Which command creates a new branch?",
          options: ["git checkout -b feature", "git push origin main", "git commit -m msg", "git status"],
          correctIdx: 0,
          explanation: "git checkout -b <name> creates and switches to a new branch.",
        },
      ],
    },
    {
      match: ["python"],
      items: [
        {
          topic: "Python",
          question: "What is a Python list?",
          options: ["An ordered, mutable collection", "An immutable number", "A database table", "A compiled binary"],
          correctIdx: 0,
          explanation: "Lists store ordered items and can be modified (append, remove, etc.).",
        },
        {
          topic: "Python",
          question: "What does a function return if there is no return statement?",
          options: ["None", "0", "false", "an empty string"],
          correctIdx: 0,
          explanation: "In Python, functions return None by default if no return is specified.",
        },
      ],
    },
    {
      match: ["data structure", "dsa", "algorithm", "time complexity", "big o"],
      items: [
        {
          topic: "DSA",
          question: "What does Big-O notation describe?",
          options: ["How runtime grows with input size", "Exact runtime in milliseconds", "CPU brand", "Network latency only"],
          correctIdx: 0,
          explanation: "Big-O expresses growth rate (e.g., O(n), O(n log n)).",
        },
        {
          topic: "DSA",
          question: "Which data structure is best for FIFO behavior?",
          options: ["Queue", "Stack", "Tree", "Set"],
          correctIdx: 0,
          explanation: "Queue follows First-In-First-Out (FIFO).",
        },
      ],
    },
    {
      match: ["api", "rest", "http"],
      items: [
        {
          topic: "APIs",
          question: "What is a REST API most commonly used for?",
          options: ["Exchanging data between client and server using HTTP", "Drawing UI elements", "Compressing images", "Encrypting Wi‑Fi"],
          correctIdx: 0,
          explanation: "REST uses HTTP methods (GET/POST/PUT/DELETE) to interact with resources.",
        },
        {
          topic: "APIs",
          question: "Which HTTP method is typically used to create a new resource?",
          options: ["POST", "GET", "DELETE", "HEAD"],
          correctIdx: 0,
          explanation: "POST is commonly used to create new resources.",
        },
      ],
    },
  ];

  const eduQuizBank = {
    high_school: [
      {
        topic: "Math",
        question: "What is the discriminant in a quadratic equation ax² + bx + c = 0?",
        options: ["b² − 4ac", "a² − 4bc", "b² + 4ac", "2a + b + c"],
        correctIdx: 0,
        explanation: "The discriminant b² − 4ac indicates the nature of the roots.",
      },
      {
        topic: "Physics",
        question: "Newton’s second law is:",
        options: ["F = m × a", "E = m × c", "V = I × R", "P = V × I"],
        correctIdx: 0,
        explanation: "Newton’s second law relates force, mass, and acceleration.",
      },
    ],
    bachelors: [
      {
        topic: "DBMS",
        question: "Which normal form removes partial dependency?",
        options: ["2NF", "1NF", "3NF", "BCNF"],
        correctIdx: 0,
        explanation: "2NF removes partial dependency on a composite key.",
      },
      {
        topic: "Networks",
        question: "Which layer does IP belong to in the OSI model?",
        options: ["Network layer", "Transport layer", "Session layer", "Application layer"],
        correctIdx: 0,
        explanation: "IP is a network-layer protocol (routing, addressing).",
      },
    ],
    masters: [
      {
        topic: "ML",
        question: "Overfitting means the model:",
        options: ["Performs well on training but poorly on new data", "Performs poorly everywhere", "Always generalizes", "Cannot learn patterns"],
        correctIdx: 0,
        explanation: "Overfitting happens when a model memorizes training patterns/noise.",
      },
      {
        topic: "Stats",
        question: "Bias vs variance tradeoff describes:",
        options: ["Balance between underfitting and overfitting", "Database normalization", "Network encryption", "GPU performance"],
        correctIdx: 0,
        explanation: "High bias tends to underfit; high variance tends to overfit.",
      },
    ],
  };

  const pickSkillQuestion = (skill) => {
    const key = normalizeKey(skill);
    for (const row of skillQuestionBank) {
      if (row.match.some((m) => key.includes(normalizeKey(m)))) {
        return pickDeterministic(row.items, key) || row.items[0];
      }
    }
    return null;
  };

  const buildQuiz = (results) => {
    const metaKey = quizMetaKeyFromResults(results);
    const edu = String(results?.user_profile?.education_level || "").trim();
    const gaps = results?.analysis?.gaps || {};
    const skills = (gaps.technical_skills || []).slice(0, 8).map((x) => x.skill).filter(Boolean);

    const items = [];
    const used = new Set();

    for (const skill of skills) {
      const q = pickSkillQuestion(skill);
      if (!q) continue;
      const id = `q${items.length + 1}`;
      items.push({ ...q, id, topic: q.topic || skill, source: "analysis" });
      used.add(normalizeKey(q.topic || skill));
      if (items.length >= 8) break;
    }

    const eduFallback = eduQuizBank[edu] || [];
    for (const q of eduFallback) {
      if (items.length >= 10) break;
      const key = normalizeKey(q.topic);
      if (used.has(key)) continue;
      const id = `q${items.length + 1}`;
      items.push({ ...q, id, source: "education" });
      used.add(key);
    }

    if (items.length === 0) {
      const base = [
        {
          topic: "Learning Strategy",
          question: "Which approach best improves long-term memory?",
          options: ["Spaced repetition", "Re-reading once", "Cramming the night before", "Skipping practice"],
          correctIdx: 0,
          explanation: "Spaced repetition strengthens recall over time.",
        },
      ];
      items.push({ ...base[0], id: "q1", source: "general" });
    }

    return { metaKey, items };
  };

  const fmtTime = (sec) => {
    const s = clamp(Math.floor(sec), 0, 99999);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${pad2(m)}:${pad2(r)}`;
  };

  let quizTimer = null;

  const stopQuizTimer = () => {
    if (quizTimer) window.clearInterval(quizTimer);
    quizTimer = null;
  };

  const renderQuiz = () => {
    const shell = byId("quizShell");
    const stats = byId("quizStats");
    if (!shell || !stats) return;

    const s = quizState();
    if (!s.items || s.items.length === 0) {
      shell.innerHTML = renderEmpty("No quiz loaded", "Run analysis, then start a quiz tailored to your gaps.");
      stats.innerHTML = renderEmpty("No results", "Your performance summary shows up here.");
      return;
    }

    const total = s.items.length;
    const idx = clamp(s.idx, 0, total - 1);
    const item = s.items[idx];
    const answered = s.answers?.[item.id];
    const doneCount = Object.keys(s.answers || {}).length;
    const pct = clamp(Math.round((doneCount / total) * 100), 0, 100);

    const now = Date.now();
    const elapsed = s.startedAt ? Math.floor((now - s.startedAt) / 1000) : 0;
    const remaining = clamp((s.durationSec || 0) - elapsed, 0, 999999);

    shell.innerHTML = `
      <div class="quiz">
        <div class="quiz__top">
          <div class="quiz__timer" aria-label="Timer">${fmtTime(remaining)}</div>
          <div class="quiz__counter">Question ${idx + 1} / ${total}</div>
        </div>
        <div class="progress" aria-label="Quiz progress"><div class="progress__fill" style="width:${pct}%"></div></div>
        <div class="quiz__q">${escapeHtml(item.question)}</div>
        <div class="quiz__opts" role="list">
          ${item.options
            .map((o, oi) => {
              const sel = answered === oi ? "is-selected" : "";
              return `<button class="quiz-opt ${sel}" type="button" data-opt="${oi}">${escapeHtml(o)}</button>`;
            })
            .join("")}
        </div>
        <div class="quiz__nav">
          <button class="btn btn--soft" type="button" data-quiz="prev">Prev</button>
          <div class="quiz__dots" aria-label="Navigator">
            ${s.items
              .map((q, qi) => {
                const isActive = qi === idx ? "is-active" : "";
                const isDone = s.answers?.[q.id] != null ? "is-done" : "";
                return `<button class="quiz-dot ${isActive} ${isDone}" type="button" data-jump="${qi}" aria-label="Go to ${qi + 1}">${qi + 1}</button>`;
              })
              .join("")}
          </div>
          <button class="btn btn--primary" type="button" data-quiz="next">${idx === total - 1 ? "Finish" : "Next"}</button>
        </div>
      </div>
    `;

    stats.innerHTML = `
      <div class="grid-2">
        <div class="widget-sub hover-lift">
          <div class="widget__label">Answered</div>
          <div class="widget__value" style="margin-top: 10px">${doneCount}/${total}</div>
          <div class="widget__meta">Keep going — consistency compounds.</div>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Accuracy (Live)</div>
          <div class="widget__value" style="margin-top: 10px" id="quizAccuracyLive">—</div>
          <div class="widget__meta">Updates when you finish.</div>
        </div>
      </div>
      <div class="widget-sub hover-lift" style="margin-top: 14px">
        <div class="widget__label">After Completion</div>
        <div class="widget__meta" style="margin-top: 10px">Final score, strong/weak topics, and suggestions appear here.</div>
      </div>
    `;

    qsa("[data-opt]", shell).forEach((b) => {
      b.addEventListener("click", () => {
        const oi = Number(b.getAttribute("data-opt"));
        const s2 = quizState();
        s2.answers = s2.answers || {};
        s2.answers[item.id] = oi;
        setQuizState(s2);
        renderQuiz();
      });
    });

    qsa("[data-jump]", shell).forEach((b) => {
      b.addEventListener("click", () => {
        const qi = Number(b.getAttribute("data-jump"));
        const s2 = quizState();
        s2.idx = clamp(qi, 0, (s2.items || []).length - 1);
        setQuizState(s2);
        renderQuiz();
      });
    });

    qsa("[data-quiz]", shell).forEach((b) => {
      b.addEventListener("click", () => {
        const act = b.getAttribute("data-quiz");
        const s2 = quizState();
        const total2 = (s2.items || []).length;
        if (act === "prev") s2.idx = clamp((s2.idx || 0) - 1, 0, total2 - 1);
        if (act === "next") {
          if ((s2.idx || 0) === total2 - 1) {
            s2.finished = true;
            setQuizState(s2);
            renderQuizResult();
            return;
          }
          s2.idx = clamp((s2.idx || 0) + 1, 0, total2 - 1);
        }
        setQuizState(s2);
        renderQuiz();
      });
    });
  };

  const renderQuizResult = () => {
    stopQuizTimer();
    const shell = byId("quizShell");
    const stats = byId("quizStats");
    if (!shell || !stats) return;
    const s = quizState();
    const total = (s.items || []).length || 1;
    const correct = (s.items || []).filter((q) => s.answers?.[q.id] === q.correctIdx).length;
    const accuracy = clamp(Math.round((correct / total) * 100), 0, 100);

    const weak = (s.items || []).filter((q) => s.answers?.[q.id] !== q.correctIdx).map((q) => q.topic);
    const strong = (s.items || []).filter((q) => s.answers?.[q.id] === q.correctIdx).map((q) => q.topic);
    const review = (s.items || [])
      .slice(0, 10)
      .map((q) => {
        const chosen = s.answers?.[q.id];
        const correctText = q.options?.[q.correctIdx] ?? "";
        const chosenText = chosen == null ? "Not answered" : q.options?.[chosen] ?? "Not answered";
        const ok = chosen === q.correctIdx;
        return `
          <div class="chip-card">
            <div class="chip-card__top">
              <div class="chip-card__title">${escapeHtml(q.topic || "Topic")}</div>
              <span class="pill ${ok ? "pill--low" : "pill--high"}">${ok ? "Correct" : "Incorrect"}</span>
            </div>
            <div class="chip-card__meta">Your answer: ${escapeHtml(chosenText)}</div>
            <div class="chip-card__meta">Correct answer: ${escapeHtml(correctText)}</div>
            ${q.explanation ? `<div class="chip-card__meta">${escapeHtml(q.explanation)}</div>` : ""}
          </div>
        `;
      })
      .join("");

    shell.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result__score">${accuracy}%</div>
        <div class="quiz-result__meta">Final Score • ${correct}/${total} correct</div>
        <div class="actions-row" style="margin-top: 12px">
          <button class="btn btn--primary" type="button" id="quizRestart">Restart</button>
          <button class="btn btn--soft" type="button" data-action="goAnalysis">Review Gaps</button>
        </div>
      </div>
    `;

    stats.innerHTML = `
      <div class="grid-2">
        <div class="widget-sub hover-lift">
          <div class="widget__label">Strong Topics</div>
          <ul class="list" style="margin-top: 10px">${strong.slice(0, 8).map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Weak Topics</div>
          <ul class="list" style="margin-top: 10px">${weak.slice(0, 8).map((x) => `<li>🎯 ${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="widget-sub hover-lift" style="margin-top: 14px">
        <div class="widget__label">Answer Review</div>
        <div class="grid-cards" style="margin-top: 12px">${review}</div>
      </div>
      <div class="widget-sub hover-lift" style="margin-top: 14px">
        <div class="widget__label">Personalized Suggestions</div>
        <ul class="list" style="margin-top: 10px">
          <li>✅ Revisit weak topics with short notes and one worked example.</li>
          <li>✅ Take a mini-quiz after 24 hours to reinforce memory.</li>
          <li>✅ Add 1 practice problem to your daily plan.</li>
        </ul>
      </div>
    `;

    byId("quizRestart")?.addEventListener("click", () => {
      const s2 = quizState();
      s2.idx = 0;
      s2.answers = {};
      s2.startedAt = Date.now();
      s2.finished = false;
      setQuizState(s2);
      startQuizTimer();
      renderQuiz();
    });
  };

  const startQuizTimer = () => {
    stopQuizTimer();
    quizTimer = window.setInterval(() => {
      const s = quizState();
      if (!s.startedAt || s.finished) return;
      const now = Date.now();
      const elapsed = Math.floor((now - s.startedAt) / 1000);
      const remaining = (s.durationSec || 0) - elapsed;
      if (remaining <= 0) {
        s.finished = true;
        setQuizState(s);
        renderQuizResult();
        return;
      }
      const timerEl = qs(".quiz__timer");
      if (timerEl) timerEl.textContent = fmtTime(remaining);
    }, 250);
  };

  let quizShellBound = false;

  const initQuiz = () => {
    const results = getResults();
    const s = quizState();
    const metaKey = quizMetaKeyFromResults(results || {});
    const needsRebuild = !Array.isArray(s.items) || s.items.length === 0 || String(s.metaKey || "") !== String(metaKey);
    if (needsRebuild) {
      const built = buildQuiz(results || {});
      s.items = built.items || [];
      s.metaKey = built.metaKey || metaKey;
      s.idx = 0;
      s.answers = {};
      s.startedAt = 0;
      s.finished = false;
      setQuizState(s);
    }
    renderQuiz();
    if (!quizShellBound) {
      quizShellBound = true;
      byId("quizShell")?.addEventListener("click", () => {
        const s2 = quizState();
        if (!s2.startedAt && !s2.finished) {
          s2.startedAt = Date.now();
          setQuizState(s2);
          startQuizTimer();
        }
      });
    }
  };

  const renderProfileEditor = () => {
    const root = byId("profileEditor");
    if (!root) return;
    const profile = getProfile();
    const auth = getAuth();
    const emailValue = profile.email || auth?.email || "";
    const nameValue = profile.name || auth?.name || "";

    root.innerHTML = `
      <div class="profile-shell">
        <div class="profile-hero">
          <div class="avatar">
            ${profile.avatarDataUrl ? `<img alt="Profile" src="${escapeHtml(profile.avatarDataUrl)}" />` : `<span aria-hidden="true">👤</span>`}
          </div>
          <div class="profile-hero__meta">
            <div class="profile-hero__name">${escapeHtml(nameValue || "Your Name")}</div>
            <div class="profile-hero__sub">${escapeHtml(emailValue || "name@gmail.com")}</div>
          </div>
        </div>

        <form id="profileFormUi" class="profile-form" style="margin-top: 14px">
          <div class="grid-2">
            <label class="field">
              <span class="field__label">Profile Picture</span>
              <input class="input" id="avatarInput" type="file" accept="image/*" />
            </label>
            <label class="field">
              <span class="field__label">Full Name</span>
              <input class="input" name="name" type="text" value="${escapeHtml(nameValue)}" placeholder="Full name" />
            </label>
          </div>

          <div class="grid-2" style="margin-top: 10px">
            <label class="field">
              <span class="field__label">Gmail Address</span>
              <input class="input" name="email" type="email" value="${escapeHtml(emailValue)}" placeholder="name@gmail.com" />
            </label>
            <label class="field">
              <span class="field__label">Education Level</span>
              <select class="input" name="educationLevel">
                <option value="">Select</option>
                <option value="high_school" ${profile.educationLevel === "high_school" ? "selected" : ""}>High School</option>
                <option value="bachelors" ${profile.educationLevel === "bachelors" ? "selected" : ""}>Bachelor's</option>
                <option value="masters" ${profile.educationLevel === "masters" ? "selected" : ""}>Master's</option>
                <option value="professional" ${profile.educationLevel === "professional" ? "selected" : ""}>Professional</option>
                <option value="self_learning" ${profile.educationLevel === "self_learning" ? "selected" : ""}>Self-Learning</option>
              </select>
            </label>
          </div>

          <div class="grid-2" style="margin-top: 10px">
            <label class="field">
              <span class="field__label">Current Semester/Class</span>
              <input class="input" name="semester" type="text" value="${escapeHtml(profile.semester)}" placeholder="e.g., Semester 5 / Class 11" />
            </label>
            <label class="field">
              <span class="field__label">Career Goal</span>
              <input class="input" name="careerGoal" type="text" value="${escapeHtml(profile.careerGoal)}" placeholder="e.g., Frontend Developer" />
            </label>
          </div>

          <div class="grid-2" style="margin-top: 10px">
            <label class="field">
              <span class="field__label">Weak Subjects</span>
              <input class="input" name="weakSubjects" type="text" value="${escapeHtml(profile.weakSubjects)}" placeholder="Comma-separated" />
            </label>
            <label class="field">
              <span class="field__label">Strong Subjects</span>
              <input class="input" name="strongSubjects" type="text" value="${escapeHtml(profile.strongSubjects)}" placeholder="Comma-separated" />
            </label>
          </div>

          <div class="grid-2" style="margin-top: 10px">
            <label class="field">
              <span class="field__label">Daily Study Hours</span>
              <input class="input" name="dailyStudyHours" type="number" min="0" step="0.5" value="${escapeHtml(profile.dailyStudyHours)}" placeholder="e.g., 2" />
            </label>
            <label class="field">
              <span class="field__label">Preferred Learning Style</span>
              <select class="input" name="learningStyle">
                <option value="">Select</option>
                <option value="visual" ${profile.learningStyle === "visual" ? "selected" : ""}>Visual</option>
                <option value="auditory" ${profile.learningStyle === "auditory" ? "selected" : ""}>Auditory</option>
                <option value="reading_writing" ${profile.learningStyle === "reading_writing" ? "selected" : ""}>Reading/Writing</option>
                <option value="hands_on" ${profile.learningStyle === "hands_on" ? "selected" : ""}>Hands-on</option>
                <option value="mixed" ${profile.learningStyle === "mixed" ? "selected" : ""}>Mixed</option>
              </select>
            </label>
          </div>

          <div class="actions-row" style="justify-content: flex-end; margin-top: 14px">
            <button class="btn btn--soft" type="button" id="profileCancel">Cancel</button>
            <button class="btn btn--primary" type="submit">Save Changes</button>
          </div>
          <div class="form-error" id="profileUiError" role="alert"></div>
        </form>
      </div>
    `;

    const form = byId("profileFormUi");
    const err = byId("profileUiError");
    const cancel = byId("profileCancel");
    cancel?.addEventListener("click", () => renderProfileEditor());

    byId("avatarInput")?.addEventListener("change", async (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const p = getProfile();
        p.avatarDataUrl = String(reader.result || "");
        setProfile(p);
        renderProfileEditor();
      };
      reader.readAsDataURL(file);
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const next = getProfile();
      next.name = String(fd.get("name") || "");
      next.email = String(fd.get("email") || "");
      next.educationLevel = String(fd.get("educationLevel") || "");
      next.semester = String(fd.get("semester") || "");
      next.careerGoal = String(fd.get("careerGoal") || "");
      next.weakSubjects = String(fd.get("weakSubjects") || "");
      next.strongSubjects = String(fd.get("strongSubjects") || "");
      next.dailyStudyHours = String(fd.get("dailyStudyHours") || "");
      next.learningStyle = String(fd.get("learningStyle") || "");

      if (next.email && !/@gmail\.com$/i.test(next.email.trim())) {
        showFormError(err, "Please use a Gmail address (UI requirement).");
        return;
      }
      setProfile(next);
      showFormError(err, "Saved.");
      window.setTimeout(() => showFormError(err, ""), 1400);
      renderProfileEditor();
    });
  };

  const renderSettings = () => {
    const app = byId("settingsAppearance");
    const acc = byId("settingsAccount");
    if (!app || !acc) return;

    const auth = getAuth();

    app.innerHTML = `
      <form class="profile-form" id="appearanceForm">
        <label class="field">
          <span class="field__label">Theme</span>
          <select class="input" data-setting="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Default Difficulty</span>
          <select class="input" id="defaultDifficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate" selected>Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Preferred Learning Style</span>
          <select class="input" id="defaultLearningStyle">
            <option value="mixed" selected>Mixed</option>
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="reading_writing">Reading/Writing</option>
            <option value="hands_on">Hands-on</option>
          </select>
        </label>
      </form>
    `;

    acc.innerHTML = `
      <div class="settings-stack">
        <div class="widget-sub hover-lift">
          <div class="widget__label">Profile</div>
          <div class="widget__meta" style="margin-top: 10px">Update profile fields from the Profile page.</div>
          <div class="actions-row" style="margin-top: 12px">
            <button class="btn btn--primary" type="button" data-action="goProfile">Open Profile</button>
          </div>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Password</div>
          <form class="profile-form" id="passwordForm" style="margin-top: 12px">
            <label class="field">
              <span class="field__label">Current Password</span>
              <input class="input" type="password" placeholder="••••••••" />
            </label>
            <label class="field">
              <span class="field__label">New Password</span>
              <input class="input" type="password" placeholder="New password" />
            </label>
            <label class="field">
              <span class="field__label">Confirm New Password</span>
              <input class="input" type="password" placeholder="Confirm" />
            </label>
            <div class="actions-row" style="justify-content: flex-end; margin-top: 12px">
              <button class="btn btn--soft" type="button" id="pwUpdateBtn">Update Password</button>
            </div>
            <div class="form-error" id="pwUpdateMsg" role="alert"></div>
          </form>
        </div>
        <div class="widget-sub hover-lift">
          <div class="widget__label">Session</div>
          <div class="widget__meta" style="margin-top: 10px">${auth ? `Signed in as ${escapeHtml(auth.email)}` : "Not signed in."}</div>
          <div class="actions-row" style="margin-top: 12px">
            <button class="btn btn--soft" type="button" id="openAuthBtn">${auth ? "Manage Account" : "Sign in"}</button>
            ${auth ? `<button class="btn btn--danger" type="button" id="signOutBtn">Sign out</button>` : ""}
          </div>
        </div>
      </div>
    `;

    const themeSelect = qs('[data-setting="theme"]', app);
    if (themeSelect) {
      themeSelect.value = getTheme();
      themeSelect.addEventListener("change", () => setTheme(themeSelect.value));
    }

    byId("pwUpdateBtn")?.addEventListener("click", () => {
      const msg = byId("pwUpdateMsg");
      showFormError(msg, "Password updated (UI only).");
      window.setTimeout(() => showFormError(msg, ""), 1600);
    });

    byId("openAuthBtn")?.addEventListener("click", () => openOverlay(byId("authOverlay")));
    byId("signOutBtn")?.addEventListener("click", () => {
      sessionStorage.removeItem(KEYS.auth);
      updateAuthChip();
      renderProfileEditor();
      renderSettings();
    });
  };

  const updateAuthChip = () => {
    const label = byId("authLabel");
    const auth = getAuth();
    if (!label) return;
    label.textContent = auth ? `Hi, ${auth.name?.split(" ")?.[0] || "User"}` : "Sign in";
  };

  const initAuthOverlay = () => {
    const overlay = byId("authOverlay");
    if (!overlay) return;

    const loginForm = byId("loginForm");
    const signupForm = byId("signupForm");
    const tabLogin = byId("authTabLogin");
    const tabSignup = byId("authTabSignup");
    const title = byId("authTitle");
    const sub = byId("authSub");

    const showLogin = () => {
      loginForm?.classList.remove("is-hidden");
      signupForm?.classList.add("is-hidden");
      title && (title.textContent = "Login");
      sub && (sub.textContent = "Welcome back. UI-only authentication experience.");
    };

    const showSignup = () => {
      signupForm?.classList.remove("is-hidden");
      loginForm?.classList.add("is-hidden");
      title && (title.textContent = "Create Account");
      sub && (sub.textContent = "Create an account. UI-only authentication experience.");
    };

    tabLogin?.addEventListener("click", showLogin);
    tabSignup?.addEventListener("click", showSignup);

    byId("authChip")?.addEventListener("click", () => openOverlay(overlay));
    byId("authClose")?.addEventListener("click", () => closeOverlay(overlay));

    const togglePw = (inputId, btnId) => {
      const input = byId(inputId);
      const btn = byId(btnId);
      if (!input || !btn) return;
      btn.addEventListener("click", () => {
        const next = input.type === "password" ? "text" : "password";
        input.type = next;
        btn.textContent = next === "password" ? "Show" : "Hide";
      });
    };

    togglePw("loginPassword", "toggleLoginPw");
    togglePw("signupPassword", "toggleSignupPw");

    const strengthFill = byId("pwStrengthFill");
    const strength = (pw) => {
      const p = String(pw || "");
      let score = 0;
      if (p.length >= 8) score += 30;
      if (/[A-Z]/.test(p)) score += 20;
      if (/[a-z]/.test(p)) score += 20;
      if (/\d/.test(p)) score += 15;
      if (/[^A-Za-z0-9]/.test(p)) score += 15;
      return clamp(score, 0, 100);
    };

    byId("signupPassword")?.addEventListener("input", (e) => {
      const v = e.target?.value || "";
      const p = strength(v);
      if (strengthFill) strengthFill.style.width = `${p}%`;
    });

    const loginError = byId("loginError");
    const signupError = byId("signupError");

    loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showFormError(loginError, "");
      const fd = new FormData(loginForm);
      const email = String(fd.get("email") || "").trim();
      const pw = String(fd.get("password") || "");
      if (!/@gmail\.com$/i.test(email)) {
        showFormError(loginError, "Please enter a valid Gmail address.");
        return;
      }
      if (pw.length < 6) {
        showFormError(loginError, "Password must be at least 6 characters.");
        return;
      }
      setAuth({ email, name: email.split("@")[0] || "User" });
      updateAuthChip();
      closeOverlay(overlay);
      renderProfileEditor();
      renderSettings();
    });

    signupForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showFormError(signupError, "");
      const fd = new FormData(signupForm);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const pw = String(fd.get("password") || "");
      const confirm = String(fd.get("confirm") || "");
      if (name.length < 2) {
        showFormError(signupError, "Please enter your full name.");
        return;
      }
      if (!/@gmail\.com$/i.test(email)) {
        showFormError(signupError, "Please use a Gmail address.");
        return;
      }
      if (strength(pw) < 55) {
        showFormError(signupError, "Choose a stronger password (use length, numbers, symbols).");
        return;
      }
      if (pw !== confirm) {
        showFormError(signupError, "Passwords do not match.");
        return;
      }
      setAuth({ email, name });
      updateAuthChip();
      closeOverlay(overlay);
      renderProfileEditor();
      renderSettings();
    });

    byId("forgotPw")?.addEventListener("click", () => showFormError(loginError, "Password reset (UI only). Check your email inbox."));
    byId("googleLogin")?.addEventListener("click", () => showFormError(loginError, "Google sign-in (UI only)."));
    byId("googleSignup")?.addEventListener("click", () => showFormError(signupError, "Google sign-in (UI only)."));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay(overlay);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeOverlay(overlay);
      closeOverlay(byId("loadingOverlay"));
      closeSidebarIfMobile();
    });

    showLogin();
    updateAuthChip();
  };

  const initNavigation = () => {
    qsa(".nav-item").forEach((b) => {
      b.addEventListener("click", () => {
        setActivePage(b.dataset.route);
        closeSidebarIfMobile();
      });
    });

    byId("sidebarToggle")?.addEventListener("click", () => openSidebar());
    byId("sidebarClose")?.addEventListener("click", () => closeSidebar());

    document.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("[data-action]");
      if (!btn) return;
      const a = btn.getAttribute("data-action");
      if (a === "goTutor") setActivePage("tutor");
      if (a === "goAnalysis") setActivePage("analysis");
      if (a === "goPlan") setActivePage("planner");
      if (a === "goQuiz") setActivePage("quiz");
      if (a === "goProfile") setActivePage("profile");
      closeSidebarIfMobile();
    });
  };

  const initGuided = () => {
    const bar = byId("guidedBar");
    if (!bar) return;

    renderGuidedBar(getResults());

    bar.addEventListener("click", (e) => {
      const stepBtn = e.target?.closest?.("[data-step]");
      if (stepBtn) {
        const n = Number(stepBtn.getAttribute("data-step"));
        const results = getResults();
        if (!hasAnalysis(results) && n > 1) {
          setGuidedStep(1);
          setActivePage("analysis");
          window.setTimeout(() => scrollToAnchor("stepProfile"), 50);
          return;
        }

        setGuidedStep(n);
        markVisitedStep(n);
        const step = guideSteps.find((x) => x.num === n) || guideSteps[0];
        setActivePage(step.page);
        window.setTimeout(() => scrollToAnchor(step.anchor), 60);
        return;
      }

      const nextBtn = e.target?.closest?.("#guidedNext");
      if (nextBtn) {
        const results = getResults();
        if (!hasAnalysis(results)) {
          setGuidedStep(1);
          setActivePage("analysis");
          window.setTimeout(() => scrollToAnchor("stepProfile"), 60);
          return;
        }

        const cur = getGuided().step;
        const next = cur >= 5 ? 1 : cur + 1;
        setGuidedStep(next);
        markVisitedStep(next);
        const step = guideSteps.find((x) => x.num === next) || guideSteps[0];
        setActivePage(step.page);
        window.setTimeout(() => scrollToAnchor(step.anchor), 60);
      }
    });
  };

  const runAnalysis = async (profileData) => {
    const overlay = byId("loadingOverlay");
    const flow = byId("agentOverlayFlow");
    renderAgentFlow(flow, "working");
    openOverlay(overlay);

    const totalSteps = agentSteps.length;
    let idx = 0;
    const advance = () => {
      for (let i = 0; i < totalSteps; i++) setOverlayStep(flow, i, i < idx ? "Done" : i === idx ? "Working…" : "Queued");
    };
    advance();

    const tick = window.setInterval(() => {
      idx = clamp(idx + 1, 0, totalSteps - 1);
      advance();
    }, 720);

    let ok = false;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const payload = await res.json();
      if (!res.ok) {
        const err = payload?.error ? String(payload.error) : "Analysis failed.";
        throw new Error(err);
      }
      setResults(payload);
      setGuided({ ...getGuided(), enabled: true, step: 1, visited: [] });
      hydrateDashboard(payload);
      renderAnalysisSummary(payload);
      renderPlanner(payload);
      renderResources(payload);
      renderCareer(payload);
      renderTutorSuggestions(payload);
      renderGuidedBar(payload);
      initQuiz();
      ok = true;
      return payload;
    } catch (err) {
      for (let i = 0; i < totalSteps; i++) setOverlayStep(flow, i, i < idx ? "Done" : "Failed");
      throw err;
    } finally {
      window.clearInterval(tick);
      if (ok) for (let i = 0; i < totalSteps; i++) setOverlayStep(flow, i, "Done");
      window.setTimeout(() => closeOverlay(overlay), 520);
    }
  };

  const initProfileAnalysisForm = () => {
    const form = byId("profileForm");
    if (!form) return;

    const errorEl = byId("formError");
    const eduEl = byId("educationLevel");
    const fieldEl = byId("fieldOfInterest");
    eduEl?.addEventListener("change", () => renderTutorSuggestions(getResults()));
    fieldEl?.addEventListener("change", () => renderTutorSuggestions(getResults()));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showFormError(errorEl, "");

      const preferred = getChecked("preferred_resources");
      if (preferred.length === 0) {
        showFormError(errorEl, "Please select at least one resource type.");
        return;
      }

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.preferred_resources = preferred;
      data.available_hours = Number(data.available_hours);

      if (!data.target_role || String(data.target_role).trim().length < 2) {
        showFormError(errorEl, "Please select a target role (or enter a custom role).");
        return;
      }

      try {
        await runAnalysis(data);
        setGuidedStep(1);
        markVisitedStep(1);
        setActivePage("analysis");
        window.setTimeout(() => scrollToAnchor("stepProfile"), 60);
      } catch (err) {
        showFormError(errorEl, err?.message || "Network error. Make sure the Python server is running.");
      }
    });

    form.addEventListener("reset", () => {
      showFormError(errorEl, "");
      window.setTimeout(() => initRoleField(), 0);
    });
  };

  const initTheme = () => {
    setTheme(getTheme());
    byId("themeToggle")?.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"));
  };

  const initSearch = () => {
    const input = byId("globalSearch");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = String(input.value || "").trim().toLowerCase();
      const label = qs(".search__icon");
      if (label) label.textContent = q ? "⌕" : "⌕";
    });
  };

  const init = () => {
    initTheme();
    initNavigation();
    initGuided();
    initRoleField();
    initProfileAnalysisForm();
    initExports();
    initTutor();
    initQuiz();
    initAuthOverlay();
    renderProfileEditor();
    renderSettings();

    const results = getResults();
    hydrateDashboard(results);
    renderAnalysisSummary(results);
    renderPlanner(results);
    renderResources(results);
    renderCareer(results);
    renderTutorSuggestions(results);
    renderGuidedBar(results);

    setActivePage("dashboard");
    initSearch();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
