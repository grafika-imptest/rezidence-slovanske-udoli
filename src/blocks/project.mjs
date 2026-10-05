// CMS bloky: Typology, VideoBanner, Timeline, TypologyDetail, TechFacts, Energy, RichText
import { html, url, icon, viz, text, czk, m2, gap, num } from '../lib/util.mjs';
import { TYPE } from '../lib/content.mjs';

const range = (s) => `${num(s.areaMin)}–${num(s.areaMax)} m²`;

/** Typology – tři typy výstavby s živými daty (volné, od ceny, plochy, dispozice). */
export function Typology(p, c) {
  return html`<section class="sec typo" id="typologie">
  <div class="wrap">
    <div class="shead">
      <div><p class="eyebrow">${p.eyebrow}</p><h2 class="h1 shead__t">${p.title}</h2></div>
      <a class="tlink shead__a" href="${url('nabidka/')}">Celá nabídka ${icon('arrow')}</a>
      ${p.lead ? html`<p class="shead__p">${text(p.lead)}</p>` : ''}
    </div>
    <div class="typo__grid">
      ${c.project.typologies.map((t, i) => {
        const s = c.stats[t.id];
        return html`<a class="tcard" href="${url(t.href)}" data-reveal style="--d:${i}">
          <div class="tcard__img">${viz(t.image, t.imageAlt, { sizes: '(min-width: 900px) 33vw, 100vw' })}</div>
          <div class="tcard__body">
            <div class="tcard__top"><h3 class="h2">${t.title}</h3><span class="tcard__free"><b>${s.free}</b> volných z ${s.total}</span></div>
            <dl class="kv">
              <div><dt>Dispozice</dt><dd>${s.layouts.join(' · ')}</dd></div>
              <div><dt>${t.id === 'byt' ? 'Podlahová plocha' : 'Obytná plocha'}</dt><dd>${s.areaMin === s.areaMax ? num(s.areaMin) + ' m²' : range(s)}</dd></div>
              <div><dt>Cena od</dt><dd>${s.priceFrom ? czk(s.priceFrom) : '—'}</dd></div>
            </dl>
            <ul class="ticks">${t.bullets.slice(0, 4).map((b) => html`<li>${b}</li>`)}</ul>
            <span class="tlink">Vybrat ${t.title.toLowerCase()} ${icon('arrow')}</span>
          </div>
        </a>`;
      })}
    </div>
  </div>
</section>`;
}

/** VideoBanner – fullscreen video ve smyčce, s titulkem; pauza respektuje prefers-reduced-motion. */
export function VideoBanner(p) {
  return html`<section class="vband" data-vband>
  <video class="vband__video" muted loop playsinline preload="none" poster="${url(`media/video/${p.video}-poster.webp`)}" data-lazy-video>
    <source src="${url(`media/video/${p.video}-1080.mp4`)}" type="video/mp4" media="(min-width: 800px)">
    <source src="${url(`media/video/${p.video}-540.mp4`)}" type="video/mp4">
  </video>
  <div class="vband__scrim"></div>
  <div class="wrap vband__in">
    <p class="eyebrow on-dark">${p.eyebrow}</p>
    <h2 class="h-display vband__title">${p.title}</h2>
    ${p.text ? html`<p class="lead vband__text">${text(p.text)}</p>` : ''}
    ${p.cta ? html`<a class="btn btn--white" href="${url(p.cta.href)}">${p.cta.label} ${icon('arrow', 'i--arrow')}</a>` : ''}
  </div>
  <span class="media__tag">Vizualizace · video</span>
  <button class="vband__toggle" type="button" aria-label="Přehrát / pozastavit video" data-vband-toggle>${icon('pause')}</button>
</section>`;
}

/** Timeline – stav projektu / termíny. */
export function Timeline(p, c) {
  const items = c.project.timeline;
  return html`<section class="sec sec--paper2 tline" id="harmonogram">
  <div class="wrap tline__grid">
    <div>
      <p class="eyebrow">${p.eyebrow}</p>
      <h2 class="h1 shead__t">${p.title}</h2>
      <p class="muted" style="margin-top:1rem;max-width:42ch">Termíny dle současného webu projektu. Podrobný harmonogram výstavby zatím není k dispozici. ${gap('client', 'Harmonogram (PDF „Termíny výstavby“ je placeholder)')}</p>
      ${p.newsLink ? html`<a class="tlink" style="margin-top:1.5rem" href="${url('aktuality/')}">Fotografie ze stavby ${icon('arrow')}</a>` : ''}
    </div>
    <ol class="tline__list">
      ${items.map((t, i) => html`<li class="tline__item${i === 0 ? ' is-done' : ''}" data-reveal>
        <span class="tline__dot"></span>
        <span class="tline__v">${t.value}</span>
        <span class="tline__l">${t.label}${t.verify ? html` ${gap('verify', t.note || '')}` : ''}</span>
      </li>`)}
    </ol>
  </div>
</section>`;
}

