/**
 * Visual effects layer: particle network, 3D globe, tilt cards,
 * scroll reveal, cursor glow, orbs and scroll progress.
 * Pure canvas + CSS, no libraries. Respects prefers-reduced-motion.
 * Must load AFTER main.js (it animates elements main.js creates).
 */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // ---------- Shared mouse state (normalised -1..1 plus pixels) ----------
  var mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- Accent colour from CSS, as "r,g,b" ----------
  function accentRGB() {
    var hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().replace("#", "");
    if (hex.length !== 6) return [255, 107, 53];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  var ACC = accentRGB().join(",");

  // ---------- Canvas sizing helper (sharp on retina) ----------
  function fitCanvas(canvas, w, h) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  // ======================================================
  // 1. Particle network (fixed full-screen background)
  // ======================================================
  function initParticles() {
    var canvas = document.getElementById("fx-particles");
    if (!canvas) return;
    var ctx, W, H, pts = [];
    var LINK = 130;   // max distance for a connecting line
    var PUSH = 150;   // cursor repel radius

    function build() {
      W = window.innerWidth;
      H = window.innerHeight;
      ctx = fitCanvas(canvas, W, H);
      var count = Math.min(110, Math.floor((W * H) / 15000)); // lower this cap on slow PCs
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    }

    function step() {
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < PUSH * PUSH && d2 > 1) { // push away from cursor
          var d = Math.sqrt(d2), f = (PUSH - d) / PUSH;
          p.x += (dx / d) * f * 2.2;
          p.y += (dy / d) * f * 2.2;
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        ctx.fillStyle = "rgba(" + ACC + ",0.7)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(255,255,255," + (0.14 * (1 - d / LINK)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
    }

    function loop() {
      if (!document.hidden) { step(); draw(); }
      requestAnimationFrame(loop);
    }

    build();
    window.addEventListener("resize", build);
    if (reduce) { draw(); return; } // single static frame
    loop();
  }

  // ======================================================
  // 2. 3D particle globe (hero)
  // ======================================================
  function initGlobe() {
    var canvas = document.getElementById("fx-globe");
    if (!canvas) return;
    var ctx, size, R;
    var N = 460; // points on the sphere; lower to 300 on slow PCs
    var base = [];
    var visible = true;
    var rotY = 0, tx = 0, ty = 0;

    // Fibonacci sphere: evenly spread points
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var th = golden * i;
      base.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r, hot: i % 9 === 0 });
    }

    // Orbit rings (circles tilted in 3D)
    var rings = [];
    [0.5, 1.1, -0.7].forEach(function (tilt, k) {
      var pts = [];
      for (var s = 0; s < 120; s++) {
        var a = (s / 120) * Math.PI * 2;
        var cx = Math.cos(a) * (1.25 + k * 0.08), cz = Math.sin(a) * (1.25 + k * 0.08);
        pts.push({ x: cx, y: Math.sin(tilt) * cz * 0.5, z: Math.cos(tilt) * cz });
      }
      rings.push(pts);
    });

    function resize() {
      size = canvas.clientWidth || 500;
      ctx = fitCanvas(canvas, size, size);
      R = size * 0.30;
    }

    // Rotate a point, then apply perspective. Returns screen x/y, depth and scale.
    function project(p, cy, sy, cx, sx, wobble) {
      var k = 1 + wobble;
      var x = p.x * k, y = p.y * k, z = p.z * k;
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;   // spin around Y
      var y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;  // tilt around X
      var scale = 1 / (1 - z2 * 0.35);                   // perspective
      return { x: size / 2 + x1 * R * scale, y: size / 2 + y2 * R * scale, z: z2, s: scale };
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      // Ease towards mouse-driven target angles
      tx += ((mouse.ny * 0.5 + 0.3) - tx) * 0.04;
      ty += ((mouse.nx * 0.9) - ty) * 0.04;
      rotY += reduce ? 0 : 0.004;
      var cy = Math.cos(rotY + ty), sy = Math.sin(rotY + ty);
      var cx = Math.cos(tx), sx = Math.sin(tx);

      ctx.clearRect(0, 0, size, size);

      // Rings first (behind the globe)
      rings.forEach(function (ring) {
        ring.forEach(function (p) {
          var q = project(p, cy, sy, cx, sx, 0);
          ctx.fillStyle = "rgba(255,255,255," + (0.1 + 0.25 * (q.z + 1.3) / 2.6) + ")";
          ctx.fillRect(q.x, q.y, 1.4, 1.4);
        });
      });

      // Sphere points with a gentle breathing wave
      for (var i = 0; i < base.length; i++) {
        var p = base[i];
        var wobble = reduce ? 0 : 0.035 * Math.sin(t * 0.0016 + i * 0.7);
        var q = project(p, cy, sy, cx, sx, wobble);
        var depth = (q.z + 1) / 2; // 0 back .. 1 front
        var alpha = 0.15 + 0.85 * depth;
        ctx.fillStyle = p.hot
          ? "rgba(" + ACC + "," + alpha + ")"
          : "rgba(255,255,255," + alpha * 0.8 + ")";
        ctx.beginPath();
        ctx.arc(q.x, q.y, (p.hot ? 2.6 : 1.5) * q.s * (0.6 + depth * 0.7), 0, 6.2832);
        ctx.fill();
      }
    }

    // Pause when scrolled out of view
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);
    }
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }

  // ======================================================
  // 3. 3D tilt + glare on cards and rows
  // ======================================================
  function initTilt() {
    if (!finePointer || reduce) return;
    document.querySelectorAll(".card, .row").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.transform =
          "perspective(900px) rotateX(" + ((0.5 - py) * 8).toFixed(2) + "deg) " +
          "rotateY(" + ((px - 0.5) * 10).toFixed(2) + "deg) translateZ(6px)";
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // ======================================================
  // 4. Scroll reveal (staggered)
  // ======================================================
  function initReveal() {
    var targets = document.querySelectorAll(
      ".section-head > *, .row, .card, .hero > :not(canvas), .cta > *, .footer-grid > *"
    );
    if (reduce || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");
        io.unobserve(el);
        // Remove reveal classes afterwards so tilt transitions stay snappy
        setTimeout(function () {
          el.classList.remove("reveal", "in");
          el.style.transitionDelay = "";
        }, 1400);
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = ((i % 4) * 90) + "ms"; // stagger within groups
      io.observe(el);
    });
  }

  // ======================================================
  // 5. Cursor glow, orbs, scroll progress bar
  // ======================================================
  function initAmbient() {
    var body = document.body;
    var orb1 = document.createElement("div"); orb1.className = "orb orb-1";
    var orb2 = document.createElement("div"); orb2.className = "orb orb-2";
    var bar = document.createElement("div"); bar.id = "fx-progress";
    body.appendChild(orb1); body.appendChild(orb2); body.appendChild(bar);

    var glow = null;
    if (finePointer) {
      glow = document.createElement("div");
      glow.id = "fx-glow";
      body.appendChild(glow);
    }

    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    function tick() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var prog = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + prog.toFixed(4) + ")";
      if (!reduce) {
        orb1.style.transform = "translate(" + (mouse.nx * 40) + "px," + (window.scrollY * -0.12) + "px)";
        orb2.style.transform = "translate(" + (mouse.nx * -50) + "px," + (window.scrollY * 0.08) + "px)";
      }
      if (glow) {
        gx += (mouse.x - gx) * 0.12;
        gy += (mouse.y - gy) * 0.12;
        glow.style.transform = "translate(" + gx + "px," + gy + "px)";
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ---------- Boot ----------
  initParticles();
  initGlobe();
  initTilt();
  initReveal();
  initAmbient();
})();