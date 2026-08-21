var spell = require('../html').spell;

// Fixes a live bug caught during extraction: the original partial's tag
// said "VAT & COMPLIANCE" while its meta line said "Finance Tips" -- two
// different categories for the same article, because each was hand-typed
// separately. Deriving both from the same article.category makes that
// drift impossible.
//
// Deliberately NOT wired into the category filter (js/main.js's
// [data-filter-group] handler) -- the featured pick is a pinned editorial
// spotlight, independent of whichever topic tab is active below it.
// Confirmed with the client during the first feedback round.
module.exports = function (content) {
  var copy = content.copy.insights.featured;
  var articles = content.insightsArticles.items;
  var categories = content.insightsCategories.items;
  var article = articles.filter(function (a) { return a.featured; })[0];
  if (!article) throw new Error('insights featured: no article has featured:true');
  var cat = categories.filter(function (c) { return c.slug === article.category; })[0];
  if (!cat) throw new Error('insights featured: unknown category "' + article.category + '"');

  return '<section class="featured">\n' +
    '  <div class="featured__inner">\n' +
    '    <div class="featured__image-placeholder">\n' +
    '      <span class="featured__tag">' + spell(cat.label) + '</span>\n' +
    '      <p class="featured__image-caption">' + spell(copy.imageCaption) + '</p>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="featured__content">\n' +
    '      <p class="featured__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '      <h2 class="featured__title animate-on-scroll">' + spell(article.title) + '</h2>\n' +
    '      <p class="featured__excerpt">' + spell(article.excerpt) + '</p>\n' +
    '      <p class="featured__meta">' + spell(article.readTime) + '&nbsp;&nbsp;&middot;&nbsp;&nbsp;' + spell(cat.topicTitle) + '</p>\n' +
    '      <a href="/insights/' + article.slug + '.html" class="featured__link">' + spell(copy.linkLabel) + ' <span class="featured__link-arrow">' + spell('→') + '</span></a>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