/** TypologyDetail – detail typu výstavby na stránce Projekt (text, výhody, co obsahuje cena). */
export function TypologyDetail(p, c) {
  return html`${c.project.typologies.map((t, i) => {
    const s = c.stats[t.id];
    return html`<section class="sec tdet${i % 2 ? ' tdet--alt' : ''}" id="${t.id}">
      <div class="wrap tdet__grid">
        <div class="tdet__media" data-reveal>
          ${t.video ? html`<div class="media ratio-43 tdet__video"><video muted loop playsinline preload="none" poster="${url(`media/video/${t.video}-poster.webp`)}" data-lazy-video data-autoplay-visible><source src="${url(`media/video/${t.video}-1080.mp4`)}" type="video/mp4" media="(min-width: 800px)"><source src="${url(`media/video/${t.video}-540.mp4`)}" type="video/mp4"></video><span class="media__tag">Vizualizace · video</span></div>`
            : viz(t.image, t.imageAlt, { cls: 'ratio-43', sizes: '(min-width: 900px) 50vw, 100vw' })}
          ${t.imageVerify && !t.video ? html`<p class="tdet__cap">${gap('verify', t.imageVerify)}</p>` : ''}
        </div>
        <div class="tdet__body" data-reveal>
          <p class="eyebrow">${String(i + 1).padStart(2, '0')} · ${TYPE[t.id].many}</p>
          <h2 class="h1 shead__t">${t.title}</h2>
          <div class="tdet__stats">
            <div><b>${s.total}</b><span>celkem</span></div>
            <div><b>${s.free}</b><span>volných</span></div>
            <div><b>${s.layouts.join(', ')}</b><span>dispozice</span></div>
          </div>
          <div class="prose">${t.description.map((d) => html`<p>${text(d)}</p>`)}</div>
          <ul class="ticks ticks--2">${t.bullets.map((b) => html`<li>${b}</li>`)}</ul>
          <details class="acc">
            <summary>Co obsahuje kupní cena ${icon('chev')}</summary>
            <div class="prose small"><ul>${t.priceIncludes.map((x) => html`<li>${x}</li>`)}</ul><p class="muted">${t.priceNote}</p></div>
          </details>
          ${t.verify.length ? html`<details class="acc acc--verify"><summary>Nejasnosti v podkladech (${t.verify.length}) ${icon('chev')}</summary><ul class="prose small">${t.verify.map((v) => html`<li>${gap('verify')} ${v}</li>`)}</ul></details>` : ''}
          <a class="btn" href="${url(t.href)}">Zobrazit ${t.title.toLowerCase()} v nabídce ${icon('arrow', 'i--arrow')}</a>
        </div>
      </div>
    </section>`;
  })}`;
}

/** TechFacts – technické parametry + energetické průkazy. */
export function TechFacts(p, c) {
  return html`<section class="sec sec--paper2" id="technika">
  <div class="wrap">
    <div class="shead"><div><p class="eyebrow">${p.eyebrow}</p><h2 class="h1 shead__t">${p.title}</h2></div>
      <a class="tlink shead__a" href="${url('standardy/')}">Všechny standardy ${icon('arrow')}</a></div>
    <div class="tech">
      <dl class="tech__list">
        ${c.project.technical.map((t) => html`<div class="tech__row" data-reveal><dt>${t.label}</dt><dd>${t.value}<small>${t.src}</small></dd></div>`)}
      </dl>
      <div class="energy" data-reveal>
        <h3 class="h4">Průkaz energetické náročnosti</h3>
        <ul>
          ${c.project.energy.map((e) => html`<li><span class="energy__cls">${e.class}</span><span><b>${e.object}</b><br><small class="muted">${e.value}</small>${e.verify ? html`<br>${gap('verify', e.verify)}` : ''}</span><a class="energy__pdf" href="${url(e.pdf)}" target="_blank" rel="noopener" aria-label="PENB ${e.object} (PDF)">${icon('doc')} PDF</a></li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

/** Architecture – koncept; zobrazuje jen dostupné údaje, zbytek jako chybějící podklad. */
export function Architecture(p, c) {
  const a = c.project.architecture;
  return html`<section class="sec arch">
  <div class="wrap arch__grid">
    <div data-reveal>
      <p class="eyebrow">${p.eyebrow}</p>
      <h2 class="h1 shead__t">${p.title}</h2>
      <div class="prose" style="margin-top:1.25rem">
        <p class="lead">${text(c.project.intro.split('. ').slice(2, 4).join('. ') + '.')}</p>
        <p>${text(a.text)}</p>
        <p>${gap('missing', 'Architekt / ateliér a popis konceptu')} </p>
      </div>
    </div>
    <div class="arch__imgs" data-reveal>
      ${viz('su-0017', 'Letecký pohled od jihu s údolím Vejprnického potoka', { cls: 'ratio-43', sizes: '(min-width: 900px) 30vw, 50vw' })}
      ${viz('su-0021', 'Pěší cesta s výhledem na areál', { cls: 'ratio-34', sizes: '(min-width: 900px) 20vw, 50vw' })}
    </div>
  </div>
</section>`;
}
