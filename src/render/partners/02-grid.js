var spell = require('../html').spell;
var attr = require('../html').attr;

// Unlike every other collection in this CMS, partners.json ships with zero
// seed items -- there's no existing partner data anywhere in the codebase
// to extract, and fabricating placeholder partners would misrepresent real
// business relationships. Renders nothing (not an empty box) until the
// client adds at least one entry through the CMS. The grid itself has no
// fixed row count or overflow:hidden -- built auto-height/flow from day
// one, unlike the older Figma-derived pages, so this collection is the one
// place in the whole CMS that's allow_add: true from the start.
module.exports = function (content) {
  var items = content.partners.items;
  if (!items.length) return '';

  var cards = items.map(function (p) {
    var link = p.websiteUrl
      ? '\n        <a href="' + attr(p.websiteUrl) + '" class="partners-grid__link" target="_blank" rel="noopener">Visit website ' + spell('→') + '</a>'
      : '';
    return '      <div class="partners-grid__card">\n' +
      '        <img class="partners-grid__logo" src="' + attr(p.logoSrc) + '" alt="' + attr(p.logoAlt) + '" loading="lazy" />\n' +
      '        <p class="partners-grid__name">' + spell(p.name) + '</p>\n' +
      '        <p class="partners-grid__blurb">' + spell(p.blurb) + '</p>' + link + '\n' +
      '      </div>';
  }).join('\n\n');

  return '<section class="partners-grid">\n' +
    '  <div class="partners-grid__inner">\n' +
    cards + '\n' +
    '  </div>\n' +
    '</section>\n';
};
