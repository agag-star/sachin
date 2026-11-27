/* Portfolio interactions – no libraries needed */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Highlight the current page in the menu */
  const current = document.body.dataset.page;
  $$('.nav ul a').forEach(a => a.dataset.p === current && a.classList.add('active'));

  /* Mobile menu */
  const nav = $('#nav'), burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  /* Scroll progress bar */
  const bar = $('.progress');
  const onScroll = () => {
    const h = document.documentElement;
    if (bar) bar.style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) * 100 + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Smooth fade between pages */
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (/^(#|mailto:|tel:|https?:)/.test(href)) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 300);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });

  /* Count-up numbers */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const dur = 1400, t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* Reveal on scroll (also fills skill bars + starts counters) */
  const activate = el => {
    $$('.bar i', el).forEach(b => { b.style.width = b.dataset.level + '%'; });
    if (el.matches('[data-count]')) countUp(el);
    $$('[data-count]', el).forEach(countUp);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      activate(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Home: typing effect */
  const typed = $('#typed');
  if (typed) {
    const words = JSON.parse(typed.dataset.words);
    if (reduce) typed.textContent = words[0];
    else {
      let w = 0, c = 0, del = false;
      (function loop() {
        const word = words[w];
        typed.textContent = word.slice(0, c);
        if (!del && c === word.length) { del = true; return setTimeout(loop, 1500); }
        if (del && c === 0) { del = false; w = (w + 1) % words.length; return setTimeout(loop, 350); }
        c += del ? -1 : 1;
        setTimeout(loop, del ? 45 : 90);
      })();
    }
  }

  /* Home: rotating "about me" details */
  const slides = $$('.slide');
  if (slides.length) {
    const dots = $$('.dots button');
    const fill = $('.rot-bar i');
    let i = 0, timer;
    const show = n => {
      const prev = i;
      slides.forEach((s, k) => {
        s.classList.toggle('on', k === n);
        s.classList.toggle('off', k === prev && k !== n);
      });
      dots.forEach((d, k) => d.classList.toggle('active', k === n));
      i = n;
      if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
      clearTimeout(timer);
      timer = setTimeout(() => show((i + 1) % slides.length), 4500);
    };
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    timer = setTimeout(() => show(1), 4500);
  }

  /* Projects: category filter */
  const fbtns = $$('.filters button');
  fbtns.forEach(b => b.addEventListener('click', () => {
    fbtns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    $$('.project').forEach(p => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('hide', !show);
      if (show) { p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
    });
  }));

  /* Contact form: opens the visitor's email app (works on GitHub Pages with no backend) */
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('message');
    const note = $('.form-note');
    if (note) note.classList.add('show');
    location.href = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent(d.get('subject')) + '&body=' + encodeURIComponent(body);
    form.reset();
  });

  /* Footer year */
  $$('.yr').forEach(e => { e.textContent = new Date().getFullYear(); });
})();
