// Shark scene change: a round, many-toothed shark mouth looms over the whole screen, then snaps shut with a crunch.
// SharkChomp.bite() plays the full bite, SharkChomp.run(midpoint) bites, runs midpoint() in the dark, then opens again.
// A mouth left shut at the end of one page (sessionStorage 'ha-chomp') is shut again at the start of the next, then opens.
(() => {
  const KEY = 'ha-chomp';
  let carried = false;
  try { carried = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  if (carried) document.documentElement.classList.add('chomp-in');

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---- Sound: everything is synthesised, no audio files. ----
  let audio = null, master = null;
  const sound = () => {
    try {
      if (!audio) {
        const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return null;
        audio = new Context(); master = audio.createGain(); master.gain.value = .85;
        const squash = audio.createDynamicsCompressor(); master.connect(squash); squash.connect(audio.destination);
      }
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      return audio;
    } catch { return null; }
  };
  const noiseBuffer = context => {
    const buffer = context.createBuffer(1, context.sampleRate * 1.2, context.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  };
  const burst = (context, { at = 0, dur = .15, type = 'bandpass', freq = 1500, q = 1, gain = .6, sweepTo }) => {
    const src = context.createBufferSource(); src.buffer = noiseBuffer(context);
    const filter = context.createBiquadFilter(); filter.type = type; filter.frequency.setValueAtTime(freq, context.currentTime + at); filter.Q.value = q;
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, context.currentTime + at + dur);
    const amp = context.createGain(); amp.gain.setValueAtTime(.0001, context.currentTime + at);
    amp.gain.exponentialRampToValueAtTime(gain, context.currentTime + at + Math.min(.03, dur * .3)); amp.gain.exponentialRampToValueAtTime(.0001, context.currentTime + at + dur);
    src.connect(filter); filter.connect(amp); amp.connect(master); src.start(context.currentTime + at, Math.random() * .5, dur + .05);
  };
  const tone = (context, { at = 0, dur = .3, from = 100, to = 40, gain = .8, type = 'sine' }) => {
    const osc = context.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(from, context.currentTime + at); osc.frequency.exponentialRampToValueAtTime(to, context.currentTime + at + dur);
    const amp = context.createGain(); amp.gain.setValueAtTime(gain, context.currentTime + at); amp.gain.exponentialRampToValueAtTime(.0001, context.currentTime + at + dur);
    osc.connect(amp); amp.connect(master); osc.start(context.currentTime + at); osc.stop(context.currentTime + at + dur + .05);
  };
  const sfx = {
    // The mouth rushes toward you: rising water rush and a growl.
    loom() {
      const a = sound(); if (!a) return;
      burst(a, { dur: 1, freq: 160, sweepTo: 1500, q: 1.4, gain: .7 });
      burst(a, { at: .05, dur: .95, type: 'lowpass', freq: 220, sweepTo: 900, gain: .5 });
      tone(a, { dur: 1.2, from: 52, to: 96, gain: .22, type: 'sawtooth' });
    },
    // The bite: a deep thump, a wet crack and a handful of crunchy clicks.
    bite() {
      const a = sound(); if (!a) return;
      tone(a, { dur: .45, from: 170, to: 38, gain: 1 });
      burst(a, { dur: .5, type: 'lowpass', freq: 420, gain: .8 });
      burst(a, { dur: .14, type: 'highpass', freq: 1800, gain: .9 });
      for (let i = 0; i < 7; i++) burst(a, { at: .02 + i * .035 + Math.random() * .02, dur: .06, freq: 900 + Math.random() * 2400, q: 3, gain: .5 });
    },
    // The mouth lets go: a soft swirl of bubbles.
    release() {
      const a = sound(); if (!a) return;
      burst(a, { dur: .9, freq: 1400, sweepTo: 260, q: .8, gain: .3 });
      for (let i = 0; i < 9; i++) tone(a, { at: i * .08 + Math.random() * .05, dur: .09, from: 380 + Math.random() * 300, to: 900 + Math.random() * 700, gain: .09 });
    }
  };

  // ---- The mouth: rings of triangular teeth around a hole whose radius we animate, drawn on one canvas. ----
  let canvas = null, ctx = null, W = 0, H = 0, dpr = 1;
  const state = { rho: 1e5, throat: 0, rot: 0, shake: 0 }; // rho: radius of the open hole in px; hidden = larger than the screen.
  const geometry = () => {
    const tooth = clamp(Math.min(W, H) * .13, 58, 150);
    return { tooth, hidden: Math.hypot(W, H) / 2 + tooth * 3.4, wide: Math.min(W, H) * .36 };
  };
  const rings = [{ n: 18, scale: 1, spin: 1 }, { n: 24, scale: .86, spin: -1 }, { n: 30, scale: .72, spin: 1 }];
  function draw() {
    if (!ctx) return;
    const { tooth, hidden } = geometry(); const cx = W / 2, cy = H / 2, rho = state.rho;
    ctx.clearRect(0, 0, W, H);
    canvas.style.pointerEvents = rho < hidden * .98 ? 'auto' : 'none';
    if (rho >= hidden) return;
    ctx.save(); if (state.shake) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
    // Gum: everything outside the hole, deep red toward the edge.
    const gum = ctx.createRadialGradient(cx, cy, Math.max(rho, 1), cx, cy, hidden);
    gum.addColorStop(0, '#9a3350'); gum.addColorStop(.35, '#6a1a30'); gum.addColorStop(1, '#1b0610');
    ctx.fillStyle = gum; ctx.fillRect(-40, -40, W + 80, H + 80);
    // The hole shows the page, darkening into the throat as the mouth opens.
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(cx, cy, rho, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    if (state.throat > 0 && rho > 2) {
      const throat = ctx.createRadialGradient(cx, cy, 0, cx, cy, rho);
      throat.addColorStop(0, `rgba(12,2,6,${.92 * state.throat})`); throat.addColorStop(.6, `rgba(27,6,16,${.55 * state.throat})`); throat.addColorStop(1, `rgba(27,6,16,${.15 * state.throat})`);
      ctx.fillStyle = throat; ctx.beginPath(); ctx.arc(cx, cy, rho, 0, Math.PI * 2); ctx.fill();
    }
    // Teeth: the outermost row first, so the front row overlaps the rows behind it.
    for (let k = rings.length - 1; k >= 0; k--) {
      const ring = rings[k], h = tooth * ring.scale, apex = rho + k * tooth * .62, base = apex + h, half = Math.PI / ring.n * .82, offset = state.rot * ring.spin + k * Math.PI / ring.n;
      const shade = ctx.createRadialGradient(cx, cy, apex, cx, cy, base);
      shade.addColorStop(0, '#fffdf6'); shade.addColorStop(.7, '#f0e6cf'); shade.addColorStop(1, '#bfae8c');
      ctx.fillStyle = shade; ctx.strokeStyle = 'rgba(70,40,30,.55)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
      for (let i = 0; i < ring.n; i++) {
        const a = offset + i / ring.n * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a - half) * base, cy + Math.sin(a - half) * base);
        ctx.lineTo(cx + Math.cos(a) * apex, cy + Math.sin(a) * apex);
        ctx.lineTo(cx + Math.cos(a + half) * base, cy + Math.sin(a + half) * base);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }
  const resize = () => { if (!canvas) return; dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
  const build = () => {
    if (canvas) return canvas;
    canvas = document.createElement('canvas'); canvas.className = 'shark-jaws'; canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d'); document.body.append(canvas); addEventListener('resize', resize); W = innerWidth; H = innerHeight; resize(); return canvas;
  };
  const tween = (props, ms, easing) => new Promise(resolve => {
    const from = Object.fromEntries(Object.keys(props).map(key => [key, state[key]])), start = performance.now();
    const step = now => {
      const p = clamp((now - start) / ms, 0, 1), e = easing(p);
      for (const key in props) state[key] = from[key] + (props[key] - from[key]) * e;
      draw(); if (p < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  const outCubic = p => 1 - Math.pow(1 - p, 3), inCubic = p => p * p * p, inOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const spin = ms => { const start = performance.now(), from = state.rot; const step = now => { if (now - start > ms) return; state.rot = from + (now - start) / 1000 * .5; requestAnimationFrame(step); }; requestAnimationFrame(step); };
  const remember = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ } };

  const shut = async (options = {}) => {
    build(); if (options.remember) remember();
    state.throat = 0; await tween({ rho: 0 }, reduced() ? 10 : 300, inCubic);
  };
  // The full bite: the mouth looms over the screen, holds, then snaps shut with a shake and a crunch.
  const bite = async (options = {}) => {
    build(); const g = geometry();
    if (options.remember) remember();
    if (reduced()) { state.rho = 0; draw(); return; }
    state.rho = g.hidden; draw();
    sfx.loom(); spin(1600);
    await tween({ rho: g.wide, throat: 1 }, 900, outCubic);
    await tween({ rho: g.wide * 1.04 }, 420, p => Math.sin(p * Math.PI * 3) * .5 + p * .5);
    state.throat = 0; sfx.bite();
    await tween({ rho: 0, throat: 0 }, 260, inCubic);
    const start = performance.now();
    await new Promise(resolve => { const step = now => { const p = (now - start) / 480; state.shake = 26 * (1 - clamp(p, 0, 1)); draw(); if (p < 1) requestAnimationFrame(step); else resolve(); }; requestAnimationFrame(step); });
    state.shake = 0; draw();
  };
  const open = async () => { build(); sfx.release(); await tween({ rho: geometry().hidden, throat: 0 }, reduced() ? 10 : 1000, inOut); };
  const run = async midpoint => { await bite(); try { await midpoint?.(); } finally { await wait(150); await open(); } };

  addEventListener('DOMContentLoaded', async () => {
    if (!carried) return;
    build(); state.rho = 0; state.throat = 0; draw();
    document.documentElement.classList.remove('chomp-in');
    await new Promise(resolve => (document.readyState === 'complete' ? resolve() : addEventListener('load', resolve, { once: true })));
    await wait(450);
    open();
  });
  window.SharkChomp = { shut, bite, open, run };
})();
