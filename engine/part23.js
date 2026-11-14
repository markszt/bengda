(function(){
  let timer=null,mx=innerWidth/2,my=innerHeight/2;
  window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  function laserActive(){const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));return a&&a.dataset.kind==='laser';}
  window.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()!=='e'||e.repeat||!laserActive())return;
    if(timer)clearInterval(timer);
    timer=setInterval(()=>{if(!laserActive())return;try{CAMPUS.fireAt(mx,my);}catch(err){}},1800);
  },true);
  window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e'&&timer){clearInterval(timer);timer=null;}},true);
  window.addEventListener('blur',()=>{if(timer){clearInterval(timer);timer=null;}});
})();