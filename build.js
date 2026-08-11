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
  const imagesPath = path.join(ROOT, 'content/images.json');
  if (fs.existsSync(imagesPath)) out.images = JSON.parse(read(imagesPath));

  // Per-page <title> and meta description. These used to live in
  // src/pages/*.json alongside that page's `sections` and `css` lists —
  // editorial copy sitting in the same file as the build's structural wiring,
  // which is why they weren't CMS-editable: exposing those files to an editor
  // would put the section manifest one mis-click away from breaking the page.
  // Keyed by output filename minus .html, so buildPage() can look its own
  // entry up without src/pages/*.json needing to name it.
  const seoPath = path.join(ROOT, 'content/seo.json');
  if (fs.existsSync(seoPath)) out.seo = JSON.parse(read(seoPath));

  // Page-scoped singleton content (one file per page, kept under its own
  // kebab-case filename as the key rather than flattened to the top level —
  // unlike collections/taxonomies, these aren't meant to be a stable public
  // API for render modules in general, just per-page data for that page's
  // own render function).
  out.pages = {};
  const pagesDir = path.join(ROOT, 'content/pages');
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir).filter(f => f.endsWith('.json'))) {
      out.pages[f.slice(0, -'.json'.length)] = JSON.parse(read(path.join(pagesDir, f)));
    }
  }

  // Static section copy: the headings, eyebrows, body paragraphs and button
  // labels that used to be typed directly into src/partials/*.html and into
  // the render modules. One file per page, mirroring content/pages/ — read
  // by render modules as content.copy['<page>'], and turned into
  // {{TXT_*}}/{{TXTA_*}} tokens for the partials that are still plain HTML
  // (see copyTokens()).
  out.copy = {};
  const copyDirPath = path.join(ROOT, 'content/copy');
  if (fs.existsSync(copyDirPath)) {
    for (const f of fs.readdirSync(copyDirPath).filter(f => f.endsWith('.json'))) {
      out.copy[f.slice(0, -'.json'.length)] = JSON.parse(read(path.join(copyDirPath, f)));
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
// [A-Z0-9_] rather than [A-Z_]: copy tokens are generated from content keys,
// which may legitimately carry a digit (a "line1"/"line2" pair, a "col2"
// heading). An unmatched token is still left verbatim, exactly as before.
function injectTokens(str, map) {
  return str.replace(/\{\{[A-Z0-9_]+\}\}/g, (token) =>
    Object.prototype.hasOwnProperty.call(map, token) ? map[token] : token
  );
}

// injectTokens() deliberately leaves an unmatched token verbatim, because the
// structural tokens are substituted at several different levels and an
// intermediate pass legitimately sees tokens it can't resolve yet. That
// tolerance is wrong for copy tokens in *finished* output: a typo'd or
// unreachable {{TXT_*}} would ship as literal braces on the live page.
//
// This is the check that catches the whole class, including the case
// verify/check_copy_tokens.js structurally cannot see: a page whose builder
// forgot to pass the copy map at all, where every key exists and every token
// still renders broken (exactly what buildErrorPage() did before it was given
// PARTIAL_TOKENS).
function assertNoUnresolvedCopyTokens(html, label) {
  const leftover = [...new Set((html.match(/\{\{TXTA?_[A-Z0-9_]*\}\}/g) || []))];
  if (leftover.length) {
    throw new Error(
      label + ' still contains ' + leftover.length + ' unresolved copy token(s): ' +
      leftover.join(', ') + ' -- either the key is missing from content/copy/, ' +
      'or this page is built without the copy token map'
    );
  }
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

// One {{IMG_<KEY>_SRC/ALT/WIDTH/HEIGHT}} token per field, built from
// content/images.json — the simplest possible content mechanism for a
// singleton field (an <img>'s attributes) sitting inside an otherwise
// hand-written partial that isn't extracted to a render function. width/
// height are data-driven, not hardcoded in the HTML, so a replacement
// image with different real dimensions doesn't get squashed into the old
// image's aspect ratio (verify/check_image_dims.js asserts they match the
// actual file).
function imageTokens(images) {
  const map = {};
  if (!images) return map;
  for (const [key, img] of Object.entries(images.items)) {
    const upper = key.toUpperCase().replace(/-/g, '_');
    map[`{{IMG_${upper}_SRC}}`] = img.src;
    map[`{{IMG_${upper}_ALT}}`] = escapeAttr(img.alt);
    map[`{{IMG_${upper}_WIDTH}}`] = String(img.width);
    map[`{{IMG_${upper}_HEIGHT}}`] = String(img.height);
  }
  return map;
}
const IMAGE_TOKENS = imageTokens(content.images);

// One token per editable string in content/copy/, for the section partials
// that are still hand-written HTML rather than render modules. Same idea as
// imageTokens() above, extended to nested objects so a page's copy file can
// be grouped by section (home.json's `finalCta.heading` becomes
// {{TXT_HOME_FINAL_CTA_HEADING}}).
//
// Two tokens per string, because a partial may drop the same value into
// either position and each needs its own escaping:
//   {{TXT_...}}   HTML text node   (spell(): escapes, then re-spells the
//                                   typographic characters these partials
//                                   author as named entities)
//   {{TXTA_...}}  attribute value  (attr(): the above plus quotes)
// Only the token a partial actually references gets substituted; the other
// is simply never looked up.
//
// An array of strings becomes one hard-wrapped block joined with <br />
// (headings on this site are frequently split across hand-placed lines).
// Every line is escaped individually -- the <br /> is the build's, never
// the editor's, so a heading can't smuggle markup onto the page.
const html = require('./src/render/html');

function copyTokens(copy) {
  const map = {};
  const snake = (key) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_').toUpperCase();

  function walk(prefix, value) {
    if (typeof value === 'string') {
      map[`{{TXT_${prefix}}}`] = html.spell(value);
      map[`{{TXTA_${prefix}}}`] = html.attr(value);
      return;
    }
    if (Array.isArray(value)) {
      if (value.every(v => typeof v === 'string')) {
        map[`{{TXT_${prefix}}}`] = value.map(html.spell).join('<br />');
      }
      // A list of objects is repeating structure, not a single slot -- it has
      // no sensible token form and is read by a render module instead.
      return;
    }
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        walk(prefix ? prefix + '_' + snake(k) : snake(k), v);
      }
    }
  }

  for (const [file, value] of Object.entries(copy)) walk(snake(file), value);
  return map;
}
const COPY_TOKENS = copyTokens(content.copy);
const PARTIAL_TOKENS = Object.assign({}, IMAGE_TOKENS, COPY_TOKENS);

// navbar.html stays a static partial (logo/CTA/menu-toggle aren't
// extracted) except for its two nav-link lists, which used to be two
// hand-typed 8-item lists kept in sync by hand.
const navbarLinks = require('./src/render/navbar/links');
const navbar = injectTokens(read(path.join(ROOT, 'src/partials/navbar.html')), Object.assign({
  '{{NAVBAR_LINKS}}': navbarLinks(content, { mobile: false }),
  '{{NAVBAR_MOBILE_LINKS}}': navbarLinks(content, { mobile: true }),
}, PARTIAL_TOKENS));

// footer.html stays a static partial (logo, tagline, contact column) except
// for its services/company/social columns, each data-driven the same way
// images are: a single token per list, computed from a shared collection.
// See src/render/footer/services-list.js for why the footer's services
// order differs from every other services render site.
const footerServicesList = require('./src/render/footer/services-list');
const footerCompanyList = require('./src/render/footer/company-list');
const footerSocialList = require('./src/render/footer/social-list');
const footerInnerStyle = require('./src/render/footer/inner-style');
const footer = injectTokens(read(path.join(ROOT, 'src/partials/footer.html')), Object.assign({
  '{{FOOTER_SERVICES_LIST}}': footerServicesList(content),
  '{{FOOTER_COMPANY_LIST}}': footerCompanyList(content),
  '{{FOOTER_SOCIAL_LIST}}': footerSocialList(content),
  '{{FOOTER_INNER_STYLE}}': footerInnerStyle(content),
}, PARTIAL_TOKENS));

function buildSection(rel) {
  if (rel.endsWith('.js')) return require(path.join(ROOT, 'src/render', rel))(content);
  return injectTokens(read(path.join(ROOT, 'src/partials', rel)), PARTIAL_TOKENS);
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

  // content/seo.json is the only source for these — src/pages/*.json no longer
  // carries a title/description at all. A fallback there would have meant the
  // same string living in two files with a silent precedence order, so editing
  // the one a developer would naturally reach for had no effect. Missing entry
  // is a hard failure rather than a blank <title>.
  const seoKey = config.outputFile.replace(/\.html$/, '');
  const seo = (content.seo && content.seo.pages && content.seo.pages[seoKey]);
  if (!seo || !seo.title || !seo.description) {
    throw new Error(
      'content/seo.json has no title/description for "' + seoKey + '" (' +
      config.outputFile + ') -- every page needs one; add it under "pages"'
    );
  }
  const html = injectTokens(shellTemplate, {
    '{{TITLE}}': escapeAttr(seo.title),
    '{{DESCRIPTION}}': escapeAttr(seo.description),
    '{{CANONICAL_URL}}': SITE_ORIGIN + canonicalPath,
    '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
    '{{ALL_CSS}}': allCss,
    '{{NAVBAR}}': navbar,
    '{{CONTENT}}': sectionsHtml,
    '{{FOOTER}}': footer,
  });

  fs.mkdirSync(DIST, { recursive: true });
  assertNoUnresolvedCopyTokens(html, config.outputFile);
  fs.writeFileSync(path.join(DIST, config.outputFile), html, 'utf-8');
  console.log('built', config.outputFile);
}

// Insights articles are the first "one config -> N pages" fan-out the build
// has: each item in content/collections/insights-articles.json becomes its
// own dist/insights/<slug>.html, reusing the same shell/navbar/footer as
// buildPage() but with its own CSS bundle (insights-article-detail.css is
// deliberately NOT in src/pages/insights.json's css list, since it must not
// apply to the /insights.html listing page). Returns one pseudo page-config
// per article so buildSitemap() picks them up the same way it does real pages.
const insightsArticleDetail = require('./src/render/insights/article-detail');

// Two invariants the CMS can't enforce on its own, now that the article
// count is unlocked and the slug is editable (both were previously
// guaranteed by the collection being frozen at exactly 7 hand-authored
// items with hidden slugs). A hard build failure is the right response to
// either: both silently destroy a page rather than merely mis-styling one,
// and editorial_workflow means this runs on the preview deploy before an
// editor's change can reach production.
function validateInsightsArticles(articles) {
  const seen = new Map();
  articles.forEach((article, i) => {
    if (!article.slug) {
      throw new Error('insights article #' + (i + 1) + ' ("' + article.title + '") has no URL slug');
    }
    if (seen.has(article.slug)) {
      throw new Error(
        'two insights articles share the slug "' + article.slug + '" ("' +
        seen.get(article.slug) + '" and "' + article.title + '") -- they would ' +
        'overwrite each other at /insights/' + article.slug + '.html'
      );
    }
    seen.set(article.slug, article.title);
  });

  const featured = articles.filter(a => a.featured);
  if (featured.length !== 1) {
    throw new Error(
      'exactly one insights article must be marked Featured, found ' + featured.length +
      (featured.length ? ' ("' + featured.map(a => a.title).join('", "') + '")' : '') +
      ' -- the Insights page has a single featured slot'
    );
  }
}

function buildInsightsArticles(content) {
  const categories = content.insightsCategories.items;
  const articles = content.insightsArticles.items;
  validateInsightsArticles(articles);
  const articleCss = minifyCss(read(path.join(ROOT, 'css', 'insights-article-detail.css')));
  const allCss = baseCss + '\n' + articleCss;
  const outDir = path.join(DIST, 'insights');
  fs.mkdirSync(outDir, { recursive: true });

  return articles.map(article => {
    const outputFile = 'insights/' + article.slug + '.html';
    const html = injectTokens(shellTemplate, {
      '{{TITLE}}': escapeAttr(article.title + ' | Frontier Quotient Insights'),
      '{{DESCRIPTION}}': escapeAttr(article.excerpt),
      '{{CANONICAL_URL}}': SITE_ORIGIN + '/' + outputFile,
      '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
      '{{ALL_CSS}}': allCss,
      '{{NAVBAR}}': navbar,
      '{{CONTENT}}': insightsArticleDetail(article, categories, content.copy.insights.articleDetail),
      '{{FOOTER}}': footer,
    });
    assertNoUnresolvedCopyTokens(html, outputFile);
    fs.writeFileSync(path.join(DIST, outputFile), html, 'utf-8');
    console.log('built', outputFile);
    return { outputFile, priority: 0.5 };
  });
}

function buildErrorPage() {
  const template = read(path.join(ROOT, 'src/404.html'));
  const pageCss = minifyCss(read(path.join(ROOT, 'css', 'error-404.css')));
  const seo = content.seo && content.seo.pages && content.seo.pages['404'];
  if (!seo || !seo.title || !seo.description) {
    throw new Error('content/seo.json has no title/description for "404" -- add it under "pages"');
  }
  const html = injectTokens(template, Object.assign({}, PARTIAL_TOKENS, {
    '{{TITLE}}': escapeAttr(seo.title),
    '{{DESCRIPTION}}': escapeAttr(seo.description),
    '{{CANONICAL_URL}}': SITE_ORIGIN + '/404.html',
    '{{OG_IMAGE_URL}}': SITE_ORIGIN + '/assets/images/og-default.jpg',
    '{{ALL_CSS}}': baseCss + '\n' + pageCss,
    '{{NAVBAR}}': navbar,
    '{{FOOTER}}': footer,
  }));
  assertNoUnresolvedCopyTokens(html, '404.html');
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
  const insightsArticleConfigs = buildInsightsArticles(content);

  copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'));
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  if (fs.existsSync(path.join(ROOT, 'admin'))) copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));
  buildRobotsTxt();
  buildSitemap(pageConfigs.concat(insightsArticleConfigs));
  console.log('done. dist/ is ready.');
}

try {
  main();
} catch (err) {
  console.error('\nBuild failed: ' + err.message + '\n');
  console.error(err.stack);
  process.exit(1);
}
