var spell = require('../html').spell;

// Renders a CMS "typed block list" body field -- the same mechanism now
// shared by Insights articles (admin/config.yml's "INSIGHTS — Articles"
// body field) and Case Study detail pages ("CASE STUDIES — Case Study
// List" body field). Not a markdown string: build.js is dependency-free by
// design, and a block list also means the CMS can never inject raw HTML
// onto the page -- every block's text goes through spell() the same as any
// other editable string on this site.
//
// Supported block types, and the only tags an editor can produce:
//   paragraph -> <p>            heading -> <h2>
//   list      -> <ul><li>       quote   -> <blockquote>
module.exports = function renderBlocks(blocks) {
  return blocks.map(function (block) {
    if (block.type === 'heading') {
      return '      <h2>' + spell(block.text) + '</h2>';
    }
    if (block.type === 'quote') {
      return '      <blockquote>' + spell(block.text) + '</blockquote>';
    }
    if (block.type === 'list') {
      var lis = (block.items || []).map(function (item) {
        return '        <li>' + spell(item) + '</li>';
      }).join('\n');
      return '      <ul>\n' + lis + '\n      </ul>';
    }
    if (block.type === 'paragraph') {
      return '      <p>' + spell(block.text) + '</p>';
    }
    throw new Error('rich text block: unknown type "' + block.type + '"');
  }).join('\n');
};
