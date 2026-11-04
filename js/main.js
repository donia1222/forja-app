/* Lweb Apps – Landing */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Header: Schatten + aktiver Link ---------- */
  const hdr = $('.hdr');
  const mcta = $('.mcta');
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    if (mcta) {
      const contact = $('#kontakt').getBoundingClientRect().top;
      mcta.classList.toggle('is-on', y > 600 && contact > innerHeight * 0.6);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav a');
  const secObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['ablauf', 'funktionen', 'branchen', 'preise', 'faq'].forEach((id) => { const el = document.getElementById(id); el && secObs.observe(el); });

  /* ---------- Mobile-Menü ---------- */
  const burger = $('.burger');
  const mnav = $('.mnav');
  const setMenu = (open) => {
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    burger.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  };
  burger.addEventListener('click', () => setMenu(mnav.hidden));
  $$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Reveal ---------- */
  const revObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revObs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  // gestaffelte Verzögerung innerhalb von Gruppen
  $$('.feat, .why__list, .tl, .prices, .swiss__stats, .mini, .faq__list').forEach((g) => {
    $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.06, 0.5) + 's'));
  });
  $$('.reveal').forEach((el) => revObs.observe(el));

  /* ---------- Funktionen: Fortschritt beim Wischen ---------- */
  const feat = $('[data-feat]'), fbar = $('[data-feat-bar]');
  if (feat && fbar) {
    const upd = () => {
      const max = feat.scrollWidth - feat.clientWidth;
      if (max <= 0) return;
      const vis = feat.clientWidth / feat.scrollWidth;
      fbar.style.width = (vis * 100) + '%';
      fbar.style.marginLeft = ((feat.scrollLeft / max) * (1 - vis) * 100) + '%';
    };
    feat.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  }

  /* ---------- Zähler ---------- */
  const countObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduced) return;
      const t0 = performance.now(), dur = 1200;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- Schritte (Tabs mit Auto-Play) ---------- */
  const steps = $('[data-steps]');
  if (steps) {
    const tabs = $$('.step', steps);
    const imgs = $$('.steps__imgs img', steps);
    const title = $('[data-step-title]', steps);
    const DUR = 6500;
    let cur = 0, timer = null, inView = false, paused = false;
    steps.style.setProperty('--dur', DUR + 'ms');

    const show = (i, user) => {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => {
        const on = k === cur;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        // Fortschrittsbalken neu starten
        const bar = $('.step__bar i', t);
        bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      });
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === cur));
      title.textContent = imgs[cur].dataset.title;
      if (user && innerWidth <= 1080) tabs[cur].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (reduced || !inView || paused) return;
      timer = setTimeout(() => show(cur + 1), DUR);
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i, true)));
    steps.addEventListener('keydown', (e) => {
      if (!e.target.classList.contains('step')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true); tabs[cur].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true); tabs[cur].focus(); }
    });
    const stage = $('.steps__stage', steps);
    stage.addEventListener('mouseenter', () => { paused = true; steps.classList.add('is-paused'); clearTimeout(timer); });
    stage.addEventListener('mouseleave', () => { paused = false; steps.classList.remove('is-paused'); show(cur); });
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      steps.classList.toggle('is-paused', !inView);
      inView ? show(cur) : clearTimeout(timer);
    }, { threshold: 0.35 }).observe(steps);
    imgs.forEach((im) => im.addEventListener('click', () => openLB(im)));
    $('[data-zoom]', steps).addEventListener('click', () => openLB(imgs[cur]));
  }

  /* ---------- Galerie: Filter, Pfeile, Ziehen ---------- */
  const gal = $('[data-gallery]');
  if (gal) {
    const items = $$('.gal__item', gal);
    $$('.fchip').forEach((c) => c.addEventListener('click', () => {
      $$('.fchip').forEach((x) => x.classList.toggle('is-on', x === c));
      const f = c.dataset.f;
      items.forEach((it) => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.c !== f));
      gal.scrollTo({ left: 0, behavior: reduced ? 'auto' : 'smooth' });
    }));
    const step = () => (items.find((i) => !i.classList.contains('is-hidden'))?.offsetWidth || 260) + 28;
    $$('[data-gal]').forEach((b) => b.addEventListener('click', () => gal.scrollBy({ left: +b.dataset.gal * step() * 2, behavior: reduced ? 'auto' : 'smooth' })));
    gal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') gal.scrollBy({ left: step(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') gal.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    // Ziehen mit der Maus (Touch scrollt nativ)
    let down = false, sx = 0, sl = 0, moved = false;
    gal.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = gal.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; gal.classList.add('is-drag'); }
      gal.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        gal.classList.remove('is-drag');
        // sanft am nächsten Element einrasten
        const w = step(); gal.scrollTo({ left: Math.round(gal.scrollLeft / w) * w, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lb');
  const lbImg = $('img', lb);
  let lastFocus = null;
  function openLB(img) {
    lastFocus = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lb.classList.add('is-open'));
    $('.lb__x', lb).focus();
  }
  function closeLB() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, 300);
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $$('[data-lightbox]').forEach((im) => im.addEventListener('click', () => openLB(im)));
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLB(); });
  // Wischen zum Schliessen
  let ty = null;
  lb.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', (e) => { if (ty !== null && Math.abs(e.changedTouches[0].clientY - ty) > 70) closeLB(); ty = null; });

  /* ---------- Modal ---------- */
  const modal = $('#modal');
  const openModal = () => { modal.hidden = false; requestAnimationFrame(() => modal.classList.add('is-open')); $('[data-close]', modal).focus(); };
  const closeModal = () => { modal.classList.remove('is-open'); setTimeout(() => { modal.hidden = true; }, 300); };
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  let my = null;
  const card = $('.modal__card', modal);
  card.addEventListener('touchstart', (e) => { my = e.touches[0].clientY; }, { passive: true });
  card.addEventListener('touchmove', (e) => { if (my === null) return; const d = Math.max(0, e.touches[0].clientY - my); card.style.transform = `translateY(${d}px)`; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    const d = my === null ? 0 : e.changedTouches[0].clientY - my;
    card.style.transform = '';
    my = null;
    if (d > 90) closeModal();
  });

  /* ---------- «Bald verfügbar»: nur beim ersten Besuch ---------- */
  const soon = $('#soon');
  const SOON_KEY = 'forja-bald-gesehen';
  const closeSoon = () => {
    soon.classList.remove('is-open');
    setTimeout(() => { soon.hidden = true; }, 300);
    try { localStorage.setItem(SOON_KEY, '1'); } catch {}
  };
  if (soon) {
    soon.addEventListener('click', (e) => { if (e.target === soon || e.target.closest('[data-close]')) closeSoon(); });
    let seen = false;
    try { seen = localStorage.getItem(SOON_KEY) === '1'; } catch {}
    if (!seen) setTimeout(() => { soon.hidden = false; requestAnimationFrame(() => soon.classList.add('is-open')); }, 700);
  }

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (soon && !soon.hidden) closeSoon();
    if (!lb.hidden) closeLB();
    if (!modal.hidden) closeModal();
    if (!mnav.hidden) setMenu(false);
  });

  /* ---------- Paket aus Preiskarte übernehmen ---------- */
  const form = $('#form');
  $$('[data-plan]').forEach((a) => a.addEventListener('click', () => { form.paket.value = a.dataset.plan; }));

  /* ---------- Formular → E-Mail ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['name', 'email'].forEach((n) => {
      const f = form[n];
      const bad = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('is-err', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;
    const d = Object.fromEntries(new FormData(form));
    const body = [
      `Name: ${d.name}`, `Firma: ${d.firma || '–'}`, `E-Mail: ${d.email}`, `Telefon: ${d.tel || '–'}`,
      `Branche: ${d.branche}`, `Paket: ${d.paket}`, '', 'Was soll die App können?', d.msg || '–',
    ].join('\n');
    const subject = `App-Anfrage: ${d.firma || d.name}`;
    location.href = `mailto:info@lweb.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(openModal, 400);
  });
  $$('input, textarea', form).forEach((f) => f.addEventListener('input', () => f.classList.remove('is-err')));

  /* ---------- Parallax Schweiz-Bild ---------- */
  const sbg = $('.swiss__bg');
  if (sbg && !reduced) {
    const sec = sbg.parentElement;
    let raf = 0;
    const par = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      sbg.style.transform = `translate3d(0, ${p * -60}px, 0)`;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(par); }, { passive: true });
    par();
  }

  const yr = $('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
