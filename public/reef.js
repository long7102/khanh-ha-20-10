// Lightweight vector life, behind the content and outside pointer interactions.
(() => {
  const reef = document.createElement('div'); reef.className = 'living-reef';
  reef.setAttribute('aria-hidden', 'true');
  reef.innerHTML = `<svg class="coral-bed" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="coralLight" x2="0" y2="1"><stop stop-color="#eeadad"/><stop offset="1" stop-color="#5bb5be"/></linearGradient></defs><path class="seabed" d="M0 333Q160 300 350 335T720 330T1100 330T1440 320V360H0Z" fill="#4d9da1"/><g class="coral-branch" fill="none" stroke="url(#coralLight)" stroke-width="8" stroke-linecap="round"><path d="M85 360V230m0 65-37-30-10-35m47 12 28-23 6-33m-35 92 37-18 15-30M48 265l-29 2m94-48 25-7M85 230l-15-29-1-28"/><path d="M1310 360V230m0 72-37-25-13-37m50 15 26-28 3-38m-30 98 45-13 18-30m-100 34-28-2m92-48 30-3m-57 3-17-37"/></g><g class="coral-fan" fill="none" stroke="#80c6c9" stroke-width="3" stroke-linecap="round"><path d="M190 360Q140 270 170 215M190 360Q185 272 210 225M185 321l-34-10m30-20-28-15m33 40 29-20m-30-44 27-14M1195 360q55-90 26-145m-26 145q6-88-19-135m24 96 34-10m-30-20 28-15m-33 40-29-20m30-44-27-14"/></g><g class="sea-grass" fill="none" stroke="#55a5a5" stroke-width="6" stroke-linecap="round"><path d="M28 360Q8 290 28 250m7 110q35-45 21-84m1350 84q-20-65 0-105m13 105q35-45 21-84M280 360q-28-46-14-75m12 75q27-38 21-61M1100 360q-28-46-14-75m12 75q27-38 21-61"/></g><g fill="#e8c5a9"><path d="m345 340 6-15 7 12 16 1-12 10 3 15-13-8-13 7 3-15-12-9Z"/><path d="m1060 340 6-15 7 12 16 1-12 10 3 15-13-8-13 7 3-15-12-9Z"/></g></svg>`;
  for (let i = 0; i < 9; i++) {
    const fish = document.createElement('div'); fish.className = `reef-fish fish-school-${i % 3}`;
    fish.style.cssText = `--depth:${15 + (i * 17) % 65}%;--fish-width:${30 + i % 4 * 12}px;--swim-time:${42 + i * 5}s;--swim-delay:${-i * 12}s`;
    fish.innerHTML = '<svg viewBox="0 0 100 48"><path d="M22 24Q52-8 85 24Q52 56 22 24L5 8V40Z" fill="currentColor"/><path d="m43 10 14-7 8 10m-23 23 13 8 9-9" fill="currentColor" opacity=".65"/><path d="M51 10q-9 14 0 28m9-29q-9 15 0 30" fill="none" stroke="#ffffff70" stroke-width="3"/><circle cx="73" cy="21" r="2.4" fill="#174b61"/></svg>';
    reef.append(fish);
  }
  document.body.append(reef);
})();