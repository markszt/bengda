(function(){
  let C=null, plane=null, mesh=null, lastLang='';
  function init(){
    C=window.CAMPUS;
    if(!C||!C.scene){setTimeout(init,400);return;}
    C.scene.traverse(o=>{if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&Math.abs(o.position.y+20.4)<18&&o.material?.map)plane=o;});
    if(!plane){setTimeout(init,600);return;}
    plane.position.y=-5;
    plane.material.opacity=0; plane.material.transparent=true; plane.material.depthWrite=false;
    const sample=C.scene.children.find(o=>o.isMesh&&o.material);
    const BufGeo=Object.getPrototypeOf(Object.getPrototypeOf(sample.geometry)).constructor;
    const BufAttr=sample.geometry.attributes.position.constructor;
    const Mesh=sample.constructor;
    const Mat=(C.scene.children.find(o=>o.isMesh&&o.material?.type==='MeshStandardMaterial')||sample).material.constructor;
    function build(){
      const lang=C.state.lang||'en';
      const cv=document.createElement('canvas');cv.width=2048;cv.height=512;const g=cv.getContext('2d');
      g.clearRect(0,0,2048,512);g.textAlign='center';g.textBaseline='middle';
      const text=lang==='zh'?'为什么要这样破坏你的学校？':lang==='de'?'WARUM ZERSTÖRST DU DEINE SCHULE?':'WHY ARE YOU DESTROYING YOUR SCHOOL?';
      g.font='900 112px "Helvetica Neue",Arial,sans-serif';g.fillStyle='#fff';g.fillText(text,1024,210);
      g.font='800 42px "Helvetica Neue",Arial,sans-serif';g.fillStyle='#fff';g.fillText(lang==='zh'?'哒学 · 熔岩层':lang==='de'?'CAMPUS · LAVASCHICHT':'CAMPUS · LAVA LAYER',1024,335);
      const data=g.getImageData(0,0,2048,512).data;
      const step=4, W=460, H=115, bs=2.6, pos=[], nor=[];
      const cube=(cx,cy,cz,sz)=>{const h=sz/2;const q=[[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h],[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h]];const f=[[0,1,2,3,0,0,1],[5,4,7,6,0,0,-1],[1,5,6,2,1,0,0],[4,0,3,7,-1,0,0],[3,2,6,7,0,1,0],[4,5,1,0,0,-1,0]];for(const [a,b,c,d,nx,ny,nz] of f)for(const k of [a,b,c,a,c,d]){pos.push(cx+q[k][0],cy+q[k][1],cz+q[k][2]);nor.push(nx,ny,nz)}};
      let n=0;
      for(let y=0;y<512;y+=step)for(let x=0;x<2048;x+=step){if(data[(y*2048+x)*4+3]>120){cube((x/2048-.5)*W,(.5-y/512)*H,1.3,bs);n++;}}
      const geo=new BufGeo();geo.setAttribute('position',new BufAttr(new Float32Array(pos),3));geo.setAttribute('normal',new BufAttr(new Float32Array(nor),3));
      if(mesh){plane.remove(mesh);mesh.geometry.dispose();}
      mesh=new Mesh(geo,new Mat({color:0xffe2b0,emissive:0xff7a22,roughness:.45,metalness:0}));
      mesh.position.z=.2;plane.add(mesh);lastLang=lang;
      console.log('lava text',lang,n);
    }
    build();setInterval(()=>{if(C.state.lang!==lastLang)build();},600);
    document.querySelectorAll('.lang').forEach(b=>b.addEventListener('click',()=>setTimeout(build,500)));
  }
  init();
})();