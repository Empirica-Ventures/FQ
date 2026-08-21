var spell = require('../html').spell;

// css/home-trust-intro.css's .trust-intro__cards wraps to additional rows
// once more cards exist than fit in one (3 today, at a fixed 1280px row
// width / 410px card width) -- see that file's comment. .trust-intro's
// height has to grow to match however many rows that produces, computed
// here rather than hardcoded since row count depends on items.length.
// Formula matches the CSS's own commented breakdown: a 205px top offset,
// one 180px card row per row, 25px between rows (matching the cards'
// column gap), plus 35px of bottom breathing room -- 3 items (1 row)
// computes to exactly 420px, the same value the CSS fallback uses, so
// nothing changes until a 4th testimonial actually exists.
var CARDS_PER_ROW = 3;
var CARD_HEIGHT = 180;
var ROW_GAP = 25;
var TOP_OFFSET = 205;
var BOTTOM_BREATHING_ROOM = 35;

module.exports = function (content) {
  var copy = content.copy.home.trustIntro;
  var items = content.testimonials.items;
  var bg = content.images.items['home-trust-intro-desk'];
  var rows = Math.ceil(items.length / CARDS_PER_ROW);
  var sectionHeight = TOP_OFFSET + rows * CARD_HEIGHT + (rows - 1) * ROW_GAP + BOTTOM_BREATHING_ROOM;

  var cards = items.map(function (t, i) {
    return '      <div class="trust-intro__card animate-on-scroll stagger-' + (i + 2) + '">\n' +
      '        <div class="trust-intro__card-rule"></div>\n' +
      '        <p class="trust-intro__card-quote">' + spell('“' + t.quote + '”') + '</p>\n' +
      '        <p class="trust-intro__card-attribution">' + spell(t.attribution) + '</p>\n' +
      '      </div>';
  }).join('\n');

  return '<section class="trust-intro" style="--trust-intro-height:' + sectionHeight + 'px;">\n' +
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
