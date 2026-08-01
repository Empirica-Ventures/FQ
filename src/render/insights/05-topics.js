var spell = require('../html').spell;

// Fixes a live bug caught during extraction: article counts were hardcoded
// (12/8/10/7 = 37 total) against 6 real articles, and a 5th real category
// (CFO Insights) had no topic card at all. Counts are now derived from the
// actual article collection, and every category gets a card. Dot/arrow
// color still alternates red/green by position (unrelated to the count fix
// -- that was already correct in the original).
var ACCENTS = ['red', 'green'];

module.exports = function (content) {
  var categories = content.insightsCategories.items;
  var articles = content.insightsArticles.items;

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
    '    <p class="topics__eyebrow animate-on-scroll">EXPLORE BY TOPIC</p>\n' +
    '    <h2 class="topics__heading animate-on-scroll">\n' +
    '      <span class="topics__heading-line">Finance clarity,</span>\n' +
    '      <span class="topics__heading-line">by category.</span>\n' +
    '    </h2>\n' +
    '\n' +
    '    <div class="topics__grid">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
