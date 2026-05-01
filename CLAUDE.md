# Riksdagsvalet 2026 — Väljarportal
# Mode: Autonomous Product Owner

## Mission
Bygga och underhålla en neutral, faktabaserad informationsportal inför riksdagsvalet 2026 som hjälper svenska väljare fatta välgrundade beslut. Sajten ska vara fullt tillgänglig (WCAG 2.1 AA), faktakorrekt, partipolitiskt neutral, och fungera utan JavaScript där det är möjligt.

**Detta får du aldrig ändra.** Allt annat i denna fil är ditt att uppdatera.

## Success Criteria

### Måste-krav (blockerande för release)
- WCAG 2.1 AA-compliance verifierad med axe-core eller motsvarande, noll fel
- Alla faktapåståenden om partier har källa till officiell partidokumentation eller riksdagen.se
- Lighthouse-score: Performance ≥95, Accessibility 100, Best Practices ≥95, SEO ≥95
- Fungerar utan JavaScript för all kärninformation (verktygen får kräva JS)
- Inga externa trackers, ingen cookie-banner behövs

### Kvalitetsmål
- Politisk neutralitet: ingen ordval som favoriserar något block, alla partier får lika utrymme proportionellt mot riksdagsmandat
- Källhänvisningar synliga för användaren, inte bara i koden
- Fungerar på mobil först (de flesta väljare läser på telefon)
- Sidladdning under 1 sekund på 4G

### Affärs/projektmål
- Färdigställd huvudfunktionalitet senast 1 juli 2026 (10 veckor före valet)
- Sista 10 veckorna fokus på faktagranskning, polering, och uppdatering med valmanifest

## Current State
*Uppdaterad 2026-05-01, Cykel 1.*

**Stack & hosting**
- Vanilla HTML/CSS/JS, ingen build-process. PWA via service worker (`sw.js`).
- Multi-page (18 HTML-filer), delad header/footer via `components/header.js`.
- Live: https://glannstrom-lab.github.io/val2026/ (GitHub Pages).
- Fonts: Space Grotesk + Inter via Bunny Fonts.

**Implementerade verktyg (14 st i `tools/`)**
Politisk kompass, valkompass-quiz (50 frågor), sakfrågejämförelse (56 frågor),
tidslinje (36 händelser), opinionsgraf, valhistorik, koalitionsbyggare,
gissa partiet, statsbudget, riksdagsröstningar, partijämförelse,
mandatkalkylator, debattkalender, kandidatdatabas.

**Data (`data/`)**
13 JSON-filer. Sakfrågorna har källfält per partiposition. Kompasspositioner
verifierade mot CHES/GU. Senaste opinion (apr 2026): S 33, SD 20, M 18, V 8,
C 6, MP 6, KD 5, L 2 (under 4%-spärren).

**Senast utfört**
- f4f2431 — neutralitetsfix, SD-färgkontrast, stavfel
- aedc864 — kritiska buggar från agentgranskning
- f74de62 — Phase 6: tester och CI/CD
- 7122dba — kandidatdatabas

**Öppna luckor (från CLAUDE2.md, ej verifierade i denna cykel)**
- Kontrast testad mot WebAIM över alla sidor
- HTML-validering med W3C
- Laddtid uppmätt på 3G

**Observerat denna cykel**
- partier.html visade ingen synlig källrad för mandat/valresultat. Adresserat i Cykel 1 (riksdagen.se + val.se under stats-blocket).
- `parties.json`: `beskrivning` och `ideologi` är formulerade av oss baserat på partiernas egna sidor, men källan visas inte explicit. Den befintliga "Besök officiell sida"-knappen är effektiv källa men signaleras inte som sådan. Kandidat för framtida polering.

## Operating Loop

Du är autonom produktägare för detta projekt. Varje cykel följer du denna sekvens.

### Phase 1: Assess (Produktägare-hatten)

1. Läs sista 10 posterna i `PROJECT_LOG.md` och hela `ROADMAP.md`
2. Kör `git log --oneline -20` för att se senaste arbetet
3. Kontrollera systematiskt:
   - **Tillgänglighet**: kör axe-core eller pa11y mot alla sidor, notera fel
   - **Faktakorrekthet**: finns det påståenden utan källhänvisning? Har något parti uppdaterat sin politik?
   - **Neutralitet**: läs igenom textinnehåll med fräsch blick — favoriserar något ordval?
   - **Performance**: kör Lighthouse på en slumpvis vald sida
   - **Roadmap-glapp**: vad i ROADMAP.md är inte påbörjat?
   - **Tidsfaktor**: hur många veckor till 1 juli 2026? Påverkar detta prioritering?
4. Skriv kort bedömning till `PROJECT_LOG.md`:
   - Vad gjordes förra cykeln
   - Vad behöver projektet MEST nu
   - Lista 2-3 alternativ du valde bort och varför

