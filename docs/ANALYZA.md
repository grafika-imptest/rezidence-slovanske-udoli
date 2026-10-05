# Rezidence Slovanské údolí – analýza podkladů a návrh webu

Stav k 5. 10. 2026. Dokument pokrývá fáze 1–5 zadání (průzkum zdrojů → audit → vizuální systém → IA → UX flow)
a rozhodnutí, která z nich plynou pro prototyp. Seznam chybějících a nejasných údajů je v
[`CONTENT-DATA-GAP-REPORT.md`](../CONTENT-DATA-GAP-REPORT.md).

---

## Fáze 1 – Prozkoumané zdroje

| Zdroj | Co obsahuje | Použití |
|---|---|---|
| Složka klienta `slovanske udoli/` (218 souborů, 1,4 GB) | 15 vizualizací 6000×4000 px, 6 videí, 75 prodejních listů PDF, 70 technických půdorysů PDF, 8 barevných půdorysů pater, 10 půdorysů pater k prodejním listům, 2× XLS tabulky bytů, XLSX pozemky domů, brand manuál IKO 2024 + dodatek 2026, marketingová strategie, staré logo projektu | primární zdroj dat i médií |
| rezidenceslovanskeudoli.cz (10 URL ze sitemapy + 16 PDF + 75 prodejních listů) | texty o projektu, ceny a stavy 75 jednotek, standardy (jen jako PDF), ke stažení, fotoalba stavby, kontakt | obchodní data (cena, stav), texty |
| /standardy | jen 5 karet s PDF – texty ani fotky položek na stránce nejsou | standardy převedeny z PDF do struktury |
| /ke-stazeni | 10 dokumentů, z toho 3 placeholdery „Připravuje se…“ | viz rozhodnutí níže |
| muj.impnet.cz/nabidka/… (část 02) | **obchodní nabídka IMPnet pro IKO** (web na míru 129 000 Kč, marketing), ne tabulka jednotek | data jednotek odtud nejsou – zdrojem jsou prodejní listy + web |
| ikoplzen.imptest.cz, ikoplzen.cz | nová a stávající centrála IKO, texty o firmě, vizuální systém | developer, tokeny, komponenty |
| `IKO Plzeň/iko-plzen` (repo centrály), `IKO Design System` | CSS tokeny, komponenty, logo SVG, motiv pásky | převzato 1:1 jako základ |

## Fáze 2 – Obsahový a datový audit

### Co máme a jak je použitelné

| Podklad | Stav | Poznámka |
|---|---|---|
| Vizualizace (15×) | **použitelné** | exteriérové, s lidmi; žádné interiérové |
| Video `Web Desktop/Mobile_H.264` | **použitelné** | klientský sestřih pro web (16:9 + 9:16) → hero |
| Video `VRC_18` | **použitelné** | pomalý letecký průlet nad celým areálem → fullscreen banner (Home, Projekt), aktualita |
| Video `VRC_40` | **použitelné** | kamera stoupá nad zahradami rodinných domů → typologie řadové domy |
| Video `VRC_11`, `VRC_21` | doplňkové | pěší pohled na bytové domy / cesta zelení – nezadány, nepoužity; vhodné pro Lokalitu nebo sociální sítě |
| `Cukrovarska_VRC_0009.mp4` | **nepoužito** | ve složce není; dle zadání do projektu nepatří |
| Prodejní listy (65 bytů + 10 domů) | **použitelné** | plochy, místnosti, sklep, garážové stání, půdorys → detail jednotky |
| Technické půdorysy | **použitelné** | ke stažení v detailu jednotky |
| Barevné půdorysy pater (8×) | **použitelné** | z nich automaticky vygenerovány polygony jednotek pro výběr podle podlaží |
| XLS tabulky bytů | doplňkové | orientace, vchod (blok A–E); ceny v tabulkách vymazané |
| XLSX pozemky domů | doplňkové | pozemky s desetinami; ceny prázdné |
| Ceny a stavy | **jen současný web** | 29 volných / 20 rezervovaných / 26 prodaných k 5. 10. 2026 |
| Standardy | **jen PDF** | 3 sady (byty, dvojdomy, řadové domy) přepsány do struktury; fotky vyřezány z katalogů |
| Lokalita | jen text + PDF přehledové mapy | bez GPS, bez bodů zájmu a vzdáleností |
| Aktuality | jen 2 datovaná fotoalba bez textu | převedeno na aktuality typu „Z výstavby“ |
| Kontaktní osoby | **chybí** | web uvádí jen telefon a e-mail prodeje |
| Architekt / koncept | **chybí** | jediná věta „Architektonické řešení vychází z návrhu celé lokality“ |

