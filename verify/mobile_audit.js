// Mobile responsive audit, run as a DIFF against the desktop baseline.
//
// Raw "element sticks out past its parent" is far too noisy on this site to be
// useful on its own — plenty of graphics are deliberately clipped at every
// width (the coverage-map's bleed rings, the logo-ticker marquee). So every
// page is measured twice: once at 1440px (the design width, treated as
// correct-by-definition) and once narrow. Only elements that are clipped or
// truncated at the narrow width and NOT at 1440px are reported.
//
// Classes reported:
//   CLIPPED  horizontal overflow swallowed by an ancestor's overflow:hidden
//            (or by body's overflow-x:hidden) => content lost off the side
//   VCLIP    an overflow:hidden box whose content is taller than it, so the
//            bottom is cut off. Compares against the child's *visual* height
//            (post-transform), since the mobile fallbacks shrink two widgets
//            with transform:scale and scrollHeight ignores transforms.
//   ANIMCONF a .animate-on-scroll element whose revealed-state transform
//            (.is-visible, 2 classes) overrides a single-class mobile
//            transform:scale() shrink, undoing the shrink once it animates in
// Elements inside an overflow-x:auto/scroll ancestor are reported separately
// as intentional swipe strips.
const { chromium } = require('playwright');
// This sandbox ships a Chromium build older than the revision this Playwright
// version auto-downloads, so point at it explicitly. Override with
// CHROMIUM_PATH=... , or unset it to use Playwright's own download.
const LAUNCH = process.env.CHROMIUM_PATH === ''
  ? {}
  : { executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' };


const PAGES = process.argv[2]
  ? process.argv[2].split(',')
  : ['index', 'about', 'services', 'how-we-work', 'industries', 'case-studies',
     'insights', 'contact', 'bookkeeping', 'cashflow', 'cleanup', 'fpa',
     'mgmt-reporting', 'tax-vat', '404'];
const WIDTHS = (process.argv[3] || '375,414').split(',').map(Number);
const BASE = process.argv[4] || 'http://127.0.0.1:8843';
const DESKTOP = 1440;

// The toolkit logo strip and both Trusted-By rows are infinite horizontal
// marquees (see css/hww-tools.css, css/services-trusted-by.css) — by
// construction, most of each duplicated tile set sits outside the visible
// band at every viewport width, and narrower viewports simply fit fewer
// tiles before the cutoff. That's not a regression, so it's excluded from
// the pass/fail signal (still printed below, for visibility).
const KNOWN_CLIPPING_VIA = [
  'div.hww-tools__band',
  'div.trusted-by__band.trusted-by__band--row1',
  'div.trusted-by__band.trusted-by__band--row2',
  'div.trust-intro__cards',
];

const MEASURE = (vw) => {
  const label = el => {
    const cls = (el.className || '').toString().trim().split(/\s+/)
      .filter(c => c && c !== 'animate-on-scroll' && !/^stagger-/.test(c) && c !== 'is-visible')
      .slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (el.id ? '#' + el.id : '');
  };
  // Stable-ish identity for diffing the same element across two viewports.
  const path = el => {
    const parts = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      parts.unshift(n.tagName.toLowerCase() + ':' + [...(n.parentElement?.children || [])].indexOf(n));
    }
    return parts.join('>');
  };

  // Chromium's <details> implementation lays out closed accordion content
  // internally (getComputedStyle(el).display stays 'block', not 'none', and
  // getBoundingClientRect() returns real, nonzero geometry) even though
  // nothing is actually painted -- checkVisibility() is the one API that
  // reports the true on-screen state. Without this, every closed <details>
  // answer on the page (home FAQ, contact quick-FAQ) reads as content that
  // "overflows" its collapsed accordion section, which a user never sees
  // regardless of viewport width. Falls back to the plain display/visibility
  // check on a browser old enough not to have checkVisibility.
  const isRendered = el => (typeof el.checkVisibility === 'function')
    ? el.checkVisibility()
    : getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';

  const clipped = {}, scrolled = {}, vclip = {}, animconf = [];

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || !isRendered(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const key = path(el);

    // ---- horizontal overflow, attributed to the nearest constraining ancestor
    const overR = Math.round(r.right - vw), overL = Math.round(-r.left);
    if ((overR > 1 || overL > 1) && cs.position !== 'fixed') {
      let scroller = null, clipper = null;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ps = getComputedStyle(p);
        const ox = ps.overflowX;
        if (ox === 'auto' || ox === 'scroll') { scroller = p; break; }
        if (ox === 'hidden' || ox === 'clip') {
          const pr = p.getBoundingClientRect();
          if (r.right > pr.right + 1 || r.left < pr.left - 1) { clipper = p; break; }
        }
      }
      const rec = { el: label(el), left: Math.round(r.left), right: Math.round(r.right),
                    w: Math.round(r.width), overR, overL };
      if (scroller) { rec.via = label(scroller); scrolled[key] = rec; }
      else { rec.via = clipper ? label(clipper) : 'body(overflow-x:hidden)'; clipped[key] = rec; }
    }

    // ---- vertical clipping, measured visually (respects transform:scale)
    // Checks ALL descendants, not just direct children -- an intermediate
    // wrapper between the overflow:hidden element and the real content can
    // itself end up with a wrong-but-matching box size (e.g. a height bug
    // on a wrapper two levels down that happens to equal its clipping
    // ancestor's height, hiding the mismatch at that shallow level), while
    // a deeper descendant's own true layout position still reveals it.
    // Caught exactly this case once: an inline height override on an inner
    // wrapper silently matched its overflow:hidden grandparent's auto-
    // sized height, so direct-children-only comparison saw no gap, but the
    // actual card grid two levels down was still being clipped by ~1300px.
    const oy = cs.overflowY;
    if (oy === 'hidden' || oy === 'clip') {
      let deepest = 0;
      for (const c of el.querySelectorAll('*')) {
        const ccs = getComputedStyle(c);
        if (ccs.display === 'none' || ccs.position === 'absolute' || ccs.position === 'fixed') continue;
        if (!isRendered(c)) continue;
        deepest = Math.max(deepest, c.getBoundingClientRect().bottom);
      }
      const lost = Math.round(deepest - r.bottom);
      if (deepest > 0 && lost > 2) {
        vclip[key] = { el: label(el), visH: Math.round(r.height), lost };
      }
    }

    // ---- scroll-reveal transform stomping a mobile transform:scale() shrink
    if (el.classList.contains('animate-on-scroll')) {
      const had = cs.transform;
      el.classList.add('is-visible');
      const now = getComputedStyle(el).transform;
      el.classList.remove('is-visible');
      if (/matrix\(0?\.\d/.test(had) && !/matrix\(0?\.\d/.test(now)) {
        animconf.push({ el: label(el), atRest: had, revealed: now });
      }
    }
  }
  return {
    docW: document.documentElement.scrollWidth,
    bodyH: Math.round(document.body.scrollHeight),
    clipped, scrolled, vclip, animconf,
  };
};

(async () => {
  const browser = await chromium.launch(LAUNCH);

  // This sandbox has no outbound route to real third-party hosts, so the
  // GA4/Clarity tags' requests would otherwise hang unresolved forever and
  // networkidle would never fire. Abort them locally only -- production
  // has real internet access and loads them normally.
  const blockThirdPartyAnalytics = (page) => {
    page.route(/googletagmanager\.com|clarity\.ms/, (route) => route.abort());
  };

  const load = async (page, name) => {
    await page.goto(`${BASE}/${name}.html`, { waitUntil: 'networkidle' });
    // Settle the scroll-reveal state so geometry is the final, user-visible one.
    await page.evaluate(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('is-visible'));
    });
    await page.waitForTimeout(700);
  };

  // Desktop baseline: what is *supposed* to be clipped.
  const baseline = {};
  const dp = await browser.newPage({ viewport: { width: DESKTOP, height: 900 } });
  blockThirdPartyAnalytics(dp);
  for (const name of PAGES) {
    await load(dp, name);
    baseline[name] = await dp.evaluate(MEASURE, DESKTOP);
  }
  await dp.close();

  let anyRegression = false;

  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 812 } });
    blockThirdPartyAnalytics(page);
    for (const name of PAGES) {
      const errors = [];
      page.removeAllListeners('pageerror');
      page.removeAllListeners('requestfailed');
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('requestfailed', r => {
        if (/googletagmanager\.com|clarity\.ms/.test(r.url())) return;
        errors.push('requestfailed: ' + r.url());
      });
      await load(page, name);
      const m = await page.evaluate(MEASURE, w);
      const base = baseline[name];

      // Regression = present narrow, absent (or much smaller) at 1440px.
      const newClipped = Object.entries(m.clipped)
        .filter(([k]) => !base.clipped[k]).map(([, v]) => v);
      const newVclip = Object.entries(m.vclip)
        .filter(([k, v]) => !base.vclip[k] || v.lost > base.vclip[k].lost + 4).map(([, v]) => v);
      const unexpectedClipped = newClipped.filter(o => !KNOWN_CLIPPING_VIA.includes(o.via));

      const has = newClipped.length || newVclip.length || m.animconf.length;
      if (unexpectedClipped.length || newVclip.length || m.animconf.length) anyRegression = true;
      console.log(`\n=== ${name} @ ${w}px  (scrollWidth ${m.docW}, height ${m.bodyH})`);
      const show = (title, arr, fmt) => {
        if (!arr.length) return;
        console.log(`  ${title} (${arr.length}):`);
        arr.slice(0, 10).forEach(o => console.log('    ' + fmt(o)));
        if (arr.length > 10) console.log(`    ... +${arr.length - 10} more`);
      };
      show('ANIMCONF — scroll-reveal cancels mobile scale()', m.animconf,
        o => `${o.el}  at rest ${o.atRest}  ->  revealed ${o.revealed}`);
      show('CLIPPED — mobile-only horizontal cut-off', newClipped,
        o => `${o.el}  x[${o.left}..${o.right}] w=${o.w} overR=${o.overR} overL=${o.overL}  clippedBy=${o.via}`);
      show('VCLIP — mobile-only bottom cut-off', newVclip,
        o => `${o.el}  visibleH=${o.visH} contentOverflowsBy=${o.lost}px`);
      const scrollers = [...new Set(Object.values(m.scrolled).map(o => o.via))];
      if (scrollers.length) console.log('  (intentional swipe strips: ' + scrollers.join(', ') + ')');
      if (!has) console.log('  clean');
      if (errors.length) console.log('  ERRORS: ' + errors.join(' | '));
    }
    await page.close();
  }
  await browser.close();

  if (anyRegression) {
    console.error('\nFAILED: new mobile-only clipping/scroll-reveal-conflict detected (see above).');
    process.exitCode = 1;
  } else {
    console.log('\nOK: no unexpected mobile regressions.');
  }
})();
