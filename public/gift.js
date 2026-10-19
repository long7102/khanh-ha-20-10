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
      { transform: `translate(${dx}px,${dy}px) scale(.12) rotate(-4deg)`, opacity: .3, clipPath: 'inset(65% 0 0 0)' },
      { transform: `translate(${dx * .3}px,${dy * .3 - 45}px) scale(.76) rotate(3deg)`, opacity: 1, clipPath: 'inset(0)', offset: .62 },
      { transform: 'none', opacity: 1, clipPath: 'inset(0)' }
    ], { duration: 1150, easing: 'cubic-bezier(.22,.65,.2,1)' }).finished.catch(() => {});
  }
  if (writeText) giftWriter.write(); else giftWriter.finish();
  closeLetter.disabled = false;
  closeLetter.focus({ preventScroll: true });
}
function foldGiftLetter() {
  giftWriter.finish(); letterStage.close(); document.body.style.overflow = letterOverflow;
  rereadLetter.focus({ preventScroll: true });
}
closeLetter.addEventListener('click', foldGiftLetter);
letterStage.addEventListener('cancel', event => { event.preventDefault(); foldGiftLetter(); });
rereadLetter.addEventListener('click', () => revealGiftLetter(false));
if (giftHasOpened) markGiftOpened();
fountainButton.addEventListener('click', async () => {
  if (fountainBusy || giftHasOpened) return;
  fountainBusy = true; giftHasOpened = true; sessionStorage.setItem('ha-gift-opened', 'yes');
  fountainButton.disabled = true;
  fountainButton.querySelector('.gift-tap').textContent = 'ĐANG CHUẨN BỊ BẤT NGỜ…';
  if (motionOkay()) {
    const photos = Array.from({ length: 27 }, (_, index) => {
      const image = new Image(); image.src = photoPath(index + 1); image.alt = ''; image.className = 'champagne-photo'; return image;
    });
    await Promise.all(photos.map(image => image.decode().catch(() => {})));
    const rect = fountainButton.getBoundingClientRect();
    const originX = rect.left + rect.width / 2, originY = rect.top + rect.height * .35;
    fountainButton.classList.add('open');
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
    await Promise.all(flights); fountainLayer.replaceChildren();
  }
  markGiftOpened(); fountainBusy = false;
  await revealGiftLetter(true);
});

