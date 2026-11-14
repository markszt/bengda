(function(){
  const css=document.createElement('style');
  css.textContent=`
  #menu-toggle{justify-content:center!important;align-items:center!important}
  #bengda-grade{min-width:0!important;padding:6px 10px!important}
  #bengda-grade .w,#bengda-grade .bar{display:none!important}
  .cb-head #rank-count{margin-left:auto}
  #fx-toggle{display:none!important;z-index:10000!important}
  body.playing #fx-toggle{display:block!important}
  #intro:not(.hidden) ~ #fx-toggle{display:none!important}
  body.playing #menu-toggle,
  body.playing #menu-toggle.open{display:flex!important;right:0!important;z-index:10000!important}
  `;
  document.head.appendChild(css);
  function stabilize(){
    if(!window.CAMPUS)return;
    const de=CAMPUS.state.lang==='de';
    const rh=document.querySelector('.cb-head b');if(rh&&de&&rh.textContent==='RANKING')rh.textContent='RANGLISTE';
    const count=document.getElementById('campus-count');
    if(count&&de)count.textContent=count.textContent.replace('CAMPUSES','CAMPUS');
  }
  setInterval(stabilize,400);stabilize();
})();