/**
 * Gissa Partiet
 * Blind quiz där användaren gissar parti från citat
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;
  const PARTY_TEXT_COLORS = window.PARTY_TEXT_COLORS;

  const QUESTIONS_PER_GAME = 10;

  // ==========================================================================
  // State
  // ==========================================================================

  let quotesData = null;
  let currentQuotes = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let gameStarted = false;

  // ==========================================================================
  // Game Logic
  // ==========================================================================

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function startGame() {
    currentQuotes = shuffleArray(quotesData.quotes).slice(0, QUESTIONS_PER_GAME);
    currentIndex = 0;
    score = 0;
    answered = false;
    gameStarted = true;
    renderGame();
  }

  function selectAnswer(selectedParty) {
    if (answered) return;

    answered = true;
    const correctParty = currentQuotes[currentIndex].party;
    const isCorrect = selectedParty === correctParty;

    if (isCorrect) {
      score++;
    }

    renderFeedback(selectedParty, correctParty, isCorrect);
  }

  function nextQuestion() {
    currentIndex++;
    answered = false;

    if (currentIndex >= currentQuotes.length) {
      renderResults();
    } else {
      renderGame();
    }
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    if (!gameStarted) {
      renderIntro(container);
    } else {
      renderGame();
    }
  }

  function renderIntro(container) {
    container.innerHTML = `
      <div class="guess-intro">
        <div class="guess-intro-icon">🎯</div>
        <h3>Testa dina kunskaper!</h3>
        <p>
          Du får se ${QUESTIONS_PER_GAME} citat från partiernas program och utspel.
          Kan du gissa rätt parti utan att se namnet?
        </p>
        <button class="btn btn-primary guess-start-btn">Starta quizet</button>
      </div>
    `;

    container.querySelector('.guess-start-btn').addEventListener('click', startGame);
  }

  function renderGame() {
    const container = document.getElementById('guess-container');
    const quote = currentQuotes[currentIndex];
    const progress = ((currentIndex) / currentQuotes.length) * 100;

    container.innerHTML = `
      <div class="guess-game">
        <!-- Progress -->
        <div class="guess-progress">
          <div class="guess-progress-bar">
            <div class="guess-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="guess-progress-text">
            Fråga ${currentIndex + 1} av ${currentQuotes.length} • Poäng: ${score}
          </div>
        </div>

        <!-- Quote -->
        <div class="guess-quote">
          <div class="guess-quote-mark">"</div>
          <p class="guess-quote-text">${quote.text}</p>
        </div>

        <!-- Options -->
        <div class="guess-options">
          ${Object.keys(PARTY_NAMES).map(partyId => `
            <button class="guess-option" data-party="${partyId}"
              style="--party-color: ${PARTY_COLORS[partyId]}; --party-text: ${PARTY_TEXT_COLORS[partyId]}">
              <img src="assets/logos/${partyId}.png" alt="${partyId}" class="guess-option-logo" loading="lazy" decoding="async">
              <span class="guess-option-name">${PARTY_NAMES[partyId]}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback placeholder -->
        <div class="guess-feedback" id="guess-feedback"></div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.guess-option').forEach(btn => {
      btn.addEventListener('click', () => selectAnswer(btn.dataset.party));
    });
  }

  function renderFeedback(selectedParty, correctParty, isCorrect) {
    const quote = currentQuotes[currentIndex];
    const feedbackEl = document.getElementById('guess-feedback');
    const options = document.querySelectorAll('.guess-option');

    // Disable all options and show correct/wrong
    options.forEach(opt => {
      opt.disabled = true;
      const party = opt.dataset.party;
      if (party === correctParty) {
        opt.classList.add('is-correct');
      } else if (party === selectedParty && !isCorrect) {
        opt.classList.add('is-wrong');
      }
    });

    feedbackEl.innerHTML = `
      <div class="guess-feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}">
        <div class="guess-feedback-icon">${isCorrect ? '✓' : '✗'}</div>
        <div class="guess-feedback-text">
          ${isCorrect
            ? '<strong>Rätt!</strong>'
            : `<strong>Fel!</strong> Det var ${PARTY_NAMES[correctParty]}.`
          }
        </div>
        <div class="guess-feedback-source">
          Källa: ${quote.source}
        </div>
        <button class="btn btn-primary guess-next-btn">
          ${currentIndex + 1 >= currentQuotes.length ? 'Se resultat' : 'Nästa fråga'}
        </button>
      </div>
    `;

    feedbackEl.querySelector('.guess-next-btn').addEventListener('click', nextQuestion);
  }

  function renderResults() {
    const container = document.getElementById('guess-container');
    const percentage = Math.round((score / QUESTIONS_PER_GAME) * 100);

    let message, emoji;
    if (percentage >= 90) {
      message = 'Fantastiskt! Du är en riktig politisk expert!';
      emoji = '🏆';
    } else if (percentage >= 70) {
      message = 'Bra jobbat! Du har koll på partierna.';
      emoji = '🎉';
    } else if (percentage >= 50) {
      message = 'Helt okej! Det finns mer att lära.';
      emoji = '👍';
    } else {
      message = 'Övning ger färdighet! Prova igen.';
      emoji = '📚';
    }

    container.innerHTML = `
      <div class="guess-results">
        <div class="guess-results-emoji">${emoji}</div>
        <h3>Ditt resultat</h3>
        <div class="guess-results-score">
          <span class="guess-results-number">${score}</span>
          <span class="guess-results-total">av ${QUESTIONS_PER_GAME}</span>
        </div>
        <div class="guess-results-percent">${percentage}% rätt</div>
        <p class="guess-results-message">${message}</p>
        <div class="guess-results-actions">
          <button class="btn btn-primary guess-restart-btn">Spela igen</button>
        </div>
      </div>
    `;

    container.querySelector('.guess-restart-btn').addEventListener('click', startGame);
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initGuess() {
    const container = document.getElementById('guess-container');
    if (!container) return;

    try {
      const response = await fetch('data/quotes.json');
      quotesData = await response.json();
    } catch (error) {
      console.error('Error loading quotes data:', error);
      container.innerHTML = '<p class="text-center text-muted">Kunde inte ladda quizdata.</p>';
      return;
    }

    render(container);
    console.log('Guess the party quiz initialized');
  }

  // Export for global access
  window.initGuess = initGuess;

})();
