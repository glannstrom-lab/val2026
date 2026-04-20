/**
 * Sakfråge-jämförelse
 * Jämför partiernas ståndpunkter i olika sakfrågor
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

  const STANCE_LABELS = {
    'for': { label: 'För', icon: '✓', class: 'stance-for' },
    'delvis_for': { label: 'Delvis för', icon: '↗', class: 'stance-partial-for' },
    'neutral': { label: 'Neutral', icon: '○', class: 'stance-neutral' },
    'delvis_emot': { label: 'Delvis emot', icon: '↘', class: 'stance-partial-against' },
    'emot': { label: 'Emot', icon: '✗', class: 'stance-against' }
  };

  const PARTY_ORDER = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];

  // ==========================================================================
  // State
  // ==========================================================================

  let issuesData = null;
  let partiesData = null;
  let selectedParties = new Set(['S', 'M', 'SD', 'V']); // Default selection
  let selectedCategory = 'all';
  let expandedIssue = null;

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  async function loadData() {
    try {
      const [issuesResponse, partiesResponse] = await Promise.all([
        fetch('data/issues.json'),
        fetch('data/parties.json')
      ]);

      issuesData = await issuesResponse.json();
      partiesData = await partiesResponse.json();

      return true;
    } catch (error) {
      console.error('Error loading compare data:', error);
      return false;
    }
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    container.innerHTML = `
      <div class="compare-wrapper">
        <!-- Party selector -->
        <div class="compare-party-selector">
          <p class="compare-selector-label">Välj partier att jämföra (2–4 st):</p>
          <div class="compare-party-buttons">
            ${PARTY_ORDER.map(partyId => {
              const party = partiesData.find(p => p.id === partyId);
              const isSelected = selectedParties.has(partyId);
              return `
                <button class="compare-party-btn ${isSelected ? 'is-selected' : ''}"
                  data-party="${partyId}"
                  style="--party-color: ${PARTY_COLORS[partyId]}; --party-text: ${PARTY_TEXT_COLORS[partyId]}"
                  aria-pressed="${isSelected}">
                  <img src="assets/logos/${partyId}.png" alt="${partyId}" class="compare-party-logo" loading="lazy" decoding="async">
                  <span class="compare-party-abbr">${partyId}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Category filter -->
        <div class="compare-category-filter">
          <label for="category-select" class="sr-only">Filtrera på kategori</label>
          <select id="category-select" class="compare-category-select">
            <option value="all">Alla sakfrågor</option>
            ${Object.entries(issuesData.categories).map(([id, cat]) => `
              <option value="${id}">${cat.icon} ${cat.label}</option>
            `).join('')}
          </select>
        </div>

        <!-- Issues list -->
        <div class="compare-issues" id="compare-issues">
          ${renderIssues()}
        </div>

        <!-- Legend -->
        <div class="compare-legend">
          <span class="compare-legend-title">Förklaring:</span>
          ${Object.entries(STANCE_LABELS).map(([key, stance]) => `
            <span class="compare-legend-item ${stance.class}">
              <span class="compare-legend-icon">${stance.icon}</span>
              ${stance.label}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    initEventHandlers(container);
  }

  function renderIssues() {
    const filteredIssues = selectedCategory === 'all'
      ? issuesData.issues
      : issuesData.issues.filter(issue => issue.category === selectedCategory);

    if (filteredIssues.length === 0) {
      return '<p class="compare-no-issues">Inga sakfrågor i denna kategori.</p>';
    }

    return filteredIssues.map(issue => renderIssueCard(issue)).join('');
  }

  function renderIssueCard(issue) {
    const category = issuesData.categories[issue.category];
    const isExpanded = expandedIssue === issue.id;
    const selectedPartiesArray = Array.from(selectedParties);

    return `
      <article class="compare-issue ${isExpanded ? 'is-expanded' : ''}" data-issue="${issue.id}">
        <header class="compare-issue-header">
          <div class="compare-issue-title">
            <span class="compare-issue-category">${category?.icon || ''}</span>
            <h3>${issue.label}</h3>
          </div>
          <button class="compare-issue-expand" aria-expanded="${isExpanded}" aria-label="Visa detaljer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 10 13 14 9"></polyline>
            </svg>
          </button>
        </header>

        <!-- Quick stance indicators -->
        <div class="compare-stances-quick">
          ${selectedPartiesArray.map(partyId => {
            const position = issue.positions[partyId];
            const stance = STANCE_LABELS[position?.stance] || STANCE_LABELS.neutral;
            return `
              <div class="compare-stance-quick ${stance.class}" title="${position?.summary || 'Ingen information'}">
                <span class="compare-stance-party" style="background: ${PARTY_COLORS[partyId]}; color: ${PARTY_TEXT_COLORS[partyId]}">${partyId}</span>
                <span class="compare-stance-icon">${stance.icon}</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Expanded details -->
        <div class="compare-issue-details">
          ${selectedPartiesArray.map(partyId => {
            const position = issue.positions[partyId];
            const stance = STANCE_LABELS[position?.stance] || STANCE_LABELS.neutral;
            const party = partiesData.find(p => p.id === partyId);
            return `
              <div class="compare-position">
                <div class="compare-position-header">
                  <span class="compare-position-party" style="background: ${PARTY_COLORS[partyId]}; color: ${PARTY_TEXT_COLORS[partyId]}">${partyId}</span>
                  <span class="compare-position-name">${party?.namn || partyId}</span>
                  <span class="compare-position-stance ${stance.class}">${stance.icon} ${stance.label}</span>
                </div>
                <p class="compare-position-summary">${position?.summary || 'Ingen information tillgänglig.'}</p>
                ${position?.source ? `
                  <a href="${position.source}" target="_blank" rel="noopener" class="compare-position-source">
                    Läs mer på partiets sida →
                  </a>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function initEventHandlers(container) {
    // Party selection
    container.querySelectorAll('.compare-party-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const partyId = btn.dataset.party;

        if (selectedParties.has(partyId)) {
          if (selectedParties.size > 2) {
            selectedParties.delete(partyId);
          }
        } else {
          if (selectedParties.size < 4) {
            selectedParties.add(partyId);
          }
        }

        render(container);
      });
    });

    // Category filter
    const categorySelect = container.querySelector('#category-select');
    categorySelect.value = selectedCategory;
    categorySelect.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      updateIssuesList(container);
    });

    // Issue expansion
    container.querySelectorAll('.compare-issue-header').forEach(header => {
      header.addEventListener('click', () => {
        const issueEl = header.closest('.compare-issue');
        const issueId = issueEl.dataset.issue;

        expandedIssue = expandedIssue === issueId ? null : issueId;
        updateIssuesList(container);
      });
    });

    // Keyboard support for issue expansion
    container.querySelectorAll('.compare-issue-expand').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.closest('.compare-issue-header').click();
        }
      });
    });
  }

  function updateIssuesList(container) {
    const issuesContainer = container.querySelector('#compare-issues');
    issuesContainer.innerHTML = renderIssues();

    // Re-attach event handlers for issues
    container.querySelectorAll('.compare-issue-header').forEach(header => {
      header.addEventListener('click', () => {
        const issueEl = header.closest('.compare-issue');
        const issueId = issueEl.dataset.issue;

        expandedIssue = expandedIssue === issueId ? null : issueId;
        updateIssuesList(container);
      });
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initCompare() {
    const container = document.getElementById('compare-container');
    if (!container) return;

    const loaded = await loadData();
    if (!loaded) {
      container.innerHTML = '<p class="text-center text-muted">Kunde inte ladda sakfrågedata.</p>';
      return;
    }

    render(container);

    console.log('Compare tool initialized');
  }

  // Export for global access
  window.initCompare = initCompare;

})();
