// Hinton Studios — Three.js hero canvas + micro-interactions
// Scroll animations handled by GSAP (gsap-animations.js)

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1) Three.js hero particle field
   ========================================================= */
function initHeroCanvas() {
  if (reduceMotion) return;
  const host = document.querySelector('[data-hero-canvas]');
  if (!host) return;

  // Ensure host is a positioned container
  const computed = getComputedStyle(host);
  if (computed.position === 'static') host.style.position = 'relative';

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  host.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  // Particle field — tertiary #9093ff signal (reduced for perf)
  const COUNT = 500;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    speeds[i] = 0.002 + Math.random() * 0.006;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x9093ff,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Subtle ambient shader fog — thin ring mesh for depth
  const ringGeo = new THREE.RingGeometry(10, 10.6, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x7073ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.z = -4;
  scene.add(ring);

  // Pointer parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let t = 0;
  let running = true;
  let lastFrame = 0;
  const FPS_CAP = 1000 / 30; // Cap at 30fps — particles don't need 60
  const io = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; });
  io.observe(host);

  function loop(now) {
    requestAnimationFrame(loop);
    if (!running) return;
    if (now - lastFrame < FPS_CAP) return;
    lastFrame = now;
    t += 0.005;

    // Smooth parallax
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 12) pos[i * 3 + 1] = -12;
    }
    geometry.attributes.position.needsUpdate = true;

    points.rotation.y = t * 0.08 + mouse.x * 0.3;
    points.rotation.x = mouse.y * 0.15;
    ring.rotation.z = t * 0.15;

    renderer.render(scene, camera);
  }
  loop();
}

/* =========================================================
   2) Glass layer — additive class application
   ========================================================= */
function applyGlassLayer() {
  const nav = document.querySelector('nav.fixed');
  if (nav) nav.classList.add('glass-nav');

  // Inquiry form card (services.html)
  document.querySelectorAll('.bg-black\\/40.backdrop-blur-3xl').forEach((el) => {
    el.classList.add('glass-pane', 'glass-sheen');
  });

  // Service bento cards get a soft glass sheen
  document.querySelectorAll('[data-glass]').forEach((el) => el.classList.add('glass-card', 'glass-sheen'));
}

/* =========================================================
   3) Micro-interactions — magnetic CTAs, 3D tilt (non-scroll)
   Scroll animations are handled by GSAP in gsap-animations.js
   ========================================================= */
function initMicroInteractions() {
  if (reduceMotion) return;

  // Magnetic CTAs
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.25;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = 'translate3d(0,0,0)'; });
  });

  // 3D tilt on bento cards
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1200px) rotateY(${px * 6}deg) rotateX(${py * -6}deg)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'perspective(1200px) rotateY(0) rotateX(0)';
    });
  });
}

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  applyGlassLayer();
  initHeroCanvas();
  initMicroInteractions();
});
