// Minimal vanilla JS, added only where a static HTML/CSS build genuinely
// can't express the behavior: the mobile nav drawer needs a click handler
// to toggle open/closed (no mobile Figma frame exists for this — the
// hamburger pattern and drawer content are a responsive-fallback judgment
// call, not a traced design).
(function () {
  var toggle = document.querySelector('.navbar__menu-toggle');
  var drawer = document.getElementById('mobile-nav');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    if (isOpen) {
      drawer.setAttribute('hidden', '');
    } else {
      drawer.removeAttribute('hidden');
    }
  });
})();

// Home hero region slider — a real interactive carousel. Figma's
// "Hero / Slider" only ever exposes one static state per region (a design
// tool can't depict autoplay or a crossfade transition), so the autoplay
// interval, pause-on-interaction behavior, and crossfade timing here are
// judgment calls, not traced values — logged in assumptions.md. Region
// label text for KSA/Qatar/Bahrain (SAUDI ARABIA / QATAR / BAHRAIN) is
// inferred to match the exact "UNITED ARAB EMIRATES" full-name pattern
// already confirmed for the UAE slide's label.
(function () {
  var slider = document.querySelector('.hero__slider');
  var controls = document.querySelector('.hero__controls');
  if (!slider || !controls) return;

  var slides = slider.querySelectorAll('.hero__slide');
  var dots = controls.querySelectorAll('.hero__dot');
  var label = controls.querySelector('[data-hero-label]');
  var labels = ['UNITED ARAB EMIRATES', 'SAUDI ARABIA', 'QATAR', 'BAHRAIN'];
  var current = 0;
  var timer = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!slides.length || !dots.length) return;

  function goTo(index) {
    if (index === current) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-pressed', 'false');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-pressed', 'true');
    if (label && labels[current]) label.textContent = labels[current];
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = window.setInterval(next, 6000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
      startAutoplay();
    });
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  controls.addEventListener('focusin', stopAutoplay);
  controls.addEventListener('focusout', startAutoplay);

  startAutoplay();
})();

// Generic category-filter wiring for any [data-filter-group] — currently
// used by Case Studies' filter tabs and Insights' category pills. Both had
// real active-state styling (implying a working filter) with no click
// handler at all, so clicking them did nothing. This reads each group's
// data-filter-target selector, matches items elsewhere in the page by
// data-category, and shows/hides them — "all" (or no matching category)
// always shows everything.
(function () {
  var groups = document.querySelectorAll('[data-filter-group]');
  groups.forEach(function (group) {
    var targetSelector = group.getAttribute('data-filter-target');
    var activeClass = group.getAttribute('data-active-class');
    var buttons = group.querySelectorAll('[data-filter]');
    if (!targetSelector || !buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        buttons.forEach(function (b) {
          var isActive = b === btn;
          if (activeClass) b.classList.toggle(activeClass, isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });

        document.querySelectorAll(targetSelector).forEach(function (item) {
          var category = item.getAttribute('data-category');
          var show = filter === 'all' || !category || category === filter;
          item.hidden = !show;
        });
      });
    });
  });
})();

// Toolkit logo marquee — the track duplicates its logo set once so a
// translateX by exactly one set's width loops seamlessly (see
// css/hww-tools.css). That distance depends on how many logos exist, so it
// previously lived as a hand-kept px value in the @keyframes rule that
// silently desynced (a visible jump once per cycle) whenever a logo was
// added or removed. Measured here instead, directly from the DOM: the gap
// between the first real chip and the first duplicate chip is exactly the
// seamless-loop distance, whatever the chip width/gap/padding happen to be.
(function () {
  var track = document.querySelector('.hww-tools__track');
  if (!track) return;
  var chips = track.children;
  var half = chips.length / 2;
  if (!half || half !== Math.floor(half)) return;
  var distance = chips[half].offsetLeft - chips[0].offsetLeft;
  if (distance > 0) track.style.setProperty('--hww-tools-scroll-distance', -distance + 'px');
})();

// --- Scroll Animations ---
// Uses IntersectionObserver to trigger fade-up animations as elements enter the viewport.
(function () {
  var animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (!animatedElements.length) return;

  var observer = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stop observing once animated so it doesn't repeat on scroll up
        obs.unobserve(entry.target);
      }
    });
  }, {
    // Trigger slightly before element comes fully into view
    rootMargin: '0px 0px -50px 0px',
    threshold: 0
  });

  animatedElements.forEach(function(el) {
    observer.observe(el);
  });
})();
