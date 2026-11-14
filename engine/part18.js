(function(){
  const STORM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 10-12h-6l1-8z"/></svg>';
  const NUKE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="2.2"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2"/></svg>';
  function labels(){const l=CAMPUS.state.lang;return l==='zh'?['雷暴','核弹']:l==='en'?['STORM','NUKE']:['GEWITTERWELLE','ATOMBOMBE'];}
  function set(el,kind,num,svg,label){
    if(el.dataset.forceKind!==kind){el.innerHTML='<b>'+num+'</b>'+svg+'<span></span>';el.dataset.forceKind=kind;}
    const sp=el.querySelector('span');if(sp&&sp.textContent!==label)sp.textContent=label;
    const nb=el.querySelector('b');if(nb&&nb.textContent!==num)nb.textContent=num;
    el.dataset.kind=kind;el.setAttribute('aria-label',kind==='storm'?'GEWITTERWELLE · 6':'ATOMBOMBE · 8');
  }
  function run(){
    if(!window.CAMPUS)return;const bs=[...document.querySelectorAll('.wbtn')];if(bs.length<8)return;const l=labels();
    set(bs[5],'storm','6',STORM,l[0]);set(bs[7],'nuke','8',NUKE,l[1]);
  }
  function bind(){const dock=document.querySelector('.weapon-dock')||document.querySelector('.wbtn')?.parentElement;if(dock){new MutationObserver(run).observe(dock,{subtree:true,childList:true,characterData:true});}setInterval(run,120);setTimeout(run,600);setTimeout(run,1400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();