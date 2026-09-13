/* Autoknigge – systematische Abschnitts-Kacheln
   Wandelt einfache H2 + Inhalt-Abschnitte auf Artikelseiten in
   dezente, responsive Content-Karten um. Bereits gestaltete
   Komponenten mit eigenen Klassen bleiben unverändert.
*/
(function () {
  function cardizeSections() {
    document.querySelectorAll('main h2:not([class])').forEach(function (heading) {
      var parent = heading.parentElement;
      if (!parent || parent.dataset.sectionCardized === 'true') return;
      if (parent.classList.contains('article-body')) return;

      // Nur echte, einfache Container bearbeiten. H2 innerhalb bestehender
      // Karten/Teaser/Grids besitzen in der Regel einen klassifizierten Parent.
      if (parent.className && String(parent.className).trim()) return;

      var card = document.createElement('div');
      card.className = 'auto-section-card';
      card.setAttribute('data-generated-card', 'true');

      parent.insertBefore(card, heading);

      var node = heading;
      while (node) {
        var next = node.nextElementSibling;
        if (node !== heading && node.matches && node.matches('h2')) break;
        card.appendChild(node);
        node = next;
      }
      parent.dataset.sectionCardized = 'true';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cardizeSections);
  } else {
    cardizeSections();
  }
})();
