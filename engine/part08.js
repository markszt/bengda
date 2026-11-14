(function(){
  let C=null, scene=null, sample=null, Mesh=null, BufGeo=null, BufAttr=null, Mat=null, Basic=null;
  const rubble=[]; let lastDmg=0, mx=innerWidth/2,my=innerHeight/2;
  function boxGeo(w,h,d){
    const g=new BufGeo(),x=w/2,y=h/2,z=d/2,p=[],n=[];
    const f=(a,b,c,dd,nx,ny,nz)=>{for(const q of [a,b,c,a,c,dd]){p.push(q[0],q[1],q[2]);n.push(nx,ny,nz)}};
    f([-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z],0,0,1);f([x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z],0,0,-1);
    f([x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z],1,0,0);f([-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z],-1,0,0);
    f([-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z],0,1,0);f([-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z],0,-1,0);
    g.setAttribute('position',new BufAttr(new Float32Array(p),3));g.setAttribute('normal',new BufAttr(new Float32Array(n),3));return g;
  }
  function init(){
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,400);return}
    scene=C.scene; sample=scene.children.find(o=>o.isMesh&&o.material);
    if(!sample){setTimeout(init,400);return}
    BufGeo=Object.getPrototypeOf(Object.getPrototypeOf(sample.geometry)).constructor;
    BufAttr=sample.geometry.attributes.position.constructor;
    Mesh=sample.constructor;
    Mat=(scene.children.find(o=>o.isMesh&&o.material?.type==='MeshStandardMaterial')||sample).material.constructor;
    Basic=(scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial')||sample).material.constructor;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
    addNumbers(); addRubble(); addMeteorSmoke();
  }
  function addRings(){
    const ring=scene.children.find(o=>o.isMesh&&o.geometry?.type==='RingGeometry'); if(!ring)return;
    const RG=ring.geometry.constructor, BM=Basic;
    let timer=null;
    function pulse(){
      const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));
      if(!a||a.dataset.kind!=='laser'){return}
      let hit=null;try{hit=C.pickAt(mx,my)}catch(e){}
      if(!hit||!hit.point)return;
      const p=hit.point;
      const m=new Mesh(new RG(2.2,3.4,32),new BM({color:0xff4a9a,transparent:true,opacity:.75,side:2,depthWrite:false,blending:2}));
      m.rotation.x=-Math.PI/2; m.position.set(p.x,110,p.z); scene.add(m);
      const t0=performance.now();
      function f(n){const u=Math.min(1,(n-t0)/520);m.position.y=110*(1-u)+1.5*u;m.scale.setScalar(1+2.2*u);m.material.opacity=.75*(1-u);if(u<1)requestAnimationFrame(f);else{scene.remove(m);m.geometry.dispose();m.material.dispose()}}
      requestAnimationFrame(f);
    }
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()!=='e'||e.repeat)return;
      const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));
      if(!a||a.dataset.kind!=='laser')return;
      if(timer)clearInterval(timer);timer=setInterval(pulse,100);pulse();
    },true);
    window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e'&&timer){clearInterval(timer);timer=null}},true);
  }
  function addNumbers(){
    setInterval(()=>{
      const bs=[...document.querySelectorAll('.wbtn')];
      bs.forEach((b,i)=>{const n=b.querySelector('b');if(n)n.textContent=String(i+1)});
      const active=bs.findIndex(b=>b.classList.contains('active'));
      const wc=document.querySelector('.weapon-card'); if(wc){const n=wc.querySelector('.wc-num')||wc.querySelector('b'); if(n&&active>=0)n.textContent=String(active+1)}
    },400);
  }
  function addRubble(){
    let last=0;
    function spawn(x,z){
      const bs=(C.buildings||[]).filter(b=>{const bb=b.box;return bb&&Math.hypot((bb.min.x+bb.max.x)/2-x,(bb.min.z+bb.max.z)/2-z)<90});
      let total=0;
      for(const b of bs.slice(0,4)){
        for(let i=0;i<7&&total<40;i++){
          const bb=b.box; const cx=bb.min.x+Math.random()*(bb.max.x-bb.min.x); const cz=bb.min.z+Math.random()*(bb.max.z-bb.min.z); const cy=Math.max(.5,bb.min.y+Math.random()*Math.min(18,bb.max.y-bb.min.y));
          const s=.8+Math.random()*3.2;
          const col=[0x8d8a83,0x76736c,0x9a9388,0x6d665c][i%4];
          const m=new Mesh(boxGeo(s,s*(.5+Math.random()),s),new Mat({color:col,roughness:1}));
          m.position.set(cx,cy,cz); m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6); scene.add(m);
          rubble.push({m,vx:(Math.random()-.5)*8,vy:Math.random()*10+2,vz:(Math.random()-.5)*8,life:14,settled:false}); total++;
        }
      }
    }
    setInterval(()=>{
      const d=C.state.damage;
      if(d>lastDmg+80){let hit=null;try{hit=C.pickAt(mx,my)}catch(e){}
        if(hit&&hit.point)spawn(hit.point.x,hit.point.z); lastDmg=d;}
      else lastDmg=Math.max(lastDmg,d);
    },90);
    let lastT=performance.now();
    function tick(now){
      const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
      for(let i=rubble.length-1;i>=0;i--){
        const r=rubble[i];r.life-=dt;
        if(!r.settled){r.vy-=32*dt;r.m.position.x+=r.vx*dt;r.m.position.y+=r.vy*dt;r.m.position.z+=r.vz*dt;r.m.rotation.x+=dt*2;r.m.rotation.z+=dt*1.3;
          const g=C.terrainHeight?C.terrainHeight(r.m.position.x,r.m.position.z):0;
          if(r.m.position.y<g+.4){r.m.position.y=g+.4;r.vy*=-.25;r.vx*=.5;r.vz*=.5;if(Math.abs(r.vy)<1){r.settled=true}}
        }
        if(r.life<=0){scene.remove(r.m);r.m.geometry.dispose();r.m.material.dispose();rubble.splice(i,1)}
      }
      if(rubble.length>240){const r=rubble.shift();scene.remove(r.m);r.m.geometry.dispose();r.m.material.dispose()}
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function addMeteorSmoke(){
    const Sph=scene.children.find(o=>o.geometry?.type==='SphereGeometry'); if(!Sph)return;
    const SG=Sph.geometry.constructor, BM=Basic;
    const puffs=[];
    setInterval(()=>{
      if(!C.state.started)return;
      const meshes=[];scene.traverse(o=>{if(o.isMesh&&o.geometry?.type==='IcosahedronGeometry'&&o.position.y>15)meshes.push(o)});
      for(const o of meshes.slice(0,4)){
        const m=new Mesh(new SG(2.4,8,6),new BM({color:0x77726a,transparent:true,opacity:.28,depthWrite:false}));
        m.position.copy(o.position);scene.add(m);puffs.push({m,t:0});
      }
    },260);
    let last=performance.now();
    function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;
      for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.t+=dt;p.m.scale.setScalar(1+p.t*5);p.m.material.opacity=.28*(1-p.t/.9);if(p.t>.9){scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();puffs.splice(i,1)}}
      if(puffs.length>160){const p=puffs.shift();scene.remove(p.m);p.m.geometry.dispose();p.m.material.dispose()}
      requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  }
  init();
})();