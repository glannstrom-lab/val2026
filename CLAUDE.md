# CLAUDE.md — Väljarportal inför riksdagsvalet 2026

Detta dokument beskriver projektet för Claude Code. Läs hela filen innan du börjar bygga eller ändra något. Uppdatera denna fil när arkitektur eller beslut ändras.

---

## 1. Projektöversikt

**Mål:** En statisk, överskådlig och faktabaserad webbplats inför riksdagsvalet 13 september 2026 som hjälper väljare att förstå partierna och bilda sig en egen uppfattning.

**Publiceringsdatum för valet:** 13 september 2026 (bra att ha en nedräkning på sidan).

**Karaktär:** Allt-i-ett-portal, politiskt neutral, inte röstningsrådgivande. Sidan ger inga rekommendationer — bara verktyg och fakta.

**Målgrupp:** Svenska röstberättigade, från första-gångs-väljare till pålästa. Läsbart på mobil och desktop.

**Språk:** Svenska genomgående. Engelska glosor bara om det saknas bra svensk motsvarighet.

---

## 2. Tech stack

- **Vanilla HTML, CSS, JavaScript** — inga ramverk, ingen build-process.
- **En enda `index.html`** som utgångspunkt, med separata `styles.css` och `app.js` om filen blir för lång (>800 rader HTML). Dela upp JS per verktyg när det blir mer än ~300 rader: `compass.js`, `quiz.js`, `compare.js`, `timeline.js`.
- **Data i JSON** — allt partidata, frågor, positioner, tidslinje-events ska ligga i `/data/`-mappen som separata `.json`-filer som laddas via `fetch()`. Detta gör det lätt att uppdatera innehåll utan att röra koden.
- **Ingen backend.** Allt körs i webbläsaren. Inga cookies, ingen tracking, inga externa API-anrop.
- **Hosting:** statisk fil — funkar på Cloudflare Pages, GitHub Pages, Netlify eller vanlig webbhotell.
- **Inga externa bibliotek** om de inte är absolut nödvändiga. Chart.js kan övervägas för opinionsgrafer, men annars räcker SVG + vanilla JS.
- **Fonts:** använd en distinkt displayfont (t.ex. Fraunces, Space Grotesk, eller en nyhetstidningsserif) och en refinerad brödtextfont (t.ex. Inter Tight, IBM Plex Sans). Ladda via Google Fonts eller Bunny Fonts (GDPR-vänligare).

---

## 3. Filstruktur

```
/
├── index.html
├── styles.css
├── app.js                    # Navigation, shared state, init
├── /tools/
│   ├── compass.js            # Politisk kompass
│   ├── quiz.js               # Valkompass-quiz
│   ├── compare.js            # Sakfråge-jämförelse
│   └── timeline.js           # Tidslinje
├── /data/
│   ├── parties.json          # Grunddata om varje parti
│   ├── compass-positions.json # Positioner på 2D-kompassen
│   ├── quiz-questions.json   # Frågor till valkompass-quizet
│   ├── issues.json           # Sakfrågor med partiernas positioner
│   ├── timeline.json         # Vallöften och utspel
│   └── polls.json            # Opinionssiffror (uppdateras manuellt)
├── /assets/
│   ├── /logos/               # Partilogotyper (använd officiella, med källa)
│   └── favicon.svg
├── README.md                 # För besökare som hittar repot
└── CLAUDE.md                 # Denna fil
```

---

## 4. Sidans struktur

En enda sida med sektioner man hoppar mellan via toppmeny (smooth scroll) eller separata "routes" via URL-hash (`#kompass`, `#quiz`, `#sakfragor`, `#tidslinje`, `#partier`, `#om`).

**Sektioner i ordning:**

