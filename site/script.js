// WasteWise — lightweight hero, no heavy animations
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Hero simple fade-in (no char split, no float)
requestAnimationFrame(() => {
  document.querySelector('.hero-title')?.classList.add('in');
  document.querySelector('.hero-sub')?.classList.add('in');
  document.querySelectorAll('.hero-bottom-text').forEach(el => el.classList.add('in'));
});

// Scroll progress + lightweight hero parallax (scale + fade only)
const progressBar = document.getElementById('scroll-progress');
const heroTitle = document.getElementById('hero-title');
const heroBottom = document.getElementById('hero-bottom');

function onScroll() {
  const scrollY = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (scrollY / docH) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';

  const progress = Math.min(1, scrollY / window.innerHeight);
  if (heroTitle) {
    const scale = 1 - progress * 0.35;
    const ty = progress * -40;
    heroTitle.style.transform = `scale(${scale}) translateY(${ty}px)`;
    heroTitle.style.opacity = String(1 - progress);
    heroTitle.style.transformOrigin = 'top center';
  }
  if (heroBottom) {
    heroBottom.style.opacity = String(1 - progress);
    heroBottom.style.transform = `translateY(${progress * 24}px)`;
  }
}
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal + counters (lightweight, no spotlight/magnetic/tilt)
const revealEls = document.querySelectorAll('.reveal');
const counterEls = document.querySelectorAll('.stat-value[data-target]');

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1400;
  const start = performance.now();
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const val = Math.floor(target * easeOutCubic(p));
    el.textContent = val.toLocaleString('en-IN') + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('en-IN') + suffix;
  }
  requestAnimationFrame(tick);
}

let countersFired = false;
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        if (entry.target.querySelector('.stat-value[data-target]') && !countersFired) {
          countersFired = true;
          counterEls.forEach((el, i) => setTimeout(() => animateCounter(el), i * 100));
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
  counterEls.forEach((el) => animateCounter(el));
}

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('mobile-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    })
  );
}
