const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const photoPath = number => `./public/media/photo-${String(number).padStart(2, '0')}.jpg`;
const photoAlt = number => `Ảnh Khánh Hạ trong bộ sưu tập, số ${number}`;
function attachPhoto(container, number, eager = false) {
  const image = document.createElement('img');
  image.className = 'memory-image';
  image.src = photoPath(number);
  image.alt = photoAlt(number);
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('load', () => container.classList.add('has-photo'));
  image.addEventListener('error', () => image.remove());
  container.append(image);
  return image;
}
attachPhoto(document.querySelector('.hero-card-back .hero-art-inner'), 1, true);
attachPhoto(document.querySelector('.hero-card-front .hero-art-inner'), 27, true);
const featured = [1, 9, 18, 27];
document.querySelectorAll('.photo-card').forEach((card, index) => {
  const number = featured[index];
  card.dataset.photo = String(number);
  card.dataset.caption = `Khánh Hạ, một tấm ảnh trong hành trình từ tóc ngắn đến tóc dài · ${String(number).padStart(2, '0')} / 27`;
  attachPhoto(card.querySelector('.photo-slot'), number);
  const title = ['tóc ngắn, trang đầu', 'dịu dàng một chút', 'thêm một kỷ niệm', 'ngày tóc dài hơn'][index];
  card.querySelector('.photo-caption').firstChild.textContent = `${title} `;
});

