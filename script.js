'use strict';
const letter = document.querySelector('#love-letter');
let lastTrigger;
function openLetter(event) {
  lastTrigger = event.currentTarget;
  letter.showModal();
  letter.scrollTop = 0;
  document.body.classList.add('modal-open');
}
document.querySelector('#open-letter').addEventListener('click', openLetter);
document.querySelector('#read-letter').addEventListener('click', openLetter);
document.querySelector('.close-dialog').addEventListener('click', () => letter.close());
letter.addEventListener('click', (event) => {
  const rect = letter.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) letter.close();
});
letter.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastTrigger?.focus({ preventScroll: true });
});
const candleButton = document.querySelector('#blow-candles');
const toast = document.querySelector('.toast');
let candlesOut = false;
let toastTimer;
function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.querySelector('.confetti');
  container.replaceChildren();
  for (let i = 0; i < 65; i++) {
    const particle = document.createElement('i');
    particle.textContent = ['♡', '✦', '•'][i % 3];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.fontSize = `${12 + Math.random() * 15}px`;
    particle.style.animationDelay = `${Math.random() * .8}s`;
    particle.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
    container.append(particle);
  }
}
candleButton.addEventListener('click', () => {
  candlesOut = !candlesOut;
  document.querySelector('.cake-card').classList.toggle('candles-out', candlesOut);
  candleButton.innerHTML = candlesOut ? '<span>♡</span> Thắp nến và ước thêm một lần' : '<span>✧</span> Nhắm mắt, ước một điều & thổi nến';
  if (candlesOut) {
    celebrate();
    toast.textContent = 'Chúc mừng sinh nhật Hanh! Mong điều ước của em thành hiện thực ♡';
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 5500);
  } else {
    clearTimeout(toastTimer);
    toast.classList.remove('visible');
  }
});

