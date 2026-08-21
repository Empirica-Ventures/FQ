var spell = require('../html').spell;
var icons = require('../_fixtures/how-it-works-icons');

// Badge/rule color cycles navy/red/green by position.
var COLORS = ['navy', 'red', 'green'];

module.exports = function (content) {
  var copy = content.copy.home.howItWorks;
  var items = content.howItWorks.items;

  var steps = items.map(function (step, i) {
    var color = COLORS[i % 3];
    var icon = icons[i];
    if (!icon) throw new Error('how-it-works: no icon fixture for index ' + i);

    return '      <li class="how-it-works__step">\n' +
      '        <span class="how-it-works__badge how-it-works__badge--' + color + '">' + String(i + 1).padStart(2, '0') + '</span>\n' +
      '        <div class="how-it-works__card animate-on-scroll">\n' +
      '          <p class="how-it-works__card-title">' + spell(step.title) + '</p>\n' +
      '          <div class="how-it-works__card-rule how-it-works__card-rule--' + color + '"></div>\n' +
      '          <p class="how-it-works__card-text">' + spell(step.text) + '</p>\n' +
      '          <div class="how-it-works__icon">\n' +
      '            ' + icon + '\n' +
      '          </div>\n' +
      '        </div>\n' +
      '      </li>';
  }).join('\n\n');

  return '<section class="how-it-works">\n' +
    '  <div class="how-it-works__inner">\n' +
    '    <p class="how-it-works__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="how-it-works__heading animate-on-scroll">' + copy.heading.map(spell).join('<br />') + '</h2>\n' +
    '\n' +
    '    <div class="how-it-works__connector" aria-hidden="true"></div>\n' +
    '\n' +
    '    <ol class="how-it-works__steps">\n' +
    steps + '\n' +
    '    </ol>\n' +
    '  </div>\n' +
    '</section>\n';
};
