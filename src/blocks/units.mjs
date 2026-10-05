// CMS bloky prodeje: UnitSelector, SitePlan, FloorPlan, UnitRow (karta jednotky), UnitDetail (šablona), SelectorTeaser
import { html, raw, url, icon, viz, text, czk, m2, num, gap, esc } from '../lib/util.mjs';
import { TYPE, STATUS } from '../lib/content.mjs';

const FLOOR_LABEL = { '1.PP': '1. PP', '1.NP': '1. NP', '2.NP': '2. NP', '3.NP': '3. NP' };
export const outdoorText = (u) => {
  const a = u.areas; const out = [];
  if (a.loggia) out.push(`lodžie ${num(a.loggia)} m²`);
  if (a.balcony) out.push(`balkon ${num(a.balcony)} m²`);
  if (a.terrace) out.push(`terasa ${num(a.terrace)} m²`);
  if (a.porch) out.push(`závětří ${num(a.porch)} m²`);
  return out.join(' + ');
};
const roomName = (n) => { const s = n.toLowerCase().replace(/(^|[^a-zá-ž])wc(?![a-zá-ž])/g, '$1WC'); return s.charAt(0).toUpperCase() + s.slice(1); };
const mainArea = (u) => (u.type === 'byt' ? u.areas.floor : u.areas.living);
const areaLabel = (u) => (u.type === 'byt' ? 'Podlahová plocha' : 'Obytná plocha');
export const priceHtml = (u, cls = '') => u.status === 'prodano'
  ? html`<span class="price price--sold ${cls}">Prodáno</span>`
  : u.price ? html`<span class="price ${cls}">${czk(u.price)}</span>` : html`<span class="price ${cls}">${gap('missing', 'cena')}</span>`;
export const badge = (u) => html`<span class="badge badge--${u.status}">${STATUS[u.status] || '—'}</span>`;

/* ---------------------------------------------------------------- SitePlan */
export function sitePlanSvg(c, { highlight = null, interactive = true, compact = false } = {}) {
  const sp = c.siteplan; const [x, y, w, h] = sp.viewBox;
  const byId = Object.fromEntries(c.units.map((u) => [u.id, u]));
  const bdState = (b) => { const s = c.stats[b]; return s.free ? 'volne' : s.reserved ? 'rezervovano' : 'prodano'; };
  return html`<svg class="splan${compact ? ' splan--compact' : ''}" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="Situace areálu Rezidence Slovanské údolí">
    <g class="splan__roads">${sp.roads.map((d) => html`<path d="${d}"/>`)}</g>
    <g class="splan__plots">${sp.objects.filter((o) => o.plot).map((o) => html`<polygon points="${o.plot}"/>`)}</g>
    ${sp.objects.map((o) => {
      const isBD = o.id.startsWith('BD');
      const u = byId[o.id];
      const st = isBD ? bdState(o.id) : u?.status;
      const on = highlight ? (highlight === o.id) : true;
      const attrs = interactive ? raw(`tabindex="0" role="button" data-obj="${o.id}" aria-label="${esc(isBD ? `${o.name}: ${c.stats[o.id].free} volných z ${c.stats[o.id].total}` : `${u.label}: ${STATUS[u.status]}`)}"`) : '';
      const [lx, ly] = o.labelAt || centroid(o.points);
      return html`<g class="splan__obj splan__obj--${isBD ? 'bd' : 'rd'} st-${st}${on ? '' : ' is-dim'}${highlight === o.id ? ' is-hl' : ''}" ${attrs}>
        <polygon points="${o.points}"/>
        <text x="${lx}" y="${ly}" class="splan__lbl${isBD ? ' splan__lbl--bd' : ''}">${o.label}</text>
        ${isBD && !compact ? html`<text x="${lx}" y="${ly + 34}" class="splan__sub">${c.stats[o.id].free} volných / ${c.stats[o.id].total}</text>` : ''}
      </g>`;
    })}
    ${sp.labels.map((l) => html`<text class="splan__street" x="${l.x}" y="${l.y}" transform="rotate(${l.rotate} ${l.x} ${l.y})">${l.text}</text>`)}
    <g class="splan__north" transform="translate(${sp.north.x} ${sp.north.y})"><circle r="30"/><path d="M0 -26 L8 4 L0 -2 L-8 4Z"/><text y="-36">S</text></g>
  </svg>`;
}
function centroid(points) {
  const p = points.split(' ').map((s) => s.split(',').map(Number));
  return [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length + 9];
}

