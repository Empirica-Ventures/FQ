var spell = require('../html').spell;

// Logo images intentionally bleed past their card edges (see
// css/services-trusted-by.css) -- left/top/width/height are Figma
// measurements with no derivable relation to the logo file itself, so
// they're stored as locked geometry alongside src/alt rather than
// something a future CMS field would expose for editing.
//
// "Row 1"/"Row 2" comments repeat every 13 tiles, matching the grid's own
// 13-column layout (css/services-trusted-by.css) -- derived from index
// rather than hand-placed, so it stays correct at any tile count.
module.exports = function (content) {
  var items = content.trustedBy.items;

  var tiles = items.map(function (logo, i) {
    var row = Math.floor(i / 13) + 1;
    // Blank line before every row comment except the first (which follows
    // .trusted-by__grid's own opening tag, not a previous tile).
    var comment = i % 13 === 0 ? (i === 0 ? '' : '\n') + '      <!-- Row ' + row + ' -->\n' : '';
    var label = logo.label.split('\n').map(spell).join('<br />');
    return comment +
      '      <div class="trusted-by__tile">\n' +
      '        <div class="trusted-by__card animate-on-scroll"><img class="trusted-by__logo" src="' + logo.src + '" alt="' + spell(logo.alt) + '" style="left:' + logo.left + 'px; top:' + logo.top + 'px; width:' + logo.width + 'px; height:' + logo.height + 'px;" loading="lazy" width="' + logo.width + '" height="' + logo.height + '" /></div>\n' +
      '        <p class="trusted-by__label">' + label + '</p>\n' +
      '      </div>';
  }).join('\n');

  return '<section class="trusted-by">\n' +
    '  <div class="trusted-by__inner">\n' +
    '    <p class="trusted-by__eyebrow animate-on-scroll">TRUSTED ACROSS THE GCC</p>\n' +
    '    <h2 class="trusted-by__heading animate-on-scroll">Businesses that trust us with their numbers</h2>\n' +
    '    <div class="trusted-by__accent"></div>\n' +
    '\n' +
    '    <div class="trusted-by__grid">\n' +
    tiles + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
