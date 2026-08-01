var spell = require('../html').spell;

// Icon color alternates red/green by position (item 1 red, item 2 green,
// ...) in the original markup -- derived from index rather than stored,
// since it's a fixed visual rhythm, not a per-item editorial choice.
module.exports = function (content) {
  var data = content.pages['faq-home'];

  var items = data.items.map(function (item, i) {
    var color = i % 2 === 0 ? 'red' : 'green';
    return '      <details class="faq__item">\n' +
      '        <summary>\n' +
      '          <span class="faq__icon faq__icon--' + color + '">+</span>\n' +
      '          <span class="faq__question">' + spell(item.question) + '</span>\n' +
      '        </summary>\n' +
      '        <p class="faq__answer">' + spell(item.answer) + '</p>\n' +
      '      </details>';
  });

  var headingLines = data.heading.map(function (line) {
    return '      <p>' + spell(line) + '</p>';
  }).join('\n');

  return '<section class="faq">\n' +
    '  <div class="faq__inner">\n' +
    '    <p class="faq__eyebrow animate-on-scroll">FREQUENTLY ASKED</p>\n' +
    '    <div class="faq__heading animate-on-scroll">\n' +
    headingLines + '\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="faq__grid">\n' +
    items.join('\n\n') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
