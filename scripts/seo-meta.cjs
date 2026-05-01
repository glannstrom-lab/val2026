/**
 * Engångsscript — Cykel 3 (SEO & meta)
 *
 * Normaliserar SEO-meta-taggar över alla 17 HTML-sidor:
 *  - tar bort befintliga OG/Twitter/canonical (inkonsekvent fördelade)
 *  - inserterar ett komplett block direkt efter <meta name="description">
 *  - normaliserar title-separator "|" → "—" så formatet är enhetligt
 *
 * Idempotent: säker att köra flera gånger.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://glannstrom-lab.github.io/val2026';
const FILES = [
  'budget.html', 'debatter.html', 'gissa.html', 'historik.html',
  'index.html', 'jamfor.html', 'kandidater.html', 'koalition.html',
  'kompass.html', 'mandat.html', 'om.html', 'opinion.html',
  'partier.html', 'quiz.html', 'rostningar.html', 'sakfragor.html',
  'tidslinje.html'
];

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildBlock({ url, title, description }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  return [
    '  <!-- Open Graph / sociala medier -->',
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:site_name" content="Val 2026 — Väljarportal">`,
    `  <meta property="og:url" content="${url}">`,
    `  <meta property="og:title" content="${t}">`,
    `  <meta property="og:description" content="${d}">`,
    `  <meta property="og:locale" content="sv_SE">`,
    `  <meta name="twitter:card" content="summary">`,
    `  <meta name="twitter:title" content="${t}">`,
    `  <meta name="twitter:description" content="${d}">`,
    `  <link rel="canonical" href="${url}">`
  ].join('\n');
}

function processFile(file) {
  const fullPath = path.join(__dirname, '..', file);
  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;

  // 1. Normalisera title separator "|" → "—" (em-dash)
  html = html.replace(
    /<title>([^<]*?)\s*\|\s*([^<]*?)<\/title>/,
    '<title>$1 — $2</title>'
  );

  // 2. Hämta title och description efter normalisering
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/);
  if (!titleMatch || !descMatch) {
    console.warn(`SKIP ${file}: saknar title eller description`);
    return false;
  }
  const title = titleMatch[1].trim();
  const description = descMatch[1].trim();

  // 3. Ta bort alla rader som är OG/Twitter/canonical-meta
  const lines = html.split('\n');
  const cleaned = [];
  let inOgComment = false;
  for (const line of lines) {
    // Hoppa över "Open Graph"-kommentarer
    if (/<!--\s*(Open Graph|OG|Social|Sociala medier|sociala medier)/i.test(line)) {
      inOgComment = true;
      continue;
    }
    if (inOgComment && /-->/.test(line)) {
      inOgComment = false;
      continue;
    }
    // Hoppa över OG/Twitter/canonical
    if (/<meta\s+(?:property|name)="(?:og:|twitter:)/.test(line)) continue;
    if (/<link\s+rel="canonical"/.test(line)) continue;
    cleaned.push(line);
  }
  html = cleaned.join('\n');

  // 4. Bygg URL
  const url = file === 'index.html'
    ? SITE_URL + '/'
    : `${SITE_URL}/${file}`;

  // 5. Insertera nytt block efter <meta name="description">
  const block = buildBlock({ url, title, description });
  html = html.replace(
    /(<meta\s+name="description"\s+content="[^"]+"\s*\/?>)/,
    `$1\n${block}`
  );

  // 6. Städa eventuella tomrader > 2 i rad i <head>
  html = html.replace(/\n{3,}/g, '\n\n');

  if (html !== original) {
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log(`OK ${file} — title: "${title.substring(0, 40)}…"`);
    return true;
  }
  console.log(`unchanged ${file}`);
  return false;
}

let changed = 0;
for (const f of FILES) {
  if (processFile(f)) changed++;
}
console.log(`\nKlart. ${changed}/${FILES.length} filer ändrade.`);
