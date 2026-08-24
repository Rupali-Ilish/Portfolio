(function () {
  "use strict";

  var THEME_KEY = "portfolio-theme";
  var MESSAGES_KEY = "portfolioMessages";
  var AUTH_KEY = "adminLoggedIn";

  var ADMIN_USERNAME = "admin";
  var ADMIN_PASSWORD = "admin123";

  var currentStatusFilter = "all";
  var currentSearchTerm = "";
  var currentModalId = null;

  //   theme
  function initTheme() {
    var themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;
    updateThemeUI(document.documentElement.classList.contains("dark-theme"));
    themeToggle.addEventListener("click", function () {
      var isDark = document.documentElement.classList.toggle("dark-theme");
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      updateThemeUI(isDark);
    });
  }

  function updateThemeUI(isDark) {
    var themeToggle = document.getElementById("themeToggle");
    var statusTheme = document.getElementById("statusTheme");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );
    }
    if (statusTheme)
      statusTheme.textContent = "theme: " + (isDark ? "dark" : "light");
  }

  //   auth
  function checkAuth() {
    if (sessionStorage.getItem(AUTH_KEY) === "true") {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    document.getElementById("loginScreen").hidden = false;
    document.getElementById("dashboard").hidden = true;
  }

  function showDashboard() {
    document.getElementById("loginScreen").hidden = true;
    document.getElementById("dashboard").hidden = false;
    refreshDashboard();
  }

  function initLoginForm() {
    var form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var username = document.getElementById("usernameInput").value.trim();
      var password = document.getElementById("passwordInput").value;
      var errorEl = document.getElementById("loginError");

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        errorEl.textContent = "";
        sessionStorage.setItem(AUTH_KEY, "true");
        form.reset();
        showDashboard();
      } else {
        errorEl.textContent = "Incorrect username or password.";
      }
    });
  }

  function initLogout() {
    var btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      sessionStorage.removeItem(AUTH_KEY);
      showLogin();
    });
  }

  //   msg storage
  function getMessages() {
    try {
      var raw = localStorage.getItem(MESSAGES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Could not read stored messages:", err);
      return [];
    }
  }

  function setMessages(messages) {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      return true;
    } catch (err) {
      console.error("Could not save messages:", err);
      return false;
    }
  }

  //   stats
  function updateMessageStats(messages) {
    var total = messages.length;
    var unread = messages.filter(function (m) {
      return m.status === "unread";
    }).length;
    var read = total - unread;

    document.getElementById("statTotal").textContent = String(total);
    document.getElementById("statUnread").textContent = String(unread);
    document.getElementById("statRead").textContent = String(read);
  }

  //   filter and serach
  function getFilteredMessages() {
    var term = currentSearchTerm.trim().toLowerCase();

    return getMessages().filter(function (msg) {
      var matchesStatus =
        currentStatusFilter === "all" || msg.status === currentStatusFilter;
      var matchesSearch =
        !term ||
        msg.name.toLowerCase().indexOf(term) !== -1 ||
        msg.email.toLowerCase().indexOf(term) !== -1;
      return matchesStatus && matchesSearch;
    });
  }

  function initToolbar() {
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        currentSearchTerm = searchInput.value;
        renderMessages(getFilteredMessages());
      });
    }

    document
      .querySelectorAll(".toolbar-filters .filter-btn")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          document
            .querySelectorAll(".toolbar-filters .filter-btn")
            .forEach(function (b) {
              b.classList.toggle("active", b === btn);
            });
          currentStatusFilter = btn.dataset.status;
          renderMessages(getFilteredMessages());
        });
      });

    var deleteAllBtn = document.getElementById("deleteAllBtn");
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", deleteAllMessages);
    }
  }

  function renderMessages(messages) {
    var listEl = document.getElementById("messageList");
    var emptyState = document.getElementById("emptyState");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (!messages.length) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    messages.forEach(function (msg) {
      listEl.appendChild(buildMessageRow(msg));
    });
  }

  function buildMessageRow(msg) {
    var row = document.createElement("div");
    row.className =
      "message-row" + (msg.status === "unread" ? " is-unread" : "");
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.dataset.id = msg.id;

    var dot = document.createElement("span");
    dot.className = "status-dot";
    row.appendChild(dot);

    var main = document.createElement("div");
    main.className = "message-main";

    var nameEl = document.createElement("p");
    nameEl.className = "message-name";
    nameEl.textContent = msg.name;

    var emailEl = document.createElement("p");
    emailEl.className = "message-email";
    emailEl.textContent = msg.email;

    var previewEl = document.createElement("p");
    previewEl.className = "message-preview";
    previewEl.textContent = msg.message;

    main.appendChild(nameEl);
    main.appendChild(emailEl);
    main.appendChild(previewEl);
    row.appendChild(main);

    var dateEl = document.createElement("span");
    dateEl.className = "message-date";
    dateEl.textContent = msg.date;
    row.appendChild(dateEl);

    var actions = document.createElement("div");
    actions.className = "message-row-actions";

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn";
    deleteBtn.setAttribute("aria-label", "Delete message from " + msg.name);
    deleteBtn.textContent = "\u2715";
    deleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deleteMessage(msg.id);
    });
    actions.appendChild(deleteBtn);
    row.appendChild(actions);

    row.addEventListener("click", function () {
      openMessageModal(msg.id);
    });
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMessageModal(msg.id);
      }
    });

    return row;
  }

  function refreshDashboard() {
    var allMessages = getMessages();
    updateMessageStats(allMessages);
    renderMessages(getFilteredMessages());
  }

  //   msg read, set, delete
  function markAsRead(id) {
    setMessageStatus(id, "read");
  }
  function markAsUnread(id) {
    setMessageStatus(id, "unread");
  }

  function setMessageStatus(id, status) {
    var messages = getMessages();
    var msg = messages.find(function (m) {
      return m.id === id;
    });
    if (!msg) return;

    msg.status = status;
    setMessages(messages);
    refreshDashboard();
    showToast(
      status === "read" ? "Marked as read." : "Marked as unread.",
      "success",
    );

    var toggleBtn = document.getElementById("modalToggleRead");
    if (toggleBtn && currentModalId === id) {
      toggleBtn.textContent =
        status === "unread" ? "Mark as Read" : "Mark as Unread";
    }
  }

  function deleteMessage(id) {
    var messages = getMessages().filter(function (m) {
      return m.id !== id;
    });
    setMessages(messages);
    refreshDashboard();
    showToast("Message deleted.", "success");
    if (currentModalId === id) closeModal();
  }

  function deleteAllMessages() {
    var messages = getMessages();
    if (!messages.length) {
      showToast("There are no messages to delete.", "error");
      return;
    }
    var confirmed = window.confirm(
      "Delete all " + messages.length + " message(s)? This cannot be undone.",
    );
    if (!confirmed) return;

    setMessages([]);
    refreshDashboard();
    showToast("All messages deleted.", "success");
  }

  //   details
  function openMessageModal(id) {
    var msg = getMessages().find(function (m) {
      return m.id === id;
    });
    if (!msg) return;

    currentModalId = id;

    document.getElementById("modalDate").textContent = "// " + msg.date;
    document.getElementById("modalName").textContent = msg.name;
    document.getElementById("modalEmail").textContent = msg.email;
    document.getElementById("modalMessage").textContent = msg.message;

    var toggleBtn = document.getElementById("modalToggleRead");
    toggleBtn.textContent =
      msg.status === "unread" ? "Mark as Read" : "Mark as Unread";

    document.getElementById("modalOverlay").hidden = false;
  }

  function closeModal() {
    document.getElementById("modalOverlay").hidden = true;
    currentModalId = null;
  }

  function initModal() {
    var overlay = document.getElementById("modalOverlay");
    var closeBtn = document.getElementById("modalClose");
    var toggleBtn = document.getElementById("modalToggleRead");
    var deleteBtn = document.getElementById("modalDelete");
    if (!overlay) return;

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) closeModal();
    });

    toggleBtn.addEventListener("click", function () {
      var msg = getMessages().find(function (m) {
        return m.id === currentModalId;
      });
      if (!msg) return;
      if (msg.status === "unread") {
        markAsRead(msg.id);
      } else {
        markAsUnread(msg.id);
      }
    });

    deleteBtn.addEventListener("click", function () {
      if (currentModalId) deleteMessage(currentModalId);
    });
  }

  //   notifications
  function showToast(message, type) {
    var container = document.getElementById("toastContainer");
    if (!container) return;

    var toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " toast-error" : "");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  //   init
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initLoginForm();
    initLogout();
    initToolbar();
    initModal();
    checkAuth();
  });
})();
