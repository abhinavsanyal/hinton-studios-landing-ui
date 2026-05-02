/**
 * Logo Glitch Effect
 * Creates a looping Three.js-style RGB channel split glitch on the navbar logo.
 * Uses a canvas-based approach for GPU-accelerated pixel manipulation.
 */
(function() {
  'use strict';

  const GLITCH_INTERVAL = 4000;   // ms between glitch bursts
  const GLITCH_DURATION = 300;    // ms per glitch burst
  const GLITCH_FRAMES = 6;       // frames per burst

  function initLogoGlitch() {
    const logoImg = document.getElementById('nav-logo-img');
    if (!logoImg || !logoImg.complete) {
      if (logoImg) {
        logoImg.addEventListener('load', () => initLogoGlitch());
      }
      return;
    }

    const container = logoImg.parentElement;
    if (!container) return;

    // Create canvas overlay for glitch effect
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = logoImg.naturalWidth;
    const h = logoImg.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.cssText = `
      position: absolute; 
      inset: 0; 
      width: 100%; 
      height: 100%; 
      pointer-events: none; 
      opacity: 0; 
      transition: opacity 0.05s;
      image-rendering: auto;
    `;
    container.style.position = 'relative';
    container.appendChild(canvas);

    // Draw original to extract pixel data
    ctx.drawImage(logoImg, 0, 0, w, h);

    function doGlitchBurst() {
      let frame = 0;
      canvas.style.opacity = '1';
      logoImg.style.opacity = '0';

      function renderFrame() {
        if (frame >= GLITCH_FRAMES) {
          canvas.style.opacity = '0';
          logoImg.style.opacity = '1';
          return;
        }

        ctx.clearRect(0, 0, w, h);

        // Random slice glitches
        const sliceCount = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < sliceCount; i++) {
          const sliceY = Math.floor(Math.random() * h);
          const sliceH = 2 + Math.floor(Math.random() * (h * 0.15));
          const offsetX = (Math.random() - 0.5) * w * 0.08;
          ctx.drawImage(logoImg, 0, sliceY, w, sliceH, offsetX, sliceY, w, sliceH);
        }

        // Base image
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.85;
        ctx.drawImage(logoImg, 0, 0, w, h);

        // Red channel shift
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.4;
        const rShift = (Math.random() - 0.5) * 6;
        ctx.drawImage(logoImg, rShift, 0, w, h);

        // Blue channel shift (opposite direction)
        ctx.globalAlpha = 0.3;
        ctx.drawImage(logoImg, -rShift * 0.7, 0, w, h);

        // Scanline effect
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#000';
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1);
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        frame++;
        setTimeout(renderFrame, GLITCH_DURATION / GLITCH_FRAMES);
      }

      renderFrame();
    }

    // Initial glitch after short delay
    setTimeout(doGlitchBurst, 1500);

    // Looping glitch
    setInterval(doGlitchBurst, GLITCH_INTERVAL);

    // Glitch on hover
    container.addEventListener('mouseenter', doGlitchBurst);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoGlitch);
  } else {
    initLogoGlitch();
  }
})();
