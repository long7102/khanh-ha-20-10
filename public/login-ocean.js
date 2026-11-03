// Underwater light over the login photo wall, plus where the 3D fish rests.
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

  // The shell isolates its layers; the fish joins them so phones can tuck it behind the glass.
  const fish = document.getElementById('fish'); document.querySelector('.login-shell')?.prepend(fish);

  // Rest beside the glass panel; swim to the middle when the form is hidden to look at the sea.
  const panel = document.querySelector('.login-panel');
  const poses = {
    desktop: { x: -.62, y: -.08, s: .78, yaw: 28, pitch: 4, roll: -4 },
    open: { x: .02, y: -.02, s: 1.05, yaw: 150, pitch: 6, roll: 4 },
    mobile: { x: .3, y: .3, s: .62, yaw: 155, pitch: 4, roll: 0 },
    mobileOpen: { x: 0, y: .05, s: .85, yaw: 150, pitch: 6, roll: 4 },
    voyage: { x: 1.6, y: -.3, s: .9, yaw: 10, pitch: -8, roll: 0 }
  };
  window.FISH_PATH = {
    pose(mobile) {
      if (document.body.classList.contains('entering')) return poses.voyage;
      const hidden = panel?.classList.contains('is-hidden');
      return mobile ? (hidden ? poses.mobileOpen : poses.mobile) : (hidden ? poses.open : poses.desktop);
    }
  };
  // Never keep the page behind the loader, even if WebGL or the CDN fails.
  setTimeout(() => { document.getElementById('loader')?.classList.add('done'); document.body.classList.add('loaded'); }, 2500);
})();