// Media stay local; the downloaded card embeds them for sharing.
const cardAssets = JSON.parse(document.querySelector('#card-assets').textContent);
const grid = document.querySelector('#photo-grid');
const viewer = document.querySelector('#photo-viewer');
const player = document.querySelector('#birthday-music');
const musicToggle = document.querySelector('#music-toggle');
const musicState = document.querySelector('#music-state');
const captions = ['Nụ cười anh thương', 'Một chút dịu dàng', 'Thật may vì có em', 'Em của những ngày vui', 'Dễ thương theo cách riêng', 'Một khoảnh khắc, nhiều yêu thương'];
let selectedPhoto = 0;
let photoTrigger;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 5500);
}
function renderPhotos() {
  grid.replaceChildren();
  document.querySelector('#album-empty').hidden = cardAssets.photos.length > 0;
  cardAssets.photos.forEach((src, index) => {
    const button = document.createElement('button');
    button.className = 'photo-card';
    const img = new Image(); img.src = src; img.alt = `Khoảnh khắc của Hanh ${index + 1}`; img.loading = 'lazy';
    const caption = document.createElement('span'); caption.textContent = captions[index % captions.length];
    button.append(img, caption);
    button.addEventListener('click', () => { selectedPhoto = index; photoTrigger = button; updatePhoto(); viewer.showModal(); document.body.classList.add('modal-open'); });
    grid.append(button);
  });
}
function updatePhoto() {
  document.querySelector('#full-photo').src = cardAssets.photos[selectedPhoto];
  document.querySelector('#photo-counter').textContent = `${selectedPhoto + 1} / ${cardAssets.photos.length}`;
}
function movePhoto(direction) { selectedPhoto = (selectedPhoto + direction + cardAssets.photos.length) % cardAssets.photos.length; updatePhoto(); }
document.querySelector('#previous-photo').addEventListener('click', () => movePhoto(-1));
document.querySelector('#next-photo').addEventListener('click', () => movePhoto(1));
viewer.querySelector('.close-dialog').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => { document.body.classList.remove('modal-open'); photoTrigger?.focus({preventScroll:true}); });
viewer.addEventListener('keydown', event => { if(event.key === 'ArrowLeft') movePhoto(-1); if(event.key === 'ArrowRight') movePhoto(1); });
function readFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
async function optimizePhoto(file) {
  const src = await readFile(file);
  const img = new Image(); img.src = src; await img.decode();
  const scale = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(img.naturalWidth * scale); canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .85);
}
document.querySelector('#photo-input').addEventListener('change', async event => {
  const files = [...event.target.files];
  let count = 0;
  for (const file of files) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) continue;
    try { cardAssets.photos.push(await optimizePhoto(file)); count++; } catch { showToast('Một ảnh không đọc được. Hãy thử ảnh JPG hoặc PNG nhé.'); }
  }
  renderPhotos(); event.target.value = '';
  if(count) showToast(`Đã thêm ${count} ảnh của Hanh. Nhớ tải thiệp để lưu ảnh nhé ♡`);
});
function setMusic() {
  stopYouTube();
  if(cardAssets.music) { player.src = cardAssets.music; player.volume = .55; musicState.textContent = '· Bật nhạc'; }
}
document.querySelector('#music-input').addEventListener('change', async event => {
  const file = event.target.files[0]; if(!file) return;
  if(file.size > 30 * 1024 * 1024) { showToast('Hãy chọn file nhạc nhỏ hơn 30 MB để thiệp dễ chia sẻ nhé.'); return; }
  try { cardAssets.music = await readFile(file); setMusic(); showToast('Đã ghép nhạc. Nhấn nút ♫ để nghe thử nhé.'); } catch { showToast('Chưa đọc được file nhạc. Bạn thử chọn lại nhé.'); }
  event.target.value = '';
});
function syncMusicState() { musicToggle.setAttribute('aria-pressed', String(!player.paused)); musicToggle.setAttribute('aria-label', player.paused ? 'Bật nhạc Dành cho em' : 'Tạm dừng nhạc'); musicState.textContent = player.paused ? '· Bật nhạc' : '· Đang phát'; }
player.addEventListener('play', syncMusicState); player.addEventListener('pause', syncMusicState);
player.addEventListener('error', () => { if(cardAssets.music) showToast('Trình duyệt chưa phát được file này. Hãy chọn bản MP3 nhé.'); });
musicToggle.addEventListener('click', async () => {
  if(!cardAssets.music) { toggleYouTube(); return; }
  if(!player.paused) { player.pause(); return; }
  try { await player.play(); } catch { showToast('Chưa phát được nhạc. Bạn thử chọn file MP3 khác nhé.'); }
});
document.querySelector('#export-card').addEventListener('click', async () => {
  const button = document.querySelector('#export-card'); button.disabled = true;
  try {
    const style = document.querySelector('link[rel="stylesheet"]');
    const script = document.querySelector('script[src]');
    const [css, js] = await Promise.all([fetch(style.href).then(r => {if(!r.ok) throw Error(); return r.text();}), fetch(script.src).then(r => {if(!r.ok) throw Error(); return r.text();})]);
    const clone = document.documentElement.cloneNode(true);
    clone.querySelector('body').classList.remove('modal-open'); clone.querySelector('body').classList.add('personalized');
    clone.querySelectorAll('dialog').forEach(d => d.removeAttribute('open'));
    clone.querySelector('#youtube-frame').replaceChildren(); clone.querySelector('#youtube-panel').hidden = true;
    clone.querySelector('.toast').classList.remove('visible'); clone.querySelector('.confetti').replaceChildren();
    clone.querySelector('#card-assets').textContent = JSON.stringify(cardAssets).replace(/</g, '\\u003c');
    const inlineStyle = document.createElement('style'); inlineStyle.textContent = css; clone.querySelector('link[rel="stylesheet"]').replaceWith(inlineStyle);
    clone.querySelector('script[src]').remove();
    const inlineScript = document.createElement('script'); inlineScript.textContent = js; clone.querySelector('body').append(inlineScript);
    const blob = new Blob(['<!doctype html>\n', clone.outerHTML], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gui-hanh-yeu.html'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    showToast('Thiệp đã sẵn sàng, kèm ảnh và nhạc của bạn ♡');
  } catch { showToast('Chưa tải được thiệp. Hãy chạy trang qua máy chủ như hướng dẫn trong README nhé.'); }
  finally { button.disabled = false; }
});
function stopYouTube() {
  document.querySelector('#youtube-frame').replaceChildren();
  document.querySelector('#youtube-panel').hidden = true;
  musicToggle.setAttribute('aria-pressed', 'false');
  musicToggle.setAttribute('aria-label', 'Bật nhạc Dành cho em');
  musicState.textContent = '· Bật nhạc';
}
function toggleYouTube() {
  const panel = document.querySelector('#youtube-panel');
  if (!panel.hidden) { stopYouTube(); return; }
  const frame = document.createElement('iframe');
  const video = /^[A-Za-z0-9_-]{11}$/.test(cardAssets.youtube || '') ? cardAssets.youtube : 'QxXYWMIQAcQ';
  frame.src = `https://www.youtube-nocookie.com/embed/${video}?autoplay=1&loop=1&playlist=${video}&rel=0`;
  frame.title = 'Dành cho em — bài hát dành tặng Hanh';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  document.querySelector('#youtube-frame').append(frame);
  panel.hidden = false;
  musicToggle.setAttribute('aria-pressed', 'true');
  musicToggle.setAttribute('aria-label', 'Đóng trình phát nhạc');
  musicState.textContent = '· Đóng nhạc';
}
document.querySelector('#close-youtube').addEventListener('click', () => { stopYouTube(); musicToggle.focus(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !document.querySelector('#youtube-panel').hidden) stopYouTube(); });
renderPhotos(); setMusic();
