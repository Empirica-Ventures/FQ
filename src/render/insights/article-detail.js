var spell = require('../html').spell;
var renderBlocks = require('../_shared/rich-text-blocks');

// Until an article has real body copy, its excerpt still renders as the
// lead paragraph exactly as before, with the same "replace this" comment.
// That keeps all 7 of today's bodyless articles byte-identical -- writing
// the real copy is the client's job, through the CMS, one article at a
// time, and each one starts showing its own words the moment it's filled in.

// Takes its section copy as a third argument rather than reading content.copy
// itself: this is the one render module build.js does not call with the whole
// content object -- buildInsightsArticles() fans one config out to N pages and
// hands each call just its own article plus the category list.
module.exports = function (article, categories, copy) {
  var cat = categories.filter(function (c) { return c.slug === article.category; })[0];
  if (!cat) throw new Error('article detail: unknown category "' + article.category + '"');

  var blocks = article.body || [];
  var body = blocks.length
    ? renderBlocks(blocks)
    : '      <!-- Placeholder body: the excerpt is the only copy that exists for this article. Replace with the full article text. -->\n' +
      '      <p>' + spell(article.excerpt) + '</p>';

  return '<section class="insights-article">\n' +
    '  <div class="insights-article__inner">\n' +
    '    <a href="/insights.html" class="insights-article__back">' + spell(copy.backLabel) + '</a>\n' +
    '    <span class="insights-article__category insights-article__category--' + cat.gridAccent + '">' + spell(cat.label) + '</span>\n' +
    '    <h1 class="insights-article__title">' + spell(article.title) + '</h1>\n' +
    '    <p class="insights-article__meta">' + spell(article.readTime) + ' &middot; ' + spell(cat.topicTitle) + '</p>\n' +
    '    <div class="insights-article__body">\n' +
    body + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
