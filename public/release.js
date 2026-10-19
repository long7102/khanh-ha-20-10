// One explicit Vietnam time boundary, independent of the device's time zone.
(() => {
  const opensAt = Date.parse('2026-10-20T00:00:00+07:00');
  const release = {
    opensAt,
    isOpen: (now = Date.now()) => now >= opensAt,
    remaining: (now = Date.now()) => Math.max(0, opensAt - now),
    countdown(now = Date.now()) {
      const seconds = Math.ceil(Math.max(0, opensAt - now) / 1000);
      const days = Math.floor(seconds / 86400);
      const clock = [Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, '0')).join(' : ');
      return `${days ? days + ' ngày · ' : ''}${clock}`;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = release;
  else window.HA_RELEASE = release;
})();