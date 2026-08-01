/**
 * Autoknigge Markenfigur "Knigge"
 * Sympathische Figur mit Outfit-Varianten + Sprechblase, automatisch auf jeder Seite.
 */
(function () {
  'use strict';

  var OUTFITS = {
    versicherung:  { c: '#d97706', o: 'shirt' },
    zulassung:     { c: '#64748b', o: 'shirt' },
    kauf:          { c: '#ea580c', o: 'shirt', item: 'magnifier' },
    pflege:        { c: '#059669', o: 'coveralls' },
    recht:         { c: '#b91c1c', o: 'shirt' },
    'geld-sparen': { c: '#ca8a04', o: 'shirt' },
    default:       { c: '#d97706', o: 'shirt' }
  };

  var SPEECH = {
    'sf-klassen':           { t: 'Praxistipp', m: 'Jedes unfallfreie Jahr verbessert die SF-Klasse – das spart richtig Geld!' },
    'sf-klassen-erklaert':  { t: 'Kurz erklärt', m: 'Je länger unfallfrei, desto niedriger der Beitrag.' },
    'telematik-tarife':     { t: 'Praxistipp', m: 'Ruhige Fahrweise kann bis zu 30 % Rabatt bringen.' },
    'fahranfaenger':        { t: 'Achtung!', m: 'Als Zweitwagen über die Eltern einstufen ist oft deutlich günstiger.' },
    'kfz-versicherung':     { t: 'Wussten Sie?', m: 'Jährlich prüfen und wechseln – der Treuebonus ist oft ein Mythos.' },
    'kfz-versicherung-sparen': { t: 'Praxistipp', m: 'Regionalklassen vergleichen – gleiche Stadt, anderer Preis.' },
    'regionalklassen':      { t: 'Kurz erklärt', m: 'Die Regionalklasse richtet sich nach dem Zulassungsbezirk.' },
    'e-auto-vs-benziner':   { t: 'Achtung!', m: 'Strompreis und Förderung mitrechnen – nicht nur den Kaufpreis.' },
    'gebrauchtwagen':       { t: 'Typischer Fehler', m: 'Unfallhistorie nie blind vertrauen – immer prüfen lassen!' },
    'pannenstatistik':      { t: 'Kurz erklärt', m: 'Zuverlässigkeit variiert stark – Recherche vor dem Kauf lohnt.' },
    'leasing':              { t: 'Achtung!', m: 'Restwert und Kilometerpaket genau prüfen – versteckte Kosten!' },
    'auto-verkaufen':       { t: 'Praxistipp', m: 'Wertgutachten und sauberer Kaufvertrag schützen vor Ärger.' },
    'e-auto-kaufpraemie':   { t: 'Kurz erklärt', m: 'Förderungen ändern sich oft – aktuell prüfen vor dem Kauf.' },
    'auto-waschen':         { t: 'Typischer Fehler', m: 'Heißwasser und aggressive Shampoos schaden der Lackierung.' },
    'innenraum':            { t: 'Praxistipp', m: 'Regelmäßige Pflege hält den Wert – ein Mikrofasertuch reicht.' },
    'rettungsgasse':        { t: 'Achtung!', m: 'Rettungsgasse schon vor dem Einsatzort bilden!' },
    'lichthupe':            { t: 'Typischer Fehler', m: 'Lichthupe zum Drängen ist verboten und kostet Punkte.' },
    'zweitwagen':           { t: 'Praxistipp', m: 'Über den Partner einstufen spart oft mehrere hundert Euro.' },
    'kennzeichen':          { t: 'Kurz erklärt', m: 'Online reservieren spart Zeit und oft auch Geld.' },
    'auto-anmelden':        { t: 'Achtung!', m: 'Alle Dokumente komplett mitbringen – sonst geht nichts.' },
    'auto-abmelden':        { t: 'Kurz erklärt', m: 'Abmeldung nur bei anerkannter Stelle oder online möglich.' },
    'auto-ummelden':        { t: 'Achtung!', m: 'Frist nach Umzug: 14 Tage – sonst wird es teuer!' },
    'zulassungszahlen':     { t: 'Kurz erklärt', m: 'Zulassungszahlen zeigen Trends – wichtig für den Wiederverkauf.' },
    default:                { t: 'Willkommen!', m: 'Ich begleite Sie durch alle Autoknigge-Themen.' }
  };

  function shade(hex, pct) {
    var n = parseInt(hex.replace('#', ''), 16);
    var a = Math.round(2.55 * pct);
    var R = Math.max(0, Math.min(255, (n >> 16) + a));
    var G = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + a));
    var B = Math.max(0, Math.min(255, (n & 0xff) + a));
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  function svg(cfg) {
    var skin = '#f5d4a8', skinD = shade(skin, -8), hair = '#3a2410';
    var main = cfg.c, dark = shade(cfg.c, -28);
    var o = cfg.o || 'shirt';

    var body = '';
    if (o === 'coveralls') {
      body = '<path d="M28 50 Q28 46 33 45 L44 45 L55 45 Q60 46 60 50 L60 66 L57 76 L31 76 L28 66 Z" fill="' + main + '" stroke="' + dark + '" stroke-width=".6"/>'
           + '<path d="M41 45 L47 45 L47 52 L41 52 Z" fill="' + skinD + '"/>'
           + '<rect x="33" y="48" width="3.5" height="5" rx="1" fill="' + dark + '"/>'
           + '<rect x="51.5" y="48" width="3.5" height="5" rx="1" fill="' + dark + '"/>';
    } else {
      body = '<path d="M28 50 Q28 46 33 45 L44 45 L55 45 Q60 46 60 50 L60 72 L28 72 Z" fill="' + main + '" stroke="' + dark + '" stroke-width=".5"/>'
           + '<path d="M40 45 L44 52 L48 45 Z" fill="#f0f0f0" stroke="' + dark + '" stroke-width=".4"/>';
    }

    var item = '';
    if (cfg.item === 'magnifier') {
      item = '<g transform="translate(1 52) rotate(-15)">'
           + '<circle cx="7" cy="7" r="6" fill="none" stroke="#444" stroke-width="1.8"/>'
           + '<line x1="11.5" y1="11.5" x2="16" y2="16" stroke="#444" stroke-width="2" stroke-linecap="round"/>'
           + '<circle cx="7" cy="7" r="4.5" fill="rgba(200,220,255,.3)"/>'
           + '</g>';
    }

    return '<svg viewBox="0 0 64 92" xmlns="http://www.w3.org/2000/svg" class="mascot-svg" aria-hidden="true">'
      + '<ellipse cx="32" cy="88" rx="18" ry="2.5" fill="rgba(0,0,0,.12)"/>'
      + '<path d="M26 72 L24 86 L30 86 L31 72 Z" fill="#2a3a30"/>'
      + '<path d="M38 72 L37 86 L43 86 L41 72 Z" fill="#2a3a30"/>'
      + '<ellipse cx="27" cy="86" rx="4.5" ry="2.2" fill="#2a1a0e"/>'
      + '<ellipse cx="40" cy="86" rx="4.5" ry="2.2" fill="#2a1a0e"/>'
      + body
      + '<path d="M28 50 Q20 56 18 64 Q17 67 20 67 Q23 65 25 58 Z" fill="' + skin + '"/>'
      + '<path d="M60 50 Q67 55 68 62 Q68 65 65 64 Q62 62 60 57 Z" fill="' + skin + '"/>'
      + '<circle cx="19" cy="65" r="3.2" fill="' + skin + '"/>'
      + '<circle cx="66" cy="63" r="3.2" fill="' + skin + '"/>'
      + item
      + '<rect x="40" y="40" width="8" height="7" fill="' + skinD + '"/>'
      + '<ellipse cx="44" cy="30" rx="13" ry="14" fill="' + skin + '"/>'
      + '<path d="M31 28 Q31 15 44 14 Q57 15 57 28 Q57 22 54 20 Q50 17 44 17 Q38 17 34 20 Q31 22 31 28 Z" fill="' + hair + '"/>'
      + '<ellipse cx="31" cy="31" rx="2.2" ry="2.8" fill="' + shade(skin, -5) + '"/>'
      + '<ellipse cx="57" cy="31" rx="2.2" ry="2.8" fill="' + shade(skin, -5) + '"/>'
      + '<circle cx="39" cy="29" r="2.1" fill="#fff"/><circle cx="49" cy="29" r="2.1" fill="#fff"/>'
      + '<circle cx="39.5" cy="29.5" r="1.2" fill="#2a1a0a"/><circle cx="49.5" cy="29.5" r="1.2" fill="#2a1a0a"/>'
      + '<circle cx="40" cy="29" r=".45" fill="#fff"/><circle cx="50" cy="29" r=".45" fill="#fff"/>'
      + '<path d="M36.5 25 Q39 24 41.5 25" stroke="' + hair + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>'
      + '<path d="M46.5 25 Q49 24 51.5 25" stroke="' + hair + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>'
      + '<ellipse cx="44" cy="34" rx="1.3" ry="1" fill="' + shade(skin, -12) + '"/>'
      + '<path d="M39.5 37 Q44 40 48.5 37" stroke="#8a4a2a" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
      + '<circle cx="35" cy="35" r="1.8" fill="rgba(232,140,100,.28)"/>'
      + '<circle cx="53" cy="35" r="1.8" fill="rgba(232,140,100,.28)"/>'
      + '</svg>';
  }

  function detect() {
    var p = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!p || p === 'index.html') return { type: 'home', cfg: OUTFITS.default };
    if (p.indexOf('kategorie-') === 0) {
      var cat = p.replace('kategorie-', '').replace('.html', '');
      return { type: 'cat', cfg: OUTFITS[cat] || OUTFITS.default };
    }
    if (p === 'regionalklassen.html' || p === 'sf-klassen-rechner.html' || p === 'online-zulassung.html')
      return { type: 'sub', cfg: OUTFITS.zulassung };
    if (p.indexOf('artikel-') === 0) {
      if (/(versicherung|sf-klassen|telematik|fahranfaenger|regionalklassen|zweitwagen)/.test(p)) return { type: 'sub', cfg: OUTFITS.versicherung };
      if (/(anmelden|abmelden|ummelden|kennzeichen|zulassung)/.test(p)) return { type: 'sub', cfg: OUTFITS.zulassung };
      if (/(e-auto|gebrauchtwagen|pannenstatistik|leasing|verkaufen|kaufpraemie)/.test(p)) return { type: 'sub', cfg: OUTFITS.kauf };
      if (/(waschen|innenraum)/.test(p)) return { type: 'sub', cfg: OUTFITS.pflege };
      if (/(rettungsgasse|lichthupe)/.test(p)) return { type: 'sub', cfg: OUTFITS.recht };
      if (/(sparen|wechseln)/.test(p)) return { type: 'sub', cfg: OUTFITS['geld-sparen'] };
      return { type: 'sub', cfg: OUTFITS.default };
    }
    return { type: 'sub', cfg: OUTFITS.default };
  }

  function speech() {
    var p = (location.pathname.split('/').pop() || '').toLowerCase();
    for (var k in SPEECH) { if (p.indexOf(k) >= 0) return SPEECH[k]; }
    return SPEECH.default;
  }

  function init() {
    var info = detect();
    var sp = speech();
    var el = document.createElement('div');
    el.className = info.type === 'home' ? 'mascot-home' : 'mascot-fixed';

    var h = '';
    if (info.type !== 'home') {
      h += '<div class="mascot-bubble" id="mascotBubble">'
         + '<span class="mascot-bubble-label">' + sp.t + '</span>'
         + '<span class="mascot-bubble-msg">' + sp.m + '</span>'
         + '</div>';
    }
    h += '<div class="mascot-figure" id="mascotFigure">' + svg(info.cfg) + '</div>';
    el.innerHTML = h;

    if (info.type === 'home') {
      var hero = document.querySelector('.hero');
      (hero || document.body).appendChild(el);
    } else {
      document.body.appendChild(el);
      var bubble = el.querySelector('#mascotBubble');
      var figure = el.querySelector('#mascotFigure');
      if (bubble) {
        setTimeout(function () { bubble.classList.add('mascot-bubble--hidden'); }, 8000);
        if (figure) figure.addEventListener('mouseenter', function () {
          bubble.classList.remove('mascot-bubble--hidden');
        });
        if (figure) figure.addEventListener('mouseleave', function () {
          bubble.classList.add('mascot-bubble--hidden');
        });
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
