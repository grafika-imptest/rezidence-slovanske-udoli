// Sloučení dat jednotek ze tří klientských zdrojů do content/units.json.
//
//  1. Prodejní listy PDF (content/_sources/sale-sheets.extracted.json)  – plochy, místnosti, sklep, stání
//  2. Současný web rezidenceslovanskeudoli.cz (current-web-units.json)  – cena, stav, cena stání, dispozice
//  3. Tabulky klienta XLS/XLSX (client-xls.json)                         – vchod, orientace, pozemky
//
// Pravidlo priority: plochy a místnosti = prodejní list (nejnovější dokument s datem),
// obchodní data (cena, stav) = současný web. Každý rozdíl mezi zdroji se zapíše do
// content/_sources/units-discrepancies.json a promítne do unit.verify[] (zobrazí se jako K OVĚŘENÍ).
//
// Spuštění: node scripts/build-units.mjs

import fs from 'node:fs';
const src = (f) => JSON.parse(fs.readFileSync(new URL(`../content/_sources/${f}`, import.meta.url)));

const sheets = src('sale-sheets.extracted.json');
const web = src('current-web-units.json').units;
const xls = src('client-xls.json');
const files = src('unit-files.json');

const pad = (n) => String(n).padStart(2, '0');
const num = (s) => { const m = String(s ?? '').replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : null; };
const normFloor = (f) => (f || '').replace(/\s|\./g, '').replace(/^(\d)(NP|PP)$/, '$1.$2'); // "1.P.P." -> "1.PP"
const FLOOR_ORDER = { '2.PP': -2, '1.PP': -1, '1.NP': 1, '2.NP': 2, '3.NP': 3 };
const discrepancies = [];

const webById = Object.fromEntries(web.map((w) => [w.id.replace('ŘRD', 'RRD'), w]));

function houseFromPairs(pairs) {
  // pairs jsou [label, value] z pravého sloupce prodejního listu domu; hodnota bývá vlepená do labelu
  const rows = pairs.map(([l, v]) => (l + ' ' + v).replace(/²/g, '').replace(/\s+/g, ' ').trim());
  const val = (re) => { const r = rows.find((x) => re.test(x)); return r ? num(r.replace(re, '')) : null; };
  const out = {
    living: val(/^OBYTNÁ PLOCHA CELKEM/), garage: val(/^GARÁŽ/), loggia: val(/^LODŽIE( 1\. NP)?/),
    terrace: val(/^TERASA( 1\. PP)?/), porch: val(/^ZÁVĚTŘÍ/), plot: val(/^m? ?PLOCHA POZEMKU:?/),
    livingNP: val(/^OBYTNÁ PLOCHA 1\.NP CELKEM/), livingPP: val(/^OBYTNÁ PLOCHA 1\.PP CELKEM/), rooms: [],
  };
  let level = null;
  for (const r of rows) {
    if (/^1\. ?NP Plocha/.test(r)) { level = '1.NP'; continue; }
    if (/^1\. ?PP Plocha/.test(r)) { level = '1.PP'; continue; }
    if (/^OBYTNÁ PLOCHA 1\.(NP|PP)/.test(r) || /^LEGENDA/.test(r)) { level = r.startsWith('LEGENDA') ? null : level; continue; }
    if (!level) continue;
    const m = r.match(/^([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9 +.]+?)\s+(\d+(?:,\d+)?)\s*m/);
    if (m) out.rooms.push({ name: m[1].trim(), area: num(m[2]), level });
  }
  return out;
}

