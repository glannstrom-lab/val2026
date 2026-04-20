# CLAUDE.md — Väljarportal inför riksdagsvalet 2026

Detta dokument beskriver projektet för Claude Code. Läs hela filen innan du börjar bygga eller ändra något. Uppdatera denna fil när arkitektur eller beslut ändras.

---

## 1. Projektöversikt

**Mål:** En statisk, överskådlig och faktabaserad webbplats inför riksdagsvalet 13 september 2026 som hjälper väljare att förstå partierna och bilda sig en egen uppfattning.

**Live-URL:** https://glannstrom-lab.github.io/val2026/

**Publiceringsdatum för valet:** 13 september 2026

**Karaktär:** Allt-i-ett-portal, politiskt neutral, inte röstningsrådgivande. Sidan ger inga rekommendationer — bara verktyg och fakta.

**Målgrupp:** Svenska röstberättigade, från första-gångs-väljare till pålästa. Läsbart på mobil och desktop.

**Språk:** Svenska genomgående.

---

## 2. Tech stack

- **Vanilla HTML, CSS, JavaScript** — inga ramverk, ingen build-process
- **Multi-page struktur** — 17 separata HTML-sidor med delad header/footer-komponent
- **Data i JSON** — all partidata i `/data/`-mappen, laddas via `fetch()`
- **Ingen backend** — allt körs i webbläsaren
- **PWA-stöd** — service worker för offline-läsning
- **Hosting:** GitHub Pages
- **Fonts:** Space Grotesk (display) + Inter (brödtext) via Bunny Fonts

---

## 3. Aktuell filstruktur

```
/
├── index.html              # Startsida med hero, snabbguide, opinionsöversikt
├── partier.html            # Alla åtta riksdagspartier
├── kompass.html            # Politisk kompass
├── quiz.html               # Valkompass-quiz
├── sakfragor.html          # Sakfråge-jämförelse
├── tidslinje.html          # Politisk tidslinje 2022-2026
├── opinion.html            # Opinionsläget med graf
├── historik.html           # Valhistorik (2018, 2022, EU 2024)
├── koalition.html          # Koalitionsbyggare
├── gissa.html              # Gissa partiet-quiz
├── budget.html             # Statsbudget-jämförelse
├── rostningar.html         # Riksdagsröstningar
├── jamfor.html             # Partijämförelse (två partier sida vid sida)
├── mandat.html             # Mandatkalkylator (simulera valresultat)
├── debatter.html           # Debattkalender (kommande valdebatter)
├── om.html                 # Om sidan, källor, metodik
├── index-single.html       # (Arkiv) Gammal ensidig version
│
├── styles.css              # All CSS (~5800 rader)
├── app.js                  # Sidspecifik init, shared state
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker för offline
│
├── /shared/
│   └── constants.js        # Delade konstanter (PARTY_COLORS, PARTY_NAMES, etc.)
│
├── /components/
│   └── header.js           # Mega menu navigation + footer (275 rader)
│
├── /tools/
│   ├── compass.js          # Politisk kompass (533 rader)
│   ├── quiz.js             # Valkompass-quiz (695 rader)
│   ├── compare.js          # Sakfråge-jämförelse (299 rader)
│   ├── timeline.js         # Tidslinje (334 rader)
│   ├── coalition.js        # Koalitionsbyggare (326 rader)
│   ├── guess.js            # Gissa partiet-quiz (278 rader)
│   ├── pollgraph.js        # Opinionsgraf (317 rader)
│   ├── history.js          # Valhistorik (397 rader)
│   ├── budget.js           # Statsbudget (510 rader)
│   ├── votes.js            # Riksdagsröstningar (340 rader)
│   ├── partycompare.js     # Partijämförelse (398 rader)
│   ├── seatcalc.js         # Mandatkalkylator (320 rader)
│   └── debates.js          # Debattkalender (220 rader)
│
├── /data/
│   ├── parties.json        # Grunddata om partierna (8 partier)
│   ├── compass-positions.json  # Kompasspositioner
│   ├── quiz-questions.json # 50 quiz-frågor (10 kategorier)
│   ├── issues.json         # 56 sakfrågor (12 kategorier)
│   ├── timeline.json       # 36 politiska händelser
│   ├── quotes.json         # 56 partiuttalanden
│   ├── polls-history.json  # Opinionshistorik sedan 2022
│   ├── election-history.json   # Valresultat 2018, 2022, EU 2024
│   ├── constituencies.json # Valkretsar med mandatfördelning
│   ├── budget.json         # 27 budgetområden
│   ├── votes.json          # 20 riksdagsomröstningar
│   └── debates.json        # 12 valdebatter
│
├── /assets/
│   ├── /logos/             # Officiella partilogotyper (PNG)
│   ├── favicon.svg
│   └── icon-192.svg        # PWA-ikon
│
├── CLAUDE.md               # Denna fil
└── AGENTS.md               # Agentteam-definitioner
```

