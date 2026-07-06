import * as THREE from "three";

// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const HER = "Mrunal";
const SINCE = new Date("2026-05-26T00:00:00");
const stageCount = 10;

const stageText = [
  { main: HER, sub: "a love letter" },
  { main: "In the vastness of the universe…", sub: null },
  { main: "two souls found each other", sub: null },
  { main: "across impossible distances", sub: null },
  { main: "on a tiny blue planet", sub: null },
  { main: "called Earth", sub: null },
  { main: "in a country called India", sub: null },
  { main: "from Mumbai to Bihar", sub: null },
  { main: null, sub: null },
  { main: "Together Since", sub: "May 26th, 2026" },
];

// ═══════════════════════════════════════════
// THREE.JS SETUP
// ═══════════════════════════════════════════
const W = window.innerWidth, H = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.setClearColor(0x000008);
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
camera.position.set(0, 0, 80);

// ═══════════════════════════════════════════
// STARFIELD
// ═══════════════════════════════════════════
const starGeo = new THREE.BufferGeometry();
const starN = 4000;
const starP = new Float32Array(starN * 3);
const starC = new Float32Array(starN * 3);
for (let i = 0; i < starN; i++) {
  const r = 80 + Math.random() * 250;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  starP[i * 3] = r * Math.sin(ph) * Math.cos(th);
  starP[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
  starP[i * 3 + 2] = r * Math.cos(ph);
  const b = 0.5 + Math.random() * 0.5;
  starC[i * 3] = b; starC[i * 3 + 1] = b; starC[i * 3 + 2] = 0.8 + b * 0.2;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starP, 3));
starGeo.setAttribute("color", new THREE.BufferAttribute(starC, 3));

function makeDotTex(r, g, b) {
  const cvs = document.createElement("canvas"); cvs.width = cvs.height = 64;
  const ctx = cvs.getContext("2d");
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.2, `rgba(${r},${g},${b},1)`);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cvs);
}