1. **Hero** — kort intro, nedräkning till valdagen, tydliga CTA:er till verktygen.
2. **Snabbguide** — "Så fungerar riksdagsvalet på 60 sekunder" (4 % spärr, 349 mandat, 175 för majoritet, 29 valkretsar, utjämningsmandat).
3. **Politisk kompass** (verktyg 1)
4. **Valkompass-quiz** (verktyg 2)
5. **Sakfråge-jämförelse** (verktyg 3)
6. **Tidslinje** (verktyg 4)
7. **Partierna** — kort profil per parti (logo, partiledare, ideologi, mandat 2022, nuvarande opinionssnitt, länk till officiell sida).
8. **Opinionsläget** — sammanvägt snitt (poll of polls-stil), senast uppdaterat-datum. Manuell uppdatering.
9. **Om sidan & källor** — metodik, källor, vem står bakom, transparensförklaring.

---

## 5. De fyra interaktiva verktygen — detaljspec

### 5.1 Politisk kompass

**Princip:** 2D-koordinatsystem. X-axel: ekonomi (vänster ← → höger). Y-axel: värderingar (liberal/libertär nedåt ← → auktoritär uppåt). Följer etablerad modell (jfr. Political Compass, Chapel Hill Expert Survey).

**Interaktion:**
- Alla åtta riksdagspartier visas som prickar/logotyper på kompassen.
- Hover/tap på ett parti → popup med kort motivering till placeringen + källa.
- Toggle "visa koalitioner" — färgkoda nuvarande Tidöpartier vs. opposition.
- Litet info-i: "Detta är en förenkling. Placeringen bygger på [källa]. Partier är inte monolitiska."

**Positioner (utgångspunkt, justeras med källa):** Baseras på Chapel Hill Expert Survey 2024 och Göteborgs universitets Valforskningsprogram. Dessa är **uppskattningar — verifiera och uppdatera mot senaste data innan publicering:**

- V: x=-7, y=-3 (vänster, liberal)
- S: x=-3, y=+1 (mitten-vänster, svagt auktoritär)
- MP: x=-4, y=-6 (vänster, starkt liberal)
- C: x=+3, y=-3 (mitten-höger, liberal)
- L: x=+4, y=-2 (höger, liberal)
- KD: x=+5, y=+4 (höger, auktoritär)
- M: x=+6, y=+2 (höger, svagt auktoritär)
- SD: x=+3, y=+7 (mitten-höger ekonomiskt, starkt auktoritär)

**Teknisk lösning:** SVG med viewBox="-10 -10 20 20". Partier som `<g>`-element med `<circle>` + `<text>`. Tooltips via vanilla JS på `mouseenter`/`touchstart`.

### 5.2 Valkompass-quiz

**Princip:** Användaren svarar på 20–25 påståenden. Varje svar jämförs med partiernas positioner. Resultat: rankade matchningsprocent + användarens position på kompassen.

**Frågeformat:** "Sverige bör återinföra värnplikt för alla" → [Håller med helt / Håller med delvis / Neutral / Tar avstånd delvis / Tar avstånd helt] + "viktigt för mig" toggle (dubblar vikten).

**Frågetäckning (balanserat över sakområden):**
- Ekonomi & skatter (3–4 frågor)
- Migration & integration (3 frågor)
- Lag & ordning (3 frågor)
- Klimat & energi (3 frågor)
- Sjukvård (2 frågor)
- Skola (2 frågor)
- Arbetsmarknad & pension (2 frågor)
- Försvar & NATO (2 frågor)
- EU (1–2 frågor)
- Värderingsfrågor (2 frågor: könsroller, traditionella värden, mångkultur etc.)

**Datamodell för fråga:**
```json
{
  "id": "q01",
  "category": "ekonomi",
  "statement": "Skatten på arbete bör sänkas kraftigt",
  "positions": {
    "V": -2, "S": -1, "MP": -1, "C": 1, "L": 2, "KD": 2, "M": 2, "SD": 1
  },
  "source": "Partiprogram 2024 + riksdagsröstningar"
}
```
Partiposition: -2 (starkt emot) till +2 (starkt för).

