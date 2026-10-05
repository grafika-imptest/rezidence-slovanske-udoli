// Layout – hlavička, navigace, patička, globální UI (porovnání, toast, lightbox).
// Odpovídá CMS „šabloně stránky“; obsah hlavičky a patičky jde ze content/site.json.

import { html, raw, url, esc, icon } from './lib/util.mjs';

const IKO_PATH = 'M12.9,46.6h12.65V10.1h-12.65v36.5ZM35.9,10.1v36.5h12.25V10.1h-12.25ZM58.52,10.1l-10.37,18.25,10.37,18.25h13.2l-10.37-18.25,10.37-18.25h-13.2ZM92.07,9.18c-10.58,0-19.16,8.58-19.16,19.16s8.58,19.16,19.16,19.16,19.16-8.58,19.16-19.16-8.58-19.16-19.16-19.16ZM92.07,36.46c-4.47,0-8.11-3.64-8.11-8.11s3.64-8.11,8.11-8.11,8.11,3.64,8.11,8.11-3.64,8.11-8.11,8.11Z';

/** IKO logo (varianta A) – inline SVG, barvy dle manuálu. */
export const ikoMark = (cls = '', mode = 'blue') => raw(`<svg class="${cls}" viewBox="0 0 120.47 56.69" role="img" aria-label="IKO"><rect width="120.47" height="56.69" fill="${mode === 'white' ? '#fff' : '#005FAA'}"/><path fill="${mode === 'white' ? '#005FAA' : '#fff'}" d="${IKO_PATH}"/></svg>`);

/** Podznačka projektu dle Dodatku manuálu 2026 (IKO + název projektu v Pepi Bold). */
export const lockup = (site, { dark = false } = {}) => html`<a class="brand${dark ? ' brand--dark' : ''}" href="${url('')}" aria-label="${site.name} – úvod">
  ${ikoMark('brand__mark', dark ? 'white' : 'blue')}
  <span class="brand__name">${site.lockup[0]}<br>${site.lockup[1]}</span>
</a>`;

