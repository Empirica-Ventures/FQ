var spell = require('../html').spell;

// Bar color cycles red/navy/green by position, matching the same
// derived-from-index rotation used across services-grid/industries-detail.
var COLORS = ['var(--color-brand-red)', 'var(--color-navy)', 'var(--color-green)'];

module.exports = function (content) {
  var items = content.values.items;

  var cards = items.map(function (v, i) {
    return '      <div class="values__card animate-on-scroll">\n' +
      '        <div class="values__card-bar" style="background: ' + COLORS[i % 3] + ';"></div>\n' +
      '        <p class="values__card-number">' + String(i + 1).padStart(2, '0') + '</p>\n' +
      '        <p class="values__card-title">' + spell(v.title) + '</p>\n' +
      '        <p class="values__card-body">' + spell(v.body) + '</p>\n' +
      '      </div>';
  }).join('\n\n');

  return '<section class="values">\n' +
    '  <div class="values__inner">\n' +
    '    <p class="values__eyebrow animate-on-scroll">OUR VALUES</p>\n' +
    '    <h2 class="values__heading animate-on-scroll">Our Values</h2>\n' +
    '    <div class="values__rule animate-on-scroll"></div>\n' +
    '\n' +
    '    <div class="values__grid">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
