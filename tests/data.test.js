/**
 * Data Integrity Tests
 * Validates all JSON data files for consistency
 * Run with: node tests/data.test.js
 */

const fs = require('fs');
const path = require('path');

// ==========================================================================
// Test Framework (minimal)
// ==========================================================================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message = '') {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ==========================================================================
// Load Data
// ==========================================================================

const dataDir = path.join(__dirname, '..', 'data');
const PARTIES = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];

function loadJSON(filename) {
  const filepath = path.join(dataDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

// ==========================================================================
// Tests
// ==========================================================================

console.log('\n📁 Data Integrity Tests\n');

// Test: parties.json
console.log('parties.json:');
let parties;
try {
  parties = loadJSON('parties.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has 8 parties', () => {
  assertEqual(parties.length, 8);
});

test('All party IDs are valid', () => {
  const ids = parties.map(p => p.id);
  PARTIES.forEach(id => {
    assertTrue(ids.includes(id), `Missing party ${id}`);
  });
});

test('All parties have required fields', () => {
  parties.forEach(p => {
    assertTrue(p.id !== undefined, `Party missing id`);
    assertTrue(p.namn !== undefined, `Party ${p.id} missing namn`);
    assertTrue(p.ledare !== undefined, `Party ${p.id} missing ledare`);
    assertTrue(p.opinion_nu !== undefined, `Party ${p.id} missing opinion_nu`);
    assertTrue(p.mandat_2022 !== undefined, `Party ${p.id} missing mandat_2022`);
  });
});

test('Opinion percentages are reasonable (0-50%)', () => {
  parties.forEach(p => {
    assertTrue(
      p.opinion_nu >= 0 && p.opinion_nu <= 50,
      `Invalid opinion ${p.opinion_nu} for ${p.id}`
    );
  });
});

test('Total mandates in 2022 equal 349', () => {
  const total = parties.reduce((sum, p) => sum + p.mandat_2022, 0);
  assertEqual(total, 349, 'Total mandates should be 349');
});

// Test: issues.json
console.log('\nissues.json:');
let issues;
try {
  issues = loadJSON('issues.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has issues array', () => {
  assertTrue(Array.isArray(issues.issues), 'issues should be an array');
});

test('Has categories', () => {
  assertTrue(issues.categories !== undefined, 'Missing categories');
});

test('All issues have positions for all parties', () => {
  issues.issues.forEach(issue => {
    PARTIES.forEach(party => {
      assertTrue(
        issue.positions && issue.positions[party],
        `Issue ${issue.id} missing position for ${party}`
      );
    });
  });
});

test('All issues have valid category', () => {
  issues.issues.forEach(issue => {
    assertTrue(
      issues.categories[issue.category],
      `Issue ${issue.id} has invalid category ${issue.category}`
    );
  });
});

// Test: timeline.json
console.log('\ntimeline.json:');
let timeline;
try {
  timeline = loadJSON('timeline.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has events array', () => {
  assertTrue(Array.isArray(timeline.events), 'events should be an array');
});

test('All events have required fields', () => {
  timeline.events.forEach(e => {
    assertTrue(e.id !== undefined, 'Event missing id');
    assertTrue(e.date !== undefined, `Event ${e.id} missing date`);
    assertTrue(e.title !== undefined, `Event ${e.id} missing title`);
  });
});

test('All event dates are valid', () => {
  timeline.events.forEach(e => {
    const date = new Date(e.date);
    assertTrue(!isNaN(date.getTime()), `Invalid date ${e.date} for event ${e.id}`);
  });
});

// Test: quotes.json
console.log('\nquotes.json:');
let quotes;
try {
  quotes = loadJSON('quotes.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has quotes array', () => {
  assertTrue(Array.isArray(quotes.quotes), 'quotes should be an array');
});

test('All quotes have valid party', () => {
  quotes.quotes.forEach(q => {
    assertTrue(
      PARTIES.includes(q.party),
      `Quote ${q.id} has invalid party ${q.party}`
    );
  });
});

// Test: debates.json
console.log('\ndebates.json:');
let debates;
try {
  debates = loadJSON('debates.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has debates array', () => {
  assertTrue(Array.isArray(debates.debates), 'debates should be an array');
});

test('All debates have required fields', () => {
  debates.debates.forEach(d => {
    assertTrue(d.id !== undefined, 'Debate missing id');
    assertTrue(d.title !== undefined, `Debate ${d.id} missing title`);
    assertTrue(d.date !== undefined, `Debate ${d.id} missing date`);
    assertTrue(d.channel !== undefined, `Debate ${d.id} missing channel`);
  });
});

// Test: candidates.json
console.log('\ncandidates.json:');
let candidates;
try {
  candidates = loadJSON('candidates.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has candidates array', () => {
  assertTrue(Array.isArray(candidates.candidates), 'candidates should be an array');
});

test('Has constituencies', () => {
  assertTrue(Array.isArray(candidates.constituencies), 'constituencies should be an array');
});

test('All candidates have valid party', () => {
  candidates.candidates.forEach(c => {
    assertTrue(
      PARTIES.includes(c.party),
      `Candidate ${c.name} has invalid party ${c.party}`
    );
  });
});

test('All candidates have valid constituency', () => {
  const constIds = candidates.constituencies.map(c => c.id);
  candidates.candidates.forEach(c => {
    assertTrue(
      constIds.includes(c.constituency),
      `Candidate ${c.name} has invalid constituency ${c.constituency}`
    );
  });
});

// Test: compass-positions.json
console.log('\ncompass-positions.json:');
let compass;
try {
  compass = loadJSON('compass-positions.json');
} catch (e) {
  console.log(`  ✗ Failed to load: ${e.message}`);
  process.exit(1);
}

test('Has positions array', () => {
  assertTrue(Array.isArray(compass.positions), 'positions should be an array');
});

test('All 8 parties have compass positions', () => {
  const compassIds = compass.positions.map(p => p.id);
  PARTIES.forEach(id => {
    assertTrue(compassIds.includes(id), `Missing compass position for ${id}`);
  });
});

test('Compass values are in valid range (-10 to 10)', () => {
  compass.positions.forEach(p => {
    assertTrue(
      p.x >= -10 && p.x <= 10,
      `Invalid x value ${p.x} for ${p.id}`
    );
    assertTrue(
      p.y >= -10 && p.y <= 10,
      `Invalid y value ${p.y} for ${p.id}`
    );
  });
});

// ==========================================================================
// Summary
// ==========================================================================

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
