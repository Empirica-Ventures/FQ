// Asserts every editable string in content/ is actually reachable from the CMS.
//
// The point of extracting copy out of the partials was to let a non-technical
// editor change it. A key that exists in content/copy/ but has no field in
// admin/config.yml is invisible in the CMS — the string is "editable" only in
// the sense that someone with repo access can edit JSON, which is exactly the
// state this work set out to fix. That failure is silent: the site builds, the
// page renders, and the editor simply never sees the field. So it gets a check.
//
// Walks each content file this script knows should be fully exposed, flattens
// it to leaf key paths, and confirms admin/config.yml declares a matching
// nested field path in that file's collection.
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const config = yaml.load(fs.readFileSync(path.join(ROOT, 'admin/config.yml'), 'utf-8'));

// file path (repo-relative) -> the field-name path CMS-side, as a list
function leafPaths(value, prefix) {
  prefix = prefix || [];
  if (value === null || typeof value !== 'object') return [prefix];
  if (Array.isArray(value)) {
    // A list of strings is one field (a multi-line block or a repeatable list);
    // a list of objects is a list widget whose item fields are checked by name
    // rather than by index.
    if (value.every(v => typeof v !== 'object' || v === null)) return [prefix];
    return value.length ? leafPaths(value[0], prefix) : [prefix];
  }
  return Object.entries(value).flatMap(([k, v]) => leafPaths(v, prefix.concat(k)));
}

// Collect every declared field path for a given content file, from its
// collection entry in admin/config.yml.
function declaredPaths(fileEntry) {
  const out = new Set();
  (function walk(fields, prefix) {
    for (const field of fields || []) {
      const here = prefix.concat(field.name);
      out.add(here.join('.'));
      if (field.fields) walk(field.fields, here);
      if (field.field) walk([field.field], here);
      // A variable-type list widget: each type contributes its own subtree.
      if (field.types) for (const t of field.types) walk(t.fields || [], here);
    }
  })(fileEntry.fields, []);
  return out;
}

const fileEntries = new Map();
for (const collection of config.collections || []) {
  for (const f of collection.files || []) {
    if (f.file) fileEntries.set(f.file, f);
  }
}

// Everything under content/copy/, plus content/seo.json — the files whose whole
// purpose is to be editor-facing. content/collections/ and content/pages/ are
// deliberately not asserted here: several carry intentionally locked/hidden
// fields whose exposure is a per-field judgment call already argued in
// admin/config.yml's comments.
const targets = fs.readdirSync(path.join(ROOT, 'content/copy'))
  .filter(f => f.endsWith('.json'))
  .map(f => 'content/copy/' + f)
  .concat(['content/seo.json']);

let failed = 0;
for (const rel of targets) {
  const entry = fileEntries.get(rel);
  if (!entry) {
    console.error('NO CMS COLLECTION for ' + rel + ' -- nothing in it is editable');
    failed++;
    continue;
  }
  const declared = declaredPaths(entry);
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf-8'));
  const missing = leafPaths(data)
    .map(p => p.join('.'))
    .filter(p => !declared.has(p));
  if (missing.length) {
    console.error('\n' + rel + ' -- ' + missing.length + ' key(s) with no CMS field:');
    missing.forEach(p => console.error('  ' + p));
    failed += missing.length;
  }
}

if (failed) {
  console.error('\n' + failed + ' content key(s) are not editable through the CMS.');
  process.exit(1);
}
console.log('OK: every key in content/copy/ and content/seo.json has a CMS field (' +
  targets.length + ' files checked).');
