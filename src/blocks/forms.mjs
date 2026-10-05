// CMS bloky: CTA, ContactForm, Favorites, Compare, PrototypeInfo
import { html, raw, url, icon, viz, text, gap } from '../lib/util.mjs';

export function CTA(p, c) {
  return html`<section class="cta">
  <div class="cta__media">${viz(p.image || 'su-0028', p.imageAlt || 'Předzahrádka bytu v přízemí', { sizes: '50vw' })}</div>
  <div class="cta__panel">
    <p class="eyebrow on-dark">${p.eyebrow}</p>
    <h2 class="h-display cta__t">${p.title}</h2>
    <p class="lead" style="color:#fff;margin-top:1rem">${text(p.text)}</p>
    <div class="cta__acts">
      <a class="btn btn--white btn--lg" href="${url(p.href || 'kontakt/')}">${p.button || 'Domluvit schůzku'} ${icon('arrow', 'i--arrow')}</a>
      <a class="cta__tel" href="tel:${c.site.sales.phoneHref}">${icon('phone')} ${c.site.sales.phone}</a>
    </div>
  </div>
</section>`;
}

/** ContactForm – poptávka. V prototypu bez backendu (odeslání se simuluje). V CMS: formulář → CRM / e-mail. */
export function ContactForm(p, c, unit = null) {
  const s = c.site;
  return html`<section class="sec contact${p.paper ? ' sec--paper2' : ''}" id="poptavka">
  <div class="wrap contact__grid">
    <div class="contact__info">
      <p class="eyebrow">${p.eyebrow || 'Poptávka'}</p>
      <h2 class="h1 shead__t">${unit ? html`Zájem o ${unit.label.toLowerCase().replace('č.', 'č.')} ${unit.type === 'byt' ? unit.building : ''}` : p.title}</h2>
      <p style="margin-top:1rem">${text(p.text || 'Napište nám, o jakou jednotku máte zájem. Odpovíme a domluvíme prohlídku podkladů nebo osobní schůzku.')}</p>
      <div class="contact__cards">
        <a class="ccard" href="tel:${s.sales.phoneHref}">${icon('phone')}<span><small>Prodej</small><b>${s.sales.phone}</b></span></a>
        <a class="ccard" href="mailto:${s.sales.email}">${icon('mail')}<span><small>E-mail</small><b>${s.sales.email}</b></span></a>
        <div class="ccard">${icon('pin')}<span><small>Sídlo společnosti</small><b>${s.company.name}</b>${s.company.address}</span></div>
      </div>
      <div class="contact__person" data-gap>${gap('missing', 'Jméno, foto a přímý kontakt obchodníka · prodejní místo · otevírací doba')}</div>
    </div>
    <form class="form form-card" data-form novalidate>
      <div class="form__body">
        ${unit ? html`<div class="form__unit"><img src="${url(unit.media.plan)}" alt=""><span><small>Poptávaná jednotka</small><b>${unit.label} · ${unit.layout}</b>${unit.type === 'byt' ? `${unit.building} · ${unit.floor}` : ''}</span><input type="hidden" name="jednotka" value="${unit.code}"></div>` : html`<div class="field">
          <label for="f-int">Mám zájem o</label>
          <select id="f-int" class="ctrl" name="zajem" data-prefill-unit>
            <option value="">Vyberte typ (nepovinné)</option><option>Byt</option><option>Řadový dům</option><option>Dvojdům</option><option>Obecný dotaz</option>
          </select>
        </div>`}
        <div class="form__row">
          <div class="field"><label for="f-name">Jméno a příjmení *</label><input id="f-name" class="ctrl" name="jmeno" autocomplete="name" required maxlength="100"><span class="field__err">Vyplňte jméno.</span></div>
          <div class="field"><label for="f-phone">Telefon</label><input id="f-phone" class="ctrl" name="telefon" type="tel" autocomplete="tel" inputmode="tel"></div>
        </div>
        <div class="field"><label for="f-mail">E-mail *</label><input id="f-mail" class="ctrl" name="email" type="email" autocomplete="email" required maxlength="60"><span class="field__err">Zadejte platný e-mail.</span></div>
        <div class="field"><label for="f-msg">Zpráva *</label><textarea id="f-msg" class="ctrl" name="zprava" required>${unit ? `Dobrý den, mám zájem o ${unit.label} (${unit.code}, ${unit.layout}). Prosím o kontakt.` : ''}</textarea><span class="field__err">Napište nám zprávu.</span></div>
        <div class="field" data-fav-attach hidden><label class="check"><input type="checkbox" name="oblibene" checked> <span>Přiložit mé oblíbené jednotky: <b data-fav-list></b></span></label></div>
        <label class="check field" data-gdpr><input type="checkbox" name="gdpr" required> <span>Beru na vědomí <a class="link" href="${s.company.gdpr}" target="_blank" rel="noopener">zásady zpracování osobních údajů</a>. *</span></label>
        <p class="small muted">Uvedené osobní údaje budeme zpracovávat pouze pro účely zpracování a vyřízení zasílaného podnětu, a pro zaslání odpovědi či jiné zpětné reakce.</p>
        <button class="btn btn--lg btn--block" type="submit">Odeslat poptávku ${icon('arrow', 'i--arrow')}</button>
        <p class="small muted">${gap('verify', 'Prototyp: formulář se neodesílá. V produkci napojení na CRM/e-mail + antispam (místo obrázkové CAPTCHA doporučujeme neviditelnou ochranu).')}</p>
      </div>
      <div class="form__ok" role="status">${icon('check')} Děkujeme, poptávka je připravena k odeslání. <span class="small" style="display:block;font-weight:400;margin-top:.4rem">V prototypu se data nikam neodesílají.</span></div>
    </form>
  </div>
</section>`;
}

