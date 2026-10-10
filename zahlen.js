/* Zahlen-Eingabe für Rechner: akzeptiert 0,3  0.3  ,3  und 35.000 / 1.234,5.
   Die Felder werden zu Textfeldern (Zahlentastatur am Handy), gelesen wird mit parseDE(feld). */
(function(){
  function parse(v){
    var el=null;
    if(v&&v.nodeType===1){el=v;v=el.value;}
    var s=String(v==null?'':v).trim().replace(/[\s €%]/g,'');
    if(!s)return NaN;
    var dec=el&&el.getAttribute('data-dp')==='1';
    if(s.indexOf(',')>-1){ s=s.replace(/\./g,'').replace(',','.'); }
    else if(!dec&&/^[1-9]\d{0,2}(\.\d{3})+$/.test(s)){ s=s.replace(/\./g,''); }
    if(!/^\d*\.?\d*$/.test(s)||s==='.')return NaN;
    return parseFloat(s);
  }
  window.parseDE=parse;
  [].forEach.call(document.querySelectorAll('input[type="number"]'),function(i){
    var d=i.getAttribute('value'),n=d==null||d===''?NaN:parse(d);
    if(!isNaN(n)&&(n<10||/[.,]/.test(d)))i.setAttribute('data-dp','1');
    i.type='text';i.setAttribute('inputmode','decimal');i.setAttribute('autocomplete','off');
  });
})();

/* Eingaben merken: Die zuletzt eingegebenen Werte bleiben auf diesem Gerät gespeichert (localStorage, nur im Browser) */
(function(){
  var P='ak-rechner:'+location.pathname.replace(/^\//,'')+':';
  function get(k){try{return localStorage.getItem(P+k);}catch(e){return null;}}
  function set(k,v){try{localStorage.setItem(P+k,v);}catch(e){}}
  var els=[].filter.call(document.querySelectorAll('input,select,textarea'),function(e){
    if(e.type==='button'||e.type==='submit'||e.type==='hidden')return false;
    if(e.id==='nav-toggle'||(e.closest&&e.closest('header,nav,footer')))return false; /* Menü- und Kopfzeilen-Elemente nie merken */
    return e.type==='radio'?!!e.name:!!e.id;});
  var key=function(e){return e.type==='radio'?'r:'+e.name:e.id;};
  try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('ak-rechner:')===0&&/:nav-toggle$/.test(k))localStorage.removeItem(k);});}catch(e){}
  var restored=[];
  els.forEach(function(e){
    var v=get(key(e));
    if(v===null)return;
    if(e.type==='radio'){if(e.value===v){e.checked=true;restored.push(e);}return;}
    if(e.type==='checkbox'){e.checked=v==='1';}
    else if(e.tagName==='SELECT'){if([].some.call(e.options,function(o){return o.value===v;}))e.value=v;else return;}
    else e.value=v;
    restored.push(e);
  });
  els.forEach(function(e){
    var save=function(){
      if(e.type==='radio'){if(e.checked)set(key(e),e.value);}
      else set(key(e),e.type==='checkbox'?(e.checked?'1':'0'):e.value);};
    e.addEventListener('input',save);e.addEventListener('change',save);
  });
  document.addEventListener('DOMContentLoaded',function(){
    restored.forEach(function(e){e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
    var main=document.querySelector('main');if(!main||!els.length)return;
    var d=document.createElement('p');d.style.cssText='text-align:right;font-size:.82rem;margin:.8rem 1rem;color:#53615b';
    d.innerHTML='Deine Eingaben werden nur auf diesem Gerät gespeichert. <a href="#" style="color:inherit;text-decoration:underline">↺ Eingaben zurücksetzen</a>';
    d.querySelector('a').addEventListener('click',function(ev){ev.preventDefault();
      try{Object.keys(localStorage).forEach(function(k){if(k.indexOf(P)===0)localStorage.removeItem(k);});}catch(e){}
      location.reload();});
    main.appendChild(d);
  });
})();
