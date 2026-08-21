var spell = require('../html').spell;

// Fixes two live bugs caught during extraction:
// - All 6 cards linked href="#" -- now link to their own real article page.
// - article-grid__category-bg was present on 4 of 6 cards and absent on
//   the other 2 (an apparent inconsistency), but it has zero CSS or JS
//   anywhere targeting it -- confirmed by an exhaustive grep across the
//   repo. It's inert either way, so it's dropped entirely rather than
//   reproduced inconsistently.
module.exports = function (content) {
  var copy = content.copy.insights.articleGrid;
  var articles = content.insightsArticles.items.filter(function (a) { return !a.featured; });
  var categories = content.insightsCategories.items;

  function categoryFor(slug) {
    var cat = categories.filter(function (c) { return c.slug === slug; })[0];
    if (!cat) throw new Error('article grid: unknown category "' + slug + '"');
    return cat;
  }

  var cards = articles.map(function (article) {
    var cat = categoryFor(article.category);
    return '      <article class="article-grid__card article-grid__card--' + cat.gridAccent + '" data-category="' + article.category + '">\n' +
      '        <span class="article-grid__category">' + spell(cat.label) + '</span>\n' +
      '        <h3 class="article-grid__title animate-on-scroll">' + spell(article.title) + '</h3>\n' +
      '        <p class="article-grid__excerpt">' + spell(article.excerpt) + '</p>\n' +
      '        <p class="article-grid__read-time">' + spell(article.readTime) + '</p>\n' +
      '        <a href="/insights/' + article.slug + '.html" class="article-grid__read-link">' + spell(copy.cardLinkLabel) + '</a>\n' +
      '      </article>';
  }).join('\n\n');

  return '<section class="article-grid">\n' +
    '  <div class="article-grid__inner">\n' +
    '    <p class="article-grid__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '\n' +
    '    <div class="article-grid__grid">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
