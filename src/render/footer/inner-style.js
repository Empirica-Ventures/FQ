// Computes the footer's height and the divider/bottom-row positions from
// the tallest of its four columns, the same technique home/08-industries.js
// and home/03-trust-intro.js already use for a section whose content can
// now grow past what its layout was originally hand-tuned for.
//
// Services (6) and Contact (3) stay fixed-count; Company and Follow are the
// two unlocked for allow_add in admin/config.yml, so they're the only lists
// that can actually push this taller.
//
// Values below are reverse-engineered from css/footer.css's own original
// hardcoded numbers so that today's real counts (6 company, 3 social)
// reproduce that exact height/divider/bottom-row position:
//   CONTENT_START = 86   (col top 40 + title/rule block ~46)
//   ITEM_HEIGHT   = 30   (.footer__col-list li line-height)
//   BREATHING_ROOM= 76   (gap between last list item and the divider)
//   DIVIDER_GAP   = 14   (divider to bottom-row)
//   BOTTOM_PAD    = 44   (bottom-row to the footer's own bottom edge)
// 86 + 6*30 + 76 = 342 (divider), +14 = 356 (bottom row), +44 = 400 (height)
// -- all three match the CSS's pre-existing fallback values exactly.
var CONTENT_START = 86;
var ITEM_HEIGHT = 30;
var BREATHING_ROOM = 76;
var DIVIDER_GAP = 14;
var BOTTOM_PAD = 44;
var SERVICES_COUNT = 6;
var CONTACT_COUNT = 3;

module.exports = function (content) {
  var maxItems = Math.max(
    SERVICES_COUNT,
    CONTACT_COUNT,
    content.footerCompanyLinks.items.length,
    content.footerSocialLinks.items.length
  );
  var dividerTop = CONTENT_START + maxItems * ITEM_HEIGHT + BREATHING_ROOM;
  var bottomRowTop = dividerTop + DIVIDER_GAP;
  var innerHeight = bottomRowTop + BOTTOM_PAD;

  return '--footer-inner-height:' + innerHeight + 'px; ' +
    '--footer-divider-top:' + dividerTop + 'px; ' +
    '--footer-bottom-row-top:' + bottomRowTop + 'px;';
};
