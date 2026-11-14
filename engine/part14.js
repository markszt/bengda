(function(){
  const GRADE_DE={D:'Staubig',C:'Bröckelt',B:'Bulldozer',A:'Abriss',S:'Splittersturm',SS:'Seismisch',SSS:'Alles zerstört'};
  function apply(){
    if(!window.CAMPUS)return;
    const lang=CAMPUS.state.lang;
    const zh=lang==='zh', de=lang==='de';
    const play=document.getElementById('play');
    if(play)play.textContent=zh?'开始游戏':de?'SPIELEN':'PLAY';
    document.querySelectorAll('.sb-meta,.cc-meta,.rank-sub').forEach(el=>{
      let t=el.textContent;
      if(zh)t=t.replace(/Etagen/g,'层').replace(/Straßenkarte/g,'3D').replace(/Street Map/g,'3D');
      else if(de)t=t.replace(/层/g,'Etagen').replace(/Street Map/g,'Straßenkarte');
      else t=t.replace(/层/g,'Etagen').replace(/Straßenkarte/g,'Street Map');
      el.textContent=t;
    });
    const links=document.querySelectorAll('#bengda-credits .row a');
    if(links.length>=3){
      links[2].textContent=zh?'分享链接':de?'Teilen':'Share link';
    }
    const noSponsor=document.querySelector('#bengda-credits .none');
    if(noSponsor)noSponsor.textContent=zh?'赞助：暂时没有':de?'Unterstützen: derzeit keine':'Support: currently none';
    const em=document.getElementById('bengda-email');
    if(em&&em.dataset.copying!=='1')em.textContent=zh?'邮箱：markszt0311@gmail.com':de?'E-Mail: markszt0311@gmail.com':'Email: markszt0311@gmail.com';
    const src=document.querySelector('#bengda-credits .src');
    if(src)src.textContent=zh?'校园数据：OpenStreetMap ODbL · 地图：Esri World Street Map · 灵感：韩国 SMASH 拆迁玩法 · 非官方':de?'Campusdaten: OpenStreetMap ODbL · Karte: Esri World Street Map · Inspiration: koreanisches SMASH · Inoffiziell':'Campus data: OpenStreetMap ODbL · Map: Esri World Street Map · Inspired by Korean SMASH · Unofficial';
    const note=document.querySelector('.intro-note');
    if(note)note.textContent=zh?'数据：OpenStreetMap ODbL · Three.js MIT · 非官方同人作品':de?'Daten: OpenStreetMap ODbL · Three.js MIT · Inoffizielles Fan-Projekt':'Data: OpenStreetMap ODbL · Three.js MIT · Unofficial fan project';
    const coming=document.getElementById('bengda-coming');
    if(coming)coming.textContent=zh?'赞助：暂时没有':de?'Unterstützen: derzeit keine':'Support: currently none';
    if(de){document.querySelectorAll('#bengda-grade .w').forEach(e=>{const k=e.parentElement?.querySelector('.g')?.textContent;if(GRADE_DE[k])e.textContent=GRADE_DE[k];});}
  }
  setInterval(apply,220);apply();
})();