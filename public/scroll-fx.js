// Gentle depth parallax on the scrapbook: blocks drift at slightly different speeds as they cross the screen, so the page feels layered.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layers = [['.hero-scribble', .35], ['.section-heading', -.1], ['.photo-card', .09], ['.counter-box', -.08], ['.music-card', .07], ['.closing-stars', -.2], ['.ocean-finale', .06]];
  const items = [];
  for (const [selector, speed] of layers) document.querySelectorAll(selector).forEach((el, i) => items.push({ el, speed: speed * (i % 2 ? -1 : 1) * (selector === '.photo-card' ? 1 : Math.sign(speed) * Math.sign(speed)) }));
  let queued = false;
  const update = () => {
    queued = false;
    for (const { el, speed } of items) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > innerHeight + 200) continue;
      const p = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      el.style.translate = `0 ${(-p * speed * innerHeight).toFixed(1)}px`;
    }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
