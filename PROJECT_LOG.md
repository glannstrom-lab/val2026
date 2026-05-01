# PROJECT_LOG

Append-only logg över autonoma cykler. Senaste posten överst.

Format för varje post:
```
## Cykel [nummer] — [datum] — [kategori]

**Bedömning**: [vad behövde projektet mest]
**Alternativ jag valde bort**: [2-3 saker och varför]
**Gjort**: [vad som faktiskt utfördes]
**Resultat**: [vad fungerade, vad inte]
**Nästa cykel bör undvika**: [denna kategori om upprepad]
```

---

## Cykel 6 — 2026-05-01 — Content (källrader på fler sidor)

**Bedömning**: Cykel 1 lade till källrad på partier.html. Backloggat: göra motsvarande på opinion.html, historik.html, mandat.html, budget.html, rostningar.html. Audit visade att opinion.html (pollofpolls.se), budget.html (Prop. 2024/25:1) och rostningar.html (Riksdagens öppna data) redan hade synliga källor — kvarvarande luckor: historik.html (bara EU-valet hade källa, riksdagsvalen 2018/2022 saknade), mandat.html (förklarade Sainte-Laguë men hade ingen länk till regelverket).
**Alternativ jag valde bort**:
- Tools — för diffust mål
- Mobile UX — kräver browser-testning
- Accessibility — bara 4 cykler sedan, ge variation tid
- Lägg till källa även på kompass.html (CHES) och quiz.html (matchningsalgoritm) — backloggat
**Gjort**:
1. `tools/history.js` — lade till `.history-source`-block efter Valdeltagande-sektionen i `renderRiksdagComparison`. Visar tre källor: val.se (officiell, primärkälla), SVT 2022, SVT 2018 (sekundärkällor från `data/election-history.json`)
2. `tools/seatcalc.js` — lade till `.seatcalc-source`-paragraph i info-boxen om Sainte-Laguë-metoden, med länk till vallagen 2005:837 kap 14 (primärkälla regelverk) och val.se
3. `styles.css` — ny återanvändbar klass `.history-source, .seatcalc-source` med top-border som visuell separator, font-size xs, underline-länkar med samma muted-tokens som `.party-sources`
4. ROADMAP backlog uppdaterad: opinion/budget/rostningar avbockade, kompass/quiz/tidslinje kvar
**Resultat**:
- Riksdagsvalen 2018/2022 har nu synlig primärkällelänk på historik-sidan
- Mandatkalkylatorn visar regelverkets URL → användaren kan verifiera metodbeskrivning mot lagtext
- CSS-klass återanvändbar för framtida källrader (kompass, quiz)
- Inga ändringar i data/-filer, bara i visningsdelen — JSON-validitet ej påverkad
**Nästa cykel bör undvika**: Content. Senaste 3: Neutrality, Performance, Content. Kandidater: Tools, Mobile UX, Accessibility (med 4 cykler bortom), SEO (med 3 cykler bortom).

---

## Cykel 5 — 2026-05-01 — Performance