### Data jednotek – sloučení zdrojů

`scripts/build-units.mjs` slučuje tři zdroje s pravidlem:
**plochy a místnosti = prodejní list** (nejnovější datovaný dokument), **cena a stav = současný web**,
**vchod, orientace = XLS**. Každý rozdíl jde do `content/_sources/units-discrepancies.json`;
rozdíly, které mění význam údaje, se u jednotky zobrazí jako `K OVĚŘENÍ`.

Výsledek: 75 jednotek (65 bytů BD1/BD2, 6 řadových domů, 4 dvojdomy), 52 evidovaných rozdílů,
z toho 9 jednotek s viditelnou značkou K OVĚŘENÍ. Ostatní rozdíly jsou zaokrouhlení ±0,1 m² (XLS vs. prodejní list)
nebo interní číslování sklepů, které web nezobrazuje.

### Rozpory ve zdrojích (výběr – úplný seznam v GAP reportu)

1. Vytápění BD: „napojen na Plzeňskou teplárenskou“ (/nemovitosti) × plynová kotelna (standardy, PENB, /byty) → použita kotelna.
2. Dokončení RD: „bude upřesněno“ × 02/2029 (dvojdomy) a 03/2029 (řadové domy).
3. Parkování řadových domů: garáž + 2 venkovní × garáž + 1 venkovní.
4. Podlaží bytů: „1. PP až 4. NP“ × data končí 3. NP; standardy BD uvádí „2.–6. NP“.
5. Počet výtahů: „7 výtahů“ × „výtah v každém vchodě“.
6. Dispozice BD1-08 a BD2-05: web 1+KK × prodejní list 1,5+kk.
7. Plochy domů na webu obsahují garáž (152,5 m² = 129 + 23,5) – nový web uvádí odděleně.
8. Lodžie BD1-16: prodejní list a web 7,2 m² × XLS 12,5 m².
9. Zahájení výstavby: „cca 05/2026“ × fotoalbum „4/2026 – zahájení výstavby“.
10. Marketingová strategie IKO kritizuje samostatné projektové microsity (jmenovitě rezidenceslovanskeudoli.cz) – viz doporučení níže.

## Fáze 3 – Vizuální systém: centrála IKO × současný web projektu

| | Centrála IKO (imptest) | Současný web projektu | Nový web projektu |
|---|---|---|---|
| Logo | IKO (varianta B s claimem) | staré logo „REZIDENCE – PLZEŇ“ se žlutými čtverci `#FCBE0E` | **podznačka dle Dodatku 2026, kap. 2.2**: logo IKO + „Slovanské údolí“ v Pepi Bold |
| Písmo | Pepi (woff2) | systémové | Pepi (stejné woff2 jako centrála) |
| Barvy | `#005FAA` + bílá, stříbrná `#8A8D8F`, tónované stíny | žlutá + černá | tokeny 1:1 s centrálou; žlutá vypuštěna |
| Geometrie | radius 0, pill jen u štítků | – | radius 0, pill jen u štítků stavů |
| Grafický prvek | páska s logem IKO | – | páska jen jako „podpis“ IKO (patička, developer) |
| Fotografie | vizualizace + reálné fotky | vizualizace v galerii | vizualizace jako hlavní nosič, reálné foto ze stavby v aktualitách |

**Co je společné:** tokeny, typografická škála, tlačítka, formuláře, štítky stavů, patička s „Další projekty IKO“,
tone of voice (vykání, bez vykřičníků, fakta).
**Co je projektové:** silnější práce s celoplošnými vizualizacemi a videem, interaktivní situace a půdorysy,
technický „výkresový“ jazyk (vlasové linky, mikro popisky, osová čísla), standardy jako katalog.

## Fáze 4 – Informační architektura

