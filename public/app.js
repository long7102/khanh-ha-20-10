const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const photoPath = number => `./public/media/photo-${String(number).padStart(2, '0')}.jpg?v=7`;
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
const pieceSelectors = '.section-heading > *, .journey-card > *, .music-copy > *, .counter-item, .surprise-inner > .eyebrow, .surprise-inner > h2, .surprise-inner > p, .closing-section > .eyebrow, .closing-section > h2, .closing-section > p, .film-card';
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

