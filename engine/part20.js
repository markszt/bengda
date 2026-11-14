(function(){
  const css=document.createElement('style');
  css.textContent=`#rank-sort{width:auto!important;min-width:150px!important;padding:6px 10px!important;font:800 10px/1.3 system-ui!important;letter-spacing:.04em!important;text-align:center!important}`;
  document.head.appendChild(css);
  function run(){
    if(!window.CAMPUS)return;
    const b=document.getElementById('rank-sort');if(!b)return;
    if(!b.dataset.order)b.dataset.order='min';
    const max=b.dataset.order==='max',l=CAMPUS.state.lang;
    b.textContent=l==='zh'?(max?'排序：血量最多':'排序：血量最少'):l==='de'?(max?'SORTIERUNG: MEISTE HP':'SORTIERUNG: WENIGSTE HP'):(max?'SORT: MOST HP':'SORT: LEAST HP');
    b.title=b.textContent;
  }
  setInterval(run,350);run();
})();