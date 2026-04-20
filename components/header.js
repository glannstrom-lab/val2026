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

        <button class="nav-toggle" aria-label="Öppna meny" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
