// Shark-jaw scene change. SharkChomp.run(midpoint) closes the jaws, runs midpoint() while the screen is covered, then opens them.
// A jaw left shut at the end of one page (sessionStorage 'ha-chomp') is shut again at the start of the next, then opens.
(() => {
  const KEY = 'ha-chomp';
  let carried = false;
  try { carried = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  if (carried) document.documentElement.classList.add('chomp-in');

  let jaws = null;
  const teeth = flip => {
    const count = 9, width = 1000 / count; let points = '';
    for (let i = flip ? -1 : 0; i < count + 1; i++) { const x = i * width + (flip ? width / 2 : 0); points += `<polygon points="${x + width * .1},0 ${x + width * .9},0 ${x + width / 2},100"/>`; }
    return `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><g fill="#fffaf0" stroke="#d8ccb2" stroke-width="2" vector-effect="non-scaling-stroke"${flip ? ' transform="translate(0,100) scale(1,-1)"' : ''}>${points}</g></svg>`;
  };
  const build = () => {
    if (jaws) return jaws;
    jaws = document.createElement('div'); jaws.className = 'shark-jaws'; jaws.setAttribute('aria-hidden', 'true');
    jaws.innerHTML = `<div class="jaw top">${teeth(false)}</div><div class="jaw bottom">${teeth(true)}</div>`;
    document.body.append(jaws); return jaws;
  };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shut = async ({ remember = false } = {}) => {
    const el = build(); if (remember) { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ } }
    el.getBoundingClientRect(); el.classList.remove('wide'); el.classList.add('shut'); await wait(reduced() ? 20 : 400);
  };
  // The full bite: jaws open wide and loom over the screen, hold for a beat, then slam shut with a shake.
  const bite = async ({ remember = false } = {}) => {
    const el = build();
    if (remember) { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ } }
    if (reduced()) return shut({ remember });
    el.getBoundingClientRect(); el.classList.add('wide'); await wait(850);
    await wait(380);
    await shut({ remember });
    el.classList.add('shake'); await wait(460); el.classList.remove('shake');
  };
  const open = async () => { const el = build(); el.classList.remove('shut', 'wide'); await wait(reduced() ? 20 : 950); };
  const run = async midpoint => { await bite(); try { await midpoint?.(); } finally { await wait(150); await open(); } };

  addEventListener('DOMContentLoaded', async () => {
    if (!carried) return;
    const el = build(); el.style.setProperty('transition', 'none'); el.querySelectorAll('.jaw').forEach(jaw => { jaw.style.transition = 'none'; });
    el.classList.add('shut'); el.getBoundingClientRect();
    document.documentElement.classList.remove('chomp-in');
    await new Promise(resolve => (document.readyState === 'complete' ? resolve() : addEventListener('load', resolve, { once: true })));
    await wait(450);
    el.querySelectorAll('.jaw').forEach(jaw => { jaw.style.transition = ''; });
    open();
  });
  window.SharkChomp = { shut, bite, open, run };
})();
