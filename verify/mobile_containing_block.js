// Detects the "position: static broke my containing block" bug class.
//
// Several mobile fallbacks reset a wrapper from position:relative/absolute to
// static to drop it into normal flow. If that wrapper was the containing block
// for absolutely-positioned children, those children silently re-anchor to a
// further-out ancestor and fly off to the wrong place. Compares each abs-
// positioned element's offsetParent at 1440px vs 375px.
const { chromium } = require('playwright');
// This sandbox ships a Chromium build older than the revision this Playwright
// version auto-downloads, so point at it explicitly. Override with
// CHROMIUM_PATH=... , or unset it to use Playwright's own download.
const LAUNCH = process.env.CHROMIUM_PATH === ''
  ? {}
  : { executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' };

const PAGES = ['index','about','services','how-we-work','industries','case-studies','insights','contact','bookkeeping','cashflow','cleanup','fpa','mgmt-reporting','tax-vat','404'];

const MAP = () => {
  const label = el => { const c=(el.className||'').toString().split(/\s+/)
    .filter(x=>x&&x!=='animate-on-scroll'&&!/^stagger-/.test(x)&&x!=='is-visible').slice(0,2).join('.');
    return el.tagName.toLowerCase()+(c?'.'+c:''); };
  const path = el => { const p=[]; for(let n=el;n&&n!==document.body;n=n.parentElement)
    p.unshift(n.tagName.toLowerCase()+':'+[...(n.parentElement?.children||[])].indexOf(n)); return p.join('>'); };
  const out = {};
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'absolute') continue;
    if (cs.display === 'none') continue;
    out[path(el)] = { el: label(el), parent: el.offsetParent ? label(el.offsetParent) : 'none' };
  }
  return out;
};

(async () => {
  const b = await chromium.launch(LAUNCH);
  const settle = async (p, name) => {
    await p.goto('http://127.0.0.1:8843/' + name + '.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('.animate-on-scroll').forEach(e => e.classList.add('is-visible')));
    await p.waitForTimeout(400);
  };
  const dp = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const mp = await b.newPage({ viewport: { width: 375, height: 812 } });
  for (const name of PAGES) {
    await settle(dp, name); const d = await dp.evaluate(MAP);
    await settle(mp, name); const m = await mp.evaluate(MAP);
    const diffs = [];
    for (const k of Object.keys(m)) {
      if (d[k] && d[k].parent !== m[k].parent) {
        diffs.push(`${m[k].el}: containing block ${d[k].parent} (desktop) -> ${m[k].parent} (375px)`);
      }
    }
    const uniq = [...new Set(diffs)];
    if (uniq.length) { console.log('\n' + name + ':'); uniq.forEach(x => console.log('  ' + x)); }
  }
  await b.close();
})();
