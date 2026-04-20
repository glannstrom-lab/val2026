# ROADMAP.md — Val 2026 Utvecklingsplan

Sammanställd från granskning av 8 specialiserade agenter: DataValidator, ContentResearcher, A11yAuditor, NeutralityChecker, PerfOptimizer, TestEngineer, SwedishEditor, FrontendDev.

**Granskningsdatum:** 20 april 2026

---

## Sammanfattning

| Agent | Status | Kritiska problem |
|-------|--------|------------------|
| DataValidator | ✅ OK | Dokumentation ej synkad med data |
| ContentResearcher | ⚠️ Förbättringar | Saknade ämnen: AI, Ukraina, NATO |
| A11yAuditor | ✅ Fixat | ~~Kontrastproblem, fokus-indikator~~ |
| NeutralityChecker | ✅ Fixat | ~~En formulering bör justeras~~ |
| PerfOptimizer | ⚠️ Optimering möjlig | Render-blockerande resurser |
| TestEngineer | ✅ Fixat | ~~4%-spärren i koalitionsbyggare~~ |
| SwedishEditor | ✅ Fixat | ~~Terminologi-inkonsekvens~~ |
| FrontendDev | ⚠️ Refaktorering | Stor kodduplicering |

---

## Fas 1: Kritiska åtgärder (före release) ✅ KLAR

**Implementerad:** 20 april 2026 (commit 6935aab)

### 1.1 Tillgänglighet (A11yAuditor)

| Status | Åtgärd | Fil |
|--------|--------|-----|
| ✅ | Fixa `--color-text-subtle` kontrast (3.7:1 → 4.5:1) | `styles.css:17` |
| ✅ | Lägg till synlig fokus-indikator på `.compass-party:focus` | `styles.css:1030` |
| ⏳ | Implementera fokus-fångning i mobilmeny | `header.js` |
| ✅ | Lägg till `role="dialog"` på party-modal | `partier.html:37` |
| ✅ | Fixa touch targets till minst 44x44px | `styles.css` |

### 1.2 Funktionalitet (TestEngineer)

| Status | Åtgärd | Fil |
|--------|--------|-----|
| ✅ | Partier under 4%-spärren ska få 0 mandat | `coalition.js:98` |
| ✅ | Synkronisera M:s opinionssiffra (17% vs 18%) | `parties.json` |

### 1.3 Neutralitet (NeutralityChecker)

| Status | Åtgärd | Fil |
|--------|--------|-----|
| ✅ | Ta bort "särskilt islamska" från SD:s position om religiösa friskolor | `issues.json` |
| ✅ | Ändra "generös" till "högre ersättning" i quiz q19 | `quiz-questions.json` |

### 1.4 Språk (SwedishEditor)

| Status | Åtgärd | Fil |
|--------|--------|-----|
| ✅ | Ändra "Bygg koalitioner" → "Bygg regeringsunderlag" | `index.html:158` |
| ✅ | Ändra "public service uppdrag" → "public services uppdrag" | `issues.json:577` |
| ✅ | Ändra "extra viktiga" → "särskilt viktiga" | `quiz.html:24` |
| ✅ | Ändra "opinionsställning" → "opinionsstöd" | `partier.html:24` |

---

## Fas 2: Prestandaoptimering (1-2 dagar)

### 2.1 Snabba vinster (PerfOptimizer)

| Åtgärd | Förväntad förbättring | Tid |
|--------|----------------------|-----|
| Lägg till `defer` på alla script-taggar | TBT -100-200ms | 15 min |
| Lägg till `font-display: swap` på webfonts | FCP -100-300ms | 15 min |
| Lägg till `loading="lazy"` på bilder | LCP -50-100ms | 30 min |
| Preload kritiska resurser (CSS, fonts) | LCP -50-100ms | 15 min |
| Minifiera CSS och JS | Laddtid -30-60ms | 30 min |

### 2.2 Större optimeringar

| Åtgärd | Förväntad förbättring | Tid |
|--------|----------------------|-----|
| Extrahera och inline critical CSS | FCP -200-400ms | 2-3 tim |
| Konvertera bilder till WebP | Bildstorlek -30% | 30 min |
| Optimera Service Worker (lazy caching) | Första laddning -300-500ms | 1-2 tim |

---

## Fas 3: Kodkvalitet (3-5 dagar)

### 3.1 Eliminera duplicering (FrontendDev)

| Åtgärd | Påverkan | Tid |
|--------|----------|-----|
| Skapa `shared/constants.js` med PARTY_COLORS, PARTY_NAMES, etc. | -10-15 KB JS | 2-3 tim |
| Skapa `shared/utils.js` med delade funktioner | Bättre underhåll | 3-4 tim |
| Standardisera init-mönster (alla via window.initX) | Konsistens | 1-2 tim |

### 3.2 Förbättra felhantering

| Åtgärd | Fil | Tid |
|--------|-----|-----|
| Lägg till `response.ok`-kontroll i alla fetch | timeline.js, coalition.js, guess.js, pollgraph.js | 1 tim |
| Lägg till "Försök igen"-knapp vid JSON-fel | Alla verktyg | 2 tim |

### 3.3 CSS-organisation

| Åtgärd | Tid |
|--------|-----|
| Dela upp `styles.css` i moduler (base, components, tools) | 4-6 tim |
| Ta bort duplicerade färgdefinitioner (använd CSS vars från JS) | 1 tim |

