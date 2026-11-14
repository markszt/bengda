(function(){
  let C=null,scene=null,Mesh=null,RG=null,BM=null,startT=null,iv=null,rings=[],active=false;
  function init(){
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,300);return;}
    scene=C.scene;
    const sample=scene.children.find(o=>o.isMesh&&o.material);
    const ring=scene.children.find(o=>o.isMesh&&o.geometry?.type==='RingGeometry');
    const basic=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial');
    if(!sample||!ring||!basic){setTimeout(init,300);return;}
    Mesh=sample.constructor;RG=ring.geometry.constructor;BM=basic.material.constructor;
    const canvas=document.querySelector('#stage canvas')||document.querySelector('canvas');
    if(!canvas){setTimeout(init,400);return;}
    canvas.addEventListener('pointerup',e=>{
      if(e.button!==0)return;
      const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));
      if(!a||a.dataset.kind!=='laser')return;
      let hit=null;try{hit=C.pickAt(e.clientX,e.clientY);}catch(err){}
      if(!hit||!hit.point)return;
      start(hit.point.clone());
    },true);
  }
  function clear(){
    active=false;
    if(startT){clearTimeout(startT);startT=null;}
    if(iv){clearInterval(iv);iv=null;}
    for(const o of rings){o.dead=true;try{scene.remove(o.m);o.m.geometry.dispose();o.m.material.dispose();}catch(e){}}
    rings=[];
  }
  function make(p,y,delay){
    const m=new Mesh(new RG(4.4,6.4,48),new BM({color:0xff3a9a,transparent:true,opacity:.9,side:2,depthWrite:false,blending:2}));
    m.rotation.x=-Math.PI/2;m.position.set(p.x,y,p.z);scene.add(m);
    const o={m,dead:false};rings.push(o);
    const t0=performance.now()+delay;
    function f(n){if(o.dead)return;if(n<t0){requestAnimationFrame(f);return}const u=Math.min(1,(n-t0)/700);m.position.y=y*(1-u)+1.2*u;m.scale.setScalar(1+1.9*u);m.material.opacity=.9*(1-u);if(u<1)requestAnimationFrame(f);else{o.dead=true;scene.remove(m);m.geometry.dispose();m.material.dispose();}}
    requestAnimationFrame(f);
  }
  function start(p){return;

    clear();active=true;
    for(let i=0;i<26;i++){
      const h=150-((i*11)%140);
      make(p,h,700+i*55);
    }
    startT=setTimeout(()=>{clear();},3200);
  }
  init();
})();