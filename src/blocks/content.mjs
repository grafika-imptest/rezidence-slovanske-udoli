// CMS bloky: Gallery, StandardsTeaser, StandardsExplorer, LocationTeaser, LocationFull,
// FinancingSteps, Developer, NewsList, NewsDetail, Downloads
import { html, raw, url, icon, viz, text, czk, gap } from '../lib/util.mjs';

/* ---------------------------------------------------------------- Gallery */
export function Gallery(p, c) {
  const items = p.ids ? p.ids.map((id) => c.gallery.items.find((g) => g.id === id)).filter(Boolean) : c.gallery.items;
  return html`<section class="sec${p.paper ? ' sec--paper2' : ''} gal" id="galerie">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">${p.eyebrow}</p><h2 class="h1 shead__t">${p.title}</h2></div>
      ${p.filters ? html`<div class="gal__f shead__a" role="group" aria-label="Filtr galerie">
        ${[['vse', 'Vše'], ['areal', 'Areál'], ['byty', 'Byty'], ['domy', 'Rodinné domy']].map(([k, l], i) => html`<button type="button" class="chip" data-gal-f="${k}" aria-pressed="${i === 0}">${l}</button>`)}
      </div>` : ''}</div>
    <div class="gal__grid gal__grid--${p.layout || 'mosaic'}" data-gallery>
      ${items.map((g, i) => html`<button type="button" class="gal__i" data-tags="${g.tags.join(' ')}" data-lightbox="${url(`media/viz/${g.id}-2400.webp`)}" data-caption="${g.alt} – vizualizace" data-group="viz" data-reveal>
        ${viz(g.id, g.alt, { sizes: i % 5 === 0 ? '(min-width: 900px) 66vw, 100vw' : '(min-width: 900px) 33vw, 50vw' })}
      </button>`)}
    </div>
    ${p.more ? html`<a class="tlink" style="margin-top:2rem" href="${url(p.more)}">Všechny vizualizace ${icon('arrow')}</a>` : ''}
  </div>
</section>`;
}

/* ---------------------------------------------------------------- Standards */
const CAT_ICON = { konstrukce: 'build', povrchy: 'layers', dvere: 'door', zti: 'drop', koupelna: 'bath', vzduchotechnika: 'fan', elektro: 'plug', slaboproud: 'wifi', vytapeni: 'heat', kuchyne: 'kitchen', 'venkovni-upravy': 'garden', poznamka: 'info' };

export function StandardsTeaser(p, c) {
  const set = c.standards.sets[0];
  const pick = ['Laminátová podlaha', 'Obklady', 'Sprchový kout', 'Vnitřní dveře'];
  const items = pick.map((t) => set.categories.flatMap((x) => x.items).find((i) => i.title === t)).filter(Boolean);
  const win = set.categories[0].items.find((i) => i.title === 'Výplně otvorů');
  return html`<section class="sec stdt">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">${p.eyebrow}</p><h2 class="h1 shead__t">${p.title}</h2></div>
      <a class="tlink shead__a" href="${url('standardy/')}">Prohlédnout standardy ${icon('arrow')}</a>
      <p class="shead__p">${text(p.lead)}</p></div>
    <div class="stdt__grid">
      <div class="stdt__facts" data-reveal>
        <div class="stdt__fact"><span class="stdt__n">B</span><span>Energetická třída všech objektů (PENB)</span></div>
        <div class="stdt__fact"><span class="stdt__n stdt__n--sm">Ug 0,6</span><span>${win && win.lines.some((l) => /Ug = 0,6/.test(l)) ? 'Plastová okna s izolačním trojsklem Ug = 0,6 W/m²K' : ''}</span></div>
        <div class="stdt__fact"><span class="stdt__n stdt__n--sm">TČ</span><span>Rodinné domy: tepelné čerpadlo vzduch/voda a podlahové vytápění ve všech místnostech</span></div>
      </div>
      ${items.map((i) => html`<a class="stdcard" href="${url(`standardy/#${i.id}`)}" data-reveal>
        <span class="stdcard__img"><img src="${url(i.image)}" alt="${i.title}" loading="lazy"></span>
        <span class="stdcard__b"><small class="micro">${[i.manufacturer, i.product].filter(Boolean).join(' · ')}</small><b>${i.title}</b></span>
      </a>`)}
    </div>
  </div>
</section>`;
}

