/**
 * Samlings-runner — kör alla scripts i `scripts/` i en deploy-kedja.
 *
 * Användning: `node scripts/run-all.cjs`
 *
 * Använd vid:
 *  - Större deploys där flera datafiler/HTML-sidor uppdaterats
 *  - Manuell verifiering att alla scripts kör utan fel
 *  - Efter en partiledar-byte (parties.json ändras → gen-partier-ld måste re-köra)
 *  - Efter en debate-uppdatering (debates.json → gen-debatter-ld)
 *
 * **VARNING om idempotency**: De flesta scripts är idempotenta (perf-img-dims,
 * perf-preload, hygiene-console, a11y-h2-anchors, add-valmanifest-field).
 * Tre scripts är "best-effort idempotent" — formaterings-skillnader kan
 * uppstå mellan körningar:
 *  - `seo-meta.cjs` regenererar OG-blocket (samma innehåll, men ordning av
 *    rader runt kan variera om HTML har modifierats av andra scripts först)
 *  - `gen-partier-ld.cjs` och `gen-debatter-ld.cjs` regenererar JSON-LD
 *    från data — om JSON-formattering ändras blir block annorlunda
 *
 * Granska `git diff` efter run-all och committa bara avsiktliga ändringar.
 */
const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS = [
  // Kör i logisk ordning: data → SEO/HTML → JSON-LD → hygiene → preload
  'add-valmanifest-field.cjs',  // data: säkrar fältet finns på alla partier
  'seo-meta.cjs',                // SEO: OG/canonical-block på alla sidor
  'a11y-h2-anchors.cjs',         // a11y: sr-only h2 på tool-sidor
  'gen-partier-ld.cjs',          // SEO: ItemList Person från parties.json
  'gen-debatter-ld.cjs',         // SEO: ItemList BroadcastEvent från debates.json
  'perf-img-dims.cjs',           // perf: width/height på logo-img
  'perf-preload.cjs',            // perf: preload styles + display=swap
  'hygiene-console.cjs',         // hygiene: ta bort console.log dev-rester
];

const root = path.join(__dirname, '..');

console.log('=== Kör alla idempotenta scripts ===\n');
let failed = 0;
for (const script of SCRIPTS) {
  console.log(`▶ ${script}`);
  try {
    const output = execSync(`node ${path.join('scripts', script)}`, {
      cwd: root,
      encoding: 'utf8'
    });
    // Skriv ut sista raden som sammanfattning
    const lastLine = output.trim().split('\n').pop();
    console.log(`  ✓ ${lastLine}\n`);
  } catch (e) {
    console.error(`  ✗ FAIL: ${e.message}\n`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} script(s) misslyckades.`);
  process.exit(1);
}
console.log('Alla scripts kördes utan fel.');