const starTex = makeDotTex(255, 255, 255);
const starMat = new THREE.PointsMaterial({
  map: starTex, size: 0.5, vertexColors: true,
  blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ═══════════════════════════════════════════
// INTERTWINED GLOWING STREAMS
// ═══════════════════════════════════════════
const streamGeo = new THREE.BufferGeometry();
const particlesPerStream = 5000;
const totalStreamP = particlesPerStream * 2;
const streamPos = new Float32Array(totalStreamP * 3);
const streamCol = new Float32Array(totalStreamP * 3);

const color1 = new THREE.Color().setHSL(0.94, 0.9, 0.55);
const color2 = new THREE.Color().setHSL(0.08, 0.85, 0.6);

for (let s = 0; s < 2; s++) {
  const phaseOffset = s * Math.PI;

  for (let i = 0; i < particlesPerStream; i++) {
    const idx = (s * particlesPerStream + i) * 3;
    const t = i / (particlesPerStream - 1);

    const angle = t * Math.PI * 10 + phaseOffset;
    const y = (t - 0.5) * 22;
    const baseR = 4.5 + Math.sin(t * Math.PI) * 2.0;

    const spreadAngle = Math.random() * Math.PI * 2;
    const spreadRadius = Math.sqrt(Math.random()) * 1.0;
    const r = baseR + Math.cos(spreadAngle) * spreadRadius;

    streamPos[idx]     = Math.cos(angle) * r;
    streamPos[idx + 1] = y + Math.sin(spreadAngle) * spreadRadius;
    streamPos[idx + 2] = Math.sin(angle) * r;

    const baseCol = s === 0 ? color1 : color2;
    const hsl = {};
    baseCol.getHSL(hsl);
    const col = new THREE.Color();
    col.setHSL(
      Math.max(0, Math.min(1, hsl.h + (Math.random() - 0.5) * 0.03)),
      hsl.s + (Math.random() - 0.5) * 0.15,
      Math.max(0.1, Math.min(0.9, hsl.l + (Math.random() - 0.5) * 0.3))
    );
    streamCol[idx]     = col.r;
    streamCol[idx + 1] = col.g;
    streamCol[idx + 2] = col.b;
  }
}
streamGeo.setAttribute("position", new THREE.BufferAttribute(streamPos, 3));
streamGeo.setAttribute("color", new THREE.BufferAttribute(streamCol, 3));

const streamMat = new THREE.PointsMaterial({
  map: starTex,
  size: 0.22,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  opacity: 0.85
});

const streamGroup = new THREE.Group();
const streamPoints = new THREE.Points(streamGeo, streamMat);
streamGroup.add(streamPoints);

// Soft central glow
const streamGlowGeo = new THREE.SphereGeometry(5, 32, 32);
const streamGlowMat = new THREE.MeshBasicMaterial({
  color: 0xff8855,
  transparent: true,
  opacity: 0.06,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const streamGlowMesh = new THREE.Mesh(streamGlowGeo, streamGlowMat);
streamGroup.add(streamGlowMesh);
scene.add(streamGroup);

// Ambient Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ═══════════════════════════════════════════
// UI OVERLAYS
// ═══════════════════════════════════════════
const overlay = document.createElement("div");
overlay.style.cssText =
  "position:fixed;inset:0;z-index:10;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;font-family:'Cormorant Garamond',Georgia,serif;";
document.body.appendChild(overlay);

const mainTxt = document.createElement("h1");
mainTxt.style.cssText =
  "font-family:'Tangerine',cursive;font-size:clamp(3rem,7vw,5rem);color:#ffd0e0;text-shadow:0 0 60px rgba(255,180,200,.5);line-height:1.2;transition:opacity .8s ease;font-weight:700;";
overlay.appendChild(mainTxt);

const subTxt = document.createElement("p");
subTxt.style.cssText =
  "font-family:'Inter',sans-serif;font-size:.75rem;color:rgba(255,180,200,.55);letter-spacing:.25em;text-transform:uppercase;margin-top:.8rem;transition:opacity .8s ease;";
overlay.appendChild(subTxt);

function setOverlay(main, sub) {
  mainTxt.style.opacity = "0";
  subTxt.style.opacity = "0";
  setTimeout(() => {
    mainTxt.textContent = main || "\u00a0";
    subTxt.textContent = sub || "\u00a0";
    mainTxt.style.opacity = main ? "1" : "0";
    subTxt.style.opacity = sub ? "1" : "0";
  }, 300);
}

// ═══════════════════════════════════════════
// LETTER DIV (stage 8)
// ═══════════════════════════════════════════
const letterDiv = document.createElement("div");
letterDiv.style.cssText =
  "display:none;position:fixed;top:45%;left:50%;transform:translate(-50%, -50%);z-index:10;pointer-events:none;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.1rem,2.5vw,1.4rem);color:rgba(255,230,240,0.9);text-align:center;width:90%;max-width:600px;line-height:1.6;background:rgba(0,0,0,0.4);padding:2rem;border-radius:15px;border:1px solid rgba(232,160,191,0.2);box-shadow:0 0 30px rgba(0,0,0,0.5);opacity:0;transition:opacity 1s ease;backdrop-filter:blur(4px);";
letterDiv.innerHTML = `
  My dearest Mrunal,<br><br>
  Every time I look at the stars, I'm reminded of how perfectly the universe had to align for our paths to cross. From the bustling streets of Mumbai to the warmth of Bihar, the distance between us is just a space waiting to be filled with our memories.<br><br>
  Since that beautiful day in May, you've become my brightest star, my peace, and my home. I might not be able to hold your hand right this second, but my heart is already with you, every single day.<br><br>
  I love you.<br><br>
  — Navneet
`;
document.body.appendChild(letterDiv);

// ═══════════════════════════════════════════
// COUNTER (finale only)
// ═══════════════════════════════════════════
const counterDiv = document.createElement("div");
counterDiv.style.cssText =
  "display:none;position:fixed;bottom:12%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;gap:.8rem;";
document.body.appendChild(counterDiv);

function buildCounter() {
  [
    ["cd", "days"], ["ch", "hours"], ["cm", "minutes"], ["cs", "seconds"]
  ].forEach(([id, lbl]) => {
    const box = document.createElement("div");
    box.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:.1rem;width:70px;padding:.7rem .3rem;background:rgba(255,255,255,.04);border:1px solid rgba(232,160,191,.12);border-radius:14px;";
    const v = document.createElement("span");
    v.id = id; v.textContent = "0";
    v.style.cssText =
      "font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:400;color:#e8a0bf;text-shadow:0 0 15px rgba(232,160,191,.35);";
    const l = document.createElement("span");
    l.textContent = lbl;
    l.style.cssText =
      "font-family:'Inter',sans-serif;font-size:.55rem;font-weight:300;color:rgba(230,200,200,.3);letter-spacing:.15em;text-transform:uppercase;";
    box.appendChild(v); box.appendChild(l);
    counterDiv.appendChild(box);
  });
}
buildCounter();

const closingDiv = document.createElement("div");
closingDiv.style.cssText =
  "display:none;position:fixed;bottom:22%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(.85rem,2vw,1rem);font-style:italic;color:rgba(240,210,210,.6);text-align:center;max-width:420px;";
closingDiv.textContent = "One day there won't be any screens between us. No goodbyes — just goodnight. Until then, every heartbeat, every mile, every second — I'm yours.";
document.body.appendChild(closingDiv);

const sigDiv = document.createElement("div");
sigDiv.style.cssText =
  "display:none;position:fixed;bottom:15%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;font-family:'Dancing Script',cursive;font-size:clamp(1.1rem,2.5vw,1.4rem);color:rgba(232,160,191,.55);";
sigDiv.textContent = "— Navneet";
document.body.appendChild(sigDiv);

let counterInterval = null;
function startCounter() {
  if (counterInterval) return;
  counterDiv.style.display = "flex";
  closingDiv.style.display = "block";
  sigDiv.style.display = "block";
  tickCounter();
  counterInterval = setInterval(tickCounter, 1000);
}
function tickCounter() {
  let diff = Date.now() - SINCE; if (diff < 0) diff = 0;
  const ts = Math.floor(diff / 1000);
  const set = (id, v, f) => {
    const el = document.getElementById(id);
    if (el) el.textContent = f ? v.toLocaleString() : v.toString().padStart(2, "0");
  };
  set("cd", Math.floor(ts / 86400), true);
  set("ch", Math.floor((ts % 86400) / 3600), false);
  set("cm", Math.floor((ts % 3600) / 60), false);
  set("cs", ts % 60, false);
}

// ═══════════════════════════════════════════
// PROGRESS + DOTS
// ═══════════════════════════════════════════
const prog = document.createElement("div");
prog.style.cssText =
  "position:fixed;bottom:0;left:0;height:3px;background:linear-gradient(90deg,rgba(232,160,191,.4),rgba(232,160,191,.7));z-index:20;transition:width .8s ease;";
document.body.appendChild(prog);

const dots = document.createElement("div");
dots.style.cssText =
  "position:fixed;right:.8rem;top:50%;transform:translateY(-50%);z-index:20;display:flex;flex-direction:column;gap:.35rem;";
for (let i = 0; i < stageCount; i++) {
  const d = document.createElement("div");
  d.style.cssText = "width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .5s ease;";
  dots.appendChild(d);
}
document.body.appendChild(dots);

function updateUI() {
  dots.querySelectorAll("div").forEach((d, i) => {
    d.style.background = i === stage ? "rgba(232,160,191,.75)" : i < stage ? "rgba(232,160,191,.35)" : "rgba(255,255,255,.1)";
    d.style.boxShadow = i === stage ? "0 0 8px rgba(232,160,191,.4)" : "none";
    d.style.transform = i === stage ? "scale(1.4)" : "scale(1)";
  });
  prog.style.width = `${((stage + 1) / stageCount) * 100}%`;
}

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let stage = 0;
let targetZ = 80;
let transitioning = false;
const stageZs = [140, 120, 100, 85, 70, 55, 45, 35, 30, 25];

function go(n) {
  if (transitioning || n >= stageCount || n <= stage) return;
  transitioning = true;
  stage = n;
  targetZ = stageZs[n];
  updateUI();
  setOverlay(stageText[n].main, stageText[n].sub);
  
  if (n === 8) {
    letterDiv.style.display = "block";
    setTimeout(() => { letterDiv.style.opacity = "1"; }, 50);
  } else {
    letterDiv.style.opacity = "0";
    setTimeout(() => { 
      if (stage !== 8) letterDiv.style.display = "none"; 
    }, 1000);
  }

  if (n === 9) startCounter();

  setTimeout(() => { transitioning = false; }, 1200);
}

// ═══════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════
document.addEventListener("click", () => {
  if (!transitioning && stage < stageCount - 1) go(stage + 1);
});
document.addEventListener("keydown", (e) => {
  if (["Space", "ArrowRight", "Enter"].includes(e.code)) {
    e.preventDefault();
    if (!transitioning && stage < stageCount - 1) go(stage + 1);
  }
});

// ═══════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;

  camera.position.z += (targetZ - camera.position.z) * 0.02;

  // Rotate stars
  stars.rotation.y += 0.0002;
  stars.rotation.x += 0.0001;

  // Intertwined Streams Animation
  streamGroup.rotation.y = t * 0.25;
  streamGroup.rotation.x = Math.sin(t * 0.3) * 0.15;
  streamGroup.rotation.z = Math.cos(t * 0.35) * 0.1;

  const pulse = 1 + Math.pow(Math.sin(t * Math.PI), 4) * 0.04;
  streamGroup.scale.set(pulse, pulse, pulse);

  const targetOp = stage >= 8 ? 0.4 : 0.85;
  streamMat.opacity += (targetOp - streamMat.opacity) * 0.05;

  stars.material.opacity += ((stage >= 5 ? 0.3 : 0.9) - stars.material.opacity) * 0.02;

  renderer.render(scene, camera);
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setOverlay(stageText[0].main, stageText[0].sub);
updateUI();
tickCounter();
animate();
