'use strict';

const PASSCODE = '0611';
const $ = (selector) => document.querySelector(selector);
const lockScreen = $('#lock-screen');
const content = $('#birthday-content');
const passcode = $('#passcode');
const codeMessage = $('#code-message');
const pinSlots = [...document.querySelectorAll('.pin-slot')];
const letter = $('#love-letter');
const viewer = $('#photo-viewer');
const player = $('#birthday-music');
const musicToggle = $('#music-toggle');
const musicState = $('#music-state');
const toast = $('.toast');
const cardAssets = JSON.parse($('#card-assets').textContent);
const photoCaption = index => `Hanh / ${String(index + 1).padStart(2, '0')}`;
let isUnlocked = false;
let candlesOut = false;
let lastTrigger;
let photoTrigger;
let selectedPhoto = 0;
let toastTimer;

function createIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
}

function updatePin() {
  passcode.value = passcode.value.replace(/\D/g, '').slice(0, 4);
  pinSlots.forEach((slot, index) => {
    slot.classList.toggle('is-filled', index < passcode.value.length);
    slot.classList.toggle('is-current', index === Math.min(passcode.value.length, 3));
  });
}

function clearCodeError() {
  $('#lock-card').classList.remove('is-error');
  passcode.removeAttribute('aria-invalid');
  codeMessage.className = 'code-message';
  codeMessage.textContent = 'Bốn con số. Một ngày không thể quên.';
}

function enterDigit(digit) {
  if (isUnlocked) return;
  clearCodeError();
  passcode.value += digit;
  updatePin();
}

passcode.addEventListener('input', () => { clearCodeError(); updatePin(); });
document.querySelectorAll('[data-digit]').forEach(button => {
  button.addEventListener('click', () => enterDigit(button.dataset.digit));
});
$('#delete-digit').addEventListener('click', () => {
  clearCodeError();
  passcode.value = passcode.value.slice(0, -1);
  updatePin();
});
$('#hint-button').addEventListener('click', () => {
  const hint = $('#code-hint');
  hint.hidden = !hint.hidden;
  $('#hint-button').setAttribute('aria-expanded', String(!hint.hidden));
});

document.addEventListener('keydown', event => {
  if (isUnlocked || event.target === passcode || event.ctrlKey || event.metaKey || event.altKey) return;
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    enterDigit(event.key);
  } else if (event.key === 'Backspace') {
    event.preventDefault();
    $('#delete-digit').click();
  }
});

$('#unlock-form').addEventListener('submit', event => {
  event.preventDefault();
  if (isUnlocked) return;
  updatePin();
  if (passcode.value !== PASSCODE) {
    const incomplete = passcode.value.length !== 4;
    codeMessage.textContent = incomplete ? 'Em nhập đủ 4 con số trước nhé.' : 'Mã chưa đúng. Thử lại nhé, không trừ điểm.';
    codeMessage.className = 'code-message is-error';
    passcode.setAttribute('aria-invalid', 'true');
    $('#lock-card').classList.remove('is-error');
    // Restart the small shake even when the same code is retried.
    void $('#lock-card').offsetWidth;
    $('#lock-card').classList.add('is-error');
    if (!incomplete) { passcode.value = ''; updatePin(); }
    return;
  }
  isUnlocked = true;
  lockScreen.hidden = true;
  content.hidden = false;
  content.inert = false;
  content.classList.add('is-revealing');
  document.body.classList.remove('is-locked');
  window.scrollTo({ top: 0, behavior: 'instant' });
  renderPhotos();
  setMusic();
  // Start from the submit gesture, not from a timer, for mobile audio policies.
  if ($('#unlock-music').checked) toggleMusic();
  $('#hero-title').focus({ preventScroll: true });
  celebrate(38);
});

