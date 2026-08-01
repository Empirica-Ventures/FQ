var spell = require('../html').spell;

// One shared list feeds both the desktop nav and the mobile drawer, which
// used to be two hand-typed 8-item lists that had to be kept in sync by
// hand (identical content, different class names).
module.exports = function (content, opts) {
  var items = content.navLinks.items;
  var cls = opts.mobile ? 'navbar__mobile-link' : 'navbar__link';

  return items.map(function (link) {
    return '      <a class="' + cls + '" href="' + link.href + '">' + spell(link.label) + '</a>';
  }).join('\n');
};
