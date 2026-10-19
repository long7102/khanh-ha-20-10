const fountainButton = document.querySelector('#gift-button');
const fountainLayer = document.querySelector('#gift-burst');
const fountainLetter = document.querySelector('#gift-message');
document.body.append(fountainLayer);
const giftWriter = prepareLetter(fountainLetter);
const letterStage = document.createElement('dialog');
letterStage.className = 'gift-letter-stage';
letterStage.setAttribute('aria-label', 'Lá thư từ hộp quà dành cho Hạ');
const closeLetter = document.createElement('button');
closeLetter.type = 'button'; closeLetter.className = 'close-gift-letter'; closeLetter.textContent = 'Gấp thư lại ×';
letterStage.append(closeLetter, fountainLetter); document.body.append(letterStage);
const rereadLetter = document.createElement('button');
rereadLetter.type = 'button'; rereadLetter.className = 'outline-btn reread-letter'; rereadLetter.textContent = 'Đọc lại lá thư ♡'; rereadLetter.hidden = true;
fountainButton.after(rereadLetter);
let giftHasOpened = sessionStorage.getItem('ha-gift-opened') === 'yes';
let fountainBusy = false;
let letterOverflow = '';
let preparedGiftPhotos;
let foldingLetter = false;
function prepareGiftPhotos() {
  if (!preparedGiftPhotos) {
    let ready = 0;
    const photos = Array.from({ length: 27 }, (_, index) => {
      const image = new Image(); image.src = photoPath(index + 1); image.alt = ''; image.className = 'champagne-photo'; return image;
    });
    preparedGiftPhotos = Promise.all(photos.map(image => image.decode().catch(() => {}).then(() => {
      ready++;
      if (fountainBusy) fountainButton.querySelector('.gift-tap').textContent = `ĐANG GOM ẢNH · ${ready}/27`;
    }))).then(() => photos);
  }
  return preparedGiftPhotos;
}
if (motionOkay() && !giftHasOpened) {
  const giftPreloader = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { prepareGiftPhotos(); giftPreloader.disconnect(); }
  }, { rootMargin: '1600px 0px' });
  giftPreloader.observe(document.querySelector('#surprise'));
}
function markGiftOpened() {
  fountainButton.classList.add('open'); fountainButton.disabled = true;
  fountainButton.setAttribute('aria-expanded', 'true');
  fountainButton.querySelector('.gift-tap').textContent = 'MÓN QUÀ ĐÃ MỞ ♡';
  rereadLetter.hidden = false;
}
async function revealGiftLetter(writeText) {
  const origin = fountainButton.getBoundingClientRect();
  fountainLetter.hidden = false;
  letterOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
  letterStage.showModal();
  closeLetter.disabled = true;
  if (motionOkay()) {
    const target = fountainLetter.getBoundingClientRect();
    const dx = origin.left + origin.width / 2 - target.left - target.width / 2;
    const dy = origin.top + origin.height * .55 - target.top - target.height / 2;
    await fountainLetter.animate([
      { transform: `translate3d(${dx}px,${dy}px,0) scale(.12) rotateX(65deg) rotate(-4deg)`, opacity: .3 },
      { transform: `translate3d(${dx * .25}px,${dy * .25 - 35}px,0) scale(.8) rotateX(12deg) rotate(2deg)`, opacity: 1, offset: .65 },
      { transform: 'none', opacity: 1 }
    ], { duration: 1250, easing: 'cubic-bezier(.22,.65,.2,1)' }).finished.catch(() => {});
  }
  if (writeText) giftWriter.write(); else giftWriter.finish();
  closeLetter.disabled = false;
  closeLetter.focus({ preventScroll: true });
}
async function foldGiftLetter() {
  if (foldingLetter || closeLetter.disabled) return;
  foldingLetter = true; closeLetter.disabled = true;
  giftWriter.finish(); window.HA_SFX?.paper();
  if (motionOkay()) {
    const bounds = fountainLetter.getBoundingClientRect();
    const folded = document.createElement('div'); folded.className = 'letter-fold';
    folded.setAttribute('aria-hidden', 'true');
    folded.style.cssText = `left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;height:${bounds.height}px`;
    for (let i = 0; i < 3; i++) {
      const strip = document.createElement('div'); strip.className = 'fold-strip';
      const copy = fountainLetter.cloneNode(true); copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      copy.classList.add('fold-copy'); copy.style.top = `${-i * bounds.height / 3 - fountainLetter.scrollTop}px`;
      copy.style.height = `${fountainLetter.scrollHeight}px`;
      strip.append(copy); folded.append(strip);
    }
    letterStage.append(folded); fountainLetter.style.visibility = 'hidden';
    letterStage.classList.add('folding');
    const strips = folded.children;
    await Promise.all([
      strips[0].animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-179deg)' }], { duration: 560, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished,
      strips[2].animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(179deg)' }], { duration: 560, delay: 160, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished
    ]).catch(() => {});
    const origin = fountainButton.getBoundingClientRect();
    await folded.animate([{ transform: 'none', opacity: 1 }, { transform: `translate3d(${origin.left + origin.width / 2 - bounds.left - bounds.width / 2}px,${origin.top + origin.height / 2 - bounds.top - bounds.height / 2}px,0) scale(.12) rotate(5deg)`, opacity: 0 }], { duration: 500, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }).finished.catch(() => {});
    folded.remove(); fountainLetter.style.visibility = ''; letterStage.classList.remove('folding');
  }
  letterStage.close(); document.body.style.overflow = letterOverflow;
  foldingLetter = false; closeLetter.disabled = false;
  rereadLetter.focus({ preventScroll: true });
}
closeLetter.addEventListener('click', foldGiftLetter);
letterStage.addEventListener('cancel', event => { event.preventDefault(); foldGiftLetter(); });
rereadLetter.addEventListener('click', () => revealGiftLetter(false));
if (giftHasOpened) markGiftOpened();
fountainButton.addEventListener('click', async () => {
  if (fountainBusy || giftHasOpened) return;
  fountainBusy = true; giftHasOpened = true; sessionStorage.setItem('ha-gift-opened', 'yes');
  window.HA_SFX?.unlock();
  fountainButton.disabled = true;
  fountainButton.querySelector('.gift-tap').textContent = 'ĐANG CHUẨN BỊ BẤT NGỜ…';
  if (motionOkay()) {
    const photos = await prepareGiftPhotos();
    const rect = fountainButton.getBoundingClientRect();
    const originX = rect.left + rect.width / 2, originY = rect.top + rect.height * .35;
    fountainButton.classList.add('open');
    window.HA_SFX?.shuffle(4);
    const flights = photos.map((image, index) => {
      image.style.left = `${originX}px`; image.style.top = `${originY}px`; fountainLayer.append(image);
      const dx = Math.sin(index * 2.399) * Math.min(innerWidth * .43, 580);
      const peak = Math.min(innerHeight * .6, 470) + index % 4 * 24;
      const rotation = (index % 2 ? 1 : -1) * (100 + index % 5 * 45);
      const transform = (x, y, size, angle) => `translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) scale(${size}) rotate(${angle}deg)`;
      return image.animate([
        { transform: transform(0, 0, .1, 0), opacity: 0 },
        { transform: transform(dx * .25, -peak * .7, .8, rotation * .15), opacity: 1, offset: .2 },
        { transform: transform(dx * .58, -peak, 1, rotation * .4), opacity: 1, offset: .42 },
        { transform: transform(dx * .85, -peak * .35, .95, rotation * .7), opacity: 1, offset: .68 },
        { transform: transform(dx, innerHeight - originY + 220, .7, rotation), opacity: 0 }
      ], { duration: 2500 + index % 4 * 100, delay: index * 46, easing: 'linear', fill: 'both' }).finished.catch(() => {});
    });
    for (let i = 0; i < 32; i++) {
      const spark = document.createElement('span'); spark.className = 'champagne-spark'; spark.textContent = i % 2 ? '✦' : '♡';
      spark.style.left = `${originX}px`; spark.style.top = `${originY}px`; fountainLayer.append(spark);
      spark.animate([{ transform: 'translate(0,0) scale(.2)', opacity: 0 }, { transform: `translate(${Math.sin(i * 2.4) * innerWidth * .3}px,-${140 + i % 7 * 30}px) scale(1)`, opacity: 1, offset: .45 }, { transform: `translate(${Math.sin(i * 2.4) * innerWidth * .4}px,${innerHeight}px)`, opacity: 0 }], { duration: 2500, delay: i * 25, fill: 'both' });
    }
    await Promise.all(flights); window.HA_SFX?.stop(); fountainLayer.replaceChildren();
  }
  markGiftOpened(); fountainBusy = false;
  await revealGiftLetter(true);
});