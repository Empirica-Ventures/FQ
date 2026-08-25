var spell = require('../html').spell;

// css/home-trust-intro.css's .trust-intro__cards is a fixed-size band
// clipping a continuously-scrolling .trust-intro__track -- same
// duplicate-the-set-once marquee technique as services/02-trusted-by.js
// and how-we-work/03-tools.js, so js/main.js can measure the real seamless-
// loop distance regardless of items.length. Adding a testimonial through
// the CMS lengthens the loop, not the section: .trust-intro's height stays
// a constant.

module.exports = function (content) {
  var copy = content.copy.home.trustIntro;
  var items = content.testimonials.items;
  var bg = content.images.items['home-trust-intro-desk'];

  function card(t, i, hidden) {
    var cls = hidden ? 'trust-intro__card' : 'trust-intro__card animate-on-scroll stagger-' + (i + 2);
    var attrs = ' class="' + cls + '"' + (hidden ? ' aria-hidden="true"' : '');
    return '      <div' + attrs + '>\n' +
      '        <div class="trust-intro__card-rule"></div>\n' +
      '        <p class="trust-intro__card-quote">' + spell('“' + t.quote + '”') + '</p>\n' +
      '        <p class="trust-intro__card-attribution">' + spell(t.attribution) + '</p>\n' +
      '      </div>';
  }

  var real = items.map(function (t, i) { return card(t, i, false); }).join('\n');
  var duplicate = items.map(function (t, i) { return card(t, i, true); }).join('\n');

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
    '      <div class="trust-intro__track">\n' +
    real + '\n\n' +
    duplicate + '\n' +
    '      </div>\n' +
    '      <div class="trust-intro__fade trust-intro__fade--left" aria-hidden="true"></div>\n' +
    '      <div class="trust-intro__fade trust-intro__fade--right" aria-hidden="true"></div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
