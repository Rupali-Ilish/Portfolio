(function () {
  "use strict";

  var THEME_KEY = "portfolio-theme";
  var MESSAGES_KEY = "portfolioMessages";

  var ROLES = [
    "CSE Student",
    "Competitive Programmer",
    "Problem Solver",
    "Future Software Engineer",
    "Business Owner"
  ];

  var SECTION_LABELS = {
    home: "hero.js",
    about: "about.md",
    skills: "skills.json",
    journey: "journey.log",
    projects: "projects/",
    achievements: "achievements.yml",
    "currently-learning": "now.txt",
    contact: "contact",
  };

  // theme toggle
  function initTheme() {
    var themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;
    updateThemeUI(document.documentElement.classList.contains("dark-theme"));
    themeToggle.addEventListener("click", toggleTheme);
  }

  function toggleTheme() {
    var isDark = document.documentElement.classList.toggle("dark-theme");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    updateThemeUI(isDark);
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

  // mobile menu
  function initMobileMenu() {
    var menuToggle = document.getElementById("menuToggle");
    var mobileMenu = document.getElementById("mobileMenu");
    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu",
      );
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // viewing option
  function initSectionTracking() {
    var sections = document.querySelectorAll("main .section[id]");
    var tabLinks = document.querySelectorAll(".tab-link");
    var mobileLinks = document.querySelectorAll(".mobile-link");
    var statusFile = document.getElementById("statusFile");
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          setActiveLink(tabLinks, id);
          setActiveLink(mobileLinks, id);
          if (statusFile)
            statusFile.textContent = "viewing: " + (SECTION_LABELS[id] || id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function setActiveLink(links, sectionId) {
    links.forEach(function (link) {
      link.classList.toggle("active", link.dataset.section === sectionId);
    });
  }

  // line number
  function initLineGutter() {
    var gutter = document.getElementById("lineGutter");
    if (!gutter) return;

    var totalLines = 160;
    var lineHeight = 24;
    var inner = document.createElement("div");
    inner.className = "line-gutter-inner";

    var markup = "";
    for (var i = 1; i <= totalLines; i++) {
      markup += "<span>" + String(i).padStart(3, "0") + "</span>";
    }
    inner.innerHTML = markup;
    gutter.appendChild(inner);

    var maxTranslate = Math.max(
      totalLines * lineHeight - window.innerHeight,
      0,
    );
    var ticking = false;

    function update() {
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      var translate = -Math.min(progress * maxTranslate, maxTranslate);
      inner.style.transform = "translateY(" + translate + "px)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );

    update();
  }

  // terminal er role changer
  function initRoleRotator() {
    var el = document.getElementById("roleText");
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = ROLES[0];
      return;
    }

    var roleIndex = 0;
    var charIndex = ROLES[0].length;
    var isDeleting = true;
    var TYPING_SPEED = 70;
    var DELETING_SPEED = 40;
    var PAUSE_BEFORE_DELETE = 1700;
    var PAUSE_BEFORE_TYPE = 400;

    function tick() {
      var currentRole = ROLES[roleIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = currentRole.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % ROLES.length;
          setTimeout(tick, PAUSE_BEFORE_TYPE);
          return;
        }
        setTimeout(tick, DELETING_SPEED);
      } else {
        charIndex++;
        el.textContent = currentRole.slice(0, charIndex);
        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(tick, PAUSE_BEFORE_DELETE);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      }
    }

    setTimeout(tick, PAUSE_BEFORE_DELETE);
  }

  // scroll reveal
  function initScrollReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // skill tabs filter
  function initSkillsTabs() {
    const tabButtons = document.querySelectorAll(".skill-tab-btn");
    const tabPanels = document.querySelectorAll(".skill-list");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");

        // Update button styling
        tabButtons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");

        // Filter the panels
        tabPanels.forEach((panel) => {
          if (targetTab === "all") {
            panel.removeAttribute("hidden");
          } else {
            if (panel.id === `panel-${targetTab}`) {
              panel.removeAttribute("hidden");
            } else {
              panel.setAttribute("hidden", "");
            }
          }
        });
      });
    });
  }

  // project filtering
  function initProjectFilter() {
    var filterButtons = document.querySelectorAll(
      ".project-filters .filter-btn",
    );
    var cards = document.querySelectorAll(".project-card");
    var emptyState = document.getElementById("filterEmpty");
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });

        var filter = btn.dataset.filter;
        var visibleCount = 0;

        cards.forEach(function (card) {
          var categories = (card.dataset.category || "").split(" ");
          var show = filter === "all" || categories.indexOf(filter) !== -1;
          card.classList.toggle("is-hidden", !show);
          if (show) visibleCount++;
        });

        if (emptyState) emptyState.hidden = visibleCount !== 0;
      });
    });
  }

  // achivement counter
  function initCounters() {
    var counters = document.querySelectorAll(".achievement-number");
    if (!counters.length) return;

    var skipAnimation = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target, skipAnimation);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el, skipAnimation) {
    var target = parseInt(el.dataset.target, 10) || 0;
    var suffix = el.dataset.suffix || "";

    if (skipAnimation) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  // back to top button
  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("visible", window.scrollY > 480);
      },
      { passive: true },
    );

    btn.addEventListener("click", function () {
      var behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";
      window.scrollTo({ top: 0, behavior: behavior });
    });
  }

  // footer year
  function initFooterYear() {
    var el = document.getElementById("footerYear");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // message storage
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

  function generateMessageId() {
    return "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  function formatDateTime(date) {
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function saveMessage(name, email, message) {
    var messages = getMessages();
    messages.unshift({
      id: generateMessageId(),
      name: name,
      email: email,
      message: message,
      date: formatDateTime(new Date()),
      status: "unread",
    });
    return setMessages(messages);
  }

  // contact form
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var nameInput = document.getElementById("nameInput");
    var emailInput = document.getElementById("emailInput");
    var messageInput = document.getElementById("messageInput");
    var successBox = document.getElementById("formSuccess");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      successBox.hidden = true;

      var nameValue = nameInput.value.trim();
      var emailValue = emailInput.value.trim();
      var messageValue = messageInput.value.trim();

      var nameOk = validateField(
        nameInput,
        nameValue.length > 0,
        "Please enter your name.",
      );
      var emailOk = validateField(
        emailInput,
        isValidEmail(emailValue),
        "Please enter a valid email address.",
      );
      var messageOk = validateField(
        messageInput,
        messageValue.length > 0,
        "Please write a message.",
      );

      if (!nameOk || !emailOk || !messageOk) {
        showToast("Please fix the errors before sending.", "error");
        return;
      }

      var saved = saveMessage(nameValue, emailValue, messageValue);
      if (saved) {
        form.reset();
        successBox.hidden = false;
        showToast("Message sent successfully.", "success");
      } else {
        showToast(
          "Something went wrong saving your message. Please try again.",
          "error",
        );
      }
    });

    [nameInput, emailInput, messageInput].forEach(function (input) {
      input.addEventListener("input", function () {
        clearFieldError(input);
      });
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateField(input, isValid, message) {
    var field = input.closest(".form-field");
    var errorEl = field ? field.querySelector(".error-message") : null;

    if (!isValid) {
      if (errorEl) errorEl.textContent = message;
      if (field) field.classList.add("field-invalid");
      return false;
    }

    clearFieldError(input);
    return true;
  }

  function clearFieldError(input) {
    var field = input.closest(".form-field");
    var errorEl = field ? field.querySelector(".error-message") : null;
    if (errorEl) errorEl.textContent = "";
    if (field) field.classList.remove("field-invalid");
  }

  // notifications
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

  // init
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileMenu();
    initSectionTracking();
    initLineGutter();
    initRoleRotator();
    initScrollReveal();
    initSkillsTabs();
    initProjectFilter();
    initCounters();
    initBackToTop();
    initContactForm();
    initFooterYear();
  });
})();
