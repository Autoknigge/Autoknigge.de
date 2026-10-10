document.addEventListener('DOMContentLoaded', function () {
  // 1. Header scroll animation
  var header = document.querySelector('.site-header');
  var backToTopBtn = document.getElementById('backToTop');
  var searchInput = document.getElementById('heroSearchInput');

  var ENTER = 60;
  var EXIT = 20;
  var ticking = false;

  function updateHeader() {
    var y = window.scrollY;
    if (header) {
      if (y > ENTER) {
        header.classList.add('is-scrolled');
      } else if (y < EXIT) {
        header.classList.remove('is-scrolled');
      }
    }

    if (backToTopBtn) {
      if (y > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeader();

  // Android-Chrome-Fix: Ein sticky Header mit backdrop-filter lässt nach dem
  // Laden/Navigieren manchmal kurz eine leere weiße Fläche unter sich stehen,
  // bis der Nutzer scrollt (bekannter Compositing-Bug). Ein unsichtbarer
  // 1px-Scroll erzwingt sofort ein Neu-Zeichnen, ohne dass die Seite sichtbar
  // springt.
  if (window.scrollY === 0 && !location.hash) {
    requestAnimationFrame(function () {
      window.scrollTo(0, 1);
      requestAnimationFrame(function () {
        window.scrollTo(0, 0);
      });
    });
  }

  // 2. Back to top button listener
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Keyboard shortcut: Press '/' to focus search (unless in input/textarea)
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && searchInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchInput.focus();
        // Select all text for quick replacement
        searchInput.select();
      }
    }
    // Escape key to blur search
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });

  // 4. Live Search & Category Filtering
  var filterButtons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.card');
  var topicSections = document.querySelectorAll('.topic-section');
  var searchResultsCount = document.createElement('div');
  searchResultsCount.className = 'search-results-count';
  searchResultsCount.setAttribute('aria-live', 'polite');
  searchResultsCount.style.cssText = 'font-size:0.85rem;color:var(--text-muted);margin-top:4px;min-height:1.5em;';
  if (searchInput && searchInput.parentNode) {
    searchInput.parentNode.appendChild(searchResultsCount);
  }

  function filterContent() {
    var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var activeCategory = document.querySelector('.filter-btn.active');
    var categoryFilter = activeCategory ? activeCategory.getAttribute('data-category') : 'all';

    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardText = card.textContent.toLowerCase();
      var cardSection = card.closest('.topic-section');
      var sectionId = cardSection ? cardSection.id : '';

      var matchesQuery = query === '' || cardText.indexOf(query) !== -1;
      var matchesCategory = categoryFilter === 'all' || sectionId === categoryFilter;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update results count
    if (searchResultsCount) {
      if (query !== '' || categoryFilter !== 'all') {
        searchResultsCount.textContent = visibleCount + ' Artikel gefunden' + (visibleCount !== 1 ? 'en' : '');
      } else {
        searchResultsCount.textContent = '';
      }
    }

    // Hide section head rows if all cards inside are hidden
    topicSections.forEach(function (section) {
      var visibleCards = section.querySelectorAll('.card[style*="display: flex"], .card:not([style*="display: none"])');
      if (query !== '' || categoryFilter !== 'all') {
        if (visibleCards.length === 0) {
          section.style.display = 'none';
        } else {
          section.style.display = 'block';
        }
      } else {
        section.style.display = 'block';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterContent);
    // Clear on escape key
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.blur();
      }
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      filterContent();

      var catTarget = btn.getAttribute('data-category');
      if (catTarget && catTarget !== 'all') {
        var targetSection = document.getElementById(catTarget);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 5. Mobile menu: Close on link click (better UX)
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    var navLinks = document.querySelectorAll('.header-nav-list a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navToggle.checked) {
          navToggle.checked = false;
        }
      });
    });
  }
});

// Einklappbares Untermenü "Nützliche Tools" (Handy-Menü)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-dd').forEach(function (li) {
    var btn = li.querySelector('.dd-caret');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
});

// Untermenü "Nützliche Tools": nach Klick auf einen Eintrag sofort einklappen (auch bei Sprung auf derselben Seite)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-dd').forEach(function (li) {
    var btn = li.querySelector('.dd-caret');
    var ul = li.querySelector('.nav-dd-list');
    // zusätzlich per Inline-Stil, damit es auch mit einer älteren, noch zwischengespeicherten styles.css funktioniert
    var setClosed = function (on) {
      li.classList.toggle('dd-closed', on);
      if (ul) { if (on) ul.style.setProperty('display', 'none', 'important'); else ul.style.removeProperty('display'); }
    };
    li.querySelectorAll('.nav-dd-list a').forEach(function (a) {
      a.addEventListener('click', function () {
        li.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        setClosed(true);
        try { a.blur(); } catch (e) {}
      });
    });
    var reopen = function () { setClosed(false); };
    // Beim Laden einer Seite bleibt das Untermenü zu, auch wenn die Maus gerade darüber steht (z. B. nach Klick auf einen Menüpunkt)
    setClosed(true);
    li.addEventListener('keydown', reopen);
    // Erst bei echter Mausbewegung (mind. 6 px) über dem Menü wieder aufklappen
    var ref = null;
    li.addEventListener('mousemove', function (e) {
      if (!li.classList.contains('dd-closed')) return;
      if (!ref) { ref = { x: e.clientX, y: e.clientY }; return; }
      if (Math.abs(e.clientX - ref.x) + Math.abs(e.clientY - ref.y) >= 6) { ref = null; reopen(); }
    });
    li.addEventListener('mouseleave', function () { ref = null; });
    li.addEventListener('mouseleave', reopen);
    li.addEventListener('touchstart', function (e) { if (e.target.closest('.dd-caret')) reopen(); }, { passive: true });
    if (btn) btn.addEventListener('click', reopen);
  });
});

// Menü auch bei Sprung auf einen Abschnitt derselben Seite (#anker) und beim Zurück-Button schließen
(function () {
  function closeMenu() {
    var t = document.getElementById('nav-toggle');
    if (t && t.checked) t.checked = false;
  }
  window.addEventListener('hashchange', closeMenu);
  window.addEventListener('pageshow', closeMenu);
  // Das Handy-Menü startet auf jeder Seite zu, auch wenn der Browser einen alten Zustand wiederherstellen will
  closeMenu();
  document.addEventListener('DOMContentLoaded', closeMenu);
  window.addEventListener('load', function () { closeMenu(); setTimeout(closeMenu, 150); });
})();
