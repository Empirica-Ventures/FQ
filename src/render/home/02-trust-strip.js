var spell = require('../html').spell;

module.exports = function (content) {
  var items = content.trustStats.items;

  var stats = items.map(function (s) {
    return '    <div class="trust-strip__item">\n' +
      '      <p class="trust-strip__value">' + spell(s.value) + '</p>\n' +
      '      <p class="trust-strip__label">' + spell(s.label) + '</p>\n' +
      '    </div>';
  }).join('\n');

  return '<section class="trust-strip">\n' +
    '  <div class="trust-strip__inner">\n' +
    stats + '\n' +
    '  </div>\n' +
    '</section>\n';
};
