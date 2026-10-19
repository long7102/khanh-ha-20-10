/* The same small static site, with one continuous sea and a quiet reading centre. */
(() => {
  if (!document.body.classList.contains('site-body')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const atmosphere = document.createElement('div');
  atmosphere.className = 'depth-atmosphere'; atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = '<div class="distant-light"></div><svg class="distant-jelly jelly-one" viewBox="0 0 100 180"><path d="M12 60Q10 5 50 6Q90 5 88 60Q50 43 12 60Z"/><g fill="none"><path d="M24 58q-20 30 0 55t-2 55M42 54q-15 30 0 50t0 62M60 54q20 25 0 55t0 56M77 59q22 30 0 57"/></g></svg><svg class="distant-jelly jelly-two" viewBox="0 0 100 180"><path d="M12 60Q10 5 50 6Q90 5 88 60Q50 43 12 60Z"/><g fill="none"><path d="M24 58q-20 30 0 55t-2 55M42 54q-15 30 0 50t0 62M60 54q20 25 0 55t0 56M77 59q22 30 0 57"/></g></svg>';
  for (let i = 0; i < 12; i++) {
    const bubble = document.createElement('i'); bubble.className = 'depth-bubble';
    bubble.style.cssText = `--bubble-x:${i % 2 ? 92 + i % 5 : 2 + i % 6}%;--bubble-size:${3 + i % 4 * 3}px;--bubble-time:${19 + i * 2}s;--bubble-delay:${-i * 4.5}s`;
    atmosphere.append(bubble);
  }
  document.body.prepend(atmosphere);
  const depthMarker = document.createElement('div'); depthMarker.className = 'sea-depth-marker'; depthMarker.setAttribute('aria-hidden', 'true');
  depthMarker.innerHTML = '<span class="depth-dots"><i></i><i></i><i></i></span><span class="depth-name">MẶT NƯỚC</span>';
  document.body.append(depthMarker);
  let scrollQueued = false;
  function paintDepth() {
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const depth = Math.min(1, Math.max(0, scrollY / range));
    const dark = root.dataset.theme === 'dark';
    root.style.setProperty('--sea-depth', depth.toFixed(4));
    const lightness = dark ? 25 - depth * 15 : 96 - depth * 77;
    const lightInk = dark || lightness < 44.5;
    root.style.setProperty('--sea-lightness', `${lightness.toFixed(2)}%`);
    root.style.setProperty('--reading-ink', lightInk ? '#f3fcff' : lightness < 62 ? '#000000' : '#123849');
    root.style.setProperty('--reading-muted', lightInk ? '#e3f3f8' : lightness < 62 ? '#000000' : '#31586a');
    root.style.setProperty('--reading-accent', lightInk ? '#d6f1f6' : lightness < 62 ? '#082e40' : '#28738c');
    const zone = depth < .3 ? 'surface' : depth < .67 ? 'reef' : 'deep';
    root.dataset.seaZone = zone;
    root.dataset.seaInk = lightInk ? 'light' : 'dark';
    depthMarker.querySelector('.depth-name').textContent = zone === 'surface' ? 'MẶT NƯỚC' : zone === 'reef' ? 'MIỀN SAN HÔ' : 'BIỂN SÂU';
    if (!reduced.matches) atmosphere.style.setProperty('--far-offset', `${depth * -45}px`);
    scrollQueued = false;
  }
  const queueDepth = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(paintDepth); } };
  window.addEventListener('scroll', queueDepth, { passive: true });
  window.addEventListener('resize', queueDepth);
  new MutationObserver(queueDepth).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(queueDepth).observe(document.querySelector('main'));
  reduced.addEventListener('change', queueDepth); paintDepth();

  // A fabric jacket remains beneath the page block; its cover opens on first sight.
  const book = document.querySelector('.memory-book');
  const shell = document.createElement('div'); shell.className = 'bound-album';
  book.before(shell); shell.append(book);
  const cover = document.createElement('button'); cover.type = 'button'; cover.className = 'album-cover';
  cover.setAttribute('aria-label', 'Mở bìa album ảnh của Khánh Hạ');
  cover.innerHTML = '<span class="cover-border"></span><span class="cover-edition">MỘT CUỐN SÁCH DÀNH RIÊNG CHO EM</span><svg viewBox="0 0 120 105" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M60 96Q-3 74 10 34Q15 5 35 21Q43-7 60 17Q77-7 85 21Q105 5 110 34Q123 74 60 96Z"/><path d="M60 96 35 21M60 96V17M60 96 85 21M60 96 10 34M60 96 110 34"/></g></svg><strong>Khánh Hạ</strong><em>những điều anh muốn giữ</em><span class="cover-date">20 · 10 · 2026</span><span class="cover-hint">CHẠM ĐỂ MỞ ↗</span>';
  shell.append(cover);
  const coverControl = document.createElement('button'); coverControl.type = 'button'; coverControl.className = 'cover-control';
  document.querySelector('.book-toolbar').append(coverControl);
  let coverOpened = false, autoCoverTimer, coverPausedBook = false;
  function setCover(open) {
    coverOpened = open; shell.classList.toggle('book-unwrapped', open);
    coverControl.textContent = open ? 'Xem bìa sách ♡' : 'Mở album ↗';
    coverControl.setAttribute('aria-expanded', String(open));
    cover.inert = open; cover.setAttribute('aria-hidden', String(open));
    const pause = document.querySelector('.book-pause');
    if (!open && pause.getAttribute('aria-pressed') !== 'true') { coverPausedBook = true; pause.click(); }
    else if (open && coverPausedBook) { if (pause.getAttribute('aria-pressed') === 'true') pause.click(); coverPausedBook = false; }
    queueDepth();
  }
  cover.addEventListener('click', () => { clearTimeout(autoCoverTimer); setCover(true); });
  coverControl.addEventListener('click', () => { clearTimeout(autoCoverTimer); setCover(!coverOpened); });
  setCover(reduced.matches);
  const coverObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      autoCoverTimer = setTimeout(() => setCover(true), reduced.matches ? 0 : 1400);
      coverObserver.disconnect();
    }
  }, { threshold: .3 });
  coverObserver.observe(shell);
  reduced.addEventListener('change', event => { if (event.matches) { clearTimeout(autoCoverTimer); setCover(true); } });
  const labelPages = () => {
    book.querySelectorAll('.book-photo>span').forEach(caption => { caption.title = caption.textContent; });
  };
  new MutationObserver(labelPages).observe(book, { childList: true, subtree: true }); labelPages();

  // A bouquet grows from the coral after the last question, without replacing the letter.
  const finaleConfig = window.HA_FINALE || {};
  const finale = document.createElement('section'); finale.id = 'ocean-finale'; finale.className = 'ocean-finale'; finale.hidden = true;
  finale.setAttribute('aria-label', 'Bó hoa dưới biển dành cho Hạ ngày 20 tháng 10');
  const heading = document.createElement('div'); heading.className = 'finale-heading';
  const label = document.createElement('span'); label.className = 'eyebrow'; label.textContent = '20 THÁNG 10 · NGÀY DÀNH CHO EM';
  const title = document.createElement('h2'); title.textContent = finaleConfig.title || 'Rạng rỡ nhé, Khánh Hạ.';
  const message = document.createElement('p'); message.textContent = finaleConfig.message || 'Mong em luôn được yêu thương, tự do lớn lên và nở hoa theo cách của riêng mình.';
  heading.append(label, title, message);
  const garden = document.createElement('div'); garden.className = 'finale-garden';
  garden.innerHTML = '<svg class="coral-bouquet" viewBox="0 0 500 520" aria-hidden="true"><g class="bouquet-stems" fill="none" stroke="#8ac6ba" stroke-width="5" stroke-linecap="round"><path pathLength="1" d="M250 470Q175 360 125 175M250 470Q205 320 210 110M250 470Q290 320 300 145M250 470Q345 350 370 205M250 470Q180 420 90 305M250 470Q330 400 420 320"/><path pathLength="1" d="M165 286q-65-18-65-72m68 83q27-50 7-80M225 258q-48-33-42-69m53 128q56-25 58-70m31 63q-35-45-21-71m-94 153q-63 2-83-41m142 55q62-5 88-47"/></g><g class="bouquet-leaves" fill="#70b5a3"><path d="M209 382q-82-5-97-51 69-11 97 51M281 367q74-50 95-27-24 54-95 27M230 310q-60-24-64-60 62-1 64 60M291 297q20-68 62-66-4 53-62 66"/></g><path class="bouquet-ribbon" d="M213 435q-80-48-55-70 39-16 92 63 53-79 92-63 25 22-55 70l30 50-67-25-67 25Z" fill="#b5e1eb" opacity=".9"/></svg>';
  const flowerPoints = [[125,175,31,'#eeb6b8'],[210,110,36,'#d6eaf1'],[300,145,34,'#f4d6bd'],[370,205,31,'#d7e8f5'],[90,305,25,'#efd8cf'],[420,320,26,'#efc5ce']];
  const svg = garden.querySelector('svg');
  flowerPoints.forEach(([x,y,size,color], index) => {
    const flower = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    flower.setAttribute('transform', `translate(${x} ${y})`);
    const petals = document.createElementNS('http://www.w3.org/2000/svg', 'g'); petals.classList.add('bouquet-flower');
    petals.style.setProperty('--bloom-delay', `${.6 + index * .16}s`);
    for (let p = 0; p < 6; p++) {
      const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      petal.setAttribute('cx', '0'); petal.setAttribute('cy', String(-size * .52)); petal.setAttribute('rx', String(size * .42)); petal.setAttribute('ry', String(size * .65)); petal.setAttribute('fill', color); petal.setAttribute('transform', `rotate(${p * 60})`); petals.append(petal);
    }
    const centre = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); centre.setAttribute('r', String(size * .22)); centre.setAttribute('fill', '#d7b677'); petals.append(centre); flower.append(petals); svg.append(flower);
  });
  const portrait = document.createElement('figure'); portrait.className = 'finale-portrait';
  const image = document.createElement('img');
  const lastHero = window.HA_HERO_PHOTOS?.[2];
  const photo = finaleConfig.photo || lastHero?.photo || 24;
  image.src = finaleConfig.image || lastHero?.image || photoPath(photo); image.alt = 'Khánh Hạ, cô gái của ngày 20 tháng 10'; image.loading = 'lazy'; image.decoding = 'async';
  image.style.objectPosition = finaleConfig.position || lastHero?.position || '50% 28%';
  const caption = document.createElement('figcaption'); caption.textContent = finaleConfig.caption || 'Cả một đại dương dịu dàng, gửi em ♡';
  portrait.append(image, caption);
  const composition = document.createElement('div'); composition.className = 'finale-composition'; composition.append(garden, portrait);
  finale.append(heading, composition);
  document.querySelector('.back-top').before(finale);
  const next = document.createElement('a'); next.href = '#ocean-finale'; next.className = 'finale-invitation'; next.textContent = 'Còn một bó hoa dành cho em ↓'; document.querySelector('#game-reward').append(next);
  const bloomObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !finale.hidden) finale.classList.add('is-blooming');
  }, { threshold: .18 }); bloomObserver.observe(finale);
  document.querySelector('#hate-choice').addEventListener('click', () => { finale.hidden = false; queueDepth(); });
  document.querySelector('#game-reset').addEventListener('click', () => { finale.hidden = true; finale.classList.remove('is-blooming'); queueDepth(); });
})();