// Načtení obsahu (content/*.json) a odvozené údaje.
// V CMS bude tohle nahrazeno dotazy na API – UI bloky dostávají stejně tvarovaná data.

import fs from 'node:fs';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../../content/${f}`, import.meta.url), 'utf8'));

export function loadContent() {
  const c = {
    site: read('site.json'),
    project: read('project.json'),
    units: read('units.json').units,
    unitsMeta: read('units.json')._meta,
    floors: read('floors.json').floors,
    siteplan: read('siteplan.json'),
    standards: read('standards.json'),
    location: read('location.json'),
    financing: read('financing.json'),
    news: read('news.json').items,
    downloads: read('downloads.json'),
    developer: read('developer.json'),
    gallery: read('gallery.json'),
    pages: Object.fromEntries(fs.readdirSync(new URL('../../content/pages/', import.meta.url)).filter((f) => f.endsWith('.json')).map((f) => [f.replace('.json', ''), read(`pages/${f}`)])),
  };
  c.stats = stats(c.units);
  return c;
}

export const TYPE = {
  byt: { one: 'Byt', many: 'Byty', gen: 'bytů' },
  'radovy-dum': { one: 'Řadový dům', many: 'Řadové domy', gen: 'řadových domů' },
  dvojdum: { one: 'Dvojdům', many: 'Dvojdomy', gen: 'dvojdomů' },
};
export const STATUS = { volne: 'Volné', rezervovano: 'Rezervováno', prodano: 'Prodáno' };

function stats(units) {
  const by = (pred) => units.filter(pred);
  const summarize = (list) => {
    const free = list.filter((u) => u.status === 'volne');
    const prices = free.map((u) => u.price).filter(Boolean);
    const areas = list.map((u) => u.areas.floor ?? u.areas.living).filter(Boolean);
    const layouts = [...new Set(list.map((u) => u.layout))].sort((a, b) => parseFloat(a) - parseFloat(b));
    return {
      total: list.length, free: free.length,
      reserved: list.filter((u) => u.status === 'rezervovano').length,
      sold: list.filter((u) => u.status === 'prodano').length,
      priceFrom: prices.length ? Math.min(...prices) : null,
      areaMin: Math.min(...areas), areaMax: Math.max(...areas), layouts,
    };
  };
  return {
    all: summarize(units),
    byt: summarize(by((u) => u.type === 'byt')),
    'radovy-dum': summarize(by((u) => u.type === 'radovy-dum')),
    dvojdum: summarize(by((u) => u.type === 'dvojdum')),
    BD1: summarize(by((u) => u.building === 'BD1')),
    BD2: summarize(by((u) => u.building === 'BD2')),
  };
}

/** Slim unit record for the client-side selector (public/data/units.json). */
export function clientUnit(u) {
  return {
    id: u.id, slug: u.slug, type: u.type, b: u.building, n: u.number, label: u.label, code: u.code,
    layout: u.layout, floor: u.floor, fo: u.floorOrder ?? 0, status: u.status, price: u.price,
    area: u.areas.floor ?? u.areas.living, living: u.areas.living,
    loggia: u.areas.loggia || 0, balcony: u.areas.balcony || 0, terrace: u.areas.terrace || 0, porch: u.areas.porch || 0,
    plot: u.areas.plot || null, garage: u.areas.garage || null, cellar: u.cellar?.area ?? null,
    orient: u.orientation || null, entrance: u.entrance || null,
    parking: u.type === 'byt' ? (u.parking ? 'garážové stání' : null) : 'garáž',
    parkingPrice: u.parkingPrice, plan: u.media.plan, thumb: u.media.plan.replace('plans/', 'plans-thumb/'), verify: u.verify.length,
  };
}
