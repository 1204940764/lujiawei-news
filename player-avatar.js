import * as THREE from 'three';

// ===== Detailed Stylized University Student Player Avatar + 3rd-Person WASD / Mouse-Look Controller =====
export function createPlayerAvatar(scene, { collisionData, onFootstep } = {}) {
  const FLOOR_Y = -3.02;
  const PLAYER_RADIUS = 0.48;
  const root = new THREE.Group();
  root.position.set(0.0, FLOOR_Y, 3.8);
  root.rotation.y = Math.PI; // Initially facing the hero study desk (-Z)
  scene.add(root);

  // Merge hero desk obstacle + all library tables/columns
  const bounds = collisionData?.bounds || { minX: -31.5, maxX: 31.5, minZ: -25.8, maxZ: 30.0 };
  const allObstacles = [
    { minX: -4.75, maxX: 4.75, minZ: -2.65, maxZ: 2.65 }, // Hero study desk
    ...(collisionData?.obstacles || [])
  ];

  // Circle-vs-AABB smooth collision push-out (prevents walking through walls, bookcases, tables, chairs & columns!)
  function resolveCollisions(x, z) {
    let rx = THREE.MathUtils.clamp(x, bounds.minX + PLAYER_RADIUS, bounds.maxX - PLAYER_RADIUS);
    let rz = THREE.MathUtils.clamp(z, bounds.minZ + PLAYER_RADIUS, bounds.maxZ - PLAYER_RADIUS);

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < allObstacles.length; i++) {
        const b = allObstacles[i];
        const closestX = Math.max(b.minX, Math.min(rx, b.maxX));
        const closestZ = Math.max(b.minZ, Math.min(rz, b.maxZ));
        const dx = rx - closestX;
        const dz = rz - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
          if (distSq > 0.00001) {
            const dist = Math.sqrt(distSq);
            const push = PLAYER_RADIUS - dist;
            rx += (dx / dist) * push;
            rz += (dz / dist) * push;
          } else {
            // Inside box center fallback: push out along shallowest axis
            const dLeft = Math.abs(rx - b.minX);
            const dRight = Math.abs(b.maxX - rx);
            const dTop = Math.abs(rz - b.minZ);
            const dBot = Math.abs(b.maxZ - rz);
            const m = Math.min(dLeft, dRight, dTop, dBot);
            if (m === dLeft) rx = b.minX - PLAYER_RADIUS;
            else if (m === dRight) rx = b.maxX + PLAYER_RADIUS;
            else if (m === dTop) rz = b.minZ - PLAYER_RADIUS;
            else rz = b.maxZ + PLAYER_RADIUS;
          }
        }
      }
      rx = THREE.MathUtils.clamp(rx, bounds.minX + PLAYER_RADIUS, bounds.maxX - PLAYER_RADIUS);
      rz = THREE.MathUtils.clamp(rz, bounds.minZ + PLAYER_RADIUS, bounds.maxZ - PLAYER_RADIUS);
    }
    return { x: rx, z: rz };
  }

  // ===== Refined Materials (Autumn College Trench + Knitwear + Leather Backpack + Glasses) =====
  const skinMat = new THREE.MeshStandardMaterial({ color: '#f0ccb2', roughness: 0.62, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: '#1c1816', roughness: 0.58, metalness: 0.08 });
  const coatMat = new THREE.MeshStandardMaterial({ color: '#b58456', roughness: 0.78, metalness: 0.04 });
  const coatDarkMat = new THREE.MeshStandardMaterial({ color: '#94673f', roughness: 0.82 });
  const knitMat = new THREE.MeshStandardMaterial({ color: '#f3ece0', roughness: 0.88 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: '#272a33', roughness: 0.84 });
  const shoeMainMat = new THREE.MeshStandardMaterial({ color: '#efe9df', roughness: 0.55 });
  const shoeAccentMat = new THREE.MeshStandardMaterial({ color: '#8f5d38', roughness: 0.65 });
  const leatherMat = new THREE.MeshStandardMaterial({ color: '#4f2f1e', roughness: 0.45, metalness: 0.12 });
  const brassMat = new THREE.MeshStandardMaterial({ color: '#d8ae64', roughness: 0.28, metalness: 0.86 });
  const glassesFrameMat = new THREE.MeshStandardMaterial({ color: '#2b2420', roughness: 0.3, metalness: 0.75 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: '#dcecff',
    transparent: true,
    opacity: 0.24,
    roughness: 0.08,
    metalness: 0.1
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#181414' });
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  // Body vertical bounce pivot (for lifelike stride bob & breathing)
  const bodyRoot = new THREE.Group();
  root.add(bodyRoot);

  // ===== 1. Articulated Legs + Tailored Trousers + Sneakers =====
  function buildLeg(sideSign) {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(sideSign * 0.18, 1.38, 0);
    bodyRoot.add(hipPivot);

    // Upper thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.68, 14), pantsMat);
    thigh.position.y = -0.34;
    thigh.castShadow = true;
    hipPivot.add(thigh);

    // Knee + lower shin pivot
    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.66;
    hipPivot.add(kneePivot);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.102, 0.088, 0.62, 14), pantsMat);
    shin.position.y = -0.31;
    shin.castShadow = true;
    kneePivot.add(shin);

    // Trouser cuff
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.06, 14), pantsMat);
    cuff.position.y = -0.58;
    kneePivot.add(cuff);

    // Detailed minimalist sneaker
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.66, 0.05);
    kneePivot.add(shoeGroup);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.055, 0.36), shoeMainMat);
    sole.position.set(0, -0.02, 0.02);
    shoeGroup.add(sole);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.10, 0.30), shoeMainMat);
    upper.position.set(0, 0.045, 0.0);
    shoeGroup.add(upper);

    const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 10), shoeMainMat);
    toeCap.scale.set(0.95, 0.65, 1.05);
    toeCap.position.set(0, 0.035, 0.13);
    shoeGroup.add(toeCap);

    const heelTab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), shoeAccentMat);
    heelTab.position.set(0, 0.05, -0.11);
    shoeGroup.add(heelTab);

    return { hipPivot, kneePivot };
  }

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // ===== 2. Layered Torso (Cream Knit Turtleneck + Camel Tailored Trench Coat) =====
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.38, 0);
  bodyRoot.add(torsoGroup);

  // Pelvis / belt waist
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.22, 16), pantsMat);
  waist.position.y = 0.08;
  torsoGroup.add(waist);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.065, 16), leatherMat);
  belt.position.y = 0.18;
  torsoGroup.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.072, 0.03), brassMat);
  buckle.position.set(0, 0.18, 0.25);
  torsoGroup.add(buckle);

  // Inner cream knit sweater core
  const innerSweater = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.225, 0.78, 16), knitMat);
  innerSweater.position.y = 0.56;
  torsoGroup.add(innerSweater);

  // Turtleneck collar
  const turtleneck = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.13, 0.14, 16), knitMat);
  turtleneck.position.y = 1.00;
  torsoGroup.add(turtleneck);

  // Structured camel trench coat (left & right front panels + back panel + lower skirt flare!)
  const coatBack = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.84, 0.22), coatMat);
  coatBack.position.set(0, 0.54, -0.08);
  coatBack.castShadow = true;
  torsoGroup.add(coatBack);

  // Coat tail / lower hem extending gracefully over hips
  const coatSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.34, 0.42, 16, 1, true, Math.PI * 0.22, Math.PI * 1.56), coatMat);
  coatSkirt.position.set(0, -0.02, -0.02);
  coatSkirt.material.side = THREE.DoubleSide;
  torsoGroup.add(coatSkirt);

  [-1, 1].forEach((side) => {
    // Open front coat panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.84, 0.18), coatMat);
    panel.position.set(side * 0.175, 0.54, 0.11);
    panel.castShadow = true;
    torsoGroup.add(panel);

    // Tailored notch lapel
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.34, 0.04), coatDarkMat);
    lapel.position.set(side * 0.135, 0.78, 0.215);
    lapel.rotation.z = side * -0.18;
    torsoGroup.add(lapel);

    // Brass buttons
    [0.52, 0.36].forEach((by) => {
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), brassMat);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(side * 0.13, by, 0.21);
      torsoGroup.add(btn);
    });

    // Front pocket flap
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.03), coatDarkMat);
    pocket.position.set(side * 0.18, 0.28, 0.21);
    torsoGroup.add(pocket);
  });

  // Rounded shoulders
  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), coatMat);
  shoulders.scale.set(1.38, 0.55, 0.86);
  shoulders.position.set(0, 0.92, 0.0);
  torsoGroup.add(shoulders);

  // ===== 3. Detailed Vintage Leather Backpack (visible from 3rd-person rear view!) =====
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 0.58, -0.28);
  torsoGroup.add(backpackGroup);

  const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.20), leatherMat);
  packBody.castShadow = true;
  backpackGroup.add(packBody);

  const packFlap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.22), leatherMat);
  packFlap.position.set(0, 0.19, -0.01);
  backpackGroup.add(packFlap);

  const frontPocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.20, 0.06), coatDarkMat);
  frontPocket.position.set(0, -0.10, -0.12);
  backpackGroup.add(frontPocket);

  // Twin vertical brass-buckled leather straps on backpack
  [-0.12, 0.12].forEach((sx) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.44, 0.025), coatDarkMat);
    strap.position.set(sx, 0.02, -0.11);
    backpackGroup.add(strap);

    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.046, 0.035), brassMat);
    clasp.position.set(sx, -0.04, -0.115);
    backpackGroup.add(clasp);

    // Shoulder harness straps wrapping over coat shoulders
    const harness = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.026, 8, 16, Math.PI), leatherMat);
    harness.rotation.y = Math.PI / 2;
    harness.position.set(sx * 1.45, 0.18, 0.26);
    backpackGroup.add(harness);
  });

  // ===== 4. Articulated Arms + Cuffs + Hands =====
  function buildArm(sideSign) {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(sideSign * 0.35, 0.90, 0.0);
    torsoGroup.add(shoulderPivot);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.078, 0.42, 12), coatMat);
    upperArm.position.y = -0.20;
    upperArm.castShadow = true;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.y = -0.40;
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.066, 0.38, 12), coatMat);
    forearm.position.y = -0.18;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const sleeveCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.055, 12), knitMat);
    sleeveCuff.position.y = -0.37;
    elbowPivot.add(sleeveCuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), skinMat);
    hand.scale.set(0.85, 1.1, 0.9);
    hand.position.y = -0.44;
    elbowPivot.add(hand);

    return { shoulderPivot, elbowPivot };
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // ===== 5. Detailed Sculpted Head, Layered Hair & Sleek Glasses =====
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.08, 0.02);
  torsoGroup.add(headPivot);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.14, 12), skinMat);
  neck.position.y = 0.04;
  headPivot.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.245, 22, 20), skinMat);
  head.scale.set(0.95, 1.05, 0.98);
  head.position.y = 0.25;
  head.castShadow = true;
  headPivot.add(head);

  // Ears
  [-0.22, 0.22].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), skinMat);
    ear.scale.set(0.55, 1.1, 0.8);
    ear.position.set(ex, 0.24, -0.01);
    headPivot.add(ear);
  });

  // Subtle nose & expressive eyes + eyebrows
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.06, 8), skinMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.23, 0.245);
  headPivot.add(nose);

  [-0.082, 0.082].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), eyeMat);
    eye.position.set(ex, 0.275, 0.222);
    headPivot.add(eye);

    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), eyeShineMat);
    shine.position.set(ex + 0.007, 0.282, 0.24);
    headPivot.add(shine);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.014, 0.014), hairMat);
    brow.position.set(ex, 0.325, 0.225);
    brow.rotation.z = ex > 0 ? -0.08 : 0.08;
    headPivot.add(brow);
  });

  // Sleek thin-frame glasses (iconic CS grad student detail!)
  const glassesGroup = new THREE.Group();
  glassesGroup.position.set(0, 0.272, 0.238);
  headPivot.add(glassesGroup);

  [-0.082, 0.082].forEach((gx) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.006, 8, 22), glassesFrameMat);
    rim.position.set(gx, 0, 0);
    glassesGroup.add(rim);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.054, 18), lensMat);
    lens.position.set(gx, 0, 0.001);
    glassesGroup.add(lens);

    // Temple arm going back to ear
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.22), glassesFrameMat);
    temple.position.set(gx > 0 ? 0.145 : -0.145, 0.005, -0.11);
    glassesGroup.add(temple);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.008, 0.008), glassesFrameMat);
  glassesGroup.add(bridge);

  // Layered Sculpted Hair (stylish crown + textured back + side-swept bangs)
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.262, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  hairCrown.scale.set(0.98, 1.06, 1.02);
  hairCrown.position.set(0, 0.275, -0.015);
  hairCrown.rotation.x = -0.22;
  headPivot.add(hairCrown);

  // Back hair volume (looks super clean from 3rd-person camera!)
  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), hairMat);
  hairBack.scale.set(0.95, 1.02, 0.72);
  hairBack.position.set(0, 0.22, -0.10);
  headPivot.add(hairBack);

  // Side-swept bangs & layered locks
  [
    [-0.14, 0.39, 0.15, 0.35, -0.35, 0.095],
    [-0.04, 0.42, 0.18, 0.45, -0.15, 0.092],
    [0.08, 0.41, 0.17, 0.42, 0.22, 0.095],
    [0.16, 0.37, 0.13, 0.30, 0.42, 0.085],
    [-0.21, 0.30, 0.05, 0.15, -0.18, 0.075],
    [0.21, 0.30, 0.05, 0.15, 0.18, 0.075]
  ].forEach(([hx, hy, hz, rx, rz, r]) => {
    const lock = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.3, 10), hairMat);
    lock.position.set(hx, hy, hz);
    lock.rotation.set(rx, 0, rz);
    headPivot.add(lock);
  });

  // ===== Walk / Idle Animation State + Stride-Synced Footsteps =====
  let walkCycle = 0;
  let lastStepIndex = 0;
  let currentSpeed = 0;

  function update(dt, elapsed, moveVec, isSprinting = false) {
    const speedMag = moveVec ? moveVec.length() : 0;
    const targetSpeed = speedMag > 0.01 ? (isSprinting ? 1.55 : 1.0) : 0;
    currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * 10);

    if (speedMag > 0.01) {
      const moveSpeed = isSprinting ? 8.2 : 4.8;
      const rawX = root.position.x + moveVec.x * moveSpeed * dt;
      const rawZ = root.position.z + moveVec.z * moveSpeed * dt;
      const resolved = resolveCollisions(rawX, rawZ);
      root.position.x = resolved.x;
      root.position.z = resolved.z;

      // Smoothly turn avatar to face movement direction
      const targetAngle = Math.atan2(moveVec.x, moveVec.z);
      let diff = targetAngle - root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      root.rotation.y += diff * Math.min(1, dt * 11);
    }

    // Procedural full-body walk & idle animation
    if (currentSpeed > 0.02) {
      walkCycle += dt * (7.2 * currentSpeed);
      const s = Math.sin(walkCycle);
      const c = Math.cos(walkCycle);
      const amp = Math.min(1, currentSpeed);

      // Fire realistic footstep sound exactly as each foot plants (every PI radians!)
      if (speedMag > 0.01 && onFootstep) {
        const stepIdx = Math.floor(walkCycle / Math.PI);
        if (stepIdx !== lastStepIndex) {
          lastStepIndex = stepIdx;
          const isLeft = stepIdx % 2 === 0;
          const onCarpet = Math.abs(root.position.x) < 2.8 && root.position.z > -25.0 && root.position.z < 30.0;
          onFootstep(isLeft, onCarpet);
        }
      }

      // Legs swing + natural knee bend
      leftLeg.hipPivot.rotation.x = s * 0.56 * amp;
      rightLeg.hipPivot.rotation.x = -s * 0.56 * amp;
      leftLeg.kneePivot.rotation.x = Math.max(0, -c) * 0.55 * amp;
      rightLeg.kneePivot.rotation.x = Math.max(0, c) * 0.55 * amp;

      // Counter-swinging arms + relaxed elbow bend
      leftArm.shoulderPivot.rotation.x = -s * 0.44 * amp;
      rightArm.shoulderPivot.rotation.x = s * 0.44 * amp;
      leftArm.elbowPivot.rotation.x = -0.24 - Math.max(0, s) * 0.22 * amp;
      rightArm.elbowPivot.rotation.x = -0.24 - Math.max(0, -s) * 0.22 * amp;

      // Vertical stride bob + gentle torso & backpack bounce
      bodyRoot.position.y = Math.abs(Math.sin(walkCycle)) * 0.075 * amp;
      torsoGroup.rotation.y = s * 0.065 * amp;
      torsoGroup.rotation.x = 0.05 * amp;
      backpackGroup.position.y = 0.58 + Math.abs(c) * 0.025 * amp;
      headPivot.rotation.y = -s * 0.035 * amp;
    } else {
      // Relaxed idle breathing
      const breath = Math.sin(elapsed * 2.1);
      bodyRoot.position.y += (0 - bodyRoot.position.y) * 0.15;
      torsoGroup.rotation.x += (0.015 + breath * 0.012 - torsoGroup.rotation.x) * 0.12;
      torsoGroup.rotation.y += (0 - torsoGroup.rotation.y) * 0.12;
      headPivot.rotation.y += (Math.sin(elapsed * 0.55) * 0.12 - headPivot.rotation.y) * 0.06;

      leftLeg.hipPivot.rotation.x *= 0.85;
      rightLeg.hipPivot.rotation.x *= 0.85;
      leftLeg.kneePivot.rotation.x *= 0.85;
      rightLeg.kneePivot.rotation.x *= 0.85;
      leftArm.shoulderPivot.rotation.x += (0.04 - leftArm.shoulderPivot.rotation.x) * 0.12;
      rightArm.shoulderPivot.rotation.x += (0.04 - rightArm.shoulderPivot.rotation.x) * 0.12;
      leftArm.elbowPivot.rotation.x += (-0.12 - leftArm.elbowPivot.rotation.x) * 0.12;
      rightArm.elbowPivot.rotation.x += (-0.12 - rightArm.elbowPivot.rotation.x) * 0.12;
    }
  }

  function resetToDesk() {
    root.position.set(0.0, FLOOR_Y, 3.6);
    root.rotation.y = Math.PI;
  }

  return {
    root,
    update,
    resetToDesk,
    getFocusPoint: () => new THREE.Vector3(root.position.x, root.position.y + 2.35, root.position.z)
  };
}
