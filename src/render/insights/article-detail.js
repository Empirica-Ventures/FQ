var spell = require('../html').spell;

// The only body copy that exists anywhere in the source for these 7
// articles is their excerpt -- there's no full article text to extract,
// since every card previously linked href="#". Rendering the excerpt as
// the article's lead paragraph makes every article a real, complete page
// rather than fabricating additional paragraphs of financial advice that
// could read as authored content from the firm. The HTML comment below is
// invisible to visitors; it's a note for whoever adds the real body copy
// (through the CMS, once this collection is added to admin/config.yml).
module.exports = function (article, categories) {
  var cat = categories.filter(function (c) { return c.slug === article.category; })[0];
  if (!cat) throw new Error('article detail: unknown category "' + article.category + '"');

  return '<section class="insights-article">\n' +
    '  <div class="insights-article__inner">\n' +
    '    <a href="/insights.html" class="insights-article__back">&larr; Back to Insights</a>\n' +
    '    <span class="insights-article__category insights-article__category--' + cat.gridAccent + '">' + spell(cat.label) + '</span>\n' +
    '    <h1 class="insights-article__title">' + spell(article.title) + '</h1>\n' +
    '    <p class="insights-article__meta">' + spell(article.readTime) + ' &middot; ' + spell(cat.topicTitle) + '</p>\n' +
    '    <div class="insights-article__body">\n' +
    '      <!-- Placeholder body: the excerpt is the only copy that exists for this article. Replace with the full article text. -->\n' +
    '      <p>' + spell(article.excerpt) + '</p>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
