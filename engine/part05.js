(function () {
  const BADGE_ID = { FHAC:'aachen', FHDO:'dortmund', THK:'koeln', HAW:'hamburg', FRA:'frankfurt', HM:'muenchen', HFT:'stuttgart', THN:'nuernberg', HSH:'hannover', HSB:'bremen', HTWK:'leipzig', HTWD:'dresden', FHM:'muenster', FHBI:'bielefeld', THRO:'rosenheim', FHK:'kiel', FHE:'erfurt', FHP:'potsdam', FHMA:'mainz' };
  const NAMES = {
    aachen:['FH Aachen','亚琛哒学'], dortmund:['FH Dortmund','多特蒙德哒学'], koeln:['TH Köln','科隆哒学'], hamburg:['HAW Hamburg','汉堡哒学'], frankfurt:['Frankfurt UAS','法兰克福哒学'], muenchen:['HM München','慕尼黑哒学'], stuttgart:['HFT Stuttgart','斯图加特哒学'], nuernberg:['TH Nürnberg','纽伦堡哒学'], hannover:['HsH Hannover','汉诺威哒学'], bremen:['HS Bremen','不来梅哒学'], leipzig:['HTWK Leipzig','莱比锡哒学'], dresden:['HTW Dresden','德累斯顿哒学'], muenster:['FH Münster','明斯特哒学'], bielefeld:['FH Bielefeld','比勒费尔德哒学'], rosenheim:['TH Rosenheim','罗森海姆哒学'], kiel:['FH Kiel','基尔哒学'], erfurt:['FH Erfurt','爱尔福特哒学'], potsdam:['FH Potsdam','波茨坦哒学'], mainz:['FH Mainz','美因茨哒学'],
  };
  const WEAPONS = {
    zh:['霰弹','足球','激光','陨石','陨石雨','核弹','黑洞','雷暴'],
    en:['SHOTGUN','BALL','LASER','METEOR','SHOWER','NUKE','BLACKHOLE','STORM'],
    de:['SCHROT','BALL','LASER','METEOR','REGEN','NUKE','LOCH','STORM'],
  };
  const TIERS = [
    [0,'D','灰尘','Dusty'], [10,'C','开裂','Crumble'], [25,'B','推土机','Bulldozer'],
    [45,'A','清场','Annihilator'], [65,'S','粉碎风暴','Shatterstorm'], [85,'SS','地震级','Seismic'],
    [100,'SSS','全城毁灭','Supreme'],
  ];
  const CSS = `
  #bengda-grade{position:fixed;right:14px;top:14px;z-index:91;min-width:190px;padding:10px 14px;background:rgba(18,20,22,.9);border:1px solid #3a3030;color:#f5e8d8;font-family:system-ui,sans-serif;border-radius:4px;display:none}
  #bengda-grade .g{font:900 38px/1 Impact,system-ui;color:#ffb05a;letter-spacing:.03em;text-shadow:0 0 18px rgba(255,120,30,.5)}
  #bengda-grade .w{font:800 10px/1.3 system-ui;letter-spacing:.12em;color:#e8c9a8;text-transform:uppercase}
  #bengda-grade .bar{height:3px;background:#392b26;margin-top:7px;overflow:hidden}
  #bengda-grade .bar i{display:block;height:100%;background:#ff7a2a;width:0%;transition:width .25s}
  #bengda-hint{position:fixed;left:18px;top:170px;z-index:90;display:none;color:#f0d8bd;font:700 11px/1.5 system-ui;letter-spacing:.06em;text-shadow:0 2px 8px #000;pointer-events:none}
  #bengda-hint .line{display:inline-block;width:22px;height:2px;background:#ff6a2a;vertical-align:middle;margin-right:8px;animation:bk 1s infinite alternate;box-shadow:0 0 12px #ff4a1a}
  @keyframes bk{from{opacity:.15;transform:scaleX(.4)}to{opacity:1;transform:scaleX(1)}}
  #bengda-credits{margin:10px 0 4px;padding:10px 0 0;border-top:1px solid rgba(255,140,70,.18);font:500 11px/1.7 system-ui;color:#cbb9a8}
  #bengda-credits a{color:#ff9a5c;text-decoration:none;border-bottom:1px dotted rgba(255,154,92,.5);margin-right:10px}
  #bengda-credits .none{color:#8e8278;font-size:10px;margin-right:10px}
  #bengda-email{cursor:pointer}
  #bengda-credits .row{display:flex;flex-wrap:wrap;gap:8px 14px;margin-top:4px}
  #bengda-credits .src{color:#8e8278;margin-top:4px}
  #rank-sort{background:transparent;border:1px solid #5a4638;color:#ffb37a;font:800 9px system-ui;padding:4px 7px;margin-left:8px;cursor:pointer}
  #menu-toggle b{display:none}
  #fx-toggle{font-weight:900}
  .legal{display:none!important}
  .cc-thumb{perspective:700px;overflow:hidden}
  .cc-thumb img{transition:transform .14s ease-out;transform-origin:50% 50%;cursor:grab;will-change:transform}
  .cc-thumb img:active{cursor:grabbing}
  `;
  function addStyle(){const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);}
  function lang(){try{return CAMPUS.state.lang||'en';}catch(e){return 'en';}}
  function nm(id){if(NAMES[id])return lang()==='zh'?NAMES[id][1]:NAMES[id][0];if(Ia[id])return lang()==='zh'?Ia[id][0]:'';return '';}
  window.__bengdaCampusName=nm;
  function $(s){return document.querySelector(s);}
  function $all(s){return [...document.querySelectorAll(s)];}

  function setTitle(){
    const l=lang();
    const h=$('.menu-hero h1'); if(h) h.textContent = l==='zh' ? '崩哒' : 'BENGDA';
    document.title = l==='zh' ? '崩哒 · BENGDA' : 'BENGDA';
    const tag=$('.menu-hero .tagline'); if(tag) tag.textContent = l==='zh' ? '一款虚构拆迁游戏' : l==='de' ? 'Ein fiktives Abriss-Spiel' : 'A fictional demolition game';
  }
  const KINDS=['shotgun','football','laser','meteor','shower','storm','blackhole','nuke'];
  function setWeaponLabels(){
    const l=lang(); const arr=WEAPONS[l]||WEAPONS.en;
    $all('.wbtn').forEach((b,i)=>{ if(!b.dataset.kind) b.dataset.kind=KINDS[i]; const k=KINDS.indexOf(b.dataset.kind); const s=b.querySelector('span'); if(s&&k>=0)s.textContent=arr[k]; });
    const active=$all('.wbtn').find(b=>b.classList.contains('active'));
    const wc=$('.weapon-card .wc-name'); if(wc&&active){const k=KINDS.indexOf(active.dataset.kind); if(k>=0)wc.textContent=arr[k];}
  }
  function setSkillButton(){
    const b=document.getElementById('fx-toggle'); if(!b)return;
    const l=lang(); b.textContent = l==='zh' ? '⚡ 技能+' : '⚡ SKILL+';
    b.setAttribute('aria-label', l==='zh'?'技能增强':'Skill boost');
  }
  function setMenuLabels(){
    const l=lang();
    const play=document.getElementById('play'); if(play) play.textContent = l==='zh'?'开始游戏':l==='de'?'SPIELEN':'PLAY';
    const close=document.getElementById('menu-close'); if(close) close.textContent = l==='zh'?'返回游戏':l==='de'?'ZURÜCK ZUM SPIEL':'BACK TO GAME';
    const search=document.getElementById('campus-search'); if(search) search.placeholder = l==='zh'?'搜索哒学或城市…':l==='de'?'Campus oder Stadt suchen …':'Search campus or city …';
    const rh=$('.cb-head b'); if(rh) rh.textContent = l==='zh'?'排名':l==='de'?'RANGLISTE':'RANKING';
    const rs=$('.cb-head small'); if(rs) rs.textContent = l==='zh'?'按剩余血量排序':l==='de'?'nach Rest-HP':'by remaining HP';
    const lh=$('.cb-list-head b'); if(lh) lh.textContent = l==='zh'?'哒学地图':l==='de'?'CAMPUS-KARTEN':'CAMPUS MAPS';
    const sb=$('.sb-label'); if(sb) sb.textContent = l==='zh'?'已选哒学':l==='de'?'AUSGEWÄHLTER CAMPUS':'SELECTED CAMPUS';
    const foot=$('.cb-foot'); if(foot) foot.textContent = l==='zh'?'层数 = 可破坏楼层 · 总血量 = 1.000.000 + 层数 × 1.200':l==='de'?'Etagen = interaktive Ebenen · HP = 1.000.000 + Etagen × 1.200':'Floors = destructible levels · HP = 1,000,000 + floors × 1,200';
    const st=document.getElementById('share-title'); if(st) st.textContent=l==='zh'?'分享崩哒':l==='de'?'CAMPUS TEILEN':'SHARE BENGDA';
    const ss=document.getElementById('share-sub'); if(ss) ss.textContent=l==='zh'?'分享你的校区、剩余血量和分数。':l==='de'?'Teile deinen Campus, deine HP und deinen Score.':'Share your campus, HP and score.';
    const sc=document.getElementById('share-copy'); if(sc) sc.textContent=l==='zh'?'复制':l==='de'?'KOPIEREN':'COPY';
    const sn=document.getElementById('share-native'); if(sn) sn.textContent=l==='zh'?'系统分享 …':l==='de'?'TEILEN …':'SHARE …';
    const snt=document.getElementById('share-note'); if(snt) snt.textContent=l==='zh'?'手机端会打开系统分享；桌面端使用下方社交链接。注意：file:// 链接不能跨设备分享。':l==='de'?'Mobil öffnet der System-Share-Dialog. file://-Links lassen sich nicht teilen.':'Mobile opens the system share sheet. file:// links cannot be shared.';
    const sm=document.getElementById('share-mail'); if(sm) sm.textContent=l==='zh'?'邮件':'E-Mail';
    const exp=document.getElementById('rank-expand'); if(exp&&!exp.dataset.ours) exp.textContent = l==='zh'?'显示全部排名':l==='de'?'ALLE RANKINGS ANZEIGEN':'SHOW ALL RANKINGS';
    const sh=document.getElementById('share'); if(sh) sh.textContent = l==='zh'?'分享':l==='de'?'TEILEN':'SHARE';
    const snd=document.getElementById('sound'); if(snd) snd.textContent = l==='zh'?'声音':l==='de'?'TON':'SOUND';
    const rep=document.getElementById('repair'); if(rep) rep.textContent = l==='zh'?'修复':l==='de'?'REPARIEREN':'REPAIR';
    const rst=document.getElementById('reset'); if(rst) rst.textContent = l==='zh'?'重新开始':l==='de'?'NEU STARTEN':'RESTART';
  }
  function campusIdFromCard(card){const b=card.querySelector('.cc-badge'); return b?BADGE_ID[b.textContent.trim()]:null;}
  function setCampusNames(){
    const l=lang();
    $all('.campus-card').forEach(c=>{const id=campusIdFromCard(c); if(!id)return; const n=nm(id); const el=c.querySelector('.cc-name'); if(el&&n)el.textContent=n;});
    $all('.rank-row').forEach(r=>{const el=r.querySelector('.rank-name'); if(!el)return; const t=el.textContent.trim(); for(const id in NAMES){if(t===NAMES[id][0]||t===NAMES[id][1]){el.textContent=nm(id);break;}}});
    const sel=document.getElementById('selected-campus-name'); if(sel){const id=(function(){for(const k in NAMES){if(sel.textContent.trim()===NAMES[k][0]||sel.textContent.trim()===NAMES[k][1])return k;}return null;})(); if(id) sel.textContent=nm(id);}
  }
  function addCredits(){
    const hero=$('.menu-hero'); if(!hero||document.getElementById('bengda-credits'))return;
    const d=document.createElement('div'); d.id='bengda-credits';
    d.innerHTML='<div class="row"><a href="https://github.com/markszt/bengda" target="_blank" rel="noopener">GitHub</a><span class="none">赞助 / Support: 暂时没有</span><a href="#" id="bengda-email" title="点击复制邮箱">邮箱 / E-Mail: markszt0311@gmail.com</a><a href="#" id="bengda-share">分享链接</a></div><div class="src">数据：OpenStreetMap contributors · ODbL &nbsp;|&nbsp; 灵感：韩国 SMASH 系列拆迁玩法 · 非官方</div>';
    const legal=hero.querySelector('.legal'); if(legal) legal.style.display='none';
    const foot=hero.querySelector('.intro-note'); if(foot) foot.textContent='数据：OpenStreetMap ODbL · Three.js MIT · 非官方同人作品';
    (legal||hero.querySelector('#play')).insertAdjacentElement('beforebegin',d);
    const sh=document.getElementById('bengda-share'); if(sh) sh.addEventListener('click',e=>{e.preventDefault(); const s=document.getElementById('share'); if(s){s.click();} else {navigator.clipboard&&navigator.clipboard.writeText(location.href);}});
    const em=document.getElementById('bengda-email');
    if(em) em.addEventListener('click',async e=>{
      e.preventDefault(); e.stopPropagation();
      const addr='markszt0311@gmail.com';
      let ok=false;
      em.dataset.copying='1';
      try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(addr);ok=true;}}catch(err){}
      if(!ok){const ta=document.createElement('textarea');ta.value=addr;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();try{ok=document.execCommand('copy');}catch(err){}document.body.removeChild(ta);}
      const l=window.CAMPUS?.state?.lang;
      em.textContent=ok?(l==='zh'?'已复制':l==='de'?'Kopiert':'Copied'):(l==='zh'?'复制失败':l==='de'?'Kopieren fehlgeschlagen':'Copy failed');
      setTimeout(()=>{
        em.dataset.copying='';
        em.textContent=l==='zh'?'邮箱：markszt0311@gmail.com':l==='de'?'E-Mail: markszt0311@gmail.com':'Email: markszt0311@gmail.com';
      },1800);
    });
  }
  function addGrade(){
    if(document.getElementById('bengda-grade'))return;
    const g=document.createElement('div'); g.id='bengda-grade';
    g.innerHTML='<div class="g">D</div><div class="w"></div><div class="bar"><i></i></div>';
    document.body.appendChild(g);
    const rp=document.getElementById('rank-panel'); if(rp) rp.style.display='none';
  }
  function updateGrade(){
    const g=document.getElementById('bengda-grade'); if(!g)return;
    const started=CAMPUS.state.started;
    g.style.display=started?'block':'none';
    const v=Math.max(0,Math.min(100,CAMPUS.state.rating||0));
    let t=TIERS[0]; for(const x of TIERS) if(v>=x[0]) t=x;
    const l=lang();
    g.querySelector('.g').textContent=t[1];
    g.querySelector('.w').textContent=l==='zh'?t[2]:t[3];
    g.querySelector('.bar i').style.width=v+'%';
  }
  function addSort(){
    const head=$('.cb-head'); if(!head||document.getElementById('rank-sort'))return;
    const b=document.createElement('button'); b.id='rank-sort'; b.textContent='↕'; b.title='排序';
    head.appendChild(b);
    b.addEventListener('click',()=>{
      const list=document.getElementById('rank-list'); if(!list)return;
      [...list.children].reverse().forEach(c=>list.appendChild(c));
      const l=lang(); b.dataset.order=b.dataset.order==='max'?'min':'max';
      b.title=l==='zh'?(b.dataset.order==='max'?'最多血量':'最少血量'):(b.dataset.order==='max'?'Most HP':'Least HP');
    });
  }
  function traffic(id){
    if (window.__BENGDA_OSM && window.__BENGDA_OSM[id]) return window.__BENGDA_OSM[id];
    const raw=document.getElementById('campus-data'); if(!raw)return null;
    let all; try{all=JSON.parse(raw.textContent);}catch(e){return null}
    const d=all[id]; if(!d)return null;
    const cv=document.createElement('canvas');cv.width=420;cv.height=260;const g=cv.getContext('2d');
    g.fillStyle='#e9e4da';g.fillRect(0,0,420,260);
    const S=420/620, ox=210, oz=130;
    const X=x=>ox+x*S, Z=z=>oz+z*S;
    for(const a of d.areas||[]){if(!a.p||a.p.length<3)continue;g.beginPath();a.p.forEach((q,i)=>{const x=X(q[0]||0),y=Z(q[1]||0);i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle=a.k==='park'||a.k==='grass'?'#dfe5d4':a.k==='water'?'#d8e4e6':'#e4ddd0';g.fill();}
    for(const b of d.buildings||[]){if(!b.poly||b.poly.length<3)continue;g.beginPath();b.poly.forEach((q,i)=>{const x=X(q.x!==undefined?q.x:q[0]),y=Z(q.z!==undefined?q.z:q[1]);i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle='#d8d1c3';g.fill();g.strokeStyle='#c5baa7';g.lineWidth=.6;g.stroke();}
    for(const r of d.roads||[]){if(!r.p||r.p.length<2)continue;g.beginPath();r.p.forEach((q,i)=>{const x=X(q[0]),y=Z(q[1]);i?g.lineTo(x,y):g.moveTo(x,y)});g.strokeStyle='#f7f3eb';g.lineWidth=Math.max(2,(r.w||6)*S);g.lineCap='round';g.stroke();g.strokeStyle='#d8bd93';g.lineWidth=Math.max(.6,(r.w||6)*S*.16);g.stroke();}
    g.fillStyle='rgba(236,230,218,.86)';g.fillRect(0,219,420,41);
    g.fillStyle='#3d3730';g.font='900 18px system-ui,sans-serif';g.fillText(nm(id)||id,12,244);
    g.fillStyle='#7b7063';g.font='700 9px system-ui';g.fillText('OpenStreetMap · ODbL',265,243);
    return cv.toDataURL('image/jpeg',.9);
  }
  function bindRotate(img){
    if (img.dataset.rotateBound) return;
    img.dataset.rotateBound = '1';
    let sx = 0, sy = 0, down = false, moved = false;
    img.addEventListener('pointerdown', (e) => {
      down = true; moved = false; sx = e.clientX; sy = e.clientY;
      if (img.setPointerCapture) img.setPointerCapture(e.pointerId);
      img.style.transition = 'none';
    });
    img.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      img.style.transform = 'perspective(700px) rotateX(' + (-dy * 0.22) + 'deg) rotateY(' + (dx * 0.3) + 'deg) scale(1.03)';
    });
    const end = () => {
      if (!down) return; down = false;
      img.style.transition = 'transform .18s ease-out'; img.style.transform = '';
      if (moved) { img.dataset.dragged = '1'; setTimeout(() => { delete img.dataset.dragged; }, 60); }
    };
    img.addEventListener('pointerup', end); img.addEventListener('pointercancel', end); img.addEventListener('pointerleave', end);
    img.addEventListener('click', (e) => { if (img.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  const cache={};
  function setThumbs(){
    $all('.campus-card').forEach(card=>{
      const id=campusIdFromCard(card); if(!id)return;
      const img=card.querySelector('.cc-thumb img'); if(!img)return;
      if(img.dataset.bengda===id)return;
      try{ const actual=!!(window.__BENGDA_OSM&&window.__BENGDA_OSM[id]); if(actual)img.dataset.actual='1'; if(!cache[id])cache[id]=traffic(id); if(cache[id]){img.src=cache[id];img.dataset.bengda=id;} }catch(e){}
      bindRotate(img);
    });
  }
  function addControls(){
    const keys={};
    window.addEventListener('keydown',e=>{
      if(e.key==='Escape'){const intro=document.getElementById('intro');const t=document.getElementById('menu-toggle');if(t)t.click();e.preventDefault();}
      if(e.key===' '||e.key==='Shift')keys[e.key]=true;
    });
    window.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Shift')keys[e.key]=false;});
    let last=performance.now();
    function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;try{if(CAMPUS.state.started){if(keys[' '])CAMPUS.cam.target.y+=40*dt;if(keys['Shift'])CAMPUS.cam.target.y-=40*dt;}}catch(e){}requestAnimationFrame(loop);}requestAnimationFrame(loop);
  }
  function customLaser(){
    const scene=CAMPUS.scene; const cyl=scene.children.find(o=>o.isMesh&&o.geometry?.type==='CylinderGeometry'); if(!cyl)return;
    const CGeo=cyl.geometry.constructor; const B=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial')?.material.constructor; if(!B)return;
    let timer=null, mx=innerWidth/2,my=innerHeight/2;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
    function pulse(){
      let hit=null;try{hit=CAMPUS.pickAt(mx,my);}catch(e){}
      if(!hit||!hit.point)return;
      const p=hit.point.clone();
      const m=new (cyl.constructor)(new CGeo(.45,.9,520,6),new B({color:0xff3a8a,transparent:true,opacity:.9,blending:2,depthWrite:false}));
      m.position.set(p.x,260,p.z);scene.add(m);
      const t0=performance.now();
      function fade(n){const u=(n-t0)/180;m.material.opacity=Math.max(0,.9*(1-u));if(u<1)requestAnimationFrame(fade);else{scene.remove(m);m.geometry.dispose();m.material.dispose();}}
      requestAnimationFrame(fade);
      try{CAMPUS.blast(p,new (p.constructor)(0,1,0),{damage:1600,radius:20,killFrac:.5,releaseChance:.55,fire:28,dust:18,sparks:22,shake:.7,forceDig:true,popup:false,decal:false});}catch(e){}
      try{CAMPUS.digGround(p.x,p.z,20,7.5);}catch(e){}
    }
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()!=='e'||e.repeat)return;
      const idx=$all('.wbtn').findIndex(b=>b.classList.contains('active'));
      if(idx!==2)return;
      if(timer)clearInterval(timer); timer=setInterval(pulse,100); pulse();
    });
    window.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='e'&&timer){clearInterval(timer);timer=null;}});
  }
  function addNukeFx(){
    const C=window.CAMPUS, scene=C.scene;
    const sample=scene.children.find(o=>o.isMesh&&o.material); if(!sample)return;
    const sph=scene.children.find(o=>o.isMesh&&o.geometry?.type==='SphereGeometry');
    const basic=scene.children.find(o=>o.isMesh&&o.material?.type==='MeshBasicMaterial');
    if(!sph||!basic)return;
    const SG=sph.geometry.constructor, BM=basic.material.constructor, Mesh=sample.constructor;
    const V=C.camera.position.constructor;
    let last=0, mx=innerWidth/2, my=innerHeight/2;
    window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
    function activeNuke(){const a=[...document.querySelectorAll('.wbtn')].find(b=>b.classList.contains('active'));return a&&a.dataset.kind==='nuke';}
    function hemisphere(p){
      const m=new Mesh(new SG(118,32,20,0,Math.PI*2,0,Math.PI/2),new BM({color:0xffc070,transparent:true,opacity:.18,side:2,depthWrite:false,blending:2}));
      m.position.set(p.x,0.5,p.z); scene.add(m);
      const t0=performance.now();
      function f(now){const u=Math.min(1,(now-t0)/700);m.scale.setScalar(0.25+1.0*u);m.material.opacity=.20*(1-u);if(u<1)requestAnimationFrame(f);else{scene.remove(m);m.geometry.dispose();m.material.dispose();}}
      requestAnimationFrame(f);
    }
    function fireFx(){
      try{}catch(e){}
      let hit=null;try{hit=CAMPUS.pickAt(mx,my);}catch(e){}
      const p=hit&&hit.point?hit.point.clone():new V(0,0,0);
      window.__nukePending=true;window.__nukeTarget=p;
    }
    window.addEventListener('pointerdown',e=>{
      if(!activeNuke())return;
      const now=performance.now();
      if(now-last<5000){e.preventDefault();e.stopImmediatePropagation();return;}
      last=now;fireFx();
    },true);
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()!=='e'||e.repeat)return;
      if(!activeNuke())return;
      const now=performance.now();
      if(now-last<5000){e.preventDefault();e.stopImmediatePropagation();return;}
      last=now;fireFx();
    },true);
  }
  let swapped=false;
  function swap68(){
    if(swapped)return; const btns=$all('.wbtn'); if(btns.length<8)return;
    btns.forEach((b,i)=>{ if(!b.dataset.kind)b.dataset.kind=KINDS[i]; });
    const b6=btns[5], b8=btns[7]; if(!b6||!b8)return;
    b6.parentNode.insertBefore(b8,b6); b6.parentNode.appendChild(b6);
    $all('.wbtn').forEach(b=>b.addEventListener('click',()=>{const i=$all('.wbtn').indexOf(b); try{CAMPUS.selectWeapon(i);}catch(e){}},false));
    swapped=true;
  }
  function sync68(){
    const btns=[...document.querySelectorAll('.wbtn')]; if(btns.length<8)return;
    const a=btns[5], b=btns[7];
    const as=a.querySelector('svg'), bs=b.querySelector('svg');
    if(as&&bs){const p=as.parentNode; as.replaceWith(bs); b.appendChild(as);}
    const at=a.querySelector('span'), bt=b.querySelector('span');
    if(at&&bt){const ta=at.textContent;at.textContent=bt.textContent;bt.textContent=ta;}
    a.dataset.kind='storm'; b.dataset.kind='nuke';
    a.querySelector('b').textContent='6'; b.querySelector('b').textContent='8';
    a.setAttribute('aria-label','GEWITTERWELLE · 6');
    b.setAttribute('aria-label','ATOMBOMBE · 8');
  }
  function applyAll(){
    setTitle();setWeaponLabels();setSkillButton();setMenuLabels();setCampusNames();updateGrade();setThumbs();
  }
  function boot(){
    if(!window.CAMPUS){setTimeout(boot,400);return;}
    addStyle();addCredits();addGrade();addSort();addControls();addNukeFx();
    applyAll(); sync68(); applyAll();
    document.querySelectorAll('.lang').forEach(b=>b.addEventListener('click',()=>setTimeout(applyAll,350)));
    const fx=document.getElementById('fx-toggle'); if(fx)fx.addEventListener('click',()=>setTimeout(setSkillButton,0),true);
    setInterval(applyAll,1800);
  }
  boot();
})();