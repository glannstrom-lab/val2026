# ROADMAP

Levande dokument. Du som autonom produktägare uppdaterar detta baserat på vad du lär dig.

## Hård deadline
**1 juli 2026** — feature-frys. Efter detta endast faktauppdateringar och buggfixar.
**14 september 2026** — valdagen. Sajten ska vara stabil i 2 veckor innan.

## Faser

### Fas 1: Grund (nu → ~maj 2026)
- [ ] Verktyg fungerar end-to-end utan fel
- [~] WCAG 2.1 AA-baseline uppnådd för alla sidor
      (Cykel 2: light-mode accent fixad 2.75→4.97, fyra select/input fick
      synlig fokusring. Cykel 7: heading-hierarki fixad i om.html, coalition,
      timeline. Cykel 12: 44×44 px target size på nav-toggle och btn.
      Cykel 13: form-labels (4 element). Cykel 17: theme-toggle 44×44 +
      diff-info-btn pseudo-element-utvidgad klickyta. Cykel 18: aria-live
      på coalition-summary + candidates-results-info. Cykel 24: sr-only h2
      anchors på alla 9 tool-sidor som hade h1→h3-hopp.
      Kvar: full axe-core-körning, screenreader-test, HTML-validering W3C,
      3G-laddtidstest.)
- [~] Alla 8 partier har baspresentation med källor
      (Cykel 1: synlig källrad i partikortet — riksdagen.se + val.se. Kvar:
      partispecifika riksdagslänkar, källor till `beskrivning`/`ideologi`-text.)
- [ ] Mobilvänlig layout verifierad

### Fas 2: Innehåll (maj → juli 2026)
- [ ] Alla partier har sina valmanifest 2026 inlagda när de publiceras
- [ ] Sakfrågejämförelse täcker minst 15 frågor
- [ ] Politisk kompass har minst 25 påståenden, kalibrerad mot faktisk partipolitik
- [ ] Kampanjtidslinjen uppdateras kontinuerligt med viktiga händelser

### Fas 3: Polering (juli → september 2026)
- [ ] Faktagranskning av all text mot primärkällor
- [ ] Performance-optimering: Lighthouse 100 där möjligt
- [~] SEO och social sharing
      (Cykel 3: alla 17 sidor har komplett OG/Twitter/canonical, robots.txt
      och sitemap.xml på plats. Kvar: skapa og-image.png 1200x630, lägg till
      JSON-LD strukturerad data där relevant, verifiera med Google Search
      Console efter publicering.)
- [ ] Lasttest inför valdag

### Fas 4: Valperiod (september 2026)
- [ ] Frys features
- [ ] Övervakning aktiverad
- [ ] Kontaktväg för faktafel öppen

## Backlog (oprioriterad — du prioriterar i Phase 1)

[Lägg till och ta bort fritt baserat på vad du upptäcker]

- Källhänvisningssystem som visas synligt för användaren
  (Cykel 1: partier.html. Cykel 6: historik.html (riksdagsvalen 2018/2022) och
  mandat.html (Sainte-Laguë + vallagen). Verifierat i Cykel 6 att opinion.html,
  budget.html, rostningar.html redan har källor. Kvar: kompass.html (CHES-data),
  quiz.html (matchningsalgoritm), tidslinje.html per händelse, sakfragor.html
  redan har källor per parti-position men inte tydligt högt upp på sidan.)
- **Tidslinje-balansering**: aktuell fördelning M=5, L=3, MP=3, S=2, SD=2, V=1, C=1,
  KD=1 av totalt 36 händelser. Förväntat baserat på riksdagsmandat: S~11, SD~8,
  M~7, V/C~3, KD/MP/L~2. S och SD kraftigt underrepresenterade. Lägg till
  faktabaserade händelser från 2022-2026 — t.ex. S oppositionsstrategi,
  SD-utspel/utskottsarbete, V-motioner, KD-initiativ. (Identifierat Cykel 4)
- Verifiera och inför partispecifika riksdagslänkar i parties.json (`riksdagen_url`)
- Källor till `beskrivning` och `ideologi` i parties.json (per parti)
- Print-vänlig stil för väljartestets resultat
- Delningsbar URL för väljartest-resultat (utan tracking)
- Språkgranskning av jämförande text för neutralitet
- Stöd för enkel svenska-version
- Skapa `assets/og-image.png` (1200×630) för social sharing — referens i meta-taggar finns ej, behövs för Twitter/Facebook-preview
- JSON-LD strukturerad data
  (Cykel 8: WebSite på index.html, AboutPage + BreadcrumbList på om.html.
  Cykel 15: ItemList av Person för 8 partiledare på partier.html via
  scripts/gen-partier-ld.cjs.
  Cykel 21: ItemList av BroadcastEvent för 12 valdebatter på debatter.html
  via scripts/gen-debatter-ld.cjs.
  Kvar: Person[] på kandidater.html (~80 kandidater — stor LD, kanske bara
  topp-5 per parti).)
- ~~CSS-konflikter att scope:a~~ **Löst i Cykel 23**: alla tre konflikter
  (`.party-card-header`, `.party-stat-value/label`, `.block-label`) scopade
  under sina parents (`.budget-party-card`, `.party-stat-bar`, `.block-bar-left/right`).
- Bildoptimering av PNG-logotyper (totalt 53 KB, SD/MP/S är 9–13 KB var). WebP eller
  manuell komprimering kan spara 30–50 %.
- **Implementera party-detail-modal**: klick på partikort öppnar fördjupad vy
  (ledare-info, ideologi, mandathistorik). Tomma `<div class="party-modal">`
  togs bort i Cykel 16 (dödkod utan implementation). Backloggad som potentiell
  feature — kräver design + a11y (focus-trap, Esc, aria-modal).
- **aria-live regions för dynamiska uppdateringar** (identifierat Cykel 13). Quiz-
  resultat, sakfrågefilter, koalitionsbyggare uppdaterar UI utan att skärmläsare
  annonserar förändringen. Kandidater för aria-live="polite": quiz-results-container,
  compare-issues, coalition-summary. Inte aria-live="assertive" — för aggressivt.
