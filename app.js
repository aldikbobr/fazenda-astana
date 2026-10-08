/* Фазенда — steam & embers, thermometer, sauna catalog with filters, booking */
(() => {
  'use strict';
  const M = window.Motion || { $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => Array.from(r.querySelectorAll(s)), onScroll: [], refresh() {}, scrollTo: (t) => t.scrollIntoView() };
  const { $, $$ } = M;
  const nf = (n) => n.toLocaleString('ru-RU');

  /* Saunas — 2GIS price list, updated 06.08.2026 (ranges as on the 2GIS microsite) */
  const LIVEN = 'Ведро «Ливень»';
  const SAUNAS = [
    { n: '4-местная', g: 4, gl: 'до 4', p: [4000, 6000], f: ['Парная на дровах', LIVEN, 'Smart TV, YouTube'] },
    { n: '4-местная с хаммамом', g: 4, gl: 'до 4', p: [6000, 8000], f: ['Парная на дровах', 'Хаммам', LIVEN, 'Массажная кушетка'] },
    { n: '5-местная', g: 5, gl: 'до 5', p: [6000, 9000], f: ['Парная на дровах', 'Хаммам', 'Караоке AST MINI', 'Комната отдыха', LIVEN] },
    { n: '5-местная, две комнаты отдыха', g: 5, gl: 'до 5', p: [6000, 9000], f: ['Парная на дровах', 'Хаммам', 'Караоке AST MINI', '2 комнаты отдыха', LIVEN] },
    { n: '6-местная с караоке', g: 6, gl: 'до 6', p: [6000, 9000], f: ['Парная на дровах', 'Хаммам', 'Караоке AST MINI', 'Комната отдыха', LIVEN] },
    { n: '6-местная с бассейном', g: 6, gl: 'до 6', p: [7000, 11000], f: ['Парная на дровах', 'Бассейн', '2 комнаты отдыха', LIVEN, 'Smart TV, YouTube'] },
    { n: '7-местная с хаммамом', g: 7, gl: 'до 7', p: [6000, 9000], f: ['Парная на дровах', 'Хаммам', 'Караоке AST MINI', '2 комнаты отдыха', LIVEN] },
    { n: '7-местная с бассейном', g: 7, gl: 'до 7', p: [7000, 11000], f: ['Парная на дровах', 'Бассейн', 'Караоке AST MINI', '2 комнаты отдыха', LIVEN] },
    { n: '«Восточная»', g: 10, gl: '8–10', p: [7000, 12000], f: ['Парная на дровах', 'Русский бильярд', 'Караоке AST MINI', '2 комнаты отдыха', LIVEN] },
    { n: '«Русская»', g: 12, gl: '10–12', p: [9000, 14000], f: ['Парная на дровах', 'Бассейн 6 м', 'Русский бильярд', 'Караоке AST MINI', '2 комнаты отдыха'] },
    { n: 'VIP 1', g: 12, gl: '10–12', p: [10000, 17000], f: ['Парная на дровах', 'Бассейн 6 м', 'Терраса с бассейном', 'Русский бильярд', 'Караоке AST MINI', '2 комнаты отдыха'] },
    { n: 'VIP 2', g: 12, gl: '10–12', p: [10000, 17000], f: ['Парная на дровах', 'Бассейн 6 м', 'Терраса с бассейном', 'Русский бильярд', 'Караоке AST MINI', '2 комнаты отдыха'] },
    { n: 'VIP 3', g: 10, gl: '8–10', p: [9000, 15000], f: ['Парная на дровах', 'Бассейн', 'Хаммам', 'Терраса с бассейном', 'Караоке AST MINI'] },
    { n: 'VIP 4', g: 10, gl: '8–10', p: [9000, 15000], f: ['Парная на дровах', 'Бассейн', 'Хаммам', 'Терраса с бассейном', 'Караоке AST MINI'] },
  ];
  const has = (s, key) => s.f.some((x) => ({ pool: /Бассейн/, hammam: /Хаммам/, karaoke: /Караоке/, billiard: /бильярд/ })[key].test(x));
  const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'сауна' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'сауны' : 'саун');

  const grid = $('#sauna-grid');
  const select = $('#sauna-select');
  SAUNAS.forEach((s, i) => { const o = document.createElement('option'); o.value = s.n; o.textContent = s.n + ' · ' + s.gl + ' гостей · ' + nf(s.p[0]) + '–' + nf(s.p[1]) + ' ₸'; if (select) select.append(o); s.id = i; });

  const card = (s) => {
    const el = document.createElement('article');
    el.className = 'sc';
    el.style.setProperty('--vt', 'sc-' + s.id);
    el.dataset.tilt = '5';
    el.innerHTML = '<div class="sc-top"><h3></h3><span class="sc-cap"><svg class="i"><use href="#i-users"/></svg><span></span></span></div>' +
      '<p class="sc-price"><small>по прайсу 2ГИС</small><span></span></p><ul class="sc-feat"></ul>' +
      '<button class="btn btn-accent btn-sm" type="button"><svg class="i fill"><use href="#i-wa"/></svg>Забронировать</button>';
    el.querySelector('h3').textContent = s.n;
    el.querySelector('.sc-cap span').textContent = s.gl + ' гостей';
    el.querySelector('.sc-price span').textContent = nf(s.p[0]) + '–' + nf(s.p[1]) + ' ₸';
    const ul = el.querySelector('.sc-feat');
    s.f.forEach((f) => { const li = document.createElement('li'); li.textContent = f; if (/Бассейн|Хаммам|Терраса|бильярд/.test(f)) li.className = 'hot'; ul.append(li); });
    el.querySelector('button').addEventListener('click', () => {
      if (select) select.value = s.n;
      const g = $('#book-form [name="guests"]');
      if (g) g.value = Math.min(+g.value || s.g, s.g);
      M.scrollTo($('#book'));
    });
    if (M.fine && M.motion) {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg)';
        el.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    }
    return el;
  };

  const render = (animate) => {
    if (!grid) return;
    const size = ($('input[name="size"]:checked') || {}).value || 'all';
    const needs = $$('input[name="need"]:checked').map((i) => i.value);
    const list = SAUNAS.filter((s) => (size === 'all' || (size === 's' && s.g <= 5) || (size === 'm' && s.g >= 6 && s.g <= 7) || (size === 'l' && s.g >= 8)) && needs.every((k) => has(s, k)));
    const go = () => {
      grid.textContent = '';
      if (!list.length) { const e = document.createElement('p'); e.className = 'empty'; e.textContent = 'Такой сауны нет — напишите нам, подберём ближайший вариант.'; grid.append(e); }
      list.forEach((s) => grid.append(card(s)));
      $('#found-n').textContent = list.length;
      $('#found-w').textContent = plural(list.length);
      M.refresh();
    };
    if (animate && document.startViewTransition && M.motion) document.startViewTransition(go); else go();
  };
  render(false);
  $$('input[name="size"], input[name="need"]').forEach((i) => i.addEventListener('change', () => render(true)));

  /* Thermometer: warms up while you scroll */
  const th = $('.thermo');
  const deg = $('#thermo-deg');
  if (th && M.onScroll) M.onScroll.push((y) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    th.style.setProperty('--t', Math.max(0.05, p).toFixed(3));
    deg.textContent = String(Math.round(40 + p * 55));
  });

  /* Steam and embers over the hero photo */
  const canvas = $('.steam');
  if (canvas && M.motion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    let rw = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== rw) { rw = innerWidth; resize(); } });
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const sx = sprite.getContext('2d');
    const g = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,244,232,.5)');
    g.addColorStop(0.45, 'rgba(255,238,220,.18)');
    g.addColorStop(1, 'rgba(255,238,220,0)');
    sx.fillStyle = g;
    sx.fillRect(0, 0, 128, 128);
    const small = W < 700;
    const puff = (init) => ({ x: Math.random() * W, y: init ? H * (0.3 + Math.random() * 0.7) : H + 80, r: 70 + Math.random() * 150, vy: 10 + Math.random() * 24, vx: (Math.random() - 0.5) * 12, w: Math.random() * 6.28, life: init ? Math.random() * 6 : 0, max: 8 + Math.random() * 8 });
    const ember = (init) => ({ x: Math.random() * W, y: init ? H * (0.5 + Math.random() * 0.5) : H + 8, vy: 28 + Math.random() * 64, vx: (Math.random() - 0.5) * 24, s: 0.8 + Math.random() * 2, w: Math.random() * 6.28, life: 0, max: 2.5 + Math.random() * 4 });
    const puffs = Array.from({ length: small ? 14 : 26 }, () => puff(true));
    const embers = Array.from({ length: small ? 16 : 34 }, () => ember(true));
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        puffs.forEach((p, i) => {
          p.life += dt;
          p.y -= p.vy * dt;
          p.x += (p.vx + Math.sin(p.w + p.life * 0.8) * 10) * dt;
          p.r += 7 * dt;
          const k = p.life / p.max;
          ctx.globalAlpha = Math.max(0, Math.sin(Math.min(1, k) * Math.PI) * 0.32);
          ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
          if (k >= 1 || p.y < -p.r) puffs[i] = puff(false);
        });
        ctx.globalCompositeOperation = 'lighter';
        embers.forEach((e, i) => {
          e.life += dt;
          e.y -= e.vy * dt;
          e.x += (e.vx + Math.sin(e.w + e.life * 3) * 18) * dt;
          const k = e.life / e.max;
          const a = Math.max(0, (1 - k) * (0.55 + 0.45 * Math.sin(e.life * 18 + e.w)));
          ctx.globalAlpha = a * 0.35;
          ctx.fillStyle = '#ff7a2a';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.s * 3.2, 0, 6.283);
          ctx.fill();
          ctx.globalAlpha = a;
          ctx.fillStyle = '#ffc47a';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.s, 0, 6.283);
          ctx.fill();
          if (k >= 1) embers[i] = ember(false);
        });
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
