/* ===========================================================================
   ARMAN KIRAKOSYAN — SITE SCRIPT
   ---------------------------------------------------------------------------
   Plain JavaScript, no libraries, no build step. Six small independent jobs:

     1. Mobile menu open / close
     2. Header border appears once you scroll
     3. Fade sections in as they enter the screen
     4. Highlight the nav link for the section you are reading
     5. Contact form -> opens the visitor's email app with the message filled in
     6. Footer year

   Every block below is wrapped in its own function and guarded with an
   "if the element is missing, do nothing" check, so deleting any section from
   index.html will not break the rest of the page.
   =========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. MOBILE MENU
     The button carries aria-expanded so screen readers announce the state.
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    // Tapping a link should navigate AND close the menu.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // If the window is widened back to desktop, reset the state.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     2. STICKY HEADER BORDER
     --------------------------------------------------------------------- */
  function initHeaderState() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------------------------------------------------------------------
     3. SCROLL REVEAL
     Anything with data-reveal starts faded out (see styles.css) and gets
     .is-visible the first time it scrolls into view. Older browsers without
     IntersectionObserver simply show everything immediately.
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // reveal once, then stop watching
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });

    // Safety net. This site is used for job applications, so content must
    // never get stranded invisible — if anything stops the observer from
    // firing (an extension, a stalled tab, an old browser quirk), show
    // everything after 2.5 seconds regardless.
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 2500);
  }

  /* ---------------------------------------------------------------------
     4. ACTIVE NAV LINK
     Watches each section and marks the matching nav link .is-active.
     --------------------------------------------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (link) {
        var id = link.getAttribute("href");
        return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------------------------------------------------------------------
     5. CONTACT FORM
     There is no server behind this site, so instead of posting anywhere the
     form builds a mailto: link and lets the visitor send from their own email
     app. The destination address comes from the form's data-mailto attribute
     in index.html — change it in that one place if the address ever changes.

     Swapping to a hosted form service (Formspree, Netlify Forms, etc.)?
     Give the <form> a real action/method in index.html and delete this whole
     function plus its call at the bottom of the file.
     --------------------------------------------------------------------- */
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

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var valid = true;

      if (!name) {
        showError(form.elements.name.closest(".field"), "Please add your name.");
        valid = false;
      }
      // Deliberately loose check: something, an @, something, a dot, something.
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showError(form.elements.email.closest(".field"), "Please add a valid email address.");
        valid = false;
      }
      if (!message) {
        showError(form.elements.message.closest(".field"), "Please add a message.");
        valid = false;
      }

      if (!valid) {
        if (note) note.textContent = "Please fix the highlighted fields.";
        return;
      }

      var subject = "Website enquiry from " + name;
      var body = message + "\n\n—\n" + name + "\n" + email;

      window.location.href =
        "mailto:" + address +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (note) {
        note.textContent =
          "Opening your email app. If nothing happens, email " + address + " directly.";
      }
    });
  }

  /* ---------------------------------------------------------------------
     6. FOOTER YEAR
     --------------------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------- start everything --------------------------- */
  initMobileMenu();
  initHeaderState();
  initReveal();
  initScrollSpy();
  initContactForm();
  initYear();
})();
