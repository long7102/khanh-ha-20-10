// Playback always starts with an explicit click; no autoplay or saved auto-resume.
const soundtrack = new Audio('./public/media/piano-instrumental.mp3');
soundtrack.id = 'soundtrack'; soundtrack.hidden = true; document.body.append(soundtrack);
soundtrack.preload = 'metadata'; soundtrack.loop = true; soundtrack.volume = .45;
const musicCopy = document.querySelector('.music-copy');
const controls = document.createElement('div'); controls.className = 'soundtrack-controls';
controls.innerHTML = '<label class="track-seek"><span class="track-time">0:00 / —</span><input id="track-seek" type="range" min="0" max="100" value="0" step=".1" aria-label="Tiến độ bài nhạc"></label><label class="track-volume">Âm lượng <input id="track-volume" type="range" min="0" max="1" step=".05" value=".45" aria-label="Âm lượng"></label><small>Chỉ phát khi em bấm · Có thể dừng ở bất kỳ đâu</small>';
musicCopy.append(controls);
const musicNow = document.createElement('button'); musicNow.type = 'button'; musicNow.className = 'music-now'; musicNow.hidden = true;
musicNow.innerHTML = '<span class="music-equalizer" aria-hidden="true"><i></i><i></i><i></i></span><span>Đại dương đang ngân<small>Piano instrumental · Bấm để tạm dừng</small></span><b aria-hidden="true">Ⅱ</b>';
document.body.append(musicNow);
const seek = controls.querySelector('#track-seek');
const volume = controls.querySelector('#track-volume');
const clockText = controls.querySelector('.track-time');
const timeText = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '—';
function syncSoundtrack() {
  const playing = !soundtrack.paused && !soundtrack.ended;
  document.body.classList.toggle('music-playing', playing);
  document.querySelector('#record').classList.toggle('playing', playing);
  document.querySelector('#music-toggle').setAttribute('aria-pressed', String(playing));
  document.querySelector('#music-toggle').setAttribute('aria-label', playing ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền');
  document.querySelector('#music-card-toggle').setAttribute('aria-pressed', String(playing));
  document.querySelector('#music-label').textContent = playing ? 'Tạm dừng nhạc' : 'Bật nhạc';
  document.querySelector('#music-card-label').textContent = playing ? 'Tạm dừng' : 'Bật nhạc';
  musicNow.hidden = !playing;
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}
async function toggleSoundtrack() {
  if (!soundtrack.paused) { soundtrack.pause(); return; }
  document.querySelector('#music-card-label').textContent = 'Đang mở nhạc…';
  try { await soundtrack.play(); } catch { document.querySelector('#music-card-label').textContent = 'Chưa tải được nhạc · Thử lại'; }
}
document.querySelector('#music-toggle').addEventListener('click', toggleSoundtrack);
document.querySelector('#music-card-toggle').addEventListener('click', toggleSoundtrack);
musicNow.addEventListener('click', toggleSoundtrack);
soundtrack.addEventListener('play', syncSoundtrack);
soundtrack.addEventListener('pause', syncSoundtrack);
soundtrack.addEventListener('error', () => { syncSoundtrack(); document.querySelector('#music-card-label').textContent = 'Chưa tải được nhạc · Thử lại'; });
function updateTrackProgress() {
  clockText.textContent = `${timeText(soundtrack.currentTime)} / ${timeText(soundtrack.duration)}`;
  seek.value = Number.isFinite(soundtrack.duration) ? String(soundtrack.currentTime / soundtrack.duration * 100) : '0';
}
soundtrack.addEventListener('timeupdate', updateTrackProgress);
soundtrack.addEventListener('loadedmetadata', updateTrackProgress);
seek.addEventListener('input', () => { if (Number.isFinite(soundtrack.duration)) soundtrack.currentTime = Number(seek.value) / 100 * soundtrack.duration; });
volume.addEventListener('input', () => { soundtrack.volume = Number(volume.value); });
if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
  navigator.mediaSession.metadata = new MediaMetadata({ title: 'Một bài nhạc dành riêng cho em', artist: 'Dành cho Khánh Hạ', album: 'Đại dương cho người lùn bơi· 20/10' });
  navigator.mediaSession.setActionHandler('play', () => soundtrack.play().catch(() => {}));
  navigator.mediaSession.setActionHandler('pause', () => soundtrack.pause());
}
syncSoundtrack();
