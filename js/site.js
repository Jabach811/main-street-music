/* Main Street Music — mobile nav + live store-hours status */

(function () {
  "use strict";

  window.msmReady = true;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.matchMedia("(max-width: 60rem)").matches) {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- store hours ----------
     Index 0 = Sunday. [open, close] in minutes past midnight, or null. */
  var TZ = "America/Los_Angeles";
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var SCHEDULE = [
    null,           // Sun — closed
    [660, 1200],    // Mon 11:00 – 8:00
    [660, 1200],    // Tue
    [660, 1200],    // Wed
    [660, 1200],    // Thu
    [660, 1080],    // Fri 11:00 – 6:00
    [600, 960]      // Sat 10:00 – 4:00
  ];

  function storeNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    }).formatToParts(new Date());

    var got = {};
    parts.forEach(function (p) { got[p.type] = p.value; });

    var abbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var hour = parseInt(got.hour, 10) % 24;

    return {
      day: abbr.indexOf(got.weekday),
      minutes: hour * 60 + parseInt(got.minute, 10)
    };
  }

  function clockLabel(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + " " + suffix;
  }

  function nextOpening(day) {
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (SCHEDULE[d]) {
        return {
          when: i === 1 ? "tomorrow" : DAY_NAMES[d],
          at: clockLabel(SCHEDULE[d][0])
        };
      }
    }
    return null;
  }

  function currentStatus() {
    var now = storeNow();
    if (now.day < 0) return null;

    var today = SCHEDULE[now.day];

    if (today && now.minutes >= today[0] && now.minutes < today[1]) {
      return {
        state: "open",
        label: "Open now",
        detail: "until " + clockLabel(today[1]),
        short: "Open until " + clockLabel(today[1])
      };
    }

    if (today && now.minutes < today[0]) {
      return {
        state: "closed",
        label: "Closed",
        detail: "opens today at " + clockLabel(today[0]),
        short: "Closed until " + clockLabel(today[0])
      };
    }

    var next = nextOpening(now.day);
    return {
      state: "closed",
      label: "Closed",
      detail: next ? "opens " + next.when + " at " + next.at : "",
      short: next ? "Closed until " + next.when : "Closed"
    };
  }

  function paintStatus() {
    var status = currentStatus();
    if (!status) return;

    document.querySelectorAll("[data-status]").forEach(function (el) {
      var dot = '<span class="status__dot" aria-hidden="true"></span>';
      el.setAttribute("data-state", status.state);
      el.hidden = false;

      if (el.getAttribute("data-status") === "compact") {
        el.innerHTML = dot + '<span class="status__label">' + status.short + "</span>";
        return;
      }

      el.innerHTML = dot +
        '<span class="status__label">' + status.label + "</span>" +
        (status.detail ? '<span class="status__text">' + status.detail + "</span>" : "");
    });
  }

  function paintToday() {
    var now = storeNow();
    if (now.day < 0) return;

    document.querySelectorAll("[data-day]").forEach(function (row) {
      var days = row.getAttribute("data-day").split(",").map(Number);
      if (days.indexOf(now.day) !== -1) row.setAttribute("data-today", "true");
    });
  }

  paintStatus();
  paintToday();
  setInterval(paintStatus, 60000);

  /* ---------- entrance reveals ---------- */
  var revealed = document.querySelectorAll(".reveal, .reveal-stagger");

  function revealAll() {
    revealed.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (!("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

    revealed.forEach(function (el) { io.observe(el); });

    /* if the observer never reports, show everything rather than hide it */
    setTimeout(function () { if (!fired) revealAll(); }, 2500);
  }

  /* ---------- header shadow once the page scrolls ---------- */
  var sentinel = document.querySelector("[data-header-sentinel]");
  var header = document.querySelector(".site-header");

  if (sentinel && header && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      header.setAttribute("data-stuck", String(!entries[0].isIntersecting));
    }).observe(sentinel);
  }

  /* ---------- dates that would otherwise go stale in the markup ---------- */
  var now = new Date();

  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(now.getFullYear());
  });

  /* store opened June 1993, so the anniversary lands mid-year */
  var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty"];
  var ones = ["", "-one", "-two", "-three", "-four", "-five", "-six", "-seven", "-eight", "-nine"];

  Array.prototype.forEach.call(document.querySelectorAll("[data-years-since]"), function (el) {
    var from = el.getAttribute("data-years-since").split("-");
    var n = now.getFullYear() - Number(from[0]);
    if (now.getMonth() + 1 < Number(from[1] || 1)) n -= 1;
    if (n < 20 || n > 69) return;
    el.textContent = tens[Math.floor(n / 10)] + ones[n % 10];
  });
})();
