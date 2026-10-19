// Satin bow stays attached to the lid throughout the existing gift animation.
(() => {
  const lid = document.querySelector('.gift-lid');
  if (!lid) return;
  const bow = document.createElement('span'); bow.className = 'satin-bow'; bow.setAttribute('aria-hidden', 'true');
  bow.innerHTML = `<svg viewBox="0 0 240 145" fill="none">
    <defs>
      <linearGradient id="giftSilk" x1="20" y1="20" x2="175" y2="120" gradientUnits="userSpaceOnUse"><stop stop-color="#fff9e5"/><stop offset=".3" stop-color="#ead6ac"/><stop offset=".48" stop-color="#fff5da"/><stop offset=".7" stop-color="#d5b77f"/><stop offset="1" stop-color="#f9e9c7"/></linearGradient>
      <linearGradient id="giftSilkTail" x1="120" y1="80" x2="120" y2="145" gradientUnits="userSpaceOnUse"><stop stop-color="#c2a06b"/><stop offset=".28" stop-color="#f6e6c2"/><stop offset=".6" stop-color="#fff4d7"/><stop offset="1" stop-color="#ddc18c"/></linearGradient>
      <linearGradient id="giftFoldLeft" x1="30" y1="45" x2="122" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="#c8a870"/><stop offset=".5" stop-color="#f4e0b8"/><stop offset="1" stop-color="#ad8956"/></linearGradient>
      <linearGradient id="giftFoldRight" x1="210" y1="43" x2="120" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="#d7bb89"/><stop offset=".5" stop-color="#fff0cf"/><stop offset="1" stop-color="#b89560"/></linearGradient>
    </defs>
    <path d="M114 82C99 97 96 120 69 140L93 136 103 145C114 126 123 109 126 88Z" fill="url(#giftSilkTail)"/>
    <path d="M124 82C142 91 147 117 174 132L152 134 145 145C128 121 120 103 117 88Z" fill="url(#giftSilkTail)"/>
    <path d="M116 80C92 48 68 12 38 22C15 29 20 62 37 77C58 95 90 91 116 88Z" fill="url(#giftSilk)" stroke="#e7d2aa"/>
    <path d="M114 83C86 69 58 62 35 49C34 65 44 78 61 80C79 84 96 84 114 88Z" fill="url(#giftFoldLeft)"/>
    <path d="M113 79C89 51 66 27 44 30" stroke="#fff9e7" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>
    <path d="M124 80C146 47 173 12 202 23C226 33 219 65 202 79C182 95 151 91 124 88Z" fill="url(#giftSilk)" stroke="#e7d2aa"/>
    <path d="M127 83C155 69 184 63 207 49C207 66 195 79 179 81C161 84 144 84 127 88Z" fill="url(#giftFoldRight)"/>
    <path d="M130 78C155 48 178 27 198 31" stroke="#fff9e7" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
    <path d="M111 75Q122 70 133 77L131 95Q120 101 109 93Z" fill="url(#giftSilk)" stroke="#d7bb87"/>
    <path d="m117 77-2 16m11-17-1 19" stroke="#fff7df" stroke-width="1.8" opacity=".7"/>
  </svg>`;
  lid.append(bow);
})();
