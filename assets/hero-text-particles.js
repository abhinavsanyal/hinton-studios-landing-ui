// Hinton Studios — Cinematic Frosted Glass Blur Lens
// Mouse-following backdrop-filter blur that ACTUALLY distorts the hero text
// Like Google Flow — a real glass lens over "Cinema Redefined"

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function init() {
    const heroTitle = document.querySelector('[data-hero-title]');
    if (!heroTitle) return;

    const heroSection = heroTitle.closest('main');
    if (!heroSection) return;

    const isMobile = window.innerWidth < 768;
    const LENS_SIZE = isMobile ? 180 : 280;
    const BLUR_AMOUNT = isMobile ? 12 : 18;
    const FOLLOW_SPEED = 0.1;
    const GLOW_COLOR = '144, 147, 255'; // tertiary #9093ff

    // ---- Create the blur lens element ----
    const lens = document.createElement('div');
    lens.id = 'hero-blur-lens';
    lens.style.cssText = `
      position: fixed;
      width: ${LENS_SIZE}px;
      height: ${LENS_SIZE}px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 11;
      opacity: 0;
      transition: opacity 0.5s ease;
      transform: translate(-50%, -50%);
      backdrop-filter: blur(${BLUR_AMOUNT}px);
      -webkit-backdrop-filter: blur(${BLUR_AMOUNT}px);
      background: radial-gradient(
        circle,
        rgba(${GLOW_COLOR}, 0.08) 0%,
        rgba(${GLOW_COLOR}, 0.04) 30%,
        rgba(${GLOW_COLOR}, 0.01) 60%,
        transparent 75%
      );
      mask-image: radial-gradient(circle, black 30%, transparent 70%);
      -webkit-mask-image: radial-gradient(circle, black 30%, transparent 70%);
      box-shadow: 
        inset 0 0 40px rgba(${GLOW_COLOR}, 0.06),
        0 0 60px rgba(${GLOW_COLOR}, 0.03);
      will-change: transform, left, top;
    `;
    document.body.appendChild(lens);

    // ---- Secondary outer glow ring (even subtler) ----
    const outerGlow = document.createElement('div');
    outerGlow.style.cssText = `
      position: fixed;
      width: ${LENS_SIZE * 1.8}px;
      height: ${LENS_SIZE * 1.8}px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.7s ease;
      transform: translate(-50%, -50%);
      background: radial-gradient(
        circle,
        rgba(${GLOW_COLOR}, 0.04) 0%,
        rgba(${GLOW_COLOR}, 0.02) 30%,
        transparent 60%
      );
      will-change: transform, left, top;
    `;
    document.body.appendChild(outerGlow);

    // ---- Floating micro-particles spawned near lens ----
    const particlePool = [];
    const MAX_PARTICLES = isMobile ? 12 : 25;

    function spawnParticle(x, y) {
      let p = particlePool.find(el => !el._active);
      if (!p) {
        if (particlePool.length >= MAX_PARTICLES) return;
        p = document.createElement('div');
        p.style.cssText = `
          position: fixed;
          pointer-events: none;
          z-index: 12;
          border-radius: 50%;
          will-change: transform, opacity;
        `;
        document.body.appendChild(p);
        particlePool.push(p);
      }

      const size = 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * LENS_SIZE * 0.4;
      const startX = x + Math.cos(angle) * dist;
      const startY = y + Math.sin(angle) * dist;
      const driftX = (Math.random() - 0.5) * 60;
      const driftY = -20 - Math.random() * 40;
      const duration = 1500 + Math.random() * 1500;

      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = startX + 'px';
      p.style.top = startY + 'px';
      p.style.background = `rgba(${GLOW_COLOR}, ${0.3 + Math.random() * 0.4})`;
      p.style.boxShadow = `0 0 ${size * 2}px rgba(${GLOW_COLOR}, 0.3)`;
      p.style.opacity = '0';
      p.style.transition = 'none';
      p._active = true;

      requestAnimationFrame(() => {
        p.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        p.style.transform = `translate(${driftX}px, ${driftY}px)`;
        p.style.opacity = '0.6';

        setTimeout(() => {
          p.style.opacity = '0';
          setTimeout(() => {
            p._active = false;
            p.style.transition = 'none';
            p.style.transform = 'none';
          }, 500);
        }, duration * 0.6);
      });
    }

    // ---- Pointer tracking ----
    let mouseX = -9999, mouseY = -9999;
    let smoothX = -9999, smoothY = -9999;
    let isActive = false;
    let isOverTitle = false;
    let particleTimer = 0;
    let rafId = null;

    function getTitleBounds() {
      const r = heroTitle.getBoundingClientRect();
      return {
        left: r.left - 60,
        top: r.top - 60,
        right: r.right + 60,
        bottom: r.bottom + 60,
      };
    }

    function onPointerMove(e) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      mouseX = cx;
      mouseY = cy;

      const bounds = getTitleBounds();
      isOverTitle = cx >= bounds.left && cx <= bounds.right &&
                    cy >= bounds.top && cy <= bounds.bottom;

      if (isOverTitle && !isActive) {
        isActive = true;
        smoothX = cx;
        smoothY = cy;
        lens.style.opacity = '1';
        outerGlow.style.opacity = '1';
        if (!rafId) tick();
      }
    }

    function onPointerLeave() {
      isOverTitle = false;
      isActive = false;
      lens.style.opacity = '0';
      outerGlow.style.opacity = '0';
    }

    // Use document-level listeners so it works everywhere
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('touchmove', (e) => {
      onPointerMove(e);
    }, { passive: true });
    document.addEventListener('touchend', onPointerLeave);

    // Also handle scroll — hero title position changes
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          if (isActive) {
            const bounds = getTitleBounds();
            isOverTitle = mouseX >= bounds.left && mouseX <= bounds.right &&
                          mouseY >= bounds.top && mouseY <= bounds.bottom;
            if (!isOverTitle) {
              onPointerLeave();
            }
          }
          scrollTicking = false;
        });
      }
    }, { passive: true });

    // ---- Animation loop ----
    function tick() {
      if (!isActive && Math.abs(parseFloat(lens.style.opacity)) < 0.01) {
        rafId = null;
        return;
      }

      // Smooth follow
      smoothX += (mouseX - smoothX) * FOLLOW_SPEED;
      smoothY += (mouseY - smoothY) * FOLLOW_SPEED;

      lens.style.left = smoothX + 'px';
      lens.style.top = smoothY + 'px';
      outerGlow.style.left = smoothX + 'px';
      outerGlow.style.top = smoothY + 'px';

      // Spawn particles occasionally
      particleTimer++;
      if (isOverTitle && particleTimer % (isMobile ? 8 : 5) === 0) {
        spawnParticle(smoothX, smoothY);
      }

      rafId = requestAnimationFrame(tick);
    }

    // ---- Visibility observer — stop when hero off-screen ----
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        onPointerLeave();
      }
    });
    io.observe(heroSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure layout  
    setTimeout(init, 100);
  }
})();
