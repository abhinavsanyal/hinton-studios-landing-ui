// Hinton Studios — VFX Layer (Minimal, zero-flicker)
// No rAF loops. No blend modes. Pure CSS + one-time setup.

(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return;

  /* =========================================================
     1) SVG FILTER — lightweight chromatic aberration
     Applied/removed via CSS class, driven by scroll event only
     ========================================================= */
  function injectSVGFilter() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;pointer-events:none;";
    svg.innerHTML = `<defs>
      <filter id="vfx-chroma" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
        <feOffset id="vfx-r" in="SourceGraphic" dx="0" dy="0" result="r"/>
        <feColorMatrix in="r" type="matrix" result="ro"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
        <feColorMatrix in="SourceGraphic" type="matrix" result="go"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
        <feOffset id="vfx-b" in="SourceGraphic" dx="0" dy="0" result="b"/>
        <feColorMatrix in="b" type="matrix" result="bo"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
        <feBlend in="ro" in2="go" mode="screen" result="rg"/>
        <feBlend in="rg" in2="bo" mode="screen"/>
      </filter>
    </defs>`;
    document.body.prepend(svg);
  }

  /* =========================================================
     2) CHROMATIC ABERRATION — scroll-only, no rAF loop
     ========================================================= */
  function initChromatic() {
    const chromaR = document.getElementById("vfx-r");
    const chromaB = document.getElementById("vfx-b");
    if (!chromaR || !chromaB) return;

    // Collect unique media containers
    const containers = [];
    const seen = new WeakSet();
    document.querySelectorAll("main img, main video, main iframe, iframe").forEach((el) => {
      // Ignore hero section carousel immediately so we don't conflict with its grayscale/brightness filters
      if (el.closest('.animate-slow-pan')) return;
      
      const c =
        el.closest('[class*="aspect-"]') ||
        el.closest(".stage-image-container") ||
        el.parentElement;
      if (c && !seen.has(c) && !c.closest("nav") && !c.closest("footer")) {
        seen.add(c);
        containers.push(c);
      }
    });
    if (!containers.length) return;

    // Edge dissolution masks (one-time, pure CSS)
    const MASK =
      "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)";
    const MASK_V =
      "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)";
    containers.forEach((el) => {
      el.style.WebkitMaskImage = `${MASK}, ${MASK_V}`;
      el.style.WebkitMaskComposite = "source-in";
      el.style.maskImage = `${MASK}, ${MASK_V}`;
      el.style.maskComposite = "intersect";
    });

    let lastY = window.scrollY;
    let velocity = 0;
    let active = false;
    let decayTimer = null;

    function applyChroma(v) {
      const c = Math.min(v * 0.1, 3);
      if (c < 0.15) {
        if (active) {
          active = false;
          chromaR.setAttribute("dx", "0");
          chromaR.setAttribute("dy", "0");
          chromaB.setAttribute("dx", "0");
          chromaB.setAttribute("dy", "0");
          for (let i = 0; i < containers.length; i++) {
            containers[i].style.filter = "";
          }
        }
        return;
      }
      if (!active) {
        active = true;
        for (let i = 0; i < containers.length; i++) {
          containers[i].style.filter = "url(#vfx-chroma)";
        }
      }
      chromaR.setAttribute("dx", c.toFixed(1));
      chromaB.setAttribute("dx", (-c).toFixed(1));
    }

    function decay() {
      velocity *= 0.8;
      applyChroma(velocity);
      if (velocity > 0.5) {
        decayTimer = requestAnimationFrame(decay);
      } else {
        applyChroma(0);
        decayTimer = null;
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        velocity = Math.abs(window.scrollY - lastY);
        lastY = window.scrollY;
        applyChroma(velocity);

        // Start decay chain if not running
        if (decayTimer) cancelAnimationFrame(decayTimer);
        decayTimer = requestAnimationFrame(decay);
      },
      { passive: true },
    );
  }

  /* =========================================================
     3) STATIC GRAIN — one-time canvas → CSS background, no loop
     ========================================================= */
  function initGrain() {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 14;
    }
    ctx.putImageData(img, 0, 0);

    const grain = document.createElement("div");
    grain.id = "vfx-grain";
    grain.style.backgroundImage = `url(${c.toDataURL()})`;
    document.body.appendChild(grain);
  }

  /* =========================================================
     4) VIGNETTE — pure CSS, zero cost
     ========================================================= */
  function initVignette() {
    const v = document.createElement("div");
    v.id = "vfx-vignette";
    document.body.appendChild(v);
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function init() {
    injectSVGFilter();
    initChromatic();
    initGrain();
    initVignette();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    requestAnimationFrame(init);
  }
})();
