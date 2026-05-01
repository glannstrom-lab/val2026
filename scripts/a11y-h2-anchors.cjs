/**
 * Engångsscript — Cykel 24 (Accessibility, heading-hierarki)
 *
 * Lägger till statisk `<h2 class="sr-only">` ankare på sidor där
 * tools renderar h3+ direkt under sidans h1 (WCAG SC 1.3.1 hopp).
 *
 * Mönstret etablerades i Cykel 7 för tidslinje.html.
 *
 * Idempotent — skippar sidor som redan har h2 i sin section-container.
 */
const fs = require('fs');
const path = require('path');

// Mappa: HTML-fil → { containerId, sectionClass, h2Text }
const PAGES = {
  'budget.html':      { containerId: 'budget-container',     sectionClass: 'budget-section',        h2: 'Budgetområden och partiernas alternativ' },
  'kandidater.html':  { containerId: 'candidates-container', sectionClass: 'candidates-section',    h2: 'Sökbara kandidater' },
  'sakfragor.html':   { containerId: 'compare-container',    sectionClass: 'compare-section',       h2: 'Partiernas ståndpunkter' },
  'gissa.html':       { containerId: 'guess-container',      sectionClass: 'guess-section',         h2: 'Citatquiz' },
  'historik.html':    { containerId: 'history-container',    sectionClass: 'history-section',       h2: 'Resultat och jämförelser' },
  'jamfor.html':      { containerId: 'partycompare-container', sectionClass: 'partycompare-section', h2: 'Sida-vid-sida-jämförelse' },
  'quiz.html':        { containerId: 'quiz-container',       sectionClass: 'quiz-section',          h2: 'Quiz-frågor' },
  'mandat.html':      { containerId: 'seatcalc-container',   sectionClass: 'seatcalc-section',      h2: 'Mandatberäkning' },
  'rostningar.html':  { containerId: 'votes-container',      sectionClass: 'votes-section',         h2: 'Riksdagsröstningar och partilinjer' }
};

let changed = 0;
for (const [file, cfg] of Object.entries(PAGES)) {
  const fullPath = path.join(__dirname, '..', file);
  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;

  // Skippa om h2 redan finns i sidan (idempotent)
  if (/<h2[^>]*sr-only/.test(html)) {
    console.log(`unchanged ${file} (har redan sr-only h2)`);
    continue;
  }

  // Hitta `<div ... id="${containerId}" ...>` (kan ha class före/efter, valfri ordning)
  const containerRe = new RegExp(`(\\s*)(<div\\b[^>]*\\bid="${cfg.containerId}"[^>]*>)`);
  if (!containerRe.test(html)) {
    console.warn(`SKIP ${file} — hittade inte div#${cfg.containerId}`);
    continue;
  }

  // Lägg till aria-labelledby på den närmaste section med matchande klass om finns
  const headingId = `${cfg.containerId.replace(/-container$/, '')}-heading`;
  html = html.replace(
    new RegExp(`<section\\s+class="${cfg.sectionClass}"`),
    `<section class="${cfg.sectionClass}" aria-labelledby="${headingId}"`
  );

  html = html.replace(
    containerRe,
    `$1<h2 id="${headingId}" class="sr-only">${cfg.h2}</h2>$1$2`
  );

  if (html !== original) {
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log(`OK ${file} — lade h2 "${cfg.h2}"`);
    changed++;
  }
}

console.log(`\nKlart. ${changed}/${Object.keys(PAGES).length} sidor ändrade.`);
