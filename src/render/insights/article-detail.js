var spell = require('../html').spell;

// Article body copy is a list of typed blocks (see admin/config.yml's
// "INSIGHTS — Articles" body field), not a markdown string: build.js is
// dependency-free by design ("Plain JSON, no parser dependency"), and a
// block list also means the CMS can never inject raw HTML into the page --
// every block's text goes through spell() the same as any other editable
// string on this site.
//
// Supported block types, and the only tags an editor can produce:
//   paragraph -> <p>            heading -> <h2>
//   list      -> <ul><li>       quote   -> <blockquote>
//
// Until an article has real body copy, its excerpt still renders as the
// lead paragraph exactly as before, with the same "replace this" comment.
// That keeps all 7 of today's bodyless articles byte-identical -- writing
// the real copy is the client's job, through the CMS, one article at a
// time, and each one starts showing its own words the moment it's filled in.
function renderBlocks(blocks) {
  return blocks.map(function (block) {
    if (block.type === 'heading') {
      return '      <h2>' + spell(block.text) + '</h2>';
    }
    if (block.type === 'quote') {
      return '      <blockquote>' + spell(block.text) + '</blockquote>';
    }
    if (block.type === 'list') {
      var lis = (block.items || []).map(function (item) {
        return '        <li>' + spell(item) + '</li>';
      }).join('\n');
      return '      <ul>\n' + lis + '\n      </ul>';
    }
    if (block.type === 'paragraph') {
      return '      <p>' + spell(block.text) + '</p>';
    }
    throw new Error('article detail: unknown body block type "' + block.type + '"');
  }).join('\n');
}

// Takes its section copy as a third argument rather than reading content.copy
// itself: this is the one render module build.js never hands the whole content
// object to -- buildInsightsArticles() fans one config out to N pages and calls
// this once per article. build.js passes content.copy.insights.articleDetail.
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
