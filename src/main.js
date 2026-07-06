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
// 3D GLOWING HEART
// ═══════════════════════════════════════════
const heartGeo = new THREE.BufferGeometry();
const heartN = 12000;
const heartP = new Float32Array(heartN * 3);
const heartC = new Float32Array(heartN * 3);
let idx = 0;
while (idx < heartN) {
  const x = (Math.random() - 0.5) * 3;
  const y = (Math.random() - 0.5) * 3.5;
  const z = (Math.random() - 0.5) * 3;
  
  const xx = x*x;
  const yy = y*y;
  const zz = z*z;
  
  const a = xx + (9/4)*zz + yy - 1;
  const val = a*a*a - xx*y*yy - (9/80)*zz*y*yy;
  
  if (val < 0) {
    heartP[idx*3] = x * 10;
    heartP[idx*3+1] = (y * 10) + 2; 
    heartP[idx*3+2] = z * 10;
    
    const c = new THREE.Color();
    const hue = 0.9 + (Math.random() * 0.1); 
    const sat = 0.8 + (Math.random() * 0.2);
    const lit = 0.4 + (Math.random() * 0.4);
    c.setHSL(hue, sat, lit);
    
    heartC[idx*3] = c.r;
    heartC[idx*3+1] = c.g;
    heartC[idx*3+2] = c.b;
    
    idx++;
  }
}
heartGeo.setAttribute("position", new THREE.BufferAttribute(heartP, 3));
heartGeo.setAttribute("color", new THREE.BufferAttribute(heartC, 3));

const heartMat = new THREE.PointsMaterial({
  map: starTex,
  size: 0.35,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  opacity: 0.8
});

const heartGroup = new THREE.Group();
const heartPoints = new THREE.Points(heartGeo, heartMat);
heartGroup.add(heartPoints);

