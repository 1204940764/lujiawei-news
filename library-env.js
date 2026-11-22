import * as THREE from 'three';

// ===== Optimized Grand Spacious University Library Reading Hall (Low GPU/CPU Footprint) =====
export function createLibraryEnvironment(scene, maxAniso = 4) {
  const libGroup = new THREE.Group();
  scene.add(libGroup);

  const FLOOR_Y = -3.02;
  const HALL_W = 68;
  const HALL_D = 62;
  const HALL_H = 16.5;
  const FRONT_Z = -27.5;
  const BACK_Z = 32.5;

  // ===== Lightweight Procedural Textures (512px for background architecture) =====
  function createFloorWoodTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4e311e';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 8;
    const rowH = 512 / rows;
    const tones = ['#5e3c25', '#52331f', '#68432a', '#4a2d1b', '#593722'];
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offset = (r % 2) * 128;
      for (let col = -1; col < 3; col++) {
        const x = col * 256 + offset;
        ctx.fillStyle = tones[(r * 3 + col + 4) % tones.length];
        ctx.fillRect(x, y, 256, rowH);
        ctx.strokeStyle = 'rgba(22, 11, 5, 0.42)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 256, rowH);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(14, 14);
    tex.anisotropy = maxAniso;
    return tex;
  }

  function createBookshelfFacadeTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2d190e';
    ctx.fillRect(0, 0, 512, 512);

    const palette = [
      '#7e2d29', '#2b4b6e', '#2d5942', '#946534', '#563963',
      '#6e462c', '#3c4e66', '#8f3c33', '#495c39', '#a1804c'
    ];
    const rows = 6;
    const rowH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      ctx.fillStyle = '#5a361f';
      ctx.fillRect(0, y + rowH - 9, 512, 9);

      let bx = 6;
      let seed = (r + 1) * 97;
      while (bx < 502) {
        seed = (seed * 37 + 13) % 997;
        const bw = 8 + (seed % 5) * 3;
        const bh = rowH - 18 - (seed % 6) * 5;
        if (seed % 14 === 0) {
          bx += 14;
          continue;
        }
        const by = y + rowH - 9 - bh;
        ctx.fillStyle = palette[seed % palette.length];
        ctx.fillRect(bx, by, bw - 1, bh);
        ctx.fillStyle = 'rgba(240, 208, 152, 0.35)';
        ctx.fillRect(bx + 1, by + 8, bw - 3, 2);
        bx += bw;
      }
    }
    ctx.fillStyle = '#472916';
    [0, 168, 336, 502].forEach((vx) => ctx.fillRect(vx, 0, 10, 512));

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
  }

  function createSkyscraperTexture(isNight, variant = 0) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d');
    const baseColorsNight = ['#101522', '#141926', '#171a24'];
    const baseColorsDay = ['#546173', '#616c7d', '#6d7582'];
    ctx.fillStyle = isNight ? baseColorsNight[variant % 3] : baseColorsDay[variant % 3];
    ctx.fillRect(0, 0, 256, 512);

    const winPaletteNight = [
      ['#ffd58e', '#fff0cc', '#9ec8ff'],
      ['#b5dcff', '#ffe2a8', '#e6f2ff'],
      ['#ffca7a', '#ffad66', '#d6e8ff']
    ][variant % 3];

    const cols = variant === 1 ? 10 : 8;
    const rows = variant === 1 ? 26 : 20;
    const cw = 256 / cols;
    const rh = 512 / rows;
    let seed = (variant + 1) * 131;

    for (let r = 1; r < rows - 1; r++) {
      for (let col = 0; col < cols; col++) {
        seed = (seed * 37 + 19) % 997;
        if (isNight && seed % 3 === 0) continue; // Realistic dark unlit floors/rooms
        ctx.fillStyle = isNight
          ? winPaletteNight[seed % winPaletteNight.length]
          : (seed % 2 === 0 ? '#9ab2cc' : '#859db8');
        ctx.fillRect(col * cw + 4, r * rh + 4, cw - 8, rh - 8);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  function createSkyPanoramaTexture(isNight) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (isNight) {
      grad.addColorStop(0, '#070c1a');
      grad.addColorStop(0.52, '#13203d');
      grad.addColorStop(0.82, '#2d2638');
      grad.addColorStop(1, '#52362a');
    } else {
      grad.addColorStop(0, '#7ea8d1');
      grad.addColorStop(0.52, '#d8c9b4');
      grad.addColorStop(0.84, '#f2cfa7');
      grad.addColorStop(1, '#e6b78a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    if (isNight) {
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = `rgba(255, 246, 224, ${0.35 + Math.random() * 0.65})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 155, 1.5, 1.5);
      }
      ctx.save();
      ctx.fillStyle = '#fff3cf';
      ctx.shadowColor = '#ffe29c';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(380, 58, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0e172c';
      ctx.beginPath();
      ctx.arc(386, 55, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      const sunGrad = ctx.createRadialGradient(375, 65, 7, 375, 65, 75);
      sunGrad.addColorStop(0, 'rgba(255, 250, 232, 0.96)');
      sunGrad.addColorStop(0.42, 'rgba(255, 220, 165, 0.45)');
      sunGrad.addColorStop(1, 'rgba(255, 220, 165, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(290, 0, 170, 150);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ===== Cheap Vertex-Lit Materials (MeshLambertMaterial = ~5x faster than PBR for background!) =====
  const darkWalnutMat = new THREE.MeshLambertMaterial({ color: '#3b2214' });
  const warmOakMat = new THREE.MeshLambertMaterial({ color: '#613c24' });
  const mediumWoodMat = new THREE.MeshLambertMaterial({ color: '#4d2e1b' });
  const plasterWallMat = new THREE.MeshLambertMaterial({ color: '#584132' });
  const brassMat = new THREE.MeshLambertMaterial({ color: '#d4a861', emissive: '#382810' });
  const lampGreenShadeMat = new THREE.MeshLambertMaterial({ color: '#26543d', emissive: '#1f4a2e', emissiveIntensity: 0.7 });
  const shelfFacadeMat = new THREE.MeshLambertMaterial({ map: createBookshelfFacadeTexture() });
  const paperBookMat = new THREE.MeshLambertMaterial({ color: '#f3ead9' });

  // ===== 1. Hardwood Floor & Central Aisle Runner =====
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W + 4, HALL_D + 4),
    new THREE.MeshLambertMaterial({ map: createFloorWoodTexture() })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, 1.5);
  libGroup.add(floor);

  const runner = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, HALL_D - 4),
    new THREE.MeshLambertMaterial({ color: '#4b251c' })
  );
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, FLOOR_Y + 0.012, 1.5);
  libGroup.add(runner);

  // ===== 2. Soaring Coffered Wood Ceiling & Columns =====
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W + 2, HALL_D + 2),
    new THREE.MeshLambertMaterial({ color: '#2b190f' })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, FLOOR_Y + HALL_H, 2.5);
  libGroup.add(ceiling);

  const crossBeamGeo = new THREE.BoxGeometry(HALL_W, 0.72, 0.58);
  for (let bz = FRONT_Z + 3; bz <= BACK_Z - 3; bz += 8.0) {
    const beam = new THREE.Mesh(crossBeamGeo, darkWalnutMat);
    beam.position.set(0, FLOOR_Y + HALL_H - 0.32, bz);
    libGroup.add(beam);
  }
  const longBeamGeo = new THREE.BoxGeometry(0.58, 0.72, HALL_D);
  [-17.5, 17.5].forEach((bx) => {
    const longBeam = new THREE.Mesh(longBeamGeo, darkWalnutMat);
    longBeam.position.set(bx, FLOOR_Y + HALL_H - 0.32, 2.5);
    libGroup.add(longBeam);
  });

  // ===== Collision Obstacles Registry (Walls, Columns, Tables & Chairs) =====
  const obstacles = [];
  function registerObstacle(cx, cz, halfW, halfD) {
    obstacles.push({
      minX: cx - halfW,
      maxX: cx + halfW,
      minZ: cz - halfD,
      maxZ: cz + halfD
    });
  }

  const colGeo = new THREE.BoxGeometry(0.95, HALL_H, 0.95);
  const plinthGeo = new THREE.BoxGeometry(1.25, 0.85, 1.25);
  [
    [-17.5, -19.5], [17.5, -19.5],
    [-17.5, -8.5],  [17.5, -8.5],
    [-17.5, 2.5],   [17.5, 2.5],
    [-17.5, 13.5],  [17.5, 13.5],
    [-17.5, 24.5],  [17.5, 24.5]
  ].forEach(([cx, cz]) => {
    registerObstacle(cx, cz, 0.72, 0.72);
    const col = new THREE.Mesh(colGeo, darkWalnutMat);
    col.position.set(cx, FLOOR_Y + HALL_H / 2, cz);
    libGroup.add(col);

    const plinth = new THREE.Mesh(plinthGeo, mediumWoodMat);
    plinth.position.set(cx, FLOOR_Y + 0.42, cz);
    libGroup.add(plinth);
  });

  // ===== 3. Perimeter Walls + 2nd-Floor Mezzanine Balcony & Bookcases =====
  const sideWallGeo = new THREE.BoxGeometry(0.6, HALL_H, HALL_D);
  [-HALL_W / 2, HALL_W / 2].forEach((wx) => {
    const wall = new THREE.Mesh(sideWallGeo, plasterWallMat);
    wall.position.set(wx, FLOOR_Y + HALL_H / 2, 2.5);
    libGroup.add(wall);
  });
  const rearWall = new THREE.Mesh(new THREE.BoxGeometry(HALL_W, HALL_H, 0.6), plasterWallMat);
  rearWall.position.set(0, FLOOR_Y + HALL_H / 2, BACK_Z);
  libGroup.add(rearWall);

  const MEZZ_Y = FLOOR_Y + 6.4;
  const mezzDeckGeo = new THREE.BoxGeometry(7.2, 0.42, HALL_D - 2);
  const mezzRailGeo = new THREE.BoxGeometry(0.16, 0.14, HALL_D - 2);
  const mezzPostGeo = new THREE.BoxGeometry(0.12, 1.15, 0.12);

  [-HALL_W / 2 + 3.6, HALL_W / 2 - 3.6].forEach((mx) => {
    const deck = new THREE.Mesh(mezzDeckGeo, darkWalnutMat);
    deck.position.set(mx, MEZZ_Y, 2.5);
    libGroup.add(deck);

    const railX = mx > 0 ? mx - 3.45 : mx + 3.45;
    const topRail = new THREE.Mesh(mezzRailGeo, warmOakMat);
    topRail.position.set(railX, MEZZ_Y + 1.25, 2.5);
    libGroup.add(topRail);

    for (let rz = FRONT_Z + 4; rz <= BACK_Z - 4; rz += 4.6) {
      const post = new THREE.Mesh(mezzPostGeo, darkWalnutMat);
      post.position.set(railX, MEZZ_Y + 0.66, rz);
      libGroup.add(post);
    }
  });

  const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(HALL_W - 14, 0.42, 6.0), darkWalnutMat);
  rearDeck.position.set(0, MEZZ_Y, BACK_Z - 3.0);
  libGroup.add(rearDeck);

  const rearTopRail = new THREE.Mesh(new THREE.BoxGeometry(HALL_W - 14, 0.14, 0.16), warmOakMat);
  rearTopRail.position.set(0, MEZZ_Y + 1.25, BACK_Z - 5.9);
  libGroup.add(rearTopRail);

  const shelfBoxGeo = new THREE.BoxGeometry(7.6, 5.8, 1.0);
  const shelfFaceGeo = new THREE.PlaneGeometry(7.32, 5.42);
  function addBookcaseRun(x, y, z, rotY) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    g.add(new THREE.Mesh(shelfBoxGeo, darkWalnutMat));
    const face = new THREE.Mesh(shelfFaceGeo, shelfFacadeMat);
    face.position.set(0, 0, 0.515);
    g.add(face);
    libGroup.add(g);
  }

  for (let z = -20.5; z <= 25.5; z += 8.4) {
    addBookcaseRun(-HALL_W / 2 + 0.9, FLOOR_Y + 2.95, z, Math.PI / 2);
    addBookcaseRun(-HALL_W / 2 + 0.9, MEZZ_Y + 3.15, z, Math.PI / 2);
    addBookcaseRun(HALL_W / 2 - 0.9, FLOOR_Y + 2.95, z, -Math.PI / 2);
    addBookcaseRun(HALL_W / 2 - 0.9, MEZZ_Y + 3.15, z, -Math.PI / 2);
  }
  for (let x = -22.5; x <= 22.5; x += 8.2) {
    addBookcaseRun(x, FLOOR_Y + 2.95, BACK_Z - 0.9, Math.PI);
    addBookcaseRun(x, MEZZ_Y + 3.15, BACK_Z - 0.9, Math.PI);
  }

  // ===== 4. Grand Floor-to-Ceiling Cathedral Panoramic Front Windows =====
  const pierGeo = new THREE.BoxGeometry(10.5, HALL_H, 0.8);
  [-28.8, 28.8].forEach((px) => {
    const pier = new THREE.Mesh(pierGeo, plasterWallMat);
    pier.position.set(px, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(pier);
  });
  const frontSillWall = new THREE.Mesh(new THREE.BoxGeometry(48.0, 1.6, 0.85), darkWalnutMat);
  frontSillWall.position.set(0, FLOOR_Y + 0.8, FRONT_Z);
  libGroup.add(frontSillWall);

  const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(48.0, 2.2, 0.85), darkWalnutMat);
  frontHeader.position.set(0, FLOOR_Y + HALL_H - 1.1, FRONT_Z);
  libGroup.add(frontHeader);

  const bigMullionGeo = new THREE.BoxGeometry(0.75, HALL_H, 0.9);
  [-23.5, -8.0, 8.0, 23.5].forEach((mx) => {
    const m = new THREE.Mesh(bigMullionGeo, darkWalnutMat);
    m.position.set(mx, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(m);
  });
  const subVGeo = new THREE.BoxGeometry(0.18, HALL_H - 3.0, 0.26);
  [-15.75, 0.0, 15.75].forEach((subX) => {
    const m = new THREE.Mesh(subVGeo, darkWalnutMat);
    m.position.set(subX, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(m);
  });
  const subHGeo = new THREE.BoxGeometry(47.0, 0.18, 0.26);
  [FLOOR_Y + 5.4, FLOOR_Y + 9.8].forEach((my) => {
    const m = new THREE.Mesh(subHGeo, darkWalnutMat);
    m.position.set(0, my, FRONT_Z);
    libGroup.add(m);
  });

  // ===== 5. Wide Autumn Campus Panorama Outside Windows =====
  const outsideGroup = new THREE.Group();
  libGroup.add(outsideGroup);

  const nightSkyTex = createSkyPanoramaTexture(true);
  const daySkyTex = createSkyPanoramaTexture(false);
  const skyMat = new THREE.MeshBasicMaterial({ map: nightSkyTex, fog: false });
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(240, 96), skyMat);
  skyPlane.position.set(0, 24.0, FRONT_Z - 88.0);
  outsideGroup.add(skyPlane);

  const campusGround = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 92),
    new THREE.MeshLambertMaterial({ color: '#1d2218' })
  );
  campusGround.rotation.x = -Math.PI / 2;
  campusGround.position.set(0, FLOOR_Y + 0.05, FRONT_Z - 46.0);
  outsideGroup.add(campusGround);

  // Distant Towering Metropolitan City Skyline (26 skyscrapers across 2 depth layers!)
  const nightCityTexs = [0, 1, 2].map((v) => createSkyscraperTexture(true, v));
  const dayCityTexs = [0, 1, 2].map((v) => createSkyscraperTexture(false, v));
  const cityMats = nightCityTexs.map((tex) => new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  const spireMat = new THREE.MeshBasicMaterial({ color: '#141826', fog: false });
  const beaconMat = new THREE.MeshBasicMaterial({ color: '#ff4d4d', fog: false });
  const litWinMat = new THREE.MeshBasicMaterial({ color: '#ffd38c', fog: false });

  const skyscrapers = [
    // Mid-distance skyline band (z: FRONT_Z - 38 to -50)
    { x: -58, w: 7.5, h: 24, d: 6.5, z: FRONT_Z - 44, v: 0 },
    { x: -48, w: 6.2, h: 31, d: 6.0, z: FRONT_Z - 48, v: 1, spire: true },
    { x: -39, w: 8.0, h: 21, d: 6.5, z: FRONT_Z - 41, v: 2 },
    { x: -30, w: 6.4, h: 35, d: 6.2, z: FRONT_Z - 47, v: 1, spire: true },
    { x: -22, w: 7.2, h: 25, d: 6.0, z: FRONT_Z - 42, v: 0 },
    { x: -14, w: 5.8, h: 38, d: 5.8, z: FRONT_Z - 49, v: 1, spire: true },
    { x: -6,  w: 7.4, h: 23, d: 6.0, z: FRONT_Z - 43, v: 2 },
    { x: 3,   w: 6.6, h: 42, d: 6.6, z: FRONT_Z - 51, v: 1, spire: true, crown: true },
    { x: 12,  w: 7.8, h: 27, d: 6.2, z: FRONT_Z - 44, v: 0 },
    { x: 21,  w: 6.0, h: 36, d: 6.0, z: FRONT_Z - 48, v: 2, spire: true },
    { x: 30,  w: 8.2, h: 22, d: 6.5, z: FRONT_Z - 42, v: 0 },
    { x: 39,  w: 6.8, h: 33, d: 6.2, z: FRONT_Z - 47, v: 1, spire: true },
    { x: 49,  w: 7.5, h: 26, d: 6.5, z: FRONT_Z - 43, v: 2 },
    { x: 59,  w: 7.0, h: 30, d: 6.0, z: FRONT_Z - 48, v: 0 },

    // Far towering financial-district mega-towers (z: FRONT_Z - 58 to -72)
    { x: -64, w: 9.0, h: 34, d: 7.5, z: FRONT_Z - 64, v: 2 },
    { x: -52, w: 8.2, h: 40, d: 7.5, z: FRONT_Z - 66, v: 0, spire: true },
    { x: -41, w: 9.5, h: 32, d: 7.5, z: FRONT_Z - 62, v: 1 },
    { x: -33, w: 7.6, h: 45, d: 7.2, z: FRONT_Z - 69, v: 0, spire: true },
    { x: -24, w: 8.8, h: 36, d: 7.5, z: FRONT_Z - 63, v: 2 },
    { x: -16, w: 7.4, h: 48, d: 7.4, z: FRONT_Z - 71, v: 1, spire: true, crown: true },
    { x: -7,  w: 9.2, h: 34, d: 7.5, z: FRONT_Z - 64, v: 0 },
    { x: 10,  w: 7.8, h: 46, d: 7.4, z: FRONT_Z - 70, v: 2, spire: true },
    { x: 19,  w: 8.5, h: 35, d: 7.5, z: FRONT_Z - 63, v: 1 },
    { x: 28,  w: 7.2, h: 44, d: 7.2, z: FRONT_Z - 68, v: 0, spire: true },
    { x: 38,  w: 9.0, h: 33, d: 7.5, z: FRONT_Z - 62, v: 2 },
    { x: 50,  w: 8.4, h: 41, d: 7.5, z: FRONT_Z - 67, v: 1, spire: true },
    { x: 63,  w: 9.0, h: 36, d: 7.5, z: FRONT_Z - 65, v: 0 }
  ];

  const beaconGeo = new THREE.SphereGeometry(0.32, 8, 8);
  skyscrapers.forEach((b) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), cityMats[b.v]);
    mesh.position.set(b.x, FLOOR_Y + b.h / 2, b.z);
    outsideGroup.add(mesh);

    if (b.crown) {
      const crownTier = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.62, b.h * 0.16, b.d * 0.62), cityMats[b.v]);
      crownTier.position.set(b.x, FLOOR_Y + b.h + b.h * 0.08, b.z);
      outsideGroup.add(crownTier);
    }

    if (b.spire) {
      const spireH = b.crown ? 9.5 : 6.2;
      const topY = FLOOR_Y + b.h + (b.crown ? b.h * 0.16 : 0);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, spireH, 4), spireMat);
      spire.position.set(b.x, topY + spireH / 2, b.z);
      outsideGroup.add(spire);

      // Subtle red aviation beacon at skyscraper tip
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(b.x, topY + spireH + 0.15, b.z);
      outsideGroup.add(beacon);
    }
  });

  // Autumn trees outside window (shared geometries)
  const swayTrees = [];
  const trunkMat = new THREE.MeshLambertMaterial({ color: '#3b2518' });
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.2, 7);
  const crownGeo = new THREE.DodecahedronGeometry(1.5, 0);

  function addAutumnTree(x, z, scale, color) {
    const tree = new THREE.Group();
    tree.position.set(x, FLOOR_Y, z);
    tree.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.1;
    tree.add(trunk);

    const crown = new THREE.Group();
    crown.position.y = 4.2;
    const fMat = new THREE.MeshLambertMaterial({ color });
    [[0, 0.5, 0, 1.0], [-0.95, 0.0, 0.25, 0.72], [0.9, 0.15, -0.2, 0.76]].forEach(([cx, cy, cz, s]) => {
      const puff = new THREE.Mesh(crownGeo, fMat);
      puff.position.set(cx, cy, cz);
      puff.scale.setScalar(s);
      crown.add(puff);
    });
    tree.add(crown);
    outsideGroup.add(tree);
    swayTrees.push({ crown, phase: x * 0.4 });
  }

  addAutumnTree(-10.5, FRONT_Z - 6.5, 1.35, '#d1843b');
  addAutumnTree(-3.2, FRONT_Z - 7.8, 1.20, '#d9ab48');
  addAutumnTree(4.6, FRONT_Z - 6.8, 1.30, '#b55231');
  addAutumnTree(11.8, FRONT_Z - 7.4, 1.25, '#cfa042');

  const lanternMat = new THREE.MeshBasicMaterial({ color: '#ffe0a3', fog: false });
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.09, 5.2, 7);
  const orbGeo = new THREE.SphereGeometry(0.24, 10, 10);
  const poleMat = new THREE.MeshLambertMaterial({ color: '#1e1b19' });
  [-7.2, 0.4, 8.2].forEach((lx) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, FLOOR_Y, FRONT_Z - 5.2);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.6;
    lamp.add(pole);
    const orb = new THREE.Mesh(orbGeo, lanternMat);
    orb.position.y = 5.3;
    lamp.add(orb);
    outsideGroup.add(lamp);
  });

  // ===== 6. Lightweight Hall Lighting (ONLY 2 Broad Warm Hall PointLights instead of 9!) =====
  const frontHallLight = new THREE.PointLight('#ffbf72', 36, 36, 1.35);
  frontHallLight.position.set(0, 5.2, -9.5);
  libGroup.add(frontHallLight);

  const rearHallLight = new THREE.PointLight('#ffbf72', 30, 34, 1.35);
  rearHallLight.position.set(0, 5.2, 9.5);
  libGroup.add(rearHallLight);

  const windowLight = new THREE.DirectionalLight('#9ab8f5', 0.55);
  windowLight.position.set(-2.0, 8.5, FRONT_Z - 8.0);
  libGroup.add(windowLight);

  // Hanging Brass Chandeliers (emissive globes, no per-chandelier PointLight overhead!)
  const chandelierBulbMat = new THREE.MeshBasicMaterial({ color: '#ffdfaa' });
  const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.6, 6);
  const ringGeo = new THREE.TorusGeometry(0.95, 0.055, 8, 20);
  const globeGeo = new THREE.SphereGeometry(0.14, 8, 8);
  [[-7.5, -8.5], [7.5, -8.5], [-7.5, 8.5], [7.5, 8.5]].forEach(([cx, cz]) => {
    const ch = new THREE.Group();
    ch.position.set(cx, FLOOR_Y + HALL_H, cz);
    const rod = new THREE.Mesh(rodGeo, brassMat);
    rod.position.y = -1.8;
    ch.add(rod);
    const ring = new THREE.Mesh(ringGeo, brassMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -3.6;
    ch.add(ring);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const globe = new THREE.Mesh(globeGeo, chandelierBulbMat);
      globe.position.set(Math.cos(a) * 0.95, -3.48, Math.sin(a) * 0.95);
      ch.add(globe);
    }
    libGroup.add(ch);
  });

  // ===== 7. Spacious Rows of University Reading Tables (Shared Geometries!) =====
  const seatGeo = new THREE.BoxGeometry(1.12, 0.10, 1.06);
  const backGeo = new THREE.BoxGeometry(1.08, 1.24, 0.10);
  const chairLegGeo = new THREE.CylinderGeometry(0.042, 0.036, 1.48, 6);

  function createChair(x, z, rotY) {
    const chair = new THREE.Group();
    chair.position.set(x, FLOOR_Y, z);
    chair.rotation.y = rotY;
    const seat = new THREE.Mesh(seatGeo, warmOakMat);
    seat.position.y = 1.48;
    chair.add(seat);
    const back = new THREE.Mesh(backGeo, darkWalnutMat);
    back.position.set(0, 2.15, -0.48);
    back.rotation.x = -0.08;
    chair.add(back);
    [[-0.46, -0.44], [0.46, -0.44], [-0.46, 0.44], [0.46, 0.44]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(chairLegGeo, darkWalnutMat);
      leg.position.set(lx, 0.74, lz);
      chair.add(leg);
    });
    libGroup.add(chair);
  }

  const tableTopGeo = new THREE.BoxGeometry(6.4, 0.18, 2.5);
  const dividerGeo = new THREE.BoxGeometry(6.1, 0.52, 0.08);
  const tableLegGeo = new THREE.BoxGeometry(0.14, 2.58, 0.14);
  const lampStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6);
  const lampShadeGeo = new THREE.BoxGeometry(0.56, 0.16, 0.24);
  const openBookGeo = new THREE.BoxGeometry(0.75, 0.05, 0.54);

  function createLongReadingTable(x, z) {
    // Register table + front/back chairs as solid obstacle
    registerObstacle(x, z, 3.45, 2.15);
    const table = new THREE.Group();
    table.position.set(x, FLOOR_Y, z);

    const top = new THREE.Mesh(tableTopGeo, warmOakMat);
    top.position.y = 2.66;
    table.add(top);

    const divider = new THREE.Mesh(dividerGeo, darkWalnutMat);
    divider.position.set(0, 3.01, 0);
    table.add(divider);

    [[-2.85, -1.0], [2.85, -1.0], [-2.85, 1.0], [2.85, 1.0]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(tableLegGeo, darkWalnutMat);
      leg.position.set(lx, 1.29, lz);
      table.add(leg);
    });

    [-1.6, 1.6].forEach((lx) => {
      const stem = new THREE.Mesh(lampStemGeo, brassMat);
      stem.position.set(lx, 3.12, 0);
      table.add(stem);
      const shade = new THREE.Mesh(lampShadeGeo, lampGreenShadeMat);
      shade.position.set(lx, 3.52, 0);
      table.add(shade);
    });

    const book1 = new THREE.Mesh(openBookGeo, paperBookMat);
    book1.position.set(-1.55, 2.78, 0.65);
    table.add(book1);
    const book2 = new THREE.Mesh(openBookGeo, paperBookMat);
    book2.position.set(1.55, 2.78, -0.65);
    table.add(book2);

    libGroup.add(table);

    createChair(x - 1.55, z + 1.52, Math.PI);
    createChair(x + 1.55, z + 1.52, Math.PI);
    createChair(x - 1.55, z - 1.52, 0);
    createChair(x + 1.55, z - 1.52, 0);
  }

  // Front, side, and rear grand university reading rows
  createLongReadingTable(-9.2, -7.2);
  createLongReadingTable(9.2, -7.2);
  createLongReadingTable(-9.2, -14.2);
  createLongReadingTable(0.0, -14.2);
  createLongReadingTable(9.2, -14.2);
  createLongReadingTable(-9.2, -21.0);
  createLongReadingTable(0.0, -21.0);
  createLongReadingTable(9.2, -21.0);

  createLongReadingTable(-11.5, 0.4);
  createLongReadingTable(11.5, 0.4);

  createLongReadingTable(-9.2, 8.2);
  createLongReadingTable(0.0, 8.2);
  createLongReadingTable(9.2, 8.2);
  createLongReadingTable(-9.2, 15.2);
  createLongReadingTable(0.0, 15.2);
  createLongReadingTable(9.2, 15.2);
  createLongReadingTable(-9.2, 22.0);
  createLongReadingTable(9.2, 22.0);

  // ===== 8. Toggleable Hard-Working Students (Shared Geometries & Lambert Materials!) =====
  const studentsGroup = new THREE.Group();
  libGroup.add(studentsGroup);
  const animatedStudents = [];

  const skinMat = new THREE.MeshLambertMaterial({ color: '#ecc8ae' });
  const pantsMat = new THREE.MeshLambertMaterial({ color: '#2b2d36' });
  const headphoneBandMat = new THREE.MeshLambertMaterial({ color: '#242428' });

  const standLegGeo = new THREE.CylinderGeometry(0.12, 0.10, 1.65, 7);
  const thighGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.72, 7);
  const shinGeo = new THREE.CylinderGeometry(0.11, 0.09, 1.35, 7);
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.36, 1.18, 10);
  const shoulderGeo = new THREE.SphereGeometry(0.34, 10, 8);
  const headGeo = new THREE.SphereGeometry(0.27, 12, 10);
  const hairGeo = new THREE.SphereGeometry(0.285, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const armGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.92, 7);
  const bandGeo = new THREE.TorusGeometry(0.295, 0.026, 6, 14, Math.PI);
  const cupGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.06, 8);
  const heldBookGeo = new THREE.BoxGeometry(0.54, 0.04, 0.38);

  function createStudyingStudent({ x, y = FLOOR_Y, z, rotY, sweaterColor, hairColor, hasHeadphones = false, standing = false }) {
    const stu = new THREE.Group();
    stu.position.set(x, y, z);
    stu.rotation.y = rotY;

    const sweaterMat = new THREE.MeshLambertMaterial({ color: sweaterColor });
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const baseY = standing ? 0 : 1.54;

    if (standing) {
      [-0.18, 0.18].forEach((lx) => {
        const leg = new THREE.Mesh(standLegGeo, pantsMat);
        leg.position.set(lx, 0.82, 0);
        stu.add(leg);
      });
    } else {
      [-0.20, 0.20].forEach((lx) => {
        const thigh = new THREE.Mesh(thighGeo, pantsMat);
        thigh.rotation.x = Math.PI / 2;
        thigh.position.set(lx, baseY + 0.08, 0.24);
        stu.add(thigh);
        const shin = new THREE.Mesh(shinGeo, pantsMat);
        shin.position.set(lx, 0.72, 0.56);
        stu.add(shin);
      });
    }

    const torsoPivot = new THREE.Group();
    torsoPivot.position.set(0, standing ? 1.65 : baseY + 0.12, 0);
    torsoPivot.rotation.x = standing ? 0.08 : 0.26;
    stu.add(torsoPivot);

    const torso = new THREE.Mesh(torsoGeo, sweaterMat);
    torso.position.y = 0.58;
    torsoPivot.add(torso);

    const shoulders = new THREE.Mesh(shoulderGeo, sweaterMat);
    shoulders.scale.set(1.25, 0.55, 0.72);
    shoulders.position.y = 1.10;
    torsoPivot.add(shoulders);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.36, 0.05);
    headPivot.rotation.x = standing ? 0.18 : 0.34;
    torsoPivot.add(headPivot);

    headPivot.add(new THREE.Mesh(headGeo, skinMat));

    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.03, -0.02);
    hair.rotation.x = -0.25;
    headPivot.add(hair);

    if (hasHeadphones) {
      const band = new THREE.Mesh(bandGeo, headphoneBandMat);
      band.position.y = 0.04;
      headPivot.add(band);
      [-0.28, 0.28].forEach((ex) => {
        const cup = new THREE.Mesh(cupGeo, brassMat);
        cup.rotation.z = Math.PI / 2;
        cup.position.set(ex, 0.0, 0);
        headPivot.add(cup);
      });
    }

    const leftArm = new THREE.Mesh(armGeo, sweaterMat);
    leftArm.position.set(-0.42, 0.72, 0.32);
    leftArm.rotation.set(0.95, 0, -0.22);
    torsoPivot.add(leftArm);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.38, 1.02, 0.04);
    torsoPivot.add(rightArmPivot);

    const rightArm = new THREE.Mesh(armGeo, sweaterMat);
    rightArm.position.set(0.04, -0.32, 0.30);
    rightArm.rotation.set(0.98, 0, 0.18);
    rightArmPivot.add(rightArm);

    if (standing) {
      const heldBook = new THREE.Mesh(heldBookGeo, paperBookMat);
      heldBook.position.set(0, 0.46, 0.62);
      heldBook.rotation.x = 0.42;
      torsoPivot.add(heldBook);
    }

    studentsGroup.add(stu);
    animatedStudents.push({
      torsoPivot,
      headPivot,
      rightArmPivot,
      standing,
      phase: x * 0.9 + z * 0.6,
      baseTorsoX: torsoPivot.rotation.x,
      baseHeadX: headPivot.rotation.x
    });
  }

  [
    { x: -10.75, z: -5.72, rotY: Math.PI, sweaterColor: '#c9b399', hairColor: '#221a17' },
    { x: -7.65, z: -8.68, rotY: 0, sweaterColor: '#486058', hairColor: '#2a1d16', hasHeadphones: true },
    { x: 7.65, z: -5.72, rotY: Math.PI, sweaterColor: '#8c4c3d', hairColor: '#1d1816', hasHeadphones: true },
    { x: 10.75, z: -8.68, rotY: 0, sweaterColor: '#3d516b', hairColor: '#251c18' },
    { x: -1.55, z: -12.72, rotY: Math.PI, sweaterColor: '#b58d5e', hairColor: '#221a17' },
    { x: 1.55, z: -15.68, rotY: 0, sweaterColor: '#5d4a66', hairColor: '#1e1918' },
    { x: -7.65, z: -19.52, rotY: Math.PI, sweaterColor: '#56684f', hairColor: '#231b18' },
    { x: 7.65, z: -19.52, rotY: Math.PI, sweaterColor: '#a66b51', hairColor: '#261d17', hasHeadphones: true },
    { x: -9.95, z: 1.88, rotY: Math.PI, sweaterColor: '#56684f', hairColor: '#231b18' },
    { x: 9.95, z: -1.08, rotY: 0, sweaterColor: '#a66b51', hairColor: '#261d17', hasHeadphones: true },
    { x: -7.65, z: 9.68, rotY: Math.PI, sweaterColor: '#415b76', hairColor: '#1f1918' },
    { x: 1.55, z: 6.72, rotY: 0, sweaterColor: '#c2a687', hairColor: '#241b16', hasHeadphones: true },
    { x: 10.75, z: 9.68, rotY: Math.PI, sweaterColor: '#7a3e38', hairColor: '#221a17' },
    { x: -1.55, z: 16.68, rotY: Math.PI, sweaterColor: '#486058', hairColor: '#201916' },
    { x: -29.2, y: MEZZ_Y + 0.21, z: -6.5, rotY: Math.PI / 2, sweaterColor: '#c9b399', hairColor: '#221a17', standing: true },
    { x: 29.2, y: MEZZ_Y + 0.21, z: -9.2, rotY: -Math.PI / 2, sweaterColor: '#486058', hairColor: '#201916', standing: true }
  ].forEach(createStudyingStudent);

  // ===== 9. Grand Spectacular 3D Fireworks Outside Panoramic Windows (Big, Radiant & Lightweight!) =====
  function createSparkTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.22, 'rgba(255, 250, 232, 0.96)');
    g.addColorStop(0.52, 'rgba(255, 220, 155, 0.45)');
    g.addColorStop(1.0, 'rgba(255, 180, 100, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const sparkTex = createSparkTexture();
  const fireworksGroup = new THREE.Group();
  outsideGroup.add(fireworksGroup);

  const FW_PALETTES = [
    ['#ffe066', '#fff6d6', '#ff922b', '#ff595e'], // Imperial gold & crimson
    ['#ff6b9d', '#ffd166', '#ffcad4', '#c77dff'], // Rose sakura & violet gold
    ['#48bfe3', '#80ffdb', '#ffffff', '#72efdd'], // Electric cyan & pearl
    ['#ff9f1c', '#ffbf69', '#ff4d6d', '#fff3b0'], // Radiant sunset peony
    ['#b5179e', '#f72585', '#ffd670', '#e0aaff'], // Neon magenta & champagne
    ['#52b788', '#d8f3dc', '#ffe066', '#95d5b2']  // Emerald & golden willow
  ];

  const activeFireworks = [];
  let nextLaunchCooldown = 0.45;

  function launchFirework() {
    const palette = FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)];
    const targetX = (Math.random() - 0.5) * 48;
    const targetY = 5.5 + Math.random() * 7.8; // Dazzling blooms rising high in front of the city skyline!
    const targetZ = FRONT_Z - 16.0 - Math.random() * 10.0;

    const trailCount = 14;
    const trailPos = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      trailPos[i * 3] = targetX;
      trailPos[i * 3 + 1] = FLOOR_Y + 0.5;
      trailPos[i * 3 + 2] = targetZ;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({
      color: '#fff0bd',
      map: sparkTex,
      size: 0.62,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    fireworksGroup.add(trailPoints);

    activeFireworks.push({
      phase: 'rocket',
      palette,
      x: targetX,
      y: FLOOR_Y + 0.5,
      z: targetZ,
      targetY,
      vy: 8.8 + Math.random() * 2.6,
      trailPoints,
      trailPos,
      trailCount,
      burstPoints: null,
      burstVelocities: null,
      flashSprite: null,
      burstLife: 0,
      burstMaxLife: 2.7 + Math.random() * 0.7
    });
  }

  function explodeFirework(fw) {
    fireworksGroup.remove(fw.trailPoints);
    fw.trailPoints.geometry.dispose();
    fw.trailPoints.material.dispose();
    fw.trailPoints = null;

    // 1. Dazzling white-gold core bloom sprite at explosion center
    const flashMat = new THREE.SpriteMaterial({
      map: sparkTex,
      color: fw.palette[0],
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const flashSprite = new THREE.Sprite(flashMat);
    flashSprite.position.set(fw.x, fw.y, fw.z);
    flashSprite.scale.set(2.4, 2.4, 1);
    fireworksGroup.add(flashSprite);

    // 2. Lush dual-ring spherical burst (112 radiant sparks — huge, vibrant chrysanthemum/willow!)
    const count = 112;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const cObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = fw.x;
      positions[i * 3 + 1] = fw.y;
      positions[i * 3 + 2] = fw.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Inner radiant peony core + huge outer willow halo!
      const isInner = i < 34;
      const speed = isInner ? 3.8 + Math.random() * 2.4 : 7.6 + Math.random() * 4.4;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed + 1.0;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.55;

      cObj.set(fw.palette[isInner ? (i % 2) : (i % fw.palette.length)]);
      colors[i * 3] = cObj.r;
      colors[i * 3 + 1] = cObj.g;
      colors[i * 3 + 2] = cObj.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.48,
      map: sparkTex,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });

    const pts = new THREE.Points(geo, mat);
    fireworksGroup.add(pts);

    fw.phase = 'burst';
    fw.burstPoints = pts;
    fw.burstVelocities = velocities;
    fw.flashSprite = flashSprite;
    fw.burstLife = 0;
  }

  function updateFireworks(dt, elapsed) {
    if (!isNightMode) {
      fireworksGroup.visible = false;
      return;
    }
    fireworksGroup.visible = true;

    nextLaunchCooldown -= dt;
    if (nextLaunchCooldown <= 0 && activeFireworks.length < 4) {
      launchFirework();
      nextLaunchCooldown = 1.05 + Math.random() * 1.25;
    }

    for (let i = activeFireworks.length - 1; i >= 0; i--) {
      const fw = activeFireworks[i];
      if (fw.phase === 'rocket') {
        fw.y += fw.vy * dt;
        fw.vy *= Math.pow(0.78, dt);

        for (let t = fw.trailCount - 1; t > 0; t--) {
          fw.trailPos[t * 3] = fw.trailPos[(t - 1) * 3] + (Math.random() - 0.5) * 0.05;
          fw.trailPos[t * 3 + 1] = fw.trailPos[(t - 1) * 3 + 1];
          fw.trailPos[t * 3 + 2] = fw.trailPos[(t - 1) * 3 + 2];
        }
        fw.trailPos[0] = fw.x;
        fw.trailPos[1] = fw.y;
        fw.trailPos[2] = fw.z;
        fw.trailPoints.geometry.attributes.position.needsUpdate = true;

        if (fw.y >= fw.targetY || fw.vy < 1.3) {
          explodeFirework(fw);
        }
      } else {
        fw.burstLife += dt;
        const lifeT = fw.burstLife / fw.burstMaxLife;

        // Expanding & fading core bloom flash
        if (fw.flashSprite) {
          const ft = Math.min(1, fw.burstLife / 0.42);
          const fScale = 2.2 + ft * 6.5;
          fw.flashSprite.scale.set(fScale, fScale, 1);
          fw.flashSprite.material.opacity = Math.max(0, (1 - ft) * 0.85);
          if (ft >= 1) {
            fireworksGroup.remove(fw.flashSprite);
            fw.flashSprite.material.dispose();
            fw.flashSprite = null;
          }
        }

        if (lifeT >= 1) {
          fireworksGroup.remove(fw.burstPoints);
          fw.burstPoints.geometry.dispose();
          fw.burstPoints.material.dispose();
          if (fw.flashSprite) {
            fireworksGroup.remove(fw.flashSprite);
            fw.flashSprite.material.dispose();
          }
          activeFireworks.splice(i, 1);
          continue;
        }

        const posAttr = fw.burstPoints.geometry.attributes.position;
        const arr = posAttr.array;
        const vels = fw.burstVelocities;
        const drag = Math.pow(0.36, dt);

        for (let p = 0; p < arr.length; p += 3) {
          vels[p] *= drag;
          vels[p + 1] = vels[p + 1] * drag - 2.1 * dt;
          vels[p + 2] *= drag;
          arr[p] += vels[p] * dt;
          arr[p + 1] += vels[p + 1] * dt;
          arr[p + 2] += vels[p + 2] * dt;
        }
        posAttr.needsUpdate = true;

        // Sparkling glitter shimmer during descent
        const glitter = lifeT > 0.45 ? 0.72 + 0.28 * Math.sin(elapsed * 32 + i * 2.7) : 1.0;
        fw.burstPoints.material.opacity = Math.max(0, (1 - Math.pow(lifeT, 1.7)) * glitter);
        fw.burstPoints.material.size = 1.52 * (1 - lifeT * 0.28);
      }
    }
  }

  // ===== Public Controller API =====
  let hasPeople = true;
  let isNightMode = true;
  let lastElapsed = 0;

  function setOccupied(occupied) {
    hasPeople = !!occupied;
    studentsGroup.visible = hasPeople;
    lampGreenShadeMat.emissiveIntensity = isNightMode ? (hasPeople ? 0.75 : 0.25) : 0.08;
    frontHallLight.intensity = isNightMode ? (hasPeople ? 36 : 22) : 8;
    rearHallLight.intensity = isNightMode ? (hasPeople ? 30 : 18) : 6;
  }

  function setLightingMode(nightMode) {
    isNightMode = !!nightMode;
    skyMat.map = isNightMode ? nightSkyTex : daySkyTex;
    skyMat.needsUpdate = true;

    cityMats.forEach((m, idx) => {
      m.map = isNightMode ? nightCityTexs[idx] : dayCityTexs[idx];
      m.needsUpdate = true;
    });
    beaconMat.color.set(isNightMode ? '#ff4d4d' : '#7b8494');

    litWinMat.color.set(isNightMode ? '#ffd38c' : '#7a8a9e');
    lanternMat.color.set(isNightMode ? '#ffe0a3' : '#d6cab6');
    chandelierBulbMat.color.set(isNightMode ? '#ffdfaa' : '#fff5e4');
    lampGreenShadeMat.emissiveIntensity = isNightMode ? (hasPeople ? 0.75 : 0.25) : 0.08;

    windowLight.color.set(isNightMode ? '#9ab8f5' : '#ffe4bd');
    windowLight.intensity = isNightMode ? 0.55 : 1.55;

    frontHallLight.intensity = isNightMode ? (hasPeople ? 36 : 22) : 8;
    rearHallLight.intensity = isNightMode ? (hasPeople ? 30 : 18) : 6;
  }

  function update(elapsed) {
    const dt = Math.min(0.06, Math.max(0.001, elapsed - lastElapsed));
    lastElapsed = elapsed;

    swayTrees.forEach(({ crown, phase }) => {
      crown.rotation.z = Math.sin(elapsed * 0.85 + phase) * 0.032;
    });

    updateFireworks(dt, elapsed);

    if (hasPeople) {
      animatedStudents.forEach((s) => {
        s.torsoPivot.rotation.x = s.baseTorsoX + Math.sin(elapsed * 1.2 + s.phase) * 0.022;
        s.headPivot.rotation.x = s.baseHeadX + Math.sin(elapsed * 0.85 + s.phase) * 0.04;
        s.headPivot.rotation.y = Math.sin(elapsed * 0.45 + s.phase) * 0.08;
        if (!s.standing) {
          s.rightArmPivot.rotation.z = Math.sin(elapsed * 4.2 + s.phase) * 0.035;
          s.rightArmPivot.rotation.x = Math.cos(elapsed * 3.1 + s.phase) * 0.025;
        }
      });
    }
  }

  setOccupied(true);
  setLightingMode(true);

  return {
    setOccupied,
    setLightingMode,
    update,
    isOccupied: () => hasPeople,
    getCollisionData: () => ({
      bounds: { minX: -HALL_W / 2 + 2.2, maxX: HALL_W / 2 - 2.2, minZ: FRONT_Z + 1.6, maxZ: BACK_Z - 2.2 },
      obstacles
    })
  };
}
