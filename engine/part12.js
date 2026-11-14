(function(){
  let tries=0;
  const timer=setInterval(function(){
    if(!window.CAMPUS){ if(++tries>30)clearInterval(timer); return; }
    if(CAMPUS.state.lang==='de'){clearInterval(timer);return;}
    const d=document.querySelector('[data-lang="de"]');
    if(d)d.click();
    if(++tries>18)clearInterval(timer);
  },350);
})();