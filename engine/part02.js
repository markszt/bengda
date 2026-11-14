(function () {
  let ctx = null, master = null, comp = null, verb = null, noise = null;
  let muted = false, beam = null, lastDmg = 0, lastBoom = 0;
  const VOL = 0.42;

  function makeNoise(seconds) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function makeImpulse(seconds) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.4);
    }
    return b;
  }
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 18; comp.ratio.value = 5;
    comp.attack.value = 0.005; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = muted ? 0 : VOL;
    verb = ctx.createConvolver(); verb.buffer = makeImpulse(2.2);
    const wet = ctx.createGain(); wet.gain.value = 0.17;
    verb.connect(wet); wet.connect(comp);
    master.connect(comp); comp.connect(ctx.destination);
    noise = makeNoise(2.5);
    try { if (window.CAMPUS && window.CAMPUS.state) window.CAMPUS.state.sound = false; } catch (e) { /* ignore */ }
  }
  function now() { return ctx ? ctx.currentTime : 0; }
  function panner(pan) {
    if (!ctx.createStereoPanner) return null;
    const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); return p;
  }
  function burst(o) {
    if (!ctx || muted) return;
    const t = now() + (o.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noise;
    src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'lowpass'; f.frequency.value = o.freq || 800; f.Q.value = o.q || 0.7;
    const g = ctx.createGain();
    const peak = o.gain == null ? 0.3 : o.gain;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.dur || 0.3));
    const p = panner(o.pan || 0);
    src.connect(f); f.connect(g);
    if (p) { g.connect(p); p.connect(master); if (o.wet !== false) p.connect(verb); }
    else { g.connect(master); if (o.wet !== false) g.connect(verb); }
    src.start(t); src.stop(t + (o.dur || 0.3) + 0.02);
  }
  function tone(o) {
    if (!ctx || muted) return;
    const t = now() + (o.delay || 0);
    const osc = ctx.createOscillator();
    osc.type = o.shape || 'sine';
    osc.frequency.setValueAtTime(o.f0 || 60, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(8, o.f1 || 30), t + (o.dur || 0.5));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain == null ? 0.25 : o.gain), t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.dur || 0.5));
    const p = panner(o.pan || 0);
    osc.connect(g); if (p) { g.connect(p); p.connect(master); } else g.connect(master);
    osc.start(t); osc.stop(t + (o.dur || 0.5) + 0.02);
  }
  function explosion(power = 1, delay = 0) {
    if (!ctx || muted) return;
    const p = Math.max(-0.7, Math.min(0.7, (Math.random() * 2 - 1) * 0.55));
    const pw = Math.max(0.25, Math.min(2.4, power));
    // crack
    burst({ type: 'highpass', freq: 1400, gain: 0.34 * pw, dur: 0.09, attack: 0.002, pan: p, delay, wet: false });
    // pressure body
    burst({ type: 'lowpass', freq: 520, q: 0.8, gain: 0.5 * pw, dur: 0.5 + 0.25 * pw, attack: 0.01, pan: p, delay: delay + 0.012 });
    // low weight
    tone({ f0: 72 + Math.random() * 22, f1: 26, dur: 0.65 + 0.3 * pw, gain: 0.24 * pw, shape: 'sine', pan: p, delay: delay + 0.02 });
    // debris ticks
    const n = 4 + Math.floor(7 * pw);
    for (let i = 0; i < n; i++) {
      burst({ type: 'highpass', freq: 1800 + Math.random() * 2600, gain: 0.025 + Math.random() * 0.05, dur: 0.035, attack: 0.001,
        pan: Math.max(-1, Math.min(1, p + (Math.random() - 0.5) * 0.9)), delay: delay + 0.1 + Math.random() * (0.35 + pw * 0.2) });
    }
    // airy tail
    burst({ type: 'lowpass', freq: 240, gain: 0.08 * pw, dur: 1.6 + pw, attack: 0.12, pan: p, delay: delay + 0.08 });
  }
  function shot(kind) {
    if (!ctx || muted) return;
    if (kind === 'shotgun') {
      burst({ type: 'highpass', freq: 900, gain: 0.3, dur: 0.12, attack: 0.002, wet: false });
      tone({ f0: 120, f1: 42, dur: 0.18, gain: 0.22, shape: 'triangle' });
      burst({ type: 'lowpass', freq: 700, gain: 0.2, dur: 0.2, delay: 0.01 });
    } else if (kind === 'football') {
      burst({ type: 'bandpass', freq: 420, q: 1.2, gain: 0.16, dur: 0.4, attack: 0.05 });
      tone({ f0: 170, f1: 90, dur: 0.25, gain: 0.08, shape: 'sine' });
    } else if (kind === 'laser') {
      burst({ type: 'bandpass', freq: 1200, q: 4, gain: 0.12, dur: 0.2, attack: 0.02 });
      tone({ f0: 520, f1: 90, dur: 0.25, gain: 0.09, shape: 'sawtooth' });
    } else if (kind === 'meteor' || kind === 'shower') {
      tone({ f0: 90, f1: 32, dur: 0.8, gain: 0.16, shape: 'sine' });
      burst({ type: 'lowpass', freq: 380, gain: 0.14, dur: 0.8, attack: 0.25 });
    } else if (kind === 'nuke') {
      explosion(2.2);
      tone({ f0: 55, f1: 24, dur: 1.6, gain: 0.3, shape: 'sine', delay: 0.05 });
    } else if (kind === 'blackhole') {
      tone({ f0: 42, f1: 28, dur: 1.2, gain: 0.16, shape: 'sine' });
      burst({ type: 'bandpass', freq: 260, q: 2, gain: 0.1, dur: 1.1, attack: 0.3 });
    } else if (kind === 'storm') {
      burst({ type: 'highpass', freq: 1800, gain: 0.1, dur: 0.08, attack: 0.001 });
      burst({ type: 'lowpass', freq: 220, gain: 0.26, dur: 1.5, attack: 0.05, delay: 0.06 });
      tone({ f0: 60, f1: 28, dur: 1.3, gain: 0.2, shape: 'sine' });
    }
  }
  function weaponIndex() {
    const btns = [...document.querySelectorAll('.wbtn')];
    const i = btns.findIndex(b => b.classList.contains('active'));
    return i >= 0 ? i : 0;
  }
  const KINDS = ['shotgun', 'football', 'laser', 'meteor', 'shower', 'nuke', 'blackhole', 'storm'];
  function weaponKind() { return KINDS[weaponIndex()] || 'shotgun'; }
  function startBeam() {
    if (!ctx || muted || beam) return;
    const t = now();
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 210;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 3;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.075, t + 0.12);
    o.connect(f); f.connect(g); g.connect(master); o.start(t);
    beam = { o, g };
  }
  function stopBeam() {
    if (!beam || !ctx) return;
    const t = now(); const b = beam; beam = null;
    b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value || 0.0001, t);
    b.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    b.o.stop(t + 0.18);
  }
  function triggerShot() {
    init(); if (!ctx) return;
    const k = weaponKind();
    shot(k);
    if (k === 'laser') { startBeam(); setTimeout(stopBeam, 220); }
  }
  function bind() {
    const play = document.getElementById('play');
    if (play) play.addEventListener('click', () => { init(); setTimeout(() => { try { if (window.CAMPUS) window.CAMPUS.state.sound = false; } catch (e) {} }, 0); }, { capture: true });
    const canvas = document.querySelector('#stage canvas') || document.querySelector('canvas');
    if (canvas) canvas.addEventListener('pointerdown', (e) => { if (e.button === 0) triggerShot(); }, { capture: true });
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() !== 'e' || e.repeat) return;
      init(); const k = weaponKind();
      if (k === 'laser') startBeam(); else shot(k);
    }, { capture: true });
    window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() === 'e') stopBeam(); }, { capture: true });
    const soundBtn = document.getElementById('sound');
    if (soundBtn) soundBtn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopImmediatePropagation(); init();
      muted = !muted; if (master) master.gain.value = muted ? 0 : VOL;
      soundBtn.classList.toggle('off', muted);
      if (muted) stopBeam();
    }, { capture: true });
    let last = 0;
    const watch = () => {
      try {
        const d = window.CAMPUS ? window.CAMPUS.state.damage : 0;
        if (d > lastDmg + 40) {
          const delta = d - lastDmg;
          const t = performance.now();
          if (t - lastBoom > 70) {
            explosion(Math.min(2.4, 0.5 + Math.log10(1 + delta) * 0.55));
            lastBoom = t;
          }
        }
        lastDmg = d;
      } catch (e) { /* ignore */ }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();