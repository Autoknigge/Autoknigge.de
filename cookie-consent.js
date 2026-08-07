/**
 * Autoknigge Cookie Consent
 * Consent categories:
 * - necessary: technically necessary / always active
 * - statistics: optional
 * - marketing: optional (e.g. Google AdSense)
 *
 * The consent is stored locally so the choice can be changed at any time.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'autoknigge_cookie_consent_v3';
  var ADSENSE_CLIENT = 'ca-pub-7178658520690671';
  var adsenseLoaded = false;

  function loadAdsense() {
    if (adsenseLoaded) return;
    adsenseLoaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  function applyConsent(consent) {
    if (!consent) return;

    window.autoknigge_consent = consent;
    document.dispatchEvent(new CustomEvent('autoknigge:consent-updated', {
      detail: consent
    }));

    if (consent.marketing) loadAdsense();
  }

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}

    applyConsent(consent);
  }

  function closeDialog() {
    var backdrop = document.getElementById('cookie-consent-backdrop');
    if (backdrop) backdrop.remove();
  }

  function buildBanner(openSettings) {
    var existing = document.getElementById('cookie-consent-backdrop');
    if (existing) {
      var details = document.getElementById('cc-details');
      if (details && openSettings) details.hidden = false;
      return existing;
    }

    var backdrop = document.createElement('div');
    backdrop.id = 'cookie-consent-backdrop';
    backdrop.setAttribute('role', 'presentation');

    var wrap = document.createElement('section');
    wrap.id = 'cookie-consent-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'cc-title');
    wrap.setAttribute('aria-describedby', 'cc-text');

    wrap.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-header-row">' +
          '<div class="cc-icon" aria-hidden="true">🍪</div>' +
          '<div>' +
            '<h2 class="cc-title" id="cc-title">Cookie- & Datenschutz-Einstellungen</h2>' +
            '<p class="cc-subtitle">Sie entscheiden, was auf Autoknigge gespeichert bzw. geladen werden darf.</p>' +
          '</div>' +
        '</div>' +

        '<p class="cc-text" id="cc-text">' +
          'Wir verwenden technisch notwendige Speicherungen für den sicheren Betrieb der Website. ' +
          'Optionale Dienste für Statistik und Werbung werden nur aktiviert, wenn Sie ihnen zustimmen. ' +
          'Ihre Auswahl können Sie jederzeit über <strong>„Cookie-Einstellungen“</strong> im Footer ändern. ' +
          'Mehr Informationen finden Sie in der <a href="datenschutz.html">Datenschutzerklärung</a> und im ' +
          '<a href="impressum.html">Impressum</a>.' +
        '</p>' +

        '<div class="cc-buttons">' +
          '<button type="button" class="cc-btn cc-btn-primary" id="cc-accept">Alle akzeptieren</button>' +
          '<button type="button" class="cc-btn cc-btn-secondary" id="cc-reject">Nur notwendige</button>' +
          '<button type="button" class="cc-btn cc-btn-text" id="cc-settings-toggle" aria-expanded="false" aria-controls="cc-details">Auswahl anpassen</button>' +
        '</div>' +

        '<div class="cc-details" id="cc-details" hidden>' +
          '<h3 class="cc-details-title">Ihre Auswahl</h3>' +
          '<div class="cc-options">' +
            '<label class="cc-option cc-option-disabled">' +
              '<input type="checkbox" checked disabled>' +
              '<span class="cc-option-copy">' +
                '<strong>Technisch notwendig</strong>' +
                'Erforderlich für grundlegende Funktionen und die Speicherung Ihrer Consent-Auswahl. Immer aktiv.' +
              '</span>' +
            '</label>' +

            '<label class="cc-option">' +
              '<input type="checkbox" id="cc-cat-statistik">' +
              '<span class="cc-option-copy">' +
                '<strong>Statistik & Analyse</strong>' +
                'Optionale Auswertung zur Verbesserung der Inhalte und Benutzerfreundlichkeit.' +
              '</span>' +
            '</label>' +

            '<label class="cc-option">' +
              '<input type="checkbox" id="cc-cat-marketing">' +
              '<span class="cc-option-copy">' +
                '<strong>Marketing & Werbung</strong>' +
                'Optionale Werbung, z. B. über Google AdSense. Kann je nach Dienst Cookies oder ähnliche Technologien umfassen.' +
              '</span>' +
            '</label>' +
          '</div>' +

          '<div class="cc-save-wrap">' +
            '<button type="button" class="cc-btn cc-btn-primary" id="cc-save-selection">Auswahl speichern</button>' +
          '</div>' +

          '<p class="cc-legal-note">' +
            'Sie können eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft über den Footer ändern oder widerrufen.' +
          '</p>' +
        '</div>' +
      '</div>';

    backdrop.appendChild(wrap);
    document.body.appendChild(backdrop);

    var current = getConsent();
    if (current) {
      document.getElementById('cc-cat-statistik').checked = !!current.statistics;
      document.getElementById('cc-cat-marketing').checked = !!current.marketing;
    }

    var details = document.getElementById('cc-details');
    var toggle = document.getElementById('cc-settings-toggle');

    if (openSettings) {
      details.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }

    document.getElementById('cc-accept').addEventListener('click', function () {
      saveConsent({
        necessary: true,
        statistics: true,
        marketing: true,
        timestamp: Date.now()
      });
      closeDialog();
    });

    document.getElementById('cc-reject').addEventListener('click', function () {
      saveConsent({
        necessary: true,
        statistics: false,
        marketing: false,
        timestamp: Date.now()
      });
      closeDialog();
    });

    toggle.addEventListener('click', function () {
      details.hidden = !details.hidden;
      toggle.setAttribute('aria-expanded', details.hidden ? 'false' : 'true');
    });

    document.getElementById('cc-save-selection').addEventListener('click', function () {
      saveConsent({
        necessary: true,
        statistics: document.getElementById('cc-cat-statistik').checked,
        marketing: document.getElementById('cc-cat-marketing').checked,
        timestamp: Date.now()
      });
      closeDialog();
    });

    setTimeout(function () {
      var first = document.getElementById('cc-accept');
      if (first) first.focus();
    }, 0);

    return backdrop;
  }

  function init() {
    var savedConsent = getConsent();

    if (savedConsent) {
      applyConsent(savedConsent);
    } else {
      buildBanner(false);
    }

    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;

      var link = target.closest ? target.closest('#cookie-settings-link') : null;

      if (link) {
        e.preventDefault();
        buildBanner(true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
