var spell = require('../html').spell;
var attr = require('../html').attr;

module.exports = function (content) {
  var copy = content.copy.insights.hero;
  var bg = content.images.items['insights-hero-bg'];
  var newsletter = copy.newsletter;

  // Off by default (CMS-editable) -- css/insights-hero.css has no layout
  // dependency on this block's presence (absolutely positioned on desktop,
  // a plain stacked block on mobile), so omitting it entirely leaves no gap.
  var newsletterHtml = !newsletter.enabled ? '' :
    '    <div class="insights-hero__newsletter">\n' +
    '      <p class="insights-hero__newsletter-title">' + spell(newsletter.title) + '</p>\n' +
    '      <p class="insights-hero__newsletter-subtitle">' + spell(newsletter.subtitle) + '</p>\n' +
    '      <form class="insights-hero__form">\n' +
    '        <input class="insights-hero__input" type="email" placeholder="' + attr(newsletter.emailPlaceholder) + '" aria-label="' + attr(newsletter.emailLabel) + '" />\n' +
    '        <button class="insights-hero__submit" type="submit">' + spell(newsletter.submitLabel) + '</button>\n' +
    '      </form>\n' +
    '    </div>\n';

  return '<section class="insights-hero">\n' +
    '  <div class="insights-hero__bg" aria-hidden="true">\n' +
    '    <img src="' + bg.src + '" width="' + bg.width + '" height="' + bg.height + '" alt="' + attr(bg.alt) + '" loading="eager" fetchpriority="high" />\n' +
    '  </div>\n' +
    '  <div class="insights-hero__inner">\n' +
    '    <div class="insights-hero__rings" aria-hidden="true">\n' +
    '      <div class="insights-hero__ring" style="left:950px; top:-120px; width:500px; height:500px;"></div>\n' +
    '      <div class="insights-hero__ring" style="left:1200px; top:200px; width:300px; height:300px;"></div>\n' +
    '      <div class="insights-hero__ring" style="left:800px; top:360px; width:160px; height:160px;"></div>\n' +
    '    </div>\n' +
    '\n' +
    '    <p class="insights-hero__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <p class="insights-hero__watermark" aria-hidden="true">INS</p>\n' +
    '\n' +
    '    <h1 class="insights-hero__title animate-on-scroll">\n' +
    '      <span class="insights-hero__title-line">' + spell(copy.titleLead) + '</span>\n' +
    '      <span class="insights-hero__title-line text-outline">' + spell(copy.titleOutlined) + '</span>\n' +
    '    </h1>\n' +
    '\n' +
    '    <p class="insights-hero__body animate-on-scroll">' + spell(copy.body) + '</p>\n' +
    '\n' +
    newsletterHtml +
    '  </div>\n' +
    '</section>\n';
};
