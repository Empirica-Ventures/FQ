var spell = require('../html').spell;

// Accent cycles red/navy/green by position -- fixes a live bug caught
// during extraction: the original partial only listed 5 of the 6 pills
// (Construction & Real Estate was missing entirely), because the pill
// list was hand-typed separately from quick-nav's identical 6-item list
// instead of sharing one source. Rendering all 6 from the same collection
// makes that drift impossible.
var ACCENTS = ['red', 'navy', 'green'];

module.exports = function (content) {
  var items = content.industries.items;
  var bg = content.images.items['industries-hero-bg'];

  var pills = items.map(function (ind, i) {
    var cls = 'industries-hero__pill industries-hero__pill--' + ACCENTS[i % 3] + (i === 0 ? ' industries-hero__pill--active' : '');
    return '      <span class="' + cls + '">' + spell(ind.label) + '</span>';
  }).join('\n');

  return '<section class="industries-hero">\n' +
    '  <div class="industries-hero__bg" aria-hidden="true">\n' +
    '    <img src="' + bg.src + '" width="' + bg.width + '" height="' + bg.height + '" alt="' + spell(bg.alt) + '" loading="eager" fetchpriority="high" />\n' +
    '  </div>\n' +
    '  <div class="industries-hero__inner">\n' +
    '    <p class="industries-hero__eyebrow animate-on-scroll">INDUSTRIES WE SERVE</p>\n' +
    '    <h1 class="industries-hero__heading animate-on-scroll">Finance built for your type of business.</h1>\n' +
    '    <p class="industries-hero__subtext">We don\'t believe in generic finance support. Every industry has its own financial reality, and we work with yours.</p>\n' +
    '\n' +
    '    <div class="industries-hero__pills">\n' +
    pills + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
