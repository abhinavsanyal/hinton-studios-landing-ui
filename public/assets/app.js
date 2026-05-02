// Hinton Studios — shared interactions

(function () {
  // Mark current nav link as active based on pathname
  document.addEventListener('DOMContentLoaded', () => {
    // === WHATSAPP FLOATING BUTTON ===
    function injectWhatsApp() {
      // Create anchor wrapper
      const btn = document.createElement('a');
      btn.href = 'https://wa.me/918145533622';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.id = 'wa-floating-btn';
      // Aesthetic: Dark grey/black gradient, glass border, drop shadow
      btn.className = 'fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#1c1c1c] to-[#040404] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden group pointer-events-auto cursor-pointer';
      
      // Expanding glass ring on hover
      const ring = document.createElement('div');
      ring.className = 'absolute inset-0 rounded-full border border-white/5 scale-[0.8] opacity-0 group-hover:scale-[1.1] group-hover:opacity-100 transition-all duration-700 ease-out pointer-events-none';
      
      // WhatsApp SVG Icon
      const svgDiv = document.createElement('div');
      svgDiv.className = 'relative z-10 text-[#a3a3a3] group-hover:text-white transition-colors duration-500 flex items-center justify-center pointer-events-none';
      svgDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';

      // Inner blur glow (Tertiary accent)
      const glow = document.createElement('div');
      glow.className = 'absolute inset-0 bg-[#9093ff] opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity duration-700 pointer-events-none';

      btn.appendChild(glow);
      btn.appendChild(ring);
      btn.appendChild(svgDiv);
      document.body.appendChild(btn);

      // Setup GSAP micro-interactions
      function setupGSAP() {
        if (!window.gsap) {
          setTimeout(setupGSAP, 50);
          return;
        }
        const gsap = window.gsap;

        // Intro animation
        gsap.fromTo(btn, 
          { y: 100, opacity: 0, scale: 0.5 }, 
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.5)', delay: 1 }
        );
        
        // Hover dynamics
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.05, y: -4, rotation: 5, duration: 0.4, ease: 'power2.out' });
          gsap.to(svgDiv, { rotation: -5, scale: 1.15, duration: 0.4, ease: 'back.out(2)' });
        });
        
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, y: 0, rotation: 0, x: 0, duration: 0.6, ease: 'power2.out' });
          gsap.to(svgDiv, { rotation: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
        });
        
        // Magnetic pull effect
        btn.addEventListener('pointermove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - (rect.left + rect.width / 2)) * 0.4;
          const y = (e.clientY - (rect.top + rect.height / 2)) * 0.4;
          gsap.to(btn, { x: x, y: y, duration: 0.4, ease: 'power2.out' });
        });
      }
      setupGSAP();
    }
    injectWhatsApp();

    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('[data-nav]').forEach((el) => {
      const target = el.getAttribute('data-nav').toLowerCase();
      const isActive = (target === path) || (target === 'index.html' && (path === '' || path === '/'));
      if (isActive) {
        el.classList.remove('text-[#767575]');
        el.classList.add('text-[#c6c6c6]', 'border-b-2', 'border-[#9093ff]', 'pb-1');
      } else {
        el.classList.add('text-[#767575]');
        el.classList.remove('text-[#c6c6c6]', 'border-b-2', 'border-[#9093ff]', 'pb-1');
      }
    });

    // Live clock ticker in footer/nav
    const clockEls = document.querySelectorAll('[data-clock]');
    if (clockEls.length) {
      const tick = () => {
        const d = new Date();
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mm = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        clockEls.forEach((el) => (el.textContent = `${hh}:${mm}:${ss} UTC`));
      };
      tick();
      setInterval(tick, 1000);
    }

    // Scroll progress indicator
    const progress = document.getElementById('scroll-progress');
    if (progress) {
      const onScroll = () => {
        const h = document.documentElement;
        const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
        progress.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Reveal-on-scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  });
})();
