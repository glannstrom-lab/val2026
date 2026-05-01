# DECISIONS

Arkitektoniska och produktbeslut med motivering. Append-only — ändra aldrig gamla poster, lägg istället till nya som upphäver.

Format:
```
## [Datum] — [Beslut i en mening]
**Kontext**: [vad ledde till beslutet]
**Alternativ**: [vad övervägdes]
**Val**: [vad valdes och varför]
**Konsekvens**: [vad detta innebär framåt]
**Upphäver**: [referens till tidigare beslut, om någon]
```

---

## 2026-05-01 — Autonom drift med produktägar-loop införd

**Kontext**: Projektet behöver kontinuerlig utveckling fram till juli 2026 utan att Mikael behöver styra varje steg.
**Alternativ**: Manuell utveckling, schemalagda batch-jobb, fullständig automation utan checkpunkter.
**Val**: Autonom loop med tvingad kategorivariation och anti-repetitionsregel.
**Konsekvens**: Mikael kan köra cykler genom att skriva "Run one cycle" och granska PROJECT_LOG.md var 5-10:e cykel.

---

## 2026-05-01 — Källrad-mönster: synlig under data, inte bara CTA

**Kontext**: MUSS-krav i CLAUDE.md säger "Källhänvisningar synliga för användaren, inte bara i koden". Tidigare hade partier.html bara en "Besök officiell sida"-CTA längst ner i kortet — ingen tydlig signal att det var källan.
**Alternativ**: Behålla bara CTA, bygga en tooltip-baserad källinfo, lägga till källrad inom datakontainer.
**Val**: Källrad direkt under data-blocket (statistik) med liten muted text och underlinjerade länkar. Återanvändbar `.party-sources`/`.history-source`/`.seatcalc-source`-klass.
**Konsekvens**: Etablerat mönster för alla nya data-tunga sidor. Cykler 1, 6, 10 utvidgar systemet. Tre källrad-typer alla med samma stil.

---

## 2026-05-01 — JSON-LD via scripts i `scripts/`-mapp, inte build-step

**Kontext**: SEO-strukturerad data behövs för Google rich results. Två val: (a) hårdkoda JSON-LD i HTML, (b) generera dynamiskt via JS-injection, (c) generera vid skrivning via separat skript.
**Alternativ**: Hårdkoda (synkningsrisk), JS-injection (bots kör inte alltid JS), npm-baserad bygg-pipeline (bryter "ingen build-process").
**Val**: Idempotenta node-scripts i `scripts/`-mappen som läser JSON-data och inserterar JSON-LD i HTML. Re-körs manuellt vid datatillägg.
**Konsekvens**: Single source of truth (parties.json, debates.json) men statisk LD-output som alla bots kan läsa. `scripts/gen-partier-ld.cjs` (Cykel 15) och `scripts/gen-debatter-ld.cjs` (Cykel 21). `scripts/run-all.cjs` (Cykel 34) som samlingsrunner.

---

## 2026-05-01 — Service worker: cache-first generellt, SWR för data-filer

**Kontext**: Service worker ska ge offline-stöd men inte hindra användare från att se uppdaterad data. Innehåll uppdateras under valrörelsen (opinion, debatter, tidslinje).
**Alternativ**: Network-first (långsamt offline), no-cache för data (bryter offline), cache-first med kort TTL (komplexare).
**Val**: Hybrid — cache-first för HTML/CSS/JS (CACHE_NAME-bump invaliderar vid deploy), stale-while-revalidate för `data/*.json` (cached omedelbart + bakgrundshämtning för nästa besök).
**Konsekvens**: Snabbt vid varje besök, fungerar offline, automatisk uppdatering av data utan deploy. CACHE_NAME bumpas manuellt vid kodändringar — konvention `val2026-vN`. Cykel 33.

---

## 2026-05-01 — Konsekvent felmeddelande-mönster över alla 14 tools

**Kontext**: Audit i Cykel 11 visade att 8 tools använde `<p class="text-center text-muted">` och 3 använde `class="error"` — och **`.error`-klassen saknades helt i CSS**. Ingen visuell feedback vid datafel.
**Alternativ**: Lämna inkonsekvent, bygga komplex retry-logic, konvergera mot ett mönster.
**Val**: Standardformat `<div class="error">Kunde inte ladda X. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>` på alla 14 tools (utom seatcalc som har graceful degradation utan partidata).
**Konsekvens**: Användaren får alltid handlingsbar feedback vid datafel. CSS `.error` med varnings-tinad bakgrund och ⚠-prefix. Mönster bevarat i scripts som re-applicerar.
