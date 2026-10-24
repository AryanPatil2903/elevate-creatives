/**
 * Three.js background scene.
 * - Lit crystal (icosahedron) with wireframe shell, orbit rings and shards
 * - Glowing shader particle field
 * - Reacts to mouse (rotation + moving lights) and scroll (camera travels down)
 * - Recolours when the theme changes
 * Pure WebGL, one fixed canvas (#gl). Fails silently if WebGL is unavailable.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("gl");
  var T = window.THREE;
  if (!canvas || !T) return;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Renderer ----------
  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("WebGL unavailable, 3D scene skipped.");
    return;
  }
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(50, 1, 0.1, 120);
  camera.position.set(0, 0, 9);

  // ---------- Theme colours (read from CSS variables) ----------
  function css(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }
  var C = {
    a: new T.Color(css("--accent", "#00f0ff")),
    b: new T.Color(css("--accent-2", "#ff2e63")),
    c: new T.Color(css("--accent-3", "#8b5cff")),
  };

  // ---------- Lights (these give the real 3D shading) ----------
  var key = new T.PointLight(C.a, 2.4, 60);
  var rim = new T.PointLight(C.b, 2.2, 60);
  var amb = new T.AmbientLight(0xffffff, 0.35);
  var front = new T.DirectionalLight(0xffffff, 0.5);
  front.position.set(0, 2, 8);
  scene.add(key, rim, amb, front);

  // ---------- Hero object ----------
  var group = new T.Group();
  scene.add(group);

  var solidMat = new T.MeshStandardMaterial({ color: new T.Color(css("--gl-solid", "#10121f")), metalness: 0.85, roughness: 0.28, flatShading: true });
  var solid = new T.Mesh(new T.IcosahedronGeometry(1.7, 1), solidMat);

  var wireMat = new T.MeshBasicMaterial({ color: C.a, wireframe: true, transparent: true, opacity: 0.5 });
  var wire = new T.Mesh(new T.IcosahedronGeometry(1.98, 1), wireMat);

  var ring1Mat = new T.MeshBasicMaterial({ color: C.b, transparent: true, opacity: 0.85 });
  var ring1 = new T.Mesh(new T.TorusGeometry(2.8, 0.018, 8, 160), ring1Mat);
  ring1.rotation.x = 1.2;

  var ring2Mat = new T.MeshBasicMaterial({ color: C.c, transparent: true, opacity: 0.8 });
  var ring2 = new T.Mesh(new T.TorusGeometry(3.35, 0.014, 8, 160), ring2Mat);
  ring2.rotation.set(0.4, 0.8, 0);

  group.add(solid, wire, ring1, ring2);

  // Small shards orbiting the crystal
  var shardMat = new T.MeshStandardMaterial({ color: C.a, emissive: C.a, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.3, flatShading: true });
  var shards = [];
  for (var i = 0; i < 14; i++) {
    var m = new T.Mesh(new T.TetrahedronGeometry(0.1 + Math.random() * 0.12, 0), shardMat);
    group.add(m);
    shards.push({ mesh: m, angle: Math.random() * 6.28, speed: 0.15 + Math.random() * 0.35, r: 2.5 + Math.random() * 1.3, h: 0.8 + Math.random() * 1.6 });
  }

  // ---------- Shader particle field ----------
  var COUNT = window.innerWidth < 700 ? 700 : 1500; // lower on slow PCs
  var pos = new Float32Array(COUNT * 3);
  var size = new Float32Array(COUNT);
  var seed = new Float32Array(COUNT);
  for (var p = 0; p < COUNT; p++) {
    pos[p * 3] = (Math.random() - 0.5) * 44;
    pos[p * 3 + 1] = Math.random() * 34 - 26;  // spread downward: camera travels down on scroll
    pos[p * 3 + 2] = Math.random() * 28 - 24;
    size[p] = Math.random() * 2.2 + 0.6;
    seed[p] = Math.random();
  }
  var pgeo = new T.BufferGeometry();
  pgeo.setAttribute("position", new T.BufferAttribute(pos, 3));
  pgeo.setAttribute("aSize", new T.BufferAttribute(size, 1));
  pgeo.setAttribute("aSeed", new T.BufferAttribute(seed, 1));

  var pmat = new T.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixel: { value: dpr },
      uA: { value: C.a },
      uB: { value: C.b },
      uOpacity: { value: 1 },
    },
    vertexShader: [
      "attribute float aSize; attribute float aSeed;",
      "uniform float uTime; uniform float uPixel;",
      "varying float vSeed; varying float vFade;",
      "void main() {",
      "  vec3 p = position;",
      "  p.y += sin(uTime * 0.5 + aSeed * 40.0) * 0.35;",
      "  p.x += cos(uTime * 0.4 + aSeed * 25.0) * 0.3;",
      "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
      "  gl_PointSize = aSize * uPixel * (60.0 / -mv.z);",
      "  gl_Position = projectionMatrix * mv;",
      "  vSeed = aSeed;",
      "  vFade = smoothstep(55.0, 8.0, -mv.z);",
      "}",
    ].join("\n"),
    fragmentShader: [
      "uniform vec3 uA; uniform vec3 uB; uniform float uOpacity;",
      "varying float vSeed; varying float vFade;",
      "void main() {",
      "  float d = length(gl_PointCoord - vec2(0.5));",
      "  if (d > 0.5) discard;",
      "  float a = pow(1.0 - d * 2.0, 2.0);",
      "  vec3 col = mix(uA, uB, step(0.7, vSeed));",
      "  gl_FragColor = vec4(col, a * vFade * uOpacity);",
      "}",
    ].join("\n"),
    transparent: true,
    depthWrite: false,
    blending: T.AdditiveBlending,
  });
  var points = new T.Points(pgeo, pmat);
  points.frustumCulled = false;
  scene.add(points);

  // ---------- Theme switching ----------
  function applyTheme() {
    var light = root.getAttribute("data-theme") === "light";
    C.a.set(css("--accent", "#00f0ff"));
    C.b.set(css("--accent-2", "#ff2e63"));
    C.c.set(css("--accent-3", "#8b5cff"));
    solidMat.color.set(css("--gl-solid", "#10121f"));
    wireMat.color.copy(C.a);
    ring1Mat.color.copy(C.b);
    ring2Mat.color.copy(C.c);
    shardMat.color.copy(C.a);
    shardMat.emissive.copy(C.a);
    key.color.copy(C.a);
    rim.color.copy(C.b);
    pmat.blending = light ? T.NormalBlending : T.AdditiveBlending; // additive glow is invisible on light bg
    pmat.uniforms.uOpacity.value = light ? 0.6 : 1;
    pmat.needsUpdate = true;
    if (reduce) renderFrame(0);
  }
  window.addEventListener("themechange", applyTheme);

  // ---------- Input state ----------
  var mouse = { x: 0, y: 0 };
  var sm = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var intro = { v: 0 }; // 0 → 1 scale-in once the preloader finishes
  var prog = 0;         // smoothed scroll progress 0..1
  var mobile = false;

  window.addEventListener("siteready", function () {
    if (window.gsap) window.gsap.to(intro, { v: 1, duration: 1.8, ease: "expo.out" });
    else intro.v = 1;
  });
  if (root.classList.contains("ready") || reduce) intro.v = 1;
  setTimeout(function () { if (intro.v === 0) intro.v = 1; }, 9000); // failsafe

  // ---------- Resize ----------
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    mobile = w < 860;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduce) renderFrame(0);
  }
  window.addEventListener("resize", resize);

  // ---------- Render ----------
  function renderFrame(t) {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var target = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    prog += (target - prog) * (reduce ? 1 : 0.08);
    sm.x += (mouse.x - sm.x) * 0.05;
    sm.y += (mouse.y - sm.y) * 0.05;

    // Camera travels down through the particle field as you scroll
    camera.position.y = -prog * 16;
    camera.position.z = 9 - prog * 2;
    camera.position.x = sm.x * 0.6;
    camera.lookAt(0, camera.position.y, 0);

    // Crystal swings left/right as you scroll, centred on mobile
    group.position.x = mobile ? 0 : Math.cos(prog * Math.PI * 3) * 3.4;
    group.position.y = camera.position.y + (mobile ? 1.6 : 0);
    var s = (mobile ? 0.62 : 1) * intro.v * (1 + Math.sin(t * 1.2) * 0.02);
    group.scale.setScalar(Math.max(s, 0.0001));

    // Rotation follows the mouse and scroll
    group.rotation.y = t * 0.25 + sm.x * 0.8 + prog * 6;
    group.rotation.x = 0.2 + sm.y * 0.4;
    wire.rotation.y = -t * 0.15;
    ring1.rotation.z = t * 0.3;
    ring2.rotation.y = t * 0.2;

    shards.forEach(function (sh) {
      var a = sh.angle + t * sh.speed;
      sh.mesh.position.set(Math.cos(a) * sh.r, Math.sin(a * 1.3) * sh.h, Math.sin(a) * sh.r);
      sh.mesh.rotation.x += 0.01;
      sh.mesh.rotation.y += 0.014;
    });

    // Lights follow the crystal and move with the mouse (live highlights)
    key.position.set(group.position.x + 5 + sm.x * 3, group.position.y + 4 - sm.y * 3, 6);
    rim.position.set(group.position.x - 6 - sm.x * 2, group.position.y - 3 + sm.y * 2, 4);

    pmat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
  }

  var clock = new T.Clock();
  function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    renderFrame(clock.getElapsedTime());
  }

  // ---------- Start ----------
  resize();
  applyTheme();
  if (reduce) renderFrame(0); // one still frame, no animation loop
  else loop();
})();