export function layout(c, page, body) {
  const { site } = c;
  const nav = site.nav;
  const cur = (href) => (page.section && href.startsWith(page.section) ? raw('aria-current="page"') : '');
  const title = page.title ? `${page.title} | ${site.name}` : `${site.name} – ${site.tagline}`;
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description || site.description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#005FAA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description || site.description)}">
<meta property="og:image" content="${url('media/viz/su-0018-1280.webp')}">
<link rel="icon" href="${url('img/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${url('fonts/Pepi-Bold.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${url('fonts/Pepi-Regular.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${url('css/base.css')}">
<link rel="stylesheet" href="${url('css/components.css')}">
<link rel="stylesheet" href="${url('css/blocks.css')}">
<link rel="stylesheet" href="${url('css/units.css')}">
<script>document.documentElement.classList.add('js');window.SU={base:${JSON.stringify(url(''))}};</script>
</head>
<body class="page-${esc(page.id || 'x')}">
<a class="skip" href="#main">Přeskočit na obsah</a>
${html`<div class="topbar">
  <div class="wrap topbar__in">
    <a class="topbar__iko" href="${site.company.web}" target="_blank" rel="noopener">${ikoMark('topbar__mark')}<span>Projekt společnosti IKO Plzeň</span>${icon('ext')}</a>
    <div class="topbar__links">
      <a href="tel:${site.sales.phoneHref}">${icon('phone')}<span>${site.sales.phone}</span></a>
      <a class="hide-m" href="mailto:${site.sales.email}">${icon('mail')}<span>${site.sales.email}</span></a>
    </div>
  </div>
</div>
<header class="hdr" data-hdr>
  <div class="wrap hdr__in">
    ${lockup(site)}
    <nav class="nav" aria-label="Hlavní navigace">
      ${nav.map((n) => html`<a href="${url(n.href)}" ${cur(n.href)}>${n.label}</a>`)}
    </nav>
    <div class="hdr__tools">
      <a class="tool" href="${url('oblibene/')}" aria-label="Oblíbené jednotky" title="Oblíbené">${icon('heart')}<span class="tool__n" data-fav-count></span></a>
      <a class="tool" href="${url('porovnani/')}" aria-label="Porovnání jednotek" title="Porovnání">${icon('compare')}<span class="tool__n" data-cmp-count></span></a>
      <a class="btn btn--sm hdr__cta" href="${url('nabidka/')}">Vybrat jednotku ${icon('arrow', 'i--arrow')}</a>
      <button class="tool burger" type="button" aria-label="Otevřít menu" aria-expanded="false" data-menu-open>${icon('menu')}</button>
    </div>
  </div>
</header>
<div class="mnav" id="mnav" aria-hidden="true" data-menu>
  <div class="mnav__top">${lockup(site, { dark: true })}<button class="tool" type="button" style="color:#fff" aria-label="Zavřít menu" data-menu-close>${icon('close')}</button></div>
  <nav class="mnav__links" aria-label="Mobilní navigace">
    <a href="${url('')}">Úvod</a>
    ${nav.map((n) => html`<a href="${url(n.href)}">${n.label}</a>`)}
    <a href="${url('oblibene/')}">Oblíbené <span data-fav-count></span></a>
  </nav>
  <div class="mnav__foot">
    <a href="tel:${site.sales.phoneHref}">${site.sales.phone}</a>
    <a href="mailto:${site.sales.email}">${site.sales.email}</a>
    <a href="${site.company.web}" target="_blank" rel="noopener">ikoplzen.cz ↗</a>
  </div>
</div>`}
<main id="main">
${body}
</main>
${footer(c)}
${html`<div class="cmpbar" data-cmpbar hidden>
  <div class="wrap cmpbar__in">
    <div class="cmpbar__items" data-cmpbar-items></div>
    <div class="cmpbar__act">
      <button class="btn btn--ink btn--sm" type="button" data-cmp-clear>Vymazat</button>
      <a class="btn btn--sm" href="${url('porovnani/')}">Porovnat <span data-cmp-count></span> ${icon('arrow', 'i--arrow')}</a>
    </div>
  </div>
</div>
<div class="toast" role="status" aria-live="polite" data-toast></div>
<div class="scrim" data-scrim></div>`}
<script src="${url('js/store.js')}"></script>
<script src="${url('js/app.js')}" defer></script>
${page.scripts ? page.scripts.map((s) => `<script src="${url('js/' + s)}" defer></script>`).join('\n') : ''}
</body>
</html>`;
}

function footer(c) {
  const { site } = c;
  return html`<footer class="ftr">
  <div class="tape-band" aria-hidden="true"><div class="tape"></div></div>
  <div class="wrap">
    <div class="ftr__top">
      <div class="ftr__brand">
        ${lockup(site, { dark: true })}
        <p>${site.name} je projektem developerské a stavební společnosti ${site.company.name}. ${site.claim}</p>
      </div>
      <div>
        <h3>Projekt</h3>
        <ul>
          <li><a href="${url('projekt/')}">O projektu</a></li>
          <li><a href="${url('nabidka/')}">Nabídka jednotek</a></li>
          <li><a href="${url('standardy/')}">Standardy</a></li>
          <li><a href="${url('lokalita/')}">Lokalita</a></li>
          <li><a href="${url('ke-stazeni/')}">Ke stažení</a></li>
        </ul>
      </div>
      <div>
        <h3>Nákup</h3>
        <ul>
          <li><a href="${url('financovani/')}">Financování</a></li>
          <li><a href="${url('aktuality/')}">Aktuality ze stavby</a></li>
          <li><a href="${url('oblibene/')}">Oblíbené</a></li>
          <li><a href="${url('porovnani/')}">Porovnání</a></li>
          <li><a href="${url('kontakt/')}">Kontakt</a></li>
        </ul>
      </div>
      <div>
        <h3>${site.sales.title}</h3>
        <ul>
          <li><a href="tel:${site.sales.phoneHref}">${site.sales.phone}</a></li>
          <li><a href="mailto:${site.sales.email}">${site.sales.email}</a></li>
          <li class="ftr__addr">${site.company.name}<br>${site.company.address}</li>
        </ul>
      </div>
    </div>
    <div class="ftr__iko">
      <span class="micro" style="color:rgba(255,255,255,.55)">Další projekty IKO</span>
      <div class="ftr__projects">
        ${site.otherProjects.map((p) => html`<a href="${p.href}" target="_blank" rel="noopener">${p.name}</a>`)}
        <a href="${site.company.web}" target="_blank" rel="noopener"><b>ikoplzen.cz ↗</b></a>
      </div>
    </div>
    <div class="ftr__bottom">
      <span>© 2026 ${site.company.name} · IČO ${site.company.ico} · ${site.company.register}</span>
      <span><a href="${site.company.gdpr}" target="_blank" rel="noopener">Zpracování osobních údajů</a> · <a href="${url('prototyp/')}">O prototypu</a></span>
    </div>
  </div>
</footer>`;
}
