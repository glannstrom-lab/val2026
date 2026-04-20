/**
 * Riksdagsröstningar för Val 2026
 * Visar hur partierna har röstat i viktiga frågor
 */

(function() {
  'use strict';

  const PARTY_ORDER = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];
  const PARTY_COLORS = {
    'V': '#AF0000',
    'S': '#E8112D',
    'MP': '#83CF39',
    'C': '#009933',
    'L': '#006AB3',
    'KD': '#1F3C81',
    'M': '#1B49DD',
    'SD': '#DDDD00'
  };

  let votesData = null;
  let activeCategory = 'all';
  let activePartyFilter = null;

  async function init() {
    const container = document.getElementById('votes-container');
    if (!container) return;

    try {
      const response = await fetch('./data/votes.json');
      votesData = await response.json();
      render(container);
    } catch (error) {
      console.error('Could not load votes data:', error);
      container.innerHTML = '<p class="error">Kunde inte ladda röstningsdata.</p>';
    }
  }

  function render(container) {
    container.innerHTML = `
      <div class="votes-wrapper">
        <!-- Filters -->
        <div class="votes-filters">
          <div class="votes-filter-group">
            <label>Kategori:</label>
            <select id="votes-category-filter" class="votes-select">
              <option value="all">Alla kategorier</option>
              ${Object.entries(votesData.categories).map(([key, label]) =>
                `<option value="${key}">${label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="votes-filter-group">
            <label>Visa voteringar med:</label>
            <div class="votes-tag-filters">
              <button class="votes-tag-btn active" data-tag="all">Alla</button>
              <button class="votes-tag-btn" data-tag="blocköverskridande">Blocköverskridande</button>
              <button class="votes-tag-btn" data-tag="blockskiljande">Blockskiljande</button>
              <button class="votes-tag-btn" data-tag="bred enighet">Bred enighet</button>
            </div>
          </div>
        </div>

        <!-- Stats summary -->
        <div class="votes-stats" id="votes-stats"></div>

        <!-- Vote list -->
        <div class="votes-list" id="votes-list"></div>

        <!-- Party comparison -->
        <div class="votes-party-comparison" id="votes-party-comparison">
          <h3>Partiernas röstbeteende</h3>
          <p class="votes-comparison-hint">Klicka på ett parti för att se deras röstbeteende i detalj.</p>
          <div class="votes-party-grid" id="votes-party-grid"></div>
        </div>

        <!-- Disclaimer -->
        <div class="votes-disclaimer">
          <p>
            <strong>Källa:</strong> Riksdagens öppna data (data.riksdagen.se).
            Röstningarna visar partiernas ställningstaganden i utskottsbetänkanden.
            Varje votering kan innehålla flera förslagspunkter med olika ställningstaganden.
          </p>
        </div>
      </div>
    `;

    renderVotesList();
    renderPartyComparison();
    renderStats();
    attachEventListeners();
  }

  function renderVotesList() {
    const list = document.getElementById('votes-list');
    const votes = getFilteredVotes();

    if (votes.length === 0) {
      list.innerHTML = '<p class="votes-empty">Inga voteringar matchar filtret.</p>';
      return;
    }

    list.innerHTML = votes.map(vote => `
      <article class="vote-card" data-id="${vote.id}">
        <header class="vote-header">
          <div class="vote-meta">
            <span class="vote-date">${formatDate(vote.date)}</span>
            <span class="vote-committee">${votesData.committees[vote.committee] || vote.committee}</span>
            <span class="vote-category">${votesData.categories[vote.category] || vote.category}</span>
          </div>
          <h4 class="vote-title">${vote.title}</h4>
          <p class="vote-description">${vote.description}</p>
          ${vote.tags ? `
            <div class="vote-tags">
              ${vote.tags.map(tag => `<span class="vote-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </header>

        <div class="vote-breakdown">
          ${renderVoteBreakdown(vote.breakdown)}
        </div>

        <footer class="vote-footer">
          <span class="vote-result ${vote.result === 'bifall' ? 'vote-result-passed' : 'vote-result-rejected'}">
            ${vote.result === 'bifall' ? 'Bifallet' : 'Avslaget'}
          </span>
          <a href="${vote.source_url}" target="_blank" rel="noopener" class="vote-source">
            Se på riksdagen.se
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </footer>
      </article>
    `).join('');
  }

  function renderVoteBreakdown(breakdown) {
    const maxVotes = Math.max(
      ...PARTY_ORDER.map(party => {
        const b = breakdown[party];
        return b ? b.ja + b.nej + b.avstar : 0;
      })
    );

    return `
      <div class="breakdown-grid">
        ${PARTY_ORDER.map(party => {
          const b = breakdown[party];
          if (!b) return '';
          const total = b.ja + b.nej + b.avstar;
          const jaPercent = total > 0 ? (b.ja / total) * 100 : 0;
          const nejPercent = total > 0 ? (b.nej / total) * 100 : 0;
          const avstarPercent = total > 0 ? (b.avstar / total) * 100 : 0;

          let stance = 'neutral';
          if (jaPercent > 90) stance = 'ja';
          else if (nejPercent > 90) stance = 'nej';
          else if (avstarPercent > 90) stance = 'avstar';
          else if (jaPercent > 50) stance = 'ja-partial';
          else if (nejPercent > 50) stance = 'nej-partial';

          return `
            <div class="breakdown-party ${stance}" style="--party-color: ${PARTY_COLORS[party]}">
              <span class="breakdown-party-name">${party}</span>
              <div class="breakdown-bar">
                <div class="breakdown-ja" style="width: ${jaPercent}%" title="Ja: ${b.ja}"></div>
                <div class="breakdown-nej" style="width: ${nejPercent}%" title="Nej: ${b.nej}"></div>
                <div class="breakdown-avstar" style="width: ${avstarPercent}%" title="Avstår: ${b.avstar}"></div>
              </div>
              <span class="breakdown-summary">
                ${b.ja > 0 ? `<span class="ja">${b.ja} Ja</span>` : ''}
                ${b.nej > 0 ? `<span class="nej">${b.nej} Nej</span>` : ''}
                ${b.avstar > 0 ? `<span class="avstar">${b.avstar} Avst</span>` : ''}
              </span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="breakdown-legend">
        <span class="legend-item ja">Ja</span>
        <span class="legend-item nej">Nej</span>
        <span class="legend-item avstar">Avstår</span>
      </div>
    `;
  }

  function renderPartyComparison() {
    const grid = document.getElementById('votes-party-grid');
    const votes = votesData.votes;

    // Calculate agreement percentages between parties
    const partyStats = {};
    PARTY_ORDER.forEach(party => {
      partyStats[party] = {
        jaCount: 0,
        nejCount: 0,
        avstarCount: 0,
        total: 0
      };
    });

    votes.forEach(vote => {
      PARTY_ORDER.forEach(party => {
        const b = vote.breakdown[party];
        if (b) {
          if (b.ja > b.nej && b.ja > b.avstar) partyStats[party].jaCount++;
          else if (b.nej > b.ja && b.nej > b.avstar) partyStats[party].nejCount++;
          else if (b.avstar > 0) partyStats[party].avstarCount++;
          partyStats[party].total++;
        }
      });
    });

    grid.innerHTML = PARTY_ORDER.map(party => {
      const stats = partyStats[party];
      const jaPercent = stats.total > 0 ? Math.round((stats.jaCount / stats.total) * 100) : 0;
      const nejPercent = stats.total > 0 ? Math.round((stats.nejCount / stats.total) * 100) : 0;

      return `
        <div class="party-stat-card" style="--party-color: ${PARTY_COLORS[party]}">
          <div class="party-stat-logo">
            <img src="./assets/logos/${party}.png" alt="${party}" loading="lazy" decoding="async" onerror="this.style.display='none'">
            <span class="party-stat-name">${party}</span>
          </div>
          <div class="party-stat-bars">
            <div class="party-stat-bar">
              <span class="party-stat-label">Med regeringen</span>
              <div class="party-stat-fill ja" style="width: ${jaPercent}%"></div>
              <span class="party-stat-value">${jaPercent}%</span>
            </div>
            <div class="party-stat-bar">
              <span class="party-stat-label">Mot regeringen</span>
              <div class="party-stat-fill nej" style="width: ${nejPercent}%"></div>
              <span class="party-stat-value">${nejPercent}%</span>
            </div>
          </div>
          <div class="party-stat-count">${stats.total} voteringar</div>
        </div>
      `;
    }).join('');
  }

  function renderStats() {
    const statsEl = document.getElementById('votes-stats');
    const votes = getFilteredVotes();

    // Count unanimous votes
    const unanimousCount = votes.filter(vote => {
      const stances = PARTY_ORDER.map(party => {
        const b = vote.breakdown[party];
        if (!b) return null;
        if (b.ja > b.nej && b.ja > b.avstar) return 'ja';
        if (b.nej > b.ja) return 'nej';
        return 'avstar';
      }).filter(s => s !== null);
      return new Set(stances).size === 1;
    }).length;

    // Count block-breaking votes
    const blockBreakingCount = votes.filter(vote =>
      vote.tags && vote.tags.some(tag =>
        tag.includes('blocköverskridande') || tag.includes('avviker')
      )
    ).length;

    statsEl.innerHTML = `
      <div class="votes-stat">
        <span class="stat-number">${votes.length}</span>
        <span class="stat-label">voteringar</span>
      </div>
      <div class="votes-stat">
        <span class="stat-number">${unanimousCount}</span>
        <span class="stat-label">enhälliga</span>
      </div>
      <div class="votes-stat">
        <span class="stat-number">${blockBreakingCount}</span>
        <span class="stat-label">blockbrytande</span>
      </div>
    `;
  }

  function getFilteredVotes() {
    let votes = [...votesData.votes];

    // Filter by category
    if (activeCategory !== 'all') {
      votes = votes.filter(v => v.category === activeCategory);
    }

    // Filter by tag
    const activeTagBtn = document.querySelector('.votes-tag-btn.active');
    if (activeTagBtn && activeTagBtn.dataset.tag !== 'all') {
      const tag = activeTagBtn.dataset.tag;
      votes = votes.filter(v => v.tags && v.tags.some(t => t.includes(tag)));
    }

    return votes;
  }

  function attachEventListeners() {
    // Category filter
    const categorySelect = document.getElementById('votes-category-filter');
    categorySelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      renderVotesList();
      renderStats();
    });

    // Tag filters
    const tagBtns = document.querySelectorAll('.votes-tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tagBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderVotesList();
        renderStats();
      });
    });
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
