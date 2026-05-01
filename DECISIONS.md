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
