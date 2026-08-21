var spell = require('../html').spell;

// Apart from the section's own copy, only the 5 steps' text (title/desc)
// and their per-step badge/text color variants are data here -- the
// rings/connectors/arrows around them are a hand-drawn snake-path
// flowchart specific to exactly 5 steps in exactly these positions (a 6th
// step has no defined connector), so they stay fixed chrome in this
// render function rather than becoming count-agnostic.
// The color variants likewise don't reduce to a clean position-derived
// rule (step 4's label and title colors even disagree with each other),
// so they're stored per item rather than derived and risking a wrong guess.
module.exports = function (content) {
  var copy = content.copy['how-we-work'].process;
  var items = content.processSteps.items;

  var steps = items.map(function (step, i) {
    var num = String(i + 1).padStart(2, '0');
    return '      <li class="hww-process__step hww-process__step--' + num + '">\n' +
      '        <div class="hww-process__badge hww-process__badge--' + step.badgeBg + '">\n' +
      '          <span class="hww-process__badge-num hww-process__badge-num--' + step.numColor + '">' + num + '</span>\n' +
      '        </div>\n' +
      // copy.stepLabel is the word only ("STEP") -- the two-digit number
      // after it is the step's position, not editable copy.
      '        <p class="hww-process__step-label hww-process__step-label--' + step.labelVariant + '">' + spell(copy.stepLabel) + ' ' + num + '</p>\n' +
      '        <h3 class="hww-process__step-title hww-process__step-title--' + step.titleVariant + '">' + spell(step.title) + '</h3>\n' +
      '        <p class="hww-process__step-desc hww-process__step-desc--' + step.descVariant + '">' + spell(step.desc) + '</p>\n' +
      '      </li>';
  }).join('\n\n');

  return '<section class="hww-process">\n' +
    '  <div class="hww-process__inner">\n' +
    '    <div class="hww-process__grid" aria-hidden="true"></div>\n' +
    '\n' +
    '    <p class="hww-process__eyebrow animate-on-scroll">' + spell(copy.eyebrow) + '</p>\n' +
    '    <h2 class="hww-process__heading animate-on-scroll">' + spell(copy.heading) + '</h2>\n' +
    '    <div class="hww-process__rule animate-on-scroll"></div>\n' +
    '    <p class="hww-process__count">01 to ' + String(items.length).padStart(2, '0') + '</p>\n' +
    '\n' +
    '    <div class="hww-process__ring hww-process__ring--1" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__ring hww-process__ring--2" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__ring hww-process__ring--3" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__dot" aria-hidden="true"></div>\n' +
    '\n' +
    '    <div class="hww-process__connector hww-process__connector--h1" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__arrow hww-process__arrow--1">' + spell('→') + '</div>\n' +
    '\n' +
    '    <div class="hww-process__connector hww-process__connector--h2" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__arrow hww-process__arrow--2">' + spell('→') + '</div>\n' +
    '\n' +
    '    <div class="hww-process__connector hww-process__connector--v" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__arrow hww-process__arrow--3">' + spell('↓') + '</div>\n' +
    '\n' +
    '    <div class="hww-process__connector hww-process__connector--h3" aria-hidden="true"></div>\n' +
    '    <div class="hww-process__arrow hww-process__arrow--4">' + spell('←') + '</div>\n' +
    '\n' +
    '    <ol class="hww-process__steps">\n' +
    steps + '\n' +
    '    </ol>\n' +
    '  </div>\n' +
    '</section>\n';
};
