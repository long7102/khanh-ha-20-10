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
    window.location.replace('./scrapbook.html?v=9');
  } catch (reason) {
    error.textContent = reason.message || 'Có lỗi kết nối. Thử lại nhé.';
    submit.disabled = false;
    submit.innerHTML = 'Mở cuốn scrapbook <span aria-hidden="true">↗</span>';
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
      image.src = `./public/media/photo-${String(number).padStart(2, '0')}.jpg?v=8`;
      image.alt = '';
      image.decoding = 'async';
      group.append(image);
    }
    row.append(group);
  }
  floatingPhotos.append(row);
}
document.querySelector('.login-scene').prepend(floatingPhotos);

