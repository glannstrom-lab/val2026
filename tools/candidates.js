/**
 * Kandidatdatabas
 * Sökbar lista över riksdagskandidater
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;
  const PARTY_IDS = window.PARTY_IDS;

  // ==========================================================================
  // State
  // ==========================================================================

  let candidatesData = null;
  let filteredCandidates = [];
  let currentFilters = {
    search: '',
    party: 'all',
    constituency: 'all',
    sort: 'party'
  };

  // ==========================================================================
  // Helpers
  // ==========================================================================

  function normalizeString(str) {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o');
  }

  function matchesSearch(candidate, searchTerm) {
    if (!searchTerm) return true;
    const normalized = normalizeString(searchTerm);
    return (
      normalizeString(candidate.name).includes(normalized) ||
      normalizeString(candidate.role || '').includes(normalized) ||
      normalizeString(candidate.occupation || '').includes(normalized) ||
      candidate.focus.some(f => normalizeString(f).includes(normalized))
    );
  }

  function sortCandidates(candidates, sortBy) {
    return [...candidates].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'sv');
        case 'party':
          const partyOrder = PARTY_IDS.indexOf(a.party) - PARTY_IDS.indexOf(b.party);
          if (partyOrder !== 0) return partyOrder;
          return a.position - b.position;
        case 'constituency':
          const constA = candidatesData.constituencies.find(c => c.id === a.constituency);
          const constB = candidatesData.constituencies.find(c => c.id === b.constituency);
          return (constA?.name || '').localeCompare(constB?.name || '', 'sv');
        case 'position':
          return a.position - b.position;
        default:
          return 0;
      }
    });
  }

  function applyFilters() {
    let result = candidatesData.candidates;

    // Filter by search term
    if (currentFilters.search) {
      result = result.filter(c => matchesSearch(c, currentFilters.search));
    }

    // Filter by party
    if (currentFilters.party !== 'all') {
      result = result.filter(c => c.party === currentFilters.party);
    }

    // Filter by constituency
    if (currentFilters.constituency !== 'all') {
      result = result.filter(c => c.constituency === currentFilters.constituency);
    }

    // Sort
    result = sortCandidates(result, currentFilters.sort);

    filteredCandidates = result;
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    if (!candidatesData) {
      container.innerHTML = '<div class="error">Kunde inte ladda kandidatdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    applyFilters();

    container.innerHTML = `
      <!-- Search and Filters -->
      <div class="candidates-controls">
        <div class="candidates-search">
          <svg class="candidates-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text"
            class="candidates-search-input"
            id="candidate-search"
            placeholder="Sök namn, roll eller fokusområde..."
            value="${currentFilters.search}"
            aria-label="Sök kandidater">
        </div>

        <div class="candidates-filters">
          <div class="candidates-filter">
            <label for="filter-party" class="candidates-filter-label">Parti</label>
            <select id="filter-party" class="candidates-filter-select">
              <option value="all">Alla partier</option>
              ${PARTY_IDS.map(id => `
                <option value="${id}" ${currentFilters.party === id ? 'selected' : ''}>
                  ${PARTY_NAMES[id]}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="candidates-filter">
            <label for="filter-constituency" class="candidates-filter-label">Valkrets</label>
            <select id="filter-constituency" class="candidates-filter-select">
              <option value="all">Alla valkretsar</option>
              ${candidatesData.constituencies.map(c => `
                <option value="${c.id}" ${currentFilters.constituency === c.id ? 'selected' : ''}>
                  ${c.name}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="candidates-filter">
            <label for="filter-sort" class="candidates-filter-label">Sortera</label>
            <select id="filter-sort" class="candidates-filter-select">
              <option value="party" ${currentFilters.sort === 'party' ? 'selected' : ''}>Parti</option>
              <option value="name" ${currentFilters.sort === 'name' ? 'selected' : ''}>Namn A-Ö</option>
              <option value="constituency" ${currentFilters.sort === 'constituency' ? 'selected' : ''}>Valkrets</option>
              <option value="position" ${currentFilters.sort === 'position' ? 'selected' : ''}>Listposition</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results count -->
      <div class="candidates-results-info">
        <span class="candidates-count">
          ${filteredCandidates.length} ${filteredCandidates.length === 1 ? 'kandidat' : 'kandidater'}
          ${currentFilters.search || currentFilters.party !== 'all' || currentFilters.constituency !== 'all' ? ' (filtrerat)' : ''}
        </span>
        ${currentFilters.search || currentFilters.party !== 'all' || currentFilters.constituency !== 'all' ? `
          <button class="candidates-clear-btn" id="clear-filters">Rensa filter</button>
        ` : ''}
      </div>

      <!-- Candidates Grid -->
      <div class="candidates-grid">
        ${filteredCandidates.length > 0 ?
          filteredCandidates.map(candidate => renderCandidateCard(candidate)).join('') :
          '<p class="candidates-no-results">Inga kandidater matchar dina filter.</p>'
        }
      </div>

      <!-- Info -->
      <div class="candidates-info">
        <h3>Om kandidatdatabasen</h3>
        <p>Här hittar du ett urval av toppkandidater från varje parti. Databasen innehåller ${candidatesData.meta.totalCandidates} kandidater med information om deras erfarenhet och fokusområden.</p>
        <p><strong>Tips:</strong> Klicka på ett fokusområde för att söka efter fler kandidater med samma intresse.</p>
      </div>
    `;

    attachEventListeners(container);
  }

  function renderCandidateCard(candidate) {
    const constituency = candidatesData.constituencies.find(c => c.id === candidate.constituency);
    const initials = candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    return `
      <article class="candidate-card" style="--party-color: ${PARTY_COLORS[candidate.party]}">
        <div class="candidate-card-header">
          <div class="candidate-avatar" style="background: ${PARTY_COLORS[candidate.party]}">
            ${initials}
          </div>
          <div class="candidate-party-badge">
            <img src="assets/logos/${candidate.party}.png" alt="${candidate.party}" loading="lazy" decoding="async" width="48" height="48">
          </div>
        </div>

        <div class="candidate-card-body">
          <h3 class="candidate-name">${candidate.name}</h3>
          ${candidate.role ? `<p class="candidate-role">${candidate.role}</p>` : ''}

          <div class="candidate-meta">
            <span class="candidate-meta-item" title="Parti">
              <strong>${candidate.party}</strong> · Plats ${candidate.position}
            </span>
            <span class="candidate-meta-item" title="Valkrets">
              📍 ${constituency?.name || candidate.constituency}
            </span>
          </div>

          <p class="candidate-occupation">${candidate.occupation}</p>

          ${candidate.experience ? `
            <p class="candidate-experience">${candidate.experience}</p>
          ` : ''}

          <div class="candidate-focus">
            ${candidate.focus.map(f => `
              <button class="candidate-focus-tag" data-focus="${f}">${f}</button>
            `).join('')}
          </div>
        </div>
      </article>
    `;
  }

  function attachEventListeners(container) {
    // Search input
    const searchInput = document.getElementById('candidate-search');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = e.target.value;
        render(container);
      }, 300);
    });

    // Party filter
    document.getElementById('filter-party').addEventListener('change', (e) => {
      currentFilters.party = e.target.value;
      render(container);
    });

    // Constituency filter
    document.getElementById('filter-constituency').addEventListener('change', (e) => {
      currentFilters.constituency = e.target.value;
      render(container);
    });

    // Sort filter
    document.getElementById('filter-sort').addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      render(container);
    });

    // Clear filters button
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentFilters = {
          search: '',
          party: 'all',
          constituency: 'all',
          sort: 'party'
        };
        render(container);
      });
    }

    // Focus tag clicks
    container.querySelectorAll('.candidate-focus-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        currentFilters.search = tag.dataset.focus;
        render(container);
        // Scroll to top of results
        container.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function init() {
    const container = document.getElementById('candidates-container');
    if (!container) return;

    try {
      const res = await fetch('data/candidates.json');
      candidatesData = await res.json();
      render(container);
      console.log('Candidates database initialized');
    } catch (error) {
      console.error('Error loading candidates:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda kandidatdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
    }
  }

  window.initCandidates = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
