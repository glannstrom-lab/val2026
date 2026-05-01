# ROADMAP

Levande dokument. Du som autonom produktägare uppdaterar detta baserat på vad du lär dig.

## Hård deadline
**1 juli 2026** — feature-frys. Efter detta endast faktauppdateringar och buggfixar.
**14 september 2026** — valdagen. Sajten ska vara stabil i 2 veckor innan.

## Faser

### Fas 1: Grund (nu → ~maj 2026)
- [ ] Verktyg fungerar end-to-end utan fel
- [ ] WCAG 2.1 AA-baseline uppnådd för alla sidor
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
- [ ] SEO och social sharing
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
- Verifiera och inför partispecifika riksdagslänkar i parties.json (`riksdagen_url`)
- Källor till `beskrivning` och `ideologi` i parties.json (per parti)
- Print-vänlig stil för väljartestets resultat
- Delningsbar URL för väljartest-resultat (utan tracking)
- Språkgranskning av jämförande text för neutralitet
- Stöd för enkel svenska-version
