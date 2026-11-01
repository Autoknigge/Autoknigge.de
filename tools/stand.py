#!/usr/bin/env python3
"""Datenpflege fuer autoknigge.de: zeigt alle Datums-Angaben je Seite und setzt sie einheitlich.

  python3 tools/stand.py report [--alt TAGE]   Uebersicht, Abweichungen, veraltete Seiten (Standard: 60 Tage)
  python3 tools/stand.py sync                  gleicht sitemap.xml an die dateModified-Angaben der Seiten an
  python3 tools/stand.py set SEITE.html [JJJJ-MM-TT]   setzt alle Datums-Stellen einer Seite (Standard: heute)

Datums-Stellen je Seite:
  1. "dateModified" im JSON-LD der Seite
  2. <lastmod> in sitemap.xml
  3. sichtbare Angaben: "Stand der Seite: TT.MM.JJJJ", "geprueft am TT.MM.JJJJ",
     "Zuletzt aktualisiert: Monat JJJJ"
Wichtig: Nur setzen, wenn der Inhalt wirklich geprueft wurde (siehe DATEN-PFLEGE.md).
"""
import re, sys, os, datetime
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MON = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
RE_MOD = re.compile(r'("dateModified"\s*:\s*")(\d{4}-\d{2}-\d{2})(")')
RE_STAND = re.compile(r'((?:Stand der Seite|Stand der Prüfung|geprüft am|Stand)\s*:?\s*)(\d{2})\.(\d{2})\.(\d{4})')
RE_ZULETZT = re.compile(r'(Zuletzt aktualisiert:</strong>\s*)(' + '|'.join(MON) + r') (\d{4})')
RE_MONSTAND = re.compile(r'((?:Stand der Prüfung|Stand):\s*)(' + '|'.join(MON) + r') (\d{4})')

def read(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def write(p, t): open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(t)
def pages(): return sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))

def sitemap():
    t = read('sitemap.xml')
    return {m.group(1): m.group(2) for m in re.finditer(r'<loc>https://autoknigge\.de/([^<]*)</loc>\s*<lastmod>([^<]*)</lastmod>', t)}

def report(limit):
    sm = sitemap(); today = datetime.date.today(); rows = []
    for f in pages():
        t = read(f)
        mods = sorted(set(m.group(2) for m in RE_MOD.finditer(t)))
        vis = [f"{m.group(4)}-{m.group(3)}-{m.group(2)}" for m in RE_STAND.finditer(t)]
        vis += [f"{m.group(3)} {m.group(2)}" for m in RE_ZULETZT.finditer(t)]
        key = 'index.html' if f == 'index.html' else f
        sl = sm.get(f) or (sm.get('') if f == 'index.html' else None)
        if not (mods or vis or sl): continue
        newest = max(mods + ([sl] if sl else []) + [v for v in vis if re.match(r'\d{4}-\d{2}-\d{2}$', v)] or [''])
        flag = []
        if mods and sl and max(mods) != sl: flag.append('sitemap≠dateModified')
        if newest:
            age = (today - datetime.date.fromisoformat(newest)).days
            if age > limit: flag.append(f'älter als {limit} Tage ({age})')
        rows.append((f, ','.join(mods) or '-', sl or '-', '; '.join(vis) or '-', ' | '.join(flag)))
    print(f"{'Seite':45} {'dateModified':11} {'sitemap':10}  sichtbar / Hinweis")
    for r in rows: print(f"{r[0]:45} {r[1]:11} {r[2]:10}  {r[3]}" + (f"   <-- {r[4]}" if r[4] else ''))
    print(f"\n{len(rows)} Seiten mit Datums-Angaben, {sum(1 for r in rows if r[4])} mit Hinweis. Heute: {today}")
    missing = [f for f in pages() if f.replace('index.html','') not in sm and f not in ('404.html',)]
    if missing: print('Nicht in sitemap.xml:', ', '.join(missing))

def set_page(f, iso):
    d = datetime.date.fromisoformat(iso); n = 0
    t = read(f)
    t, c = RE_MOD.subn(lambda m: m.group(1) + iso + m.group(3), t); n += c
    t, c = RE_STAND.subn(lambda m: f"{m.group(1)}{d:%d.%m.%Y}", t); n += c
    t, c = RE_ZULETZT.subn(lambda m: f"{m.group(1)}{MON[d.month-1]} {d.year}", t); n += c
    t, c = RE_MONSTAND.subn(lambda m: f"{m.group(1)}{MON[d.month-1]} {d.year}", t); n += c
    write(f, t)
    s = read('sitemap.xml'); loc = 'https://autoknigge.de/' + ('' if f == 'index.html' else f)
    s, c = re.subn(r'(<loc>' + re.escape(loc) + r'</loc>\s*<lastmod>)[^<]*', lambda m: m.group(1) + iso, s); n += c
    write('sitemap.xml', s)
    print(f'{f}: {n} Stellen auf {iso} gesetzt')

def sync():
    s = read('sitemap.xml'); n = 0
    for f in pages():
        mods = [m.group(2) for m in RE_MOD.finditer(read(f))]
        if not mods: continue
        loc = 'https://autoknigge.de/' + ('' if f == 'index.html' else f)
        s, c = re.subn(r'(<loc>' + re.escape(loc) + r'</loc>\s*<lastmod>)(?!' + max(mods) + r')[^<]*', lambda m: m.group(1) + max(mods), s); n += c
    write('sitemap.xml', s); print(f'{n} sitemap-Einträge angeglichen')

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] == 'report':
        lim = int(a[a.index('--alt') + 1]) if '--alt' in a else 60
        report(lim)
    elif a[0] == 'sync': sync()
    elif a[0] == 'set' and len(a) >= 2:
        set_page(a[1], a[2] if len(a) > 2 else datetime.date.today().isoformat())
    else: print(__doc__)
