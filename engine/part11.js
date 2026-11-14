(function(){
  const css=document.createElement('style');
  css.textContent=`
  #menu-close{display:none!important;visibility:hidden!important;pointer-events:none!important}
  #menu-toggle{width:34px!important;height:138px!important;padding:16px 5px!important;top:37%!important;
    border:1px solid rgba(255,120,50,.55)!important;background:linear-gradient(180deg,rgba(30,20,14,.92),rgba(10,10,10,.92))!important;
    box-shadow:0 0 18px rgba(255,80,20,.22),inset 0 0 18px rgba(255,90,20,.08)!important;
    opacity:.5;animation:bengdaBreath 3.2s ease-in-out infinite!important;
    transition:transform .18s ease,opacity .25s ease,box-shadow .25s ease!important;transform-origin:right center!important}
  #menu-toggle span{font-size:24px!important;color:#ffb27a!important;text-shadow:0 0 10px rgba(255,100,40,.8)!important}
  #menu-toggle.open{display:none!important}
  #menu-toggle:hover{opacity:1!important;box-shadow:0 0 30px rgba(255,90,20,.5),inset 0 0 20px rgba(255,90,20,.15)!important}
  #menu-toggle.pulling{animation:bengdaPull .32s cubic-bezier(.2,1.4,.4,1)!important}
  @keyframes bengdaBreath{0%,100%{opacity:.34}50%{opacity:.88}}
  @keyframes bengdaPull{0%{transform:scaleY(1) scaleX(1)}35%{transform:scaleY(1.18) scaleX(1.45)}100%{transform:scaleY(1) scaleX(1)}}
  #bengda-hint{top:205px!important}
  `;
  document.head.appendChild(css);
  function boot(){
    if(!window.CAMPUS){setTimeout(boot,300);return;}
    const tab=document.getElementById('menu-toggle');
    if(tab){
      tab.addEventListener('click',()=>{tab.classList.remove('pulling');void tab.offsetWidth;tab.classList.add('pulling');setTimeout(()=>tab.classList.remove('pulling'),350);},true);
    }
    function run(){
      const intro=document.getElementById('intro');
      const hint=document.getElementById('bengda-hint');
      const open=intro&&!intro.classList.contains('hidden');
      if(hint) hint.style.visibility=open?'hidden':'visible';
      if(tab) tab.style.display=open?'none':'';
    }
    setInterval(run,250);run();
  }
  boot();
})();