function relock({ focus = true } = {}) {
  isUnlocked = false;
  stopMusic();
  for (const dialog of [letter, viewer]) if (dialog.open) dialog.close();
  player.removeAttribute('src');
  player.load();
  document.body.classList.remove('modal-open');
  document.body.classList.add('is-locked');
  content.hidden = true;
  content.inert = true;
  content.classList.remove('is-revealing');
  lockScreen.hidden = false;
  passcode.value = '';
  clearCodeError();
  updatePin();
  $('#code-hint').hidden = true;
  $('#hint-button').setAttribute('aria-expanded', 'false');
  $('.confetti').replaceChildren();
  clearTimeout(toastTimer);
  toast.classList.remove('visible');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) { $('#lock-title').tabIndex = -1; $('#lock-title').focus({ preventScroll: true }); }
}
$('#relock-button').addEventListener('click', () => relock());

function openLetter(event) {
  if (!isUnlocked) return;
  lastTrigger = event.currentTarget;
  letter.showModal();
  letter.scrollTop = 0;
  document.body.classList.add('modal-open');
}
$('#open-letter').addEventListener('click', openLetter);
$('#read-letter').addEventListener('click', openLetter);
letter.querySelector('.close-dialog').addEventListener('click', () => letter.close());
letter.addEventListener('click', event => {
  const rect = letter.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) letter.close();
});
letter.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (isUnlocked) lastTrigger?.focus({ preventScroll: true });
});

function celebrate(count = 60) {
  if (!isUnlocked || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = $('.confetti');
  container.replaceChildren();
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('i');
    const size = 8 + Math.random() * 13;
    particle.append(createIcon(['heart', 'flower', 'spark'][i % 3]));
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animationDelay = `${Math.random() * .8}s`;
    particle.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
    container.append(particle);
  }
}

function updateCandleButton() {
  const label = document.createElement('span');
  label.textContent = candlesOut ? 'Thắp nến, ước tiếp' : 'Thổi nến thôi';
  $('#blow-candles').replaceChildren(createIcon(candlesOut ? 'heart' : 'spark'), label);
}
$('#blow-candles').addEventListener('click', () => {
  if (!isUnlocked) return;
  candlesOut = !candlesOut;
  $('.cake-card').classList.toggle('candles-out', candlesOut);
  updateCandleButton();
  if (candlesOut) {
    celebrate();
    showToast('Điều ước đã nhận. Sinh nhật thật vui nhé, Hanh!');
  } else {
    clearTimeout(toastTimer);
    toast.classList.remove('visible');
  }
});

// Selected media stay in memory until they are embedded in the downloaded card.
function renderPhotos() {
  const grid = $('#photo-grid');
  grid.replaceChildren();
  const hasPhotos = cardAssets.photos.length > 0;
  $('#album-empty').hidden = hasPhotos;
  $('#album').hidden = document.body.classList.contains('personalized') && !hasPhotos;
  cardAssets.photos.forEach((src, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-card';
    const img = new Image();
    img.src = src;
    img.alt = `Khoảnh khắc của Hanh ${index + 1}`;
    img.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = photoCaption(index);
    button.append(img, caption);
    button.addEventListener('click', () => {
      if (!isUnlocked) return;
      selectedPhoto = index;
      photoTrigger = button;
      updatePhoto();
      viewer.showModal();
      document.body.classList.add('modal-open');
    });
    grid.append(button);
  });
}
function updatePhoto() {
  $('#full-photo').src = cardAssets.photos[selectedPhoto];
  $('#photo-counter').textContent = `${selectedPhoto + 1} / ${cardAssets.photos.length}`;
}
function movePhoto(direction) {
  if (!cardAssets.photos.length) return;
  selectedPhoto = (selectedPhoto + direction + cardAssets.photos.length) % cardAssets.photos.length;
  updatePhoto();
}
$('#previous-photo').addEventListener('click', () => movePhoto(-1));
$('#next-photo').addEventListener('click', () => movePhoto(1));
viewer.querySelector('.close-dialog').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (isUnlocked) photoTrigger?.focus({ preventScroll: true });
});
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') movePhoto(-1);
  if (event.key === 'ArrowRight') movePhoto(1);
});
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function optimizePhoto(file) {
  const img = new Image();
  img.src = await readFile(file);
  await img.decode();
  const scale = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .85);
}
for (const id of ['#add-first-photos', '#add-photos']) {
  $(id).addEventListener('click', () => { if (isUnlocked) $('#photo-input').click(); });
}
$('#add-music').addEventListener('click', () => { if (isUnlocked) $('#music-input').click(); });
$('#photo-input').addEventListener('change', async event => {
  if (!isUnlocked) return;
  const files = [...event.target.files];
  let count = 0;
  for (const file of files) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) continue;
    try { cardAssets.photos.push(await optimizePhoto(file)); count++; }
    catch { showToast('Một ảnh không đọc được. Em thử ảnh JPG hoặc PNG nhé.'); }
  }
  if (isUnlocked) renderPhotos();
  event.target.value = '';
  if (count && isUnlocked) showToast(`Đã thêm ${count} ảnh. Nhớ tải thiệp để lưu lại nhé ♡`);
});

