#!/usr/bin/env python3
"""Baut search-index.js aus den aktuellen HTML-Seiten neu auf (Artikel + Glossar)."""
import json,re,sys,os,html
from html.parser import HTMLParser
root=sys.argv[1] if len(sys.argv)>1 else '.'
old=open(os.path.join(root,'search-index.js'),encoding='utf-8').read()
old=json.loads(old[old.index('['):old.rindex(']')+1])
known={x['url']:x['cat'] for x in old if x['cat']!='Glossar'}
EXCL={'404.html','suche.html','datenschutz.html','impressum.html'}
pages=list(known.items())
for f in sorted(os.listdir(root)):
    if f.endswith('.html') and f not in known and f not in EXCL:
        t=open(os.path.join(root,f),encoding='utf-8').read()
        if len(t)<2500 and 'refresh' in t.lower(): continue
        pages.append((f,'Nützliche Tools' if f=='kfz-glossar.html' else 'Ratgeber')); print('NEU im Index:',f)
# Zusätzliche Stichwörter je Seite (Synonyme, Fachbegriffe, Umgangssprache) – werden unsichtbar dem Suchtext hinzugefügt
KEYWORDS={
 'artikel-wertverlust-restwert.html':'AfA Abschreibung Absetzung für Abnutzung Wertminderung Zeitwert Marktwert Fahrzeugwert Wertverfall Wiederverkaufswert Restwert Schwacke DAT Wertentwicklung',
 'dienstwagenrechner.html':'AfA Abschreibung Absetzung für Abnutzung Firmenwagen Firmenauto Geschäftswagen Dienstauto Fahrtenbuch 1 Prozent Regelung geldwerter Vorteil',
 'leasing-kauf-rechner.html':'AfA Abschreibung Restwert Wertverlust Mietkauf leasen',
 'auto-kostenrechner.html':'AfA Abschreibung Wertverlust Restwert Unterhaltskosten Betriebskosten Fixkosten',
 'artikel-reifen.html':'Schluffen Gummis Pneus Walzen Latschen Profiltiefe Reifendruck Bereifung',
 'artikel-bussgeldkatalog.html':'Knöllchen Strafzettel Verwarngeld Blitzer Geblitzt Raser Flensburg Punkte Lappen Ordnungswidrigkeit',
}
SKIP={'script','style','noscript','header','footer','nav','svg','button','form'}
class T(HTMLParser):
    def __init__(s): super().__init__(); s.d=0; s.out=[]; s.title=''; s.intitle=False; s.main=0
    def handle_starttag(s,t,a):
        if t=='title': s.intitle=True
        if t in SKIP: s.d+=1
        if t in('br','p','li','h1','h2','h3','h4','div','tr'): s.out.append(' ')
    def handle_endtag(s,t):
        if t=='title': s.intitle=False
        if t in SKIP and s.d>0: s.d-=1
    def handle_data(s,x):
        if s.intitle: s.title+=x
        elif s.d==0: s.out.append(x)
def clean(t): return re.sub(r'\s+',' ',html.unescape(t)).strip()
items=[]
for url,cat in pages:
    h=open(os.path.join(root,url),encoding='utf-8').read()
    p=T(); p.feed(h)
    m=re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"',h) or re.search(r'<meta[^>]+content="([^"]*)"[^>]+name="description"',h)
    title=clean(p.title); text=clean(' '.join(p.out))[:9000]
    items.append({'url':url,'title':title,'desc':clean(m.group(1)) if m else '','text':clean(title+' '+text)[:9500]+(' '+KEYWORDS.get(url,'') if url in KEYWORDS else ''),'cat':cat})
g=open(os.path.join(root,'kfz-glossar.html'),encoding='utf-8').read()
for m in re.finditer(r'<article class="gl-term" id="([^"]+)"([^>]*)>(.*?)</article>',g,re.S):
    id_,attrs,body=m.groups()
    am=re.search(r'data-alias="([^"]*)"',attrs); alias=am.group(1) if am else ''
    h3=re.search(r'<h3>(.*?)</h3>',body,re.S).group(1)
    sub=re.search(r'<span class="gl-sub">(.*?)</span>',h3,re.S)
    name=clean(re.sub(r'<span class="gl-sub">.*?</span>','',h3,flags=re.S)); subt=clean(sub.group(1)) if sub else ''
    title=name+(' ('+subt+')' if subt else '')
    pm=re.search(r'<p>(.*?)</p>',body,re.S); para=clean(re.sub('<[^>]+>','',pm.group(1))) if pm else ''
    first=re.split(r'(?<=[.!?])\s',para)[0]
    al=clean(alias or '')
    items.append({'url':'kfz-glossar.html#'+id_,'title':title,'desc':first,'text':clean(para+' '+al+' '+name+' '+subt),'cat':'Glossar'})
out='const AUTOKNIGGE_SEARCH_DATA='+json.dumps(items,ensure_ascii=False)+';'
open(os.path.join(root,'search-index.js'),'w',encoding='utf-8').write(out)
print(len(items),'Einträge;',sum(1 for i in items if i['cat']=='Glossar'),'Glossar')