export function StandardsExplorer(p, c) {
  const sets = c.standards.sets;
  return html`<section class="stdx" data-stdx>
  <div class="stdx__bar">
    <div class="wrap stdx__barin">
      <div class="seg seg--lg" role="tablist" aria-label="Typ výstavby">
        ${sets.map((s, i) => html`<button type="button" role="tab" class="seg__b" data-set="${s.id}" aria-selected="${i === 0}">${s.label}<small>${s.sub}</small></button>`)}
      </div>
      <label class="stdx__search"><span class="sr">Hledat ve standardech</span>${icon('zoom')}<input type="search" class="ctrl" placeholder="Hledat (např. okna, vana, RAKO)" data-std-search></label>
      <label class="switch"><input type="checkbox" data-std-photos> <span>Jen s fotkou</span></label>
    </div>
  </div>
  ${sets.map((s, si) => html`<div class="wrap stdx__set" data-set-panel="${s.id}" ${si ? raw('hidden') : ''}>
    <div class="stdx__grid">
      <nav class="stdx__nav" aria-label="Kategorie standardů">
        <p class="micro">${s.title}</p>
        <ol>${s.categories.map((cat) => html`<li><a href="#${s.id}-${cat.id}" data-cat-link>${icon(CAT_ICON[cat.id] || 'info')}<span>${cat.title}</span><small>${cat.items.length || ''}</small></a></li>`)}</ol>
        <div class="stdx__docs">
          <a href="${url(s.pdf)}" target="_blank" rel="noopener">${icon('download')} Standardy (PDF)</a>
          <a href="${url(s.catalog)}" target="_blank" rel="noopener">${icon('download')} Katalog vybavení (PDF)</a>
          <p class="small muted">Platné od ${s.validFrom}</p>
        </div>
      </nav>
      <div class="stdx__cats">
        ${s.categories.map((cat) => html`<section class="stdcat" id="${s.id}-${cat.id}">
          <header class="stdcat__h">${icon(CAT_ICON[cat.id] || 'info')}<h2 class="h3">${cat.title}</h2><span class="micro">${cat.items.length ? `${cat.items.length} položek` : ''}</span></header>
          <div class="stdcat__items">
            ${cat.items.map((i) => html`<article class="stditem${i.image ? ' stditem--img' : ''}${i.key ? ' stditem--key' : ''}" id="${i.id}" data-std-item data-photo="${i.image ? 1 : 0}">
              <button class="stditem__h" type="button" aria-expanded="${i.image || i.key ? 'true' : 'false'}" data-std-toggle>
                ${i.image ? html`<span class="stditem__thumb"><img src="${url(i.image)}" alt="" loading="lazy"></span>` : ''}
                <span class="stditem__t"><b>${i.title}</b>${i.manufacturer || i.product ? html`<small>${[i.manufacturer, i.product].filter(Boolean).join(' · ')}</small>` : ''}</span>
                ${icon('plus', 'stditem__ico')}
              </button>
              <div class="stditem__body">
                ${i.image ? html`<button type="button" class="stditem__img zoomable" data-lightbox="${url(i.image)}" data-caption="${i.title} – ${i.imageNote}"><img src="${url(i.image)}" alt="${i.title} – ilustrace z katalogu standardů" loading="lazy"></button>` : ''}
                <ul>${i.lines.map((l) => html`<li>${text(l)}</li>`)}</ul>
                ${i.sourceNote ? html`<p>${gap('verify', i.sourceNote)}</p>` : ''}
                ${i.image ? html`<p class="small muted">Foto: ${i.imageNote}</p>` : ''}
              </div>
            </article>`)}
          </div>
          ${cat.notes.map((n) => html`<p class="stdcat__note small">${text(n)}</p>`)}
        </section>`)}
      </div>
    </div>
  </div>`)}
  <div class="wrap"><p class="small muted stdx__foot">Texty převzaty doslovně ze standardů klienta. Fotografie jsou výřezy z katalogů standardů klienta; ilustrační fotografie interiérů v katalozích nejsou fotografiemi projektu. ${gap('missing', 'Samostatné fotografie položek ve vysokém rozlišení')}</p></div>
</section>`;
}

