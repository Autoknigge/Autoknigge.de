(function () {
  'use strict';

  var STORAGE_KEY = 'autoknigge_mein_auto_v1';
  var form = document.getElementById('carCalendarForm');
  var eventsEl = document.getElementById('calendarEvents');
  var countEl = document.getElementById('eventCount');
  var statusEl = document.getElementById('calendarStatus');
  var evCheck = document.getElementById('isEv');
  var evFields = document.getElementById('evFields');
  var mfrInfoEl = document.getElementById('manufacturerInfo');
  var manufacturerSelect = document.getElementById('manufacturer');

  // ---------------------------------------------------------------------
  // Hersteller-Richtwerte (Stand 09/2026). Das sind typische, öffentlich
  // kommunizierte Herstellerangaben zur Orientierung – keine Garantie im
  // Rechtssinn. Modell- und länderspezifische Abweichungen sind üblich;
  // maßgeblich sind immer die eigenen Kauf- und Garantieunterlagen.
  // ---------------------------------------------------------------------
  var MANUFACTURER_PROFILES = {
    'Alfa Romeo': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Audi': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Longlife)' },
    'Bentley': { warrantyYears: 3, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, warrantyCheckDaysOverride: 90, note: 'Garantie ab Auslieferung an den Erstbesitzer, 3 Jahre ohne Kilometerbegrenzung. Garantiereparaturen müssen bei einem Bentley-Vertragshändler erfolgen.' },
    'BMW': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (BMW Service Inclusive)' },
    'Bugatti': { warrantyYears: 2, warrantyKm: null, batteryYears: null, batteryKm: null, serviceType: 'fest', serviceMonths: 12, warrantyCheckDaysOverride: 90, note: 'Garantie beginnt mit der Erstinbetriebnahme, 2 Jahre ohne Kilometerbegrenzung.' },
    'BYD': { warrantyYears: 6, warrantyKm: 150000, batteryYears: 8, batteryKm: 250000, serviceType: 'fest', serviceMonths: 12,
      note: 'Seit Januar 2026 gilt für die Blade-Batterie 8 Jahre/250.000 km (mind. 70 % Kapazität) – auch rückwirkend für Bestandsfahrzeuge.',
      extras: [
        { key: 'drivetrain', label: 'Elektroantrieb-Garantie', icon: '⚙️', years: 8, km: 150000 },
        { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null }
      ] },
    'Citroën': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Cupra': { warrantyYears: 5, warrantyKm: 150000, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Longlife, MEB-Modelle)', note: 'Cupra bietet seit einiger Zeit 5 Jahre/150.000 km Fahrzeuggarantie statt der VW-Konzern-üblichen 2 Jahre – Schwestermarke SEAT bleibt bei 2 Jahren.' },
    'Dacia': { warrantyYears: 3, warrantyKm: 100000, batteryYears: 8, batteryKm: 120000, serviceType: 'fest', serviceMonths: 12 },
    'DS Automobiles': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null } ] },
    'Ferrari': { warrantyYears: 3, warrantyKm: null, batteryYears: null, batteryKm: null, serviceType: 'fest', serviceMonths: 12,
      note: 'Ferrari-Garantie läuft unbegrenzt nach Kilometern über 3 Jahre; hinzu kommt ein 7-jähriges Wartungsprogramm (Genuine Maintenance Program). Bei Plug-in-Hybriden wird die Hochvoltbatterie im 8. und 16. Jahr kostenfrei erneuert statt einer klassischen Laufzeitgarantie – kein pauschaler Batterie-Endtermin.',
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null } ] },
    'Fiat': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 8, km: null } ] },
    'Ford': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Hyundai': { warrantyYears: 5, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, note: 'Bei einzelnen Modellen (z. B. IONIQ) werden teils bis zu 200.000 km auf die Batterie kommuniziert – Modellangabe im eigenen Garantieheft prüfen.' },
    'Jeep': { warrantyYears: 2, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 7, km: null } ] },
    'Kia': { warrantyYears: 7, warrantyKm: 150000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'Die Batteriegarantie wurde für Modelljahr 2026 und neuer auf 8 Jahre/160.000 km angehoben (zuvor 7 Jahre/150.000 km); ältere Modelljahre bleiben bei 7 Jahren/150.000 km.',
      extras: [
        { key: 'paint', label: 'Lackgarantie', icon: '🎨', years: 5, km: 150000 },
        { key: 'starter', label: 'Starterbatterie-Garantie (12V)', icon: '🔋', years: 2, km: null },
        { key: 'infotainment', label: 'Infotainment-Garantie', icon: '📻', years: 3, km: null }
      ] },
    'Lamborghini': { warrantyYears: 3, warrantyKm: null, batteryYears: 8, batteryKm: null, serviceType: 'fest', serviceMonths: 12,
      note: 'Basis: 3 Jahre ohne Kilometerbegrenzung, inkl. 5 Jahre Wartung ab Werk. Über das Programm „Selezione Warranty Extension" lässt sich die Garantie bei aktuellen Modellen (Revuelto, Temerario, Urus SE) gegen Aufpreis auf bis zu 10 Jahre ohne km-Begrenzung verlängern. Batteriegarantie (Hybridmodelle) 8 Jahre, keine km-Begrenzung angegeben.',
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null } ] },
    'Lancia': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'Lancia ist in Deutschland aktuell nur mit wenigen Modellen (u. a. Ypsilon) vertreten – Werte gelten primär für die elektrische Ypsilon-Variante.',
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 8, km: null } ] },
    'Maserati': { warrantyYears: 3, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, note: 'Bei Maserati sind individuelle Werksgarantie-Verlängerungen üblich – konkrete Bedingungen unterscheiden sich je nach Modell und Vertragshändler deutlich stärker als bei Volumenherstellern.' },
    'Mazda': { warrantyYears: 3, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Mercedes-Benz': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 25.000 km (ASSYST)',
      variantLabel: 'Modellreihe',
      variants: {
        'EQS / EQE (inkl. SUV)': { batteryYears: 10, batteryKm: 250000 },
        'Andere Modelle': { batteryYears: 8, batteryKm: 160000 }
      },
      defaultVariant: 'Andere Modelle' },
    'MG': { warrantyYears: 7, warrantyKm: 150000, batteryYears: 8, batteryKm: 150000, serviceType: 'fest', serviceMonths: 12 },
    'Nissan': { warrantyYears: 3, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Opel': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Peugeot': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Polestar': { warrantyYears: 3, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 24 },
    'Porsche': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Porsche LongLife)' },
    'Renault': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Rolls-Royce': { warrantyYears: 4, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, warrantyCheckDaysOverride: 90, note: 'Garantie ab Erstverkauf bzw. Erstzulassung, je nachdem was früher eintritt, 4 Jahre ohne Kilometerbegrenzung.' },
    'SEAT': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'smart': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, note: 'smart wird seit dem Joint Venture mit Geely markenrechtlich unabhängig von Mercedes-Benz vermarktet – Garantiebedingungen im eigenen smart-Garantieheft prüfen.' },
    'Škoda': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Longlife)' },
    'Tesla': { warrantyYears: 4, warrantyKm: 80000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'Tesla gibt kein starres Wartungsintervall vor, empfiehlt aber eine jährliche Sichtprüfung.',
      variantLabel: 'Modell / Antriebsvariante',
      variants: {
        'Model 3 / Model Y – Standard Range (Hinterradantrieb)': { batteryYears: 8, batteryKm: 160000 },
        'Model 3 / Model Y – Long Range / Performance': { batteryYears: 8, batteryKm: 192000 },
        'Model S / Model X': { batteryYears: 8, batteryKm: 240000 }
      },
      defaultVariant: 'Model 3 / Model Y – Standard Range (Hinterradantrieb)',
      extras: [
        { key: 'restraint', label: 'Rückhaltesysteme-Garantie (Gurte, Airbags)', icon: '🪢', years: 5, km: 100000 },
        { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null }
      ] },
    'Toyota': { warrantyYears: 3, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, note: 'Mit jährlich bestandenem Batterietest im Rahmen der Inspektion verlängert Toyota Relax die Batterie-Kapazitätsgarantie bis zu 10 Jahre/max. 250.000 km. Einzelne neue Modelle (z. B. C-HR+) haben teils bereits werksseitig 10 Jahre/300.000 km ohne Testpflicht.' },
    'Volkswagen': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Longlife/WIV)' },
    'Volvo': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, note: 'Ab Juli 2026 lässt sich die Batteriegarantie bei Volvo Selekt (Gebrauchtwagen-Zertifizierung) gegen Aufpreis auf bis zu 11 Jahre ohne km-Begrenzung verlängern.' },
    'Xiaomi': { warrantyYears: null, warrantyKm: null, batteryYears: null, batteryKm: null, serviceType: 'fest', serviceMonths: 12, noOfficialWarranty: true,
      note: 'Xiaomi steigt erst rund 2027 offiziell in den deutschen Markt ein. Aktuell in Deutschland verfügbare SU7/YU7 sind Importe einzelner Händler mit eigenen, unterschiedlichen Garantiepaketen – das ist nicht automatisch mit einer späteren offiziellen deutschen Herstellergarantie gleichzusetzen. Zum Vergleich nennt Xiaomi für den YU7 in China 5 Jahre/100.000 km Fahrzeuggarantie sowie 8 Jahre/160.000 km auf bestimmte Schlüsselkomponenten (u. a. Antrieb) – als reiner Anhaltspunkt, nicht als Zusage für ein Importfahrzeug. Es gibt daher bewusst keinen automatisch vorausgefüllten Richtwert – bitte die Angaben des jeweiligen Importeurs eintragen.' },
    'XPeng': { warrantyYears: 7, warrantyKm: 160000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'XPeng ist neu auf dem deutschen Markt – Bedingungen laut aktuellem Kundengarantie-Dokument des Vertragspartners prüfen.',
      extras: [
        { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null },
        { key: 'paint', label: 'Lackgarantie', icon: '🎨', years: 3, km: null },
        { key: 'roadside', label: 'Mobilitätsgarantie / Pannenhilfe', icon: '🛟', years: 5, km: null }
      ] }
  };

  var variantSelect = $('vehicleVariant');
  var variantField = $('vehicleVariantField');

  function getVariantProfile(profile) {
    if (!profile.variants) return profile;
    var chosen = (variantSelect && variantSelect.value) || profile.defaultVariant;
    var v = profile.variants[chosen] || profile.variants[profile.defaultVariant];
    var merged = {};
    for (var k in profile) merged[k] = profile[k];
    merged.batteryYears = v.batteryYears;
    merged.batteryKm = v.batteryKm;
    return merged;
  }

  function populateVariantField(name, profile) {
    if (!profile || !profile.variants) { variantField.hidden = true; variantSelect.innerHTML = ''; return; }
    var currentValue = variantSelect.value;
    variantSelect.innerHTML = '';
    Object.keys(profile.variants).forEach(function (label) {
      var opt = document.createElement('option');
      opt.value = label; opt.textContent = label;
      variantSelect.appendChild(opt);
    });
    if (currentValue && profile.variants[currentValue]) variantSelect.value = currentValue;
    else variantSelect.value = profile.defaultVariant;
    variantField.hidden = false;
    variantField.querySelector('label').firstChild.textContent = (profile.variantLabel || 'Modellvariante') + ' ';
  }

  function $(id) { return document.getElementById(id); }
  function parseDate(value) {
    if (!value) return null;
    var d = new Date(value + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  function addDays(date, days) { var d = new Date(date); d.setDate(d.getDate() + days); return d; }
  function addMonths(date, months) { var d = new Date(date); var day = d.getDate(); d.setMonth(d.getMonth() + months); if (d.getDate() !== day) d.setDate(0); return d; }
  function addYears(date, years) { return addMonths(date, years * 12); }
  function fmt(d) { return d ? d.toLocaleDateString('de-DE') : ''; }
  function isoDate(d) { return d.toISOString().slice(0,10); }
  function icsDate(d) { return isoDate(d).replace(/-/g, ''); }
  function escapeICS(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); }
  function uuid() { return 'autoknigge-' + Date.now() + '-' + Math.random().toString(16).slice(2); }
  function fmtKm(km) { return km ? km.toLocaleString('de-DE') + ' km' : 'unbegrenzt'; }

  function getData() {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.isEv = evCheck.checked;
    data.warrantyCheckDays = parseInt($('warrantyCheckDays').value || '60', 10);
    data.insuranceReminderDays = parseInt($('insuranceReminderDays').value || '45', 10);
    return data;
  }

  function setData(data) {
    Object.keys(data || {}).forEach(function (k) {
      var el = $(k);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!data[k];
      else el.value = data[k];
    });
    evCheck.checked = !!data.isEv;
    updateEvFields();
  }

  // -----------------------------------------------------------------
  // Herstellerlogik: befüllt nur LEERE Felder, überschreibt nie eigene
  // Eingaben. Referenzdatum ist die Erstzulassung, ersatzweise das
  // Kaufdatum.
  // -----------------------------------------------------------------
  function applyManufacturerDefaults() {
    var name = manufacturerSelect.value;
    var baseProfile = MANUFACTURER_PROFILES[name];
    if (!baseProfile) { mfrInfoEl.hidden = true; variantField.hidden = true; return; }

    populateVariantField(name, baseProfile);
    var profile = getVariantProfile(baseProfile);

    var refDateStr = $('firstRegistration').value || $('purchaseDate').value;
    var refDate = parseDate(refDateStr);
    var filled = [];

    if (refDate) {
      if (profile.warrantyYears != null) {
        var warrantyEl = $('warrantyEnd');
        if (!warrantyEl.value) {
          warrantyEl.value = isoDate(addYears(refDate, profile.warrantyYears));
          if (!$('warrantyType').value) $('warrantyType').value = 'Herstellergarantie';
          filled.push('Garantie-Ende');
        }
      }
      if (evCheck.checked && profile.batteryYears != null) {
        var batteryEl = $('batteryWarrantyEnd');
        if (!batteryEl.value) {
          batteryEl.value = isoDate(addYears(refDate, profile.batteryYears));
          filled.push('Batteriegarantie-Ende');
        }
      }
    }

    // Info-Panel rendern
    var lines = [];
    if (profile.noOfficialWarranty) {
      lines.push('<li>⚠️ <strong>Keine offizielle Herstellergarantie in Deutschland</strong> – siehe Hinweis unten.</li>');
    } else {
      lines.push('<li>🛡️ Neuwagengarantie: <strong>' + (profile.warrantyYears != null ? profile.warrantyYears + ' Jahre' + (profile.warrantyKm ? ' / ' + fmtKm(profile.warrantyKm) : ' / ohne km-Begrenzung') : 'k. A.') + '</strong></li>');
      if (evCheck.checked && profile.batteryYears != null) {
        lines.push('<li>🔋 Batteriegarantie: <strong>' + profile.batteryYears + ' Jahre / ' + fmtKm(profile.batteryKm) + '</strong></li>');
      }
      lines.push('<li>🔧 Wartung: <strong>' + (profile.serviceType === 'variabel' ? 'variables Intervall' : 'festes Intervall') + '</strong>' + (profile.serviceKmHint ? ' – üblich ' + profile.serviceKmHint : ' – üblich ca. ' + profile.serviceMonths + ' Monate') + '</li>');
      if (baseProfile.extras) {
        baseProfile.extras.forEach(function (extra) {
          lines.push('<li>' + (extra.icon || '📌') + ' ' + extra.label + ': <strong>' + extra.years + ' Jahre' + (extra.km ? ' / ' + fmtKm(extra.km) : ' / ohne km-Begrenzung') + '</strong></li>');
        });
      }
      if (baseProfile.warrantyCheckDaysOverride) {
        lines.push('<li>⏰ Erinnerung vor Garantieablauf: <strong>' + baseProfile.warrantyCheckDaysOverride + ' Tage vorher</strong> (statt der üblichen Standardeinstellung)</li>');
      }
    }

    var html = '<h4>🏭 ' + name + ' – typische Richtwerte</h4>';
    if (filled.length) {
      html += '<p class="mfr-filled">✓ Automatisch eingetragen, da noch leer: ' + filled.join(', ') + '</p>';
    }
    html += '<ul>' + lines.join('') + '</ul>';
    html += '<p class="mfr-note">Richtwerte auf Basis öffentlicher Herstellerangaben' + (baseProfile.note ? ' – ' + baseProfile.note : '') + ' Maßgeblich sind immer Kaufvertrag, Serviceheft und Garantieunterlagen des eigenen Fahrzeugs.</p>';
    mfrInfoEl.innerHTML = html;
    mfrInfoEl.hidden = false;
    render();
  }

  function buildEvents(data) {
    var events = [];
    function add(date, title, desc, lead) {
      if (!date) return;
      events.push({ date: date, title: title, desc: desc, lead: lead || 7 });
    }
    var hu = parseDate(data.lastHu);
    if (hu) add(addMonths(hu, 24), 'HU / AU fällig', 'Hauptuntersuchung – Termin rechtzeitig vereinbaren.', 30);

    var oil = parseDate(data.lastOil);
    if (oil) {
      var oilMonths = parseInt(data.oilMonths || '12', 10);
      add(addMonths(oil, oilMonths), 'Ölwechsel / Ölservice', 'Zeitintervall seit dem letzten Ölwechsel. Zusätzlich Kilometerintervall beachten.', 21);
    }

    var service = parseDate(data.lastService);
    if (service) {
      var serviceMonths = parseInt(data.serviceMonths || '12', 10);
      add(addMonths(service, serviceMonths), 'Inspektion / Service', 'Nächsten Wartungstermin nach dem eingetragenen Intervall prüfen.', 30);
    }

    var tires = parseDate(data.lastTireChange);
    if (tires) {
      var tireMonths = parseInt(data.tireMonths || '6', 10);
      add(addMonths(tires, tireMonths), 'Reifenwechsel prüfen', 'Saisonwechsel einplanen und Reifen auf Zustand, Profiltiefe und Luftdruck prüfen.', 14);
      add(addDays(tires, 3), 'Radschrauben nachziehen', 'Nach einem Reifenwechsel setzen sich die Radschrauben in den ersten Kilometern minimal – nach ca. 50 km (meist nach wenigen Tagen erreicht) das Anzugsdrehmoment kontrollieren. Bei deutlich mehr oder weniger Fahrleistung selbst anpassen.', 1);
    }

    var profile = MANUFACTURER_PROFILES[data.manufacturer];
    var checkDays = (profile && profile.warrantyCheckDaysOverride) || data.warrantyCheckDays;

    var warranty = parseDate(data.warrantyEnd);
    if (warranty) {
      add(addDays(warranty, -checkDays), 'End of Warranty Check', 'Garantieablauf naht: Fahrzeug gründlich prüfen, Mängel dokumentieren und offene Garantiearbeiten rechtzeitig melden.', 14);
      add(warranty, 'Herstellergarantie endet', 'Garantieende – Bedingungen und noch offene Ansprüche prüfen.', 30);
    }
    var batteryWarranty = parseDate(data.batteryWarrantyEnd);
    if (data.isEv && batteryWarranty) {
      add(addDays(batteryWarranty, -checkDays), 'End of Battery Warranty Check', 'E-Auto: Hochvoltbatterie und relevante Garantiebedingungen vor Ablauf prüfen.', 14);
      add(batteryWarranty, 'Batteriegarantie endet', 'Ende der eingetragenen Batteriegarantie.', 30);
    }

    // Zusatzgarantien je Hersteller (Durchrostung, Lack, Rückhaltesysteme, ...) als eigene Termine
    var refDateExtras = parseDate(data.firstRegistration) || parseDate(data.purchaseDate);
    if (profile && profile.extras && refDateExtras) {
      profile.extras.forEach(function (extra) {
        var end = addYears(refDateExtras, extra.years);
        var kmText = extra.km ? ' (' + fmtKm(extra.km) + ')' : ' (ohne Kilometerbegrenzung)';
        add(addDays(end, -checkDays), 'End of ' + extra.label + ' Check', (extra.icon ? extra.icon + ' ' : '') + extra.label + ' läuft in Kürze ab' + kmText + ' – rechtzeitig prüfen lassen.', 14);
        add(end, extra.label + ' endet', (extra.icon ? extra.icon + ' ' : '') + extra.label + ' – Herstellerangabe: ' + extra.years + ' Jahre' + kmText + '.', 30);
      });
    }

    var insurance = parseDate(data.insuranceEnd);
    if (insurance) {
      add(addDays(insurance, -data.insuranceReminderDays), 'Kfz-Versicherung: Kündigung prüfen', 'Versicherungsvertrag prüfen und Kündigungsfrist beachten. Maßgeblich sind Vertrag und gesetzliche Regelungen.', 7);
    }

    var purchase = parseDate(data.purchaseDate);
    if (purchase) add(purchase, 'Kaufdatum / Fahrzeughistorie', 'Kaufdatum als persönlicher Referenzpunkt.', 1);

    var firstReg = parseDate(data.firstRegistration);
    if (firstReg && !hu) add(addMonths(firstReg, 36), 'Erste HU / AU (Richtwert)', 'Für einen Pkw gilt bei der ersten HU grundsätzlich ein dreijähriger Turnus; tatsächliche Fälligkeit anhand der Fahrzeugunterlagen prüfen.', 30);

    // Feste Saisonhinweise: bewusst als Planungshilfe, nicht als gesetzliche Pflicht.
    var year = new Date().getFullYear();
    add(new Date(year, 9, 15, 12), 'Winterreifen prüfen', 'Saisonaler Hinweis: Reifen und Wetterlage prüfen; keine starre gesetzliche Wechselpflicht.', 14);
    add(new Date(year + 1, 3, 1, 12), 'Sommerreifen prüfen', 'Saisonaler Hinweis: Reifen und Wetterlage prüfen.', 14);

    events.sort(function (a,b) { return a.date - b.date; });
    return events;
  }

  function render() {
    var data = getData();
    var events = buildEvents(data);
    eventsEl.innerHTML = '';
    countEl.textContent = events.length;
    if (!events.length) {
      eventsEl.innerHTML = '<div class="calendar-empty">Noch keine Termine. Tragen Sie oben die Daten Ihres Fahrzeugs ein.</div>';
      return events;
    }
    events.forEach(function (e) {
      var card = document.createElement('div');
      card.className = 'calendar-event';
      card.innerHTML = '<div class="calendar-event-date"><strong>' + fmt(e.date) + '</strong><span>Erinnerung ' + e.lead + ' Tage vorher</span></div>' +
        '<div class="calendar-event-main"><h3>' + e.title + '</h3><p>' + e.desc + '</p></div>';
      eventsEl.appendChild(card);
    });
    return events;
  }

  function downloadICS() {
    var data = getData();
    var events = buildEvents(data);
    if (!events.length) { statusEl.textContent = 'Bitte mindestens einen Termin eintragen.'; return; }
    var carName = [data.manufacturer, data.model].filter(Boolean).join(' ');
    var lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Autoknigge//Mein Auto-Kalender//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:' + escapeICS('Mein Auto-Kalender' + (carName ? ' – ' + carName : ''))];
    events.forEach(function (e) {
      var start = icsDate(e.date);
      var end = icsDate(addDays(e.date, 1));
      lines.push('BEGIN:VEVENT','UID:' + uuid() + '@autoknigge.de','DTSTAMP:' + icsDate(new Date()) + 'T120000Z','DTSTART;VALUE=DATE:' + start,'DTEND;VALUE=DATE:' + end,'SUMMARY:' + escapeICS(e.title),'DESCRIPTION:' + escapeICS(e.desc + (carName ? '\nFahrzeug: ' + carName : '') + (data.plate ? '\nKennzeichen: ' + data.plate : '')),'BEGIN:VALARM','TRIGGER:-P' + Math.max(0, e.lead) + 'D','ACTION:DISPLAY','DESCRIPTION:' + escapeICS(e.title),'END:VALARM','END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')], {type:'text/calendar;charset=utf-8'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mein-auto-kalender.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    statusEl.textContent = events.length + ' Termine als Kalenderdatei erstellt.';
  }

  function updateEvFields() { evFields.hidden = !evCheck.checked; }

  function handleInput() {
    render();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', function(){ updateEvFields(); handleInput(); });
  manufacturerSelect.addEventListener('change', applyManufacturerDefaults);
  variantSelect.addEventListener('change', applyManufacturerDefaults);
  $('firstRegistration').addEventListener('change', applyManufacturerDefaults);
  $('purchaseDate').addEventListener('change', applyManufacturerDefaults);
  evCheck.addEventListener('change', applyManufacturerDefaults);
  $('downloadICS').addEventListener('click', downloadICS);
  $('saveProfile').addEventListener('click', function(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(getData())); statusEl.textContent = 'Fahrzeugdaten wurden ausschließlich auf diesem Gerät gespeichert.'; });
  $('clearProfile').addEventListener('click', function(){ localStorage.removeItem(STORAGE_KEY); form.reset(); updateEvFields(); mfrInfoEl.hidden = true; render(); statusEl.textContent = 'Lokale Fahrzeugdaten wurden gelöscht.'; });

  try { var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (saved) setData(saved); } catch(e) {}
  updateEvFields();
  if (manufacturerSelect.value) applyManufacturerDefaults();
  render();
})();
