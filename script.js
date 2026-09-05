/* =========================================================
   Fredelly Calò — comportamenti del sito (vanilla JS, zero dipendenze)
   1.  split del nome in lettere        6.  contatori
   2.  schema tecnico animato           7.  filtro competenze
   3.  testo che si scrive da solo      8.  bagliore sulle card
   4.  reveal allo scroll               9.  bottoni magnetici
   5.  titoli con effetto scramble      10. mirino, topbar, progresso
   Tutto degrada bene: senza JS il sito resta leggibile,
   con prefers-reduced-motion le animazioni non partono.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- 1. nome diviso in lettere ---------- */
  (function splitName () {
    var el = document.querySelector('[data-split]');
    if (!el) return;

    var i = 0;

    // ricostruisce il titolo lettera per lettera, mantenendo <br> e il punto arancione
    function walk (node, target) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          child.textContent.split('').forEach(function (chr) {
            if (chr === ' ') { target.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'ch';
            outer.style.setProperty('--i', i++);
            var inner = document.createElement('span');
            inner.textContent = chr;
            outer.appendChild(inner);
            target.appendChild(outer);
          });
        } else if (child.tagName === 'BR') {
          target.appendChild(document.createElement('br'));
        } else {
          var clone = child.cloneNode(false);
          walk(child, clone);
          target.appendChild(clone);
        }
      });
    }

    var frag = document.createDocumentFragment();
    walk(el, frag);
    el.textContent = '';
    el.appendChild(frag);
  })();

  /* ---------- 2. schema tecnico: lunghezza dei tratti + avvio ---------- */
  (function blueprint () {
    var svg = document.getElementById('blueprint');
    if (!svg) return;

    svg.querySelectorAll('path').forEach(function (p) {
      if (typeof p.getTotalLength !== 'function') return;
      var len = Math.ceil(p.getTotalLength());
      if (len) p.style.setProperty('--len', len);
    });

    var ring = svg.querySelector('.core__ring');
    if (ring && typeof ring.getTotalLength === 'function') {
      ring.style.setProperty('--len', Math.ceil(ring.getTotalLength()));
    }

    if (!reduced) requestAnimationFrame(function () { html.classList.add('anim'); });
  })();

  /* ---------- 3. riga "focus": testo che si scrive da solo ---------- */
  (function typewriter () {
    var out = document.getElementById('typed');
    if (!out) return;

    var words = [
      'sviluppo web',
      'reti e protocolli',
      'cybersecurity',
      'hardware e assistenza',
      'lavoro con il pubblico'
    ];

    if (reduced) { out.textContent = words.join(' · '); return; }

    var w = 0, c = 0, deleting = false;

    function tick () {
      var word = words[w];
      c += deleting ? -1 : 1;
      out.textContent = word.slice(0, c);

      var wait = deleting ? 34 : 62;
      if (!deleting && c === word.length) { deleting = true; wait = 1500; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; wait = 260; }

      setTimeout(tick, wait);
    }
    tick();
  })();

  /* ---------- 4. reveal allo scroll ---------- */
  var revealables = document.querySelectorAll('.reveal, .lang');

  if (!('IntersectionObserver' in window) || reduced) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 5. titoli di sezione con effetto "scramble" ---------- */
  (function scramble () {
    var titles = document.querySelectorAll('[data-scramble]');
    if (!titles.length || reduced || !('IntersectionObserver' in window)) return;

    var pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#/\\<>_';

    function run (el) {
      var final = el.textContent;
      var frame = 0;
      var steps = 14;

      var id = setInterval(function () {
        frame++;
        var shown = Math.floor((frame / steps) * final.length);
        var out = '';
        for (var i = 0; i < final.length; i++) {
          if (i < shown || final[i] === ' ') out += final[i];
          else out += pool[Math.floor(Math.random() * pool.length)];
        }
        el.textContent = out;
        if (frame >= steps) { clearInterval(id); el.textContent = final; }
      }, 34);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    titles.forEach(function (t) { obs.observe(t); });
  })();

  /* ---------- 6. contatori dei dati reali ---------- */
  (function counters () {
    var nums = document.querySelectorAll('.count:not([data-plain])');
    if (!nums.length) return;
    if (reduced || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10) || 0;
        var start = performance.now();
        var dur = 900;

        (function step (now) {
          var t = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        })(start);

        obs.unobserve(el);
      });
    }, { threshold: 1 });

    nums.forEach(function (n) { obs.observe(n); });
  })();

  /* ---------- 7. filtro competenze ---------- */
  (function filters () {
    var chips = document.querySelectorAll('.chip');
    var skills = document.querySelectorAll('.skill');
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.dataset.filter;

        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', String(on));
        });

        skills.forEach(function (card) {
          var show = filter === 'all' || card.dataset.cat === filter;
          card.classList.toggle('is-hidden', !show);
          if (show) card.classList.add('is-in');
        });
      });
    });
  })();

  /* ---------- 8. bagliore che segue il puntatore nelle card ---------- */
  if (!isTouch) {
    document.querySelectorAll('.skill').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- 9. bottoni magnetici ---------- */
  if (!isTouch && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (dx * 10).toFixed(1) + 'px,' + (dy * 8).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 10a. mirino da disegno tecnico ---------- */
  if (!isTouch && !reduced) {
    var cursor = document.getElementById('cursor');
    var xy = document.getElementById('cursorXY');

    if (cursor) {
      html.classList.add('has-cursor');

      window.addEventListener('pointermove', function (e) {
        html.classList.add('cursor-on');
        cursor.style.setProperty('--cx', e.clientX + 'px');
        cursor.style.setProperty('--cy', e.clientY + 'px');
        if (xy) xy.textContent = 'x:' + String(Math.round(e.clientX)).padStart(3, '0') +
                                 ' y:' + String(Math.round(e.clientY)).padStart(3, '0');

        var hot = e.target.closest && e.target.closest('a,button,.skill,.job,.certs li');
        html.classList.toggle('cursor-hot', !!hot);
      }, { passive: true });

      window.addEventListener('pointerleave', function () { html.classList.remove('cursor-on'); });
    }
  }

  /* ---------- 10b. parallasse dell'hero col mouse ---------- */
  if (!isTouch && !reduced) {
    var hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      }, { passive: true });
    }
  }

  /* ---------- 10c. barra di avanzamento, topbar e sezione attiva ---------- */
  (function scrollUI () {
    var bar = document.getElementById('progressBar');
    var topbar = document.getElementById('topbar');
    var heroEl = document.getElementById('hero');
    var links = document.querySelectorAll('.topbar__nav a');
    var sections = [];

    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) sections.push({ link: a, el: s });
    });

    var ticking = false;

    function update () {
      ticking = false;

      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

      if (topbar && heroEl) {
        var limit = heroEl.offsetHeight - topbar.offsetHeight - 40;
        topbar.classList.toggle('is-light', window.scrollY > limit);
      }

      var current = null;
      sections.forEach(function (s) {
        if (s.el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s;
      });
      sections.forEach(function (s) { s.link.classList.toggle('is-active', s === current); });
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- anno nel footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
