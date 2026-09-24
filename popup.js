const wordEl = document.querySelector('#word');
const speedEl = document.querySelector('#speed');
const speedValue = document.querySelector('#speedValue');
const progress = document.querySelector('#progress');
const progressLabel = document.querySelector('#progressLabel');
const statusLabel = document.querySelector('#statusLabel');
const playButton = document.querySelector('#playButton');
const textArea = document.querySelector('#text');

let words = [];
let index = 0;
let playing = false;
let timer = null;

function updateDisplay() {
  wordEl.textContent = words[index] || (words.length ? 'Finished' : 'Select text to begin');
  progress.max = Math.max(words.length, 1);
  progress.value = words.length ? index : 0;
  progressLabel.textContent = `${words.length ? Math.min(index + 1, words.length) : 0} / ${words.length}`;
  statusLabel.textContent = playing ? 'Reading' : (words.length && index >= words.length ? 'Finished' : 'Ready');
}

function loadText(text) {
  words = text.trim().split(/\s+/).filter(Boolean);
  index = 0;
  playing = false;
  clearTimeout(timer);
  updateDisplay();
  playButton.textContent = words.length ? 'Play' : 'Play';
}

function tick() {
  if (!playing) return;
  if (index >= words.length) { playing = false; updateDisplay(); playButton.textContent = 'Replay'; return; }
  updateDisplay();
  index += 1;
  timer = setTimeout(tick, 60000 / Number(speedEl.value));
}

function togglePlay() {
  if (!words.length) return;
  if (index >= words.length) index = 0;
  playing = !playing;
  playButton.textContent = playing ? 'Pause' : 'Play';
  updateDisplay();
  if (playing) tick(); else clearTimeout(timer);
}

function move(amount) { playing = false; clearTimeout(timer); index = Math.max(0, Math.min(words.length - 1, index + amount)); playButton.textContent = 'Play'; updateDisplay(); }
function adjustSpeed(amount) { speedEl.value = Math.max(100, Math.min(1000, Number(speedEl.value) + amount)); speedValue.textContent = `${speedEl.value} WPM`; }

speedEl.addEventListener('input', () => { speedValue.textContent = `${speedEl.value} WPM`; });
playButton.addEventListener('click', togglePlay);
document.querySelector('#previousButton').addEventListener('click', () => move(-1));
document.querySelector('#nextButton').addEventListener('click', () => move(1));
document.querySelector('#loadButton').addEventListener('click', () => loadText(textArea.value));
document.querySelector('#themeButton').addEventListener('click', () => document.body.classList.toggle('light'));
document.addEventListener('keydown', (event) => {
  if (event.target.matches('textarea, input')) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
  if (event.key === 'ArrowUp') adjustSpeed(25);
  if (event.key === 'ArrowDown') adjustSpeed(-25);
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' }, (response) => {
    if (chrome.runtime.lastError || !response?.text) return;
    loadText(response.text);
  });
});

chrome.storage.local.get('capturedText', ({ capturedText }) => {
  if (capturedText) {
    loadText(capturedText);
    chrome.storage.local.remove('capturedText');
  }
});

updateDisplay();
