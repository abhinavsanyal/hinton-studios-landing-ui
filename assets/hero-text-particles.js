// Hinton Studios — Cinematic Frosted Glass Blur Lens v3
// Fixes: video stutter via isolation containment, auto-play intro sweep
// Features: 3-layer system, velocity-reactive blur, GPU transforms, particles

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    const heroTitle = document.querySelector('[data-hero-title]');
    if (!heroTitle) return;
    const heroSection = heroTitle.closest('main');
    if (!heroSection) return;

    const isMobile = window.innerWidth < 768;

    // ---- Config ----
    const BASE_SIZE = isMobile ? 160 : 260;
    const BASE_BLUR = isMobile ? 10 : 16;
    const MAX_BLUR = isMobile ? 18 : 28;
    const FOLLOW = 0.09;
    const GLOW = '144,147,255';
    const MAX_MOTES = isMobile ? 10 : 20;

    // ---- FIX: Isolate the video panel so backdrop-filter doesn't blur iframes ----
    // This creates a new stacking context for the video background,
    // preventing the lens's backdrop-filter from reaching the heavy iframes
    const videoBg = heroSection.querySelector('.absolute.inset-0.z-0');
    if (videoBg) {
      videoBg.style.isolation = 'isolate';
      videoBg.style.contain = 'paint';
    }

    // ---- Inject CSS ----
    const style = document.createElement('style');
    style.textContent = `
      #hbl-core, #hbl-outer, #hbl-ring {
        position: fixed; border-radius: 50%; pointer-events: none;
        will-change: transform, opacity;
      }
      #hbl-core {
        width: ${BASE_SIZE}px; height: ${BASE_SIZE}px; z-index: 11;
        opacity: 0; transition: opacity .45s cubic-bezier(.4,0,.2,1);
        transform: translate3d(-50%,-50%,0);
        backdrop-filter: blur(${BASE_BLUR}px);
        -webkit-backdrop-filter: blur(${BASE_BLUR}px);
        background: radial-gradient(circle,
          rgba(${GLOW},.07) 0%, rgba(${GLOW},.03) 40%, transparent 72%);
        mask-image: radial-gradient(circle, black 35%, transparent 68%);
        -webkit-mask-image: radial-gradient(circle, black 35%, transparent 68%);
      }
      #hbl-outer {
        width: ${BASE_SIZE * 2}px; height: ${BASE_SIZE * 2}px; z-index: 10;
        opacity: 0; transition: opacity .6s cubic-bezier(.4,0,.2,1);
        transform: translate3d(-50%,-50%,0);
        background: radial-gradient(circle,
          rgba(${GLOW},.035) 0%, rgba(${GLOW},.015) 35%, transparent 55%);
      }
      #hbl-ring {
        width: ${BASE_SIZE + 10}px; height: ${BASE_SIZE + 10}px; z-index: 11;
        opacity: 0; transition: opacity .5s ease;
        border: 1px solid rgba(${GLOW},.12);
        box-shadow: 0 0 20px rgba(${GLOW},.04), inset 0 0 20px rgba(${GLOW},.03);
        animation: hbl-breathe 4s ease-in-out infinite;
        transform-origin: center center;
      }
      @keyframes hbl-breathe {
        0%, 100% { transform: translate(-50%,-50%) scale(1); }
        50% { transform: translate(-50%,-50%) scale(1.06); }
      }
      .hbl-mote {
        position: fixed; border-radius: 50%; pointer-events: none; z-index: 12;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);

    // ---- Create layers ----
    const core = document.createElement('div');  core.id = 'hbl-core';
    const outer = document.createElement('div'); outer.id = 'hbl-outer';
    const ring = document.createElement('div');  ring.id = 'hbl-ring';
    document.body.append(core, outer, ring);

    // ---- Particle pool ----
    const motePool = [];
    function getMote() {
      let m = motePool.find(el => el._idle);
      if (!m && motePool.length < MAX_MOTES) {
        m = document.createElement('div');
        m.className = 'hbl-mote';
        document.body.appendChild(m);
        motePool.push(m);
      }
      return m || null;
    }

    function fireMote(x, y) {
      const m = getMote();
      if (!m) return;
      m._idle = false;

      const sz = 1.5 + Math.random() * 3.5;
      const a = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * BASE_SIZE * 0.35;
      const sx = x + Math.cos(a) * r;
      const sy = y + Math.sin(a) * r;
      const dx = (Math.random() - 0.5) * 50;
      const dy = -15 - Math.random() * 35;
      const dur = 1200 + Math.random() * 1400;
      const brightness = 0.3 + Math.random() * 0.5;

      m.style.cssText = `
        position:fixed; border-radius:50%; pointer-events:none; z-index:12;
        width:${sz}px; height:${sz}px;
        left:${sx}px; top:${sy}px;
        background: rgba(${GLOW},${brightness});
        box-shadow: 0 0 ${sz * 3}px rgba(${GLOW},${brightness * 0.5});
        opacity:0; transform:translate3d(0,0,0);
        transition: transform ${dur}ms cubic-bezier(.15,.6,.35,1),
                    opacity ${dur * 0.4}ms ease;
        will-change: transform, opacity;
      `;

      requestAnimationFrame(() => {
        m.style.opacity = brightness.toFixed(2);
        m.style.transform = `translate3d(${dx}px,${dy}px,0)`;
        setTimeout(() => {
          m.style.transition = `opacity ${dur * 0.35}ms ease`;
          m.style.opacity = '0';
          setTimeout(() => { m._idle = true; }, dur * 0.35);
        }, dur * 0.55);
      });
    }

    // ---- Position helpers ----
    function posAt(x, y) {
      core.style.left = x + 'px';   core.style.top = y + 'px';
      outer.style.left = x + 'px';  outer.style.top = y + 'px';
      ring.style.left = x + 'px';   ring.style.top = y + 'px';
    }

    function show() {
      core.style.opacity = '1';
      outer.style.opacity = '1';
      ring.style.opacity = '1';
    }

    function hide() {
      core.style.opacity = '0';
      outer.style.opacity = '0';
      ring.style.opacity = '0';
    }

    // ---- Pointer state ----
    let mx = 0, my = 0, sx = 0, sy = 0;
    let active = false, near = false;
    let speed = 0, prevX = 0, prevY = 0;
    let moteTimer = 0;
    let raf = 0;
    let introPlaying = false;

    function titleBounds() {
      const r = heroTitle.getBoundingClientRect();
      return { l: r.left - 50, t: r.top - 50, r: r.right + 50, b: r.bottom + 50 };
    }

    function onMove(e) {
      if (introPlaying) return; // don't interrupt intro
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;

      speed = Math.sqrt((cx - prevX) ** 2 + (cy - prevY) ** 2);
      prevX = cx; prevY = cy;
      mx = cx; my = cy;

      const b = titleBounds();
      near = cx >= b.l && cx <= b.r && cy >= b.t && cy <= b.b;

      if (near && !active) {
        active = true;
        sx = cx; sy = cy;
        show();
        if (!raf) tick();
      }
    }

    function onLeave() {
      if (introPlaying) return;
      near = false;
      active = false;
      hide();
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onLeave);

    window.addEventListener('scroll', () => {
      if (!active || introPlaying) return;
      const b = titleBounds();
      if (mx < b.l || mx > b.r || my < b.t || my > b.b) onLeave();
    }, { passive: true });

    // ---- Render loop ----
    function tick() {
      sx += (mx - sx) * FOLLOW;
      sy += (my - sy) * FOLLOW;

      posAt(sx, sy);

      // Velocity blur
      const dynBlur = Math.min(BASE_BLUR + speed * 0.5, MAX_BLUR);
      core.style.backdropFilter = `blur(${dynBlur.toFixed(1)}px)`;
      core.style.webkitBackdropFilter = `blur(${dynBlur.toFixed(1)}px)`;

      moteTimer++;
      if (near && moteTimer % (isMobile ? 10 : 6) === 0) {
        fireMote(sx, sy);
      }

      speed *= 0.85;

      if (active || introPlaying || parseFloat(core.style.opacity) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    // ---- AUTO-PLAY INTRO: Cinematic sweep across "Cinema Redefined." on page load ----
    function playIntro() {
      introPlaying = true;
      const rect = heroTitle.getBoundingClientRect();

      // Start from just left of "Redefined." (the bolder, bigger impact word)
      // and sweep right across it, ending near the period.
      const startX = rect.left + rect.width * 0.1;
      const startY = rect.top + rect.height * 0.7; // lower line ("Redefined.")
      const endX = rect.left + rect.width * 0.85;
      const endY = rect.top + rect.height * 0.55;

      sx = startX; sy = startY;
      mx = startX; my = startY;
      posAt(sx, sy);
      show();
      if (!raf) tick();

      // Animate the target position along a smooth cubic bezier path
      const duration = 3000;
      const startTime = performance.now();

      function animateIntro(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Smooth ease-in-out cubic
        const ease = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Sweep from left to right with a gentle arc upward
        mx = startX + (endX - startX) * ease;
        my = startY + (endY - startY) * ease + Math.sin(ease * Math.PI) * -30;

        // Spawn motes during sweep
        if (Math.random() < 0.15) fireMote(sx, sy);

        if (t < 1) {
          requestAnimationFrame(animateIntro);
        } else {
          // Hold for a moment, then fade out
          setTimeout(() => {
            introPlaying = false;
            active = false;
            near = false;
            hide();
          }, 800);
        }
      }

      requestAnimationFrame(animateIntro);
    }

    // ---- Cleanup on hero exit ----
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && !introPlaying) onLeave();
    }).observe(heroSection);

    // ---- Boot: wait for layout, then play intro ----
    // Delay gives the hero video panels time to start loading
    // so the intro doesn't compete for GPU bandwidth
    setTimeout(playIntro, isMobile ? 2500 : 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }
})();
