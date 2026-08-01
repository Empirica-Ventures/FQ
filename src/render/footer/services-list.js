var spell = require('../html').spell;

// The footer lists services in its own order -- Bookkeeping, Mgmt
// Reporting, Cash Flow, FP&A, Tax & VAT, Cleanup -- genuinely different
// from the order services-grid/services-hero/home-services use (FP&A
// first). If order lived in the shared data instead of here, reordering
// one render site would silently reshuffle the others.
var ORDER = ['bookkeeping', 'mgmt-reporting', 'cashflow', 'fpa', 'tax-vat', 'cleanup'];

module.exports = function (content) {
  var bySlug = {};
  content.services.items.forEach(function (svc) { bySlug[svc.slug] = svc; });

  return ORDER.map(function (slug) {
    var svc = bySlug[slug];
    if (!svc) throw new Error('footer services list: unknown slug "' + slug + '"');
    return '        <li><a href="' + svc.href + '">' + spell(svc.name) + '</a></li>';
  }).join('\n');
};
