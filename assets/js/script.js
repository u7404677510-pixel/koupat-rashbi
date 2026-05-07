/* ============================================================
   KOUPAT HAYECHOUOT RASHBI — Interactivity
   - Header scroll state, mobile menu
   - Reveal-on-scroll
   - Animated counters
   - Haskamot carousel
   - Donation widget (frequency, amount, intent, summary, submit)
   - Quick donate (hero card → scroll & preselect)
   - Contact form (validation + success state)
============================================================ */

(() => {
  'use strict';

  /* ============================================================
     LEADS PERSISTENCE (localStorage)
     Used by both forms — read by /admin.html
  ============================================================ */
  const LEADS_KEY = 'kpht-leads';

  const saveLead = (type, data) => {
    try {
      const existing = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      existing.push({
        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        type, // "callback" | "contact"
        receivedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.pathname,
        data,
      });
      localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('[Leads] localStorage unavailable:', e);
    }
  };
  // Expose so admin can refresh from same tab
  window.__kpht = { LEADS_KEY };

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileMenu.classList.add('hidden'))
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('fr-FR');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('fr-FR');
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cObs.observe(c));
  } else {
    counters.forEach(runCounter);
  }


  /* ============================================================
     HASKAMOT CAROUSEL
  ============================================================ */
  const track = document.getElementById('haskamot-track');
  if (track) {
    const cards = track.querySelectorAll('.haskamot-card');
    const dotsWrap = document.getElementById('haskamot-dots');
    const prevBtn = document.getElementById('haskamot-prev');
    const nextBtn = document.getElementById('haskamot-next');
    let idx = 0;

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'haskamot-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Haskama ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const goTo = (i) => {
      idx = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsWrap.querySelectorAll('.haskamot-dot').forEach((d, di) =>
        d.classList.toggle('active', di === idx)
      );
    };

    prevBtn.addEventListener('click', () => goTo(idx - 1));
    nextBtn.addEventListener('click', () => goTo(idx + 1));

    /* Auto-rotate every 7 s, paused on hover */
    let timer = setInterval(() => goTo(idx + 1), 7000);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
    track.parentElement.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo(idx + 1), 7000);
    });

    /* Swipe support */
    let startX = 0, deltaX = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; deltaX = 0; }, { passive: true });
    track.addEventListener('touchmove', (e) => { deltaX = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener('touchend', () => {
      if (Math.abs(deltaX) > 50) goTo(idx + (deltaX < 0 ? 1 : -1));
    });
  }


  /* ============================================================
     CALLBACK FORM ("Être rappelé(e)")
  ============================================================ */
  const callbackForm = document.getElementById('callback-form');
  let selectedSlot = 'any';

  /* --- Time-slot toggle --- */
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-active'));
      btn.classList.add('slot-active');
      selectedSlot = btn.dataset.slot;
    });
  });

  /* --- Phone number light validation (FR or international) --- */
  const isValidPhone = (v) => {
    const cleaned = v.replace(/[\s.\-()]/g, '');
    return /^(\+?\d{8,15})$/.test(cleaned);
  };

  if (callbackForm) {
    callbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;

      const required = [
        { id: 'cb-firstname', test: (v) => v.length >= 2 },
        { id: 'cb-lastname',  test: (v) => v.length >= 2 },
        { id: 'cb-phone',     test: isValidPhone },
      ];
      required.forEach(f => {
        const el = document.getElementById(f.id);
        const v = el.value.trim();
        const ok = f.test(v);
        el.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });

      const emailEl = document.getElementById('cb-email');
      const emailVal = emailEl.value.trim();
      if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        emailEl.classList.add('is-invalid');
        valid = false;
      } else {
        emailEl.classList.remove('is-invalid');
      }

      const consent = document.getElementById('cb-consent');
      if (!consent.checked) { consent.classList.add('is-invalid'); valid = false; }
      else consent.classList.remove('is-invalid');

      if (!valid) return;

      /* Success state */
      callbackForm.classList.add('hidden');
      const success = document.getElementById('callback-success');
      success.classList.remove('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });

      /* Payload — saved to localStorage AND console-logged. To be wired to
         backend / Formspree / Make.com / Zapier for production. */
      const payload = {
        firstname: document.getElementById('cb-firstname').value.trim(),
        lastname:  document.getElementById('cb-lastname').value.trim(),
        phone:     document.getElementById('cb-phone').value.trim(),
        email:     emailVal || null,
        slot:      selectedSlot,
        message:   document.getElementById('cb-message').value.trim() || null,
      };
      saveLead('callback', payload);
      console.log('[Demande de rappel]', payload);
    });

    /* Live validation reset */
    callbackForm.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });
  }


  /* ============================================================
     CONTACT FORM
  ============================================================ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const fields = ['c-firstname', 'c-lastname', 'c-email', 'c-subject', 'c-message'];
      fields.forEach(id => {
        const el = document.getElementById(id);
        const v = (el.value || '').trim();
        const ok = id === 'c-email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.length > 1;
        el.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      const consent = contactForm.querySelector('input[type=checkbox]');
      if (!consent.checked) { consent.classList.add('is-invalid'); valid = false; }

      if (!valid) return;

      const payload = {
        firstname: document.getElementById('c-firstname').value.trim(),
        lastname:  document.getElementById('c-lastname').value.trim(),
        email:     document.getElementById('c-email').value.trim(),
        subject:   document.getElementById('c-subject').value,
        message:   document.getElementById('c-message').value.trim(),
      };
      saveLead('contact', payload);
      console.log('[Contact]', payload);

      const success = document.getElementById('contact-success');
      success.classList.remove('hidden');
      contactForm.reset();
      setTimeout(() => success.classList.add('hidden'), 6000);
    });

    contactForm.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });
  }
})();
