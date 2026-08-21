var spell = require('../html').spell;

// The track duplicates the whole logo set once, back to back, so
// js/main.js can measure the gap between the first real chip and the
// first duplicate chip and scroll by exactly that distance for a seamless
// loop (see css/hww-tools.css and js/main.js's marquee comment) -- that
// mechanism already works for any item count, so this render function
// just needs to emit both sets from the same data.
module.exports = function (content) {
  var copy = content.copy['how-we-work'].tools;
  var items = content.toolLogos.items;

  function chip(logo, hidden) {
    var attrs = hidden ? ' aria-hidden="true"' : '';
    var alt = hidden ? '' : spell(logo.alt);
    return '        <div class="hww-tools__chip"' + attrs + '><img src="' + logo.src + '" width="60" height="60" alt="' + alt + '" /></div>';
  }

  var real = items.map(function (logo) { return chip(logo, false); }).join('\n');
  var duplicate = items.map(function (logo) { return chip(logo, true); }).join('\n');

  return '<section class="hww-tools">\n' +
    '  <div class="hww-tools__inner">\n' +
    '    <p class="hww-tools__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="hww-tools__heading animate-on-scroll">' + spell(copy.heading) + '</h2>\n' +
    '    <div class="hww-tools__rule animate-on-scroll"></div>\n' +
    '    <p class="hww-tools__tag">' + spell(copy.tag) + '</p>\n' +
    '\n' +
    '    <div class="hww-tools__band">\n' +
    '      <div class="hww-tools__track">\n' +
    real + '\n' +
    '\n' +
    duplicate + '\n' +
    '      </div>\n' +
    '      <div class="hww-tools__fade hww-tools__fade--left" aria-hidden="true"></div>\n' +
    '      <div class="hww-tools__fade hww-tools__fade--right" aria-hidden="true"></div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
