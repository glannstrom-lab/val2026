/**
 * Engångsscript — Cykel 27 (Content, valmanifest 2026)
 *
 * Lägger till `valmanifest_2026_url: null` på varje parti i parties.json.
 * Fältet fylls i av handhållare när respektive parti släpper sitt manifest
 * (vanligtvis maj-juni 2026).
 *
 * Idempotent — skippar partier som redan har fältet.
 */
const fs = require('fs');
const path = require('path');

const partiesPath = path.join(__dirname, '..', 'data', 'parties.json');
const parties = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));

let added = 0;
for (const p of parties) {
  if (!('valmanifest_2026_url' in p)) {
    p.valmanifest_2026_url = null;
    added++;
  }
}

if (added > 0) {
  // Bevara samma JSON-formatering (2-space indent, trailing newline)
  fs.writeFileSync(partiesPath, JSON.stringify(parties, null, 2) + '\n', 'utf8');
}

console.log(`Klart. Fält "valmanifest_2026_url" tillagt på ${added}/${parties.length} partier.`);
