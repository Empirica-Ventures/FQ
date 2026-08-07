var spell = require('../html').spell;

// Two marquee rows instead of the old static 13-column grid, per client
// feedback: row 1 scrolls right-to-left, row 2 scrolls left-to-right (see
// css/services-trusted-by.css for how the opposite direction is achieved
// with the same @keyframes). Logos split evenly across the two rows by
// position rather than the old i%13 grid-column math, so this stays
// correct at any logo count -- an odd count puts the extra logo in row 1.
//
// Each row's track duplicates its own logo set once, back to back, so
// js/main.js can measure the gap between the first real tile and the
// first duplicate tile and scroll by exactly that distance for a seamless
// loop (same mechanism as the toolkit ticker in how-we-work/03-tools.js).
//
// Each logo renders via object-fit: contain inside a fixed-size card (see
// css/services-trusted-by.css) -- no per-logo crop offsets to hand-tune,
// so any number of logos of any source aspect ratio can be added through
// the CMS with no code changes.
module.exports = function (content) {
  var copy = content.copy.services.trustedBy;
  var items = content.trustedBy.items;
  var half = Math.ceil(items.length / 2);
  var rows = [items.slice(0, half), items.slice(half)];

  function tile(logo, hidden) {
    var attrs = hidden ? ' aria-hidden="true"' : '';
    var alt = hidden ? '' : spell(logo.alt);
    var label = logo.label.split('\n').map(spell).join('<br />');
    return '          <div class="trusted-by__tile"' + attrs + '>\n' +
      '            <div class="trusted-by__card"><img class="trusted-by__logo" src="' + logo.src + '" alt="' + alt + '" loading="lazy" /></div>\n' +
      '            <p class="trusted-by__label">' + label + '</p>\n' +
      '          </div>';
  }

  function band(rowItems, rowNum) {
    var real = rowItems.map(function (l) { return tile(l, false); }).join('\n');
    var duplicate = rowItems.map(function (l) { return tile(l, true); }).join('\n');
    return '    <div class="trusted-by__band trusted-by__band--row' + rowNum + '">\n' +
      '      <div class="trusted-by__track trusted-by__track--row' + rowNum + '">\n' +
      real + '\n\n' +
      duplicate + '\n' +
      '      </div>\n' +
      '      <div class="trusted-by__fade trusted-by__fade--left" aria-hidden="true"></div>\n' +
      '      <div class="trusted-by__fade trusted-by__fade--right" aria-hidden="true"></div>\n' +
      '    </div>';
  }

  return '<section class="trusted-by">\n' +
    '  <div class="trusted-by__inner">\n' +
    '    <p class="trusted-by__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="trusted-by__heading animate-on-scroll">' + spell(copy.heading) + '</h2>\n' +
    '    <div class="trusted-by__accent"></div>\n' +
    '\n' +
    band(rows[0], 1) + '\n' +
    '\n' +
    band(rows[1], 2) + '\n' +
    '  </div>\n' +
    '</section>\n';
};
