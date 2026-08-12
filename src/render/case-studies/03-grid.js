var spell = require('../html').spell;

function cardLabel(categories, slug) {
  var cat = categories.filter(function (c) { return c.slug === slug; })[0];
  if (!cat) throw new Error('case study: unknown category "' + slug + '"');
  return cat.cardLabel;
}

module.exports = function (content) {
  var copy = content.copy['case-studies'].grid;
  var items = content.caseStudies.items;
  var categories = content.caseStudyCategories.items;

  var cards = items.map(function (cs) {
    var cls = 'cs-grid__card cs-grid__card--' + cs.accent + (cs.mono ? ' cs-grid__card--mono' : '');
    var lines = [
      // The whole card is the link now, not a plain <article> -- every card
      // has a real detail page at /case-studies/<slug>.html (see
      // src/render/case-studies/detail-template.js and build.js's
      // buildCaseStudyDetails()). Same conversion already made for the home
      // industries teaser cards: display:block + text-decoration:none on
      // .cs-grid__card in css/cs-grid.css is what keeps an anchor looking
      // identical to the <article> it replaces.
      '      <a class="' + cls + '" href="/case-studies/' + cs.slug + '.html" data-category="' + cs.category + '">',
      '        <div class="cs-grid__bar"></div>',
      '        <p class="cs-grid__eyebrow animate-on-scroll">' + spell(cardLabel(categories, cs.category)) + '</p>',
    ];
    if (cs.featured) {
      lines.push('        <div class="cs-grid__badge"><span>' + spell(copy.featuredBadge) + '</span></div>');
    }
    lines.push(
      '        <p class="cs-grid__value">' + spell(cs.value) + '</p>',
      '        <p class="cs-grid__stat-label">' + spell(cs.statLabel) + '</p>',
      '        <p class="cs-grid__stat-sub">' + spell(cs.statSub) + '</p>',
      '        <div class="cs-grid__divider"></div>',
      '        <p class="cs-grid__label cs-grid__label--challenge">' + spell(copy.challengeLabel) + '</p>',
      '        <p class="cs-grid__text cs-grid__text--challenge">' + spell(cs.challenge) + '</p>',
      '        <p class="cs-grid__label cs-grid__label--outcome">' + spell(copy.outcomeLabel) + '</p>',
      '        <p class="cs-grid__text cs-grid__text--outcome">' + spell(cs.outcome) + '</p>',
      '        <div class="cs-grid__tags">'
    );
    cs.tags.forEach(function (tag) {
      lines.push('          <div class="cs-grid__tag"><span>' + spell(tag) + '</span></div>');
    });
    lines.push(
      '        </div>',
      '      </a>'
    );
    return lines.join('\n');
  });

  return '<section class="cs-grid">\n' +
    '  <div class="cs-grid__inner">\n' +
    '    <div class="cs-grid__grid">\n' +
    '\n' +
    cards.join('\n\n') +
    '\n\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
