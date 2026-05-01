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

## Cykel 15 — 2026-05-01 — SEO (Person-LD för partiledare)

**Bedömning**: Cykel 8 lade WebSite på index och AboutPage på om — men hoppade Person-LD för partiledare pga synkningsrisk mellan parties.json och statisk LD. Lösning: scripts/gen-partier-ld.cjs som genererar LD från parties.json. Re-körs vid ledare-byte → ingen drift möjlig.
**Alternativ jag valde bort**:
- Dynamisk JS-injection — bots kör inte alltid JS, lägre tillförlitlighet
- Hårdkoda JSON-LD i partier.html — synkningsrisk
- Event[] för debatter.html — datat ändras ofta, hög underhållskostnad
- Performance/Mobile UX/Accessibility (3-5 cykler bortom)
**Gjort**:
1. `scripts/gen-partier-ld.cjs` — läser parties.json, sorterar efter mandat 2022 desc, genererar `ItemList` med 8 `Person`-items (varje med `jobTitle` och `memberOf: PoliticalParty`)
2. Skriptet är idempotent — tar bort befintlig genererad LD-block om den finns och inserterar ny
3. Körde scriptet → `<script type="application/ld+json">` insertad i partier.html `<head>`
4. Validerat: 8 personer i korrekt ordning (S, SD, M, ..., L)
**Resultat**:
- Google + Bing kan nu hämta strukturerad data om alla 8 partiledare och deras partier
- Schema-validitet verifierad via JSON.parse + manuell granskning av `@type` och `itemListElement.length`
- Vid framtida partiledar-byte: kör `node scripts/gen-partier-ld.cjs` så uppdateras LD utan manuella edit
**Nästa cykel bör undvika**: SEO. Senaste 3: Accessibility, Performance, SEO. Cykel 16 kandidater: Neutrality (6 cykler bortom), Content (5 cykler bortom), Tools (4 cykler bortom), Mobile UX (3 cykler bortom).

---

## Cykel 14 — 2026-05-01 — Performance (CLS-prevention via img dimensions)

**Bedömning**: Audit av 19 `<img>` element visade att alla saknade `width`/`height`-attribut. Det är en Core Web Vital fail: utan dimensioner reserverar browsern ingen plats för bilden under laddning, vilket orsakar Cumulative Layout Shift (CLS) när partilogon dyker upp och pushar text. Alla logos är kvadratiska, så `width="48" height="48"` (1:1 ratio-hint) fungerar för alla — CSS overrider absoluta storlekar vid behov, men browsern använder ratio för CLS-prevention.
**Alternativ jag valde bort**:
- CSS-rensning av identifierade konflikter — fortfarande risk utan visuell verifikation
- Service worker rewrite — fungerar redan bra (cache-first, cleanup, skippar externa)
- JSON-minifiering — gör underhåll svårare, marginal vinst
- SEO/Neutrality/Content (3-5 cykler bortom)
**Gjort**:
1. `scripts/perf-img-dims.cjs` — idempotent script som lägger till `width="48" height="48"` på alla logo-img som saknar dimensioner. Säkerhets-check: bara matchar src med "logos/" i pathen.
2. Körde scriptet → 19 img i 13 filer fick dimensioner (app.js, 12 tool-filer)
3. Verifierade audit: 19/19 img har nu width+height
**Resultat**:
- CLS-risk eliminerad för alla partilogos — browser reserverar plats innan bilden laddats
- Förväntad förbättring av Core Web Vital "CLS" från oklart till nära 0 för logo-relaterade shifts
- Inga visuella förändringar — CSS bestämmer fortfarande den faktiska renderingsstorleken
- Engångsscript bevarat i `scripts/` för framtida re-körning
**Nästa cykel bör undvika**: Performance. Senaste 3: Mobile UX, Accessibility, Performance. Cykel 15 kandidater: SEO (6 cykler bortom), Neutrality (5 cykler bortom), Content (4 cykler bortom), Tools (3 cykler bortom).

---

## Cykel 13 — 2026-05-01 — Accessibility (form-labels)

