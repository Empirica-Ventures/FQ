var spell = require('../html').spell;

// Shared by privacy-hero.js and terms-hero.js -- both pages are identical
// in shape (heading, "last updated" date, one intro paragraph), so this
// factory avoids duplicating the render logic twice. Same pattern as
// src/render/services/_body-template.js.
module.exports = function (pageKey) {
  return function (content) {
    var page = content.pages[pageKey];
    // Label only -- the date itself is per-page, in content/pages/<page>.json.
    var copy = content.copy.legal.hero;

    return '<section class="legal-hero">\n' +
      '  <div class="legal-hero__inner">\n' +
      '    <h1 class="legal-hero__heading">' + spell(page.heading) + '</h1>\n' +
      '    <p class="legal-hero__updated">' + spell(copy.lastUpdatedLabel) + ' ' + spell(page.updated) + '</p>\n' +
      '    <p class="legal-hero__intro">' + spell(page.intro) + '</p>\n' +
      '  </div>\n' +
      '</section>\n';
  };
};
