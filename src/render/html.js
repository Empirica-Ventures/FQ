// The only two escapers a render function may use. Never expose raw HTML
// to content data -- every editable string goes through one of these.

// Editable text -> HTML text node.
function text(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Same as text(), plus re-spells the typographic characters this site's
// hand-written partials happened to author as named entities (an arrow as
// "&rarr;", a curly quote as "&rsquo;", etc.) instead of the literal UTF-8
// character. Extraction-only: it exists purely so moving a string from a
// partial into content/ produces byte-identical HTML. A later, separately-
// reviewed commit can drop entity-spelling entirely and let literal
// characters render (browsers treat them identically) -- at that point stop
// calling spell() and use text() instead. Written as \u escapes, not literal
// characters, so an invisible one (U+00A0 non-breaking space) can't be
// silently "fixed" by an editor or formatter.
var ENTITY_SPELLING = {
  '→': '&rarr;',   // ->
  '←': '&larr;',   // <-
  '↓': '&darr;',   // down arrow
  '’': '&rsquo;',  // right single quote
  '“': '&ldquo;',  // left double quote
  '”': '&rdquo;',  // right double quote
  '·': '&middot;', // middle dot
  ' ': '&nbsp;',   // non-breaking space
  'Δ': '&Delta;',  // capital delta
};
var ENTITY_PATTERN = /[→←↓’“”· Δ]/g;

function spell(s) {
  return text(s).replace(ENTITY_PATTERN, function (c) { return ENTITY_SPELLING[c]; });
}

module.exports = { text: text, spell: spell };
