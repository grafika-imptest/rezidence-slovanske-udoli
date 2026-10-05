# Rezidence Slovanské údolí – prototyp webu

Funkční prototyp nového webu developerského projektu **Rezidence Slovanské údolí** (IKO Plzeň, Plzeň 3 – Skvrňany).
Postavený nad reálnými podklady klienta, ve vizuálním systému IKO, připravený k převodu do CMS.

- **Náhled:** https://grafika-imptest.github.io/rezidence-slovanske-udoli/
- **Analýza (fáze 1–5):** [`docs/ANALYZA.md`](docs/ANALYZA.md)
- **Chybějící a nejasné podklady:** [`CONTENT-DATA-GAP-REPORT.md`](CONTENT-DATA-GAP-REPORT.md)

## Spuštění

```bash
node src/build.mjs        # → dist/
node serve.mjs 5310       # http://localhost:5310
```

Bez závislostí (Node ≥ 20). GitHub Pages: `bash scripts/deploy-pages.sh` (build s `BASE_PATH=/rezidence-slovanske-udoli/` → větev `gh-pages`).

## Struktura

```
content/                 OBSAH – odpovídá datům v CMS
  site.json              globální nastavení (navigace, kontakty, další projekty IKO)
  units.json             75 jednotek (generuje scripts/build-units.mjs)
  floors.json            půdorysy pater + polygony jednotek
  siteplan.json          schematická situace areálu
  standards.json         sady → kategorie → položky (generuje scripts/build-standards.mjs)
  project.json, location.json, financing.json, developer.json, news.json, downloads.json, gallery.json
  pages/*.json           stránky jako seznam bloků (page builder)
  _sources/              strojově vytěžené zdroje + seznam rozdílů mezi nimi
src/
  build.mjs              generátor (stránky, 75 detailů jednotek, detaily aktualit, data/units.json)
  layout.mjs             hlavička, patička, podznačka projektu
  blocks/*.mjs           UI bloky = budoucí CMS bloky
public/                  CSS, JS, fonty, média, PDF (kopíruje se do dist/)
scripts/                 sloučení dat, příprava médií z podkladů (scripts/prepare/README.md), testy
docs/                    analýza
```

## CMS bloky

| Blok | Data | Kde |
|---|---|---|
| `HeroVideo` | eyebrow, title, lead, video desktop/mobil, poster; živá dostupnost z jednotek | Úvod |
| `PageHero` | eyebrow, title, lead, image?, crumbs | podstránky |
| `Intro` | eyebrow, title, image + texty projektu | Úvod |
| `ProjectFacts` | project.facts + počet volných | Úvod, Projekt |
| `Typology` / `TypologyDetail` | project.typologies + statistiky jednotek | Úvod / Projekt |
| `SelectorTeaser` | situace + dostupnost po objektech | Úvod |
| `UnitSelector` | units, floors, siteplan | Nabídka |
| `SitePlan`, `FloorPlan` | siteplan.json, floors.json | Nabídka, Detail |
| `UnitRow` (karta) | jednotka | Nabídka, Oblíbené, Detail |
| `UnitDetail` (šablona) | jednotka + standardy + financování + dokumenty | /nabidka/{slug}/ |
| `VideoBanner` | video id, title, text, cta | Úvod, Projekt |
| `Gallery` | ids[], filtry | Úvod, Projekt, Lokalita |
| `StandardsTeaser`, `StandardsExplorer` | standards.json | Úvod, Standardy |
| `LocationTeaser`, `LocationFull` | location.json | Úvod, Lokalita |
| `FinancingSteps` | financing.json | Financování |
| `Timeline` | project.timeline | Úvod, Projekt |
| `Developer` | developer.json (compact / full) | Úvod, Developer |
| `NewsList`, `NewsDetail` | news.json | Úvod, Aktuality |
| `Downloads` | downloads.json (skupiny, showOn) | Ke stažení, Detail |
| `CTA`, `ContactForm` | texty; jednotka pro předvyplnění | více stránek |
| `Favorites`, `Compare` | data/units.json + localStorage | Oblíbené, Porovnání |

### Datový model jednotky (CMS typ „Jednotka“)

`id, slug, type (byt | radovy-dum | dvojdum), building, number, label, layout, floor, entrance, orientation,
status (volne | rezervovano | prodano), price, parkingPrice, areas {floor, living, structures, loggia, balcony,
terrace, porch, garage, plot, livingNP, livingPP}, cellar {no, area}, parking, rooms [{name, area, level}],
media {plan, sheet, sheetPdf, techPdfs[]}, verify[]`

Polygon jednotky v půdorysu (`floors.json → units[id].d`) je SVG path nad obrázkem podlaží – v CMS editor polygonů.

## Data a jejich původ

- Plochy, místnosti, sklep, stání: prodejní listy PDF klienta.
- Cena, stav: současný web (snapshot 5. 10. 2026) – **před spuštěním napojit na živý zdroj**.
- Vchod, orientace: XLS tabulky klienta.
- Rozdíly mezi zdroji: `content/_sources/units-discrepancies.json`, na webu jako `K OVĚŘENÍ`.

Nic není vymyšlené. Chybějící údaje jsou na webu viditelně označené; pro prezentaci je lze skrýt na stránce *O prototypu*.

## Testy

```bash
node scripts/test-interactions.mjs   # puppeteer-core + lokální Chrome; server musí běžet na :5310
```
