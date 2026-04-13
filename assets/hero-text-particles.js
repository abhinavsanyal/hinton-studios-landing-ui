// Hinton Studios — Cinematic Hero Text Blur Effect
// Subtle mouse-following frosted-glass radial blur + glow on "Cinema Redefined"
// Inspired by Google Flow — text stays SHARP, effect is a subtle luminous distortion
// Works on both desktop and mobile

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function init() {
    const heroTitle = document.querySelector('[data-hero-title]');
    if (!heroTitle) return;

    const heroContent = heroTitle.closest('.relative.z-10');
    if (!heroContent) return;

    const MOBILE_BP = 768;
    const isMobile = window.innerWidth < MOBILE_BP;

    // ---- Configuration ----
    const GLOW_RADIUS = isMobile ? 100 : 160;     // radius of the blur glow circle
    const GLOW_INTENSITY = 0.12;                    // max opacity of the glow (subtle!)
    const PARTICLE_COUNT = isMobile ? 30 : 60;      // very few drifting particles
    const PARTICLE_DRIFT = 40;                       // how far particles drift
    const FOLLOW_SPEED = 0.08;                       // how quickly the glow follows the mouse
    const COLOR = new THREE.Color(0x9093ff);         // tertiary brand color

    // ---- Setup Canvas Overlay ----
    const container = document.createElement('div');
    container.id = 'hero-text-particles';
    container.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 12;
      mix-blend-mode: screen;
    `;
    heroContent.style.position = 'relative';
    heroContent.appendChild(container);

    // ---- Renderer ----
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;

    // ---- The Glow Circle — frosted-glass radial blur ----
    // A single large soft circle that follows the mouse
    const glowGeo = new THREE.PlaneGeometry(GLOW_RADIUS * 2, GLOW_RADIUS * 2);
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uOpacity: { value: 0.0 },
        uColor: { value: new THREE.Vector3(COLOR.r, COLOR.g, COLOR.b) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          vec2 c = vUv - 0.5;
          float d = length(c);
          
          // Multi-layer soft radial gradient — like frosted glass
          float glow = exp(-d * d * 8.0) * 0.6;       // inner bright core
          float halo = exp(-d * d * 3.0) * 0.3;       // mid-range halo
          float outer = exp(-d * d * 1.5) * 0.1;      // very soft outer bloom
          
          float combined = glow + halo + outer;
          
          // Subtle chromatic shift — slightly different color at edges
          vec3 col = uColor;
          col = mix(col, vec3(1.0), glow * 0.3); // whiten the core slightly
          
          gl_FragColor = vec4(col, combined * uOpacity);
        }
      `,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.z = 0;
    glowMesh.visible = false;
    scene.add(glowMesh);

    // ---- Micro-particles — very subtle drifting motes ----
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleHomeX = new Float32Array(PARTICLE_COUNT);
    const particleHomeY = new Float32Array(PARTICLE_COUNT);
    const particleVelX = new Float32Array(PARTICLE_COUNT);
    const particleVelY = new Float32Array(PARTICLE_COUNT);
    const particleLife = new Float32Array(PARTICLE_COUNT);
    const particleSizes = new Float32Array(PARTICLE_COUNT);
    const particleOpacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = -9999;
      particlePositions[i * 3 + 1] = -9999;
      particlePositions[i * 3 + 2] = 0;
      particleLife[i] = 0;
      particleSizes[i] = 1.5 + Math.random() * 2.5;
      particleOpacities[i] = 0;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
    pGeo.setAttribute('aOpacity', new THREE.BufferAttribute(particleOpacities, 1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Vector3(COLOR.r * 0.8 + 0.2, COLOR.g * 0.8 + 0.2, COLOR.b * 0.8 + 0.2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = dot(uv, uv);
          float a = exp(-d * 12.0) * vOpacity;
          if (a < 0.005) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // ---- Mouse/Touch tracking ----
    const pointer = { x: -9999, y: -9999, active: false };
    const smoothPointer = { x: -9999, y: -9999 };
    let nextParticle = 0;

    function onPointerMove(e) {
      const rect = heroContent.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.x = cx - rect.left;
      pointer.y = cy - rect.top;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    heroContent.addEventListener('pointermove', onPointerMove, { passive: true });
    heroContent.addEventListener('pointerleave', onPointerLeave);
    heroContent.addEventListener('touchmove', onPointerMove, { passive: true });
    heroContent.addEventListener('touchend', onPointerLeave);

    // ---- Check if pointer is near the title text ----
    function isNearTitle(px, py) {
      const rect = heroTitle.getBoundingClientRect();
      const containerRect = heroContent.getBoundingClientRect();
      const titleLeft = rect.left - containerRect.left - 40;
      const titleTop = rect.top - containerRect.top - 40;
      const titleRight = titleLeft + rect.width + 80;
      const titleBottom = titleTop + rect.height + 80;
      return px >= titleLeft && px <= titleRight && py >= titleTop && py <= titleBottom;
    }

    // ---- Resize ----
    let containerW = 0, containerH = 0;
    function resize() {
      containerW = heroContent.clientWidth;
      containerH = heroContent.clientHeight;
      renderer.setSize(containerW, containerH, false);
      camera.left = 0;
      camera.right = containerW;
      camera.top = 0;
      camera.bottom = containerH;
      camera.updateProjectionMatrix();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    resize();

    // ---- Animation Loop ----
    let running = true;
    let lastFrame = 0;
    const FPS_CAP = 1000 / (isMobile ? 24 : 40);
    let currentOpacity = 0;

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    io.observe(heroContent);

    function loop(now) {
      requestAnimationFrame(loop);
      if (!running) return;
      if (now - lastFrame < FPS_CAP) return;
      lastFrame = now;

      const isActive = pointer.active && isNearTitle(pointer.x, pointer.y);

      // Smooth follow
      if (isActive) {
        if (smoothPointer.x < -5000) {
          smoothPointer.x = pointer.x;
          smoothPointer.y = pointer.y;
        }
        smoothPointer.x += (pointer.x - smoothPointer.x) * FOLLOW_SPEED;
        smoothPointer.y += (pointer.y - smoothPointer.y) * FOLLOW_SPEED;
        currentOpacity += (GLOW_INTENSITY - currentOpacity) * 0.08;
      } else {
        currentOpacity += (0 - currentOpacity) * 0.06;
      }

      // Update glow circle
      if (currentOpacity > 0.002) {
        glowMesh.visible = true;
        glowMesh.position.x = smoothPointer.x;
        glowMesh.position.y = smoothPointer.y;
        glowMat.uniforms.uOpacity.value = currentOpacity;
      } else {
        glowMesh.visible = false;
      }

      // Spawn micro-particles when active near the title
      if (isActive && Math.random() < 0.3) {
        const idx = nextParticle;
        nextParticle = (nextParticle + 1) % PARTICLE_COUNT;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * GLOW_RADIUS * 0.6;
        particlePositions[idx * 3] = smoothPointer.x + Math.cos(angle) * dist;
        particlePositions[idx * 3 + 1] = smoothPointer.y + Math.sin(angle) * dist;
        particleVelX[idx] = (Math.random() - 0.5) * 1.5;
        particleVelY[idx] = -Math.random() * 1.2 - 0.3; // drift upward
        particleLife[idx] = 1.0;
        particleOpacities[idx] = 0.4 + Math.random() * 0.3;
      }

      // Update particles
      const posArr = pGeo.attributes.position.array;
      const opArr = pGeo.attributes.aOpacity.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (particleLife[i] > 0) {
          particleLife[i] -= 0.012;
          posArr[i * 3] += particleVelX[i];
          posArr[i * 3 + 1] += particleVelY[i];
          particleVelX[i] *= 0.98;
          particleVelY[i] *= 0.98;
          opArr[i] = particleOpacities[i] * particleLife[i] * particleLife[i];
        } else {
          opArr[i] = 0;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.aOpacity.needsUpdate = true;

      renderer.render(scene, camera);
    }

    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(init);
  }
})();