**Matchningsalgoritm:** För varje parti, summera `abs(användarsvar − partiposition)` viktat med "viktigt för mig"-flaggan. Låg summa = hög matchning. Normalisera till 0–100 %.

**Resultatvy:**
- Stapeldiagram med matchning per parti, sorterat högst→lägst.
- Användarens position plottad på kompassen tillsammans med partierna.
- "Dina svar vs. parti X" — expanderbar lista per parti för att se var ni håller med/inte.
- Disclaimer: "Detta är ingen rekommendation. Resultatet speglar våra förenklade data — läs partiernas egna program för djupare förståelse."
- Dela-knapp som genererar en URL med svaren som base64-encoded hash (ingen backend).

### 5.3 Sakfråge-jämförelse

**Princip:** Tabell/rutnät där rader är sakfrågor och kolumner är partier. Cellerna visar partiets position kortfattat.

**Sakfrågor att täcka (12–15 st):**
- Migration (volym, arbetskraftsinvandring, anhöriginvandring)
- Gängkriminalitet & straff
- Försvar/NATO-relaterade satsningar
- Elpriser & energimix (kärnkraft, vind)
- Klimatomställning (takt, styrmedel)
- Sjukvårdens styrning (regioner vs. staten)
- Skolan (friskolor, vinst, betyg)
- Skatt på arbete
- Kapitalbeskattning & företagsskatt
- Pension (åldersgräns, garantipension)
- Bostäder (hyresreglering, ROT/RUT, amorteringskrav)
- EU (federalism vs. mellanstatligt)
- Kultur & public service

**Interaktion:**
- Välj 2–4 partier att jämföra — övriga gråas ut.
- Filtrera på sakfråga.
- Varje cell: kort text (1–2 meningar) + "läs mer"-länk till partiets officiella sida.

**Datamodell:**
```json
{
  "issue": "karnkraft",
  "label": "Kärnkraft",
  "category": "energi",
  "positions": {
    "V": { "stance": "emot", "summary": "Vill fasa ut kärnkraft, satsa på förnybart.", "source": "..." },
    "M": { "stance": "for", "summary": "Vill bygga minst tio nya reaktorer.", "source": "..." }
  }
}
```

### 5.4 Tidslinje

**Princip:** Horisontell scrollbar tidslinje över vallöften, utspel och politiska händelser från valet 2022 fram till valdagen 2026.

**Filter:**
- Per parti (visa bara valda partiers events)
- Per kategori (vallöfte / utspel / kris / regeringsbeslut / partiledarbyte)

**Event-datamodell:**
```json
{
  "date": "2024-10-15",
  "party": "M",
  "type": "utspel",
  "title": "Utspel om visitationszoner",
  "summary": "Moderaterna föreslår...",
  "source_url": "https://...",
  "source_name": "SVT Nyheter"
}
```

**Viktiga events att inkludera:** Tidöavtalet, NATO-ansökan/medlemskap, partiledarbyten (Liberalernas kräftgång, MP:s språkrörsbyten), statsbudget-höjdpunkter, gängvålds-milstolpar, elpris-kriser, större reformer.

---

## 6. Partierna — grunddata

Alla åtta riksdagspartier ska vara med. Utgångspunkt för `parties.json`:

