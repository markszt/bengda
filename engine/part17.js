(function(){
  const STORM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 10-12h-6l1-8z"/></svg>';
  const NUKE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="2.2"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2"/></svg>';
  function labels(){
    const l=window.CAMPUS?CAMPUS.state.lang:'de';
    return l==='zh'?['雷暴','核弹']:l==='en'?['STORM','NUKE']:['GEWITTERWELLE','ATOMBOMBE'];
  }
  function run(){
    if(!window.CAMPUS)return;
    const b=[...document.querySelectorAll('.wbtn')]; if(b.length<8)return;
    const a=b[5], c=b[7], lab=labels();
    function set(el,kind,num,svg,label,aria){
      if(el.dataset.forced!==kind){
        el.innerHTML='<b>'+num+'</b>'+svg+'<span></span>';
        el.dataset.forced=kind;
      }
      const sp=el.querySelector('span');if(sp)sp.textContent=label;
      const nb=el.querySelector('b');if(nb)nb.textContent=num;
      el.dataset.kind=kind; el.setAttribute('aria-label',aria+' · '+num);
    }
    set(a,'storm','6',STORM,lab[0],'GEWITTERWELLE');
    set(c,'nuke','8',NUKE,lab[1],'ATOMBOMBE');
  }
  setInterval(run,300);run();
})();