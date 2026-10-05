// Shared helpers for the static generator.
// Everything here is pure: no file IO, no globals except BASE.

export const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

/** Absolute URL inside the site, respecting the GitHub Pages sub-path. */
export const url = (p = '') => BASE + String(p).replace(/^\//, '');

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => (v == null ? '' : String(v).replace(/[&<>"']/g, (c) => ESC[c]));

/** Raw HTML marker – values wrapped in raw() are not escaped by html``. */
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s == null ? '' : String(s));

const flat = (v) => {
  if (v == null || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(flat).join('');
  return esc(v);
};

/** Tagged template: interpolations are escaped unless raw() or nested html``. */
export function html(strings, ...vals) {
  let out = strings[0];
  vals.forEach((v, i) => { out += flat(v) + strings[i + 1]; });
  return new Raw(out);
}

/** Czech typography: non-breaking space after one-letter prepositions/conjunctions. */
export const nbsp = (s) => esc(s).replace(/(^|[\s(])([vkszaiouVKSZAIOU])\s+/g, '$1$2&nbsp;');
export const text = (s) => raw(nbsp(s));

const nf = new Intl.NumberFormat('cs-CZ');
const nf1 = new Intl.NumberFormat('cs-CZ', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
export const czk = (n) => (n == null ? null : nf.format(n) + ' Kč');
export const m2 = (n) => (n == null ? null : nf1.format(n) + ' m²');
export const num = (n) => (n == null ? '' : nf1.format(n));

export const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Placeholder marker for missing / unverified content (visible on purpose). */
export const gap = (kind, note = '') => html`<span class="gap gap--${kind === 'verify' ? 'verify' : 'missing'}" title="${note}">${kind === 'verify' ? 'K OVĚŘENÍ' : kind === 'client' ? 'DOPLNIT KLIENTEM' : 'CHYBÍ PODKLAD'}${note ? html`<em>${note}</em>` : ''}</span>`;

export const icon = (name, cls = '') => raw(`<svg class="i ${cls}" aria-hidden="true"><use href="${url('img/icons.svg')}#${name}"/></svg>`);

/** Responsive visualisation image from the media pipeline (su-XXXX-{640,1280,2400}.webp + 1600.jpg). */
export function viz(id, alt, { sizes = '100vw', cls = '', eager = false, label = true } = {}) {
  const b = url(`media/viz/${id}`);
  return html`<figure class="media ${cls}">
    <picture>
      <source type="image/webp" srcset="${b}-640.webp 640w, ${b}-1280.webp 1280w, ${b}-2400.webp 2400w" sizes="${sizes}">
      <img src="${b}-1600.jpg" alt="${alt}" ${raw(eager ? 'fetchpriority="high"' : 'loading="lazy"')} decoding="async" width="1600" height="1067">
    </picture>
    ${label ? html`<span class="media__tag">Vizualizace</span>` : ''}
  </figure>`;
}
