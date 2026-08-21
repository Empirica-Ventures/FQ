const lighthouse = require('lighthouse').default;
const { defaultConfig } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const { chromium } = require('playwright');

async function main() {
  const url = process.argv[2] || 'http://localhost:8843/index.html';
  const outJson = process.argv[3] || 'verify/lighthouse-mobile-report.json';

  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';

  const chrome = await chromeLauncher.launch({
    chromePath: executablePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  console.log('Chrome launched on port', chrome.port, 'pid', chrome.pid);

  try {
    console.log('Starting lighthouse run (mobile/defaultConfig)...');
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }, defaultConfig);

    fs.writeFileSync(outJson, result.report);

    const lhr = result.lhr;
    console.log('URL:', url);
    console.log('Scores:');
    for (const [key, cat] of Object.entries(lhr.categories)) {
      console.log(`  ${cat.title}: ${Math.round(cat.score * 100)}`);
    }
    console.log('\nKey metrics:');
    const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
    for (const m of metrics) {
      const audit = lhr.audits[m];
      if (audit) console.log(`  ${audit.title}: ${audit.displayValue}`);
    }
    console.log('\nTop opportunities/diagnostics (score < 0.9):');
    for (const [id, audit] of Object.entries(lhr.audits)) {
      if (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'informative') {
        console.log(`  [${Math.round(audit.score * 100)}] ${audit.title}${audit.displayValue ? ' — ' + audit.displayValue : ''}`);
      }
    }
  } finally {
    try {
      await chrome.kill();
    } catch (e) {
      console.log('(chrome cleanup warning, ignored):', e.message);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
