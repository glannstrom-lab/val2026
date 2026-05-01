/**
 * Tidslinje
 * Horisontell/vertikal tidslinje över politiska händelser 2022-2026
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;

  const MONTHS_SV = [
    'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
  ];

  // ==========================================================================
  // State
  // ==========================================================================

  let timelineData = null;
  let selectedTypes = new Set(); // Empty = all selected
  let selectedParties = new Set(); // Empty = all selected
  let expandedEvent = null;

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  async function loadData() {
    try {
      const response = await fetch('data/timeline.json');
      timelineData = await response.json();
      return true;
    } catch (error) {
      console.error('Error loading timeline data:', error);
      return false;
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = MONTHS_SV[date.getMonth()];
    const year = date.getFullYear();
    return { day, month, year, full: `${day} ${month} ${year}` };
  }

  function getYearFromDate(dateStr) {
    return new Date(dateStr).getFullYear();
  }

  function filterEvents() {
    let events = [...timelineData.events];

    // Filter by type
    if (selectedTypes.size > 0) {
      events = events.filter(e => selectedTypes.has(e.type));
    }

    // Filter by party
    if (selectedParties.size > 0) {
      events = events.filter(e => e.party === null || selectedParties.has(e.party));
    }

    return events;
  }

  function groupEventsByYear(events) {
    const groups = {};
    events.forEach(event => {
      const year = getYearFromDate(event.date);
      if (!groups[year]) groups[year] = [];
      groups[year].push(event);
    });
    return groups;
  }

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render(container) {
    const filteredEvents = filterEvents();
    const eventsByYear = groupEventsByYear(filteredEvents);
    const years = Object.keys(eventsByYear).sort();

    container.innerHTML = `
      <div class="timeline-wrapper">
        <!-- Filters -->
        <div class="timeline-filters">
          <!-- Type filter -->
          <div class="timeline-filter-group">
            <span class="timeline-filter-label">Typ:</span>
            <div class="timeline-filter-buttons">
              <button class="timeline-filter-btn ${selectedTypes.size === 0 ? 'is-active' : ''}" data-type="all">
                Alla
              </button>
              ${Object.entries(timelineData.eventTypes).map(([typeId, type]) => `
                <button class="timeline-filter-btn ${selectedTypes.has(typeId) ? 'is-active' : ''}"
                  data-type="${typeId}"
                  style="--filter-color: ${type.color}">
                  <span class="timeline-filter-icon">${type.icon}</span>
                  <span class="timeline-filter-text">${type.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Party filter -->
          <div class="timeline-filter-group">
            <span class="timeline-filter-label">Parti:</span>
            <div class="timeline-filter-buttons">
              <button class="timeline-filter-btn ${selectedParties.size === 0 ? 'is-active' : ''}" data-party="all">
                Alla
              </button>
              ${Object.entries(PARTY_COLORS).map(([partyId, color]) => `
                <button class="timeline-filter-btn party-btn ${selectedParties.has(partyId) ? 'is-active' : ''}"
                  data-party="${partyId}"
                  style="--filter-color: ${color}"
                  title="${PARTY_NAMES[partyId]}">
                  ${partyId}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-container">
          <div class="timeline-track">
            ${years.map(year => renderYear(year, eventsByYear[year])).join('')}
          </div>
        </div>

        <!-- Event count -->
        <div class="timeline-meta">
          <span>Visar ${filteredEvents.length} av ${timelineData.events.length} händelser</span>
        </div>
      </div>
    `;

    initEventHandlers(container);
  }

  function renderYear(year, events) {
    return `
      <div class="timeline-year" data-year="${year}">
        <div class="timeline-year-label">${year}</div>
        <div class="timeline-year-events">
          ${events.map(event => renderEvent(event)).join('')}
        </div>
      </div>
    `;
  }

  function renderEvent(event) {
    const date = formatDate(event.date);
    const type = timelineData.eventTypes[event.type];
    const isExpanded = expandedEvent === event.id;
    const partyColor = event.party ? PARTY_COLORS[event.party] : null;

    return `
      <article class="timeline-event ${isExpanded ? 'is-expanded' : ''}"
        data-event="${event.id}"
        style="--event-color: ${type?.color || '#666'}">

        <div class="timeline-event-marker">
          <span class="timeline-event-icon">${type?.icon || '•'}</span>
        </div>

        <div class="timeline-event-content">
          <header class="timeline-event-header">
            <time class="timeline-event-date" datetime="${event.date}">
              <span class="date-day">${date.day}</span>
              <span class="date-month">${date.month}</span>
            </time>

            <div class="timeline-event-title-wrap">
              <h3 class="timeline-event-title">${event.title}</h3>
              <div class="timeline-event-meta">
                <span class="timeline-event-type" style="background: ${type?.color || '#666'}">
                  ${type?.label || event.type}
                </span>
                ${event.party ? `
                  <span class="timeline-event-party" style="background: ${partyColor}">
                    <img src="assets/logos/${event.party}.png" alt="${event.party}" class="timeline-party-logo" loading="lazy" decoding="async">
                    ${event.party}
                  </span>
                ` : ''}
              </div>
            </div>

            <button class="timeline-event-toggle" aria-expanded="${isExpanded}" aria-label="Visa detaljer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 6 8 10 12 6"></polyline>
              </svg>
            </button>
          </header>

          <div class="timeline-event-details">
            <p class="timeline-event-summary">${event.summary}</p>
            <a href="${event.source_url}" target="_blank" rel="noopener" class="timeline-event-source">
              Källa: ${event.source_name} →
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function initEventHandlers(container) {
    // Type filter
    container.querySelectorAll('.timeline-filter-btn[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;

        if (type === 'all') {
          selectedTypes.clear();
        } else {
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else {
            selectedTypes.add(type);
          }
        }

        render(container);
      });
    });

    // Party filter
    container.querySelectorAll('.timeline-filter-btn[data-party]').forEach(btn => {
      btn.addEventListener('click', () => {
        const party = btn.dataset.party;

        if (party === 'all') {
          selectedParties.clear();
        } else {
          if (selectedParties.has(party)) {
            selectedParties.delete(party);
          } else {
            selectedParties.add(party);
          }
        }

        render(container);
      });
    });

    // Event expansion
    container.querySelectorAll('.timeline-event-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking a link
        if (e.target.closest('a')) return;

        const eventEl = header.closest('.timeline-event');
        const eventId = eventEl.dataset.event;

        expandedEvent = expandedEvent === eventId ? null : eventId;

        // Toggle this event
        container.querySelectorAll('.timeline-event').forEach(el => {
          el.classList.toggle('is-expanded', el.dataset.event === expandedEvent);
          el.querySelector('.timeline-event-toggle')?.setAttribute('aria-expanded', el.dataset.event === expandedEvent);
        });
      });
    });

    // Keyboard support
    container.querySelectorAll('.timeline-event-toggle').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.closest('.timeline-event-header').click();
        }
      });
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const loaded = await loadData();
    if (!loaded) {
      container.innerHTML = '<div class="error">Kunde inte ladda tidslinjedata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    render(container);

    console.log('Timeline initialized');
  }

  // Export for global access
  window.initTimeline = initTimeline;

})();
