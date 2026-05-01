/**
 * Mandatkalkylator
 * Simulera valresultat och beräkna mandatfördelning
 * Använder modifierad Sainte-Laguë-metoden (svenska valsystemet)
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;
  const PARTY_IDS = window.PARTY_IDS;
  const RIKSDAG_TOTAL_SEATS = window.RIKSDAG_TOTAL_SEATS || 349;
  const RIKSDAG_MAJORITY = window.RIKSDAG_MAJORITY || 175;
  const RIKSDAG_THRESHOLD = window.RIKSDAG_THRESHOLD || 4;

  // Sainte-Laguë divisors (modified: first divisor is 1.2)
  const FIRST_DIVISOR = 1.2;

  // Block definitions
  const BLOCKS = {
    left: {
      name: 'Vänsterblocket',
      parties: ['V', 'S', 'MP'],
      color: '#e8112d'
    },
    right: {
      name: 'Högerblocket',
      parties: ['M', 'KD', 'L', 'SD'],
      color: '#1b49dd'
    },
    center: {
      name: 'Mittenpartierna',
      parties: ['C', 'L', 'MP'],
      color: '#009933'
    }
  };

  // Presets
  const PRESETS = {
    val2022: {
      name: 'Val 2022',
      values: { V: 6.7, S: 30.3, MP: 5.1, C: 6.7, L: 4.6, KD: 5.3, M: 19.1, SD: 20.5 }
    },
    opinion2026: {
      name: 'Opinion april 2026',
      values: { V: 8, S: 33, MP: 6, C: 6, L: 2, KD: 5, M: 18, SD: 20 }
    },
    equal: {
      name: 'Alla lika',
      values: { V: 12.5, S: 12.5, MP: 12.5, C: 12.5, L: 12.5, KD: 12.5, M: 12.5, SD: 12.5 }
    }
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let currentVotes = { ...PRESETS.opinion2026.values };
  let partiesData = null;

  // ==========================================================================
  // Sainte-Laguë Calculation
  // ==========================================================================

  /**
   * Calculate seat distribution using modified Sainte-Laguë method
   * @param {Object} votes - Object with party IDs as keys and vote percentages as values
   * @param {number} totalSeats - Total seats to distribute
   * @returns {Object} - Object with party IDs as keys and seat counts as values
   */
  function calculateSeats(votes, totalSeats = RIKSDAG_TOTAL_SEATS) {
    const seats = {};
    const quotients = {};

    // Initialize
    PARTY_IDS.forEach(id => {
      seats[id] = 0;
      // Apply 4% threshold - parties under threshold get 0
      if (votes[id] >= RIKSDAG_THRESHOLD) {
        quotients[id] = votes[id] / FIRST_DIVISOR;
      } else {
        quotients[id] = 0;
      }
    });

    // Distribute seats one by one
    for (let i = 0; i < totalSeats; i++) {
      // Find party with highest quotient
      let maxQuotient = 0;
      let winningParty = null;

      PARTY_IDS.forEach(id => {
        if (quotients[id] > maxQuotient) {
          maxQuotient = quotients[id];
          winningParty = id;
        }
      });

      if (winningParty) {
        seats[winningParty]++;
        // Update quotient: votes / (2 * seats + 1)
        // Standard Sainte-Laguë divisors: 1, 3, 5, 7, 9, ...
        // Modified: 1.2, 3, 5, 7, 9, ...
        const divisor = seats[winningParty] === 1 ? 3 : (2 * seats[winningParty] + 1);
        quotients[winningParty] = votes[winningParty] / divisor;
      }
    }

    return seats;
  }

  /**
   * Calculate total votes percentage
   */
  function getTotalVotes(votes) {
    return Object.values(votes).reduce((sum, v) => sum + v, 0);
  }

  /**
   * Normalize votes to 100%
   */
  function normalizeVotes(votes) {
    const total = getTotalVotes(votes);
    if (total === 0) return votes;

    const normalized = {};
    PARTY_IDS.forEach(id => {
      normalized[id] = (votes[id] / total) * 100;
    });
    return normalized;
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    const seats = calculateSeats(currentVotes);
    const totalVotes = getTotalVotes(currentVotes);
    const isNormalized = Math.abs(totalVotes - 100) < 0.1;

    // Calculate block totals
    const leftSeats = BLOCKS.left.parties.reduce((sum, id) => sum + seats[id], 0);
    const rightSeats = BLOCKS.right.parties.reduce((sum, id) => sum + seats[id], 0);

    // Parties that pass threshold
    const partiesInRiksdag = PARTY_IDS.filter(id => currentVotes[id] >= RIKSDAG_THRESHOLD);
    const partiesOutside = PARTY_IDS.filter(id => currentVotes[id] < RIKSDAG_THRESHOLD && currentVotes[id] > 0);

    container.innerHTML = `
      <div class="seatcalc-layout">
        <!-- Input Panel -->
        <div class="seatcalc-input-panel">
          <div class="seatcalc-presets">
            <span class="seatcalc-presets-label">Förinställningar:</span>
            <div class="seatcalc-preset-buttons">
              ${Object.entries(PRESETS).map(([key, preset]) => `
                <button class="seatcalc-preset-btn" data-preset="${key}">${preset.name}</button>
              `).join('')}
            </div>
          </div>

          <div class="seatcalc-sliders">
            ${PARTY_IDS.map(id => `
              <div class="seatcalc-slider-row" style="--party-color: ${PARTY_COLORS[id]}">
                <div class="seatcalc-slider-header">
                  <img src="assets/logos/${id}.png" alt="${id}" class="seatcalc-party-logo" loading="lazy" decoding="async" width="48" height="48">
                  <span class="seatcalc-party-name">${PARTY_NAMES[id]}</span>
                  <span class="seatcalc-party-value">${currentVotes[id].toFixed(1)}%</span>
                </div>
                <div class="seatcalc-slider-wrapper">
                  <input type="range"
                    class="seatcalc-slider"
                    data-party="${id}"
                    min="0"
                    max="50"
                    step="0.1"
                    value="${currentVotes[id]}"
                    aria-label="${PARTY_NAMES[id]} röstandel">
                  <div class="seatcalc-slider-fill" style="width: ${(currentVotes[id] / 50) * 100}%"></div>
                </div>
                ${currentVotes[id] < RIKSDAG_THRESHOLD && currentVotes[id] > 0 ?
                  `<span class="seatcalc-threshold-warning">Under 4%-spärren</span>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="seatcalc-total ${!isNormalized ? 'seatcalc-total--warning' : ''}">
            <span>Totalt: ${totalVotes.toFixed(1)}%</span>
            ${!isNormalized ? `
              <button class="seatcalc-normalize-btn">Normalisera till 100%</button>
            ` : ''}
          </div>
        </div>

        <!-- Results Panel -->
        <div class="seatcalc-results-panel">
          <!-- Hemicycle Visualization -->
          <div class="seatcalc-hemicycle-container">
            <svg class="seatcalc-hemicycle" viewBox="0 0 400 220" aria-label="Riksdagens mandatfördelning">
              ${renderHemicycle(seats)}
            </svg>
            <div class="seatcalc-hemicycle-center">
              <span class="seatcalc-majority-number">${RIKSDAG_MAJORITY}</span>
              <span class="seatcalc-majority-label">för majoritet</span>
            </div>
          </div>

          <!-- Block Summary -->
          <div class="seatcalc-blocks">
            <div class="seatcalc-block seatcalc-block--left ${leftSeats >= RIKSDAG_MAJORITY ? 'seatcalc-block--majority' : ''}">
              <span class="seatcalc-block-name">${BLOCKS.left.name}</span>
              <span class="seatcalc-block-parties">${BLOCKS.left.parties.join(' + ')}</span>
              <span class="seatcalc-block-seats">${leftSeats} mandat</span>
              ${leftSeats >= RIKSDAG_MAJORITY ? '<span class="seatcalc-block-badge">Majoritet</span>' : ''}
            </div>
            <div class="seatcalc-block seatcalc-block--right ${rightSeats >= RIKSDAG_MAJORITY ? 'seatcalc-block--majority' : ''}">
              <span class="seatcalc-block-name">${BLOCKS.right.name}</span>
              <span class="seatcalc-block-parties">${BLOCKS.right.parties.join(' + ')}</span>
              <span class="seatcalc-block-seats">${rightSeats} mandat</span>
              ${rightSeats >= RIKSDAG_MAJORITY ? '<span class="seatcalc-block-badge">Majoritet</span>' : ''}
            </div>
          </div>

          <!-- Seat Breakdown -->
          <div class="seatcalc-breakdown">
            <h3 class="seatcalc-breakdown-title">Mandatfördelning</h3>
            <div class="seatcalc-bar-container">
              ${PARTY_IDS.filter(id => seats[id] > 0).sort((a, b) => seats[b] - seats[a]).map(id => `
                <div class="seatcalc-bar-row">
                  <div class="seatcalc-bar-label">
                    <img src="assets/logos/${id}.png" alt="${id}" loading="lazy" decoding="async" width="48" height="48">
                    <span>${id}</span>
                  </div>
                  <div class="seatcalc-bar-track">
                    <div class="seatcalc-bar-fill"
                      style="width: ${(seats[id] / RIKSDAG_TOTAL_SEATS) * 100}%; background: ${PARTY_COLORS[id]}">
                    </div>
                  </div>
                  <div class="seatcalc-bar-value">${seats[id]}</div>
                </div>
              `).join('')}
            </div>
          </div>

          ${partiesOutside.length > 0 ? `
            <div class="seatcalc-outside">
              <span class="seatcalc-outside-label">Utanför riksdagen:</span>
              ${partiesOutside.map(id => `
                <span class="seatcalc-outside-party" style="--party-color: ${PARTY_COLORS[id]}">
                  ${id} (${currentVotes[id].toFixed(1)}%)
                </span>
              `).join('')}
            </div>
          ` : ''}

          <!-- Info Box -->
          <div class="seatcalc-info">
            <h4>Om beräkningen</h4>
            <p>Mandaten fördelas enligt den <strong>modifierade Sainte-Laguë-metoden</strong> som används i svenska riksdagsval. Partier som får under 4% av rösterna får inga mandat.</p>
            <p>Riksdagen har <strong>349 mandat</strong>. Det krävs <strong>175 mandat</strong> för egen majoritet.</p>
            <p class="seatcalc-source">
              Regelverket beskrivs i <a href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/vallag-2005837_sfs-2005-837/" target="_blank" rel="noopener">vallagen (2005:837)</a>, kap. 14. Ytterligare information från
              <a href="https://www.val.se" target="_blank" rel="noopener">val.se</a> (Valmyndigheten).
            </p>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    attachEventListeners(container);
  }

  /**
   * Render hemicycle SVG paths
   */
  function renderHemicycle(seats) {
    const totalSeats = RIKSDAG_TOTAL_SEATS;
    const rows = 8;
    const centerX = 200;
    const centerY = 200;
    const minRadius = 60;
    const maxRadius = 180;

    // Calculate seats per row (more seats in outer rows)
    const seatsPerRow = [];
    let totalCalculated = 0;
    for (let i = 0; i < rows; i++) {
      const rowSeats = Math.round(30 + (i * 6)); // 30, 36, 42, 48, 54, 60, 66, 72 ≈ 408
      seatsPerRow.push(rowSeats);
      totalCalculated += rowSeats;
    }

    // Scale to actual total
    const scale = totalSeats / totalCalculated;
    const actualSeatsPerRow = seatsPerRow.map(s => Math.round(s * scale));

    // Adjust last row to match exactly
    const currentTotal = actualSeatsPerRow.reduce((a, b) => a + b, 0);
    actualSeatsPerRow[rows - 1] += totalSeats - currentTotal;

    // Create seat positions
    const seatPositions = [];
    let seatIndex = 0;

    for (let row = 0; row < rows; row++) {
      const rowRadius = minRadius + ((maxRadius - minRadius) * row / (rows - 1));
      const numSeats = actualSeatsPerRow[row];

      for (let i = 0; i < numSeats; i++) {
        // Angle from 180° to 0° (left to right)
        const angle = Math.PI - (i / (numSeats - 1)) * Math.PI;
        const x = centerX + rowRadius * Math.cos(angle);
        const y = centerY - rowRadius * Math.sin(angle);

        seatPositions.push({ x, y, row, index: seatIndex++ });
      }
    }

    // Sort by x position (left to right) for party assignment
    seatPositions.sort((a, b) => a.x - b.x);

    // Assign parties to seats (left parties on left, right parties on right)
    const partyOrder = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];
    const seatColors = [];
    let seatCounter = 0;

    partyOrder.forEach(partyId => {
      const partySeats = seats[partyId] || 0;
      for (let i = 0; i < partySeats; i++) {
        seatColors.push(PARTY_COLORS[partyId]);
        seatCounter++;
      }
    });

    // Fill remaining with gray (shouldn't happen if math is right)
    while (seatColors.length < totalSeats) {
      seatColors.push('#333');
    }

    // Render seats
    const seatRadius = 4;
    let svg = '';

    seatPositions.forEach((pos, i) => {
      const color = seatColors[i] || '#333';
      svg += `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="${seatRadius}" fill="${color}" />`;
    });

    return svg;
  }

  function attachEventListeners(container) {
    // Preset buttons
    container.querySelectorAll('.seatcalc-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        if (PRESETS[presetKey]) {
          currentVotes = { ...PRESETS[presetKey].values };
          render(container);
        }
      });
    });

    // Sliders
    container.querySelectorAll('.seatcalc-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const partyId = slider.dataset.party;
        currentVotes[partyId] = parseFloat(slider.value);
        render(container);
      });
    });

    // Normalize button
    const normalizeBtn = container.querySelector('.seatcalc-normalize-btn');
    if (normalizeBtn) {
      normalizeBtn.addEventListener('click', () => {
        currentVotes = normalizeVotes(currentVotes);
        render(container);
      });
    }
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function init() {
    const container = document.getElementById('seatcalc-container');
    if (!container) return;

    // Load parties data for additional info
    try {
      const res = await fetch('data/parties.json');
      partiesData = await res.json();
    } catch (e) {
      console.warn('Could not load parties data');
    }

    render(container);
  }

  window.initSeatCalc = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
