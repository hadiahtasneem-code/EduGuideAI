(() => {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  };

  const nowIso = () => new Date().toISOString();

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const scrollToBottom = (el) => {
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const trapFocus = (modalEl) => {
    if (!modalEl) return () => {};

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => qsa(focusableSelectors, modalEl).filter((el) => el.offsetParent !== null);

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !modalEl.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modalEl.addEventListener("keydown", onKeyDown);
    const focusables = getFocusable();
    (focusables[0] || modalEl).focus?.();

    return () => modalEl.removeEventListener("keydown", onKeyDown);
  };

  window.EduUtils = {
    byId,
    qs,
    qsa,
    setTheme,
    nowIso,
    formatTime,
    scrollToBottom,
    clamp,
    trapFocus,
  };
})();

