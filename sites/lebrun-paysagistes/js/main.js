/* Lebrun Paysagistes — interactions */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header : ombre au défilement ---------- */
  var header = document.querySelector("[data-header]");
  var sentinel = document.querySelector("[data-header-sentinel]");
  if (header && sentinel && "IntersectionObserver" in window) {
    // Sur iPhone, l'en-tête se colle sous la barre d'état : on décale la zone observée d'autant.
    var inset = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    new IntersectionObserver(
      function (entries) {
        header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      },
      { rootMargin: -inset + "px 0px 0px 0px" }
    ).observe(sentinel);
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("mobile-menu");
  var closeTimer = null;

  function openMenu() {
    clearTimeout(closeTimer);
    menu.hidden = false;
    // Laisse le navigateur peindre l'état initial avant d'animer.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        menu.classList.add("is-open");
      });
    });
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    var firstLink = menu.querySelector("nav a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    closeTimer = setTimeout(function () {
      menu.hidden = true;
    }, reduceMotion ? 0 : 380);
    if (returnFocus) toggle.focus({ preventScroll: true });
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
      else openMenu();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("[data-menu-close]")) closeMenu(true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    window.matchMedia("(min-width: 1141px)").addEventListener("change", function (mq) {
      if (mq.matches && toggle.getAttribute("aria-expanded") === "true") closeMenu(false);
    });
  }

  /* ---------- Apparition au défilement ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Heure de Paris ---------- */
  function parisNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      month: "numeric",
      hour12: false
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.find(function (x) {
        return x.type === type;
      });
      return p ? p.value : "";
    };
    var days = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    return {
      day: days[get("weekday")],
      minutes: parseInt(get("hour"), 10) % 24 * 60 + parseInt(get("minute"), 10),
      month: parseInt(get("month"), 10)
    };
  }

  var now = parisNow();

  /* ---------- Saison en cours ---------- */
  var seasonOf = function (m) {
    if (m >= 3 && m <= 5) return "printemps";
    if (m >= 6 && m <= 8) return "ete";
    if (m >= 9 && m <= 11) return "automne";
    return "hiver";
  };
  var currentSeason = document.querySelector('[data-season="' + seasonOf(now.month) + '"]');
  if (currentSeason) currentSeason.classList.add("is-current");

  /* ---------- Calendrier : mois en cours ---------- */
  document.querySelectorAll('[data-month="' + now.month + '"]').forEach(function (el) {
    el.classList.add("is-now");
  });

  /* ---------- Ouvert / fermé ---------- */
  var OPEN = 8 * 60;
  var CLOSE = 17 * 60;
  var isWeekday = now.day >= 1 && now.day <= 5;
  var isOpen = isWeekday && now.minutes >= OPEN && now.minutes < CLOSE;

  function nextOpening() {
    if (isWeekday && now.minutes < OPEN) return "ouvre aujourd’hui à 8 h";
    if (now.day >= 1 && now.day <= 4) return "ouvre demain à 8 h";
    return "ouvre lundi à 8 h";
  }

  document.querySelectorAll("[data-open-status]").forEach(function (el) {
    el.textContent = isOpen ? "Ouvert · jusqu’à 17 h" : "Fermé · " + nextOpening();
    el.classList.toggle("is-open", isOpen);
  });

  document.querySelectorAll('[data-day="' + now.day + '"]').forEach(function (el) {
    el.classList.add("is-today");
  });

  /* ---------- Barre d'appel mobile : se masque sur le pied de page ---------- */
  var callBar = document.querySelector("[data-call-bar]");
  var footer = document.querySelector(".site-footer");
  if (callBar && footer && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      callBar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }).observe(footer);
  }

  /* ---------- Année ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Formulaire de devis (démo) ---------- */
  var form = document.querySelector("[data-quote-form]");
  if (form) {
    var success = document.querySelector("[data-form-success]");

    var showError = function (input, message) {
      var holder = input.closest(".field");
      var error = holder && holder.querySelector(".field-error");
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) {
        error.textContent = message || "";
        error.hidden = !message;
      }
    };

    var validate = function () {
      var ok = true;
      var first = null;
      form.querySelectorAll("[data-required]").forEach(function (input) {
        var value = input.value.trim();
        var message = "";
        if (!value) message = "Ce champ est nécessaire pour vous répondre.";
        else if (input.type === "tel" && value.replace(/\D/g, "").length < 10)
          message = "Vérifiez le numéro : 10 chiffres attendus.";
        else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          message = "Cette adresse e-mail semble incomplète.";
        showError(input, message);
        if (message) {
          ok = false;
          if (!first) first = input;
        }
      });
      if (first) first.focus();
      return ok;
    };

    form.querySelectorAll("[data-required]").forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") showError(input, "");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var name = (form.querySelector("#nom").value || "").trim().split(" ")[0];
      var target = success.querySelector("[data-success-name]");
      if (target) target.textContent = name ? ", " + name : "";
      form.hidden = true;
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus();
    });
  }
})();