```json
[
  { "id": "V", "namn": "Vänsterpartiet", "farg": "#AF0000", "ledare": "...", "mandat_2022": 24, "valresultat_2022": 6.75 },
  { "id": "S", "namn": "Socialdemokraterna", "farg": "#E8112D", "ledare": "Magdalena Andersson", "mandat_2022": 107, "valresultat_2022": 30.33 },
  { "id": "MP", "namn": "Miljöpartiet de gröna", "farg": "#83CF39", "ledare": "...", "mandat_2022": 18, "valresultat_2022": 5.08 },
  { "id": "C", "namn": "Centerpartiet", "farg": "#009933", "ledare": "Muharrem Demirok", "mandat_2022": 24, "valresultat_2022": 6.71 },
  { "id": "L", "namn": "Liberalerna", "farg": "#006AB3", "ledare": "...", "mandat_2022": 16, "valresultat_2022": 4.61 },
  { "id": "KD", "namn": "Kristdemokraterna", "farg": "#1F3C81", "ledare": "Ebba Busch", "mandat_2022": 19, "valresultat_2022": 5.34 },
  { "id": "M", "namn": "Moderaterna", "farg": "#1B49DD", "ledare": "Ulf Kristersson", "mandat_2022": 68, "valresultat_2022": 19.10 },
  { "id": "SD", "namn": "Sverigedemokraterna", "farg": "#DDDD00", "ledare": "Jimmie Åkesson", "mandat_2022": 73, "valresultat_2022": 20.54 }
]
```

**OBS:** Verifiera partiledare mot aktuell status innan publicering — flera är färska efter 2022. Liberalerna har haft turbulens; MP har språkrör (två personer). Uppdatera detta med websökning när du bygger.

---

## 7. Opinionsläget

Sammanvägt snitt baserat på Poll of Polls / PolitPro (april 2026):

- S: ~33 %
- SD: ~20 %
- M: ~18 %
- V: ~8 %
- C: ~6 %
- MP: ~6 %
- KD: ~5 %
- L: ~2 % (under spärren)

Visualisera som horisontellt stapeldiagram med spärrlinje vid 4 %. Visa valresultat 2022 bredvid för jämförelse. Ange tydligt datum och källa. Notera att L ligger under riksdagsspärren.

---

## 8. Design & ton

**Visuell identitet:**
- Seriös men inte torr. Tidningskänsla snarare än myndighetssida.
- Hög kontrast, tydlig typografi, ingen visuell brus.
- Mörkt läge som default eller växling — mörka bakgrunder fungerar bra för datavisualisering.
- Animationer sparsamt: stagger reveals vid laddning, smooth transitions mellan sektioner, micro-interactions på hover. Inga scrolljacks, inga autoplay-videor.

**Ton i texten:**
- Kort och konkret. Inga honnörsord.
- Inga värderande ord om partier ("extrem", "ansvarsfull" etc. undviks i beskrivande text).
- Citera partiernas egna formuleringar när möjligt, med källa.

**Tillgänglighet:**
- WCAG 2.1 AA. Viktigt eftersom EU:s tillgänglighetsdirektiv gäller från juni 2025.
- Semantisk HTML (`<nav>`, `<main>`, `<section>`, `<article>`).
- Tangentbordsnavigering funkar överallt.
- Färg får inte vara enda informationsbärare (partier har både färg och text/symbol).
- Alt-text på alla grafik.
- Kontrast minst 4.5:1 för text.
- `prefers-reduced-motion` respekteras.

**Responsivitet:** Mobile first. Kompassen skalar ned till fyrkantig vy på mobil. Tidslinjen blir vertikal på mobil. Sakfråge-tabellen blir expanderbara kort på mobil.

---

## 9. Neutralitet & källor

**Viktigaste principen:** Sidan får inte favorisera något parti. Detta betyder:
- Alla partier presenteras i samma format, med samma fältlängd.
- Ingen värderande redaktionell text. Om något ska kommenteras — citera en källa.
- Alphabetisk eller mandat-ordning, aldrig "bästa först".
- Partifärger används så nära officiella färger som möjligt.

**Källor att utgå från:**
- **Partiprogrammen** på respektive partis officiella sida (primärkälla för sakfrågor)
- **Valmyndigheten** (val.se) — valresultat, regler, mandatfördelning
- **Riksdagen.se** — röstningsprotokoll, ledamöter
- **SCB** — Partisympatiundersökningen
- **Poll of Polls** (pollofpolls.se) — sammanvägt opinionssnitt
- **Chapel Hill Expert Survey** — för kompasspositioner
- **Göteborgs universitet / Valforskningsprogrammet** — forskningsbaserade placeringar
- **V-Dem / V-Party (Göteborgs universitet)** — partiers ideologiska profil

