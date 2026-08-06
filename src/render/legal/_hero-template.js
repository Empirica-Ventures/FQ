var spell = require('../html').spell;

// Shared by privacy-hero.js and terms-hero.js -- both pages are identical
// in shape (heading, "last updated" date, one intro paragraph), so this
// factory avoids duplicating the render logic twice. Same pattern as
// src/render/services/_body-template.js.
module.exports = function (pageKey) {
  return function (content) {
    var page = content.pages[pageKey];

    return '<section class="legal-hero">\n' +
      '  <div class="legal-hero__inner">\n' +
      '    <h1 class="legal-hero__heading">' + spell(page.heading) + '</h1>\n' +
      '    <p class="legal-hero__updated">Last updated: ' + spell(page.updated) + '</p>\n' +
      '    <p class="legal-hero__intro">' + spell(page.intro) + '</p>\n' +
      '  </div>\n' +
      '</section>\n';
  };
};
