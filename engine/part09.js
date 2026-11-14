(function(){
  const CSS=`
  .wbtn{border-color:rgba(255,112,40,.55)!important;box-shadow:0 0 10px rgba(255,90,20,.20),inset 0 0 12px rgba(255,70,10,.06)}
  .wbtn svg{filter:drop-shadow(0 0 5px rgba(255,120,50,.75))}
  .wbtn span{color:#ffb07a!important}
  .wbtn.active{border-color:#ff8a3a!important;box-shadow:0 0 20px rgba(255,90,20,.45),inset 0 0 16px rgba(255,80,20,.15)}
  #bengda-coming{padding:8px 10px 10px;margin-bottom:10px;border-bottom:1px solid rgba(255,130,70,.22);font:800 10px/1.5 system-ui;letter-spacing:.08em;color:#ffb27a}
  #bengda-coming a{display:inline-block;margin-left:10px;color:#ffd0a0;text-decoration:none;border-bottom:1px dotted rgba(255,170,90,.5)}
  .cc-thumb img{filter:saturate(.9) contrast(.95)}
  `;
  const style=document.createElement('style');style.textContent=CSS;document.head.appendChild(style);
  function ready(){
    if(!window.CAMPUS){setTimeout(ready,400);return;}
    // default Chinese on first visit
    try{
      if(!localStorage.getItem('bengda-lang')){
        localStorage.setItem('bengda-lang','zh');
        const z=document.querySelector('[data-lang="zh"]'); if(z)setTimeout(()=>z.click(),350);
      }
    }catch(e){}
    document.querySelectorAll('.lang').forEach(b=>b.addEventListener('click',()=>{try{localStorage.setItem('bengda-lang',b.dataset.lang||'zh');}catch(e){}}));
    // share box extras
    function extras(){
      const box=document.querySelector('#share-modal .share-box');
      if(box&&!document.getElementById('bengda-coming')){
        const d=document.createElement('div');d.id='bengda-coming';
        d.innerHTML='敬请期待 · COMING SOON <a href="https://ko-fi.com/" target="_blank" rel="noopener">赞助 / Support</a>';
        box.insertBefore(d,box.firstChild);
      }
    }
    setInterval(extras,1600);extras();
    // camera floor at lava layer
    function clampCam(){
      try{
        if(CAMPUS.cam){
          if(CAMPUS.cam.target.y < -15.5) CAMPUS.cam.target.y = -15.5;
          if(CAMPUS.cam.target.y > 180) CAMPUS.cam.target.y = 180;
        }
      }catch(e){}
      requestAnimationFrame(clampCam);
    }requestAnimationFrame(clampCam);
    // 3D isometric map cards from OSM plan
    const cache={};
    function iso(id){
      if(cache[id])return cache[id];
      let all; try{all=JSON.parse(document.getElementById('campus-data').textContent);}catch(e){return null}
      const d=all[id]; if(!d)return null;
      const cv=document.createElement('canvas');cv.width=420;cv.height=260;const g=cv.getContext('2d');
      const grd=g.createLinearGradient(0,0,0,260);grd.addColorStop(0,'#9fb2bb');grd.addColorStop(1,'#6f8791');g.fillStyle=grd;g.fillRect(0,0,420,260);
      const cx=210,cy=145,s=0.40;
      const P=(x,z,y=0)=>[cx+(x-z)*0.55*s,cy+(x+z)*0.30*s-y*0.75];
      // ground diamond
      g.beginPath();[[-310,-310],[310,-310],[310,310],[-310,310]].forEach((q,i)=>{const p=P(q[0],q[1],-1);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath();g.fillStyle='#6f8b58';g.fill();g.strokeStyle='#8b6b44';g.lineWidth=4;g.stroke();
      for(const a of d.areas||[]){if(!a.p||a.p.length<3)continue;g.beginPath();a.p.forEach((q,i)=>{const p=P(q[0],q[1],0);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath();g.fillStyle=a.k==='water'?'#7fa9b4':a.k==='park'||a.k==='grass'?'#7f9962':'#8f8b7e';g.fill();}
      for(const r of d.roads||[]){if(!r.p||r.p.length<2)continue;g.beginPath();r.p.forEach((q,i)=>{const p=P(q[0],q[1],0);i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.strokeStyle='#303735';g.lineWidth=Math.max(1.2,(r.w||6)*s*.35);g.lineCap='round';g.stroke();}
      const bs=(d.buildings||[]).slice().sort((a,b)=>{const ca=(a.poly||[]).reduce((s,q)=>s+(q.x!==undefined?q.x:q[0])+(q.z!==undefined?q.z:q[1]),0);const cb=(b.poly||[]).reduce((s,q)=>s+(q.x!==undefined?q.x:q[0])+(q.z!==undefined?q.z:q[1]),0);return ca-cb;});
      for(const b of bs){
        const poly=(b.poly||[]).map(q=>Array.isArray(q)?{x:q[0],z:q[1]}:q); if(poly.length<3)continue;
        const H=Math.min(42,(b.h||10)*1.6);
        const base=poly.map(q=>P(q.x,q.z,0)), top=poly.map(q=>P(q.x,q.z,H));
        // shadow
        g.beginPath();base.forEach((p,i)=>i?g.lineTo(p[0]+6,p[1]+10):g.moveTo(p[0]+6,p[1]+10));g.closePath();g.fillStyle='rgba(20,30,22,.25)';g.fill();
        for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;g.beginPath();g.moveTo(base[i][0],base[i][1]);g.lineTo(base[j][0],base[j][1]);g.lineTo(top[j][0],top[j][1]);g.lineTo(top[i][0],top[i][1]);g.closePath();g.fillStyle=i%2?'#7d827e':'#9a9d96';g.fill();}
        g.beginPath();top.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();const pal=['#8fb9b1','#d2a06f','#7fa8c7','#a5b7a3','#c9b39b'];g.fillStyle=pal[(id.length+poly.length)%pal.length];g.fill();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.6;g.stroke();
      }
      // small trees
      g.fillStyle='#47673b';for(let i=0;i<90;i++){const x=-290+Math.random()*580,z=-290+Math.random()*580;const p=P(x,z,0);g.beginPath();g.arc(p[0],p[1],1.3+Math.random()*1.5,0,7);g.fill();}
      const url=cv.toDataURL('image/jpeg',.88);cache[id]=url;return url;
    }
    const BADGE_ID={FHAC:'aachen',FHDO:'dortmund',THK:'koeln',HAW:'hamburg',FRA:'frankfurt',HM:'muenchen',HFT:'stuttgart',THN:'nuernberg',HSH:'hannover',HSB:'bremen',HTWK:'leipzig',HTWD:'dresden',FHM:'muenster',FHBI:'bielefeld',THRO:'rosenheim',FHK:'kiel',FHE:'erfurt',FHP:'potsdam',FHMA:'mainz'};
    function maps(){
      document.querySelectorAll('.campus-card').forEach(card=>{
        const b=card.querySelector('.cc-badge');if(!b)return;const id=BADGE_ID[b.textContent.trim()];if(!id)return;
        const img=card.querySelector('.cc-thumb img');if(!img)return;
        try{const u=iso(id);if(u){if(img.dataset.three!==id){img.src=u;img.dataset.bengda=id;img.dataset.actual='1';img.dataset.three=id;}}}catch(e){}
      });
    }
    setInterval(maps,2200);maps();
  }
  ready();
})();