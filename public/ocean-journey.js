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
  // A gathered botanical bouquet, with layered blooms and folded wrapping paper.
  const flower = (x, y, size, shade, delay) => {
    let petals = '';
    [[12,1,.33],[9,.72,.29],[6,.44,.24]].forEach(([count,scale,width], layer) => {
      for (let p = 0; p < count; p++) petals += `<ellipse cx="0" cy="${-size * .43 * scale}" rx="${size * width * scale}" ry="${size * .58 * scale}" transform="rotate(${p * 360 / count + layer * 19})" fill="url(#${shade})" stroke="#cbbcab" stroke-opacity=".2" stroke-width=".7"/>`;
    });
    return `<g transform="translate(${x} ${y})"><g class="bouquet-flower" style="--bloom-delay:${delay}s">${petals}<path d="M-7 0q1-12 12-6t-4 13q-9-1-6-7q5-6 9 0" fill="none" stroke="#c6ac91" stroke-width="1.3" opacity=".65"/></g></g>`;
  };
  const daisy = (x, y, size, delay) => {
    let petals = '';
    for (let p=0;p<15;p++) petals += `<ellipse cx="0" cy="${-size * .58}" rx="${size * .15}" ry="${size * .55}" transform="rotate(${p * 24})" fill="url(#bouquetIvory)"/>`;
    return `<g transform="translate(${x} ${y})"><g class="bouquet-flower" style="--bloom-delay:${delay}s">${petals}<circle r="${size * .23}" fill="url(#bouquetGold)"/><circle r="${size * .16}" fill="none" stroke="#f9e8b4" stroke-width="1" stroke-dasharray="1 3"/></g></g>`;
  };
  const hydrangea = (x,y,delay) => {
    let florets = '';
    for (let i=0;i<15;i++) {
      const angle=i*2.4, radius=Math.sqrt(i)*10;
      const cx=Math.cos(angle)*radius, cy=Math.sin(angle)*radius;
      florets += `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${i*27})">${[0,90,180,270].map(a=>`<ellipse cy="-6" rx="5.8" ry="8" transform="rotate(${a})" fill="url(#bouquetBlue)" stroke="#bfd6eb" stroke-width=".4"/>`).join('')}<circle r="1.6" fill="#f2ecd0"/></g>`;
    }
    return `<g transform="translate(${x} ${y})"><g class="bouquet-flower" style="--bloom-delay:${delay}s">${florets}</g></g>`;
  };
  let foliage = '';
  [[133,248,-35],[352,260,35],[198,150,-19],[302,156,18]].forEach(([x,y,angle])=>{
    foliage += `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 130Q8 44 0-40" fill="none" stroke="#648f7b" stroke-width="2.5"/>`;
    for(let i=0;i<5;i++) foliage += `<ellipse cx="${i%2?13:-12}" cy="${i*26-27}" rx="12" ry="20" transform="rotate(${i%2?48:-48} ${i%2?13:-12} ${i*26-27})" fill="url(#bouquetLeaf)"/>`;
    foliage += '</g>';
  });
  garden.innerHTML = `<svg class="coral-bouquet botanical-bouquet" viewBox="0 0 500 610" aria-hidden="true">
    <defs>
      <radialGradient id="bouquetIvory" cx="35%" cy="25%" r="80%"><stop stop-color="#fffef5"/><stop offset=".6" stop-color="#f5eee1"/><stop offset="1" stop-color="#d7cbb7"/></radialGradient>
      <radialGradient id="bouquetBlush" cx="30%" cy="25%" r="80%"><stop stop-color="#fff1e6"/><stop offset=".62" stop-color="#eecdbf"/><stop offset="1" stop-color="#c99a8d"/></radialGradient>
      <radialGradient id="bouquetBlue" cx="30%" cy="20%" r="85%"><stop stop-color="#e3effc"/><stop offset=".6" stop-color="#a8c4e0"/><stop offset="1" stop-color="#718fba"/></radialGradient>
      <radialGradient id="bouquetGold"><stop stop-color="#ead5a0"/><stop offset="1" stop-color="#b49657"/></radialGradient>
      <linearGradient id="bouquetLeaf" x2="1" y2="1"><stop stop-color="#9bbcad"/><stop offset="1" stop-color="#4f8879"/></linearGradient>
      <linearGradient id="bouquetWrap" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#fff9ed"/><stop offset=".5" stop-color="#e9e2d3"/><stop offset="1" stop-color="#c9d8d5"/></linearGradient>
      <linearGradient id="bouquetFold" x2="1" y2="0"><stop stop-color="#89b7bd"/><stop offset=".52" stop-color="#cae4e5"/><stop offset="1" stop-color="#a0c8cc"/></linearGradient>
      <linearGradient id="bouquetSatin" x2="0" y2="1"><stop stop-color="#dfeff0"/><stop offset=".45" stop-color="#77a7b5"/><stop offset=".62" stop-color="#bad8df"/><stop offset="1" stop-color="#4b7f95"/></linearGradient>
    </defs>
    <path d="M105 285 65 234 79 387 222 550 300 540 423 365 406 227 358 291Z" fill="url(#bouquetWrap)" stroke="#f9f5ea" stroke-opacity=".5"/>
    <g class="bouquet-stems" fill="none" stroke="#688d77" stroke-width="3" stroke-linecap="round"><path d="M255 502Q204 326 151 207M255 502Q232 319 224 144M255 502Q280 301 315 187M255 502Q318 342 357 278M255 502Q195 329 143 302M255 502Q257 342 270 261"/></g>
    <g class="botanical-foliage">${foliage}<path d="M197 361q-72-15-92-73 71-7 92 73M292 361q72-15 96-74-75-8-96 74" fill="url(#bouquetLeaf)"/></g>
    ${hydrangea(149,254,.45)}${hydrangea(339,263,.6)}
    ${flower(218,164,42,'bouquetIvory',.28)}${flower(307,199,40,'bouquetBlush',.48)}${flower(158,197,34,'bouquetIvory',.38)}${flower(252,270,47,'bouquetIvory',.65)}
    ${daisy(194,304,23,.7)}${daisy(347,204,22,.55)}${daisy(267,128,18,.35)}
    <g fill="#eee8d4" stroke="#d3dbc8" stroke-width="1"><ellipse cx="119" cy="166" rx="7" ry="11" transform="rotate(-25 119 166)"/><ellipse cx="367" cy="245" rx="7" ry="11" transform="rotate(28 367 245)"/></g>
    <g class="bouquet-paper"><path d="M79 327Q154 353 271 475L227 557Q137 450 79 327Z" fill="url(#bouquetWrap)"/><path d="M415 319Q352 352 239 480L290 552Q370 433 415 319Z" fill="url(#bouquetFold)"/><path d="M79 327 227 557 254 495Q157 386 79 327Z" fill="#fffaf0" opacity=".33"/><path d="M415 319Q350 413 254 495" fill="none" stroke="#e3f0ec" stroke-width="1.5" opacity=".7"/><path d="m227 557 23-62 40 57" fill="none" stroke="#7ba1a5" stroke-opacity=".4"/></g>
    <g class="bouquet-tie"><path d="M251 488q-55-37-64-16-6 24 64 22m0-6q48-42 59-22 12 24-57 29" fill="url(#bouquetSatin)" stroke="#8ab4c0" stroke-width="1.4"/><path d="M246 492q-22 33-22 70l16-11 10 9 4-65M255 492q24 29 35 57l-17-6-8 13-16-60" fill="url(#bouquetSatin)"/><ellipse cx="252" cy="490" rx="10" ry="8" fill="url(#bouquetSatin)"/></g>
  </svg>`;
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
