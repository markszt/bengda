(function(){
  let C=null,scene=null,Mesh=null,RG=null,BM=null,armed=false,group=null,rings=[],lastT=0;
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
    if(canvas)canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));
      if(a&&a.dataset.kind==='laser')armed=true;
    },true);
    lastT=performance.now();requestAnimationFrame(loop);
  }
  function findBeam(){
    let found=null;
    scene.traverse(o=>{
      if(found||!o.isGroup)return;
      for(const c of o.children){
        if(c.isMesh&&c.visible&&c.geometry?.type==='CylinderGeometry'&&c.scale.y>100){found=o;break;}
      }
    });
    return found;
  }
  function attach(g){
    group=g;rings=[];
    for(let i=0;i<8;i++){
      const m=new Mesh(new RG(4.4,6.4,48),new BM({color:0xff3a9a,transparent:true,opacity:.9,side:2,depthWrite:false,blending:2}));
      m.rotation.x=-Math.PI/2;m.position.set(0,150-i*19,0);g.add(m);
      rings.push({m});
    }
  }
  function cleanup(){
    for(const r of rings){try{r.m.parent&&r.m.parent.remove(r.m);r.m.geometry.dispose();r.m.material.dispose();}catch(e){}}
    rings=[];group=null;armed=false;
  }
  function loop(now){
    const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
    if(armed){
      const beam=findBeam();
      if(beam&&beam!==group)attach(beam);
      if(group&&beam){
        for(const r of rings){
          r.m.position.y-=55*dt;
          if(r.m.position.y<2)r.m.position.y=150;
        }
      } else if(!beam&&group){cleanup();}
    } else if(!armed&&group){cleanup();}
    requestAnimationFrame(loop);
  }
  init();
})();