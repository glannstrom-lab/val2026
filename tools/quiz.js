/**
 * Valkompass-quiz
 * Interaktiv valkompass med matchningsalgoritm
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_TEXT_COLORS = window.PARTY_TEXT_COLORS;

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

  // Swipe configuration
  const SWIPE_THRESHOLD = 80; // Minimum distance in pixels to trigger swipe
  const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity to trigger quick swipe
  const SWIPE_MAX_ROTATION = 15; // Max rotation in degrees during swipe

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

  // Swipe state
  let swipeState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    isSwiping: false
  };

  // Check if device supports touch
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // ==========================================================================
  // LocalStorage Progress Saving
  // ==========================================================================

  const STORAGE_KEY = 'val2026_quiz_progress';

  function saveProgress() {
    const progress = {
      currentQuestion,
      answers,
      importantFlags,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not save quiz progress:', e);
    }
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const progress = JSON.parse(saved);
      // Only restore if less than 24 hours old
      const hoursSince = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        clearProgress();
        return null;
      }

      return progress;
    } catch (e) {
      console.warn('Could not load quiz progress:', e);
      return null;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  function hasProgress() {
    const progress = loadProgress();
    return progress && (Object.keys(progress.answers).length > 0 || progress.currentQuestion > 0);
  }

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
    const savedProgress = loadProgress();
    const hasSaved = savedProgress && (Object.keys(savedProgress.answers).length > 0 || savedProgress.currentQuestion > 0);
    const answeredCount = hasSaved ? Object.keys(savedProgress.answers).length : 0;

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
            <span class="quiz-info-icon">💾</span>
            <span>Progress sparas automatiskt</span>
          </div>
        </div>

        ${hasSaved ? `
          <div class="quiz-resume-prompt">
            <p class="quiz-resume-text">
              <strong>Fortsätt där du slutade?</strong><br>
              Du har svarat på ${answeredCount} av ${totalQuestions} frågor.
            </p>
            <div class="quiz-resume-buttons">
              <button class="btn btn-primary" id="quiz-resume-btn">
                Fortsätt
              </button>
              <button class="btn btn-secondary" id="quiz-restart-btn">
                Börja om
              </button>
            </div>
          </div>
        ` : `
          <button class="btn btn-primary quiz-start-btn" id="quiz-start-btn">
            Starta valkompassen
          </button>
        `}

        <p class="quiz-disclaimer-note">
          Detta är ingen röstningsrekommendation. Resultatet bygger på förenklade data.
        </p>
      </div>
    `;

    if (hasSaved) {
      document.getElementById('quiz-resume-btn').addEventListener('click', () => {
        // Restore saved progress
        currentQuestion = savedProgress.currentQuestion;
        Object.assign(answers, savedProgress.answers);
        Object.assign(importantFlags, savedProgress.importantFlags || {});
        quizStarted = true;
        renderCurrentQuestion(container);
      });

      document.getElementById('quiz-restart-btn').addEventListener('click', () => {
        // Clear saved progress and start fresh
        clearProgress();
        currentQuestion = 0;
        answers = {};
        importantFlags = {};
        quizStarted = true;
        renderCurrentQuestion(container);
      });
    } else {
      document.getElementById('quiz-start-btn').addEventListener('click', () => {
        quizStarted = true;
        renderCurrentQuestion(container);
      });
    }
  }

  function renderCurrentQuestion(container) {
    const question = quizData.questions[currentQuestion];
    const category = quizData.categories[question.category];
    const progress = ((currentQuestion) / quizData.questions.length) * 100;
    const existingAnswer = answers[question.id];
    const isImportant = importantFlags[question.id] || false;

    const showSwipeHint = isTouchDevice();

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

        <!-- Swipe hint for mobile -->
        ${showSwipeHint ? `
          <div class="quiz-swipe-hint" id="quiz-swipe-hint">
            <span class="quiz-swipe-hint-left">← Tar avstånd</span>
            <span class="quiz-swipe-hint-text">Svep för att svara</span>
            <span class="quiz-swipe-hint-right">Håller med →</span>
          </div>
        ` : ''}

        <!-- Swipeable question card -->
        <div class="quiz-swipe-wrapper">
          <!-- Swipe indicators (shown during swipe) -->
          <div class="quiz-swipe-indicator quiz-swipe-indicator--left" id="swipe-indicator-left">
            <span>✗</span>
            <span>Tar avstånd</span>
          </div>
          <div class="quiz-swipe-indicator quiz-swipe-indicator--right" id="swipe-indicator-right">
            <span>✓</span>
            <span>Håller med</span>
          </div>

          <!-- Question card -->
          <div class="quiz-question quiz-swipe-card" id="quiz-swipe-card">
            <h3 class="quiz-statement">"${question.statement}"</h3>
          </div>
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
        saveProgress();
      });
    });

    const importantToggle = document.getElementById('important-toggle');
    importantToggle.addEventListener('change', (e) => {
      importantFlags[question.id] = e.target.checked;
      saveProgress();
    });

    container.querySelector('.quiz-nav-prev').addEventListener('click', () => {
      if (currentQuestion > 0) {
        currentQuestion--;
        saveProgress();
        renderCurrentQuestion(container);
      }
    });

    document.getElementById('quiz-next-btn').addEventListener('click', () => {
      if (currentQuestion < quizData.questions.length - 1) {
        currentQuestion++;
        saveProgress();
        renderCurrentQuestion(container);
      } else {
        quizCompleted = true;
        clearProgress(); // Clear saved progress when completed
        renderResults(container);
      }
    });

    // Swipe functionality for touch devices
    if (isTouchDevice()) {
      setupSwipeHandlers(container, question);
    }
  }

  // ==========================================================================
  // Swipe Handlers
  // ==========================================================================

  function setupSwipeHandlers(container, question) {
    const card = document.getElementById('quiz-swipe-card');
    const indicatorLeft = document.getElementById('swipe-indicator-left');
    const indicatorRight = document.getElementById('swipe-indicator-right');
    const swipeHint = document.getElementById('quiz-swipe-hint');

    if (!card) return;

    function handleTouchStart(e) {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      swipeState.startX = touch.clientX;
      swipeState.startY = touch.clientY;
      swipeState.startTime = Date.now();
      swipeState.currentX = 0;
      swipeState.isSwiping = true;

      card.style.transition = 'none';
    }

    function handleTouchMove(e) {
      if (!swipeState.isSwiping || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeState.startX;
      const deltaY = touch.clientY - swipeState.startY;

      // If vertical scroll is more significant, don't interfere
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 30) {
        return;
      }

      // Prevent page scroll when swiping horizontally
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
      }

      swipeState.currentX = deltaX;

      // Calculate rotation based on swipe distance
      const rotation = (deltaX / window.innerWidth) * SWIPE_MAX_ROTATION;
      const opacity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);

      // Apply transform to card
      card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

      // Show appropriate indicator
      if (deltaX > 30) {
        indicatorRight.style.opacity = opacity;
        indicatorLeft.style.opacity = 0;
        card.classList.add('swiping-right');
        card.classList.remove('swiping-left');
      } else if (deltaX < -30) {
        indicatorLeft.style.opacity = opacity;
        indicatorRight.style.opacity = 0;
        card.classList.add('swiping-left');
        card.classList.remove('swiping-right');
      } else {
        indicatorLeft.style.opacity = 0;
        indicatorRight.style.opacity = 0;
        card.classList.remove('swiping-left', 'swiping-right');
      }

      // Hide hint during swipe
      if (swipeHint && Math.abs(deltaX) > 20) {
        swipeHint.style.opacity = 0;
      }
    }

    function handleTouchEnd(e) {
      if (!swipeState.isSwiping) return;

      const deltaX = swipeState.currentX;
      const deltaTime = Date.now() - swipeState.startTime;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Determine if swipe was significant enough
      const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

      if (isSwipe && Math.abs(deltaX) > 50) {
        // Animate card off screen
        const direction = deltaX > 0 ? 1 : -1;
        card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        card.style.transform = `translateX(${direction * window.innerWidth}px) rotate(${direction * 30}deg)`;
        card.style.opacity = '0';

        // Set answer based on swipe direction
        const answerKey = deltaX > 0 ? 'agree' : 'disagree';
        answers[question.id] = answerKey;
        saveProgress();

        // Highlight the selected answer
        container.querySelectorAll('.quiz-answer').forEach(el => el.classList.remove('is-selected'));
        const selectedAnswer = container.querySelector(`input[value="${answerKey}"]`);
        if (selectedAnswer) {
          selectedAnswer.checked = true;
          selectedAnswer.closest('.quiz-answer').classList.add('is-selected');
        }

        // Move to next question after animation
        setTimeout(() => {
          if (currentQuestion < quizData.questions.length - 1) {
            currentQuestion++;
            saveProgress();
            renderCurrentQuestion(container);
          } else {
            quizCompleted = true;
            clearProgress();
            renderResults(container);
          }
        }, 300);
      } else {
        // Snap back to center
        card.style.transition = 'transform 0.3s ease-out';
        card.style.transform = 'translateX(0) rotate(0deg)';
        indicatorLeft.style.opacity = 0;
        indicatorRight.style.opacity = 0;
        card.classList.remove('swiping-left', 'swiping-right');

        if (swipeHint) {
          swipeHint.style.opacity = 1;
        }
      }

      swipeState.isSwiping = false;
    }

    // Add touch event listeners
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: true });
    card.addEventListener('touchcancel', handleTouchEnd, { passive: true });
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
                    <img src="assets/logos/${match.id}.png" alt="${match.id}" class="quiz-match-logo" loading="lazy" decoding="async">
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

        <!-- Metodik -->
        <details class="quiz-method">
          <summary>Hur räknas matchningen?</summary>
          <div class="quiz-method-content">
            <ol>
              <li>För varje fråga jämförs ditt svar med partiets position på skalan −2 till +2.</li>
              <li>Mindre avstånd = högre poäng (max 4 poäng per fråga).</li>
              <li>Frågor du markerat som <em>viktiga</em> väger dubbelt.</li>
              <li>Resultatet normaliseras till procent (0–100 %).</li>
            </ol>
            <p>
              Partipositionerna baseras på partiernas officiella program, riksdagsmotioner
              och <a href="https://www.chesdata.eu/" target="_blank" rel="noopener">Chapel Hill Expert Survey</a> 2024.
              Fullständig källista i <a href="om.html">Om sidan</a>.
            </p>
          </div>
        </details>

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
      container.innerHTML = '<div class="error">Kunde inte ladda quiz-data. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
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