---

## Fas 4: Innehållsförbättringar (1-2 veckor)

### 4.1 Nya sakfrågor (ContentResearcher)

| Ämne | Prioritet | Relevans |
|------|-----------|----------|
| AI och digitalisering | 🔴 Hög | Aktuell politisk fråga 2025-2026 |
| Stöd till Ukraina | 🔴 Hög | Central utrikespolitik sedan 2022 |
| Kärnvapen på svensk mark | 🔴 Hög | NATO-följdfråga |
| NATO-baser i Sverige | 🟠 Medel | NATO-följdfråga |
| Sjukförsäkring/karensdag | 🟠 Medel | Arbetsmarknadsfråga |
| Höghastighetsträg | 🟠 Medel | Infrastrukturfråga |
| Gruvbrytning/sällsynta mineraler | 🟠 Medel | Grön omställning |
| Kommunal ekonomi | 🟡 Låg | Välfärdsfråga |

### 4.2 Nya quiz-frågor

| Förslag | Kategori |
|---------|----------|
| "Sverige bör aktivt stödja Ukraina militärt" | Försvar |
| "AI-system i offentlig sektor bör regleras strikt" | Värderingar |
| "Kärnvapen bör kunna placeras på svensk mark" | Försvar |
| "Gruvbrytning bör tillåtas i skyddade områden för grön omställning" | Miljö |

### 4.3 Datauppdateringar

| Åtgärd | Prioritet |
|--------|-----------|
| Lägg till granulär opinionsdata för jan-mars 2026 | 🟠 Medel |
| Uppdatera tidslinjen med händelser från april 2026 | 🟠 Medel |
| Verifiera partiledare (särskilt L) | 🟠 Medel |
| Lägg till citat från 2026 års valkampanj | 🟡 Låg |

---

## Fas 5: Nya funktioner (2-4 veckor)

### 5.1 Prioritet Hög

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| **Dark/light mode** | Låt användaren välja tema | Medel |
| **Jämför två partier** | Sida-vid-sida-jämförelse | Hög |
| **Spara quiz-progress** | localStorage för att inte tappa svar | Låg |

### 5.2 Prioritet Medel

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| **Debattkalender** | Lista kommande valdebatter | Medel |
| **Mandatkalkylator** | Simulera valresultat | Hög |
| **Swipe-gester i quiz** | Bättre mobil-UX | Medel |

### 5.3 Prioritet Låg

| Funktion | Beskrivning | Komplexitet |
|----------|-------------|-------------|
| **Print-stylesheet** | Optimera för utskrift | Låg |
| **Kandidatdatabas** | Sökbar lista över kandidater | Hög |

---

## Fas 6: Teknisk skuld (löpande)

### 6.1 Dokumentation

- [ ] Uppdatera CLAUDE.md med korrekta siffror (40 sakfrågor, ej 28)
- [ ] Synkronisera `quiz-questions.json` meta.totalQuestions med faktiskt antal

### 6.2 Tester

- [ ] Lägg till automatiserade tester för quiz-algoritmen
- [ ] HTML-validering med W3C
- [ ] Lighthouse-audit (mål: 100/100)
- [ ] Kontrast-test med WebAIM

### 6.3 CI/CD

- [ ] Automatisk deploy vid push till main
- [ ] Automatisk Lighthouse-rapport på PR

---

## Tidsplan

| Vecka | Fokus | Mål |
|-------|-------|-----|
| **V1** | Fas 1 (Kritiska) | Alla tillgänglighets- och neutralitetsproblem fixade |
| **V2** | Fas 2 (Prestanda) | Lighthouse Performance > 90 |
| **V3-4** | Fas 3 (Kodkvalitet) | Kodduplicering eliminerad |
| **V5-6** | Fas 4 (Innehåll) | Nya sakfrågor om AI, Ukraina, NATO |
| **V7-10** | Fas 5 (Nya funktioner) | Dark mode, partijämförelse |
| **Löpande** | Fas 6 (Teknisk skuld) | Dokumentation, tester |

---

## Prioritetsmatris

```
              Hög påverkan
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    │  🔴 GÖR NU   │  📋 PLANERA  │
    │  Kontrast    │  Prestanda   │
    │  4%-spärren  │  Kodkvalitet │
    │  Neutralitet │              │
Låg ├──────────────┼──────────────┤ Hög
insats│              │              │ insats
    │  ✅ SNABBA   │  🔮 FRAMTID  │
    │  VINSTER     │              │
    │  Språkfix    │  Dark mode   │
    │  defer/lazy  │  Kandidatdb  │
    │              │              │
    └──────────────┼──────────────┘
                   │
              Låg påverkan
```

---

## Nästa steg

1. **Idag:** Fixa kritiska tillgänglighetsproblem (kontrast, fokus)
2. **Denna vecka:** Fas 1 komplett
3. **Nästa vecka:** Prestandaoptimering
4. **Före valet:** Alla nya sakfrågor om AI, Ukraina, NATO tillagda

---

*Genererad: 20 april 2026*
*Baserad på granskning av: DataValidator, ContentResearcher, A11yAuditor, NeutralityChecker, PerfOptimizer, TestEngineer, SwedishEditor, FrontendDev*
