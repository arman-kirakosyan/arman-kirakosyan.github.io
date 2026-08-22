/* Arman Kirakosyan — site behaviour.
   Plain JavaScript, no libraries. Each function is independent and bails out
   if its element is missing, so removing a section from index.html will not
   break anything else. */

(function () {
  "use strict";

  // Live query object, not a cached boolean: the answer can change after load
  // (the visitor can switch the OS setting without reloading the page).
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;

  // True only for an actual mouse. Checked per event via e.pointerType rather
  // than a media query cached at load, which would be wrong for a tablet with
  // a mouse attached, or if the window's capabilities differ at load time.
  function isMouse(e) { return e.pointerType === "mouse" && !motionQuery.matches; }

  /* Mobile menu -------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setOpen(false);
    });
  }

  /* Sticky header border + scroll progress bar ------------------------- */
  function initScrollChrome() {
    var header = document.getElementById("siteHeader");
    var bar = document.getElementById("progress");

    function update() {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 12);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* Scroll reveal ------------------------------------------------------ */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) { showAll(); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings so a row of cards arrives in sequence, not as a block.
        var siblings = Array.prototype.slice.call(el.parentNode.children);
        var index = siblings.indexOf(el);
        el.style.setProperty("--d", Math.min(index, 5) * 90 + "ms");
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });

    // Safety net: this site is used for job applications, so content must
    // never be left invisible if the observer fails to fire for any reason.
    window.setTimeout(showAll, 2500);
  }

  /* Active nav link ---------------------------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links.map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    }).filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* Counting numbers in the stats band --------------------------------- */
  function initCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) return; // leave the final value in place

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);

        var target = parseInt(el.getAttribute("data-count"), 10);
        if (isNaN(target)) return;
        var start = performance.now();
        var duration = 1100;

        function frame(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(frame);
          else el.textContent = String(target);
        }
        el.textContent = "0";
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { observer.observe(n); });
  }

  /* Cards lean toward the pointer -------------------------------------- */
  function initTilt() {
    var MAX_DEG = 5;

    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        if (!isMouse(e)) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0 at left edge, 1 at right
        var py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", ((px - 0.5) * MAX_DEG).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * MAX_DEG).toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });

      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");   // slower transition on the way back
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* Buttons drift slightly toward the pointer -------------------------- */
  function initMagnetic() {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        if (!isMouse(e)) return;
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (dx * 0.15).toFixed(1) + "px," +
                                            (dy * 0.25).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* Contact form ------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var note = document.getElementById("formNote");
    var address = form.getAttribute("data-mailto");
    if (!address) return;

    function showError(field, message) {
      field.classList.add("has-error");
      if (field.querySelector(".field__error")) return;
      var p = document.createElement("p");
      p.className = "field__error";
      p.textContent = message;
      field.appendChild(p);
    }

    function clearErrors() {
      form.querySelectorAll(".field.has-error").forEach(function (field) {
        field.classList.remove("has-error");
        var msg = field.querySelector(".field__error");
        if (msg) msg.remove();
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var ok = true;

      if (!name) { showError(form.elements.name.closest(".field"), "Please add your name."); ok = false; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { showError(form.elements.email.closest(".field"), "Please add a valid email address."); ok = false; }
      if (!message) { showError(form.elements.message.closest(".field"), "Please add a message."); ok = false; }

      if (!ok) {
        if (note) note.textContent = "Please fix the highlighted fields.";
        return;
      }

      window.location.href = "mailto:" + address +
        "?subject=" + encodeURIComponent("Website enquiry from " + name) +
        "&body=" + encodeURIComponent(message + "\n\n—\n" + name + "\n" + email);

      if (note) note.textContent = "Opening your email app. If nothing happens, email " + address + " directly.";
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  initMobileMenu();
  initScrollChrome();
  initReveal();
  initScrollSpy();
  initCounters();
  initTilt();
  initMagnetic();
  initContactForm();
  initYear();
})();
