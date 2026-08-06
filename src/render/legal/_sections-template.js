var spell = require('../html').spell;

// Shared by privacy-sections.js and terms-sections.js. No fixed row/column
// layout to protect here -- this is a plain flow list of heading+body
// pairs with no clipping risk, unlike almost every other collection in
// this CMS, so it's safe to leave allow_add: true from the start (see
// admin/config.yml).
module.exports = function (collectionKey) {
  return function (content) {
    var items = content[collectionKey].items;

    var sections = items.map(function (s) {
      return '    <div class="legal-sections__item">\n' +
        '      <h2 class="legal-sections__heading">' + spell(s.heading) + '</h2>\n' +
        '      <p class="legal-sections__body">' + spell(s.body) + '</p>\n' +
        '    </div>';
    }).join('\n\n');

    return '<section class="legal-sections">\n' +
      '  <div class="legal-sections__inner">\n' +
      sections + '\n' +
      '  </div>\n' +
      '</section>\n';
  };
};
