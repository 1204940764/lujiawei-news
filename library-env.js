import * as THREE from 'three';

// ===== Photorealistic Grand University Library Hall + Metropolitan Night Skyline + Streaked Long-Exposure Fireworks =====
export function createLibraryEnvironment(scene, maxAniso = 8) {
  const libGroup = new THREE.Group();
  scene.add(libGroup);

  const FLOOR_Y = -3.02;
  const HALL_W = 68;
  const HALL_D = 62;
  const HALL_H = 16.5;
  const FRONT_Z = -27.5;
  const BACK_Z = 32.5;

  // ===== High-Craft Procedural PBR Textures (Color + Bump/Roughness) =====
  function createParquetWoodMaps() {
    const colorC = document.createElement('canvas');
    colorC.width = 1024;
    colorC.height = 1024;
    const ctx = colorC.getContext('2d');

    const bumpC = document.createElement('canvas');
    bumpC.width = 1024;
    bumpC.height = 1024;
    const bctx = bumpC.getContext('2d');

    ctx.fillStyle = '#4a2d1b';
    ctx.fillRect(0, 0, 1024, 1024);
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, 1024, 1024);

    const rows = 8;
    const rowH = 1024 / rows;
    const tones = ['#5a3721', '#4c2d1a', '#653f27', '#452817', '#553420', '#5e3b24'];

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offset = (r % 3) * 170;
      for (let col = -1; col < 3; col++) {
        const x = col * 512 + offset;
        const base = tones[(r * 5 + col + 8) % tones.length];
        ctx.fillStyle = base;
        ctx.fillRect(x, y, 512, rowH);

        // Organic wood grain fibers (both color & bump)
        for (let g = 0; g < 26; g++) {
          const gy = y + Math.random() * rowH;
          const isDark = Math.random() > 0.45;
          ctx.fillStyle = isDark ? 'rgba(20,9,3,0.12)' : 'rgba(195,138,88,0.08)';
          ctx.fillRect(x, gy, 512, 1 + Math.random() * 2.5);
          bctx.fillStyle = isDark ? 'rgba(55,55,55,0.28)' : 'rgba(205,205,205,0.18)';
          bctx.fillRect(x, gy, 512, 1.5);
        }

        // Deep bevel plank seams
        ctx.strokeStyle = 'rgba(18, 8, 3, 0.55)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 512, rowH);
        bctx.strokeStyle = '#181818';
        bctx.lineWidth = 4;
        bctx.strokeRect(x, y, 512, rowH);
      }
    }

    const map = new THREE.CanvasTexture(colorC);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(13, 13);
    map.anisotropy = maxAniso;

    const bumpMap = new THREE.CanvasTexture(bumpC);
    bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.repeat.set(13, 13);
    bumpMap.anisotropy = maxAniso;

    return { map, bumpMap };
  }

  function createPhotorealBookcaseTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1d0f08';
    ctx.fillRect(0, 0, 1024, 1024);

    const palette = [
      '#6e2420', '#233d5c', '#224734', '#85582c', '#472e54',
      '#5e3a24', '#314257', '#7d3028', '#3c4d2f', '#8f703e',
      '#5c3b28', '#2a464f', '#3d2820', '#734b30'
    ];
    const rows = 6;
    const rowH = 1024 / rows;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;

      // Ambient occlusion shadow under upper shelf
      const topShadow = ctx.createLinearGradient(0, y, 0, y + 36);
      topShadow.addColorStop(0, 'rgba(0,0,0,0.72)');
      topShadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topShadow;
      ctx.fillRect(0, y, 1024, 36);

      // Rich walnut shelf plank with lit front lip
      ctx.fillStyle = '#5a361f';
      ctx.fillRect(0, y + rowH - 22, 1024, 22);
      ctx.fillStyle = 'rgba(225, 172, 118, 0.28)';
      ctx.fillRect(0, y + rowH - 22, 1024, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, y + rowH - 4, 1024, 4);

      // Individual hardcover leather/cloth spines with rounded shading & gold foil labels
      let bx = 16;
      let seed = (r + 1) * 103;
      while (bx < 1000) {
        seed = (seed * 37 + 17) % 997;
        const bw = 14 + (seed % 6) * 5;
        const bh = rowH - 34 - (seed % 7) * 9;
        if (seed % 15 === 0) {
          bx += 28;
          continue;
        }
        const by = y + rowH - 22 - bh;
        ctx.fillStyle = palette[seed % palette.length];
        ctx.fillRect(bx, by, bw - 2, bh);

        // Cylindrical spine highlight + shadow
        const spGrad = ctx.createLinearGradient(bx, 0, bx + bw - 2, 0);
        spGrad.addColorStop(0, 'rgba(0,0,0,0.34)');
        spGrad.addColorStop(0.28, 'rgba(255,245,230,0.16)');
        spGrad.addColorStop(0.75, 'rgba(0,0,0,0.06)');
        spGrad.addColorStop(1, 'rgba(0,0,0,0.42)');
        ctx.fillStyle = spGrad;
        ctx.fillRect(bx, by, bw - 2, bh);

        // Embossed gold spine bands / title plate
        if (seed % 3 !== 0) {
          ctx.fillStyle = 'rgba(235, 198, 134, 0.55)';
          ctx.fillRect(bx + 3, by + 18, bw - 8, 3);
          ctx.fillRect(bx + 3, by + 26, bw - 8, 2);
          ctx.fillRect(bx + 3, by + bh - 24, bw - 8, 3);
        }
        bx += bw;
      }
    }

    // Heavy walnut vertical stiles
    ctx.fillStyle = '#3d2212';
    [0, 336, 672, 1000].forEach((vx) => {
      ctx.fillRect(vx, 0, 24, 1024);
      ctx.fillStyle = 'rgba(210,158,104,0.18)';
      ctx.fillRect(vx + 3, 0, 3, 1024);
      ctx.fillStyle = '#3d2212';
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
  }

  function createPhotorealSkyscraperTexture(isNight, variant = 0) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext('2d');

    // Curtain-wall architectural glass base
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    if (isNight) {
      const tops = ['#0e1628', '#111a2e', '#151929'];
      const bots = ['#1c2236', '#212638', '#262333'];
      grad.addColorStop(0, tops[variant % 3]);
      grad.addColorStop(1, bots[variant % 3]);
    } else {
      grad.addColorStop(0, '#5a6e87');
      grad.addColorStop(1, '#7a8899');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle glass mullion lines
    ctx.strokeStyle = isNight ? 'rgba(6, 10, 20, 0.72)' : 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;

    const cols = variant === 1 ? 14 : 10;
    const rows = variant === 1 ? 36 : 28;
    const cw = 512 / cols;
    const rh = 1024 / rows;

    const officePalettes = [
      ['#ffdf9e', '#fff2d1', '#b8dcff', '#ffc478'],
      ['#cce6ff', '#ffe8b8', '#eef6ff', '#9ec8f5'],
      ['#ffd28a', '#ffb86c', '#fff0cc', '#d4e8ff']
    ][variant % 3];

    let seed = (variant + 1) * 197;
    for (let r = 1; r < rows - 1; r++) {
      // Occasional dark mechanical floor
      const isMechFloor = r === Math.floor(rows * 0.45) || r === Math.floor(rows * 0.78);
      for (let col = 0; col < cols; col++) {
        seed = (seed * 37 + 23) % 997;
        const wx = col * cw + 4;
        const wy = r * rh + 4;
        const ww = cw - 8;
        const wh = rh - 8;

        if (isMechFloor) {
          ctx.fillStyle = isNight ? 'rgba(8, 12, 22, 0.9)' : 'rgba(60, 70, 82, 0.7)';
          ctx.fillRect(wx, wy, ww, wh);
          continue;
        }

        if (isNight) {
          // Realistic office cluster lighting (contiguous lit rooms)
          const lit = (seed % 10) < 6;
          if (lit) {
            ctx.fillStyle = officePalettes[seed % officePalettes.length];
            ctx.globalAlpha = 0.55 + ((seed % 5) * 0.11);
            ctx.fillRect(wx, wy, ww, wh);
            // Tiny interior ceiling-light highlight bar inside each office window
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.35;
            ctx.fillRect(wx + 2, wy + 2, ww - 4, 3);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.fillStyle = 'rgba(20, 32, 54, 0.55)';
            ctx.fillRect(wx, wy, ww, wh);
          }
        } else {
          ctx.fillStyle = seed % 2 === 0 ? 'rgba(175, 200, 224, 0.75)' : 'rgba(140, 168, 198, 0.75)';
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
    }

    // Glowing warm ground-floor lobby band
    if (isNight) {
      const lobbyGrad = ctx.createLinearGradient(0, 960, 0, 1024);
      lobbyGrad.addColorStop(0, 'rgba(255, 204, 130, 0.2)');
      lobbyGrad.addColorStop(1, 'rgba(255, 214, 150, 0.85)');
      ctx.fillStyle = lobbyGrad;
      ctx.fillRect(0, 960, 512, 64);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
  }

  function createSkyPanoramaTexture(isNight) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (isNight) {
      // Photographic Makoto-Shinkai / twilight metropolitan sky: deep sapphire -> violet -> warm hopeful horizon glow
      grad.addColorStop(0.0, '#0d1a38');
      grad.addColorStop(0.32, '#1c3261');
      grad.addColorStop(0.60, '#3e4678');
      grad.addColorStop(0.80, '#8a5d6e');
      grad.addColorStop(0.92, '#d48d68');
      grad.addColorStop(1.0, '#f2bd88');
    } else {
      grad.addColorStop(0.0, '#6a99c9');
      grad.addColorStop(0.48, '#c6d2dc');
      grad.addColorStop(0.80, '#f0d4b6');
      grad.addColorStop(1.0, '#e8bc92');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle wispy twilight clouds for atmospheric realism
    for (let i = 0; i < 18; i++) {
      const cx = (i * 73 + 60) % 1024;
      const cy = 190 + (i % 5) * 34;
      const rx = 90 + (i % 4) * 55;
      const ry = 10 + (i % 3) * 6;
      const cg = ctx.createRadialGradient(cx, cy, 4, cx, cy, rx);
      cg.addColorStop(0, isNight ? 'rgba(255, 200, 165, 0.14)' : 'rgba(255, 250, 242, 0.38)');
      cg.addColorStop(1, 'rgba(255, 200, 165, 0)');
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (isNight) {
      // Crisp twinkling stars in upper zenith
      for (let i = 0; i < 220; i++) {
        const sx = Math.random() * 1024;
        const sy = Math.random() * 235;
        const r = 0.6 + Math.random() * 1.4;
        ctx.fillStyle = `rgba(255, 248, 232, ${0.3 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Radiant golden crescent moon with soft optical halo
      ctx.save();
      const moonHalo = ctx.createRadialGradient(780, 96, 12, 780, 96, 95);
      moonHalo.addColorStop(0, 'rgba(255, 244, 204, 0.55)');
      moonHalo.addColorStop(0.4, 'rgba(255, 224, 160, 0.16)');
      moonHalo.addColorStop(1, 'rgba(255, 224, 160, 0)');
      ctx.fillStyle = moonHalo;
      ctx.fillRect(680, 0, 200, 200);

      ctx.fillStyle = '#fff8de';
      ctx.beginPath();
      ctx.arc(780, 96, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#14254c';
      ctx.beginPath();
      ctx.arc(789, 91, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      const sunGrad = ctx.createRadialGradient(760, 120, 14, 760, 120, 160);
      sunGrad.addColorStop(0, 'rgba(255, 252, 238, 0.96)');
      sunGrad.addColorStop(0.4, 'rgba(255, 224, 172, 0.42)');
      sunGrad.addColorStop(1, 'rgba(255, 224, 172, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(580, 0, 360, 300);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ===== Realistic PBR Architectural Materials =====
  const parquetMaps = createParquetWoodMaps();
  const floorMat = new THREE.MeshPhysicalMaterial({
    map: parquetMaps.map,
    bumpMap: parquetMaps.bumpMap,
    bumpScale: 0.02,
    roughness: 0.34,
    metalness: 0.04,
    clearcoat: 0.38,
    clearcoatRoughness: 0.28
  });

  const darkWalnutMat = new THREE.MeshStandardMaterial({ color: '#3e2415', roughness: 0.44, metalness: 0.06 });
  const warmOakMat = new THREE.MeshStandardMaterial({ color: '#694228', roughness: 0.40, metalness: 0.05 });
  const mediumWoodMat = new THREE.MeshStandardMaterial({ color: '#52321e', roughness: 0.48, metalness: 0.06 });
  const plasterWallMat = new THREE.MeshStandardMaterial({ color: '#6b5342', roughness: 0.86, metalness: 0.02 });
  const brassMat = new THREE.MeshStandardMaterial({ color: '#dfb46c', roughness: 0.24, metalness: 0.88 });
  const lampGreenShadeMat = new THREE.MeshStandardMaterial({
    color: '#255c42',
    emissive: '#2f8a58',
    emissiveIntensity: 0.95,
    roughness: 0.28,
    metalness: 0.12
  });
  const shelfFacadeMat = new THREE.MeshStandardMaterial({
    map: createPhotorealBookcaseTexture(),
    roughness: 0.68,
    metalness: 0.04
  });
  const paperBookMat = new THREE.MeshStandardMaterial({ color: '#f5ede0', roughness: 0.88 });
  const cushionVelvetMat = new THREE.MeshStandardMaterial({ color: '#6b2e26', roughness: 0.92 });

  // ===== 1. Varnished Hardwood Floor & Vintage Woven Runner =====
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W + 4, HALL_D + 4), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, 2.5);
  floor.receiveShadow = true;
  libGroup.add(floor);

  const runner = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, HALL_D - 4),
    new THREE.MeshStandardMaterial({ color: '#542920', roughness: 0.94 })
  );
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, FLOOR_Y + 0.012, 2.5);
  libGroup.add(runner);

  // Gold woven runner border trims
  [-2.65, 2.65].forEach((rx) => {
    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, HALL_D - 4.4),
      new THREE.MeshStandardMaterial({ color: '#c49654', roughness: 0.82 })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.set(rx, FLOOR_Y + 0.014, 2.5);
    libGroup.add(border);
  });

  // ===== 2. Soaring Coffered Wood Ceiling & Architectural Columns =====
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W + 2, HALL_D + 2),
    new THREE.MeshStandardMaterial({ color: '#2e1b11', roughness: 0.76 })
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

  // ===== Collision Obstacles Registry =====
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
  const plinthGeo = new THREE.BoxGeometry(1.28, 0.92, 1.28);
  const capitalGeo = new THREE.BoxGeometry(1.32, 0.42, 1.32);
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
    plinth.position.set(cx, FLOOR_Y + 0.46, cz);
    libGroup.add(plinth);

    const capital = new THREE.Mesh(capitalGeo, mediumWoodMat);
    capital.position.set(cx, FLOOR_Y + HALL_H - 0.55, cz);
    libGroup.add(capital);
  });

  // ===== 3. Perimeter Walls + 2nd-Floor Mezzanine Balcony & Photoreal Bookcases =====
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
    const topRail = new THREE.Mesh(mezzRailGeo, brassMat);
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

  const rearTopRail = new THREE.Mesh(new THREE.BoxGeometry(HALL_W - 14, 0.14, 0.16), brassMat);
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

  // ===== 4. Grand Floor-to-Ceiling Cathedral Windows with Subtle Glass Reflection =====
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

  // Architectural glass pane with subtle optical sheen
  const windowGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(46.8, HALL_H - 3.4),
    new THREE.MeshPhysicalMaterial({
      color: '#dceaff',
      transparent: true,
      opacity: 0.07,
      roughness: 0.08,
      metalness: 0.15,
      reflectivity: 0.65
    })
  );
  windowGlass.position.set(0, FLOOR_Y + HALL_H / 2 - 0.1, FRONT_Z + 0.08);
  libGroup.add(windowGlass);

  // ===== 5. Photorealistic Metropolitan Night City Skyline (Lujiazui-Inspired) =====
  const outsideGroup = new THREE.Group();
  libGroup.add(outsideGroup);

  const nightSkyTex = createSkyPanoramaTexture(true);
  const daySkyTex = createSkyPanoramaTexture(false);
  const skyMat = new THREE.MeshBasicMaterial({ map: nightSkyTex, fog: false });
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(260, 108), skyMat);
  skyPlane.position.set(0, 26.0, FRONT_Z - 92.0);
  outsideGroup.add(skyPlane);

  // Warm city-horizon light-pollution glow band (makes distant city skyline look photographic!)
  const horizonGlowCanvas = document.createElement('canvas');
  horizonGlowCanvas.width = 512;
  horizonGlowCanvas.height = 128;
  const hctx = horizonGlowCanvas.getContext('2d');
  const hgrad = hctx.createLinearGradient(0, 0, 0, 128);
  hgrad.addColorStop(0, 'rgba(255, 188, 120, 0)');
  hgrad.addColorStop(0.65, 'rgba(255, 178, 112, 0.28)');
  hgrad.addColorStop(1, 'rgba(255, 206, 145, 0.58)');
  hctx.fillStyle = hgrad;
  hctx.fillRect(0, 0, 512, 128);
  const horizonGlowMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(horizonGlowCanvas),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  });
  const horizonGlow = new THREE.Mesh(new THREE.PlaneGeometry(240, 26), horizonGlowMat);
  horizonGlow.position.set(0, FLOOR_Y + 12.0, FRONT_Z - 78.0);
  outsideGroup.add(horizonGlow);

  const campusGround = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 96),
    new THREE.MeshStandardMaterial({ color: '#1f241b', roughness: 0.92 })
  );
  campusGround.rotation.x = -Math.PI / 2;
  campusGround.position.set(0, FLOOR_Y + 0.05, FRONT_Z - 48.0);
  outsideGroup.add(campusGround);

  // 29 Architectural Skyscrapers with Curtain-Wall Grids, Crown LED Strips & Blinking Beacons
  const nightCityTexs = [0, 1, 2].map((v) => createPhotorealSkyscraperTexture(true, v));
  const dayCityTexs = [0, 1, 2].map((v) => createPhotorealSkyscraperTexture(false, v));
  const cityMats = nightCityTexs.map((tex) => new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  const spireMat = new THREE.MeshBasicMaterial({ color: '#171f33', fog: false });
  // HDR emissive materials (>1.0 brightness triggers silky UnrealBloom halo!)
  const ledStripGoldMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.15, 0.65), fog: false });
  const ledStripCyanMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.65, 1.25, 1.55), fog: false });
  const beaconMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.35, 0.35), fog: false });
  const litWinMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.15, 0.72), fog: false });

  const skyscrapers = [
    // Mid-distance skyline band
    { x: -62, w: 7.8, h: 25, d: 6.5, z: FRONT_Z - 44, v: 0 },
    { x: -51, w: 6.4, h: 33, d: 6.2, z: FRONT_Z - 48, v: 1, spire: true, led: 'cyan' },
    { x: -41, w: 8.2, h: 22, d: 6.5, z: FRONT_Z - 41, v: 2 },
    { x: -32, w: 6.6, h: 37, d: 6.4, z: FRONT_Z - 47, v: 1, spire: true, crown: true, led: 'gold' },
    { x: -23, w: 7.4, h: 26, d: 6.2, z: FRONT_Z - 42, v: 0 },
    { x: -14, w: 6.0, h: 41, d: 6.0, z: FRONT_Z - 49, v: 1, spire: true, led: 'cyan' },
    { x: -5,  w: 7.6, h: 24, d: 6.2, z: FRONT_Z - 43, v: 2 },
    { x: 4,   w: 6.8, h: 46, d: 6.8, z: FRONT_Z - 52, v: 1, spire: true, crown: true, led: 'gold' },
    { x: 13,  w: 8.0, h: 28, d: 6.4, z: FRONT_Z - 44, v: 0 },
    { x: 22,  w: 6.2, h: 39, d: 6.2, z: FRONT_Z - 48, v: 2, spire: true, led: 'gold' },
    { x: 32,  w: 8.4, h: 23, d: 6.5, z: FRONT_Z - 42, v: 0 },
    { x: 42,  w: 7.0, h: 35, d: 6.4, z: FRONT_Z - 47, v: 1, spire: true, led: 'cyan' },
    { x: 52,  w: 7.8, h: 27, d: 6.5, z: FRONT_Z - 43, v: 2 },
    { x: 63,  w: 7.2, h: 32, d: 6.2, z: FRONT_Z - 48, v: 0 },
    // Far towering financial-district mega-towers
    { x: -68, w: 9.2, h: 36, d: 7.5, z: FRONT_Z - 64, v: 2 },
    { x: -55, w: 8.4, h: 43, d: 7.5, z: FRONT_Z - 67, v: 0, spire: true, led: 'gold' },
    { x: -43, w: 9.5, h: 34, d: 7.5, z: FRONT_Z - 62, v: 1 },
    { x: -34, w: 7.8, h: 49, d: 7.4, z: FRONT_Z - 70, v: 0, spire: true, crown: true, led: 'cyan' },
    { x: -24, w: 8.8, h: 38, d: 7.5, z: FRONT_Z - 63, v: 2 },
    { x: -16, w: 7.6, h: 54, d: 7.6, z: FRONT_Z - 72, v: 1, spire: true, crown: true, led: 'gold' },
    { x: -6,  w: 9.2, h: 36, d: 7.5, z: FRONT_Z - 64, v: 0 },
    { x: 11,  w: 8.0, h: 51, d: 7.5, z: FRONT_Z - 71, v: 2, spire: true, crown: true, led: 'cyan' },
    { x: 20,  w: 8.6, h: 37, d: 7.5, z: FRONT_Z - 63, v: 1 },
    { x: 30,  w: 7.4, h: 48, d: 7.4, z: FRONT_Z - 69, v: 0, spire: true, led: 'gold' },
    { x: 40,  w: 9.0, h: 35, d: 7.5, z: FRONT_Z - 62, v: 2 },
    { x: 52,  w: 8.5, h: 44, d: 7.5, z: FRONT_Z - 67, v: 1, spire: true, led: 'cyan' },
    { x: 65,  w: 9.2, h: 38, d: 7.5, z: FRONT_Z - 65, v: 0 }
  ];

  const beaconGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const beacons = [];
  skyscrapers.forEach((b, idx) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), cityMats[b.v]);
    mesh.position.set(b.x, FLOOR_Y + b.h / 2, b.z);
    outsideGroup.add(mesh);

    if (b.crown) {
      const crownTier = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.62, b.h * 0.16, b.d * 0.62), cityMats[b.v]);
      crownTier.position.set(b.x, FLOOR_Y + b.h + b.h * 0.08, b.z);
      outsideGroup.add(crownTier);
    }

    if (b.led) {
      // Glowing rooftop architectural crown band (catches real optical bloom!)
      const ledMat = b.led === 'cyan' ? ledStripCyanMat : ledStripGoldMat;
      const band = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.16, 0.38, b.d + 0.16), ledMat);
      band.position.set(b.x, FLOOR_Y + b.h - 0.4, b.z);
      outsideGroup.add(band);
    }

    if (b.spire) {
      const spireH = b.crown ? 10.5 : 6.8;
      const topY = FLOOR_Y + b.h + (b.crown ? b.h * 0.16 : 0);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.42, spireH, 4), spireMat);
      spire.position.set(b.x, topY + spireH / 2, b.z);
      outsideGroup.add(spire);

      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(b.x, topY + spireH + 0.18, b.z);
      outsideGroup.add(beacon);
      beacons.push({ mesh: beacon, phase: idx * 0.9 });
    }
  });

  // Autumn trees in near courtyard outside windows
  const swayTrees = [];
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#3b2518', roughness: 0.9 });
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.2, 8);
  const crownGeo = new THREE.DodecahedronGeometry(1.5, 1);

  function addAutumnTree(x, z, scale, color) {
    const tree = new THREE.Group();
    tree.position.set(x, FLOOR_Y, z);
    tree.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.1;
    tree.add(trunk);

    const crown = new THREE.Group();
    crown.position.y = 4.2;
    const fMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
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

  addAutumnTree(-12.5, FRONT_Z - 7.5, 1.35, '#cf803a');
  addAutumnTree(-3.8, FRONT_Z - 9.2, 1.20, '#d9ab48');
  addAutumnTree(5.2, FRONT_Z - 8.2, 1.30, '#b55231');
  addAutumnTree(13.8, FRONT_Z - 8.8, 1.25, '#cfa042');

  const lanternMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.55, 1.32, 0.85), fog: false });
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.09, 5.2, 8);
  const orbGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#1e1b19', roughness: 0.5, metalness: 0.5 });
  [-8.5, 0.4, 9.2].forEach((lx) => {
    const lamp = new THREE.Group();
    lamp.position.set(lx, FLOOR_Y, FRONT_Z - 5.8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.6;
    lamp.add(pole);
    const orb = new THREE.Mesh(orbGeo, lanternMat);
    orb.position.y = 5.3;
    lamp.add(orb);
    outsideGroup.add(lamp);
  });

  // ===== 6. Warm, Luminous Library Hall Lighting & Blooming Brass Chandeliers =====
  const frontHallLight = new THREE.PointLight('#ffd294', 64, 52, 1.18);
  frontHallLight.position.set(0, 6.2, -10.5);
  libGroup.add(frontHallLight);

  const rearHallLight = new THREE.PointLight('#ffd294', 56, 48, 1.18);
  rearHallLight.position.set(0, 6.2, 10.5);
  libGroup.add(rearHallLight);

  const windowLight = new THREE.DirectionalLight('#c4dcff', 0.9);
  windowLight.position.set(-2.0, 8.5, FRONT_Z - 8.0);
  libGroup.add(windowLight);

  // HDR emissive chandelier globes (produce soft warm optical bloom!)
  const chandelierBulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.65, 1.35, 0.88) });
  const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.6, 8);
  const ringGeo = new THREE.TorusGeometry(0.95, 0.055, 10, 28);
  const globeGeo = new THREE.SphereGeometry(0.15, 12, 12);
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

  // ===== 7. Spacious Rows of University Reading Tables & Velvet-Cushioned Chairs =====
  const seatGeo = new THREE.BoxGeometry(1.12, 0.10, 1.06);
  const cushionGeo = new THREE.BoxGeometry(0.98, 0.06, 0.92);
  const backGeo = new THREE.BoxGeometry(1.08, 1.24, 0.10);
  const chairLegGeo = new THREE.CylinderGeometry(0.042, 0.036, 1.48, 8);

  function createChair(x, z, rotY) {
    const chair = new THREE.Group();
    chair.position.set(x, FLOOR_Y, z);
    chair.rotation.y = rotY;
    const seat = new THREE.Mesh(seatGeo, warmOakMat);
    seat.position.y = 1.48;
    chair.add(seat);
    const cushion = new THREE.Mesh(cushionGeo, cushionVelvetMat);
    cushion.position.y = 1.56;
    chair.add(cushion);
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
  const lampStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8);
  const lampShadeGeo = new THREE.BoxGeometry(0.56, 0.16, 0.24);
  const openBookGeo = new THREE.BoxGeometry(0.75, 0.05, 0.54);

  function createLongReadingTable(x, z) {
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

  // ===== 8. Toggleable Hard-Working Students =====
  const studentsGroup = new THREE.Group();
  libGroup.add(studentsGroup);
  const animatedStudents = [];

  const skinMat = new THREE.MeshStandardMaterial({ color: '#ecc8ae', roughness: 0.65 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: '#2b2d36', roughness: 0.88 });
  const headphoneBandMat = new THREE.MeshStandardMaterial({ color: '#242428', roughness: 0.4 });

  const standLegGeo = new THREE.CylinderGeometry(0.12, 0.10, 1.65, 8);
  const thighGeo = new THREE.CylinderGeometry(0.13, 0.12, 0.72, 8);
  const shinGeo = new THREE.CylinderGeometry(0.11, 0.09, 1.35, 8);
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.36, 1.18, 12);
  const shoulderGeo = new THREE.SphereGeometry(0.34, 12, 10);
  const headGeo = new THREE.SphereGeometry(0.27, 14, 12);
  const hairGeo = new THREE.SphereGeometry(0.285, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const armGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.92, 8);
  const bandGeo = new THREE.TorusGeometry(0.295, 0.026, 6, 16, Math.PI);
  const cupGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.06, 10);
  const heldBookGeo = new THREE.BoxGeometry(0.54, 0.04, 0.38);

  function createStudyingStudent({ x, y = FLOOR_Y, z, rotY, sweaterColor, hairColor, hasHeadphones = false, standing = false }) {
    const stu = new THREE.Group();
    stu.position.set(x, y, z);
    stu.rotation.y = rotY;

    const sweaterMat = new THREE.MeshStandardMaterial({ color: sweaterColor, roughness: 0.86 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.68 });
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

  // ===== 9. Photographic Long-Exposure 3D Fireworks (Glowing Streak Trails + HDR Spark Heads!) =====
  function createSparkTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.22, 'rgba(255, 250, 232, 0.98)');
    g.addColorStop(0.55, 'rgba(255, 220, 155, 0.45)');
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
    ['#ffe066', '#fff8dc', '#ff9e2c', '#ff595e'], // Golden Willow & Crimson
    ['#ff70a6', '#ffd166', '#ffe5ec', '#c77dff'], // Sakura Rose & Champagne
    ['#48bfe3', '#80ffdb', '#ffffff', '#72efdd'], // Celestial Cyan & Pearl
    ['#ff9f1c', '#ffe699', '#ff4d6d', '#fff5d6'], // Sunset Peony
    ['#c77dff', '#f72585', '#ffd670', '#ffffff'], // Violet & Gold
    ['#64dfdf', '#ffe066', '#d8f3dc', '#ffffff']  // Mint Gold
  ];

  const activeFireworks = [];
  let nextLaunchCooldown = 0.4;

  function launchFirework() {
    const palette = FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)];
    const isWillow = Math.random() > 0.45;
    const targetX = (Math.random() - 0.5) * 48;
    const targetY = 5.5 + Math.random() * 8.2;
    const targetZ = FRONT_Z - 16.0 - Math.random() * 11.0;

    const trailCount = 14;
    const trailPos = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      trailPos[i * 3] = targetX;
      trailPos[i * 3 + 1] = FLOOR_Y + 0.8;
      trailPos[i * 3 + 2] = targetZ;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({
      color: new THREE.Color(1.8, 1.55, 1.0),
      map: sparkTex,
      size: 0.72,
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
      isWillow,
      palette,
      x: targetX,
      y: FLOOR_Y + 0.8,
      z: targetZ,
      targetY,
      vy: 9.8 + Math.random() * 3.0,
      trailPoints,
      trailPos,
      trailCount,
      burstPoints: null,
      streakLines: null,
      burstVelocities: null,
      prevPositions: null,
      flashSprite: null,
      burstLife: 0,
      burstMaxLife: isWillow ? 3.2 + Math.random() * 0.6 : 2.6 + Math.random() * 0.5
    });
  }

  function explodeFirework(fw) {
    fireworksGroup.remove(fw.trailPoints);
    fw.trailPoints.geometry.dispose();
    fw.trailPoints.material.dispose();
    fw.trailPoints = null;

    // 1. HDR Bloom Core Flash at burst center
    const flashColor = new THREE.Color(fw.palette[0]).multiplyScalar(1.8);
    const flashMat = new THREE.SpriteMaterial({
      map: sparkTex,
      color: flashColor,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const flashSprite = new THREE.Sprite(flashMat);
    flashSprite.position.set(fw.x, fw.y, fw.z);
    flashSprite.scale.set(2.8, 2.8, 1);
    fireworksGroup.add(flashSprite);

    // 2. 108 HDR Spark Heads + Real 3D Glowing Streak Trails (LineSegments)!
    const count = 108;
    const positions = new Float32Array(count * 3);
    const prevPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    // Streak lines: 2 vertices per spark (head -> stretched tail!)
    const linePos = new Float32Array(count * 6);
    const lineCol = new Float32Array(count * 6);
    const cObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = fw.x;
      positions[i * 3 + 1] = fw.y;
      positions[i * 3 + 2] = fw.z;
      prevPositions[i * 3] = fw.x;
      prevPositions[i * 3 + 1] = fw.y;
      prevPositions[i * 3 + 2] = fw.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const isInner = i < 32;
      const speed = isInner ? 3.8 + Math.random() * 2.4 : 7.8 + Math.random() * 4.8;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed + (fw.isWillow ? 1.8 : 1.0);
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.55;

      // Boost color >1.0 so UnrealBloom gives real photographic firework radiance!
      cObj.set(fw.palette[isInner ? (i % 2) : (i % fw.palette.length)]).multiplyScalar(1.45);
      colors[i * 3] = cObj.r;
      colors[i * 3 + 1] = cObj.g;
      colors[i * 3 + 2] = cObj.b;

      // Line segment: head bright, tail warm-dim
      linePos[i * 6] = fw.x;
      linePos[i * 6 + 1] = fw.y;
      linePos[i * 6 + 2] = fw.z;
      linePos[i * 6 + 3] = fw.x;
      linePos[i * 6 + 4] = fw.y;
      linePos[i * 6 + 5] = fw.z;

      lineCol[i * 6] = cObj.r;
      lineCol[i * 6 + 1] = cObj.g;
      lineCol[i * 6 + 2] = cObj.b;
      lineCol[i * 6 + 3] = cObj.r * 0.15;
      lineCol[i * 6 + 4] = cObj.g * 0.12;
      lineCol[i * 6 + 5] = cObj.b * 0.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.45,
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

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const streakLines = new THREE.LineSegments(lineGeo, lineMat);
    fireworksGroup.add(streakLines);

    fw.phase = 'burst';
    fw.burstPoints = pts;
    fw.streakLines = streakLines;
    fw.burstVelocities = velocities;
    fw.prevPositions = prevPositions;
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
      nextLaunchCooldown = 1.0 + Math.random() * 1.25;
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

        if (fw.y >= fw.targetY || fw.vy < 1.4) {
          explodeFirework(fw);
        }
      } else {
        fw.burstLife += dt;
        const lifeT = fw.burstLife / fw.burstMaxLife;

        if (fw.flashSprite) {
          const ft = Math.min(1, fw.burstLife / 0.45);
          const fScale = 2.6 + ft * 8.5;
          fw.flashSprite.scale.set(fScale, fScale, 1);
          fw.flashSprite.material.opacity = Math.max(0, (1 - ft) * 0.9);
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
          fireworksGroup.remove(fw.streakLines);
          fw.streakLines.geometry.dispose();
          fw.streakLines.material.dispose();
          if (fw.flashSprite) {
            fireworksGroup.remove(fw.flashSprite);
            fw.flashSprite.material.dispose();
          }
          activeFireworks.splice(i, 1);
          continue;
        }

        const posAttr = fw.burstPoints.geometry.attributes.position;
        const arr = posAttr.array;
        const lineAttr = fw.streakLines.geometry.attributes.position;
        const lArr = lineAttr.array;
        const vels = fw.burstVelocities;
        const drag = Math.pow(fw.isWillow ? 0.34 : 0.38, dt);
        const grav = fw.isWillow ? 2.45 : 2.05;
        const tailStretch = fw.isWillow ? 0.24 : 0.16;

        for (let idx = 0; idx < arr.length / 3; idx++) {
          const p = idx * 3;
          vels[p] *= drag;
          vels[p + 1] = vels[p + 1] * drag - grav * dt;
          vels[p + 2] *= drag;

          arr[p] += vels[p] * dt;
          arr[p + 1] += vels[p + 1] * dt;
          arr[p + 2] += vels[p + 2] * dt;

          // Update photographic streak trail segment (head -> velocity-stretched tail)
          const lp = idx * 6;
          lArr[lp] = arr[p];
          lArr[lp + 1] = arr[p + 1];
          lArr[lp + 2] = arr[p + 2];
          lArr[lp + 3] = arr[p] - vels[p] * tailStretch;
          lArr[lp + 4] = arr[p + 1] - vels[p + 1] * tailStretch;
          lArr[lp + 5] = arr[p + 2] - vels[p + 2] * tailStretch;
        }
        posAttr.needsUpdate = true;
        lineAttr.needsUpdate = true;

        const glitter = lifeT > 0.42 ? 0.68 + 0.32 * Math.sin(elapsed * 34 + i * 2.9) : 1.0;
        const fade = Math.max(0, (1 - Math.pow(lifeT, 1.65)) * glitter);
        fw.burstPoints.material.opacity = fade;
        fw.burstPoints.material.size = 1.52 * (1 - lifeT * 0.28);
        fw.streakLines.material.opacity = fade * 0.85;
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
    lampGreenShadeMat.emissiveIntensity = isNightMode ? (hasPeople ? 1.05 : 0.48) : 0.08;
    frontHallLight.intensity = isNightMode ? (hasPeople ? 64 : 46) : 14;
    rearHallLight.intensity = isNightMode ? (hasPeople ? 56 : 40) : 12;
  }

  function setLightingMode(nightMode) {
    isNightMode = !!nightMode;
    skyMat.map = isNightMode ? nightSkyTex : daySkyTex;
    skyMat.needsUpdate = true;
    horizonGlow.visible = isNightMode;

    cityMats.forEach((m, idx) => {
      m.map = isNightMode ? nightCityTexs[idx] : dayCityTexs[idx];
      m.needsUpdate = true;
    });
    beaconMat.color.set(isNightMode ? new THREE.Color(2.2, 0.35, 0.35) : new THREE.Color('#7b8494'));
    ledStripGoldMat.visible = isNightMode;
    ledStripCyanMat.visible = isNightMode;

    litWinMat.color.set(isNightMode ? new THREE.Color(1.4, 1.15, 0.72) : new THREE.Color('#7a8a9e'));
    lanternMat.color.set(isNightMode ? new THREE.Color(1.55, 1.32, 0.85) : new THREE.Color('#d6cab6'));
    chandelierBulbMat.color.set(isNightMode ? new THREE.Color(1.65, 1.35, 0.88) : new THREE.Color('#fff5e4'));
    lampGreenShadeMat.emissiveIntensity = isNightMode ? (hasPeople ? 1.05 : 0.48) : 0.08;

    windowLight.color.set(isNightMode ? '#c4dcff' : '#ffe4bd');
    windowLight.intensity = isNightMode ? 0.9 : 1.65;

    frontHallLight.intensity = isNightMode ? (hasPeople ? 64 : 46) : 14;
    rearHallLight.intensity = isNightMode ? (hasPeople ? 56 : 40) : 12;
  }

  function update(elapsed) {
    const dt = Math.min(0.06, Math.max(0.001, elapsed - lastElapsed));
    lastElapsed = elapsed;

    swayTrees.forEach(({ crown, phase }) => {
      crown.rotation.z = Math.sin(elapsed * 0.85 + phase) * 0.032;
    });

    // Subtle aviation beacon blink on skyscraper tips
    if (isNightMode) {
      beacons.forEach(({ mesh, phase }) => {
        mesh.visible = Math.sin(elapsed * 2.2 + phase) > -0.25;
      });
    }

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