**Bedömning**: Performance-audit utan browser. Filstorleksanalys: styles.css är 150 KB över 5800+ rader, app.js 14 KB, alla 14 verktygsfiler total 187 KB (men bara en laddas per sida pga multi-page). Preload-audit visade att endast index.html (1 av 17) hade `<link rel="preload">` för styles.css. Tre sidor (debatter, kandidater, mandat — samma trio som inkonsekvent SEO i Cykel 3) saknade `display=swap` i font-URL → FOIT-risk. CSS-duplikat-audit identifierade 17 selektorer, varav 11 är legitima gruppselektor-mönster och 3 är reella konflikter (`.party-card-header`, `.party-stat-value/label`, `.block-label` definieras i konkurrerande scopes).
**Alternativ jag valde bort**:
- Bildoptimering — kräver imagemin/sharp som dependency, mot CLAUDE.md "ingen build-process". Backloggat istället.
- CSS-konflikt-fix — risk utan visuell verifikation. Backloggat med specifik fix-strategi.
- CSS-rensning av oanvända klasser — kräver browser-baserad coverage-analys eller risken att bryta något dynamiskt
**Gjort**:
1. `scripts/perf-preload.cjs` — idempotent script som inserterar `<link rel="preload" href="styles.css" as="style">` före befintlig styles.css-link på alla sidor som saknar den, och normaliserar Bunny Fonts-URL med `&display=swap`
2. Körde scriptet → 16/17 filer ändrade (index.html hade redan båda)
3. Verifierade post-fix: 17/17 sidor har preload + display=swap
4. ROADMAP backlog: tre CSS-konflikter att scope:a med specifika rad-referenser (kräver visuell verifikation)
5. ROADMAP backlog: bildoptimering av PNG-logotyper (53 KB total, SD/MP/S är 9–13 KB var)
**Resultat**:
- Förväntad förbättring: parallell CSS-laddning på 16 sidor → ~50–150 ms snabbare First Contentful Paint på 4G
- FOIT undvikt på debatter/kandidater/mandat → text syns direkt även om Bunny Fonts är långsam
- Inga visuella förändringar (preload + display=swap är non-breaking)
- styles.css storlek oförändrad (rensning backloggad)
**Nästa cykel bör undvika**: Performance. Senaste 3: SEO, Neutrality, Performance. Kandidater: Tools, Mobile UX, Content (>3 cykler sedan), Accessibility (>3 cykler sedan).

---

## Cykel 4 — 2026-05-01 — Neutrality audit

**Bedömning**: Två klasser av neutralitetsproblem identifierade. (1) **Textbias** i partibeskrivningar: S "har präglat svensk politik under 1900-talet" (positivt laddat), M "hårdare tag mot brottslighet" (populistisk frasering medan SD får neutralt "lag och ordning"), och bara S/M/SD får storlekspåståenden i beskrivning vilket skapar strukturell asymmetri (storlek finns redan i partikortets statistik). (2) **Strukturell obalans i timeline.json**: M=5, L=3, MP=3, S=2, SD=2, V=1, C=1, KD=1 av 36 händelser. Förväntat enligt mandat: S~11, SD~8, M~7. S och SD kraftigt underrepresenterade.
**Alternativ jag valde bort**:
- Performance — Lighthouse kräver browser-körning
- Mobile UX — kräver browser
- Tools — för diffust
- Lägga till faktiska timeline-händelser för S/SD — kräver omfattande research, för stort för en cykel. Backloggat.
**Gjort**:
1. parties.json — S beskrivning: tog bort "Sveriges största parti och har präglat svensk politik under 1900-talet" → "är Sveriges äldsta riksdagsparti, grundat 1889" (faktabaserad, inte värderande)
2. parties.json — M beskrivning: tog bort "Sveriges näst största parti och" och bytte "hårdare tag mot brottslighet" → "skärpt straffrätt" (samma ord som SD/L får på samma område)
3. parties.json — SD beskrivning: tog bort "är riksdagens tredje största parti och" → "stödjer Tidöregeringen som samarbetsparti" (förtydligar relation utan storleksrang)
4. issues.json — C på hedersbrott: "Vill ha hårdare tag mot hedersbrott" → "Vill skärpa straffen för hedersbrott" (matchar L:s neutrala "skärpta straff" på samma rad)
5. ROADMAP — backloggat: timeline-balansering med specifika rekommenderade händelse-tillägg per parti
6. Markerade Neutrality audit som klar i kategoriroteraren
7. CLAUDE.md Lessons Learned: tre nya regler (hårdare tag är populism, storlekspåståenden hör hemma i statistik, räkna omnämnanden som balanstest)
**Resultat**:
- Fyra textändringar, alla med samma ords-konsistens som befintliga neutrala formuleringar i samma datafiler (gjorde ändringar BAKÅT-kompatibla mot etablerad neutral språknorm i projektet)
- JSON-validitet verifierad efter varje ändring
- Strukturell asymmetri i timeline-data nu dokumenterad — ej åtgärdad i denna cykel men ej längre osynlig
- Inga textändringar i quotes.json eller compass-positions.json gjordes — de kräver djupare språkgranskning som är en framtida cykels jobb
**Nästa cykel bör undvika**: Neutrality audit-kategori. Senaste 3: Accessibility, SEO, Neutrality. Kandidater: Tools, Performance, Mobile UX, Content, Accessibility (med 1 cykels mellanrum kan den återkomma).

