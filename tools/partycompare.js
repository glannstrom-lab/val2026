/**
 * Partijämförelse
 * Jämför två partier sida vid sida
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;
  const PARTY_TEXT_COLORS = window.PARTY_TEXT_COLORS;

  const STANCE_ICONS = {
    'for': '✓',
    'delvis_for': '↗',
    'neutral': '○',
    'delvis_emot': '↘',
    'emot': '✗'
  };

  const STANCE_LABELS = {
    'for': 'För',
    'delvis_for': 'Delvis för',
    'neutral': 'Neutral',
    'delvis_emot': 'Delvis emot',
    'emot': 'Emot'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let partiesData = null;
  let issuesData = null;
  let compassData = null;
  let selectedParties = [null, null];

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  async function loadData() {
    try {
      const [partiesRes, issuesRes, compassRes] = await Promise.all([
        fetch('data/parties.json'),
        fetch('data/issues.json'),
        fetch('data/compass-positions.json')
      ]);

      partiesData = await partiesRes.json();
      issuesData = await issuesRes.json();
      compassData = await compassRes.json();

      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function renderPartySelector(container) {
    container.innerHTML = `
      <div class="partycompare-selector">
        <h3>Välj två partier att jämföra</h3>

        <div class="partycompare-select-grid">
          <div class="partycompare-select-column">
            <label class="partycompare-select-label">Parti 1</label>
            <div class="partycompare-party-buttons" id="party-select-1">
              ${partiesData.map(party => `
                <button class="partycompare-party-btn ${selectedParties[0] === party.id ? 'is-selected' : ''}"
                  data-party="${party.id}"
                  data-slot="0"
                  style="--party-color: ${PARTY_COLORS[party.id]}; --party-text: ${PARTY_TEXT_COLORS[party.id]}">
                  <img src="assets/logos/${party.id}.png" alt="${party.id}" loading="lazy" decoding="async">
                  <span>${party.kortnamn}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="partycompare-vs">VS</div>

          <div class="partycompare-select-column">
            <label class="partycompare-select-label">Parti 2</label>
            <div class="partycompare-party-buttons" id="party-select-2">
              ${partiesData.map(party => `
                <button class="partycompare-party-btn ${selectedParties[1] === party.id ? 'is-selected' : ''}"
                  data-party="${party.id}"
                  data-slot="1"
                  style="--party-color: ${PARTY_COLORS[party.id]}; --party-text: ${PARTY_TEXT_COLORS[party.id]}">
                  <img src="assets/logos/${party.id}.png" alt="${party.id}" loading="lazy" decoding="async">
                  <span>${party.kortnamn}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        ${selectedParties[0] && selectedParties[1] ? '' : `
          <p class="partycompare-hint">Välj ett parti från varje sida för att starta jämförelsen</p>
        `}
      </div>
    `;

    // Attach event listeners
    container.querySelectorAll('.partycompare-party-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const partyId = btn.dataset.party;
        const slot = parseInt(btn.dataset.slot);

        // Toggle selection
        if (selectedParties[slot] === partyId) {
          selectedParties[slot] = null;
        } else {
          selectedParties[slot] = partyId;
        }

        render(container);
      });
    });
  }

  function renderComparison(container) {
    const party1 = partiesData.find(p => p.id === selectedParties[0]);
    const party2 = partiesData.find(p => p.id === selectedParties[1]);

    if (!party1 || !party2) {
      renderPartySelector(container);
      return;
    }

    const compass1 = compassData.positions.find(p => p.id === party1.id);
    const compass2 = compassData.positions.find(p => p.id === party2.id);

    container.innerHTML = `
      <!-- Party Selector (collapsed) -->
      <div class="partycompare-selector partycompare-selector--compact">
        <div class="partycompare-selected-parties">
          <button class="partycompare-selected-party" data-slot="0"
            style="--party-color: ${PARTY_COLORS[party1.id]}">
            <img src="assets/logos/${party1.id}.png" alt="${party1.id}" loading="lazy" decoding="async">
            <span>${party1.namn}</span>
            <span class="partycompare-change-btn">Ändra</span>
          </button>

          <span class="partycompare-vs-small">VS</span>

          <button class="partycompare-selected-party" data-slot="1"
            style="--party-color: ${PARTY_COLORS[party2.id]}">
            <img src="assets/logos/${party2.id}.png" alt="${party2.id}" loading="lazy" decoding="async">
            <span>${party2.namn}</span>
            <span class="partycompare-change-btn">Ändra</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="partycompare-stats">
        <div class="partycompare-stat-row">
          <div class="partycompare-stat partycompare-stat--left" style="--party-color: ${PARTY_COLORS[party1.id]}">
            <span class="partycompare-stat-value">${party1.opinion_nu}%</span>
            <span class="partycompare-stat-label">Opinion</span>
          </div>
          <div class="partycompare-stat-title">Opinionsläge</div>
          <div class="partycompare-stat partycompare-stat--right" style="--party-color: ${PARTY_COLORS[party2.id]}">
            <span class="partycompare-stat-value">${party2.opinion_nu}%</span>
            <span class="partycompare-stat-label">Opinion</span>
          </div>
        </div>

        <div class="partycompare-stat-row">
          <div class="partycompare-stat partycompare-stat--left" style="--party-color: ${PARTY_COLORS[party1.id]}">
            <span class="partycompare-stat-value">${party1.mandat_2022}</span>
            <span class="partycompare-stat-label">${party1.valresultat_2022.toFixed(1)}%</span>
          </div>
          <div class="partycompare-stat-title">Mandat 2022</div>
          <div class="partycompare-stat partycompare-stat--right" style="--party-color: ${PARTY_COLORS[party2.id]}">
            <span class="partycompare-stat-value">${party2.mandat_2022}</span>
            <span class="partycompare-stat-label">${party2.valresultat_2022.toFixed(1)}%</span>
          </div>
        </div>

        <div class="partycompare-stat-row">
          <div class="partycompare-stat partycompare-stat--left" style="--party-color: ${PARTY_COLORS[party1.id]}">
            <span class="partycompare-stat-value">${party1.grundat}</span>
            <span class="partycompare-stat-label">Grundat</span>
          </div>
          <div class="partycompare-stat-title">Historia</div>
          <div class="partycompare-stat partycompare-stat--right" style="--party-color: ${PARTY_COLORS[party2.id]}">
            <span class="partycompare-stat-value">${party2.grundat}</span>
            <span class="partycompare-stat-label">Grundat</span>
          </div>
        </div>
      </div>

      <!-- Leaders -->
      <div class="partycompare-section">
        <h3 class="partycompare-section-title">Partiledare</h3>
        <div class="partycompare-leaders">
          <div class="partycompare-leader" style="--party-color: ${PARTY_COLORS[party1.id]}">
            <div class="partycompare-leader-name">${party1.ledare}</div>
            <div class="partycompare-leader-title">${party1.ledare_titel} sedan ${party1.ledare_sedan.replace('-', '/')}</div>
          </div>
          <div class="partycompare-leader" style="--party-color: ${PARTY_COLORS[party2.id]}">
            <div class="partycompare-leader-name">${party2.ledare}</div>
            <div class="partycompare-leader-title">${party2.ledare_titel} sedan ${party2.ledare_sedan.replace('-', '/')}</div>
          </div>
        </div>
      </div>

      <!-- Ideology -->
      <div class="partycompare-section">
        <h3 class="partycompare-section-title">Ideologi</h3>
        <div class="partycompare-ideology">
          <div class="partycompare-ideology-item" style="--party-color: ${PARTY_COLORS[party1.id]}">
            ${party1.ideologi}
          </div>
          <div class="partycompare-ideology-item" style="--party-color: ${PARTY_COLORS[party2.id]}">
            ${party2.ideologi}
          </div>
        </div>

        ${compass1 && compass2 ? `
          <div class="partycompare-compass-comparison">
            <div class="partycompare-compass-axis">
              <span class="partycompare-compass-label">Ekonomi: Vänster ← → Höger</span>
              <div class="partycompare-compass-scale">
                <div class="partycompare-compass-marker"
                  style="left: ${((compass1.ekonomi + 10) / 20) * 100}%; background: ${PARTY_COLORS[party1.id]}"
                  title="${party1.kortnamn}: ${compass1.ekonomi}">
                  ${party1.kortnamn}
                </div>
                <div class="partycompare-compass-marker"
                  style="left: ${((compass2.ekonomi + 10) / 20) * 100}%; background: ${PARTY_COLORS[party2.id]}"
                  title="${party2.kortnamn}: ${compass2.ekonomi}">
                  ${party2.kortnamn}
                </div>
              </div>
            </div>
            <div class="partycompare-compass-axis">
              <span class="partycompare-compass-label">Värderingar: Liberal ← → Konservativ</span>
              <div class="partycompare-compass-scale">
                <div class="partycompare-compass-marker"
                  style="left: ${((compass1.gal_tan + 10) / 20) * 100}%; background: ${PARTY_COLORS[party1.id]}"
                  title="${party1.kortnamn}: ${compass1.gal_tan}">
                  ${party1.kortnamn}
                </div>
                <div class="partycompare-compass-marker"
                  style="left: ${((compass2.gal_tan + 10) / 20) * 100}%; background: ${PARTY_COLORS[party2.id]}"
                  title="${party2.kortnamn}: ${compass2.gal_tan}">
                  ${party2.kortnamn}
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Issues -->
      <div class="partycompare-section">
        <h3 class="partycompare-section-title">Sakfrågor</h3>

        <div class="partycompare-category-filter">
          <label for="issue-category" class="sr-only">Filtrera kategori</label>
          <select id="issue-category" class="partycompare-category-select">
            <option value="all">Alla kategorier</option>
            ${Object.entries(issuesData.categories).map(([id, cat]) => `
              <option value="${id}">${cat.icon} ${cat.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="partycompare-issues" id="issues-list">
          ${renderIssuesList(party1, party2, 'all')}
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.partycompare-selected-party').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot);
        selectedParties[slot] = null;
        render(container);
      });
    });

    const categorySelect = container.querySelector('#issue-category');
    categorySelect.addEventListener('change', () => {
      const issuesList = container.querySelector('#issues-list');
      issuesList.innerHTML = renderIssuesList(party1, party2, categorySelect.value);
    });
  }

  function renderIssuesList(party1, party2, category) {
    const issues = issuesData.issues.filter(issue =>
      category === 'all' || issue.category === category
    );

    if (issues.length === 0) {
      return '<p class="partycompare-no-issues">Inga frågor i denna kategori.</p>';
    }

    return issues.map(issue => {
      const pos1 = issue.positions[party1.id];
      const pos2 = issue.positions[party2.id];

      if (!pos1 || !pos2) return '';

      const match = pos1.stance === pos2.stance;
      const categoryInfo = issuesData.categories[issue.category];

      return `
        <div class="partycompare-issue ${match ? 'partycompare-issue--match' : 'partycompare-issue--differ'}">
          <div class="partycompare-issue-header">
            <span class="partycompare-issue-category">${categoryInfo.icon}</span>
            <span class="partycompare-issue-label">${issue.label}</span>
            ${match ? '<span class="partycompare-issue-match-badge">Eniga</span>' : ''}
          </div>

          <div class="partycompare-issue-positions">
            <div class="partycompare-issue-position" style="--party-color: ${PARTY_COLORS[party1.id]}">
              <span class="partycompare-stance partycompare-stance--${pos1.stance}">
                ${STANCE_ICONS[pos1.stance]} ${STANCE_LABELS[pos1.stance]}
              </span>
              <p class="partycompare-position-summary">${pos1.summary}</p>
            </div>

            <div class="partycompare-issue-position" style="--party-color: ${PARTY_COLORS[party2.id]}">
              <span class="partycompare-stance partycompare-stance--${pos2.stance}">
                ${STANCE_ICONS[pos2.stance]} ${STANCE_LABELS[pos2.stance]}
              </span>
              <p class="partycompare-position-summary">${pos2.summary}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function render(container) {
    if (selectedParties[0] && selectedParties[1]) {
      renderComparison(container);
    } else {
      renderPartySelector(container);
    }
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function init() {
    const container = document.getElementById('partycompare-container');
    if (!container) return;

    const loaded = await loadData();
    if (!loaded) {
      container.innerHTML = '<div class="error">Kunde inte ladda data. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    // Check URL for pre-selected parties
    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('p1');
    const p2 = params.get('p2');

    if (p1 && partiesData.find(p => p.id === p1)) {
      selectedParties[0] = p1;
    }
    if (p2 && partiesData.find(p => p.id === p2)) {
      selectedParties[1] = p2;
    }

    render(container);
    console.log('Party compare initialized');
  }

  window.initPartyCompare = init;

  // Auto-init if container exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
