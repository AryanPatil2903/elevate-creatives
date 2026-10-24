/**
 * Motion layer: preloader, Lenis smooth scroll, GSAP ScrollTrigger animations,
 * word-split headlines, custom cursor, magnetic buttons, horizontal work scroll
 * and the light/dark theme toggle.
 * Needs: GSAP + ScrollTrigger + Lenis (CDN). If they fail to load, the page still works,
 * only without the animation.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  // ======================================================
  // Theme toggle (saved in localStorage)
  // ======================================================
  function initTheme() {
    var btn = $("#theme-toggle");
    if (!btn) return;
    function label() {
      var dark = root.getAttribute("data-theme") !== "light";
      btn.textContent = dark ? "☀" : "☾";
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    label();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("el-theme", next); } catch (e) {}
      label();
      window.dispatchEvent(new Event("themechange")); // scene.js recolours the 3D
    });
  }

  // ======================================================
  // Split a headline into masked words
  // ======================================================
  function splitWords(node) {
    var words = node.textContent.trim().split(/\s+/);
    node.setAttribute("aria-label", words.join(" "));
    node.textContent = "";
    var inner = [];
    words.forEach(function (word, i) {
      var outer = document.createElement("span");
      outer.className = "w";
      outer.setAttribute("aria-hidden", "true");
      var span = document.createElement("span");
      span.className = "wi";
      span.textContent = word;
      outer.appendChild(span);
      node.appendChild(outer);
      if (i < words.length - 1) node.appendChild(document.createTextNode(" "));
      inner.push(span);
    });
    return inner;
  }

  // ======================================================
  // Preloader (works even without GSAP)
  // ======================================================
  function runLoader(done) {
    var loader = $("#loader");
    var num = $("#loader-num");
    var bar = $("#loader-bar");
    if (!loader || !num || !bar) { root.classList.add("ready"); window.dispatchEvent(new Event("siteready")); done(); return; }

    var start = performance.now();
    var MIN = reduce ? 200 : 1600; // minimum show time (ms)
    var loaded = document.readyState === "complete";
    var shown = 0;
    var ended = false;
    window.addEventListener("load", function () { loaded = true; });

    function finish() {
      root.classList.remove("loading");
      root.classList.add("ready");
      if (lenis) lenis.start();
      window.dispatchEvent(new Event("siteready"));
      if (hasGsap && !reduce) {
        window.gsap.to(loader, {
          yPercent: -100, duration: 1, ease: "expo.inOut", delay: 0.15,
          onComplete: function () { loader.remove(); },
        });
        window.gsap.delayedCall(0.6, done); // start the hero intro as the loader leaves
      } else {
        loader.remove();
        done();
      }
    }

    function step(now) {
      if (ended) return;
      var t = Math.min((now - start) / MIN, 1);
      var target = Math.min(t, loaded ? 1 : 0.92); // wait for real load before 100%
      shown += (target - shown) * 0.15;
      if (target >= 1 && shown > 0.995) shown = 1;
      num.textContent = Math.round(shown * 100);
      bar.style.transform = "scaleX(" + shown + ")";
      if (shown >= 1) { ended = true; finish(); return; }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    setTimeout(function () { if (!ended) { ended = true; finish(); } }, 8000); // failsafe
  }

  // ======================================================
  // Lenis smooth scroll + ScrollTrigger sync
  // ======================================================
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    window.gsap.ticker.lagSmoothing(0);
    lenis.stop(); // locked until the preloader finishes
  }

  // Anchor links scroll smoothly (with or without Lenis)
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }

  // ======================================================
  // Custom cursor
  // ======================================================
  function initCursor() {
    if (!fine || reduce || !hasGsap) return;
    var dot = $("#cursor-dot");
    var ring = $("#cursor-ring");
    if (!dot || !ring) return;
    var label = $("b", ring);
    var g = window.gsap;
    var dx = g.quickTo(dot, "x", { duration: 0.1 }), dy = g.quickTo(dot, "y", { duration: 0.1 });
    var rx = g.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" }), ry = g.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    window.addEventListener("pointermove", function (e) {
      root.classList.add("cursor-on");
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });

    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("a, button, input, textarea, select, [data-cursor-label]");
      var text = t ? t.getAttribute("data-cursor-label") : null;
      ring.classList.toggle("hover", !!t);
      ring.classList.toggle("labeled", !!text);
      label.textContent = text || "";
    });
  }

  // ======================================================
  // Magnetic buttons
  // ======================================================
  function initMagnetic() {
    if (!fine || reduce || !hasGsap) return;
    $$(".btn, .theme-toggle, [data-magnetic]").forEach(function (item) {
      var xTo = window.gsap.quickTo(item, "x", { duration: 0.5, ease: "power3.out" });
      var yTo = window.gsap.quickTo(item, "y", { duration: 0.5, ease: "power3.out" });
      item.addEventListener("pointermove", function (e) {
        var r = item.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      item.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  // ======================================================
  // Hero prep + intro
  // ======================================================
  var heroWords = [];
  function prepHero() {
    var g = window.gsap;
    ["#hero-l1", "#hero-l2"].forEach(function (sel) {
      var n = $(sel);
      if (n) heroWords = heroWords.concat(splitWords(n));
    });
    g.set(heroWords, { yPercent: 115 });
    g.set(".hero-inner > :not(h1), .scroll-hint", { opacity: 0, y: 30 });
  }

  function playIntro() {
    var g = window.gsap;
    var tl = g.timeline({ defaults: { ease: "expo.out" } });
    tl.to(heroWords, { yPercent: 0, duration: 1.2, stagger: 0.08 })
      .to(".hero-inner > :not(h1), .scroll-hint", { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, "-=0.8")
      .from("#header", { y: -80, opacity: 0, duration: 0.9 }, "-=1");
  }

  // ======================================================
  // Scroll-driven animations
  // ======================================================
  function initScrollAnims() {
    var g = window.gsap;
    var ST = window.ScrollTrigger;

    // Section headlines: words slide up from a mask
    $$("h2[data-split]").forEach(function (h) {
      var words = splitWords(h);
      g.set(words, { yPercent: 115 });
      ST.create({
        trigger: h, start: "top 85%", once: true,
        onEnter: function () { g.to(words, { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.06 }); },
      });
    });

    // Cards, rows, steps: batched fade-and-rise
    var items = $$(".reveal-item");
    g.set(items, { opacity: 0, y: 50 });
    ST.batch(items, {
      start: "top 90%", once: true,
      onEnter: function (batch) { g.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }); },
    });

    // Hero content drifts up and fades as you scroll away
    g.to(".hero-inner", {
      yPercent: -14, opacity: 0.15, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Scroll progress bar
    g.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    // Parallax on service images
    $$(".row .media > *").forEach(function (m) {
      g.fromTo(m, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: m.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  // ======================================================
  // Horizontal (pinned) work scroll, desktop only
  // ======================================================
  function initHorizontal() {
    var g = window.gsap;
    var mm = g.matchMedia();
    mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", function () {
      var wrap = $("#work"), track = $("#work-track"), bar = $("#hprog-bar");
      if (!wrap || !track) return;
      function dist() { return Math.max(0, track.scrollWidth - window.innerWidth + 48); }
      g.to(track, {
        x: function () { return -dist(); },
        ease: "none",
        scrollTrigger: {
          trigger: wrap, start: "top top", end: function () { return "+=" + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { if (bar) bar.style.transform = "scaleX(" + self.progress + ")"; },
        },
      });
    });
  }

  // ======================================================
  // Boot
  // ======================================================
  initTheme();
  initAnchors();
  root.classList.add("loading");

  if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    initLenis();
    initCursor();
    initMagnetic();
    if (!reduce) prepHero();
    initScrollAnims();
    initHorizontal();
    window.addEventListener("load", function () { window.ScrollTrigger.refresh(); });
  }

  runLoader(function () {
    if (hasGsap && !reduce) playIntro();
  });
})();