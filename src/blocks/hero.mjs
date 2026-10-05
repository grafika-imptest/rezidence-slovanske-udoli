// CMS bloky: HeroVideo (homepage), PageHero (podstránky), Intro, ProjectFacts
import { html, url, icon, viz, text, czk, gap } from '../lib/util.mjs';
import { TYPE } from '../lib/content.mjs';

/** HeroVideo – fullbleed video (desktop 16:9 / mobil 9:16), titul, CTA, živá dostupnost. */
export function HeroVideo(p, c) {
  const s = c.stats;
  return html`<section class="hero" data-hero>
  <div class="hero__media">
    <video class="hero__video" autoplay muted loop playsinline preload="metadata"
      poster="${url('media/video/su-hero-desktop-poster.webp')}" data-mobile-src="${url('media/video/su-hero-mobile.mp4')}" data-mobile-poster="${url('media/video/su-hero-mobile-poster.webp')}">
      <source src="${url('media/video/su-hero-mobile.mp4')}" type="video/mp4" media="(max-width: 760px) and (orientation: portrait)">
      <source src="${url('media/video/su-hero-desktop.mp4')}" type="video/mp4">
    </video>
    <span class="media__tag">Vizualizace</span>
  </div>
  <div class="hero__scrim"></div>
  <div class="wrap hero__in">
    <div class="hero__copy">
      <p class="eyebrow on-dark">${p.eyebrow}</p>
      <h1 class="h-hero hero__title">${p.title}</h1>
      <p class="lead hero__lead">${text(p.lead)}</p>
      <div class="hero__cta">
        <a class="btn btn--white btn--lg" href="${url('nabidka/')}">Vybrat jednotku ${icon('arrow', 'i--arrow')}</a>
        <a class="btn btn--ghost btn--lg" href="${url('projekt/')}">O projektu</a>
      </div>
    </div>
  </div>
  <div class="hero__bar">
    <div class="wrap hero__bar-in">
      ${['byt', 'radovy-dum', 'dvojdum'].map((t) => html`<a class="hero__stat" href="${url('nabidka/?typ=' + t)}">
        <span class="hero__stat-n">${s[t].free}<small>/${s[t].total}</small></span>
        <span class="hero__stat-l"><b>${TYPE[t].many}</b> volné<span class="hero__lay"> · ${s[t].layouts.join(', ')}</span></span>
      </a>`)}
      <button class="hero__pause" type="button" aria-label="Pozastavit video" data-video-toggle>${icon('pause')}</button>
    </div>
  </div>
</section>`;
}

/** PageHero – úvod podstránky: titul + perex + volitelně obrázek / video. */
export function PageHero(p) {
  return html`<section class="phero${p.image ? ' phero--img' : ''}">
  ${p.image ? html`<div class="phero__media">${viz(p.image, p.imageAlt || '', { eager: true })}</div>` : ''}
  <div class="wrap phero__in">
    ${p.crumbs ? html`<ol class="crumbs">${p.crumbs.map((cr) => html`<li>${cr.href ? html`<a href="${url(cr.href)}">${cr.label}</a>` : cr.label}</li>`)}</ol>` : ''}
    <p class="eyebrow${p.image ? ' on-dark' : ''}">${p.eyebrow}</p>
    <h1 class="h-display phero__title">${p.title}</h1>
    ${p.lead ? html`<p class="lead phero__lead">${text(p.lead)}</p>` : ''}
  </div>
</section>`;
}

/** Intro – velké statement + text projektu + obrázek. */
export function Intro(p, c) {
  return html`<section class="sec intro">
  <div class="wrap intro__grid">
    <div class="intro__head" data-reveal>
      <p class="eyebrow">${p.eyebrow}</p>
      <h2 class="h-display intro__title">${p.title}</h2>
    </div>
    <div class="intro__body" data-reveal>
      <p class="lead">${text(c.project.introShort)}</p>
      <p>${text(c.project.intro)}</p>
      <a class="tlink" href="${url('projekt/')}">Více o projektu ${icon('arrow')}</a>
    </div>
    <div class="intro__img" data-reveal>${viz(p.image || 'su-0003', p.imageAlt || 'Bytové domy podél obslužné komunikace', { sizes: '(min-width: 900px) 40vw, 100vw' })}</div>
  </div>
</section>`;
}

/** ProjectFacts – čísla projektu (statická z obsahu) + živé počty volných jednotek. */
export function ProjectFacts(p, c) {
  const s = c.stats;
  const facts = c.project.facts;
  return html`<section class="facts${p.dark ? ' facts--dark' : ''}">
  <div class="wrap facts__grid">
    ${facts.map((f) => html`<div class="fact" data-reveal><span class="fact__n">${f.value}</span><span class="fact__l">${f.label}</span></div>`)}
    <div class="fact fact--live" data-reveal><span class="fact__n">${s.all.free}</span><span class="fact__l">volných jednotek k ${c.unitsMeta.generated.split('-').reverse().join('. ')}</span></div>
    <div class="fact" data-reveal><span class="fact__n fact__n--sm">12/2028</span><span class="fact__l">plánované dokončení bytových domů (cca)</span></div>
  </div>
</section>`;
}
