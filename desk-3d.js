import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BOOKS_DATA, PROFILE_DATA } from './desk-data.js?v=15';
import { deskSound } from './desk-sound.js?v=15';
import { createLibraryEnvironment } from './library-env.js?v=15';

// ===== DOM Elements =====
const canvasContainer = document.getElementById('scene-container');
const tooltipEl = document.getElementById('hover-tooltip');
const profileModalEl = document.getElementById('profile-modal');
const profileModalBodyEl = document.getElementById('profile-modal-body');
const closeProfileBtn = document.getElementById('close-profile');
const loadingEl = document.getElementById('loading-overlay');
const easterToastEl = document.getElementById('easter-toast');
const studyTimerPillEl = document.getElementById('study-timer-pill');
const peopleToggleBtn = document.getElementById('btn-people');

// ===== Easter-Egg Toast & Study Timer =====
let toastTimer = null;
function showEasterToast(message, duration = 3400) {
  easterToastEl.textContent = message;
  easterToastEl.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    easterToastEl.classList.remove('visible');
  }, duration);
}

let studyMode = 'resting'; // 'resting' | 'studying'
let studySeconds = 0;
let studyInterval = null;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateStudyPill() {
  if (studyMode === 'studying') {
    studyTimerPillEl.classList.remove('resting');
    studyTimerPillEl.textContent = `✏️ 专注学习 ${formatTime(studySeconds)}`;
  } else {
    studyTimerPillEl.classList.add('resting');
    studyTimerPillEl.textContent =
      studySeconds > 0 ? `☕ 咖啡休息中 · 已学 ${formatTime(studySeconds)}` : '☕ 咖啡休息中';
  }
}

function startStudying() {
  studyMode = 'studying';
  if (!studyInterval) {
    studyInterval = setInterval(() => {
      if (studyMode === 'studying') {
        studySeconds++;
        updateStudyPill();
      }
    }, 1000);
  }
  updateStudyPill();
}

function takeCoffeeRest() {
  studyMode = 'resting';
  updateStudyPill();
}

studyTimerPillEl.addEventListener('click', () => {
  if (studyMode === 'studying') {
    if (mugGroup.userData.sipProgress < 0) {
      mugGroup.userData.sipProgress = 0;
      mugGroup.userData.sipsTaken += 1;
    }
    deskSound.playCoffeeSip();
    takeCoffeeRest();
    showEasterToast('☕ 切换到咖啡休息状态，放松片刻再继续！');
  } else {
    penHolderGroup.userData.shakeTime = 1.0;
    deskSound.playPenRattle();
    startStudying();
    showEasterToast('✏️ 已切换为专注学习状态，加油！');
  }
});

updateStudyPill();

// ===== Responsive Viewport Helper (Desktop / Tablet / Mobile Portrait Auto-Adapt) =====
function getResponsivePreset() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / Math.max(h, 1);

  if (aspect < 0.78) {
    // Portrait phone (e.g. 390x844)
    return {
      isMobile: true,
      fov: 58,
      fogDensity: 0.0045,
      defaultCamPos: new THREE.Vector3(0.0, 8.2, 10.6),
      defaultTarget: new THREE.Vector3(0.0, 0.2, -0.35),
      heroScale: 1.06,
      heroCamPos: new THREE.Vector3(0.0, 4.85, 5.65),
      heroCamTarget: new THREE.Vector3(0.0, 1.32, 1.12),
      maxDistance: 20.0
    };
  }
  if (aspect < 1.15) {
    // Tablet / narrow split-screen
    return {
      isMobile: w < 768,
      fov: 46,
      fogDensity: 0.0055,
      defaultCamPos: new THREE.Vector3(0.08, 5.2, 6.8),
      defaultTarget: new THREE.Vector3(0.04, 0.25, -0.35),
      heroScale: 1.18,
      heroCamPos: new THREE.Vector3(0.0, 4.18, 5.05),
      heroCamTarget: new THREE.Vector3(0.0, 1.38, 1.08),
      maxDistance: 18.0
    };
  }
  // Widescreen desktop — wide open view of the grand university library hall!
  return {
    isMobile: false,
    fov: 42,
    fogDensity: 0.0038,
    defaultCamPos: new THREE.Vector3(0.12, 4.1, 6.1),
    defaultTarget: new THREE.Vector3(0.05, 0.35, -0.45),
    heroScale: 1.44,
    heroCamPos: new THREE.Vector3(0.0, 3.38, 4.15),
    heroCamTarget: new THREE.Vector3(0.0, 1.42, 1.12),
    maxDistance: 26.0
  };
}

let viewportPreset = getResponsivePreset();

// ===== Scene, Camera, Renderer (HD PBR Stage Setup) =====
const scene = new THREE.Scene();
const NIGHT_BG = new THREE.Color('#090809');
const DAY_BG = new THREE.Color('#e6dacd');
scene.background = NIGHT_BG.clone();
scene.fog = new THREE.FogExp2('#090809', viewportPreset.fogDensity);

const camera = new THREE.PerspectiveCamera(
  viewportPreset.fov,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
const DEFAULT_CAM_POS = viewportPreset.defaultCamPos.clone();
const DEFAULT_TARGET = viewportPreset.defaultTarget.clone();
camera.position.copy(DEFAULT_CAM_POS);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'default'
});
renderer.setSize(window.innerWidth, window.innerHeight);
// Native 2x Retina sharpness for razor-crisp book typography; power savings come from 1 shadow map, Lambert hall & adaptive FPS!
renderer.setPixelRatio(Math.min(window.devicePixelRatio, viewportPreset.isMobile ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvasContainer.appendChild(renderer.domElement);

// Studio PMREM Environment for realistic PBR reflections on brass, ceramic, wood & foil
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment();
const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
scene.environment = envRT.texture;
scene.environmentIntensity = 0.28;
roomEnv.dispose();
pmremGenerator.dispose();

const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), viewportPreset.isMobile ? 8 : 16);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DEFAULT_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.4;
controls.maxDistance = viewportPreset.maxDistance;
controls.maxPolarAngle = Math.PI / 2.22;
controls.minPolarAngle = 0.22;
controls.enablePan = true;
controls.panSpeed = 0.55;

// ===== High-Definition Procedural PBR Textures =====
function createWoodMaps() {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 1024;
  colorCanvas.height = 1024;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bctx = bumpCanvas.getContext('2d');

  // Deep luxurious walnut gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#5a3824');
  grad.addColorStop(0.35, '#6d452c');
  grad.addColorStop(0.7, '#603b25');
  grad.addColorStop(1, '#52321f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 1024, 1024);

  // Fine organic wood fibers
  for (let i = 0; i < 650; i++) {
    const y = Math.random() * 1024;
    const thickness = 0.8 + Math.random() * 3.2;
    const isDark = Math.random() > 0.45;
    const cp1y = y + (Math.random() - 0.5) * 20;
    const cp2y = y + (Math.random() - 0.5) * 20;
    const endY = y + (Math.random() - 0.5) * 12;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(340, cp1y, 680, cp2y, 1024, endY);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = isDark
      ? `rgba(34, 17, 8, ${0.06 + Math.random() * 0.14})`
      : `rgba(168, 114, 72, ${0.04 + Math.random() * 0.09})`;
    ctx.stroke();

    bctx.beginPath();
    bctx.moveTo(0, y);
    bctx.bezierCurveTo(340, cp1y, 680, cp2y, 1024, endY);
    bctx.lineWidth = thickness;
    bctx.strokeStyle = isDark ? 'rgba(40,40,40,0.22)' : 'rgba(215,215,215,0.16)';
    bctx.stroke();
  }

  // Subtle plank join lines
  for (let y = 256; y < 1024; y += 256) {
    ctx.fillStyle = 'rgba(24, 12, 6, 0.32)';
    ctx.fillRect(0, y, 1024, 2);
    bctx.fillStyle = '#202020';
    bctx.fillRect(0, y, 1024, 3);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1.6, 1.0);
  map.anisotropy = maxAniso;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1.6, 1.0);
  bumpMap.anisotropy = maxAniso;

  return { map, bumpMap };
}

function createDeskMatTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // Saddle-leather deep espresso
  const grad = ctx.createRadialGradient(512, 320, 60, 512, 320, 620);
  grad.addColorStop(0, '#302723');
  grad.addColorStop(1, '#221b18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Fine pebbled leather grain
  for (let i = 0; i < 16000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 640;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,244,230,0.025)' : 'rgba(0,0,0,0.055)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle debossed inner border + gold-thread stitching
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 984, 600);

  ctx.strokeStyle = 'rgba(218, 178, 128, 0.42)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([11, 7]);
  ctx.strokeRect(26, 26, 972, 588);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createPagesEdgeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5eedf';
  ctx.fillRect(0, 0, 256, 128);
  for (let y = 1; y < 128; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? 'rgba(130, 106, 82, 0.28)' : 'rgba(130, 106, 82, 0.09)';
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBookCoverTexture(book) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');

  // Rich linen cloth hardcover base
  const grad = ctx.createLinearGradient(0, 0, 1024, 1400);
  grad.addColorStop(0, book.color);
  grad.addColorStop(0.65, book.color);
  grad.addColorStop(1, book.spineColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1400);

  // Linen weave micro-texture
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < 1400; y += 6) {
    ctx.fillRect(0, y, 1024, 1);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let x = 0; x < 1024; x += 6) {
    ctx.fillRect(x, 0, 1, 1400);
  }

  // Spine hinge groove on left
  const groove = ctx.createLinearGradient(0, 0, 86, 0);
  groove.addColorStop(0, 'rgba(0,0,0,0.42)');
  groove.addColorStop(0.45, 'rgba(0,0,0,0.12)');
  groove.addColorStop(0.62, 'rgba(255,255,255,0.14)');
  groove.addColorStop(0.76, 'rgba(0,0,0,0.22)');
  groove.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = groove;
  ctx.fillRect(0, 0, 86, 1400);

  // Double gold-foil editorial border
  ctx.strokeStyle = 'rgba(246, 224, 184, 0.42)';
  ctx.lineWidth = 4;
  ctx.strokeRect(92, 64, 856, 1272);
  ctx.strokeStyle = 'rgba(246, 224, 184, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(108, 80, 824, 1240);

  // Top category ribbon
  ctx.fillStyle = 'rgba(255, 250, 240, 0.11)';
  ctx.fillRect(136, 118, 768, 86);
  ctx.fillStyle = book.accent;
  ctx.fillRect(136, 118, 16, 86);

  ctx.fillStyle = 'rgba(255, 250, 242, 0.94)';
  ctx.font = '600 40px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.fillText(book.category, 182, 174);

  // Accent bar
  ctx.fillStyle = book.accent;
  ctx.fillRect(136, 266, 170, 10);

  // Crisp HD Chinese Title
  ctx.fillStyle = '#fffaf2';
  const cleanTitle = book.title.replace(/^.*?·\s*/, '');
  const titleSize = cleanTitle.length > 6 ? 96 : 114;
  ctx.font = `800 ${titleSize}px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif`;

  if (cleanTitle.length > 6) {
    const mid = Math.ceil(cleanTitle.length / 2);
    ctx.fillText(cleanTitle.slice(0, mid), 136, 434);
    ctx.fillText(cleanTitle.slice(mid), 136, 560);
  } else {
    ctx.fillText(cleanTitle, 136, 470);
  }

  // English subtitle
  ctx.fillStyle = 'rgba(255, 248, 236, 0.72)';
  ctx.font = '600 32px -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(book.subtitle, 136, 658);

  // Subtle architectural geometric emblem
  ctx.strokeStyle = 'rgba(255, 248, 236, 0.14)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(766, 845, 138, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(766, 845, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(628, 845);
  ctx.lineTo(904, 845);
  ctx.stroke();

  // Gold embossed "150 满分" badge on Math II
  if (book.id === 'math') {
    ctx.save();
    ctx.translate(768, 316);
    ctx.rotate(0.12);
    const sealGrad = ctx.createRadialGradient(-18, -18, 12, 0, 0, 108);
    sealGrad.addColorStop(0, '#fae09e');
    sealGrad.addColorStop(0.65, '#d9a441');
    sealGrad.addColorStop(1, '#a87622');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 104, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff5d6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 88, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#193624';
    ctx.font = '800 62px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('150', 0, 8);
    ctx.font = '700 30px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('满分王牌', 0, 52);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  // Bottom cream editorial plate
  ctx.fillStyle = 'rgba(255, 249, 240, 0.94)';
  ctx.fillRect(136, 1018, 768, 248);
  ctx.fillStyle = book.accent;
  ctx.fillRect(136, 1018, 768, 14);

  ctx.fillStyle = '#291e19';
  ctx.font = '700 44px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.fillText(book.coverTag, 174, 1122);

  ctx.fillStyle = '#635147';
  ctx.font = '500 34px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.fillText(book.coverNote, 174, 1200);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createBookSpineTexture(book) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = book.spineColor;
  ctx.fillRect(0, 0, 512, 128);

  // Raised gold spine ribs
  ctx.fillStyle = book.accent;
  ctx.fillRect(28, 0, 12, 128);
  ctx.fillRect(52, 0, 5, 128);
  ctx.fillRect(455, 0, 5, 128);
  ctx.fillRect(472, 0, 12, 128);

  ctx.fillStyle = '#fff9f0';
  ctx.font = '700 38px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(book.shortName, 256, 66);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

// ===== Ultra-HD Multi-Page Book Spread Renderer (1.5x Super-Sampled 1536x2070 per page!) =====
function drawPaperBase(ctx, book, side, pageNum, totalPages) {
  // Warm matte archival book paper (slightly richer tone so bright lights never wash out text)
  ctx.fillStyle = '#f2e9d8';
  ctx.fillRect(0, 0, 1024, 1380);

  // Subtle paper fiber speckles
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(110,82,54,0.025)' : 'rgba(255,255,255,0.035)';
    ctx.fillRect(Math.random() * 1024, Math.random() * 1380, 3, 2);
  }

  // Realistic spine gutter shadow
  const gutter = side === 'left'
    ? ctx.createLinearGradient(890, 0, 1024, 0)
    : ctx.createLinearGradient(0, 0, 134, 0);
  if (side === 'left') {
    gutter.addColorStop(0, 'rgba(0,0,0,0)');
    gutter.addColorStop(0.75, 'rgba(54,34,18,0.10)');
    gutter.addColorStop(1, 'rgba(38,22,10,0.28)');
    ctx.fillStyle = gutter;
    ctx.fillRect(890, 0, 134, 1380);
  } else {
    gutter.addColorStop(0, 'rgba(38,22,10,0.28)');
    gutter.addColorStop(0.25, 'rgba(54,34,18,0.10)');
    gutter.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gutter;
    ctx.fillRect(0, 0, 134, 1380);
  }

  // Crisp high-contrast running header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#5a493c';
  ctx.font = '700 26px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
  ctx.fillText(book.title, 86, 86);
  ctx.textAlign = 'right';
  ctx.fillText(book.category, 938, 86);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(116, 54, 36, 0.36)';
  ctx.fillRect(86, 110, 852, 2.5);

  // Page footer + subtle page-turn cue
  ctx.fillStyle = '#5f4d40';
  ctx.font = '600 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${String(pageNum).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')} —`, 512, 1326);

  ctx.font = '700 22px -apple-system, "PingFang SC", sans-serif';
  ctx.fillStyle = '#7a3320';
  if (side === 'left' && pageNum > 1) {
    ctx.textAlign = 'left';
    ctx.fillText('← 点击翻回上一页', 86, 1326);
  } else if (side === 'right' && pageNum < totalPages) {
    ctx.textAlign = 'right';
    ctx.fillText('点击翻到下一页 →', 938, 1326);
  }
  ctx.textAlign = 'left';
}

function makePageCanvasTexture(drawFn) {
  // 1.5x super-sampled Retina canvas (1536x2070) keeping exact 1024x1380 logical coordinates!
  const SCALE = 1.5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(1024 * SCALE);
  canvas.height = Math.round(1380 * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  drawFn(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function createBookSpreads(book) {
  // Split highlights cleanly across pages: first 3 on Page 02, remaining on Page 03
  const part1 = book.highlights.slice(0, 3);
  const part2 = book.highlights.slice(3);
  const totalPages = 4;

  // Page 01 (Spread 0 Left): Editorial Overview & Quote
  const p1 = makePageCanvasTexture((ctx) => {
    drawPaperBase(ctx, book, 'left', 1, totalPages);

    ctx.fillStyle = book.color;
    ctx.fillRect(86, 166, 14, 126);

    ctx.fillStyle = '#140e0b';
    ctx.font = '800 64px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillText(book.shortName + ' · 备考志', 124, 232);

    ctx.fillStyle = '#7a321e';
    ctx.font = '700 32px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText(book.scoreBadge, 124, 290);

    // Subtle ruled lines for summary
    ctx.strokeStyle = 'rgba(128, 102, 78, 0.24)';
    ctx.lineWidth = 2;
    for (let y = 398; y <= 760; y += 68) {
      ctx.beginPath();
      ctx.moveTo(86, y);
      ctx.lineTo(918, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#1d1511';
    ctx.font = '600 35px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    wrapCanvasText(ctx, book.summary, 92, 386, 820, 68, 5);

    // Editorial Quote Card
    ctx.fillStyle = 'rgba(122, 54, 34, 0.09)';
    ctx.fillRect(86, 825, 836, 258);
    ctx.fillStyle = book.color;
    ctx.fillRect(86, 825, 12, 258);

    ctx.fillStyle = '#17100d';
    ctx.font = '700 34px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    wrapCanvasText(ctx, book.quote, 128, 902, 760, 58, 4);

    // Cover tag note
    ctx.fillStyle = '#4a3a30';
    ctx.font = '700 27px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText(`关键词：${book.coverNote}`, 86, 1166);
  });

  // Page 02 (Spread 0 Right): Study Roadmap Part 1
  const p2 = makePageCanvasTexture((ctx) => {
    drawPaperBase(ctx, book, 'right', 2, totalPages);

    ctx.fillStyle = '#140e0b';
    ctx.font = '800 46px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillText('01 · 备考路线与核心方法', 112, 206);

    let y = 294;
    part1.forEach((item, idx) => {
      ctx.fillStyle = book.color;
      ctx.beginPath();
      ctx.arc(132, y - 12, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffaf2';
      ctx.font = '700 24px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(idx + 1), 132, y - 4);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#1b1410';
      ctx.font = '600 31px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
      const lines = wrapCanvasText(ctx, item, 174, y, 742, 52, 5);
      y += lines * 52 + 46;
    });
  });

  // Page 03 (Spread 1 Left): Study Roadmap Part 2 / Deep Tips
  const p3 = makePageCanvasTexture((ctx) => {
    drawPaperBase(ctx, book, 'left', 3, totalPages);

    ctx.fillStyle = '#140e0b';
    ctx.font = '800 46px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillText('02 · 进阶复盘与实战细节', 86, 206);

    let y = 294;
    const items = part2.length > 0 ? part2 : [
      `核心原则：${book.coverTag}`,
      '后期每天保持高频复盘，把易错点和薄弱章节沉淀成自己的错题与导图。',
      '考场心态稳住节奏，遇到偏难题先跳过拿稳基础分，最后再回头攻坚。'
    ];
    items.forEach((item, idx) => {
      ctx.fillStyle = book.color;
      ctx.beginPath();
      ctx.arc(106, y - 12, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffaf2';
      ctx.font = '700 24px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(part1.length + idx + 1), 106, y - 4);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#1b1410';
      ctx.font = '600 31px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
      const lines = wrapCanvasText(ctx, item, 148, y, 748, 52, 5);
      y += lines * 52 + 46;
    });
  });

  // Page 04 (Spread 1 Right): Interactive Click-to-Download Resources Page!
  const rightHotspots = [];
  const p4 = makePageCanvasTexture((ctx) => {
    drawPaperBase(ctx, book, 'right', 4, totalPages);

    ctx.fillStyle = '#140e0b';
    ctx.font = '800 46px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillText('03 · 本科资料与免费下载', 112, 206);

    ctx.fillStyle = '#7a321e';
    ctx.font = '700 28px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('👆 直接点击下方资料卡片即可一键下载或打开：', 112, 268);

    let y = 330;
    const allRes = [
      ...(book.downloads || []).map((d) => ({ ...d, isExternal: false, tag: `${d.size} · 点击直接下载` })),
      ...(book.externalLinks || []).map((l) => ({ ...l, isExternal: true, tag: '外部链接 · 新标签页打开' }))
    ];

    allRes.forEach((res) => {
      const cardX = 112;
      const cardW = 804;
      const cardH = 144;

      rightHotspots.push({
        x: cardX,
        y,
        w: cardW,
        h: cardH,
        name: res.name,
        href: res.href,
        icon: res.icon,
        isExternal: res.isExternal
      });

      ctx.fillStyle = 'rgba(122, 54, 34, 0.09)';
      ctx.fillRect(cardX, y, cardW, cardH);
      ctx.strokeStyle = 'rgba(122, 54, 34, 0.34)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, y, cardW, cardH);
      ctx.fillStyle = book.color;
      ctx.fillRect(cardX, y, 12, cardH);

      ctx.fillStyle = '#140e0b';
      ctx.font = '700 31px -apple-system, "PingFang SC", "Noto Sans SC", sans-serif';
      ctx.fillText(`${res.icon}  ${res.name}`, cardX + 34, y + 60);

      ctx.fillStyle = '#4f3f35';
      ctx.font = '600 24px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(res.tag, cardX + 34, y + 108);

      const pillW = 152;
      const pillH = 54;
      const pillX = cardX + cardW - pillW - 26;
      const pillY = y + (cardH - pillH) / 2;
      ctx.fillStyle = book.color;
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = '#fffaf2';
      ctx.font = '700 24px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(res.isExternal ? '打开 ↗' : '下载 ↓', pillX + pillW / 2, pillY + 36);
      ctx.textAlign = 'left';

      y += 176;
    });

    ctx.strokeStyle = 'rgba(122, 54, 34, 0.42)';
    ctx.lineWidth = 3;
    ctx.strokeRect(112, 1050, 804, 150);
    ctx.fillStyle = '#7a321e';
    ctx.font = '700 32px -apple-system, "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌱 坚持到最后，祝你一战上岸！', 514, 1116);
    ctx.fillStyle = '#4a3a30';
    ctx.font = '600 24px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText('按 ESC 或点击空白处合上书本放回书桌', 514, 1166);
    ctx.textAlign = 'left';
  });

  return [
    { left: p1, right: p2, rightHotspots: [] },
    { left: p3, right: p4, rightHotspots }
  ];
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.slice(0, -1) + '…', x, y);
        return lineCount;
      }
      ctx.fillText(line, x, y);
      line = text[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    lineCount++;
    ctx.fillText(line, x, y);
  }
  return lineCount;
}

function createStickyNoteTexture(line1, line2, bgColor = '#f7e188') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, 512, 56);

  ctx.fillStyle = '#473626';
  ctx.font = '700 62px -apple-system, "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(line1, 256, 224);
  ctx.font = '600 50px -apple-system, "PingFang SC", sans-serif';
  ctx.fillStyle = '#88422e';
  ctx.fillText(line2, 256, 326);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

// ===== Theatrical Stage Lighting Setup =====
const ambientLight = new THREE.AmbientLight('#ffdcb8', 0.14);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight('#ffdcb3', '#120d16', 0.22);
scene.add(hemiLight);

// Dramatic overhead Stage Key Spotlight (ONLY shadow-casting light — 1024x1024 saves 67% GPU shadow cost!)
const stageKeySpot = new THREE.SpotLight('#ffd093', 75, 18, Math.PI / 4.4, 0.78, 1.35);
stageKeySpot.position.set(0.15, 6.8, 1.35);
stageKeySpot.target.position.set(0.05, 0.05, 0.05);
stageKeySpot.castShadow = true;
stageKeySpot.shadow.mapSize.set(1024, 1024);
stageKeySpot.shadow.camera.near = 2.0;
stageKeySpot.shadow.camera.far = 14.0;
stageKeySpot.shadow.bias = -0.0005;
scene.add(stageKeySpot);
scene.add(stageKeySpot.target);

// Cool theatrical Indigo-Blue Rim Spotlight from back-right for cinematic silhouette separation
const stageRimSpot = new THREE.SpotLight('#8eb4ff', 30, 16, Math.PI / 3.2, 0.85, 1.4);
stageRimSpot.position.set(4.8, 4.6, -3.6);
stageRimSpot.target.position.set(0.0, 0.2, 0.0);
scene.add(stageRimSpot);
scene.add(stageRimSpot.target);

// Subtle Volumetric Stage Light Beam descending from above
const stageBeamMat = new THREE.MeshBasicMaterial({
  color: '#ffcf8f',
  transparent: true,
  opacity: 0.032,
  depthWrite: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending
});
const stageBeam = new THREE.Mesh(
  new THREE.CylinderGeometry(0.45, 3.65, 6.9, 28, 1, true),
  stageBeamMat
);
stageBeam.position.set(0.1, 3.4, 0.65);
stageBeam.rotation.x = -0.18;
scene.add(stageBeam);

// Daylight / Fill Directional Light (shadow-free for high performance)
const fillLight = new THREE.DirectionalLight('#b7ccff', 0.16);
fillLight.position.set(5, 7.5, 4);
scene.add(fillLight);

// Designer Desk Lamp Warm Local Pool (shadow-free; stageKeySpot handles crisp shadows)
const lampSpot = new THREE.SpotLight('#ffbe70', 22, 10, Math.PI / 2.6, 0.72, 1.4);
lampSpot.position.set(-2.95, 1.62, -1.24);
lampSpot.target.position.set(-1.35, 0.0, -0.25);
scene.add(lampSpot);
scene.add(lampSpot.target);

const lampBulbLight = new THREE.PointLight('#ffd296', 3.6, 5.5, 1.6);
lampBulbLight.position.set(-2.95, 1.46, -1.24);
scene.add(lampBulbLight);

// Subtle warm accent on the right + hero book reading spotlight
const rightWarmFill = new THREE.PointLight('#ffc894', 1.4, 9, 1.6);
rightWarmFill.position.set(3.4, 2.5, 1.6);
scene.add(rightWarmFill);

const readerLight = new THREE.PointLight('#fff1da', 0, 7.5, 1.4);
readerLight.position.set(0.15, 2.8, 2.2);
scene.add(readerLight);

// ===== Desk & Architecture =====
const deskGroup = new THREE.Group();
scene.add(deskGroup);

const woodMaps = createWoodMaps();
const deskMat = new THREE.MeshStandardMaterial({
  map: woodMaps.map,
  bumpMap: woodMaps.bumpMap,
  bumpScale: 0.015,
  roughness: 0.42,
  metalness: 0.05
});

// Beveled walnut tabletop using RoundedBoxGeometry
const tableTop = new THREE.Mesh(new RoundedBoxGeometry(8.8, 0.24, 4.7, 4, 0.035), deskMat);
tableTop.position.set(0, -0.12, 0);
tableTop.receiveShadow = true;
tableTop.castShadow = true;
deskGroup.add(tableTop);

// Sleek dark-bronze recessed apron & tapered legs
const frameMat = new THREE.MeshStandardMaterial({ color: '#2b1c15', roughness: 0.5, metalness: 0.35 });
const apron = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.14, 3.9), frameMat);
apron.position.set(0, -0.29, 0);
deskGroup.add(apron);

const legGeo = new THREE.CylinderGeometry(0.075, 0.05, 2.8, 20);
[
  [-3.85, -1.62, -1.85],
  [3.85, -1.62, -1.85],
  [-3.85, -1.62, 1.85],
  [3.85, -1.62, 1.85]
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(legGeo, frameMat);
  leg.position.set(x, y, z);
  deskGroup.add(leg);
});

// Saddle-leather desk mat with rounded edges
const blotter = new THREE.Mesh(
  new RoundedBoxGeometry(6.15, 0.022, 3.38, 3, 0.008),
  new THREE.MeshStandardMaterial({
    map: createDeskMatTexture(),
    roughness: 0.82,
    metalness: 0.04
  })
);
blotter.position.set(0.05, 0.011, 0.02);
blotter.receiveShadow = true;
deskGroup.add(blotter);

// ===== Interactive Registry =====
const interactables = [];
const bookGroups = new Map();
const pagesEdgeTex = createPagesEdgeTexture();

// ===== Build 7 Articulated HD 3D Books (with Hinged Opening Cover & Inner Pages!) =====
function createBookMesh(book) {
  const [w, h, d] = book.size;
  const group = new THREE.Group();
  const baseY = 0.022;
  group.position.set(book.position[0], baseY, book.position[2]);
  group.rotation.y = book.rotationY;

  const coverTex = createBookCoverTexture(book);
  const spineTex = createBookSpineTexture(book);
  const spreads = createBookSpreads(book);

  const coverTopMat = new THREE.MeshStandardMaterial({
    map: coverTex,
    roughness: 0.62,
    metalness: 0.03
  });
  const coverInnerMat = new THREE.MeshStandardMaterial({
    color: '#efe6d5',
    roughness: 0.82
  });
  const coverBackMat = new THREE.MeshStandardMaterial({
    color: book.spineColor,
    roughness: 0.48,
    metalness: 0.06
  });
  const spineMat = new THREE.MeshStandardMaterial({
    map: spineTex,
    roughness: 0.44,
    metalness: 0.08
  });
  const pageEdgeMat = new THREE.MeshStandardMaterial({
    map: pagesEdgeTex,
    roughness: 0.85
  });
  const rightPageTopMat = new THREE.MeshStandardMaterial({
    map: spreads[0].right,
    roughness: 0.94,
    metalness: 0.0
  });
  const leftPageMat = new THREE.MeshStandardMaterial({
    map: spreads[0].left,
    roughness: 0.94,
    metalness: 0.0
  });
  const leafFrontMat = new THREE.MeshStandardMaterial({
    map: spreads[0].right,
    roughness: 0.94,
    metalness: 0.0
  });
  const leafBackMat = new THREE.MeshStandardMaterial({
    map: spreads[1].left,
    roughness: 0.94,
    metalness: 0.0
  });

  const boardT = 0.018;
  const pageH = h - boardT * 2;

  // 1. Bottom hardcover board
  const bottomBoard = new THREE.Mesh(
    new RoundedBoxGeometry(w, boardT, d, 2, 0.004),
    coverBackMat
  );
  bottomBoard.position.set(0, boardT / 2, 0);
  bottomBoard.castShadow = true;
  bottomBoard.receiveShadow = true;
  group.add(bottomBoard);

  // 2. Right page block (top face has printed right page!)
  const pageBlockMats = [
    pageEdgeMat,     // +x
    pageEdgeMat,     // -x
    rightPageTopMat, // +y (visible when opened!)
    pageEdgeMat,     // -y
    pageEdgeMat,     // +z
    pageEdgeMat      // -z
  ];
  const rightPages = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.042, pageH, d - 0.052),
    pageBlockMats
  );
  rightPages.position.set(0.014, boardT + pageH / 2, 0);
  rightPages.castShadow = true;
  rightPages.receiveShadow = true;
  rightPages.userData.pageRole = 'right';
  group.add(rightPages);

  // 3. Spine on -X edge
  const spineMats = [
    coverBackMat,
    spineMat,
    coverBackMat,
    coverBackMat,
    coverBackMat,
    coverBackMat
  ];
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.028, h, d),
    spineMats
  );
  spine.position.set(-w / 2 + 0.014, h / 2, 0);
  spine.castShadow = true;
  spine.receiveShadow = true;
  group.add(spine);

  // 4. Hinged Front Cover Pivot at the spine (-w/2, h - boardT/2, 0)
  const coverPivot = new THREE.Group();
  coverPivot.position.set(-w / 2 + 0.014, h - boardT / 2, 0);
  group.add(coverPivot);

  const frontCoverMats = [
    coverBackMat,  // +x
    coverBackMat,  // -x
    coverTopMat,   // +y (front cover when closed!)
    coverInnerMat, // -y (inside cover when opened!)
    coverBackMat,  // +z
    coverBackMat   // -z
  ];
  const frontCover = new THREE.Mesh(
    new THREE.BoxGeometry(w, boardT, d),
    frontCoverMats
  );
  frontCover.position.set(w / 2 - 0.014, 0, 0);
  frontCover.castShadow = true;
  frontCover.receiveShadow = true;
  frontCover.userData.pageRole = 'left';
  coverPivot.add(frontCover);

  // Left printed page sheet attached inside the front cover (upright & un-mirrored!)
  const leftPageSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.06, d - 0.068),
    leftPageMat
  );
  leftPageSheet.rotation.set(Math.PI / 2, 0, Math.PI);
  leftPageSheet.position.set(w / 2 - 0.012, -boardT / 2 - 0.002, 0);
  leftPageSheet.userData.pageRole = 'left';
  coverPivot.add(leftPageSheet);

  // 5. Two-sided Turning Page Leaf for real 3D page-flipping!
  const leafPivot = new THREE.Group();
  leafPivot.position.set(-w / 2 + 0.022, h - boardT + 0.002, 0);
  leafPivot.visible = false;
  group.add(leafPivot);

  const leafW = w - 0.06;
  const leafD = d - 0.068;
  const leafFront = new THREE.Mesh(new THREE.PlaneGeometry(leafW, leafD), leafFrontMat);
  leafFront.rotation.set(-Math.PI / 2, 0, 0);
  leafFront.position.set(leafW / 2, 0.001, 0);
  leafPivot.add(leafFront);

  const leafBack = new THREE.Mesh(new THREE.PlaneGeometry(leafW, leafD), leafBackMat);
  leafBack.rotation.set(Math.PI / 2, 0, Math.PI);
  leafBack.position.set(leafW / 2, -0.001, 0);
  leafPivot.add(leafBack);

  // 6. Silk bookmark ribbon
  const ribbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.044, 0.004, 0.24),
    new THREE.MeshStandardMaterial({ color: book.accent, roughness: 0.5 })
  );
  ribbon.position.set(w * 0.16, boardT + pageH * 0.55, d / 2 + 0.06);
  ribbon.rotation.x = 0.22;
  group.add(ribbon);

  // Dedicated invisible hitboxes for rock-solid clicking (zero hover-lift jitter & zero invisible leaf interference!)
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  // 1) Stationary desk hitbox at the book's exact resting footprint on the desk
  const deskHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.04, h + 0.08, d + 0.04),
    hitMat
  );
  deskHitbox.position.set(book.position[0], baseY + (h + 0.08) / 2, book.position[2]);
  deskHitbox.rotation.y = book.rotationY;
  deskHitbox.userData.interactiveRoot = group;
  scene.add(deskHitbox);
  interactables.push(deskHitbox);

  // 2) Open-book left & right page hitboxes (used exclusively while this book is open!)
  const leftPageHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.05, d),
    hitMat
  );
  leftPageHitbox.position.set(w / 2 - 0.014, -boardT / 2, 0);
  leftPageHitbox.userData.interactiveRoot = group;
  leftPageHitbox.userData.pageRole = 'left';
  coverPivot.add(leftPageHitbox);

  // Match rightPageHitbox to exact rightPages UV area so clicking printed cards is 1:1 accurate!
  const rightPageHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.042, 0.04, d - 0.052),
    hitMat
  );
  rightPageHitbox.position.set(0.014, h - boardT, 0);
  rightPageHitbox.userData.interactiveRoot = group;
  rightPageHitbox.userData.pageRole = 'right';
  group.add(rightPageHitbox);

  // Store full home transform, spreads & animation state
  group.userData = {
    type: 'book',
    id: book.id,
    data: book,
    size: book.size,
    homePos: new THREE.Vector3(book.position[0], baseY, book.position[2]),
    homeRot: new THREE.Euler(0, book.rotationY, 0),
    coverPivot,
    leafPivot,
    leftPageHitbox,
    rightPageHitbox,
    leftPageMat,
    rightPageTopMat,
    leafFrontMat,
    leafBackMat,
    spreads,
    spreadIndex: 0,
    openProgress: 0, // 0 = closed on desk, 1 = lifted & unfolded
    animState: 'closed', // 'closed' | 'opening' | 'open' | 'closing'
    flipAnim: null // { dir: 1 | -1, targetSpread: number, progress: 0..1 }
  };

  scene.add(group);
  bookGroups.set(book.id, group);
}

BOOKS_DATA.forEach(createBookMesh);

// ===== Designer Nordic Brass & Opal-Dome Desk Lamp (高级感极简弧形台灯) =====
const lampGroup = new THREE.Group();
lampGroup.position.set(-3.36, 0, -1.48);
lampGroup.rotation.y = 0.54;
scene.add(lampGroup);

const brassMat = new THREE.MeshStandardMaterial({
  color: '#d8b06a',
  roughness: 0.22,
  metalness: 0.90
});
const lampBaseWalnutMat = new THREE.MeshStandardMaterial({
  color: '#2b1c15',
  roughness: 0.32,
  metalness: 0.14
});
const lampDomeOuterMat = new THREE.MeshStandardMaterial({
  color: '#f2e8da',
  roughness: 0.26,
  metalness: 0.08,
  side: THREE.FrontSide
});
const lampDomeInnerMat = new THREE.MeshStandardMaterial({
  color: '#e5bc74',
  roughness: 0.28,
  metalness: 0.72,
  side: THREE.BackSide
});
const bulbMat = new THREE.MeshStandardMaterial({
  color: '#fff7e2',
  emissive: '#ffbe66',
  emissiveIntensity: 2.2,
  roughness: 0.25,
  metalness: 0.0
});
const touchRingMat = new THREE.MeshStandardMaterial({
  color: '#ffcf86',
  emissive: '#ffb254',
  emissiveIntensity: 1.4,
  roughness: 0.2
});

// 1. Sleek two-tier dark walnut & brushed-brass weighted plinth
const plinthPoints = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.38, 0.0),
  new THREE.Vector2(0.38, 0.032),
  new THREE.Vector2(0.355, 0.056),
  new THREE.Vector2(0.0, 0.056)
];
const lampPlinth = new THREE.Mesh(new THREE.LatheGeometry(plinthPoints, 48), lampBaseWalnutMat);
lampPlinth.castShadow = true;
lampPlinth.receiveShadow = true;
lampGroup.add(lampPlinth);

const brassCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.045, 32), brassMat);
brassCollar.position.set(-0.08, 0.078, 0);
brassCollar.castShadow = true;
lampGroup.add(brassCollar);

// Glowing recessed touch-dimmer ring on front of base
const touchRing = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.006, 12, 32), touchRingMat);
touchRing.rotation.x = Math.PI / 2;
touchRing.position.set(0.16, 0.059, 0.06);
lampGroup.add(touchRing);

// 2. Fluid single-piece curved brushed-brass swan-neck arc (TubeGeometry)
const arcCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.08, 0.08, 0),
  new THREE.Vector3(-0.14, 0.72, 0),
  new THREE.Vector3(-0.04, 1.38, 0),
  new THREE.Vector3(0.24, 1.72, 0),
  new THREE.Vector3(0.50, 1.66, 0),
  new THREE.Vector3(0.56, 1.54, 0)
]);
const swanNeck = new THREE.Mesh(new THREE.TubeGeometry(arcCurve, 48, 0.022, 16, false), brassMat);
swanNeck.castShadow = true;
lampGroup.add(swanNeck);

// 3. Sculpted Louis Poulsen / Flowerpot-inspired Dome Shade + Opal Glass Diffuser
const shadeHolder = new THREE.Group();
shadeHolder.position.set(0.56, 1.52, 0);
shadeHolder.rotation.z = -0.14;
lampGroup.add(shadeHolder);

// Smooth hemisphere-bell dome curve (LatheGeometry)
const domePts = [];
const domeSegs = 24;
for (let i = 0; i <= domeSegs; i++) {
  const t = i / domeSegs; // 0 = top center, 1 = bottom rim
  const angle = t * (Math.PI * 0.56);
  const r = Math.sin(angle) * 0.40;
  const y = Math.cos(angle) * 0.28 - 0.14;
  domePts.push(new THREE.Vector2(r, y));
}
const domeGeo = new THREE.LatheGeometry(domePts, 48);

const domeOuter = new THREE.Mesh(domeGeo, lampDomeOuterMat);
domeOuter.castShadow = true;
domeOuter.receiveShadow = true;
shadeHolder.add(domeOuter);

// Warm brushed-gold inner reflector lining
const domeInner = new THREE.Mesh(domeGeo, lampDomeInnerMat);
domeInner.scale.set(0.988, 0.988, 0.988);
shadeHolder.add(domeInner);

// Delicate brushed-brass lip & top finial
const shadeRim = new THREE.Mesh(new THREE.TorusGeometry(0.394, 0.008, 12, 48), brassMat);
shadeRim.rotation.x = Math.PI / 2;
shadeRim.position.y = -0.19;
shadeHolder.add(shadeRim);

const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.048, 0.075, 24), brassMat);
finial.position.y = 0.16;
shadeHolder.add(finial);

// Frosted opal-glass glowing diffuser tucked cleanly under the dome
const opalDiffuser = new THREE.Mesh(
  new THREE.SphereGeometry(0.165, 28, 16, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58),
  bulbMat
);
opalDiffuser.position.y = -0.11;
shadeHolder.add(opalDiffuser);

lampGroup.userData = {
  type: 'lamp',
  label: '💡 极简设计师台灯 · 点击切换舞台聚光 / 秋日柔光'
};
lampGroup.traverse((child) => {
  if (child.isMesh) {
    child.userData.interactiveRoot = lampGroup;
    interactables.push(child);
  }
});

// ===== Sculpted Ceramic Pen Holder (笔筒 + 文具) =====
const penHolderGroup = new THREE.Group();
penHolderGroup.position.set(3.18, 0, -1.30);
scene.add(penHolderGroup);

const cupProfile = [
  new THREE.Vector2(0.0, 0.0),
  new THREE.Vector2(0.21, 0.0),
  new THREE.Vector2(0.245, 0.06),
  new THREE.Vector2(0.24, 0.56),
  new THREE.Vector2(0.215, 0.58),
  new THREE.Vector2(0.195, 0.56),
  new THREE.Vector2(0.195, 0.08),
  new THREE.Vector2(0.0, 0.08)
];
const cupMesh = new THREE.Mesh(
  new THREE.LatheGeometry(cupProfile, 32),
  new THREE.MeshStandardMaterial({ color: '#dfd0bf', roughness: 0.46, metalness: 0.06 })
);
cupMesh.castShadow = true;
cupMesh.receiveShadow = true;
penHolderGroup.add(cupMesh);

const cupBand = new THREE.Mesh(
  new THREE.CylinderGeometry(0.247, 0.245, 0.09, 32),
  new THREE.MeshStandardMaterial({ color: '#9c523b', roughness: 0.42 })
);
cupBand.position.y = 0.16;
penHolderGroup.add(cupBand);

const penItems = [];
function addPen({ color, tipColor = '#e6dfd5', x, z, rx, rz, height = 0.92, radius = 0.023 }) {
  const pen = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.34, metalness: 0.1 })
  );
  body.castShadow = true;
  pen.add(body);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(radius, 0.095, 14),
    new THREE.MeshStandardMaterial({ color: tipColor, roughness: 0.45 })
  );
  tip.position.y = height / 2 + 0.047;
  pen.add(tip);

  const clipMetal = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.20, 0.014),
    brassMat
  );
  clipMetal.position.set(radius + 0.004, height * 0.24, 0);
  pen.add(clipMetal);

  pen.position.set(x, 0.48, z);
  pen.rotation.set(rx, 0, rz);
  pen.userData = {
    homeY: 0.48,
    homeRx: rx,
    homeRz: rz,
    phase: penItems.length * 1.15
  };
  penHolderGroup.add(pen);
  penItems.push(pen);
}

addPen({ color: '#22272f', x: -0.07, z: 0.05, rx: 0.14, rz: 0.16, height: 0.88 });
addPen({ color: '#c43b3b', x: 0.08, z: 0.06, rx: 0.12, rz: -0.18, height: 0.92 });
addPen({ color: '#2e68a8', x: 0.01, z: -0.08, rx: -0.18, rz: 0.06, height: 0.86 });
addPen({ color: '#f2b830', tipColor: '#d48d46', x: -0.09, z: -0.05, rx: -0.10, rz: 0.22, height: 0.94, radius: 0.021 });
addPen({ color: '#f5df4d', tipColor: '#f5df4d', x: 0.09, z: -0.05, rx: -0.14, rz: -0.22, height: 0.78, radius: 0.035 });

const ruler = new THREE.Mesh(
  new RoundedBoxGeometry(0.11, 1.06, 0.018, 2, 0.004),
  new THREE.MeshStandardMaterial({ color: '#d8b07a', roughness: 0.5 })
);
ruler.position.set(-0.02, 0.56, -0.11);
ruler.rotation.set(-0.22, 0.3, 0.12);
ruler.castShadow = true;
ruler.userData = { homeY: 0.56, homeRx: -0.22, homeRz: 0.12, phase: 5.5 };
penHolderGroup.add(ruler);
penItems.push(ruler);

penHolderGroup.userData = {
  type: 'penholder',
  shakeTime: 0
};
const penHitbox = new THREE.Mesh(
  new THREE.CylinderGeometry(0.32, 0.30, 1.12, 16),
  new THREE.MeshBasicMaterial({ visible: false })
);
penHitbox.position.y = 0.56;
penHitbox.userData.interactiveRoot = penHolderGroup;
penHolderGroup.add(penHitbox);
interactables.push(penHitbox);

// ===== 419 Score Card Stand (成绩单立牌) =====
const scoreStandGroup = new THREE.Group();
scoreStandGroup.position.set(0.18, 0, -1.78);
scoreStandGroup.rotation.y = -0.03;
scene.add(scoreStandGroup);

const standBase = new THREE.Mesh(
  new RoundedBoxGeometry(0.96, 0.10, 0.28, 3, 0.016),
  new THREE.MeshStandardMaterial({ color: '#4f301e', roughness: 0.45 })
);
standBase.position.y = 0.05;
standBase.castShadow = true;
standBase.receiveShadow = true;
scoreStandGroup.add(standBase);

const textureLoader = new THREE.TextureLoader();
const scoreTex = textureLoader.load('assets/score-419.jpg');
scoreTex.colorSpace = THREE.SRGBColorSpace;
scoreTex.anisotropy = maxAniso;

const cardFrame = new THREE.Mesh(
  new RoundedBoxGeometry(0.92, 1.14, 0.044, 3, 0.01),
  new THREE.MeshStandardMaterial({ color: '#f2e8da', roughness: 0.42 })
);
cardFrame.position.set(0, 0.62, -0.02);
cardFrame.rotation.x = -0.16;
cardFrame.castShadow = true;
scoreStandGroup.add(cardFrame);

const cardPhoto = new THREE.Mesh(
  new THREE.PlaneGeometry(0.84, 1.05),
  new THREE.MeshStandardMaterial({ map: scoreTex, roughness: 0.3 })
);
cardPhoto.position.set(0, 0.62, 0.005);
cardPhoto.rotation.x = -0.16;
scoreStandGroup.add(cardPhoto);

const clip = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.075, 0.085, 2, 0.012), brassMat);
clip.position.set(0, 1.18, -0.10);
clip.rotation.x = -0.16;
scoreStandGroup.add(clip);

scoreStandGroup.userData = {
  type: 'profile',
  id: 'profile',
  data: PROFILE_DATA
};
scoreStandGroup.traverse((child) => {
  if (child.isMesh) {
    child.userData.interactiveRoot = scoreStandGroup;
    interactables.push(child);
  }
});

// ===== Artisanal Ceramic Coffee Mug & Saucer (马克杯) =====
const mugGroup = new THREE.Group();
mugGroup.position.set(3.22, 0, 0.92);
mugGroup.rotation.y = -0.65;
scene.add(mugGroup);

const mugMat = new THREE.MeshStandardMaterial({ color: '#f0e6d8', roughness: 0.28, metalness: 0.05 });
const saucer = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.28, 0.032, 32),
  new THREE.MeshStandardMaterial({ color: '#d6c4b0', roughness: 0.38 })
);
saucer.position.y = 0.016;
saucer.receiveShadow = true;
saucer.castShadow = true;
mugGroup.add(saucer);

// Separate cup group so the mug lifts off the saucer when taking a sip!
const mugCupGroup = new THREE.Group();
mugGroup.add(mugCupGroup);

const mugProfile = [
  new THREE.Vector2(0.0, 0.03),
  new THREE.Vector2(0.20, 0.03),
  new THREE.Vector2(0.23, 0.14),
  new THREE.Vector2(0.225, 0.45),
  new THREE.Vector2(0.205, 0.46),
  new THREE.Vector2(0.195, 0.44),
  new THREE.Vector2(0.195, 0.38),
  new THREE.Vector2(0.0, 0.38)
];
const mugBody = new THREE.Mesh(new THREE.LatheGeometry(mugProfile, 32), mugMat);
mugBody.castShadow = true;
mugBody.receiveShadow = true;
mugCupGroup.add(mugBody);

const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.026, 14, 28, Math.PI), mugMat);
mugHandle.position.set(0.215, 0.25, 0);
mugHandle.rotation.z = -Math.PI / 2;
mugCupGroup.add(mugHandle);

const coffeeLiquid = new THREE.Mesh(
  new THREE.CylinderGeometry(0.196, 0.196, 0.018, 28),
  new THREE.MeshStandardMaterial({ color: '#2e180d', roughness: 0.12, metalness: 0.18 })
);
coffeeLiquid.position.y = 0.415;
mugCupGroup.add(coffeeLiquid);

const steamPuffs = [];
const steamGeo = new THREE.SphereGeometry(0.055, 10, 10);
for (let i = 0; i < 4; i++) {
  const mat = new THREE.MeshBasicMaterial({
    color: '#fff6eb',
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  });
  const puff = new THREE.Mesh(steamGeo, mat);
  puff.userData = { phase: i * 1.55 };
  mugCupGroup.add(puff);
  steamPuffs.push(puff);
}

mugGroup.userData = {
  type: 'coffee',
  sipProgress: -1, // -1 = idle, 0..1 = sipping animation
  sipsTaken: 0
};
const mugHitbox = new THREE.Mesh(
  new THREE.CylinderGeometry(0.36, 0.36, 0.56, 16),
  new THREE.MeshBasicMaterial({ visible: false })
);
mugHitbox.position.y = 0.28;
mugHitbox.userData.interactiveRoot = mugGroup;
mugGroup.add(mugHitbox);
interactables.push(mugHitbox);

// ===== Sticky Notes + Highlighter (Front-Left) =====
const stickyGroup = new THREE.Group();
stickyGroup.position.set(-3.24, 0.015, 0.92);
stickyGroup.rotation.y = 0.18;
scene.add(stickyGroup);

const note1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.68, 0.028, 0.68),
  [
    new THREE.MeshStandardMaterial({ color: '#ebd274', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#ebd274', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: createStickyNoteTexture('一战成硕', '全力以赴 ✨'), roughness: 0.78 }),
    new THREE.MeshStandardMaterial({ color: '#ebd274', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#ebd274', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#ebd274', roughness: 0.8 })
  ]
);
note1.castShadow = true;
note1.receiveShadow = true;
stickyGroup.add(note1);

const note2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.56, 0.014, 0.56),
  [
    new THREE.MeshStandardMaterial({ color: '#f5b8a4', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#f5b8a4', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: createStickyNoteTexture('脚踏实地', '稳扎稳打 💪', '#f7c5b4'), roughness: 0.78 }),
    new THREE.MeshStandardMaterial({ color: '#f5b8a4', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#f5b8a4', roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: '#f5b8a4', roughness: 0.8 })
  ]
);
note2.position.set(0.32, 0.022, -0.46);
note2.rotation.y = -0.32;
note2.castShadow = true;
stickyGroup.add(note2);

const deskHighlighter = new THREE.Mesh(
  new THREE.CylinderGeometry(0.036, 0.036, 0.76, 16),
  new THREE.MeshStandardMaterial({ color: '#f28b50', roughness: 0.35 })
);
deskHighlighter.position.set(0.28, 0.036, 0.56);
deskHighlighter.rotation.set(0, 0.42, Math.PI / 2);
deskHighlighter.castShadow = true;
stickyGroup.add(deskHighlighter);

stickyGroup.userData = {
  type: 'sticky',
  bounceTime: 0,
  quoteIndex: 0
};
const stickyHitbox = new THREE.Mesh(
  new THREE.BoxGeometry(1.15, 0.22, 1.35),
  new THREE.MeshBasicMaterial({ visible: false })
);
stickyHitbox.position.set(0.12, 0.10, -0.10);
stickyHitbox.userData.interactiveRoot = stickyGroup;
stickyGroup.add(stickyHitbox);
interactables.push(stickyHitbox);

// ===== Mini Potted Succulent =====
const plantGroup = new THREE.Group();
plantGroup.position.set(-3.45, 0, -0.22);
scene.add(plantGroup);

const pot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.24, 0.17, 0.34, 24),
  new THREE.MeshStandardMaterial({ color: '#b56345', roughness: 0.68 })
);
pot.position.y = 0.17;
pot.castShadow = true;
pot.receiveShadow = true;
plantGroup.add(pot);

const soil = new THREE.Mesh(
  new THREE.CylinderGeometry(0.21, 0.21, 0.03, 20),
  new THREE.MeshStandardMaterial({ color: '#3b2b22', roughness: 0.95 })
);
soil.position.y = 0.33;
plantGroup.add(soil);

const leafMat = new THREE.MeshStandardMaterial({ color: '#588753', roughness: 0.48 });
for (let layer = 0; layer < 2; layer++) {
  const count = layer === 0 ? 7 : 5;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + layer * 0.4;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.075 - layer * 0.015, 0.24 - layer * 0.04, 10), leafMat);
    const radius = layer === 0 ? 0.10 : 0.05;
    leaf.position.set(Math.cos(angle) * radius, 0.42 + layer * 0.06, Math.sin(angle) * radius);
    leaf.rotation.z = -Math.cos(angle) * (0.55 - layer * 0.22);
    leaf.rotation.x = Math.sin(angle) * (0.55 - layer * 0.22);
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
}

plantGroup.userData = {
  type: 'plant',
  wiggleTime: 0
};
const plantHitbox = new THREE.Mesh(
  new THREE.CylinderGeometry(0.28, 0.22, 0.62, 14),
  new THREE.MeshBasicMaterial({ visible: false })
);
plantHitbox.position.y = 0.31;
plantHitbox.userData.interactiveRoot = plantGroup;
plantGroup.add(plantHitbox);
interactables.push(plantHitbox);

// ===== Floating Warm Dust Motes (Atmospheric Polish) =====
const moteCount = 65;
const motePositions = new Float32Array(moteCount * 3);
for (let i = 0; i < moteCount; i++) {
  motePositions[i * 3] = (Math.random() - 0.5) * 7.5;
  motePositions[i * 3 + 1] = 0.25 + Math.random() * 2.8;
  motePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
}
const moteGeo = new THREE.BufferGeometry();
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
const moteMat = new THREE.PointsMaterial({
  color: '#ffe2b0',
  size: 0.028,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
const dustMotes = new THREE.Points(moteGeo, moteMat);
scene.add(dustMotes);

// ===== Build Warm Brown University Library Environment =====
const libraryEnv = createLibraryEnvironment(scene, maxAniso);

peopleToggleBtn.addEventListener('click', () => {
  const nextOccupied = !libraryEnv.isOccupied();
  libraryEnv.setOccupied(nextOccupied);
  deskSound.playLampSwitch(nextOccupied);
  peopleToggleBtn.innerHTML = nextOccupied
    ? '<span>👥</span><span>有人自习</span>'
    : '<span>🪑</span><span>无人静谧</span>';
  showEasterToast(
    nextOccupied
      ? '👥 已切换「有人自习」场景 · 身旁也有并肩努力的同学'
      : '🪑 已切换「无人静谧」场景 · 独享整座安静的图书馆'
  );
});

// ===== Stage / Daylight Lighting Toggle =====
let isLampOn = true;

function updateLightingMode() {
  libraryEnv.setLightingMode(isLampOn);
  if (isLampOn) {
    scene.background.copy(NIGHT_BG);
    scene.fog.color.copy(NIGHT_BG);
    scene.environmentIntensity = 0.20;
    stageKeySpot.intensity = 78;
    stageRimSpot.intensity = 30;
    stageBeamMat.opacity = 0.034;
    lampSpot.intensity = 22;
    lampBulbLight.intensity = 3.6;
    bulbMat.emissiveIntensity = 2.2;
    touchRingMat.emissiveIntensity = 1.4;
    moteMat.opacity = 0.52;
    ambientLight.intensity = 0.14;
    hemiLight.intensity = 0.22;
    fillLight.intensity = 0.16;
    fillLight.color.set('#b7ccff');
    rightWarmFill.intensity = 1.4;
    document.body.classList.remove('day-mode');
  } else {
    scene.background.copy(DAY_BG);
    scene.fog.color.copy(DAY_BG);
    scene.environmentIntensity = 0.62;
    stageKeySpot.intensity = 0;
    stageRimSpot.intensity = 0;
    stageBeamMat.opacity = 0;
    lampSpot.intensity = 0;
    lampBulbLight.intensity = 0;
    bulbMat.emissiveIntensity = 0.08;
    touchRingMat.emissiveIntensity = 0.1;
    moteMat.opacity = 0.12;
    ambientLight.intensity = 0.88;
    hemiLight.intensity = 0.85;
    fillLight.intensity = 1.5;
    fillLight.color.set('#fff3df');
    rightWarmFill.intensity = 0.55;
    document.body.classList.add('day-mode');
  }
}

// ===== Camera & Center-Stage Open-Book Showcase =====
let camAnim = null;
let HERO_SCALE = viewportPreset.heroScale;
const HERO_BOOK_ROT = new THREE.Euler(0.76, 0.0, 0);
const HERO_CAM_POS = viewportPreset.heroCamPos.clone();
const HERO_CAM_TARGET = viewportPreset.heroCamTarget.clone();

function getHeroPosForBook(bookGroup) {
  // Spine is at local x = -w/2; offset group +w/2 * HERO_SCALE so the open double-page spread is dead-center!
  const w = bookGroup.userData.size[0];
  return new THREE.Vector3((w / 2) * HERO_SCALE, 1.48, 1.28);
}

function animateCameraTo(pos, target, duration = 760) {
  camAnim = {
    startPos: camera.position.clone(),
    endPos: pos.clone(),
    startTarget: controls.target.clone(),
    endTarget: target.clone(),
    startTime: performance.now(),
    duration
  };
}

function resetCamera() {
  animateCameraTo(DEFAULT_CAM_POS, DEFAULT_TARGET, 760);
}

// ===== On-Book Reading & 3D Page Turning =====
let activeItemId = null;

function findRightPageHotspot(bookGroup, hit) {
  if (!hit || !hit.uv) return null;
  const ud = bookGroup.userData;
  const spread = ud.spreads[ud.spreadIndex];
  if (!spread || !spread.rightHotspots || spread.rightHotspots.length === 0) return null;
  const cx = hit.uv.x * 1024;
  const cy = (1 - hit.uv.y) * 1380;
  return spread.rightHotspots.find(
    (spot) => cx >= spot.x && cx <= spot.x + spot.w && cy >= spot.y && cy <= spot.y + spot.h
  ) || null;
}

function triggerResourceHotspot(spot) {
  deskSound.playDownloadChime();
  if (spot.isExternal) {
    window.open(spot.href, '_blank', 'noopener,noreferrer');
    showEasterToast(`🔗 已打开：${spot.name}`);
  } else {
    const a = document.createElement('a');
    a.href = spot.href;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showEasterToast(`📥 开始下载：${spot.name}`);
  }
}

function flipBookPage(bookId, direction) {
  const group = bookGroups.get(bookId);
  if (!group) return;
  const ud = group.userData;
  if (ud.animState !== 'open' || ud.flipAnim) return;

  const targetSpread = ud.spreadIndex + direction;
  if (targetSpread < 0 || targetSpread >= ud.spreads.length) return;

  if (direction > 0) {
    ud.leafFrontMat.map = ud.spreads[ud.spreadIndex].right;
    ud.leafBackMat.map = ud.spreads[targetSpread].left;
    ud.leafFrontMat.needsUpdate = true;
    ud.leafBackMat.needsUpdate = true;

    ud.rightPageTopMat.map = ud.spreads[targetSpread].right;
    ud.rightPageTopMat.needsUpdate = true;
    ud.leafPivot.rotation.z = 0;
  } else {
    ud.leafFrontMat.map = ud.spreads[targetSpread].right;
    ud.leafBackMat.map = ud.spreads[ud.spreadIndex].left;
    ud.leafFrontMat.needsUpdate = true;
    ud.leafBackMat.needsUpdate = true;

    ud.leftPageMat.map = ud.spreads[targetSpread].left;
    ud.leftPageMat.needsUpdate = true;
    ud.leafPivot.rotation.z = 2.94;
  }

  ud.leafPivot.visible = true;
  ud.flipAnim = { dir: direction, targetSpread, progress: 0 };
  deskSound.playPageFlip();
}

function renderProfileModal(profile) {
  const dlHtml = profile.downloads
    .map(
      (d) => `<a class="bc-btn accent" href="${d.href}" download>${d.icon} ${d.name} (${d.size})</a>`
    )
    .join('');
  const linkHtml = profile.externalLinks
    .map(
      (l) => `<a class="bc-btn" href="${l.href}" target="_blank" rel="noopener noreferrer">${l.icon} ${l.name}</a>`
    )
    .join('');

  profileModalBodyEl.innerHTML = `
    <p style="font-size:13.5px; color:var(--text-muted); line-height:1.7; margin-bottom:10px;">${profile.summary}</p>
    <div class="score-shot-wrap">
      <img src="${profile.image}" alt="419 分初试成绩单" />
    </div>
    ${profile.sections
      .map(
        (s) => `
      <div class="profile-block">
        <h3>${s.heading}</h3>
        <p>${s.text}</p>
      </div>`
      )
      .join('')}
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;">
      ${dlHtml}${linkHtml}
    </div>
  `;
}

function triggerBookClose(bookId) {
  const group = bookGroups.get(bookId);
  if (!group) return;
  const ud = group.userData;
  ud.flipAnim = null;
  ud.leafPivot.visible = false;
  if (ud.openProgress > 0.001) {
    ud.animState = 'closing';
    deskSound.playBookClose();
  }
}

function openBook(book) {
  profileModalEl.classList.remove('open');
  profileModalEl.setAttribute('aria-hidden', 'true');

  if (activeItemId && activeItemId !== book.id && activeItemId !== 'profile') {
    triggerBookClose(activeItemId);
  }

  activeItemId = book.id;

  const group = bookGroups.get(book.id);
  if (group) {
    const ud = group.userData;
    ud.spreadIndex = 0;
    ud.flipAnim = null;
    ud.leafPivot.visible = false;
    ud.leftPageMat.map = ud.spreads[0].left;
    ud.rightPageTopMat.map = ud.spreads[0].right;
    ud.leftPageMat.needsUpdate = true;
    ud.rightPageTopMat.needsUpdate = true;
    ud.animState = 'opening';
    deskSound.playBookOpen();
  }

  animateCameraTo(HERO_CAM_POS, HERO_CAM_TARGET, 800);
}

function openProfile() {
  if (activeItemId && activeItemId !== 'profile') {
    triggerBookClose(activeItemId);
  }

  activeItemId = 'profile';
  renderProfileModal(PROFILE_DATA);
  profileModalEl.classList.add('open');
  profileModalEl.setAttribute('aria-hidden', 'false');
}

function closeActiveItem(shouldResetCam = true) {
  if (activeItemId && activeItemId !== 'profile') {
    triggerBookClose(activeItemId);
  }
  activeItemId = null;
  profileModalEl.classList.remove('open');
  profileModalEl.setAttribute('aria-hidden', 'true');
  if (shouldResetCam) resetCamera();
}

closeProfileBtn.addEventListener('click', () => closeActiveItem(false));
profileModalEl.addEventListener('click', (e) => {
  if (e.target === profileModalEl) closeActiveItem(false);
});

window.addEventListener('keydown', (e) => {
  if (!activeItemId) return;
  if (e.key === 'Escape') {
    closeActiveItem(true);
  } else if (activeItemId !== 'profile') {
    if (e.key === 'ArrowRight') flipBookPage(activeItemId, 1);
    if (e.key === 'ArrowLeft') flipBookPage(activeItemId, -1);
  }
});

// ===== Raycasting (Hover & Click — Including Direct Page-Turning on Open Book!) =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredRoot = null;
let pointerDownPos = { x: 0, y: 0 };

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function getRaycastTargets() {
  // When a book is open in reading mode, raycast ONLY its left & right pages so
  // background books on the desk never hijack clicks or hovers!
  if (activeItemId && activeItemId !== 'profile') {
    const activeBook = bookGroups.get(activeItemId);
    if (activeBook) {
      return [activeBook.userData.leftPageHitbox, activeBook.userData.rightPageHitbox];
    }
  }
  return interactables;
}

let lastRaycastAt = 0;
let lastInteractionAt = performance.now();
function markInteractive() {
  lastInteractionAt = performance.now();
}
window.addEventListener('wheel', markInteractive, { passive: true });
window.addEventListener('keydown', markInteractive);

renderer.domElement.addEventListener('pointermove', (event) => {
  markInteractive();
  // Skip sticky hover tooltip on touch screens
  if (event.pointerType === 'touch') return;
  const now = performance.now();
  if (now - lastRaycastAt < 32) return; // Throttle raycast to ~30Hz
  lastRaycastAt = now;
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(getRaycastTargets(), false);

  if (hits.length > 0) {
    const hitObj = hits[0].object;
    const root = hitObj.userData.interactiveRoot;
    hoveredRoot = root;
    renderer.domElement.style.cursor = 'pointer';

    if (root.userData.type === 'book') {
      const b = root.userData.data;
      if (activeItemId === b.id) {
        const role = hitObj.userData.pageRole;
        const ud = root.userData;
        const hotspot = role === 'right' ? findRightPageHotspot(root, hits[0]) : null;
        if (hotspot) {
          tooltipEl.innerHTML = `<strong>${hotspot.icon} ${hotspot.name}</strong><span>${hotspot.isExternal ? '点击直接打开外部链接 ↗' : '点击直接下载该资料 ↓'}</span>`;
        } else if (role === 'right' && ud.spreadIndex < ud.spreads.length - 1) {
          tooltipEl.innerHTML = `<strong>${b.shortName}</strong><span>点击翻到下一页 →</span>`;
        } else if (role === 'left' && ud.spreadIndex > 0) {
          tooltipEl.innerHTML = `<strong>${b.shortName}</strong><span>← 点击翻回上一页</span>`;
        } else {
          tooltipEl.innerHTML = `<strong>${b.title}</strong><span>点击资料卡片下载 · 按 ESC 或点击空白处合上</span>`;
        }
      } else {
        tooltipEl.innerHTML = `<strong>${b.title}</strong><span>${b.scoreBadge} · 点击展开翻阅</span>`;
      }
    } else if (root.userData.type === 'lamp') {
      tooltipEl.innerHTML = `<strong>💡 设计师台灯</strong><span>点击切换舞台聚光 / 秋日柔光</span>`;
    } else if (root.userData.type === 'profile') {
      tooltipEl.innerHTML = `<strong>🏆 419 初试成绩单</strong><span>个人情况 · 择校 · 省钱技巧</span>`;
    } else if (root.userData.type === 'coffee') {
      tooltipEl.innerHTML = `<strong>☕ 热美式咖啡</strong><span>点击喝一口，休息一下</span>`;
    } else if (root.userData.type === 'penholder') {
      tooltipEl.innerHTML = `<strong>✏️ 考研笔筒</strong><span>点击开始专注学习！</span>`;
    } else if (root.userData.type === 'sticky') {
      tooltipEl.innerHTML = `<strong>📝 励志便利贴</strong><span>点击抽取一条暖心鼓励语录</span>`;
    } else if (root.userData.type === 'plant') {
      tooltipEl.innerHTML = `<strong>🌱 桌面小多肉</strong><span>点击给备考打个气</span>`;
    }
    tooltipEl.style.left = `${event.clientX + 16}px`;
    tooltipEl.style.top = `${event.clientY - 12}px`;
    tooltipEl.classList.add('visible');
  } else {
    hoveredRoot = null;
    renderer.domElement.style.cursor = 'grab';
    tooltipEl.classList.remove('visible');
  }
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  markInteractive();
  if (event.button !== 0) return;
  pointerDownPos = { x: event.clientX, y: event.clientY };
  camAnim = null;
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const dx = event.clientX - pointerDownPos.x;
  const dy = event.clientY - pointerDownPos.y;
  const dragLimit = event.pointerType === 'touch' ? 18 : 12;
  if (Math.hypot(dx, dy) > dragLimit) return;

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(getRaycastTargets(), false);

  if (hits.length === 0) {
    // Clicking empty stage/desk closes the currently open book smoothly!
    if (activeItemId && activeItemId !== 'profile') {
      closeActiveItem(true);
    }
    return;
  }

  const hitObj = hits[0].object;
  const root = hitObj.userData.interactiveRoot;
  if (root.userData.type === 'book') {
    if (activeItemId === root.userData.id) {
      // Check exact UV hit on right-page resource cards first; otherwise flip page!
      const role = hitObj.userData.pageRole;
      if (role === 'right') {
        const hotspot = findRightPageHotspot(root, hits[0]);
        if (hotspot) {
          triggerResourceHotspot(hotspot);
        } else {
          flipBookPage(root.userData.id, 1);
        }
      } else if (role === 'left') {
        flipBookPage(root.userData.id, -1);
      }
    } else {
      openBook(root.userData.data);
    }
  } else if (root.userData.type === 'lamp') {
    isLampOn = !isLampOn;
    deskSound.playLampSwitch(isLampOn);
    updateLightingMode();
  } else if (root.userData.type === 'profile') {
    deskSound.playStickyNote();
    openProfile();
  } else if (root.userData.type === 'coffee') {
    if (mugGroup.userData.sipProgress < 0) {
      mugGroup.userData.sipProgress = 0;
      mugGroup.userData.sipsTaken += 1;
      deskSound.playCoffeeSip();
      takeCoffeeRest();
      const sips = mugGroup.userData.sipsTaken;
      const coffeeLines = [
        '☕ 喝一口热咖啡，闭眼休息 5 分钟，劳逸结合才能走得更远。',
        '☕ 抿一口咖啡提提神，伸个懒腰，放空大脑一分钟吧～',
        '☕ 备考是一场马拉松，偶尔停下来喘口气，不是偷懒，是在蓄力。',
        '☕ 辛苦啦！先放下手中的题，喝口热饮照顾好自己。',
        '☕ 哪怕进度慢一点也没关系，保持好状态才是最重要的事。',
        '☕ 抬头看看远方，揉揉眼睛，让紧绷的神经松一松。',
        '☕ 咖啡很香，今天的你也很棒，休息一会儿再继续出发！',
        '☕ 累了就歇歇，大脑整理记忆也需要一点留白的时间。',
        '☕ 允许自己偶尔感到疲惫，充完电我们依然元气满满！',
        '☕ 这一口敬正在认真努力的自己，你已经做得很好了。',
        '☕ 别太苛责自己啦，喝完这口热咖啡，调整呼吸重新出发。',
        '☕ 温柔地对待自己，好心情会带来事半功倍的复习效率。',
        '☕ 窗外风很轻，杯里咖啡很暖，放轻松，一切都在慢慢变好。',
        '☕ 休息结束就是新的起点，愿你始终眼里有光、脚下有力！'
      ];
      if (sips % 4 === 0) {
        showEasterToast('☕ 咖啡喝完自动续杯满上！歇够了就满血复活，继续稳稳前行！');
      } else {
        showEasterToast(coffeeLines[Math.floor(Math.random() * coffeeLines.length)]);
      }
    }
  } else if (root.userData.type === 'penholder') {
    penHolderGroup.userData.shakeTime = 1.0;
    deskSound.playPenRattle();
    startStudying();
    const studyLines = [
      '✏️ 笔已就位，进入专注模式！先把眼前这一小节吃透吧！',
      '✏️ 动笔就是最好的开始，今天也要踏踏实实向前迈进一小步！',
      '✏️ 专注计时已开启！心无旁骛，把每一分钟都变成底气！',
      '✏️ 刷题不怕错，每发现一个漏洞，考场上就多一份把握！',
      '✏️ 翻开书本，沉下心来，时间会忠实记录你的每一份付出。',
      '✏️ 别去想终点还有多远，先把今天计划里的第一件事做好！',
      '✏️ 好记性不如烂笔头，整理清楚一个知识点就是一次升级！',
      '✏️ 保持自己的节奏，不慌不忙，你正在变得越来越强。',
      '✏️ 每一次静下心来啃硬骨头，都是在悄悄拉开差距。',
      '✏️ 笔杆热身完毕！愿你思路如泉涌，下笔如有神！',
      '✏️ 今天也请为自己的梦想认真写下几页笔记吧！',
      '✏️ 把焦虑换成行动，多看一页书，心里就多一分踏实。',
      '✏️ 专注当下的这一题、这一章，未来的你会感谢现在的自己。',
      '✏️ 稳住心态，火力全开，祝你今天的复习效率拉满！'
    ];
    showEasterToast(studyLines[Math.floor(Math.random() * studyLines.length)]);
  } else if (root.userData.type === 'sticky') {
    stickyGroup.userData.bounceTime = 1.0;
    deskSound.playStickyNote();
    const stickyQuotes = [
      '📝 「星光不问赶路人，时光不负有心人。」',
      '📝 「所有看似不起波澜的日复一日，都会在某一天让你看到坚持的意义。」',
      '📝 「乾坤未定，你我皆是黑马！」',
      '📝 「怕什么真理无穷，进一寸有一寸的欢喜。」',
      '📝 「慢慢来，谁不是翻山越岭去见更好的自己。」',
      '📝 「你所熬过的每一个安静的夜晚，终会化作考场上的从容不迫。」',
      '📝 「不要因为走得慢而焦虑，只要方向对了，每一步都算数。」',
      '📝 「追风赶月莫停留，平芜尽处是春山。」',
      '📝 「今天的每一滴汗水，都是明天录取通知书上的闪光点。」',
      '📝 「把大目标拆成今天的小任务，一步一个脚印就能走到山顶。」',
      '📝 「关关难过关关过，前路漫漫亦灿灿。」',
      '📝 「沉住气，静下心，你比自己想象中更有韧性。」',
      '📝 「真正的逆袭，从来都藏在无人问津的坚持里。」',
      '📝 「祝你合上笔盖的那一刻，有着侠客收剑入鞘的骄傲！」',
      '📝 「保持热爱，奔赴山海，愿你终能抵达心之所向！」'
    ];
    const idx = stickyGroup.userData.quoteIndex % stickyQuotes.length;
    stickyGroup.userData.quoteIndex += 1;
    showEasterToast(stickyQuotes[idx], 3800);
  } else if (root.userData.type === 'plant') {
    plantGroup.userData.wiggleTime = 1.0;
    deskSound.playPlantPop();
    const plantLines = [
      '🌱 小多肉为你打气：像植物一样向下扎根，总有一天会向阳生长！',
      '🌱 看看这抹绿色放松一下眼睛吧，今天也在悄悄长大呢！',
      '🌱 不必着急开花，把根扎稳，春天到了自然会枝繁叶茂。',
      '🌱 桌角的小绿植陪着你呢，备考的路上你并不孤单！',
      '🌱 每天吸收一点点阳光和知识，日积月累就会迎来蜕变。',
      '🌱 深呼吸一口气，愿你心里始终留有一片安静的绿洲。',
      '🌱 风吹不倒小嫩芽，难题也难不倒认真努力的你！',
      '🌱 给小多肉点个赞，也给坚持到今天的自己点个赞！',
      '🌱 慢慢沉淀，悄悄拔尖，然后惊艳所有人！',
      '🌱 愿你的备考时光，既有拼搏的汗水，也有温柔的小确幸。',
      '🌱 每一份默默的耕耘，都在等待破土而出的那一刻！',
      '🌱 稳住心态，保持生机，祝你一路繁花、一战成硕！'
    ];
    showEasterToast(plantLines[Math.floor(Math.random() * plantLines.length)]);
  }
});

// ===== Responsive Resize & Orientation Auto-Adapt =====
function handleViewportResize() {
  viewportPreset = getResponsivePreset();
  DEFAULT_CAM_POS.copy(viewportPreset.defaultCamPos);
  DEFAULT_TARGET.copy(viewportPreset.defaultTarget);
  HERO_SCALE = viewportPreset.heroScale;
  HERO_CAM_POS.copy(viewportPreset.heroCamPos);
  HERO_CAM_TARGET.copy(viewportPreset.heroCamTarget);
  controls.maxDistance = viewportPreset.maxDistance;
  scene.fog.density = viewportPreset.fogDensity;

  camera.fov = viewportPreset.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, viewportPreset.isMobile ? 1.75 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (!activeItemId) {
    animateCameraTo(DEFAULT_CAM_POS, DEFAULT_TARGET, 320);
  } else if (activeItemId !== 'profile') {
    animateCameraTo(HERO_CAM_POS, HERO_CAM_TARGET, 320);
  }
}

window.addEventListener('resize', handleViewportResize);
window.addEventListener('orientationchange', () => setTimeout(handleViewportResize, 120));

// ===== Helpers =====
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ===== Adaptive Power-Saving Animation Loop (60fps when interacting, 30fps calm, 0fps when tab hidden) =====
const clock = new THREE.Clock();
let lastRenderAt = 0;

function isSceneActivelyAnimating() {
  if (camAnim) return true;
  if (penHolderGroup.userData.shakeTime > 0 || mugGroup.userData.sipProgress >= 0) return true;
  if (stickyGroup.userData.bounceTime > 0 || plantGroup.userData.wiggleTime > 0) return true;
  for (const g of bookGroups.values()) {
    const st = g.userData.animState;
    if (st === 'opening' || st === 'closing' || g.userData.flipAnim) return true;
  }
  return false;
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);

  // Zero GPU usage when browser tab is in the background!
  if (document.hidden) {
    clock.getDelta();
    return;
  }

  // Adaptive frame pacing: full 60fps during active interaction/animations, smooth 30fps when calm
  const isHot = isSceneActivelyAnimating() || (now - lastInteractionAt < 1400);
  const minFrameMs = isHot ? 14 : 32;
  if (now - lastRenderAt < minFrameMs) return;
  lastRenderAt = now;

  const dt = Math.min(clock.getDelta(), 0.06);
  const elapsed = clock.getElapsedTime();

  // Smooth camera transition
  if (camAnim) {
    const t = Math.min(1, (performance.now() - camAnim.startTime) / camAnim.duration);
    const ease = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease);
    controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease);
    if (t >= 1) camAnim = null;
  }

  // Animate all 7 books (Lift + Scale + Unfold / Fold + Return + 3D Page Flip)
  let anyBookOpen = 0;
  bookGroups.forEach((group) => {
    const ud = group.userData;
    const speed = ud.animState === 'opening' ? 1.4 : 1.65;

    if (ud.animState === 'opening') {
      ud.openProgress = Math.min(1, ud.openProgress + dt * speed);
      if (ud.openProgress >= 1) ud.animState = 'open';
    } else if (ud.animState === 'closing') {
      ud.openProgress = Math.max(0, ud.openProgress - dt * speed);
      if (ud.openProgress <= 0) ud.animState = 'closed';
    }

    const p = ud.openProgress;
    anyBookOpen = Math.max(anyBookOpen, p);

    if (p > 0.0001) {
      const moveT = smoothstep(0.0, 0.56, p);
      const openT = smoothstep(0.38, 1.0, p);

      const heroPos = getHeroPosForBook(group);
      const arcLift = Math.sin(moveT * Math.PI) * 0.34;
      const floatBob = p >= 0.99 ? Math.sin(elapsed * 1.6) * 0.014 : 0;

      group.position.lerpVectors(ud.homePos, heroPos, moveT);
      group.position.y += arcLift + floatBob;

      const s = THREE.MathUtils.lerp(1.0, HERO_SCALE, moveT);
      group.scale.setScalar(s);

      group.rotation.x = THREE.MathUtils.lerp(ud.homeRot.x, HERO_BOOK_ROT.x, moveT);
      group.rotation.y = THREE.MathUtils.lerp(ud.homeRot.y, HERO_BOOK_ROT.y, moveT);
      group.rotation.z = THREE.MathUtils.lerp(ud.homeRot.z, HERO_BOOK_ROT.z, moveT);

      // Unfold front cover ~170° around spine for crisp flat reading
      ud.coverPivot.rotation.z = openT * 2.96;

      // 3D Page-Flip Animation when user turns pages!
      if (ud.flipAnim) {
        ud.flipAnim.progress = Math.min(1, ud.flipAnim.progress + dt * 2.35);
        const ft = smoothstep(0, 1, ud.flipAnim.progress);
        ud.leafPivot.rotation.z = ud.flipAnim.dir > 0 ? ft * 2.94 : (1 - ft) * 2.94;

        if (ud.flipAnim.progress >= 1) {
          ud.spreadIndex = ud.flipAnim.targetSpread;
          ud.leftPageMat.map = ud.spreads[ud.spreadIndex].left;
          ud.rightPageTopMat.map = ud.spreads[ud.spreadIndex].right;
          ud.leftPageMat.needsUpdate = true;
          ud.rightPageTopMat.needsUpdate = true;
          ud.leafPivot.visible = false;
          ud.flipAnim = null;
        }
      }
    } else {
      const isHovered = hoveredRoot === group;
      const targetY = ud.homePos.y + (isHovered ? 0.11 : 0);
      const targetRotX = isHovered ? 0.06 : 0;

      group.position.x += (ud.homePos.x - group.position.x) * 0.18;
      group.position.y += (targetY - group.position.y) * 0.16;
      group.position.z += (ud.homePos.z - group.position.z) * 0.18;
      group.scale.setScalar(1.0);
      group.rotation.x += (targetRotX - group.rotation.x) * 0.16;
      group.rotation.y += (ud.homeRot.y - group.rotation.y) * 0.16;
      group.rotation.z += (0 - group.rotation.z) * 0.16;
      ud.coverPivot.rotation.z = 0;
      ud.leafPivot.visible = false;
    }
  });

  // Softly illuminate the open hero book pages (balanced so ink stays crisp without washing out!)
  readerLight.intensity = anyBookOpen * (isLampOn ? 2.2 : 0.8);

  // Score stand hover lift
  const standTargetY = hoveredRoot === scoreStandGroup || activeItemId === 'profile' ? 0.06 : 0;
  scoreStandGroup.position.y += (standTargetY - scoreStandGroup.position.y) * 0.14;

  // ===== Easter-Egg Prop Animations =====
  // 1. Pen holder rattle & lively pen bounce ("开始学习")
  if (penHolderGroup.userData.shakeTime > 0) {
    penHolderGroup.userData.shakeTime = Math.max(0, penHolderGroup.userData.shakeTime - dt * 1.15);
    const t = penHolderGroup.userData.shakeTime;
    const decay = t * t;
    penHolderGroup.rotation.z = Math.sin(elapsed * 38) * 0.045 * decay;
    penItems.forEach((item) => {
      const ud = item.userData;
      const bounce = Math.abs(Math.sin(elapsed * 18 + ud.phase)) * 0.14 * decay;
      item.position.y = ud.homeY + bounce;
      item.rotation.x = ud.homeRx + Math.sin(elapsed * 24 + ud.phase) * 0.13 * decay;
      item.rotation.z = ud.homeRz + Math.cos(elapsed * 22 + ud.phase) * 0.13 * decay;
    });
  } else {
    penHolderGroup.rotation.z *= 0.85;
    penItems.forEach((item) => {
      const ud = item.userData;
      item.position.y += (ud.homeY - item.position.y) * 0.2;
      item.rotation.x += (ud.homeRx - item.rotation.x) * 0.2;
      item.rotation.z += (ud.homeRz - item.rotation.z) * 0.2;
    });
  }

  // 2. Coffee mug lift, tilt to sip, coffee level drop/refill, set back down ("喝咖啡休息一下")
  if (mugGroup.userData.sipProgress >= 0) {
    mugGroup.userData.sipProgress += dt * 0.62;
    const sp = mugGroup.userData.sipProgress;
    if (sp >= 1) {
      mugGroup.userData.sipProgress = -1;
      mugCupGroup.position.set(0, 0, 0);
      mugCupGroup.rotation.set(0, 0, 0);
    } else {
      const lift = Math.sin(sp * Math.PI);
      const tilt = sp > 0.28 && sp < 0.72 ? Math.sin(((sp - 0.28) / 0.44) * Math.PI) : 0;
      mugCupGroup.position.set(-0.08 * lift, 0.56 * lift, 0.22 * lift);
      mugCupGroup.rotation.x = 0.42 * tilt;
      mugCupGroup.rotation.z = 0.18 * tilt;

      // Update coffee liquid level smoothly during sip (4 sips = auto refill!)
      const levelIndex = mugGroup.userData.sipsTaken % 4;
      const targetLiquidY = levelIndex === 0 ? 0.415 : 0.415 - levelIndex * 0.048;
      coffeeLiquid.position.y += (targetLiquidY - coffeeLiquid.position.y) * 0.12;
    }
  }

  // 3. Sticky notes gentle flutter
  if (stickyGroup.userData.bounceTime > 0) {
    stickyGroup.userData.bounceTime = Math.max(0, stickyGroup.userData.bounceTime - dt * 1.8);
    const bt = stickyGroup.userData.bounceTime;
    stickyGroup.position.y = 0.015 + Math.sin(bt * Math.PI) * 0.08;
    stickyGroup.rotation.z = Math.sin(bt * Math.PI * 3) * 0.05 * bt;
  } else {
    stickyGroup.position.y = 0.015;
    stickyGroup.rotation.z = 0;
  }

  // 4. Succulent cheerful squash-and-stretch wiggle
  if (plantGroup.userData.wiggleTime > 0) {
    plantGroup.userData.wiggleTime = Math.max(0, plantGroup.userData.wiggleTime - dt * 1.6);
    const wt = plantGroup.userData.wiggleTime;
    const squash = Math.sin(wt * Math.PI * 4) * 0.10 * wt;
    plantGroup.scale.set(1 + squash, 1 - squash * 1.2, 1 + squash);
  } else {
    plantGroup.scale.set(1, 1, 1);
  }

  // Coffee steam animation
  steamPuffs.forEach((puff) => {
    const cycle = (elapsed * 0.55 + puff.userData.phase) % 1;
    puff.position.set(
      Math.sin(elapsed * 1.4 + puff.userData.phase) * 0.04,
      0.47 + cycle * 0.42,
      Math.cos(elapsed * 1.1 + puff.userData.phase) * 0.03
    );
    const scale = 0.6 + cycle * 1.15;
    puff.scale.setScalar(scale);
    const sipBoost = mugGroup.userData.sipProgress >= 0 ? 1.5 : 1.0;
    puff.material.opacity = Math.sin(cycle * Math.PI) * (isLampOn ? 0.16 : 0.1) * sipBoost;
  });

  // Gentle drift for warm dust motes in the stage beam
  dustMotes.rotation.y = elapsed * 0.018;
  dustMotes.position.y = Math.sin(elapsed * 0.5) * 0.04;

  // Update library environment (outside autumn trees breeze + studying students)
  libraryEnv.update(elapsed);

  controls.update();
  renderer.render(scene, camera);
}

updateLightingMode();
animate();
requestAnimationFrame(() => {
  loadingEl.classList.add('hidden');
});
