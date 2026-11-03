// A procedural shark that swims to a resting spot in every section as the page scrolls.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('fish');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const config = window.FISH_PATH || {};
const finish = () => { document.getElementById('loader')?.classList.add('done'); document.body.classList.add('loaded'); };

if (!canvas) finish();
else try { start(); } catch (error) { console.warn('Fish scene unavailable', error); finish(); }

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.HemisphereLight(0xe6fbff, 0x1d5a7a, 1.3));
  const key = new THREE.DirectionalLight(0xfff1d6, 2.6); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fe6ff, 2.2); rim.position.set(-5, 2, -4); scene.add(rim);

  // flight: position, scale, yaw. fishRoot: roll and pitch. Frame: +X head, +Y up, +Z right side.
  const flight = new THREE.Group(); const fishRoot = new THREE.Group(); const holder = new THREE.Group();
  scene.add(flight); flight.add(fishRoot); fishRoot.add(holder);

  // Shared swim wave, injected into every bending material.
  const swim = { uTime: { value: 0 }, uAmp: { value: .05 }, uFreq: { value: 12 }, uK: { value: 7 } };
  const bend = material => {
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, swim);
      shader.vertexShader = 'uniform float uTime;uniform float uAmp;uniform float uFreq;uniform float uK;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float tailward = clamp((.22 - transformed.x) / 1.02, 0., 1.);
        transformed.z += sin(uTime * uFreq - transformed.x * uK) * uAmp * tailward * tailward;
        transformed.z -= sin(uTime * uFreq) * uAmp * .18 * clamp(transformed.x * 2., 0., 1.);`);
    };
    return material;
  };

  // Body: a torpedo lathe, thickest just behind the head, tapering to a slim tail stalk.
  const A = .5, radius = u => A * Math.pow(u, 1.1) * Math.pow(1 - u, .7);
  const profile = [];
  for (let i = 0; i <= 96; i++) { const u = i / 96; profile.push(new THREE.Vector2(Math.max(radius(u), 1e-4), u - .5)); }
  const body = new THREE.LatheGeometry(profile, 64);
  body.rotateZ(-Math.PI / 2);
  body.scale(1, 1, .8);
  // Countershading: slate back, pale belly, with a soft darker ridge along the top.
  const colors = []; const pos = body.attributes.position; const c = new THREE.Color();
  const back = new THREE.Color(0x4a7bad), ridge = new THREE.Color(0x30598a), belly = new THREE.Color(0xf6fafc);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    c.copy(belly).lerp(back, THREE.MathUtils.smoothstep(y, -.035, .025)).lerp(ridge, THREE.MathUtils.smoothstep(y, .05, .11) * .8);
    colors.push(c.r, c.g, c.b);
  }
  body.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  holder.add(new THREE.Mesh(body, bend(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .3, clearcoat: 1, clearcoatRoughness: .18, sheen: .5, sheenColor: new THREE.Color(0xcfe6f2), envMapIntensity: .85 }))));

  // Fins are painted on canvas so they can be cut to shape and still bend with the body.
  const finTexture = draw => {
    const surface = document.createElement('canvas'); surface.width = 512; surface.height = 512;
    const ctx = surface.getContext('2d'); draw(ctx, 512);
    const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    return texture;
  };
  const paintFin = (ctx, path, from, to) => {
    ctx.save(); path(); ctx.clip();
    const fill = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    fill.addColorStop(0, '#5686b6'); fill.addColorStop(.7, '#43719f'); fill.addColorStop(1, '#325b86');
    ctx.fillStyle = fill; ctx.fillRect(0, 0, 512, 512);
    ctx.restore();
  };
  const finMaterial = map => bend(new THREE.MeshStandardMaterial({ map, transparent: true, alphaTest: .04, side: THREE.DoubleSide, roughness: .5, metalness: 0, depthWrite: false, envMapIntensity: .7 }));
  const addFin = (texture, x0, x1, y0, y1, z = 0) => {
    const plane = new THREE.PlaneGeometry(x1 - x0, y1 - y0, 28, 12);
    plane.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
    const mesh = new THREE.Mesh(plane, finMaterial(texture)); mesh.renderOrder = 2; holder.add(mesh); return mesh;
  };
  // Map fin space to canvas: x0..x1 -> 0..512, y1..y0 -> 0..512.
  const toCanvas = (x0, x1, y0, y1) => (x, y) => [(x - x0) / (x1 - x0) * 512, (y1 - y) / (y1 - y0) * 512];

  // Tail: crescent, upper lobe longer than the lower.
  { const m = toCanvas(-.8, -.44, -.28, .32);
    addFin(finTexture(ctx => paintFin(ctx, () => {
      ctx.beginPath(); ctx.moveTo(...m(-.46, .022));
      ctx.quadraticCurveTo(...m(-.58, .1), ...m(-.77, .3)); ctx.quadraticCurveTo(...m(-.67, .09), ...m(-.65, 0));
      ctx.quadraticCurveTo(...m(-.67, -.06), ...m(-.72, -.21)); ctx.quadraticCurveTo(...m(-.55, -.08), ...m(-.46, -.022)); ctx.closePath();
    }, m(-.46, 0), m(-.77, .3))), -.8, -.44, -.28, .32); }

  // First dorsal: the tall swept triangle.
  { const m = toCanvas(-.1, .2, .05, .35);
    addFin(finTexture(ctx => paintFin(ctx, () => {
      ctx.beginPath(); ctx.moveTo(...m(.18, .05)); ctx.quadraticCurveTo(...m(.1, .17), ...m(-.01, .34));
      ctx.quadraticCurveTo(...m(-.02, .17), ...m(-.09, .05)); ctx.closePath();
    }, m(.05, .05), m(-.01, .34))), -.1, .2, .05, .35); }

  // Small second dorsal and anal fin near the tail stalk.
  { const m = toCanvas(-.36, -.16, .03, .15);
    addFin(finTexture(ctx => paintFin(ctx, () => {
      ctx.beginPath(); ctx.moveTo(...m(-.17, .04)); ctx.quadraticCurveTo(...m(-.23, .08), ...m(-.3, .145)); ctx.quadraticCurveTo(...m(-.31, .08), ...m(-.35, .04)); ctx.closePath();
    }, m(-.2, .04), m(-.3, .145))), -.36, -.16, .03, .15); }
  { const m = toCanvas(-.36, -.16, -.15, -.03);
    addFin(finTexture(ctx => paintFin(ctx, () => {
      ctx.beginPath(); ctx.moveTo(...m(-.17, -.04)); ctx.quadraticCurveTo(...m(-.23, -.08), ...m(-.3, -.145)); ctx.quadraticCurveTo(...m(-.31, -.08), ...m(-.35, -.04)); ctx.closePath();
    }, m(-.2, -.04), m(-.3, -.145))), -.36, -.16, -.15, -.03); }

  // Pectorals: long swept blades, held out and down, rocking gently. The flipped texture mirrors the left one.
  const pectoral = flip => finTexture(ctx => {
    if (flip) { ctx.translate(0, 512); ctx.scale(1, -1); }
    paintFin(ctx, () => { ctx.beginPath(); ctx.moveTo(500, 512); ctx.quadraticCurveTo(430, 240, 90, 10); ctx.quadraticCurveTo(250, 260, 300, 512); ctx.closePath(); }, [400, 512], [90, 0]);
  });
  const paddles = [];
  for (const side of [1, -1]) {
    const hinge = new THREE.Group(); hinge.position.set(.22, -.09, .11 * side);
    const geometry = new THREE.PlaneGeometry(.24, .3, 8, 8).translate(-.12, 0, 0).rotateX(Math.PI / 2).translate(0, 0, .15 * side);
    const fin = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: pectoral(side < 0), transparent: true, alphaTest: .04, side: THREE.DoubleSide, roughness: .5, depthWrite: false }));
    fin.renderOrder = 3; hinge.add(fin); holder.add(hinge); paddles.push({ hinge, side });
  }

  // Eyes: small, black and glossy with one catchlight.
  for (const side of [1, -1]) {
    const eye = new THREE.Group(); eye.position.set(.385, .045, .07 * side);
    eye.add(new THREE.Mesh(new THREE.SphereGeometry(.027, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0x050607, roughness: .08, clearcoat: 1, clearcoatRoughness: .02 })));
    const glint = new THREE.Mesh(new THREE.SphereGeometry(.0085, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(.011, .013, .019 * side); eye.add(glint);
    holder.add(eye);
  }

  // Dark details drawn as thin tubes riding on the skin: the underslung mouth and five gill slits.
  const inkMaterial = bend(new THREE.MeshStandardMaterial({ color: 0x1c2b35, roughness: .6 }));
  const surface = (x, angle, lift = 1.02) => { const r = radius(x + .5) * lift; return new THREE.Vector3(x, -r * Math.cos(angle), r * .85 * Math.sin(angle)); };
  { const points = [];
    for (let i = 0; i <= 14; i++) { const s = i / 7 - 1; points.push(surface(.375 + .115 * Math.pow(1 - s * s, .6), s * 1.15, 1.03)); }
    holder.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, .0048, 6), inkMaterial)); }
  for (const side of [1, -1]) for (let i = 0; i < 5; i++) {
    const x = .3 - i * .017, r = radius(x + .5), points = [];
    for (let j = 0; j <= 6; j++) { const y = -.055 + j * .0183; points.push(new THREE.Vector3(x - Math.abs(y) * .12, y, side * Math.sqrt(Math.max(r * r - y * y, 0)) * .85 * 1.012)); }
    holder.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, .0024, 5), inkMaterial));
  }

  // Normalise: length 1, centred on the origin.
  let box = new THREE.Box3().setFromObject(holder);
  const size = box.getSize(new THREE.Vector3());
  holder.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
  box = new THREE.Box3().setFromObject(holder);
  holder.position.sub(box.getCenter(new THREE.Vector3()));
  holder.traverse(o => { if (o.isMesh) o.frustumCulled = false; });

  // Bubbles rise from the mouth now and then.
  const bubbleCanvas = document.createElement('canvas'); bubbleCanvas.width = bubbleCanvas.height = 64;
  { const ctx = bubbleCanvas.getContext('2d'); const g = ctx.createRadialGradient(26, 24, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(220,248,255,.18)'); g.addColorStop(.82, 'rgba(200,240,255,.35)'); g.addColorStop(1, 'rgba(200,240,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill(); }
  const bubbleMap = new THREE.CanvasTexture(bubbleCanvas); bubbleMap.colorSpace = THREE.SRGBColorSpace;
  const bubbles = Array.from({ length: 14 }, () => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleMap, transparent: true, depthWrite: false, opacity: 0 }));
    sprite.visible = false; scene.add(sprite); return { sprite, life: 0, max: 1, drift: 0, size: 0 };
  });
  let nextBubble = 1.2;
  const mouth = new THREE.Vector3();

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  // Path: one keyframe per section, x/y in viewport units (-1..1), yaw 0 = facing right, 180 = left.
  const fallback = [{ x: 0, y: 0, z: 0, s: 1, yaw: 150, pitch: 4, roll: 0 }];
  const sections = [...document.querySelectorAll(config.sections || 'main > section')];
  const frames = () => (innerWidth < 760 ? config.mobile : config.desktop) || fallback;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerpAngle = (a, b, t) => a + (((b - a + 540) % 360) - 180) * t;
  let posed = null, poseChange = 0;
  function targetAt() {
    if (config.pose) {
      // Single-screen pages: the page names a pose; the follow smoothing does the swimming.
      const next = config.pose(innerWidth < 760);
      if (next !== posed) { posed = next; poseChange = performance.now(); }
      const since = (performance.now() - poseChange) / 1400;
      return { ...next, moving: since < 1 ? Math.sin(since * Math.PI) : 0 };
    }
    const K = frames(); const line = scrollY + innerHeight * .5;
    let i = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top + scrollY <= line) i = index; });
    i = Math.min(i, K.length - 1);
    if (!i) return { ...K[0], z: K[0].z || 0, moving: 0, spin: 0 };
    // Rest inside each section; swim across the boundary over 0.8 viewport of scrolling.
    const top = sections[i].getBoundingClientRect().top + scrollY;
    const t = ease(clamp((line - top + innerHeight * .1) / (innerHeight * .8), 0, 1));
    const a = K[i - 1], b = K[i], arc = Math.sin(t * Math.PI);
    // Mid-flight the shark dives, banks into the turn, and may corkscrew once (spin is added after smoothing so it stays in step with the scroll).
    const bank = (b.x > a.x ? -1 : 1) * arc * 24;
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) + arc * -.28, z: lerp(a.z || 0, b.z || 0, t) + arc * .8, s: lerp(a.s, b.s, t) * (1 + arc * .16), yaw: lerpAngle(a.yaw, b.yaw, t), pitch: lerp(a.pitch, b.pitch, t), roll: lerp(a.roll, b.roll, t) + bank, moving: arc, spin: (b.spin || 0) * t };
  }

  const cur = { z: 0, ...targetAt() }; let heading = cur.yaw;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', event => { mouse.x = event.clientX / innerWidth * 2 - 1; mouse.y = -(event.clientY / innerHeight * 2 - 1); }, { passive: true });

  const clock = new THREE.Clock(); const deg = THREE.MathUtils.degToRad;
  let ready = false, t = 0;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); const calm = reduced.matches ? .35 : 1; t += dt * calm;
    const goal = targetAt(); const k = 1 - Math.exp(-dt * 3.2);
    const px = cur.x, py = cur.y;
    for (const key of ['x', 'y', 'z', 's', 'pitch', 'roll', 'moving']) cur[key] = lerp(cur[key], goal[key] || 0, k);
    const vx = (cur.x - px) / Math.max(dt, 1e-4), vy = (cur.y - py) / Math.max(dt, 1e-4);
    // A shark never swims backwards: while travelling, the nose turns into the direction of travel.
    const travel = vx > 0 ? 18 : 162, pull = clamp((Math.abs(vx) - .04) * 2.4, 0, .9);
    heading = lerpAngle(heading, lerpAngle(goal.yaw, travel, pull), 1 - Math.exp(-dt * 2.6));
    mouse.sx = lerp(mouse.sx, mouse.x, 1 - Math.exp(-dt * 2)); mouse.sy = lerp(mouse.sy, mouse.y, 1 - Math.exp(-dt * 2));

    const halfH = Math.tan(deg(camera.fov / 2)) * camera.position.z, halfW = halfH * camera.aspect;
    const hover = (Math.sin(t * 1.4) * .045 + Math.sin(t * 2.3) * .015) * calm;
    flight.position.set(cur.x * halfW + Math.sin(t * .9) * .05 * calm + mouse.sx * .12, cur.y * halfH + hover * halfH * .5 + mouse.sy * .08, cur.z + Math.sin(t * .6) * .15);
    flight.scale.setScalar(halfH * 2 * .3 * cur.s);
    flight.rotation.set(0, -deg(heading + mouse.sx * 22), 0);
    const pitch = cur.pitch + clamp(vy * 22, -26, 26) + Math.sin(t * 1.4 + 1) * 3 + mouse.sy * 9;
    const roll = cur.roll - clamp(vx * 12, -18, 18) + Math.sin(t * 1.1) * 3 + (goal.spin || 0) * (config.spin === false ? 0 : 1);
    fishRoot.rotation.set(deg(roll), 0, deg(pitch), 'YZX');

    // Tail beat speeds up and widens mid-swim.
    const effort = clamp(cur.moving + Math.hypot(vx, vy) * .6, 0, 1.4);
    swim.uFreq.value = Math.PI * 2 * (1.5 + effort * 1.6); swim.uAmp.value = (.035 + effort * .07) * calm;
    swim.uTime.value = t;
    for (const { hinge, side } of paddles) { const a = Math.sin(t * swim.uFreq.value * .55 + (side > 0 ? 0 : .6)); hinge.rotation.set(side * (.5 + a * .07), 0, 0); }

    nextBubble -= dt;
    if (nextBubble <= 0 && !reduced.matches) {
      nextBubble = (1.1 + Math.random() * 1.8) / (1 + effort * 5);
      const free = bubbles.find(b => !b.sprite.visible);
      if (free) {
        if (effort > .35) mouth.set(-.5 + Math.random() * .12, (Math.random() - .5) * .06, (Math.random() - .5) * .06); else mouth.set(.49, -.04, 0);
        holder.localToWorld(mouth);
        free.sprite.position.copy(mouth); free.sprite.visible = true;
        free.life = 0; free.max = 2.4 + Math.random(); free.drift = Math.random() * 6; free.size = flight.scale.x * (.025 + Math.random() * .03);
      }
    }
    for (const b of bubbles) {
      if (!b.sprite.visible) continue;
      b.life += dt; const life = b.life / b.max;
      if (life >= 1) { b.sprite.visible = false; continue; }
      b.sprite.position.y += dt * halfH * .22; b.sprite.position.x += Math.sin(b.life * 3 + b.drift) * dt * .08;
      b.sprite.scale.setScalar(b.size * (1 + life * .6));
      b.sprite.material.opacity = Math.sin(life * Math.PI) * .9;
    }

    canvas.classList.toggle('hush', !!document.querySelector('dialog[open]'));
    if (ready) renderer.render(scene, camera);
  }
  ready = true; canvas.classList.add('ready'); finish();
  frame();
}
