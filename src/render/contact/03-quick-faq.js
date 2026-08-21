var spell = require('../html').spell;

// Icon color alternates red/green by position, same as home/10-faq.js --
// derived from index, not stored.
module.exports = function (content) {
  var copy = content.copy['contact'].quickFaq;
  var data = content.pages['faq-contact'];

  var items = data.items.map(function (item, i) {
    var color = i % 2 === 0 ? 'red' : 'green';
    return '      <details class="quick-faq__item">\n' +
      '        <summary>\n' +
      '          <span class="quick-faq__icon quick-faq__icon--' + color + '">+</span>\n' +
      '          <span class="quick-faq__question">' + spell(item.question) + '</span>\n' +
      '        </summary>\n' +
      '        <p class="quick-faq__answer">' + spell(item.answer) + '</p>\n' +
      '      </details>';
  });

  return '<section class="quick-faq">\n' +
    '  <div class="quick-faq__inner">\n' +
    '    <p class="quick-faq__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="quick-faq__heading animate-on-scroll">' + spell(data.heading) + '</h2>\n' +
    '\n' +
    '    <div class="quick-faq__grid">\n' +
    items.join('\n\n') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
