(function(){
  function run(){
    const zh=window.CAMPUS&&CAMPUS.state.lang==='zh';
    document.querySelectorAll('.cc-meta').forEach(e=>{
      let t=e.textContent;
      if(zh){t=t.replace(/Etagen/g,'层').replace(/Street Map/g,'3D').replace(/OSM/g,'OSM');}
      else{t=t.replace(/层/g,'Etagen').replace(/3D/g,'Street Map');}
      e.textContent=t;
    });
    document.querySelectorAll('.rank-sub').forEach(e=>{
      let t=e.textContent;
      if(zh){t=t.replace(/Etagen/g,'层').replace(/Street Map/g,'3D');}
      else{t=t.replace(/层/g,'Etagen').replace(/3D/g,'Street Map');}
      e.textContent=t;
    });
    const sm=document.getElementById('selected-campus-meta');
    if(sm){let t=sm.textContent;if(zh){t=t.replace(/Etagen/g,'层').replace(/Street Map/g,'3D');}else{t=t.replace(/层/g,'Etagen').replace(/3D/g,'Street Map');}sm.textContent=t;}
    const kick=document.getElementById('selected-campus-kicker');
    if(kick){let t=kick.textContent;if(zh){t=t.replace('Campus Eupener Straße','Eupener Straße 校区');}else{t=t.replace('Eupener Straße 校区','Campus Eupener Straße');}kick.textContent=t;}
  }
  setInterval(run,1600);
})();