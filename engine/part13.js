(function(){
  let C=null,scene=null,Mesh=null,RG=null,BM=null,startTimer=null,timer=null,holding=false,endTimer=null,mx=innerWidth/2,my=innerHeight/2;
  const rings=[];
  function init(){
    return;
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,300);return;}
    scene=C.scene;
    const sample=scene.children.find(o=>o.isMesh&&o.material);
    const ring=scene.children.find(o=>o.isMesh&&o.geometry?.type==='RingGeometry');
    const basic=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial');
    if(!sample||!ring||!basic){setTimeout(init,300);return;}
    Mesh=sample.constructor;RG=ring.geometry.constructor;BM=basic.material.constructor;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
    function isLaser(){const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));return a&&a.dataset.kind==='laser';}
    function make(p,y,delay){
      const m=new Mesh(new RG(4.4,6.4,48),new BM({color:0xff3a9a,transparent:true,opacity:.9,side:2,depthWrite:false,blending:2}));
      m.rotation.x=-Math.PI/2;m.position.set(p.x,y,p.z);scene.add(m);
      const t0=performance.now()+delay;
      const obj={m,t0,y,dead:false};rings.push(obj);
      function f(n){
        if(obj.dead)return;
        if(n<t0){requestAnimationFrame(f);return}
        const u=Math.min(1,(n-t0)/700);
        m.position.y=y*(1-u)+1.2*u;m.scale.setScalar(1+1.9*u);m.material.opacity=.9*(1-u);
        if(u<1)requestAnimationFrame(f);else{scene.remove(m);m.geometry.dispose();m.material.dispose();obj.dead=true;}
      }
      requestAnimationFrame(f);
    }
    function pulse(){
      if(!holding||!isLaser())return;
      let hit=null;try{hit=C.pickAt(mx,my);}catch(e){}
      if(!hit||!hit.point)return;
      const p=hit.point;
      for(const h of [155,118,81,44])make(p,h,(155-h)*0.55);
      if(rings.length>90){for(let i=0;i<rings.length-90;i++){const o=rings[i];if(!o.dead){o.dead=true;scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();}}rings.splice(0,rings.length-90);}
    }
    function cleanup(){
      for(const o of rings){if(!o.dead){o.dead=true;scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();}}
      rings.length=0;
    }
    function begin(px,py){
      if(!isLaser())return;
      if(px!=null)mx=px;if(py!=null)my=py;
      holding=true;
      if(startTimer)clearTimeout(startTimer);if(timer)clearInterval(timer);
      cleanup();
      startTimer=setTimeout(function(){if(!holding)return;pulse();timer=setInterval(pulse,70);},700);
    }
    function end(){holding=false;if(startTimer){clearTimeout(startTimer);startTimer=null}if(timer){clearInterval(timer);timer=null}cleanup();}
    window.addEventListener('pointerup',e=>{
      if(e.button!==0||!isLaser())return;
      begin(e.clientX,e.clientY);
      if(endTimer)clearTimeout(endTimer);
      endTimer=setTimeout(end,1800);
    },true);
    window.addEventListener('click',e=>{
      if(!e.target||e.target.tagName!=='CANVAS'||!isLaser())return;
      begin(e.clientX,e.clientY);
      if(endTimer)clearTimeout(endTimer);
      endTimer=setTimeout(end,1800);
    },true);
  }
  init();
})();