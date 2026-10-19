// Small synthesized paper sounds, created only after a deliberate interaction.
(() => {
  let context, noise;
  const active = new Set();
  const unlock = () => {
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (!noise) {
        noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      if (context.state === 'suspended') context.resume().catch(() => {});
    } catch { return false; }
    return true;
  };
  function rustle(at, length, volume, frequency) {
    const source = context.createBufferSource(); source.buffer = noise;
    const filter = context.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.setValueAtTime(frequency, at); filter.Q.value = .65;
    const gain = context.createGain(); gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .012); gain.gain.exponentialRampToValueAtTime(.001, at + length);
    source.connect(filter).connect(gain).connect(context.destination); active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(at, Math.random() * .5, length);
  }
  const stop = () => { for (const source of active) { try { source.stop(); } catch {} } active.clear(); };
  window.HA_SFX = {
    unlock, stop,
    shuffle(duration) {
      if (!unlock()) return;
      const now = context.currentTime;
      for (let time = 0; time < duration; time += .085) rustle(now + time, .095, .065 + Math.random() * .025, 2100 + Math.random() * 1900);
    },
    paper() {
      if (!unlock()) return;
      const now = context.currentTime;
      for (let i = 0; i < 12; i++) rustle(now + i * .055, .11 + Math.random() * .06, .045 + Math.random() * .05, 900 + Math.random() * 2400);
    }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();