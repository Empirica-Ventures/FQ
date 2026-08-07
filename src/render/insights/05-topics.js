var spell = require('../html').spell;

// Fixes a live bug caught during extraction: article counts were hardcoded
// (12/8/10/7 = 37 total) against 6 real articles, and a 5th real category
// (CFO Insights) had no topic card at all. Counts are now derived from the
// actual article collection, and every category gets a card. Dot/arrow
// color still alternates red/green by position (unrelated to the count fix
// -- that was already correct in the original).
var ACCENTS = ['red', 'green'];

module.exports = function (content) {
  var copy = content.copy.insights.topics;
  var categories = content.insightsCategories.items;
  var articles = content.insightsArticles.items;

  // The heading is hard-wrapped into one .topics__heading-line span per
  // line (the CSS gives each its own baseline), so its copy is a list of
  // lines rather than a single string -- one more or one fewer line is an
  // editorial choice the markup follows.
  var headingLines = copy.heading.map(function (line) {
    return '      <span class="topics__heading-line">' + spell(line) + '</span>';
  }).join('\n');

  var cards = categories.map(function (cat, i) {
    var count = articles.filter(function (a) { return a.category === cat.slug; }).length;
    var titleCls = 'topics__card-title' + (cat.topicTitleTight ? ' topics__card-title--tight' : '');
    return '      <div class="topics__card topics__card--' + ACCENTS[i % 2] + '">\n' +
      '        <span class="topics__card-dot" aria-hidden="true"></span>\n' +
      '        <p class="' + titleCls + '">' + spell(cat.topicTitle) + '</p>\n' +
      '        <p class="topics__card-subtitle">' + count + ' article' + (count === 1 ? '' : 's') + '</p>\n' +
      '        <p class="topics__card-arrow" aria-hidden="true">' + spell('→') + '</p>\n' +
      '      </div>';
  }).join('\n\n');

  return '<section class="topics">\n' +
    '  <div class="topics__inner">\n' +
    '    <p class="topics__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="topics__heading animate-on-scroll">\n' +
    headingLines + '\n' +
    '    </h2>\n' +
    '\n' +
    '    <div class="topics__grid">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
