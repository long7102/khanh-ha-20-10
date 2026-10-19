/* Small, native browser effects: no animation libraries or build step. */
const motionOkay = () => !reducedMotion.matches;
const ocean = document.createElement('div');
ocean.className = 'ocean-drift';
ocean.setAttribute('aria-hidden', 'true');
for (let i = 0; i < 30; i++) {
  const symbol = document.createElement('span');
  symbol.textContent = ['♡', '✦', '✧', '♥', '⋆', '◦'][i % 6];
  symbol.style.cssText = `--ocean-left:${(i * 37) % 100}%;--ocean-size:${13 + i % 5 * 5}px;--ocean-time:${23 + i % 9 * 3}s;--ocean-delay:${-i * 3.1}s;--ocean-sway:${(i % 2 ? 1 : -1) * (25 + i % 4 * 22)}px`;
  ocean.append(symbol);
}
document.body.append(ocean);
const sea = document.createElement('div');
sea.className = 'ocean-scenery'; sea.setAttribute('aria-hidden', 'true');
sea.innerHTML = '<div class="ocean-rays"></div><div class="ocean-waves"><span></span><span></span><span></span></div><svg class="ocean-life" viewBox="0 0 1200 280" preserveAspectRatio="xMidYMax slice"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M30 280Q10 220 48 180Q75 140 50 90M50 225Q83 202 88 165M45 190Q20 170 14 140M1130 280Q1090 225 1124 170Q1150 120 1132 65M1122 220Q1165 190 1175 146M1125 175Q1090 145 1095 115"/><path d="M220 100q30-30 60 0q-30 30-60 0l-17-14v28zM945 160q-26-24-52 0q26 24 52 0l15-12v24z"/></g><g fill="currentColor" opacity=".3"><circle cx="85" cy="100" r="4"/><circle cx="105" cy="70" r="7"/><circle cx="1090" cy="60" r="5"/><circle cx="1070" cy="95" r="3"/></g></svg>';
document.body.append(sea);
const satellites = document.createElement('div');
satellites.className = 'satellite-field';
satellites.setAttribute('aria-hidden', 'true');
satellites.innerHTML = '<span>✦</span><span>♡</span><span>✧</span>';
document.querySelector('.hero').prepend(satellites);

// These four featured cards turn over in place; the book uses the full-screen viewer.
document.querySelectorAll('.album-grid .photo-card').forEach((card, index) => {
  const message = window.HA_FEATURED_MESSAGES[index];
  const inner = document.createElement('span'); inner.className = 'polaroid-flip-inner';
  const front = document.createElement('span'); front.className = 'polaroid-front-face';
  while (card.firstChild) front.append(card.firstChild);
  const back = document.createElement('span'); back.className = 'polaroid-back-face';
  back.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span'); label.className = 'polaroid-back-label'; label.textContent = 'MỘT LỜI NHẮN NHỦ DÀNH RIÊNG CHO EM· 20/10';
  const title = document.createElement('strong'); title.textContent = message.title;
  const body = document.createElement('span'); body.className = 'polaroid-back-message'; body.textContent = message.message;
  const hint = document.createElement('small'); hint.textContent = 'CHẠM ĐỂ TRỞ LẠI ↻';
  back.append(label, title, body, hint); inner.append(front, back); card.append(inner);
  card.setAttribute('aria-pressed', 'false');
  card.setAttribute('aria-label', `Lật ảnh để đọc lời nhắn: ${message.title}`);
});

