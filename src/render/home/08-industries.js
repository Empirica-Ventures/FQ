var spell = require('../html').spell;
var icons = require('../_fixtures/home-industries-icons');

// Fixes two live bugs. (1, extraction-time) The "Explore all industries"
// link pointed at /services.html instead of /industries.html -- the same
// class of mislabeled-href bug already fixed on the home services teaser.
// (2, client feedback) each card itself was a plain <div> with no link at
// all despite its hover affordance and trailing arrow glyph -- now an <a>
// to /industries.html#<id>, the same in-page anchor the Industries page's
// own quick-nav bar already uses for this exact section.
// circleStyle is derived from homeAccent (cream cards get a dark circle
// for contrast, every other accent gets light) rather than stored
// separately -- it's a rendering consequence of the accent, not an
// independent editorial choice.
// css/home-industries.css's .industries__grid wraps to additional rows
// once more cards exist than fit in one (6 today, at a fixed 1280px row
// width / 203px card width). .industries__inner's height has to grow to
// match however many rows that produces, or a wrapped row is invisibly
// clipped by the section's overflow:hidden -- computed here rather than
// hardcoded, since row count depends on items.length, known at build
// time. Height formula matches the CSS's own commented breakdown: a
// 210px top offset, one 234px card row per row, 12px between rows
// (matching the grid's own column gap), plus 80px of bottom breathing
// room -- 6 items (1 row) computes to exactly 524px, the same value the
// CSS fallback uses, so nothing changes until a 7th card actually exists.
var CARDS_PER_ROW = 6;
var CARD_HEIGHT = 234;
var ROW_GAP = 12;
var TOP_OFFSET = 210;
var BOTTOM_BREATHING_ROOM = 80;

// Matches the existing 6 hand-drawn icons' own color convention exactly
// (red-accent cards use brand-red, green-accent use green, cream-accent
// use white against their dark-tinted circle) -- used only as the
// DEFAULT_ICON fallback's color for an industry added through the CMS
// with no matching fixture in home-industries-icons.js.
var ACCENT_ICON_COLOR = { red: '#8B0A32', green: '#2B6B25', cream: '#FFFFFF' };

module.exports = function (content) {
  var items = content.industries.items;
  var rows = Math.ceil(items.length / CARDS_PER_ROW);
  var innerHeight = TOP_OFFSET + rows * CARD_HEIGHT + (rows - 1) * ROW_GAP + BOTTOM_BREATHING_ROOM;

  // id doubles as the /industries.html#<id> anchor and that page's own
  // <section id="..."> (src/render/industries/_detail-template.js) -- now
  // that it's CMS-editable (unlocked alongside allow_add), a typo'd
  // duplicate would silently break anchor navigation for both industries
  // sharing it, with no visible build error. Asserted here since this is
  // the first render function to run against content.industries.items
  // (src/pages/index.json builds alphabetically before industries.json).
  var seenIds = {};
  items.forEach(function (ind) {
    if (seenIds[ind.id]) throw new Error('home industries: duplicate id "' + ind.id + '" -- each industry needs a unique id');
    seenIds[ind.id] = true;
  });

  var cards = items.map(function (ind) {
    var circleStyle = ind.homeAccent === 'cream' ? 'dark' : 'light';
    var icon = icons[ind.id] || icons.DEFAULT_ICON(ACCENT_ICON_COLOR[ind.homeAccent] || ACCENT_ICON_COLOR.red);

    return '      <a href="/industries.html#' + ind.id + '" class="industries__card industries__card--' + ind.homeAccent + '">\n' +
      '        <div class="industries__icon-circle industries__icon-circle--' + circleStyle + '">\n' +
      '          ' + icon + '\n' +
      '        </div>\n' +
      '        <p class="industries__title animate-on-scroll">' + spell(ind.label) + '</p>\n' +
      '        <div class="industries__rule animate-on-scroll"></div>\n' +
      '        <p class="industries__desc animate-on-scroll">' + spell(ind.homeDesc) + '</p>\n' +
      '        <p class="industries__arrow">' + spell('→') + '</p>\n' +
      '      </a>';
  }).join('\n\n');

  return '<section class="industries">\n' +
    '  <div class="industries__inner" style="--industries-inner-height:' + innerHeight + 'px;">\n' +
    '    <p class="industries__eyebrow animate-on-scroll">INDUSTRIES WE SERVE</p>\n' +
    '    <h2 class="industries__heading animate-on-scroll">We know the numbers that move your industry.</h2>\n' +
    '    <p class="industries__subtext">Different sectors run on different numbers. We build finance around how yours actually works.</p>\n' +
    '\n' +
    '    <a href="/industries.html" class="industries__cta animate-on-scroll">Explore all industries &rarr;</a>\n' +
    '    <div class="industries__cta-rule"></div>\n' +
    '\n' +
    '    <div class="industries__grid">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
