// Převod standardů z PDF přepisu (content/_sources/standards.extracted.json) do CMS struktury
// content/standards.json:  sada (typ výstavby) → kategorie → položka.
// Texty jsou doslovně z PDF „Standardy …“ klienta; fotky jsou výřezy z katalogů „Prezentace …“ (PDF klienta).
// Spuštění: node scripts/build-standards.mjs

import fs from 'node:fs';
const src = JSON.parse(fs.readFileSync(new URL('../content/_sources/standards.extracted.json', import.meta.url)));

const SETS = [
  { id: 'byty', label: 'Byty', sub: 'Bytové domy BD1 a BD2', pdf: 'docs/Standardy_BD1_BD2.pdf', catalog: 'docs/Prezentace_vybaveni_byty.pdf', img: 'bd' },
  { id: 'dvojdomy', label: 'Dvojdomy', sub: 'Rodinné dvojdomy 01–04', pdf: 'docs/Standardy_dvojdomy.pdf', catalog: 'docs/Prezentace_vybaveni_RD.pdf', img: 'rd' },
  { id: 'radove-domy', label: 'Řadové domy', sub: 'Řadové domy 05–10', pdf: 'docs/Standardy_radove_domy.pdf', catalog: 'docs/Prezentace_vybaveni_RD.pdf', img: 'rd' },
];

const CAT = {
  'KONSTRUKCE': ['konstrukce', 'Konstrukce a obálka domu'],
  'ÚPRAVA POVRCHŮ': ['povrchy', 'Podlahy, obklady a dlažby'],
  'VNITŘNÍ DVEŘE': ['dvere', 'Dveře a kování'],
  'ZDRAVOTNĚ TECHNICKÉ INSTALACE': ['zti', 'Rozvody vody a kanalizace'],
  'ZAŘIZOVACÍ PŘEDMĚTY': ['koupelna', 'Koupelna a WC'],
  'VZDUCHOTECHNIKA': ['vzduchotechnika', 'Větrání'],
  'ELEKTROINSTALACE - SILNOPROUD': ['elektro', 'Elektroinstalace'],
  'ELEKTROINSTALACE - SLABOPROUD': ['slaboproud', 'Slaboproud a data'],
  'VYTÁPĚNÍ': ['vytapeni', 'Vytápění'],
  'KUCHYNĚ': ['kuchyne', 'Příprava kuchyně'],
  'VENKOVNÍ ÚPRAVY': ['venkovni-upravy', 'Venkovní úpravy'],
  'POZNÁMKA (závěr dokumentu)': ['poznamka', 'Obecná ustanovení'],
};

// položka → výřez z katalogu (public/media/standards/{bd|rd}-{key}.webp)
const IMG = {
  'Laminátová podlaha': 'podlahy', 'Dlažby': 'dlazby', 'Obklady': 'obklady',
  'Vnitřní dveře': 'dvere', 'Dveřní kování': 'kovani', 'Vstupní bytové dveře': 'vchodove-dvere',
  'Umyvadlo': 'umyvadla', 'Umývátko': 'umyvadla',
  'Umyvadlová baterie': 'baterie', 'Sprchová baterie': 'baterie', 'Vanová baterie': 'baterie', 'Umyvadlová baterie (umývátko)': 'baterie',
  'Sprchový set': 'sety', 'Vanový set': 'sety', 'Vana': 'vana',
  'Sprchový kout': 'sprchovy-kout', 'Sprchová vanička': 'sprchovy-kout-ctvrtkruh',
  'WC mísa': 'wc', 'WC sedátko': 'wc', 'WC tlačítko': 'wc-tlacitko', 'Otopné těleso v koupelně': 'radiator',
};
// klíčové položky pro rychlý přehled (vybráno z textu standardů, nic nepřidáno)
const KEY = new Set(['Výplně otvorů', 'Laminátová podlaha', 'Obklady', 'Dlažby', 'Vnitřní dveře', 'Sprchový kout', 'Vana', 'WC mísa', 'Zdroj vytápění', 'Podlahové vytápění', 'Společná kotelna', 'Střecha', 'Výtah']);

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function parseManufacturer(m, title) {
  if (!m || m === 'neuveden') return { manufacturer: null, product: null };
  if (/dle prezentace|dle Prezentace/.test(m)) {
    // údaj doplněný auditorem z katalogu – ponecháme, ale označíme zdroj
    return { manufacturer: m.replace(/\s*\(dle.*$/, ''), product: null, sourceNote: 'Údaj z katalogu (prezentace), v textu standardu neuveden' };
  }
  const mm = m.match(/^(.+?)\s*\((.+)\)$/);
  if (/typ; výrobce neuveden/.test(m)) return { manufacturer: null, product: m.replace(/\s*\(.+$/, ''), sourceNote: 'Výrobce v podkladu neuveden' };
  return mm ? { manufacturer: mm[1], product: mm[2] } : { manufacturer: m, product: null };
}

const out = { _meta: { note: 'Texty doslovně ze standardů klienta (PDF). Fotky = výřezy z katalogů standardů (PDF). Struktura odpovídá CMS: Sada standardů → Kategorie → Položka.', source: 'rezidenceslovanskeudoli.cz/standardy (PDF), stav 5. 10. 2026' }, sets: [] };

src.standards.forEach((doc, i) => {
  const def = SETS[i];
  const set = { ...def, title: doc.heading, appliesTo: doc.appliesTo, validFrom: doc.validFrom, categories: [] };
  delete set.img;
  for (const c of doc.categories) {
    const [cid, ctitle] = CAT[c.category] || [slug(c.category), c.category];
    const cat = { id: cid, title: ctitle, sourceTitle: c.category, notes: [], items: [] };
    for (const it of c.items) {
      const lines = String(it.text || '').split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
      if (it.title === 'Poznámka') { cat.notes.push(lines.join(' ')); continue; }
      const mf = parseManufacturer(it.manufacturer, it.title);
      const imgKey = IMG[it.title];
      cat.items.push({
        id: slug(it.title), title: it.title, ...mf, lines,
        image: imgKey ? `media/standards/${def.img}-${imgKey}.webp` : null,
        imageNote: imgKey ? `Katalog standardů (${def.catalog.split('/').pop()})` : null,
        key: KEY.has(it.title),
      });
    }
    set.categories.push(cat);
  }
  out.sets.push(set);
});

fs.writeFileSync(new URL('../content/standards.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(out.sets.map((s) => `${s.id}: ${s.categories.length} kategorií, ${s.categories.reduce((a, c) => a + c.items.length, 0)} položek, ${s.categories.reduce((a, c) => a + c.items.filter((x) => x.image).length, 0)} s fotkou`).join('\n'));
