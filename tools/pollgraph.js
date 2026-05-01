/**
 * Opinionsgraf
 * Interaktiv graf över opinionsutvecklingen över tid
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants (from shared/constants.js)
  // ==========================================================================

  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_NAMES = window.PARTY_NAMES;
  const THRESHOLD = window.RIKSDAG_THRESHOLD;

  // ==========================================================================
  // State
  // ==========================================================================

  let pollsData = null;
  let selectedParties = new Set(['S', 'SD', 'M', 'V', 'C', 'MP', 'KD', 'L']);
  let hoveredPoint = null;

  // ==========================================================================
  // SVG Rendering
  // ==========================================================================

  function createSVGElement(tag, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  }

  function renderGraph(container) {
    const data = pollsData.data;
    const parties = pollsData.parties.filter(p => selectedParties.has(p));

    // SVG dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 30, right: 120, bottom: 50, left: 50 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Scales
    const xScale = (i) => padding.left + (i / (data.length - 1)) * graphWidth;
    const yScale = (val) => padding.top + graphHeight - (val / 40) * graphHeight;

    // Create SVG
    const svg = createSVGElement('svg', {
      viewBox: `0 0 ${width} ${height}`,
      class: 'pollgraph-svg',
      role: 'img',
      'aria-label': 'Opinionsgraf som visar partiernas stöd över tid'
    });

    // Background
    const bg = createSVGElement('rect', {
      x: 0, y: 0, width, height,
      fill: 'var(--color-bg-card)'
    });
    svg.appendChild(bg);

    // Grid lines
    for (let i = 0; i <= 40; i += 10) {
      const y = yScale(i);
      const line = createSVGElement('line', {
        x1: padding.left, y1: y,
        x2: width - padding.right, y2: y,
        stroke: 'var(--color-border)',
        'stroke-width': 1,
        'stroke-dasharray': i === 0 ? 'none' : '4,4'
      });
      svg.appendChild(line);

      const label = createSVGElement('text', {
        x: padding.left - 10,
        y: y + 4,
        'text-anchor': 'end',
        fill: 'var(--color-text-muted)',
        'font-size': '12px'
      });
      label.textContent = `${i}%`;
      svg.appendChild(label);
    }

    // Threshold line (4%)
    const thresholdY = yScale(THRESHOLD);
    const thresholdLine = createSVGElement('line', {
      x1: padding.left, y1: thresholdY,
      x2: width - padding.right, y2: thresholdY,
      stroke: 'var(--color-error)',
      'stroke-width': 2,
      'stroke-dasharray': '8,4'
    });
    svg.appendChild(thresholdLine);

    const thresholdLabel = createSVGElement('text', {
      x: padding.left + 5,
      y: thresholdY - 5,
      fill: 'var(--color-error)',
      'font-size': '11px',
      'font-weight': '600'
    });
    thresholdLabel.textContent = '4% spärren';
    svg.appendChild(thresholdLabel);

    // X-axis labels
    data.forEach((point, i) => {
      if (i % 3 === 0 || point.label) {
        const x = xScale(i);
        const label = createSVGElement('text', {
          x: x,
          y: height - padding.bottom + 20,
          'text-anchor': 'middle',
          fill: 'var(--color-text-muted)',
          'font-size': '11px'
        });
        label.textContent = formatDate(point.date);
        svg.appendChild(label);

        if (point.label) {
          const eventLabel = createSVGElement('text', {
            x: x,
            y: height - padding.bottom + 35,
            'text-anchor': 'middle',
            fill: 'var(--color-accent)',
            'font-size': '10px',
            'font-weight': '600'
          });
          eventLabel.textContent = point.label;
          svg.appendChild(eventLabel);
        }
      }
    });

    // Draw lines for each party
    parties.forEach(partyId => {
      const points = data.map((point, i) => ({
        x: xScale(i),
        y: yScale(point.values[partyId] || 0),
        value: point.values[partyId] || 0,
        date: point.date
      }));

      // Line
      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const path = createSVGElement('path', {
        d: pathData,
        fill: 'none',
        stroke: PARTY_COLORS[partyId],
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      });
      svg.appendChild(path);

      // End point with logo
      const lastPoint = points[points.length - 1];
      const endCircle = createSVGElement('circle', {
        cx: lastPoint.x,
        cy: lastPoint.y,
        r: 6,
        fill: PARTY_COLORS[partyId],
        stroke: 'var(--color-bg-card)',
        'stroke-width': 2
      });
      svg.appendChild(endCircle);
    });

    // Legend
    const legendStartY = padding.top;
    parties.forEach((partyId, i) => {
      const y = legendStartY + i * 22;
      const x = width - padding.right + 15;

      const circle = createSVGElement('circle', {
        cx: x,
        cy: y,
        r: 6,
        fill: PARTY_COLORS[partyId]
      });
      svg.appendChild(circle);

      const text = createSVGElement('text', {
        x: x + 12,
        y: y + 4,
        fill: 'var(--color-text)',
        'font-size': '12px'
      });
      text.textContent = partyId;
      svg.appendChild(text);

      const value = pollsData.data[pollsData.data.length - 1].values[partyId];
      const valueText = createSVGElement('text', {
        x: x + 35,
        y: y + 4,
        fill: 'var(--color-text-muted)',
        'font-size': '12px'
      });
      valueText.textContent = `${value}%`;
      svg.appendChild(valueText);
    });

    return svg;
  }

  function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  }

  // ==========================================================================
  // Render UI
  // ==========================================================================

  function render(container) {
    container.innerHTML = `
      <div class="pollgraph-wrapper">
        <!-- Party filter -->
        <div class="pollgraph-filter">
          <span class="pollgraph-filter-label">Visa partier:</span>
          <div class="pollgraph-filter-buttons">
            ${pollsData.parties.map(partyId => `
              <button class="pollgraph-filter-btn ${selectedParties.has(partyId) ? 'is-active' : ''}"
                data-party="${partyId}"
                style="--party-color: ${PARTY_COLORS[partyId]}">
                <img src="assets/logos/${partyId}.png" alt="${partyId}" class="pollgraph-filter-logo" loading="lazy" decoding="async" width="48" height="48">
                <span>${partyId}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Graph -->
        <div class="pollgraph-container" id="pollgraph-svg">
          <!-- SVG rendered here -->
        </div>

        <!-- Info -->
        <div class="pollgraph-info">
          <p>
            Datakälla: Poll of Polls-sammanvägning. Den streckade linjen markerar riksdagsspärren på 4%.
          </p>
        </div>
      </div>
    `;

    // Render SVG
    const svgContainer = container.querySelector('#pollgraph-svg');
    svgContainer.appendChild(renderGraph(svgContainer));

    // Event listeners
    container.querySelectorAll('.pollgraph-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const partyId = btn.dataset.party;
        if (selectedParties.has(partyId)) {
          if (selectedParties.size > 1) {
            selectedParties.delete(partyId);
          }
        } else {
          selectedParties.add(partyId);
        }
        render(container);
      });
    });
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initPollGraph() {
    const container = document.getElementById('pollgraph-container');
    if (!container) return;

    try {
      const response = await fetch('data/polls-history.json');
      pollsData = await response.json();
    } catch (error) {
      console.error('Error loading polls history:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda opinionsdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    render(container);
    console.log('Poll graph initialized');
  }

  // Export for global access
  window.initPollGraph = initPollGraph;

})();
