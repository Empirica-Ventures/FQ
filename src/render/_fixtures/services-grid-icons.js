// Icon glyphs for css/services-grid.css's cards -- code, not content. Each
// service has hand-tuned inline SVG/CSS-sculpture markup that a non-
// technical editor must never be able to reach or break, so these live
// here as fixtures keyed by slug rather than in content/collections/services.json.
module.exports = {
  fpa:
    '<div class="services-grid__icon services-grid__icon--fpa">\n' +
    '          <span class="fpa-head"></span>\n' +
    '          <span class="fpa-body"></span>\n' +
    '          <span class="fpa-mask"></span>\n' +
    '        </div>',

  'mgmt-reporting':
    '<div class="services-grid__icon services-grid__icon--mgmt">\n' +
    '          <span class="bar bar--1"></span>\n' +
    '          <span class="bar bar--2"></span>\n' +
    '          <span class="bar bar--3"></span>\n' +
    '        </div>',

  cashflow:
    '<div class="services-grid__icon services-grid__icon--cashflow">\n' +
    '          <svg class="cf-line" viewBox="0 0 26.6001 19.6001" fill="none" aria-hidden="true">\n' +
    '            <path d="M1.30001 18.3001L9.30001 9.30006L15.3 14.3001L25.3 1.30006" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />\n' +
    '          </svg>\n' +
    '          <svg class="cf-dot" viewBox="0 0 8.6 8.6" fill="none" aria-hidden="true">\n' +
    '            <path d="M1.3 1.3H7.3V7.3" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />\n' +
    '          </svg>\n' +
    '        </div>',

  bookkeeping:
    '<div class="services-grid__icon services-grid__icon--bookkeeping">\n' +
    '          <span class="doc-outline"></span>\n' +
    '          <span class="doc-line doc-line--1"></span>\n' +
    '          <span class="doc-line doc-line--2"></span>\n' +
    '          <span class="doc-line doc-line--3"></span>\n' +
    '        </div>',

  'tax-vat':
    '<div class="services-grid__icon services-grid__icon--tax">\n' +
    '          <svg class="tax-shield" viewBox="0 0 24.2 27.2" fill="none" aria-hidden="true">\n' +
    '            <path d="M23.1 5.1L12.1 1.1L1.1 5.1V13.1C1.1 20.1 6.1 24.1 12.1 26.1C18.1 24.1 23.1 20.1 23.1 13.1V5.1Z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />\n' +
    '          </svg>\n' +
    '          <svg class="tax-check" viewBox="0 0 13.4 10.4" fill="none" aria-hidden="true">\n' +
    '            <path d="M1.2 5.20002L5.2 9.20002L12.2 1.20002" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />\n' +
    '          </svg>\n' +
    '        </div>',

  cleanup:
    '<div class="services-grid__icon services-grid__icon--cleanup">\n' +
    '          <span class="paper-back"></span>\n' +
    '          <span class="paper-front"></span>\n' +
    '          <span class="doc-line doc-line--1"></span>\n' +
    '          <span class="doc-line doc-line--2"></span>\n' +
    '        </div>',
};
