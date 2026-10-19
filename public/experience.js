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
  const label = document.createElement('span'); label.className = 'polaroid-back-label'; label.textContent = 'MỘT LỜI NHẮN · 20/10';
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
album.querySelector('.placeholder-note').textContent = 'Một cuốn sách nhỏ, dành cho cô gái có thật nhiều điều đáng yêu.';
const book = bookSection.querySelector('.memory-book');
const leftPage = book.querySelector('.book-left');
const rightPage = book.querySelector('.book-right');
const pauseBook = bookSection.querySelector('.book-pause');
let spreadStart = 1;
let turning = false;
let bookOnScreen = false;
let bookPaused = !motionOkay();
let photoOpen = false;
const decodedPages = new Map();
function warmPhoto(number) {
  if (number > 27) return Promise.resolve();
  if (!decodedPages.has(number)) {
    const image = new Image(); image.src = photoPath(number);
    decodedPages.set(number, image.decode().catch(() => {}));
  }
  return decodedPages.get(number);
}
const warmSpread = start => Promise.all([warmPhoto(start), warmPhoto(start + 1)]);
function fillPage(page, number) {
  page.replaceChildren();
  if (number > 27) {
    page.innerHTML = '<div class="book-dedication"><span>✿</span><h3>20 tháng 10</h3><p>Chúc Hạ luôn hạnh phúc,<br>tự do và rạng rỡ.</p><small>WITH LOVE, ALWAYS</small></div>';
    return;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'book-photo';
  button.dataset.photo = String(number);
  button.setAttribute('aria-label', `Mở ảnh ${number}: ${window.HA_MEMORIES[number - 1].title}`);
  const image = document.createElement('img');
  image.src = photoPath(number);
  image.alt = photoAlt(number);
  image.decoding = 'async';
  const caption = document.createElement('span');
  caption.textContent = window.HA_MEMORIES[number - 1].title;
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
  if (photoOpen) { turning = false; return; }
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
    requestAnimationFrame(() => { leaf.remove(); turning = false; });
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
new IntersectionObserver(entries => { bookOnScreen = entries[0].isIntersecting; }, { threshold: .25 }).observe(book);
setInterval(() => {
  if (bookOnScreen && !bookPaused && !document.hidden && motionOkay()) turnBook();
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
  const from = sourcePhoto.getBoundingClientRect();
  const memory = window.HA_MEMORIES[number - 1];
  viewerImage.src = photoPath(number);
  viewerImage.alt = photoAlt(number);
  await viewerImage.decode().catch(() => {});
  viewer.querySelector('h2').textContent = memory.title;
  const paragraph = viewer.querySelector('.viewer-copy p');
  paragraph.textContent = memory.paragraph;
  paragraph.hidden = !memory.paragraph;
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
      { transform: photoTransform(from, to), opacity: 1, clipPath: 'inset(0)' },
      { transform: photoTransform({ ...from.toJSON(), top: from.top - 65, left: from.left + 22 }, to) + ' rotate(-12deg)', opacity: 1, offset: .3, clipPath: 'polygon(2% 0,100% 0,100% 100%,2% 100%,0 92%,2% 84%,0 76%,2% 68%,0 60%,2% 52%,0 44%,2% 36%,0 28%,2% 20%,0 12%)' },
      { transform: 'translate(0,-18px) scale(1.03) rotate(1deg)', opacity: 1, offset: .8 },
      { transform: 'none', opacity: 1 }
    ], { duration: 1050, easing: 'cubic-bezier(.22,.65,.2,1)' });
    for (let i = 0; i < 7; i++) {
      const scrap = document.createElement('span'); scrap.className = 'paper-fleck';
      scrap.style.left = `${from.left}px`; scrap.style.top = `${from.top + from.height * i / 7}px`;
      viewer.append(scrap);
      scrap.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${-30 - i * 8}px,${35 + i * 12}px) rotate(${i * 37}deg)`, opacity: 0 }], { duration: 850, delay: i * 35, fill: 'forwards' }).finished.then(() => scrap.remove());
    }
  }
}
async function closePortrait() {
  if (!photoOpen || closingPhoto) return;
  closingPhoto = true;
  liftAnimation?.cancel();
  if (motionOkay() && sourcePhoto?.isConnected) {
    const target = sourcePhoto.getBoundingClientRect();
    const from = viewerImage.getBoundingClientRect();
    await viewerImage.animate([{ transform: 'none', opacity: 1 }, { transform: photoTransform(target, from) + ' rotate(-4deg)', opacity: .8 }], { duration: 480, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }).finished.catch(() => {});
  }
  viewer.close();
  if (sourcePhoto) sourcePhoto.style.visibility = '';
  sourceButton?.classList.remove('page-torn');
  viewerImage.getAnimations().forEach(animation => animation.cancel());
  document.body.style.overflow = previousOverflow;
  sourceButton?.focus({ preventScroll: true });
  photoOpen = false; closingPhoto = false;
}
album.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button) return;
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
  const paragraphs = [...container.querySelectorAll('p')].map(p => ({ p, text: p.textContent, ink: null }));
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
          const count = Math.min(item.text.length, Math.floor((now - started) * .09));
          item.ink.textContent = item.text.slice(0, count);
          if (count < item.text.length) requestAnimationFrame(frame); else resolve();
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


