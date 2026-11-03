// Underwater light over the login photo wall, plus where the 3D shark rests.
(() => {
  const scene = document.querySelector('.login-scene');
  if (scene) {
    const water = document.createElement('div'); water.className = 'ocean-water'; water.setAttribute('aria-hidden', 'true');
    water.innerHTML = '<div class="ocean-veil"></div><div class="ocean-surface"></div><div class="ocean-rays"><i></i><i></i><i></i><i></i><i></i></div><div class="ocean-caustics"></div><div class="ocean-deep"></div>';
    for (let i = 0; i < 22; i++) {
      const bubble = document.createElement('b'); bubble.className = 'ocean-bubble';
      bubble.style.cssText = `--x:${(i * 37) % 100}%;--size:${4 + (i * 7) % 14}px;--time:${9 + (i * 5) % 11}s;--delay:${-(i * 1.7) % 14}s;--sway:${(i % 2 ? 1 : -1) * (8 + i % 5 * 4)}px`;
      water.append(bubble);
    }
    scene.append(water);
  }

  // The shell isolates its layers; the shark joins them so phones can tuck it behind the glass.
  const fish = document.getElementById('fish'); document.querySelector('.login-shell')?.prepend(fish);

  // The lead shark roams the whole screen, left and right (behind the glass panel); when the form is hidden it is bigger.
  // Companions of other colours and sizes cross at different depths. While logging in it charges the camera instead.
  const panel = document.querySelector('.login-panel');
  const poses = {
    desktop: { x: 0, y: -.05, s: 1.55, yaw: 28, pitch: 4, roll: -4 },
    open: { x: 0, y: -.02, s: 2.1, yaw: 150, pitch: 6, roll: 4 },
    mobile: { x: 0, y: .25, s: 1.2, yaw: 155, pitch: 4, roll: 0 },
    mobileOpen: { x: 0, y: .05, s: 1.5, yaw: 150, pitch: 6, roll: 4 },
    voyage: { x: 0, y: -.02, z: 2.6, s: 3.4, yaw: 90, pitch: 0, roll: 0, fixed: true }
  };
  window.FISH_PATH = {
    roam: true,
    pose(mobile) {
      if (document.body.classList.contains('entering')) return poses.voyage;
      const hidden = panel?.classList.contains('is-hidden');
      return mobile ? (hidden ? poses.mobileOpen : poses.mobile) : (hidden ? poses.open : poses.desktop);
    },
    companions: [
      { palette: 'teal', s: .95, y: .38, z: -.8, speed: .11, amp: .09 },
      { palette: 'indigo', s: .7, y: -.45, z: -1.6, speed: .15, amp: .12 },
      { palette: 'slate', s: 1.15, y: -.15, z: -2.4, speed: .08, amp: .07 },
      { palette: 'teal', s: .55, y: .62, z: -2.8, speed: .17, amp: .1 }
    ]
  };
  // Logging in: the shark charges at the camera, then its jaws close over the whole screen as the scrapbook loads.
  new MutationObserver(() => {
    if (!document.body.classList.contains('entering') || window.__chomped) return;
    window.__chomped = true;
    setTimeout(() => window.SharkChomp?.bite({ remember: true }), 1300);
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // Never keep the page behind the loader, even if WebGL or the CDN fails.
  setTimeout(() => { document.getElementById('loader')?.classList.add('done'); document.body.classList.add('loaded'); }, 2500);
})();
