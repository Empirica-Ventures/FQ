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

// Editable content, loaded once. Every file in content/collections/ and
// content/taxonomies/ is exposed under a camelCase key derived from its
// filename (case-studies.json -> content.caseStudies), for render modules
// in src/render/ to read from. Plain JSON, no parser dependency.
function loadContent() {
  const out = {};
  for (const dir of ['content/collections', 'content/taxonomies']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).filter(f => f.endsWith('.json'))) {
      const key = f.slice(0, -'.json'.length).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[key] = JSON.parse(read(path.join(abs, f)));
    }
  }
  return out;
}
const content = loadContent();

const BASE_CSS_FILES = ['fonts.css', 'variables.css', 'base.css', 'navbar.css', 'footer.css', 'whatsapp.css'];
const baseCss = BASE_CSS_FILES
  .map(name => minifyCss(read(path.join(ROOT, 'css', name))))
  .join('\n');

// Placeholder production domain — swap for the real domain once hosting is
// chosen (also update robots.txt / sitemap.xml, which use the same value).
const SITE_ORIGIN = 'https://www.frontierquotient.com';

// Single-pass token substitution: a lone regex scan finds every {{TOKEN}},
// so a replacement value that itself contains "{{OTHER_TOKEN}}" is never
// re-scanned and re-substituted. The previous split/join-per-key version
// was multi-pass by construction — harmless for today's hand-written
// partials, but unsafe the moment page content comes from an editable
// source (a case-study field containing the literal text "{{FOOTER}}"
// would otherwise get the whole footer inlined into it).
function injectTokens(str, map) {
  return str.replace(/\{\{[A-Z_]+\}\}/g, (token) =>
    Object.prototype.hasOwnProperty.call(map, token) ? map[token] : token
  );
}

// Titles/descriptions come from plain-text JSON (e.g. "FP&A") and land
// inside HTML attribute values (meta content="...") several times per page
// (description, og:description, twitter:description) — escape here once
// rather than needing every page config to hand-write "&amp;". Also escapes
// "<"/">": {{TITLE}} additionally lands as element content in <title>, where
// an unescaped "<" would open a tag.
function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSection(rel) {
  if (rel.endsWith('.js')) return require(path.join(ROOT, 'src/render', rel))(content);
  return read(path.join(ROOT, 'src/partials', rel));
}

function buildPage(config) {
  const sectionsHtml = config.sections
    .map(buildSection)
    .join('\n');
  const pageCss = config.css
    .map(name => minifyCss(read(path.join(ROOT, 'css', name))))
    .join('\n');
  const allCss = baseCss + '\n' + pageCss;
  const canonicalPath = config.outputFile === 'index.html' ? '/' : '/' + config.outputFile;

  const html = injectTokens(shellTemplate, {
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
  const html = injectTokens(template, {
    '{{TITLE}}': escapeAttr('404: Page Not Found | Frontier Quotient'),
    '{{DESCRIPTION}}': escapeAttr('This page could not be found.'),
    '{{CANONICAL_URL}}': SITE_ORIGIN + '/404.html',
    '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
    '{{ALL_CSS}}': baseCss + '\n' + pageCss,
    '{{NAVBAR}}': navbar,
    '{{FOOTER}}': footer,
  });
  fs.writeFileSync(path.join(DIST, '404.html'), html, 'utf-8');
  console.log('built 404.html');
}

// Generated rather than copied verbatim, so SITE_ORIGIN stays the single
// source of truth for every absolute URL the build emits (it was previously
// duplicated across build.js, robots.txt and sitemap.xml, and the checked-in
// sitemap.xml had silently drifted — missing all 6 service detail pages).
function buildRobotsTxt() {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), txt, 'utf-8');
  console.log('built robots.txt');
}

function buildSitemap(pageConfigs) {
  const urls = pageConfigs.map(config => {
    const canonicalPath = config.outputFile === 'index.html' ? '/' : '/' + config.outputFile;
    const priority = (config.priority != null ? config.priority : 0.5).toFixed(1);
    return `  <url><loc>${SITE_ORIGIN}${canonicalPath}</loc><priority>${priority}</priority></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log('built sitemap.xml');
}

function main() {
  // Nothing was ever deleted from dist/, so a page removed from src/pages/
  // (or renamed) left its old, unpublished HTML live and served. Clean first.
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const pagesDir = path.join(ROOT, 'src/pages');
  const pageConfigFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'));
  const pageConfigs = pageConfigFiles.map(f => JSON.parse(read(path.join(pagesDir, f))));

  for (const config of pageConfigs) buildPage(config);
  buildErrorPage();

  copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'));
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  buildRobotsTxt();
  buildSitemap(pageConfigs);
  console.log('done. dist/ is ready.');
}

try {
  main();
} catch (err) {
  console.error('\nBuild failed: ' + err.message + '\n');
  console.error(err.stack);
  process.exit(1);
}
