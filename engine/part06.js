(function(){
  const css=document.createElement('style');
  css.textContent=`
  .campus-card .cc-thumb{height:150px!important;min-height:150px!important;max-height:150px!important;overflow:hidden!important;position:relative!important}
  .campus-card .cc-thumb img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important}
  .campus-card .cc-body{padding-top:10px!important}
  .campus-card{height:auto!important;min-height:0!important;display:block!important;overflow:hidden!important}
  .campus-card .cc-body{display:block!important;min-height:0!important;padding:10px 12px 10px!important;box-sizing:border-box!important}
  `;
  document.head.appendChild(css);
  function crop(img){
    if(!img || img.dataset.cropped || img.dataset.actual==='1') return;
    const src=img.src;
    if(!src || !src.startsWith('data:image')) return;
    const im=new Image();
    im.onload=function(){
      try{
        const cut=41;
        const cv=document.createElement('canvas');
        cv.width=im.naturalWidth; cv.height=Math.max(1,im.naturalHeight-cut);
        cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height,0,0,cv.width,cv.height);
        img.src=cv.toDataURL('image/jpeg',.9);
        img.dataset.cropped='1';
        img.loading='eager';
      }catch(e){}
    };
    im.src=src;
  }
  function run(){
    document.querySelectorAll('.campus-card img').forEach(crop);
  }
  setInterval(run,1600); setTimeout(run,800); setTimeout(run,2000);
})();