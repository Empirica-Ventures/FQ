var spell = require('../html').spell;
var attr = require('../html').attr;

var ACCENTS = ['red', 'navy', 'green'];

function serviceName(services, slug) {
  var svc = services.filter(function (s) { return s.slug === slug; })[0];
  if (!svc) throw new Error('industry detail: unknown service slug "' + slug + '"');
  return svc.name;
}

// Factory, same pattern as src/render/services/_body-template.js: each
// src/render/industries/0N-<id>.js is a one-line
// `module.exports = require('./_detail-template')('<id>');`
//
// accent (red/navy/green), reverse (odd position), and single-line
// (exactly 1 heading line) are all derived from position/data rather than
// stored, matching the pattern already confirmed across the source: index
// parity predicts industry-detail--reverse exactly (d2c-cpg/healthcare/
// logistics don't reverse; retail/manufacturing/construction do), and
// industry-detail--single-line is just headingLines.length === 1.
module.exports = function (id) {
  return function (content) {
    // Section labels ("KEY CHALLENGES" etc.) are the same on every one of the
    // six industries, so they live once under industries.json's detailLabels
    // rather than being repeated per-industry in the collection.
    var copy = content.copy.industries.detailLabels;
    var items = content.industries.items;
    var services = content.services.items;
    var i = items.map(function (x) { return x.id; }).indexOf(id);
    if (i === -1) throw new Error('industry detail: no content/collections/industries.json entry for "' + id + '"');
    var ind = items[i];

    var cls = 'industry-detail industry-detail--' + ACCENTS[i % 3];
    if (i % 2 === 1) cls += ' industry-detail--reverse';
    if (ind.headingLines.length === 1) cls += ' industry-detail--single-line';

    var challenges = ind.challenges.map(function (c) {
      return '      <li class="industry-detail__bullet">' + spell(c) + '</li>';
    }).join('\n');

    var serviceItems = ind.serviceSlugs.map(function (slug) {
      return '      <li class="industry-detail__service">' + spell(serviceName(services, slug)) + '</li>';
    }).join('\n');

    var headingLines = ind.headingLines.map(function (line) {
      return '      <span class="industry-detail__heading-line">' + spell(line) + '</span>';
    }).join('\n');

    var num = String(i + 1).padStart(2, '0');

    return '<section class="' + cls + '" id="' + id + '">\n' +
      '  <div class="industry-detail__tint"></div>\n' +
      '  <p class="industry-detail__watermark">' + num + '</p>\n' +
      '\n' +
      '  <div class="industry-detail__panel">\n' +
      '    <p class="industry-detail__panel-label">' + spell(copy.challengesLabel) + '</p>\n' +
      '    <ul class="industry-detail__challenges">\n' +
      challenges + '\n' +
      '    </ul>\n' +
      '    <div class="industry-detail__divider"></div>\n' +
      '    <p class="industry-detail__services-label">' + spell(copy.servicesLabel) + '</p>\n' +
      '    <ul class="industry-detail__services">\n' +
      serviceItems + '\n' +
      '    </ul>\n' +
      '  </div>\n' +
      '\n' +
      '  <div class="industry-detail__vdivider"></div>\n' +
      '\n' +
      '  <div class="industry-detail__content">\n' +
      '    <p class="industry-detail__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + ' &middot; ' + num + '</p>\n' +
      '    <h2 class="industry-detail__heading animate-on-scroll">\n' +
      headingLines + '\n' +
      '    </h2>\n' +
      '    <p class="industry-detail__tagline">' + spell(ind.tagline) + '</p>\n' +
      '    <p class="industry-detail__description">' + spell(ind.description) + '</p>\n' +
      '\n' +
      '    <div class="industry-detail__case-study">\n' +
      '      <p class="industry-detail__case-study-label">' + spell(copy.caseStudyLabel) + '</p>\n' +
      '      <a class="industry-detail__case-study-link" href="/case-studies.html">' + spell(ind.caseStudyText) + '</a>\n' +
      '      <a class="industry-detail__case-study-arrow" href="/case-studies.html" aria-label="' + attr(copy.caseStudyArrowLabel) + '">' + spell('→') + '</a>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</section>\n';
  };
};
