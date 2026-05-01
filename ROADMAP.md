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
      synlig fokusring via `--focus-ring`. Kvar: full axe-core-körning på
      varje sida, screenreader-test, HTML-validering W3C, 3G-laddtidstest.)
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
  (Cykel 1: påbörjat på partier.html. Behöver göras motsvarande på opinion.html,
  historik.html, mandat.html, budget.html, rostningar.html.)
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
- JSON-LD strukturerad data (Organization för portalen, Event för debatter, Person för partiledare/kandidater)
- **CSS-konflikter att scope:a** (identifierat Cykel 5):
  - `.party-card-header` — global definition (rad 676) krockar med variant inom
    `.budget-party-card` (rad 4286). Borde scopas: `.budget-party-card .party-card-header`.
  - `.party-stat-value` / `.party-stat-label` — global (rad 732/739) krockar med
    votes-specifik variant (rad 3877/3857). Borde scopas under votes-parent.
  - `.block-label` — opinion-page (rad 4899) krockar med block-bar-variant (rad 5863).
    Borde scopas. Kräver visuell verifikation före commit.
- Bildoptimering av PNG-logotyper (totalt 53 KB, SD/MP/S är 9–13 KB var). WebP eller
  manuell komprimering kan spara 30–50 %.
