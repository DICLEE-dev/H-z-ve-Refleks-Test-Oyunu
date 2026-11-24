const arena = document.getElementById("arena");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayDesc = document.getElementById("overlayDesc");
const resultSummary = document.getElementById("resultSummary");

const startBtn = document.getElementById("startBtn");
const difficultySelect = document.getElementById("difficultySelect");
const targetCountSelect = document.getElementById("targetCountSelect");

const progressText = document.getElementById("progressText");
const lastTimeText = document.getElementById("lastTimeText");
const avgTimeText = document.getElementById("avgTimeText");
const bestTimeText = document.getElementById("bestTimeText");

let isPlaying = false;
let totalTargets = 15;
let targetSize = 44;
let hits = 0;
let misses = 0;
let targetSpawnTime = 0;
let reactionTimes = [];
let currentTargetEl = null;

// Tarayıcı hafızasından (localStorage) en iyi rekoru yükle
let bestRecord = localStorage.getItem("reflexlab_best_ms");
if (bestRecord) {
  bestTimeText.textContent = `${bestRecord} ms`;
}

// Tepki süresine göre rütbe belirler
function getRank(avgMs) {
  if (avgMs < 210) return "🏆 E-Spor Profesyoneli (İnsanüstü)";
  if (avgMs < 260) return "🔥 Elmas Lig (Çok Hızlı)";
  if (avgMs < 320) return "⚡ Altın Lig (Ortalamanın Üstü)";
  if (avgMs < 400) return "👍 Gümüş Lig (Ortalama)";
  return "🐢 Isınma Turu (Biraz Daha Pratik)";
}

// Ekranda uçan "+245 ms" veya "MISS!" bildirimi oluşturur
function showFloatingText(x, y, text, isMiss = false) {
  const el = document.createElement("span");
  el.className = isMiss ? "floating-ms miss" : "floating-ms";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

// Arena sınırları içinde rastgele konumda yeni hedef oluşturur
function spawnTarget() {
  if (currentTargetEl) {
    currentTargetEl.remove();
  }

  const padding = 20;
  const maxX = arena.clientWidth - targetSize - padding;
  const maxY = arena.clientHeight - targetSize - padding;

  const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
  const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

  const target = document.createElement("div");
  target.className = "target";
  target.style.width = `${targetSize}px`;
  target.style.height = `${targetSize}px`;
  target.style.left = `${randomX}px`;
  target.style.top = `${randomY}px`;

  // Yüksek hassasiyetli zaman damgası (mikrosaniye hassasiyetinde)
  targetSpawnTime = performance.now();

  target.addEventListener("pointerdown", (e) => {
    e.stopPropagation(); // Arena'nın "boşa tıklama" olayını tetiklemesini engelle
    handleTargetHit(e.clientX, e.clientY);
  });

  arena.appendChild(target);
  currentTargetEl = target;
}

function handleTargetHit(clientX, clientY) {
  if (!isPlaying) return;

  const reactionMs = Math.round(performance.now() - targetSpawnTime);
  reactionTimes.push(reactionMs);
  hits++;

  const rect = arena.getBoundingClientRect();
  showFloatingText(clientX - rect.left - 20, clientY - rect.top - 15, `${reactionMs} ms`);

  updateHUD(reactionMs);

  if (hits >= totalTargets) {
    endGame();
  } else {
    spawnTarget();
  }
}

function updateHUD(lastMs) {
  progressText.textContent = `${hits} / ${totalTargets}`;
  lastTimeText.textContent = `${lastMs} ms`;

  const sum = reactionTimes.reduce((a, b) => a + b, 0);
  const penalty = misses * 50;
  const avg = Math.round((sum + penalty) / reactionTimes.length);
  avgTimeText.textContent = `${avg} ms`;
}

function startGame() {
  totalTargets = parseInt(targetCountSelect.value, 10);
  targetSize = parseInt(difficultySelect.value, 10);

  hits = 0;
  misses = 0;
  reactionTimes = [];
  isPlaying = true;

  progressText.textContent = `0 / ${totalTargets}`;
  lastTimeText.textContent = "-";
  avgTimeText.textContent = "-";

  overlay.classList.add("hidden");
  resultSummary.classList.add("hidden");
  startBtn.textContent = "↻ Yeniden Başlat";

  spawnTarget();
}

function endGame() {
  isPlaying = false;
  if (currentTargetEl) {
    currentTargetEl.remove();
    currentTargetEl = null;
  }

  const sum = reactionTimes.reduce((a, b) => a + b, 0);
  const penalty = misses * 50;
  const finalAvg = Math.round((sum + penalty) / reactionTimes.length);
  const fastestHit = Math.min(...reactionTimes);
  const accuracy = Math.round((hits / (hits + misses)) * 100);

  // Yeni rekor kontrolü
  let newRecordBadge = "";
  if (!bestRecord || finalAvg < parseInt(bestRecord, 10)) {
    bestRecord = finalAvg;
    localStorage.setItem("reflexlab_best_ms", bestRecord);
    bestTimeText.textContent = `${bestRecord} ms`;
    newRecordBadge = "🎉 YENİ REKOR!";
  }

  overlayTitle.textContent = `Test Tamamlandı! ${newRecordBadge}`;
  overlayDesc.textContent = getRank(finalAvg);

  resultSummary.innerHTML = `
    <div>⚡ <strong>Ortalama Tepki Süresi:</strong> ${finalAvg} ms</div>
    <div>🚀 <strong>En Hızlı Vuruş:</strong> ${fastestHit} ms</div>
    <div>🎯 <strong>İsabet Oranı:</strong> %${accuracy} (${misses} ıska)</div>
  `;

  resultSummary.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

// Boşa tıklama (Miss) kontrolü
arena.addEventListener("pointerdown", (e) => {
  if (!isPlaying) return;
  misses++;

  const rect = arena.getBoundingClientRect();
  showFloatingText(e.clientX - rect.left - 18, e.clientY - rect.top - 10, "ISKA (+50ms)", true);

  arena.classList.add("miss-flash");
  setTimeout(() => arena.classList.remove("miss-flash"), 150);

  if (reactionTimes.length > 0) {
    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum + misses * 50) / reactionTimes.length);
    avgTimeText.textContent = `${avg} ms`;
  }
});

startBtn.addEventListener("click", startGame);