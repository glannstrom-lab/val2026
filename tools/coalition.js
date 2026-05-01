/**
 * Koalitionsbyggare
 * Interaktivt verktyg för att bygga regeringsunderlag
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const MAJORITY_THRESHOLD = window.RIKSDAG_MAJORITY;
  const TOTAL_SEATS = window.RIKSDAG_TOTAL_SEATS;
  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_TEXT_COLORS = window.PARTY_TEXT_COLORS;

  // Predefined coalitions
  const PRESET_COALITIONS = [
    {
      id: 'tido',
      name: 'Tidöregeringen',
      description: 'Nuvarande regeringsunderlag (M+KD+L med SD-stöd)',
      parties: ['M', 'KD', 'L', 'SD']
    },
    {
      id: 'rodgrona',
      name: 'Rödgröna',
      description: 'S+MP+V',
      parties: ['S', 'MP', 'V']
    },
    {
      id: 'mitt',
      name: 'Mittenregering',
      description: 'S+C+L+MP',
      parties: ['S', 'C', 'L', 'MP']
    },
    {
      id: 'blockover',
      name: 'Blocköverskridande',
      description: 'S+M (stor koalition)',
      parties: ['S', 'M']
    }
  ];

  // ==========================================================================
  // State
  // ==========================================================================

  let partiesData = null;
  let selectedParties = new Set();
  let usePolls = false; // false = use 2022 results, true = use polls

  // Poll data (april 2026)
  const POLL_DATA = {
    V: 8,
    S: 33,
    MP: 6,
    C: 6,
    L: 2,
    KD: 5,
    M: 18,
    SD: 20
  };

  // ==========================================================================
  // Calculations
  // ==========================================================================

  function getPartySeats(party) {
    if (usePolls) {
      // Convert poll percentage to estimated seats
      const percent = POLL_DATA[party.id] || 0;
      // Parties under 4% threshold get 0 seats in the Riksdag
      if (percent < 4) {
        return 0;
      }
      return Math.round((percent / 100) * TOTAL_SEATS);
    } else {
      return party.mandat_2022;
    }
  }

  function getTotalSeats() {
    let total = 0;
    selectedParties.forEach(partyId => {
      const party = partiesData.find(p => p.id === partyId);
      if (party) {
        total += getPartySeats(party);
      }
    });
    return total;
  }

  function hasMajority() {
    return getTotalSeats() >= MAJORITY_THRESHOLD;
  }

  function getSeatsNeeded() {
    return Math.max(0, MAJORITY_THRESHOLD - getTotalSeats());
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    const totalSeats = getTotalSeats();
    const majority = hasMajority();
    const seatsNeeded = getSeatsNeeded();
    const fillPercent = Math.min(100, (totalSeats / MAJORITY_THRESHOLD) * 100);

    container.innerHTML = `
      <div class="coalition-wrapper">
        <!-- Data source toggle -->
        <div class="coalition-source-toggle">
          <span class="coalition-source-label">Baserat på:</span>
          <div class="coalition-source-buttons">
            <button class="coalition-source-btn ${!usePolls ? 'is-active' : ''}" data-source="2022">
              Valresultat 2022
            </button>
            <button class="coalition-source-btn ${usePolls ? 'is-active' : ''}" data-source="polls">
              Opinion april 2026
            </button>
          </div>
        </div>

        <!-- Seat meter -->
        <div class="coalition-meter">
          <div class="coalition-meter-header">
            <span class="coalition-meter-title">Mandat</span>
            <span class="coalition-meter-count ${majority ? 'has-majority' : ''}">
              ${totalSeats} / ${MAJORITY_THRESHOLD}
            </span>
          </div>
          <div class="coalition-meter-bar">
            <div class="coalition-meter-fill ${majority ? 'has-majority' : ''}"
                 style="width: ${fillPercent}%"></div>
            <div class="coalition-meter-threshold" style="left: ${(MAJORITY_THRESHOLD / TOTAL_SEATS) * 100}%">
              <span class="coalition-meter-threshold-label">175</span>
            </div>
          </div>
          <div class="coalition-meter-status">
            ${majority
              ? `<span class="coalition-status-success">✓ Majoritet uppnådd!</span>`
              : `<span class="coalition-status-pending">Behöver ${seatsNeeded} mandat till</span>`
            }
          </div>
        </div>

        <!-- Party selector -->
        <div class="coalition-parties">
          <h2>Välj partier</h2>
          <div class="coalition-party-grid">
            ${partiesData.map(party => renderPartyCard(party)).join('')}
          </div>
        </div>

        <!-- Selected coalition summary -->
        ${selectedParties.size > 0 ? renderCoalitionSummary() : ''}

        <!-- Preset coalitions -->
        <div class="coalition-presets">
          <h2>Snabbval</h2>
          <div class="coalition-preset-grid">
            ${PRESET_COALITIONS.map(preset => renderPresetButton(preset)).join('')}
          </div>
        </div>

        <!-- Info -->
        <div class="coalition-info">
          <p>
            ${usePolls
              ? 'Mandatuppskattning baserad på opinionssiffror april 2026. Notera: L ligger under 4%-spärren i mätningar.'
              : 'Mandatfördelning baserad på valresultatet 2022.'}
          </p>
        </div>
      </div>
    `;

    initEventHandlers(container);
  }

  function renderPartyCard(party) {
    const isSelected = selectedParties.has(party.id);
    const seats = getPartySeats(party);
    const underThreshold = usePolls && POLL_DATA[party.id] < 4;

    return `
      <button class="coalition-party-card ${isSelected ? 'is-selected' : ''} ${underThreshold ? 'under-threshold' : ''}"
        data-party="${party.id}"
        style="--party-color: ${PARTY_COLORS[party.id]}; --party-text: ${PARTY_TEXT_COLORS[party.id]}"
        aria-pressed="${isSelected}">
        <img src="assets/logos/${party.id}.png" alt="${party.id}" class="coalition-party-logo" loading="lazy" decoding="async" width="48" height="48">
        <span class="coalition-party-name">${party.namn}</span>
        <span class="coalition-party-seats">${seats} mandat</span>
        ${underThreshold ? '<span class="coalition-party-warning">Under spärren</span>' : ''}
      </button>
    `;
  }

  function renderCoalitionSummary() {
    const selectedList = Array.from(selectedParties);
    const totalSeats = getTotalSeats();

    return `
      <div class="coalition-summary">
        <h2>Din koalition</h2>
        <div class="coalition-summary-parties">
          ${selectedList.map(partyId => {
            const party = partiesData.find(p => p.id === partyId);
            const seats = getPartySeats(party);
            return `
              <div class="coalition-summary-party" style="--party-color: ${PARTY_COLORS[partyId]}">
                <span class="coalition-summary-badge" style="background: ${PARTY_COLORS[partyId]}; color: ${PARTY_TEXT_COLORS[partyId]}">${partyId}</span>
                <span class="coalition-summary-seats">${seats}</span>
              </div>
            `;
          }).join('<span class="coalition-summary-plus">+</span>')}
          <span class="coalition-summary-equals">=</span>
          <span class="coalition-summary-total ${hasMajority() ? 'has-majority' : ''}">${totalSeats}</span>
        </div>
      </div>
    `;
  }

  function renderPresetButton(preset) {
    const isActive = preset.parties.length === selectedParties.size &&
      preset.parties.every(p => selectedParties.has(p));

    return `
      <button class="coalition-preset-btn ${isActive ? 'is-active' : ''}" data-preset="${preset.id}">
        <span class="coalition-preset-name">${preset.name}</span>
        <span class="coalition-preset-parties">
          ${preset.parties.map(p => `<span style="background: ${PARTY_COLORS[p]}; color: ${PARTY_TEXT_COLORS[p]}">${p}</span>`).join('')}
        </span>
      </button>
    `;
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function initEventHandlers(container) {
    // Party selection
    container.querySelectorAll('.coalition-party-card').forEach(card => {
      card.addEventListener('click', () => {
        const partyId = card.dataset.party;
        if (selectedParties.has(partyId)) {
          selectedParties.delete(partyId);
        } else {
          selectedParties.add(partyId);
        }
        render(container);
      });
    });

    // Preset buttons
    container.querySelectorAll('.coalition-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.preset;
        const preset = PRESET_COALITIONS.find(p => p.id === presetId);
        if (preset) {
          selectedParties.clear();
          preset.parties.forEach(p => selectedParties.add(p));
          render(container);
        }
      });
    });

    // Source toggle
    container.querySelectorAll('.coalition-source-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        usePolls = btn.dataset.source === 'polls';
        render(container);
      });
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initCoalition() {
    const container = document.getElementById('coalition-container');
    if (!container) return;

    try {
      const response = await fetch('data/parties.json');
      partiesData = await response.json();
    } catch (error) {
      console.error('Error loading parties data:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda partidata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    render(container);

    console.log('Coalition builder initialized');
  }

  // Export for global access
  window.initCoalition = initCoalition;

})();