/* ---------------------------------------------------------------- Location */
const LOC_ICON = { doprava: 'tram', skoly: 'school', zdravi: 'health', sport: 'sport', obchody: 'cart', priroda: 'tree' };

export function LocationTeaser(p, c) {
  const L = c.location;
  return html`<section class="sec sec--night loct">
  <div class="wrap loct__grid">
    <div class="loct__copy" data-reveal>
      <p class="eyebrow">${p.eyebrow}</p>
      <h2 class="h1 shead__t">${p.title}</h2>
      <p class="lead" style="margin-top:1.25rem">${text(L.lead)}</p>
      <ul class="loct__cats">${L.categories.map((cat) => html`<li>${icon(LOC_ICON[cat.id])}<span><b>${cat.title}</b><small>${cat.items.slice(0, 2).join(', ')}</small></span></li>`)}</ul>
      <a class="btn btn--white" href="${url('lokalita/')}">Lokalita ${icon('arrow', 'i--arrow')}</a>
    </div>
    <figure class="loct__map" data-reveal>
      <button type="button" class="zoomable" data-lightbox="${url(L.maps[1].image)}" data-caption="${L.maps[1].caption}"><img src="${url(L.maps[1].image)}" alt="${L.maps[1].caption}" loading="lazy"></button>
      <figcaption>${L.maps[1].caption} · podklad klienta</figcaption>
    </figure>
  </div>
</section>`;
}