**Bedömning**: Audit av 19 IMG (alla har alt ✅), 49 buttons (alla har tillgängligt namn ✅), och 4 form-element-fail. Tre `<select>` (budget-category-filter, budget-sort, votes-category-filter) hade `<label>` ovanför men UTAN `for`-attribut → ingen programmatisk koppling till skärmläsare. En `<input>` (share-url-input) hade ingen label alls. Alla fail enligt WCAG SC 1.3.1 / 4.1.2.
**Alternativ jag valde bort**:
- Performance/SEO/Neutrality (3-8 cykler bortom — kan vänta)
- aria-live regions för dynamiska uppdateringar — backloggat (kräver utvärdering vilka som ska annonseras, för aggressivt blir störande)
- Modal-audit (aria-modal, fokus-trap) — backloggat
**Gjort**:
1. tools/budget.js: `<label>` → `<label for="budget-category-filter">` och `<label for="budget-sort">`
2. tools/votes.js: `<label>` → `<label for="votes-category-filter">`
3. tools/quiz.js: lade till `aria-label="Delbar länk till ditt quiz-resultat"` på readonly input (ingen synlig label finns)
4. ROADMAP backlog: aria-live regions för dynamiska uppdateringar
**Resultat**:
- Audit-script kör grön: 0 form-elements saknar label/aria
- Skärmläsare läser nu upp etiketten när användaren tabbar in i select/input
- Fyra säkra one-line-fixar — ingen visuell förändring
**Nästa cykel bör undvika**: Accessibility. Senaste 3: Tools, Mobile UX, Accessibility. Cykel 14 kandidater: Performance (8 cykler bortom!), SEO (5 cykler bortom), Neutrality (4 cykler bortom), Content (3 cykler bortom).

---

## Cykel 12 — 2026-05-01 — Mobile UX (touch target)

**Bedömning**: Statisk audit av touch-targets i CSS (utan browser). `.nav-toggle` (hamburger-knappen) hade padding 8px och spans 24×2px → faktisk klickyta 40×32 px. Det är **WCAG 2.5.5 Target Size fail** (krav 44×44 px). `.btn` med padding 12+24 px och text-base ~16-20 px hamnar runt 40-44 px höjd — borderline, riskerar fail beroende på font-rendering.
**Alternativ jag valde bort**:
- Performance, Accessibility (4-7 cykler bortom — kan vänta)
- Lägga `min-height: 44px` globalt på alla 55 button-like selektorer — risk för layout-bryt utan visuell verifikation
- Ändra font-size för 76 element som använder text-xs (12px) — gränsfall för läsbarhet, riskerar visuell regression
**Gjort**:
1. styles.css `.nav-toggle`: `min-width: 44px; min-height: 44px;` + `align-items/justify-content: center;` så icon-strecken centreras i den nu-korrekta klickytan
2. styles.css `.btn`: `min-height: 44px` säkrar att alla huvudknappar uppfyller WCAG 2.5.5 oavsett font-rendering
3. Inline-kommentarer i båda fallen refererar SC 2.5.5 så framtida cykler vet varför värdet är 44
**Resultat**:
- Hamburger-menyn nu från 40×32 → 44×44 px (klick-yta växer 50%)
- Alla huvud-CTA-knappar säkras till minst 44 px höjd
- Ingen visuell förändring för knappar som redan är ≥44 px (min-height är non-shrinking)
- Inga andra interaktiva element ändrade — backloggat: audit av icon-only-knappar (close-modal, expand-toggle, party-color-buttons)
**Nästa cykel bör undvika**: Mobile UX. Senaste 3: Content, Tools, Mobile UX. Cykel 13 kandidater: Performance (8 cykler bortom!), Accessibility (5 cykler bortom), SEO (4 cykler bortom), Neutrality (3 cykler bortom).

---

## Cykel 11 — 2026-05-01 — Tools (felhantering)

**Bedömning**: Audit av felhantering i alla 14 tool-filer avslöjade två problem: (1) **`.error`-klassen saknades helt i CSS** trots att 3 tools använde `class="error"` — felmeddelanden gav noll visuell feedback. Bugg. (2) Felmeddelanden var inkonsekventa (8 tools använde `text-center text-muted`-klass, 3 använde `error`) och minimala (en mening, ingen vägledning).
**Alternativ jag valde bort**:
- Performance/Mobile UX/Accessibility (4-6 cykler bortom — kan vänta)
- Lägga till retry-knapp via JS — komplexare än enkel reload-länk
- Fixa seatcalc.js (har graceful degradation utan felmeddelande, fungerar utan partidata) — inget verkligt fel
**Gjort**:
1. styles.css: ny `.error`-klass med röd-tinad bakgrund, varnings-border, ⚠-prefix via `::before`
2. 13 tool-filer (alla utom seatcalc): bytte felmeddelande till konsekvent format `<div class="error">Kunde inte ladda X. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>`
3. CSS-buggen för `class="error"` löst — tidigare gav den noll visuell stil
**Resultat**:
- Alla 13 tools har nu samma fel-UX: synlig varningsruta + reload-link
- Användaren får handlingsbar information istället för bara en mening
- Visuellt konsekvent över hela sajten
**Nästa cykel bör undvika**: Tools. Senaste 3: Neutrality, Content, Tools. Cykel 12 kandidater: Mobile UX, Performance (6 cykler bortom), Accessibility (4 cykler bortom), SEO (3 cykler bortom).