export function Favorites(p, c) {
  return html`<section class="sec favs" data-favs-page>
  <div class="wrap">
    <div class="favs__empty" data-favs-empty>
      <p class="h3">Zatím nemáte žádné oblíbené jednotky.</p>
      <p class="muted" style="margin-top:.5rem">Jednotku uložíte ikonou ${icon('heart')} v nabídce nebo v detailu. Oblíbené se ukládají jen ve vašem prohlížeči.</p>
      <a class="btn" style="margin-top:1.5rem" href="${url('nabidka/')}">Přejít do nabídky ${icon('arrow', 'i--arrow')}</a>
    </div>
    <div data-favs-list hidden>
      <div class="sel__head"><p class="sel__count"><b data-favs-n></b> uložených jednotek</p>
        <div class="sel__tools"><button class="btn btn--ink btn--sm" type="button" data-favs-cmp>${icon('compare')} Porovnat vše</button><button class="btn btn--ink btn--sm" type="button" data-favs-share>${icon('share')} Sdílet seznam</button><a class="btn btn--sm" href="${url('kontakt/?oblibene=1')}">Poptat vybrané ${icon('arrow', 'i--arrow')}</a></div></div>
      <div class="ulist" data-favs-rows></div>
    </div>
  </div>
</section>`;
}

export function Compare(p, c) {
  return html`<section class="sec cmp" data-cmp-page>
  <div class="wrap">
    <div class="favs__empty" data-cmp-empty>
      <p class="h3">K porovnání zatím nic není.</p>
      <p class="muted" style="margin-top:.5rem">Přidejte 2–4 jednotky ikonou ${icon('compare')} v nabídce. Porovnání funguje napříč byty i domy.</p>
      <a class="btn" style="margin-top:1.5rem" href="${url('nabidka/')}">Přejít do nabídky ${icon('arrow', 'i--arrow')}</a>
    </div>
    <div data-cmp-wrap hidden>
      <div class="sel__head"><p class="sel__count"><b data-cmp-n></b> jednotky v porovnání <span class="muted small">(max. 4)</span></p>
        <div class="sel__tools"><label class="switch"><input type="checkbox" data-cmp-diff> <span>Zvýraznit rozdíly</span></label><button class="btn btn--ink btn--sm" type="button" data-cmp-clear>Vymazat</button></div></div>
      <div class="cmpt" data-cmp-table tabindex="0" aria-label="Tabulka porovnání – lze posouvat do stran"></div>
    </div>
  </div>
</section>`;
}

