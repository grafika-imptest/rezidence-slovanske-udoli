# CONTENT / DATA GAP REPORT – Rezidence Slovanské údolí

Stav k 5. 10. 2026 · prototyp v1. Značky na webu: `K OVĚŘENÍ` (údaj nejednoznačný / jen z jednoho zdroje),
`CHYBÍ PODKLAD` (podklad neexistuje), `DOPLNIT KLIENTEM` (klient musí dodat). Na stránce
[O prototypu](https://grafika-imptest.github.io/rezidence-slovanske-udoli/prototyp/) lze značky skrýt pro prezentaci.

---

## 1. Co je hotové

| Oblast | Stav |
|---|---|
| Stránky | Úvod, Projekt, Nabídka, 75 detailů jednotek, Standardy, Lokalita, Financování, Aktuality + 3 detaily, Developer, Kontakt, Ke stažení, Oblíbené, Porovnání, O prototypu (91 stránek) |
| Výběr jednotek | situace areálu (SVG) → BD1/BD2 → 4 podlaží s polygony 65 bytů → náhled → detail; filtry, řazení, stav v URL, mobilní panel filtrů |
| Detail jednotky | půdorys, umístění v podlaží/areálu, prodejní list, cena + garážové stání, plochy, místnosti, standardy, rozpis splátek, dokumenty, podobné jednotky, poptávka s předvyplněnou jednotkou |
| Oblíbené / porovnání | localStorage, sdílení seznamu odkazem, porovnání až 4 jednotek napříč typy |
| Standardy | 3 sady, 35 kategorií, 154 položek (texty doslovně z PDF), 61 položek s fotkou z katalogu |
| Média | 15 vizualizací (webp 640/1280/2400), 4 videa v reálném čase (VRC_18 jako hero 16:9 + výřez 9:16, VRC_21, VRC_40), 16 fotek ze stavby, 3 mapy, 145 PDF |
| Responzivita | testováno 1440 px, 390 px; bez vodorovného přetékání; půdorysy na mobilu posuvné do stran |
| CMS příprava | obsah v `content/*.json`, stránky = seznam bloků, 23 bloků (viz README) |

## 2. Potvrzené podklady (použity přímo)

- Texty o projektu, typologiích, „kupní cena zahrnuje“, lokalitě – současný web.
- Ceny a stavy 75 jednotek, cena garážového stání 425 000 Kč – současný web k 5. 10. 2026.
- Plochy, místnosti, sklepy, čísla stání – prodejní listy (BD1 6. 6. 2025, BD2 18. 6. 2025, RDD 27. 11. 2025, ŘRD 24. 7. 2026).
- Dispozice domů (4+kk / 5+kk) – současný web (v prodejních listech domů není).
- Standardy (platné od 28. 5. 2026 / 11. 8. 2026), katalogy vybavení – PDF klienta.
- Postup financování (od 1. 5. 2026), pravidla klientských změn KZ1–KZ3 – PDF klienta.
- PENB: všechny objekty třída B (BD1 91, BD2 88, RDD 62, ŘRD 58 kWh/m²·rok).
- Developer: texty ikoplzen.cz a ikoplzen.imptest.cz, IČO 29120543, sídlo Vltavínová 1334/3.
- Brand: logo IKO, Pepi, `#005FAA`, podznačka dle Dodatku 2026.

## 3. K ověření (rozpory nebo jediný zdroj)

| # | Téma | Zdroj A | Zdroj B | Na webu použito |
|---|---|---|---|---|
| 1 | Vytápění bytových domů | /nemovitosti: Plzeňská teplárenská | standardy, PENB, /byty: plynová kotelna | plynová kotelna |
| 2 | Dokončení dvojdomů / řadových domů | /nemovitosti: „bude upřesněno“ | podstránky: cca 02/2029 / 03/2029 | 02/2029, 03/2029 + značka |
| 3 | Zahájení výstavby | texty: cca 05/2026 | galerie: 4/2026 | cca 05/2026 + značka |
| 4 | Parkování ŘRD | garáž + 2 venkovní | garáž + 1 venkovní | „počet K OVĚŘENÍ“ |
| 5 | Podlaží bytů | text: 1. PP – 4. NP | data: 1. PP – 3. NP | data (3. NP) |
| 6 | Počet výtahů | „7 výtahů“ | „výtah v každém vchodě“ | počet neuveden |
| 7 | BD1-08, BD2-05 dispozice | web 1+KK | prodejní list 1,5+kk | 1,5+kk + značka |
| 8 | BD1-08 podlahová plocha | prodejní list 46,2 m² | XLS 45,9 m² | 46,2 m² + značka |
| 9 | BD1-16 lodžie | prodejní list + web 7,2 m² | XLS 12,5 m² | 7,2 m² + značka |
| 10 | ŘRD-06 pozemek | prodejní list 294 m² | XLSX 295,2 m² | 294 m² + značka |
| 11 | Obytná plocha domů | web: vč. garáže (152,5 m²) | prodejní list: 129 m² + garáž 23,5 m² | odděleně |
| 12 | „3 typy řadových domů – levý, pravý, prostřední“ | homepage | nabídka typy nerozlišuje | text v typologii, značka |
| 13 | Rozměr obkladu EBS Mito | standardy 33,5 × 50 cm | katalog 33,3 × 55 cm | text standardu |
| 14 | PENB řadových domů | bez evidenčního čísla | – | značka |
| 15 | Čísla IKO 1875+, 19+, 100 % vlastní kapitál | imptest (dodal klient) | nezávisle neověřeno | značka |
| 16 | Přiřazení vizualizací k typu domu (řadový × dvojdům) | názvy souborů nic neříkají | – | neutrální popisky |
| 17 | Polygony jednotek v půdorysech | vygenerovány automaticky z barevných půdorysů | – | zkontrolovat, v CMS doladit |
| 18 | Ulice „Vejprnická“ v situaci | dle přehledové mapy | situace je schematická | orientačně |
| 19 | Ceny a stavy | snapshot 5. 10. 2026 | – | před spuštěním napojit na živý zdroj |
| 20 | Claim / tagline projektu | sestaven z faktů webu | – | schválit copy |
| 21 | Podznačka projektu (náhrada starého žlutého loga) | Dodatek manuálu 2026 | – | schválit klientem |
| 22 | Licence webfontu Pepi pro doménu projektu | – | – | ověřit u Suitcase Type |

Úplný strojový seznam 52 rozdílů: `content/_sources/units-discrepancies.json`.

## 4. Chybí (podklad neexistuje)

- Jméno architekta / ateliéru a popis architektonického konceptu.
- Kontaktní osoba prodeje (jméno, foto, přímý kontakt), prodejní místo, otevírací doba.
- GPS projektu, konkrétní body zájmu (školy, školky, zastávky, obchody) se vzdálenostmi a časy → interaktivní mapa.
- Harmonogram výstavby (PDF je placeholder), vzory Smlouvy o rezervaci a SOBKS (placeholdery).
- Texty aktualit (existují jen fotoalba bez textu).
- Interiérové vizualizace a samostatné fotky položek standardů ve vysokém rozlišení.
- Partnerská banka / hypoteční specialista, parametry hypoteční kalkulačky.
- Informace o technologiích nad rámec standardů (rekuperace, FVE, nabíjení EV, chlazení) – web je neuvádí; neuvádíme.
- Cena sklepa, kočárkárny / kolárny, počet a cena venkovních stání u bytů.
- Vlastní GDPR/cookies text projektu (dnes odkaz na ikoplzen.cz/gdpr), analytika (GA4/GTM).

## 5. Co musí klient dodat před spuštěním

1. Potvrdit rozpory z kapitoly 3 (zejm. 1–10).
2. Živý zdroj cen a stavů (CRM / export) – nebo určit, kdo je v CMS aktualizuje.
3. Kontakt obchodníka (jméno, foto, telefon, e-mail), prodejní místo a čas.
4. Body zájmu v lokalitě + GPS projektu.
5. Harmonogram výstavby, vzory smluv (nebo rozhodnutí je nezveřejňovat).
6. Texty aktualit (doporučení: měsíční fotoreport ze stavby).
7. Jméno architekta a 1–2 odstavce o konceptu.
8. Schválení podznačky projektu a claimu.
9. Webovou licenci písma Pepi pro doménu projektu.
10. Rozhodnutí: samostatná doména vs. podstránka centrály (viz `docs/ANALYZA.md`, Doporučení 1).

## 6. Technické úkoly před produkcí (IMPnet)

- Napojení formuláře (CRM / e-mail), antispam bez obrázkové CAPTCHA, GDPR souhlas dle právníka.
- Přenos bloků do CMS (mapování v README), editor polygonů jednotek nad obrázkem podlaží.
- Analytika (GA4 + GTM, Meta Pixel dle strategie), cookie lišta.
- Odstranit `noindex`, nastavit canonical, sitemap, meta description (připraveny v šabloně).
- Optimalizace: hero video 13 MB (desktop) / 6,8 MB (mobil) – zvážit CDN nebo kratší smyčku.
