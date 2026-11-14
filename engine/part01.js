(function () {
  let tries = 0;
  function boot() {
    const C = window.CAMPUS;
    if (!C || !C.scene) { if (++tries < 40) setTimeout(boot, 250); return; }
    const scene = C.scene;
    const sample = scene.children.find(o => o.isMesh && o.geometry && o.material) || C.debrisMesh;
    if (!sample) return;
    const Mesh = sample.constructor;
    const BufGeo = sample.geometry.type === 'BufferGeometry' ? sample.geometry.constructor : Object.getPrototypeOf(Object.getPrototypeOf(sample.geometry)).constructor;
    const BufAttr = sample.geometry.attributes && sample.geometry.attributes.position ? sample.geometry.attributes.position.constructor : null;
    if (!BufAttr) return;
    const cyl = scene.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry');
    const sph = scene.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry');
    const grp = scene.children.find(o => o.isGroup);
    const CylGeo = cyl ? cyl.geometry.constructor : null;
    const SphGeo = sph ? sph.geometry.constructor : null;
    const Group = grp ? grp.constructor : null;
    const std = scene.children.find(o => o.isMesh && o.material && o.material.type === 'MeshStandardMaterial');
    const Mat = std ? std.material.constructor : sample.material.constructor;
    const V3 = C.camera.position.constructor;
    if (!CylGeo || !SphGeo || !Group) return;

    const mat = (color, emissive = 0x000000, rough = 0.85) => new Mat({ color, emissive, roughness: rough, metalness: 0.05 });
    const boxGeo = (w, h, d) => {
      const g = new BufGeo(), x = w / 2, y = h / 2, z = d / 2;
      const p = [], n = [];
      const face = (a, b, c, d2, nx, ny, nz) => {
        for (const q of [a, b, c, a, c, d2]) { p.push(q[0], q[1], q[2]); n.push(nx, ny, nz); }
      };
      face([-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z],0,0,1);
      face([x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z],0,0,-1);
      face([x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z],1,0,0);
      face([-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z],-1,0,0);
      face([-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z],0,1,0);
      face([-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z],0,-1,0);
      g.setAttribute('position', new BufAttr(new Float32Array(p), 3));
      g.setAttribute('normal', new BufAttr(new Float32Array(n), 3));
      return g;
    };
    const addBox = (parent, w, h, d, color, x, y, z, emissive) => {
      const m = new Mesh(boxGeo(w, h, d), mat(color, emissive || 0x000000));
      m.position.set(x, y, z); parent.add(m); return m;
    };
    const terrain = (x, z) => { try { return C.terrainHeight(x, z) || 0; } catch (e) { return 0; } };
    const boxes = (C.buildings || []).map(b => b.box).filter(b => b && b.min);
    const blocked = (x, z, m = 2) => boxes.some(b => x > b.min.x - m && x < b.max.x + m && z > b.min.z - m && z < b.max.z + m);
    let seed = 1337;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const R = (a, b) => a + (b - a) * rnd();

    const deco = new Group(); scene.add(deco);
    const props = [];
    const lampMat = mat(0x2b2c2e), lampHead = mat(0xffd08a, 0xffb050, 0.45);
    const addLamp = (x, z, ry) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 1.2)) return;
      const g = new Group(); g.position.set(x, y, z); g.rotation.y = ry;
      const pole = new Mesh(new CylGeo(0.14, 0.2, 7.2, 6), lampMat); pole.position.y = 3.6; g.add(pole);
      addBox(g, 2.6, 0.18, 0.18, 0x2b2c2e, 1.3, 7.1, 0);
      addBox(g, 1.0, 0.35, 0.55, 0xffd08a, 2.5, 6.95, 0, 0xff9a40);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };
    const carCols = [0x8b2f2f, 0x2f4f6b, 0xd8d5cc, 0x3b3b3b, 0x7d7f72, 0xb8892f, 0x4c6650, 0xa63d52, 0x2d6f8e, 0xe0e0d8, 0x5a3d2b, 0x8a8f98, 0x1f4b3a, 0xc46a2a, 0x6d4b8a, 0x35485e];
    const carTypes = [
      { l: 4.4, w: 1.9, h: 1.0, roof: 2.3, cab: 0.8 },
      { l: 3.9, w: 1.8, h: 0.95, roof: 1.9, cab: 0.8 },
      { l: 5.2, w: 2.0, h: 1.5, roof: 3.0, cab: 1.2 },
      { l: 4.8, w: 1.95, h: 1.1, roof: 2.0, cab: 0.8 },
      { l: 8.4, w: 2.4, h: 2.4, roof: 5.5, cab: 1.3 },
      { l: 6.8, w: 2.2, h: 1.8, roof: 2.2, cab: 1.1 },
    ];
    const addCar = (x, z, ry, color, typeIndex) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 1.5)) return;
      const type = carTypes[typeIndex % carTypes.length];
      const g = new Group(); g.position.set(x, y, z); g.rotation.y = ry;
      addBox(g, type.l, type.h, type.w, color, 0, type.h / 2 + 0.15, 0);
      addBox(g, type.roof, type.cab, type.w * 0.9, 0x1d2226, -0.1, type.h + type.cab / 2 + 0.1, 0);
      addBox(g, type.l * 0.22, 0.18, 0.06, 0xfff0c0, -type.l * 0.36, 0.55, type.w * 0.46, 0xffd070);
      addBox(g, type.l * 0.22, 0.18, 0.06, 0xfff0c0, -type.l * 0.36, 0.55, -type.w * 0.46, 0xffd070);
      addBox(g, type.l * 0.18, 0.16, 0.06, 0xb02020, type.l * 0.38, 0.55, type.w * 0.46, 0x400000);
      addBox(g, type.l * 0.18, 0.16, 0.06, 0xb02020, type.l * 0.38, 0.55, -type.w * 0.46, 0x400000);
      for (const wx of [-type.l * 0.32, type.l * 0.32]) for (const wz of [-type.w * 0.42, type.w * 0.42]) {
        const w = new Mesh(new CylGeo(0.32, 0.32, 0.24, 8), mat(0x151515));
        w.rotation.z = Math.PI / 2; w.position.set(wx, 0.35, wz); g.add(w);
      }
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y, kind: 'car' });
    };
    const addBench = (x, z, ry) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 1)) return;
      const g = new Group(); g.position.set(x, y, z); g.rotation.y = ry;
      addBox(g, 2.4, 0.12, 0.55, 0x7a5432, 0, 0.55, 0);
      addBox(g, 2.4, 0.5, 0.12, 0x7a5432, 0, 0.9, -0.28);
      addBox(g, 0.12, 0.55, 0.5, 0x3a3a3a, -1.0, 0.3, 0);
      addBox(g, 0.12, 0.55, 0.5, 0x3a3a3a, 1.0, 0.3, 0);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };
    const addBin = (x, z) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 0.8)) return;
      const g = new Group(); g.position.set(x, y, z);
      const b = new Mesh(new CylGeo(0.32, 0.28, 0.85, 8), mat(0x3f5e46)); b.position.y = 0.43; g.add(b);
      const cap = new Mesh(new CylGeo(0.36, 0.36, 0.08, 8), mat(0x253b2b)); cap.position.y = 0.88; g.add(cap);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };
    const addRack = (x, z, ry) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 0.8)) return;
      const g = new Group(); g.position.set(x, y, z); g.rotation.y = ry;
      for (let i = -1; i <= 1; i++) addBox(g, 0.08, 0.9, 0.08, 0x8a8d8f, i * 0.55, 0.45, 0);
      addBox(g, 1.5, 0.08, 0.08, 0x8a8d8f, 0, 0.9, 0);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };
    const addSign = (x, z, ry) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 0.6)) return;
      const g = new Group(); g.position.set(x, y, z); g.rotation.y = ry;
      const p = new Mesh(new CylGeo(0.06, 0.06, 2.6, 5), mat(0x777b7d)); p.position.y = 1.3; g.add(p);
      addBox(g, 0.7, 0.5, 0.05, 0x2463a8, 0, 2.55, 0, 0x0b2b55);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };
    const addHydrant = (x, z) => {
      const y = terrain(x, z); if (y < -2 || blocked(x, z, 0.6)) return;
      const g = new Group(); g.position.set(x, y, z);
      const b = new Mesh(new CylGeo(0.18, 0.22, 0.7, 6), mat(0xb23a2a)); b.position.y = 0.35; g.add(b);
      const t = new Mesh(new SphGeo(0.24, 8, 6), mat(0xb23a2a)); t.position.y = 0.78; g.add(t);
      deco.add(g); props.push({ group: g, x, z, baseY: g.position.y });
    };

    // Lamps around building edges
    let lamps = 0;
    for (let i = 0; i < boxes.length && lamps < 54; i++) {
      const b = boxes[i], cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
      const side = i % 4;
      const x = side === 0 ? b.max.x + 7 : side === 1 ? b.min.x - 7 : cx + R(-12, 12);
      const z = side === 2 ? b.max.z + 7 : side === 3 ? b.min.z - 7 : cz + R(-12, 12);
      if (Math.abs(x) < 295 && Math.abs(z) < 295) { addLamp(x, z, R(0, 6.28)); lamps++; }
    }
    for (let gx = -260; gx <= 260 && lamps < 88; gx += 42) {
      for (let gz = -260; gz <= 260 && lamps < 88; gz += 42) {
        if (!blocked(gx, gz, 3)) addLamp(gx, gz, R(0, 6.28)), lamps++;
      }
    }
    for (let gx = -240; gx <= 240 && lamps < 120; gx += 36) addLamp(gx, 0, Math.PI / 2), lamps++;
    for (let gz = -240; gz <= 240 && lamps < 140; gz += 36) addLamp(0, gz, 0), lamps++;
    // Parked cars near buildings
    let cars = 0;
    for (let i = 0; i < boxes.length && cars < 44; i += 2) {
      const b = boxes[i], cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
      const x = cx + R(-18, 18), z = cz + R(-18, 18);
      if (Math.abs(x) < 292 && Math.abs(z) < 292 && !blocked(x, z, 3)) { addCar(x, z, R(0, 6.28), carCols[cars % carCols.length], cars % carTypes.length); cars++; }
    }
    for (let gx = -250; gx <= 250 && cars < 78; gx += 48) {
      for (let gz = -250; gz <= 250 && cars < 78; gz += 48) {
        if (!blocked(gx, gz, 4)) addCar(gx + R(-6,6), gz + R(-6,6), R(0,6.28), carCols[cars % carCols.length], cars % carTypes.length), cars++;
      }
    }
    // Benches, bins, racks, signs, hydrants
    for (let i = 0; i < boxes.length; i += 3) {
      const b = boxes[i], x = (b.min.x + b.max.x) / 2 + R(-16, 16), z = (b.min.z + b.max.z) / 2 + R(-16, 16);
      if (Math.abs(x) > 292 || Math.abs(z) > 292) continue;
      addBench(x, z, R(0, 6.28)); addBin(x + 2, z + 1); addRack(x - 2, z + 2, R(0, 6.28));
    }
    for (let i = 0; i < boxes.length; i += 5) {
      const b = boxes[i], x = (b.min.x + b.max.x) / 2 + R(-15, 15), z = (b.min.z + b.max.z) / 2 + R(-15, 15);
      if (Math.abs(x) < 292 && Math.abs(z) < 292) { addSign(x, z, R(0, 6.28)); addHydrant(x + 1.5, z - 1); }
    }

    // Use the embedded OSM plan to line decorations along actual roads.
    let plan = null;
    try {
      const raw = document.getElementById('campus-data');
      const all = JSON.parse(raw.textContent);
      const id = localStorage.getItem('ca-campus') || 'aachen';
      plan = all[id] || all.aachen;
    } catch (e) { /* ignore */ }
    if (plan && plan.roads) {
      let n = 0;
      for (const r of plan.roads) {
        if (!r.p || r.p.length < 2) continue;
        for (let i = 0; i < r.p.length - 1 && n < 90; i += 2) {
          const a = r.p[i], b = r.p[i + 1];
          const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
          const nx = -dz / L, nz = dx / L;
          const off = (r.w || 6) / 2 + 2.2;
          const x = a[0] + nx * off, z = a[1] + nz * off;
          addLamp(x, z, Math.atan2(dx, dz)); n++;
        }
      }
      let c = 0;
      for (const r of plan.roads) {
        if (!r.p || r.p.length < 2) continue;
        for (let i = 0; i < r.p.length - 1 && c < 56; i += 2) {
          const a = r.p[i], b = r.p[i + 1];
          const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
          const nx = -dz / L, nz = dx / L;
          const off = (r.w || 6) / 2 + 4.5;
          const x = a[0] + nx * off, z = a[1] + nz * off;
          if (Math.abs(x) < 292 && Math.abs(z) < 292 && !blocked(x, z, 3)) { addCar(x, z, Math.atan2(dx, dz), carCols[c % carCols.length], c % carTypes.length); c++; }
        }
      }
    }

    // Make decorations (cars, lamps, benches, bins, racks, signs, hydrants) destructible by nearby damage.
    let mx = innerWidth / 2, my = innerHeight / 2, lastD = C.state.damage;
    const sites = [];
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const remember = (x, z) => {
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      sites.push({ x, z, t: performance.now() });
      if (sites.length > 90) sites.shift();
    };
    const watch = () => {
      // Track every bomb/football so impacts without a mouse target still destroy props.
      try {
        for (const b of C.bombs || []) if (b.mesh) remember(b.mesh.position.x, b.mesh.position.z);
        for (const f of C.footballs || []) if (f.mesh) remember(f.mesh.position.x, f.mesh.position.z);
      } catch (e) { /* ignore */ }
      for (const p of props) {
        if (p.group.visible && terrain(p.x, p.z) < p.baseY - 0.8) p.group.visible = false;
      }
      const dmg = C.state.damage;
      if (dmg > lastD + 0.5) {
        const now = performance.now();
        const hit = (() => { try { return C.pickAt(mx, my); } catch (e) { return null; } })();
        if (hit && hit.point) remember(hit.point.x, hit.point.z);
        const rad = Math.min(62, 16 + (dmg - lastD) / 600);
        for (const p of props) {
          if (!p.group.visible) continue;
          for (const s of sites) {
            if (now - s.t < 1800 && Math.hypot(p.x - s.x, p.z - s.z) < rad) { p.group.visible = false; break; }
          }
        }
        lastD = dmg;
      }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);

    // Replace the flat lava text with real 3D voxel letters as a child of the destructible plane.
    let plane = null;
    scene.traverse(o => {
      if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && Math.abs(o.position.y + 20.4) < 1.2) plane = o;
    });
    let textMesh = null;
    const drawText = () => {
      if (!plane) return;
      const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256;
      const g = cv.getContext('2d');
      g.clearRect(0, 0, 1024, 256); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '900 64px "Helvetica Neue", Arial, sans-serif'; g.fillStyle = '#fff';
      const lang = C.state.lang;
      const t = lang === 'zh' ? '为什么要这样破坏你的学校？' : lang === 'de' ? 'WARUM ZERSTÖRST DU DEINE SCHULE?' : 'WHY ARE YOU DESTROYING YOUR SCHOOL?';
      g.fillText(t, 512, 118);
      g.font = '800 28px "Helvetica Neue", Arial, sans-serif'; g.fillStyle = '#ddd';
      g.fillText(lang === 'zh' ? '哒学 · 熔岩层' : 'CAMPUS · LAVA LAYER', 512, 182);
      const data = g.getImageData(0, 0, 1024, 256).data;
      const step = 2, S = 0.78, pos = [], nor = [];
      const cube = (cx, cy, cz, sz) => {
        const h = sz/2;
        const q = [[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h],[-h,-h,-h],[h,-h,-h],[h,h,-h],[-h,h,-h]];
        const f = [[0,1,2,3,0,0,1],[5,4,7,6,0,0,-1],[1,5,6,2,1,0,0],[4,0,3,7,-1,0,0],[3,2,6,7,0,1,0],[4,5,1,0,0,-1,0]];
        for (const [a,b,c,d,nx,ny,nz] of f) for (const k of [a,b,c,a,c,d]) { pos.push(cx+q[k][0],cy+q[k][1],cz+q[k][2]); nor.push(nx,ny,nz); }
      };
      let count = 0;
      for (let y = 0; y < 256; y += step) for (let x = 0; x < 1024; x += step) {
        if (data[(y * 1024 + x) * 4 + 3] > 120 && count < 3600) {
          cube((x / 1024 - 0.5) * 170, (0.5 - y / 256) * 42.5, 0.5, S); count++;
        }
      }
      if (plane) plane.position.y = -16.5;
      const geo = new BufGeo();
      geo.setAttribute('position', new BufAttr(new Float32Array(pos), 3));
      geo.setAttribute('normal', new BufAttr(new Float32Array(nor), 3));
      if (textMesh) { plane.remove(textMesh); textMesh.geometry.dispose(); }
      textMesh = new Mesh(geo, mat(0xfff0c8, 0xffa040, 0.45));
      textMesh.position.z = 0.1; textMesh.scale.setScalar(1.35); plane.add(textMesh);
      plane.material.transparent = true; plane.material.opacity = 0; plane.material.depthWrite = false;
    };
    drawText();
    for (const id of ['lang-zh', 'lang-de', 'lang-en']) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => setTimeout(drawText, 200));
    }
  }
  boot();
})();