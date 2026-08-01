var spell = require('../html').spell;

// filters__tab--1..6 are dead CSS classes (only .filters__tab--active is
// styled in css/cs-filters.css) but are reproduced here for byte-identity
// with the hand-written partial this replaces. A later, separately-reviewed
// commit can drop them.
module.exports = function (content) {
  var categories = content.caseStudyCategories.items;

  var tabs = ['      <button type="button" class="filters__tab filters__tab--active filters__tab--1" data-filter="all">ALL WORK</button>'];
  categories.forEach(function (cat, i) {
    tabs.push(
      '      <button type="button" class="filters__tab filters__tab--' + (i + 2) + '" data-filter="' + cat.slug + '">' + spell(cat.tabLabel) + '</button>'
    );
  });

  return '<section class="filters">\n' +
    '  <div class="filters__inner">\n' +
    '    <div class="filters__group" data-filter-group data-filter-target=".cs-grid__card" data-active-class="filters__tab--active">\n' +
    tabs.join('\n') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>\n';
};
