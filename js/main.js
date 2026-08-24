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
//
// Those four region labels are read off each dot's data-slide-label rather
// than kept in an array here. They used to be hardcoded in both places at
// once — the UAE one in the partial's visible label and all four in this
// file — so editing the labels through the CMS would have changed the
// initial one and left the other three saying whatever this array said.
(function () {
  var slider = document.querySelector('.hero__slider');
  var controls = document.querySelector('.hero__controls');
  if (!slider || !controls) return;

  var slides = slider.querySelectorAll('.hero__slide');
  var dots = controls.querySelectorAll('.hero__dot');
  var label = controls.querySelector('[data-hero-label]');
  var labels = Array.prototype.map.call(dots, function (dot) {
    return dot.getAttribute('data-slide-label');
  });
  var current = 0;
  var timer = null;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!slides.length || !dots.length) return;

  // Slides 2-4 ship with data-src, not src: all four .hero__slide elements
  // sit stacked at the same inset:0 position (only opacity tells them
  // apart), so the browser's native loading="lazy" viewport check saw all
  // four as already on-screen and downloaded every region's hero photo on
  // every visit -- roughly 200KB nobody asked for on a page most visitors
  // never scroll the carousel past slide 1. loadSlide() swaps in the real
  // src, once, exactly when a slide is actually needed.
  function loadSlide(slide) {
    var img = slide.querySelector('img[data-src]');
    if (!img) return;
    img.src = img.getAttribute('data-src');
    img.removeAttribute('data-src');
  }

  function goTo(index) {
    if (index === current) return;
    loadSlide(slides[index]);
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

  // Background-load the other three slides once the page is idle, so the
  // first autoplay transition (6s away) never has to wait on a fresh
  // fetch -- deferred to idle rather than requested up front, so these
  // photos still don't compete with anything on the page's critical path.
  var prefetchDeferredSlides = function () {
    for (var i = 0; i < slides.length; i++) loadSlide(slides[i]);
  };
  if (window.requestIdleCallback) {
    window.requestIdleCallback(prefetchDeferredSlides, { timeout: 4000 });
  } else {
    window.setTimeout(prefetchDeferredSlides, 1500);
  }
})();

// Amiri (Arabic display font, ~100KB) has no @font-face in css/fonts.css --
// see the comment there. Injecting the rule after idle means the browser
// only starts that fetch once the page's critical resources (hero image,
// core Latin fonts) already have it, instead of competing with them for
// bandwidth from navigation start. Font-matching is lazy: on pages with no
// text set in 'Amiri', this rule sits unused and nothing is ever fetched.
(function () {
  function loadAmiriFont() {
    var style = document.createElement('style');
    style.textContent = "@font-face { font-family: 'Amiri'; font-style: normal; font-weight: 700; font-display: swap; src: url('/assets/fonts/Amiri-Bold.woff2') format('woff2'); }";
    document.head.appendChild(style);
  }
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadAmiriFont, { timeout: 4000 });
  } else {
    window.setTimeout(loadAmiriFont, 1500);
  }
})();

// Google Analytics (GA4) + Microsoft Clarity, deferred to window "load"
// rather than idle+timeout like the Amiri font above -- unlike a purely
// decorative asset, delaying analytics too aggressively risks not
// recording a real visit at all if someone leaves before it fires. By the
// time "load" fires, the page's own critical resources (hero image, core
// fonts) have already finished, so this stops a ~168KB compressed third-
// party script (gtag.js) from competing with them for bandwidth on a
// throttled mobile connection, without meaningfully undercounting fast
// bounces: a visit ending before "load" would very likely have ended
// before the old eager-loaded analytics script finished initializing too.
window.addEventListener('load', function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-V0FQ6CTFNV');
  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-V0FQ6CTFNV';
  document.head.appendChild(gaScript);

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'y5x2pknvrg');
});

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

// Seamless marquee distance measurement — shared by the toolkit ticker and
// both Trusted-By rows. Each track duplicates its own item set once so a
// translateX by exactly one set's width loops seamlessly (see
// css/hww-tools.css and css/services-trusted-by.css). That distance
// depends on how many items exist, so it previously lived as a hand-kept
// px value in the @keyframes rule that silently desynced (a visible jump
// once per cycle) whenever an item was added or removed. Measured here
// instead, directly from the DOM: the gap between the first real item and
// the first duplicate item is exactly the seamless-loop distance, whatever
// the item width/gap/padding happen to be.
function measureMarquee(selector, cssVar) {
  var track = document.querySelector(selector);
  if (!track) return;
  var items = track.children;
  var half = items.length / 2;
  if (!half || half !== Math.floor(half)) return;
  var distance = items[half].offsetLeft - items[0].offsetLeft;
  if (distance > 0) track.style.setProperty(cssVar, -distance + 'px');
}
measureMarquee('.hww-tools__track', '--hww-tools-scroll-distance');
measureMarquee('.trusted-by__track--row1', '--trusted-by-scroll-distance');
measureMarquee('.trusted-by__track--row2', '--trusted-by-scroll-distance');

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

// Contact form submit -> Web3Forms. Intercepted with fetch rather than a
// plain native POST so the outcome (Web3Forms returns {success: true/false}
// in the JSON body) can be routed through this exact same site's own
// ?sent=1 / ?error=1 pages, instead of trusting an undocumented redirect-
// on-failure behavior on Web3Forms' side. The form's own action/method/
// enctype/hidden "redirect" field stay in the markup purely as a no-JS
// fallback -- e.preventDefault() below means the browser never actually
// acts on them once this handler runs.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        location.href = '/contact.html?' + (data && data.success ? 'sent=1' : 'error=1');
      })
      .catch(function () {
        location.href = '/contact.html?error=1';
      });
  });
})();

// Contact form result — the fetch handler above navigates back here with
// ?sent=1 or ?error=1 once Web3Forms responds. Swaps in the matching
// notice from src/partials/contact/01-main.html and hides the form via an
// inline style (wins regardless of any stylesheet specificity) rather than
// relying on the `hidden` attribute, which an author display:flex rule
// would otherwise override -- see the CSS comment on .contact-main__notice.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var params = new URLSearchParams(location.search);
  var state = params.get('sent') === '1' ? 'success' : params.get('error') === '1' ? 'error' : null;
  if (!state) return;
  form.style.display = 'none';
  var notice = document.getElementById('contact-notice-' + state);
  if (notice) notice.classList.add('is-visible');
})();
