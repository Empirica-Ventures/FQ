// Plain-Node static site builder: injects shared Navbar/Footer partials + page-specific
// section partials into a page shell, inlines all CSS into <head>, and copies js/assets
// into dist/ for deploy.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

function read(p) {
  return fs.readFileSync(p, 'utf-8');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Conservative minifier: strips /* ... */ comments and collapses blank lines/
// leading indentation. Does not touch string/URL contents, so data-URI SVG
// backgrounds (which use %-encoding, not literal "/*") are unaffected.
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

const navbar = read(path.join(ROOT, 'src/partials/navbar.html'));
const footer = read(path.join(ROOT, 'src/partials/footer.html'));
const shellTemplate = read(path.join(ROOT, 'src/shell.html'));

const BASE_CSS_FILES = ['fonts.css', 'variables.css', 'base.css', 'navbar.css', 'footer.css'];
const baseCss = BASE_CSS_FILES
  .map(name => minifyCss(read(path.join(ROOT, 'css', name))))
  .join('\n');

// Placeholder production domain — swap for the real domain once hosting is
// chosen (also update robots.txt / sitemap.xml, which use the same value).
const SITE_ORIGIN = 'https://www.frontierquotient.com';

function replaceAll(str, map) {
  let out = str;
  for (const [key, value] of Object.entries(map)) {
    out = out.split(key).join(value);
  }
  return out;
}

// Titles/descriptions come from plain-text JSON (e.g. "FP&A") and land
// inside HTML attribute values (meta content="...") several times per page
// (description, og:description, twitter:description) — escape here once
// rather than needing every page config to hand-write "&amp;".
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildPage(pageConfigPath) {
  const config = JSON.parse(read(pageConfigPath));
  const sectionsHtml = config.sections
    .map(rel => read(path.join(ROOT, 'src/partials', rel)))
    .join('\n');
  const pageCss = config.css
    .map(name => minifyCss(read(path.join(ROOT, 'css', name))))
    .join('\n');
  const allCss = baseCss + '\n' + pageCss;
  const canonicalPath = config.outputFile === 'index.html' ? '/' : '/' + config.outputFile;

  const html = replaceAll(shellTemplate, {
    '{{TITLE}}': escapeAttr(config.title),
    '{{DESCRIPTION}}': escapeAttr(config.description),
    '{{CANONICAL_URL}}': SITE_ORIGIN + canonicalPath,
    '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
    '{{ALL_CSS}}': allCss,
    '{{NAVBAR}}': navbar,
    '{{CONTENT}}': sectionsHtml,
    '{{FOOTER}}': footer,
  });

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, config.outputFile), html, 'utf-8');
  console.log('built', config.outputFile);
}

function buildErrorPage() {
  const template = read(path.join(ROOT, 'src/404.html'));
  const pageCss = minifyCss(read(path.join(ROOT, 'css', 'error-404.css')));
  const html = replaceAll(template, {
    '{{TITLE}}': '404: Page Not Found | Frontier Quotient',
    '{{DESCRIPTION}}': 'This page could not be found.',
    '{{CANONICAL_URL}}': SITE_ORIGIN + '/404.html',
    '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
    '{{ALL_CSS}}': baseCss + '\n' + pageCss,
    '{{NAVBAR}}': navbar,
    '{{FOOTER}}': footer,
  });
  fs.writeFileSync(path.join(DIST, '404.html'), html, 'utf-8');
  console.log('built 404.html');
}

function main() {
  const pagesDir = path.join(ROOT, 'src/pages');
  const pageConfigs = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
  for (const f of pageConfigs) buildPage(path.join(pagesDir, f));
  buildErrorPage();

  copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'));
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(DIST, 'robots.txt'));
  fs.copyFileSync(path.join(ROOT, 'sitemap.xml'), path.join(DIST, 'sitemap.xml'));
  console.log('done. dist/ is ready.');
}

main();
