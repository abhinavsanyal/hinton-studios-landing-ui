// Hinton Studios — GSAP + ScrollTrigger Scroll Animations
// Premium scroll-driven animations for all pages

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Wait for GSAP to be available
  function waitForGSAP(cb) {
    if (window.gsap && window.ScrollTrigger) {
      cb();
    } else {
      setTimeout(() => waitForGSAP(cb), 50);
    }
  }

  waitForGSAP(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    // Default ease — cinematic, smooth
    const EASE = 'power3.out';
    const EASE_SMOOTH = 'power2.out';
    const EASE_EXPO = 'expo.out';

    /* =========================================================
       UTILITY: Split text into words/chars for animation
       ========================================================= */
    function splitTextIntoSpans(el, type = 'words') {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      el.innerHTML = '';

      if (type === 'words') {
        // Split by words, preserve line breaks from <br>
        const originalHTML = el.getAttribute('data-original-html') || text;
        const words = text.split(/\s+/).filter(Boolean);
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.className = 'gsap-word';
          span.style.cssText = 'display:inline-block; overflow:hidden;';
          const inner = document.createElement('span');
          inner.className = 'gsap-word-inner';
          inner.style.cssText = 'display:inline-block;';
          inner.textContent = word;
          span.appendChild(inner);
          el.appendChild(span);
          if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        return el.querySelectorAll('.gsap-word-inner');
      }

      if (type === 'chars') {
        const chars = text.split('');
        chars.forEach((char) => {
          const span = document.createElement('span');
          span.className = 'gsap-char';
          span.style.cssText = 'display:inline-block;';
          span.textContent = char === ' ' ? '\u00A0' : char;
          el.appendChild(span);
        });
        return el.querySelectorAll('.gsap-char');
      }
    }

    /* =========================================================
       1) NAVIGATION — subtle slide-down on load
       ========================================================= */
    function animateNav() {
      const nav = document.querySelector('nav.fixed');
      if (!nav) return;

      gsap.fromTo(nav,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: EASE, delay: 0.2 }
      );

      // Nav hide/show on scroll direction
      let lastScroll = 0;
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const scrollY = window.scrollY;
          if (scrollY > 200) {
            if (scrollY > lastScroll && self.direction === 1) {
              gsap.to(nav, { y: -100, duration: 0.4, ease: EASE_SMOOTH });
            } else {
              gsap.to(nav, { y: 0, duration: 0.4, ease: EASE_SMOOTH });
            }
          }
          lastScroll = scrollY;
        }
      });
    }

    /* =========================================================
       2) HERO SECTION — cinematic entrance
       ========================================================= */
    function animateHero() {
      const hero = document.querySelector('[data-hero-canvas]');
      if (!hero) return;

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      // Status bar
      const statusBar = hero.querySelector('[data-reveal]:first-of-type');
      if (statusBar) {
        tl.fromTo(statusBar,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.8 },
          0.5
        );
      }

      // Hero title — word-by-word reveal
      const heroTitle = hero.querySelector('[data-hero-title]');
      if (heroTitle) {
        // Remove data-reveal to prevent conflict
        heroTitle.removeAttribute('data-reveal');
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'none';

        const lines = heroTitle.innerHTML.split('<br');
        heroTitle.innerHTML = '';
        lines.forEach((line, i) => {
          const div = document.createElement('div');
          div.style.cssText = 'overflow:hidden; display:block;';
          div.className = 'hero-line';
          // Re-add <br tag if it was split off (except first)
          div.innerHTML = (i > 0 ? '<br' : '') + line;
          heroTitle.appendChild(div);
        });

        const heroLines = heroTitle.querySelectorAll('.hero-line');
        tl.fromTo(heroLines,
          { y: '110%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out' },
          0.6
        );

        // Scroll-based parallax fade for hero title
        gsap.to(heroTitle, {
          y: -80,
          opacity: 0.15,
          scale: 0.97,
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          }
        });
      }

      // Description and CTA
      const descReveal = hero.querySelector('[data-reveal][style*="reveal-delay"]');
      if (descReveal) {
        descReveal.removeAttribute('data-reveal');
        descReveal.style.opacity = '1';
        descReveal.style.transform = 'none';

        const desc = descReveal.querySelector('p');
        const cta = descReveal.querySelector('.group');

        if (desc) {
          tl.fromTo(desc,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9 },
            1.2
          );
        }
        if (cta) {
          tl.fromTo(cta,
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 },
            1.4
          );
        }
      }

      // Bottom stats bar
      const statsBar = hero.querySelector('.hidden.lg\\:flex.absolute.bottom-12');
      if (statsBar) {
        statsBar.style.opacity = '0';
        tl.fromTo(statsBar,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          1.6
        );
      }

      // Monitor brackets
      const brackets = hero.querySelectorAll('.monitor-bracket');
      tl.fromTo(brackets,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' },
        1.0
      );
    }

    /* =========================================================
       3) GENERAL REVEAL — replaces data-reveal CSS
       ========================================================= */
    function animateReveals() {
      const reveals = document.querySelectorAll('[data-reveal]');

      reveals.forEach((el) => {
        // Clear existing CSS transition styles
        el.style.transition = 'none';

        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--reveal-delay')) || 0;

        gsap.fromTo(el,
          {
            opacity: 0,
            y: 40,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: delay / 1000,
            ease: EASE,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
            onComplete: () => {
              el.classList.add('is-visible');
            }
          }
        );
      });
    }

    /* =========================================================
       4) BENTO GRID — staggered card animations (index.html)
       ========================================================= */
    function animateBentoGrid() {
      const bentoGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-12.gap-8');
      if (!bentoGrid) return;

      const cards = bentoGrid.children;
      if (!cards.length) return;

      // Override data-reveal on these cards (handled here instead)
      Array.from(cards).forEach(card => {
        card.removeAttribute('data-reveal');
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.transition = 'none';
      });

      // Large hero card — slide from left with clip
      const heroCard = cards[0];
      if (heroCard) {
        gsap.fromTo(heroCard,
          { opacity: 0, x: -80, clipPath: 'inset(0 100% 0 0)' },
          {
            opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)',
            duration: 1.2, ease: EASE_EXPO,
            scrollTrigger: { trigger: heroCard, start: 'top 85%' }
          }
        );
      }

      // Methodology card — slide from right
      if (cards[1]) {
        gsap.fromTo(cards[1],
          { opacity: 0, x: 60, y: 30 },
          {
            opacity: 1, x: 0, y: 0,
            duration: 1, ease: EASE, delay: 0.2,
            scrollTrigger: { trigger: cards[1], start: 'top 85%' }
          }
        );
      }

      // Square image card — scale reveal
      if (cards[2]) {
        gsap.fromTo(cards[2],
          { opacity: 0, scale: 0.85, rotate: -2 },
          {
            opacity: 1, scale: 1, rotate: 0,
            duration: 1.1, ease: EASE_EXPO,
            scrollTrigger: { trigger: cards[2], start: 'top 85%' }
          }
        );
      }

      // Wide text card — slide up
      if (cards[3]) {
        gsap.fromTo(cards[3],
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 1, ease: EASE, delay: 0.15,
            scrollTrigger: { trigger: cards[3], start: 'top 85%' }
          }
        );
      }

      // Parallax on images within bento
      bentoGrid.querySelectorAll('img').forEach(img => {
        gsap.to(img, {
          y: -30,
          scrollTrigger: {
            trigger: img.closest('[class*="col-span"]'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          }
        });
      });
    }

    /* =========================================================
       5) SECTION HEADERS — label + title stagger
       ========================================================= */
    function animateSectionHeaders() {
      document.querySelectorAll('section').forEach(section => {
        const label = section.querySelector('.font-label.text-tertiary');
        const heading = section.querySelector('h2, h3');

        if (label && heading && !heading.closest('[data-hero-canvas]')) {
          // Subtle line draw for labels
          gsap.fromTo(label,
            { opacity: 0, x: -20, letterSpacing: '0.1em' },
            {
              opacity: 1, x: 0, letterSpacing: getComputedStyle(label).letterSpacing,
              duration: 0.8, ease: EASE,
              scrollTrigger: { trigger: label, start: 'top 90%' }
            }
          );
        }
      });
    }

    /* =========================================================
       6) CTA STRIP — dramatic reveal with scale
       ========================================================= */
    function animateCTA() {
      // Main CTA text
      document.querySelectorAll('section').forEach(section => {
        const h3 = section.querySelector('h3.font-headline');
        const ctaLink = section.querySelector('a[href*="contact"]');

        if (h3 && ctaLink && h3.textContent.includes('Transcendence') || h3 && h3.textContent.includes('Begin')) {
          // Scale-based text entrance
          gsap.fromTo(h3,
            { opacity: 0, scale: 0.8, y: 40 },
            {
              opacity: 1, scale: 1, y: 0,
              duration: 1.2, ease: EASE_EXPO,
              scrollTrigger: {
                trigger: h3,
                start: 'top 85%',
                end: 'top 40%',
                scrub: false,
              }
            }
          );

          // Scrub-based subtle rotation
          gsap.to(h3, {
            rotateX: -5,
            scale: 1.02,
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 2,
            }
          });
        }
      });
    }

    /* =========================================================
       7) WORK PAGE — gallery animations
       ========================================================= */
    function animateWorkGallery() {
      const gallery = document.querySelector('section.flex.flex-col.gap-32');
      if (!gallery) return;

      const projects = gallery.querySelectorAll('[data-reveal]');

      projects.forEach((project, i) => {
        project.removeAttribute('data-reveal');
        project.style.opacity = '1';
        project.style.transform = 'none';
        project.style.transition = 'none';

        const img = project.querySelector('img');
        const titleH2 = project.querySelector('h2');
        const meta = project.querySelectorAll('.font-label');
        const isEven = i % 2 === 1;

        // Image reveal with clip-path
        const imgContainer = project.querySelector('[class*="aspect-"]');
        if (imgContainer) {
          const clipFrom = isEven ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
          gsap.fromTo(imgContainer,
            { clipPath: clipFrom, opacity: 0 },
            {
              clipPath: 'inset(0 0% 0 0%)', opacity: 1,
              duration: 1.4, ease: EASE_EXPO,
              scrollTrigger: { trigger: project, start: 'top 80%' }
            }
          );
        }

        // Image parallax on scroll
        if (img) {
          gsap.fromTo(img,
            { scale: 1.15 },
            {
              scale: 1,
              scrollTrigger: {
                trigger: project,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
              }
            }
          );
        }

        // Title slide in
        if (titleH2) {
          gsap.fromTo(titleH2,
            { opacity: 0, x: isEven ? 60 : -60, y: 20 },
            {
              opacity: 1, x: 0, y: 0,
              duration: 1, ease: EASE, delay: 0.3,
              scrollTrigger: { trigger: project, start: 'top 75%' }
            }
          );
        }

        // Meta labels stagger
        if (meta.length) {
          gsap.fromTo(meta,
            { opacity: 0, y: 15 },
            {
              opacity: 1, y: 0,
              duration: 0.6, stagger: 0.1, delay: 0.5, ease: EASE,
              scrollTrigger: { trigger: project, start: 'top 75%' }
            }
          );
        }
      });

      // Closer section
      const closer = document.querySelector('.mt-64, .mt-96');
      if (closer) {
        const closerReveal = closer.querySelector('[data-reveal]');
        if (closerReveal) {
          closerReveal.removeAttribute('data-reveal');
          closerReveal.style.opacity = '1';
          closerReveal.style.transform = 'none';

          const closerH3 = closerReveal.querySelector('h3');
          if (closerH3) {
            gsap.fromTo(closerH3,
              { opacity: 0, y: 40, scale: 0.95 },
              {
                opacity: 1, y: 0, scale: 1,
                duration: 1.1, ease: EASE_EXPO,
                scrollTrigger: { trigger: closerReveal, start: 'top 80%' }
              }
            );
          }

          const buttons = closerReveal.querySelectorAll('a');
          gsap.fromTo(buttons,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0,
              duration: 0.7, stagger: 0.15, delay: 0.4, ease: EASE,
              scrollTrigger: { trigger: closerReveal, start: 'top 80%' }
            }
          );
        }
      }
    }

    /* =========================================================
       8) PROCESS PAGE — stage animations + SVG draw
       ========================================================= */
    function animateProcess() {
      // SVG connector path — draw on scroll
      const svgPath = document.querySelector('.animated-path');
      if (svgPath) {
        // Reset CSS animation
        svgPath.style.animation = 'none';
        const length = svgPath.getTotalLength ? svgPath.getTotalLength() : 2000;
        svgPath.style.strokeDasharray = length;
        svgPath.style.strokeDashoffset = length;

        gsap.to(svgPath, {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: svgPath.closest('section'),
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          }
        });
      }

      // Stage blocks
      const stages = document.querySelectorAll('.flex.flex-col.lg\\:flex-row.gap-16');
      stages.forEach((stage, i) => {
        stage.removeAttribute('data-reveal');
        stage.style.opacity = '1';
        stage.style.transform = 'none';
        stage.style.transition = 'none';

        const imgContainer = stage.querySelector('.stage-image-container');
        const textBlock = stage.querySelector('[class*="lg:w-2/5"]');
        const outlinedNum = stage.querySelector('.outlined-num');
        const isEven = i % 2 === 1;

        // Outlined number — fade in with scale
        if (outlinedNum) {
          gsap.fromTo(outlinedNum,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 0.2, scale: 1,
              duration: 1.2, ease: EASE_EXPO,
              scrollTrigger: { trigger: stage, start: 'top 80%' }
            }
          );
        }

        // Image — clip-path reveal
        if (imgContainer) {
          const direction = isEven ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
          gsap.fromTo(imgContainer,
            { clipPath: direction, opacity: 0.5 },
            {
              clipPath: 'inset(0 0% 0 0%)', opacity: 1,
              duration: 1.3, ease: EASE_EXPO,
              scrollTrigger: { trigger: stage, start: 'top 75%' }
            }
          );

          // Inner image parallax
          const img = imgContainer.querySelector('img');
          if (img) {
            gsap.fromTo(img,
              { scale: 1.12 },
              {
                scale: 1,
                scrollTrigger: {
                  trigger: stage,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 2,
                }
              }
            );
          }
        }

        // Text content — staggered reveal
        if (textBlock) {
          const children = textBlock.children;
          gsap.fromTo(children,
            { opacity: 0, y: 25 },
            {
              opacity: 1, y: 0,
              duration: 0.8, stagger: 0.1, delay: 0.3, ease: EASE,
              scrollTrigger: { trigger: stage, start: 'top 75%' }
            }
          );
        }

        // Tags — slide in
        const tags = stage.querySelectorAll('.flex.flex-wrap.gap-3 span');
        if (tags.length) {
          gsap.fromTo(tags,
            { opacity: 0, x: -20, scale: 0.9 },
            {
              opacity: 1, x: 0, scale: 1,
              duration: 0.6, stagger: 0.1, delay: 0.6, ease: EASE,
              scrollTrigger: { trigger: stage, start: 'top 70%' }
            }
          );
        }
      });
    }

    /* =========================================================
       9) SERVICES PAGE — bento + form + stats
       ========================================================= */
    function animateServices() {
      // Services bento grid
      const serviceGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-12.gap-px');
      if (serviceGrid) {
        const serviceCards = serviceGrid.children;
        Array.from(serviceCards).forEach((card, i) => {
          card.removeAttribute('data-reveal');
          card.style.opacity = '1';
          card.style.transform = 'none';
          card.style.transition = 'none';

          // Each card gets a unique entrance
          const entrances = [
            { x: -60, y: 0, rotate: -1 },    // AI Film — slide from left
            { x: 60, y: 0, rotate: 1 },       // Short Films — slide from right
            { x: 0, y: 50, rotate: 0 },       // TV Commercials — rise up
            { x: 0, y: 50, rotate: 0 },       // UGCs — rise up
            { x: 0, y: 50, rotate: 0 },       // Creative Strategy — rise up
          ];

          const entrance = entrances[i] || { x: 0, y: 50, rotate: 0 };

          gsap.fromTo(card,
            { opacity: 0, x: entrance.x, y: entrance.y, rotate: entrance.rotate },
            {
              opacity: 1, x: 0, y: 0, rotate: 0,
              duration: 1, ease: EASE_EXPO,
              delay: i * 0.08,
              scrollTrigger: { trigger: card, start: 'top 88%' }
            }
          );

          // Inner image parallax
          const img = card.querySelector('img');
          if (img) {
            gsap.to(img, {
              y: -20,
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
              }
            });
          }
        });
      }

      // Stats counter animation
      const statEls = document.querySelectorAll('.font-headline.text-3xl.font-bold.text-primary');
      statEls.forEach(el => {
        const text = el.textContent.trim();
        const match = text.match(/^([\d.]+)(\D*)$/);
        if (!match) return;

        const target = parseFloat(match[1]);
        const suffix = match[2];
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = (target % 1 === 0 ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
          }
        });
      });

      // Form fields — sequential reveal
      const form = document.querySelector('form');
      if (form) {
        const formFields = form.querySelectorAll('.space-y-4, .grid, button');
        gsap.fromTo(formFields,
          { opacity: 0, y: 25 },
          {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.12, ease: EASE,
            scrollTrigger: { trigger: form, start: 'top 80%' }
          }
        );
      }

      // GO VIRAL headline
      const viralSection = document.getElementById('contact');
      if (viralSection) {
        const viralH2 = viralSection.querySelector('h2');
        if (viralH2) {
          gsap.fromTo(viralH2,
            { opacity: 0, scale: 0.7, y: 60 },
            {
              opacity: 1, scale: 1, y: 0,
              duration: 1.4, ease: EASE_EXPO,
              scrollTrigger: { trigger: viralH2, start: 'top 85%' }
            }
          );
        }
      }
    }

    /* =========================================================
       10) FOOTER — subtle entrance
       ========================================================= */
    function animateFooter() {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const children = footer.querySelector('.max-w-7xl')?.children;
      if (!children) return;

      gsap.fromTo(children,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.6, stagger: 0.1, ease: EASE,
          scrollTrigger: { trigger: footer, start: 'top 95%' }
        }
      );
    }

    /* =========================================================
       11) HORIZONTAL SCROLL TEXT — marquee for section labels
       ========================================================= */
    function animateHorizontalText() {
      // Limit to only major page headings (h1 only) — reduces ScrollTrigger count
      document.querySelectorAll('h1').forEach(heading => {
        if (heading.closest('[data-hero-canvas]')) return;
        if (heading.closest('nav')) return;

        gsap.to(heading, {
          x: -10,
          scrollTrigger: {
            trigger: heading,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          }
        });
      });
    }

    /* =========================================================
       12) SMOOTH PARALLAX LAYERS — background blurs + images
       ========================================================= */
    function animateParallaxLayers() {
      // Hero background image — parallax (only one element, cheap)
      const heroBgImg = document.querySelector('[data-hero-canvas] .absolute.inset-0 img');
      if (heroBgImg) {
        gsap.to(heroBgImg, {
          y: 80,
          scrollTrigger: {
            trigger: heroBgImg.closest('[data-hero-canvas]'),
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
          }
        });
      }
    }

    /* =========================================================
       13) WORK PAGE HEADER — cinematic title split
       ========================================================= */
    function animateWorkHeader() {
      const header = document.querySelector('header[data-reveal]');
      if (!header) return;
      if (!document.querySelector('section.flex.flex-col.gap-32')) return; // Only work page

      header.removeAttribute('data-reveal');
      header.style.opacity = '1';
      header.style.transform = 'none';
      header.style.transition = 'none';

      const label = header.querySelector('.font-label');
      const h1 = header.querySelector('h1');
      const metaBlock = header.querySelector('.hidden.md\\:flex.flex-col');

      const tl = gsap.timeline({ delay: 0.3 });

      if (label) {
        tl.fromTo(label,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE },
          0
        );
      }

      if (h1) {
        tl.fromTo(h1,
          { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: EASE_EXPO },
          0.1
        );
      }

      if (metaBlock) {
        tl.fromTo(metaBlock,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.8, ease: EASE },
          0.5
        );
      }
    }

    /* =========================================================
       14) PROCESS PAGE HEADER
       ========================================================= */
    function animateProcessHeader() {
      const processHero = document.querySelector('section[data-reveal]:first-of-type');
      if (!processHero) return;
      if (!document.querySelector('.animated-path')) return; // Only process page

      processHero.removeAttribute('data-reveal');
      processHero.style.opacity = '1';
      processHero.style.transform = 'none';
      processHero.style.transition = 'none';

      const grid = processHero.querySelector('.grid');
      if (!grid) return;

      const leftCol = grid.children[0];
      const rightCol = grid.children[1];

      if (leftCol) {
        const label = leftCol.querySelector('.font-label');
        const h1 = leftCol.querySelector('h1');

        if (label) {
          gsap.fromTo(label,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, delay: 0.3, ease: EASE }
          );
        }
        if (h1) {
          gsap.fromTo(h1,
            { opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.2, delay: 0.4, ease: EASE_EXPO }
          );
        }
      }

      if (rightCol) {
        gsap.fromTo(rightCol,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.9, delay: 0.6, ease: EASE }
        );
      }
    }

    /* =========================================================
       15) SERVICES PAGE HEADER
       ========================================================= */
    function animateServicesHeader() {
      const servicesHero = document.querySelector('section[data-reveal]');
      if (!servicesHero) return;
      if (!document.querySelector('.grid.grid-cols-1.md\\:grid-cols-12.gap-px')) return; // Only services page
      if (document.querySelector('[data-hero-canvas]')) return; // Not index

      servicesHero.removeAttribute('data-reveal');
      servicesHero.style.opacity = '1';
      servicesHero.style.transform = 'none';
      servicesHero.style.transition = 'none';

      const h1 = servicesHero.querySelector('h1');
      const label = servicesHero.querySelector('.font-label');
      const sidebar = servicesHero.querySelector('.max-w-xs');

      const tl = gsap.timeline({ delay: 0.3 });

      if (label) {
        tl.fromTo(label,
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.5, ease: EASE },
          0
        );
      }

      if (h1) {
        tl.fromTo(h1,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: EASE_EXPO },
          0.1
        );
      }

      if (sidebar) {
        tl.fromTo(sidebar,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.8, ease: EASE },
          0.5
        );
      }
    }

    /* =========================================================
       BOOT — Initialize all animations
       ========================================================= */
    function init() {
      // Page-specific header animations first (remove data-reveal before general handler)
      animateWorkHeader();
      animateProcessHeader();
      animateServicesHeader();

      // Core animations
      animateNav();
      animateHero();
      animateBentoGrid();

      // General reveals (for remaining data-reveal elements)
      animateReveals();

      // Section-specific
      animateSectionHeaders();
      animateCTA();
      animateWorkGallery();
      animateProcess();
      animateServices();

      // Ambient effects
      animateFooter();
      animateHorizontalText();
      animateParallaxLayers();

      // Refresh ScrollTrigger after all animations are set
      ScrollTrigger.refresh();
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // Small delay to let other scripts set up first
      requestAnimationFrame(() => requestAnimationFrame(init));
    }
  });
})();