// The book advances only while it is on screen and no picture is open.
const bookSection = document.createElement('section');
bookSection.className = 'book-section';
bookSection.innerHTML = `<div class="book-heading"><span class="eyebrow">27 PORTRAITS · A BOOK FOR HẠ</span><h3>Mỗi trang, <em>một phiên bản rạng rỡ.</em></h3><p>Từ tóc ngắn đến tóc dài. Cuốn sách tự lật, em chỉ cần ngắm nhìn.</p></div><div class="memory-book" tabindex="0" aria-label="Album tự lật trang, phím mũi tên để đổi trang"><div class="book-page book-left"></div><div class="book-page book-right"></div><div class="book-spine" aria-hidden="true"></div></div><div class="book-toolbar"><span class="book-status"></span><button class="book-pause" type="button">Tạm dừng lật Ⅱ</button><button class="book-next" type="button" aria-label="Lật trang tiếp theo">Lật trang ↗</button></div><p class="book-hint">Chạm vào ảnh để rút ra khỏi trang sách và ngắm thật gần.</p>`;
album.querySelector('.album-grid').after(bookSection);
album.querySelector('.placeholder-note').textContent = 'Một cuốn sách nhỏ chưa đựng nhiều điều đáng yêu.';
const book = bookSection.querySelector('.memory-book');
const leftPage = book.querySelector('.book-left');
const rightPage = book.querySelector('.book-right');
const pauseBook = bookSection.querySelector('.book-pause');
let spreadStart = 1;
let turning = false;
let bookOnScreen = false;
let bookPaused = !motionOkay();
let photoOpen = false;
let swipeStart = null;
let suppressPhotoClickUntil = 0;
let lastManualTurn = 0;
const decodedPages = new Map();
function warmPhoto(number) {
  if (number > 27) return Promise.resolve();
  if (!decodedPages.has(number)) {
    const image = new Image(); image.src = window.HA_MEMORIES[number - 1]?.image || photoPath(number);
    decodedPages.set(number, image.decode().catch(() => {}));
  }
  return decodedPages.get(number);
}
const warmSpread = start => Promise.all([warmPhoto(start), warmPhoto(start + 1)]);
function fillPage(page, number) {
  page.replaceChildren();
  if (number > 27) {
    page.innerHTML = '<div class="book-dedication"><span>✿</span><h3>20 tháng 10</h3><p>Khánh Hạ luôn hạnh phúc,<br>tự do và rạng rỡ (không phải chúc).</p><small>WITH HEIGHT, ALWAYS</small></div>';
    return;
  }
  const button = document.createElement('button');
  const memory = window.HA_MEMORIES[number - 1];
  const captionText = memory.caption || memory.title || `Khung hình ${String(number).padStart(2, '0')}`;
  button.type = 'button';
  button.className = 'book-photo';
  button.dataset.photo = String(number);
  button.setAttribute('aria-label', `Mở ảnh ${number}: ${captionText}`);
  const image = document.createElement('img');
  image.src = memory.image || photoPath(number);
  image.style.objectPosition = memory.position || '50% 26%';
  image.alt = photoAlt(number);
  image.decoding = 'async';
  const caption = document.createElement('span');
  caption.textContent = captionText.normalize('NFC');
  button.append(image, caption);
  const pageNumber = document.createElement('small');
  pageNumber.className = 'book-page-number';
  pageNumber.textContent = `${String(number).padStart(2, '0')} / 27`;
  page.append(button, pageNumber);
}
function paintBook() {
  fillPage(leftPage, spreadStart);
  fillPage(rightPage, spreadStart + 1);
  bookSection.querySelector('.book-status').textContent = `TRANG ${String(spreadStart).padStart(2, '0')} — ${Math.min(27, spreadStart + 1)} / 27`;
}
async function turnBook(direction = 1) {
  if (turning || photoOpen) return;
  const next = direction > 0 ? (spreadStart >= 27 ? 1 : spreadStart + 2) : (spreadStart <= 1 ? 27 : spreadStart - 2);
  if (!motionOkay()) { spreadStart = next; paintBook(); return; }
  turning = true;
  await warmSpread(next);
  if (photoOpen || !motionOkay()) { turning = false; return; }
  const leaf = document.createElement('div');
  leaf.className = `turning-leaf${direction < 0 ? ' backwards' : ''}`;
  const front = document.createElement('div');
  const back = document.createElement('div');
  front.className = 'leaf-face leaf-front';
  back.className = 'leaf-face leaf-back';
  fillPage(front, direction > 0 ? spreadStart + 1 : next + 1);
  fillPage(back, direction > 0 ? next : spreadStart);
  leaf.append(front, back);
  if (direction > 0) fillPage(rightPage, next + 1);
  else fillPage(leftPage, next);
  book.append(leaf);
  leaf.addEventListener('animationend', () => {
    spreadStart = next;
    if (direction > 0) fillPage(leftPage, spreadStart);
    else fillPage(rightPage, spreadStart + 1);
    bookSection.querySelector('.book-status').textContent = `TRANG ${String(spreadStart).padStart(2, '0')} — ${Math.min(27, spreadStart + 1)} / 27`;
    // Keep the decoded destination below the turning leaf for one full paint.
    requestAnimationFrame(() => requestAnimationFrame(() => { leaf.remove(); turning = false; }));
    warmSpread(spreadStart >= 27 ? 1 : spreadStart + 2);
  }, { once: true });
}
function syncBookPause() {
  pauseBook.textContent = bookPaused ? 'Tiếp tục lật ▷' : 'Tạm dừng lật Ⅱ';
  pauseBook.setAttribute('aria-pressed', String(bookPaused));
}
pauseBook.addEventListener('click', () => { bookPaused = !bookPaused; syncBookPause(); });
bookSection.querySelector('.book-next').addEventListener('click', () => turnBook());
book.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); turnBook(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
// Horizontal swipes turn the book; vertical gestures still scroll the page.
book.addEventListener('pointerdown', event => {
  if (!event.isPrimary || turning || photoOpen || event.button > 0) return;
  swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
});
book.addEventListener('pointermove', event => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;
  const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    book.classList.add('swiping');
    book.setPointerCapture(event.pointerId);
  }
});
book.addEventListener('pointerup', event => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;
  const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
  swipeStart = null; book.classList.remove('swiping');
  if (book.hasPointerCapture(event.pointerId)) book.releasePointerCapture(event.pointerId);
  if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    suppressPhotoClickUntil = Date.now() + 600;
    lastManualTurn = Date.now(); turnBook(dx < 0 ? 1 : -1);
  }
});
book.addEventListener('pointercancel', () => { swipeStart = null; book.classList.remove('swiping'); });
book.addEventListener('dragstart', event => event.preventDefault());
new IntersectionObserver(entries => { bookOnScreen = entries[0].isIntersecting; }, { threshold: .25 }).observe(book);
setInterval(() => {
  if (bookOnScreen && !bookPaused && !document.hidden && motionOkay() && Date.now() - lastManualTurn > 6500) turnBook();
}, 5200);
reducedMotion.addEventListener('change', () => { if (!motionOkay()) { bookPaused = true; syncBookPause(); } });
paintBook(); syncBookPause();
warmSpread(3);

