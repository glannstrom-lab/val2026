# ROADMAP.md — Val 2026 Utvecklingsplan (April 2026)

Sammanställd från granskning av 8 specialiserade agenter: DataValidator, ContentResearcher, A11yAuditor, NeutralityChecker, PerfOptimizer, TestEngineer, SwedishEditor, FrontendDev.

**Granskningsdatum:** 20 april 2026

---

## Sammanfattning

| Agent | Status | Kritiska problem |
|-------|--------|------------------|
| DataValidator | ⚠️ 4 problem | Opinions-mismatch, dokumentation föråldrad |
| ContentResearcher | ⚠️ 3 problem | AI undertäckt, migration överrepresenterad |
| A11yAuditor | ⚠️ 2 problem | Färgkontrast (SD-gul), fokusindikatorer |
| NeutralityChecker | ⚠️ 4 problem | Laddade formuleringar i issues.json |
| PerfOptimizer | ⚠️ 3 problem | Duplikerad JS, stor CSS-fil |
| TestEngineer | ⚠️ 3 problem | Mandatberäkning ej testad, edge cases |
| SwedishEditor | ✅ 2 mindre | Stavfel i timeline.json |
| FrontendDev | ⚠️ 4 problem | Kodduplicering, memory leak risk |

**Totalt:** 25 identifierade förbättringsområden

---

## Fas 1: Kritiska åtgärder (före release)

### 1.1 Neutralitet (NeutralityChecker) 🔴

| Åtgärd | Fil | Status |
|--------|-----|--------|
| Ändra "Vinstjakt" → "Vill begränsa vinstuttag" (S friskolor) | `issues.json` | ⏳ |
| Ändra "riskfylld" → "kostsam" (MP kärnkraft) | `issues.json` | ⏳ |
| Ersätt SD-citat "Springa fria på gatorna" med faktabaserat | `quotes.json` | ⏳ |
| Ändra "Vänstervridet" → "bredare redaktionell balans" | `quiz-questions.json` | ⏳ |

### 1.2 Datavalidering (DataValidator) 🔴

| Åtgärd | Fil | Status |
|--------|-----|--------|
| Synkronisera M:s opinion_nu (18% vs 17%) | `parties.json` | ⏳ |
| Uppdatera CLAUDE.md (24 → 50 quiz-frågor) | `CLAUDE.md` | ⏳ |
| Fixa opinionssnitt-summa (98% → 100%) | `parties.json` | ⏳ |
| Validera candidates.json partiID-referenser | `candidates.json` | ⏳ |

### 1.3 Tillgänglighet (A11yAuditor) 🔴