function syncMusicState() {
  const playing = isUnlocked && !player.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Tạm dừng nhạc' : 'Bật nhạc Dành cho em');
  musicState.textContent = playing ? 'Đang phát cho em nghe' : 'Bật một chút nhạc nhé';
}
function stopYouTube() {
  $('#youtube-frame').replaceChildren();
  $('#youtube-panel').hidden = true;
  syncMusicState();
}
function stopMusic() {
  player.pause();
  stopYouTube();
}
function setMusic() {
  stopMusic();
  if (isUnlocked && cardAssets.music) {
    player.src = cardAssets.music;
    player.volume = .55;
  }
}
function openYouTube() {
  if (!isUnlocked) return;
  const frame = document.createElement('iframe');
  const video = /^[A-Za-z0-9_-]{11}$/.test(cardAssets.youtube || '') ? cardAssets.youtube : 'QxXYWMIQAcQ';
  frame.src = `https://www.youtube-nocookie.com/embed/${video}?autoplay=1&loop=1&playlist=${video}&rel=0`;
  frame.title = 'Dành cho em — bài hát dành tặng Hanh';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#youtube-frame').replaceChildren(frame);
  $('#youtube-panel').hidden = false;
  musicToggle.setAttribute('aria-pressed', 'true');
  musicToggle.setAttribute('aria-label', 'Dừng nhạc và đóng trình phát');
  musicState.textContent = 'Trình phát đang mở';
}
async function toggleMusic() {
  if (!isUnlocked) return;
  if (!cardAssets.music) {
    if ($('#youtube-panel').hidden) openYouTube();
    else stopYouTube();
    return;
  }
  if (!player.paused) { player.pause(); return; }
  try {
    await player.play();
    if (!isUnlocked) player.pause();
  } catch {
    if (isUnlocked) showToast('Chạm nút nhạc để thử lại nhé. Trình duyệt có thể cần thêm một lần nhấn.');
  }
}
player.addEventListener('play', syncMusicState);
player.addEventListener('pause', syncMusicState);
player.addEventListener('error', () => {
  if (isUnlocked && cardAssets.music) showToast('Chưa phát được file này. Em thử một bản MP3 nhé.');
});
musicToggle.addEventListener('click', toggleMusic);
$('#close-youtube').addEventListener('click', () => { stopYouTube(); musicToggle.focus(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !letter.open && !viewer.open && !$('#youtube-panel').hidden) stopYouTube();
});
$('#music-input').addEventListener('change', async event => {
  if (!isUnlocked) return;
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('audio/')) { showToast('Em chọn một file âm thanh nhé.'); return; }
  if (file.size > 30 * 1024 * 1024) { showToast('Chọn file nhạc nhỏ hơn 30 MB để thiệp dễ chia sẻ nhé.'); return; }
  try {
    cardAssets.music = await readFile(file);
    setMusic();
    if (isUnlocked) showToast('Đã ghép nhạc. Nhấn nút nhạc để nghe thử nhé ♡');
  } catch { if (isUnlocked) showToast('Chưa đọc được file nhạc. Em thử chọn lại nhé.'); }
  event.target.value = '';
});

