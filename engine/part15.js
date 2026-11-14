(function(){
  function run(){
    if(!window.CAMPUS)return;
    const started=CAMPUS.state.started;
    document.querySelectorAll('.langs,.lang-switch').forEach(el=>{
      const inIntro=!!el.closest('#intro');
      el.style.display=(started&&!inIntro)?'none':'';
    });
  }
  setInterval(run,250);run();
})();