/**
 * Valkompass-quiz
 * Interaktiv valkompass med matchningsalgoritm
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const PARTY_COLORS = {
    V: '#AF0000',
    S: '#E8112D',
    MP: '#83CF39',
    C: '#009933',
    L: '#006AB3',
    KD: '#1F3C81',
    M: '#1B49DD',
    SD: '#DDDD00'
  };

  const PARTY_TEXT_COLORS = {
    V: '#ffffff',
    S: '#ffffff',
    MP: '#000000',
    C: '#ffffff',
    L: '#ffffff',
    KD: '#ffffff',
    M: '#ffffff',
    SD: '#000000'
  };

  const ANSWER_VALUES = {
    'agree_strongly': 2,
    'agree': 1,
    'neutral': 0,
    'disagree': -1,
    'disagree_strongly': -2
  };

  const ANSWER_LABELS = {
    'agree_strongly': 'Håller med helt',
    'agree': 'Håller med delvis',
    'neutral': 'Neutral',
    'disagree': 'Tar avstånd delvis',
    'disagree_strongly': 'Tar avstånd helt'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let quizData = null;
  let partiesData = null;
  let compassData = null;
  let currentQuestion = 0;
  let answers = {};
  let importantFlags = {};
  let quizStarted = false;
  let quizCompleted = false;

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  async function loadQuizData() {
    try {
      const [quizResponse, partiesResponse, compassResponse] = await Promise.all([
        fetch('data/quiz-questions.json'),
        fetch('data/parties.json'),
        fetch('data/compass-positions.json')
      ]);

      quizData = await quizResponse.json();
      partiesData = await partiesResponse.json();
      compassData = await compassResponse.json();

      return true;
    } catch (error) {
      console.error('Error loading quiz data:', error);
      return false;
    }
  }

  // ==========================================================================
  // Quiz Rendering
  // ==========================================================================

  function renderQuizStart(container) {
    const totalQuestions = quizData.questions.length;
    const categories = Object.values(quizData.categories);

    container.innerHTML = `
      <div class="quiz-start">
        <div class="quiz-start-icon">📊</div>
        <h3>Hitta ditt parti</h3>
        <p class="quiz-start-description">
          Svara på ${totalQuestions} påståenden och se vilka partier som ligger närmast dina åsikter.
          Resultatet visar också var du hamnar på den politiska kompassen.
        </p>

        <div class="quiz-categories">
          <p class="quiz-categories-label">Frågorna täcker:</p>
          <div class="quiz-categories-grid">
            ${categories.map(cat => `
              <span class="quiz-category-tag">${cat.icon} ${cat.label}</span>
            `).join('')}
          </div>
        </div>

        <div class="quiz-info">
          <div class="quiz-info-item">
            <span class="quiz-info-icon">⏱️</span>
            <span>Ca 5–10 minuter</span>
          </div>
          <div class="quiz-info-item">
            <span class="quiz-info-icon">🔒</span>
            <span>Inga svar sparas</span>
          </div>
        </div>

        <button class="btn btn-primary quiz-start-btn" id="quiz-start-btn">
          Starta valkompassen
        </button>

        <p class="quiz-disclaimer-note">
          Detta är ingen röstningsrekommendation. Resultatet bygger på förenklade data.
        </p>
      </div>
    `;

    document.getElementById('quiz-start-btn').addEventListener('click', () => {
      quizStarted = true;
      renderCurrentQuestion(container);
    });
  }

  function renderCurrentQuestion(container) {
    const question = quizData.questions[currentQuestion];
    const category = quizData.categories[question.category];
    const progress = ((currentQuestion) / quizData.questions.length) * 100;
    const existingAnswer = answers[question.id];
    const isImportant = importantFlags[question.id] || false;

    container.innerHTML = `
      <div class="quiz-question-container">
        <!-- Progress bar -->
        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="quiz-progress-text">
            <span>Fråga ${currentQuestion + 1} av ${quizData.questions.length}</span>
            <span class="quiz-progress-category">${category.icon} ${category.label}</span>
          </div>
        </div>

        <!-- Question -->
        <div class="quiz-question">
          <h3 class="quiz-statement">"${question.statement}"</h3>
        </div>

        <!-- Answer options -->
        <div class="quiz-answers" role="radiogroup" aria-label="Välj ditt svar">
          ${Object.entries(ANSWER_LABELS).map(([key, label]) => `
            <label class="quiz-answer ${existingAnswer === key ? 'is-selected' : ''}">
              <input type="radio" name="answer" value="${key}"
                ${existingAnswer === key ? 'checked' : ''}>
              <span class="quiz-answer-radio"></span>
              <span class="quiz-answer-label">${label}</span>
            </label>
          `).join('')}
        </div>

        <!-- Important toggle -->
        <label class="quiz-important-toggle">
          <input type="checkbox" id="important-toggle" ${isImportant ? 'checked' : ''}>
          <span class="quiz-important-checkbox"></span>
          <span class="quiz-important-label">
            <strong>Viktigt för mig</strong>
            <small>Frågan väger dubbelt i matchningen</small>
          </span>
        </label>

        <!-- Navigation -->
        <div class="quiz-nav">
          <button class="btn btn-secondary quiz-nav-prev"
            ${currentQuestion === 0 ? 'disabled' : ''}>
            ← Föregående
          </button>

          <button class="btn btn-primary quiz-nav-next" id="quiz-next-btn">
            ${currentQuestion === quizData.questions.length - 1 ? 'Visa resultat' : 'Nästa →'}
          </button>
        </div>

        <!-- Skip info -->
        <p class="quiz-skip-info">
          Du kan hoppa över frågor du inte vill svara på
        </p>
      </div>
    `;

    // Event listeners
    const answerInputs = container.querySelectorAll('input[name="answer"]');
    answerInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        answers[question.id] = e.target.value;
        container.querySelectorAll('.quiz-answer').forEach(el => el.classList.remove('is-selected'));
        e.target.closest('.quiz-answer').classList.add('is-selected');
      });
    });

    const importantToggle = document.getElementById('important-toggle');
    importantToggle.addEventListener('change', (e) => {
      importantFlags[question.id] = e.target.checked;
    });

    container.querySelector('.quiz-nav-prev').addEventListener('click', () => {
      if (currentQuestion > 0) {
        currentQuestion--;
        renderCurrentQuestion(container);
      }
    });

    document.getElementById('quiz-next-btn').addEventListener('click', () => {
      if (currentQuestion < quizData.questions.length - 1) {
        currentQuestion++;
        renderCurrentQuestion(container);
      } else {
        quizCompleted = true;
        renderResults(container);
      }
    });
  }

  // ==========================================================================
  // Matching Algorithm
  // ==========================================================================

  function calculateMatches() {
    const parties = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];
    const results = {};

    // Initialize
    parties.forEach(party => {
      results[party] = {
        totalDiff: 0,
        maxPossibleDiff: 0,
        questionMatches: []
      };
    });

    // Calculate differences
    quizData.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === undefined) return; // Skip unanswered

      const userValue = ANSWER_VALUES[userAnswer];
      const weight = importantFlags[question.id] ? 2 : 1;

      parties.forEach(party => {
        const partyPosition = question.positions[party];
        const diff = Math.abs(userValue - partyPosition);
        const maxDiff = 4; // Max possible diff is from -2 to +2 = 4

        results[party].totalDiff += diff * weight;
        results[party].maxPossibleDiff += maxDiff * weight;
        results[party].questionMatches.push({
          questionId: question.id,
          statement: question.statement,
          category: question.category,
          userAnswer: userValue,
          partyPosition: partyPosition,
          match: diff === 0 ? 'perfect' : diff === 1 ? 'close' : diff === 2 ? 'partial' : 'disagree'
        });
      });
    });

    // Calculate percentages
    const partyMatches = parties.map(party => {
      const { totalDiff, maxPossibleDiff, questionMatches } = results[party];
      const matchPercent = maxPossibleDiff > 0
        ? Math.round((1 - totalDiff / maxPossibleDiff) * 100)
        : 0;

      return {
        id: party,
        name: partiesData.find(p => p.id === party)?.namn || party,
        matchPercent,
        questionMatches
      };
    });

    // Sort by match percentage
    partyMatches.sort((a, b) => b.matchPercent - a.matchPercent);

    return partyMatches;
  }

  function calculateUserPosition() {
    let xSum = 0;
    let ySum = 0;
    let weightSum = 0;

    quizData.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === undefined) return;

      const userValue = ANSWER_VALUES[userAnswer];
      const weight = importantFlags[question.id] ? 2 : 1;
      const compass = question.compass || { x: 0, y: 0 };

      // User's position is influenced by their answer and the question's compass weight
      xSum += userValue * compass.x * weight;
      ySum += userValue * compass.y * weight;
      weightSum += weight;
    });

    if (weightSum === 0) return { x: 0, y: 0 };

    // Normalize to -10 to +10 scale
    const scale = 2.5;
    return {
      x: Math.max(-10, Math.min(10, (xSum / weightSum) * scale)),
      y: Math.max(-10, Math.min(10, (ySum / weightSum) * scale))
    };
  }

  // ==========================================================================
  // Results Rendering
  // ==========================================================================

  function renderResults(container) {
    const matches = calculateMatches();
    const userPosition = calculateUserPosition();
    const answeredCount = Object.keys(answers).length;
    const shareUrl = generateShareUrl();

    container.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results-header">
          <h3>Ditt resultat</h3>
          <p class="quiz-results-summary">
            Du svarade på ${answeredCount} av ${quizData.questions.length} frågor
          </p>
        </div>

        <!-- Match bars -->
        <div class="quiz-matches">
          <h4>Partimatchning</h4>
          <div class="quiz-match-list">
            ${matches.map((match, index) => `
              <div class="quiz-match-item ${index === 0 ? 'is-top' : ''}">
                <div class="quiz-match-header">
                  <div class="quiz-match-party">
                    <img src="assets/logos/${match.id}.png" alt="" class="quiz-match-logo">
                    <span class="quiz-match-name">${match.name}</span>
                  </div>
                  <span class="quiz-match-percent">${match.matchPercent}%</span>
                </div>
                <div class="quiz-match-bar">
                  <div class="quiz-match-fill" style="width: ${match.matchPercent}%; background: ${PARTY_COLORS[match.id]}"></div>
                </div>
                <button class="quiz-match-details-btn" data-party="${match.id}">
                  Visa jämförelse ↓
                </button>
                <div class="quiz-match-details" id="details-${match.id}">
                  ${renderQuestionComparison(match)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- User position on compass -->
        <div class="quiz-compass-result">
          <h4>Din position på kompassen</h4>
          <div class="quiz-compass-container" id="quiz-compass-svg">
            <!-- SVG rendered below -->
          </div>
          <div class="quiz-compass-legend">
            <span class="quiz-compass-you">● Du</span>
            <span class="quiz-compass-parties">○ Partierna</span>
          </div>
        </div>

        <!-- Share -->
        <div class="quiz-share">
          <h4>Dela ditt resultat</h4>
          <div class="quiz-share-url">
            <input type="text" value="${shareUrl}" readonly id="share-url-input">
            <button class="btn btn-secondary" id="copy-url-btn">Kopiera</button>
          </div>
          <p class="quiz-share-note">Länken innehåller dina svar (inga personuppgifter)</p>
        </div>

        <!-- Actions -->
        <div class="quiz-actions">
          <button class="btn btn-secondary" id="quiz-restart-btn">Gör om quizet</button>
          <a href="#partier" class="btn btn-primary">Läs om partierna</a>
        </div>

        <!-- Disclaimer -->
        <div class="quiz-results-disclaimer">
          <p>${quizData.meta.disclaimer}</p>
        </div>
      </div>
    `;

    // Render compass SVG
    renderResultCompass(document.getElementById('quiz-compass-svg'), userPosition);

    // Event listeners
    container.querySelectorAll('.quiz-match-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const partyId = btn.dataset.party;
        const details = document.getElementById(`details-${partyId}`);
        const isOpen = details.classList.toggle('is-open');
        btn.textContent = isOpen ? 'Dölj jämförelse ↑' : 'Visa jämförelse ↓';
      });
    });

    document.getElementById('copy-url-btn').addEventListener('click', () => {
      const input = document.getElementById('share-url-input');
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('copy-url-btn');
        btn.textContent = 'Kopierad!';
        setTimeout(() => { btn.textContent = 'Kopiera'; }, 2000);
      });
    });

    document.getElementById('quiz-restart-btn').addEventListener('click', () => {
      resetQuiz();
      renderQuizStart(container);
    });
  }

  function renderQuestionComparison(match) {
    const categories = quizData.categories;

    // Group by category
    const byCategory = {};
    match.questionMatches.forEach(qm => {
      if (!byCategory[qm.category]) byCategory[qm.category] = [];
      byCategory[qm.category].push(qm);
    });

    return `
      <div class="quiz-comparison">
        ${Object.entries(byCategory).map(([catId, questions]) => `
          <div class="quiz-comparison-category">
            <h5>${categories[catId]?.icon || ''} ${categories[catId]?.label || catId}</h5>
            ${questions.map(q => `
              <div class="quiz-comparison-item ${q.match}">
                <span class="quiz-comparison-statement">${q.statement}</span>
                <div class="quiz-comparison-values">
                  <span class="quiz-comparison-user" title="Ditt svar">Du: ${formatPosition(q.userAnswer)}</span>
                  <span class="quiz-comparison-party" title="Partiets position">${match.id}: ${formatPosition(q.partyPosition)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }

  function formatPosition(value) {
    const labels = { '-2': '−−', '-1': '−', '0': '○', '1': '+', '2': '++' };
    return labels[value.toString()] || value;
  }

  function renderResultCompass(container, userPosition) {
    const GRID_SIZE = 10;
    const SVG_PADDING = 1.5;
    const viewBoxSize = (GRID_SIZE + SVG_PADDING) * 2;
    const viewBoxStart = -(GRID_SIZE + SVG_PADDING);

    const partiesPositions = compassData.positions;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `${viewBoxStart} ${viewBoxStart} ${viewBoxSize} ${viewBoxSize}`);
    svg.setAttribute('class', 'quiz-compass-svg');

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', viewBoxStart);
    bg.setAttribute('y', viewBoxStart);
    bg.setAttribute('width', viewBoxSize);
    bg.setAttribute('height', viewBoxSize);
    bg.setAttribute('fill', 'var(--color-bg-card)');
    svg.appendChild(bg);

    // Grid lines
    for (let i = -GRID_SIZE; i <= GRID_SIZE; i += 2) {
      // Vertical
      const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vLine.setAttribute('x1', i);
      vLine.setAttribute('y1', -GRID_SIZE);
      vLine.setAttribute('x2', i);
      vLine.setAttribute('y2', GRID_SIZE);
      vLine.setAttribute('stroke', 'var(--color-border-subtle)');
      vLine.setAttribute('stroke-width', '0.05');
      svg.appendChild(vLine);

      // Horizontal
      const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hLine.setAttribute('x1', -GRID_SIZE);
      hLine.setAttribute('y1', i);
      hLine.setAttribute('x2', GRID_SIZE);
      hLine.setAttribute('y2', i);
      hLine.setAttribute('stroke', 'var(--color-border-subtle)');
      hLine.setAttribute('stroke-width', '0.05');
      svg.appendChild(hLine);
    }

    // Axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', -GRID_SIZE);
    xAxis.setAttribute('y1', '0');
    xAxis.setAttribute('x2', GRID_SIZE);
    xAxis.setAttribute('y2', '0');
    xAxis.setAttribute('stroke', 'var(--color-text-muted)');
    xAxis.setAttribute('stroke-width', '0.08');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', -GRID_SIZE);
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', GRID_SIZE);
    yAxis.setAttribute('stroke', 'var(--color-text-muted)');
    yAxis.setAttribute('stroke-width', '0.08');
    svg.appendChild(yAxis);

    // Axis labels
    const labels = [
      { text: 'VÄNSTER', x: -GRID_SIZE + 1, y: 0.6 },
      { text: 'HÖGER', x: GRID_SIZE - 1, y: 0.6 },
      { text: 'LIBERAL', x: 0.3, y: -GRID_SIZE + 0.8 },
      { text: 'AUKTORITÄR', x: 0.3, y: GRID_SIZE - 0.4 }
    ];

    labels.forEach(label => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', label.x);
      text.setAttribute('y', label.y);
      text.setAttribute('font-size', '0.5');
      text.setAttribute('fill', 'var(--color-text-subtle)');
      text.textContent = label.text;
      svg.appendChild(text);
    });

    // Party markers (smaller, muted)
    partiesPositions.forEach(pos => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', '0.5');
      circle.setAttribute('fill', PARTY_COLORS[pos.id]);
      circle.setAttribute('opacity', '0.6');
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y + 0.18);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '0.4');
      text.setAttribute('font-weight', '700');
      text.setAttribute('fill', PARTY_TEXT_COLORS[pos.id]);
      text.textContent = pos.id;
      svg.appendChild(text);
    });

    // User marker (larger, prominent)
    const userGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Pulse animation circle
    const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseCircle.setAttribute('cx', userPosition.x);
    pulseCircle.setAttribute('cy', userPosition.y);
    pulseCircle.setAttribute('r', '1.2');
    pulseCircle.setAttribute('fill', 'var(--color-accent)');
    pulseCircle.setAttribute('opacity', '0.3');
    pulseCircle.setAttribute('class', 'pulse-ring');
    userGroup.appendChild(pulseCircle);

    const userCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    userCircle.setAttribute('cx', userPosition.x);
    userCircle.setAttribute('cy', userPosition.y);
    userCircle.setAttribute('r', '0.8');
    userCircle.setAttribute('fill', 'var(--color-accent)');
    userCircle.setAttribute('stroke', 'var(--color-bg)');
    userCircle.setAttribute('stroke-width', '0.15');
    userGroup.appendChild(userCircle);

    const userText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    userText.setAttribute('x', userPosition.x);
    userText.setAttribute('y', userPosition.y + 0.25);
    userText.setAttribute('text-anchor', 'middle');
    userText.setAttribute('font-size', '0.55');
    userText.setAttribute('font-weight', '700');
    userText.setAttribute('fill', '#000');
    userText.textContent = 'DU';
    userGroup.appendChild(userText);

    svg.appendChild(userGroup);

    container.appendChild(svg);
  }

  // ==========================================================================
  // Share URL
  // ==========================================================================

  function generateShareUrl() {
    const data = {
      a: answers,
      i: importantFlags
    };
    const encoded = btoa(JSON.stringify(data));
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    return `${baseUrl}?quiz=${encoded}#quiz`;
  }

  function loadFromShareUrl() {
    const params = new URLSearchParams(window.location.search);
    const quizParam = params.get('quiz');

    if (quizParam) {
      try {
        const data = JSON.parse(atob(quizParam));
        answers = data.a || {};
        importantFlags = data.i || {};
        quizStarted = true;
        quizCompleted = Object.keys(answers).length > 0;
        return true;
      } catch (e) {
        console.error('Error loading quiz from URL:', e);
      }
    }
    return false;
  }

  // ==========================================================================
  // Reset
  // ==========================================================================

  function resetQuiz() {
    currentQuestion = 0;
    answers = {};
    importantFlags = {};
    quizStarted = false;
    quizCompleted = false;

    // Clear URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('quiz');
    window.history.replaceState({}, '', url.pathname + url.hash);
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const loaded = await loadQuizData();
    if (!loaded) {
      container.innerHTML = '<p class="text-center text-muted">Kunde inte ladda quiz-data.</p>';
      return;
    }

    // Check for shared results
    const hasSharedData = loadFromShareUrl();

    if (hasSharedData && quizCompleted) {
      renderResults(container);
    } else {
      renderQuizStart(container);
    }

    console.log('Quiz initialized');
  }

  // Export for global access
  window.initQuiz = initQuiz;

})();
