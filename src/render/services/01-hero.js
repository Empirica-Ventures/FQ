var html = require('../html');
var spell = html.spell;
var attr = html.attr;

// Row/divider top offsets are arithmetic (66 + 46*i, 96 + 46*i) -- six
// hand-written px values in the original partial collapse to one
// expression here, and it now works for any item count instead of exactly
// 6. Only the eyebrow/title/accent/body copy around this mini-list is
// genuine page-chrome text (not per-service data), so it stays hardcoded
// in this render function rather than living in content/collections/services.json.
module.exports = function (content) {
  var items = content.services.items;
  // Render functions receive `content` directly and aren't run back through
  // build.js's {{IMG_...}} token pass (that only applies to .html partials
  // read verbatim), so the image data is used here directly rather than
  // emitting a token that would never get substituted.
  var bg = content.images.items['services-hero-bg'];

  var rows = items.map(function (svc, i) {
    var top = 66 + 46 * i;
    var row =
      '      <div class="services-hero__card-row" style="top:' + top + 'px;">\n' +
      '        <span class="services-hero__card-num">' + String(i + 1).padStart(2, '0') + '</span>\n' +
      '        <span class="services-hero__card-item">' + spell(svc.name) + '</span>\n' +
      '      </div>';
    if (i < items.length - 1) {
      row += '\n      <div class="services-hero__card-divider" style="top:' + (top + 30) + 'px;"></div>';
    }
    return row;
  }).join('\n\n');

  return '<section class="services-hero">\n' +
    '  <div class="services-hero__bg" aria-hidden="true">\n' +
    '    <img src="' + bg.src + '" width="' + bg.width + '" height="' + bg.height + '" alt="' + attr(bg.alt) + '" loading="eager" fetchpriority="high" />\n' +
    '  </div>\n' +
    '  <div class="services-hero__inner">\n' +
    '    <svg class="services-hero__ring services-hero__ring--1" width="520" height="520" viewBox="0 0 520 520" fill="none" aria-hidden="true">\n' +
    '      <circle cx="260" cy="260" r="259.25" opacity="0.1" stroke="#2B6B25" stroke-width="1.5" />\n' +
    '    </svg>\n' +
    '    <svg class="services-hero__ring services-hero__ring--2" width="360" height="360" viewBox="0 0 360 360" fill="none" aria-hidden="true">\n' +
    '      <circle cx="180" cy="180" r="179.25" opacity="0.08" stroke="#8B0A32" stroke-width="1.5" />\n' +
    '    </svg>\n' +
    '\n' +
    '    <p class="services-hero__eyebrow animate-on-scroll">OUR SERVICES</p>\n' +
    '\n' +
    '    <h1 class="services-hero__title animate-on-scroll">Finance &amp; accounting services <span class="text-outline">designed for</span> <span class="text-outline">growth</span></h1>\n' +
    '\n' +
    '    <div class="services-hero__accent"></div>\n' +
    '\n' +
    '    <p class="services-hero__body animate-on-scroll">Flexible finance support tailored to your business needs.</p>\n' +
    '\n' +
    '    <div class="services-hero__card animate-on-scroll" aria-hidden="true">\n' +
    '      <div class="services-hero__card-bar"></div>\n' +
    '      <p class="services-hero__card-label">THE FULL SUITE</p>\n' +
    '\n' +
    rows + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
