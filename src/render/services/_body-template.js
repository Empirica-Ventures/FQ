var spell = require('../html').spell;

// Renders src/partials/services/<slug>/02-body.html's structure from data.
// "WHAT WE DO" and "What you get" are identical across all 6 services --
// real page-chrome, not per-service content, so they live once in
// content/copy/service-details.json's `bodyLabels` rather than being
// duplicated into every content/pages/service-*.json file.
function renderBody(data, labels) {
  var paragraphs = data.paragraphs.map(function (p) {
    return '        <p>' + spell(p) + '</p>';
  }).join('\n');

  var items = data.includes.map(function (item) {
    return '      <li class="svc-detail-includes__item animate-on-scroll">' + spell(item) + '</li>';
  }).join('\n');

  return '<section class="svc-detail-content">\n' +
    '  <div class="svc-detail-content__inner">\n' +
    '    <div class="svc-detail-content__left">\n' +
    '      <p class="svc-detail-content__eyebrow animate-on-scroll">' + spell(labels.whatWeDo) + '</p>\n' +
    '      <h2 class="svc-detail-content__heading animate-on-scroll">' + spell(data.heading) + '</h2>\n' +
    '      <div class="svc-detail-content__rule animate-on-scroll"></div>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="svc-detail-content__divider" aria-hidden="true"></div>\n' +
    '\n' +
    '    <div class="svc-detail-content__right">\n' +
    '      <div class="svc-detail-content__body animate-on-scroll">\n' +
    paragraphs + '\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n' +
    '\n' +
    '<section class="svc-detail-includes">\n' +
    '  <div class="svc-detail-includes__inner">\n' +
    '    <h2 class="svc-detail-includes__heading animate-on-scroll">' + spell(labels.whatYouGet) + '</h2>\n' +
    '    <div class="svc-detail-includes__rule"></div>\n' +
    '    <ul class="svc-detail-includes__list">\n' +
    items + '\n' +
    '    </ul>\n' +
    '  </div>\n' +
    '</section>\n';
}

// Factory: each per-service file is `module.exports = require('../_body-template')('bookkeeping');`
// so build.js's uniform `require(rel)(content)` dispatch still works per-page
// without duplicating renderBody's logic 6 times.
module.exports = function (slug) {
  return function (content) {
    var copy = content.copy['service-details'].bodyLabels;
    var data = content.pages['service-' + slug];
    if (!data) throw new Error('service body: no content/pages/service-' + slug + '.json');
    return renderBody(data, copy);
  };
};
