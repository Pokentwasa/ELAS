(function () {
  'use strict';

  /* ── Nav scroll state ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Mobile nav toggle ── */
  const toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => nav.classList.toggle('nav--open'));
    // Close on link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('nav--open'));
    });
  }

  /* ── Hero aircraft: grows and hovers over the text while scrolling
     through the hero, settles back once the hero has scrolled past ── */
  const aircraft = document.getElementById('heroAircraft');
  const heroSection = document.querySelector('.hero');
  if (aircraft && heroSection) {
    let ticking = false;

    function updateAircraft() {
      const y = window.scrollY;
      const heroH = heroSection.offsetHeight;
      // full effect completes over ~70% of the hero's own height, so it
      // scales correctly whether the hero is 700px or 1400px tall — and
      // by the end the plane has travelled down to the bottom of the section
      const progress = Math.min(Math.max(y / (heroH * 0.7), 0), 1);

      const scale = 1 + progress * 0.6;         // grows from a sane starting size
      const descend = progress * (heroH * 0.62); // travels down to the section's end

      aircraft.style.transform =
        `translateY(${descend}px) scale(${scale})`;

      // sits above the headline the moment scrolling starts at all
      aircraft.classList.toggle('is-hovering', y > 4);

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateAircraft);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Statement text — progressive reveal on scroll (y only, no opacity) ── */
  const statText = document.getElementById('statementText');
  if (statText) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          statText.classList.add('revealed');
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(statText);
  }

  /* ── Drag-scroll on adventures strip ── */
  const strip = document.getElementById('advStrip');
  if (strip) {
    let isDown = false, startX, scrollLeft;
    strip.addEventListener('mousedown', e => {
      isDown = true;
      strip.style.userSelect = 'none';
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(ev =>
      strip.addEventListener(ev, () => { isDown = false; strip.style.userSelect = ''; })
    );
    strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      strip.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  }

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── Contact form ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = document.getElementById('formSubmit');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Sent ✓';
        setTimeout(() => {
          btn.textContent = 'Send enquiry';
          btn.disabled = false;
          form.reset();
        }, 2000);
      }, 900);
    });
  }

  /* ── Fade-up reveals (y transform only, never opacity:0) ── */
  const fadeEls = document.querySelectorAll('.svc-card, .why-item, .adv-item, .stat-item');
  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver(entries => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.style.transform = 'translateY(0)';
          revealIO.unobserve(el.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach((el, i) => {
      el.style.transform = 'translateY(28px)';
      el.style.transition = `transform .6s cubic-bezier(.16,1,.3,1) ${i * 0.06}s`;
      revealIO.observe(el);
    });
  }

  /* ── Aircraft section — plane flies in from top-right on scroll into view ── */
  const acImg = document.querySelector('.aircraft-img');
  const acTarget = document.querySelector('.aircraft-top-area');
  if (acImg && acTarget) {
    let acTriggered = false;
    const triggerFlyIn = () => {
      if (acTriggered) return;
      acTriggered = true;
      acImg.classList.add('is-flying');
    };

    if ('IntersectionObserver' in window) {
      const acIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            triggerFlyIn();
            acIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      acIO.observe(acTarget);
    } else {
      // no IntersectionObserver support — just show it
      triggerFlyIn();
    }

    // safety net: if the section is already on screen at load (e.g. deep
    // link, or the observer fails to fire for any reason), never leave
    // the plane permanently stuck off-screen
    const rect = acTarget.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      triggerFlyIn();
    }
  }

})();