export function PrototypeInfo(p, c) {
  const blocks = [
    ['HeroVideo', 'Úvodní video (desktop 16:9 / mobil 9:16) + živá dostupnost', 'Homepage'],
    ['PageHero', 'Úvod podstránky – titul, perex, volitelně vizualizace', 'Podstránky'],
    ['Intro', 'Představení projektu – statement, text, obrázek', 'Homepage'],
    ['ProjectFacts', 'Čísla projektu + živý počet volných jednotek', 'Homepage, Projekt'],
    ['Typology', 'Typy výstavby s daty z nabídky', 'Homepage'],
    ['TypologyDetail', 'Detail typu výstavby (text, výhody, cena zahrnuje)', 'Projekt'],
    ['SelectorTeaser', 'Mini situace + dostupnost po objektech', 'Homepage'],
    ['UnitSelector', 'Situace → dům → podlaží → jednotka, filtry, seznam', 'Nabídka'],
    ['SitePlan / FloorPlan', 'SVG situace a půdorysy s polygony jednotek', 'Nabídka, Detail'],
    ['UnitRow (UnitCard)', 'Karta jednotky – řádek (desktop) / karta (mobil)', 'Nabídka, Oblíbené'],
    ['UnitDetail', 'Šablona detailu jednotky', '75 detailů'],
    ['VideoBanner', 'Fullscreen video ve smyčce', 'Homepage, Projekt'],
    ['Gallery', 'Mozaika vizualizací + lightbox + filtr', 'Homepage, Projekt'],
    ['StandardsTeaser / StandardsExplorer', 'Sada → kategorie → položka (foto, výrobce, popis)', 'Homepage, Standardy'],
    ['LocationTeaser / LocationFull', 'Lokalita, mapy, občanská vybavenost', 'Homepage, Lokalita'],
    ['FinancingSteps', 'Postup koupě, splátkový kalendář, klientské změny', 'Financování'],
    ['Timeline', 'Termíny výstavby', 'Homepage, Projekt'],
    ['Developer', 'Prezentace IKO (kompaktní / plná)', 'Homepage, Developer'],
    ['NewsList / NewsDetail', 'Aktuality – foto, video, článek', 'Homepage, Aktuality'],
    ['Downloads', 'Dokumenty po skupinách', 'Ke stažení'],
    ['CTA', 'Výzva k akci s vizualizací', 'Více stránek'],
    ['ContactForm', 'Poptávka (obecná / s předvyplněnou jednotkou)', 'Kontakt, Detail'],
    ['Favorites / Compare', 'Oblíbené a porovnání (localStorage)', 'Oblíbené, Porovnání'],
  ];
  return html`<section class="sec">
  <div class="wrap proto">
    <div class="prose">
      <p class="lead">Funkční prototyp nového webu Rezidence Slovanské údolí. Obsah a data pocházejí z podkladů klienta, současného webu projektu a centrálního webu IKO. Nic není vymyšlené – co chybí nebo je nejasné, je na stránkách viditelně označené.</p>
      <h2>Legenda značek</h2>
      <p>${gap('verify', 'údaj se v podkladech liší nebo je jen v jednom zdroji')}</p>
      <p>${gap('missing', 'podklad neexistuje')} ${gap('client', 'klient musí dodat')}</p>
      <p><label class="switch"><input type="checkbox" data-toggle-gaps> <span>Skrýt značky v celém webu (pro prezentaci klientovi)</span></label></p>
      <h2>Data jednotek</h2>
      <p>Plochy a místnosti z prodejních listů PDF (BD1 6. 6. 2025, BD2 18. 6. 2025, dvojdomy 27. 11. 2025, řadové domy 24. 7. 2026). Ceny a stavy ze současného webu k 5. 10. 2026. Polygony jednotek v půdorysech generovány z barevných půdorysů pater klienta. Úplný přehled rozdílů mezi zdroji je v <code>CONTENT-DATA-GAP-REPORT.md</code>.</p>
      <h2>CMS bloky</h2>
    </div>
    <table class="ptable-t">
      <thead><tr><th>Blok</th><th>Účel</th><th>Použití</th></tr></thead>
      <tbody>${blocks.map(([a, b, d]) => html`<tr><td><code>${a}</code></td><td>${b}</td><td>${d}</td></tr>`)}</tbody>
    </table>
  </div>
</section>`;
}
