// Keep the complete copy in flow so typing never moves the surrounding artwork.
(() => {
  const elements = [...document.querySelectorAll('.hero-copy h1, .hero-copy > p')];
  if (!elements.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const parts = [];
  for (const element of elements) {
    const layout = document.createElement('span'); layout.className = 'type-layout';
    while (element.firstChild) layout.append(element.firstChild);
    layout.setAttribute('aria-hidden', 'true');
    const copy = layout.cloneNode(true); copy.className = 'type-copy';
    element.setAttribute('aria-label', layout.textContent);
    element.classList.add('hero-typewriter');
    element.append(layout, copy);
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const ink = document.createElement('span');
      ink.className = 'type-ink';
      const normalized = node.textContent.normalize('NFC');
      const text = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(normalized)].map(item => item.segment) : [...normalized];
      node.replaceWith(ink); parts.push({ ink, text, speed: element.tagName === 'H1' ? 65 : 29 });
    }
  }
  let stopped = false;
  const finish = () => { stopped = true; parts.forEach(({ ink, text }) => { ink.textContent = text.join(''); ink.classList.remove('typing'); }); };
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) finish(); });
  const delay = time => new Promise(resolve => setTimeout(resolve, time));
  async function write() {
    await delay(350);
    for (const part of parts) {
      if (stopped) return;
      part.ink.classList.add('typing');
      for (let i = 0; i < part.text.length; i++) {
        if (stopped) return;
        part.ink.textContent += part.text[i];
        await delay(/[.!?]/.test(part.text[i]) ? 700 : /[,—]/.test(part.text[i]) ? 200 : part.speed);
      }
      part.ink.classList.remove('typing');
      await delay(400);
    }
  }
  write();
})();