async function inlineFonts(css, baseUrl) {
  const matches = [...css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)];
  for (const match of matches) {
    if (match[1].startsWith('data:')) continue;
    const response = await fetch(new URL(match[1], baseUrl));
    if (!response.ok) throw new Error('Font could not be loaded');
    css = css.replace(match[0], `url('${await readFile(await response.blob())}')`);
  }
  return css;
}
async function readSource(element) {
  const url = element.href || element.src;
  if (!url) return element.textContent;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Card source could not be loaded');
  return response.text();
}
$('#export-card').addEventListener('click', async () => {
  if (!isUnlocked) return;
  const button = $('#export-card');
  button.disabled = true;
  try {
    const style = $('link[rel="stylesheet"]') || $('style[data-card-style]');
    const script = $('script[src]') || $('script[data-card-script]');
    let [css, js] = await Promise.all([readSource(style), readSource(script)]);
    css = await inlineFonts(css, style.href || location.href);
    const clone = document.documentElement.cloneNode(true);
    clone.querySelector('body').className = 'is-locked personalized';
    const protectedContent = clone.querySelector('#birthday-content');
    protectedContent.hidden = true;
    protectedContent.setAttribute('inert', '');
    protectedContent.classList.remove('is-revealing');
    clone.querySelector('#lock-screen').hidden = false;
    clone.querySelector('#passcode').removeAttribute('value');
    clone.querySelector('#passcode').removeAttribute('aria-invalid');
    clone.querySelector('#unlock-music').toggleAttribute('checked', $('#unlock-music').checked);
    clone.querySelector('#lock-card').classList.remove('is-error');
    clone.querySelector('#code-message').className = 'code-message';
    clone.querySelector('#code-message').textContent = 'Bốn con số. Một ngày không thể quên.';
    clone.querySelector('#code-hint').hidden = true;
    clone.querySelector('#hint-button').setAttribute('aria-expanded', 'false');
    clone.querySelectorAll('.pin-slot').forEach(slot => slot.classList.remove('is-filled', 'is-current'));
    clone.querySelectorAll('dialog').forEach(dialog => dialog.removeAttribute('open'));
    clone.querySelector('.personalize').removeAttribute('open');
    clone.querySelector('#youtube-frame').replaceChildren();
    clone.querySelector('#youtube-panel').hidden = true;
    clone.querySelector('#birthday-music').removeAttribute('src');
    clone.querySelector('#photo-grid').replaceChildren();
    clone.querySelector('#full-photo').removeAttribute('src');
    clone.querySelector('.toast').classList.remove('visible');
    clone.querySelector('.toast').textContent = '';
    clone.querySelector('.confetti').replaceChildren();
    const embeddedPhotos = await Promise.all(cardAssets.photos.map(async src => {
      if (src.startsWith('data:')) return src;
      const response = await fetch(new URL(src, location.href));
      if (!response.ok) throw new Error('Photo could not be loaded');
      return readFile(await response.blob());
    }));
    clone.querySelector('#card-assets').textContent = JSON.stringify({ ...cardAssets, photos: embeddedPhotos }).replace(/</g, '\\u003c');
    const inlineStyle = document.createElement('style');
    inlineStyle.dataset.cardStyle = '';
    inlineStyle.textContent = css;
    clone.querySelector('link[rel="stylesheet"], style[data-card-style]').replaceWith(inlineStyle);
    clone.querySelector('script[src], script[data-card-script]').remove();
    const inlineScript = document.createElement('script');
    inlineScript.dataset.cardScript = '';
    inlineScript.textContent = js;
    clone.querySelector('body').append(inlineScript);
    const blob = new Blob(['<!doctype html>\n', clone.outerHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gui-hanh-yeu.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    showToast('Đã đóng gói xong ảnh và nhạc. Mang thiệp đi test thôi!');
  } catch {
    showToast('Chưa tải được thiệp. Em thử lại khi trang đã tải xong nhé.');
  } finally { button.disabled = false; }
});

// Editing is local to this visit; the shared card hides setup controls.
if (new URLSearchParams(location.search).get('edit') === '1') {
  document.body.classList.remove('personalized');
}

// Every visit, including an exported card, begins at the locked cover.
relock({ focus: false });
