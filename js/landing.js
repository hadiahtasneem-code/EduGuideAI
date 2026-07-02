(() => {
  const byId = (id) => document.getElementById(id);
  const THEME_KEY = "eduguide.theme";

  const getTheme = () => {
    const stored = sessionStorage.getItem(THEME_KEY) || "";
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (theme) => {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    sessionStorage.setItem(THEME_KEY, t);
    const label = byId("themeLabel");
    if (label) label.textContent = t === "dark" ? "Dark" : "Light";
    return t;
  };

  const initThemeToggle = () => {
    const btn = byId("themeToggle");
    if (!btn) return;
    setTheme(getTheme());
    btn.addEventListener("click", () => {
      const next = getTheme() === "dark" ? "light" : "dark";
      setTheme(next);
    });
  };

  const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  const createSlideSvg = ({ title, subtitle, accentA, accentB, icon }) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${accentA}" />
            <stop offset="1" stop-color="${accentB}" />
          </linearGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <rect width="1600" height="900" fill="url(#bg)" />
        <circle cx="280" cy="250" r="210" fill="rgba(255,255,255,0.18)" filter="url(#blur)" />
        <circle cx="1320" cy="180" r="260" fill="rgba(255,255,255,0.14)" filter="url(#blur)" />
        <circle cx="1120" cy="760" r="320" fill="rgba(255,255,255,0.12)" filter="url(#blur)" />
        <rect x="120" y="160" width="1360" height="580" rx="32" fill="rgba(15,23,42,0.14)" stroke="rgba(255,255,255,0.20)" />
        <text x="180" y="310" font-size="68" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="800" fill="rgba(255,255,255,0.96)">${title}</text>
        <text x="180" y="382" font-size="34" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="600" fill="rgba(255,255,255,0.90)">${subtitle}</text>
        <text x="180" y="560" font-size="180" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="800" fill="rgba(255,255,255,0.92)">${icon}</text>
      </svg>
    `;
    return encodeSvg(svg.trim());
  };

  const initReveal = () => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (els.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  };

  const initSlideshow = () => {
    const root = document.querySelector("[data-slideshow]");
    if (!root) return;

    const imgs = Array.from(root.querySelectorAll(".slideshow__img"));
    const dots = Array.from(root.querySelectorAll(".dot"));

    const slides = [
      createSlideSvg({
        title: "Career Planning",
        subtitle: "Set direction and milestones",
        accentA: "#7c3aed",
        accentB: "#a855f7",
        icon: "🚀",
      }),
      createSlideSvg({
        title: "Learning Paths",
        subtitle: "Study smarter, not harder",
        accentA: "#3b82f6",
        accentB: "#a855f7",
        icon: "📚",
      }),
      createSlideSvg({
        title: "Technology Skills",
        subtitle: "Build in-demand capability",
        accentA: "#0ea5e9",
        accentB: "#7c3aed",
        icon: "🧠",
      }),
      createSlideSvg({
        title: "Achievement",
        subtitle: "Track progress and wins",
        accentA: "#22c55e",
        accentB: "#a855f7",
        icon: "🏆",
      }),
    ];

    imgs.forEach((img, idx) => {
      img.src = slides[idx] || slides[0];
    });

    let activeIdx = 0;
    let timer = null;

    const setActive = (nextIdx) => {
      const clamped = ((nextIdx % imgs.length) + imgs.length) % imgs.length;
      imgs[activeIdx]?.classList.remove("is-active");
      dots[activeIdx]?.classList.remove("is-active");
      dots[activeIdx]?.setAttribute("aria-selected", "false");

      activeIdx = clamped;
      imgs[activeIdx]?.classList.add("is-active");
      dots[activeIdx]?.classList.add("is-active");
      dots[activeIdx]?.setAttribute("aria-selected", "true");
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => setActive(activeIdx + 1), 5000);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        setActive(idx);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    setActive(0);
    start();
  };

  const initFooterYear = () => {
    const yearEl = byId("year");
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  };

  const animateCount = (el, to, durationMs = 900) => {
    const target = Number(to) || 0;
    const start = performance.now();
    const from = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const initCounters = () => {
    const els = Array.from(document.querySelectorAll("[data-count-to]"));
    if (els.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => animateCount(el, el.getAttribute("data-count-to")));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const to = el.getAttribute("data-count-to");
          animateCount(el, to);
          io.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    els.forEach((el) => io.observe(el));
  };

  const init = () => {
    initThemeToggle();
    initReveal();
    initSlideshow();
    initCounters();
    initFooterYear();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