const album = document.querySelector('#album');
const strip = document.createElement('div');
strip.className = 'film-section reveal';
strip.innerHTML = `<div class="film-heading"><div><span class="eyebrow">HAIR JOURNEY · 01—27</span><h3>Từ tóc ngắn đến tóc dài <em>♡</em></h3></div><div class="film-controls"><button type="button" id="film-prev" aria-label="Ảnh trước">←</button><button type="button" id="film-next" aria-label="Ảnh tiếp">→</button></div></div><div class="film-track" id="film-track" role="group" aria-label="Album ảnh sắp theo độ dài tóc"></div>`;
album.querySelector('.album-grid').after(strip);
const filmTrack = strip.querySelector('#film-track');
for (let number = 1; number <= 27; number++) {
  const card = document.createElement('button');
  card.className = 'film-card';
  card.type = 'button';
  card.dataset.photo = String(number);
  card.dataset.caption = `Ảnh ${String(number).padStart(2, '0')} / 27 · bộ ảnh xếp từ tóc ngắn đến tóc dài`;
  const photo = document.createElement('span');
  photo.className = 'film-photo';
  photo.innerHTML = '<span aria-hidden="true">♡</span>';
  attachPhoto(photo, number);
  const caption = document.createElement('span');
  caption.className = 'film-caption';
  caption.textContent = `HẠ / ${String(number).padStart(2, '0')}`;
  card.append(photo, caption);
  filmTrack.append(card);
}
strip.querySelector('#film-prev').addEventListener('click', () => filmTrack.scrollBy({ left: -340, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
strip.querySelector('#film-next').addEventListener('click', () => filmTrack.scrollBy({ left: 340, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
const note = album.querySelector('.placeholder-note');
note.textContent = '✎ Bộ ảnh đã được xếp từ tóc ngắn đến tóc dài. Chạm vào ảnh để xem lớn hơn.';

const pieceSelectors = '.section-heading > *, .letter-paper > p, .journey-card > *, .music-copy > *, .counter-item, .surprise-inner > .eyebrow, .surprise-inner > h2, .surprise-inner > p, .closing-section > .eyebrow, .closing-section > h2, .closing-section > p, .film-card';
document.querySelectorAll(pieceSelectors).forEach((item, index) => {
  item.classList.add('scroll-piece');
  item.style.setProperty('--piece-delay', `${(index % 5) * 90}ms`);
});
const revealItems = document.querySelectorAll('.reveal, .scroll-piece');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else revealItems.forEach(item => item.classList.add('visible'));

document.querySelector('#logout').addEventListener('click', () => {
  sessionStorage.removeItem('ha-access');
  window.location.replace('./index.html');
});

const dialog = document.querySelector('#photo-dialog');
const dialogPhoto = dialog.querySelector('.dialog-photo');
album.addEventListener('click', event => {
  const card = event.target.closest('[data-photo]');
  if (!card) return;
  dialogPhoto.querySelector('img')?.remove();
  dialogPhoto.classList.remove('has-photo');
  attachPhoto(dialogPhoto, Number(card.dataset.photo), true);
  document.querySelector('#dialog-caption').textContent = card.dataset.caption;
  dialog.showModal();
});
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const startDate = Date.UTC(2026, 2, 7, 0, 0, 0);
function updateCounter() {
  const elapsed = Math.max(0, Date.now() - startDate);
  const seconds = Math.floor(elapsed / 1000);
  document.querySelector('#days').textContent = String(Math.floor(seconds / 86400));
  document.querySelector('#hours').textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0');
  document.querySelector('#minutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  document.querySelector('#seconds').textContent = String(seconds % 60).padStart(2, '0');
}
updateCounter();
setInterval(updateCounter, 1000);

const journey = document.querySelector('#journey');
const stops = [...journey.querySelectorAll('.journey-stop')];
function updateJourney() {
  const bounds = journey.getBoundingClientRect();
  const cursor = window.innerHeight * .58;
  const progress = Math.max(0, Math.min(1, (cursor - bounds.top) / bounds.height));
  document.querySelector('#journey-progress').style.height = `${progress * 100}%`;
  stops.forEach(stop => stop.classList.toggle('active', stop.getBoundingClientRect().top < cursor));
}
let journeyQueued = false;
window.addEventListener('scroll', () => {
  if (journeyQueued) return;
  journeyQueued = true;
  requestAnimationFrame(() => { updateJourney(); journeyQueued = false; });
}, { passive: true });
window.addEventListener('resize', updateJourney);
updateJourney();

if (!reducedMotion.matches) {
  const headerProgress = document.createElement('span');
  headerProgress.className = 'reading-progress';
  document.querySelector('.site-header').append(headerProgress);
  let queued = false;
  function updateScrollEffects() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    headerProgress.style.width = `${window.scrollY / max * 100}%`;
    const hero = document.querySelector('.hero');
    const heroProgress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
    document.querySelector('.hero-art').style.setProperty('--parallax-y', `${heroProgress * 65}px`);
    queued = false;
  }
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  document.querySelectorAll('.hero-card, .photo-card, .film-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(800px) rotateX(${-y * 11}deg) rotateY(${x * 11}deg) translateY(-8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const AUDIO_SRC = ''; // Add a local file, e.g. '/media/our-song.mp3'.
const audio = AUDIO_SRC ? new Audio(AUDIO_SRC) : null;
if (audio) audio.loop = true;
function updateMusicLabel(playing) {
  document.querySelector('#music-label').textContent = playing ? 'Tạm dừng nhạc' : 'Nhạc của mình';
  document.querySelector('#music-card-label').textContent = audio ? (playing ? 'Tạm dừng nhạc' : 'Bật nhạc') : 'Nhạc đang chờ thêm';
  document.querySelector('#music-toggle').setAttribute('aria-pressed', String(playing));
  document.querySelector('#record').classList.toggle('playing', playing && !reducedMotion.matches);
}
async function toggleMusic() {
  if (!audio) {
    document.querySelector('#music-card-label').textContent = 'Thêm file nhạc để phát ♫';
    document.querySelector('#music-card-toggle').focus();
    return;
  }
  if (audio.paused) {
    try { await audio.play(); } catch { document.querySelector('#music-card-label').textContent = 'Không mở được nhạc'; }
  } else audio.pause();
  updateMusicLabel(!audio.paused);
}
document.querySelector('#music-toggle').addEventListener('click', toggleMusic);
document.querySelector('#music-card-toggle').addEventListener('click', toggleMusic);

const giftButton = document.querySelector('#gift-button');
const giftMessage = document.querySelector('#gift-message');
const giftBurst = document.querySelector('#gift-burst');
document.body.append(giftBurst);
let giftOpening = false;
giftButton.addEventListener('click', async () => {
  if (giftOpening) return;
  giftOpening = true;
  giftButton.disabled = true;
  giftMessage.hidden = true;
  giftButton.setAttribute('aria-expanded', 'false');
  giftButton.querySelector('.gift-tap').textContent = 'ĐANG GOM KỶ NIỆM…';
  if (!reducedMotion.matches) {
    giftBurst.replaceChildren();
    const giftRect = giftButton.getBoundingClientRect();
    const photos = [];
    for (let number = 1; number <= 27; number++) {
      const image = document.createElement('img');
      const angle = number * 137.508 * Math.PI / 180;
      const radius = 10 + (number % 4) * 8;
      image.src = photoPath(number);
      image.alt = '';
      image.decoding = 'async';
      image.className = 'gift-burst-photo';
      image.style.left = `${giftRect.left + giftRect.width / 2}px`;
      image.style.top = `${giftRect.top + giftRect.height / 2}px`;
      image.style.setProperty('--burst-x', `${Math.cos(angle) * radius}vw`);
      image.style.setProperty('--burst-y', `${Math.sin(angle) * radius * .54}vh`);
      image.style.setProperty('--burst-rotate', `${(number * 37) % 90 - 45}deg`);
      image.style.setProperty('--burst-delay', `${(number % 9) * 45}ms`);
      photos.push(image);
    }
    await Promise.all(photos.map(image => image.decode().catch(() => {})));
    giftBurst.append(...photos);
  }
  giftButton.classList.add('open');
  window.setTimeout(() => {
    giftMessage.hidden = false;
    giftButton.setAttribute('aria-expanded', 'true');
    giftButton.disabled = false;
    giftButton.querySelector('.gift-tap').textContent = 'MỞ LẠI KỶ NIỆM ↗';
    giftOpening = false;
    giftMessage.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    giftMessage.focus({ preventScroll: true });
  }, reducedMotion.matches ? 0 : 2500);
  window.setTimeout(() => giftBurst.replaceChildren(), reducedMotion.matches ? 0 : 2800);
});

const loveChoice = document.querySelector('#love-choice');
const hateChoice = document.querySelector('#hate-choice');
const choiceStage = document.querySelector('#choice-stage');
const instruction = document.querySelector('#game-instruction');
const reward = document.querySelector('#game-reward');
const positions = [[25,24],[70,24],[19,57],[76,54],[47,16],[51,57],[32,42]];
let positionIndex = 0;
function dodgeLove(event) {
  event?.preventDefault();
  positionIndex = (positionIndex + 1) % positions.length;
  const [left, top] = positions[positionIndex];
  loveChoice.style.left = `${left}%`;
  loveChoice.style.top = `${top}%`;
  instruction.textContent = ['Bắt được anh không? ♡', 'Nhanh tay lên nào, mini ơi!', 'Ô này cứ chạy mất thôi...', 'Hay thử ô còn lại nhỉ? ✦'][positionIndex % 4];
}
loveChoice.addEventListener('pointerenter', dodgeLove);
loveChoice.addEventListener('touchstart', dodgeLove, { passive: false });
loveChoice.addEventListener('click', dodgeLove);
loveChoice.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') dodgeLove(event);
});
hateChoice.addEventListener('click', () => {
  choiceStage.hidden = true;
  instruction.hidden = true;
  reward.hidden = false;
  if (!reducedMotion.matches) {
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.textContent = i % 3 === 0 ? '♡' : '✦';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--delay', `${Math.random() * .45}s`);
      piece.style.setProperty('--drift', `${(Math.random() - .5) * 120}px`);
      document.querySelector('#choice-game').append(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
    }
  }
  reward.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
});
document.querySelector('#game-reset').addEventListener('click', () => {
  positionIndex = 0;
  loveChoice.style.left = '25%';
  loveChoice.style.top = '24%';
  choiceStage.hidden = false;
  instruction.hidden = false;
  instruction.textContent = 'Hình như có một ô hơi nghịch ngợm...';
  reward.hidden = true;
  hateChoice.focus();
});

