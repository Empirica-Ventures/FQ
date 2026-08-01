var spell = require('../html').spell;

module.exports = function (content) {
  return content.footerSocialLinks.items.map(function (link) {
    return '        <li><a href="' + link.href + '" target="_blank" rel="noopener">' + spell(link.label) + ' ↗</a></li>';
  }).join('\n');
};
