# Příprava dat a médií z podkladů klienta

Skripty, kterými byla z podkladů klienta (složka `slovanske udoli/`, mimo repozitář) vytvořena data
v `content/` a média v `public/media/` a `public/docs/`. Spouští se jen při změně podkladů.

Závislosti (instalovat mimo repo, např. do dočasné složky):
`npm i xlsx pdfjs-dist@4.7.76 @napi-rs/canvas sharp ffmpeg-static ffprobe-static`

Cesta k podkladům: proměnná prostředí `SOURCE_DIR` (výchozí `C:/Users/Omen/Documents/claude/slovanske udoli`).

| Skript | Co dělá | Výstup |
|---|---|---|
| `pdf.mjs` | sdílené funkce – text a rastr z PDF (pdfjs + @napi-rs/canvas) | – |
| `extract.mjs` | vytěží plochy, místnosti, sklepy, stání z 75 prodejních listů | `content/_sources/sale-sheets.extracted.json` |
| `sheets.mjs` | prodejní listy → náhled (webp), výřez půdorysu, kopie PDF + technických půdorysů | `public/media/sheets`, `public/media/plans`, `public/docs/units` |
| `seg.mjs` | barevné půdorysy pater → polygony jednotek (segmentace barev + přiřazení k popiskům „BYT n“) | `content/_sources/floors.segmented.json` → `content/floors.json` |
| `viz.cjs` | vizualizace 6000 px → webp 640/1280/2400 + jpg 1600 | `public/media/viz` |
| `prez.mjs` + `crops.cjs` | katalogy standardů (PDF) → výřezy fotek výrobků | `public/media/standards` |

Poté: `node scripts/build-units.mjs` (sloučení zdrojů + rozpory) a `node scripts/build-standards.mjs`.

Videa (ffmpeg-static): VRC_18 a VRC_40 → H.264 1080p (CRF 30–31) + 540p, bez zvuku, `+faststart`;
VRC_18 → mobilní hero = výřez 1215×2160 → 720×1280. „Web Desktop/Mobile_H.264“ se nepoužívá (zrychlený sestřih). VRC_21 → banner na úvodu. `Cukrovarska_VRC_0009.mp4` do projektu nepatří a nepoužívá se.
