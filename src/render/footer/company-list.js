var spell = require('../html').spell;

module.exports = function (content) {
  return content.footerCompanyLinks.items.map(function (link) {
    return '        <li><a href="' + link.href + '">' + spell(link.label) + '</a></li>';
  }).join('\n');
};
