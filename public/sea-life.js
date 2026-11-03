// A living sea behind the scrapbook: schools of fish, glowing jellyfish, swaying kelp, drifting plankton, light shafts and the odd manta ray.
// Painted on one canvas that sits behind the page text; it deepens and dims with the scroll depth.
(() => {
  const canvas = document.createElement('canvas'); canvas.id = 'sea-life'; canvas.setAttribute('aria-hidden', 'true');
  (document.querySelector('.login-shell') || document.body).prepend(canvas);
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0, H = 0, dpr = 1;
  const rand = (a, b) => a + Math.random() * (b - a);
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  addEventListener('resize', resize); resize();
  const small = () => W < 760;

  // Schools of fish: a leader swims across; every fish follows its own offset with a little wobble.
  const makeSchool = fromStart => {
    const dir = Math.random() < .5 ? 1 : -1, size = rand(.6, 1.5), count = Math.round(rand(7, 13) * (small() ? .6 : 1));
    return {
      dir, size, x: fromStart ? rand(0, W) : (dir > 0 ? -220 : W + 220), y: rand(H * .12, H * .78), speed: rand(34, 80) * (.6 + size * .4) * dir, bob: rand(0, 6),
      color: ['#e8f9ff', '#ffe3a0', '#a8dcff', '#ffbfa8', '#cfe9ff'][Math.floor(rand(0, 5))],
      fish: Array.from({ length: count }, () => ({ ox: rand(-70, 70) * size, oy: rand(-34, 34) * size, ph: rand(0, 6.3), s: rand(.8, 1.2) }))
    };
  };
  const schools = Array.from({ length: small() ? 3 : 5 }, () => makeSchool(true));
  const drawFish = (x, y, dir, s, alpha, wag) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.quadraticCurveTo(2, -4.6, -6, 0); ctx.quadraticCurveTo(2, 4.6, 9, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-11, -3.6 + wag); ctx.lineTo(-11, 3.6 + wag); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(1, -3.4); ctx.lineTo(-3, -6.4); ctx.lineTo(-4, -2.6); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = Math.min(1, alpha * 1.6); ctx.fillStyle = '#10304a'; ctx.beginPath(); ctx.arc(5.2, -.7, .9, 0, 6.283); ctx.fill();
    ctx.restore();
  };

  // Jellyfish: a pulsing bell with trailing tentacles and a soft glow.
  const makeJelly = () => ({ x: rand(.04, .96) * W, y: rand(.15, 1.05) * H, r: rand(16, 34), vy: -rand(5, 13), sway: rand(0, 6), hue: rand(300, 330), depth: rand(.5, 1) });
  const jellies = Array.from({ length: small() ? 3 : 6 }, makeJelly);
  const glow = (hue, alpha) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `hsla(${hue},90%,82%,${alpha})`); g.addColorStop(.55, `hsla(${hue},85%,70%,${alpha * .35})`); g.addColorStop(1, `hsla(${hue},85%,70%,0)`); return g;
  };

  // Marine snow: tiny motes at different depths that drift and slide with the scroll.
  const motes = Array.from({ length: small() ? 45 : 90 }, () => ({ x: rand(0, 1), y: rand(0, 1), z: rand(.2, 1), ph: rand(0, 6.3) }));

  // Kelp along the sea floor.
  const kelpCount = small() ? 8 : 16;
  const kelp = Array.from({ length: kelpCount }, (_, i) => ({ x: (i + rand(.1, .9)) / kelpCount, h: rand(.14, .32), ph: rand(0, 6.3), sp: rand(.5, 1.1), w: rand(5, 11), hue: rand(150, 175) }));

  // The odd manta ray, very far away.
  let manta = null, nextManta = rand(6, 14);
  const drawManta = (m, t) => {
    ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.dir * m.s, m.s); ctx.globalAlpha = m.a;
    const flap = Math.sin(t * 1.4) * 14;
    ctx.beginPath(); ctx.moveTo(60, 0); ctx.quadraticCurveTo(10, -34 - flap, -48, -58 - flap * 1.6); ctx.quadraticCurveTo(-20, -6, -34, 0);
    ctx.quadraticCurveTo(-20, 6, -48, 58 + flap * 1.6); ctx.quadraticCurveTo(10, 34 + flap, 60, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-80, 4 + flap * .3, -130, 2 - flap * .4); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  };

  // Bubble columns rising from vents on the sea floor.
  const vents = Array.from({ length: small() ? 2 : 4 }, () => ({ x: rand(.08, .92), next: rand(0, 1), bubbles: [] }));
  // The odd sea turtle, gliding slowly.
  let turtle = null, nextTurtle = rand(14, 26);
  const drawTurtle = (m, t) => {
    ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.dir * m.s, m.s); ctx.globalAlpha = m.a;
    const flap = Math.sin(t * 1.6) * .5;
    ctx.fillStyle = '#2f7a62'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 24, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#58a88a'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2f7a62'; ctx.beginPath(); ctx.ellipse(40, -2, 10, 7, 0, 0, 6.283); ctx.fill();
    for (const sy of [-1, 1]) {
      ctx.save(); ctx.translate(14, sy * 16); ctx.rotate(sy * (.7 + flap)); ctx.beginPath(); ctx.ellipse(0, sy * 14, 7, 22, 0, 0, 6.283); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(-22, sy * 11); ctx.rotate(sy * (.5 - flap * .5)); ctx.beginPath(); ctx.ellipse(0, sy * 9, 5, 12, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  };
  const rays = Array.from({ length: 6 }, (_, i) => ({ x: (i + .5) / 6 + rand(-.05, .05), w: rand(.05, .12), ph: rand(0, 6.3), sp: rand(.12, .3) }));

  let last = performance.now(), t = 0, depth = 0;
  const frame = (now, still) => {
    if (!still) requestAnimationFrame(frame);
    if (document.hidden && !still) { last = now; return; }
    const dt = Math.min((now - last) / 1000, .05); last = now; t += dt * (reduced.matches ? .2 : 1);
    depth = Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - H)));
    ctx.clearRect(0, 0, W, H);

    // Light shafts fade with depth.
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const ray of rays) {
      const a = (.07 + Math.sin(t * ray.sp + ray.ph) * .035) * (1 - depth * .75), x = ray.x * W + Math.sin(t * .1 + ray.ph) * 60, w = ray.w * W;
      const g = ctx.createLinearGradient(0, 0, 0, H * .9); g.addColorStop(0, `rgba(210,245,255,${a})`); g.addColorStop(1, 'rgba(210,245,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w * .15, 0); ctx.lineTo(x + w * .15, 0); ctx.lineTo(x + w * 1.1 - 120, H * .9); ctx.lineTo(x - w * 1.1 - 120, H * .9); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // Caustics: rippling light bands near the surface.
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const yy = (i / 12) * H * .5 + 10; ctx.strokeStyle = `rgba(225,250,255,${(.05 + Math.sin(t * .6 + i) * .025) * (1 - depth * .8)})`;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 24) { const y = yy + Math.sin(x * .012 + t * .9 + i * 1.7) * 9 + Math.sin(x * .031 - t * 1.3 + i) * 4; if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();

    // Marine snow.
    ctx.fillStyle = '#e6fbff';
    for (const m of motes) {
      const y = ((m.y * H + t * 8 * m.z - scrollY * .25 * m.z) % H + H) % H, x = (m.x * W + Math.sin(t * .4 + m.ph) * 14 * m.z + W) % W;
      ctx.globalAlpha = (.12 + .3 * m.z) * (.6 + Math.sin(t + m.ph) * .4); ctx.beginPath(); ctx.arc(x, y, .6 + m.z * 1.5, 0, 6.283); ctx.fill();
    }

    // Manta.
    nextManta -= dt;
    if (!manta && nextManta <= 0) { const dir = Math.random() < .5 ? 1 : -1; manta = { dir, x: dir > 0 ? -200 : W + 200, y: rand(H * .2, H * .6), s: rand(.8, 1.4), a: .1, v: 24 * dir }; }
    if (manta) {
      ctx.fillStyle = ctx.strokeStyle = '#0e3a5a'; manta.x += manta.v * dt; manta.y += Math.sin(t * .5) * .12; drawManta(manta, t);
      if ((manta.dir > 0 && manta.x > W + 260) || (manta.dir < 0 && manta.x < -260)) { manta = null; nextManta = rand(25, 50); }
    }

    // Fish schools.
    for (let i = 0; i < schools.length; i++) {
      const sc = schools[i]; ctx.fillStyle = sc.color; sc.x += sc.speed * dt; sc.bob += dt;
      const lead = sc.y + Math.sin(sc.bob * .6) * 30, alpha = (.5 - depth * .25) * Math.min(1, .45 + sc.size * .3);
      for (const f of sc.fish) drawFish(sc.x + f.ox + Math.sin(t * 1.1 + f.ph) * 8, lead + f.oy + Math.sin(t * 1.6 + f.ph) * 6, sc.dir, sc.size * f.s, alpha, Math.sin(t * 9 + f.ph) * 1.4);
      if ((sc.dir > 0 && sc.x > W + 260) || (sc.dir < 0 && sc.x < -260)) schools[i] = makeSchool(false);
    }

    // Jellyfish glow brighter the deeper you go.
    for (const j of jellies) {
      j.y += j.vy * dt; j.x += Math.sin(t * .3 + j.sway) * 6 * dt;
      if (j.y < -120) { j.y = H + 120; j.x = rand(.04, .96) * W; }
      const pulse = 1 + Math.sin(t * 1.8 + j.sway) * .12, r = j.r * pulse, alpha = (.28 + depth * .45) * j.depth;
      ctx.save(); ctx.translate(j.x, j.y);
      ctx.save(); ctx.scale(r * 3.2, r * 3.2); ctx.fillStyle = glow(j.hue, alpha * .5); ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.283); ctx.fill(); ctx.restore();
      ctx.fillStyle = `hsla(${j.hue},85%,82%,${alpha})`; ctx.strokeStyle = `hsla(${j.hue},85%,86%,${alpha * .8})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * .72 * (2 - pulse), 0, Math.PI, 0); ctx.quadraticCurveTo(r * .5, r * .32, 0, r * .18); ctx.quadraticCurveTo(-r * .5, r * .32, -r, 0); ctx.fill();
      for (let n = -2; n <= 2; n++) { ctx.beginPath(); ctx.moveTo(n * r * .36, r * .15); for (let s = 1; s <= 5; s++) ctx.lineTo(n * r * .36 + Math.sin(t * 2 + n + s * .9 + j.sway) * 4 * s * .6, r * .15 + s * r * .42); ctx.stroke(); }
      ctx.restore();
    }

    // Sea floor glow, bubble vents and the turtle.
    { const sand = ctx.createLinearGradient(0, H * .84, 0, H); sand.addColorStop(0, 'rgba(255,236,190,0)'); sand.addColorStop(1, `rgba(255,236,190,${.16 - depth * .08})`); ctx.fillStyle = sand; ctx.fillRect(0, H * .84, W, H * .16); }
    for (const v of vents) {
      v.next -= dt; if (v.next <= 0) { v.next = rand(.15, .45); v.bubbles.push({ y: H - 4, r: rand(1.5, 4.5), ph: rand(0, 6.3), vy: rand(40, 90) }); }
      ctx.strokeStyle = 'rgba(230,250,255,.5)'; ctx.fillStyle = 'rgba(230,250,255,.12)'; ctx.lineWidth = 1;
      for (let i = v.bubbles.length - 1; i >= 0; i--) {
        const b = v.bubbles[i]; b.y -= b.vy * dt; b.r += dt * .8; if (b.y < -20) { v.bubbles.splice(i, 1); continue; }
        ctx.globalAlpha = .5 * (b.y / H + .2); ctx.beginPath(); ctx.arc(v.x * W + Math.sin(b.y * .03 + b.ph) * 8, b.y, b.r, 0, 6.283); ctx.fill(); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    nextTurtle -= dt;
    if (!turtle && nextTurtle <= 0) { const dir = Math.random() < .5 ? 1 : -1; turtle = { dir, x: dir > 0 ? -120 : W + 120, y: rand(H * .25, H * .65), s: rand(.9, 1.5), a: .3, v: 20 * dir }; }
    if (turtle) {
      turtle.x += turtle.v * dt; turtle.y += Math.sin(t * .4) * .15; drawTurtle(turtle, t);
      if ((turtle.dir > 0 && turtle.x > W + 160) || (turtle.dir < 0 && turtle.x < -160)) { turtle = null; nextTurtle = rand(40, 70); }
    }

    // Kelp.
    ctx.lineCap = 'round';
    for (const k of kelp) {
      const x = k.x * W, h = k.h * H, segs = 7; ctx.strokeStyle = `hsla(${k.hue},45%,${30 - depth * 12}%,${.5 - depth * .15})`; ctx.lineWidth = k.w;
      ctx.beginPath(); ctx.moveTo(x, H + 4);
      for (let s = 1; s <= segs; s++) { const p = s / segs; ctx.lineTo(x + Math.sin(t * k.sp + k.ph + p * 2.2) * 18 * p * p + Math.sin(t * .4 + k.ph) * 6 * p, H - h * p); }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  if (reduced.matches) { frame(performance.now(), true); addEventListener('scroll', () => frame(performance.now(), true), { passive: true }); }
  else requestAnimationFrame(frame);
})();