/* ---------------------------------------------------------------- FloorPlan */
export function floorPlanSvg(c, key, { highlight = null, interactive = true } = {}) {
  const f = c.floors[key]; if (!f) return '';
  const [x, y, w, h] = f.viewBox;
  const byId = Object.fromEntries(c.units.map((u) => [u.id, u]));
  return html`<svg class="fplan" viewBox="${x} ${y} ${w} ${h}" data-floor="${key}" role="img" aria-label="Půdorys ${f.building} – ${FLOOR_LABEL[f.floor]}">
    <defs><filter id="fpShrink-${key}" x="0" y="0" width="100%" height="100%"><feMorphology operator="erode" radius="5"/></filter></defs>
    <image href="${url(f.image)}" x="${x}" y="${y}" width="${w}" height="${h}"/>
    ${Object.entries(f.units).map(([id, s]) => {
      const u = byId[id]; if (!u) return '';
      const hl = highlight === id;
      const attrs = interactive ? raw(`tabindex="0" role="button" data-unit="${id}" aria-label="${esc(`${u.label}, ${u.layout}, ${num(u.areas.floor)} m², ${STATUS[u.status]}`)}"`) : '';
      return html`<g class="fplan__u st-${u.status}${hl ? ' is-hl' : ''}${highlight && !hl ? ' is-dim' : ''}" ${attrs}>
        <path d="${s.d}" filter="url(#fpShrink-${key})"/>
        <text x="${s.label[0] + 4}" y="${s.label[1] - 8}" class="fplan__n">${u.number}</text>
        <text x="${s.label[0] + 4}" y="${s.label[1] + 26}" class="fplan__t">${u.layout}</text>
      </g>`;
    })}
  </svg>`;
}

/* ---------------------------------------------------------------- UnitRow (karta jednotky) */
export function UnitRow(u) {
  const outd = outdoorText(u);
  const flags = [u.areas.terrace ? 'terasa' : '', u.areas.loggia ? 'lodzie' : '', u.areas.balcony ? 'balkon' : ''].filter(Boolean).join(' ');
  return html`<article class="urow st-${u.status}" data-u="${u.id}" data-type="${u.type}" data-b="${u.building}" data-floor="${u.floor}" data-layout="${u.layout}" data-status="${u.status}" data-area="${mainArea(u)}" data-price="${u.price || ''}" data-out="${flags}" data-n="${u.number}">
    <a class="urow__plan" href="${url(`nabidka/${u.slug}/`)}" tabindex="-1" aria-hidden="true"><img src="${url(u.media.plan.replace('plans/', 'plans-thumb/'))}" alt="" loading="lazy" decoding="async"></a>
    <div class="urow__id">
      <a class="urow__title" href="${url(`nabidka/${u.slug}/`)}"><span class="urow__type">${TYPE[u.type].one}</span> ${u.type === 'byt' ? html`č. ${u.number} <small>${u.building}</small>` : html`č. ${String(u.number).padStart(2, '0')}`}</a>
      ${badge(u)}
    </div>
    <dl class="urow__kv">
      <div><dt>Dispozice</dt><dd>${u.layout}</dd></div>
      <div><dt>${u.type === 'byt' ? 'Podlaží' : 'Pozemek'}</dt><dd>${u.type === 'byt' ? FLOOR_LABEL[u.floor] : m2(u.areas.plot)}</dd></div>
      <div><dt>${u.type === 'byt' ? 'Plocha' : 'Obytná pl.'}</dt><dd>${m2(mainArea(u))}</dd></div>
      <div class="urow__out"><dt>Venkovní</dt><dd>${outd || '—'}</dd></div>
    </dl>
    <div class="urow__price">${priceHtml(u)}</div>
    <div class="urow__act">
      <button class="iconbtn" type="button" data-fav="${u.id}" aria-pressed="false" aria-label="Přidat ${u.label} do oblíbených" title="Oblíbené">${icon('heart')}</button>
      <button class="iconbtn" type="button" data-cmp="${u.id}" aria-pressed="false" aria-label="Přidat ${u.label} k porovnání" title="Porovnat">${icon('compare')}</button>
      <a class="iconbtn iconbtn--go" href="${url(`nabidka/${u.slug}/`)}" aria-label="Detail ${u.label}">${icon('arrow')}</a>
    </div>
  </article>`;
}

