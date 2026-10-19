const form = document.querySelector('#login-form');
const error = document.querySelector('#login-error');
const submit = form.querySelector('[type="submit"]');
const loginPanel = document.querySelector('.login-panel');
const backgroundToggle = document.createElement('button');
backgroundToggle.type = 'button'; backgroundToggle.className = 'background-toggle';
backgroundToggle.textContent = 'Ẩn form · Ngắm đại dương';
backgroundToggle.setAttribute('aria-expanded', 'true');
loginPanel.id = 'login-panel'; backgroundToggle.setAttribute('aria-controls', 'login-panel');
document.body.append(backgroundToggle);
const voyage = document.createElement('div'); voyage.className = 'login-voyage'; voyage.hidden = true;
voyage.setAttribute('role', 'status'); voyage.setAttribute('aria-live', 'polite');
voyage.innerHTML = '<div class="voyage-scene" aria-hidden="true"><div class="voyage-ring"></div><svg viewBox="0 0 100 48"><path d="M22 24Q52-8 85 24Q52 56 22 24L5 8V40Z" fill="currentColor"/><circle cx="73" cy="21" r="2.4" fill="#174b61"/></svg><i></i><i></i><i></i></div><span class="eyebrow">MỘT ĐẠI DƯƠNG DÀNH RIÊNG CHO EM</span><h2>Cùng lặn xuống<br><em>một chút nhé…</em></h2><p>Đang gom những điều bất ngờ cho Hạ.</p><div class="voyage-progress" aria-hidden="true"><span></span></div>';
document.body.append(voyage);
const release = window.HA_RELEASE;
const preview = window.HA_PREVIEW === true;
const canEnter = () => preview || release.isOpen();
let verifiedForRelease = false;
let enteringScrapbook = false;
const releaseNote = document.createElement('div'); releaseNote.className = 'release-note';
releaseNote.innerHTML = '<strong>Món quà mở lúc 00:00 · 20/10/2026</strong><span class="release-countdown" aria-hidden="true"></span><span>Tha hồ mà ngồi đợi nhé đồ lùn</span><span class="release-status" role="status"></span>';
if (preview) releaseNote.innerHTML = '<strong>BẢN XEM THỬ</strong><br><span>Đăng nhập để kiểm tra ngay, không cần chờ giờ mở quà.</span><span class="release-status" role="status"></span>';
form.before(releaseNote);
async function enterScrapbook() {
  if (enteringScrapbook || !verifiedForRelease || !canEnter()) return;
  enteringScrapbook = true;
  sessionStorage.setItem('ha-access', window.SCRAPBOOK_ACCESS.hash);
  submit.textContent = preview ? 'Đang mở bản xem thử…' : 'Chúc mừng 20/10, kẹo dâu lùn của anh ♡';
  releaseNote.querySelector('.release-status').textContent = preview ? 'Đấy, người yêu tôi đấy, khen đi cả nhà.' : 'Đến giờ rồi, cùng mở món quà nhé.';
  loginPanel.inert = true; backgroundToggle.disabled = true;
  document.body.classList.add('entering');
  voyage.hidden = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await new Promise(resolve => setTimeout(resolve, reduced ? 0 : 1700));
  window.location.replace(`./scrapbook.html?v=18${preview ? '&preview=1' : ''}`);
}
function updateRelease() {
  const open = canEnter();
  releaseNote.hidden = open && !verifiedForRelease && !preview;
  if (!open) releaseNote.querySelector('.release-countdown').textContent = release.countdown();
  if (open && verifiedForRelease) enterScrapbook();
}
// Align the final tick with the release boundary rather than waiting a full second.
function scheduleReleaseTick() {
  updateRelease();
  if (!canEnter() && !enteringScrapbook) setTimeout(scheduleReleaseTick, Math.min(1000, Math.max(10, release.remaining())));
}
scheduleReleaseTick();
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateRelease(); });
window.addEventListener('pageshow', updateRelease);
form.addEventListener('input', () => {
  if (!verifiedForRelease || enteringScrapbook) return;
  verifiedForRelease = false; submit.disabled = false;
  loginPanel.classList.remove('waiting');
  submit.textContent = 'Mở cuốn scrapbook ↗';
  releaseNote.querySelector('.release-status').textContent = '';
});
backgroundToggle.addEventListener('click', () => {
  const hidden = loginPanel.classList.toggle('is-hidden');
  loginPanel.inert = hidden;
  loginPanel.setAttribute('aria-hidden', String(hidden));
  backgroundToggle.setAttribute('aria-expanded', String(!hidden));
  backgroundToggle.textContent = hidden ? 'Hiện form đăng nhập' : 'Ẩn form · Ngắm đại dương';
});

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const field = document.querySelector('#password');
  const showing = field.type === 'text';
  field.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Hiện' : 'Ẩn';
  event.currentTarget.setAttribute('aria-label', showing ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (enteringScrapbook || verifiedForRelease) return;
  error.textContent = '';
  const username = form.elements.namedItem('username').value.trim();
  const password = form.elements.namedItem('password').value;
  if (!username || !password) {
    error.textContent = 'Ai đây, giả danh bạn gái tôi đúng không !!!!.';
    return;
  }
  submit.disabled = true;
  submit.textContent = 'Đang tiến đến bất ngờ tiếp theo…';
  try {
    const config = window.SCRAPBOOK_ACCESS;
    const bytes = new TextEncoder().encode(`${username}:${password}:${config.salt}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== config.hash) throw new Error('Chưa đúng rồi, không làm được để Nghĩa làm cho.');
    verifiedForRelease = true;
    if (canEnter()) enterScrapbook();
    else {
      loginPanel.classList.add('waiting');
      submit.textContent = 'Đã sẵn sàng · Chờ 00:00 ♡';
      releaseNote.querySelector('.release-status').textContent = 'Thông tin đã đúng. Nhưng bóc quà thì còn lâu nhé.';
      updateRelease();
    }
  } catch (reason) {
    error.textContent = reason.message || 'Có lỗi kết nối. Thử lại nhé.';
    submit.disabled = false;
    submit.innerHTML = 'Mở ra bất ngờ tiếp theo <span aria-hidden="true">↗</span>';
  }
});

// Each row repeats its exact group for a seamless, slow infinite scroll.
const floatingPhotos = document.createElement('div');
floatingPhotos.className = 'login-photo-rows';
floatingPhotos.setAttribute('aria-hidden', 'true');
for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
  const row = document.createElement('div');
  row.className = 'login-photo-row';
  for (let copy = 0; copy < 2; copy++) {
    const group = document.createElement('div');
    group.className = 'login-photo-group';
    for (let offset = 1; offset <= 9; offset++) {
      const image = document.createElement('img');
      const number = rowIndex * 9 + offset;
      image.src = `./public/media/previews/photo-${String(number).padStart(2, '0')}.webp?v=11`;
      image.alt = '';
      image.decoding = 'async';
      group.append(image);
    }
    row.append(group);
  }
  floatingPhotos.append(row);
}
document.querySelector('.login-scene').prepend(floatingPhotos);
const loginSea = document.createElement('div');
loginSea.className = 'login-fish'; loginSea.setAttribute('aria-hidden', 'true');
loginSea.innerHTML = '<div class="login-water-rays"></div>';
for (let i = 0; i < 7; i++) {
  const fish = document.createElement('span'); fish.className = 'sea-fish';
  fish.style.cssText = `--depth:${12 + i * 12}%;--size:${30 + i % 3 * 13}px;--swim:${38 + i * 7}s;--delay:${-i * 13}s`;
  fish.innerHTML = '<svg viewBox="0 0 90 40" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M22 20Q45-4 75 20Q45 44 22 20L7 7V33Z"/><circle cx="62" cy="17" r="1.5" fill="currentColor"/><path d="M42 9l8-7 5 8M42 31l8 7 5-8"/></svg>';
  loginSea.append(fish);
}
for (let i = 0; i < 12; i++) {
  const bubble = document.createElement('span'); bubble.className = 'login-bubble';
  bubble.style.cssText = `--left:${i * 8.5}%;--bubble:${5 + i % 4 * 4}px;--rise:${19 + i * 2}s;--delay:${-i * 4}s`;
  loginSea.append(bubble);
}
document.querySelector('.login-scene').append(loginSea);