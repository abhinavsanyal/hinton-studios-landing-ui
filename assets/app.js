// Hinton Studios — shared interactions

(function () {
  // Mark current nav link as active based on pathname
  document.addEventListener('DOMContentLoaded', () => {
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
