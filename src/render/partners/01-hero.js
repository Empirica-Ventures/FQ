var spell = require('../html').spell;

module.exports = function (content) {
  var page = content.pages['partners'];

  return '<section class="partners-hero">\n' +
    '  <div class="partners-hero__inner">\n' +
    '    <h1 class="partners-hero__heading">' + spell(page.heading) + '</h1>\n' +
    '    <p class="partners-hero__intro">' + spell(page.intro) + '</p>\n' +
    '  </div>\n' +
    '</section>\n';
};
