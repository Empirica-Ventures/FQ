var spell = require('../html').spell;

var ACCENTS = ['red', 'navy', 'green'];

module.exports = function (content) {
  var items = content.industries.items;

  var listItems = items.map(function (ind, i) {
    var cls = 'quick-nav__item quick-nav__item--' + ACCENTS[i % 3] + (i === 0 ? ' quick-nav__item--active' : '');
    return '      <li class="' + cls + '">\n' +
      '        <a class="quick-nav__link" href="#' + ind.id + '">\n' +
      '          <span class="quick-nav__num">' + String(i + 1).padStart(2, '0') + '</span>\n' +
      '          <span class="quick-nav__label">' + spell(ind.label) + '</span>\n' +
      '        </a>\n' +
      '      </li>';
  }).join('\n');

  return '<nav class="quick-nav" aria-label="Jump to industry">\n' +
    '  <div class="quick-nav__inner">\n' +
    '    <ul class="quick-nav__list">\n' +
    listItems + '\n' +
    '    </ul>\n' +
    '  </div>\n' +
    '</nav>\n';
};
