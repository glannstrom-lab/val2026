/**
 * Statsbudget för Val 2026
 * Jämför regeringens budget med oppositionens alternativ
 */

(function() {
  'use strict';

  // From shared/constants.js (filtered to opposition parties)
  const PARTY_ORDER = ['S', 'V', 'C', 'MP'];
  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;

  let budgetData = null;
  let selectedParties = ['S', 'V', 'C', 'MP'];
  let selectedCategory = 'all';
  let sortMode = 'id'; // 'id', 'gov', 'diff'
  let sortParty = 'S';

  async function init() {
    const container = document.getElementById('budget-container');
    if (!container) return;

    try {
      const response = await fetch('./data/budget.json');
      budgetData = await response.json();
      render(container);
    } catch (error) {
      console.error('Could not load budget data:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda budgetdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
    }
  }

  function render(container) {
    container.innerHTML = `
      <div class="budget-wrapper">
        <!-- Summary cards -->
        <div class="budget-summary" id="budget-summary">
          ${renderSummary()}
        </div>

        <!-- Party selector -->
        <div class="budget-controls">
          <div class="budget-party-selector">
            <span class="budget-label">Jämför partier:</span>
            <div class="budget-party-toggles">
              ${PARTY_ORDER.map(party => `
                <label class="budget-party-toggle ${selectedParties.includes(party) ? 'active' : ''}"
                       style="--party-color: ${PARTY_COLORS[party]}">
                  <input type="checkbox" value="${party}"
                         ${selectedParties.includes(party) ? 'checked' : ''}>
                  <span class="toggle-label">${party}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="budget-filter-group">
            <label for="budget-category-filter">Kategori:</label>
            <select id="budget-category-filter" class="budget-select">
              <option value="all">Alla utgiftsområden</option>
              ${Object.entries(budgetData.categories).map(([key, cat]) =>
                `<option value="${key}">${cat.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="budget-filter-group">
            <label for="budget-sort">Sortering:</label>
            <select id="budget-sort" class="budget-select">
              <option value="id">Utgiftsområde (1-27)</option>
              <option value="gov">Regeringens budget</option>
              <option value="diff-S">S skillnad</option>
              <option value="diff-V">V skillnad</option>
              <option value="diff-C">C skillnad</option>
              <option value="diff-MP">MP skillnad</option>
            </select>
          </div>
        </div>

        <!-- Highlights -->
        <div class="budget-highlights">
          ${budgetData.highlights.map(h => `
            <div class="budget-highlight">
              <strong>${h.title}</strong>
              <span>${h.description}</span>
            </div>
          `).join('')}
        </div>

        <!-- Main table -->
        <div class="budget-table-wrapper">
          <table class="budget-table" id="budget-table">
            <thead>
              <tr>
                <th class="col-area">Utgiftsområde</th>
                <th class="col-gov">Regeringen<br><span class="th-unit">mdr kr</span></th>
                ${selectedParties.map(party => `
                  <th class="col-party" style="--party-color: ${PARTY_COLORS[party]}">
                    ${party}<br><span class="th-unit">skillnad</span>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody id="budget-table-body">
              ${renderTableBody()}
            </tbody>
            <tfoot>
              ${renderTableFooter()}
            </tfoot>
          </table>
        </div>

        <!-- Party detail cards -->
        <div class="budget-party-details">
          <h3>Partiernas budgetförslag</h3>
          <div class="budget-party-cards" id="budget-party-cards">
            ${renderPartyCards()}
          </div>
        </div>

        <!-- Visualization -->
        <div class="budget-viz-section">
          <h3>Jämförelse per kategori</h3>
          <div class="budget-category-chart" id="budget-category-chart">
            ${renderCategoryChart()}
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="budget-disclaimer">
          <p>
            <strong>Källa:</strong> Prop. 2024/25:1 (Budgetpropositionen för 2025),
            oppositionens budgetmotioner (oktober 2024).
            <a href="${budgetData.source_url}" target="_blank" rel="noopener">
              Se hela budgetpropositionen på riksdagen.se
            </a>
          </p>
          <p>
            <em>Oppositionens skillnadsbelopp är uppskattningar baserade på deras budgetmotioner.
            Faktiska belopp kan variera beroende på hur satsningar redovisas.</em>
          </p>
        </div>
      </div>
    `;

    attachEventListeners();
  }

  function renderSummary() {
    const totalGov = budgetData.total_budget;
    const partyTotals = {};

    PARTY_ORDER.forEach(party => {
      partyTotals[party] = budgetData.expenditure_areas.reduce((sum, area) => {
        return sum + (area.parties[party]?.diff || 0);
      }, 0);
    });

    return `
      <div class="budget-summary-card gov">
        <span class="summary-label">Regeringens budget 2025</span>
        <span class="summary-value">${formatNumber(totalGov)} mdr</span>
      </div>
      ${PARTY_ORDER.map(party => {
        const diff = partyTotals[party];
        const sign = diff >= 0 ? '+' : '';
        return `
          <div class="budget-summary-card party" style="--party-color: ${PARTY_COLORS[party]}">
            <span class="summary-label">${party} skillnad</span>
            <span class="summary-value ${diff >= 0 ? 'positive' : 'negative'}">
              ${sign}${formatNumber(diff)} mdr
            </span>
          </div>
        `;
      }).join('')}
    `;
  }

  function renderTableBody() {
    let areas = [...budgetData.expenditure_areas];

    // Filter by category
    if (selectedCategory !== 'all') {
      areas = areas.filter(a => a.category === selectedCategory);
    }

    // Sort
    if (sortMode === 'gov') {
      areas.sort((a, b) => b.gov_budget - a.gov_budget);
    } else if (sortMode.startsWith('diff-')) {
      const party = sortMode.split('-')[1];
      areas.sort((a, b) => {
        const diffA = a.parties[party]?.diff || 0;
        const diffB = b.parties[party]?.diff || 0;
        return diffB - diffA;
      });
    }

    return areas.map(area => {
      const category = budgetData.categories[area.category];
      return `
        <tr data-area-id="${area.id}">
          <td class="col-area">
            <div class="area-info">
              <span class="area-number">UO ${area.id}</span>
              <span class="area-name">${area.short}</span>
              <span class="area-category" style="background: ${category.color}20; color: ${category.color}">
                ${category.name}
              </span>
            </div>
          </td>
          <td class="col-gov">
            <span class="gov-value">${area.gov_budget}</span>
          </td>
          ${selectedParties.map(party => {
            const partyData = area.parties[party];
            if (!partyData) return '<td class="col-party">-</td>';

            const diff = partyData.diff;
            const sign = diff > 0 ? '+' : '';
            const cls = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';

            return `
              <td class="col-party ${cls}" style="--party-color: ${PARTY_COLORS[party]}">
                <span class="diff-value">${sign}${diff}</span>
                <button class="diff-info-btn" data-area="${area.id}" data-party="${party}"
                        aria-label="Mer info">i</button>
              </td>
            `;
          }).join('')}
        </tr>
      `;
    }).join('');
  }

  function renderTableFooter() {
    const totalGov = budgetData.expenditure_areas.reduce((sum, a) => sum + a.gov_budget, 0);

    const partyTotals = {};
    selectedParties.forEach(party => {
      partyTotals[party] = budgetData.expenditure_areas.reduce((sum, area) => {
        return sum + (area.parties[party]?.diff || 0);
      }, 0);
    });

    return `
      <tr class="total-row">
        <td class="col-area"><strong>Totalt</strong></td>
        <td class="col-gov"><strong>${formatNumber(totalGov)}</strong></td>
        ${selectedParties.map(party => {
          const diff = partyTotals[party];
          const sign = diff >= 0 ? '+' : '';
          const cls = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
          return `
            <td class="col-party ${cls}" style="--party-color: ${PARTY_COLORS[party]}">
              <strong>${sign}${formatNumber(diff)}</strong>
            </td>
          `;
        }).join('')}
      </tr>
    `;
  }

  function renderPartyCards() {
    return Object.entries(budgetData.party_summaries).map(([party, data]) => `
      <div class="budget-party-card" style="--party-color: ${PARTY_COLORS[party]}">
        <div class="party-card-header">
          <img src="./assets/logos/${party}.png" alt="${party}" class="party-card-logo" loading="lazy" decoding="async"
               onerror="this.style.display='none'">
          <div class="party-card-title">
            <h4>${data.name}</h4>
            <span class="party-motion-title">${data.motion_title}</span>
          </div>
        </div>
        <div class="party-card-body">
          <div class="party-card-stat">
            <span class="stat-label">Reformutrymme</span>
            <span class="stat-value">${data.total_reform} mdr</span>
          </div>
          <div class="party-card-priorities">
            <span class="priorities-label">Huvudprioriteringar:</span>
            <ul>
              ${data.key_priorities.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="party-card-financing">
            <span class="financing-label">Finansiering:</span>
            <span>${data.financing}</span>
          </div>
        </div>
        <div class="party-card-footer">
          <a href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/motion/_${data.motion_id}/"
             target="_blank" rel="noopener" class="party-motion-link">
            Läs motionen på riksdagen.se
          </a>
        </div>
      </div>
    `).join('');
  }

  function renderCategoryChart() {
    const categoryData = {};

    Object.keys(budgetData.categories).forEach(cat => {
      categoryData[cat] = {
        gov: 0,
        parties: {}
      };
      PARTY_ORDER.forEach(party => {
        categoryData[cat].parties[party] = 0;
      });
    });

    budgetData.expenditure_areas.forEach(area => {
      categoryData[area.category].gov += area.gov_budget;
      PARTY_ORDER.forEach(party => {
        categoryData[area.category].parties[party] += (area.parties[party]?.diff || 0);
      });
    });

    const maxGov = Math.max(...Object.values(categoryData).map(d => d.gov));

    return Object.entries(categoryData).map(([catKey, data]) => {
      const cat = budgetData.categories[catKey];
      const govWidth = (data.gov / maxGov) * 100;

      return `
        <div class="category-chart-row">
          <div class="category-chart-label" style="color: ${cat.color}">
            ${cat.name}
          </div>
          <div class="category-chart-bars">
            <div class="category-bar gov" style="width: ${govWidth}%">
              <span class="bar-value">${formatNumber(data.gov)} mdr</span>
            </div>
            <div class="category-diffs">
              ${selectedParties.map(party => {
                const diff = data.parties[party];
                if (diff === 0) return '';
                const sign = diff > 0 ? '+' : '';
                const cls = diff > 0 ? 'positive' : 'negative';
                return `
                  <span class="category-diff ${cls}" style="--party-color: ${PARTY_COLORS[party]}">
                    ${party}: ${sign}${formatNumber(diff)}
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function attachEventListeners() {
    // Party toggles
    const toggles = document.querySelectorAll('.budget-party-toggle input');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const party = e.target.value;
        if (e.target.checked) {
          if (!selectedParties.includes(party)) {
            selectedParties.push(party);
          }
        } else {
          selectedParties = selectedParties.filter(p => p !== party);
        }
        // Ensure at least one party is selected
        if (selectedParties.length === 0) {
          selectedParties = ['S'];
          document.querySelector('.budget-party-toggle input[value="S"]').checked = true;
        }
        updateTable();
      });
    });

    // Category filter
    const categorySelect = document.getElementById('budget-category-filter');
    categorySelect.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      updateTable();
    });

    // Sort
    const sortSelect = document.getElementById('budget-sort');
    sortSelect.addEventListener('change', (e) => {
      sortMode = e.target.value;
      updateTable();
    });

    // Info buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('diff-info-btn')) {
        const areaId = parseInt(e.target.dataset.area);
        const party = e.target.dataset.party;
        showAreaInfo(areaId, party);
      }
    });
  }

  function updateTable() {
    // Update toggle states
    document.querySelectorAll('.budget-party-toggle').forEach(toggle => {
      const party = toggle.querySelector('input').value;
      toggle.classList.toggle('active', selectedParties.includes(party));
    });

    // Update table headers
    const thead = document.querySelector('.budget-table thead tr');
    thead.innerHTML = `
      <th class="col-area">Utgiftsområde</th>
      <th class="col-gov">Regeringen<br><span class="th-unit">mdr kr</span></th>
      ${selectedParties.map(party => `
        <th class="col-party" style="--party-color: ${PARTY_COLORS[party]}">
          ${party}<br><span class="th-unit">skillnad</span>
        </th>
      `).join('')}
    `;

    // Update body
    document.getElementById('budget-table-body').innerHTML = renderTableBody();

    // Update footer
    document.querySelector('.budget-table tfoot').innerHTML = renderTableFooter();

    // Update summary
    document.getElementById('budget-summary').innerHTML = renderSummary();

    // Update chart
    document.getElementById('budget-category-chart').innerHTML = renderCategoryChart();
  }

  function showAreaInfo(areaId, party) {
    const area = budgetData.expenditure_areas.find(a => a.id === areaId);
    if (!area) return;

    const partyData = area.parties[party];
    if (!partyData) return;

    const diff = partyData.diff;
    const sign = diff > 0 ? '+' : '';
    const total = area.gov_budget + diff;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'budget-modal-overlay';
    modal.innerHTML = `
      <div class="budget-modal">
        <button class="budget-modal-close" aria-label="Stäng">&times;</button>
        <h3>UO ${area.id}: ${area.name}</h3>
        <p class="area-description">${area.description}</p>

        <div class="modal-comparison">
          <div class="modal-gov">
            <span class="label">Regeringens förslag:</span>
            <span class="value">${area.gov_budget} mdr</span>
          </div>
          <div class="modal-party" style="--party-color: ${PARTY_COLORS[party]}">
            <span class="label">${PARTY_NAMES[party]}:</span>
            <span class="value">${formatNumber(total)} mdr (${sign}${diff})</span>
          </div>
        </div>

        <div class="modal-comment">
          <strong>${PARTY_NAMES[party]}s motivering:</strong>
          <p>${partyData.comment}</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = modal.querySelector('.budget-modal-close');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handler);
      }
    });
  }

  function formatNumber(num) {
    if (Math.abs(num) >= 1000) {
      return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
