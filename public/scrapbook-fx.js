// Scrapbook extras for the shark: it dives at the gift when the photos burst out, and the jaws chomp the way back to the top.
(() => {
  const layer = document.querySelector('#gift-burst'), button = document.querySelector('#gift-button');
  if (layer && button) {
    let busy = false;
    new MutationObserver(() => {
      if (layer.childElementCount && !busy) {
        busy = true;
        const rect = button.getBoundingClientRect();
        dispatchEvent(new CustomEvent('shark:excite', { detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height * .4, ms: 5600 } }));
      } else if (!layer.childElementCount) busy = false;
    }).observe(layer, { childList: true });
  }
  document.querySelector('.back-top')?.addEventListener('click', event => {
    if (!window.SharkChomp || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    window.SharkChomp.run(() => { const html = document.documentElement; html.style.scrollBehavior = 'auto'; scrollTo(0, 0); html.style.scrollBehavior = ''; return new Promise(resolve => setTimeout(resolve, 350)); });
  });
})();
