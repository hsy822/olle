// ============================================================
// OLLE JAPU — Cinematic Three.js + Sound Experience
// Woven straw texture · Navy blue edge · Rain physics
// Web Audio ambient · Post-processing
// ============================================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ============================================================
// CONFIG
// ============================================================

const IS_MOBILE = window.innerWidth <= 768;
const DPR = Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2);

const RAIN_COUNT = IS_MOBILE ? 600 : 1800;
const SPLASH_MAX = IS_MOBILE ? 80 : 250;
const DUST_COUNT = IS_MOBILE ? 200 : 600;
const CUSHION_RADIUS = 3.0;
const CUSHION_Y = 0;

const ACTS = {
  hero:         { start: 0.00, end: 0.14 },
  problem:      { start: 0.14, end: 0.28 },
  waterproof:   { start: 0.28, end: 0.46 },
  construction: { start: 0.46, end: 0.64 },
  weight:       { start: 0.64, end: 0.80 },
  preorder:     { start: 0.80, end: 1.00 },
};

const CAM_KEYS = [
  [0, 3, 11, 0, 0, 0],
  [6, 4, 9, 0, 0, 0],
  [2, 10, 7, 0, 0, 0],
  [9, 4, 6, 0, 0.8, 0],
  [0, 1.5, 13, 0, 0, 0],
  [-4, 3, 9, 2, 0, 0],
];

// ============================================================
// RENDERER + SCENE + CAMERA
// ============================================================

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.shadowMap.enabled = !IS_MOBILE;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a6888);
scene.fog = new THREE.FogExp2(0x6699aa, 0.006);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 3, 11);

// ============================================================
// POST-PROCESSING
// ============================================================

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  IS_MOBILE ? 0.2 : 0.35, 0.4, 0.88
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ============================================================
// LIGHTING
// ============================================================

const ambientLight = new THREE.AmbientLight(0x88aacc, 2.5);
scene.add(ambientLight);

const keyLight = new THREE.SpotLight(0xffeebb, 80, 50, Math.PI / 4, 0.5, 1.2);
keyLight.position.set(3, 14, 8);
keyLight.target.position.set(0, 0, 0);
if (!IS_MOBILE) {
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.001;
}
scene.add(keyLight);
scene.add(keyLight.target);

const rimLight = new THREE.PointLight(0x44bbcc, 12, 35, 2);
rimLight.position.set(-5, 4, -5);
scene.add(rimLight);

const warmLight = new THREE.PointLight(0xee9944, 12, 30, 2);
warmLight.position.set(6, 2, 4);
scene.add(warmLight);

const fillLight = new THREE.PointLight(0x556644, 4, 25, 2);
fillLight.position.set(0, -2, 6);
scene.add(fillLight);

// Hemisphere light for natural outdoor feel (sky blue ↔ earth green)
const hemiLight = new THREE.HemisphereLight(0x88bbdd, 0x556633, 2.0);
scene.add(hemiLight);

// ============================================================
// GROUND (volcanic basalt)
// ============================================================

