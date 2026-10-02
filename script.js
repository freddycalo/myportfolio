/* =========================================================
   FREDELLY CALÒ — Script ottimizzato per fluidità
   ========================================================= */

(function () {
  'use strict';

  var html = document.documentElement;
  var loader = document.getElementById('loader');
  var introDone = false;

  /* ---- 1. INTRO ZOOM ---- */
  function triggerIntro() {
    if (introDone) return;
    introDone = true;
    html.classList.add('intro-zooming');
    setTimeout(function () {
      html.classList.add('intro-done');
      initReveal();
    }, 1400);
  }

  if (loader) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.add('intro-done');
      introDone = true;
      initReveal();
    } else {
      // Scroll trigger (passive per non bloccare il thread)
      window.addEventListener('scroll', function onScroll() {
        if (window.scrollY > 4) {
          triggerIntro();
          window.removeEventListener('scroll', onScroll);
        }
      }, { passive: true });

      loader.addEventListener('click', triggerIntro, { once: true });

      // Fallback automatico dopo 7 secondi
      setTimeout(triggerIntro, 7000);
    }
  } else {
    initReveal();
  }

  /* ---- 2. SCROLL REVEAL ottimizzato ---- */
  function initReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    // Usa requestAnimationFrame + IntersectionObserver per zero jank
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-delay') || 0);

        if (delay > 0) {
          setTimeout(function () { showEl(el); }, delay * 1000);
        } else {
          // Usa rAF per sincronizzarsi col frame del browser — nessun salto
          requestAnimationFrame(function () { showEl(el); });
        }

        observer.unobserve(el);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  function showEl(el) {
    requestAnimationFrame(function () {
      el.classList.add('is-visible');

      // Scramble effect solo sui titoli (data-scramble)
      if (el.hasAttribute('data-scramble')) {
        scramble(el);
        el.removeAttribute('data-scramble');
      }
    });
  }

  /* ---- 3. TEXT SCRAMBLE (rAF-based, no setInterval) ---- */
  function scramble(el) {
    var chars   = '!<>-_\\/[]{}=+*^?#~';
    var original = el.innerText;
    var totalFrames = 22;
    var frame   = 0;

    function tick() {
      var out = '';
      for (var i = 0; i < original.length; i++) {
        var ch = original[i];
        if (ch === ' ' || ch === '\n') {
          out += ch;
        } else if (frame >= totalFrames || Math.random() < frame / totalFrames) {
          out += ch;
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.innerText = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

})();
