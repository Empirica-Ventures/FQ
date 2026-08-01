var spell = require('../html').spell;
var icons = require('../_fixtures/home-services-icons');

// Fixes a live bug caught during extraction: all 6 cards linked to the
// generic /services.html instead of their own detail page. stagger-N
// (1..3, repeating every row) and the "Row 1"/"Row 2" comments are
// derived from index -- this is a fixed 2-row grid, not per-item data.
module.exports = function (content) {
  var items = content.services.items;

  var cards = items.map(function (svc, i) {
    var stagger = (i % 3) + 1;
    var icon = icons[svc.slug];
    if (!icon) throw new Error('home services: no icon fixture for slug "' + svc.slug + '"');
    var titleLines = svc.homeNameLines.map(spell).join('<br>');

    var comment = i === 0 ? '      <!-- Row 1 -->\n' : i === 3 ? '      <!-- Row 2 -->\n' : '';

    return comment +
      '      <article class="services__card services__card--lg animate-on-scroll stagger-' + stagger + '">\n' +
      '        <div class="services__card-bar"></div>\n' +
      '        <div class="services__icon">\n' +
      '          <span class="services__icon-bg services__icon-bg--' + icon.bg + '"></span>\n' +
      '          ' + icon.svg + '\n' +
      '        </div>\n' +
      '        <h3 class="services__card-title">' + titleLines + '</h3>\n' +
      '        <p class="services__card-body">' + spell(svc.homeBlurb) + '</p>\n' +
      '        <a class="services__card-link" href="' + svc.href + '">LEARN MORE &rarr;</a>\n' +
      '      </article>';
  });

  return '<section class="services">\n' +
    '  <div class="services__inner">\n' +
    '    <div class="services__rings" aria-hidden="true">\n' +
    '      <div class="services__ring services__ring--1"></div>\n' +
    '      <div class="services__ring services__ring--2"></div>\n' +
    '    </div>\n' +
    '\n' +
    '    <p class="services__eyebrow animate-on-scroll">WHAT WE DO</p>\n' +
    '    <h2 class="services__heading animate-on-scroll stagger-1">Built to work as one.</h2>\n' +
    '    <a class="services__view-all animate-on-scroll stagger-2" href="/services.html">VIEW ALL SERVICES &rarr;</a>\n' +
    '\n' +
    '    <div class="services__grid">\n' +
    cards.join('\n\n') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
