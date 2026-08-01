// Icon glyphs for css/home-services.css's cards -- a *different* icon set
// than services-grid-icons.js for the same six services (see that file's
// header comment for why icons are code, not content). bg color is bundled
// in here too since it's tightly coupled presentation, not a per-item
// editorial choice -- e.g. mgmt-reporting/cashflow/bookkeeping don't share
// their services-grid accent groupings here (this card set uses green for
// 4 of 6, not the grid's 3-way green/navy/red rotation).
module.exports = {
  fpa: {
    bg: 'green',
    svg:
      '<svg class="services__icon-loose" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">\n' +
      '            <path d="M1 1V21H21M3 16L9 11L13 13L20 4M20 9V4H15" stroke="#020C45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '          </svg>',
  },
  'mgmt-reporting': {
    bg: 'green',
    svg:
      '<svg class="services__icon-svg" viewBox="0 0 44 44" fill="none" aria-hidden="true">\n' +
      '            <line x1="11" y1="33" x2="33" y2="33" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="13.2" y1="22" x2="13.2" y2="33" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="19.8" y1="15.4" x2="19.8" y2="33" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="26.4" y1="25.3" x2="26.4" y2="33" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="26" y1="22.3" x2="32.6" y2="19" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '          </svg>',
  },
  cashflow: {
    bg: 'green',
    svg:
      '<svg class="services__icon-svg" viewBox="0 0 44 44" fill="none" aria-hidden="true">\n' +
      '            <line x1="15" y1="15.4" x2="28.2" y2="15.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="23.8" y1="11" x2="28.2" y2="15.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="23.8" y1="19.8" x2="28.2" y2="15.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="15" y1="28.4" x2="28.2" y2="28.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="23.8" y1="24" x2="28.2" y2="28.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="23.8" y1="32.8" x2="28.2" y2="28.4" stroke="#2B6B25" stroke-width="2" stroke-linecap="round"/>\n' +
      '          </svg>',
  },
  bookkeeping: {
    bg: 'navy',
    svg:
      '<svg class="services__icon-svg" viewBox="0 0 44 44" fill="none" aria-hidden="true">\n' +
      '            <line x1="15" y1="11" x2="15" y2="33" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="15" y1="11" x2="35" y2="11" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="15" y1="33" x2="35" y2="33" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="33" y1="11" x2="33" y2="33" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="18" y1="15" x2="30" y2="15" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="18" y1="19.4" x2="30" y2="19.4" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="18" y1="23.8" x2="25.4" y2="23.8" stroke="#020C45" stroke-width="2" stroke-linecap="round"/>\n' +
      '          </svg>',
  },
  'tax-vat': {
    bg: 'red',
    svg:
      '<svg class="services__icon-svg" viewBox="0 0 44 44" fill="none" aria-hidden="true">\n' +
      '            <line x1="14" y1="12" x2="14" y2="31" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="15" y1="12" x2="30" y2="12" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="30" y1="12" x2="30" y2="31" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="14" y1="31" x2="30" y2="31" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="18" y1="22" x2="22" y2="26" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '            <line x1="22" y1="26" x2="27" y2="19" stroke="#8B0A32" stroke-width="2" stroke-linecap="round"/>\n' +
      '          </svg>',
  },
  cleanup: {
    bg: 'green',
    svg:
      '<svg class="services__icon-loose" width="24" height="21" viewBox="0 0 24 21" fill="none" aria-hidden="true">\n' +
      '            <path d="M11.5 6.5L9 1L6.5 6.5L1 9L6.5 11.5L9 17L11.5 11.5L17 9L11.5 6.5Z" stroke="#2B6B25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '            <path d="M20.3 14.7L19 12L17.7 14.7L15 16L17.7 17.3L19 20L20.3 17.3L23 16L20.3 14.7Z" stroke="#2B6B25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '            <path d="M18 3L17 1L16 3L14 4L16 5L17 7L18 5L20 4L18 3Z" stroke="#2B6B25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '          </svg>',
  },
};
