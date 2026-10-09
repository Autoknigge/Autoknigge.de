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