export function LocationFull(p, c) {
  const L = c.location;
  return html`<section class="sec loc">
  <div class="wrap loc__grid">
    <div class="loc__text" data-reveal>
      <p class="eyebrow">Skvrňany</p>
      <h2 class="h1 shead__t">${L.title}</h2>
      <div class="prose" style="margin-top:1.25rem">${L.paragraphs.map((x) => html`<p>${text(x)}</p>`)}<p><b>Příjezd:</b> ${L.access}</p><p class="small muted">${L.cadastre}</p></div>
    </div>
    <div class="loc__maps" data-reveal>
      ${L.maps.map((m, i) => html`<button type="button" class="loc__map loc__map--${i} zoomable" data-lightbox="${url(m.image)}" data-caption="${m.caption}" data-group="maps"><img src="${url(m.image)}" alt="${m.caption}" loading="lazy"><span>${m.caption}</span></button>`)}
      <a class="tlink" href="${url(L.mapsPdf)}" target="_blank" rel="noopener">${icon('download')} Přehledové mapy (PDF)</a>
    </div>
  </div>
</section>
<section class="sec sec--paper2 loc2">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">Občanská vybavenost</p><h2 class="h1 shead__t">Co najdete v okolí</h2></div>
    <p class="shead__p">Výčet dle textů současného webu. Konkrétní místa, vzdálenosti a dojezdové časy v podkladech nejsou – připraveno pro doplnění v CMS (položka: název, kategorie, vzdálenost, čas, GPS).</p></div>
    <div class="poi">
      ${L.categories.map((cat) => html`<div class="poi__c" data-reveal>
        <h3 class="poi__h">${icon(LOC_ICON[cat.id])} ${cat.title}</h3>
        <ul>${cat.items.map((x) => html`<li><span>${x}</span><span class="poi__d" data-gap>${gap('client', 'vzdálenost')}</span></li>`)}</ul>
      </div>`)}
    </div>
    <div class="gap-box" style="margin-top:2rem" data-gap><b>Interaktivní mapa bodů zájmu</b><span>${gap('missing', 'GPS projektu a seznam míst se vzdálenostmi')}</span><span class="small">Komponenta je připravená (mapa + kategorie + výpis), aktivuje se po dodání bodů.</span></div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- Financing */
export function FinancingSteps(p, c) {
  const F = c.financing;
  return html`<section class="sec fin">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">Postup koupě</p><h2 class="h1 shead__t">Od rezervace ke kupní smlouvě</h2></div>
      <a class="tlink shead__a" href="${url(F.pdf)}" target="_blank" rel="noopener">${icon('download')} Postup financování (PDF)</a>
      <p class="shead__p">Dle dokumentu „Postup financování při prodeji bytů a rodinných domů v lokalitě Rezidence – Plzeň Slovanské údolí“, platné od ${F.validFrom}.</p></div>
    <ol class="steps">
      ${F.steps.map((s) => html`<li class="step" data-reveal><span class="step__n">${s.n}</span><h3 class="h3">${s.title}</h3><p class="step__hl">${s.highlight}</p><p class="small">${text(s.text)}</p></li>`)}
    </ol>
  </div>
</section>
<section class="sec sec--paper2 pay">
  <div class="wrap pay__grid">
    <div data-reveal>
      <p class="eyebrow">Splátkový kalendář</p>
      <h2 class="h1 shead__t">Platíte podle postupu výstavby</h2>
      <div class="prose small" style="margin-top:1.25rem">${F.scheduleNotes.map((n) => html`<p>${text(n)}</p>`)}</div>
      <div class="paycalc" data-paycalc>
        <label class="field"><span class="lbl">Orientační výpočet – kupní cena (Kč)</span><input class="ctrl" type="text" inputmode="numeric" value="6 470 000" data-paycalc-in></label>
        <p class="small muted">Např. cena volného bytu BD1-02. Výpočet pouze rozpočítá procenta splátek.</p>
      </div>
    </div>
    <ol class="sched" data-reveal>
      ${F.schedule.map((s) => html`<li class="sched__i" style="--p:${s.pct}"><span class="sched__k">${s.key}</span><span class="sched__bar"><i></i></span><span class="sched__pct">${s.pct} %</span><b class="sched__amt" data-pct="${s.pct}"></b><span class="sched__w">${s.when}${s.note ? html`<small>${s.note}</small>` : ''}</span></li>`)}
    </ol>
  </div>
</section>
<section class="sec kz" id="kz">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">Klientské změny</p><h2 class="h1 shead__t">Úpravy podle vás</h2></div><p class="shead__p">${F.clientChanges.intro} ${F.clientChanges.note}</p></div>
    <div class="kz__grid">
      ${F.clientChanges.levels.map((l) => html`<div class="kz__c" data-reveal><span class="kz__k">${l.key}</span><p class="kz__p">${l.price}</p><p class="small muted">${l.examples}</p></div>`)}
    </div>
    <ul class="dlist dlist--row" style="margin-top:2rem">${F.clientChanges.pdfs.map((d) => html`<li><a href="${url(d.href)}" target="_blank" rel="noopener">${icon('doc')}<span><b>${d.label}</b><small>${d.valid}</small></span>${icon('download')}</a></li>`)}</ul>
  </div>
</section>
<section class="sec sec--tight sec--paper2">
  <div class="wrap">
    <div class="finmore">
      <div><h2 class="h3">Hypotéka a financování koupě</h2><p class="muted" style="margin-top:.5rem">IKO uvádí: „${F.iko}“.</p></div>
      <div class="finmore__gaps">${F.gaps.map((g) => html`<p>${gap('client', g)}</p>`)}</div>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- Developer */
export function Developer(p, c) {
  const D = c.developer;
  const full = p.variant === 'full';
  return html`<section class="sec dev${full ? ' dev--full' : ''}">
  <div class="wrap dev__grid">
    <div class="dev__brand" data-reveal>
      <div class="dev__mark">${raw('<svg viewBox="0 0 120.47 56.69" role="img" aria-label="IKO"><rect width="120.47" height="56.69" fill="#fff"/><path fill="#005FAA" d="M12.9,46.6h12.65V10.1h-12.65v36.5ZM35.9,10.1v36.5h12.25V10.1h-12.25ZM58.52,10.1l-10.37,18.25,10.37,18.25h13.2l-10.37-18.25,10.37-18.25h-13.2ZM92.07,9.18c-10.58,0-19.16,8.58-19.16,19.16s8.58,19.16,19.16,19.16,19.16-8.58,19.16-19.16-8.58-19.16-19.16-19.16ZM92.07,36.46c-4.47,0-8.11-3.64-8.11-8.11s3.64-8.11,8.11-8.11,8.11,3.64,8.11,8.11-3.64,8.11-8.11,8.11Z"/></svg>')}</div>
      <p class="dev__claim">${c.site.claim}</p>
      <div class="dev__tape tape" aria-hidden="true"></div>
    </div>
    <div class="dev__copy" data-reveal>
      <p class="eyebrow">${D.eyebrow}</p>
      <h2 class="h1 shead__t">${D.title}</h2>
      ${D.paragraphs.map((x) => html`<p style="margin-top:1rem">${text(x)}</p>`)}
      ${full ? html`<p style="margin-top:1rem">${text(D.history)}</p>` : ''}
      <dl class="dev__stats">${D.stats.map((s) => html`<div><dt>${s.value}</dt><dd>${s.label}${s.verify ? html` ${gap('verify')}` : ''}</dd></div>`)}</dl>
      ${full ? html`<h3 class="h4" style="margin-top:2rem">Výhody pro naše klienty</h3><ul class="ticks" style="margin-top:.75rem">${D.benefits.map((b) => html`<li>${b}</li>`)}</ul>` : ''}
      <div class="dev__cta">
        ${full ? '' : html`<a class="btn" href="${url('developer/')}">O developerovi ${icon('arrow', 'i--arrow')}</a>`}
        <a class="btn btn--line" href="${c.site.company.web}" target="_blank" rel="noopener">ikoplzen.cz ${icon('ext')}</a>
      </div>
    </div>
  </div>
  ${full ? html`<div class="wrap" style="margin-top:clamp(3rem,2rem + 3vw,5rem)">
    <h3 class="h3">${D.projectsTitle}</h3>
    <div class="projs">${c.site.otherProjects.map((pr) => html`<a class="projs__i" href="${pr.href}" target="_blank" rel="noopener">${raw('<svg class="projs__m" viewBox="0 0 120.47 56.69"><rect width="120.47" height="56.69" fill="#005FAA"/><path fill="#fff" d="M12.9,46.6h12.65V10.1h-12.65v36.5ZM35.9,10.1v36.5h12.25V10.1h-12.25ZM58.52,10.1l-10.37,18.25,10.37,18.25h13.2l-10.37-18.25,10.37-18.25h-13.2ZM92.07,9.18c-10.58,0-19.16,8.58-19.16,19.16s8.58,19.16,19.16,19.16,19.16-8.58,19.16-19.16-8.58-19.16-19.16-19.16ZM92.07,36.46c-4.47,0-8.11-3.64-8.11-8.11s3.64-8.11,8.11-8.11,8.11,3.64,8.11,8.11-3.64,8.11-8.11,8.11Z"/></svg>')}<b>${pr.name}</b>${icon('ext')}</a>`)}</div>
  </div>` : ''}
</section>`;
}

/* ---------------------------------------------------------------- News */
const NTYPE = { stavba: 'Z výstavby', video: 'Video', projekt: 'Projekt', clanek: 'Článek' };
const newsCard = (n) => html`<a class="ncard" href="${url(`aktuality/${n.slug}/`)}" data-reveal>
  <span class="ncard__img media ratio-32"><img src="${url(n.cover + (n.type === 'video' ? '.webp' : '-640.webp'))}" alt="" loading="lazy">${n.type === 'video' ? html`<span class="ncard__play">${icon('play')}</span>` : ''}</span>
  <span class="ncard__meta"><span class="ncard__type">${NTYPE[n.type]}</span><span>${n.dateLabel}</span></span>
  <b class="ncard__t">${n.title}</b>
  ${n.gallery ? html`<span class="small muted">${n.gallery.length} fotografií</span>` : ''}
</a>`;

export function NewsList(p, c) {
  const items = c.news.filter((n) => n.slug !== p.exclude).slice(0, p.limit || 99);
  return html`<section class="sec${p.paper ? ' sec--paper2' : ''} news">
  <div class="wrap">
    ${p.title ? html`<div class="shead"><div><p class="eyebrow">${p.eyebrow}</p><h2 class="h1 shead__t">${p.title}</h2></div>${p.limit ? html`<a class="tlink shead__a" href="${url('aktuality/')}">Všechny aktuality ${icon('arrow')}</a>` : ''}</div>` : ''}
    ${p.filters ? html`<div class="news__f" role="group" aria-label="Filtr aktualit">${[['vse', 'Vše'], ['stavba', 'Z výstavby'], ['video', 'Video'], ['clanek', 'Články']].map(([k, l], i) => html`<button type="button" class="chip" data-news-f="${k}" aria-pressed="${i === 0}">${l}</button>`)}</div>` : ''}
    <div class="news__grid" data-news>${items.map((n) => html`<div data-ntype="${n.type}">${newsCard(n)}</div>`)}</div>
    ${p.filters ? html`<div class="gap-box" style="margin-top:2rem" data-gap><b>Články a textové aktuality</b><span>${gap('client', 'Texty aktualit – současný web aktuality nemá')}</span><span class="small">Šablona podporuje perex, text, galerii a video. Doporučená frekvence: 1× měsíčně fotoreport ze stavby.</span></div>` : ''}
  </div>
</section>`;
}

export function NewsDetail(n, c) {
  return html`<article class="nd">
  <div class="wrap wrap--text">
    <ol class="crumbs"><li><a href="${url('')}">Úvod</a></li><li><a href="${url('aktuality/')}">Aktuality</a></li><li>${n.title}</li></ol>
    <p class="eyebrow">${NTYPE[n.type]} · ${n.dateLabel}</p>
    <h1 class="h-display nd__t">${n.title}</h1>
    ${n.perex ? html`<p class="lead" style="margin-top:1.25rem">${text(n.perex)}</p>${n._src_perex ? html`<p>${gap('verify', n._src_perex)}</p>` : ''}` : html`<p style="margin-top:1.25rem">${gap('client', 'Perex a text aktuality – na současném webu je jen fotoalbum bez textu')}</p>`}
  </div>
  ${n.video ? html`<div class="wrap" style="margin-top:2rem"><div class="media ratio-169 nd__video"><video controls playsinline preload="none" poster="${url(`media/video/${n.video}-poster.webp`)}"><source src="${url(`media/video/${n.video}-1080.mp4`)}" type="video/mp4"></video></div></div>` : ''}
  ${n.gallery ? html`<div class="wrap" style="margin-top:2rem"><div class="nd__gal">
    ${n.gallery.map((g) => html`<button type="button" class="nd__gi${g.portrait ? ' nd__gi--p' : ''}" data-lightbox="${url(g.src + '.webp')}" data-caption="${g.caption}" data-group="nd" data-photo><img src="${url(g.src + '-640.webp')}" alt="${g.caption}" loading="lazy"><span>${g.caption}</span></button>`)}
  </div></div>` : ''}
  <div class="wrap wrap--text nd__foot"><a class="tlink" href="${url('aktuality/')}">${icon('arrow-l')} Zpět na aktuality</a></div>
</article>`;
}

/* ---------------------------------------------------------------- Downloads */
export function Downloads(p, c) {
  const D = c.downloads;
  return html`<section class="sec">
  <div class="wrap dl__grid">
    ${D.groups.map((g) => html`<div class="dl__g" data-reveal>
      <h2 class="h4 dl__h">${g.title}</h2>
      <ul class="dlist">${D.items.filter((i) => i.group === g.id).map((i) => i.file
        ? html`<li><a href="${url(i.file)}" target="_blank" rel="noopener">${icon('doc')}<span><b>${i.title}</b>${i.valid ? html`<small>${i.valid}</small>` : ''}${i.verify ? html`<small>${gap('verify', i.verify)}</small>` : ''}</span>${icon('download')}</a></li>`
        : html`<li class="dlist__gap" data-gap><span class="dlist__x">${icon('doc')}<span><b>${i.title}</b><small>${gap('client', i.gap)}</small></span></span></li>`)}</ul>
    </div>`)}
  </div>
  <div class="wrap"><p class="small muted">Prodejní listy a technické půdorysy jednotlivých jednotek najdete v detailu každé jednotky v <a class="link" href="${url('nabidka/')}">nabídce</a>.</p></div>
</section>`;
}
