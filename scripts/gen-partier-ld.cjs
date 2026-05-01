/**
 * Engångsscript — Cykel 15 (SEO, JSON-LD)
 *
 * Genererar JSON-LD ItemList av Person för partiledarna baserat på
 * parties.json, och inserterar den i partier.html.
 *
 * Re-kör vid varje partiledar-byte. Idempotent — ersätter befintlig
 * partier-LD-block om den finns.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://glannstrom-lab.github.io/val2026';
const partiesPath = path.join(__dirname, '..', 'data', 'parties.json');
const partierHtmlPath = path.join(__dirname, '..', 'partier.html');

const parties = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));

// Sortera partier i stabil ordning (efter mandat 2022 desc)
const sorted = [...parties].sort((a, b) => b.mandat_2022 - a.mandat_2022);

const ld = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Partiledare i Sveriges riksdag inför valet 2026",
  "description": "De åtta partiledarna för riksdagspartierna med roll, parti och officiell webbplats.",
  "numberOfItems": sorted.length,
  "itemListElement": sorted.map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "Person",
      "name": p.ledare,
      "jobTitle": p.ledare_titel,
      "memberOf": {
        "@type": "PoliticalParty",
        "name": p.namn,
        "alternateName": p.kortnamn,
        "url": p.webbplats
      }
    }
  }))
};

const block = `
  <script type="application/ld+json">
${JSON.stringify(ld, null, 2).split('\n').map(l => '  ' + l).join('\n')}
  </script>`;

let html = fs.readFileSync(partierHtmlPath, 'utf8');

// Ta bort befintlig generated LD-block (idempotent)
html = html.replace(
  /\n\s*<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":\s*"ItemList"[\s\S]*?<\/script>/,
  ''
);

// Insertera före closing </head>
if (html.includes('</head>')) {
  html = html.replace('</head>', block + '\n</head>');
} else {
  console.error('Kunde inte hitta </head> i partier.html');
  process.exit(1);
}

fs.writeFileSync(partierHtmlPath, html, 'utf8');
console.log('OK partier.html — JSON-LD ItemList av ' + sorted.length + ' partiledare insertad.');
console.log('Validerat: JSON-LD är giltig schema.org ItemList med Person-items.');