// Lift the selected picture from its page into a full-screen viewer and return it.
const viewer = document.querySelector('#photo-dialog');
viewer.className = 'photo-dialog photo-viewer';
viewer.innerHTML = '<button type="button" id="dialog-close" aria-label="Trả ảnh về trang sách">×</button><div class="viewer-layout"><div class="viewer-frame"><img alt=""></div><aside class="viewer-copy"><span class="eyebrow">A PORTRAIT OF HẠ · 20/10</span><h2></h2><p></p><small>Ấn Esc hoặc × để đặt ảnh về trang sách.</small></aside></div>';
const viewerImage = viewer.querySelector('.viewer-frame img');
let sourcePhoto = null;
let sourceButton = null;
let closingPhoto = false;
let liftAnimation = null;
let previousOverflow = '';
function photoTransform(from, to) {
  return `translate(${from.left + from.width / 2 - to.left - to.width / 2}px,${from.top + from.height / 2 - to.top - to.height / 2}px) scale(${from.width / to.width},${from.height / to.height})`;
}
async function openPortrait(button) {
  if (turning || photoOpen) return;
  const number = Number(button.dataset.photo);
  sourcePhoto = button.querySelector('img');
  if (!sourcePhoto) return;
  photoOpen = true;
  sourceButton = button;
  book.classList.add('portrait-out');
  const from = sourcePhoto.getBoundingClientRect();
  const memory = window.HA_MEMORIES[number - 1];
  // Show the decoded book image immediately, then load the full photograph.
  viewerImage.src = memory.image || photoPath(number);
  viewerImage.alt = photoAlt(number);
  await viewerImage.decode().catch(() => {});
  viewer.querySelector('h2').textContent = (memory.title || memory.caption || `Khánh Hạ · khung hình ${String(number).padStart(2, '0')}`).normalize('NFC');
  const paragraph = viewer.querySelector('.viewer-copy p');
  paragraph.textContent = (memory.text || memory.paragraph || '').normalize('NFC');
  paragraph.hidden = !paragraph.textContent;
  photoOpen = true;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  viewer.showModal();
  sourcePhoto.style.visibility = 'hidden';
  sourceButton.classList.add('page-torn');
  viewerImage.classList.add('torn-portrait');
  if (motionOkay()) {
    const to = viewerImage.getBoundingClientRect();
    liftAnimation = viewerImage.animate([
      { transform: photoTransform(from, to), opacity: 1 },
      { transform: photoTransform({ ...from.toJSON(), top: from.top - 65, left: from.left + 22 }, to) + ' rotate(-12deg)', opacity: 1, offset: .3 },
      { transform: 'translate(0,-18px) scale(1.03) rotate(1deg)', opacity: 1, offset: .8 },
      { transform: 'none', opacity: 1 }
    ], { duration: 1000, easing: 'cubic-bezier(.22,.65,.2,1)' });
    for (let i = 0; i < 7; i++) {
      const scrap = document.createElement('span'); scrap.className = 'paper-fleck';
      scrap.style.left = `${from.left}px`; scrap.style.top = `${from.top + from.height * i / 7}px`;
      viewer.append(scrap);
      scrap.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${-30 - i * 8}px,${35 + i * 12}px) rotate(${i * 37}deg)`, opacity: 0 }], { duration: 850, delay: i * 35, fill: 'forwards' }).finished.then(() => scrap.remove());
    }
  }
  const fullPhoto = new Image(); fullPhoto.src = memory.image || fullPhotoPath(number);
  fullPhoto.decode().then(async () => {
    await liftAnimation?.finished.catch(() => {});
    if (photoOpen && !closingPhoto && sourceButton === button) viewerImage.src = fullPhoto.src;
  }).catch(() => {});
}
async function closePortrait() {
  if (!photoOpen || closingPhoto) return;
  closingPhoto = true;
  if (motionOkay() && sourcePhoto?.isConnected) {
    // A small decoded proxy avoids resampling the full-resolution image on return.
    const target = sourcePhoto.getBoundingClientRect();
    const from = viewerImage.getBoundingClientRect();
    const proxy = sourcePhoto.cloneNode(); proxy.className = 'returning-photo'; proxy.alt = '';
    proxy.setAttribute('aria-hidden', 'true');
    proxy.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;
    viewer.append(proxy);
    await proxy.decode().catch(() => {});
    viewerImage.style.visibility = 'hidden'; liftAnimation?.cancel();
    viewer.classList.add('returning');
    await proxy.animate([{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: photoTransform(target, from) }], { duration: 850, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'forwards' }).finished.catch(() => {});
    sourcePhoto.style.visibility = '';
    sourceButton?.classList.remove('page-torn');
    proxy.remove();
  }
  if (sourcePhoto) sourcePhoto.style.visibility = '';
  sourceButton?.classList.remove('page-torn');
  viewer.close();
  viewer.classList.remove('returning'); viewerImage.style.visibility = '';
  viewerImage.getAnimations().forEach(animation => animation.cancel());
  document.body.style.overflow = previousOverflow;
  sourceButton?.focus({ preventScroll: true });
  book.classList.remove('portrait-out');
  photoOpen = false; closingPhoto = false;
}
album.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button) return;
  if (Date.now() < suppressPhotoClickUntil) { event.preventDefault(); return; }
  if (button.classList.contains('photo-card')) {
    const flipped = button.classList.toggle('is-flipped');
    button.setAttribute('aria-pressed', String(flipped));
    button.querySelector('.polaroid-front-face').setAttribute('aria-hidden', String(flipped));
    button.querySelector('.polaroid-back-face').setAttribute('aria-hidden', String(!flipped));
  } else openPortrait(button);
});
viewer.querySelector('#dialog-close').addEventListener('click', closePortrait);
viewer.addEventListener('cancel', event => { event.preventDefault(); closePortrait(); });
viewer.addEventListener('click', event => { if (event.target === viewer) closePortrait(); });

// Write actual characters, with a complete-text shortcut and full accessible copy.
function prepareLetter(container) {
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('vi', { granularity: 'grapheme' }) : null;
  const paragraphs = [...container.querySelectorAll('p')].map(p => {
    const text = p.textContent.normalize('NFC');
    return { p, text, letters: segmenter ? [...segmenter.segment(text)].map(item => item.segment) : [...text], ink: null };
  });
  const skip = document.createElement('button');
  skip.type = 'button'; skip.className = 'letter-skip'; skip.textContent = 'Đọc toàn bộ thư ↗';
  skip.hidden = true;
  container.append(skip);
  let generation = 0;
  function finish() {
    generation++;
    paragraphs.forEach(({ p, text, ink }) => { if (ink) ink.textContent = text; p.classList.remove('writing'); });
    skip.hidden = true;
  }
  skip.addEventListener('click', finish);
  async function write() {
    generation++;
    const current = generation;
    if (!motionOkay()) return;
    skip.hidden = false;
    paragraphs.forEach(item => {
      item.p.textContent = item.text;
      item.p.style.minHeight = `${item.p.getBoundingClientRect().height}px`;
      item.p.setAttribute('aria-label', item.text);
      const ink = document.createElement('span'); ink.className = 'ink-copy'; ink.setAttribute('aria-hidden', 'true');
      item.p.replaceChildren(ink); item.ink = ink;
    });
    for (const item of paragraphs) {
      if (current !== generation) return;
      item.p.classList.add('writing');
      await new Promise(resolve => {
        let started;
        function frame(now) {
          if (current !== generation) { resolve(); return; }
          started ??= now;
          const count = Math.min(item.letters.length, Math.floor((now - started) * .032));
          const copy = item.letters.slice(0, count).join('');
          if (item.ink.textContent !== copy) item.ink.textContent = copy;
          if (count < item.letters.length) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
      });
      item.p.classList.remove('writing');
    }
    if (current === generation) skip.hidden = true;
  }
  return { write, finish };
}
const mainLetter = document.querySelector('.letter-paper');
const mainWriter = prepareLetter(mainLetter);
const letterObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) { mainWriter.write(); letterObserver.disconnect(); }
}, { threshold: .16 });
letterObserver.observe(mainLetter);