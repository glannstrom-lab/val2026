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
- **En enda `index.html`** med separata `styles.css` och modulära JS-filer
- **Data i JSON** — all partidata i `/data/`-mappen, laddas via `fetch()`
- **Ingen backend** — allt körs i webbläsaren
- **PWA-stöd** — service worker för offline-läsning
- **Hosting:** GitHub Pages
- **Fonts:** Space Grotesk (display) + Inter (brödtext) via Bunny Fonts

---

## 3. Aktuell filstruktur

```
/
├── index.html              # Huvudsida med alla sektioner
├── styles.css              # All CSS (~3300 rader)
├── app.js                  # Navigation, init, shared state
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker för offline
├── /tools/
│   ├── compass.js          # Politisk kompass (533 rader)
│   ├── quiz.js             # Valkompass-quiz (695 rader)
│   ├── compare.js          # Sakfråge-jämförelse (299 rader)
│   ├── timeline.js         # Tidslinje (334 rader)
│   ├── coalition.js        # Koalitionsbyggare (326 rader)
│   ├── guess.js            # Gissa partiet-quiz (278 rader)
│   └── pollgraph.js        # Opinionsgraf (317 rader)
├── /data/
│   ├── parties.json        # Grunddata om partierna
│   ├── compass-positions.json
│   ├── quiz-questions.json # 24 frågor
│   ├── issues.json         # 28 sakfrågor med positioner
│   ├── timeline.json       # 36 politiska händelser
│   ├── quotes.json         # 24 partiuttalanden
│   └── polls-history.json  # Opinionshistorik sedan 2022
├── /assets/
│   ├── /logos/             # Officiella partilogotyper (PNG från Riksdagen)
│   ├── favicon.svg
│   └── icon-192.svg        # PWA-ikon
└── CLAUDE.md               # Denna fil
```

---

## 4. Implementerade funktioner

### 4.1 Sektioner på sidan

| Sektion | Status | Beskrivning |
|---------|--------|-------------|
| Hero | ✅ Klar | Intro, nedräkning till valdagen, CTA-knappar |
| Snabbguide | ✅ Klar | Riksdagsvalet på 60 sekunder |
| Politisk kompass | ✅ Klar | 2D-visualisering med tooltips och koalitionsläge |
| Valkompass-quiz | ✅ Klar | 24 frågor, matchningsalgoritm, delbar URL |
| Sakfråge-jämförelse | ✅ Klar | 28 sakfrågor, filter, expanderbara kort |
| Tidslinje | ✅ Klar | 36 händelser 2022-2026, filter per parti/typ |
| Partierna | ✅ Klar | 8 partier med logotyper och info |
| Opinionsläget | ✅ Klar | Stapeldiagram + historisk graf |
| Koalitionsbyggare | ✅ Klar | Bygg majoriteter, växla 2022/opinion |
| Gissa partiet | ✅ Klar | 24 citat att gissa parti på |
| Om sidan | ✅ Klar | Metodik, källor, tillgänglighet |

### 4.2 Tekniska funktioner

| Funktion | Status |
|----------|--------|
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

## 7. Publicerings-checklista

- [x] Alla åtta partier har komplett data (`parties.json`)
- [x] Alla sakfrågor har position för varje parti med källa (28 st)
- [x] Quizet har minst 20 frågor, balanserat över kategorier (24 st)
- [x] Kompasspositioner är verifierade mot CHES/GU-data
- [x] Opinionssnittet är uppdaterat (april 2026)
- [x] Tidslinjen har minst 20 events (36 st)
- [x] Mobilvy fungerar för alla verktyg
- [x] Tangentbordsnavigering fungerar
- [x] "Om sidan" är komplett med källor
- [x] Senaste uppdatering-datum synligt
- [x] Inga tracking-skript, inga cookies
- [ ] Kontrast testad med WebAIM
- [ ] HTML validerad med W3C
- [ ] Laddtid testad på 3G

---

## 8. Roadmap — Framtida förbättringar

