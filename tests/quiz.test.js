/**
 * Quiz Algorithm Tests
 * Run with: node tests/quiz.test.js
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

function assertArrayIncludes(array, item, message = '') {
  if (!array.includes(item)) {
    throw new Error(message || `Array does not include ${item}`);
  }
}

// ==========================================================================
// Load Data
// ==========================================================================

const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const filepath = path.join(dataDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

// ==========================================================================
// Quiz Algorithm (extracted from quiz.js)
// ==========================================================================

const ANSWER_VALUES = {
  'agree_strongly': 2,
  'agree': 1,
  'neutral': 0,
  'disagree': -1,
  'disagree_strongly': -2
};

const PARTIES = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];

function calculateMatches(questions, answers, importantFlags = {}) {
  const results = {};

  PARTIES.forEach(party => {
    results[party] = {
      totalDiff: 0,
      maxPossibleDiff: 0,
      questionMatches: []
    };
  });

  questions.forEach(question => {
    const userAnswer = answers[question.id];
    if (userAnswer === undefined) return;

    const userValue = ANSWER_VALUES[userAnswer];
    const weight = importantFlags[question.id] ? 2 : 1;

    PARTIES.forEach(party => {
      const partyPosition = question.positions[party];
      const diff = Math.abs(userValue - partyPosition);
      const maxDiff = 4;

      results[party].totalDiff += diff * weight;
      results[party].maxPossibleDiff += maxDiff * weight;
      results[party].questionMatches.push({
        questionId: question.id,
        userValue,
        partyValue: partyPosition,
        diff: diff * weight
      });
    });
  });

  // Calculate match percentages
  const matches = [];
  PARTIES.forEach(party => {
    const { totalDiff, maxPossibleDiff } = results[party];
    const matchPercent = maxPossibleDiff > 0
      ? Math.round((1 - totalDiff / maxPossibleDiff) * 100)
      : 0;
    matches.push({
      party,
      percent: matchPercent,
      details: results[party]
    });
  });

  return matches.sort((a, b) => b.percent - a.percent);
}

// ==========================================================================
// Tests
// ==========================================================================

console.log('\n📊 Quiz Algorithm Tests\n');

// Load test data
let quizData, partiesData;
try {
  quizData = loadJSON('quiz-questions.json');
  partiesData = loadJSON('parties.json');
  console.log(`Loaded ${quizData.questions.length} questions and ${partiesData.length} parties\n`);
} catch (error) {
  console.error('Failed to load test data:', error.message);
  process.exit(1);
}

// Test: Data integrity
console.log('Data Integrity:');

test('Quiz has questions', () => {
  assertTrue(quizData.questions.length > 0, 'No questions found');
});

test('Quiz has 50 questions', () => {
  assertEqual(quizData.questions.length, 50);
});

test('All questions have positions for all 8 parties', () => {
  quizData.questions.forEach((q, i) => {
    PARTIES.forEach(party => {
      assertTrue(
        q.positions[party] !== undefined,
        `Question ${i + 1} (${q.id}) missing position for ${party}`
      );
    });
  });
});

test('All positions are valid (-2 to 2)', () => {
  quizData.questions.forEach(q => {
    PARTIES.forEach(party => {
      const pos = q.positions[party];
      assertTrue(
        pos >= -2 && pos <= 2,
        `Invalid position ${pos} for ${party} in ${q.id}`
      );
    });
  });
});

test('All questions have a category', () => {
  quizData.questions.forEach(q => {
    assertTrue(q.category !== undefined, `Question ${q.id} missing category`);
    assertTrue(
      quizData.categories[q.category] !== undefined,
      `Unknown category ${q.category} in ${q.id}`
    );
  });
});

// Test: Matching algorithm
console.log('\nMatching Algorithm:');

test('Perfect agreement gives 100% match', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 2, MP: 2, C: 2, L: 2, KD: 2, M: 2, SD: 2 }
  };
  const answers = { test1: 'agree_strongly' };
  const matches = calculateMatches([testQuestion], answers);

  matches.forEach(m => {
    assertEqual(m.percent, 100, `${m.party} should be 100%`);
  });
});

test('Perfect disagreement gives 0% match', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 2, MP: 2, C: 2, L: 2, KD: 2, M: 2, SD: 2 }
  };
  const answers = { test1: 'disagree_strongly' };
  const matches = calculateMatches([testQuestion], answers);

  matches.forEach(m => {
    assertEqual(m.percent, 0, `${m.party} should be 0%`);
  });
});

test('Unanswered questions are skipped', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 2, MP: 2, C: 2, L: 2, KD: 2, M: 2, SD: 2 }
  };
  const answers = {}; // No answers
  const matches = calculateMatches([testQuestion], answers);

  // With no answers, all should be 0 (0/0 = 0)
  matches.forEach(m => {
    assertEqual(m.percent, 0, `${m.party} should be 0% with no answers`);
  });
});

test('Important flag doubles the weight', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 1, MP: 0, C: -1, L: -2, KD: 0, M: 1, SD: 2 }
  };

  const answersNormal = { test1: 'agree_strongly' };
  const answersImportant = { test1: 'agree_strongly' };
  const importantFlags = { test1: true };

  const matchesNormal = calculateMatches([testQuestion], answersNormal, {});
  const matchesImportant = calculateMatches([testQuestion], answersImportant, importantFlags);

  // The percentages should be the same (ratio is preserved)
  // But the raw differences should be doubled
  const vNormal = matchesNormal.find(m => m.party === 'V');
  const vImportant = matchesImportant.find(m => m.party === 'V');

  assertEqual(
    vImportant.details.maxPossibleDiff,
    vNormal.details.maxPossibleDiff * 2,
    'Important should double max possible diff'
  );
});

test('Partial agreement gives intermediate score', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 1, MP: 0, C: -1, L: -2, KD: 0, M: 1, SD: 2 }
  };
  const answers = { test1: 'neutral' }; // User is neutral (0)
  const matches = calculateMatches([testQuestion], answers);

  // V and SD: diff = |0 - 2| = 2, match = 1 - 2/4 = 50%
  const v = matches.find(m => m.party === 'V');
  assertEqual(v.percent, 50, 'V should be 50%');

  // MP and KD: diff = |0 - 0| = 0, match = 1 - 0/4 = 100%
  const mp = matches.find(m => m.party === 'MP');
  assertEqual(mp.percent, 100, 'MP should be 100%');

  // L: diff = |0 - (-2)| = 2, match = 1 - 2/4 = 50%
  const l = matches.find(m => m.party === 'L');
  assertEqual(l.percent, 50, 'L should be 50%');
});

test('Results are sorted by match percentage', () => {
  const testQuestion = {
    id: 'test1',
    positions: { V: 2, S: 1, MP: 0, C: -1, L: -2, KD: 0, M: 1, SD: 2 }
  };
  const answers = { test1: 'agree_strongly' }; // User agrees strongly (2)
  const matches = calculateMatches([testQuestion], answers);

  for (let i = 1; i < matches.length; i++) {
    assertTrue(
      matches[i - 1].percent >= matches[i].percent,
      'Results should be sorted descending'
    );
  }

  // V and SD should be first (100%)
  assertTrue(
    matches[0].party === 'V' || matches[0].party === 'SD',
    'V or SD should be first'
  );
});

// Test: Real data scenarios
console.log('\nReal Data Scenarios:');

test('Answering all questions produces valid results', () => {
  const answers = {};
  quizData.questions.forEach(q => {
    answers[q.id] = 'neutral';
  });

  const matches = calculateMatches(quizData.questions, answers);

  assertEqual(matches.length, 8, 'Should have 8 party results');
  matches.forEach(m => {
    assertTrue(m.percent >= 0 && m.percent <= 100, `Invalid percent ${m.percent} for ${m.party}`);
  });
});

test('Different answer patterns produce different results', () => {
  // Test that varying answers produces varied party rankings
  const answers1 = {};
  const answers2 = {};

  quizData.questions.forEach((q, i) => {
    answers1[q.id] = 'agree_strongly';
    answers2[q.id] = 'disagree_strongly';
  });

  const matches1 = calculateMatches(quizData.questions, answers1);
  const matches2 = calculateMatches(quizData.questions, answers2);

  // The top party should be different for opposite answers
  // (at least the percentages should differ significantly)
  const top1 = matches1[0];
  const top2 = matches2[0];

  assertTrue(
    top1.party !== top2.party || Math.abs(top1.percent - top2.percent) > 10,
    'Opposite answers should produce different results'
  );
});

// ==========================================================================
// Summary
// ==========================================================================

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