---

## Cykel 3 — 2026-05-01 — SEO & meta

**Bedömning**: Audit över 17 HTML-sidor visade att alla hade `<title>` och `<meta name="description">` ✅, men endast 4 hade `og:title`, 0 hade `og:image`, 0 hade `canonical`. Title-format inkonsekvent: 14 använde em-dash `—`, 3 använde pipe `|`. Saknade `robots.txt` och `sitemap.xml`. Sajten ska upptäckas av sökmotorer och dela bra på sociala medier — dessa luckor är konkreta SEO-fail.
**Alternativ jag valde bort**:
- Performance — Lighthouse kräver browser-körning
- Mobile UX — kräver browser-testning  
- Neutrality audit — sista commit gjorde redan
- Tools — för diffust mål
**Gjort**:
1. Skrev `scripts/seo-meta.cjs` — idempotent engångsscript som städar befintliga OG/Twitter/canonical och inserterar ett komplett block efter description-tag
2. Körde scriptet → 17/17 sidor uppdaterade med konsekvent SEO-block: og:type, og:site_name, og:url, og:title, og:description, og:locale, twitter:card, twitter:title, twitter:description, canonical
3. Normaliserade title-separator `|` → `—` i samma script (debatter, kandidater, mandat)
4. Skapade `robots.txt` (tillåter alla crawlers, blockerar arkiverade `index-single.html`, pekar på sitemap)
5. Skapade `sitemap.xml` med 17 URL:er, lastmod 2026-05-01, prioriteter baserade på relevans (startsida 1.0, partier/quiz/sakfrågor 0.9, om/gissa 0.5)
6. Backlogade i ROADMAP: skapa `assets/og-image.png` (1200×630), lägg till JSON-LD strukturerad data
7. Markerade Fas 3 "SEO och social sharing" som delvis (`[~]`)
**Resultat**:
- Audit verifierad: alla 17 sidor har komplett SEO-block (8 obligatoriska taggar + canonical)
- Title-format nu enhetligt em-dash på alla sidor
- Sitemap och robots.txt på plats inför Google Search Console-registrering
- Engångsscript bevarat i `scripts/` — idempotent, kan köras igen vid framtida sidtillägg
**Nästa cykel bör undvika**: SEO-kategori. Senaste 3: Content, Accessibility, SEO. Kandidater: Tools, Performance, Neutrality audit, Mobile UX.

---

## Cykel 2 — 2026-05-01 — Accessibility

**Bedömning**: WCAG 2.1 AA-fail upptäckta vid CSS-granskning. (1) Light mode `--color-accent #4a9eff` mot vit bakgrund = endast 2.75:1 — länktext fail (krav 4.5:1). Påverkar varje `<a>` i light mode. (2) Fyra interaktiva element (`.votes-select`, `.budget-select`, `.candidates-filter-select`, `.candidates-search-input`) hade `outline: none` med endast 1px border-färgändring som focus-indikator. `.candidates-search-input` hade en hardkodad indigo-shadow som inte matchade temat.
**Alternativ jag valde bort**:
- Neutrality audit — sista commit (f4f2431) gjorde redan språk- och färgfix, ge variation tid
- Mobile UX — kräver browser-testning, inte trivialt automatiserat i denna miljö
- Performance — Lighthouse kräver lokal körning
**Gjort**:
1. Lade till `--focus-ring` custom property i `:root` (styles.css:25) med `0 0 0 3px rgba(74,158,255,0.35)`
2. Light theme override (styles.css:118-122): `--color-accent: #1d6fcf` (4.97:1 ✅), `--color-accent-hover: #1557a1` (7.22:1 ✅), egen `--focus-ring` i tonad blå
3. Bytte `.votes-select:focus`, `.budget-select:focus`, `.candidates-search-input:focus`, `.candidates-filter-select:focus` till `:focus-visible` och lade till `box-shadow: var(--focus-ring)`
4. Verifierade alla kontraster matematiskt (relativ luminans → WCAG-formel) — alla passerar AA
5. Markerade Fas 1 "WCAG 2.1 AA-baseline" som delvis (`[~]`) i ROADMAP, listade kvarvarande arbete (full axe-core, screenreader, W3C, 3G)
**Resultat**:
- Light mode accent: 2.75:1 → 4.97:1 (WCAG AA pass)
- Dark mode kontraster verifierade: text 17.83:1, text-muted 7.43:1, text-subtle på bg-card 4.50:1 (på gränsen men pass)
- Fyra fokus-fail åtgärdade — synlig blå ring vid tangentbordsnavigation
- Bytet till `:focus-visible` undviker focus-ring vid musklick på `<select>` (ren UX)
**Nästa cykel bör undvika**: Accessibility-kategori. Kandidater: Tools, Performance, Neutrality audit, Mobile UX, SEO & meta. Senaste 3: Setup, Content, Accessibility — alla unika, så öppet val.

