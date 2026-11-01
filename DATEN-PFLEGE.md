# Datenpflege autoknigge.de (Stand: 01.11.2026)

Ziel: Alle Datums-Angaben der Seite sind ehrlich und einheitlich. Ein Datum wird nur geändert, wenn der Inhalt der Seite wirklich geprüft oder überarbeitet wurde. Ein Datum ohne Prüfung gaukelt Aktualität vor, das schadet Lesern und dem Ruf bei Google.

## Wo Daten stehen
1. `dateModified` im JSON-LD jeder Artikel- und Tool-Seite (für Suchmaschinen).
2. `<lastmod>` je Seite in `sitemap.xml`.
3. Sichtbare Angaben in der Seite: „Stand der Seite: TT.MM.JJJJ“, „geprüft am …“, „Zuletzt aktualisiert: Monat JJJJ“, Quellenangaben mit „Stand: Monat JJJJ“.
4. `mein-auto-kalender.ics` (Kalenderdatei, `DTSTAMP`) und feste Fristen im Text.
5. Startseite: Abschnitt „Aktuell überarbeitet“ (sollte die zuletzt geprüften Seiten zeigen).

## Werkzeug
```
python3 tools/stand.py report          # Übersicht aller Seiten, Abweichungen, Seiten älter als 60 Tage
python3 tools/stand.py report --alt 30 # strenger: älter als 30 Tage
python3 tools/stand.py sync            # sitemap.xml an die dateModified-Angaben angleichen
python3 tools/stand.py set SEITE.html 2026-11-15   # alle Datums-Stellen einer geprüften Seite setzen
```
Nach jeder Prüfung: Seite lesen, Inhalte korrigieren, dann `set`, dann Eintrag im Protokoll unten.

## Rhythmus
- **Monatlich (Anfang des Monats):** `report` laufen lassen, alle Seiten mit Hinweis prüfen.
- **Fristen und Zahlen** (siehe Liste) jeweils vor dem Termin prüfen.
- **Jahreswechsel:** Beträge, Grenzwerte, Bußgelder, Prämien, Beitragssätze, Jahreszahlen im Titel.

## Seiten mit festen Terminen oder schnell veraltenden Zahlen
| Seite | Was prüfen | Wann |
|---|---|---|
| artikel-thg-praemie.html | Meldefrist 15. November, Prämienhöhen der Anbieter | vor 15.11., danach Jahreswechsel |
| artikel-kfz-versicherung-wechseln.html | Wechsel-Stichtag 30. November | Oktober und November |
| artikel-e-auto-kaufpraemie.html | Förderstand, Fristen (z. B. bis 31.12.2026) | monatlich |
| artikel-e-auto-vs-benziner.html | Tankrabatt-Hinweis (`data-until="2026-12-31"`): läuft zum 31.12.2026 aus, danach entfernen | Dezember |
| artikel-maut-vignetten-ausland.html, artikel-umweltplakette*.html | Vignettenpreise, Umweltzonen | quartalsweise, Jahreswechsel |
| artikel-ladekarten-vergleich.html, wallbox.html, elektroauto-reichweite-laden.html | Tarife, Förderungen, Ladepreise | monatlich |
| artikel-bussgeldkatalog.html, bussgeldrechner.html | Bußgelder, Punkte | bei Rechtsänderung, Jahreswechsel |
| artikel-pannenstatistik.html, artikel-zulassungszahlen.html | Neue Jahreszahlen (ADAC, KBA) | jährlich, ADAC ca. April |
| artikel-typklassen.html, regionalklassen.html, sf-klassen-rechner.html | Typ-/Regionalklassen (GDV, jährlich im Herbst) | Oktober bis November |
| mein-auto-kalender.html / .ics | Beispieltermine, Hinweise | jährlich |

## Protokoll
| Datum | Was | Wer |
|---|---|---|
| 01.11.2026 | Werkzeug `tools/stand.py` und diese Anleitung angelegt. sitemap.xml an die dateModified-Angaben der Seiten angeglichen (21 Einträge, vorher abweichend). Startseite und /apps/ in die Sitemap aufgenommen. Apps-Bereich mit „In Kürze bei Google Play“ auf Startseite, /apps/, Menü und Fußzeile. Es wurden **keine** Inhalte neu geprüft, daher keine „Stand“-Angaben der Artikel geändert. | Claude |

Offene Punkte aus dem ersten Bericht (01.11.2026): 8 Seiten fehlen in der sitemap.xml (artikel-gebrauchtwagen-historie-carvertical, artikel-kennzeichen-reservieren, artikel-kfz-versicherung-sparen, artikel-umweltplakette-ausland-maut, artikel-zweitwagen-versicherung, online-zulassung; suche und upload-x7k2 bewusst nicht). Mehrere Seiten haben zwei verschiedene Stand-Angaben (z. B. artikel-e-auto-vs-benziner: 28.09., 11.10. und „Oktober“). Seiten ohne dateModified: Rechner, Quiz, Glossar, Datenschutz, Impressum.