/* ---------------------------------------------------------------- UnitSelector */
export function UnitSelector(p, c) {
  const s = c.stats;
  const layouts = [...new Set(c.units.map((u) => u.layout))].sort((a, b) => parseFloat(a.replace(',', '.')) - parseFloat(b.replace(',', '.')));
  const tabs = [['vse', 'Vše', s.all], ['byt', 'Byty', s.byt], ['radovy-dum', 'Řadové domy', s['radovy-dum']], ['dvojdum', 'Dvojdomy', s.dvojdum]];
  const floorKeys = (b) => ['1PP', '1NP', '2NP', '3NP'].map((f) => `${b}_${f}`).filter((k) => c.floors[k]);
  return html`<section class="sel" data-selector>
  <div class="wrap">
    <div class="sel__tabs" role="tablist" aria-label="Typ jednotky">
      ${tabs.map(([id, label, st], i) => html`<button class="sel__tab" role="tab" type="button" data-tab="${id}" aria-selected="${i === 0 ? 'true' : 'false'}">
        <span class="sel__tab-l">${label}</span><span class="sel__tab-n"><b>${st.free}</b> volných / ${st.total}</span></button>`)}
    </div>
  </div>

  <div class="sel__stage">
    <div class="wrap">
      <div class="sel__visual" data-visual="site">
        <div class="sel__vbar">
          <nav class="sel__path" aria-label="Úroveň výběru">
            <button type="button" data-go="site">${icon('map')} Areál</button>
            <span data-path-b hidden></span><span data-path-f hidden></span>
          </nav>
          <div class="legend">
            <span class="legend__i st-volne">Volné</span><span class="legend__i st-rezervovano">Rezervováno</span><span class="legend__i st-prodano">Prodáno</span>
          </div>
        </div>

        <div class="sel__view sel__view--site" data-view="site">
          <div class="sel__site">${sitePlanSvg(c)}</div>
          <p class="sel__hint">${icon('info')} Vyberte bytový dům pro zobrazení podlaží, nebo rodinný dům pro jeho detail. <span class="muted">Situace je schematická, překreslená z prodejních listů.</span></p>
        </div>

        <div class="sel__view sel__view--floor" data-view="floor" hidden>
          <div class="sel__floorbar">
            <div class="seg" role="tablist" aria-label="Bytový dům">
              ${['BD1', 'BD2'].map((b) => html`<button type="button" class="seg__b" data-bd="${b}">${b}<small>${s[b].free} volných</small></button>`)}
            </div>
            <div class="seg seg--floors" role="tablist" aria-label="Podlaží" data-floor-tabs>
              ${['1.PP', '1.NP', '2.NP', '3.NP'].map((f) => html`<button type="button" class="seg__b" data-fl="${f}">${FLOOR_LABEL[f]}</button>`)}
            </div>
          </div>
          <div class="sel__floors" data-floors-scroll>
            ${['BD1', 'BD2'].flatMap((b) => floorKeys(b).map((k) => html`<div class="sel__floor" data-floorkey="${k}" hidden>${floorPlanSvg(c, k)}</div>`))}
          </div>
          <p class="sel__hint sel__hint--m">${icon('info')} Půdorys lze posouvat do stran. Klepnutím na byt zobrazíte jeho shrnutí.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="wrap sel__results">
    <div class="sel__filters" data-filters>
      <div class="fgroup" data-only="byt">
        <span class="fgroup__l">Dispozice</span>
        <div class="fgroup__c">${layouts.filter((l) => c.units.some((u) => u.type === 'byt' && u.layout === l)).map((l) => html`<button type="button" class="chip" data-f-layout="${l}" aria-pressed="false">${l}</button>`)}</div>
      </div>
      <div class="fgroup" data-only="byt">
        <span class="fgroup__l">Podlaží</span>
        <div class="fgroup__c">${['1.PP', '1.NP', '2.NP', '3.NP'].map((f) => html`<button type="button" class="chip" data-f-floor="${f}" aria-pressed="false">${FLOOR_LABEL[f]}</button>`)}</div>
      </div>
      <div class="fgroup">
        <span class="fgroup__l">Venkovní prostor</span>
        <div class="fgroup__c">${[['terasa', 'Terasa / zahrada'], ['lodzie', 'Lodžie'], ['balkon', 'Balkon']].map(([k, l]) => html`<button type="button" class="chip" data-f-out="${k}" aria-pressed="false">${l}</button>`)}</div>
      </div>
      <div class="fgroup fgroup--range">
        <label class="fgroup__l" for="f-area">Plocha od <output data-out-area>0</output> m²</label>
        <input id="f-area" type="range" min="0" max="140" step="5" value="0" data-f-area>
      </div>
      <div class="fgroup fgroup--range">
        <label class="fgroup__l" for="f-price">Cena do <output data-out-price>bez omezení</output></label>
        <input id="f-price" type="range" min="3500000" max="16500000" step="250000" value="16500000" data-f-price>
      </div>
      <div class="fgroup fgroup--toggle">
        <label class="switch"><input type="checkbox" data-f-free> <span>Jen volné jednotky</span></label>
      </div>
    </div>

    <div class="sel__head">
      <p class="sel__count" aria-live="polite"><b data-count>${c.units.length}</b> <span data-count-l>jednotek</span> <span class="sel__scope" data-scope hidden></span></p>
      <div class="sel__tools">
        <button class="btn btn--ink btn--sm sel__ftoggle" type="button" data-filters-open>${icon('filter')} Filtry <span class="tool__n" data-fcount></span></button>
        <button class="tlink sel__reset" type="button" data-reset hidden>Zrušit filtry</button>
        <label class="sel__sort"><span class="sr">Řadit</span>
          <select class="ctrl ctrl--sm" data-sort>
            <option value="default">Řadit: označení</option>
            <option value="price-asc">Cena vzestupně</option>
            <option value="price-desc">Cena sestupně</option>
            <option value="area-asc">Plocha vzestupně</option>
            <option value="area-desc">Plocha sestupně</option>
            <option value="floor">Podlaží</option>
          </select>
        </label>
      </div>
    </div>

    <div class="ulist" data-list>
      <div class="ulist__head" aria-hidden="true"><span></span><span>Jednotka</span><span class="ulist__kvh"><span>Dispozice</span><span>Podlaží / pozemek</span><span>Plocha</span><span>Venkovní prostor</span></span><span>Cena s DPH</span><span></span></div>
      ${c.units.map((u) => UnitRow(u))}
    </div>
    <p class="sel__empty" data-empty hidden>Zadaným filtrům neodpovídá žádná jednotka. <button class="tlink" type="button" data-reset>Zrušit filtry</button></p>
    <p class="sel__note small muted">${c.unitsMeta.priceNote} Ceny bytů jsou bez garážového stání (425 000 Kč s DPH). ${gap('verify', 'Napojení na živá data prodeje')}</p>
  </div>

  <aside class="sheet sheet--side upv" data-preview aria-label="Shrnutí jednotky" aria-hidden="true">
    <div class="sheet__grip"></div>
    <div class="upv__in" data-preview-body></div>
  </aside>
</section>`;
}

