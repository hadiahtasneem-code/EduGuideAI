(() => {
  const { byId, qs, qsa, setTheme, nowIso, formatTime, scrollToBottom, trapFocus } = window.EduUtils || {};
  const { AGENTS } = window;
  const { EduStorage } = window;

  const state = {
    activeAgentId: "profileSpecialist",
    isResponding: false,
    cleanupModalFocus: null,
  };

  const el = {
    agentList: null,
    chatBox: null,
    chatInput: null,
    composer: null,
    sendBtn: null,
    activeAgentName: null,
    activeAgentEmoji: null,
    activeAgentDesc: null,
    themeToggle: null,
    clearChatBtn: null,
    settingsBtn: null,
    settingsModal: null,
    confirmModal: null,
    confirmClearBtn: null,
    menuBtn: null,
    sidebar: null,
    apiKeyInput: null,
    saveSettingsBtn: null,
  };

  const getAgent = (agentId) => AGENTS?.[agentId];

  const renderAgentList = () => {
    const container = el.agentList;
    if (!container) return;

    container.innerHTML = "";
    const ids = Object.keys(AGENTS || {});

    for (const id of ids) {
      const agent = AGENTS[id];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "agent-btn";
      btn.dataset.agentId = id;
      btn.innerHTML = `
        <div class="agent-btn__emoji" aria-hidden="true">${agent.emoji}</div>
        <div>
          <div class="agent-btn__name">${agent.name}</div>
          <div class="agent-btn__desc">${agent.description}</div>
        </div>
      `;
      btn.addEventListener("click", () => selectAgent(id));
      container.appendChild(btn);
    }

    syncActiveAgentButton();
  };

  const syncActiveAgentButton = () => {
    qsa(".agent-btn", el.agentList).forEach((btn) => {
      const isActive = btn.dataset.agentId === state.activeAgentId;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const renderHeader = () => {
    const agent = getAgent(state.activeAgentId);
    if (!agent) return;
    el.activeAgentName.textContent = agent.name;
    el.activeAgentEmoji.textContent = agent.emoji;
    el.activeAgentDesc.textContent = agent.description;
    el.chatInput.placeholder = `Ask ${agent.name}...`;
  };

  const createMessageEl = (msg) => {
    const div = document.createElement("div");
    const role = msg.role || "system";
    div.className = `msg msg--${role}`;

    const text = document.createElement("div");
    text.textContent = String(msg.text || "");
    div.appendChild(text);

    if (msg.ts) {
      const meta = document.createElement("div");
      meta.className = "msg__meta";
      meta.textContent = formatTime(msg.ts);
      div.appendChild(meta);
    }

    return div;
  };

  const renderChat = () => {
    const agentId = state.activeAgentId;
    const history = EduStorage.getChatHistory(agentId);
    el.chatBox.innerHTML = "";

    if (history.length === 0) {
      const agent = getAgent(agentId);
      if (agent?.startingMessage) {
        const starter = { role: "agent", text: agent.startingMessage, ts: nowIso() };
        EduStorage.appendChatMessage(agentId, starter);
        history.push(starter);
      }
    }

    for (const msg of history) el.chatBox.appendChild(createMessageEl(msg));
    scrollToBottom(el.chatBox);
  };

  const pushMessage = (agentId, role, text) => {
    const msg = { role, text: String(text || ""), ts: nowIso() };
    EduStorage.appendChatMessage(agentId, msg);
    el.chatBox.appendChild(createMessageEl(msg));
    scrollToBottom(el.chatBox);
    return msg;
  };

  const showLoading = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "msg msg--agent";
    wrapper.dataset.loading = "true";

    const label = document.createElement("div");
    label.textContent = "Agent is thinking...";

    const dots = document.createElement("span");
    dots.className = "loading";
    dots.innerHTML = '<span class="loading__dot"></span><span class="loading__dot"></span><span class="loading__dot"></span>';

    const row = document.createElement("div");
    row.style.display = "inline-flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.appendChild(label);
    row.appendChild(dots);

    wrapper.appendChild(row);
    el.chatBox.appendChild(wrapper);
    scrollToBottom(el.chatBox);
  };

  const hideLoading = () => {
    const node = qs('[data-loading="true"]', el.chatBox);
    if (node) node.remove();
  };

  const setResponding = (v) => {
    state.isResponding = Boolean(v);
    el.sendBtn.disabled = state.isResponding;
    el.chatInput.disabled = state.isResponding;
  };

  const sendMessage = async () => {
    if (state.isResponding) return;
    const text = el.chatInput.value.trim();
    if (!text) return;

    const agent = getAgent(state.activeAgentId);
    const agentId = state.activeAgentId;
    const history = EduStorage.getChatHistory(agentId);

    pushMessage(agentId, "user", text);
    el.chatInput.value = "";
    setResponding(true);
    showLoading();

    try {
      const response = await window.generateAgentResponse(text, agent, history);
      hideLoading();
      pushMessage(agentId, "agent", response);
    } catch {
      hideLoading();
      pushMessage(agentId, "system", "Something went wrong generating a response. Please try again.");
    } finally {
      setResponding(false);
      el.chatInput.focus();
    }
  };

  const closeSidebarIfMobile = () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      el.sidebar.classList.remove("is-open");
    }
  };

  const selectAgent = (agentId) => {
    if (!getAgent(agentId)) return;
    state.activeAgentId = agentId;
    EduStorage.setActiveAgentId(agentId);
    syncActiveAgentButton();
    renderHeader();
    renderChat();
    closeSidebarIfMobile();
  };

  const applyStoredTheme = () => {
    const theme = EduStorage.getTheme();
    setTheme(theme);
    const icon = el.themeToggle.querySelector(".btn__icon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  };

  const toggleTheme = () => {
    const current = EduStorage.getTheme();
    const next = current === "dark" ? "light" : "dark";
    EduStorage.setTheme(next);
    applyStoredTheme();
  };

  const openModal = (backdropEl) => {
    if (!backdropEl) return;
    backdropEl.classList.add("is-open");
    backdropEl.setAttribute("aria-hidden", "false");
    const modal = qs(".modal", backdropEl);
    if (modal) modal.setAttribute("tabindex", "-1");
    state.cleanupModalFocus?.();
    state.cleanupModalFocus = trapFocus(backdropEl);
  };

  const closeModal = (backdropEl) => {
    if (!backdropEl) return;
    backdropEl.classList.remove("is-open");
    backdropEl.setAttribute("aria-hidden", "true");
    state.cleanupModalFocus?.();
    state.cleanupModalFocus = null;
  };

  const setupModals = () => {
    el.settingsBtn.addEventListener("click", () => {
      el.apiKeyInput.value = EduStorage.getApiKey();
      openModal(el.settingsModal);
    });

    el.saveSettingsBtn.addEventListener("click", () => {
      EduStorage.setApiKey(el.apiKeyInput.value);
      closeModal(el.settingsModal);
      pushMessage(state.activeAgentId, "system", "Settings saved.");
    });

    qsa("[data-close-modal]", el.settingsModal).forEach((b) => b.addEventListener("click", () => closeModal(el.settingsModal)));

    el.clearChatBtn.addEventListener("click", () => openModal(el.confirmModal));
    qsa("[data-close-confirm]", el.confirmModal).forEach((b) => b.addEventListener("click", () => closeModal(el.confirmModal)));

    el.confirmClearBtn.addEventListener("click", () => {
      EduStorage.clearChatHistory();
      closeModal(el.confirmModal);
      renderChat();
      pushMessage(state.activeAgentId, "system", "Chat history cleared.");
    });

    [el.settingsModal, el.confirmModal].forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal(backdrop);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeModal(el.settingsModal);
      closeModal(el.confirmModal);
      closeSidebarIfMobile();
    });
  };

  const setupSidebar = () => {
    el.menuBtn.addEventListener("click", () => {
      el.sidebar.classList.toggle("is-open");
    });

    qs(".main", document).addEventListener("click", () => closeSidebarIfMobile());
  };

  const init = () => {
    el.agentList = byId("agentList");
    el.chatBox = byId("chatBox");
    el.chatInput = byId("chatInput");
    el.composer = byId("composer");
    el.sendBtn = byId("sendBtn");
    el.activeAgentName = byId("activeAgentName");
    el.activeAgentEmoji = byId("activeAgentEmoji");
    el.activeAgentDesc = byId("activeAgentDesc");
    el.themeToggle = byId("themeToggle");
    el.clearChatBtn = byId("clearChatBtn");
    el.settingsBtn = byId("settingsBtn");
    el.settingsModal = byId("settingsModal");
    el.confirmModal = byId("confirmModal");
    el.confirmClearBtn = byId("confirmClearBtn");
    el.menuBtn = byId("menuBtn");
    el.sidebar = qs("[data-sidebar]");
    el.apiKeyInput = byId("apiKeyInput");
    el.saveSettingsBtn = byId("saveSettingsBtn");

    renderAgentList();

    const defaultAgentId = Object.keys(AGENTS || {})[0] || "profileSpecialist";
    state.activeAgentId = EduStorage.getActiveAgentId(defaultAgentId);
    if (!getAgent(state.activeAgentId)) state.activeAgentId = defaultAgentId;

    applyStoredTheme();
    renderHeader();
    syncActiveAgentButton();
    renderChat();

    el.themeToggle.addEventListener("click", toggleTheme);
    el.composer.addEventListener("submit", (e) => {
      e.preventDefault();
      sendMessage();
    });

    setupModals();
    setupSidebar();

    el.chatInput.focus();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

