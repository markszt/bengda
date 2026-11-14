(function(){
  let C=null,scene=null,Mesh=null,Cyl=null,Basic=null,group=null,rings=[],timer=null,startT=null,active=false,mx=innerWidth/2,my=innerHeight/2,last=0;
  function init(){
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,300);return;}
    scene=C.scene;
    const sample=scene.children.find(o=>o.isMesh&&o.material);
    const cyl=scene.children.find(o=>o.isMesh&&o.geometry?.type==='CylinderGeometry');
    const basic=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial');
    if(!sample||!cyl||!basic){setTimeout(init,300);return;}
    Mesh=sample.constructor;Cyl=cyl.geometry.constructor;Basic=basic.material.constructor;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(group)place();},{passive:true});
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()!=='e'||e.repeat)return;
      const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));
      if(!a||a.dataset.kind!=='laser')return;
      start();
    },true);
    window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e')stop();},true);
    window.addEventListener('blur',stop);
    requestAnimationFrame(loop);
  }
  function place(){
    let h=null;try{h=C.pickAt(mx,my);}catch(e){}
    if(!h||!h.point||!group)return;
    group.position.set(h.point.x,0,h.point.z);
  }
  function start(){
    stop();
    group=new (groupCtor())(),group.visible=false;scene.add(group);
    const mat=new Basic({color:0xff3a9a,transparent:true,opacity:.85,side:2,depthWrite:false,blending:2});
    for(const r of [1.8,5,12]){const m=new Mesh(new Cyl(r,r,520,18),mat);m.position.y=260;group.add(m);}
    place();
    startT=setTimeout(()=>{
      if(!group)return;active=true;group.visible=true;
      timer=setInterval(()=>{
        if(!active||!group)return;
        let h=null;try{h=C.pickAt(mx,my);}catch(e){}
        if(!h||!h.point)return;
        try{CAMPUS.blast(h.point.clone(),new (h.point.constructor)(0,1,0),{damage:1800,radius:28,killFrac:.55,releaseChance:.6,fire:24,dust:16,sparks:24,shake:.7,forceDig:true,popup:false,decal:false});}catch(e){}
        try{CAMPUS.digGround(h.point.x,h.point.z,32,32);}catch(e){}
      },100);
    },700);
  }
  function groupCtor(){return scene.children.find(o=>o.isGroup)?.constructor||Object;}
  function stop(){
    active=false;if(startT){clearTimeout(startT);startT=null}if(timer){clearInterval(timer);timer=null}
    if(group){scene.remove(group);group=null;}
  }
  function loop(){if(active&&group)place();requestAnimationFrame(loop);}
  window.__stopHoldBeam=stop;
  init();
})();