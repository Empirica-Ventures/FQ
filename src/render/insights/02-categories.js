var spell = require('../html').spell;

module.exports = function (content) {
  var categories = content.insightsCategories.items;

  var tabs = ['      <button type="button" class="categories__tab categories__tab--active" data-filter="all">ALL</button>'];
  categories.forEach(function (cat) {
    tabs.push('      <button type="button" class="categories__tab" data-filter="' + cat.slug + '">' + spell(cat.label) + '</button>');
  });

  return '<section class="categories">\n' +
    '  <div class="categories__inner">\n' +
    '    <nav class="categories__tabs" aria-label="Filter articles by category" data-filter-group data-filter-target=".article-grid__card" data-active-class="categories__tab--active">\n' +
    tabs.join('\n') + '\n' +
    '    </nav>\n' +
    '  </div>\n' +
    '</section>\n';
};
