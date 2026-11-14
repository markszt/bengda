(function(){
  const canvas = document.querySelector('#stage canvas') || document.querySelector('canvas');
  if (!canvas) return;
  let startDist = 0, startTr = 0, pinching = false;
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 2 || !window.CAMPUS) return;
    pinching = true;
    startDist = dist(e.touches);
    startTr = CAMPUS.cam.tr;
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    if (!pinching || e.touches.length !== 2 || !window.CAMPUS) return;
    const d = dist(e.touches);
    if (startDist > 0 && d > 0) {
      CAMPUS.cam.tr = Math.max(65, Math.min(2400, startTr * startDist / d));
      startDist = d;
      startTr = CAMPUS.cam.tr;
    }
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) pinching = false;
  }, { passive: true });
  canvas.style.touchAction = 'none';
})();

(function(){
  function tune(){
    const C=window.CAMPUS;
    if(!C||!C.renderer||!C.scene){setTimeout(tune,400);return;}
    try{
      C.camera.far=6000;C.camera.updateProjectionMatrix();
      const max=C.renderer.capabilities.getMaxAnisotropy?C.renderer.capabilities.getMaxAnisotropy():8;
      C.scene.traverse(o=>{
        const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
        for(const m of mats){
          for(const k of ['map','normalMap','roughnessMap','metalnessMap']){
            const t=m&&m[k];if(t&&t.isTexture){t.anisotropy=max;t.needsUpdate=true;}
          }
        }
      });
    }catch(e){}
  }
  tune();
})();