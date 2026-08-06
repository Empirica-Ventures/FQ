// Icon glyphs for css/home-industries.css's teaser cards -- code, not
// content, hand-drawn per industry (see services-grid-icons.js's header
// comment for why icons never live in content/collections/*.json).
// Stroke color matches each card's own accent (red/green/white-on-dark),
// so it's bundled with the path here rather than derived separately.
module.exports = {
  'd2c-cpg':
    '<svg viewBox="0 0 15.8 16.05" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M4.9 3.15C4.9 0.15 10.9 0.15 10.9 3.15M0.900003 3.15H14.9L13.9 15.15H1.9L0.900003 3.15Z" stroke="#8B0A32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',

  'retail-ecommerce':
    '<svg viewBox="0 0 15.8 14.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M1.9 4.9V13.9H13.9V4.9M5.9 13.9V8.9H9.9V13.9M0.900001 4.9H14.9L12.9 0.9H2.9L0.900001 4.9Z" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',

  healthcare:
    '<svg viewBox="0 0 15.8 15.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M5.9 0.9H9.9V5.9H14.9V9.9H9.9V14.9H5.9V9.9H0.9V5.9H5.9V0.9Z" stroke="#2B6B25" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',

  manufacturing:
    '<svg viewBox="0 0 16.8 12.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M2.9 5.9V0.9H4.9V5.9M0.9 11.9V5.9H5.9V2.9L10.9 5.9V2.9L15.9 5.9V11.9H0.9Z" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',

  'logistics-supply-chain':
    '<svg viewBox="0 0 16.8 13.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M10.9 8.9V0.9H0.9V8.9H10.9ZM10.9 8.9H15.9V5.9L13.9 2.9H10.9M4.9 8.9C6 8.9 6.9 9.8 6.9 10.9C6.9 12 6 12.9 4.9 12.9C3.8 12.9 2.9 12 2.9 10.9C2.9 9.8 3.8 8.9 4.9 8.9ZM13.4 8.9C14.5 8.9 15.4 9.8 15.4 10.9C15.4 12 14.5 12.9 13.4 12.9C12.3 12.9 11.4 12 11.4 10.9C11.4 9.8 12.3 8.9 13.4 8.9Z" stroke="#8B0A32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',

  'construction-real-estate':
    '<svg viewBox="0 0 14.8 14.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M0.9 13.9H13.9M2.9 13.9V0.9H10.9V13.9M4.9 3.9H5.9M7.9 3.9H8.9M4.9 6.9H5.9M7.9 6.9H8.9M4.9 9.9H5.9M7.9 9.9H8.9" stroke="#2B6B25" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>',
};

// Fallback for any industry added through the CMS (unlocked -- see
// admin/config.yml) that doesn't have a hand-drawn icon above: a generic
// briefcase glyph, no id-specific artwork needed. Takes a color rather
// than having one baked in, since (unlike the 6 above) it isn't matched
// to one specific card -- src/render/home/08-industries.js derives the
// right color the same way it already derives circleStyle, from the
// card's own accent (red/green accent cards -> that accent's color,
// cream cards -> white, matching the existing 6 icons' own red/white/
// green pattern exactly).
module.exports.DEFAULT_ICON = function (color) {
  return '<svg viewBox="0 0 15.8 13.8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n' +
    '            <path d="M5.9 3.9V1.9C5.9 1.35 6.35 0.9 6.9 0.9H8.9C9.45 0.9 9.9 1.35 9.9 1.9V3.9M0.9 6.9H14.9M1.9 3.9H13.9L14.9 12.9H0.9L1.9 3.9Z" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n' +
    '          </svg>';
};