/* ---------------------------------------------------------------- SelectorTeaser (homepage) */
export function SelectorTeaser(p, c) {
  const s = c.stats;
  return html`<section class="sec steaser">
  <div class="wrap steaser__grid">
    <div class="steaser__copy" data-reveal>
      <p class="eyebrow">${p.eyebrow}</p>
      <h2 class="h1 shead__t">${p.title}</h2>
      <p class="muted" style="margin-top:1rem;max-width:44ch">${text(p.lead)}</p>
      <ul class="steaser__list">
        ${[['BD1', 'Bytový dům 1', s.BD1], ['BD2', 'Bytový dům 2', s.BD2], ['radovy-dum', 'Řadové domy 05–10', s['radovy-dum']], ['dvojdum', 'Dvojdomy 01–04', s.dvojdum]].map(([k, l, st]) => html`<li>
          <a href="${url(k.startsWith('BD') ? `nabidka/?typ=byt&budova=${k}` : `nabidka/?typ=${k}`)}"><span>${l}</span><span class="steaser__bar" style="--f:${st.free / st.total};--r:${st.reserved / st.total}"><i></i><i></i></span><b>${st.free ? `${st.free} volných` : 'vyprodáno'}</b>${icon('arrow')}</a></li>`)}
      </ul>
      <a class="btn" href="${url('nabidka/')}">Otevřít výběr jednotek ${icon('arrow', 'i--arrow')}</a>
    </div>
    <a class="steaser__plan" href="${url('nabidka/')}" data-reveal aria-label="Otevřít interaktivní výběr jednotek">
      ${sitePlanSvg(c, { interactive: false })}
      <span class="legend steaser__legend"><span class="legend__i st-volne">Volné</span><span class="legend__i st-rezervovano">Rezervováno</span><span class="legend__i st-prodano">Prodáno</span></span>
    </a>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- UnitDetail (šablona) */
export function UnitDetail(u, c) {
  const isFlat = u.type === 'byt';
  const t = c.project.typologies.find((x) => x.id === u.type);
  const floorKey = isFlat ? `${u.building}_${u.floor.replace('.', '')}` : null;
  const docs = c.downloads.items.filter((d) => d.file && d.showOn?.includes(u.type));
  const similar = c.units.filter((x) => x.id !== u.id && x.type === u.type && x.status === 'volne')
    .sort((a, b) => Math.abs(mainArea(a) - mainArea(u)) - Math.abs(mainArea(b) - mainArea(u))).slice(0, 3);
  const stdSet = c.standards.sets.find((s) => s.id === (isFlat ? 'byty' : u.type === 'dvojdum' ? 'dvojdomy' : 'radove-domy'));
  const keyStd = stdSet.categories.flatMap((cat) => cat.items.filter((i) => i.key && i.image)).slice(0, 4);
  const a = u.areas;
  const rows = isFlat ? [
    ['Podlahová plocha', m2(a.floor), 'dle prodejního listu – součet ploch místností a svislých konstrukcí'],
    ['Obytná plocha', m2(a.living)], ['Svislé konstrukce', m2(a.structures)],
    a.loggia && ['Lodžie', m2(a.loggia)], a.balcony && ['Balkon', m2(a.balcony)], a.terrace && ['Terasa se zahradou', m2(a.terrace)],
    ['Sklep', u.cellar ? `č. ${u.cellar.no} · ${m2(u.cellar.area)}` : null],
    ['Garážové stání', u.parking ? `č. ${u.parking.no} (2. PP)${u.parkingPrice ? ` · ${czk(u.parkingPrice)}` : ''}` : null],
    ['Orientace', u.orientation], ['Vchod', u.entrance],
  ] : [
    ['Obytná plocha celkem', m2(a.living)], ['z toho 1. NP', m2(a.livingNP)], ['z toho 1. PP', m2(a.livingPP)],
    ['Garáž', m2(a.garage)], a.loggia && ['Lodžie', m2(a.loggia)], a.terrace && ['Terasa', m2(a.terrace)], a.porch && ['Závětří', m2(a.porch)],
    ['Pozemek', m2(a.plot)], ['Parkování', u.parking.type],
  ];
  const levels = isFlat ? [[null, u.rooms]] : ['1.NP', '1.PP'].map((l) => [l, u.rooms.filter((r) => r.level === l)]);
  return html`<section class="ud" data-unit-detail="${u.id}">
  <div class="wrap">
    <ol class="crumbs"><li><a href="${url('')}">Úvod</a></li><li><a href="${url('nabidka/')}">Nabídka</a></li><li><a href="${url(`nabidka/?typ=${u.type}${isFlat ? `&budova=${u.building}` : ''}`)}">${isFlat ? u.building : TYPE[u.type].many}</a></li><li>${u.label}</li></ol>
    <div class="ud__grid">
      <div class="ud__media">
        <div class="ud__tabs" role="tablist" data-ud-tabs>
          <button type="button" role="tab" aria-selected="true" data-ud-tab="plan">Půdorys</button>
          <button type="button" role="tab" aria-selected="false" data-ud-tab="pos">${isFlat ? 'Umístění v podlaží' : 'Umístění v areálu'}</button>
          <button type="button" role="tab" aria-selected="false" data-ud-tab="sheet">Prodejní list</button>
        </div>
        <div class="ud__panel" data-ud-panel="plan">
          <button class="ud__zoom zoomable" type="button" data-lightbox="${url(u.media.plan)}" data-caption="${u.label} – půdorys (výřez z prodejního listu)"><img src="${url(u.media.plan)}" alt="Půdorys – ${u.label}" decoding="async"><span>${icon('zoom')} Zvětšit</span></button>
          <p class="ud__cap">Výřez z prodejního listu klienta. Plná čára = standardní součást dodávky, čárkovaně = není součástí dodávky (případný nadstandard).</p>
        </div>
        <div class="ud__panel" data-ud-panel="pos" hidden>
          <div class="ud__pos">${isFlat ? floorPlanSvg(c, floorKey, { highlight: u.id, interactive: false }) : sitePlanSvg(c, { highlight: u.id, interactive: false, compact: true })}</div>
          <p class="ud__cap">${isFlat ? `${u.building} · ${FLOOR_LABEL[u.floor]}${u.entrance ? ` · vchod ${u.entrance}` : ''}` : 'Schematická situace dle prodejních listů.'}</p>
        </div>
        <div class="ud__panel" data-ud-panel="sheet" hidden>
          <button class="ud__zoom zoomable" type="button" data-lightbox="${url(u.media.sheet)}" data-caption="${u.label} – prodejní list"><img src="${url(u.media.sheet)}" alt="Prodejní list – ${u.label}" loading="lazy"><span>${icon('zoom')} Zvětšit</span></button>
        </div>
      </div>

      <aside class="ud__panelR">
        <div class="ud__sum">
          <div class="ud__sumtop"><p class="eyebrow">${isFlat ? `${u.building} · ${FLOOR_LABEL[u.floor]}` : TYPE[u.type].one}</p>${badge(u)}</div>
          <h1 class="h1 ud__title">${u.label}<span>${u.layout}</span></h1>
          <div class="ud__price">${priceHtml(u, 'price--lg')}${u.status !== 'prodano' && u.price ? html`<small>vč. DPH${isFlat && u.parkingPrice ? html` · garážové stání + ${czk(u.parkingPrice)}` : ''}</small>` : ''}</div>
          <dl class="ud__keys">
            <div><dt>${areaLabel(u)}</dt><dd>${m2(mainArea(u))}</dd></div>
            <div><dt>Venkovní prostor</dt><dd>${u.outdoorTotal ? m2(u.outdoorTotal) : '—'}</dd></div>
            <div><dt>${isFlat ? 'Sklep' : 'Pozemek'}</dt><dd>${isFlat ? (u.cellar ? m2(u.cellar.area) : '—') : m2(a.plot)}</dd></div>
            <div><dt>${isFlat ? 'Orientace' : 'Garáž'}</dt><dd>${isFlat ? (u.orientation || '—') : m2(a.garage)}</dd></div>
          </dl>
          <div class="ud__cta">
            ${u.status === 'prodano'
              ? html`<a class="btn btn--block" href="${url(`nabidka/?typ=${u.type}`)}">Zobrazit volné ${TYPE[u.type].many.toLowerCase()} ${icon('arrow', 'i--arrow')}</a>`
              : html`<a class="btn btn--block btn--lg" href="#poptavka">${u.status === 'rezervovano' ? 'Zájem při uvolnění rezervace' : `Mám zájem o ${isFlat ? 'tento byt' : 'tento dům'}`} ${icon('arrow', 'i--arrow')}</a>`}
            <div class="ud__cta2">
              <button class="btn btn--ink btn--sm" type="button" data-fav="${u.id}" aria-pressed="false">${icon('heart')} <span data-fav-label>Uložit</span></button>
              <button class="btn btn--ink btn--sm" type="button" data-cmp="${u.id}" aria-pressed="false">${icon('compare')} <span data-cmp-label>Porovnat</span></button>
              <button class="btn btn--ink btn--sm" type="button" data-share>${icon('share')} Sdílet</button>
            </div>
          </div>
          <ul class="ud__docs">
            ${u.media.sheetPdf ? html`<li><a href="${url(u.media.sheetPdf)}" target="_blank" rel="noopener">${icon('download')} Prodejní list (PDF)</a></li>` : ''}
            ${u.media.techPdfs.map((t) => html`<li><a href="${url(t)}" target="_blank" rel="noopener">${icon('download')} Technický půdorys${/-1np/.test(t) ? ' 1. NP' : /-1pp/.test(t) ? ' 1. PP' : ''} (PDF)</a></li>`)}
          </ul>
          ${u.verify.length ? html`<div class="ud__verify">${u.verify.map((v) => html`<p>${gap('verify')} ${v}</p>`)}</div>` : ''}
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="sec sec--tight ud__params">
  <div class="wrap ud__pgrid">
    <div>
      <h2 class="h3">Parametry</h2>
      <dl class="ptable">${rows.filter(Boolean).map(([k, v, note]) => html`<div><dt>${k}</dt><dd>${v ?? gap('missing')}${note ? html`<small>${note}</small>` : ''}</dd></div>`)}</dl>
    </div>
    <div>
      <h2 class="h3">Místnosti</h2>
      ${levels.map(([lvl, rs]) => html`${lvl ? html`<h3 class="micro" style="margin:1.25rem 0 .25rem">${FLOOR_LABEL[lvl]}${lvl === '1.NP' ? ' – vstupní podlaží' : ' – obytné podlaží se zahradou'}</h3>` : ''}
        <dl class="ptable ptable--rooms">${rs.map((r) => html`<div><dt>${roomName(r.name)}</dt><dd>${m2(r.area)}</dd></div>`)}</dl>`)}
      <p class="small muted" style="margin-top:1rem">Plochy dle prodejního listu. Veškeré informace a údaje jsou pouze informativní povahy.</p>
    </div>
  </div>
</section>

${t ? html`<section class="sec sec--paper2 ud__about">
  <div class="wrap ud__agrid">
    <div>${viz(t.image, t.imageAlt, { cls: 'ratio-43', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <p class="eyebrow">${t.title} v projektu</p>
      <h2 class="h2 shead__t">${t.title === 'Byty' ? 'Bytové domy při Vejprnické ulici' : t.title + ' při jižní hraně pozemku'}</h2>
      <p style="margin-top:1rem">${text(t.lead)}</p>
      <ul class="ticks ticks--2" style="margin-top:1.25rem">${t.bullets.map((b) => html`<li>${b}</li>`)}</ul>
      <a class="tlink" style="margin-top:1.25rem" href="${url(`projekt/#${t.id}`)}">Více o ${t.id === 'byt' ? 'bytových domech' : t.title.toLowerCase()} ${icon('arrow')}</a>
    </div>
  </div>
</section>` : ''}

<section class="sec">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">Standardy</p><h2 class="h2 shead__t">Vybavení ve standardu</h2></div><a class="tlink shead__a" href="${url(`standardy/?sada=${stdSet.id}`)}">Všechny standardy ${icon('arrow')}</a></div>
    <div class="stdmini">${keyStd.map((i) => html`<a class="stdmini__i" href="${url(`standardy/?sada=${stdSet.id}#${i.id}`)}"><span class="stdmini__img"><img src="${url(i.image)}" alt="${i.title}" loading="lazy"></span><b>${i.title}</b><small>${[i.manufacturer, i.product].filter(Boolean).join(' · ')}</small></a>`)}</div>
  </div>
</section>

<section class="sec sec--tight sec--paper2">
  <div class="wrap ud__fgrid">
    <div>
      <p class="eyebrow">Financování</p>
      <h2 class="h2 shead__t">Rezervace a splátkový kalendář</h2>
      <p style="margin-top:1rem">Rezervace na základě Smlouvy o rezervaci a zálohy <b>100 000 Kč</b>. Následně Smlouva o budoucí kupní smlouvě se splátkami podle postupu výstavby.</p>
      ${u.price && u.status !== 'prodano' ? html`<div class="paysim" data-pay="${u.price}">
        <p class="micro">Orientační rozpis pro cenu ${czk(u.price)}</p>
        <ol>${c.financing.schedule.map((s) => html`<li><span>${s.key} · ${s.pct} %</span><b>${czk(Math.round(u.price * s.pct / 100))}</b><small>${s.when}</small></li>`)}</ol>
        <p class="small muted">Výpočet z ceny jednotky dle Postupu financování (platné od ${c.financing.validFrom}). Z první splátky se odečítá rezervační záloha.</p>
      </div>` : ''}
      <a class="tlink" style="margin-top:1rem" href="${url('financovani/')}">Postup financování ${icon('arrow')}</a>
    </div>
    <div>
      <h3 class="h4">Dokumenty</h3>
      <ul class="dlist">${docs.map((d) => html`<li><a href="${url(d.file)}" target="_blank" rel="noopener">${icon('doc')}<span><b>${d.title}</b>${d.valid ? html`<small>${d.valid}</small>` : ''}</span>${icon('download')}</a></li>`)}</ul>
    </div>
  </div>
</section>

${similar.length ? html`<section class="sec sec--tight">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">Mohlo by vás zajímat</p><h2 class="h2 shead__t">Podobné volné jednotky</h2></div></div>
    <div class="ulist ulist--plain">${similar.map((x) => UnitRow(x))}</div>
  </div>
</section>` : ''}`;
}
