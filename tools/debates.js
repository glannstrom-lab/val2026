/**
 * Debattkalender
 * Visar kommande och tidigare valdebatter
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;

  const MONTHS_SV = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];

  const WEEKDAYS_SV = [
    'söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'
  ];

  const TYPE_ICONS = {
    tv: '📺',
    radio: '📻',
    stream: '💻'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let debatesData = null;
  let filterType = 'all'; // all, upcoming, past

  // ==========================================================================
  // Helpers
  // ==========================================================================

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const weekday = WEEKDAYS_SV[date.getDay()];
    const day = date.getDate();
    const month = MONTHS_SV[date.getMonth()];
    return `${weekday} ${day} ${month}`;
  }

  function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  }

  function getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getDaysUntilText(days) {
    if (days === 0) return 'Idag!';
    if (days === 1) return 'Imorgon';
    if (days < 0) return `${Math.abs(days)} dagar sedan`;
    if (days <= 7) return `Om ${days} dagar`;
    if (days <= 14) return 'Nästa vecka';
    if (days <= 30) return `Om ${Math.ceil(days / 7)} veckor`;
    return `Om ${Math.ceil(days / 30)} månader`;
  }

  function isUpcoming(dateStr) {
    return getDaysUntil(dateStr) >= 0;
  }

  function sortByDate(a, b, ascending = true) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    if (!debatesData) {
      container.innerHTML = '<div class="error">Kunde inte ladda debattdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    const debates = debatesData.debates;
    const upcomingDebates = debates.filter(d => isUpcoming(d.date)).sort((a, b) => sortByDate(a, b, true));
    const pastDebates = debates.filter(d => !isUpcoming(d.date)).sort((a, b) => sortByDate(a, b, false));

    // Find next debate
    const nextDebate = upcomingDebates[0];
    const daysUntilNext = nextDebate ? getDaysUntil(nextDebate.date) : null;

    container.innerHTML = `
      <!-- Countdown to next debate -->
      ${nextDebate ? `
        <div class="debates-countdown">
          <div class="debates-countdown-content">
            <div class="debates-countdown-label">Nästa debatt</div>
            <div class="debates-countdown-title">${nextDebate.title}</div>
            <div class="debates-countdown-meta">
              <span class="debates-countdown-date">${formatDate(nextDebate.date)}</span>
              <span class="debates-countdown-time">${nextDebate.time}</span>
              <span class="debates-countdown-channel">${TYPE_ICONS[nextDebate.type]} ${nextDebate.channel}</span>
            </div>
            <div class="debates-countdown-days ${daysUntilNext <= 7 ? 'debates-countdown-days--soon' : ''}">
              ${getDaysUntilText(daysUntilNext)}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Filter -->
      <div class="debates-filter">
        <button class="debates-filter-btn ${filterType === 'all' ? 'is-active' : ''}" data-filter="all">
          Alla (${debates.length})
        </button>
        <button class="debates-filter-btn ${filterType === 'upcoming' ? 'is-active' : ''}" data-filter="upcoming">
          Kommande (${upcomingDebates.length})
        </button>
        <button class="debates-filter-btn ${filterType === 'past' ? 'is-active' : ''}" data-filter="past">
          Tidigare (${pastDebates.length})
        </button>
      </div>

      <!-- Debates List -->
      <div class="debates-list">
        ${filterType !== 'past' && upcomingDebates.length > 0 ? `
          <div class="debates-section">
            <h2 class="debates-section-title">Kommande debatter</h2>
            <div class="debates-grid">
              ${upcomingDebates.map(debate => renderDebateCard(debate, true)).join('')}
            </div>
          </div>
        ` : ''}

        ${filterType !== 'upcoming' && pastDebates.length > 0 ? `
          <div class="debates-section">
            <h2 class="debates-section-title">Tidigare debatter</h2>
            <div class="debates-grid">
              ${pastDebates.map(debate => renderDebateCard(debate, false)).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Info -->
      <div class="debates-info">
        <h3>Om debatterna</h3>
        <p>Valdebatterna är ett viktigt tillfälle att se partiledarna argumentera för sin politik och bemöta varandras kritik. De flesta debatter sänds i SVT och kan ses i efterhand på <a href="https://www.svtplay.se" target="_blank" rel="noopener">SVT Play</a>.</p>
        <p><strong>Tips:</strong> Använd vår <a href="quiz.html">valkompass</a> för att se vilket parti som passar dig bäst!</p>
      </div>
    `;

    // Attach filter listeners
    container.querySelectorAll('.debates-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterType = btn.dataset.filter;
        render(container);
      });
    });
  }

  function renderDebateCard(debate, isUpcoming) {
    const daysUntil = getDaysUntil(debate.date);
    const channelInfo = debatesData.channels[debate.channel] || { color: '#666' };

    return `
      <article class="debate-card ${isUpcoming ? 'debate-card--upcoming' : 'debate-card--past'}">
        <div class="debate-card-header">
          <div class="debate-card-date-badge">
            <span class="debate-card-day">${new Date(debate.date).getDate()}</span>
            <span class="debate-card-month">${MONTHS_SV[new Date(debate.date).getMonth()].substring(0, 3)}</span>
          </div>
          <div class="debate-card-channel" style="--channel-color: ${channelInfo.color}">
            ${TYPE_ICONS[debate.type]} ${debate.channel}
          </div>
        </div>

        <h3 class="debate-card-title">${debate.title}</h3>
        <p class="debate-card-desc">${debate.description}</p>

        <div class="debate-card-meta">
          <div class="debate-card-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${debate.time}–${debate.endTime}
          </div>
          <div class="debate-card-countdown">
            ${isUpcoming ? getDaysUntilText(daysUntil) : 'Avslutad'}
          </div>
        </div>

        <div class="debate-card-topics">
          ${debate.topics.map(topic => `<span class="debate-card-topic">${topic}</span>`).join('')}
        </div>

        <div class="debate-card-participants">
          <span class="debate-card-participants-label">Deltagare:</span>
          <div class="debate-card-parties">
            ${debate.participants.map(id => `
              <span class="debate-card-party" style="background: ${PARTY_COLORS[id]}" title="${PARTY_NAMES[id]}">
                ${id}
              </span>
            `).join('')}
          </div>
        </div>

        ${debate.link && !isUpcoming ? `
          <a href="${debate.link}" target="_blank" rel="noopener" class="debate-card-link">
            Se i efterhand →
          </a>
        ` : ''}

        ${isUpcoming && daysUntil <= 1 ? `
          <div class="debate-card-reminder">
            Missa inte!
          </div>
        ` : ''}
      </article>
    `;
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function init() {
    const container = document.getElementById('debates-container');
    if (!container) return;

    try {
      const res = await fetch('data/debates.json');
      debatesData = await res.json();
      render(container);
      console.log('Debates calendar initialized');
    } catch (error) {
      console.error('Error loading debates:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda debattdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
    }
  }

  window.initDebates = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
