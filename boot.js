(function(){
  var id='aachen';
  try{id=new URLSearchParams(location.search).get('campus')||localStorage.getItem('ca-campus')||'aachen';}catch(e){}
  if(!/^[a-z0-9-]{1,40}$/.test(id)) id='aachen';
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.async=false;s.onload=res;s.onerror=function(){rej(new Error('load '+src));};document.body.appendChild(s);});}
  (async function(){
    try{
      var res=await fetch('./maps/'+id+'.json?v=20261114-7',{cache:'no-store'});
      if(!res.ok) throw new Error('map HTTP '+res.status);
      var plan=await res.json();
      document.getElementById('campus-data').textContent=JSON.stringify({[id]:plan});
    }catch(e){
      try{var r2=await fetch('./maps/aachen.json?v=20261114-7',{cache:'no-store'});var p2=await r2.json();document.getElementById('campus-data').textContent=JSON.stringify({aachen:p2});}catch(e2){}
    }
    try{
      for(var i=0;i<25;i++) await load('./engine/part'+String(i).padStart(2,'0')+'.js?v=20261114-7');
      await load('./online.js?v=20261114-7');
      try{FHACOnline.configure({apiBase:'https://fh-aachen-leaderboard.markszt0311-a52.workers.dev'});FHACOnline.attachToGame();}catch(e){}
      await load('./online-rank.js?v=20261114-7');
      await load('./post.js?v=20261114-7');
    }catch(e){
      var err=document.getElementById('error');if(err){err.hidden=false;err.textContent='Fehler / 错误 / Error: '+(e&&e.message?e.message:e);}
    }
  })();
})();