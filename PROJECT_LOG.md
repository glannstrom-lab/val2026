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

## Cykel 35 — 2026-05-01 — Content (DECISIONS.md uppdatering)

**Bedömning**: DECISIONS.md hade bara Cykel 0-entry om autonom drift. Sedan dess har 34 cykler tagit många viktiga arkitekturbeslut som inte dokumenterats. När en framtida utvecklare (eller jag i en framtida session) läser DECISIONS för kontext finns ingen historik.
**Alternativ jag valde bort**:
- Skippa dokumentation — försämrar projektets långsiktiga underhåll
- Skriva 30+ entries — overengineering, många cykel-fixar är taktiska, inte arkitektur
- Mobile UX/Neutrality/SEO (4-6 cykler bortom)
**Gjort**:
1. Lade till 4 nya DECISIONS.md-entries för de mest arkitektoniskt viktiga besluten:
   - **Källrad-mönster**: synlig under data, inte bara CTA (Cykel 1, 6, 10)
   - **JSON-LD via scripts/**: idempotenta node-scripts istället för bygg-pipeline (Cykel 15, 21, 34)
   - **Service worker hybrid-strategi**: cache-first generellt, SWR för data-filer (Cykel 33)
   - **Konsekvent felmeddelande-mönster** över 14 tools (Cykel 11)
2. Format följer befintlig template (Kontext / Alternativ / Val / Konsekvens / Upphäver)
**Resultat**:
- DECISIONS.md är nu en faktiskt nyttig arkitektur-historik
- Framtida utvecklare ser varför vissa val gjorts
- Append-only-regel respekterad — inga ändringar i Cykel 0-entry
**Nästa cykel bör undvika**: Content. Senaste 3: Performance, Tools, Content. Cykel 36 kandidater: Mobile UX, Neutrality (7 cykler bortom), Accessibility (4 cykler bortom), SEO (5 cykler bortom).

---

## Cykel 34 — 2026-05-01 — Tools (run-all.cjs deploy-kedja)

**Bedömning**: Mobile UX-audit av compass.js visade att touchstart-handler redan finns (rad 423) — tooltip fungerar på mobil. Inget att åtgärda. Pivot till Tools: 8 idempotenta scripts har ackumulerats i `scripts/`-mappen under Cyklerna 3, 5, 14, 15, 21, 24, 26, 27. Varje deploy som ändrar data eller HTML kan kräva re-körning av flera. Saknas en samlingsrunner.
**Alternativ jag valde bort**:
- npm scripts — kräver package.json som mot CLAUDE.md "ingen build-process"
- Bash-script — fungerar inte på Windows utan WSL
- Mobile UX touch-targets på fler element (backloggad: compare-issue-expand)
**Gjort**:
1. `scripts/run-all.cjs` — kör alla 8 scripts i logisk ordning (data → SEO/HTML → JSON-LD → hygiene → preload). execSync per script, kapture sista raden som status, fail-fast om någon krashar.
2. Verifierade vid första körning: 8/8 lyckades, ingen krash
3. **Upptäckt**: 3 scripts är "best-effort idempotent" (seo-meta, gen-partier-ld, gen-debatter-ld). De regenererar block från data och kan ge formaterings-skillnader mellan körningar.
4. Lade till varning i run-all.cjs-headern: "Granska git diff efter run-all och committa bara avsiktliga ändringar."
**Resultat**:
- Single command (`node scripts/run-all.cjs`) kör hela kedjan
- Tydligt dokumenterad bagage: 5 fullständigt idempotenta + 3 best-effort
- Vid framtida partiledar-byte eller debate-tillägg räcker en kommando
- Reverterade test-körnings-ändringar (HTML hade fått minor formatering)
**Nästa cykel bör undvika**: Tools. Senaste 3: Accessibility, Performance, Tools. Cykel 35 kandidater: Mobile UX (varierande), Content (8 cykler bortom!), Neutrality (6 cykler bortom), SEO (4 cykler bortom).

---

## Cykel 33 — 2026-05-01 — Performance (SWR för data-filer)

**Bedömning**: Service worker hade enbart cache-first-strategi. Funkar bra för HTML/CSS/JS (CACHE_NAME-bump invaliderar) men problematiskt för `data/*.json` som ändras ofta under valrörelsen (opinion uppdateras månadsvis, debatter tillkommer, tidslinje växer). Användare får aldrig nya data förrän nästa CACHE_NAME-bump. Bättre: stale-while-revalidate för data-filer.
**Alternativ jag valde bort**:
- Network-first för data — ger långsam offline-respons
- No-cache för data — bryter offline-läsningen helt
- Mobile UX/Content/Neutrality (4-7 cykler bortom)
**Gjort**:
1. sw.js fetch-listener: refaktorerad till två strategier baserat på URL.
   - Match `/data/*.json` → stale-while-revalidate
   - Allt annat → cache-first (oförändrat beteende)
2. Två nya helper-funktioner: `cacheFirst(request)` och `staleWhileRevalidate(request)`. Båda har samma error-handling som tidigare.
3. CACHE_NAME bumpad v15 → v16 så uppdaterad sw.js levereras till alla användare
4. Inline-kommentarer förklarar strategi-valet och CLAUDE.md Lessons Learned dokumenterar mönstret
**Resultat**:
- Användare får färskast möjligt data utan att behöva CACHE_NAME-bump
- Offline-läsning fortsatt fungerar (SWR returnerar cached om network failar)
- Inga regressionsrisker — HTML/CSS/JS-flödet är oförändrat (cache-first)
- Förberedelse för Fas 2: när partier släpper valmanifest och timeline uppdateras, slutanvändare ser ändringar nästan direkt
**Nästa cykel bör undvika**: Performance. Senaste 3: SEO, Accessibility, Performance. Cykel 34 kandidater: Mobile UX (8 cykler bortom!), Content (7 cykler bortom), Neutrality (5 cykler bortom), Tools (4 cykler bortom).

---

## Cykel 32 — 2026-05-01 — Accessibility (aria-current navigation)

**Bedömning**: Header.js sätter `class="active"` på navigations-länken som motsvarar aktuell sida (visuell indicator). Men ingen `aria-current="page"`. Skärmläsare kan inte berätta för användaren "du är på den här sidan". WCAG SC 2.4.8 Location.
**Alternativ jag valde bort**:
- aria-current på alla länkar — fel, ska bara vara på den aktuella
- Ändra `class="active"` till bara aria-current — tar bort visuell styling
- Mobile UX/Performance/Content (4-6 cykler bortom)
**Gjort**:
1. components/header.js (4 ställen): lägga till `aria-current="page"` när `currentPage === item.href` (matchar `class="active"`-villkor). Påverkar: dropdown-items, om-länken (desktop nav), mobil-nav links, mobil-nav om-länk
2. sw.js: bumpa CACHE_NAME v14 → v15 (header.js ändras → invalidera cache)
**Resultat**:
- Skärmläsare annonserar "current page" när användaren tabbar genom navigation till aktuell sida
- 4 ställen i header.js har nu attributet
- Inga visuella förändringar — class="active" stilen behållas
**Nästa cykel bör undvika**: Accessibility. Senaste 3: Tools, SEO, Accessibility. Cykel 33 kandidater: Mobile UX (7 cykler bortom), Performance (5 cykler bortom), Content (6 cykler bortom), Neutrality (4 cykler bortom).

---

## Cykel 31 — 2026-05-01 — SEO (description audit)

**Bedömning**: Audit av description-meta på alla 17 sidor. SEO-rekommendation är 70–160 tecken. 16 av 17 inom intervall ✅. **kandidater.html** hade endast 63 tecken — under-optimerat. Den kortaste description får sämst CTR i sökmotor-resultat.
**Alternativ jag valde bort**:
- Skriva om alla 17 descriptions för att maximera CTR — risk för regression och inte värt det
- Generera SVG OG-image — Twitter/Facebook stödjer inte alltid SVG. Backloggat
- Person[]-LD för 73 kandidater — för stor LD-block. Backloggat
**Gjort**:
1. kandidater.html description: 63 → 128 tecken: "Sök bland riksdagskandidater inför valet 2026. Filtrera på parti och valkrets, läs om kandidaternas erfarenhet och fokusområden."
2. Uppdaterade matchande og:description och twitter:description (fanns identiska kopior från Cykel 3-scriptet)
3. Audit-resultat: alla 17 sidor nu inom 76-128 tecken ✅
**Resultat**:
- Kandidat-sidan får mer beskrivande SERP-snippet i Google
- Konsekvens mellan description, og:description, twitter:description bibehållen
**Nästa cykel bör undvika**: SEO. Senaste 3: Neutrality, Tools, SEO. Cykel 32 kandidater: Accessibility (7 cykler bortom!), Mobile UX (6 cykler bortom), Content (5 cykler bortom), Performance (4 cykler bortom).

---

## Cykel 30 — 2026-05-01 — Tools (noscript-fallback partier.html)

**Bedömning**: CLAUDE.md MUSS-krav: "Fungerar utan JavaScript för all kärninformation (verktygen får kräva JS)". Partier är kärninformation. partier.html renderar via JS — utan JS ser användaren tom sida. Bryter mot kravet. opinion.html, historik.html etc har samma problem men en sida åt gången.
**Alternativ jag valde bort**:
- Implementera SSR — bryter mot CLAUDE.md "ingen build-process"
- Servera statiskt HTML duplicerat — synk-risk med data
- SEO/Accessibility/Mobile UX (4-8 cykler bortom)
**Gjort**:
1. partier.html: `<noscript>` insertad efter parties-grid div. Statiskt fallback med 8 partier (namn + ledare + officiell webbplats), källänkar till riksdagen.se + val.se
2. styles.css `.noscript-fallback` + `.noscript-parties`: muted-tinad bakgrund, borderad ruta, accent-länkar
3. Användare utan JS får full kärninformation via fallback (8 partier + ledare + officiella sidor)
4. Dokumentation: dataduplikation accepterad — ledare-uppdateringar måste göras på två ställen (parties.json + partier.html noscript). Säkrast: re-kör en hypotetisk script för att synka, eller manuell synk vid ledar-byten.
**Resultat**:
- partier.html uppfyller nu MUSS-kravet "fungerar utan JS för kärninformation"
- Backloggat: motsvarande noscript på opinion.html, historik.html, om.html (om de behöver). De flesta tools (kompass, quiz) faller inom undantaget "verktygen får kräva JS"
**Nästa cykel bör undvika**: Tools. Senaste 3: Performance, Neutrality, Tools. Cykel 31 kandidater: SEO (9 cykler bortom!!!), Accessibility (6 cykler bortom), Mobile UX (5 cykler bortom), Content (4 cykler bortom).

---

## Cykel 29 — 2026-05-01 — Neutrality (kompass-axel-text)

**Bedömning**: Bred audit av tidigare ej-granskade datafiler. compass-positions.json, polls-history.json, votes.json, candidates.json, election-history.json, budget.json — alla har acceptabelt språk. compass-positions har "hårdare linje" på M och S men det är symmetrisk (båda får samma term). Hittade dock ett ord på kompass.html "Så läser du kompassen": Y-axelns auktoritära beskrivning innehåller "nationalism" — laddat ord som kan tolkas som etnonationalism eller civic nationalism beroende på läsare.
**Alternativ jag valde bort**:
- Stora textomskrivningar — inte motiverat efter audit
- Granska budget.json party_summaries motion_titles — partiernas egna titlar, neutralt rapporterande
- SEO/Accessibility/Mobile UX (3-7 cykler bortom)
**Gjort**:
1. kompass.html: "Traditionella värden, nationalism, ordning" → "Traditionella värden, nationell identitet, ordning". Mer neutralt språk + konsekvent med SD-position-beskrivningen i compass-positions.json som använder "nationell identitet"
**Resultat**:
- En neutralare formulering på kompass-sidan
- Konsekvent terminologi med data-fil
- Audit över 6 datafiler bekräftar att projektet är språkligt välbalanserat
**Nästa cykel bör undvika**: Neutrality. Senaste 3: Content, Performance, Neutrality. Cykel 30 kandidater: SEO (8 cykler bortom!!), Accessibility (5 cykler bortom), Mobile UX (4 cykler bortom), Tools (3 cykler bortom).

---

## Cykel 28 — 2026-05-01 — Performance (service worker cache bump)

**Bedömning**: Service worker har CACHE_NAME = 'val2026-v13'. Jag har gjort 27 cykler med modifikationer (CSS, JS, HTML, data) — användare som tidigare besökt sajten har v13-cachen och får INTE de senaste fixarna förrän cachen invalideras. Detta är en konkret leveransbugg.
**Alternativ jag valde bort**:
- Auto-version baserat på timestamp/git-hash — kräver build-step (mot CLAUDE.md)
- network-first cache-strategi istället för cache-first — ändring av paradigm är riskfylld
- skipWaiting + clients.claim är redan på plats, så v14-update aktiveras direkt vid nästa besök
- SEO/Neutrality/Accessibility (4-7 cykler bortom)
**Gjort**:
1. sw.js CACHE_NAME: 'val2026-v13' → 'val2026-v14'
2. Inline-kommentar om versionsbump-konvention så framtida deploys vet att de ska bumpa
3. CLAUDE.md Lessons Learned: dokumenterad praxis "bumpa CACHE_NAME vid varje deploy med kodändringar"
**Resultat**:
- Användare som öppnar sajten efter denna deploy får automatiskt v14 (skipWaiting + clients.claim är redan i sw.js)
- Alla 27 cyklars ändringar levereras till slutanvändare nu
- Konvention dokumenterad så framtida cykler vet att bumpa
**Nästa cykel bör undvika**: Performance. Senaste 3: Tools, Content, Performance. Cykel 29 kandidater: SEO (7 cykler bortom), Neutrality (8 cykler bortom!!), Accessibility (5 cykler bortom), Mobile UX (3 cykler bortom).

---

## Cykel 27 — 2026-05-01 — Content (valmanifest-stub)

**Bedömning**: Tidsfaktor: 1 maj 2026, 9 veckor till feature-frys. Fas 2 i ROADMAP säger "Alla partier har sina valmanifest 2026 inlagda när de publiceras" (typiskt maj-juni). Bättre att förbereda strukturen NU så att tillägg sker utan kodändring senare. Då räcker det att uppdatera `parties.json`.
**Alternativ jag valde bort**:
- Skapa en separat `valmanifest.json` — onödig komplexitet, valmanifest är en attribut på parti
- Hardkoda 8 valmanifest-länkar med "kommer snart"-status — synlig stub gör sajten ofärdig
- Performance/SEO/Neutrality (4-6 cykler bortom)
**Gjort**:
1. `scripts/add-valmanifest-field.cjs` — idempotent script som lägger `valmanifest_2026_url: null` på varje parti
2. Körde scriptet → 8/8 partier har nu fältet
3. app.js renderPartyCard: villkorlig rendering — om URL finns visas "Valmanifest 2026 →"-länk i framträdande accent-färg ovanför "Besök officiell sida"-länken
4. styles.css `.party-link-manifest`: framträdande färg (accent), bold, så användaren ser direkt när manifest publiceras
5. ROADMAP Fas 2 markerad delvis (`[~]`) — strukturen klar, väntar på att respektive parti publicerar
**Resultat**:
- Sajten är "ready" för partimanifest-publicering — bara `parties.json` ska uppdateras
- Inget syns på partikorten just nu (alla URL är null)
- När fältet uppdateras till en URL: tydlig accent-färgad länk dyker upp på det specifika partikortet
- Mönster för "feature ready, awaiting data" etablerat
**Nästa cykel bör undvika**: Content. Senaste 3: Mobile UX, Tools, Content. Cykel 28 kandidater: Performance (5 cykler bortom), SEO (6 cykler bortom), Neutrality (7 cykler bortom!), Accessibility (4 cykler bortom).

---

## Cykel 26 — 2026-05-01 — Tools (code hygiene)

**Bedömning**: Audit hittade 15 dev-rester av typen `console.log('X initialized')` i tools (12), app.js (3) och service worker-registrering. Dessa är dev-debugging som inte behövs i produktion — minor performance-förlust + brus i devtools-konsolen för slutanvändare.
**Alternativ jag valde bort**:
- Behålla console.log som debug-aid — slutanvändaren har inte nytta av det
- Lägga till en build-step som strip:ar console-anrop — bryter mot CLAUDE.md "ingen build-process"
- Konvertera till conditional debug-mode — overengineering för en statisk sajt
**Gjort**:
1. `scripts/hygiene-console.cjs` — idempotent script som tar bort hela rader som matchar `^\s*console\.log\(.*\);?\s*$`. Behåller `console.error` och `console.warn` (felhantering)
2. Körde scriptet → 15 console.log-rader borttagna från 12 filer
3. Audit-grep verifierar: 0 `console.log` kvar i prod-kod
**Resultat**:
- Renare devtools-konsol för slutanvändare
- Marginal performance-vinst (15 färre funktionsanrop vid sidladdning)
- 7 idempotenta scripts i `scripts/`-mappen — utgör en ren toolkit för framtida cykler
**Nästa cykel bör undvika**: Tools. Senaste 3: Accessibility, Mobile UX, Tools. Cykel 27 kandidater: Performance (4 cykler bortom), SEO (5 cykler bortom), Neutrality (6 cykler bortom), Content (7 cykler bortom!).

---

## Cykel 25 — 2026-05-01 — Mobile UX (fluid hero-rubrik)

**Bedömning**: Audit av media-query coverage. De största riskerna (`.budget-table`, `.compass-svg`, `.container`, `.btn`) har redan responsiva setups. Hittade dock att `.page-hero h1` använder fast `font-size: var(--text-4xl)` (40 px) utan mobile-skalning — på 320 px-mobiler blir det 12,5% av skärmbredden men kan ändå orsaka tight radbrytning. 17 sidor använder denna stil.
**Alternativ jag valde bort**:
- Lägga till @media (max-width: 480px) override — fungerar men breakpoint-baserat hopp
- Hårdkodade rem-värden — mindre flexibelt
- Neutrality/SEO/Content (4-6 cykler bortom)
**Gjort**:
1. styles.css `.page-hero h1`: `font-size: var(--text-4xl)` → `font-size: clamp(var(--text-3xl), 6vw, var(--text-4xl))`. Fluid skalning från 2rem (mobil) till 2.5rem (desktop). 6vw = 19.2px på 320px-skärm men minimum är text-3xl = 32px, så det går inte under 32px någonstans.
2. Inline-kommentar förklarar varför.
3. CLAUDE.md Lessons Learned: clamp()-mönstret dokumenterat
**Resultat**:
- Sidrubriker skalar nu fluently på alla 17 sidor med .page-hero
- Inga breakpoint-snärje — clamp() är modernare än media queries för typografi
- 320px-mobil får 32px rubrik (läsbar), 1024px+ får 40px (designvärde)
- Browser support: clamp() finns sedan 2020 (Chrome 79, Firefox 75, Safari 13.1)
**Nästa cykel bör undvika**: Mobile UX. Senaste 3: Performance, Accessibility, Mobile UX. Cykel 26 kandidater: Neutrality (6 cykler bortom), Content (7 cykler bortom!), SEO (5 cykler bortom), Tools (4 cykler bortom).

---

## Cykel 24 — 2026-05-01 — Accessibility (heading-anchors)

**Bedömning**: Cykel 7 backloggade heading-hopp i 9 tool-sidor. Mönstret etablerat på tidslinje.html (Cykel 7): statisk `<h2 class="sr-only">` med aria-labelledby gör hierarkin korrekt utan visuell ändring. Skärmläsare läser ankaret, övriga ser inget.
**Alternativ jag valde bort**:
- Synlig h2 (visuell rubrik) — designval ingen tidigare gjort, hög risk för regression
- Byta tool-rendered h3 till h2 — skulle ändra många kodbaser, h2 är överraskande visuellt
- Performance/SEO/Tools/Mobile UX (4-9 cykler bortom)
**Gjort**:
1. `scripts/a11y-h2-anchors.cjs` — idempotent script som inserterar `<h2 id="X-heading" class="sr-only">` precis före tool-container. Lägger till `aria-labelledby="X-heading"` på närmaste section. Skippar sidor som redan har sr-only h2.
2. Initial regex `<div\s+id="X">` matchade inte sidor med `class=` på samma rad. Iterativ förbättring → `<div\b[^>]*\bid="X"[^>]*>` flexiblare.
3. Körde scriptet (två iterationer) → 9/9 sidor uppdaterade
4. Audit verifierar: alla 9 sidor har nu h: 1,2 (statisk hierarki) + h3+ från tool-rendering
**Resultat**:
- WCAG SC 1.3.1 (Info and Relationships) komplett uppfylld för alla tool-sidor
- Skärmläsare läser sektionsrubriker innan tool-innehåll
- Inga visuella förändringar (sr-only)
- ROADMAP backlog uppdaterad med komplett accessibility-status
**Nästa cykel bör undvika**: Accessibility. Senaste 3: Tools, Performance, Accessibility. Cykel 25 kandidater: Mobile UX (8 cykler bortom!), Neutrality (5 cykler bortom), Content (6 cykler bortom), SEO (4 cykler bortom).

---

## Cykel 23 — 2026-05-01 — Performance (CSS-konflikter scopade)

**Bedömning**: Cykel 5 backloggade 3 reella CSS-klasskonflikter där samma selector definierades två gånger med olika stilar. Audit nu via grep + HTML/JS-användning bekräftade att varje konflikt har distinkta parents: budget-versionen av `.party-card-header` är inom `.budget-party-card`, votes-versionen av `.party-stat-label/value` är inom `.party-stat-bar`, och block-bar-versionen av `.block-label` är inom `.block-bar-left/right`. Säker scoping möjlig utan visuell verifikation.
**Alternativ jag valde bort**:
- Klass-rename (skulle kräva uppdatering i JS också) — för stort
- !important-hack — kosmetiskt fel, inte arkitekturellt
- Tools/SEO/Mobile UX/Accessibility (3-9 cykler bortom)
**Gjort**:
1. styles.css `.party-card-header` (rad 4401) → `.budget-party-card .party-card-header`
2. styles.css `.party-stat-label` (rad 3963) → `.party-stat-bar .party-stat-label`
3. styles.css `.party-stat-value` (rad 3983) → `.party-stat-bar .party-stat-value`
4. styles.css `.block-label` (rad 5979) → `.block-bar-left .block-label, .block-bar-right .block-label`
5. Audit verifierar: 4 globala definitioner kvar (en per selector), ingen dublett. ROADMAP backlog avbockad.
**Resultat**:
- 3 CSS-arkitektur-konflikter lösta — varje selector har nu unik scope och unik styling
- Specificity är consistent: parent + child = 0.0.2.0 vs global 0.0.1.0, så scopade vinner som förväntat
- Ingen risk för cascade-bugg där fel CSS appliceras på fel element
- Inga visuella förändringar i happy-path (samma styles, samma elements)
**Nästa cykel bör undvika**: Performance. Senaste 3: SEO, Tools, Performance. Cykel 24 kandidater: Mobile UX (7 cykler bortom!), Accessibility (6 cykler bortom), Neutrality (4 cykler bortom), Content (5 cykler bortom).

---

## Cykel 22 — 2026-05-01 — Tools (localStorage felhantering)

**Bedömning**: Audit av localStorage-anrop. quiz.js har excellent felhantering — try/catch på save/load/clear, 24h-expiration. header.js saknade try/catch på 3 anrop: `getPreferredTheme()`, `setTheme()`, och system-prefers-listener. Detta orsakar TypeError i Safari privat-mode (localStorage kastar SecurityError) eller om quotan är full — och de error-fallen är vanliga.
**Alternativ jag valde bort**:
- Bygga centralized localStorage-wrapper med inbyggd fallback — för stor refactor för en cykel
- Ta bort theme-persistance helt — degraderar UX
- Performance/Mobile UX/Accessibility (4-8 cykler bortom)
**Gjort**:
1. components/header.js `getPreferredTheme()`: try/catch runt `localStorage.getItem('theme')`. Vid fel: falla tillbaka till system-preferens.
2. components/header.js `setTheme()`: try/catch runt `localStorage.setItem`. Vid fel: temat appliceras visuellt men sparas inte (graceful degradation).
3. components/header.js system-prefers-listener: try/catch runt `localStorage.getItem`, fallback till null så `if (!userPref)` triggar systemändring.
4. Inline-kommentarer förklarar vilka fall som täcks (Safari privat-mode, quota full).
**Resultat**:
- Sajten kraschar inte längre i Safari privat-mode eller vid full localStorage-quota
- Theme-toggle fungerar fortfarande (visuellt) även när storage failar
- 3 robusta one-line try-catch-fixar utan logikförändring i happy-path
**Nästa cykel bör undvika**: Tools. Senaste 3: Content (#19), SEO (#21), Tools. Cykel 23 kandidater: Performance (9 cykler bortom!!), Mobile UX (6 cykler bortom), Accessibility (5 cykler bortom), Neutrality (3 cykler bortom).

---

## Cykel 21 — 2026-05-01 — SEO (Event-LD för debatter)

**Bedömning**: Cykel 8/15 etablerade JSON-LD pattern. Backloggat: Event[] för debatter.html. Datat har 12 schemalagda valdebatter med datum/tid/kanal/partideltagare — perfekt för schema.org BroadcastEvent. Risken med dynamiska data: re-kör scriptet vid ändring.
**Alternativ jag valde bort**:
- Person[] för kandidater — 80 kandidater, för stor LD-block. Backloggat: överväg topp-5 per parti
- Hårdkoda Event-LD i debatter.html — synkningsrisk
- Dynamisk JS-injection — bots läser inte alltid JS
**Gjort**:
1. `scripts/gen-debatter-ld.cjs` — läser debates.json, sorterar kronologiskt, genererar `ItemList` med 12 `BroadcastEvent`-items (startDate ISO med Sverige-TZ +02:00, eventStatus mappad från status-fält, publishedOn som BroadcastService med kanalnamn, about för topics)
2. `clean()`-helper rensar undefined-fields så LD blir kompakt
3. Idempotent — ersätter befintlig ItemList-block om det finns
4. Körde scriptet → 12 BroadcastEvent insertade i debatter.html `<head>`
5. Validerat: JSON.parse OK, kronologisk ordning, första debat 2026-03-21 09:00, sista 2026-09-11 (slutdebatt)
**Resultat**:
- Google Knowledge Graph kan nu visa valdebatterna som rich result
- BroadcastEvent + publishedOn ger Google möjlighet att lista dem som TV/radio-event
- Vid debatt-ändring: kör `node scripts/gen-debatter-ld.cjs`
- 4 av 5 idempotenta scripts i `scripts/` nu (seo-meta, perf-preload, perf-img-dims, gen-partier-ld, gen-debatter-ld)
**Nästa cykel bör undvika**: SEO. Senaste 3: Neutrality, Content (#19), SEO. Cykel 22 kandidater: Performance (8 cykler bortom!), Tools (6 cykler bortom), Mobile UX (5 cykler bortom), Accessibility (4 cykler bortom).

---

## Cykel 20 — 2026-05-01 — Neutrality (timeline-events)

**Bedömning**: Granskning av 36 timeline-events för värdeladdat språk. 34 av 36 är neutralt formulerade. Två tydligt laddade: (1) Budget 2025: "Regeringen presenterar **historisk** försvarssatsning" — "historisk" är dramatiserande adjektiv som upphöjer regeringens insats. (2) Event 2025-10-15 titel "**Vårdkris**: Rekordlånga köer" — "vårdkris" är politiskt term som vissa partier använder för att dramatisera, fakta är de rekordlånga köerna.
**Alternativ jag valde bort**:
- "kraftigt", "ytterligare", "skärper tonen" — vanliga politiska intensifierare, OK i kontext
- "Tillfälliga visitationszoner... för att bekämpa gängkriminalitet" — regeringens egen rättfärdigande men det är lagens uttalade syfte
- "Valbudgeten" — etablerad svensk politisk term
- SEO/Performance/Tools/Mobile UX
**Gjort**:
1. timeline.json e019 (Budget 2025): "presenterar historisk försvarssatsning och fortsatta skattesänkningar" → "höjer försvarsanslag till 2,4 % av BNP och fortsätter med skattesänkningar". Tar bort dramatiserande adjektiv, lägger till konkret siffra.
2. timeline.json e026 (2025-10-15): titel "Vårdkris: Rekordlånga köer" → "Rekordlånga vårdköer". Behåller fakta-claim om köerna men tar bort politiskt termer.
3. JSON-validitet verifierad.
**Resultat**:
- Två fakta-baserade ersättningar för dramatiserande språk
- Övriga 34 events är acceptabelt formulerade — flagga att timeline-balans (S/SD underrepresenterade) fortfarande gäller och är backloggad
- "vårdkris" var det mest värdeladdade ordet kvar i datat
**Nästa cykel bör undvika**: Neutrality. Senaste 3: Accessibility, Content, Neutrality. Cykel 21 kandidater: Performance (7 cykler bortom!), SEO (6 cykler bortom), Tools (5 cykler bortom), Mobile UX (4 cykler bortom).

---

## Cykel 19 — 2026-05-01 — Content (README + felmeddelande-konsistens)

**Bedömning**: Audit av kompass.html visade redan komplett struktur (källor, disclaimer, axel-förklaring) — inget att lägga till. Pivot avslöjade två konsekvensluckor: (1) `app.js:184` använde fortfarande gamla felmeddelande-formatet `<p class="text-center text-muted">` — Cykel 11 missade detta. (2) `README.md` var kraftigt föråldrad — säger "24 frågor" (faktiskt 50), listar bara compass + quiz (faktiskt 14 tools), fel valdatum (13 sept istället för 14), saknar 12 av 14 verktyg.
**Alternativ jag valde bort**:
- Lägga till metodik-disclosure på kompass.html — redan implementerat (CHES-källa + axel-förklaring + disclaimer-toggle)
- Performance/SEO/Neutrality (4-9 cykler bortom)
**Gjort**:
1. app.js:184 — `<p class="text-center text-muted">Kunde inte ladda partidata.</p>` → `<div class="error">...med reload-länk</div>`. Konsekvent med Cykel 11:s pattern över alla 14 tools.
2. README.md — komplett rewrite:
   - Korrekt valdatum (14 september 2026)
   - Live-URL
   - Alla 14 verktyg listade med beskrivning
   - Tech stack uppdaterad (PWA, 18 sidor, multi-page)
   - Datakällor i tabell-format med primär/sekundär-distinktion
   - Tillgänglighets-sektion (WCAG 2.1 AA)
   - Hänvisning till CLAUDE.md och DECISIONS.md
**Resultat**:
- 100% felmeddelande-konsistens nu (alla 14 tools + app.js)
- README.md speglar faktiskt projekt — inte arvet från Phase 1
- Externa besökare till repot får korrekt bild av vad som finns
**Nästa cykel bör undvika**: Content. Senaste 3: Mobile UX, Accessibility, Content. Cykel 20 kandidater: Neutrality (10 cykler bortom!), SEO (5 cykler bortom), Performance (6 cykler bortom), Tools (4 cykler bortom).

---

## Cykel 18 — 2026-05-01 — Accessibility (aria-live regions)

**Bedömning**: Backloggat från Cykel 13. Inga aria-live regions fanns. Det betyder att skärmläsar-användare inte får feedback när dynamiskt innehåll uppdateras. Två tydliga kandidater: `.coalition-summary` (mandat-räknare uppdateras vid val av parti) och `.candidates-results-info` (kandidatsöknings-räknare uppdateras vid filter). Dessa är diskreta sammanfattnings-element — inte hela listor — så `aria-live="polite"` blir inte störande.
**Alternativ jag valde bort**:
- aria-live på hela quiz-result-vyn — bättre att flytta fokus istället, mindre noisy
- aria-live på compare-issue-listan — för stor mängd att annonsera vid varje filter
- aria-live="assertive" — alltid för aggressivt för icke-kritiska updates
- Performance/Tools/Mobile UX (3-7 cykler bortom)
**Gjort**:
1. tools/coalition.js: `<div class="coalition-summary">` → med `aria-live="polite" aria-atomic="true"`. När användaren toggle:ar partier annonserar SR nya totala mandat
2. tools/candidates.js: `<div class="candidates-results-info">` → med samma attribut. När filter ändras annonseras "X kandidater (filtrerat)"
3. `aria-atomic="true"` säkrar att hela texten läses, inte bara det som ändrades — bra för räknare-fraseringar
**Resultat**:
- 2 säkra fixar — lägger till attribut på existerande element, inga visuella förändringar
- Skärmläsare får nu feedback vid de två viktigaste dynamiska sammanfattningarna
- Inte överanvänt — lägger inte aria-live på hela listor (skulle bli störande)
**Nästa cykel bör undvika**: Accessibility. Senaste 3: Tools, Mobile UX, Accessibility. Cykel 19 kandidater: Neutrality (9 cykler bortom!), Content (8 cykler bortom), SEO (4 cykler bortom), Performance (5 cykler bortom).

---

## Cykel 17 — 2026-05-01 — Mobile UX (icon-button touch targets)

**Bedömning**: Cykel 12 fixade `.btn` och `.nav-toggle`. Audit av icon-only-buttons hittade 5 till med risk: `.theme-toggle` (40×40 px), `.diff-info-btn` (18×18 px — kraftigt under 44), `.compare-issue-expand` och `.timeline-event-toggle` (~32 px), och `.nav-toggle` (redan fixad).
**Alternativ jag valde bort**:
- Tvinga `.diff-info-btn` till 44×44 visuellt — skulle förstöra tabellradlayouten
- Fixa `.compare-issue-expand` och `.timeline-event-toggle` — backloggat: hela `.compare-issue-header` och `.timeline-event-header` är klickbara redan, så toggle-knappen är inom större touch target
- Neutrality/Content/Accessibility (3-7 cykler bortom)
**Gjort**:
1. styles.css `.theme-toggle`: 40×40 → 44×44 px (minor visual ändring, inom design-tolerans)
2. styles.css `.diff-info-btn`: behöll visuell 18×18 men lade till `position: relative` + `::before { inset: -13px }` så klickytan utvidgas till 44×44 px utan att ändra tabellradlayouten
3. Inline-kommentarer refererar SC 2.5.5
4. CLAUDE.md Lessons Learned: "Pseudo-element-utvidgad klickyta"-mönstret dokumenterat
**Resultat**:
- 2 fler interaktiva element uppfyller WCAG 2.5.5
- `.diff-info-btn` har nu samma klickyta som `.btn` (44×44) trots 18×18 visuell design
- Inga tabellrad-layout-regressioner — pseudo-element är osynligt
- Återstående: `.compare-issue-expand` och `.timeline-event-toggle` (backloggade — header är redan klickbart)
**Nästa cykel bör undvika**: Mobile UX. Senaste 3: SEO, Tools, Mobile UX. Cykel 18 kandidater: Neutrality (8 cykler bortom!), Content (7 cykler bortom), Accessibility (4 cykler bortom), Performance (3 cykler bortom).

---

## Cykel 16 — 2026-05-01 — Tools (städa dödkod)

**Bedömning**: Började som Neutrality-cykel — audit av issues.json positions visade balanserad stance-fördelning (V t.ex. 35 för / 11 emot, M 23/11; rimlig spridning) och att laddade ord ("kraftigt", "rättvis") är symmetriskt fördelade eller refererar partiers egen retorik. Inget tydligt att åtgärda. Pivoterade till Tools — modal-accessibility-audit avslöjade att `<div class="party-modal">` i partier.html med `role="dialog"` och `aria-modal="true"` är **dödkod**: ingen JS-kod öppnar/stänger den, ingen CSS stilar den, kommentar säger "rendered by app.js" men ingen sådan funktion finns.
**Alternativ jag valde bort**:
- Implementera party-modal som ny feature — för stort för en cykel, feature-frys 1 juli närmar sig (9 veckor)
- Behålla dödkoden — gömd komplexitet utan värde, missvisande för framtida utvecklare
- Modal-keyboard-fix — irrelevant när modal aldrig syns
**Gjort**:
1. Tog bort `<div class="party-modal">`-blocket (7 rader) från partier.html. Säkert: ingen CSS, ingen JS, aldrig synlig
2. ROADMAP backlog: dokumenterat som potentiell framtida feature med a11y-krav (focus-trap, Esc, aria-modal)
3. Audit av övrig keyboard support visade att projektet generellt är bra: tools/compass.js har tabindex+keydown, compare/timeline har aria-expanded+keydown, coalition har aria-pressed
**Resultat**:
- partier.html nu 7 rader kortare, ingen dödkod
- Code hygiene + transparens: dödkod är ofta värre än ingen kod alls
- Inga regressionsrisker (modalen aldrig synlig)
**Nästa cykel bör undvika**: Tools. Senaste 3: Performance, SEO, Tools. Cykel 17 kandidater: Neutrality (7 cykler bortom!), Content (6 cykler bortom), Mobile UX (4 cykler bortom), Accessibility (3 cykler bortom).

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
