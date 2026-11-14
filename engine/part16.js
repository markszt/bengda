(function(){
  let C=null,scene=null,Mesh=null,SG=null,BM=null,last=0;
  function init(){
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,300);return;}
    scene=C.scene;
    const sample=scene.children.find(o=>o.isMesh&&o.material);
    const sph=scene.children.find(o=>o.isMesh&&o.geometry?.type==='SphereGeometry');
    const basic=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial');
    if(!sample||!sph||!basic){setTimeout(init,300);return;}
    Mesh=sample.constructor;SG=sph.geometry.constructor;BM=basic.material.constructor;
    last=C.state.damage;
    function dome(p){
      const m=new Mesh(new SG(700,48,32,0,Math.PI*2,0,Math.PI/2),new BM({color:0xffc070,transparent:true,opacity:.12,side:2,depthWrite:false,blending:2}));
      m.position.set(p?p.x:0,0.6,p?p.z:0);scene.add(m);
      const t0=performance.now();
      function f(n){const u=Math.min(1,(n-t0)/1400);m.scale.setScalar(.25+1.15*u);m.material.opacity=.12*(1-u);if(u<1)requestAnimationFrame(f);else{scene.remove(m);m.geometry.dispose();m.material.dispose();}}
      requestAnimationFrame(f);
    }
    function watch(){
      const d=C.state.damage;
      if(window.__nukePending && d>last+500){
        window.__nukePending=false;
        try{C.state.timeScale=.32;C.state.timeScaleUntil=performance.now()+1500;}catch(e){}
        dome(window.__nukeTarget);
      }
      last=Math.max(last,d);
      requestAnimationFrame(watch);
    }
    requestAnimationFrame(watch);
    setInterval(()=>{
      const intro=document.getElementById('intro');
      const grade=document.getElementById('bengda-grade');
      if(grade&&intro&&!intro.classList.contains('hidden'))grade.style.display='none';
      const count=document.getElementById('campus-count');
    },300);
  }
  init();
})();