```
Úvod
├── Projekt            (koncept, typologie BD / ŘRD / RDD, technika + PENB, harmonogram, galerie)
├── Nabídka            (situace → bytový dům → podlaží → jednotka · filtry · seznam)
│   └── Detail jednotky ×75   /nabidka/byt-bd1-09/, /nabidka/radovy-dum-05/, /nabidka/dvojdum-01/
├── Standardy          (Byty | Dvojdomy | Řadové domy → kategorie → položka)
├── Lokalita           (texty, přehledové mapy klienta, občanská vybavenost)
├── Financování        (postup koupě, splátkový kalendář, klientské změny)
├── Aktuality          (fotoreporty ze stavby, video) └── Detail aktuality
├── Developer          (IKO, výhody, další projekty IKO → ikoplzen.cz)
├── Kontakt            (prodej, sídlo, formulář)
├── Ke stažení         (standardy, katalogy, financování, KZ, PENB, mapy)
├── Oblíbené · Porovnání
└── O prototypu        (legenda značek, seznam CMS bloků)
```

### Ke stažení – rozhodnutí

| Dokument | Rozhodnutí | Kde |
|---|---|---|
| Standardy BD / DD / ŘRD + katalogy vybavení | převzít | Standardy, Ke stažení, detail jednotky (podle typu) |
| Postup financování | převzít | Financování, detail jednotky |
| Pravidla klientských změn (byty / RD) | převzít | Financování, detail jednotky |
| PENB (4×) | převzít | Projekt (tabulka), detail jednotky, Ke stažení |
| Přehledové mapy | převzít | Lokalita |
| Termíny výstavby, Smlouva o rezervaci, SOBKS | **nepřebírat** – jsou to placeholdery „Připravuje se…“ | zobrazeny jako DOPLNIT KLIENTEM |
| Prodejní listy + technické půdorysy | převzít s čitelnými názvy | detail jednotky |

## Fáze 5 – UX flow

**A) Homepage → nabídka → výběr jednotky → detail → poptávka**

1. Hero: živá dostupnost po typech (23/65 bytů, 5/6 ŘRD, 1/4 RDD) → proklik přímo do filtrované nabídky.
2. Blok „Výběr jednotky“: mini situace + dostupnost po objektech.
3. Nabídka: záložky typu → situace (BD1, BD2, domy 01–10 obarvené dle stavu) → klik na BD → podlaží (polygony jednotek
   v barvě stavu) → hover/tap = shrnutí (desktop: boční panel, mobil: bottom sheet) → Detail.
   Paralelně seznam s filtry (dispozice, podlaží, venkovní prostor, plocha, cena, jen volné), řazením a stavem v URL
   (sdílitelný odkaz).
4. Detail: půdorys / umístění v podlaží / prodejní list, cena + stání, plochy, místnosti, standardy typu, rozpis splátek
   pro konkrétní cenu, dokumenty, podobné volné jednotky.
5. Poptávka s předvyplněnou jednotkou (+ volitelně přiložené oblíbené).

**B) Homepage → projekt → standardy / lokalita / developer** – každý blok na Home má „Více…“ do plné stránky;
Projekt odkazuje na standardy (technika), harmonogram na aktuality, Developer na ikoplzen.cz.

**Oblíbené / porovnání:** srdce a ikona porovnání na každé kartě i detailu; počítadla v hlavičce; lišta porovnání
dole (desktop s čipy jednotek, mobil jen tlačítko); tabulka porovnání s lepkavým sloupcem parametrů a vodorovným
posunem po sloupcích na mobilu, zvýraznění rozdílů a nejlepších hodnot (cena/m², plocha, venkovní prostor).

## Doporučení pro klienta / PM

1. **Projektový web vs. strategie IKO.** Marketingová strategie chce projekty jako podstránky centrály a kritizuje
   microsite rezidenceslovanskeudoli.cz. Doporučení: zachovat samostatnou doménu kvůli kampaním a SEO projektu,
   ale web vést jako součást ekosystému (podznačka, lišta „Projekt společnosti IKO Plzeň“, „Další projekty IKO“,
   canonical na duplicitní texty s podstránkou centrály). Rozhodnutí potvrdit s klientem.
2. **Jeden zdroj dat jednotek.** Dnes existují tři nekonzistentní zdroje (web, XLS, prodejní listy) a centrála
   na imptestu zobrazuje demo data. Doporučení: jednotky spravovat na jednom místě (CMS / CRM) a centrálu i projektový
   web napojit na stejný feed.
3. **Rozsah vs. nabídka.** Nabídka IMPnet (část 02) je „Verze Easy dle šablon“. Prototyp obsahuje interaktivní
   výběr podle půdorysů, porovnání a katalog standardů – ověřit, co z toho je v prodaném rozsahu.
4. **Licence písma Pepi** pro další doménu ověřit (Suitcase Type).
