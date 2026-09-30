(function () {
  'use strict';

  var STORAGE_KEY = 'autoknigge_mein_auto_v1'; // Altformat einzelnes Fahrzeug – wird bei Bedarf migriert
  var VEHICLES_KEY = 'autoknigge_mein_auto_vehicles_v1';
  var vehicles = [];
  var activeVehicleId = null;
  var vehicleTabsEl = document.getElementById('vehicleTabs');
  var vehicleEmptyEl = document.getElementById('vehicleEmpty');
  var vehicleNameInput = document.getElementById('vehicleName');
  var form = document.getElementById('carCalendarForm');
  var eventsEl = document.getElementById('calendarEvents');
  var countEl = document.getElementById('eventCount');
  var statusEl = document.getElementById('calendarStatus');
  var drivetrainSelect = document.getElementById('drivetrainType');
  function isEvDrivetrain() { var v = drivetrainSelect.value; return v === 'Elektro (BEV)' || v === 'Plug-in-Hybrid (PHEV)'; }
  var evFields = document.getElementById('evFields');
  var newCarCheck = document.getElementById('isNewCar');
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
    'Hyundai': { warrantyYears: 5, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'Bei reinen E-Modellen (IONIQ-Reihe) kommunizieren einzelne Long-Range-Varianten bis zu 200.000 km auf die Batterie – Modellangabe im eigenen Garantieheft prüfen.',
      variantLabel: 'Batterievariante (nur IONIQ-Modelle)',
      variants: {
        'Standard Range': { batteryYears: 8, batteryKm: 160000 },
        'Long Range': { batteryYears: 8, batteryKm: 200000 }
      },
      defaultVariant: 'Standard Range' },
    'Jeep': { warrantyYears: 2, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      extras: [ { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 7, km: null } ] },
    'Kia': { warrantyYears: 7, warrantyKm: 150000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'Die Batteriegarantie wurde für Modelljahr 2026 und neuer auf 8 Jahre/160.000 km angehoben (zuvor 7 Jahre/150.000 km); ältere Modelljahre bleiben bei 7 Jahren/150.000 km. Bei reinen E-Modellen (EV6/EV9) kommunizieren einzelne Long-Range-Varianten bis zu 200.000 km.',
      variantLabel: 'Batterievariante (nur EV-Modelle)',
      variants: {
        'Standard Range': { batteryYears: 8, batteryKm: 160000 },
        'Long Range': { batteryYears: 8, batteryKm: 200000 }
      },
      defaultVariant: 'Standard Range',
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
    'Polestar': { warrantyYears: 3, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 24, serviceKmHint: 'alle 30.000 km, je nachdem was zuerst eintritt', bevOnly: true },
    'Porsche': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Porsche LongLife)' },
    'Renault': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'Rolls-Royce': { warrantyYears: 4, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, warrantyCheckDaysOverride: 90, note: 'Garantie ab Erstverkauf bzw. Erstzulassung, je nachdem was früher eintritt, 4 Jahre ohne Kilometerbegrenzung.' },
    'SEAT': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12 },
    'smart': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12, note: 'smart wird seit dem Joint Venture mit Geely markenrechtlich unabhängig von Mercedes-Benz vermarktet – Garantiebedingungen im eigenen smart-Garantieheft prüfen.' },
    'Škoda': { warrantyYears: 2, warrantyKm: null, batteryYears: 8, batteryKm: 160000, serviceType: 'variabel', serviceMonths: 24, serviceKmHint: 'bis 30.000 km (Longlife)' },
    'Tesla': { warrantyYears: 4, warrantyKm: 80000, batteryYears: 8, batteryKm: 160000, serviceType: 'keine', serviceMonths: null,
      note: 'Tesla schreibt seit 2019 kein Wartungsintervall mehr vor (weder jährlich noch alle 2 Jahre) und koppelt die Garantie nicht an durchgeführte Services. Empfohlen werden nur freiwillige, zustandsabhängige Checks: Reifenrotation ca. alle 10.000–15.000 km, Innenraumfilter alle 2–3 Jahre, Bremsflüssigkeitstest ca. alle 2 Jahre.',
      variantLabel: 'Batterievariante',
      bevOnly: true,
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
    'Xiaomi': { warrantyYears: null, warrantyKm: null, batteryYears: null, batteryKm: null, serviceType: 'fest', serviceMonths: 12, noOfficialWarranty: true, bevOnly: true,
      note: 'Xiaomi steigt erst rund 2027 offiziell in den deutschen Markt ein. Aktuell in Deutschland verfügbare SU7/YU7 sind Importe einzelner Händler mit eigenen, unterschiedlichen Garantiepaketen – das ist nicht automatisch mit einer späteren offiziellen deutschen Herstellergarantie gleichzusetzen. Zum Vergleich nennt Xiaomi für den YU7 in China 5 Jahre/100.000 km Fahrzeuggarantie sowie 8 Jahre/160.000 km auf bestimmte Schlüsselkomponenten (u. a. Antrieb) – als reiner Anhaltspunkt, nicht als Zusage für ein Importfahrzeug. Es gibt daher bewusst keinen automatisch vorausgefüllten Richtwert – bitte die Angaben des jeweiligen Importeurs eintragen.' },
    'XPeng': { warrantyYears: 7, warrantyKm: 160000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 12,
      note: 'XPeng ist neu auf dem deutschen Markt – Bedingungen laut aktuellem Kundengarantie-Dokument des Vertragspartners prüfen. Seit 2026 bietet XPeng bei mehreren Modellen (u. a. G6, G7, G9L, GX) zusätzlich zur reinen Elektroversion einen EREV-Antrieb (Range-Extender mit kleinem Benzinmotor als Generator) an – kein reiner BEV-Hersteller mehr.',
      extras: [
        { key: 'rust', label: 'Durchrostungsgarantie', icon: '🛡️', years: 12, km: null },
        { key: 'paint', label: 'Lackgarantie', icon: '🎨', years: 3, km: null },
        { key: 'roadside', label: 'Mobilitätsgarantie / Pannenhilfe', icon: '🛟', years: 5, km: null }
      ] },
    'Leapmotor': { warrantyYears: 4, warrantyKm: 100000, batteryYears: 8, batteryKm: 160000, serviceType: 'fest', serviceMonths: 24,
      note: 'Beim kleinen T03 gelten nur 3 Jahre/100.000 km Fahrzeuggarantie statt der sonst üblichen 4 Jahre – Modellangabe prüfen. Leapmotor ist erst seit 2025/2026 in Deutschland aktiv, einige Modelle (C10, C16, B10) sind zusätzlich als EREV mit Range-Extender-Benzinmotor erhältlich, kein reiner BEV-Hersteller.' }
  };

  var variantSelect = $('vehicleVariant');
  var variantField = $('vehicleVariantField');
  var modelDatalist = $('modelSuggestions');

  // Gängige aktuelle Modelle je Hersteller – bewusst keine Vollständigkeit,
  // nur Tipp-Erleichterung per Autovervollständigung (datalist). Freie
  // Eingabe bleibt jederzeit möglich.
  var MODEL_SUGGESTIONS = {
    'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Junior'],
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q6 e-tron', 'Q8', 'e-tron GT'],
    'Bentley': ['Continental GT', 'Flying Spur', 'Bentayga'],
    'BMW': ['1er', '2er', '3er', '4er', '5er', '7er', 'X1', 'X2', 'X3', 'X5', 'X7', 'i4', 'iX1', 'iX3', 'iX'],
    'Bugatti': ['Chiron', 'Tourbillon'],
    'BYD': ['Dolphin', 'Seal', 'Seal U', 'Atto 3', 'Han', 'Tang'],
    'Citroën': ['C3', 'C3 Aircross', 'C4', 'C5 Aircross', 'ë-C4', 'Berlingo'],
    'Cupra': ['Born', 'Formentor', 'Leon', 'Terramar', 'Tavascan'],
    'Dacia': ['Sandero', 'Duster', 'Jogger', 'Spring'],
    'DS Automobiles': ['DS 3', 'DS 4', 'DS 7', 'DS 9'],
    'Ferrari': ['Roma', 'Purosangue', '296', 'SF90'],
    'Fiat': ['500', '500e', 'Panda', 'Tipo', '600'],
    'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Explorer', 'Capri', 'Mustang Mach-E'],
    'Hyundai': ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe', 'IONIQ 5', 'IONIQ 6', 'IONIQ 9'],
    'Jeep': ['Renegade', 'Compass', 'Avenger', 'Grand Cherokee'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento', 'EV3', 'EV6', 'EV9'],
    'Lamborghini': ['Urus', 'Revuelto', 'Temerario'],
    'Lancia': ['Ypsilon'],
    'Leapmotor': ['T03', 'B10', 'C10', 'C16'],
    'Maserati': ['Grecale', 'Levante', 'GranTurismo'],
    'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'MX-30'],
    'Mercedes-Benz': ['A-Klasse', 'C-Klasse', 'E-Klasse', 'S-Klasse', 'GLA', 'GLC', 'GLE', 'EQA', 'EQB', 'EQE', 'EQS'],
    'MG': ['MG3', 'MG4', 'MG5', 'ZS', 'HS'],
    'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Leaf'],
    'Opel': ['Corsa', 'Astra', 'Mokka', 'Grandland', 'Crossland'],
    'Peugeot': ['208', '2008', '308', '3008', '5008', 'e-208'],
    'Polestar': ['2', '3', '4'],
    'Porsche': ['911', '718', 'Macan', 'Cayenne', 'Panamera', 'Taycan'],
    'Renault': ['Clio', 'Captur', 'Megane', 'Austral', 'Scenic', '5 E-Tech'],
    'Rolls-Royce': ['Ghost', 'Phantom', 'Cullinan', 'Spectre'],
    'Škoda': ['Fabia', 'Scala', 'Octavia', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
    'SEAT': ['Ibiza', 'Arona', 'Leon', 'Ateca', 'Tarraco'],
    'smart': ['#1', '#3', '#5'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Toyota': ['Aygo X', 'Yaris', 'Corolla', 'C-HR', 'RAV4', 'bZ4X'],
    'Volkswagen': ['Polo', 'Golf', 'Tiguan', 'Touran', 'Passat', 'T-Roc', 'T-Cross', 'ID.3', 'ID.4', 'ID.5', 'ID.7'],
    'Volvo': ['EX30', 'EX40', 'EC40', 'XC60', 'XC90', 'V60', 'V90'],
    'Xiaomi': ['SU7', 'YU7'],
    'XPeng': ['G6', 'G9', 'P7']
  };

  function populateModelSuggestions(name) {
    modelDatalist.innerHTML = '';
    var list = MODEL_SUGGESTIONS[name];
    if (!list) return;
    list.forEach(function (m) {
      var opt = document.createElement('option');
      opt.value = m;
      modelDatalist.appendChild(opt);
    });
  }

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
    variantField.querySelector('label').firstChild.textContent = (profile.variantLabel || 'Batterievariante') + ' ';
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
    data.isEv = isEvDrivetrain();
    data.drivetrainType = drivetrainSelect.value;
    data.isNewCar = newCarCheck.checked;
    data.warrantyCheckDays = parseInt($('warrantyCheckDays').value || '60', 10);
    data.insuranceReminderDays = parseInt($('insuranceReminderDays').value || '45', 10);
    return data;
  }

  function vehicleLabel(v) {
    var name = (v.data && v.data.vehicleName || '').trim();
    if (name) return name;
    var mm = [v.data && v.data.manufacturer, v.data && v.data.model].filter(Boolean).join(' ');
    return mm || 'Unbenanntes Fahrzeug';
  }

  function loadVehicles() {
    try {
      var raw = JSON.parse(localStorage.getItem(VEHICLES_KEY) || 'null');
      if (raw && raw.vehicles && raw.vehicles.length) {
        vehicles = raw.vehicles;
        activeVehicleId = raw.activeId && vehicles.some(function (v) { return v.id === raw.activeId; }) ? raw.activeId : vehicles[0].id;
        return;
      }
    } catch (e) {}
    // Migration vom alten Einzel-Fahrzeug-Format, falls vorhanden
    try {
      var legacy = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (legacy) {
        var id = uuid();
        vehicles = [{ id: id, data: legacy }];
        activeVehicleId = id;
        saveVehicles();
        return;
      }
    } catch (e) {}
    vehicles = [];
    activeVehicleId = null;
  }

  function saveVehicles() {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify({ vehicles: vehicles, activeId: activeVehicleId }));
  }

  function getActiveVehicle() {
    return vehicles.filter(function (v) { return v.id === activeVehicleId; })[0] || null;
  }

  function persistActiveFormData() {
    var v = getActiveVehicle();
    if (!v) return;
    v.data = getData();
    saveVehicles();
  }

  function renderTabs() {
    vehicleTabsEl.innerHTML = '';
    vehicles.forEach(function (v) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'vehicle-tab' + (v.id === activeVehicleId ? ' active' : '');
      tab.innerHTML = '<span class="vt-name"></span><span class="vt-del" title="Dieses Fahrzeug löschen">×</span>';
      tab.querySelector('.vt-name').textContent = vehicleLabel(v);
      tab.addEventListener('click', function (ev) {
        if (ev.target.classList.contains('vt-del')) {
          ev.stopPropagation();
          deleteVehicle(v.id);
          return;
        }
        switchVehicle(v.id);
      });
      vehicleTabsEl.appendChild(tab);
    });
    var addTab = document.createElement('button');
    addTab.type = 'button';
    addTab.className = 'vehicle-tab vehicle-tab-add';
    addTab.textContent = '➕ Fahrzeug hinzufügen';
    addTab.addEventListener('click', addVehicle);
    vehicleTabsEl.appendChild(addTab);
    vehicleEmptyEl.hidden = vehicles.length > 0;
    form.hidden = vehicles.length === 0;
  }

  function switchVehicle(id) {
    if (id === activeVehicleId) return;
    persistActiveFormData();
    activeVehicleId = id;
    excludedKeys = {};
    saveVehicles();
    form.reset();
    var v = getActiveVehicle();
    if (v) setData(v.data || {});
    mfrInfoEl.hidden = true;
    renderTabs();
    render();
    statusEl.textContent = '';
  }

  function addVehicle() {
    persistActiveFormData();
    var id = uuid();
    vehicles.push({ id: id, data: {} });
    activeVehicleId = id;
    excludedKeys = {};
    saveVehicles();
    form.reset();
    updateEvFields();
    updateNewCarFields();
    mfrInfoEl.hidden = true;
    renderTabs();
    render();
    vehicleNameInput.focus();
    statusEl.textContent = 'Neues Fahrzeug angelegt – bitte Daten eintragen.';
  }

  function deleteVehicle(id) {
    var v = vehicles.filter(function (x) { return x.id === id; })[0];
    if (!v) return;
    if (!window.confirm('„' + vehicleLabel(v) + '" wirklich löschen? Alle zukünftigen Kalendertermine für dieses Fahrzeug werden entfernt.')) return;
    vehicles = vehicles.filter(function (x) { return x.id !== id; });
    if (activeVehicleId === id) {
      activeVehicleId = vehicles.length ? vehicles[0].id : null;
      excludedKeys = {};
      form.reset();
      if (activeVehicleId) setData(getActiveVehicle().data || {});
      mfrInfoEl.hidden = true;
    }
    saveVehicles();
    renderTabs();
    render();
    statusEl.textContent = 'Fahrzeug gelöscht.';
  }

  function setData(data) {
    Object.keys(data || {}).forEach(function (k) {
      var el = $(k);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!data[k];
      else el.value = data[k];
    });
    if (data.drivetrainType) drivetrainSelect.value = data.drivetrainType;
    newCarCheck.checked = !!data.isNewCar;
    updateEvFields();
    updateNewCarFields();
  }

  // -----------------------------------------------------------------
  // Herstellerlogik: befüllt nur LEERE Felder, überschreibt nie eigene
  // Eingaben. Referenzdatum ist die Erstzulassung, ersatzweise das
  // Kaufdatum.
  // -----------------------------------------------------------------
  function updateDrivetrainOptions(profile) {
    var options = drivetrainSelect.querySelectorAll('option');
    if (profile && profile.bevOnly) {
      drivetrainSelect.value = 'Elektro (BEV)';
      options.forEach(function (opt) { opt.disabled = (opt.value !== 'Elektro (BEV)' && opt.value !== ''); });
      drivetrainSelect.disabled = true;
    } else {
      options.forEach(function (opt) { opt.disabled = false; });
      drivetrainSelect.disabled = false;
    }
  }

  function applyManufacturerDefaults() {
    var name = manufacturerSelect.value;
    var baseProfile = MANUFACTURER_PROFILES[name];
    if (!baseProfile) { mfrInfoEl.hidden = true; variantField.hidden = true; modelDatalist.innerHTML = ''; updateDrivetrainOptions(null); return; }

    populateVariantField(name, baseProfile);
    populateModelSuggestions(name);
    updateDrivetrainOptions(baseProfile);
    updateEvFields();
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
      if (isEvDrivetrain() && profile.batteryYears != null) {
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
      if (isEvDrivetrain() && profile.batteryYears != null) {
        lines.push('<li>🔋 Batteriegarantie: <strong>' + profile.batteryYears + ' Jahre / ' + fmtKm(profile.batteryKm) + '</strong></li>');
      }
      lines.push('<li>🔧 Wartung: <strong>' + (profile.serviceType === 'keine' ? 'kein vorgeschriebenes Intervall' : profile.serviceType === 'variabel' ? 'variables Intervall' : 'festes Intervall') + '</strong>' + (profile.serviceType === 'keine' ? '' : profile.serviceKmHint ? ' – üblich ' + profile.serviceKmHint : ' – üblich ca. ' + profile.serviceMonths + ' Monate') + '</li>');
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

  var excludedKeys = {}; // persistiert über Re-Renders, welche Termine der Nutzer abgewählt hat
  function eventKey(e) { return e.title + '|' + isoDate(e.date); }

  function buildEvents(data) {
    var events = [];
    var HORIZON_YEARS = 8;
    function add(date, title, desc, lead) {
      if (!date) return;
      events.push({ date: date, title: title, desc: desc, lead: lead || 7 });
    }
    function addSeries(startDate, intervalMonths, maxYears, titleFn, descFn, lead) {
      if (!startDate || !intervalMonths) return;
      var count = Math.min(40, Math.ceil((maxYears * 12) / intervalMonths));
      for (var i = 1; i <= count; i++) {
        add(addMonths(startDate, intervalMonths * i), titleFn(i, count), descFn(i, count), lead);
      }
    }

    var hu = parseDate(data.lastHu);
    if (hu) addSeries(hu, 24, HORIZON_YEARS, function(i){ return 'HU / AU fällig' + (i>1?' (Termin '+i+')':''); }, function(){ return 'Hauptuntersuchung – Termin rechtzeitig vereinbaren.'; }, 30);

    var profile = getVariantProfile(MANUFACTURER_PROFILES[data.manufacturer] || {});
    var refDateNew = parseDate(data.firstRegistration) || parseDate(data.purchaseDate);

    if (data.isNewCar && refDateNew && profile.serviceType !== 'keine') {
      // Neuwagen: keine Historie vorhanden – komplette Service-Serie bis Garantieende (max. 8 Jahre)
      var svcMonths = profile.serviceMonths || 12;
      var warrantyYrs = Math.min(HORIZON_YEARS, profile.warrantyYears || HORIZON_YEARS);
      addSeries(refDateNew, svcMonths, warrantyYrs,
        function(i, count){ return 'Inspektion ' + i + ' von ' + count + ' (Garantie-Pflichtservice)'; },
        function(i, count){ return 'Regelmäßige Inspektion zum Erhalt der Herstellergarantie' + (data.manufacturer ? ' bei ' + data.manufacturer : '') + '. Turnus lt. Herstellerangabe: alle ' + svcMonths + ' Monate.'; },
        21);
      if (data.manufacturer === 'Tesla') {
        add(addMonths(refDateNew, 24), 'Freiwilliger Fahrzeug-Check (empfohlen)', 'Tesla schreibt keinen Service vor – empfohlen werden trotzdem gelegentliche Kontrollen: Bremsflüssigkeit, Reifen, Innenraumfilter. Kein Einfluss auf die Garantie.', 14);
      }
    } else if (data.isNewCar && refDateNew && profile.serviceType === 'keine') {
      add(addMonths(refDateNew, 24), 'Freiwilliger Fahrzeug-Check (empfohlen)', 'Dieser Hersteller schreibt keinen Service zum Garantieerhalt vor. Empfohlen werden trotzdem gelegentliche Kontrollen (Bremsflüssigkeit, Reifen, Filter).', 14);
    } else {
      var oil = parseDate(data.lastOil);
      if (oil) {
        var oilMonths = parseInt(data.oilMonths || '12', 10);
        addSeries(oil, oilMonths, HORIZON_YEARS, function(i){ return 'Ölwechsel / Ölservice' + (i>1?' (Termin '+i+')':''); }, function(){ return 'Zeitintervall seit dem letzten Ölwechsel. Zusätzlich Kilometerintervall beachten.'; }, 21);
      }
      var service = parseDate(data.lastService);
      if (service) {
        var serviceMonths = parseInt(data.serviceMonths || '12', 10);
        addSeries(service, serviceMonths, HORIZON_YEARS, function(i){ return 'Inspektion / Service' + (i>1?' (Termin '+i+')':''); }, function(){ return 'Nächsten Wartungstermin nach dem eingetragenen Intervall prüfen.'; }, 30);
      }
    }

    var tires = parseDate(data.lastTireChange);
    if (tires) {
      var tireMonths = parseInt(data.tireMonths || '6', 10);
      addSeries(tires, tireMonths, HORIZON_YEARS, function(i){ return 'Reifenwechsel prüfen' + (i>1?' (Termin '+i+')':''); }, function(){ return 'Saisonwechsel einplanen und Reifen auf Zustand, Profiltiefe und Luftdruck prüfen.'; }, 14);
      add(addDays(tires, 3), 'Radschrauben nachziehen', 'Nach einem Reifenwechsel setzen sich die Radschrauben in den ersten Kilometern minimal – nach ca. 50 km (meist nach wenigen Tagen erreicht) das Anzugsdrehmoment kontrollieren. Bei deutlich mehr oder weniger Fahrleistung selbst anpassen.', 1);
    }

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

    // THG-Prämie: jährlich wiederkehrend, nur für reine E-Autos (nicht PHEV) – die
    // gesetzliche Frist liegt beim Umweltbundesamt am 15. November, Anbieter wollen
    // meist deutlich früher eingereicht bekommen.
    if (drivetrainSelect.value === 'Elektro (BEV)') {
      var thgStartYear = new Date().getFullYear();
      for (var ty = 0; ty < HORIZON_YEARS; ty++) {
        add(new Date(thgStartYear + ty, 9, 15, 12), 'THG-Prämie beantragen',
          'Jährliche THG-Prämie für dein E-Auto beantragen – Frist beim Umweltbundesamt ist der 15. November, bei den meisten Anbietern früher. Details: autoknigge.de/artikel-thg-praemie.html',
          21);
      }
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
    if (firstReg && !hu) addSeries(addMonths(firstReg, 12), 24, HORIZON_YEARS,
      function(i){ return (i===1?'Erste HU / AU (Richtwert)':'HU / AU fällig (Termin '+i+')'); },
      function(i){ return i===1 ? 'Für einen Pkw gilt bei der ersten HU grundsätzlich ein dreijähriger Turnus; tatsächliche Fälligkeit anhand der Fahrzeugunterlagen prüfen.' : 'Hauptuntersuchung – Termin rechtzeitig vereinbaren.'; },
      30);

    // Feste Saisonhinweise für die gesamte Vorausschau, nicht nur das laufende Jahr.
    var year = new Date().getFullYear();
    for (var y = 0; y < HORIZON_YEARS; y++) {
      add(new Date(year + y, 9, 15, 12), 'Winterreifen prüfen', 'Saisonaler Hinweis: Reifen und Wetterlage prüfen; keine starre gesetzliche Wechselpflicht.', 14);
      add(new Date(year + 1 + y, 3, 1, 12), 'Sommerreifen prüfen', 'Saisonaler Hinweis: Reifen und Wetterlage prüfen.', 14);
    }

    events.sort(function (a,b) { return a.date - b.date; });
    return events;
  }

  function render() {
    if (!activeVehicleId) {
      eventsEl.innerHTML = '<div class="calendar-empty">Noch kein Fahrzeug angelegt. Lege oben dein erstes Fahrzeug an.</div>';
      countEl.textContent = '0 / 0';
      return [];
    }
    var data = getData();
    var events = buildEvents(data);
    eventsEl.innerHTML = '';
    var activeCount = events.filter(function(e){ return !excludedKeys[eventKey(e)]; }).length;
    countEl.textContent = activeCount + ' / ' + events.length;
    if (!events.length) {
      eventsEl.innerHTML = '<div class="calendar-empty">Noch keine Termine. Tragen Sie oben die Daten Ihres Fahrzeugs ein.</div>';
      return events;
    }
    events.forEach(function (e) {
      var key = eventKey(e);
      var checked = !excludedKeys[key];
      var card = document.createElement('label');
      card.className = 'calendar-event calendar-event-toggle' + (checked ? '' : ' is-excluded');
      card.innerHTML = '<input type="checkbox" class="calendar-event-check"' + (checked ? ' checked' : '') + '>' +
        '<div class="calendar-event-date"><strong>' + fmt(e.date) + '</strong><span>Erinnerung ' + e.lead + ' Tage vorher</span></div>' +
        '<div class="calendar-event-main"><h3>' + e.title + '</h3><p>' + e.desc + '</p></div>';
      var cb = card.querySelector('.calendar-event-check');
      cb.addEventListener('change', function () {
        if (cb.checked) { delete excludedKeys[key]; } else { excludedKeys[key] = true; }
        card.classList.toggle('is-excluded', !cb.checked);
        var n = events.filter(function (ev) { return !excludedKeys[eventKey(ev)]; }).length;
        countEl.textContent = n + ' / ' + events.length;
      });
      eventsEl.appendChild(card);
    });
    return events;
  }

  function downloadICS() {
    if (!activeVehicleId) { statusEl.textContent = 'Bitte zuerst ein Fahrzeug anlegen.'; return; }
    var data = getData();
    var events = buildEvents(data).filter(function (e) { return !excludedKeys[eventKey(e)]; });
    if (!events.length) { statusEl.textContent = 'Bitte mindestens einen Termin auswählen.'; return; }
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

  function updateEvFields() { evFields.hidden = !isEvDrivetrain(); }

  var newCarNote = document.getElementById('newCarNote');
  var huSection = document.getElementById('huSection');
  var serviceSection = document.getElementById('serviceSection');
  function updateNewCarFields() {
    var isNew = newCarCheck.checked;
    if (newCarNote) newCarNote.hidden = !isNew;
    if (huSection) huSection.hidden = isNew;
    if (serviceSection) serviceSection.hidden = isNew;
    if (isNew) {
      if ($('lastHu')) $('lastHu').value = '';
      if ($('lastOil')) $('lastOil').value = '';
      if ($('lastService')) $('lastService').value = '';
    }
  }

  function handleInput() {
    render();
    persistActiveFormData();
    var activeTab = vehicleTabsEl.querySelector('.vehicle-tab.active .vt-name');
    if (activeTab) activeTab.textContent = vehicleLabel(getActiveVehicle() || { data: {} });
  }

  form.addEventListener('input', handleInput);
  form.addEventListener('change', function(){ updateEvFields(); updateNewCarFields(); handleInput(); });
  newCarCheck.addEventListener('change', function(){ updateNewCarFields(); applyManufacturerDefaults(); });
  manufacturerSelect.addEventListener('change', applyManufacturerDefaults);
  variantSelect.addEventListener('change', applyManufacturerDefaults);
  $('firstRegistration').addEventListener('change', applyManufacturerDefaults);
  $('purchaseDate').addEventListener('change', applyManufacturerDefaults);
  drivetrainSelect.addEventListener('change', function(){ updateEvFields(); applyManufacturerDefaults(); });
  $('downloadICS').addEventListener('click', downloadICS);
  $('saveProfile').addEventListener('click', function(){ persistActiveFormData(); statusEl.textContent = 'Fahrzeugdaten wurden ausschließlich auf diesem Gerät gespeichert.'; });
  $('clearProfile').addEventListener('click', function(){ if (activeVehicleId) deleteVehicle(activeVehicleId); });

  loadVehicles();
  var initVehicle = getActiveVehicle();
  if (initVehicle) setData(initVehicle.data || {});
  renderTabs();
  updateEvFields();
  updateNewCarFields();
  if (manufacturerSelect.value) applyManufacturerDefaults();
  render();
})();