---

## 4. Implementerade funktioner

### 4.1 Sidor och sektioner

| Sida | Fil | Beskrivning |
|------|-----|-------------|
| **Startsida** | `index.html` | Hero, nedräkning, snabbguide, opinionsöversikt |
| **Partierna** | `partier.html` | Alla 8 partier med logotyper, ledare, mandat |
| **Politisk kompass** | `kompass.html` | 2D-visualisering, tooltips, koalitionsläge |
| **Valkompass** | `quiz.html` | 46 frågor, matchningsalgoritm, delbar URL |
| **Sakfrågor** | `sakfragor.html` | 51 sakfrågor, filter per kategori |
| **Tidslinje** | `tidslinje.html` | 36 händelser 2022-2026, filter |
| **Opinionsläget** | `opinion.html` | Stapeldiagram + historisk linjegraf |
| **Valhistorik** | `historik.html` | Jämför 2018, 2022, EU 2024, partiledare |
| **Koalitionsbyggare** | `koalition.html` | Bygg majoriteter, preset-koalitioner |
| **Gissa partiet** | `gissa.html` | 56 citat att gissa parti på |
| **Statsbudgeten** | `budget.html` | Jämför regeringens vs oppositionens budget |
| **Röstningar** | `rostningar.html` | 20 riksdagsomröstningar |
| **Om sidan** | `om.html` | Metodik, källor, integritet, tillgänglighet |

### 4.2 Navigation

- **Mega menu** med tre kategorier: Verktyg, Fakta, Analys
- **Mobilnavigation** med hamburger-meny
- **Breadcrumbs** på alla undersidor
- **Footer** med alla länkar

### 4.3 Tekniska funktioner

| Funktion | Status |
|----------|--------|
| Multi-page struktur | ✅ |
| Mobilresponsiv design | ✅ |
| PWA / offline-stöd | ✅ |
| Open Graph meta-taggar | ✅ |
| Tangentbordsnavigering | ✅ |
| WCAG 2.1 AA | ✅ |
| Delbar quiz-URL | ✅ |
| Officiella partilogotyper | ✅ |

---

## 5. Partiledare (april 2026)

| Parti | Ledare | Titel |
|-------|--------|-------|
| V | Nooshi Dadgostar | Partiledare |
| S | Magdalena Andersson | Partiledare |
| MP | Daniel Helldén & Amanda Lind | Språkrör |
| C | Muharrem Demirok | Partiledare |
| L | Simona Mohamsson | Partiledare |
| KD | Ebba Busch | Partiledare |
| M | Ulf Kristersson | Partiledare |
| SD | Jimmie Åkesson | Partiledare |

---

## 6. Opinionsläget (april 2026)

| Parti | Procent | Under spärren? |
|-------|---------|----------------|
| S | 33% | Nej |
| SD | 20% | Nej |
| M | 18% | Nej |
| V | 8% | Nej |
| C | 6% | Nej |
| MP | 6% | Nej |
| KD | 5% | Nej |
| L | 2% | **Ja** |

---

## 7. Datakategorier

### Quiz-frågor (46 st, 10 kategorier)
- Ekonomi, Arbetsmarknad, Lag & ordning, Migration, Klimat & energi
- Sjukvård, Skola, Försvar, EU, Värderingar

### Sakfrågor (51 st, 12 kategorier)
- Ekonomi, Energi, Lag & ordning, Migration, Miljö, Försvar
- Vård, Skola, Arbetsmarknad, Familj, Kultur, EU

---

## 8. Publicerings-checklista

- [x] Alla åtta partier har komplett data
- [x] 51 sakfrågor med position för varje parti
- [x] 46 quiz-frågor balanserat över 10 kategorier
- [x] Kompasspositioner verifierade mot CHES/GU-data
- [x] Opinionssnittet uppdaterat (april 2026)
- [x] 36 tidslinjehändelser
- [x] Valhistorik för 2018, 2022, EU 2024
- [x] 20 riksdagsomröstningar
- [x] Statsbudget-jämförelse
- [x] Valkretsar med mandatfördelning
- [x] Mobilvy fungerar för alla verktyg
- [x] Tangentbordsnavigering fungerar
- [x] "Om sidan" komplett med källor
- [x] Inga tracking-skript, inga cookies
- [ ] Kontrast testad med WebAIM
- [ ] HTML validerad med W3C
- [ ] Laddtid testad på 3G

