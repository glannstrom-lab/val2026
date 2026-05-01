/**
 * Engångsscript — Cykel 26 (code hygiene)
 *
 * Tar bort `console.log(...)` dev-rester från produktionskod.
 * Behåller `console.error` och `console.warn` (de är felhantering).
 *
 * Idempotent — säker att köra flera gånger.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  'app.js',
  'tools/budget.js', 'tools/candidates.js', 'tools/coalition.js',
  'tools/compare.js', 'tools/compass.js', 'tools/debates.js',
  'tools/guess.js', 'tools/history.js', 'tools/partycompare.js',
  'tools/pollgraph.js', 'tools/quiz.js', 'tools/seatcalc.js',
  'tools/timeline.js', 'tools/votes.js',
  'components/header.js'
];

let total = 0;
for (const f of FILES) {
  const fullPath = path.join(__dirname, '..', f);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Match hela rader som bara innehåller console.log(...)
  // (med möjlig leading whitespace och trailing semicolon)
  // Behöll inte multilineraga calls för säkerhet.
  const lines = content.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (/^console\.log\s*\(.*\);?\s*$/.test(trimmed)) {
      total++;
      return false;
    }
    return true;
  });
  content = filtered.join('\n');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`OK ${f}`);
  }
}

console.log(`\nKlart. ${total} console.log-rader borttagna.`);