**Varje påstående om ett parti ska ha en källa** i `source`-fältet. På sidan ska källan synas antingen i tooltip eller på källsidan. Fabricera aldrig källor. Om data saknas — skriv "Uppgift saknas" hellre än att gissa.

---

## 10. Innehåll som ska finnas på "Om sidan"-sektionen

- Vem står bakom sidan (namn/pseudonym, kontakt)
- Syftet: neutral väljarinformation, inga röstningsrådgivningar
- Metodik: hur positioner och matchningar räknas ut, vilka källor som används
- Begränsningar: förenkling, felmarginaler, egen läsning rekommenderas
- Senaste uppdatering-datum (viktigt, visas även i footer)
- GDPR: ingen personlig data samlas in, inga cookies, ingen tracking
- Tillgänglighetsutlåtande (krav enligt EU-direktivet)

---

## 11. Utvecklingsprinciper för Claude Code

**När du bygger:**
1. Börja med `index.html` + `styles.css` + grundläggande navigation. Få strukturen på plats innan verktygen.
2. Bygg ett verktyg i taget. Testa det innan du går vidare. Ordning: Partier-sektion → Kompass → Sakfråge-jämförelse → Quiz → Tidslinje.
3. Lägg all data i JSON från start — hårdkoda inte i JS.
4. Använd CSS custom properties för färger och spacing från dag 1.
5. Commita ofta med tydliga meddelanden.

**När du ändrar:**
- Om datamodellen ändras, uppdatera denna fil.
- Om en ny sakfråga läggs till, lägg till den i alla åtta partiers data.
- Lägg aldrig in en åsikt om ett parti utan källa.

**Frågor du ska ställa mig innan du gissar:**
- Färgval / visuell riktning om något är otydligt.
- Om en sakfråga ska inkluderas eller utelämnas.
- Om en viss quiz-fråga är för ledande.
- När du är osäker på en partiposition (hellre fråga än fabricera).

**Sökningar du ska göra innan du skriver data:**
- Aktuella partiledare (särskilt L, MP, V)
- Senaste opinionssnittet från pollofpolls.se
- Partiernas aktuella ståndpunkter i de 12–15 sakfrågorna — hämta från respektive officiella partisida
- Tidöavtalets innehåll för timeline-events

---

## 12. Checklista innan publicering

- [ ] Alla åtta partier har komplett data (`parties.json`)
- [ ] Alla sakfrågor har position för varje parti med källa
- [ ] Quizet har minst 20 frågor, balanserat över kategorier
- [ ] Kompasspositioner är verifierade mot CHES eller GU-data
- [ ] Opinionssnittet är uppdaterat inom senaste månaden
- [ ] Tidslinjen har minst 20 events
- [ ] Mobilvy fungerar för alla verktyg
- [ ] Tangentbordsnavigering fungerar
- [ ] Kontrast testad (verktyg: WebAIM Contrast Checker)
- [ ] "Om sidan" är komplett med källor och tillgänglighetsutlåtande
- [ ] Senaste uppdatering-datum synligt
- [ ] Inga tracking-skript, inga cookies
- [ ] Laddtid under 2 sekunder på 3G
- [ ] HTML validerar (validator.w3.org)
- [ ] Länkar till primärkällor fungerar

---

## 13. Framtida idéer (efter MVP)

- Koalitionsbyggare: dra partier till 175+ mandat, se vilka blockkombinationer som fungerar
- "Gissa partiet": blind test där man läser citat utan partinamn
- Opinionsgraf över tid (kräver mer data)
- Språkversion på engelska för internationella läsare
- PWA-stöd för offline-läsning

---

*Senast uppdaterad: [fyll i vid commit]. Uppdatera denna fil när arkitektur eller datamodell ändras.*
