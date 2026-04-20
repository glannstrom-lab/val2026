/**
 * Shared header component with mega menu
 * Injected on all pages
 */

(function() {
  'use strict';

  const MENU_STRUCTURE = {
    verktyg: {
      label: 'Verktyg',
      items: [
        { href: 'kompass.html', title: 'Politisk kompass', desc: 'Se var partierna står ideologiskt' },
        { href: 'quiz.html', title: 'Valkompass', desc: 'Hitta partier som matchar dig' },
        { href: 'jamfor.html', title: 'Jämför partier', desc: 'Två partier sida vid sida' },
        { href: 'mandat.html', title: 'Mandatkalkylator', desc: 'Simulera valresultat' },
        { href: 'koalition.html', title: 'Koalitionsbyggare', desc: 'Bygg regeringsunderlag' },
        { href: 'gissa.html', title: 'Gissa partiet', desc: 'Testa dina kunskaper' }
      ]
    },
    fakta: {
      label: 'Fakta',
      items: [
        { href: 'partier.html', title: 'Partierna', desc: 'Alla åtta riksdagspartier' },
        { href: 'sakfragor.html', title: 'Sakfrågor', desc: 'Jämför partiernas ståndpunkter' },
        { href: 'budget.html', title: 'Statsbudgeten', desc: 'Regeringens vs oppositionens budget' },
        { href: 'rostningar.html', title: 'Röstningar', desc: 'Hur partierna röstat i riksdagen' }
      ]
    },
    analys: {
      label: 'Analys',
      items: [
        { href: 'opinion.html', title: 'Opinionsläget', desc: 'Aktuella opinionsmätningar' },
        { href: 'tidslinje.html', title: 'Tidslinje', desc: 'Händelser från 2022 till valet' },
        { href: 'historik.html', title: 'Valhistorik', desc: 'Tidigare val och trender' }
      ]
    }
  };

  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return page;
  }

  function createHeader() {
    const currentPage = getCurrentPage();
    const isHome = currentPage === 'index.html' || currentPage === '';

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container">
        <a href="index.html" class="site-logo">Val<span>2026</span></a>

        <nav class="main-nav mega-nav" aria-label="Huvudnavigation">
          ${Object.entries(MENU_STRUCTURE).map(([key, category]) => `
            <div class="nav-dropdown">
              <button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true">
                ${category.label}
                <svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="nav-dropdown-menu">
                <div class="dropdown-items">
                  ${category.items.map(item => `
                    <a href="${item.href}" class="dropdown-item ${currentPage === item.href ? 'active' : ''}">
                      <span class="dropdown-item-title">${item.title}</span>
                      <span class="dropdown-item-desc">${item.desc}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
          <a href="om.html" class="nav-link ${currentPage === 'om.html' ? 'active' : ''}">Om sidan</a>
        </nav>

        <div class="header-actions">
          <button class="theme-toggle" aria-label="Byt tema" title="Byt till ljust/mörkt läge">
            <svg class="theme-icon-dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg class="theme-icon-light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <button class="nav-toggle" aria-label="Öppna meny" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    `;

    return header;
  }

  function createMobileNav() {
    const currentPage = getCurrentPage();

    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.setAttribute('aria-label', 'Mobilnavigation');

    let html = '';
    Object.entries(MENU_STRUCTURE).forEach(([key, category]) => {
      html += `<div class="mobile-nav-category">${category.label}</div>`;
      category.items.forEach(item => {
        html += `<a href="${item.href}" class="${currentPage === item.href ? 'active' : ''}">${item.title}</a>`;
      });
    });
    html += `<div class="mobile-nav-category">Övrigt</div>`;
    html += `<a href="om.html" class="${currentPage === 'om.html' ? 'active' : ''}">Om sidan</a>`;

    nav.innerHTML = html;
    return nav;
  }

  function createSkipLink() {
    const link = document.createElement('a');
    link.href = '#main';
    link.className = 'skip-link';
    link.textContent = 'Hoppa till innehåll';
    return link;
  }

  function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <a href="index.html" class="footer-logo">Val<span>2026</span></a>
            <p>Neutral, faktabaserad väljarinformation</p>
          </div>

          <div class="footer-nav">
            <div class="footer-nav-group">
              <h4>Verktyg</h4>
              <a href="kompass.html">Politisk kompass</a>
              <a href="quiz.html">Valkompass</a>
              <a href="koalition.html">Koalitionsbyggare</a>
              <a href="gissa.html">Gissa partiet</a>
            </div>
            <div class="footer-nav-group">
              <h4>Fakta</h4>
              <a href="partier.html">Partierna</a>
              <a href="sakfragor.html">Sakfrågor</a>
              <a href="budget.html">Statsbudgeten</a>
              <a href="rostningar.html">Röstningar</a>
            </div>
            <div class="footer-nav-group">
              <h4>Analys</h4>
              <a href="opinion.html">Opinionsläget</a>
              <a href="tidslinje.html">Tidslinje</a>
              <a href="historik.html">Valhistorik</a>
            </div>
          </div>

          <div class="footer-meta">
            <p>Senast uppdaterad: april 2026</p>
            <a href="om.html">Om sidan & källor</a>
          </div>
        </div>
      </div>
    `;
    return footer;
  }

  function attachDropdownListeners() {
    const triggers = document.querySelectorAll('.nav-dropdown-trigger');

    triggers.forEach(trigger => {
      const dropdown = trigger.closest('.nav-dropdown');
      const menu = dropdown.querySelector('.nav-dropdown-menu');

      // Hover behavior for desktop
      dropdown.addEventListener('mouseenter', () => {
        trigger.setAttribute('aria-expanded', 'true');
        menu.classList.add('open');
      });

      dropdown.addEventListener('mouseleave', () => {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      });

      // Click behavior for touch/keyboard
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Close all other dropdowns
        triggers.forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          t.closest('.nav-dropdown').querySelector('.nav-dropdown-menu').classList.remove('open');
        });

        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          menu.classList.add('open');
        }
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
        if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          menu.classList.remove('open');
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        triggers.forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          t.closest('.nav-dropdown').querySelector('.nav-dropdown-menu').classList.remove('open');
        });
      }
    });
  }

  function attachMobileNavListeners() {
    const toggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isOpen);
        toggle.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.classList.toggle('nav-open');
      });

      // Close on link click
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('active');
          mobileNav.classList.remove('open');
          document.body.classList.remove('nav-open');
        });
      });
    }
  }

  // ==========================================================================
  // Theme Toggle
  // ==========================================================================

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'light' ? '#ffffff' : '#0d0d0d';
    }
  }

  function initTheme() {
    // Apply saved theme immediately (before DOM fully loads)
    const theme = getPreferredTheme();
    setTheme(theme);
  }

  function attachThemeToggleListener() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  function init() {
    // Insert components
    const body = document.body;
    const firstChild = body.firstChild;

    body.insertBefore(createSkipLink(), firstChild);
    body.insertBefore(createHeader(), firstChild.nextSibling);
    body.insertBefore(createMobileNav(), document.querySelector('main'));

    // Add footer before scripts
    const scripts = document.querySelector('script');
    if (scripts) {
      body.insertBefore(createFooter(), scripts);
    } else {
      body.appendChild(createFooter());
    }

    // Attach listeners
    attachDropdownListeners();
    attachMobileNavListeners();
    attachThemeToggleListener();
  }

  // Apply theme immediately (before DOM loads)
  initTheme();

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
