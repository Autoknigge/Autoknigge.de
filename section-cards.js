/* Autoknigge – systematische Abschnitts-Kacheln
   Wandelt einfache H2 + Inhalt-Abschnitte auf Artikelseiten in
   dezente, responsive Content-Karten um. Bereits gestaltete
   Komponenten mit eigenen Klassen bleiben unverändert.
*/
(function () {
  function cardizeSections() {
    // Statische Momentaufnahme vor der DOM-Veränderung.
    var headings = Array.prototype.slice.call(document.querySelectorAll('main h2:not([class])'));

    headings.forEach(function (heading) {
      // Bereits durch einen vorherigen Durchlauf in eine Karte verschoben?
      if (heading.closest('.auto-section-card')) return;

      var parent = heading.parentElement;
      if (!parent) return;
      if (parent.classList.contains('article-body')) return;

      // Nur echte, einfache Container bearbeiten. H2 innerhalb bestehender
      // Karten/Teaser/Grids besitzen in der Regel einen klassifizierten Parent.
      if (parent.className && parent.className.trim()) return;

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
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cardizeSections);
  } else {
    cardizeSections();
  }
})();
