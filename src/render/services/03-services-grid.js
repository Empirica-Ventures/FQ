var htmlHelpers = require('../html');
var spell = htmlHelpers.spell;
var icons = require('../_fixtures/services-grid-icons');

// Accent color cycles green/navy/red by position -- a fixed visual rhythm
// across the 6 cards, not an editorial choice, so it's derived from index
// here rather than stored per-item.
var ACCENTS = ['green', 'navy', 'red'];

module.exports = function (content) {
  var items = content.services.items;

  var cards = items.map(function (svc, i) {
    var accent = ACCENTS[i % 3];
    var watermark = String(i + 1).padStart(2, '0');
    var icon = icons[svc.slug];
    if (!icon) throw new Error('services-grid: no icon fixture for slug "' + svc.slug + '"');

    var tagRows = svc.gridTagRows.map(function (row) {
      var tags = row.tags.map(function (t) {
        return '          <span class="services-grid__tag">' + spell(t) + '</span>';
      }).join('\n');
      return '        <div class="services-grid__tags" style="top:' + row.top + 'px;">\n' + tags + '\n        </div>';
    }).join('\n');

    return (
      // Raw "&", not spell()'d, and an en dash (–) -- an HTML comment
      // isn't parsed for entities, and the original partial's comments were
      // never escaped even though the visible <h3> two lines below is.
      '      <!-- ' + watermark + ' – ' + svc.name + ' -->\n' +
      '      <a href="' + svc.href + '" class="services-grid__card services-grid__card--' + accent + '">\n' +
      '        <div class="services-grid__card-bar"></div>\n' +
      '        <p class="services-grid__watermark">' + watermark + '</p>\n' +
      '        ' + icon + '\n' +
      '        <h3 class="services-grid__title animate-on-scroll">' + spell(svc.name) + '</h3>\n' +
      '        <div class="services-grid__rule animate-on-scroll"></div>\n' +
      '        <p class="services-grid__body animate-on-scroll">' + spell(svc.gridBlurb) + '</p>\n' +
      tagRows + '\n' +
      '        <div class="services-grid__divider"></div>\n' +
      '        <div class="services-grid__link">\n' +
      '          <span class="services-grid__link-arrow">' + spell('→') + '</span>\n' +
      '          <span class="services-grid__link-text">' + spell(svc.gridLinkText) + '</span>\n' +
      '        </div>\n' +
      '      </a>'
    );
  });

  return '<section class="services-grid">\n' +
    '  <div class="services-grid__inner">\n' +
    '    <p class="services-grid__eyebrow animate-on-scroll">WHAT WE DELIVER</p>\n' +
    '    <h2 class="services-grid__heading animate-on-scroll">Six core services</h2>\n' +
    '    <div class="services-grid__accent"></div>\n' +
    '\n' +
    '    <div class="services-grid__cards">\n' +
    cards.join('\n\n') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