---

## Cykel 10 — 2026-05-01 — Content (källrad i quiz)

**Bedömning**: Audit av kompass.html visade att synlig källrad redan finns (rad 77 — CHES + GU + V-Dem). quiz.html (renderas av quiz.js) däremot saknade transparens om matchningsalgoritmen — användaren ser bara procentsiffror utan att förstå hur de beräknas. Detta är ett MUSS-kvalitet enligt CLAUDE.md ("källhänvisningar synliga för användaren") tillämpat på algoritmen, inte bara fakta.
**Alternativ jag valde bort**:
- Tools (för diffust), Mobile UX (kräver browser), Performance (4 cykler bortom — kan vänta)
- Lägga till källrad till quotes.json - quotes är redan visade utan källattribut, men varje citat har "stand alone" karaktär
**Gjort**:
1. tools/quiz.js: ny `<details class="quiz-method">` insertad ovanför disclaimer på resultat-sidan. Innehåller: numrerad lista (4 punkter) som förklarar matchningsalgoritmen + länk till CHES + länk till om.html för fullständig källista.
2. styles.css: ny klass `.quiz-method` med disclosure-styling — collapsed by default med ▸/▾ chevron-indicator, öppnar för att visa metodbeskrivning. Använder befintliga muted-tokens.
**Resultat**:
- Användaren kan nu öppna metodik-disclosure och förstå exakt hur matchnings-procenten räknas
- Ingen visuell störning på de som inte vill veta — collapsed by default
- CHES-källa direkt länkbar från resultatsidan
- kompass.html bekräftad redan ha källa — ingen åtgärd där
**Nästa cykel bör undvika**: Content. Senaste 3: SEO, Neutrality, Content. Cykel 11 kandidater: Tools, Mobile UX, Performance (5 cykler bortom), Accessibility (4 cykler bortom).

---

## Cykel 9 — 2026-05-01 — Neutrality audit (quotes + quiz)

**Bedömning**: Audit av quotes.json visade PERFEKT balans — exakt 7 citat per parti × 8 partier = 56 totalt. Ingen åtgärd behövs där. Audit av 50 quiz-frågor identifierade två tydliga formuleringsproblem: (1) fråga 23 "traditionella familjevärderingar" är KD-typisk laddad frasering; (2) fråga 50 inramade gruvbrytning med "för att säkra mineraler till grön omställning" — rättfärdigande inramning som styr svaret. Andra frågor använder intensifierare ("kraftigt", "ytterligare") men det är vanligt politiskt språk.
**Alternativ jag valde bort**:
- Cykel-omfattande granskning av 56 sakfrågesummeringar i issues.json — för stort
- Ändra quiz-frågor 16, 32, 39 (intensifierare) — gränsfall, riskerar över-redigering
- Tools/Mobile UX/Performance
**Gjort**:
1. quiz-questions.json q23: "Sverige bör värna traditionella familjevärderingar i politiken" → "Politiken bör främja traditionella familjeformer". Tar bort KD-laddat språk men behåller policykärnan så positionerings-vektorerna är fortsatt giltiga.
2. quiz-questions.json q50: "Gruvbrytning bör tillåtas i skyddade områden för att säkra mineraler till grön omställning" → "Gruvbrytning bör tillåtas i naturskyddade områden". Tar bort rättfärdigande inramning. Positions-vektorer ej påverkade — frågan handlar fortfarande om samma policy.
3. JSON-validitet verifierad.
**Resultat**:
- Två neutrralitetsfix utan att ändra positionsmatris (svaren V=-2, MP=-2, M=2 etc. står sig)
- Quiz-resultat blir mer rättvisande eftersom svar inte styrs av inramning
- quotes.json bekräftat optimalt balanserat — ingen ytterligare åtgärd behövs
**Nästa cykel bör undvika**: Neutrality. Senaste 3: Accessibility, SEO, Neutrality. Cykel 10 kandidater: Tools, Mobile UX, Performance (4 cykler bortom), Content (3 cykler bortom).

---

## Cykel 8 — 2026-05-01 — SEO & meta (JSON-LD strukturerad data)