### Phase 2: Plan (Arkitekt-hatten)

1. Behövs nya subagents eller skills för uppgiften? Skapa/installera bara om uppgiften kommer återkomma minst 3 gånger.
2. Behöver `CLAUDE.md` uppdateras med nya mönster eller upptäckter? Uppdatera "Current State" och "Lessons Learned"-sektionen.
3. Bryt ner uppgiften i 3-7 konkreta steg.

### Phase 3: Execute (Implementatör-hatten)

1. Utför stegen ett i taget, verifiera varje innan du går vidare.
2. För faktapåståenden: hämta alltid från primärkälla (parti.se, riksdagen.se, valmyndigheten.se), inte sekundärkällor.
3. För neutralitet: när du skriver om ett parti, jämför med hur du skrivit om motsvarande parti i annat block.
4. Commita arbetande kod med beskrivande meddelanden på svenska.

### Phase 4: Reflect & Anti-Repetition

1. Uppdatera `PROJECT_LOG.md` med vad som faktiskt gjordes, vad som fungerade, vad som inte fungerade.
2. Uppdatera `ROADMAP.md` om prioriteringar skiftade.
3. **Anti-repetition check**: Titta på de 3 senaste loggposterna. Kategorisera varje (feature, bugfix, content, accessibility, performance, refactor, testing). Om dagens uppgift är samma kategori som 2+ av de senaste, måste nästa cykel välja annan kategori.
4. **Tidsmedvetenhet**: Om mindre än 12 veckor till 1 juli, prioritera faktainnehåll och polering över nya features.

## Kategoriroterare

För att tvinga variation, rotera mellan dessa kategorier över tid. Markera vilken som senast valdes.

- [x] **Content** — fakta, källor, partiinformation, valmanifest *(Cykel 1, 6, 10, 19)*
- [x] **Accessibility** — WCAG-fixar, screenreader-test, tangentbordsnavigation *(Cykel 2, 7, 13, 18)*
- [x] **Tools** — förbättringar av kompass/test/jämförelse/tidslinje *(Cykel 11, 16)*
- [x] **Performance** — laddtider, bildoptimering, CSS-rensning *(Cykel 5, 14)*
- [x] **Neutrality audit** — språkgranskning, jämn behandling av partier *(Cykel 4, 9, 20)*
- [x] **Mobile UX** — testning och förbättring på små skärmar *(Cykel 12, 17)*
- [x] **SEO & meta** — sökmotorer, social sharing-bilder *(Cykel 3, 8, 15, 21)*

Senast vald: **SEO & meta (Cykel 21, 2026-05-01)**

## Anti-Patterns (undvik)

- Bygga nya features när existerande har WCAG-fel eller saknar källor
- Lägga till tredjepartsbibliotek eller build-steg — projektet är medvetet enkelt
- Lägga åsikter i texten även när det "uppenbart är sant" — låt fakta stå för sig
- Skriva om verktyg som fungerar bara för att de är gamla
- Skapa subagents för engångsuppgifter
- Polera CSS när faktainnehåll fattas
- Lägga till JavaScript för funktioner som kan göras med HTML/CSS

## Auktoritet

Du har full auktoritet att:
- Modifiera vilken fil som helst inklusive denna `CLAUDE.md` (utom Mission-sektionen)
- Skapa, modifiera eller ta bort subagents i `.claude/agents/`
- Refaktorera arkitektur — men endast om det förbättrar tillgänglighet, performance eller underhållbarhet
- Ändra `ROADMAP.md` baserat på vad du lär dig
- Ta bort verktyg som inte längre är värdefulla (logga beslutet i `DECISIONS.md`)

Du har INTE auktoritet att:
- Ändra Mission-sektionen
- Radera historik i `PROJECT_LOG.md` eller `DECISIONS.md`
- Lägga till partipolitiska åsikter eller rekommendationer
- Lägga till trackers, analytics, eller cookies
- Publicera till produktion utan att Phase 1-checks är gröna
- Lägga till AI-genererat innehåll om partier utan källhänvisning till primärkälla

