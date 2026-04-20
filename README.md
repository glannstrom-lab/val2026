# Val 2026 — Väljarportal

En neutral, faktabaserad webbplats för väljare inför riksdagsvalet 13 september 2026.

## Funktioner

- **Politisk kompass** — Se var partierna står på den ekonomiska och värderingsmässiga skalan
- **Valkompass-quiz** — Svara på 24 frågor och se vilka partier som matchar dina åsikter
- **Partiprofiler** — Information om alla 8 riksdagspartier
- **Opinionsläge** — Sammanvägda opinionssiffror

## Tech stack

- Vanilla HTML, CSS, JavaScript
- Ingen build-process, inga ramverk
- All data i JSON-filer
- Inga cookies, ingen tracking

## Kom igång

Öppna `index.html` i en webbläsare, eller starta en lokal server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## Filstruktur

```
├── index.html          # Huvudsida
├── styles.css          # Styling
├── app.js              # Huvudlogik
├── tools/
│   ├── compass.js      # Politisk kompass
│   └── quiz.js         # Valkompass-quiz
├── data/
│   ├── parties.json    # Partidata
│   ├── compass-positions.json
│   └── quiz-questions.json
└── assets/
    └── favicon.svg
```

## Datakällor

- Chapel Hill Expert Survey (CHES) 2024
- Göteborgs universitets Valforskningsprogram
- Partiernas officiella program
- Poll of Polls / Pollofpolls.se

## Licens

MIT
