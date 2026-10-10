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
  var DEF={e:{vb:'17',ep:'0,32',vs:'750',st:'0',wa:'350',th:'300'},b:{vb:'7,5',ep:'2,20',vs:'800',st:'150',wa:'550',th:'0'},d:{vb:'6',ep:'2,20',vs:'800',st:'250',wa:'600',th:'0'}};
  function save(name,v){var part=!!v._p;delete v._p;var g=load(),nm=String(name||'').trim().slice(0,30);if(!nm)return {ok:false,msg:'Bitte zuerst eine Kurzbezeichnung eintragen, zum Beispiel „ID.3 Pro“.'};
    var i=g.findIndex(function(c){return String(c.name).toLowerCase()===nm.toLowerCase();});v.n=nm;var filled=false;
    if(i>=0){g[i]={name:nm,v:Object.assign({},g[i].v||{},v)};}else if(g.length>=10){return {ok:false,msg:'Du hast schon 10 Autos gespeichert. Lösche zuerst eines im Fahrzeugvergleich.'};}else{if(part){var d=DEF[v.a]||DEF.b,all=Object.assign({fo:'0',vb2:'18',ep2:'0,32',ea:'50'},d,v);v=all;filled=true;}g.unshift({name:nm,v:v});}
    try{localStorage.setItem(GK,JSON.stringify(g));}catch(e){return {ok:false,msg:'Speichern ist in diesem Browser gerade nicht möglich.'};}
    return {ok:true,msg:'„'+nm+'“ ist jetzt in deiner Garage und steht im Fahrzeugvergleich und in den anderen Rechnern bereit.'+(filled?' Verbrauch, Versicherung, Steuer und Wartung sind mit typischen Werten vorbelegt, bitte im Fahrzeugvergleich prüfen.':'')};}
  var css=document.createElement('style');
  css.textContent='.ak-gp{margin:0 0 1.1rem;padding:.7rem .9rem;border-radius:12px;background:#f4f8f6;border:1px dashed #9fb3aa;font-size:.92rem;line-height:1.5}.ak-gp b{display:block;margin-bottom:.35rem}.ak-gp select{width:100%;box-sizing:border-box;padding:.5rem .6rem;border:1px solid #cdd5d1;border-radius:10px;font:inherit;background:#fff}.ak-gp .ak-gm{display:block;margin-top:.4rem;font-size:.82rem;color:#425852}.ak-gp .ak-sv{margin-top:.7rem;padding-top:.6rem;border-top:1px dashed #9fb3aa}.ak-gp .ak-sv input{width:100%;box-sizing:border-box;padding:.5rem .6rem;border:1px solid #cdd5d1;border-radius:10px;font:inherit;background:#fff}.ak-gp .ak-sv button{margin-top:.5rem;padding:.5rem .9rem;border-radius:999px;border:1px solid #176246;background:#176246;color:#fff;font:inherit;font-weight:700;font-size:.9rem;cursor:pointer}';
  document.head.appendChild(css);
  window.akGarage={load:load,car:car,set:set,fmt:fmt,save:save,
    mount:function(anchor,fill,note,collect){
      if(!anchor)return;
      var box=document.createElement('div');box.className='ak-gp';
      var msg='',nameVal='';
      function svRow(){return collect?'<div class="ak-sv"><label for="akGpName" style="font-weight:700;font-size:.88rem">Dieses Auto speichern unter</label><input id="akGpName" type="text" maxlength="30" placeholder="Kurzbezeichnung, z. B. ID.3 Pro" value="'+nameVal.replace(/"/g,'&quot;')+'"><button type="button" class="ak-gsave">💾 In meiner Garage speichern</button><span class="ak-gm" aria-live="polite">'+msg+'</span></div>':'';}
      function render(){var g=load();
        if(!g.length){box.innerHTML='<b>🚗 Aus meiner Garage übernehmen</b>'+(collect?'Noch kein Auto gespeichert. Trage unten die Werte deines Autos ein, gib hier eine Kurzbezeichnung ein und speichere es. Dann steht es auch im <a class="content-link" href="fahrzeugvergleich.html">Fahrzeugvergleich</a> und in den anderen Rechnern bereit.':'Hier erscheinen Autos, die du im <a class="content-link" href="fahrzeugvergleich.html">Fahrzeugvergleich</a> speicherst. Dann musst du Preis und Verbrauch nicht noch einmal eintragen.')+svRow();wire();return;}
        box.innerHTML='<b>🚗 Aus meiner Garage übernehmen</b><select aria-label="Gespeichertes Auto übernehmen"><option value="">Auto wählen …</option>'+g.map(function(c,i){return '<option value="'+i+'">'+String(c.name).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';}).join('')+'</select><span class="ak-gm ak-pm" aria-live="polite"></span>'+svRow();wire();
      }
      function wire(){var sel=box.querySelector('select');
        if(sel)sel.addEventListener('change',function(){var c=load()[this.value];if(!c)return;var k=car(c);fill(k);
          box.querySelector('.ak-pm').textContent='„'+c.name+'“ übernommen.'+(k.hybrid&&note?' '+note:'');});
        var btn=box.querySelector('.ak-gsave'),inp=box.querySelector('#akGpName');
        if(btn)btn.addEventListener('click',function(){nameVal=inp.value;var r=save(nameVal,collect());msg=r.msg;if(r.ok){nameVal='';}render();});
        if(inp)inp.addEventListener('input',function(){nameVal=inp.value;});}
      render();anchor.parentNode.insertBefore(box,anchor);
      window.addEventListener('pageshow',render);
    }};
})();
