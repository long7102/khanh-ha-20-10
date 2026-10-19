// A playful entrance for a public static website, not server authentication.
window.SCRAPBOOK_ACCESS = {
  salt: 'ha-sky-scrapbook-2026',
  hash: '4ce93aacc9242e4476491883f2d9e558edb9f4e28c2ce48901ef823f099aefa3'
};
if (document.documentElement.dataset.page === 'scrapbook' &&
    sessionStorage.getItem('ha-access') !== window.SCRAPBOOK_ACCESS.hash) {
  window.location.replace('./index.html');
}

