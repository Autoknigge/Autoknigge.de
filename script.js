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

  // 5. Scroll reveal animations
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }


  // 7. Submenu toggle (mobile + keyboard)
  var submenuToggles = document.querySelectorAll('.has-submenu > .submenu-toggle');
  submenuToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      var parent = toggle.parentElement;
      var isOpen = parent.classList.contains('open');
      // Close all other submenus
      document.querySelectorAll('.has-submenu.open').forEach(function (el) {
        if (el !== parent) { el.classList.remove('open'); el.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false'); }
      });
      if (window.innerWidth <= 980) {
        e.preventDefault();
        parent.classList.toggle('open');
        toggle.setAttribute('aria-expanded', parent.classList.contains('open') ? 'true' : 'false');
      }
    });
  });
  // Close submenu when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-submenu')) {
      document.querySelectorAll('.has-submenu.open').forEach(function (el) {
        el.classList.remove('open');
        var t = el.querySelector('.submenu-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // 6. Mobile menu: Close on link click (better UX)
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    var navLinks = document.querySelectorAll('.header-nav-list a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768 && navToggle.checked) {
          navToggle.checked = false;
        }
      });
    });
  }
});
