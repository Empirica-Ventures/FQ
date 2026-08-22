var spell = require('../html').spell;

// css/home-trust-intro.css's .trust-intro__cards is a single-row, fixed-
// height horizontal scroller (overflow-x: auto) -- adding a 4th+
// testimonial through the CMS makes the row scroll wider, not the section
// taller, so .trust-intro's height stays a constant regardless of
// items.length.

module.exports = function (content) {
  var copy = content.copy.home.trustIntro;
  var items = content.testimonials.items;
  var bg = content.images.items['home-trust-intro-desk'];

  var cards = items.map(function (t, i) {
    return '      <div class="trust-intro__card animate-on-scroll stagger-' + (i + 2) + '">\n' +
      '        <div class="trust-intro__card-rule"></div>\n' +
      '        <p class="trust-intro__card-quote">' + spell('“' + t.quote + '”') + '</p>\n' +
      '        <p class="trust-intro__card-attribution">' + spell(t.attribution) + '</p>\n' +
      '      </div>';
  }).join('\n');

  return '<section class="trust-intro">\n' +
    '  <div class="trust-intro__inner">\n' +
    '    <div class="trust-intro__bg" aria-hidden="true">\n' +
    '      <img src="' + bg.src + '" width="' + bg.width + '" height="' + bg.height + '" alt="' + spell(bg.alt) + '" loading="lazy" />\n' +
    '    </div>\n' +
    '\n' +
    '    <p class="trust-intro__quote-mark" aria-hidden="true">&quot;</p>\n' +
    '    <p class="trust-intro__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="trust-intro__heading animate-on-scroll stagger-1">' + spell(copy.heading) + '</h2>\n' +
    '\n' +
    '    <div class="trust-intro__cards">\n' +
    cards + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
