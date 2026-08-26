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

  /* Sticky header border ----------------------------------------------- */
  function initScrollChrome() {
    var header = document.getElementById("siteHeader");

    var hero = document.querySelector(".hero");

    function update() {
      // Flip the bar to its light state once the dark hero is nearly past,
      // not after a few pixels, or light-on-light text would be unreadable.
      if (header) {
        var trigger = hero ? hero.offsetHeight - header.offsetHeight - 8 : 12;
        header.classList.toggle("is-stuck", window.scrollY > trigger);
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

  /* Skill provenance --------------------------------------------------
     Clicking a skill writes the resume line behind it into the panel above
     the grid. The evidence is held in data- attributes on each button, so a
     skill and its source are edited in the same place in index.html. */
  function initSkillProvenance() {
    var panel = document.getElementById("provPanel");
    var inner = document.getElementById("provInner");
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".tag[data-skill]"));
    if (!panel || !inner || !buttons.length) return;

    var hint = inner.innerHTML;   // keep the starting message to restore later
    var current = null;

    function clearCurrent() {
      buttons.forEach(function (b) { b.removeAttribute("aria-current"); });
    }

    function reset() {
      current = null;
      clearCurrent();
      inner.innerHTML = hint;
    }

    function show(btn) {
      current = btn;
      clearCurrent();
      btn.setAttribute("aria-current", "true");

      var role = btn.getAttribute("data-role") || "";
      var meta = btn.getAttribute("data-org") + (role ? " \u00b7 " + role : "");

      // Built with DOM methods rather than innerHTML so the resume text is
      // inserted as text and can never be parsed as markup.
      var frag = document.createDocumentFragment();

      var h = document.createElement("p");
      h.className = "prov__skill";
      h.textContent = btn.getAttribute("data-skill");
      frag.appendChild(h);

      var m = document.createElement("p");
      m.className = "prov__meta";
      m.textContent = meta;
      frag.appendChild(m);

      var q = document.createElement("blockquote");
      q.className = "prov__quote";
      q.textContent = "\u201c" + btn.getAttribute("data-quote") + "\u201d";
      frag.appendChild(q);

      var s = document.createElement("p");
      s.className = "prov__src";
      s.textContent = "Source: resume, " + btn.getAttribute("data-section") + " section";
      frag.appendChild(s);

      inner.innerHTML = "";
      inner.appendChild(frag);
      // Restart the fade so each new selection is visibly a change.
      inner.style.animation = "none";
      void inner.offsetWidth;
      inner.style.animation = "";

      // On narrow screens the panel is static, so bring it into view.
      if (window.innerWidth <= 620) {
        var top = panel.getBoundingClientRect().top;
        if (top < 60 || top > window.innerHeight - 120) {
          panel.scrollIntoView({ behavior: motionQuery.matches ? "auto" : "smooth", block: "center" });
        }
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (current === btn) reset();      // clicking the same skill closes it
        else show(btn);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && current) {
        var focused = current;
        reset();
        focused.focus();
      }
    });
  }

  /* Animated hero backdrop ---------------------------------------------
     Decorative. The hero reads exactly the same if p5 or Vanta never load,
     so every failure path here just leaves the static hero in place. */
  function initHeroBackdrop() {
    var el = document.getElementById("heroCanvas");
    if (!el) return;

    // Never run it for someone who has asked the OS to reduce motion.
    if (motionQuery.matches) return;

    // Respect metered and slow connections: p5 is about a megabyte, which is
    // not worth spending on decoration.
    var conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""))) return;

    var paused = false;        // the effect's frame loop has been cancelled
    var pendingBuild = false;  // a rebuild is owed once the hero is on screen
    var onScreen = true;
    var lastW = 0, lastH = 0;

    function build() {
      try {
        window.__heroVanta = window.VANTA.TOPOLOGY({
          el: el,
          mouseControls: true,
          touchControls: false,   // leave vertical scrolling alone on phones
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x5fb489,        // --pine-light, so the strands read on ink
          backgroundColor: 0x131a15  // must match --ink exactly or the edge seams
        });
      } catch (e) {
        return;  // a WebGL/canvas failure must not take the rest of the page down
      }
      el.classList.add("is-ready");
      lastW = el.offsetWidth;
      lastH = el.offsetHeight;
      paused = false;
      pendingBuild = false;
    }

    function teardown() {
      var v = window.__heroVanta;
      window.__heroVanta = null;
      if (v && typeof v.destroy === "function") {
        try { v.destroy(); } catch (e) { /* nothing useful left to do */ }
      }
    }

    var tries = 0;
    (function waitForVanta() {
      if (window.VANTA && window.VANTA.TOPOLOGY && window.p5) { build(); return; }
      // Deferred scripts land after DOMContentLoaded; poll briefly, then stop.
      if (++tries < 60) window.setTimeout(waitForVanta, 100);
    })();

    // Rebuild the effect when the hero actually changes size.
    //
    // Vanta's topology sketch reads the element's width and height once, in
    // onInit, and builds its particle grid from them. resize() only passes the
    // new size to p5.resizeCanvas, which reallocates the drawing buffer -- it
    // cannot regenerate that grid, and onInit never runs again. So after a
    // resize the pattern is still laid out for the old dimensions and no
    // longer fits the canvas. Destroying and re-creating is the only way to
    // get a pattern that matches.
    //
    // Debounced, because dragging a window edge fires this continuously, and
    // gated on a real change so that a phone's address bar sliding away (a
    // height-only change of a few dozen pixels) does not throw the effect out.
    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (!window.__heroVanta && !pendingBuild) return;
        var w = el.offsetWidth, h = el.offsetHeight;
        if (w === lastW && Math.abs(h - lastH) < 120) return;
        teardown();
        lastW = w;
        lastH = h;
        // Rebuilding off screen would start a loop nobody can see, so defer it.
        if (onScreen) build(); else pendingBuild = true;
      }, 250);
    });

    // Stop the animation while the hero is off screen, so it is not burning
    // CPU and battery for someone reading the rest of the page.
    //
    // Two traps here, both learned the hard way:
    //
    //   1. This build of Vanta has no pause()/play(). It does keep the handle
    //      of the frame it scheduled on .req, so cancelling that stops the
    //      loop, and calling .animationLoop() re-enters it.
    //   2. Do NOT call .resize() to wake it up. resize() reallocates the p5
    //      drawing buffer, which wipes the pattern the effect has built up.
    //      Calling it on every scroll-back visibly degraded the effect.
    //
    // .animationLoop() re-schedules itself, so calling it while the loop is
    // already running leaves two loops racing. Hence the explicit flag.
    if ("IntersectionObserver" in window &&
        typeof window.requestAnimationFrame === "function") {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          onScreen = entry.isIntersecting;

          if (onScreen && pendingBuild) { build(); return; }

          var v = window.__heroVanta;
          if (!v || typeof v.animationLoop !== "function") return;

          if (onScreen) {
            if (!paused) return;
            paused = false;
            try { v.animationLoop(); } catch (e) { /* leave it stopped */ }
          } else {
            if (paused) return;
            paused = true;
            try { window.cancelAnimationFrame(v.req); } catch (e) { paused = false; }
          }
        });
      }, { threshold: 0 });
      io.observe(el);
    }
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
  initTilt();
  initHeroBackdrop();
  initSkillProvenance();
  initContactForm();
  initYear();
})();
