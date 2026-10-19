// Small finishing touches; scenery never captures a click or a swipe.
(() => {
  const noticeKey = 'ha-device-note-seen-v1';
  let noticeSeen = false;
  try { noticeSeen = localStorage.getItem(noticeKey) === '1'; } catch {}
  if (!noticeSeen) {
    const intro = document.querySelector('#intro');
    const showNotice = () => {
      if (noticeSeen) return;
      noticeSeen = true;
      try { localStorage.setItem(noticeKey, '1'); } catch {}
      const note = document.createElement('aside');
      note.className = 'device-invitation'; note.setAttribute('role', 'status');
      note.innerHTML = '<span aria-hidden="true">▯ &nbsp;▱</span><p>Mỗi màn hình có một điều dễ thương riêng.<br>Em thử cả điện thoại và máy tính nhé ♡</p><button type="button" aria-label="Đóng thông báo trải nghiệm">×</button>';
      document.body.append(note);
      let closing = false;
      const dismiss = () => { if (closing) return; closing = true; clearTimeout(timer); note.classList.add('is-leaving'); setTimeout(() => note.remove(), 450); };
      const timer = setTimeout(dismiss, 9000);
      note.querySelector('button').addEventListener('click', dismiss);
    };
    if (intro) {
      const noticeObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { showNotice(); noticeObserver.disconnect(); }
      }, { threshold: .35 });
      noticeObserver.observe(intro);
    }
  }
  const pin = document.querySelector('.letter-paper .paper-pin');
  if (pin) pin.innerHTML = '<i class="pin-needle"></i><i class="pin-body"></i><i class="pin-base"></i><i class="pin-cap"></i>';

  const record = document.querySelector('.record-wrap');
  if (record) {
    const arm = document.createElement('div'); arm.className = 'tonearm'; arm.setAttribute('aria-hidden', 'true');
    arm.innerHTML = '<span class="arm-pivot"></span><span class="arm-stem"></span><span class="arm-cartridge"></span>';
    record.append(arm);
    const icons = document.createElement('div'); icons.className = 'music-icon-field'; icons.setAttribute('aria-hidden', 'true');
    ['♫','✧','♡','♪','✦','♬','♡','✧','♪','♫','✦','♡','♬','✧'].forEach((symbol, i) => {
      const icon = document.createElement('span'); icon.textContent = symbol;
      icon.style.cssText = `--icon-x:${5 + i * 29 % 91}%;--icon-y:${7 + i * 37 % 80}%;--icon-time:${9 + i % 5 * 2}s;--icon-delay:${-i * 1.7}s;--icon-size:${19 + i % 4 * 8}px`;
      icons.append(icon);
    });
    document.querySelector('.music-card').prepend(icons);
  }

  const stops = [...document.querySelectorAll('.journey-stop')];
  let scrollQueued = false;
  function lightJourney() {
    scrollQueued = false;
    const focus = innerHeight * .55;
    let nearest = null, distance = Infinity;
    for (const stop of stops) {
      const card = stop.querySelector('.journey-card');
      const rect = card.getBoundingClientRect();
      const gap = Math.abs(rect.top + rect.height / 2 - focus);
      if (rect.bottom > 80 && rect.top < innerHeight && gap < distance) { nearest = stop; distance = gap; }
    }
    stops.forEach(stop => stop.classList.toggle('journey-current', stop === nearest));
  }
  function queueJourney() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(lightJourney); } }
  addEventListener('scroll', queueJourney, { passive: true });
  addEventListener('resize', queueJourney, { passive: true });
  lightJourney();

  const pointerAllowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const layer = document.createElement('div'); layer.className = 'cursor-school'; layer.setAttribute('aria-hidden', 'true');
  const halo = document.createElement('div'); halo.className = 'pointer-light'; halo.setAttribute('aria-hidden', 'true');
  document.body.append(layer, halo);
  const fish = Array.from({ length: 3 }, (_, i) => {
    const node = document.createElement('div'); node.className = 'following-fish';
    node.innerHTML = '<svg viewBox="0 0 100 48"><path d="M22 24Q52-8 85 24Q52 56 22 24L5 8V40Z" fill="currentColor"/><path d="M51 10q-9 14 0 28m9-29q-9 15 0 30" fill="none" stroke="#fff8" stroke-width="3"/><circle cx="73" cy="21" r="2" fill="#174b61"/></svg>';
    node.style.width = `${32 + i * 8}px`; layer.append(node);
    return { node, x: 0, y: 0, angle: 0 };
  });
  let targetX = 0, targetY = 0, pointerOn = false, frame = 0, previous = 0;
  function swim(now) {
    if (!pointerOn || document.hidden || !pointerAllowed.matches) { frame = 0; previous = 0; return; }
    const dt = previous ? Math.min(40, now - previous) : 16; previous = now;
    fish.forEach((f, i) => {
      const phase = now * .00022 + i * 2.1;
      const x = Math.max(20, Math.min(innerWidth - 65, targetX + Math.cos(phase) * (95 + i * 22)));
      const y = Math.max(20, Math.min(innerHeight - 40, targetY + Math.sin(phase) * (60 + i * 18)));
      const dx = x - f.x, dy = y - f.y;
      // A very slow current: even a large pointer jump cannot make fish dart.
      const easing = 1 - Math.exp(-dt / (5500 + i * 1400));
      const travel = Math.hypot(dx, dy) * easing;
      const step = Math.min(easing, (.012 - i * .0015) * dt / (Math.hypot(dx, dy) || 1));
      f.x += dx * step;
      f.y += dy * step;
      const facing = Math.atan2(dy, dx) * 180 / Math.PI;
      let delta = ((facing - f.angle + 540) % 360) - 180;
      if (travel > .005) f.angle += delta * (1 - Math.exp(-dt / 1800));
      f.node.style.transform = `translate3d(${f.x}px,${f.y}px,0) rotate(${f.angle}deg)`;
    });
    frame = requestAnimationFrame(swim);
  }
  function hidePointer() { pointerOn = false; layer.classList.remove('is-visible'); halo.classList.remove('is-visible'); if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; }
  addEventListener('pointermove', event => {
    if (!pointerAllowed.matches || event.pointerType === 'touch') return;
    targetX = event.clientX; targetY = event.clientY;
    if (!pointerOn) fish.forEach((f, i) => { f.x = targetX - 150 - i * 35; f.y = targetY + 60 + i * 20; });
    pointerOn = true;
    halo.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
    layer.classList.add('is-visible'); halo.classList.add('is-visible');
    if (!frame) frame = requestAnimationFrame(swim);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hidePointer);
  addEventListener('blur', hidePointer);
  pointerAllowed.addEventListener('change', hidePointer);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hidePointer(); });
})();
