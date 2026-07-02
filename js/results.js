(() => {
  const KEYS = {
    theme: "eduguide.theme",
    bookmarks: "eduguide.bookmarks.v1",
  };

  const byId = (id) => document.getElementById(id);

  const setTheme = (theme) => {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    sessionStorage.setItem(KEYS.theme, t);
    const icon = document.querySelector("#themeToggle .btn__icon");
    if (icon) icon.textContent = t === "dark" ? "☀️" : "🌙";
  };

  const getTheme = () => ((sessionStorage.getItem(KEYS.theme) || "") === "dark" ? "dark" : "light");

  const safeParse = (raw, fallback) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const getBookmarks = () => safeParse(localStorage.getItem(KEYS.bookmarks), {});
  const setBookmarks = (obj) => localStorage.setItem(KEYS.bookmarks, JSON.stringify(obj));

  const note = (msg) => {
    const el = byId("systemNote");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-visible", Boolean(msg));
    if (msg) window.setTimeout(() => note(""), 2500);
  };

  const escapeHtml = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getResults = () => safeParse(sessionStorage.getItem("analysisResults"), null);

  const switchTab = (tabName) => {
    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("is-active"));
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("is-active"));

    byId(`${tabName}-tab`)?.classList.add("is-active");
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.classList.add("is-active");
  };

  const renderProfile = (data) => {
    if (!data) return;
    const readiness = parseInt(String(data.estimated_readiness || "0").replace("%", ""), 10) || 0;

    const strengths = (data.strengths || []).map((s) => `<li>✅ ${escapeHtml(s)}</li>`).join("");
    const improve = (data.areas_to_improve || []).map((s) => `<li>🎯 ${escapeHtml(s)}</li>`).join("");

    const html = `
      <div class="panel">
        <h2 class="section-title">Profile Summary</h2>
        <p class="lead">${escapeHtml(data.summary || "")}</p>

        <div class="split">
          <div class="panel__sub">
            <h3 class="panel__title">Strengths</h3>
            <ul class="list">${strengths}</ul>
          </div>
          <div class="panel__sub">
            <h3 class="panel__title">Areas to Improve</h3>
            <ul class="list">${improve}</ul>
          </div>
        </div>

        <div class="panel__sub">
          <h3 class="panel__title">Learning Style Tips</h3>
          <p>${escapeHtml(data.learning_style_tips || "")}</p>
        </div>

        <div class="meter">
          <div class="meter__label">Readiness for target role: ${readiness}%</div>
          <div class="meter__bar" role="progressbar" aria-valuenow="${readiness}" aria-valuemin="0" aria-valuemax="100">
            <div class="meter__fill" style="width: ${Math.max(0, Math.min(100, readiness))}%"></div>
          </div>
        </div>
      </div>
    `;
    byId("profileContent").innerHTML = html;
  };

  const renderGaps = (data) => {
    if (!data) return;

    const tech = (data.technical_skills || [])
      .map(
        (s) => `
      <div class="chip-card">
        <div class="chip-card__top">
          <div class="chip-card__title">${escapeHtml(s.skill)}</div>
          <span class="pill pill--${String(s.importance || "").toLowerCase()}">${escapeHtml(s.importance)}</span>
        </div>
        <div class="chip-card__meta">Estimated time: ${escapeHtml(String(s.learning_time_weeks))} weeks</div>
      </div>
    `
      )
      .join("");

    const soft = (data.soft_skills || [])
      .map((s) => `<li>• ${escapeHtml(s.skill)} (${escapeHtml(s.importance)})</li>`)
      .join("");

    const quick = (data.quick_wins || []).map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("");
    const long = (data.long_term_goals || []).map((x) => `<li>🚀 ${escapeHtml(x)}</li>`).join("");

    const html = `
      <div class="panel">
        <h2 class="section-title">Top skill gaps</h2>
        <div class="grid-cards">${tech}</div>

        <div class="split split--stack">
          <div class="panel__sub">
            <h3 class="panel__title">Soft skills</h3>
            <ul class="list">${soft}</ul>
          </div>
          <div class="panel__sub">
            <h3 class="panel__title">Quick wins</h3>
            <ul class="list">${quick}</ul>
          </div>
          <div class="panel__sub">
            <h3 class="panel__title">Long-term goals</h3>
            <ul class="list">${long}</ul>
          </div>
        </div>
      </div>
    `;

    byId("gapsContent").innerHTML = html;
  };

  const bookmarkBtn = (url) => {
    const b = getBookmarks();
    const saved = Boolean(b[url]);
    return `<button class="bookmark ${saved ? "is-saved" : ""}" type="button" data-bookmark="${escapeHtml(url)}">${saved ? "★ Saved" : "☆ Save"}</button>`;
  };

  const renderResources = (data) => {
    if (!data) return;

    const youtubeHtml = (data.youtube_videos || [])
      .map(
        (v) => `
      <article class="resource-card">
        <div class="resource-card__top">
          <h3 class="resource-card__title">${escapeHtml(v.title)}</h3>
          <span class="pill">${escapeHtml(v.difficulty)}</span>
        </div>
        <div class="resource-card__meta">📺 ${escapeHtml(v.channel)} • ⏱️ ${escapeHtml(v.duration_minutes)} min</div>
        <p class="resource-card__why">${escapeHtml(v.why_recommended)}</p>
        <div class="resource-card__actions">
          <a class="btn btn--primary btn--sm" href="${escapeHtml(v.url)}" target="_blank" rel="noreferrer">Open</a>
          ${bookmarkBtn(v.url)}
        </div>
      </article>
    `
      )
      .join("");

    const coursesHtml = (data.online_courses || [])
      .map(
        (c) => `
      <article class="resource-card">
        <div class="resource-card__top">
          <h3 class="resource-card__title">${escapeHtml(c.title)}</h3>
          <span class="pill">${escapeHtml(c.provider)}</span>
        </div>
        <div class="resource-card__meta">⏱️ ${escapeHtml(c.duration_weeks)} weeks • 💰 ${
          Number(c.cost) === 0 ? "FREE" : "$" + escapeHtml(c.cost)
        } ${c.certificate ? " • 🏆 Certificate" : ""}</div>
        <p class="resource-card__why">${escapeHtml(c.why_recommended)}</p>
        <div class="resource-card__actions">
          <a class="btn btn--primary btn--sm" href="${escapeHtml(c.url)}" target="_blank" rel="noreferrer">Open</a>
          ${bookmarkBtn(c.url)}
        </div>
      </article>
    `
      )
      .join("");

    const booksHtml = (data.books || [])
      .map(
        (b) => `
      <article class="resource-card">
        <div class="resource-card__top">
          <h3 class="resource-card__title">${escapeHtml(b.title)}</h3>
          <span class="pill">${escapeHtml(b.difficulty)}</span>
        </div>
        <div class="resource-card__meta">✍️ ${escapeHtml(b.author)} • ${escapeHtml(b.pages)} pages</div>
        <p class="resource-card__why">Estimated reading time: ${escapeHtml(b.estimated_reading_hours)} hours</p>
      </article>
    `
      )
      .join("");

    const freeHtml = (data.free_resources || [])
      .map(
        (r) => `
      <article class="resource-card">
        <div class="resource-card__top">
          <h3 class="resource-card__title">${escapeHtml(r.title)}</h3>
          <span class="pill">${escapeHtml(r.type)}</span>
        </div>
        <div class="resource-card__actions">
          <a class="btn btn--primary btn--sm" href="${escapeHtml(r.url)}" target="_blank" rel="noreferrer">Open</a>
          ${bookmarkBtn(r.url)}
        </div>
      </article>
    `
      )
      .join("");

    byId("youtubeContent").innerHTML = youtubeHtml || `<div class="empty">No YouTube items selected.</div>`;
    byId("coursesContent").innerHTML = coursesHtml || `<div class="empty">No course items selected.</div>`;
    byId("booksContent").innerHTML = booksHtml || `<div class="empty">No book items selected.</div>`;
    byId("freeContent").innerHTML = freeHtml || `<div class="empty">No free resources available.</div>`;

    document.querySelectorAll("[data-bookmark]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-bookmark");
        if (!url) return;
        const b = getBookmarks();
        if (b[url]) delete b[url];
        else b[url] = { url, savedAt: new Date().toISOString() };
        setBookmarks(b);
        btn.classList.toggle("is-saved", Boolean(b[url]));
        btn.textContent = b[url] ? "★ Saved" : "☆ Save";
      });
    });
  };

  const renderPlan = (data) => {
    if (!data) return;
    const weeks = (data.weekly_plans || []).slice(0, 24);
    const list = weeks
      .map((w) => {
        const topics = (w.topics || [])
          .map((t) => `<li>• ${escapeHtml(t.name)} — ${escapeHtml(t.hours)} hrs</li>`)
          .join("");
        return `
          <details class="week" ${w.week === 1 ? "open" : ""}>
            <summary>Week ${escapeHtml(w.week)}: ${escapeHtml(w.theme)} (${escapeHtml(w.total_hours)} hrs)</summary>
            <ul class="list">${topics}</ul>
            <div class="week__meta">Checkpoint: ${escapeHtml(w.checkpoint)}</div>
          </details>
        `;
      })
      .join("");

    const html = `
      <div class="panel">
        <h2 class="section-title">Study Plan</h2>
        <p class="lead">${escapeHtml(data.overview || "")}</p>
        <div class="weeks">${list}</div>
      </div>
    `;
    byId("planContent").innerHTML = html;
  };

  const renderCareer = (data) => {
    if (!data) return;
    const roadmap = (data.career_roadmap || [])
      .map(
        (s) => `
      <div class="roadmap-step">
        <div class="roadmap-step__title">${escapeHtml(s.stage)}: ${escapeHtml(s.role)}</div>
        <div class="roadmap-step__meta">Duration: ${escapeHtml(String(s.duration_months ?? ""))} months</div>
      </div>
    `
      )
      .join("");

    const market = data.job_market_insights || {};
    const html = `
      <div class="panel">
        <h2 class="section-title">Career Roadmap</h2>
        <div class="roadmap">${roadmap}</div>
        <div class="panel__sub">
          <h3 class="panel__title">Job market insights</h3>
          <ul class="list">
            <li>• Demand: ${escapeHtml(market.demand || "")}</li>
            <li>• Growth rate: ${escapeHtml(market.growth_rate || "")}</li>
            <li>• Average salary: ${escapeHtml(market.average_salary || "")}</li>
          </ul>
        </div>
        <div class="panel__sub">
          <h3 class="panel__title">Next steps</h3>
          <ul class="list">${(data.next_steps || []).map((x) => `<li>✅ ${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
      </div>
    `;
    byId("careerContent").innerHTML = html;
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

  const initActions = (results) => {
    byId("printBtn")?.addEventListener("click", () => window.print());
    byId("exportBtn")?.addEventListener("click", () => window.print());
    byId("downloadPlanBtn")?.addEventListener("click", () => {
      const plan = results?.analysis?.study_plan;
      const role = results?.user_profile?.target_role || "Study";
      if (!plan) return;
      downloadIcs(plan, `EduGuide AI (${role})`);
      note("Calendar file downloaded.");
    });

    byId("shareBtn")?.addEventListener("click", async () => {
      const role = results?.user_profile?.target_role || "my goal";
      const text = `EduGuide AI results for ${role}. Open your local results page to view details.`;
      if (navigator.share) {
        try {
          await navigator.share({ title: "EduGuide AI Results", text });
          note("Shared.");
        } catch {
          note("Share canceled.");
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        note("Copied share text.");
      } catch {
        note("Copy failed.");
      }
    });
  };

  const initTabs = () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
  };

  const init = () => {
    setTheme(getTheme());
    byId("themeToggle")?.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"));

    const results = getResults();
    if (!results) {
      window.location.href = "/form";
      return;
    }

    renderProfile(results.analysis?.profile);
    renderGaps(results.analysis?.gaps);
    renderResources(results.analysis?.resources);
    renderPlan(results.analysis?.study_plan);
    renderCareer(results.analysis?.career_path);

    initTabs();
    initActions(results);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
