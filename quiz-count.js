/* Füllt Zähler automatisch aus den echten Daten:
   <span data-quiz-count>     = Anzahl Fragen in quiz-data.js
   <span data-glossary-count> = Anzahl Begriffe in kfz-glossar.html */
(function(){
  function fill(sel,n){document.querySelectorAll(sel).forEach(function(e){e.textContent=n;});}
  function count(url,re,sel){
    fetch(url).then(function(r){return r.text();}).then(function(t){
      var m=t.match(re); if(m&&m.length)fill(sel,m.length);
    }).catch(function(){});
  }
  function run(){
    if(window.AK_QUESTIONS)fill('[data-quiz-count]',window.AK_QUESTIONS.length);
    else if(document.querySelector('[data-quiz-count]'))count('quiz-data.js',/\bcat\s*:/g,'[data-quiz-count]');
    if(document.querySelector('[data-glossary-count]'))count('kfz-glossar.html',/class="gl-term"/g,'[data-glossary-count]');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
