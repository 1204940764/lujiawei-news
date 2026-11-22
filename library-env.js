import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// ===== Photorealistic Grand University Library Hall with Real 3D GLTF Models (Poly Haven + VirtualCity + Mixamo Students) & Streaked Fireworks =====
export function createLibraryEnvironment(scene, maxAniso = 8) {
  const libGroup = new THREE.Group();
  scene.add(libGroup);

  const FLOOR_Y = -3.02;
  const HALL_W = 68;
  const HALL_D = 62;
  const HALL_H = 16.5;
  const FRONT_Z = -27.5;
  const BACK_Z = 32.5;

  const gltfLoader = new GLTFLoader();
  const texLoader = new THREE.TextureLoader();

  // Helper: normalize a loaded GLTF scene to a target height with bottom centered at y = 0
  function normalizeGltf(model, targetHeight) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = targetHeight / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    const wrapper = new THREE.Group();
    wrapper.add(model);
    return wrapper;
  }

  // ===== Procedural PBR Wood Floor & Leather Bookcases =====
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
        ctx.fillStyle = tones[(r * 5 + col + 8) % tones.length];
        ctx.fillRect(x, y, 512, rowH);

        for (let g = 0; g < 22; g++) {
          const gy = y + Math.random() * rowH;
          const isDark = Math.random() > 0.45;
          ctx.fillStyle = isDark ? 'rgba(20,9,3,0.12)' : 'rgba(195,138,88,0.08)';
          ctx.fillRect(x, gy, 512, 1 + Math.random() * 2.2);
          bctx.fillStyle = isDark ? 'rgba(55,55,55,0.28)' : 'rgba(205,205,205,0.18)';
          bctx.fillRect(x, gy, 512, 1.5);
        }

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
      const topShadow = ctx.createLinearGradient(0, y, 0, y + 36);
      topShadow.addColorStop(0, 'rgba(0,0,0,0.72)');
      topShadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topShadow;
      ctx.fillRect(0, y, 1024, 36);

      ctx.fillStyle = '#5a361f';
      ctx.fillRect(0, y + rowH - 22, 1024, 22);
      ctx.fillStyle = 'rgba(225, 172, 118, 0.28)';
      ctx.fillRect(0, y + rowH - 22, 1024, 3);

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

        const spGrad = ctx.createLinearGradient(bx, 0, bx + bw - 2, 0);
        spGrad.addColorStop(0, 'rgba(0,0,0,0.34)');
        spGrad.addColorStop(0.28, 'rgba(255,245,230,0.16)');
        spGrad.addColorStop(1, 'rgba(0,0,0,0.42)');
        ctx.fillStyle = spGrad;
        ctx.fillRect(bx, by, bw - 2, bh);

        if (seed % 3 !== 0) {
          ctx.fillStyle = 'rgba(235, 198, 134, 0.55)';
          ctx.fillRect(bx + 3, by + 18, bw - 8, 3);
          ctx.fillRect(bx + 3, by + bh - 24, bw - 8, 3);
        }
        bx += bw;
      }
    }

    ctx.fillStyle = '#3d2212';
    [0, 336, 672, 1000].forEach((vx) => ctx.fillRect(vx, 0, 24, 1024));

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
  }

  // ===== Realistic PBR Architectural Materials =====
  const parquetMaps = createParquetWoodMaps();
  const floorMat = new THREE.MeshPhysicalMaterial({
    map: parquetMaps.map,
    bumpMap: parquetMaps.bumpMap,
    bumpScale: 0.018,
    roughness: 0.38,
    metalness: 0.04,
    clearcoat: 0.30,
    clearcoatRoughness: 0.32
  });

  const darkWalnutMat = new THREE.MeshStandardMaterial({ color: '#3e2415', roughness: 0.48, metalness: 0.05 });
  const warmOakMat = new THREE.MeshStandardMaterial({ color: '#694228', roughness: 0.44, metalness: 0.05 });
  const mediumWoodMat = new THREE.MeshStandardMaterial({ color: '#52321e', roughness: 0.52, metalness: 0.05 });
  const plasterWallMat = new THREE.MeshStandardMaterial({ color: '#614b3b', roughness: 0.88, metalness: 0.02 });
  const brassMat = new THREE.MeshStandardMaterial({ color: '#d8ad64', roughness: 0.26, metalness: 0.86 });
  const lampGreenShadeMat = new THREE.MeshStandardMaterial({
    color: '#255c42',
    emissive: '#1d5938',
    emissiveIntensity: 0.65,
    roughness: 0.32
  });
  const shelfFacadeMat = new THREE.MeshStandardMaterial({
    map: createPhotorealBookcaseTexture(),
    roughness: 0.72,
    metalness: 0.03
  });
  const paperBookMat = new THREE.MeshStandardMaterial({ color: '#e6dccb', roughness: 0.92 });

  // ===== 1. Varnished Hardwood Floor & Vintage Woven Runner =====
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL_W + 4, HALL_D + 4), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, 2.5);
  floor.receiveShadow = true;
  libGroup.add(floor);

  const runner = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, HALL_D - 4),
    new THREE.MeshStandardMaterial({ color: '#52281f', roughness: 0.94 })
  );
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, FLOOR_Y + 0.012, 2.5);
  libGroup.add(runner);

  [-2.65, 2.65].forEach((rx) => {
    const border = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, HALL_D - 4.4),
      new THREE.MeshStandardMaterial({ color: '#b5884a', roughness: 0.86 })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.set(rx, FLOOR_Y + 0.014, 2.5);
    libGroup.add(border);
  });

  // ===== 2. Soaring Coffered Wood Ceiling & Architectural Columns =====
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W + 2, HALL_D + 2),
    new THREE.MeshStandardMaterial({ color: '#2b1910', roughness: 0.80 })
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

  // ===== 4. Grand Floor-to-Ceiling Panoramic Front Windows =====
  const pierGeo = new THREE.BoxGeometry(10.5, HALL_H, 0.8);
  [-28.8, 28.8].forEach((px) => {
    const pier = new THREE.Mesh(pierGeo, plasterWallMat);
    pier.position.set(px, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(pier);
  });
  const frontSillWall = new THREE.Mesh(new THREE.BoxGeometry(48.0, 1.5, 0.85), darkWalnutMat);
  frontSillWall.position.set(0, FLOOR_Y + 0.75, FRONT_Z);
  libGroup.add(frontSillWall);

  const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(48.0, 2.0, 0.85), darkWalnutMat);
  frontHeader.position.set(0, FLOOR_Y + HALL_H - 1.0, FRONT_Z);
  libGroup.add(frontHeader);

  const bigMullionGeo = new THREE.BoxGeometry(0.72, HALL_H, 0.9);
  [-23.5, -8.0, 8.0, 23.5].forEach((mx) => {
    const m = new THREE.Mesh(bigMullionGeo, darkWalnutMat);
    m.position.set(mx, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(m);
  });
  const subVGeo = new THREE.BoxGeometry(0.16, HALL_H - 2.8, 0.24);
  [-15.75, 0.0, 15.75].forEach((subX) => {
    const m = new THREE.Mesh(subVGeo, darkWalnutMat);
    m.position.set(subX, FLOOR_Y + HALL_H / 2, FRONT_Z);
    libGroup.add(m);
  });
  const subHGeo = new THREE.BoxGeometry(47.0, 0.16, 0.24);
  [FLOOR_Y + 5.4, FLOOR_Y + 9.8].forEach((my) => {
    const m = new THREE.Mesh(subHGeo, darkWalnutMat);
    m.position.set(0, my, FRONT_Z);
    libGroup.add(m);
  });

  // ===== 5. MONUMENTAL REAL-SCALE MODERN NIGHT SKYLINE + CRISP STARFIELD + HOPEFUL TWILIGHT SKY =====
  const outsideGroup = new THREE.Group();
  libGroup.add(outsideGroup);

  // Smooth midnight-blue twilight sky dome (no blurry canvas stars — stars are crisp 3D Points!)
  function createNightSkyTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0.0, '#040814');
    skyGrad.addColorStop(0.28, '#0a1530');
    skyGrad.addColorStop(0.47, '#152752');
    skyGrad.addColorStop(0.56, '#233866');
    skyGrad.addColorStop(0.62, '#3d456b');
    skyGrad.addColorStop(0.68, '#5c4e61');
    skyGrad.addColorStop(0.75, '#191f33');
    skyGrad.addColorStop(1.0, '#070a14');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm golden-peach city horizon glow behind the skyscrapers
    const haze = ctx.createRadialGradient(512, 326, 20, 512, 326, 380);
    haze.addColorStop(0.0, 'rgba(255, 198, 132, 0.28)');
    haze.addColorStop(0.45, 'rgba(118, 142, 215, 0.14)');
    haze.addColorStop(1.0, 'rgba(15, 25, 55, 0.0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 110, 1024, 340);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const skyDomeMat = new THREE.MeshBasicMaterial({
    map: createNightSkyTexture(),
    side: THREE.BackSide,
    fog: false
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(360, 40, 24), skyDomeMat);
  skyDome.position.set(0, 12.0, -30.0);
  outsideGroup.add(skyDome);

  // Crisp pinpoint 3D starfield in the upper night sky outside the panoramic window
  const starCount = 320;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  let starSeed = 1337;
  for (let i = 0; i < starCount; i++) {
    starSeed = (starSeed * 16807) % 2147483647;
    const theta = ((starSeed % 1000) / 1000 - 0.5) * Math.PI * 1.15; // Wide arc outside front windows
    starSeed = (starSeed * 16807) % 2147483647;
    const phi = 0.08 + ((starSeed % 1000) / 1000) * 0.52; // Above horizon
    const rad = 285;
    starPos[i * 3] = Math.sin(theta) * Math.cos(phi) * rad;
    starPos[i * 3 + 1] = Math.sin(phi) * rad + 8;
    starPos[i * 3 + 2] = -Math.cos(theta) * Math.cos(phi) * rad - 25;

    const warm = i % 7 === 0;
    const bright = 0.65 + (i % 4) * 0.11;
    starCol[i * 3] = warm ? 1.0 * bright : 0.84 * bright;
    starCol[i * 3 + 1] = warm ? 0.92 * bright : 0.91 * bright;
    starCol[i * 3 + 2] = warm ? 0.78 * bright : 1.0 * bright;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
  const starPoints = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      fog: false
    })
  );
  outsideGroup.add(starPoints);

  // City ground plane ~5 floors below the library (y = -23) so the library feels grounded on a realistic university floor!
  const CITY_GROUND_Y = FLOOR_Y - 20.0;
  function createCityGroundTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#090d18';
    ctx.fillRect(0, 0, 512, 512);
    // Warm golden avenue streetlamp lines
    ctx.strokeStyle = 'rgba(255, 198, 120, 0.28)';
    ctx.lineWidth = 3;
    for (let i = 64; i < 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }
  const cityGround = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 320),
    new THREE.MeshBasicMaterial({ map: createCityGroundTexture(), fog: false })
  );
  cityGround.rotation.x = -Math.PI / 2;
  cityGround.position.set(0, CITY_GROUND_Y, FRONT_Z - 165);
  outsideGroup.add(cityGround);

  // High-resolution architectural glass-curtain skyscraper facade textures (realistic floor bands, lit offices, dark mullions!)
  function createSkyscraperFacadeMaps(variant = 0) {
    const w = 512;
    const h = 1024;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    const ec = document.createElement('canvas');
    ec.width = w;
    ec.height = h;
    const ectx = ec.getContext('2d');

    // Deep dark architectural glass & spandrel base
    const baseColors = ['#101828', '#151c2c', '#0e1522'];
    ctx.fillStyle = baseColors[variant % 3];
    ctx.fillRect(0, 0, w, h);
    ectx.fillStyle = '#000000';
    ectx.fillRect(0, 0, w, h);

    const cols = variant === 0 ? 12 : (variant === 1 ? 10 : 14);
    const floors = variant === 0 ? 32 : (variant === 1 ? 26 : 36);
    const cw = w / cols;
    const fh = h / floors;

    let seed = 4109 + variant * 1973;
    const palettes = [
      ['#ffe6b3', '#ffd285', '#fff4d8', '#c6e2ff', '#ffca78'],
      ['#ffda94', '#ffbe66', '#fff0c8', '#ffe4b5', '#ffd07d'],
      ['#d6ecff', '#fff6e0', '#ffe3a8', '#b8dcff', '#ffffff']
    ];
    const pal = palettes[variant % 3];

    for (let f = 0; f < floors; f++) {
      const fy = f * fh;
      // Structural spandrel slab between floors
      ctx.fillStyle = '#090e1a';
      ctx.fillRect(0, fy, w, Math.max(4, fh * 0.28));

      // Dark mechanical / refuge floor every 11 stories
      if (f % 11 === 5) continue;

      // Occasional full-floor lit office suite
      seed = (seed * 16807) % 2147483647;
      const floorActivity = (seed % 100) < 22 ? 0.72 : 0.36;

      for (let col = 0; col < cols; col++) {
        const cx = col * cw;
        // Subtle unlit glass reflection
        ctx.fillStyle = 'rgba(42, 62, 102, 0.22)';
        ctx.fillRect(cx + 3, fy + fh * 0.30, cw - 6, fh * 0.62);

        seed = (seed * 16807) % 2147483647;
        if ((seed % 100) / 100 < floorActivity) {
          const tone = pal[seed % pal.length];
          const winX = cx + 4;
          const winY = fy + fh * 0.32;
          const winW = cw - 8;
          const winH = fh * 0.58;

          // Subtle top-to-bottom interior ceiling light gradient inside each office window!
          const wg = ectx.createLinearGradient(0, winY, 0, winY + winH);
          wg.addColorStop(0.0, '#ffffff');
          wg.addColorStop(0.35, tone);
          wg.addColorStop(1.0, 'rgba(180, 128, 74, 0.45)');
          ectx.fillStyle = wg;
          ectx.fillRect(winX, winY, winW, winH);

          ctx.fillStyle = tone;
          ctx.fillRect(winX, winY, winW, winH);
        }
      }
    }

    // Crisp vertical steel curtain-wall mullions
    ctx.fillStyle = '#080c15';
    ectx.fillStyle = '#000000';
    for (let col = 0; col <= cols; col++) {
      ctx.fillRect(col * cw - 1.5, 0, 3, h);
      ectx.fillRect(col * cw - 1.5, 0, 3, h);
    }

    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = maxAniso;

    const emissiveMap = new THREE.CanvasTexture(ec);
    emissiveMap.colorSpace = THREE.SRGBColorSpace;
    emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping;
    emissiveMap.anisotropy = maxAniso;

    return { map, emissiveMap };
  }

  const facadeSets = [0, 1, 2].map((v) => {
    const maps = createSkyscraperFacadeMaps(v);
    return new THREE.MeshStandardMaterial({
      map: maps.map,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: maps.emissiveMap,
      emissiveIntensity: 0.92,
      roughness: 0.28,
      metalness: 0.55,
      fog: false
    });
  });

  const roofDarkMat = new THREE.MeshStandardMaterial({
    color: '#0e1422',
    roughness: 0.55,
    metalness: 0.45,
    fog: false
  });
  const crownGoldMat = new THREE.MeshBasicMaterial({ color: '#ffdf9e', fog: false });
  const crownCyanMat = new THREE.MeshBasicMaterial({ color: '#9ed8ff', fog: false });
  const beaconRedMat = new THREE.MeshBasicMaterial({ color: '#ff4242', fog: false });

  // Helper: build a real-scale monumental multi-tier modern skyscraper (podium + tower + setback + lit crown + spire)
  function addMonumentalSkyscraper({ x, z, w, d, h, variant, hasSetback = true, hasSpire = false, crownCyan = false }) {
    const g = new THREE.Group();
    g.position.set(x, CITY_GROUND_Y, z);

    const facadeMat = facadeSets[variant % facadeSets.length];
    const mats = [facadeMat, facadeMat, roofDarkMat, roofDarkMat, facadeMat, facadeMat];

    // Main soaring glass tower
    const mainH = hasSetback ? h * 0.78 : h;
    const mainTower = new THREE.Mesh(new THREE.BoxGeometry(w, mainH, d), mats);
    mainTower.position.y = mainH / 2;
    g.add(mainTower);

    let topY = mainH;

    // Stepped upper architectural setback tier (proportional window texture repeat so floor height matches lower tower!)
    if (hasSetback) {
      const upperH = h * 0.22;
      const upperW = w * 0.72;
      const upperD = d * 0.72;
      const upperFacadeMat = facadeMat.clone();
      upperFacadeMat.map = facadeMat.map.clone();
      upperFacadeMat.map.needsUpdate = true;
      upperFacadeMat.map.repeat.set(0.72, 0.28);
      upperFacadeMat.emissiveMap = facadeMat.emissiveMap.clone();
      upperFacadeMat.emissiveMap.needsUpdate = true;
      upperFacadeMat.emissiveMap.repeat.set(0.72, 0.28);
      const upperMats = [upperFacadeMat, upperFacadeMat, roofDarkMat, roofDarkMat, upperFacadeMat, upperFacadeMat];
      const upperTower = new THREE.Mesh(new THREE.BoxGeometry(upperW, upperH, upperD), upperMats);
      upperTower.position.y = mainH + upperH / 2;
      g.add(upperTower);

      // Subtle glowing architectural crown ring at roofline
      const crownTrim = new THREE.Mesh(
        new THREE.BoxGeometry(upperW + 0.4, 0.55, upperD + 0.4),
        crownCyan ? crownCyanMat : crownGoldMat
      );
      crownTrim.position.y = mainH + upperH - 0.35;
      g.add(crownTrim);

      // Mechanical rooftop penthouse
      const mech = new THREE.Mesh(new THREE.BoxGeometry(upperW * 0.55, 3.2, upperD * 0.55), roofDarkMat);
      mech.position.y = mainH + upperH + 1.6;
      g.add(mech);
      topY = mainH + upperH + 3.2;
    } else {
      const crownTrim = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.4, 0.55, d + 0.4),
        crownCyan ? crownCyanMat : crownGoldMat
      );
      crownTrim.position.y = mainH - 0.35;
      g.add(crownTrim);
    }

    // Tall landmark needle spire + red aviation warning beacon
    if (hasSpire) {
      const spireH = 14 + (variant % 3) * 4;
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.75, spireH, 8), roofDarkMat);
      spire.position.y = topY + spireH / 2;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), beaconRedMat);
      beacon.position.y = topY + spireH + 0.3;
      g.add(beacon);
    }

    outsideGroup.add(g);
  }

  // Carefully curated real-scale metropolitan skyline:
  // EVERY single building is strictly OUTSIDE the library (z <= FRONT_Z - 64 = -91.5, minimum clearance > 50 units!)
  // Towering heights (68–118 units, matching 1m ≈ 3.6 units) with NO occluded duplicates!
  const skylineTowers = [
    // Left panoramic window bay (x: -135 to -48)
    { x: -126, z: FRONT_Z - 92,  w: 28, d: 24, h: 48, variant: 0, hasSetback: true,  hasSpire: false },
    { x: -94,  z: FRONT_Z - 80,  w: 24, d: 22, h: 42, variant: 1, hasSetback: false, hasSpire: false },
    { x: -70,  z: FRONT_Z - 122, w: 30, d: 26, h: 58, variant: 2, hasSetback: true,  hasSpire: true,  crownCyan: true },
    { x: -48,  z: FRONT_Z - 86,  w: 22, d: 20, h: 36, variant: 0, hasSetback: false, hasSpire: false },

    // Center panoramic window bay (x: -36 to +36) — realistic 5th-floor view with grand skyline & bright fireworks above!
    { x: -26,  z: FRONT_Z - 106, w: 24, d: 22, h: 44, variant: 1, hasSetback: true,  hasSpire: false },
    { x: -2,   z: FRONT_Z - 138, w: 28, d: 26, h: 56, variant: 2, hasSetback: true,  hasSpire: true,  crownCyan: false },
    { x: 22,   z: FRONT_Z - 98,  w: 22, d: 20, h: 38, variant: 0, hasSetback: false, hasSpire: false },
    { x: 46,   z: FRONT_Z - 126, w: 30, d: 26, h: 60, variant: 1, hasSetback: true,  hasSpire: true,  crownCyan: true },

    // Right panoramic window bay (x: +60 to +135)
    { x: 72,   z: FRONT_Z - 86,  w: 24, d: 22, h: 42, variant: 2, hasSetback: false, hasSpire: false },
    { x: 98,   z: FRONT_Z - 118, w: 32, d: 26, h: 56, variant: 0, hasSetback: true,  hasSpire: true,  crownCyan: false },
    { x: 128,  z: FRONT_Z - 92,  w: 26, d: 22, h: 46, variant: 1, hasSetback: true,  hasSpire: false }
  ];
  skylineTowers.forEach(addMonumentalSkyscraper);

  // Subtle exterior moonlight so dark architectural glass & crowns catch crisp rim highlights
  const cityMoonLight = new THREE.DirectionalLight('#7ea8ff', 0.65);
  cityMoonLight.position.set(30, 85, FRONT_Z - 20);
  outsideGroup.add(cityMoonLight);

  // ===== 6. Warm, Balanced Library Hall Lighting + REAL Poly Haven Chandelier_01 Models! =====
  const frontHallLight = new THREE.PointLight('#ffd294', 44, 52, 1.25);
  frontHallLight.position.set(0, 6.2, -10.5);
  libGroup.add(frontHallLight);

  const rearHallLight = new THREE.PointLight('#ffd294', 38, 48, 1.25);
  rearHallLight.position.set(0, 6.2, 10.5);
  libGroup.add(rearHallLight);

  const windowLight = new THREE.DirectionalLight('#b8d4ff', 0.65);
  windowLight.position.set(-2.0, 8.5, FRONT_Z - 8.0);
  libGroup.add(windowLight);

  // Load REAL ornate vintage library chandelier (Poly Haven CC0 Chandelier_01)!
  gltfLoader.load('assets/models/Chandelier_01/Chandelier_01_1k.gltf', (gltf) => {
    const template = normalizeGltf(gltf.scene, 3.4);
    [[-8.5, -8.5], [8.5, -8.5], [-8.5, 8.5], [8.5, 8.5]].forEach(([cx, cz]) => {
      const ch = template.clone(true);
      ch.position.set(cx, FLOOR_Y + HALL_H - 3.65, cz);
      libGroup.add(ch);
    });
  });

  // ===== 7. REAL Poly Haven WoodenTable_01 & WoodenChair_01 Across the Reading Hall (Ergonomic Real-World Scale + Books!) =====
  const TABLE_W = 7.4;
  const TABLE_H = 2.55; // Real 74cm ergonomic desk height relative to 5.15-unit seated students!
  const TABLE_D = 3.0;
  const CHAIR_DX = 1.88;
  const CHAIR_DZ = 2.02;

  const tablePositions = [
    [-10.2, -7.2], [10.2, -7.2],
    [-10.2, -14.6], [0.0, -14.6], [10.2, -14.6],
    [-10.2, -21.8], [0.0, -21.8], [10.2, -21.8],
    [-12.2, 0.4], [12.2, 0.4],
    [-10.2, 8.6], [0.0, 8.6], [10.2, 8.6],
    [-10.2, 16.0], [0.0, 16.0], [10.2, 16.0],
    [-10.2, 23.0], [10.2, 23.0]
  ];

  // Register collision boxes immediately (even while GLTF streams in!)
  tablePositions.forEach(([x, z]) => registerObstacle(x, z, 4.1, 2.55));

  // Banker lamps + rich stacks of textbooks & open study notebooks on every reading table
  const lampStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.74, 8);
  const lampShadeGeo = new THREE.BoxGeometry(0.58, 0.17, 0.25);
  const openBookGeo = new THREE.BoxGeometry(0.84, 0.05, 0.58);
  const closedBookGeo = new THREE.BoxGeometry(0.52, 0.10, 0.72);
  const smallBookGeo = new THREE.BoxGeometry(0.46, 0.09, 0.64);
  const bookMatNavy = new THREE.MeshStandardMaterial({ color: '#264166', roughness: 0.78 });
  const bookMatBurgundy = new THREE.MeshStandardMaterial({ color: '#6e2824', roughness: 0.78 });
  const bookMatForest = new THREE.MeshStandardMaterial({ color: '#284d3b', roughness: 0.78 });
  const bookMatOchre = new THREE.MeshStandardMaterial({ color: '#8f6332', roughness: 0.78 });

  gltfLoader.load('assets/models/WoodenTable_01/WoodenTable_01_1k.gltf', (gltf) => {
    const raw = gltf.scene;
    const box = new THREE.Box3().setFromObject(raw);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const sx = TABLE_W / Math.max(size.x, 0.001);
    const sy = TABLE_H / Math.max(size.y, 0.001);
    const sz = TABLE_D / Math.max(size.z, 0.001);

    const template = new THREE.Group();
    raw.scale.set(sx, sy, sz);
    raw.position.set(-center.x * sx, -box.min.y * sy, -center.z * sz);
    template.add(raw);

    // Classic green library banker lamps along the table centerline
    [-CHAIR_DX, CHAIR_DX].forEach((lx) => {
      const stem = new THREE.Mesh(lampStemGeo, brassMat);
      stem.position.set(lx, TABLE_H + 0.37, 0);
      template.add(stem);
      const shade = new THREE.Mesh(lampShadeGeo, lampGreenShadeMat);
      shade.position.set(lx, TABLE_H + 0.78, 0);
      template.add(shade);
    });

    // Open study notebooks & textbook stacks at each seat on every reading table!
    const topY = TABLE_H;
    // Open notebooks in front of all 4 seats
    [
      [-CHAIR_DX, 0.82, 0.04],
      [CHAIR_DX, 0.82, -0.05],
      [-CHAIR_DX, -0.82, -0.04],
      [CHAIR_DX, -0.82, 0.06]
    ].forEach(([bx, bz, ry]) => {
      const nb = new THREE.Mesh(openBookGeo, paperBookMat);
      nb.position.set(bx, topY + 0.028, bz);
      nb.rotation.y = ry;
      template.add(nb);
    });

    // Stacked hardcover textbooks scattered naturally across each table
    const stacks = [
      { x: -CHAIR_DX - 0.85, z: 0.55, mats: [bookMatNavy, bookMatOchre] },
      { x: CHAIR_DX + 0.88, z: 0.62, mats: [bookMatBurgundy, bookMatForest, bookMatNavy] },
      { x: -0.18, z: 0.48, mats: [bookMatForest, bookMatBurgundy] },
      { x: 0.28, z: -0.52, mats: [bookMatOchre, bookMatNavy] },
      { x: -CHAIR_DX - 0.82, z: -0.64, mats: [bookMatBurgundy, bookMatOchre] },
      { x: CHAIR_DX + 0.85, z: -0.58, mats: [bookMatNavy, bookMatForest] }
    ];
    stacks.forEach((st) => {
      st.mats.forEach((mat, i) => {
        const bk = new THREE.Mesh(i === 0 ? closedBookGeo : smallBookGeo, mat);
        bk.position.set(st.x + (i % 2) * 0.04, topY + 0.05 + i * 0.095, st.z);
        bk.rotation.y = (i * 0.14 - 0.08) + (st.x * 0.07);
        template.add(bk);
      });
    });

    tablePositions.forEach(([x, z]) => {
      const t = template.clone(true);
      t.position.set(x, FLOOR_Y, z);
      libGroup.add(t);
    });
  });

  // Load REAL Poly Haven WoodenChair_01 (4 wider, comfortable sculpted armchairs per reading table — zero armrest clipping!)
  gltfLoader.load('assets/models/WoodenChair_01/WoodenChair_01_1k.gltf', (gltf) => {
    const template = normalizeGltf(gltf.scene, 3.25);
    // Widen seat & armrest spacing slightly so seated students fit comfortably inside the armrests with zero clipping
    template.scale.set(1.26, 1.0, 1.18);
    tablePositions.forEach(([x, z]) => {
      [
        [x - CHAIR_DX, z + CHAIR_DZ, Math.PI],
        [x + CHAIR_DX, z + CHAIR_DZ, Math.PI],
        [x - CHAIR_DX, z - CHAIR_DZ, 0],
        [x + CHAIR_DX, z - CHAIR_DZ, 0]
      ].forEach(([cx, cz, rotY]) => {
        const chair = template.clone(true);
        chair.position.set(cx, FLOOR_Y, cz);
        chair.rotation.y = rotY;
        libGroup.add(chair);
      });
    });
  });

  // ===== 8. Toggleable Real 3D Studying Students (Downloaded ReadyPlayerMe student_avatar.glb — Ergonomic Reading Pose!) =====
  const studentsGroup = new THREE.Group();
  libGroup.add(studentsGroup);
  const animatedStudents = [];

  // Exact chair-linked seats derived directly from tablePositions + CHAIR_DX/CHAIR_DZ so students align 100% with their chairs!
  const studentSeats = [
    { tx: -10.2, tz: -7.2,  sx: +1, sz: -1, rotY: 0,       topTint: '#3e5c76', bottomTint: '#2b323d', hatTint: '#232830' },
    { tx: 10.2,  tz: -7.2,  sx: -1, sz: +1, rotY: Math.PI, topTint: '#7a3e38', bottomTint: '#292b30', hatTint: '#332824' },
    { tx: 10.2,  tz: -7.2,  sx: +1, sz: -1, rotY: 0,       topTint: '#486058', bottomTint: '#32302d', hatTint: '#242b28' },
    { tx: 0.0,   tz: -14.6, sx: -1, sz: +1, rotY: Math.PI, topTint: '#a6825c', bottomTint: '#2d3540', hatTint: '#2b2520' },
    { tx: 0.0,   tz: -14.6, sx: +1, sz: -1, rotY: 0,       topTint: '#5d4a66', bottomTint: '#272a33', hatTint: '#25222c' },
    { tx: -10.2, tz: -21.8, sx: +1, sz: +1, rotY: Math.PI, topTint: '#56684f', bottomTint: '#2f3238', hatTint: '#242923' },
    { tx: 10.2,  tz: -21.8, sx: -1, sz: +1, rotY: Math.PI, topTint: '#8c5a44', bottomTint: '#2a2e36', hatTint: '#2d2420' },
    { tx: -10.2, tz: 8.6,   sx: +1, sz: +1, rotY: Math.PI, topTint: '#415b76', bottomTint: '#282c34', hatTint: '#202630' },
    { tx: 10.2,  tz: 8.6,   sx: +1, sz: +1, rotY: Math.PI, topTint: '#8c4c3d', bottomTint: '#2c2f36', hatTint: '#2c2220' }
  ];

  gltfLoader.load('assets/models/student_avatar.glb', (gltf) => {
    const src = gltf.scene;
    const rawBox = new THREE.Box3().setFromObject(src);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    // Real-world human scale (5.05 units ≈ 1.72m) matching 2.55-unit ergonomic tables & 3.25-unit armchairs
    const baseScale = 5.05 / Math.max(rawSize.y, 0.001);

    studentSeats.forEach((seat, idx) => {
      const avatar = SkeletonUtils.clone(src);
      const scaleVar = 0.97 + (idx % 3) * 0.02;
      avatar.scale.setScalar(baseScale * scaleVar);

      // Give each student distinct natural academic attire & cozy winter knit beanie colors
      avatar.traverse((obj) => {
        if (!obj.isMesh || !obj.material) return;
        const mName = obj.material.name || '';
        obj.material = obj.material.clone();
        if (mName.includes('Outfit_Top')) {
          obj.material.color.set(seat.topTint);
        } else if (mName.includes('Outfit_Bottom')) {
          obj.material.color.set(seat.bottomTint);
        } else if (mName.includes('Headwear')) {
          obj.material.color.set(seat.hatTint);
        }
      });

      // Collect standard humanoid bones and apply anatomically natural seated reading pose!
      const bones = {};
      avatar.traverse((obj) => {
        if (obj.isBone) bones[obj.name] = obj;
      });

      // Legs: thighs straight forward (+1.48), knees bent 90 deg down (-1.45) so feet rest squarely on the floor
      if (bones.LeftUpLeg) bones.LeftUpLeg.rotateX(1.48);
      if (bones.RightUpLeg) bones.RightUpLeg.rotateX(1.48);
      if (bones.LeftLeg) bones.LeftLeg.rotateX(-1.45);
      if (bones.RightLeg) bones.RightLeg.rotateX(-1.45);

      // Upright focused study posture — head well above the 2.55 tabletop looking comfortably down at the notebook!
      if (bones.Spine) bones.Spine.rotateX(0.08);
      if (bones.Spine1) bones.Spine1.rotateX(0.06);
      if (bones.Neck) bones.Neck.rotateX(0.12);
      if (bones.Head) {
        bones.Head.rotateX(0.24);
        bones.Head.rotateY(((idx % 3) - 1) * 0.10);
      }

      // Helper: aim a bone's +Y axis along an exact desired direction in avatar space (0% guessing, 100% exact!)
      function aimBone(bone, dirX, dirY, dirZ) {
        if (!bone || !bone.parent) return;
        avatar.updateMatrixWorld(true);
        const parentQ = new THREE.Quaternion();
        bone.parent.getWorldQuaternion(parentQ);
        const boneQ = new THREE.Quaternion();
        bone.getWorldQuaternion(boneQ);
        const curDir = new THREE.Vector3(0, 1, 0).applyQuaternion(boneQ).normalize();
        const targetDir = new THREE.Vector3(dirX, dirY, dirZ).normalize();
        const deltaWorld = new THREE.Quaternion().setFromUnitVectors(curDir, targetDir);
        const newWorldQ = deltaWorld.multiply(boneQ);
        bone.quaternion.copy(parentQ.invert().multiply(newWorldQ));
        avatar.updateMatrixWorld(true);
      }

      // Arms: exact ergonomic reading pose — upper arms down & forward, forearms resting right over the open notebook!
      aimBone(bones.LeftArm, 0.18, -0.78, 0.60);
      aimBone(bones.RightArm, -0.18, -0.78, 0.60);
      aimBone(bones.LeftForeArm, -0.36, -0.12, 0.92);
      aimBone(bones.RightForeArm, 0.36, -0.12, 0.92);

      const stuWrapper = new THREE.Group();
      const chairX = seat.tx + seat.sx * CHAIR_DX;
      const chairZ = seat.tz + seat.sz * CHAIR_DZ;
      // Sit squarely centered on the widened WoodenChair_01 seat cushion (+0.08 forward) with hips at ~FLOOR_Y + 1.56!
      const forwardZ = Math.cos(seat.rotY) * 0.08;
      stuWrapper.position.set(chairX, FLOOR_Y - 1.15, chairZ + forwardZ);
      stuWrapper.rotation.y = seat.rotY;
      stuWrapper.add(avatar);
      studentsGroup.add(stuWrapper);

      animatedStudents.push({
        spine: bones.Spine1 || null,
        head: bones.Head || null,
        rightForeArm: bones.RightForeArm || null,
        phase: idx * 1.15,
        baseSpineX: bones.Spine1 ? bones.Spine1.rotation.x : 0,
        baseHeadX: bones.Head ? bones.Head.rotation.x : 0,
        baseHeadY: bones.Head ? bones.Head.rotation.y : 0,
        baseArmY: bones.RightForeArm ? bones.RightForeArm.rotation.y : 0
      });
    });
  });

  // ===== 9. Photographic Streaked 3D Fireworks Over the Real Shanghai Night Skyline! =====
  function createSparkTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    g.addColorStop(0.24, 'rgba(255, 250, 232, 0.96)');
    g.addColorStop(0.58, 'rgba(255, 220, 155, 0.40)');
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
    ['#ffe066', '#fff8dc', '#ff9e2c', '#ff595e'],
    ['#ff70a6', '#ffd166', '#ffe5ec', '#c77dff'],
    ['#48bfe3', '#80ffdb', '#ffffff', '#72efdd'],
    ['#ff9f1c', '#ffe699', '#ff4d6d', '#fff5d6'],
    ['#c77dff', '#f72585', '#ffd670', '#ffffff'],
    ['#64dfdf', '#ffe066', '#d8f3dc', '#ffffff']
  ];

  const activeFireworks = [];
  let nextLaunchCooldown = 0.35;

  function launchFirework() {
    const palette = FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)];
    const isWillow = Math.random() > 0.45;
    const targetX = (Math.random() - 0.5) * 44;
    const targetY = 4.2 + Math.random() * 6.8; // Right in view through the panoramic windows!
    const targetZ = FRONT_Z - 14.0 - Math.random() * 12.0;

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
      color: '#fff2c2',
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

    const flashMat = new THREE.SpriteMaterial({
      map: sparkTex,
      color: fw.palette[0],
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const flashSprite = new THREE.Sprite(flashMat);
    flashSprite.position.set(fw.x, fw.y, fw.z);
    flashSprite.scale.set(2.6, 2.6, 1);
    fireworksGroup.add(flashSprite);

    const count = 112;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const linePos = new Float32Array(count * 6);
    const lineCol = new Float32Array(count * 6);
    const cObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions[i * 3] = fw.x;
      positions[i * 3 + 1] = fw.y;
      positions[i * 3 + 2] = fw.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const isInner = i < 34;
      const speed = isInner ? 3.8 + Math.random() * 2.4 : 7.8 + Math.random() * 4.8;

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.cos(phi) * speed + (fw.isWillow ? 1.8 : 1.0);
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.55;

      cObj.set(fw.palette[isInner ? (i % 2) : (i % fw.palette.length)]);
      colors[i * 3] = cObj.r;
      colors[i * 3 + 1] = cObj.g;
      colors[i * 3 + 2] = cObj.b;

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
      size: 1.55,
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
      opacity: 0.9,
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
    fw.flashSprite = flashSprite;
    fw.burstLife = 0;
  }

  function updateFireworks(dt, elapsed) {
    fireworksGroup.visible = true;

    nextLaunchCooldown -= dt;
    if (nextLaunchCooldown <= 0 && activeFireworks.length < 4) {
      launchFirework();
      nextLaunchCooldown = 0.95 + Math.random() * 1.15;
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
        const grav = fw.isWillow ? 2.4 : 2.0;
        const tailStretch = fw.isWillow ? 0.25 : 0.17;

        for (let idx = 0; idx < arr.length / 3; idx++) {
          const p = idx * 3;
          vels[p] *= drag;
          vels[p + 1] = vels[p + 1] * drag - grav * dt;
          vels[p + 2] *= drag;

          arr[p] += vels[p] * dt;
          arr[p + 1] += vels[p + 1] * dt;
          arr[p + 2] += vels[p + 2] * dt;

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
        fw.burstPoints.material.size = 1.60 * (1 - lifeT * 0.28);
        fw.streakLines.material.opacity = fade * 0.88;
      }
    }
  }

  // ===== Public Controller API (Night-Only Warm & Hopeful Library!) =====
  let hasPeople = true;
  let lastElapsed = 0;

  function setOccupied(occupied) {
    hasPeople = !!occupied;
    studentsGroup.visible = hasPeople;
    lampGreenShadeMat.emissiveIntensity = hasPeople ? 0.65 : 0.34;
    frontHallLight.intensity = hasPeople ? 44 : 34;
    rearHallLight.intensity = hasPeople ? 38 : 28;
  }

  function setLightingMode() {
    // Always keep the warm hopeful night skyline & fireworks outside
    lampGreenShadeMat.emissiveIntensity = hasPeople ? 0.65 : 0.34;
    windowLight.color.set('#b8d4ff');
    windowLight.intensity = 0.68;
    frontHallLight.intensity = hasPeople ? 44 : 34;
    rearHallLight.intensity = hasPeople ? 38 : 28;
  }

  function update(elapsed) {
    const dt = Math.min(0.06, Math.max(0.001, elapsed - lastElapsed));
    lastElapsed = elapsed;

    updateFireworks(dt, elapsed);

    if (hasPeople) {
      animatedStudents.forEach((s) => {
        if (s.spine) s.spine.rotation.x = s.baseSpineX + Math.sin(elapsed * 1.1 + s.phase) * 0.025;
        if (s.head) {
          s.head.rotation.x = s.baseHeadX + Math.sin(elapsed * 0.8 + s.phase) * 0.045;
          s.head.rotation.y = s.baseHeadY + Math.sin(elapsed * 0.42 + s.phase) * 0.08;
        }
        if (s.rightForeArm) {
          s.rightForeArm.rotation.y = s.baseArmY + Math.sin(elapsed * 3.6 + s.phase) * 0.04;
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
