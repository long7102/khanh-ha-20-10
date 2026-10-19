const form = document.querySelector('#login-form');
const error = document.querySelector('#login-error');
const submit = form.querySelector('[type="submit"]');

document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const field = document.querySelector('#password');
  const showing = field.type === 'text';
  field.type = showing ? 'password' : 'text';
  event.currentTarget.textContent = showing ? 'Hiện' : 'Ẩn';
  event.currentTarget.setAttribute('aria-label', showing ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const username = form.elements.namedItem('username').value.trim();
  const password = form.elements.namedItem('password').value;
  if (!username || !password) {
    error.textContent = 'Em nhập đủ tên đăng nhập và mật khẩu nhé.';
    return;
  }
  submit.disabled = true;
  submit.textContent = 'Đang mở cuốn scrapbook…';
  try {
    const config = window.SCRAPBOOK_ACCESS;
    const bytes = new TextEncoder().encode(`${username}:${password}:${config.salt}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== config.hash) throw new Error('Chưa đúng rồi, em thử lại nhé.');
    sessionStorage.setItem('ha-access', config.hash);
    window.location.replace('./scrapbook.html');
  } catch (reason) {
    error.textContent = reason.message || 'Có lỗi kết nối. Thử lại nhé.';
    submit.disabled = false;
    submit.innerHTML = 'Mở cuốn scrapbook <span aria-hidden="true">↗</span>';
  }
});

// All pictures drift softly behind the welcome panel.
const floatingPhotos = document.createElement('div');
floatingPhotos.className = 'login-floating-photos';
floatingPhotos.setAttribute('aria-hidden', 'true');
for (let number = 1; number <= 27; number++) {
  const image = document.createElement('img');
  image.src = `./public/media/photo-${String(number).padStart(2, '0')}.jpg`;
  image.alt = '';
  image.decoding = 'async';
  image.style.setProperty('--photo-left', `${((number * 37) % 112) - 6}%`);
  image.style.setProperty('--photo-top', `${((number * 23) % 102) - 5}%`);
  image.style.setProperty('--photo-rotate', `${(number * 17) % 36 - 18}deg`);
  image.style.setProperty('--photo-duration', `${18 + number % 8}s`);
  image.style.setProperty('--photo-delay', `${-number * 1.3}s`);
  floatingPhotos.append(image);
}
document.querySelector('.login-scene').prepend(floatingPhotos);