// Add a soft glow behind the heart
const glowGeo = new THREE.SphereGeometry(12, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xff3366,
  transparent: true,
  opacity: 0.05,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
heartGroup.add(glowMesh);
scene.add(heartGroup);

// Ambient Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ═══════════════════════════════════════════
// UI OVERLAYS (Responsive + Glow Animation)
// ═══════════════════════════════════════════
const style = document.createElement("style");
style.innerHTML = `
  @keyframes charGlow {
    0% { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ffb3c6; color: #fff; opacity: 0; }
    10% { opacity: 1; text-shadow: 0 0 10px #fff, 0 0 20px #ffb3c6; color: #fff; }
    100% { text-shadow: inherit; color: inherit; }
  }
  .glow-char {
    animation: charGlow 0.8s ease-out forwards;
  }
  #letter-div {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    color: rgba(255,230,240,0.9);
    text-align: center;
    width: 90%;
    max-width: 600px;
    line-height: 1.8;
    background: rgba(0,0,0,0.45);
    padding: 2.5rem;
    border-radius: 15px;
    border: 1px solid rgba(232,160,191,0.2);
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
    backdrop-filter: blur(5px);
  }
  @media (max-width: 600px) {
    #counter-container { gap: 0.4rem !important; }
    .counter-box { width: 60px !important; padding: 0.5rem 0.2rem !important; }
    .counter-val { font-size: 1.3rem !important; }
    .counter-lbl { font-size: 0.5rem !important; }
    #letter-div { padding: 1.5rem !important; width: 95% !important; font-size: 1.15rem !important; line-height: 1.6; }
    #closing-div { font-size: 1rem !important; width: 90% !important; bottom: 25% !important; }
  }
`;
document.head.appendChild(style);

const overlay = document.createElement("div");
overlay.style.cssText =
  "position:fixed;inset:0;z-index:10;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center;font-family:'Cormorant Garamond',Georgia,serif;";
document.body.appendChild(overlay);

const mainTxt = document.createElement("h1");
mainTxt.style.cssText =
  "font-family:'Tangerine',cursive;font-size:clamp(3rem,7vw,5rem);color:#ffd0e0;text-shadow:0 0 60px rgba(255,180,200,.5);line-height:1.2;font-weight:700;";
overlay.appendChild(mainTxt);

const subTxt = document.createElement("p");
subTxt.style.cssText =
  "font-family:'Inter',sans-serif;font-size:.75rem;color:rgba(255,180,200,.55);letter-spacing:.25em;text-transform:uppercase;margin-top:.8rem;";
overlay.appendChild(subTxt);

const typingIds = new Map();
function typeHtml(el, html, speed, onComplete) {
  const currentId = Date.now() + Math.random();
  typingIds.set(el, currentId);
  el.innerHTML = "";
  if (!html) {
    if (onComplete) onComplete();
    return;
  }
  
  const charsAndTags = html.match(/(<[^>]+>|[\\s\\S])/g) || [];
  let i = 0;
  
  function type() {
    if (typingIds.get(el) !== currentId) return; // aborted
    
    if (i < charsAndTags.length) {
      const token = charsAndTags[i];
      if (token.startsWith('<')) {
        el.insertAdjacentHTML('beforeend', token);
        i++;
        type();
      } else {
        const span = document.createElement('span');
        if (token === ' ' || token === '\\n') {
          span.innerHTML = token === ' ' ? '&nbsp;' : '<br>';
        } else {
          span.textContent = token;
        }
        span.className = "glow-char";
        el.appendChild(span);
        i++;
        setTimeout(type, speed);
      }
    } else {
      if (onComplete) onComplete();
    }
  }
  type();
}

function setOverlay(main, sub) {
  typeHtml(mainTxt, main || "", 40, () => {
    if (sub) {
      typeHtml(subTxt, sub, 30);
    } else {
      subTxt.innerHTML = "";
    }
  });
}

// ═══════════════════════════════════════════
// LETTER DIV (stage 8)
// ═══════════════════════════════════════════
const letterContent = `
  My dearest Mrunal,<br><br>
  Every time I look at the stars, I'm reminded of how perfectly the universe had to align for our paths to cross. From the bustling streets of Mumbai to the warmth of Bihar, the distance between us is just a space waiting to be filled with our memories.<br><br>
  Since that beautiful day in May, you've become my brightest star, my peace, and my home. I might not be able to hold your hand right this second, but my heart is already with you, every single day.<br><br>
  I love you.<br><br>
  — Navneet
`;
const letterDiv = document.createElement("div");
letterDiv.id = "letter-div";
letterDiv.style.cssText =
  "display:none;position:fixed;top:45%;left:50%;transform:translate(-50%, -50%);z-index:10;pointer-events:none;opacity:0;transition:opacity 1s ease;";
document.body.appendChild(letterDiv);

// ═══════════════════════════════════════════
// COUNTER (finale only)
// ═══════════════════════════════════════════
const counterDiv = document.createElement("div");
counterDiv.id = "counter-container";
counterDiv.style.cssText =
  "display:none;position:fixed;bottom:12%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;gap:.8rem;";
document.body.appendChild(counterDiv);

function buildCounter() {
  [
    ["cd", "days"], ["ch", "hours"], ["cm", "minutes"], ["cs", "seconds"]
  ].forEach(([id, lbl]) => {
    const box = document.createElement("div");
    box.className = "counter-box";
    box.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:.1rem;width:70px;padding:.7rem .3rem;background:rgba(255,255,255,.04);border:1px solid rgba(232,160,191,.12);border-radius:14px;";
    const v = document.createElement("span");
    v.id = id; v.textContent = "0";
    v.className = "counter-val";
    v.style.cssText =
      "font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:400;color:#e8a0bf;text-shadow:0 0 15px rgba(232,160,191,.35);";
    const l = document.createElement("span");
    l.textContent = lbl;
    l.className = "counter-lbl";
    l.style.cssText =
      "font-family:'Inter',sans-serif;font-size:.55rem;font-weight:300;color:rgba(230,200,200,.3);letter-spacing:.15em;text-transform:uppercase;";
    box.appendChild(v); box.appendChild(l);
    counterDiv.appendChild(box);
  });
}
buildCounter();

const closingDiv = document.createElement("div");
closingDiv.id = "closing-div";
closingDiv.style.cssText =
  "display:none;position:fixed;bottom:22%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(.85rem,2vw,1rem);font-style:italic;color:rgba(240,210,210,.6);text-align:center;max-width:420px;";
document.body.appendChild(closingDiv);

const closingContent = "One day there won't be any screens between us. No goodbyes — just goodnight. Until then, every heartbeat, every mile, every second — I'm yours.";

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
  sigDiv.style.opacity = "0";
  
  typeHtml(closingDiv, closingContent, 20, () => {
    sigDiv.style.opacity = "1";
    sigDiv.style.transition = "opacity 1s ease";
  });
  
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
    setTimeout(() => { 
      letterDiv.style.opacity = "1";
      typeHtml(letterDiv, letterContent, 15);
    }, 50);
  } else {
    letterDiv.style.opacity = "0";
    setTimeout(() => { 
      if (stage !== 8) {
        letterDiv.style.display = "none"; 
        letterDiv.innerHTML = "";
      }
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

  // Heart Animation
  heartGroup.rotation.y = t * 0.2;
  heartGroup.rotation.z = Math.sin(t * 0.5) * 0.1;
  
  // Heart beating (pulsing scale based on time)
  const beat = 1 + Math.pow(Math.sin(t * Math.PI), 4) * 0.05;
  heartGroup.scale.set(beat, beat, beat);
  
  // Transition heart opacity across stages
  const targetOp = stage >= 8 ? 0.4 : 0.8;
  heartMat.opacity += (targetOp - heartMat.opacity) * 0.05;

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
