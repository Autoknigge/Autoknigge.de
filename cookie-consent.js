/**
 * Autoknigge Cookie Consent Manager (DSGVO / TDDDG konform)
 * - Keine Cookies / Drittanbieter-Skripte vor ausdrücklicher Einwilligung
 * - Gleichwertige Auswahl zwischen "Alle akzeptieren" und "Nur notwendige"
 * - Granulare Optionen für Statistik & Marketing
 * - Jederzeit anpassbar über den Footer-Link "Cookie-Einstellungen"
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'autoknigge_cookie_consent_v2';
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
    document.dispatchEvent(new CustomEvent('autoknigge:consent-updated', { detail: consent }));

    // Marketing-Skripte (z. B. Google AdSense) nur bei expliziter Einwilligung laden
    if (consent.marketing) {
      loadAdsense();
    }
  }

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consentObj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentObj));
    } catch (e) {}
    applyConsent(consentObj);
  }

  function buildBanner() {
    var existingBanner = document.getElementById('cookie-consent-banner');
    if (existingBanner) return existingBanner;

    var wrap = document.createElement('div');
    wrap.id = 'cookie-consent-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie- & Datenschutz-Einstellungen');

    wrap.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-header-row">' +
          '<h3 class="cc-title">Cookie- & Datenschutz-Einstellungen</h3>' +
        '</div>' +
        '<p class="cc-text">' +
          'Wir verwenden technisch notwendige Cookies, damit unsere Website zuverlässig und sicher funktioniert. ' +
          'Mit Ihrer Einwilligung nutzen wir zusätzlich Cookies für anonyme Statistiken sowie für personalisierte Werbung (z. B. Google AdSense). ' +
          'Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft im Footer unter „Cookie-Einstellungen“ anpassen oder widerrufen. ' +
          'Weitere Informationen finden Sie in unserer <a href="datenschutz.html">Datenschutzerklärung</a> und unserem <a href="impressum.html">Impressum</a>.' +
        '</p>' +
        '<div class="cc-buttons">' +
          '<button type="button" class="cc-btn cc-btn-primary" id="cc-accept">Alle akzeptieren</button>' +
          '<button type="button" class="cc-btn cc-btn-secondary" id="cc-reject">Nur notwendige</button>' +
          '<button type="button" class="cc-btn cc-btn-text" id="cc-settings-toggle">Auswahl anpassen</button>' +
        '</div>' +
        '<div class="cc-details" id="cc-details" hidden>' +
          '<label class="cc-option cc-option-disabled">' +
            '<input type="checkbox" checked disabled>' +
            '<span><strong>Technisch Notwendig</strong> — Für grundlegende Funktionen der Website erforderlich (immer aktiv).</span>' +
          '</label>' +
          '<label class="cc-option">' +
            '<input type="checkbox" id="cc-cat-statistik">' +
            '<span><strong>Statistik & Analyse</strong> — Hilft uns zu verstehen, wie Besucher die Inhalte nutzen, um das Angebot zu verbessern.</span>' +
          '</label>' +
          '<label class="cc-option">' +
            '<input type="checkbox" id="cc-cat-marketing">' +
            '<span><strong>Marketing & Werbung</strong> — Ermöglicht die Anzeige personalisierter Werbung (z. B. Google AdSense).</span>' +
          '</label>' +
          '<div class="cc-save-wrap">' +
            '<button type="button" class="cc-btn cc-btn-primary" id="cc-save-selection">Auswahl speichern</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    // Button Event Listeners
    document.getElementById('cc-accept').addEventListener('click', function () {
      saveConsent({ necessary: true, statistics: true, marketing: true, timestamp: Date.now() });
      wrap.remove();
    });

    document.getElementById('cc-reject').addEventListener('click', function () {
      saveConsent({ necessary: true, statistics: false, marketing: false, timestamp: Date.now() });
      wrap.remove();
    });

    document.getElementById('cc-settings-toggle').addEventListener('click', function () {
      var details = document.getElementById('cc-details');
      details.hidden = !details.hidden;
    });

    document.getElementById('cc-save-selection').addEventListener('click', function () {
      saveConsent({
        necessary: true,
        statistics: document.getElementById('cc-cat-statistik').checked,
        marketing: document.getElementById('cc-cat-marketing').checked,
        timestamp: Date.now()
      });
      wrap.remove();
    });

    return wrap;
  }

  function init() {
    var savedConsent = getConsent();
    if (savedConsent) {
      applyConsent(savedConsent);
    } else {
      buildBanner();
    }

    // Listener für "Cookie-Einstellungen" Link im Footer
    document.addEventListener('click', function (e) {
      var target = e.target;
      if (target && (target.id === 'cookie-settings-link' || target.closest('#cookie-settings-link'))) {
        e.preventDefault();
        var banner = buildBanner();
        var details = document.getElementById('cc-details');
        if (details) {
          details.hidden = false;
        }
        var current = getConsent();
        if (current) {
          var statCheck = document.getElementById('cc-cat-statistik');
          var markCheck = document.getElementById('cc-cat-marketing');
          if (statCheck) statCheck.checked = !!current.statistics;
          if (markCheck) markCheck.checked = !!current.marketing;
        }
        banner.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
