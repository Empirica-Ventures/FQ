// Finds graphics that fit the viewport but are visually degraded on mobile:
// content sitting under a transform:scale() shrink, reported with its
// effective (post-scale) rendered size so illegibly-small text shows up.
const { chromium } = require('playwright');
// This sandbox ships a Chromium build older than the revision this Playwright
// version auto-downloads, so point at it explicitly. Override with
// CHROMIUM_PATH=... , or unset it to use Playwright's own download.
const LAUNCH = process.env.CHROMIUM_PATH === ''
  ? {}
  : { executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' };

const PAGES = ['index','about','services','how-we-work','industries','case-studies','insights','contact','bookkeeping','cashflow','cleanup','fpa','mgmt-reporting','tax-vat','404'];
(async () => {
  const b = await chromium.launch(LAUNCH);
  const p = await b.newPage({ viewport: { width: 375, height: 812 } });
  for (const name of PAGES) {
    await p.goto('http://127.0.0.1:8843/' + name + '.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('.animate-on-scroll').forEach(e => e.classList.add('is-visible')));
    await p.waitForTimeout(500);
    const rows = await p.evaluate(() => {
      const out = [];
      const label = el => { const c=(el.className||'').toString().split(/\s+/).filter(Boolean).slice(0,2).join('.');
        return el.tagName.toLowerCase()+(c?'.'+c:''); };
      // Accumulated scale factor from all ancestor transforms.
      const scaleOf = el => {
        let s = 1;
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          const m = new DOMMatrixReadOnly(getComputedStyle(n).transform);
          if (m.a && Math.abs(m.a - 1) > 0.01) s *= m.a;
        }
        return s;
      };
      const seenScalers = new Set();
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const m = new DOMMatrixReadOnly(cs.transform);
        if (m.a && m.a < 0.95 && m.a > 0) {
          const r = el.getBoundingClientRect();
          seenScalers.add(label(el) + ` scale=${m.a.toFixed(2)} rendered=${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }
      // Smallest effective text under any scaled ancestor.
      const tiny = {};
      for (const el of document.querySelectorAll('body *')) {
        if (!el.textContent.trim() || el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const s = scaleOf(el);
        if (s >= 0.95) continue;
        const eff = parseFloat(cs.fontSize) * s;
        if (eff < 9) {
          const k = label(el);
          if (!tiny[k] || eff < tiny[k]) tiny[k] = eff;
        }
      }
      return { scalers: [...seenScalers], tiny: Object.entries(tiny).map(([k,v]) => `${k} -> ${v.toFixed(1)}px effective`) };
    });
    if (rows.scalers.length || rows.tiny.length) {
      console.log('\n' + name + ':');
      rows.scalers.forEach(s => console.log('  SCALED  ' + s));
      rows.tiny.forEach(s => console.log('  TINYTEXT ' + s));
    }
  }
  await b.close();
})();
