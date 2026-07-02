(() => {
  const KEYS = {
    theme: "eduguide.theme",
    apiKey: "eduguide.apiKey",
    history: "eduguide.chatHistory.v1",
    activeAgent: "eduguide.activeAgent",
  };

  const safeParse = (raw, fallback) => {
    try {
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const readHistoryObject = () => safeParse(localStorage.getItem(KEYS.history), {});

  const writeHistoryObject = (obj) => {
    localStorage.setItem(KEYS.history, JSON.stringify(obj));
  };

  const clampHistory = (messages, max) => {
    if (!Array.isArray(messages)) return [];
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
  };

  const EduStorage = {
    KEYS,
    getTheme() {
      const t = sessionStorage.getItem(KEYS.theme) || localStorage.getItem(KEYS.theme);
      return t === "dark" ? "dark" : "light";
    },
    setTheme(theme) {
      const t = theme === "dark" ? "dark" : "light";
      sessionStorage.setItem(KEYS.theme, t);
      return t;
    },
    getApiKey() {
      return localStorage.getItem(KEYS.apiKey) || "";
    },
    setApiKey(value) {
      const v = String(value || "");
      localStorage.setItem(KEYS.apiKey, v);
      return v;
    },
    getActiveAgentId(defaultId) {
      const id = localStorage.getItem(KEYS.activeAgent);
      return id || defaultId;
    },
    setActiveAgentId(agentId) {
      localStorage.setItem(KEYS.activeAgent, String(agentId));
    },
    getChatHistory(agentId) {
      const obj = readHistoryObject();
      const list = obj[String(agentId)] || [];
      return Array.isArray(list) ? list : [];
    },
    setChatHistory(agentId, messages, max = 200) {
      const obj = readHistoryObject();
      obj[String(agentId)] = clampHistory(messages, max);
      writeHistoryObject(obj);
      return obj[String(agentId)];
    },
    appendChatMessage(agentId, message, max = 200) {
      const obj = readHistoryObject();
      const id = String(agentId);
      const list = Array.isArray(obj[id]) ? obj[id] : [];
      list.push(message);
      obj[id] = clampHistory(list, max);
      writeHistoryObject(obj);
      return obj[id];
    },
    clearChatHistory(agentId) {
      const obj = readHistoryObject();
      if (agentId) {
        delete obj[String(agentId)];
      } else {
        for (const key of Object.keys(obj)) delete obj[key];
      }
      writeHistoryObject(obj);
    },
  };

  window.EduStorage = EduStorage;
})();
