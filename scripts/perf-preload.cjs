/**
 * Engångsscript — Cykel 5 (Performance)
 *
 * Lägger till `<link rel="preload" href="styles.css" as="style">` på alla
 * sidor som saknar det, och normaliserar font-URL till samma format med
 * `&display=swap` om det saknas.
 *
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  'budget.html', 'debatter.html', 'gissa.html', 'historik.html',
  'index.html', 'jamfor.html', 'kandidater.html', 'koalition.html',
  'kompass.html', 'mandat.html', 'om.html', 'opinion.html',
  'partier.html', 'quiz.html', 'rostningar.html', 'sakfragor.html',
  'tidslinje.html'
];

function processFile(file) {
  const fullPath = path.join(__dirname, '..', file);
  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;
  const changes = [];

  // 1. Lägg till preload av styles.css om saknas (placeras före <link href= styles.css>)
  if (!/<link\s+rel="preload"\s+href="styles\.css"/.test(html)
      && /<link\s+rel="stylesheet"\s+href="styles\.css"/.test(html)) {
    html = html.replace(
      /(<link\s+rel="stylesheet"\s+href="styles\.css">)/,
      '<link rel="preload" href="styles.css" as="style">\n  $1'
    );
    changes.push('preload-styles');
  }

  // 2. Normalisera font-URL: säkerställ &display=swap i Bunny Fonts URL
  html = html.replace(
    /(<link\s+href="https:\/\/fonts\.bunny\.net\/css\?[^"]+)"/g,
    (m, url) => {
      if (url.includes('display=swap')) return m;
      const sep = url.includes('?') ? '&' : '?';
      changes.push('font-display-swap');
      return `${url}${sep}display=swap"`;
    }
  );

  if (html !== original) {
    fs.writeFileSync(fullPath, html, 'utf8');
    console.log(`OK ${file} — ${changes.join(', ')}`);
    return true;
  }
  console.log(`unchanged ${file}`);
  return false;
}

let changed = 0;
for (const f of FILES) if (processFile(f)) changed++;
console.log(`\nKlart. ${changed}/${FILES.length} filer ändrade.`);
