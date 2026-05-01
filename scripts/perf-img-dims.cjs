/**
 * Engångsscript — Cykel 14 (Performance, CLS-prevention)
 *
 * Lägger till `width="48" height="48"` på alla party-logo `<img>` som saknar
 * dimensioner. Alla logos är kvadratiska — 1:1 ratio är korrekt aspect-hint
 * även om CSS sätter andra absoluta storlekar. Browser använder ratio för
 * CLS-prevention.
 *
 * Idempotent — säker att köra flera gånger.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  'app.js',
  'tools/budget.js', 'tools/candidates.js', 'tools/coalition.js',
  'tools/compare.js', 'tools/guess.js', 'tools/history.js',
  'tools/partycompare.js', 'tools/pollgraph.js', 'tools/quiz.js',
  'tools/seatcalc.js', 'tools/timeline.js', 'tools/votes.js'
];

let total = 0;
let perFile = {};

for (const f of FILES) {
  const fullPath = path.join(__dirname, '..', f);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Match <img ...> som saknar både width och height
  content = content.replace(/<img\s+([^>]*?)>/g, (full, attrs) => {
    if (/\swidth=/.test(' ' + attrs) || /\sheight=/.test(' ' + attrs)) return full;
    // Bara party-logos (src innehåller assets/logos/ eller liknande)
    if (!/src="[^"]*logos\//.test(attrs)) return full;
    perFile[f] = (perFile[f] || 0) + 1;
    total++;
    return `<img ${attrs} width="48" height="48">`;
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

console.log(`Klart. ${total} img-tags fick width/height.`);
for (const [f, n] of Object.entries(perFile)) {
  console.log(`  ${f}: ${n}`);
}
