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
module.exports = function (content) {
  var items = content.industries.items;

  var cards = items.map(function (ind) {
    var circleStyle = ind.homeAccent === 'cream' ? 'dark' : 'light';
    var icon = icons[ind.id];
    if (!icon) throw new Error('home industries: no icon fixture for id "' + ind.id + '"');

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
    '  <div class="industries__inner">\n' +
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
