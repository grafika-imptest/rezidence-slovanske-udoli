// Static site generator: content/*.json + src/blocks → dist/
// Stránka = seznam bloků (content/pages/*.json) → stejný model jako page builder v CMS.
//   node src/build.mjs              (BASE_PATH=/  – lokálně)
//   BASE_PATH=/rezidence-slovanske-udoli/ node src/build.mjs   (GitHub Pages)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent, clientUnit } from './lib/content.mjs';
import { layout } from './layout.mjs';
import { html } from './lib/util.mjs';
import * as hero from './blocks/hero.mjs';
import * as project from './blocks/project.mjs';
import * as units from './blocks/units.mjs';
import * as content from './blocks/content.mjs';
import * as forms from './blocks/forms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BLOCKS = { ...hero, ...project, ...units, ...content, ...forms };

const c = loadContent();

function emptyDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { recursive: true, force: true });
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
function write(rel, str) {
  const f = path.join(DIST, rel, rel.endsWith('.json') ? '' : 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, str);
}
function renderBlocks(list, extra) {
  return list.map((b) => {
    const fn = BLOCKS[b.type];
    if (!fn) throw new Error(`Neznámý blok: ${b.type}`);
    return fn(b, c, extra).toString();
  }).join('\n');
}

emptyDir(DIST);
copyDir(path.join(ROOT, 'public'), DIST);

// --- stránky z page builderu
let count = 0;
for (const [id, page] of Object.entries(c.pages)) {
  write(page.path, layout(c, { ...page, id }, renderBlocks(page.blocks)));
  count++;
}

// --- detail jednotky (CMS šablona „Jednotka“)
for (const u of c.units) {
  const body = units.UnitDetail(u, c).toString() + forms.ContactForm({ paper: true }, c, u).toString();
  write(`nabidka/${u.slug}/`, layout(c, {
    id: 'unit', section: 'nabidka/', title: `${u.label}${u.type === 'byt' ? ` ${u.building}` : ''} · ${u.layout}`,
    description: `${u.label}, ${u.layout}, ${u.type === 'byt' ? `${u.building}, ${u.floor}, podlahová plocha ${u.areas.floor} m²` : `obytná plocha ${u.areas.living} m², pozemek ${u.areas.plot} m²`} – Rezidence Slovanské údolí, Plzeň.`,
    scripts: ['detail.js'],
  }, body));
  count++;
}

// --- detail aktuality (CMS šablona „Aktualita“)
for (const n of c.news) {
  write(`aktuality/${n.slug}/`, layout(c, { id: 'news', section: 'aktuality/', title: n.title }, content.NewsDetail(n, c).toString() + renderBlocks([{ type: 'NewsList', title: 'Další aktuality', eyebrow: 'Aktuality', limit: 3, paper: true, exclude: n.slug }])));
  count++;
}

// --- data pro klienta (oddělená od UI)
fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'data/units.json'), JSON.stringify(c.units.map(clientUnit)));

// --- 404
fs.writeFileSync(path.join(DIST, '404.html'), layout(c, { id: '404', title: 'Stránka nenalezena' }, html`<section class="sec"><div class="wrap"><p class="eyebrow">404</p><h1 class="h-display" style="margin-top:1rem">Stránka nenalezena</h1><p style="margin-top:1rem"><a class="btn" href="${process.env.BASE_PATH || '/'}">Zpět na úvod</a></p></div></section>`.toString()));

console.log(`✓ ${count} stránek → dist/  (BASE_PATH=${process.env.BASE_PATH || '/'})`);
