var spell = require('../html').spell;
var renderBlocks = require('../_shared/rich-text-blocks');

// Case Study detail page. Same fan-out shape as Insights article-detail.js
// (build.js calls this once per item with just that item's own data, not the
// whole content object) and the same typed-block body field, but the two
// pages differ in one real way: an Insights article with no body is nearly
// empty (a single excerpt sentence), while a Case Study with no body still
// carries its full Challenge/Outcome/stat/tags -- the card's own content,
// repeated here at readable size rather than card-cropped. Body blocks are
// purely additive depth, not what keeps the page from being hollow.
module.exports = function (cs, categories, copy) {
  var cat = categories.filter(function (c) { return c.slug === cs.category; })[0];
  if (!cat) throw new Error('case study detail: unknown category "' + cs.category + '"');

  var blocks = cs.body || [];
  var body = blocks.length ? '    <div class="cs-detail__body">\n' + renderBlocks(blocks) + '\n    </div>\n' : '';

  var badge = cs.featured
    ? '      <span class="cs-detail__badge">' + spell(copy.featuredBadge) + '</span>\n'
    : '';

  var tags = cs.tags.map(function (tag) {
    return '        <span class="cs-detail__tag">' + spell(tag) + '</span>';
  }).join('\n');

  return '<section class="cs-detail cs-detail--' + cs.accent + '">\n' +
    '  <div class="cs-detail__inner">\n' +
    '    <a href="/case-studies.html" class="cs-detail__back">' + spell(copy.backLabel) + '</a>\n' +
    '    <div class="cs-detail__meta-row">\n' +
    '      <span class="cs-detail__category">' + spell(cat.cardLabel) + '</span>\n' +
    badge +
    '    </div>\n' +
    '    <h1 class="cs-detail__title">' + spell(cs.title) + '</h1>\n' +
    '\n' +
    '    <div class="cs-detail__stat">\n' +
    '      <p class="cs-detail__stat-value">' + spell(cs.value) + '</p>\n' +
    '      <p class="cs-detail__stat-label">' + spell(cs.statLabel) + '</p>\n' +
    '      <p class="cs-detail__stat-sub">' + spell(cs.statSub) + '</p>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="cs-detail__cols">\n' +
    '      <div class="cs-detail__col">\n' +
    '        <p class="cs-detail__label">' + spell(copy.challengeLabel) + '</p>\n' +
    '        <p class="cs-detail__text">' + spell(cs.challenge) + '</p>\n' +
    '      </div>\n' +
    '      <div class="cs-detail__col">\n' +
    '        <p class="cs-detail__label cs-detail__label--outcome">' + spell(copy.outcomeLabel) + '</p>\n' +
    '        <p class="cs-detail__text">' + spell(cs.outcome) + '</p>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="cs-detail__tags">\n' +
    tags + '\n' +
    '    </div>\n' +
    '\n' +
    body +
    '  </div>\n' +
    '</section>\n';
};
