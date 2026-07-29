document.addEventListener('DOMContentLoaded', function () {
  // 1. Header scroll animation
  var header = document.querySelector('.site-header');
  var backToTopBtn = document.getElementById('backToTop');

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

  // 3. Live Search & Category Filtering
  var searchInput = document.getElementById('heroSearchInput');
  var filterButtons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.card');
  var topicSections = document.querySelectorAll('.topic-section');

  function filterContent() {
    var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var activeCategory = document.querySelector('.filter-btn.active');
    var categoryFilter = activeCategory ? activeCategory.getAttribute('data-category') : 'all';

    cards.forEach(function (card) {
      var cardText = card.textContent.toLowerCase();
      var cardSection = card.closest('.topic-section');
      var sectionId = cardSection ? cardSection.id : '';

      var matchesQuery = query === '' || cardText.indexOf(query) !== -1;
      var matchesCategory = categoryFilter === 'all' || sectionId === categoryFilter;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Hide section head rows if all cards inside are hidden
    topicSections.forEach(function (section) {
      var visibleCards = section.querySelectorAll('.card[style*="display: flex"], .card:not([style*="display: none"])');
      // If filtering active, hide empty sections
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
});
