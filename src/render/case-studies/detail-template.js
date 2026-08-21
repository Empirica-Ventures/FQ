var spell = require('../html').spell;

// Case Study detail page, restructured around a Problem -> Steps -> Outcome
// reading order (previously a Challenge/Outcome side-by-side pair with an
// optional freeform "Full Write-Up" block below it -- replaced entirely by
// Steps, which gives every case study the same clean shape instead of an
// open-ended one). Steps is the one section that starts empty on every
// existing case study: no content is written here, just the section itself,
// ready for an editor to fill in through the CMS. It renders nothing at all
// until at least one step exists, the same "don't show a hollow section"
// rule the rest of this site's optional content follows.
module.exports = function (cs, categories, copy) {
  var cat = categories.filter(function (c) { return c.slug === cs.category; })[0];
  if (!cat) throw new Error('case study detail: unknown category "' + cs.category + '"');

  var badge = cs.featured
    ? '      <span class="cs-detail__badge">' + spell(copy.featuredBadge) + '</span>\n'
    : '';

  var tags = cs.tags.map(function (tag) {
    return '        <span class="cs-detail__tag">' + spell(tag) + '</span>';
  }).join('\n');

  var steps = cs.steps || [];
  var stepsSection = '';
  if (steps.length) {
    var stepItems = steps.map(function (step, i) {
      return '        <li class="cs-detail__step">\n' +
        '          <span class="cs-detail__step-num">' + (i + 1) + '</span>\n' +
        '          <div class="cs-detail__step-body">\n' +
        '            <p class="cs-detail__step-title">' + spell(step.title) + '</p>\n' +
        '            <p class="cs-detail__step-desc">' + spell(step.description) + '</p>\n' +
        '          </div>\n' +
        '        </li>';
    }).join('\n');
    stepsSection = '    <div class="cs-detail__section">\n' +
      '      <p class="cs-detail__label">' + spell(copy.stepsLabel) + '</p>\n' +
      '      <ol class="cs-detail__steps">\n' +
      stepItems + '\n' +
      '      </ol>\n' +
      '    </div>\n' +
      '\n';
  }

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
    '    <div class="cs-detail__section">\n' +
    '      <p class="cs-detail__label">' + spell(copy.problemLabel) + '</p>\n' +
    '      <p class="cs-detail__text">' + spell(cs.challenge) + '</p>\n' +
    '    </div>\n' +
    '\n' +
    stepsSection +
    '    <div class="cs-detail__section">\n' +
    '      <p class="cs-detail__label cs-detail__label--outcome">' + spell(copy.outcomeLabel) + '</p>\n' +
    '      <p class="cs-detail__text">' + spell(cs.outcome) + '</p>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="cs-detail__tags">\n' +
    tags + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