### Fas 1: Innehållsförbättringar (Prioritet: Hög)

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Verifiera sakfrågor mot partikällor** | Granska alla 28 sakfrågor mot officiella partiprogram | Medel |
| **Lägg till fler quiz-frågor** | Utöka från 24 till 30-35 frågor för bättre precision | Medel |
| **Uppdatera opinionsdata regelbundet** | Skapa rutin för månatlig uppdatering av polls | Låg |
| **Lägg till valkretsdata** | Visa mandatfördelning per valkrets | Hög |
| **Utöka tidslinjen** | Lägg till fler händelser fram till valdagen | Låg |

### Fas 2: UX-förbättringar (Prioritet: Medel)

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Dark/light mode toggle** | Låt användaren välja tema | Medel |
| **Animationer vid laddning** | Stagger reveal för sektioner | Låg |
| **Förbättrad quiz-UX** | Swipe-gester på mobil, progress-sparning | Medel |
| **Jämförelse sida-vid-sida** | Välj två partier för djupjämförelse | Hög |
| **Filterhistorik** | Kom ihåg användarens filterval | Låg |
| **Print-stylesheet** | Optimera för utskrift | Låg |

### Fas 3: Nya funktioner (Prioritet: Medel)

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Röstningskalkylator** | Beräkna mandat från hypotetiska valresultat | Hög |
| **Partihistorik** | Visa partiernas historiska valresultat | Medel |
| **Debattkalender** | Lista kommande valdebatter med påminnelser | Medel |
| **Kandidatdatabas** | Sökbar lista över riksdagskandidater | Hög |
| **Läs mer-länkar** | Samlade fördjupningslänkar per ämne | Låg |
| **RSS/Atom-feed** | För tidslinjen | Låg |

### Fas 4: Tekniska förbättringar (Prioritet: Låg)

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Preload kritiska resurser** | Förbättra laddtid | Låg |
| **Lazy loading** | Ladda sektioner vid behov | Medel |
| **Bättre felhantering** | Visa användarvänliga fel om JSON misslyckas | Låg |
| **Automatiserade tester** | Enhetstester för quiz-algoritmen | Hög |
| **CI/CD pipeline** | Automatisk deploy vid push | Medel |
| **Lighthouse-optimering** | Nå 100/100 på alla kategorier | Medel |

### Fas 5: Expansion (Prioritet: Framtida)

| Uppgift | Beskrivning | Komplexitet |
|---------|-------------|-------------|
| **Engelsk version** | Internationell tillgänglighet | Hög |
| **Region/kommun-stöd** | Utöka till regionval och kommunval | Mycket hög |
| **API för data** | Öppna data för andra utvecklare | Medel |
| **Inbäddningsbara widgets** | Låt andra sajter bädda in verktyg | Hög |

---

## 9. Utvecklingsprinciper

**Vid kodändringar:**
1. Lägg all data i JSON — hårdkoda inte i JS
2. Testa på mobil innan commit
3. Commita ofta med tydliga meddelanden
4. Uppdatera denna fil om arkitekturen ändras

**Vid innehållsändringar:**
- Om en sakfråga läggs till, inkludera alla 8 partier
- Alla partipositioner ska ha källa
- Verifiera partiledare innan publicering (kan ändras!)

**Frågor att ställa användaren:**
- Färgval/visuell riktning om otydligt
- Om en quiz-fråga är för ledande
- Om en sakfråga ska inkluderas

---

## 10. Källor

| Källa | Användning |
|-------|------------|
| [Riksdagen.se](https://riksdagen.se) | Partilogotyper, mandatfördelning |
| [Val.se](https://val.se) | Valresultat, regler |
| [Poll of Polls](https://pollofpolls.se) | Opinionssnitt |
| [Chapel Hill Expert Survey](https://chesdata.eu) | Kompasspositioner |
| Partiernas officiella sidor | Sakfrågor, partiprogram |

---

## 11. Kontakt & Bidrag

**Repository:** https://github.com/glannstrom-lab/val2026

**Rapportera fel:** Skapa en issue på GitHub

---

*Senast uppdaterad: 20 april 2026*