---

## 9. Roadmap — Framtida förbättringar

### Prioritet: Hög

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Dark/light mode** | Låt användaren välja tema | Medel |
| **Jämför två partier** | Sida-vid-sida-jämförelse | Hög |
| **Spara quiz-progress** | localStorage för att inte tappa svar | Låg |
| **Debattkalender** | Lista kommande valdebatter | Medel |

### Prioritet: Medel

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Swipe-gester i quiz** | Bättre mobil-UX | Medel |
| **Animationer** | Stagger reveal vid scroll | Låg |
| **Mandatkalkylator** | Simulera valresultat | Hög |
| **Kandidatdatabas** | Sökbar lista över kandidater | Hög |
| **Print-stylesheet** | Optimera för utskrift | Låg |

### Prioritet: Låg

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Preload fonts** | Förbättra laddtid | Låg |
| **Lazy loading** | Ladda sektioner vid behov | Medel |
| **Enhetstester** | Testa quiz-algoritmen | Hög |
| **Lighthouse 100/100** | Optimera alla kategorier | Medel |

### Framtida

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Engelsk version** | Internationell tillgänglighet | Hög |
| **Region/kommun-stöd** | Utöka till andra val | Mycket hög |
| **Inbäddningsbara widgets** | Låt andra bädda in verktyg | Hög |

---

## 10. Utvecklingsprinciper

**Vid kodändringar:**
1. Lägg all data i JSON — hårdkoda inte i JS
2. Testa på mobil innan commit
3. Commita ofta med tydliga meddelanden
4. Uppdatera denna fil om arkitekturen ändras
5. Nya verktyg ska anropas från `app.js` i rätt `case`

**Vid innehållsändringar:**
- Om en sakfråga läggs till, inkludera alla 8 partier
- Alla partipositioner ska ha källa
- Verifiera partiledare innan publicering (kan ändras!)

**Frågor att ställa användaren:**
- Färgval/visuell riktning om otydligt
- Om en quiz-fråga är för ledande
- Om en sakfråga ska inkluderas

---

## 11. Agentteam

Projektet har ett definierat team av 8 specialiserade agenter. Fullständiga prompter finns i `AGENTS.md`.

| Agent | Syfte | Användning |
|-------|-------|------------|
| **DataValidator** | Validerar JSON-data, kontrollerar partipositioner och källor | Före release, efter dataändringar |
| **ContentResearcher** | Researchar politiskt innehåll, opinionsdata | Innehållsuppdateringar |
| **FrontendDev** | Implementerar funktioner i HTML/CSS/JS | Ny funktionalitet |
| **A11yAuditor** | Testar WCAG 2.1 AA, tangentbord, mobilvy | Före release, efter UI-ändringar |
| **NeutralityChecker** | Granskar politisk bias och ledande formuleringar | Före release, nya quiz-frågor |
| **PerfOptimizer** | Optimerar Lighthouse-poäng och laddtid | Prestandaproblem |
| **TestEngineer** | Testar quiz-algoritm, navigation, edge cases | Efter kodändringar |
| **SwedishEditor** | Språkgranskning, terminologi, konsekvent stil | Före release, nytt innehåll |

### Rekommenderade arbetsflöden

**Före release:**
```
DataValidator → NeutralityChecker → A11yAuditor → SwedishEditor
```

**Vid ny funktion:**
```
FrontendDev → TestEngineer → A11yAuditor → PerfOptimizer
```

**Innehållsuppdatering:**
```
ContentResearcher → DataValidator → NeutralityChecker → SwedishEditor
```

---

## 12. Källor

| Källa | Användning |
|-------|------------|
| [Riksdagen.se](https://riksdagen.se) | Partilogotyper, mandatfördelning, röstningar |
| [Val.se](https://val.se) | Valresultat, regler |
| [Poll of Polls](https://pollofpolls.se) | Opinionssnitt |
| [Chapel Hill Expert Survey](https://chesdata.eu) | Kompasspositioner |
| [SCB](https://scb.se) | Valstatistik |
| Partiernas officiella sidor | Sakfrågor, partiprogram, budget |

---

## 13. Kontakt & Bidrag

**Repository:** https://github.com/glannstrom-lab/val2026

**Rapportera fel:** Skapa en issue på GitHub

---

*Senast uppdaterad: 20 april 2026*