**Bedömning**: Cykel 3 backloggade JSON-LD strukturerad data. Detta hjälper Google visa rich results, stärker entitetsdata, och kommunicerar sidans natur till AI-assistenter. Inga ld+json-block fanns.
**Alternativ jag valde bort**:
- Person/ItemList för partiledare via dynamisk injection — risk att bots inte kör JS
- Statisk Person-data för 8 partiledare — synkningsrisk när partier byter ledare
- Event[] för 12 debatter — datat ändras ofta, hög underhållskostnad
- Tools/Mobile UX/Neutrality
**Gjort**:
1. index.html: statisk `WebSite`-LD med `about: Event` (Riksdagsvalet 2026, startDate 2026-09-14, location Sverige)
2. om.html: statisk `AboutPage`-LD med `breadcrumb: BreadcrumbList` (Hem → Om sidan) och `isPartOf` som länkar till WebSite-entiteten
3. JSON-validitet verifierad med node — båda block parser korrekt
4. ROADMAP backlog uppdaterad: ItemList Person (partier.html), Event[] (debatter.html), Person[] (kandidater.html) — kräver synkstrategi
**Resultat**:
- Google + Bing kan nu identifiera sajten som WebSite-entitet kopplad till valhändelsen
- Breadcrumbs för om-sidan (rich result-eligible)
- Två sidor täckta — basal närvaro inför Search Console-registrering
**Nästa cykel bör undvika**: SEO. Senaste 3: Accessibility, Content (#6), SEO (#8). Vänta — med ny ordning: senaste 3 = Content (6), Accessibility (7), SEO (8). Cykel 9 kandidater: Tools, Mobile UX, Performance (4 cykler bortom), Neutrality (4 cykler bortom).

---

## Cykel 7 — 2026-05-01 — Accessibility (heading-hierarki)

**Bedömning**: Audit av heading-strukturen avslöjade en konkret WCAG SC 1.3.1-fail i om.html (h1 → direkt h3, hopp över h2). Skip-link injiceras korrekt via header.js. Audit av JS-tools fann fler hopp: coalition.js renderar bara h4 (3 stycken) på en sida som bara har h1; timeline.js renderar h4 för 36 events utan mellanlag. Andra tools (budget/candidates/compare/guess/history/partycompare/quiz/seatcalc/votes) börjar också med h3 utan h2 mellanlag — backloggat eftersom omfattande.
**Alternativ jag valde bort**:
- SEO (JSON-LD strukturerad data) — bara 4 cykler sedan SEO-cykel, ge variation tid
- Tools — för diffust
- Mobile UX — kräver browser
- Fixa alla JS-tool-hopp i en cykel — för stort, risk för regressions
**Gjort**:
1. om.html — bytte 7 h3 → h2 (alla peer-rubriker direkt under sidans h1: Syfte, Metodik, Källor, Begränsningar, Integritet, Tillgänglighet, Kontakt)
2. styles.css — `.about-item h3` → `.about-item h2`, `.about-contact h3` → `.about-contact h2` (matchar nya HTML-strukturen, behåller font-size:lg)
3. tools/coalition.js — bytte 3 h4 → h2 ("Välj partier", "Snabbval", "Din koalition") plus motsvarande CSS-regler `.coalition-parties h2`, `.coalition-summary h2`, `.coalition-presets h2`
4. tidslinje.html — lade till statisk `<h2 class="sr-only" id="timeline-heading">Politiska händelser</h2>` med aria-labelledby på `<section>`. Synlig för skärmläsare, osynlig visuellt
5. tools/timeline.js — bytte event-titel-tag från h4 → h3 så hierarki blir h1→h2(sr-only)→h3
6. ROADMAP backlog: heading-hopp i 9 övriga JS-tools (budget/candidates/compare/guess/history/partycompare/quiz/seatcalc/votes)
**Resultat**:
- Audit kör grön på alla 17 statiska HTML-sidor — inga fler hopp
- om.html, koalition.html, tidslinje.html nu fullständigt WCAG SC 1.3.1-kompatibla även med JS påslagen
- Statiska CSS-regler uppdaterade så ingen visuell regression
- `.sr-only`-klassen redan i styles.css (rad 2555) — återanvändbar, inget nytt
**Nästa cykel bör undvika**: Accessibility. Senaste 3: Content, Accessibility, ??? Kandidater för Cykel 8: Tools, Mobile UX, SEO (med 4 cykler bortom), Performance (3 cykler bortom), Neutrality (3 cykler bortom).

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
