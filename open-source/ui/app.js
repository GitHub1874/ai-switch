(function initializeDashboard() {
  "use strict";

  const query = new URLSearchParams(location.search);
  const launchToken = query.get("token");
  const requestedView = query.get("view");
  if (launchToken) {
    sessionStorage.setItem("codexLocalToken", launchToken);
    history.replaceState({}, "", "/");
  }
  const localToken = sessionStorage.getItem("codexLocalToken") || "";

  const accountGrid = document.querySelector("#account-grid");
  const appShell = document.querySelector("#app-shell");
  const accountsView = document.querySelector("#accounts-view");
  const sessionsView = document.querySelector("#sessions-view");
  const localView = document.querySelector("#local-view");
  const primaryNavItems = [...document.querySelectorAll(".primary-nav-item")];
  const managementPage = document.querySelector("#management-page");
  const openManagementPageButton = document.querySelector("#open-management-page");
  const backManagementPageButton = document.querySelector("#back-management-page");
  const backSessionsToManagementButton = document.querySelector("#back-sessions-to-management");
  const backLocalToManagementButton = document.querySelector("#back-local-to-management");
  const accountSkeleton = document.querySelector("#account-skeleton");
  const emptyState = document.querySelector("#empty-state");
  const planFilters = document.querySelector("#plan-filters");
  const accountToolbar = document.querySelector("#account-toolbar");
  const appVersionButton = document.querySelector("#app-version");
  const appVersionLabel = document.querySelector("#app-version-label");
  const updateDot = appVersionButton.querySelector(".update-dot");
  const updateDialog = document.querySelector("#update-dialog");
  const closeUpdateDialogButton = document.querySelector("#close-update-dialog");
  const checkUpdateButton = document.querySelector("#check-update");
  const downloadUpdateButton = document.querySelector("#download-update");
  const applyUpdateButton = document.querySelector("#apply-update");
  const updateVersionSummary = document.querySelector("#update-version-summary");
  const updateStateCard = document.querySelector("#update-state-card");
  const updateStateTitle = document.querySelector("#update-state-title");
  const updateStateDetail = document.querySelector("#update-state-detail");
  const updateProgress = document.querySelector("#update-progress");
  const updateProgressFill = document.querySelector("#update-progress-fill");
  const updateNotes = document.querySelector("#update-notes");
  const updateNoteList = document.querySelector("#update-note-list");
  const globalStatus = document.querySelector("#global-status");
  const addButton = document.querySelector("#add-account");
  const emptyAddButton = document.querySelector("#empty-add-account");
  const queryAllButton = document.querySelector("#query-all");
  const reloadButton = document.querySelector("#reload-view");
  const openLogsButton = document.querySelector("#open-logs");
  const clearAccountsButton = document.querySelector("#clear-accounts");
  const shutdownButton = document.querySelector("#shutdown");
  const addWithOauthButton = document.querySelector("#add-with-oauth");
  const importCurrentButton = document.querySelector("#import-current-account");
  const apiPage = document.querySelector("#api-page");
  const apiAccountForm = document.querySelector("#api-account-form");
  const apiProviderSelect = document.querySelector("#api-provider");
  const apiProviderButtons = [...document.querySelectorAll(".provider-option")];
  const apiBaseUrlField = document.querySelector("#api-base-url-field");
  const apiBaseUrlInput = document.querySelector("#api-base-url");
  const apiProviderNote = document.querySelector("#api-provider-note");
  const openAiAccountMethods = document.querySelector("#openai-account-methods");
  const apiCredentialPanel = document.querySelector("#api-credential-panel");
  const apiFormActions = document.querySelector("#api-form-actions");
  const apiFormError = document.querySelector("#api-form-error");
  const apiKeyInput = document.querySelector("#api-key");
  const toggleApiKeyButton = document.querySelector("#toggle-api-key");
  const saveApiAccountButton = document.querySelector("#save-api-account");
  const backApiPageButton = document.querySelector("#back-api-page");
  const cancelApiAccountButton = document.querySelector("#cancel-api-account");
  const authDialog = document.querySelector("#auth-dialog");
  const authMessage = document.querySelector("#auth-message");
  const cancelAuthButton = document.querySelector("#cancel-auth");
  const resetDialog = document.querySelector("#reset-dialog");
  const resetAccountLabel = document.querySelector("#reset-account-label");
  const resetCreditCount = document.querySelector("#reset-credit-count");
  const cancelResetButton = document.querySelector("#cancel-reset");
  const confirmResetButton = document.querySelector("#confirm-reset");
  const sessionCount = document.querySelector("#session-count");
  const sessionInput = document.querySelector("#session-input");
  const sessionCached = document.querySelector("#session-cached");
  const sessionOutput = document.querySelector("#session-output");
  const sessionTotal = document.querySelector("#session-total");
  const sessionRequests = document.querySelector("#session-requests");
  const sessionSearch = document.querySelector("#session-search");
  const sessionClearSearch = document.querySelector("#session-clear-search");
  const sessionType = document.querySelector("#session-type");
  const sessionSelectAll = document.querySelector("#session-select-all");
  const sessionExportButton = document.querySelector("#session-export");
  const sessionTrashButton = document.querySelector("#session-trash");
  const sessionImportButton = document.querySelector("#session-import");
  const sessionRepairButton = document.querySelector("#session-repair");
  const sessionTrashViewButton = document.querySelector("#session-trash-view");
  const sessionRefreshButton = document.querySelector("#session-refresh");
  const sessionImportFile = document.querySelector("#session-import-file");
  const sessionList = document.querySelector("#session-list");
  const sessionEmpty = document.querySelector("#session-empty");
  const batchProgressPanel = document.querySelector("#batch-progress");
  const batchProgressCount = document.querySelector("#batch-progress-count");
  const batchProgressAccount = document.querySelector("#batch-progress-account");
  const batchProgressFill = document.querySelector("#batch-progress-fill");
  const toast = document.querySelector("#toast");
  const localTabs = [...document.querySelectorAll(".local-tab")];
  const localPanels = [...document.querySelectorAll(".local-panel")];
  const authCenterList = document.querySelector("#auth-center-list");
  const refreshAuthCenterButton = document.querySelector("#refresh-auth-center");
  const createBackupButton = document.querySelector("#create-backup");
  const backupList = document.querySelector("#backup-list");
  const projectForm = document.querySelector("#project-form");
  const projectName = document.querySelector("#project-name");
  const projectAccount = document.querySelector("#project-account");
  const projectReasoning = document.querySelector("#project-reasoning");
  const projectList = document.querySelector("#project-list");
  const refreshExtensionsButton = document.querySelector("#refresh-extensions");
  const extensionList = document.querySelector("#extension-list");
  const exportDiagnosticsButton = document.querySelector("#export-diagnostics");

  let accounts = [];
  let accountsLoaded = false;
  let busy = false;
  let activeLoginId = null;
  let authPopup = null;
  let activePlanFilter = "all";
  let appVersion = "";
  let updateStatus = null;
  let updateOperation = false;
  let updatePollTimer = null;
  let credentialSwitchCapability = { switchingSupported: true, message: "" };
  let selectedAccountId = null;
  let dragState = null;
  let savingOrder = false;
  let pendingResetAccount = null;
  let activeView = "accounts";
  let sessions = [];
  let sessionSummary = null;
  let sessionTrashItems = [];
  let sessionTrashMode = false;
  let selectedSessions = new Set();
  let queryingAccountId = null;
  let batchProgress = null;
  let batchProgressTimer = null;
  let localLoaded = false;
  let localBackups = [];
  let localProjects = [];
  let localExtensions = [];

  const isDesktopHost = Boolean(window.chrome?.webview);
  const apiProviderPresets = {
    openai: {
      fixedBaseUrl: true,
      note: "已内置 OpenAI 官方地址。只需填写 Key，添加时自动验证。"
    },
    deepseek: {
      fixedBaseUrl: true,
      note: "已内置 DeepSeek 官方地址。只需填写 Key，添加时自动验证。"
    },
    qwen: {
      fixedBaseUrl: true,
      note: "已内置阿里云百炼 Token Plan 的 Responses 地址。只需填写对应套餐 Key。"
    },
    groq: {
      fixedBaseUrl: true,
      note: "已内置 Groq 官方 Responses 地址。只需填写 Groq API Key。"
    },
    fireworks: {
      fixedBaseUrl: true,
      note: "已内置 Fireworks 官方 Responses 地址。只需填写 Fireworks API Key。"
    },
    xai: {
      fixedBaseUrl: true,
      note: "已内置 xAI 官方 Responses 地址。只需填写 xAI API Key。"
    },
    openrouter: {
      fixedBaseUrl: true,
      note: "已内置 OpenRouter Responses 地址。只需填写 OpenRouter API Key。"
    },
    custom: {
      fixedBaseUrl: false,
      note: "填写 Base URL 和 Key；添加时自动验证并读取默认模型。"
    }
  };

  function openOfficialAuthorization(url) {
    if (isDesktopHost) {
      window.chrome.webview.postMessage(`open-external:${url}`);
      return;
    }
    if (authPopup) authPopup.location.href = url;
    else window.location.href = url;
  }

  function openExternalUrl(url) {
    if (isDesktopHost) {
      window.chrome.webview.postMessage(`open-safe-external:${url}`);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const iconDefinitions = {
    play: [
      { d: "M8 5.5 18.5 12 8 18.5Z", fill: "currentColor" }
    ],
    refresh: [
      { d: "M20 11a8 8 0 1 0-2.34 5.66", fill: "none" },
      { d: "M20 4v7h-7", fill: "none" }
    ],
    trash: [
      { d: "M4 7h16", fill: "none" },
      { d: "M9 3h6l1 4H8l1-4Z", fill: "none" },
      { d: "m6.5 7 .8 14h9.4l.8-14M10 11v6M14 11v6", fill: "none" }
    ],
    external: [
      { d: "M14 4h6v6M20 4l-9 9", fill: "none" },
      { d: "M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6", fill: "none" }
    ]
  };

  function svgIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    for (const definition of iconDefinitions[name] || []) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", definition.d);
      path.setAttribute("fill", definition.fill);
      if (definition.fill === "none") {
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.8");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
      }
      svg.append(path);
    }
    return svg;
  }

  function compactEmail(value, maximumLength = 24) {
    const email = String(value || "");
    if (email.length <= maximumLength) return email;
    const at = email.lastIndexOf("@");
    if (at > 0 && at < email.length - 1) {
      const local = email.slice(0, at);
      const suffix = email.slice(at);
      const localLength = maximumLength - suffix.length - 1;
      if (localLength >= 6) return `${local.slice(0, localLength)}…${suffix}`;
    }
    const left = Math.ceil((maximumLength - 1) * .62);
    const right = maximumLength - 1 - left;
    return `${email.slice(0, left)}…${email.slice(-right)}`;
  }

  function setBusy(value, message = "") {
    busy = value;
    addButton.disabled = value;
    emptyAddButton.disabled = value;
    queryAllButton.disabled = value;
    render();
    if (activeView === "sessions") renderSessions();
    if (message) setStatus(message);
  }

  function setStatus(message, kind = "") {
    if (globalStatus) {
      globalStatus.textContent = "";
      globalStatus.className = "global-status";
    }
    if (message) showToast(message, kind);
  }

  let toastTimer;
  function showToast(message, kind = "") {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show ${kind}`.trim();
    toastTimer = setTimeout(() => {
      toast.className = "toast";
    }, 3600);
  }

  function updateBatchProgress() {
    clearTimeout(batchProgressTimer);
    const visible = Boolean(batchProgress);
    batchProgressPanel.hidden = !visible;
    document.body.classList.toggle("batch-running", visible);
    queryAllButton.classList.toggle("is-querying", visible && !batchProgress?.complete);
    if (!visible) return;

    const completed = Math.min(batchProgress.completed, batchProgress.total);
    batchProgressPanel.classList.toggle("is-complete", Boolean(batchProgress.complete));
    batchProgressPanel.classList.toggle("has-errors", Boolean(batchProgress.failed));
    batchProgressCount.textContent = `${completed} / ${batchProgress.total}`;
    batchProgressAccount.textContent = batchProgress.complete
      ? (batchProgress.failed
          ? `完成，${batchProgress.failed} 个查询失败${batchProgress.reauth ? `，其中 ${batchProgress.reauth} 个需重新授权` : ""}`
          : "全部账户查询完成")
      : `正在查询：${batchProgress.current}`;
    batchProgressFill.style.width = `${batchProgress.total ? (completed / batchProgress.total) * 100 : 0}%`;
  }

  function finishBatchProgress(failed, reauth = 0) {
    if (!batchProgress) return;
    batchProgress.completed = batchProgress.total;
    batchProgress.failed = failed;
    batchProgress.reauth = reauth;
    batchProgress.complete = true;
    updateBatchProgress();
    batchProgressTimer = setTimeout(() => {
      batchProgress = null;
      updateBatchProgress();
    }, 2200);
  }

  async function api(path, options = {}) {
    const headers = {
      "X-Local-Token": localToken,
      ...(options.body ? { "Content-Type": "application/json" } : {})
    };
    const response = await fetch(path, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || `本机服务请求失败（${response.status}）`);
    }
    return payload;
  }

  function formatDate(timestamp) {
    const number = Number(timestamp);
    if (!Number.isFinite(number)) return "未知";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(number));
  }

  function formatCompactDate(timestamp, timeOnlyWhenToday = false) {
    const number = Number(timestamp);
    if (!Number.isFinite(number)) return "未知";
    const date = new Date(number);
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    const sameDay =
      sameYear &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const time = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);
    if (sameDay && timeOnlyWhenToday) return time;
    const year = sameYear ? "" : `${date.getFullYear()}年`;
    return `${year}${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
  }

  function formatReset(seconds) {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value <= 0) return "未返回重置时间";
    const resetAt = value * 1000;
    const diff = resetAt - Date.now();
    let relative = "预计已到重置时间";
    if (diff > 0) {
      const minutes = Math.ceil(diff / 60_000);
      const days = Math.floor(minutes / 1_440);
      const hours = Math.floor((minutes % 1_440) / 60);
      const parts = [];
      if (days) parts.push(`${days}天`);
      if (hours) parts.push(`${hours}小时`);
      if (!days && minutes % 60) parts.push(`${minutes % 60}分钟`);
      relative = `还有 ${parts.join("") || "不到1分钟"}`;
    }
    return `${formatCompactDate(resetAt)} 重置 · ${relative}`;
  }

  function formatSubscriptionValidity(value) {
    const expiresAt = Date.parse(String(value || ""));
    if (!Number.isFinite(expiresAt)) {
      return { text: "有效期未知", className: "unknown", expiresAt: null };
    }
    const diff = expiresAt - Date.now();
    if (diff <= 0) {
      const expiredDays = Math.max(1, Math.ceil(Math.abs(diff) / 86_400_000));
      return { text: `已过期：${expiredDays}天`, className: "expired", expiresAt };
    }
    const days = Math.ceil(diff / 86_400_000);
    return {
      text: days > 99 ? "有效期：99+天" : `有效期：${days}天`,
      className: days <= 7 ? "warning" : "active",
      expiresAt
    };
  }

  function meterClass(used) {
    if (used >= 95) return "danger";
    if (used >= 75) return "warning";
    return "";
  }

  function statusText(status) {
    const labels = {
      authorizing: "等待授权",
      untested: "待测试"
    };
    return labels[status] || status || "未知";
  }

  function compactAccountError(account) {
    const raw = String(account?.lastError || "");
    if (account?.kind === "api") return raw || "连接测试失败，请检查地址或密钥";
    if (account?.requiresReauth) return "登录授权已失效，请重新授权";
    if (/unsupported_country_region_territory|网络地区不支持|地区不支持/i.test(raw)) {
      return "当前网络地区不支持，请切换网络后重试";
    }
    if (/需要刷新|先打开 Codex|启动.*再查询/i.test(raw) && !account?.requiresReauth) {
      return "登录状态刷新失败，请点击查询重试";
    }
    if (/401|unauthorized|登录状态暂时无法验证|auth.*check/i.test(raw)) {
      return "登录状态暂时无法验证，请稍后重试";
    }
    if (/timeout|timed out|超时/i.test(raw)) return "查询超时，请稍后重试";
    if (/network|fetch|connect|socket|网络/i.test(raw)) return "网络连接失败，请稍后重试";
    return "查询失败，点击查询重试";
  }

  function planText(planType) {
    const value = String(planType || "").trim();
    if (!value) return "套餐未识别";
    const labels = {
      free: "Free",
      go: "Go",
      plus: "Plus",
      pro: "Pro",
      prolite: "Pro Lite",
      team: "Team",
      self_serve_business_prolite: "Business Pro Lite",
      self_serve_business_usage_based: "Business",
      business: "Business",
      ent26: "Enterprise",
      enterprise_cbp_automation: "Enterprise",
      enterprise_cbp_usage_based: "Enterprise",
      enterprise: "Enterprise",
      edu: "Edu",
      edu_plus: "Edu Plus",
      edu_pro: "Edu Pro",
      unknown: "未识别"
    };
    return labels[value.toLowerCase()] || value;
  }

  function apiProviderName(provider) {
    return ({
      openai: "OpenAI 官方",
      deepseek: "DeepSeek",
      qwen: "通义千问",
      groq: "Groq",
      fireworks: "Fireworks",
      xai: "xAI",
      openrouter: "OpenRouter",
      custom: "自定义中转站"
    })[provider] || "自定义中转站";
  }

  function formatMoney(value, currency = "USD") {
    if (value == null || value === "") return "--";
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    const unit = currency === "CNY" ? "¥" : currency === "USD" ? "$" : `${currency} `;
    return `${unit}${number.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  }

  function createApiMetrics(metrics) {
    if (!metrics) return null;
    const wrapper = element("div", "api-metrics");
    if (!metrics.available && metrics.kind === "balance" && !metrics.message) {
      wrapper.append(element("strong", "api-metrics-danger", "余额不足"));
      const balance = Array.isArray(metrics.balances) ? metrics.balances[0] : null;
      if (balance) wrapper.append(element("span", "", `余额 ${formatMoney(balance.total, balance.currency)}`));
      wrapper.title = "官方余额接口已确认当前 API 账户不可用，请充值后重新查询";
      return wrapper;
    }
    if (!metrics.available) {
      wrapper.append(element("span", "api-metrics-muted", "余额暂时无法读取"));
      wrapper.title = metrics.message || "官方余额接口暂时不可用";
      return wrapper;
    }
    if (metrics.kind === "balance") {
      const balance = Array.isArray(metrics.balances) ? metrics.balances[0] : null;
      if (!balance) return null;
      wrapper.append(
        element("strong", "", `余额 ${formatMoney(balance.total, balance.currency)}`),
        element("span", "", `充值 ${formatMoney(balance.toppedUp, balance.currency)}`),
        element("span", "", `赠送 ${formatMoney(balance.granted, balance.currency)}`)
      );
      return wrapper;
    }
    if (metrics.kind === "key-usage") {
      const primary = metrics.remaining != null
        ? `限额剩余 ${formatMoney(metrics.remaining)}`
        : `累计已用 ${formatMoney(metrics.usageTotal)}`;
      wrapper.append(element("strong", "", primary));
      if (metrics.usageMonthly != null) wrapper.append(element("span", "", `本月 ${formatMoney(metrics.usageMonthly)}`));
      if (metrics.usageDaily != null) wrapper.append(element("span", "", `今日 ${formatMoney(metrics.usageDaily)}`));
      return wrapper;
    }
    return null;
  }

  async function selectApiModel(account, model, control) {
    if (!model || model === account.api?.model || busy) return;
    const group = control?.closest(".api-model-chips");
    const controls = group ? [...group.querySelectorAll("button")] : [control].filter(Boolean);
    controls.forEach((button) => { button.disabled = true; });
    try {
      const payload = await api(`/api/accounts/${account.id}/model`, {
        method: "PATCH",
        body: { model }
      });
      const index = accounts.findIndex((item) => item.id === account.id);
      if (index >= 0) accounts[index] = payload.account;
      render();
      showToast(`启动模型已切换为 ${model}`, "success");
    } catch (error) {
      render();
      showToast(error.message, "error");
    }
  }

  function planKey(planType) {
    const value = String(planType || "").trim().toLowerCase() || "unknown";
    if (value.startsWith("self_serve_business_") || value === "business") {
      return "business";
    }
    if (value === "ent26" || value.startsWith("enterprise_")) return "enterprise";
    if (value === "edu_plus" || value === "edu_pro") return "edu";
    return value;
  }

  function planFilterKey(planType, account = null) {
    if (account?.kind === "api") return "api";
    const key = planKey(planType);
    return ["free", "go", "plus", "pro"].includes(key) ? key : "other";
  }

  function renderPlanFilters() {
    const allFilters = [
      ["all", "全部"],
      ["free", "Free"],
      ["go", "Go"],
      ["plus", "Plus"],
      ["pro", "Pro"],
      ["api", "API"],
      ["other", "其他"]
    ];
    const available = new Set(
      accounts.map((account) => planFilterKey(account.lastSnapshot?.planType, account))
    );
    const filters = allFilters.filter(([plan]) => plan === "all" || available.has(plan));
    if (!filters.some(([plan]) => plan === activePlanFilter)) activePlanFilter = "all";
    planFilters.replaceChildren();
    for (const [plan, label] of filters) {
      const button = element(
        "button",
        `plan-filter${activePlanFilter === plan ? " active" : ""}`,
        label
      );
      button.type = "button";
      button.dataset.plan = plan;
      button.addEventListener("click", () => {
        activePlanFilter = plan;
        render();
      });
      planFilters.append(button);
    }
  }

  function moveAccount(draggedId, targetId, placeAfter) {
    if (draggedId === targetId) return false;
    const sourceIndex = accounts.findIndex((account) => account.id === draggedId);
    const originalTargetIndex = accounts.findIndex((account) => account.id === targetId);
    if (sourceIndex < 0 || originalTargetIndex < 0) return false;
    if (
      (!placeAfter && sourceIndex === originalTargetIndex - 1) ||
      (placeAfter && sourceIndex === originalTargetIndex + 1)
    ) {
      return false;
    }
    const [dragged] = accounts.splice(sourceIndex, 1);
    const targetIndex = accounts.findIndex((account) => account.id === targetId);
    if (targetIndex < 0) {
      accounts.splice(sourceIndex, 0, dragged);
      return false;
    }
    accounts.splice(targetIndex + (placeAfter ? 1 : 0), 0, dragged);
    return true;
  }

  async function persistAccountOrder() {
    if (savingOrder) return;
    savingOrder = true;
    try {
      const payload = await api("/api/accounts/reorder", {
        method: "POST",
        body: { ids: accounts.map((account) => account.id) }
      });
      accounts = payload.accounts || accounts;
    } catch (error) {
      await loadAccounts().catch(() => {});
      showToast(`排序保存失败：${error.message}`, "error");
    } finally {
      savingOrder = false;
    }
  }

  function applyDragPreview(state, targetIndex) {
    const order = state.cards.map((_, index) => index);
    const [source] = order.splice(state.sourceIndex, 1);
    order.splice(targetIndex, 0, source);
    const desiredTops = new Map();
    let top = state.rects[0].top;
    for (const index of order) {
      desiredTops.set(index, top);
      top += state.rects[index].height + state.gap;
    }
    for (let index = 0; index < state.cards.length; index += 1) {
      if (index === state.sourceIndex) continue;
      const offset = desiredTops.get(index) - state.rects[index].top;
      state.cards[index].style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    state.targetIndex = targetIndex;
    state.dropOffset = desiredTops.get(state.sourceIndex) - state.rects[state.sourceIndex].top;
  }

  function clearDragVisuals(state) {
    if (state.frame) cancelAnimationFrame(state.frame);
    for (const item of state.cards || []) {
      item.style.transition = "";
      item.style.transform = "";
    }
    state.handle.classList.remove("pressing");
    state.card.classList.remove("dragging", "dropping");
    accountGrid.classList.remove("sorting");
  }

  function selectAccount(accountId) {
    selectedAccountId = accountId;
    for (const item of accountGrid.querySelectorAll(".account-card")) {
      item.classList.toggle("selected", item.dataset.accountId === accountId);
    }
  }

  function attachDragHandle(handle, card, account) {
    handle.addEventListener("pointerdown", (event) => {
      if (dragState || busy || savingOrder || event.button !== 0) return;
      event.preventDefault();
      const cards = [...accountGrid.querySelectorAll(".account-card")];
      const sourceIndex = cards.indexOf(card);
      if (sourceIndex < 0) return;
      const rects = cards.map((item) => item.getBoundingClientRect());
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        accountId: account.id,
        card,
        handle,
        active: true,
        cards,
        rects,
        sourceIndex,
        targetIndex: sourceIndex,
        dropOffset: 0,
        gap: Number.parseFloat(getComputedStyle(accountGrid).rowGap) || 0,
        frame: 0,
        timer: null
      };
      handle.setPointerCapture(event.pointerId);
      selectAccount(account.id);
      card.classList.add("dragging");
      accountGrid.classList.add("sorting");
      applyDragPreview(dragState, sourceIndex);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      event.preventDefault();
      const state = dragState;
      const sourceRect = state.rects[state.sourceIndex];
      const firstRect = state.rects[0];
      const lastRect = state.rects[state.rects.length - 1];
      const rawOffset = event.clientY - state.startY;
      const offset = Math.max(
        firstRect.top - sourceRect.top,
        Math.min(lastRect.bottom - sourceRect.bottom, rawOffset)
      );
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = requestAnimationFrame(() => {
        card.style.transform = `translate3d(0, ${offset}px, 0)`;
      });

      let targetIndex = state.sourceIndex;
      const sourceMiddle = sourceRect.top + sourceRect.height / 2;
      if (event.clientY >= sourceMiddle) {
        for (let index = state.sourceIndex + 1; index < state.rects.length; index += 1) {
          const rect = state.rects[index];
          if (event.clientY >= rect.top + rect.height / 2) targetIndex = index;
        }
      } else {
        for (let index = state.sourceIndex - 1; index >= 0; index -= 1) {
          const rect = state.rects[index];
          if (event.clientY <= rect.top + rect.height / 2) targetIndex = index;
        }
      }
      if (targetIndex !== state.targetIndex) applyDragPreview(state, targetIndex);
    });

    handle.addEventListener("pointerup", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const state = dragState;
      clearTimeout(state.timer);
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      if (!state.active || state.targetIndex === state.sourceIndex) {
        clearDragVisuals(state);
        dragState = null;
        return;
      }

      if (state.frame) cancelAnimationFrame(state.frame);
      card.classList.add("dropping");
      card.style.transform = `translate3d(0, ${state.dropOffset}px, 0)`;
      const targetId = state.cards[state.targetIndex].dataset.accountId;
      const placeAfter = state.targetIndex > state.sourceIndex;
      setTimeout(() => {
        moveAccount(account.id, targetId, placeAfter);
        clearDragVisuals(state);
        dragState = null;
        render();
        persistAccountOrder();
      }, 150);
    });

    handle.addEventListener("pointercancel", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const state = dragState;
      clearTimeout(state.timer);
      clearDragVisuals(state);
      dragState = null;
    });
  }

  function createLimit(limit, queriedAt = null) {
    const wrapper = element("div", "limit-row");
    const heading = element("div", "limit-heading");
    heading.append(
      element("span", "", limit.label || limit.limitId || "Codex 额度"),
      element("span", "", `剩余 ${Math.round(Number(limit.remainingPercent) || 0)}%`)
    );
    const meter = element("div", "meter");
    const used = Math.max(0, Math.min(100, Number(limit.usedPercent) || 0));
    const remaining = Math.max(0, 100 - used);
    const fill = element("div", `meter-fill ${meterClass(used)}`.trim());
    fill.style.width = `${remaining}%`;
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", "100");
    meter.setAttribute("aria-valuenow", String(Math.round(remaining)));
    meter.append(fill);
    const resetLabel = formatReset(limit.resetsAt);
    const meta = element("div", "limit-meta");
    meta.append(element("p", "reset-time", resetLabel));
    if (queriedAt) {
      const queryTime = element(
        "p",
        "query-time",
        `上次查询 ${formatCompactDate(queriedAt, true)}`
      );
      queryTime.title = `完整查询时间：${formatDate(queriedAt)}`;
      meta.append(queryTime);
    }
    wrapper.append(heading, meter, meta);
    return wrapper;
  }

  function createAccountCard(account) {
    const snapshot = account.lastSnapshot;
    const isApi = account.kind === "api";
    const card = element(
      "article",
      `account-card${selectedAccountId === account.id ? " selected" : ""}${account.lastError ? " has-error" : ""}`
    );
    card.dataset.accountId = account.id;
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, summary, select, option")) return;
      selectAccount(account.id);
    });
    const dragHandle = element("button", "drag-handle");
    dragHandle.type = "button";
    dragHandle.title = "按住拖动排序";
    dragHandle.setAttribute("aria-label", `按住拖动 ${snapshot?.email || "Codex 账户"}`);
    attachDragHandle(dragHandle, card, account);
    const top = element("div", "card-top");
    const identity = element("div", "account-identity");
    const accountLabel = isApi
      ? apiProviderName(account.api?.provider)
      : (snapshot?.email || "Codex 账户");
    const accountTitle = element("h3", "account-title", compactEmail(accountLabel));
    accountTitle.title = accountLabel;
    identity.append(accountTitle);
    const tags = element("div", "identity-tags");
    const plan = element("span", "plan-pill", isApi ? "API" : planText(snapshot?.planType));
    tags.append(plan);
    if (isApi) {
      const metrics = createApiMetrics(account.api?.metrics);
      if (metrics) {
        metrics.classList.add("api-identity-metrics");
        tags.append(metrics);
      }
      if (account.api?.provider === "deepseek") {
        const rechargeLink = element("button", "recharge-link", "去充值");
        rechargeLink.type = "button";
        rechargeLink.title = "前往 DeepSeek 官方充值页面";
        rechargeLink.setAttribute("aria-label", "前往 DeepSeek 官方充值页面");
        rechargeLink.disabled = busy;
        rechargeLink.addEventListener("click", (event) => {
          event.stopPropagation();
          openExternalUrl("https://platform.deepseek.com/top_up");
        });
        tags.append(rechargeLink);
      }
    }
    const apiBalanceInsufficient = isApi && account.api?.metrics?.kind === "balance" &&
      account.api.metrics.available === false && !account.api.metrics.message;
    const showStatus = isApi
      ? account.status !== "ready" && !apiBalanceInsufficient
      : account.requiresReauth || account.status === "authorizing";
    if (showStatus) {
      const effectiveStatus = account.requiresReauth ? "error" : (account.status || "error");
      const status = element(
        "span",
        `status-pill ${effectiveStatus}`,
        isApi
          ? (account.status === "error"
              ? (account.api?.metrics?.kind === "balance" &&
                 account.api.metrics.available === false &&
                 !account.api.metrics.message ? "余额不足" : "连接失败")
              : "待测试")
          : (account.requiresReauth ? "重新授权" : statusText(account.status))
      );
      tags.append(status);
    }
    if (!isApi && snapshot && planFilterKey(snapshot.planType) !== "free") {
      const validity = formatSubscriptionValidity(snapshot.subscriptionActiveUntil);
      const validityPill = element(
        "span",
        `validity-pill ${validity.className}`,
        validity.text
      );
      validityPill.title = validity.expiresAt
        ? (validity.className === "expired"
            ? `订阅已于 ${formatDate(validity.expiresAt)} 到期`
            : `订阅有效至 ${formatDate(validity.expiresAt)}`)
        : "官方登录凭证未提供订阅到期时间";
      tags.append(validityPill);
    }
    if (!isApi && snapshot?.resetCreditsAvailable != null) {
      const resetCount = Number(snapshot.resetCreditsAvailable) || 0;
      const resetTag = element(
        resetCount > 0 ? "button" : "span",
        `reset-pill${resetCount > 0 ? " available reset-credit-button" : ""}`,
        `重置卡：${resetCount}`
      );
      if (resetCount > 0) {
        resetTag.type = "button";
        resetTag.title = "使用 1 张重置卡恢复 5 小时额度";
        resetTag.disabled = busy;
        resetTag.addEventListener("click", (event) => {
          event.stopPropagation();
          openResetDialog(account);
        });
      }
      tags.append(resetTag);
    }
    identity.append(tags);
    top.append(identity);

    const body = element("div", "card-body");
    if (isApi) {
      body.classList.add("api-account-body", "single-limit");
      const apiSummary = element("div", "api-summary");
      const modelChooser = element("div", "api-model-chooser");
      modelChooser.append(element("span", "", "启动模型"));
      const modelChips = element("div", "api-model-chips");
      modelChips.setAttribute("role", "radiogroup");
      modelChips.setAttribute("aria-label", `${accountLabel} 的启动模型`);
      const modelAvailable = account.api?.modelAvailable !== false;
      const models = [...new Set((Array.isArray(account.api?.models) ? account.api.models : []).filter(Boolean))];
      if (modelAvailable && account.api?.model && !models.includes(account.api.model)) models.unshift(account.api.model);
      if (!models.length) {
        const emptyChip = element("span", "api-model-chip empty", "未识别模型");
        modelChips.append(emptyChip);
      } else {
        if (!modelAvailable) {
          modelChips.append(element("span", "api-model-chip unavailable", "原模型不可用"));
        }
        for (const model of models) {
          const selected = modelAvailable && model === (account.api?.model || models[0]);
          const chip = element("button", `api-model-chip${selected ? " selected" : ""}`, model);
          chip.type = "button";
          chip.title = selected ? `当前启动模型：${model}` : `切换启动模型为 ${model}`;
          chip.setAttribute("role", "radio");
          chip.setAttribute("aria-checked", String(selected));
          chip.disabled = busy;
          chip.addEventListener("click", (event) => {
            event.stopPropagation();
            selectApiModel(account, model, chip);
          });
          modelChips.append(chip);
        }
      }
      modelChooser.append(modelChips);
      const modelSummary = !modelAvailable
        ? "原启动模型已失效，请重新选择"
        : account.api?.modelCount != null
        ? `已识别 ${account.api.modelCount} 个模型`
        : "保存后可手动测试连接";
      const modelLine = element(
        "p",
        `api-model-line${modelAvailable ? "" : " warning"}`,
        account.api?.checkedAt
          ? `${modelSummary} · 测试 ${formatCompactDate(Date.parse(account.api.checkedAt), true)}`
          : modelSummary
      );
      if (account.api?.checkedAt) {
        modelLine.title = `完整测试时间：${formatDate(Date.parse(account.api.checkedAt))}`;
      }
      apiSummary.append(modelChooser, modelLine);
      body.append(apiSummary);
    } else if (snapshot?.limits?.length) {
      if (snapshot.limits.length === 1) body.classList.add("single-limit");
      snapshot.limits.forEach((limit, index) => {
        body.append(createLimit(
          limit,
          index === snapshot.limits.length - 1 ? snapshot.queriedAt : null
        ));
      });
    } else {
      body.append(
        element(
          "p",
          "no-data",
          account.status === "authorizing"
            ? "请在 OpenAI 官方页面完成授权。"
            : "还没有额度结果，请手动查询该账户。"
        )
      );
    }
    if (account.lastError) {
      body.classList.add("has-error");
      const errorLine = element("p", "error-line", compactAccountError(account));
      errorLine.title = account.lastError;
      body.append(errorLine);
    }

    const footer = element("div", "card-footer");
    const buttons = element("div", "card-buttons");
    const launchButton = element("button", "card-action launch-action");
    launchButton.type = "button";
    launchButton.title = apiBalanceInsufficient
      ? "当前余额不足，仍可启动；模型调用可能返回 402"
      : credentialSwitchCapability.switchingSupported
      ? "使用此账户启动 Codex 桌面端"
      : credentialSwitchCapability.message;
    launchButton.setAttribute("aria-label", `使用 ${accountLabel} 启动 Codex`);
    launchButton.append(svgIcon("play"), element("span", "action-label", "启动"));
    launchButton.disabled = busy || account.status === "authorizing" ||
      (isApi && account.api?.modelAvailable === false) ||
      !credentialSwitchCapability.switchingSupported;
    launchButton.addEventListener("click", () => launchCodex(account));
    const queryButton = element("button", "card-action icon-action query-action");
    queryButton.type = "button";
    queryButton.title = isApi ? "刷新模型与余额" : "查询额度";
    queryButton.setAttribute("aria-label", isApi ? `刷新 ${accountLabel} 的模型与余额` : `查询 ${accountLabel} 的额度`);
    queryButton.append(svgIcon("refresh"));
    queryButton.classList.toggle("is-querying", queryingAccountId === account.id);
    queryButton.disabled = busy || account.status === "authorizing";
    queryButton.addEventListener("click", () =>
      queryOne(account.id, accountLabel)
    );
    const deleteButton = element("button", "card-action icon-action delete-action");
    deleteButton.type = "button";
    deleteButton.title = "移除账户";
    deleteButton.setAttribute("aria-label", `移除 ${accountLabel}`);
    deleteButton.append(svgIcon("trash"));
    deleteButton.disabled = busy;
    deleteButton.addEventListener("click", () => removeAccount(account));
    buttons.append(queryButton, deleteButton, launchButton);
    footer.append(buttons);
    card.append(dragHandle, top, body, footer);
    return card;
  }

  function formatMetric(value) {
    const number = Math.max(0, Number(value) || 0);
    if (number >= 100_000_000) return `${(number / 100_000_000).toFixed(number >= 1_000_000_000 ? 1 : 2)}亿`;
    if (number >= 10_000) return `${(number / 10_000).toFixed(number >= 1_000_000 ? 1 : 2)}万`;
    return number.toLocaleString("zh-CN");
  }

  function formatRelativeSessionTime(seconds) {
    const diff = Math.max(0, Math.floor(Date.now() / 1000) - Number(seconds || 0));
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} 分钟`;
    if (diff < 86_400) return `${Math.floor(diff / 3600)} 小时`;
    if (diff < 604_800) return `${Math.floor(diff / 86_400)} 天`;
    return formatCompactDate(Number(seconds) * 1000);
  }

  function compactSessionId(id) {
    const value = String(id || "");
    return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
  }

  function compactSessionPath(cwd) {
    const parts = String(cwd || "未知位置").replace(/\\/g, "/").split("/").filter(Boolean);
    if (!parts.length) return "未知位置";
    return parts.slice(-2).join(" / ");
  }

  function filteredSessions() {
    const queryText = sessionSearch.value.trim().toLocaleLowerCase("zh-CN");
    return sessions.filter((session) => {
      if (sessionType.value === "active" && session.archived) return false;
      if (sessionType.value === "archived" && !session.archived) return false;
      if (!queryText) return true;
      return `${session.title}\n${session.cwd}`.toLocaleLowerCase("zh-CN").includes(queryText);
    });
  }

  function updateSessionToolbar(visibleItems) {
    const selectedCount = selectedSessions.size;
    sessionSelectAll.checked = visibleItems.length > 0 && visibleItems.every((item) => selectedSessions.has(sessionTrashMode ? item.trashKey : item.id));
    sessionSelectAll.indeterminate = selectedCount > 0 && !sessionSelectAll.checked;
    sessionExportButton.disabled = busy || sessionTrashMode || selectedCount === 0;
    sessionImportButton.disabled = busy || sessionTrashMode;
    sessionRepairButton.disabled = busy || sessionTrashMode;
    sessionTrashButton.disabled = busy || selectedCount === 0;
    sessionRefreshButton.disabled = busy;
    sessionExportButton.textContent = `导出 (${selectedCount})`;
    sessionTrashButton.textContent = sessionTrashMode ? `恢复 (${selectedCount})` : `移到废纸篓 (${selectedCount})`;
    sessionTrashButton.classList.toggle("danger-soft", !sessionTrashMode);
    sessionTrashViewButton.textContent = sessionTrashMode ? "返回会话" : "废纸篓";
  }

  function createSessionItem(item, trashMode = false) {
    const row = element("div", `session-item${trashMode ? " trash-row" : ""}`);
    const key = trashMode ? item.trashKey : item.id;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSessions.has(key);
    checkbox.setAttribute("aria-label", `选择会话 ${item.title}`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedSessions.add(key);
      else selectedSessions.delete(key);
      renderSessions();
    });
    const title = element("span", "session-item-title", item.title || compactSessionId(item.id));
    title.title = item.title || item.id;
    const id = element(
      "span",
      "session-item-id",
      trashMode ? compactSessionId(item.id) : compactSessionPath(item.cwd)
    );
    id.title = trashMode ? item.id : (item.cwd || "未知位置");
    const usageText = trashMode
      ? "可恢复"
      : `${formatMetric(item.totalTokens)} tokens · ${item.requestCount || 0} 次`;
    const usage = element("span", trashMode ? "trash-badge" : "session-item-tokens", usageText);
    const time = element(
      "span",
      "session-item-time",
      trashMode
        ? formatCompactDate(Date.parse(item.deletedAt), true)
        : formatRelativeSessionTime(item.updatedAt)
    );
    row.append(checkbox, title, id, usage, time);
    return row;
  }

  function renderSessions() {
    const summary = sessionSummary || {};
    sessionCount.textContent = formatMetric(summary.sessionCount);
    sessionInput.textContent = formatMetric(summary.inputTokens);
    sessionCached.textContent = formatMetric(summary.cachedInputTokens);
    sessionOutput.textContent = formatMetric(summary.outputTokens);
    sessionTotal.textContent = formatMetric(summary.totalTokens);
    sessionRequests.textContent = formatMetric(summary.requestCount);
    sessionList.replaceChildren();
    sessionList.classList.toggle("flat", !sessionTrashMode);
    const visibleItems = sessionTrashMode ? sessionTrashItems : filteredSessions();
    updateSessionToolbar(visibleItems);
    sessionEmpty.hidden = visibleItems.length > 0;
    sessionList.hidden = visibleItems.length === 0;
    if (sessionTrashMode) {
      for (const item of visibleItems) sessionList.append(createSessionItem(item, true));
      return;
    }
    for (const item of visibleItems) sessionList.append(createSessionItem(item));
  }

  async function loadSessions(showMessage = false) {
    const payload = await api("/api/sessions");
    sessions = payload.sessions || [];
    sessionSummary = payload.summary || null;
    selectedSessions.clear();
    renderSessions();
    if (showMessage) setStatus(`已读取 ${sessions.length} 个本机会话。`, "success");
  }

  async function loadSessionTrash() {
    const payload = await api("/api/sessions/trash");
    sessionTrashItems = payload.sessions || [];
    selectedSessions.clear();
    renderSessions();
  }

  function managementRow(title, subtitle, stateText, stateClass = "") {
    const row = element("div", "management-row");
    const primary = element("div", "management-primary");
    primary.append(element("strong", "", title), element("span", "", subtitle));
    const state = element("span", `management-state${stateClass ? ` ${stateClass}` : ""}`, stateText);
    const actions = element("div", "management-actions");
    row.append(primary, state, actions);
    return { row, actions, state };
  }

  function renderAuthCenter() {
    authCenterList.replaceChildren();
    const oauthAccounts = accounts.filter((account) => account.kind === "oauth");
    if (!oauthAccounts.length) {
      authCenterList.append(element("div", "management-empty", "还没有官方授权账户"));
      return;
    }
    for (const account of oauthAccounts) {
      const email = account.lastSnapshot?.email || "等待识别账户";
      const abnormal = account.requiresReauth || account.status === "error";
      const pending = account.status === "authorizing";
      const stateText = pending ? "授权进行中" : abnormal ? (account.errorCode === "AUTH_REVOKED" ? "需要重新授权" : "暂时无法验证") : "可用";
      const { row, actions } = managementRow(
        email,
        `官方 App Server · 凭证版本 ${account.auth?.generation || 0} · ${account.auth?.credentialUpdatedAt ? `更新于 ${formatCompactDate(Date.parse(account.auth.credentialUpdatedAt))}` : "尚未刷新"}`,
        stateText,
        abnormal ? "error" : pending ? "warning" : ""
      );
      const queryButton = element("button", "", "核对");
      queryButton.type = "button";
      queryButton.disabled = busy || pending;
      queryButton.addEventListener("click", async () => {
        await queryOne(account.id, email);
        renderAuthCenter();
      });
      const reauthButton = element("button", abnormal ? "danger" : "", "重新授权");
      reauthButton.type = "button";
      reauthButton.disabled = busy || pending;
      reauthButton.addEventListener("click", () => beginAuthorization(account.id));
      actions.append(queryButton, reauthButton);
      authCenterList.append(row);
    }
  }

  function renderBackups() {
    backupList.replaceChildren();
    if (!localBackups.length) {
      backupList.append(element("div", "management-empty", "尚未创建本机备份"));
      return;
    }
    for (const backup of localBackups) {
      const total = (backup.files || []).reduce((sum, item) => sum + (Number(item.size) || 0), 0);
      const { row, actions } = managementRow(
        formatDate(Date.parse(backup.createdAt)),
        `${backup.reason === "before-restore" ? "恢复前安全备份" : "手动备份"} · ${formatMetric(total)}B · ${backup.files?.length || 0} 个文件`,
        "校验完整"
      );
      const restoreButton = element("button", "", "恢复");
      restoreButton.type = "button";
      restoreButton.addEventListener("click", async () => {
        if (busy || !window.confirm("恢复此备份？软件会先自动创建当前状态的安全备份。")) return;
        setBusy(true, "正在校验并恢复本机备份…");
        try {
          const payload = await api(`/api/local/backups/${backup.id}/restore`, { method: "POST" });
          accounts = payload.accounts || [];
          render();
          await loadLocalData();
          showToast("备份已恢复，可随时回退到自动安全备份");
        } catch (error) {
          showToast(error.message, "error");
        } finally { setBusy(false); }
      });
      actions.append(restoreButton);
      backupList.append(row);
    }
  }

  function renderProjects() {
    projectAccount.replaceChildren(new Option("不绑定账户", ""));
    for (const account of accounts) {
      const label = account.kind === "api" ? account.api?.name : account.lastSnapshot?.email;
      projectAccount.append(new Option(label || "未命名账户", account.id));
    }
    projectList.replaceChildren();
    if (!localProjects.length) {
      projectList.append(element("div", "management-empty", "还没有项目方案"));
      return;
    }
    for (const project of localProjects) {
      const account = accounts.find((item) => item.id === project.accountId);
      const label = account?.lastSnapshot?.email || account?.api?.name || "未绑定账户";
      const { row, actions } = managementRow(project.name, `${label} · 推理等级 ${project.reasoningEffort || "默认"}`, "本机方案");
      const remove = element("button", "danger", "删除");
      remove.type = "button";
      remove.addEventListener("click", async () => {
        if (!window.confirm(`删除项目方案“${project.name}”？`)) return;
        await api(`/api/local/projects/${project.id}`, { method: "DELETE" });
        localProjects = localProjects.filter((item) => item.id !== project.id);
        renderProjects();
      });
      actions.append(remove);
      projectList.append(row);
    }
  }

  function renderExtensions() {
    extensionList.replaceChildren();
    if (!localExtensions.length) {
      extensionList.append(element("div", "management-empty", "未发现本地 MCP、Skills 或提示词"));
      return;
    }
    const kindName = { mcp: "MCP", skill: "Skill", prompt: "提示词" };
    for (const item of localExtensions) {
      const { row } = managementRow(item.name, item.path, item.enabled ? "已启用" : "已停用", item.enabled ? "" : "warning");
      row.querySelector(".management-state").textContent = `${kindName[item.kind] || item.kind} · ${item.enabled ? "已启用" : "已停用"}`;
      extensionList.append(row);
    }
  }

  async function loadLocalData() {
    const [backupPayload, projectPayload, extensionPayload] = await Promise.all([
      api("/api/local/backups"),
      api("/api/local/projects"),
      api("/api/local/extensions")
    ]);
    localBackups = backupPayload.backups || [];
    localProjects = projectPayload.projects || [];
    localExtensions = extensionPayload.extensions || [];
    localLoaded = true;
    renderAuthCenter();
    renderBackups();
    renderProjects();
    renderExtensions();
  }

  async function switchView(view) {
    if (busy || !["accounts", "sessions", "local"].includes(view)) return;
    activeView = view;
    const accountMode = view === "accounts";
    const sessionMode = view === "sessions";
    accountsView.hidden = !accountMode;
    sessionsView.hidden = !sessionMode;
    localView.hidden = view !== "local";
    accountToolbar.hidden = !accountMode;
    planFilters.hidden = !accountMode;
    document.body.classList.toggle("workspace-mode", !accountMode);
    queryAllButton.hidden = !accountMode;
    addButton.hidden = !accountMode;
    for (const item of primaryNavItems) item.classList.toggle("active", item.dataset.view === view);
    setStatus("");
    if (sessionMode && !sessions.length) {
      setStatus("正在读取本机 Codex 会话…");
      try {
        await loadSessions();
        setStatus("");
      } catch (error) {
        setStatus(error.message, "error");
      }
    }
    if (view === "local" && !localLoaded) {
      setStatus("正在读取本机管理数据…");
      try {
        await loadLocalData();
        setStatus("");
      } catch (error) {
        setStatus(error.message, "error");
      }
    } else if (view === "local") {
      renderAuthCenter();
      renderProjects();
    }
  }

  function render() {
    accountSkeleton.hidden = true;
    renderPlanFilters();
    accountGrid.replaceChildren();
    emptyState.hidden = accounts.length > 0;
    queryAllButton.disabled = busy || accounts.length === 0;
    let visibleAccounts = activePlanFilter === "all"
      ? accounts
      : accounts.filter(
          (account) => planFilterKey(account.lastSnapshot?.planType, account) === activePlanFilter
        );
    for (const account of visibleAccounts) accountGrid.append(createAccountCard(account));
    if (accounts.length && !visibleAccounts.length) {
      accountGrid.append(element("p", "empty-filter-result", "没有符合当前筛选条件的账户"));
    }
  }

  async function loadAccounts() {
    const payload = await api("/api/accounts");
    accounts = payload.accounts || [];
    accountsLoaded = true;
    render();
  }

  function formatUpdateSize(bytes) {
    const size = Number(bytes);
    if (!Number.isFinite(size) || size <= 0) return "";
    return size >= 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(size >= 100 * 1024 * 1024 ? 0 : 1)} MB`
      : `${Math.ceil(size / 1024)} KB`;
  }

  function renderUpdateStatus(nextStatus) {
    if (nextStatus) updateStatus = nextStatus;
    const status = updateStatus || { status: "idle", currentVersion: appVersion };
    const latest = status.latestVersion;
    updateVersionSummary.textContent = latest && latest !== appVersion
      ? `当前 v${appVersion || status.currentVersion} · 最新 v${latest}`
      : `当前版本 v${appVersion || status.currentVersion || "-"}`;
    updateDot.hidden = !status.updateAvailable;
    appVersionButton.classList.toggle("has-update", Boolean(status.updateAvailable));
    updateStateCard.classList.toggle("has-error", status.status === "error");

    const copy = {
      disabled: ["暂时无法自动更新", "当前版本未配置可信更新源。"],
      idle: ["准备检查更新", "点击下方按钮，从官方 GitHub Release 检查最新版本。"],
      checking: ["正在检查更新", "正在安全连接官方发布源…"],
      "up-to-date": ["当前已是最新版本", "没有发现需要安装的新版本。"],
      available: ["发现新版本", `v${latest || "-"} 已可用${status.packageSize ? ` · ${formatUpdateSize(status.packageSize)}` : ""}`],
      downloading: ["正在下载更新", `已完成 ${status.progress?.percent || 0}%`],
      ready: ["更新已准备好", `v${latest || "-"} 已通过签名和完整性校验。`],
      applying: ["正在重启并更新", "窗口将暂时关闭，完成后会自动重新打开。"],
      error: ["更新检查未完成", status.error || "请稍后重试。"]
    }[status.status] || ["软件更新", "正在读取更新状态。"];
    updateStateTitle.textContent = copy[0];
    updateStateDetail.textContent = copy[1];

    const downloading = status.status === "downloading";
    updateProgress.hidden = !downloading;
    updateProgressFill.style.width = `${status.progress?.percent || 0}%`;
    const notes = Array.isArray(status.notes) ? status.notes.filter(Boolean) : [];
    updateNotes.hidden = !notes.length;
    updateNoteList.replaceChildren(...notes.map((note) => element("li", "", note)));

    checkUpdateButton.hidden = ["available", "downloading", "ready", "applying"].includes(status.status);
    checkUpdateButton.disabled = updateOperation || status.status === "checking";
    downloadUpdateButton.hidden = status.status !== "available";
    downloadUpdateButton.disabled = updateOperation;
    applyUpdateButton.hidden = status.status !== "ready";
    applyUpdateButton.disabled = updateOperation;
  }

  async function refreshUpdateStatus() {
    const payload = await api("/api/update/status");
    renderUpdateStatus(payload.update);
    return payload.update;
  }

  async function checkForUpdate() {
    if (updateOperation) return;
    updateOperation = true;
    renderUpdateStatus({ ...(updateStatus || {}), status: "checking", currentVersion: appVersion });
    try {
      const payload = await api("/api/update/check", { method: "POST" });
      renderUpdateStatus(payload.update);
    } catch (error) {
      await refreshUpdateStatus().catch(() => {});
      showToast(error.message, "error");
    } finally {
      updateOperation = false;
      renderUpdateStatus();
    }
  }

  async function downloadUpdate() {
    if (updateOperation) return;
    updateOperation = true;
    renderUpdateStatus({ ...updateStatus, status: "downloading", progress: { percent: 0 } });
    updatePollTimer = setInterval(() => refreshUpdateStatus().catch(() => {}), 500);
    try {
      const payload = await api("/api/update/download", { method: "POST" });
      renderUpdateStatus(payload.update);
    } catch (error) {
      await refreshUpdateStatus().catch(() => {});
      showToast(error.message, "error");
    } finally {
      clearInterval(updatePollTimer);
      updatePollTimer = null;
      updateOperation = false;
      renderUpdateStatus();
    }
  }

  async function applyUpdate() {
    if (updateOperation) return;
    updateOperation = true;
    applyUpdateButton.disabled = true;
    try {
      const payload = await api("/api/update/apply", { method: "POST" });
      renderUpdateStatus(payload.update);
      if (isDesktopHost) {
        window.chrome.webview.postMessage("apply-update");
      } else {
        showToast("更新已准备好，请退出并重新打开 AI Switch", "success");
      }
    } catch (error) {
      showToast(error.message, "error");
      updateOperation = false;
      await refreshUpdateStatus().catch(() => {});
    }
  }

  async function loadAppInfo() {
    const payload = await api("/api/app-info");
    appVersion = payload.version || "";
    appVersionButton.title = appVersion ? `当前版本 v${appVersion}` : "版本信息";
    appVersionLabel.textContent = appVersion ? `v${appVersion}` : "版本";
    renderUpdateStatus(payload.update);
    credentialSwitchCapability = payload.credentialStore || credentialSwitchCapability;
    if (accountsLoaded) render();
    if (!credentialSwitchCapability.switchingSupported) {
      setStatus(`账户启动已停用：${credentialSwitchCapability.message}`, "warning");
    }
  }

  async function queryOne(id, label) {
    if (busy) return;
    const current = accounts.find((account) => account.id === id);
    const isApi = current?.kind === "api";
    setStatus("");
    queryingAccountId = id;
    setBusy(true);
    try {
      const payload = await api(`/api/accounts/${id}/query`, { method: "POST" });
      const index = accounts.findIndex((account) => account.id === id);
      if (index >= 0) accounts[index] = payload.account;
      render();
      const insufficient = isApi && payload.account?.api?.metrics?.kind === "balance" &&
        payload.account.api.metrics.available === false && !payload.account.api.metrics.message;
      showToast(
        insufficient ? `${label} 余额已刷新：当前余额不足` :
          isApi ? `${label} 模型与余额已刷新` : `${label} 查询完成`,
        insufficient ? "error" : "success"
      );
    } catch (error) {
      const refreshed = await api("/api/accounts").catch(() => null);
      const latest = refreshed?.accounts?.find((account) => account.id === id);
      const index = accounts.findIndex((account) => account.id === id);
      if (latest && index >= 0) accounts[index] = latest;
      render();
      showToast(error.message, "error");
    } finally {
      queryingAccountId = null;
      setBusy(false);
    }
  }

  async function launchCodex(account) {
    if (busy) return;
    const label = account.kind === "api"
      ? (account.api?.name || account.label || "API 接入")
      : (account.lastSnapshot?.email || "Codex 账户");
    setBusy(true, `正在切换到 ${label} 并启动 Codex…`);
    if (account.kind === "api") {
      api(`/api/accounts/${account.id}/query`, { method: "POST" })
        .then((payload) => {
          const index = accounts.findIndex((item) => item.id === account.id);
          if (index >= 0 && payload.account) accounts[index] = payload.account;
          render();
        })
        .catch(async () => {
          const refreshed = await api("/api/accounts").catch(() => null);
          if (Array.isArray(refreshed?.accounts)) {
            accounts = refreshed.accounts;
            render();
          }
        });
    }
    try {
      const result = await api(`/api/accounts/${account.id}/launch-codex`, {
        method: "POST"
      });
      await loadAccounts().catch(() => {});
      const closeText = result.forced ? "（已清理残留进程）" : "";
      const launchMessage = result.balanceInsufficient
        ? `已使用 ${result.label} 启动 Codex；当前余额不足，模型调用可能返回 402`
        : `已使用 ${result.label} 启动 Codex ${closeText}`.trim();
      setStatus(launchMessage, result.balanceInsufficient ? "warning" : "success");
      showToast(
        result.balanceInsufficient
          ? "Codex 已启动；当前记录余额不足，后台正在刷新"
          : "Codex 已切换，聊天记录继续共用原目录",
        result.balanceInsufficient ? "warning" : "success"
      );
    } catch (error) {
      setStatus(error.message, "error");
      showToast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function queryAll() {
    if (busy || !accounts.length) return;
    const targets = accounts.filter((account) => account.status !== "authorizing");
    if (!targets.length) {
      showToast("当前没有可查询的账户", "error");
      return;
    }
    setStatus("");
    batchProgress = {
      completed: 0,
      total: targets.length,
      current: `并发查询 ${Math.min(targets.length, 3)} 路`,
      failed: 0,
      reauth: 0,
      complete: false
    };
    updateBatchProgress();
    setBusy(true);
    let failed = 0;
    try {
      const payload = await api("/api/query-all", { method: "POST" });
      failed = (payload.results || []).filter((result) => !result.ok).length;
      if (Array.isArray(payload.accounts)) accounts = payload.accounts;
      const reauth = accounts.filter((account) => account.requiresReauth).length;
      batchProgress.completed = targets.length;
      render();
      finishBatchProgress(failed, reauth);
      showToast(
        failed
          ? `查询完成：${failed} 个查询失败${reauth ? `，其中 ${reauth} 个需重新授权` : ""}`
          : "全部账户查询完成"
      );
    } catch (error) {
      failed += 1;
      const refreshed = await api("/api/accounts").catch(() => null);
      if (Array.isArray(refreshed?.accounts)) accounts = refreshed.accounts;
      render();
      finishBatchProgress(failed);
      showToast(error.message, "error");
    } finally {
      queryingAccountId = null;
      setBusy(false);
    }
  }

  function openResetDialog(account) {
    if (busy) return;
    pendingResetAccount = account;
    resetAccountLabel.textContent = account.lastSnapshot?.email || "Codex 账户";
    resetCreditCount.textContent = String(
      Math.max(0, Number(account.lastSnapshot?.resetCreditsAvailable) || 0)
    );
    confirmResetButton.textContent = "确认重置";
    confirmResetButton.disabled = false;
    cancelResetButton.disabled = false;
    resetDialog.showModal();
  }

  function closeResetDialog() {
    if (busy) return;
    pendingResetAccount = null;
    resetDialog.close();
  }

  async function confirmResetUsage() {
    const account = pendingResetAccount;
    if (!account || busy) return;
    const label = account.lastSnapshot?.email || "Codex 账户";
    confirmResetButton.disabled = true;
    cancelResetButton.disabled = true;
    confirmResetButton.textContent = "正在重置…";
    setBusy(true, `正在重置 ${label} 的 5 小时额度…`);
    try {
      const payload = await api(`/api/accounts/${account.id}/reset-usage`, { method: "POST" });
      const index = accounts.findIndex((item) => item.id === account.id);
      if (index >= 0) accounts[index] = payload.account;
      pendingResetAccount = null;
      resetDialog.close();
      render();
      setStatus(payload.warning || `${label} 的 5 小时额度已重置。`, "success");
      showToast(payload.warning || "5 小时额度已重置");
    } catch (error) {
      await loadAccounts().catch(() => {});
      setStatus(error.message, "error");
      showToast(error.message, "error");
      confirmResetButton.disabled = false;
      cancelResetButton.disabled = false;
      confirmResetButton.textContent = "确认重置";
    } finally {
      setBusy(false);
    }
  }

  async function removeAccount(account) {
    if (busy) return;
    const confirmed = window.confirm(
      `移除“${account.label}”？\n\n这会删除 AI Switch 保存的该账户凭证，不影响官方 Codex 当前登录。`
    );
    if (!confirmed) return;
    try {
      await api(`/api/accounts/${account.id}`, { method: "DELETE" });
      accounts = accounts.filter((item) => item.id !== account.id);
      if (selectedAccountId === account.id) selectedAccountId = null;
      render();
      showToast("账户及其本地凭证已移除");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function pollAuthorization(id) {
    let consecutiveErrors = 0;
    while (activeLoginId === id) {
      await wait(1_000);
      let payload;
      try {
        payload = await api(`/api/logins/${id}`);
      } catch (error) {
        consecutiveErrors += 1;
        authMessage.textContent =
          `正在等待桌面端接收授权结果…（重试 ${consecutiveErrors}/5）`;
        if (consecutiveErrors < 5) continue;
        authMessage.textContent = `${error.message} 请取消后重新授权。`;
        cancelAuthButton.textContent = "关闭并清理";
        return;
      }
      consecutiveErrors = 0;
      if (payload.state === "pending" || payload.state === "completing") continue;
      if (payload.state === "complete") {
        activeLoginId = null;
        authPopup?.close();
        authDialog.close();
        await loadAccounts();
        setStatus(payload.warning || "新账户授权并查询完成。", "success");
        showToast(payload.warning || "账户已添加");
        return;
      }
      authMessage.textContent = payload.error || "授权未完成，请重试。";
      cancelAuthButton.textContent = "关闭并清理";
      return;
    }
  }

  async function beginAuthorization(reauthorizeAccountId = null) {
    authPopup = isDesktopHost
      ? null
      : window.open("about:blank", "codex-official-auth");
    authMessage.textContent = "正在向 Codex App Server 申请官方授权地址…";
    cancelAuthButton.textContent = "取消本次授权";
    authDialog.showModal();
    try {
      const endpoint = reauthorizeAccountId
        ? `/api/accounts/${reauthorizeAccountId}/reauthorize`
        : "/api/accounts";
      const payload = await api(endpoint, {
        method: "POST"
      });
      activeLoginId = payload.id;
      authMessage.textContent =
        reauthorizeAccountId
          ? "请登录当前账户对应的 OpenAI 账号。验证一致后会原子替换旧凭证。"
          : "请在刚打开的 OpenAI 页面登录并确认授权。本窗口会自动接收完成状态。";
      openOfficialAuthorization(payload.authUrl);
      pollAuthorization(payload.id);
    } catch (error) {
      authPopup?.close();
      authMessage.textContent = error.message;
      cancelAuthButton.textContent = "关闭";
    }
  }

  function clearApiFormError() {
    apiFormError.textContent = "";
    apiFormError.hidden = true;
  }

  function openManagementPage() {
    if (busy) return;
    for (const item of primaryNavItems) item.classList.toggle("active", item.dataset.view === activeView);
    appShell.hidden = true;
    apiPage.hidden = true;
    managementPage.hidden = false;
    document.body.classList.add("subpage-mode");
    window.scrollTo(0, 0);
    backManagementPageButton.focus();
  }

  function closeManagementPage() {
    managementPage.hidden = true;
    appShell.hidden = false;
    document.body.classList.remove("subpage-mode");
  }

  function returnFromManagementToAccounts() {
    closeManagementPage();
    switchView("accounts");
  }

  function selectApiProvider(provider) {
    apiProviderSelect.value = provider;
    for (const button of apiProviderButtons) {
      const active = button.dataset.provider === provider;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    }
    apiBaseUrlInput.value = "";
    apiCredentialPanel.hidden = false;
    apiFormActions.hidden = false;
    applyApiProvider(provider);
    clearApiFormError();
  }

  function applyApiProvider(provider) {
    const selected = apiProviderPresets[provider] || apiProviderPresets.custom;
    apiBaseUrlField.hidden = selected.fixedBaseUrl;
    apiBaseUrlInput.required = !selected.fixedBaseUrl;
    apiProviderNote.textContent = selected.note;
  }

  function openApiPage() {
    apiAccountForm.reset();
    apiKeyInput.type = "password";
    toggleApiKeyButton.textContent = "显示";
    saveApiAccountButton.disabled = false;
    saveApiAccountButton.textContent = "添加服务";
    clearApiFormError();
    apiProviderSelect.value = "";
    for (const button of apiProviderButtons) {
      button.classList.remove("is-active");
      button.setAttribute("aria-checked", "false");
    }
    openAiAccountMethods.hidden = false;
    apiCredentialPanel.hidden = true;
    apiFormActions.hidden = true;
    appShell.hidden = true;
    apiPage.hidden = false;
    document.body.classList.add("subpage-mode");
    window.scrollTo(0, 0);
    addWithOauthButton.focus();
  }

  function closeApiPage() {
    apiPage.hidden = true;
    apiKeyInput.value = "";
    appShell.hidden = false;
    document.body.classList.remove("subpage-mode");
  }

  async function saveApiAccount(event) {
    event.preventDefault();
    if (!apiProviderSelect.value) return;
    if (busy || !apiAccountForm.reportValidity()) return;
    const request = {
      provider: apiProviderSelect.value,
      baseUrl: apiBaseUrlInput.value,
      apiKey: apiKeyInput.value
    };
    clearApiFormError();
    saveApiAccountButton.disabled = true;
    saveApiAccountButton.textContent = "正在验证…";
    setBusy(true, "正在验证模型服务…");
    try {
      const payload = await api("/api/accounts/api", { method: "POST", body: request });
      accounts.push(payload.account);
      closeApiPage(false);
      render();
      setStatus("连接验证通过，模型服务已添加。", "success");
      showToast("模型服务已添加到本机");
    } catch (error) {
      apiFormError.textContent = `添加失败：${error.message}`;
      apiFormError.hidden = false;
      setStatus("");
    } finally {
      request.apiKey = "";
      saveApiAccountButton.disabled = false;
      saveApiAccountButton.textContent = "添加服务";
      setBusy(false);
    }
  }

  async function importCurrentAccount() {
    closeApiPage();
    setBusy(true, "正在读取本机官方 Codex 登录…");
    try {
      const payload = await api("/api/accounts/import-current", { method: "POST" });
      await loadAccounts();
      setStatus(payload.warning || "已导入本机 Codex 当前账户。", "success");
      showToast(payload.merged ? "当前登录已更新到现有账户" : "当前 Codex 账户已导入");
    } catch (error) {
      setStatus(error.message, "error");
      showToast(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function cancelAuthorization() {
    const id = activeLoginId;
    activeLoginId = null;
    if (id) {
      try {
        await api(`/api/logins/${id}/cancel`, { method: "POST" });
      } catch {
        // The local session may already have ended.
      }
    }
    authPopup?.close();
    authDialog.close();
    await loadAccounts().catch(() => {});
  }

  function selectedSessionIds() {
    return [...selectedSessions];
  }

  async function exportSelectedSessions() {
    if (busy || sessionTrashMode || !selectedSessions.size) return;
    setBusy(true, `正在导出 ${selectedSessions.size} 个会话…`);
    try {
      const payload = await api("/api/sessions/export", {
        method: "POST",
        body: { ids: selectedSessionIds() }
      });
      const blob = new Blob([JSON.stringify(payload.bundle)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `ai-switch-codex-sessions-${stamp}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      setStatus(`已导出 ${selectedSessions.size} 个会话。`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function moveOrRestoreSelectedSessions() {
    if (busy || !selectedSessions.size) return;
    if (sessionTrashMode) {
      setBusy(true, `正在恢复 ${selectedSessions.size} 个会话…`);
      try {
        const payload = await api("/api/sessions/restore", {
          method: "POST",
          body: { keys: selectedSessionIds() }
        });
        await Promise.all([loadSessions(), loadSessionTrash()]);
        setStatus(`已恢复 ${payload.restored} 个会话。`, "success");
      } catch (error) {
        setStatus(error.message, "error");
      } finally {
        setBusy(false);
      }
      return;
    }
    const count = selectedSessions.size;
    if (!window.confirm(`把选中的 ${count} 个会话移到 AI Switch 废纸篓？\n\n可以随时恢复，不会立即永久删除。若其中有正在进行的任务，请先等待任务结束。`)) return;
    setBusy(true, `正在移动 ${count} 个会话…`);
    try {
      const payload = await api("/api/sessions/trash", {
        method: "POST",
        body: { ids: selectedSessionIds() }
      });
      await loadSessions();
      setStatus(`已将 ${payload.moved} 个会话移到废纸篓。`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function importSessionFile(file) {
    if (!file || busy) return;
    if (file.size > 180 * 1024 * 1024) {
      setStatus("会话导出文件不能超过 180 MB。", "error");
      return;
    }
    setBusy(true, `正在导入 ${file.name}…`);
    try {
      const bundle = JSON.parse(await file.text());
      const payload = await api("/api/sessions/import", {
        method: "POST",
        body: { bundle }
      });
      await loadSessions();
      setStatus(`已导入 ${payload.imported} 个会话，跳过 ${payload.skipped} 个已有会话。`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      sessionImportFile.value = "";
      setBusy(false);
    }
  }

  async function repairSessionVisibility() {
    if (busy || sessionTrashMode) return;
    setBusy(true, "正在核对会话索引…");
    try {
      const payload = await api("/api/sessions/repair", { method: "POST" });
      await loadSessions();
      setStatus(
        payload.repaired ? `已修复 ${payload.repaired} 个缺失索引的会话。` : "会话索引完整，无需修复。",
        "success"
      );
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  for (const item of primaryNavItems) {
    item.addEventListener("click", () => {
      closeManagementPage();
      switchView(item.dataset.view);
    });
  }
  for (const tab of localTabs) {
    tab.addEventListener("click", () => {
      for (const item of localTabs) item.classList.toggle("active", item === tab);
      for (const panel of localPanels) panel.hidden = panel.dataset.localPanel !== tab.dataset.localTab;
    });
  }
  refreshAuthCenterButton.addEventListener("click", async () => {
    await loadAccounts();
    renderAuthCenter();
    showToast("授权状态已从本机账户库重新载入");
  });
  createBackupButton.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true, "正在创建本机完整备份…");
    try {
      const payload = await api("/api/local/backups", { method: "POST", body: { reason: "manual" } });
      localBackups.unshift(payload.backup);
      renderBackups();
      showToast("本机备份已创建");
    } catch (error) { showToast(error.message, "error"); }
    finally { setBusy(false); }
  });
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !projectForm.reportValidity()) return;
    try {
      const payload = await api("/api/local/projects", {
        method: "POST",
        body: { name: projectName.value, accountId: projectAccount.value || null, reasoningEffort: projectReasoning.value || null }
      });
      localProjects.push(payload.project);
      projectForm.reset();
      renderProjects();
      showToast("项目方案已保存在本机");
    } catch (error) { showToast(error.message, "error"); }
  });
  refreshExtensionsButton.addEventListener("click", async () => {
    try {
      const payload = await api("/api/local/extensions");
      localExtensions = payload.extensions || [];
      renderExtensions();
      showToast("本地扩展已重新扫描");
    } catch (error) { showToast(error.message, "error"); }
  });
  exportDiagnosticsButton.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true, "正在生成脱敏诊断文件…");
    try {
      const payload = await api("/api/local/diagnostics", { method: "POST" });
      if (isDesktopHost) window.chrome.webview.postMessage("open-diagnostics");
      showToast(`诊断文件已生成：${payload.name}`);
    } catch (error) { showToast(error.message, "error"); }
    finally { setBusy(false); }
  });
  appVersionButton.addEventListener("click", async () => {
    renderUpdateStatus();
    updateDialog.showModal();
    if (["idle", "error"].includes(updateStatus?.status)) await checkForUpdate();
  });
  closeUpdateDialogButton.addEventListener("click", () => updateDialog.close());
  checkUpdateButton.addEventListener("click", checkForUpdate);
  downloadUpdateButton.addEventListener("click", downloadUpdate);
  applyUpdateButton.addEventListener("click", applyUpdate);
  sessionSearch.addEventListener("input", () => {
    selectedSessions.clear();
    renderSessions();
  });
  sessionClearSearch.addEventListener("click", () => {
    sessionSearch.value = "";
    selectedSessions.clear();
    renderSessions();
    sessionSearch.focus();
  });
  sessionType.addEventListener("change", () => {
    selectedSessions.clear();
    renderSessions();
  });
  sessionSelectAll.addEventListener("change", () => {
    const visible = sessionTrashMode ? sessionTrashItems : filteredSessions();
    for (const item of visible) {
      const key = sessionTrashMode ? item.trashKey : item.id;
      if (sessionSelectAll.checked) selectedSessions.add(key);
      else selectedSessions.delete(key);
    }
    renderSessions();
  });
  sessionExportButton.addEventListener("click", exportSelectedSessions);
  sessionTrashButton.addEventListener("click", moveOrRestoreSelectedSessions);
  sessionImportButton.addEventListener("click", () => sessionImportFile.click());
  sessionImportFile.addEventListener("change", () => importSessionFile(sessionImportFile.files?.[0]));
  sessionRepairButton.addEventListener("click", repairSessionVisibility);
  sessionTrashViewButton.addEventListener("click", async () => {
    if (busy) return;
    sessionTrashMode = !sessionTrashMode;
    selectedSessions.clear();
    if (sessionTrashMode) {
      setStatus("正在读取会话废纸篓…");
      try {
        await loadSessionTrash();
        setStatus("");
      } catch (error) {
        sessionTrashMode = false;
        setStatus(error.message, "error");
      }
    } else {
      renderSessions();
      setStatus("");
    }
  });
  sessionRefreshButton.addEventListener("click", async () => {
    if (busy) return;
    setBusy(true, "正在刷新本机会话…");
    try {
      if (sessionTrashMode) await loadSessionTrash();
      else await loadSessions();
      setStatus("会话列表已刷新。", "success");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  });

  addButton.addEventListener("click", openApiPage);
  emptyAddButton.addEventListener("click", openApiPage);
  openManagementPageButton.addEventListener("click", openManagementPage);
  backManagementPageButton.addEventListener("click", returnFromManagementToAccounts);
  backSessionsToManagementButton.addEventListener("click", openManagementPage);
  backLocalToManagementButton.addEventListener("click", openManagementPage);
  addWithOauthButton.addEventListener("click", () => {
    closeApiPage();
    beginAuthorization();
  });
  importCurrentButton.addEventListener("click", importCurrentAccount);
  for (const button of apiProviderButtons) {
    button.addEventListener("click", () => selectApiProvider(button.dataset.provider));
  }
  apiBaseUrlInput.addEventListener("input", clearApiFormError);
  apiKeyInput.addEventListener("input", clearApiFormError);
  toggleApiKeyButton.addEventListener("click", () => {
    const reveal = apiKeyInput.type === "password";
    apiKeyInput.type = reveal ? "text" : "password";
    toggleApiKeyButton.textContent = reveal ? "隐藏" : "显示";
  });
  apiAccountForm.addEventListener("submit", saveApiAccount);
  backApiPageButton.addEventListener("click", closeApiPage);
  cancelApiAccountButton.addEventListener("click", closeApiPage);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !managementPage.hidden && !busy) {
      event.preventDefault();
      returnFromManagementToAccounts();
    } else if (event.key === "Escape" && !apiPage.hidden && !busy) {
      event.preventDefault();
      closeApiPage();
    } else if (event.key === "Escape" && activeView !== "accounts" && !busy) {
      event.preventDefault();
      openManagementPage();
    }
  });
  authDialog.addEventListener("cancel", (event) => event.preventDefault());
  cancelAuthButton.addEventListener("click", cancelAuthorization);
  resetDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeResetDialog();
  });
  cancelResetButton.addEventListener("click", closeResetDialog);
  confirmResetButton.addEventListener("click", confirmResetUsage);
  queryAllButton.addEventListener("click", queryAll);
  reloadButton.addEventListener("click", () => {
    loadAccounts()
      .then(() => setStatus("本地数据已重新载入。", "success"))
      .catch((error) => setStatus(error.message, "error"));
  });
  openLogsButton.addEventListener("click", () => {
    if (isDesktopHost) window.chrome.webview.postMessage("open-logs");
    else showToast("诊断日志位于本机 CodexQuotaManager/logs 目录");
  });
  clearAccountsButton.addEventListener("click", async () => {
    if (busy) return;
    const confirmed = window.confirm(
      "清除全部账户？\n\n这会删除 AI Switch 保存的所有账户凭证，且无法撤销。以后使用必须重新授权。"
    );
    if (!confirmed) return;
    setBusy(true, "正在注销并清除全部账户…");
    try {
      const result = await api("/api/clear-accounts", { method: "POST" });
      accounts = [];
      selectedAccountId = null;
      render();
      setStatus(`已清除 ${result.removed} 个账户及其本地凭证。`, "success");
      showToast("全部账户凭证已清除");
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  });
  shutdownButton.addEventListener("click", async () => {
    if (!window.confirm("退出客户端？已保存的账户不会被删除。")) return;
    try {
      await api("/api/shutdown", { method: "POST" });
      if (isDesktopHost) {
        window.chrome.webview.postMessage("close-app");
        return;
      }
      document.body.replaceChildren(
        element("main", "closed-screen", "本机管理器已退出，可以关闭此页面。")
      );
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  if (!localToken) {
    setStatus("会话地址无效，请重新双击启动管理器。", "error");
    addButton.disabled = true;
    emptyAddButton.disabled = true;
    queryAllButton.disabled = true;
    return;
  }

  loadAppInfo().catch(() => {});
  loadAccounts()
    .then(() => {
      if (requestedView === "sessions") switchView("sessions");
    })
    .catch((error) => {
      accountSkeleton.hidden = true;
      emptyState.hidden = false;
      setStatus(error.message, "error");
    });
})();
