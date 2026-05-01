/**
 * Politisk Kompass
 * 2D-visualisering av partiernas positioner
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const GRID_SIZE = 10; // -10 to +10 on both axes
  const SVG_PADDING = 1.5;
  const PARTY_RADIUS = 0.8;

  // From shared/constants.js
  const PARTY_COLORS = window.PARTY_COLORS;
  const PARTY_TEXT_COLORS = window.PARTY_TEXT_COLORS;

  const COALITION_COLORS = {
    regering: 'rgba(74, 158, 255, 0.3)',
    opposition: 'rgba(160, 160, 160, 0.3)'
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let compassData = null;
  let partiesData = null;
  let showCoalitions = false;
  let activeTooltip = null;

  // ==========================================================================
  // SVG Helpers
  // ==========================================================================

  function createSVGElement(tag, attributes = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  }

  // ==========================================================================
  // Compass Rendering
  // ==========================================================================

  function renderCompassSVG(container) {
    const viewBoxSize = (GRID_SIZE + SVG_PADDING) * 2;
    const viewBoxStart = -(GRID_SIZE + SVG_PADDING);

    const svg = createSVGElement('svg', {
      viewBox: `${viewBoxStart} ${viewBoxStart} ${viewBoxSize} ${viewBoxSize}`,
      class: 'compass-svg',
      role: 'img',
      'aria-label': 'Politisk kompass som visar partiernas positioner'
    });

    // Background
    const bg = createSVGElement('rect', {
      x: viewBoxStart,
      y: viewBoxStart,
      width: viewBoxSize,
      height: viewBoxSize,
      fill: 'var(--color-bg-card)'
    });
    svg.appendChild(bg);

    // Grid
    renderGrid(svg);

    // Axes
    renderAxes(svg);

    // Quadrant labels
    renderQuadrantLabels(svg);

    // Coalition backgrounds (hidden by default)
    renderCoalitionBackgrounds(svg);

    // Party markers
    renderPartyMarkers(svg);

    container.appendChild(svg);
    return svg;
  }

  function renderGrid(svg) {
    const gridGroup = createSVGElement('g', { class: 'compass-grid' });

    // Vertical lines
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x += 2) {
      const line = createSVGElement('line', {
        x1: x,
        y1: -GRID_SIZE,
        x2: x,
        y2: GRID_SIZE,
        stroke: 'var(--color-border-subtle)',
        'stroke-width': x === 0 ? 0 : 0.05
      });
      gridGroup.appendChild(line);
    }

    // Horizontal lines
    for (let y = -GRID_SIZE; y <= GRID_SIZE; y += 2) {
      const line = createSVGElement('line', {
        x1: -GRID_SIZE,
        y1: y,
        x2: GRID_SIZE,
        y2: y,
        stroke: 'var(--color-border-subtle)',
        'stroke-width': y === 0 ? 0 : 0.05
      });
      gridGroup.appendChild(line);
    }

    svg.appendChild(gridGroup);
  }

  function renderAxes(svg) {
    const axesGroup = createSVGElement('g', { class: 'compass-axes' });

    // X-axis (horizontal)
    const xAxis = createSVGElement('line', {
      x1: -GRID_SIZE,
      y1: 0,
      x2: GRID_SIZE,
      y2: 0,
      stroke: 'var(--color-text-muted)',
      'stroke-width': 0.08
    });
    axesGroup.appendChild(xAxis);

    // X-axis arrow
    const xArrow = createSVGElement('polygon', {
      points: `${GRID_SIZE},0 ${GRID_SIZE - 0.4},0.25 ${GRID_SIZE - 0.4},-0.25`,
      fill: 'var(--color-text-muted)'
    });
    axesGroup.appendChild(xArrow);

    // Y-axis (vertical)
    const yAxis = createSVGElement('line', {
      x1: 0,
      y1: -GRID_SIZE,
      x2: 0,
      y2: GRID_SIZE,
      stroke: 'var(--color-text-muted)',
      'stroke-width': 0.08
    });
    axesGroup.appendChild(yAxis);

    // Y-axis arrow (pointing up = authoritarian)
    const yArrow = createSVGElement('polygon', {
      points: `0,${GRID_SIZE} 0.25,${GRID_SIZE - 0.4} -0.25,${GRID_SIZE - 0.4}`,
      fill: 'var(--color-text-muted)'
    });
    axesGroup.appendChild(yArrow);

    // Axis labels
    const labels = [
      { text: 'VÄNSTER', x: -GRID_SIZE + 1, y: 0.6, anchor: 'start' },
      { text: 'HÖGER', x: GRID_SIZE - 1, y: 0.6, anchor: 'end' },
      { text: 'LIBERAL', x: 0, y: -GRID_SIZE + 0.8, anchor: 'middle' },
      { text: 'AUKTORITÄR', x: 0, y: GRID_SIZE - 0.4, anchor: 'middle' }
    ];

    labels.forEach(label => {
      const text = createSVGElement('text', {
        x: label.x,
        y: label.y,
        'text-anchor': label.anchor,
        'font-size': '0.55',
        'font-family': 'var(--font-display)',
        'font-weight': '600',
        fill: 'var(--color-text-subtle)',
        'letter-spacing': '0.1'
      });
      text.textContent = label.text;
      axesGroup.appendChild(text);
    });

    svg.appendChild(axesGroup);
  }

  function renderQuadrantLabels(svg) {
    const labelsGroup = createSVGElement('g', { class: 'compass-quadrant-labels' });

    const quadrants = [
      { text: 'Vänsterliberal', x: -5, y: -5 },
      { text: 'Högerliberal', x: 5, y: -5 },
      { text: 'Vänsterauktoritär', x: -5, y: 5 },
      { text: 'Högerauktoritär', x: 5, y: 5 }
    ];

    quadrants.forEach(q => {
      const text = createSVGElement('text', {
        x: q.x,
        y: q.y,
        'text-anchor': 'middle',
        'font-size': '0.4',
        'font-family': 'var(--font-body)',
        fill: 'var(--color-text-subtle)',
        opacity: '0.5'
      });
      text.textContent = q.text;
      labelsGroup.appendChild(text);
    });

    svg.appendChild(labelsGroup);
  }

  function renderCoalitionBackgrounds(svg) {
    const coalitionGroup = createSVGElement('g', {
      class: 'compass-coalitions',
      style: 'display: none;'
    });

    // We'll draw convex hulls or circles around party groups
    // For simplicity, we'll use ellipses around the two blocks

    // Tidö-regeringen (M, SD, KD, L) - right side
    const tidoEllipse = createSVGElement('ellipse', {
      cx: 4.5,
      cy: 2.5,
      rx: 3.5,
      ry: 5.5,
      fill: COALITION_COLORS.regering,
      stroke: 'var(--color-accent)',
      'stroke-width': 0.1,
      'stroke-dasharray': '0.3 0.2',
      class: 'coalition-tido'
    });
    coalitionGroup.appendChild(tidoEllipse);

    // Opposition (V, S, MP, C) - left side
    const oppositionEllipse = createSVGElement('ellipse', {
      cx: -4,
      cy: -2,
      rx: 4.5,
      ry: 5,
      fill: COALITION_COLORS.opposition,
      stroke: 'var(--color-text-muted)',
      'stroke-width': 0.1,
      'stroke-dasharray': '0.3 0.2',
      class: 'coalition-opposition'
    });
    coalitionGroup.appendChild(oppositionEllipse);

    // Labels
    const tidoLabel = createSVGElement('text', {
      x: 4.5,
      y: -3.5,
      'text-anchor': 'middle',
      'font-size': '0.5',
      'font-family': 'var(--font-display)',
      'font-weight': '600',
      fill: 'var(--color-accent)'
    });
    tidoLabel.textContent = 'Tidöpartierna';
    coalitionGroup.appendChild(tidoLabel);

    const oppLabel = createSVGElement('text', {
      x: -4,
      y: 4,
      'text-anchor': 'middle',
      'font-size': '0.5',
      'font-family': 'var(--font-display)',
      'font-weight': '600',
      fill: 'var(--color-text-muted)'
    });
    oppLabel.textContent = 'Opposition';
    coalitionGroup.appendChild(oppLabel);

    svg.appendChild(coalitionGroup);
  }

  function renderPartyMarkers(svg) {
    const markersGroup = createSVGElement('g', { class: 'compass-markers' });

    compassData.positions.forEach(position => {
      const party = partiesData.find(p => p.id === position.id);
      if (!party) return;

      const group = createSVGElement('g', {
        class: 'compass-party',
        'data-party': position.id,
        tabindex: '0',
        role: 'button',
        'aria-label': `${party.namn}: ${position.motivation}`
      });

      // Circle
      const circle = createSVGElement('circle', {
        cx: position.x,
        cy: position.y,
        r: PARTY_RADIUS,
        fill: PARTY_COLORS[position.id],
        stroke: 'var(--color-bg)',
        'stroke-width': 0.15,
        class: 'compass-party-circle'
      });
      group.appendChild(circle);

      // Party abbreviation
      const text = createSVGElement('text', {
        x: position.x,
        y: position.y + 0.25,
        'text-anchor': 'middle',
        'font-size': '0.6',
        'font-family': 'var(--font-display)',
        'font-weight': '700',
        fill: PARTY_TEXT_COLORS[position.id],
        'pointer-events': 'none'
      });
      text.textContent = position.id;
      group.appendChild(text);

      markersGroup.appendChild(group);
    });

    svg.appendChild(markersGroup);
  }

  // ==========================================================================
  // Tooltip
  // ==========================================================================

  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'compass-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function showTooltip(partyId, event) {
    const position = compassData.positions.find(p => p.id === partyId);
    const party = partiesData.find(p => p.id === partyId);
    if (!position || !party) return;

    if (!activeTooltip) {
      activeTooltip = createTooltip();
    }

    activeTooltip.innerHTML = `
      <div class="compass-tooltip-header">
        <span class="compass-tooltip-badge" style="background: ${PARTY_COLORS[partyId]}; color: ${PARTY_TEXT_COLORS[partyId]}">${partyId}</span>
        <span class="compass-tooltip-name">${party.namn}</span>
      </div>
      <p class="compass-tooltip-motivation">${position.motivation}</p>
      <div class="compass-tooltip-coords">
        <span>Ekonomi: ${position.x > 0 ? '+' : ''}${position.x}</span>
        <span>Värderingar: ${position.y > 0 ? '+' : ''}${position.y}</span>
      </div>
      <p class="compass-tooltip-source">Källa: ${position.source}</p>
    `;

    activeTooltip.style.display = 'block';
    positionTooltip(event);
  }

  function positionTooltip(event) {
    if (!activeTooltip) return;

    const rect = activeTooltip.getBoundingClientRect();
    const padding = 16;

    let x = event.clientX + padding;
    let y = event.clientY + padding;

    // Keep within viewport
    if (x + rect.width > window.innerWidth) {
      x = event.clientX - rect.width - padding;
    }
    if (y + rect.height > window.innerHeight) {
      y = event.clientY - rect.height - padding;
    }

    activeTooltip.style.left = `${x}px`;
    activeTooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.style.display = 'none';
    }
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  function initEventHandlers(container) {
    const svg = container.querySelector('.compass-svg');

    // Party hover/focus
    svg.addEventListener('mouseover', (e) => {
      const party = e.target.closest('.compass-party');
      if (party) {
        showTooltip(party.dataset.party, e);
      }
    });

    svg.addEventListener('mousemove', (e) => {
      const party = e.target.closest('.compass-party');
      if (party && activeTooltip?.style.display === 'block') {
        positionTooltip(e);
      }
    });

    svg.addEventListener('mouseout', (e) => {
      const party = e.target.closest('.compass-party');
      if (party) {
        hideTooltip();
      }
    });

    // Touch support
    svg.addEventListener('touchstart', (e) => {
      const party = e.target.closest('.compass-party');
      if (party) {
        e.preventDefault();
        const touch = e.touches[0];
        showTooltip(party.dataset.party, { clientX: touch.clientX, clientY: touch.clientY });
      }
    }, { passive: false });

    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.compass-party') && !e.target.closest('.compass-tooltip')) {
        hideTooltip();
      }
    });

    // Keyboard support
    svg.addEventListener('keydown', (e) => {
      const party = e.target.closest('.compass-party');
      if (party && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const rect = party.getBoundingClientRect();
        showTooltip(party.dataset.party, {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
      }
      if (e.key === 'Escape') {
        hideTooltip();
      }
    });

    svg.addEventListener('blur', (e) => {
      if (e.target.closest('.compass-party')) {
        hideTooltip();
      }
    }, true);

    // Coalition toggle
    const toggle = container.querySelector('.compass-coalition-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        showCoalitions = e.target.checked;
        const coalitions = svg.querySelector('.compass-coalitions');
        if (coalitions) {
          coalitions.style.display = showCoalitions ? 'block' : 'none';
        }
      });
    }
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================

  async function initCompass() {
    const container = document.getElementById('compass-container');
    if (!container) return;

    // Load data
    try {
      const [compassResponse, partiesResponse] = await Promise.all([
        fetch('data/compass-positions.json'),
        fetch('data/parties.json')
      ]);

      compassData = await compassResponse.json();
      partiesData = await partiesResponse.json();
    } catch (error) {
      console.error('Error loading compass data:', error);
      container.innerHTML = '<div class="error">Kunde inte ladda kompassdata. Kontrollera internetanslutningen och <a href="javascript:location.reload()">ladda om sidan</a>.</div>';
      return;
    }

    // Render SVG
    const svgContainer = container.querySelector('.compass-svg-container');
    renderCompassSVG(svgContainer);

    // Set up event handlers
    initEventHandlers(container);

    // Update disclaimer
    const disclaimer = container.querySelector('.compass-disclaimer-text');
    if (disclaimer && compassData.meta) {
      disclaimer.textContent = compassData.meta.disclaimer;
    }

    console.log('Political compass initialized');
  }

  // Export for global access
  window.initCompass = initCompass;

})();
