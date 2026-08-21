var spell = require('../html').spell;
var attr = require('../html').attr;

module.exports = function (content) {
  var copy = content.copy.insights.categories;
  var categories = content.insightsCategories.items;

  var tabs = ['      <button type="button" class="categories__tab categories__tab--active" data-filter="all">' + spell(copy.allTabLabel) + '</button>'];
  categories.forEach(function (cat) {
    tabs.push('      <button type="button" class="categories__tab" data-filter="' + cat.slug + '">' + spell(cat.label) + '</button>');
  });

  return '<section class="categories">\n' +
    '  <div class="categories__inner">\n' +
    '    <nav class="categories__tabs" aria-label="' + attr(copy.filterAriaLabel) + '" data-filter-group data-filter-target=".article-grid__card" data-active-class="categories__tab--active">\n' +
    tabs.join('\n') + '\n' +
    '    </nav>\n' +
    '  </div>\n' +
    '</section>\n';
};
