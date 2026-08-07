// Full-site pixel diff, used to prove a content-extraction refactor changed
// no rendered output.
//
// Moving a hardcoded string out of a partial and into content/ is supposed to
// be invisible: same bytes on the page, same pixels on screen. That's a
// property worth machine-checking rather than eyeballing across 25 pages, so
// this captures every page twice (once per git state) and asserts a zero-pixel
// difference.
//
// Usage:
//   node verify/copy_extraction_diff.js capture <label>   # writes shots to a label dir
//   node verify/copy_extraction_diff.js compare <a> <b>   # diffs two labels
//
// reducedMotion is on: css/base.css's @media (prefers-reduced-motion: reduce)
// block resolves .animate-on-scroll to its revealed state with no transition,
// and both marquee tracks (css/hww-tools.css, css/services-trusted-by.css) to
// `animation: none`. Without it, every capture lands mid-animation and diffs
// are pure timing noise rather than real change.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SHOT_ROOT = process.env.SHOT_ROOT || path.join(ROOT, '.copy-diff');
const BASE = process.env.BASE || 'http://127.0.0.1:8911';
const WIDTHS = (process.env.WIDTHS || '1440,375').split(',').map(Number);

function pageList() {
  const pages = fs.readdirSync(path.join(ROOT, 'src/pages'))
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'src/pages', f), 'utf-8')).outputFile);
  const articles = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content/collections/insights-articles.json'), 'utf-8')
  ).items.map(a => 'insights/' + a.slug + '.html');
  return pages.concat(articles, ['404.html']).sort();
}

async function capture(label) {
  const outDir = path.join(SHOT_ROOT, label);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const pages = pageList();
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const rel of pages) {
      await page.goto(BASE + '/' + rel, { waitUntil: 'networkidle' });
      const name = rel.replace(/[/.]/g, '_') + '@' + width + '.png';
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    }
    await ctx.close();
  }
  await browser.close();
  console.log('captured ' + pages.length + ' pages x ' + WIDTHS.length + ' widths -> ' + outDir);
}

async function compare(a, b) {
  const dirA = path.join(SHOT_ROOT, a);
  const dirB = path.join(SHOT_ROOT, b);
  const names = fs.readdirSync(dirA).filter(f => f.endsWith('.png'));
  let failed = 0;
  for (const name of names) {
    const pb = path.join(dirB, name);
    if (!fs.existsSync(pb)) {
      console.log('MISSING in ' + b + ': ' + name);
      failed++;
      continue;
    }
    const ia = await sharp(path.join(dirA, name)).raw().toBuffer({ resolveWithObject: true });
    const ib = await sharp(pb).raw().toBuffer({ resolveWithObject: true });
    if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height) {
      console.log('SIZE  ' + name + ': ' + ia.info.width + 'x' + ia.info.height +
        ' vs ' + ib.info.width + 'x' + ib.info.height);
      failed++;
      continue;
    }
    let diff = 0;
    for (let i = 0; i < ia.data.length; i++) if (ia.data[i] !== ib.data[i]) diff++;
    if (diff) {
      console.log('DIFF  ' + name + ': ' + diff + ' bytes');
      failed++;
    }
  }
  const extra = fs.readdirSync(dirB).filter(f => f.endsWith('.png') && !names.includes(f));
  extra.forEach(n => { console.log('EXTRA in ' + b + ': ' + n); failed++; });
  if (failed) {
    console.error('\n' + failed + ' of ' + names.length + ' captures differ.');
    process.exit(1);
  }
  console.log('OK: all ' + names.length + ' captures pixel-identical.');
}

const [cmd, ...rest] = process.argv.slice(2);
(async () => {
  if (cmd === 'capture') await capture(rest[0] || 'baseline');
  else if (cmd === 'compare') await compare(rest[0], rest[1]);
  else {
    console.error('usage: copy_extraction_diff.js capture <label> | compare <a> <b>');
    process.exit(2);
  }
})();
