# PROJECT_LOG

Append-only logg över autonoma cykler. Senaste posten överst.

Format för varje post:
```
## Cykel [nummer] — [datum] — [kategori]

**Bedömning**: [vad behövde projektet mest]
**Alternativ jag valde bort**: [2-3 saker och varför]
**Gjort**: [vad som faktiskt utfördes]
**Resultat**: [vad fungerade, vad inte]
**Nästa cykel bör undvika**: [denna kategori om upprepad]
```

---

## Cykel 1 — 2026-05-01 — Content

**Bedömning**: Projektet är längre kommet än CLAUDE.md antyder — 18 sidor, 14 verktyg, 13 datafiler redan byggda. Tidsfaktor: 9 veckor till feature-frys (1 juli) → fokus ska vara fakta + polering, inte nya features. Konkret gap: partier.html visar mandat 2022, valresultat 2022, ideologi och beskrivning som text utan synlig källrad. Det bryter mot MÅSTE-kravet "Källhänvisningar synliga för användaren". Endast en CTA längst ner i kortet ("Besök officiell sida") signalerar käll-koppling, men inte tydligt.
**Alternativ jag valde bort**:
- WebAIM-kontrasttest (Accessibility) — fungerande område, sista commit gjorde redan kontrastfix på SD-gult, mer värde i variation över kategorier
- Lighthouse-pass (Performance) — kräver lokal körning, inte trivialt automatiserad i denna miljö
- Lägga till valmanifest 2026 i datat (Content) — för tidigt, partierna släpper närmare juni
**Gjort**:
1. Importerade relevant projektstatus från CLAUDE2.md till nya CLAUDE.md "Current State" (stack, verktyg, data, senaste arbete, öppna luckor)
2. Lade till synlig källrad i `renderPartyCard` (app.js:148-154) under stats-blocket: "Källor: riksdagen.se (mandat) · val.se (valresultat)"
3. Ny CSS-klass `.party-sources` i styles.css:744-760 — använder befintliga tokens, behåller dark/light-kontrast
4. Markerade Fas 1-uppgift "Alla 8 partier har baspresentation med källor" som delvis (`[~]`) i ROADMAP.md med tydlig restlista
5. Lade till tre nya backlog-poster: utöka källrader till opinion/historik/mandat/budget/rostningar, partispecifika riksdagslänkar i parties.json, källor till `beskrivning`/`ideologi`-text
**Resultat**:
- Renderad HTML verifierad via Node — ren, semantisk, externa länkar har `rel="noopener"`
- Inga tester berör renderingen — befintlig test-suite ej påverkad
- Källraden använder två primärkällor (riksdagen.se, val.se), inte sekundärkällor
- Källraden är generisk och visar samma URL för alla 8 partier — partispecifika länkar är en framtida cykels jobb
**Nästa cykel bör undvika**: Content-kategori. Lämpliga kandidater: Accessibility (WebAIM-kontrast), Mobile UX, Neutrality audit, Performance, eller Tools.

---

## Cykel 0 — Initial — Setup

**Bedömning**: Projektet behöver autonom drift-infrastruktur innan cykler kan börja.
**Alternativ jag valde bort**: Direkt feature-arbete (ingen mening utan logg), neutralitetsgranskning (kan inte mätas utan baseline).
**Gjort**: CLAUDE.md, PROJECT_LOG.md, ROADMAP.md, DECISIONS.md skapade.
**Resultat**: Klar för Cykel 1.
**Nästa cykel bör undvika**: Setup-kategori (engångs).
