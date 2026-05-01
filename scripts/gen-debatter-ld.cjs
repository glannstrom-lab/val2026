/**
 * Engångsscript — Cykel 21 (SEO, JSON-LD)
 *
 * Genererar JSON-LD ItemList av Event för valdebatter baserat på
 * debates.json, och inserterar den i debatter.html.
 *
 * Re-kör vid varje tillägg/ändring av debate. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://glannstrom-lab.github.io/val2026';
const debatesPath = path.join(__dirname, '..', 'data', 'debates.json');
const debatterHtmlPath = path.join(__dirname, '..', 'debatter.html');

const data = JSON.parse(fs.readFileSync(debatesPath, 'utf8'));
const debates = data.debates || data;

// Sortera kronologiskt
const sorted = [...debates].sort((a, b) =>
  String(a.date).localeCompare(String(b.date))
);

function toIso(date, time) {
  if (!date) return undefined;
  if (!time) return date;
  // Sverige är TZ-offset +02:00 i september (CEST)
  return `${date}T${time}:00+02:00`;
}

const ld = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Valdebatter inför riksdagsvalet 2026",
  "description": "Schemalagda debatter mellan partiledare i TV och radio inför valet 14 september 2026.",
  "numberOfItems": sorted.length,
  "itemListElement": sorted.map((d, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "BroadcastEvent",
      "name": d.title,
      "description": d.description || undefined,
      "startDate": toIso(d.date, d.time),
      "endDate": toIso(d.date, d.endTime),
      "publishedOn": d.channel ? {
        "@type": "BroadcastService",
        "name": d.channel
      } : undefined,
      "eventStatus": d.status === 'completed' ? 'https://schema.org/EventCompleted'
                  : d.status === 'cancelled' ? 'https://schema.org/EventCancelled'
                  : 'https://schema.org/EventScheduled',
      "about": d.topics
    }
  }))
};

// Ta bort undefined fields rekursivt
function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, clean(v)])
    );
  }
  return obj;
}

const cleanLd = clean(ld);

const block = `
  <script type="application/ld+json">
${JSON.stringify(cleanLd, null, 2).split('\n').map(l => '  ' + l).join('\n')}
  </script>`;

let html = fs.readFileSync(debatterHtmlPath, 'utf8');

// Ta bort befintlig generated LD-block (idempotent)
html = html.replace(
  /\n\s*<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":\s*"ItemList"[\s\S]*?<\/script>/,
  ''
);

if (html.includes('</head>')) {
  html = html.replace('</head>', block + '\n</head>');
} else {
  console.error('Kunde inte hitta </head> i debatter.html');
  process.exit(1);
}

fs.writeFileSync(debatterHtmlPath, html, 'utf8');
console.log(`OK debatter.html — JSON-LD ItemList av ${sorted.length} BroadcastEvents insertad.`);
