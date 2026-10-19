// A playful entrance for a public static website, not server authentication.
window.SCRAPBOOK_ACCESS = {
  salt: 'ha-sky-scrapbook-2026',
  hash: '4ce93aacc9242e4476491883f2d9e558edb9f4e28c2ce48901ef823f099aefa3'
};
window.HA_PREVIEW = new URLSearchParams(window.location.search).get('preview') === '1';
if (document.documentElement.dataset.page === 'scrapbook' &&
    ((!window.HA_PREVIEW && !window.HA_RELEASE?.isOpen()) || sessionStorage.getItem('ha-access') !== window.SCRAPBOOK_ACCESS.hash)) {
  document.documentElement.style.visibility = 'hidden';
  window.location.replace(`./index.html?v=18${window.HA_PREVIEW ? '&preview=1' : ''}`);
}