---

## Cykel 1 — 2026-05-01 — Content

**Bedömning**: Projektet är längre kommet än CLAUDE.md antyder — 18 sidor, 14 verktyg, 13 datafiler redan byggda. Tidsfaktor: 9 veckor till feature-frys (1 juli) → fokus ska vara fakta + polering, inte nya features. Konkret gap: partier.html visar mandat 2022, valresultat 2022, ideologi och beskrivning som text utan synlig källrad. Det bryter mot MÅSTE-kravet "Källhänvisningar synliga för användaren". Endast en CTA längst ner i kortet ("Besök officiell sida") signalerar käll-koppling, men inte tydligt.
**Alternativ jag valde bort**:
- WebAIM-kontrasttest (Accessibility) — fungerande område, sista commit gjorde redan kontrastfix på SD-gult, mer värde i variation över kategorier
- Lighthouse-pass (Performance) — kräver lokal körning, inte trivialt automatiserad i denna miljö
- Lägga till valmanifest 2026 i datat (Content) — för tidigt, partierna släpper närmare juni
**Gjort**:
1. Importerade relevant projektstatus från CLAUDE2.md till nya CLAUDE.md "Current State" (stack, verktyg, data, senaste arbete, öppna luckor)
2. Lade till synlig källrad i `renderPartyCard` (app.js:148-154) under stats-blocket: "Källor: riksdagen.se (mandat) · val.se (valresultat)"
3. Ny CSS-klass `.party-sources` i styles.css:744-760 — använder befintliga tokens, behåller dark/light-kontrast
4. Markerade Fas 1-uppgift "Alla 8 partier har baspresentation med källor" som delvis (`[~]`) i ROADMAP.md med tydlig restlista
5. Lade till tre nya backlog-poster: utöka källrader till opinion/historik/mandat/budget/rostningar, partispecifika riksdagslänkar i parties.json, källor till `beskrivning`/`ideologi`-text
**Resultat**:
- Renderad HTML verifierad via Node — ren, semantisk, externa länkar har `rel="noopener"`
- Inga tester berör renderingen — befintlig test-suite ej påverkad
- Källraden använder två primärkällor (riksdagen.se, val.se), inte sekundärkällor
- Källraden är generisk och visar samma URL för alla 8 partier — partispecifika länkar är en framtida cykels jobb
**Nästa cykel bör undvika**: Content-kategori. Lämpliga kandidater: Accessibility (WebAIM-kontrast), Mobile UX, Neutrality audit, Performance, eller Tools.

---

## Cykel 0 — Initial — Setup

**Bedömning**: Projektet behöver autonom drift-infrastruktur innan cykler kan börja.
**Alternativ jag valde bort**: Direkt feature-arbete (ingen mening utan logg), neutralitetsgranskning (kan inte mätas utan baseline).
**Gjort**: CLAUDE.md, PROJECT_LOG.md, ROADMAP.md, DECISIONS.md skapade.
**Resultat**: Klar för Cykel 1.
**Nästa cykel bör undvika**: Setup-kategori (engångs).