const units = [];
for (const s of sheets) {
  const isFlat = s.building.startsWith('BD');
  const bkey = s.building === 'ŘRD' ? 'RRD' : s.building;
  const id = `${bkey}-${pad(s.number)}`;
  const w = webById[id];
  const x = xls[id] || {};
  const verify = [];
  const diff = (field, a, aSrc, b, bSrc, tol = 0.15) => {
    if (a == null || b == null) return;
    const same = typeof a === 'number' ? Math.abs(a - b) < tol : String(a).toLowerCase() === String(b).toLowerCase();
    if (!same) { discrepancies.push({ id, field, [aSrc]: a, [bSrc]: b }); verify.push(`${field}: ${aSrc} ${a} × ${bSrc} ${b}`); }
  };

  const u = {
    id, type: isFlat ? 'byt' : s.building === 'ŘRD' ? 'radovy-dum' : 'dvojdum',
    building: s.building, number: s.number,
    slug: isFlat ? `byt-${bkey.toLowerCase()}-${pad(s.number)}` : `${s.building === 'ŘRD' ? 'radovy-dum' : 'dvojdum'}-${pad(s.number)}`,
    label: isFlat ? `Byt č. ${s.number}` : s.building === 'ŘRD' ? `Řadový dům č. ${pad(s.number)}` : `Dvojdům č. ${pad(s.number)}`,
    code: isFlat ? `${s.building}-${pad(s.number)}` : `${s.building}-${pad(s.number)}`,
    status: w?.status ?? null,              // volne | rezervovano | prodano
    price: w?.price_czk_incl_vat ?? null,   // Kč s DPH (current web)
    parkingPrice: w?.parking_price_czk_incl_vat ?? null,
    verify,
    sources: { sheet: s.source, web: w ? 'rezidenceslovanskeudoli.cz (5. 10. 2026)' : null },
  };

  if (isFlat) {
    u.layout = s.layout;                     // dle prodejního listu (1,5+kk u BD1-08 / BD2-05)
    u.floor = normFloor(s.floor);
    u.floorOrder = FLOOR_ORDER[u.floor];
    u.entrance = x.entrance || null;         // vchod/blok A–E dle XLS
    u.orientation = x.orientation || null;   // světová strana dle XLS
    u.areas = { floor: s.floorArea, living: s.livingArea, structures: s.structures, loggia: s.loggia, balcony: s.balcony, terrace: s.terrace };
    u.cellar = s.cellar;                     // {no, area}
    u.parking = s.parking ? { no: s.parking.no, type: 'garážové stání (2.PP)' } : null;
    u.rooms = s.rooms.map((r) => ({ name: r.name.replace('OBÝVACÍ POKOJ+KK', 'OBÝVACÍ POKOJ + KK'), area: r.area }));
    u.outdoorTotal = [u.areas.loggia, u.areas.balcony, u.areas.terrace].reduce((a, b) => a + (b || 0), 0) || null;

    diff('dispozice', s.layout, 'prodejní list', w?.disposition_web, 'web');
    diff('podlaží', u.floor, 'prodejní list', normFloor(w?.floor), 'web');
    diff('podlahová plocha', s.floorArea, 'prodejní list', w?.floorArea_m2, 'web');
    diff('podlahová plocha', s.floorArea, 'prodejní list', x.floorArea, 'XLS');
    diff('obytná plocha', s.livingArea, 'prodejní list', x.living, 'XLS');
    diff('sklep m²', s.cellar?.area, 'prodejní list', w?.cellar_m2, 'web');
    diff('lodžie', s.loggia, 'prodejní list', x.loggia || null, 'XLS');
    diff('balkon', s.balcony, 'prodejní list', x.balcony || null, 'XLS');
    diff('terasa', s.terrace, 'prodejní list', x.terraceGarden || null, 'XLS');
    if (s.cellar && x.cellarNo != null && s.cellar.no !== x.cellarNo) discrepancies.push({ id, field: 'číslo sklepa', 'prodejní list': s.cellar.no, XLS: x.cellarNo, note: 'interní číslování, nezobrazuje se jako rozpor' });
    if (!s.parking) verify.push('garážové stání: v prodejním listu neuvedeno');
  } else {
    const h = houseFromPairs(s._pairs);
    u.layout = w?.disposition_web ? w.disposition_web.replace('KK', 'kk') : null; // dispozice jen z webu
    u.floor = '1.NP + 1.PP';
    u.levels = ['1.NP', '1.PP'];
    u.areas = { living: h.living, livingNP: h.livingNP, livingPP: h.livingPP, garage: h.garage, loggia: h.loggia, terrace: h.terrace, porch: h.porch, plot: h.plot };
    u.rooms = h.rooms;
    u.parking = { type: s.building === 'ŘRD' ? 'garáž + venkovní stání (počet K OVĚŘENÍ)' : 'garáž + 1 venkovní stání' };
    u.outdoorTotal = [h.loggia, h.terrace, h.porch].reduce((a, b) => a + (b || 0), 0) || null;
    if (s.building === 'ŘRD') verify.push('parkování: web uvádí jednou „1 garáž + 2 venkovní“, jinde „1 garáž + 1 venkovní“');
    if (w && w.area_web_m2 && h.living && h.garage && Math.abs(w.area_web_m2 - (h.living + h.garage)) < 0.15)
      discrepancies.push({ id, field: 'obytná plocha', web: w.area_web_m2, 'prodejní list': h.living, note: 'web sčítá obytnou plochu a garáž – nový web uvádí odděleně' });
    diff('plocha pozemku', h.plot, 'prodejní list', w?.plot_m2, 'web');
    diff('plocha pozemku', h.plot, 'prodejní list', x.plot ?? null, 'XLSX', 1.01);
  }

  const f = files[id] || {};
  u.media = {
    plan: `media/plans/${id}.webp`,
    sheet: `media/sheets/${id}.webp`,
    sheetPdf: f.sheet ? `docs/units/${f.sheet}` : null,
    techPdfs: (f.tech || []).map((t) => `docs/units/${t}`),
  };
  if (!w) verify.push('jednotka nenalezena na současném webu – stav a cena neznámé');
  units.push(u);
}

const typeOrder = { byt: 0, 'radovy-dum': 1, dvojdum: 2 };
units.sort((a, b) => typeOrder[a.type] - typeOrder[b.type] || a.building.localeCompare(b.building) || a.number - b.number);

fs.writeFileSync(new URL('../content/units.json', import.meta.url), JSON.stringify({
  _meta: {
    generated: new Date().toISOString().slice(0, 10),
    note: 'Generováno skriptem scripts/build-units.mjs. V CMS bude každá položka jedním záznamem typu „Jednotka“.',
    priceNote: 'Ceny a stavy převzaty ze současného webu k 5. 10. 2026. Před spuštěním nutno napojit na živý zdroj (CRM / CMS).',
  },
  units,
}, null, 1));
fs.writeFileSync(new URL('../content/_sources/units-discrepancies.json', import.meta.url), JSON.stringify(discrepancies, null, 1));

const count = (k) => units.reduce((a, u) => ((a[u[k]] = (a[u[k]] || 0) + 1), a), {});
console.log('units', units.length, count('type'), count('status'));
console.log('discrepancies', discrepancies.length, 'units with verify', units.filter((u) => u.verify.length).length);