| Åtgärd | Fil | Status |
|--------|-----|--------|
| Fixa SD-partifärg kontrast (#DDDD00 → #b8a000) | `styles.css` | ⏳ |
| Lägg till `:focus-visible` på alla knappar | `styles.css` | ⏳ |
| Öka `.theme-toggle` till 48x48px | `styles.css` | ⏳ |
| Lägg till `aria-hidden="true"` på ikon-SVG:er | `*.html` | ⏳ |

### 1.4 Språk (SwedishEditor) 🟡

| Åtgärd | Fil | Status |
|--------|-----|--------|
| "omvald" → "omväljs" (L-ledare) | `timeline.json` | ⏳ |
| "vikta" → "väga" (prioriteringar) | `quiz-questions.json` | ⏳ |

---

## Fas 2: Innehållsförbättringar (1 vecka)

### 2.1 AI och digitalisering (ContentResearcher) 🔴

| Åtgärd | Prioritet |
|--------|-----------|
| Lägg till 3-4 quiz-frågor om AI-reglering | Hög |
| Lägg till sakfråga: "AI-driven arbetskraftsersättning" | Hög |
| Lägg till sakfråga: "Algoritm-transparens i offentlig sektor" | Medel |

**Förslag på nya quiz-frågor:**
1. "AI-system som fattar beslut om medborgare bör alltid kunna förklaras"
2. "Staten bör reglera hur företag använder AI för personalrekrytering"
3. "Automatisering som ersätter jobb bör beskattas hårdare"

### 2.2 Balansera migration (ContentResearcher) 🟡

| Åtgärd | Prioritet |
|--------|-----------|
| Lägg till progressivt perspektiv: "Höja flyktingkvoten" | Medel |
| Lägg till: "Arbetskraftsinvandring och exploatering" | Medel |
| Minska migrationsfrågorna från 9 till 6-7 | Låg |

### 2.3 Sjukvård (ContentResearcher) 🟡

| Åtgärd | Prioritet |
|--------|-----------|
| Lägg till quiz-fråga om sjukvårdsköer/finansiering | Medel |
| Koppla till timeline e026 (vårdkris) | Låg |

---

## Fas 3: Testning och kvalitet (1-2 veckor)

### 3.1 Nya tester (TestEngineer) 🔴

| Test | Fil | Prioritet |
|------|-----|-----------|
| Mandatberäkning mot 2022-resultat | `tests/seatcalc.test.js` | Hög |
| 4%-spärr edge cases (3.99%, 4.00%, 4.01%) | `tests/threshold.test.js` | Hög |
| Sainte-Laguë-algoritm verifiering | `tests/seatcalc.test.js` | Hög |
| Quiz zero-answer edge case | `tests/quiz.test.js` | Medel |

**Förväntad test-täckning:** 40% → 70%

### 3.2 Verifiera algoritmer (TestEngineer) 🔴

| Åtgärd | Beskrivning |
|--------|-------------|
| Verifiera mandatberäkning | Jämför seatcalc.js output mot faktiskt 2022-valresultat |
| Fixa avrundningsfel | coalition.js `Math.round()` kan ge fel total |
| Konsolidera 4%-spärr | Tre olika implementeringar → en |

---

## Fas 4: Prestandaoptimering (1 vecka)

### 4.1 Snabba vinster (PerfOptimizer) 🔴

| Åtgärd | Förväntad förbättring | Tid |
|--------|----------------------|-----|
| Ta bort duplikerad JS-laddning | -40% laddtid | 30 min |
| Extrahera kritisk CSS (~2KB) inline | +0.8s snabbare FCP | 3 tim |
| Konvertera PNG → WebP (partilogotyper) | -40KB | 2 tim |

### 4.2 Större optimeringar (PerfOptimizer) 🟡

| Åtgärd | Förväntad förbättring | Tid |
|--------|----------------------|-----|
| Lazy-load JSON-data | -100KB initial | 2 tim |
| CSS minification | -30% filstorlek | 1 tim |
| Service Worker versionering för POLL_DATA | Automatisk uppdatering | 2 tim |

**Mål efter optimering:**
- First Contentful Paint: 1.5s → 1.0s
- Lighthouse Performance: 72 → 85+

---

## Fas 5: Kodkvalitet (2 veckor)

### 5.1 Eliminera duplicering (FrontendDev) 🔴

| Åtgärd | Påverkan |
|--------|----------|
| Skapa `shared/utils.js` med `createSVGElement()`, `loadJSON()`, `showError()` | Eliminerar ~200 rader duplicerad kod |
| Centralisera POLL_DATA (nu på 2 ställen) | Underhållbarhet |
| Implementera event delegation | Förhindrar memory leaks |

### 5.2 Förbättra felhantering (FrontendDev) 🟡

| Åtgärd | Beskrivning |
|--------|-------------|
| Kontextrika felmeddelanden | "Det gick inte att ladda partidata" istället för generiskt fel |
| JSON-validering vid load | Kontrollera saknade partier, tomma arrays |
| Promise.all med individuell .catch() | En misslyckad request ska inte stoppa allt |

### 5.3 Dokumentation (FrontendDev) 🟡

| Åtgärd | Beskrivning |
|--------|-------------|
| Lägg till JSDoc på alla funktioner | Förbättrad underhållbarhet |
| Dokumentera magic numbers | SWIPE_THRESHOLD=80, SVG_PADDING=1.5 etc. |
| Kommentera komplexa algoritmer | user position normalisering, ellips-ritning |

---

## Fas 6: Framtida funktioner (efter release)

### 6.1 Prioritet Hög

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| Uppdateringsmekanism för opinionsdata | Automatisk fetch efter valdagen | Medel |
| Valkretsdata | Visa mandatfördelning per valkrets | Hög |
| Röstningskalkylator v2 | Historisk jämförelse | Medel |

### 6.2 Prioritet Medel

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| Partihistorik | Historiska valresultat sedan 1970 | Medel |
| RSS/Atom-feed | För tidslinjen | Låg |
| Förbättrad quiz-progress | Flerstegs-sparning | Låg |

### 6.3 Prioritet Låg

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| Engelsk version | Internationell tillgänglighet | Hög |
| API för data | Öppna data för andra utvecklare | Medel |
| Inbäddningsbara widgets | Låt andra sajter bädda in verktyg | Hög |

---

## Tidsplan

| Vecka | Fokus | Mål |
|-------|-------|-----|
| **V1** | Fas 1 (Kritiska) | Alla neutralitets- och datafel fixade |
| **V2** | Fas 2 (Innehåll) | AI-frågor tillagda, migration balanserad |
| **V3** | Fas 3 (Tester) | Test-täckning > 70%, algoritmer verifierade |
| **V4** | Fas 4 (Prestanda) | Lighthouse > 85, -50% laddtid |
| **V5-6** | Fas 5 (Kodkvalitet) | shared/utils.js, dokumentation |
| **Löpande** | Fas 6 (Framtid) | Efter 13 september 2026 |

---

## Prioritetsmatris

```
              Hög påverkan
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    │  🔴 GÖR NU   │  📋 PLANERA  │
    │  Neutralitet │  Prestanda   │
    │  Datafix     │  Kodkvalitet │
    │  A11y        │  Nya tester  │
Låg ├──────────────┼──────────────┤ Hög
insats│              │              │ insats
    │  ✅ SNABBA   │  🔮 FRAMTID  │
    │  VINSTER     │              │
    │  Språkfix    │  Valkretsdata│
    │  AI-frågor   │  Engelsk ver │
    │              │              │
    └──────────────┼──────────────┘
                   │
              Låg påverkan
```

---

## Agentrapporter (detaljerad)

### DataValidator
- **Kritiskt:** M:s opinion_nu inkonsekvent (18% vs 17%)
- **Kritiskt:** CLAUDE.md säger 24 frågor, faktiskt 50
- **Kritiskt:** Opinionssnitt summerar till 98%
- **Medel:** MP-röstningstal varierar, EU-mandatdata ofullständig

### ContentResearcher
- **Kritiskt:** Endast 1 quiz-fråga om AI (borde vara 4-5)
- **Varning:** 9 migrationsfrågorna, asymmetriskt perspektiv
- **Varning:** Sjukvårdsfråga saknas trots aktuell timeline-händelse

### A11yAuditor
- **Kritiskt:** SD-partifärg #DDDD00 underskriver WCAG kontrast
- **Kritiskt:** Fokusindikatorer saknas på flera knappar
- **Varning:** Touch targets under 44x44px

### NeutralityChecker
- **Kritiskt:** "Vinstjakt" (S) är laddat
- **Kritiskt:** "riskfylld" (MP kärnkraft) är värderande
- **Kritiskt:** SD-citat extremt emotionellt
- **Kritiskt:** "Vänstervridet" är insinuation

### PerfOptimizer
- **Kritiskt:** Tool-scripts laddas 2x per sida (~200KB extra)
- **Kritiskt:** CSS-fil 152KB, ingen critical CSS
- **Varning:** PNG-logotyper utan WebP-alternativ

### TestEngineer
- **Kritiskt:** Mandatberäkning aldrig verifierad mot faktiska val
- **Kritiskt:** 4%-spärr edge cases otestade
- **Kritiskt:** Sainte-Laguë-algoritm ej verifierad
- **Varning:** Quiz zero-answer ger slumpmässig ordning

### SwedishEditor
- **Fel:** "omvald" → "omväljs" (timeline.json)
- **Fel:** "vikta" → "väga" (quiz-questions.json)
- **OK:** Övergripande hög språkkvalitet

### FrontendDev
- **Kritiskt:** `createSVGElement()` duplicerad i 2 filer
- **Kritiskt:** POLL_DATA hårdkodad på 2 ställen
- **Kritiskt:** Event-handlers re-attachas (memory leak)
- **Varning:** Ingen JSDoc, magic numbers odokumenterade

---

## Nästa steg

1. **Idag:** Fixa neutralitetsproblem i issues.json och quotes.json
2. **Idag:** Synkronisera M:s opinionsdata
3. **Denna vecka:** Fixa SD:s färgkontrast och fokusindikatorer
4. **Denna vecka:** Lägg till 3-4 AI-quiz-frågor
5. **Nästa vecka:** Lägg till tester för mandatberäkning
6. **Nästa vecka:** Skapa shared/utils.js

---

*Genererad: 20 april 2026*
*Baserad på granskning av: DataValidator, ContentResearcher, A11yAuditor, NeutralityChecker, PerfOptimizer, TestEngineer, SwedishEditor, FrontendDev*
