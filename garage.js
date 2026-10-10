/* Meine Garage: Autos, die im Fahrzeugvergleich gespeichert wurden, in anderen Rechnern übernehmen (localStorage, nur im Browser) */
(function(){
  var GK='ak-garage:e-auto-vs-benziner';
  function load(){try{var g=JSON.parse(localStorage.getItem(GK)||'[]');return Array.isArray(g)?g:[];}catch(e){return [];}}
  function n(v,d){var x=typeof parseDE==='function'?parseDE(String(v==null?'':v)):parseFloat(String(v).replace(',','.'));return isFinite(x)?x:(d===undefined?0:d);}
  function fmt(x){x=Math.round(x*1000)/1000;return Number.isInteger(x)?String(x):String(x).replace('.',',');}
  /* Werte eines gespeicherten Autos in Rechenwerte umsetzen */
  function car(c){var v=c.v||{},a=v.a||'b',l=n(v.l),k=String(v.k||'').trim()===''?l:n(v.k),vb=n(v.vb),ep=n(v.ep),vb2=n(v.vb2),ep2=n(v.ep2),ea=Math.min(100,Math.max(0,n(v.ea,50)))/100;
    var verb=vb,preis=ep;
    if(a==='p'){var eq=ep>0?(1-ea)*vb+ea*vb2*ep2/ep:vb;verb=eq;preis=ep;}
    return {name:c.name,type:a,drive:a==='e'?'e':a==='d'?'d':'b',list:l,price:k,verb:verb,preis:preis,ins:n(v.vs),tax:n(v.st),maint:n(v.wa),hybrid:a==='p'};}
  function set(id,val){var e=document.getElementById(id);if(!e)return;
    if(e.type==='checkbox'){e.checked=!!val;}else e.value=val;
    e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}
  var css=document.createElement('style');
  css.textContent='.ak-gp{margin:0 0 1.1rem;padding:.7rem .9rem;border-radius:12px;background:#f4f8f6;border:1px dashed #9fb3aa;font-size:.92rem;line-height:1.5}.ak-gp b{display:block;margin-bottom:.35rem}.ak-gp select{width:100%;box-sizing:border-box;padding:.5rem .6rem;border:1px solid #cdd5d1;border-radius:10px;font:inherit;background:#fff}.ak-gp .ak-gm{display:block;margin-top:.4rem;font-size:.82rem;color:#425852}';
  document.head.appendChild(css);
  window.akGarage={load:load,car:car,set:set,fmt:fmt,
    mount:function(anchor,fill,note){
      if(!anchor)return;
      var box=document.createElement('div');box.className='ak-gp';
      function render(){var g=load();
        if(!g.length){box.innerHTML='<b>🚗 Aus meiner Garage übernehmen</b>Hier erscheinen Autos, die du im <a class="content-link" href="fahrzeugvergleich.html">Fahrzeugvergleich</a> speicherst. Dann musst du Preis und Verbrauch nicht noch einmal eintragen.';return;}
        box.innerHTML='<b>🚗 Aus meiner Garage übernehmen</b><select aria-label="Gespeichertes Auto übernehmen"><option value="">Auto wählen …</option>'+g.map(function(c,i){return '<option value="'+i+'">'+String(c.name).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';}).join('')+'</select><span class="ak-gm" aria-live="polite"></span>';
        box.querySelector('select').addEventListener('change',function(){var c=load()[this.value];if(!c)return;var k=car(c);fill(k);
          box.querySelector('.ak-gm').textContent='„'+c.name+'“ übernommen.'+(k.hybrid&&note?' '+note:'');});}
      render();anchor.parentNode.insertBefore(box,anchor);
      window.addEventListener('pageshow',render);
    }};
})();
