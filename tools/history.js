/**
 * Valhistorik för Val 2026
 * Visar historiska valresultat, EU-val och jämförelser
 */

(function() {
  'use strict';

  // From shared/constants.js
  const PARTY_ORDER = ['S', 'SD', 'M', 'V', 'C', 'MP', 'KD', 'L'];
  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;

  let historyData = null;
  let partiesData = null;
  let constituenciesData = null;
  let activeView = 'comparison';

  async function init() {
    const container = document.getElementById('history-container');
    if (!container) return;

    try {
      const [historyRes, partiesRes, constRes] = await Promise.all([
        fetch('./data/election-history.json'),
        fetch('./data/parties.json'),
        fetch('./data/constituencies.json')
      ]);
      historyData = await historyRes.json();
      partiesData = await partiesRes.json();
      constituenciesData = await constRes.json();
      render(container);
    } catch (error) {
      console.error('Could not load history data:', error);
      container.innerHTML = '<p class="error">Kunde inte ladda valhistorik.</p>';
    }
  }

  function render(container) {
    container.innerHTML = `
      <div class="history-wrapper">
        <!-- View tabs -->
        <div class="history-tabs">
          <button class="history-tab active" data-view="comparison">Jämförelse</button>
          <button class="history-tab" data-view="eu2024">EU-valet 2024</button>
          <button class="history-tab" data-view="leaders">Partiledarna</button>
          <button class="history-tab" data-view="constituencies">Valkretsar</button>
        </div>

        <!-- Content area -->
        <div class="history-content" id="history-content">
          ${renderComparison()}
        </div>
      </div>
    `;

    attachEventListeners();
  }

  function renderComparison() {
    const e2018 = historyData.elections.riksdag_2018;
    const e2022 = historyData.elections.riksdag_2022;
    const opinion = historyData.opinion_current;

    return `
      <div class="history-comparison">
        <h3>Riksdagsvalen 2018 & 2022 vs Opinion nu</h3>

        <!-- Trend indicators -->
        <div class="history-trends">
          ${historyData.trends.map(t => `
            <div class="trend-item trend-${t.trend}">
              <span class="trend-party" style="color: ${PARTY_COLORS[t.party]}">${t.party}</span>
              <span class="trend-arrow">${t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→'}</span>
              <span class="trend-desc">${t.description}</span>
            </div>
          `).join('')}
        </div>

        <!-- Comparison chart -->
        <div class="comparison-chart">
          ${PARTY_ORDER.map(party => {
            const v2018 = e2018.results[party]?.votes_pct || 0;
            const v2022 = e2022.results[party]?.votes_pct || 0;
            const vNow = opinion.values[party] || 0;
            const maxVal = Math.max(v2018, v2022, vNow, 35);

            return `
              <div class="comparison-row">
                <div class="comparison-party" style="--party-color: ${PARTY_COLORS[party]}">
                  ${party}
                </div>
                <div class="comparison-bars">
                  <div class="comparison-bar-group">
                    <div class="comparison-bar bar-2018" style="width: ${(v2018 / maxVal) * 100}%">
                      <span>${v2018}%</span>
                    </div>
                    <div class="comparison-bar bar-2022" style="width: ${(v2022 / maxVal) * 100}%">
                      <span>${v2022}%</span>
                    </div>
                    <div class="comparison-bar bar-now" style="width: ${(vNow / maxVal) * 100}%; background: ${PARTY_COLORS[party]}">
                      <span>${vNow}%</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="comparison-legend">
          <span class="legend-item"><span class="legend-color bar-2018"></span>2018</span>
          <span class="legend-item"><span class="legend-color bar-2022"></span>2022</span>
          <span class="legend-item"><span class="legend-color bar-now"></span>Opinion nu</span>
        </div>

        <!-- Block comparison -->
        <div class="block-comparison">
          <h4>Blockfördelning</h4>
          <div class="block-bars">
            <div class="block-section">
              <span class="block-label">Valet 2022</span>
              <div class="block-bar-container">
                <div class="block-bar left" style="width: ${historyData.block_comparison.riksdag_2022.vansterblock.total_pct}%">
                  ${historyData.block_comparison.riksdag_2022.vansterblock.mandates} mandat
                </div>
                <div class="block-bar right" style="width: ${historyData.block_comparison.riksdag_2022.hogerblock.total_pct}%">
                  ${historyData.block_comparison.riksdag_2022.hogerblock.mandates} mandat
                </div>
              </div>
            </div>
            <div class="block-section">
              <span class="block-label">Opinion nu</span>
              <div class="block-bar-container">
                <div class="block-bar left" style="width: ${historyData.block_comparison.opinion_2026.vansterblock.total_pct}%">
                  ${historyData.block_comparison.opinion_2026.vansterblock.total_pct}%
                </div>
                <div class="block-bar right" style="width: ${historyData.block_comparison.opinion_2026.hogerblock.total_pct}%">
                  ${historyData.block_comparison.opinion_2026.hogerblock.total_pct}%
                </div>
              </div>
            </div>
          </div>
          <div class="block-legend">
            <span><span class="block-dot left"></span>S+V+C+MP</span>
            <span><span class="block-dot right"></span>M+KD+L+SD</span>
          </div>
        </div>

        <!-- Turnout -->
        <div class="turnout-comparison">
          <h4>Valdeltagande</h4>
          <div class="turnout-bars">
            <div class="turnout-item">
              <span class="turnout-label">2018</span>
              <div class="turnout-bar" style="width: ${e2018.turnout}%"></div>
              <span class="turnout-value">${e2018.turnout}%</span>
            </div>
            <div class="turnout-item">
              <span class="turnout-label">2022</span>
              <div class="turnout-bar" style="width: ${e2022.turnout}%"></div>
              <span class="turnout-value">${e2022.turnout}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEU2024() {
    const eu = historyData.elections.eu_2024;

    return `
      <div class="history-eu">
        <h3>EU-valet 2024</h3>
        <p class="eu-subtitle">9 juni 2024 · Valdeltagande: ${eu.turnout}% · ${eu.sweden_seats} svenska platser</p>

        <div class="eu-highlights">
          ${eu.highlights.map(h => `<span class="eu-highlight">${h}</span>`).join('')}
        </div>

        <div class="eu-results">
          ${PARTY_ORDER.map(party => {
            const r = eu.results[party];
            if (!r) return '';
            const changeClass = r.change_pct > 0 ? 'positive' : r.change_pct < 0 ? 'negative' : '';
            const sign = r.change_pct > 0 ? '+' : '';

            return `
              <div class="eu-party-row" style="--party-color: ${PARTY_COLORS[party]}">
                <div class="eu-party-info">
                  <img src="./assets/logos/${party}.png" alt="${party}" class="eu-party-logo" loading="lazy" decoding="async" onerror="this.style.display='none'">
                  <span class="eu-party-name">${party}</span>
                </div>
                <div class="eu-party-stats">
                  <span class="eu-pct">${r.votes_pct}%</span>
                  <span class="eu-change ${changeClass}">(${sign}${r.change_pct}%)</span>
                  <span class="eu-seats">${r.seats} platser</span>
                </div>
                <div class="eu-bar" style="width: ${(r.votes_pct / 25) * 100}%; background: ${PARTY_COLORS[party]}"></div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="eu-vs-riksdag">
          <h4>EU-val vs riksdagsval</h4>
          <p class="eu-note">
            EU-valet hade betydligt lägre valdeltagande (53% vs 84%) vilket ofta gynnar mindre och mer
            engagerade partier. MP och V presterade bättre i EU-valet, medan SD backade jämfört med riksdagsvalet.
          </p>
        </div>

        <div class="eu-source">
          <a href="${eu.source_url}" target="_blank" rel="noopener">Källa: SVT Valresultat</a>
        </div>
      </div>
    `;
  }

  function renderLeaders() {
    return `
      <div class="history-leaders">
        <h3>Partiledarna</h3>

        <div class="leaders-grid">
          ${partiesData.map(party => `
            <div class="leader-card" style="--party-color: ${party.farg}">
              <div class="leader-header">
                <img src="./assets/logos/${party.id}.png" alt="${party.kortnamn}" class="leader-party-logo" loading="lazy" decoding="async" onerror="this.style.display='none'">
                <div class="leader-party-info">
                  <span class="leader-party-name">${party.namn}</span>
                  <span class="leader-opinion ${party.opinion_nu > party.valresultat_2022 ? 'up' : 'down'}">
                    ${party.opinion_nu}% ${party.opinion_nu > party.valresultat_2022 ? '↑' : '↓'}
                  </span>
                </div>
              </div>
              <div class="leader-body">
                <h4 class="leader-name">${party.ledare}</h4>
                <span class="leader-title">${party.ledare_titel} sedan ${formatLeaderDate(party.ledare_sedan)}</span>
                <p class="leader-background">${party.ledare_bakgrund}</p>
                ${party.ledare_utbildning ? `<p class="leader-education"><strong>Utbildning:</strong> ${party.ledare_utbildning}</p>` : ''}
              </div>
              ${party.risk_sparr ? '<div class="leader-warning">Under riksdagsspärren</div>' : ''}
            </div>
          `).join('')}
        </div>

        <div class="leaders-tenure">
          <h4>Tid som partiledare</h4>
          <div class="tenure-list">
            ${[...partiesData]
              .sort((a, b) => new Date(a.ledare_sedan) - new Date(b.ledare_sedan))
              .map(party => {
                const years = calculateTenure(party.ledare_sedan);
                return `
                  <div class="tenure-item" style="--party-color: ${party.farg}">
                    <span class="tenure-party">${party.kortnamn}</span>
                    <span class="tenure-name">${party.ledare.split('&')[0].trim()}</span>
                    <div class="tenure-bar" style="width: ${Math.min(years * 5, 100)}%"></div>
                    <span class="tenure-years">${years} år</span>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderConstituencies() {
    const consts = constituenciesData.constituencies;
    const sorted = [...consts].sort((a, b) => b.mandates_2022 - a.mandates_2022);

    return `
      <div class="history-constituencies">
        <h3>De 29 valkretsarna</h3>
        <p class="const-subtitle">
          ${constituenciesData.total_mandates} mandat totalt ·
          ${constituenciesData.fixed_mandates} fasta mandat ·
          ${constituenciesData.adjustment_mandates} utjämningsmandat
        </p>

        <div class="const-map-placeholder">
          <!-- SVG-karta kan läggas till här -->
          <div class="const-regions">
            ${Object.entries(constituenciesData.regions).map(([key, region]) => `
              <div class="const-region">
                <span class="region-name">${region.name}</span>
                <span class="region-mandates">${region.total_mandates} mandat</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="const-table-wrapper">
          <table class="const-table">
            <thead>
              <tr>
                <th>Valkrets</th>
                <th>Mandat</th>
                <th>Största parti</th>
                <th>S</th>
                <th>SD</th>
                <th>M</th>
              </tr>
            </thead>
            <tbody>
              ${sorted.map(c => `
                <tr>
                  <td class="const-name">${c.name}</td>
                  <td class="const-mandates">${c.mandates_2022}</td>
                  <td class="const-winner" style="color: ${PARTY_COLORS[c.largest_party_2022]}">${c.largest_party_2022}</td>
                  <td>${c.results_2022.S}%</td>
                  <td>${c.results_2022.SD}%</td>
                  <td>${c.results_2022.M}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="const-notes">
          ${constituenciesData.notes.map(n => `<p>${n}</p>`).join('')}
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    const tabs = document.querySelectorAll('.history-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeView = tab.dataset.view;
        updateContent();
      });
    });
  }

  function updateContent() {
    const content = document.getElementById('history-content');
    switch (activeView) {
      case 'comparison':
        content.innerHTML = renderComparison();
        break;
      case 'eu2024':
        content.innerHTML = renderEU2024();
        break;
      case 'leaders':
        content.innerHTML = renderLeaders();
        break;
      case 'constituencies':
        content.innerHTML = renderConstituencies();
        break;
    }
  }

  function formatLeaderDate(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  function calculateTenure(dateStr) {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