function createBasaltTexture(size) {
  size = size || 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  // Lighter basalt base
  ctx.fillStyle = '#2e2e30';
  ctx.fillRect(0, 0, size, size);
  // Stone pores
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 2.5 + 0.3;
    const l = 14 + Math.random() * 20;
    ctx.fillStyle = `hsl(${200 + Math.random() * 20}, ${4 + Math.random() * 8}%, ${l}%)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Green moss patches (제주 이끼)
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 4 + 1;
    const h = 100 + Math.random() * 40;
    const s = 25 + Math.random() * 30;
    const l = 18 + Math.random() * 18;
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

const groundGeo = new THREE.CircleGeometry(35, 64);
const basaltTex = createBasaltTexture();
const groundMat = new THREE.MeshStandardMaterial({
  map: basaltTex,
  color: 0x3a3a3e,
  roughness: 0.88,
  metalness: 0.02,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.55;
ground.receiveShadow = true;
scene.add(ground);

// ============================================================
// SKY DOME (Jeju bright daytime)
// ============================================================

const skyGeo = new THREE.SphereGeometry(85, 32, 32);
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 64;
skyCanvas.height = 512;
const skyCtx = skyCanvas.getContext('2d');
const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
skyGrad.addColorStop(0, '#1a5580');
skyGrad.addColorStop(0.12, '#2a78aa');
skyGrad.addColorStop(0.28, '#44a0cc');
skyGrad.addColorStop(0.42, '#66c0dd');
skyGrad.addColorStop(0.52, '#88ddee');
skyGrad.addColorStop(0.58, '#bbeecc');
skyGrad.addColorStop(0.63, '#eebb77');
skyGrad.addColorStop(0.67, '#ddaa55');
skyGrad.addColorStop(0.72, '#558866');
skyGrad.addColorStop(0.82, '#2a5544');
skyGrad.addColorStop(1, '#1a3535');
skyCtx.fillStyle = skyGrad;
skyCtx.fillRect(0, 0, 64, 512);
const skyTex = new THREE.CanvasTexture(skyCanvas);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyTex,
  side: THREE.BackSide,
  fog: false,
});
const skyDome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyDome);

// ============================================================
// TEXTURES — Canvas-generated
// ============================================================

/** Basket weave / woven straw texture (야자매트 촉감) */
function createWovenTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#b89050';
  ctx.fillRect(0, 0, size, size);

  const block = 20;
  const strands = 4;
  const sw = block / strands;

  for (let by = 0; by < Math.ceil(size / block); by++) {
    for (let bx = 0; bx < Math.ceil(size / block); bx++) {
      const x0 = bx * block;
      const y0 = by * block;
      const horiz = (bx + by) % 2 === 0;

      for (let s = 0; s < strands; s++) {
        const h = 33 + Math.random() * 6;
        const sat = 46 + Math.random() * 18;
        const lig = 56 + Math.random() * 16;
        ctx.fillStyle = `hsl(${h}, ${sat}%, ${lig}%)`;

        if (horiz) {
          ctx.fillRect(x0, y0 + s * sw + 0.4, block, sw - 0.8);
          ctx.fillStyle = `rgba(255,225,170,${0.06 + Math.random() * 0.06})`;
          ctx.fillRect(x0, y0 + s * sw + 0.4, block, 1);
        } else {
          ctx.fillRect(x0 + s * sw + 0.4, y0, sw - 0.8, block);
          ctx.fillStyle = `rgba(255,225,170,${0.06 + Math.random() * 0.06})`;
          ctx.fillRect(x0 + s * sw + 0.4, y0, 1, block);
        }
      }

      ctx.fillStyle = 'rgba(60,30,10,0.1)';
      ctx.fillRect(x0, y0, block, 0.5);
      ctx.fillRect(x0, y0, 0.5, block);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

/** Woven bump map */
function createWovenBump(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const block = 20;
  const strands = 4;
  const sw = block / strands;

  for (let by = 0; by < Math.ceil(size / block); by++) {
    for (let bx = 0; bx < Math.ceil(size / block); bx++) {
      const x0 = bx * block;
      const y0 = by * block;
      const horiz = (bx + by) % 2 === 0;
      const val = horiz ? '#aaaaaa' : '#666666';

      for (let s = 0; s < strands; s++) {
        ctx.fillStyle = val;
        if (horiz) {
          ctx.fillRect(x0, y0 + s * sw + 0.4, block, sw - 0.8);
        } else {
          ctx.fillRect(x0 + s * sw + 0.4, y0, sw - 0.8, block);
        }
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

/** Logo texture (blue circle + white geometric icon) */
function createLogoTexture(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.43;

  ctx.clearRect(0, 0, size, size);

  // Blue circle
  ctx.fillStyle = '#4da8cf';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#3890b0';
  ctx.lineWidth = size * 0.012;
  ctx.stroke();

  // Chair/seat icon (minimalist geometric)
  const lw = size * 0.032;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  const u = size * 0.1;

  // Top bar
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.8, cy - u * 1.4);
  ctx.lineTo(cx + u * 0.8, cy - u * 1.4);
  ctx.stroke();

  // Left vertical full
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.8, cy - u * 1.4);
  ctx.lineTo(cx - u * 0.8, cy + u * 1.4);
  ctx.stroke();

  // Right vertical from top to middle
  ctx.beginPath();
  ctx.moveTo(cx + u * 0.8, cy - u * 1.4);
  ctx.lineTo(cx + u * 0.8, cy + u * 0.2);
  ctx.stroke();

  // Middle horizontal
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.8, cy + u * 0.2);
  ctx.lineTo(cx + u * 0.8, cy + u * 0.2);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(cx + u * 0.8, cy + u * 0.2);
  ctx.lineTo(cx + u * 0.8, cy + u * 1.4);
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

// ============================================================
// CUSHION MODEL
// ============================================================

const cushionGroup = new THREE.Group();
scene.add(cushionGroup);

function createRoundedDisc(radius, height, edgeR) {
  const pts = [];
  const half = height / 2;
  const e = Math.min(edgeR, half, 0.18);
  pts.push(new THREE.Vector2(0, -half));
  pts.push(new THREE.Vector2(radius - e, -half));
  for (let i = 0; i <= 6; i++) {
    const a = (Math.PI / 2) * (1 - i / 6);
    pts.push(new THREE.Vector2(radius - e + Math.sin(a) * e, -half + e - Math.cos(a) * e));
  }
  for (let i = 0; i <= 6; i++) {
    const a = (Math.PI / 2) * (i / 6);
    pts.push(new THREE.Vector2(radius - e + Math.cos(a) * e, half - e + Math.sin(a) * e));
  }
  pts.push(new THREE.Vector2(radius - e, half));
  pts.push(new THREE.Vector2(radius * 0.6, half + 0.015));
  pts.push(new THREE.Vector2(0, half + 0.02));
  return new THREE.LatheGeometry(pts, 64);
}

// --- Top layer (woven straw cover) ---
const wovenTex = createWovenTexture();
const wovenBump = createWovenBump();

const topGeo = createRoundedDisc(CUSHION_RADIUS, 0.12, 0.05);
const topMat = new THREE.MeshPhysicalMaterial({
  map: wovenTex,
  bumpMap: wovenBump,
  bumpScale: 0.15,
  color: 0xc4a060,
  roughness: 0.7,
  metalness: 0.0,
  clearcoat: 0.15,
  clearcoatRoughness: 0.6,
});
const topLayer = new THREE.Mesh(topGeo, topMat);
topLayer.position.y = 0.26;
topLayer.castShadow = true;
cushionGroup.add(topLayer);

// Logo disc on top center
const logoGeo = new THREE.CircleGeometry(0.75, 48);
const logoTex = createLogoTexture();
const logoMat = new THREE.MeshPhysicalMaterial({
  map: logoTex,
  transparent: true,
  roughness: 0.35,
  metalness: 0.0,
  clearcoat: 0.3,
});
const logoMesh = new THREE.Mesh(logoGeo, logoMat);
logoMesh.rotation.x = -Math.PI / 2;
logoMesh.position.y = 0.07;
topLayer.add(logoMesh);

// Stitching lines near logo
const stitchMat = new THREE.MeshBasicMaterial({
  color: 0x1e3a5f,
  transparent: true,
  opacity: 0.4,
});
[2.1, 1.1].forEach(r => {
  const sg = new THREE.TorusGeometry(r, 0.012, 8, 64);
  const sm = new THREE.Mesh(sg, stitchMat);
  sm.rotation.x = Math.PI / 2;
  sm.position.y = 0.065;
  topLayer.add(sm);
});

// --- Middle layer (EVA foam) ---
const midGeo = createRoundedDisc(CUSHION_RADIUS - 0.08, 0.38, 0.03);
const midMat = new THREE.MeshPhysicalMaterial({
  color: 0xe8ddd0,
  roughness: 0.9,
  metalness: 0.0,
});
const midLayer = new THREE.Mesh(midGeo, midMat);
midLayer.position.y = 0.0;
midLayer.castShadow = true;
cushionGroup.add(midLayer);

// --- Bottom layer (PE base) ---
const botGeo = createRoundedDisc(CUSHION_RADIUS, 0.14, 0.04);
const botMat = new THREE.MeshPhysicalMaterial({
  color: 0x22222e,
  roughness: 0.3,
  metalness: 0.1,
  clearcoat: 0.2,
});
const botLayer = new THREE.Mesh(botGeo, botMat);
botLayer.position.y = -0.26;
botLayer.castShadow = true;
cushionGroup.add(botLayer);

// --- Navy blue edge ring ---
const edgeGeo = new THREE.CylinderGeometry(
  CUSHION_RADIUS + 0.02, CUSHION_RADIUS + 0.02,
  0.58, 64, 1, true
);
const edgeMat = new THREE.MeshPhysicalMaterial({
  color: 0x1e3a5f,
  roughness: 0.55,
  metalness: 0.05,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 1,
});
const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
edgeMesh.position.y = 0;
cushionGroup.add(edgeMesh);

// Zipper line on edge
const zipGeo = new THREE.TorusGeometry(CUSHION_RADIUS + 0.03, 0.012, 6, 64);
const zipMat = new THREE.MeshPhysicalMaterial({
  color: 0x0e2540,
  metalness: 0.8,
  roughness: 0.15,
});
const zipMesh = new THREE.Mesh(zipGeo, zipMat);
zipMesh.rotation.x = Math.PI / 2;
zipMesh.position.y = 0;
cushionGroup.add(zipMesh);

// Top/Bottom navy caps (visible before explosion)
const capGeo = new THREE.RingGeometry(CUSHION_RADIUS - 0.06, CUSHION_RADIUS + 0.02, 64);
const topCap = new THREE.Mesh(capGeo, new THREE.MeshPhysicalMaterial({
  color: 0x1e3a5f, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide,
  transparent: true, opacity: 1,
}));
topCap.rotation.x = -Math.PI / 2;
topCap.position.y = 0.29;
cushionGroup.add(topCap);

const botCap = new THREE.Mesh(capGeo.clone(), topCap.material.clone());
botCap.rotation.x = Math.PI / 2;
botCap.position.y = -0.29;
cushionGroup.add(botCap);

// --- Blue carabiner clip ---
const clipGroup = new THREE.Group();
const clipGeo = new THREE.TorusGeometry(0.28, 0.04, 10, 28, Math.PI * 1.6);
const clipMat = new THREE.MeshPhysicalMaterial({
  color: 0x2a6090,
  metalness: 0.85,
  roughness: 0.12,
});
const clipMesh = new THREE.Mesh(clipGeo, clipMat);
clipGroup.add(clipMesh);

// Gate bar
const gateGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8);
const gateMesh = new THREE.Mesh(gateGeo, clipMat.clone());
gateMesh.position.set(0.22, 0, 0);
gateMesh.rotation.z = Math.PI * 0.12;
clipGroup.add(gateMesh);

// Webbing tab
const tabGeo = new THREE.BoxGeometry(0.25, 0.06, 0.5);
const tabMat = new THREE.MeshPhysicalMaterial({ color: 0x1e3a5f, roughness: 0.5 });
const tabMesh = new THREE.Mesh(tabGeo, tabMat);
tabMesh.position.set(0, 0, -CUSHION_RADIUS + 0.12);
cushionGroup.add(tabMesh);

clipGroup.position.set(0, 0.4, -CUSHION_RADIUS + 0.12);
clipGroup.rotation.x = Math.PI / 2;
clipGroup.rotation.z = Math.PI * 0.3;
cushionGroup.add(clipGroup);

// Layer positions
const LAYER_REST = { top: 0.26, mid: 0.0, bot: -0.26 };
const LAYER_EXPLODE = { top: 2.2, mid: 0.0, bot: -2.2 };

// ============================================================
// RAIN SYSTEM
// ============================================================

const rainPositions = new Float32Array(RAIN_COUNT * 3);
const rainVelocities = new Float32Array(RAIN_COUNT * 3);
const rainAlphas = new Float32Array(RAIN_COUNT);

function resetRainDrop(i) {
  rainPositions[i * 3]     = (Math.random() - 0.5) * 18;
  rainPositions[i * 3 + 1] = Math.random() * 16 + 4;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  rainVelocities[i * 3]     = (Math.random() - 0.5) * 0.8;
  rainVelocities[i * 3 + 1] = -(Math.random() * 6 + 10);
  rainVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  rainAlphas[i] = 1.0;
}
for (let i = 0; i < RAIN_COUNT; i++) resetRainDrop(i);

const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
rainGeo.setAttribute('alpha', new THREE.BufferAttribute(rainAlphas, 1));

const rainMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    attribute float alpha;
    varying float vAlpha;
    void main() {
      vAlpha = alpha;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = max(1.0, 2.5 * (200.0 / -mv.z));
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv * vec2(2.5, 0.7));
      float a = smoothstep(0.5, 0.05, d) * vAlpha * 0.55;
      gl_FragColor = vec4(0.65, 0.78, 0.95, a);
    }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});

const rainMesh = new THREE.Points(rainGeo, rainMaterial);
rainMesh.visible = false;
scene.add(rainMesh);

// Splash particles
const splashPositions = new Float32Array(SPLASH_MAX * 3);
const splashVelocities = new Float32Array(SPLASH_MAX * 3);
const splashLifetimes = new Float32Array(SPLASH_MAX);
let splashIdx = 0;

const splashGeo = new THREE.BufferGeometry();
splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
splashGeo.setAttribute('lifetime', new THREE.BufferAttribute(splashLifetimes, 1));

const splashMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    attribute float lifetime;
    varying float vLife;
    void main() {
      vLife = lifetime;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = max(1.0, (3.0 * lifetime) * (150.0 / -mv.z));
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    varying float vLife;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d) * vLife * 0.7;
      gl_FragColor = vec4(0.8, 0.9, 1.0, a);
    }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});

const splashMesh = new THREE.Points(splashGeo, splashMaterial);
splashMesh.visible = false;
scene.add(splashMesh);

function spawnSplash(x, y, z) {
  for (let k = 0; k < 3; k++) {
    const idx = splashIdx % SPLASH_MAX;
    splashPositions[idx * 3]     = x;
    splashPositions[idx * 3 + 1] = y;
    splashPositions[idx * 3 + 2] = z;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1.5;
    splashVelocities[idx * 3]     = Math.cos(angle) * speed;
    splashVelocities[idx * 3 + 1] = Math.random() * 3 + 1;
    splashVelocities[idx * 3 + 2] = Math.sin(angle) * speed;
    splashLifetimes[idx] = 1.0;
    splashIdx++;
  }
}

// ============================================================
// ATMOSPHERE PARTICLES
// ============================================================

const dustPositions = new Float32Array(DUST_COUNT * 3);
const dustSpeeds = new Float32Array(DUST_COUNT);
for (let i = 0; i < DUST_COUNT; i++) {
  dustPositions[i * 3]     = (Math.random() - 0.5) * 50;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
  dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
  dustSpeeds[i] = Math.random() * 0.3 + 0.1;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xaa9966, size: 0.06, transparent: true, opacity: 0.3,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
});
const dustMesh = new THREE.Points(dustGeo, dustMat);
scene.add(dustMesh);

// ============================================================
// FILM GRAIN
// ============================================================

(function initGrain() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const el = document.querySelector('.grain');
  if (el) el.style.backgroundImage = `url(${c.toDataURL()})`;
})();

// ============================================================
// SOUND ENGINE (Web Audio API)
// ============================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.enabled = false;
    this.masterGain = null;
    this.rainGain = null;
    this.windGain = null;
    this.droneGain = null;
    this._lastDropTime = 0;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
    this._createDrone();
    this._createWind();
    this._createRain();
    this._createOcean();
    this.initialized = true;
  }

  /** Low ambient drone — two detuned sines + filtered harmonics */
  _createDrone() {
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.04;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 180;
    lpf.connect(this.droneGain).connect(this.masterGain);

    [55, 82.5, 110].forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.value = freq === 55 ? 0.5 : 0.2;
      osc.connect(g).connect(lpf);
      osc.start();
    });
  }

  /** Gentle wind — brown noise filtered */
  _createWind() {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * 4, sr);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 350;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.035;

    src.connect(lpf).connect(this.windGain).connect(this.masterGain);
    src.start();
  }

  /** Rain — white noise bandpass filtered */
  _createRain() {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * 2, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 3200;
    bpf.Q.value = 0.6;

    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 800;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0;

    src.connect(bpf).connect(hpf).connect(this.rainGain).connect(this.masterGain);
    src.start();
  }

  /** Ocean waves — modulated brown noise with LFO for natural rhythm */
  _createOcean() {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(2, sr * 8, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (last + 0.012 * white) / 1.012;
        last = data[i];
        data[i] *= 3;
      }
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 450;

    // LFO modulates filter freq → creates wave ebb/flow
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // ~12s wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain).connect(lpf.frequency);
    lfo.start();

    // Second LFO for stereo pan movement
    const panner = this.ctx.createStereoPanner();
    const panLfo = this.ctx.createOscillator();
    panLfo.type = 'sine';
    panLfo.frequency.value = 0.03;
    const panGain = this.ctx.createGain();
    panGain.gain.value = 0.5;
    panLfo.connect(panGain).connect(panner.pan);
    panLfo.start();

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.value = 0.06;

    src.connect(lpf).connect(panner).connect(this.oceanGain).connect(this.masterGain);
    src.start();
  }

  /** Individual raindrop plink */
  playDrop() {
    if (!this.initialized || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (now - this._lastDropTime < 0.04) return;
    this._lastDropTime = now;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500 + Math.random() * 4000, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.025, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(env).connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /** Update rain volume based on intensity 0-1 */
  setRainIntensity(intensity) {
    if (!this.initialized || !this.rainGain) return;
    const target = intensity * 0.18;
    this.rainGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
  }

  enable() {
    if (!this.initialized) this.init();
    this.ctx.resume();
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    if (this.rainGain) this.rainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    if (this.masterGain) this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.5);
      }
    }
    return this.enabled;
  }
}

const sound = new SoundEngine();

// Audio toggle button
const audioBtn = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');

audioBtn?.addEventListener('click', () => {
  const on = sound.toggle();
  audioBtn.classList.toggle('active', on);
  if (audioIcon) audioIcon.textContent = on ? '♫' : '♪';
});

// Pause on visibility change
document.addEventListener('visibilitychange', () => {
  if (!sound.ctx) return;
  if (document.hidden) {
    sound.ctx.suspend();
  } else if (sound.enabled) {
    sound.ctx.resume();
  }
});

// ============================================================
// SCROLL STATE
// ============================================================

let scrollTarget = 0;
let scrollCurrent = 0;
let scrollProgress = 0;

function getMaxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

window.addEventListener('scroll', () => {
  scrollTarget = window.scrollY / getMaxScroll();
}, { passive: true });

// ============================================================
// MOUSE STATE
// ============================================================

let mouseX = 0, mouseY = 0;
let targetMX = 0, targetMY = 0;

if (!IS_MOBILE) {
  window.addEventListener('mousemove', (e) => {
    targetMX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
}

// ============================================================
// HELPERS
// ============================================================

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function getActProgress(name) {
  const a = ACTS[name];
  return clamp((scrollProgress - a.start) / (a.end - a.start), 0, 1);
}

function getTextState(name) {
  const p = getActProgress(name);
  if (p <= 0 || p >= 1) return { opacity: 0, y: p <= 0 ? 40 : -30 };
  if (p < 0.18) return { opacity: p / 0.18, y: 40 * (1 - p / 0.18) };
  if (p > 0.82) return { opacity: (1 - p) / 0.18, y: -30 * ((p - 0.82) / 0.18) };
  return { opacity: 1, y: 0 };
}

function interpolateCamera(progress) {
  const n = CAM_KEYS.length - 1;
  const raw = progress * n;
  const idx = Math.min(Math.floor(raw), n - 1);
  const t = clamp(raw - idx, 0, 1);
  const s = t * t * (3 - 2 * t);
  const a = CAM_KEYS[idx], b = CAM_KEYS[idx + 1];
  return {
    px: lerp(a[0], b[0], s), py: lerp(a[1], b[1], s), pz: lerp(a[2], b[2], s),
    tx: lerp(a[3], b[3], s), ty: lerp(a[4], b[4], s), tz: lerp(a[5], b[5], s),
  };
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

const header = document.getElementById('site-header');
const scrollFill = document.getElementById('scroll-fill');
const scrollHint = document.getElementById('scroll-hint');
const layerLabels = document.getElementById('layer-labels');

const actElements = {
  hero: document.querySelector('#act-hero .act-content'),
  problem: document.querySelector('#act-problem .act-content'),
  waterproof: document.querySelector('#act-waterproof .act-content'),
  construction: document.querySelector('#act-construction .act-content'),
  weight: document.querySelector('#act-weight .act-content'),
};

function updateUI() {
  header?.classList.toggle('is-scrolled', scrollProgress > 0.02);
  if (scrollFill) scrollFill.style.height = (scrollProgress * 100) + '%';
  if (scrollHint) scrollHint.style.opacity = 1 - clamp(scrollProgress / 0.06, 0, 1);

  for (const [name, el] of Object.entries(actElements)) {
    if (!el) continue;
    const st = getTextState(name);
    el.style.opacity = st.opacity;
    el.style.transform = `translateY(${st.y}px)`;
    el.classList.toggle('visible', st.opacity > 0.01);
  }

  if (layerLabels) {
    const cp = getActProgress('construction');
    layerLabels.classList.toggle('visible', cp > 0.15 && cp < 0.85);
  }
}

function updateCamera() {
  const cam = interpolateCamera(scrollProgress);
  camera.position.set(cam.px + mouseX * 0.6, cam.py - mouseY * 0.3, cam.pz);
  camera.lookAt(cam.tx, cam.ty, cam.tz);
}

function updateCushion(elapsed) {
  cushionGroup.rotation.y = scrollProgress * Math.PI * 2.5 + elapsed * 0.08;
  cushionGroup.position.y = CUSHION_Y + Math.sin(elapsed * 0.6) * 0.12;

  // Layer explosion
  const cp = getActProgress('construction');
  const sep = cp < 0.5 ? clamp(cp / 0.3, 0, 1) : clamp((1 - cp) / 0.2, 0, 1);
  const eased = sep * sep * (3 - 2 * sep);

  topLayer.position.y = lerp(LAYER_REST.top, LAYER_EXPLODE.top, eased);
  midLayer.position.y = lerp(LAYER_REST.mid, LAYER_EXPLODE.mid, eased);
  botLayer.position.y = lerp(LAYER_REST.bot, LAYER_EXPLODE.bot, eased);

  // Edge fades during explosion
  edgeMesh.material.opacity = 1 - eased;
  zipMesh.visible = eased < 0.5;
  topCap.material.opacity = 1 - eased;
  botCap.material.opacity = 1 - eased;

  // Move right during preorder
  const pp = getActProgress('preorder');
  cushionGroup.position.x = lerp(0, 4, pp * pp);
}

function updateLighting(elapsed) {
  const wp = getActProgress('waterproof');
  const cp = getActProgress('construction');

  // Even during rain, keep ambient relatively bright
  const rainDark = (wp > 0 && wp < 1) ? 1.5 : 2.5;
  ambientLight.intensity = lerp(ambientLight.intensity, rainDark, 0.03);

  if (cp > 0.1 && cp < 0.9) {
    keyLight.intensity = lerp(keyLight.intensity, 90, 0.03);
    keyLight.color.lerp(new THREE.Color(0xffeedd), 0.02);
  } else if (wp > 0.1 && wp < 0.9) {
    keyLight.intensity = lerp(keyLight.intensity, 45, 0.03);
    keyLight.color.lerp(new THREE.Color(0x99aacc), 0.02);
  } else {
    keyLight.intensity = lerp(keyLight.intensity, 80, 0.03);
    keyLight.color.lerp(new THREE.Color(0xffeebb), 0.02);
  }

  rimLight.position.x = -5 + Math.sin(elapsed * 0.2) * 2;
  rimLight.position.y = 4 + Math.cos(elapsed * 0.3) * 1.5;
  warmLight.position.x = 6 + Math.sin(elapsed * 0.15) * 2;
}

function updateRain(dt) {
  const wp = getActProgress('waterproof');
  const rainActive = wp > 0.08 && wp < 0.92;
  rainMesh.visible = rainActive;
  splashMesh.visible = rainActive;

  // Sound
  const rainIntensity = rainActive ? (wp < 0.2 ? wp / 0.2 : wp > 0.8 ? (1 - wp) / 0.2 : 1) : 0;
  sound.setRainIntensity(rainIntensity);

  if (!rainActive) return;

  const cushionWorldY = cushionGroup.position.y + topLayer.position.y;
  const cushionWorldX = cushionGroup.position.x;

  let collisionCount = 0;

  for (let i = 0; i < RAIN_COUNT; i++) {
    const idx = i * 3;
    rainPositions[idx]     += rainVelocities[idx] * dt;
    rainPositions[idx + 1] += rainVelocities[idx + 1] * dt;
    rainPositions[idx + 2] += rainVelocities[idx + 2] * dt;
    rainVelocities[idx + 1] -= 12 * dt;
    rainAlphas[i] = rainIntensity;

    const dx = rainPositions[idx] - cushionWorldX;
    const dz = rainPositions[idx + 2];
    const dist2D = Math.sqrt(dx * dx + dz * dz);

    if (dist2D < CUSHION_RADIUS &&
        rainPositions[idx + 1] <= cushionWorldY + 0.5 &&
        rainPositions[idx + 1] >= cushionWorldY - 0.3 &&
        rainVelocities[idx + 1] < 0) {
      spawnSplash(rainPositions[idx], cushionWorldY + 0.4, rainPositions[idx + 2]);

      const nx = dist2D > 0.01 ? dx / dist2D : Math.random() - 0.5;
      const nz = dist2D > 0.01 ? dz / dist2D : Math.random() - 0.5;
      rainVelocities[idx]     = nx * 4 + (Math.random() - 0.5) * 2;
      rainVelocities[idx + 1] = Math.abs(rainVelocities[idx + 1]) * 0.2 + 1;
      rainVelocities[idx + 2] = nz * 4 + (Math.random() - 0.5) * 2;
      rainPositions[idx + 1] = cushionWorldY + 0.5;

      collisionCount++;
    }

    if (rainPositions[idx + 1] < -3) resetRainDrop(i);
  }

  // Play drop sounds on collisions
  if (collisionCount > 0 && Math.random() < 0.12) {
    sound.playDrop();
  }

  rainGeo.attributes.position.needsUpdate = true;
  rainGeo.attributes.alpha.needsUpdate = true;

  for (let i = 0; i < SPLASH_MAX; i++) {
    if (splashLifetimes[i] <= 0) continue;
    const idx = i * 3;
    splashPositions[idx]     += splashVelocities[idx] * dt;
    splashPositions[idx + 1] += splashVelocities[idx + 1] * dt;
    splashPositions[idx + 2] += splashVelocities[idx + 2] * dt;
    splashVelocities[idx + 1] -= 8 * dt;
    splashLifetimes[i] -= dt * 2.5;
    if (splashLifetimes[i] < 0) splashLifetimes[i] = 0;
  }

  splashGeo.attributes.position.needsUpdate = true;
  splashGeo.attributes.lifetime.needsUpdate = true;
}

function updateDust(elapsed) {
  for (let i = 0; i < DUST_COUNT; i++) {
    const idx = i * 3;
    const sp = dustSpeeds[i];
    dustPositions[idx]     += Math.sin(elapsed * sp + i) * 0.003;
    dustPositions[idx + 1] += Math.cos(elapsed * sp * 0.7 + i * 1.3) * 0.002;
    dustPositions[idx + 2] += Math.sin(elapsed * sp * 0.5 + i * 0.7) * 0.002;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dustMesh.rotation.y = elapsed * 0.005;
}

// ============================================================
// ANIMATION LOOP
// ============================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  scrollCurrent += (scrollTarget - scrollCurrent) * 0.06;
  scrollProgress = clamp(scrollCurrent, 0, 1);

  mouseX += (targetMX - mouseX) * 0.04;
  mouseY += (targetMY - mouseY) * 0.04;

  updateUI();
  updateCamera();
  updateCushion(elapsed);
  updateLighting(elapsed);
  updateRain(dt);
  updateDust(elapsed);

  composer.render();
}

animate();

// ============================================================
// RESIZE
// ============================================================

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
});

// ============================================================
// FORM
// ============================================================

const form = document.getElementById('preorder-form');
const totalDisplay = document.getElementById('total-display');
const formMessage = document.getElementById('form-message');
const qtyInput = form?.querySelector('input[name="quantity"]');
const PRICE = 28000;

function formatWon(v) { return v.toLocaleString('ko-KR') + '원'; }

function syncTotal() {
  if (!qtyInput || !totalDisplay) return;
  const q = clamp(Number(qtyInput.value) || 1, 1, 5);
  qtyInput.value = q;
  totalDisplay.textContent = formatWon(q * PRICE);
}

qtyInput?.addEventListener('input', syncTotal);

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const contact = String(fd.get('contact') || '').trim();
  const course = String(fd.get('course') || '').trim();

  if (!name || !contact || !course) {
    formMessage.textContent = '필수 정보를 모두 입력해주세요.';
    formMessage.classList.remove('success');
    return;
  }

  formMessage.textContent = `${name}님, 올레 자푸 프리오더 알림 신청이 접수되었습니다.`;
  formMessage.classList.add('success');
  form.reset();
  syncTotal();
});

syncTotal();
