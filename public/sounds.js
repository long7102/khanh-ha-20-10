// Paper transients, unlocked only by a deliberate gift or letter interaction.
(() => {
  let context, noise, bus;
  const active = new Set();
  const unlock = () => {
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (!noise) {
        noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const samples = noise.getChannelData(0);
        let low = 0;
        for (let i = 0; i < samples.length; i++) {
          const white = Math.random() * 2 - 1; low = low * .8 + white * .2;
          samples[i] = white * .55 + low * .8;
        }
        bus = context.createGain(); bus.gain.value = .7; bus.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { return false; }
    return true;
  };
  function grain(at, duration, volume, frequency, scrape = false) {
    const source = context.createBufferSource(); source.buffer = noise;
    const filter = context.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = scrape ? .45 : .8;
    filter.frequency.setValueAtTime(frequency, at);
    filter.frequency.exponentialRampToValueAtTime(frequency * .55, at + duration);
    const gain = context.createGain(); gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + Math.min(scrape ? .025 : .002, duration * .2));
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.playbackRate.value = .85 + Math.random() * .3;
    source.connect(filter).connect(gain).connect(bus); active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(at, Math.random(), duration);
  }
  const stop = () => { for (const source of active) { try { source.stop(); } catch {} } active.clear(); };
  window.HA_SFX = {
    unlock, stop,
    shuffle(duration = 4) {
      if (!unlock()) return;
      stop(); const now = context.currentTime + .015;
      // Uneven card flicks replace the former continuous hiss.
      for (let t = 0; t < duration - .06;) {
        grain(now + t, .035, .2, 950 + Math.random() * 900);
        grain(now + t + .012, .045, .11, 3100 + Math.random() * 1600);
        if (Math.random() > .6) grain(now + t, .07, .05, 650, true);
        t += .065 + Math.random() * .045;
      }
    },
    paper() {
      if (!unlock()) return;
      const now = context.currentTime + .01;
      // Top fold, bottom fold and a last soft squeeze during the return.
      [0, .22, .68].forEach((start, fold) => {
        grain(now + start, .28 + fold * .035, .13, 1250 - fold * 130, true);
        for (let i = 0; i < 9; i++) {
          const t = start + i * .025 + Math.random() * .014;
          grain(now + t, .012 + Math.random() * .026, .08 + Math.random() * .1, 1600 + Math.random() * 3100);
        }
        grain(now + start + .19, .055, .12, 620 + fold * 120);
      });
    }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
