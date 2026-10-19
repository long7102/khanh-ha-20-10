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
function turnBook(direction = 1) {
  if (turning || photoOpen) return;
  const next = direction > 0 ? (spreadStart >= 27 ? 1 : spreadStart + 2) : (spreadStart <= 1 ? 27 : spreadStart - 2);
  if (!motionOkay()) { spreadStart = next; paintBook(); return; }
  turning = true;
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
    paintBook();
    leaf.remove();
    turning = false;
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
  sourceButton = button;
  const from = sourcePhoto.getBoundingClientRect();
  const memory = window.HA_MEMORIES[number - 1];
  viewerImage.src = photoPath(number);
  viewerImage.alt = photoAlt(number);
  viewer.querySelector('h2').textContent = memory.title;
  const paragraph = viewer.querySelector('.viewer-copy p');
  paragraph.textContent = memory.paragraph;
  paragraph.hidden = !memory.paragraph;
  photoOpen = true;
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  viewer.showModal();
  sourcePhoto.style.visibility = 'hidden';
  if (motionOkay()) {
    const to = viewerImage.getBoundingClientRect();
    liftAnimation = viewerImage.animate([
      { transform: photoTransform(from, to) + ' rotate(-4deg)', opacity: .8 },
      { transform: 'translate(0,-18px) scale(1.04) rotate(1deg)', opacity: 1, offset: .78 },
      { transform: 'none', opacity: 1 }
    ], { duration: 680, easing: 'cubic-bezier(.2,.7,.2,1)' });
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

// A champagne fountain: staggered launches, upward arcs, spin, then gravity.
const fountainButton = document.querySelector('#gift-button');
const fountainLayer = document.querySelector('#gift-burst');
const fountainLetter = document.querySelector('#gift-message');
document.body.append(fountainLayer);
const giftWriter = prepareLetter(fountainLetter);
let fountainBusy = false;
fountainButton.addEventListener('click', async () => {
  if (fountainBusy) return;
  fountainBusy = true; fountainButton.disabled = true;
  giftWriter.finish(); fountainLetter.hidden = true;
  fountainButton.classList.remove('open'); fountainButton.setAttribute('aria-expanded', 'false');
  fountainButton.querySelector('.gift-tap').textContent = 'ĐANG CHUẨN BỊ BẤT NGỜ…';
  if (motionOkay()) {
    const photos = Array.from({ length: 27 }, (_, index) => {
      const image = new Image(); image.src = photoPath(index + 1); image.alt = ''; image.className = 'champagne-photo'; return image;
    });
    await Promise.all(photos.map(image => image.decode().catch(() => {})));
    const rect = fountainButton.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height * .35;
    fountainButton.classList.add('open');
    const flights = photos.map((image, index) => {
      image.style.left = `${originX}px`; image.style.top = `${originY}px`;
      fountainLayer.append(image);
      const dx = Math.sin(index * 2.399) * Math.min(innerWidth * .43, 540);
      const peak = Math.min(innerHeight * .6, 460) + index % 4 * 24;
      const rotation = (index % 2 ? 1 : -1) * (100 + index % 5 * 45);
      const transform = (x, y, size, angle) => `translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(${size}) rotate(${angle}deg)`;
      return image.animate([
        { transform: transform(0, 0, .1, 0), opacity: 0 },
        { transform: transform(dx * .25, -peak * .7, .8, rotation * .15), opacity: 1, offset: .2 },
        { transform: transform(dx * .58, -peak, 1, rotation * .4), opacity: 1, offset: .42 },
        { transform: transform(dx * .85, -peak * .35, .95, rotation * .7), opacity: 1, offset: .68 },
        { transform: transform(dx, innerHeight - originY + 150, .7, rotation), opacity: 0 }
      ], { duration: 2250 + index % 4 * 100, delay: index * 42, easing: 'linear', fill: 'both' }).finished.catch(() => {});
    });
    for (let i = 0; i < 32; i++) {
      const spark = document.createElement('span'); spark.className = 'champagne-spark'; spark.textContent = i % 2 ? '✦' : '♡';
      spark.style.left = `${originX}px`; spark.style.top = `${originY}px`; fountainLayer.append(spark);
      spark.animate([{ transform: 'translate(0,0) scale(.2)', opacity: 0 }, { transform: `translate(${Math.sin(i * 2.4) * innerWidth * .3}px,-${140 + i % 7 * 30}px) scale(1)`, opacity: 1, offset: .45 }, { transform: `translate(${Math.sin(i * 2.4) * innerWidth * .4}px,${innerHeight}px)`, opacity: 0 }], { duration: 2500, delay: i * 25, fill: 'both' });
    }
    await Promise.all(flights);
    fountainLayer.replaceChildren();
  } else fountainButton.classList.add('open');
  fountainLetter.hidden = false;
  fountainButton.setAttribute('aria-expanded', 'true');
  fountainButton.querySelector('.gift-tap').textContent = 'MỞ LẠI BẤT NGỜ ↗';
  fountainButton.disabled = false; fountainBusy = false;
  fountainLetter.scrollIntoView({ behavior: motionOkay() ? 'smooth' : 'instant', block: 'center' });
  fountainLetter.focus({ preventScroll: true });
  giftWriter.write();
});