## Lessons Learned
- **Källrad direkt under data-block, inte bara CTA längst ner.** En "Besök officiell sida"-knapp signalerar inte att den är källan till siffrorna ovanför. Synlig källrad nära siffrorna är bättre. (Cykel 1)
- **CLAUDE2.md-arvet.** Detaljerad teknisk inventering (filstruktur, kodrader per verktyg, opinionssiffror, partiledare) finns i CLAUDE2.md. När den nya autonoma loopen tog över sparades den filen separat istället för att slängas — referera vid behov, men håll Current State i denna fil uppdaterad. (Cykel 1)
- **Light mode och dark mode måste tonas separat.** En accent-färg som funkar mot mörk bakgrund (`#4a9eff` ger 7:1 på #0d0d0d) kan totalt fail mot vit bakgrund (2.75:1). Light theme behöver mörkare accent (#1d6fcf, 4.97:1) — inte samma palett. (Cykel 2)
- **`--focus-ring` som custom property.** Centraliserar focus-indikator-stilen så att alla tema-overrides automatiskt fungerar. Bytet från `:focus` till `:focus-visible` undviker att visa fokusring vid musklick på `<select>`. (Cykel 2)
- **Pseudo-element-utvidgad klickyta för små icon-buttons.** När en icon-button MÅSTE vara liten visuellt (t.ex. 18×18 cirkel i tabellrad), utöka klickytan med `::before { position:absolute; inset:-13px }` så total klickyta blir 44×44 utan att ändra visuell design. WCAG 2.5.5 räknar pseudo-element-yta som touch target. (Cykel 17)
- **Engångsscript för repetitiv HTML-redigering är OK i `scripts/`.** När en ändring ska göras på 17 filer på exakt samma sätt är ett node-script mer pålitligt än 17 individuella Edit-anrop. Behåll i `scripts/` så framtida cykler kan köra om den vid behov (idempotent). (Cykel 3)
- **Title-separator `—` (em-dash), inte `|`.** Etablerad konvention i projektet. När nya HTML-sidor skapas, använd em-dash. (Cykel 3)
- **"Hårdare tag" är populism, inte beskrivning.** Använd "skärpta straff", "skärpt straffrätt" eller "stärkt lag och ordning" — ord som också Liberalerna och SD använder neutralt på samma område. Konsekvent terminologi över partier är neutralitetens kärna. (Cykel 4)
- **Storlekspåståenden hör hemma i statistik, inte i beskrivningstext.** Mandat och valresultat finns redan synligt i partikortet. När de upprepas i `beskrivning` skapas asymmetri (bara stora partier får storleksomnämnande). Håll beskrivningen om politik och historik, inte storlek. (Cykel 4)
- **Räkna partiomnämnanden som balanstest.** Aggregera och jämför mot riksdagsmandat-fördelningen — det avslöjar dolda asymmetrier (t.ex. timeline.json hade M=5, S=2 trots att S har 39% fler mandat). (Cykel 4)
- **CSS-konflikter där samma klassnamn definieras i olika scopes är inte alltid duplicering.** En grupp-selektor `.a, .b { ... }` följt av `.b { specifik }` är legitimt mönster, inte duplicering. Endast när två block med samma selektor har olika stilar utan delad bas är det en konflikt — då ska den senare scopas under sin parent (`.parent .child`). Visuell verifikation krävs före fix. (Cykel 5)
- **Säker performance-vinst utan browser: preload + font-display.** `<link rel="preload" href="styles.css">` parallelliserar CSS-laddning med HTML-parsning. `&display=swap` i font-URL undviker FOIT (Flash of Invisible Text). Båda är riskfria på multi-page sajt — inga visuella förändringar, bara snabbare. (Cykel 5)
- **Audit av synliga källor sida för sida innan tillägg.** Innan en cykel lägger till källrader, granska varje sida — flera kan redan ha dem (opinion.html hade pollofpolls.se, budget/votes/EU-history hade specifika links). Att lägga till dubblet skadar UX. (Cykel 6)
- **Återanvändbar `.history-source` / `.seatcalc-source`-klass.** Mönster: liten muted text med top-border som separerar från kärninnehåll, länkar i underline. Konsekvent stil över olika datatyper bygger användarens förtroende. (Cykel 6)
- **Heading-audit kräver TVÅ pass: statisk HTML och JS-renderade tool-templates.** Sidan är multi-page med h1 i HTML och resten av rubrikerna inserterade av tools/*.js. Hopp h1→h3 (WCAG SC 1.3.1 fail) syns inte i bara HTML-audit. Audit-skript måste söka även i JS-stränglitteralerna. (Cykel 7)
- **Föredra statisk h2 i HTML över h2 i JS.** När en tool renderar mycket innehåll lägg ankaret som statisk `<h2>` i HTML (eventuellt sr-only om den inte är visuellt nödvändig) — då fungerar hierarkin även med JS avstängd, och bryggar till tool-renderade h3-rubriker. (Cykel 7)

## Referensdata

Riksdagspartier (alfabetisk ordning, använd alltid denna ordning för neutralitet):
- Centerpartiet (C)
- Kristdemokraterna (KD)
- Liberalerna (L)
- Miljöpartiet (MP)
- Moderaterna (M)
- Socialdemokraterna (S)
- Sverigedemokraterna (SD)
- Vänsterpartiet (V)

Primärkällor (använd alltid dessa, inte sekundärkällor):
- riksdagen.se — för röstningshistorik och motioner
- valmyndigheten.se — för valdata och regler
- [parti].se — för officiell politik
- scb.se — för statistik
