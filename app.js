/**
 * Val 2026 — Väljarportal
 * Main application script
 */

(function() {
  'use strict';

  // ==========================================================================
  // Constants
  // ==========================================================================

  const ELECTION_DATE = new Date('2026-09-13T08:00:00+02:00');

  // Opinion poll data (april 2026)
  const POLL_DATA = [
    { id: 'S', namn: 'Socialdemokraterna', procent: 33 },
    { id: 'SD', namn: 'Sverigedemokraterna', procent: 20 },
    { id: 'M', namn: 'Moderaterna', procent: 18 },
    { id: 'V', namn: 'Vänsterpartiet', procent: 8 },
    { id: 'C', namn: 'Centerpartiet', procent: 6 },
    { id: 'MP', namn: 'Miljöpartiet', procent: 6 },
    { id: 'KD', namn: 'Kristdemokraterna', procent: 5 },
    { id: 'L', namn: 'Liberalerna', procent: 2 }
  ];

  // Party colors (must match parties.json)
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

  // ==========================================================================
  // State
  // ==========================================================================

  let partiesData = [];

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Fetch JSON data from a file
   */
  async function fetchJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  /**
   * Calculate time remaining until election
   */
  function getTimeRemaining() {
    const now = new Date();
    const diff = ELECTION_DATE - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  }

  /**
   * Pad number with leading zero
   */
  function padZero(num) {
    return num.toString().padStart(2, '0');
  }

  // ==========================================================================
  // Countdown
  // ==========================================================================

  function updateCountdown() {
    const time = getTimeRemaining();

    document.getElementById('countdown-days').textContent = time.days;
    document.getElementById('countdown-hours').textContent = padZero(time.hours);
    document.getElementById('countdown-minutes').textContent = padZero(time.minutes);
    document.getElementById('countdown-seconds').textContent = padZero(time.seconds);
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ==========================================================================
  // Mobile Navigation
  // ==========================================================================

  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const links = mobileNav.querySelectorAll('a');

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    links.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        mobileNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ==========================================================================
  // Active Navigation
  // ==========================================================================

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  // ==========================================================================
  // Parties Grid
  // ==========================================================================

  function renderPartyCard(party) {
    const blockLabel = party.block === 'regering' ? 'Tidöpartierna' : 'Opposition';
    const blockClass = party.block === 'regering' ? 'regering' : 'opposition';

    return `
      <article class="party-card" data-party="${party.id}">
        <header class="party-card-header">
          <img src="assets/logos/${party.id}.png" alt="${party.namn} logotyp" class="party-logo-img">
          <div>
            <h3>${party.namn}</h3>
            <p class="party-leader">${party.ledare_titel}: ${party.ledare}</p>
          </div>
        </header>

        <span class="party-block ${blockClass}">${blockLabel}</span>

        <div class="party-stats">
          <div class="party-stat">
            <span class="party-stat-value">${party.mandat_2022}</span>
            <span class="party-stat-label">Mandat 2022</span>
          </div>
          <div class="party-stat">
            <span class="party-stat-value">${party.valresultat_2022.toFixed(1)}%</span>
            <span class="party-stat-label">Resultat 2022</span>
          </div>
        </div>

        <p class="party-description">${party.beskrivning}</p>

        <span class="party-ideology">${party.ideologi}</span>

        <a href="${party.webbplats}" target="_blank" rel="noopener" class="party-link">
          Besök officiell sida
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
          </svg>
        </a>
      </article>
    `;
  }

  async function initPartiesGrid() {
    const grid = document.getElementById('parties-grid');

    partiesData = await fetchJSON('data/parties.json');

    if (!partiesData) {
      grid.innerHTML = '<p class="text-center text-muted">Kunde inte ladda partidata.</p>';
      return;
    }

    // Sort by 2022 mandate count (descending)
    partiesData.sort((a, b) => b.mandat_2022 - a.mandat_2022);

    grid.innerHTML = partiesData.map(renderPartyCard).join('');
  }

  // ==========================================================================
  // Opinion Polls Chart
  // ==========================================================================

  function renderPollBar(poll, maxPercent) {
    const color = PARTY_COLORS[poll.id] || '#666';
    const width = (poll.procent / maxPercent) * 100;
    const isBelowThreshold = poll.procent < 4;

    return `
      <div class="poll-bar-container">
        <div class="poll-bar-header">
          <div class="poll-bar-party">
            <img src="assets/logos/${poll.id}.png" alt="${poll.id}" class="poll-bar-logo">
            <span class="poll-bar-name">${poll.namn}</span>
          </div>
          <span class="poll-bar-value" style="color: ${isBelowThreshold ? 'var(--color-error)' : 'inherit'}">
            ${poll.procent}%${isBelowThreshold ? ' *' : ''}
          </span>
        </div>
        <div class="poll-bar-track">
          <div class="poll-bar-fill" style="width: ${width}%; background-color: ${color}"></div>
        </div>
      </div>
    `;
  }

  function initPollChart() {
    const chart = document.getElementById('poll-chart');
    const maxPercent = Math.max(...POLL_DATA.map(p => p.procent));

    // Add threshold marker and note
    chart.innerHTML = `
      <div style="position: relative; margin-bottom: var(--space-4);">
        <p style="font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-6);">
          <span style="color: var(--color-error);">*</span> Under 4%-spärren för riksdagen
        </p>
      </div>
      ${POLL_DATA.map(poll => renderPollBar(poll, maxPercent)).join('')}
    `;
  }

  // ==========================================================================
  // Smooth Scroll (enhanced)
  // ==========================================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL without triggering scroll
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  // ==========================================================================
  // Hash Navigation
  // ==========================================================================

  function handleHashChange() {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 100);
      }
    }
  }

  // ==========================================================================
  // Disclaimer Toggle
  // ==========================================================================

  function initDisclaimerToggles() {
    document.querySelectorAll('.compass-disclaimer-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const disclaimer = toggle.closest('.compass-disclaimer');
        const isOpen = disclaimer.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
      });
    });
  }

  // ==========================================================================
  // Init
  // ==========================================================================

  function init() {
    initCountdown();
    initMobileNav();
    initActiveNav();
    initSmoothScroll();
    initPartiesGrid();
    initPollChart();
    initDisclaimerToggles();

    // Initialize compass (loaded from tools/compass.js)
    if (typeof window.initCompass === 'function') {
      window.initCompass();
    }

    // Initialize quiz (loaded from tools/quiz.js)
    if (typeof window.initQuiz === 'function') {
      window.initQuiz();
    }

    // Initialize compare (loaded from tools/compare.js)
    if (typeof window.initCompare === 'function') {
      window.initCompare();
    }

    // Initialize timeline (loaded from tools/timeline.js)
    if (typeof window.initTimeline === 'function') {
      window.initTimeline();
    }

    // Initialize coalition builder (loaded from tools/coalition.js)
    if (typeof window.initCoalition === 'function') {
      window.initCoalition();
    }

    // Initialize guess quiz (loaded from tools/guess.js)
    if (typeof window.initGuess === 'function') {
      window.initGuess();
    }

    // Initialize poll graph (loaded from tools/pollgraph.js)
    if (typeof window.initPollGraph === 'function') {
      window.initPollGraph();
    }

    // Handle initial hash
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    console.log('Val 2026 Väljarportal initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Register Service Worker for offline support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

})();
