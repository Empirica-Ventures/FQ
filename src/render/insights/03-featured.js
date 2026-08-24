var spell = require('../html').spell;
var attr = require('../html').attr;

// Fixes a live bug caught during extraction: the original partial's tag
// said "VAT & COMPLIANCE" while its meta line said "Finance Tips" -- two
// different categories for the same article, because each was hand-typed
// separately. Deriving both from the same article.category makes that
// drift impossible.
//
// Now wired into the category filter (js/main.js's [data-filter-group]
// handler, via data-category below + 02-categories.js's data-filter-target)
// -- selecting a topic tab hides the featured spotlight too when its own
// article isn't in that topic. Reverses an earlier decision (the featured
// pick used to stay pinned regardless of the active tab); the client asked
// for the filter to affect it after all.
module.exports = function (content) {
  var copy = content.copy.insights.featured;
  var articles = content.insightsArticles.items;
  var categories = content.insightsCategories.items;
  var article = articles.filter(function (a) { return a.featured; })[0];
  if (!article) throw new Error('insights featured: no article has featured:true');
  var cat = categories.filter(function (c) { return c.slug === article.category; })[0];
  if (!cat) throw new Error('insights featured: unknown category "' + article.category + '"');

  // One image slot per category (content/images.json, key "insights-topic-
  // <slug>"), so the photo always matches whichever article is currently
  // featured. Ships with every slot's src empty -- no fabricated stock
  // photo stands in for a category nobody's uploaded a real one for yet --
  // and falls back to the original color-block-with-caption placeholder
  // until the client adds one through the CMS.
  var topicImage = content.images.items['insights-topic-' + article.category];
  var media = (topicImage && topicImage.src)
    ? '<img class="featured__image" src="' + topicImage.src + '" width="' + topicImage.width + '" height="' + topicImage.height + '" alt="' + attr(topicImage.alt) + '" loading="eager" />'
    : '<p class="featured__image-caption">' + spell(copy.imageCaption) + '</p>';

  return '<section class="featured" data-category="' + article.category + '">\n' +
    '  <div class="featured__inner">\n' +
    '    <div class="featured__image-placeholder">\n' +
    '      ' + media + '\n' +
    '      <span class="featured__tag">' + spell(cat.label) + '</span>\n' +
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
