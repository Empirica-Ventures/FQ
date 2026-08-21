// Cross-checks the {{TXT_*}}/{{TXTA_*}} copy tokens in src/partials against
// the keys that actually exist in content/copy/.
//
// build.js leaves an unmatched token verbatim rather than failing, which is
// the right behaviour for its own structural tokens ({{NAVBAR}} etc. are
// substituted at a different level) but means a typo'd copy token ships as
// the literal text "{{TXT_HOME_HERO_BODDY}}" on the live page. This catches
// that. Also reports keys defined in content/copy/ that nothing references,
// which is how a stale key survives a partial being rewritten.
//
// Exits non-zero on a referenced-but-undefined token (a visible defect) and
// only warns on a defined-but-unreferenced key (dead content, harmless).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function walkFiles(dir, ext, out) {
  out = out || [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, ext, out);
    else if (entry.name.endsWith(ext)) out.push(p);
  }
  return out;
}

const snake = (key) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_').toUpperCase();

// Mirrors copyTokens() in build.js: which key paths produce a usable token.
function definedKeys() {
  const keys = new Set();
  const copyDir = path.join(ROOT, 'content/copy');
  for (const file of walkFiles(copyDir, '.json')) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const base = snake(path.basename(file, '.json'));
    (function walk(prefix, value) {
      if (typeof value === 'string') { keys.add(prefix); return; }
      if (Array.isArray(value)) {
        if (value.every(v => typeof v === 'string')) keys.add(prefix);
        return;
      }
      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          walk(prefix ? prefix + '_' + snake(k) : snake(k), v);
        }
      }
    })(base, data);
  }
  return keys;
}

const defined = definedKeys();
const referenced = new Map(); // key -> [files]
const sources = walkFiles(path.join(ROOT, 'src/partials'), '.html')
  .concat([path.join(ROOT, 'src/404.html'), path.join(ROOT, 'src/shell.html')].filter(fs.existsSync));

for (const file of sources) {
  const body = fs.readFileSync(file, 'utf-8');
  for (const m of body.matchAll(/\{\{TXTA?_([A-Z0-9_]+)\}\}/g)) {
    const key = m[1];
    if (!referenced.has(key)) referenced.set(key, []);
    const rel = path.relative(ROOT, file);
    if (!referenced.get(key).includes(rel)) referenced.get(key).push(rel);
  }
}

let failed = 0;
for (const [key, files] of referenced) {
  if (!defined.has(key)) {
    console.error('MISSING content/copy key for {{TXT_' + key + '}}  (used in ' + files.join(', ') + ')');
    failed++;
  }
}

// Render modules read content.copy.<page>.<section> directly rather than
// through a token, so an unreferenced key is only *probably* dead -- grep the
// render tree before reporting one.
const renderSrc = walkFiles(path.join(ROOT, 'src/render'), '.js')
  .map(f => fs.readFileSync(f, 'utf-8')).join('\n');
const unused = [...defined].filter(k => {
  if (referenced.has(k)) return false;
  const leaf = k.split('_').pop().toLowerCase();
  return !new RegExp('\\b' + leaf + '\\b', 'i').test(renderSrc);
});
if (unused.length) {
  console.warn('\nWARN: ' + unused.length + ' content/copy key(s) referenced by no partial or render module:');
  unused.forEach(k => console.warn('  ' + k));
}

if (failed) {
  console.error('\n' + failed + ' copy token(s) would ship as literal text.');
  process.exit(1);
}
console.log('OK: all ' + referenced.size + ' copy tokens in partials resolve (' + defined.size + ' keys defined).');
