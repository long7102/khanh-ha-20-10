// Apply the saved sea before the page paints.
(() => {
  let theme = 'light';
  try { theme = localStorage.getItem('ha-theme') === 'dark' ? 'dark' : 'light'; } catch {}
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'theme-toggle';
    button.innerHTML = '<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg><svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/><path d="M18 2v4m-2-2h4"/></svg>';
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      button.setAttribute('aria-label', dark ? 'Thức dậy vào ban ngày' : 'Đi ngủ vào ban đêm');
      button.title = dark ? 'Biển ban ngày' : 'Biển ban đêm';
      button.setAttribute('aria-pressed', String(dark));
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c2638' : '#d8efff');
    };
    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('ha-theme', root.dataset.theme); } catch {}
      sync();
    });
    (document.querySelector('.header-actions') || document.querySelector('.login-panel')).append(button);
    sync();
  });
})();
