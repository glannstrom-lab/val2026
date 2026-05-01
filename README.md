# Val 2026 — Väljarportal

En neutral, faktabaserad webbplats för svenska väljare inför riksdagsvalet
**14 september 2026**.

**Live:** https://glannstrom-lab.github.io/val2026/

## Funktioner

### Verktyg
- **Politisk kompass** — partiernas position på ekonomisk och värderingsmässig skala
- **Valkompass-quiz** — 50 frågor i 10 kategorier, matchningsalgoritm med transparent metodik
- **Sakfrågejämförelse** — 56 sakfrågor i 12 kategorier med källa per partiposition
- **Koalitionsbyggare** — bygg majoriteter, jämför mot mandat eller opinion
- **Mandatkalkylator** — simulera valresultat med modifierade Sainte-Laguë
- **Partijämförelse** — två partier sida vid sida
- **Gissa partiet** — blint quiz med 56 citat
- **Statsbudget** — regeringens budget vs oppositionens alternativ
- **Riksdagsröstningar** — hur partierna röstat i 20 viktiga frågor
- **Opinionsgraf** — utveckling över tid
- **Tidslinje** — politiska händelser 2022–2026
- **Valhistorik** — riksdag 2018/2022, EU 2024, partiledare
- **Debattkalender** — kommande valdebatter
- **Kandidatdatabas** — sökbar lista över riksdagskandidater

### Sidor
18 sidor totalt. Se `CLAUDE.md` för fullständig filstruktur.

## Tech stack

- Vanilla HTML, CSS, JavaScript — inga ramverk, ingen build-process
- 18 separata HTML-sidor, delad header/footer via `components/header.js`
- All data i JSON-filer (`data/`)
- PWA med service worker för offline-stöd
- Inga cookies, ingen tracking, inga externa analytics
- Hostad på GitHub Pages

## Kom igång

Öppna `index.html` direkt i webbläsare, eller starta en lokal server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## Datakällor

| Källa | Användning |
|-------|------------|
| [val.se](https://val.se) | Valresultat, valregler (primärkälla) |
| [riksdagen.se](https://riksdagen.se) | Mandatfördelning, röstningsprotokoll |
| [Chapel Hill Expert Survey](https://chesdata.eu) | Kompasspositioner |
| [Göteborgs universitets Valforskningsprogram](https://www.gu.se/valforskningsprogrammet) | Forskningsdata |
| [Poll of Polls](https://pollofpolls.se) | Opinionssnitt |
| [SCB](https://scb.se) | Valstatistik |
| Partiernas officiella sidor | Sakfrågor, partiprogram |

## Tillgänglighet

Webbplatsen följer **WCAG 2.1 AA**. Tangentbordsnavigation, fokus-indikatorer,
heading-hierarki och touch-targets (minst 44×44 px) är genomgående uppfyllda.

## Bidra

Felrapporter och förslag: öppna ett issue i repot. Faktauppdateringar mot
primärkällor välkomnas. Se `CLAUDE.md` för utvecklingsprinciper och
`DECISIONS.md` för arkitekturbeslut.

## Licens

MIT
