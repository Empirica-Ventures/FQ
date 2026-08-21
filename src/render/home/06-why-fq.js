var spell = require('../html').spell;
var icons = require('../_fixtures/why-fq-icons');

// Two fixed columns (2 cards left, 3 right) at left:80px/680px, each
// stacked at a 112px pitch starting top:200px -- six hand-written
// left/top pairs collapse to this one rule. LEFT_COLUMN_COUNT is the one
// number that can't be derived (nothing in the data says which column a
// card belongs in); accent alternates red/green by position.
var LEFT_COLUMN_COUNT = 2;
var ACCENTS = ['red', 'green'];

module.exports = function (content) {
  var copy = content.copy.home.whyFq;
  var items = content.whyFq.items;

  var cards = items.map(function (w, i) {
    var col = i < LEFT_COLUMN_COUNT ? 0 : 1;
    var indexInCol = col === 0 ? i : i - LEFT_COLUMN_COUNT;
    var left = col === 0 ? 80 : 680;
    var top = 200 + 112 * indexInCol;
    var accent = ACCENTS[i % 2];
    var icon = icons[i];
    if (!icon) throw new Error('why-fq: no icon fixture for index ' + i);

    return '    <article class="why-fq__card why-fq__card--' + accent + '" style="left:' + left + 'px; top:' + top + 'px;">\n' +
      '      <div class="why-fq__card-icon">\n' +
      '        ' + icon + '\n' +
      '      </div>\n' +
      '      <p class="why-fq__card-num">' + String(i + 1).padStart(2, '0') + '</p>\n' +
      '      <p class="why-fq__card-title">' + spell(w.title) + '</p>\n' +
      '      <p class="why-fq__card-desc">' + spell(w.desc) + '</p>\n' +
      '    </article>';
  });

  // Comments mark where the original hand-written markup split into two
  // columns -- reproduced here at the same LEFT_COLUMN_COUNT boundary.
  var leftCards = cards.slice(0, LEFT_COLUMN_COUNT).join('\n\n');
  var rightCards = cards.slice(LEFT_COLUMN_COUNT).join('\n\n');

  return '<section class="why-fq">\n' +
    '  <div class="why-fq__accent" aria-hidden="true"></div>\n' +
    '  <div class="why-fq__inner">\n' +
    '    <div class="why-fq__pattern" aria-hidden="true"></div>\n' +
    '    <span class="why-fq__bignum" aria-hidden="true">' + items.length + '</span>\n' +
    '\n' +
    '    <p class="why-fq__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="why-fq__heading animate-on-scroll">' + copy.heading.map(spell).join('<br />') + '</h2>\n' +
    '\n' +
    '    <!-- Left column: ' + LEFT_COLUMN_COUNT + ' cards -->\n' +
    leftCards + '\n' +
    '\n' +
    '    <!-- Right column: ' + (items.length - LEFT_COLUMN_COUNT) + ' cards -->\n' +
    rightCards + '\n' +
    '  </div>\n' +
    '</section>\n';
};
