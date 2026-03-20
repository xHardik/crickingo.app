// ==== FIREBASE IMPORT ====
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyC5nqnzG2jGtDcZlL6x9mg7r1xRrldyfpg",
  authDomain: "ogcrickingo.firebaseapp.com",
  databaseURL: "https://ogcrickingo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ogcrickingo",
  storageBucket: "ogcrickingo.firebasestorage.app",
  messagingSenderId: "672434440025",
  appId: "1:672434440025:web:ba51a4b85b7cb78bfeee48",
  measurementId: "G-LYH8BMVBFE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const urlParams      = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' &&
                       urlParams.get('tournament') === 'true';

const STATS_KEY   = 'crickingo_rivalry_stats';
const HISTORY_KEY = 'crickingo_rivalry_history';

function getRealTodayKey() { return new Date().toISOString().split('T')[0]; }
function getDateFromURL()  { return urlParams.get('date') || new Date().toISOString().split('T')[0]; }

// ── Save final result (mirrors wordle saveGameResult exactly) ──
function saveGameResult(score, correct, wrong) {
  if (isInTournament) return;
  const puzzleDate = getDateFromURL();
  const today      = getRealTodayKey();
  let stats = {}, history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { stats   = {}; }
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { history = {}; }
  if (!history[puzzleDate] || score > history[puzzleDate].score) history[puzzleDate] = { score, correct, wrong };
  const allEntries = Object.values(history);
  stats.played = allEntries.length;
  stats.best   = Math.max(...allEntries.map(e => e.score));
  stats.avg    = Math.round(allEntries.reduce((s, e) => s + e.score, 0) / allEntries.length);
  let streak = 0;
  const check = new Date(today + 'T00:00:00');
  while (true) {
    const k = check.toISOString().split('T')[0];
    if (history[k]) { streak++; check.setDate(check.getDate() - 1); } else break;
  }
  stats.streak = streak;
  localStorage.setItem(STATS_KEY,   JSON.stringify(stats));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  console.log('✅ [Rivalry] Saved:', puzzleDate, '→', history[puzzleDate]);
  renderDashboard(stats, history, today);
}

// ── Update dot live during game (mirrors wordle updateTodayDot exactly) ──
function updateTodayDot(score) {
  if (isInTournament) return;
  const puzzleDate = getDateFromURL();
  const dotsEl     = document.getElementById('streakDots');
  if (!dotsEl) return;
  let targetDot = null;
  dotsEl.querySelectorAll('.streak-dot').forEach(dot => {
    if (dot.dataset.dotDate === puzzleDate) targetDot = dot;
  });
  if (!targetDot) return;
  targetDot.className = 'streak-dot today-played';
  targetDot.title     = `${puzzleDate} · ${score} pts`;
  let sc = targetDot.querySelector('.dot-score-val');
  if (!sc) { sc = document.createElement('div'); sc.className = 'dot-score-val'; targetDot.appendChild(sc); }
  sc.textContent = score;
}

// ── Render dashboard (mirrors wordle renderDashboard exactly) ──
function renderDashboard(stats, history, today) {
  if (isInTournament) {
    const dashboard = document.getElementById('bottomDashboard');
    if (dashboard) dashboard.style.display = 'none';
    return;
  }
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = (val !== null && val !== undefined) ? String(val) : '—';
  };
  setEl('statPlayed', stats.played  !== undefined ? stats.played  : '—');
  setEl('statBest',   stats.best    !== undefined ? stats.best    : '—');
  setEl('statAvg',    stats.avg     !== undefined ? stats.avg     : '—');
  setEl('statStreak', stats.streak  !== undefined ? stats.streak + (stats.streak === 1 ? ' day' : ' days') : '—');
  const dotsEl = document.getElementById('streakDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  const base = new Date(today + 'T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    const key     = d.toISOString().split('T')[0];
    const entry   = history[key];
    const isToday = key === today;
    const dot = document.createElement('div');
    dot.dataset.dotDate = key;
    if (isToday && entry)      { dot.className = 'streak-dot today-played'; dot.title = `Today · ${entry.score} pts`; }
    else if (isToday)          { dot.className = 'streak-dot today-pending'; dot.title = 'Today — not played yet'; }
    else if (entry)            { dot.className = 'streak-dot win';  dot.title = `${key} · ${entry.score} pts`; }
    else                       { dot.className = 'streak-dot miss'; dot.title = `${key} — missed`; }
    if (entry) {
      const sc = document.createElement('div');
      sc.className = 'dot-score-val'; sc.textContent = entry.score;
      dot.appendChild(sc);
    }
    dotsEl.appendChild(dot);
  }
}

function initDashboard() {
  const today = getRealTodayKey();
  let stats = {}, history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch {}
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch {}
  renderDashboard(stats, history, today);
}

function showTournamentInfo() {
  if (document.getElementById('tournamentInfo')) return;
  const infoDiv = document.createElement('div');
  infoDiv.id = 'tournamentInfo';
  infoDiv.style.cssText = `
    position: fixed; top: 74px; left: 50%; transform: translateX(-50%);
    background: rgba(247,195,68,0.12); color: #F7C344;
    padding: 8px 22px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 700;
    font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase;
    z-index: 999; border: 1px solid rgba(247,195,68,0.3);
    backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(247,195,68,0.15);
    white-space: nowrap;
  `;
  infoDiv.innerHTML = '🏆 Tournament Mode — Play Your Best!';
  document.body.appendChild(infoDiv);
}

let gridData = {};
let currentGame = null;
let currentIndex = 0;
let correctCount = 0;
let gameActive = false;
let totalScore = 0;
let currentStreak = 0;
let wrongAnswers = 0;
let skippedPlayers = 0;
let streakBonusEarned = 0;
let lastFilledCellIndex = 0;

const POINTS = {
  CORRECT: 50, WRONG: -10, SKIP: 0,
  STREAK_3: 20, STREAK_5: 50, STREAK_7: 100, STREAK_10: 200,
  PERFECT_ROUND: 200, ACCURACY_100: 150, ACCURACY_90: 100, ACCURACY_75: 50
};

async function loadData() {
  try {
    const response = await fetch('./rivalry.json');
    if (!response.ok) throw new Error('Failed to load rivalry.json');
    gridData = await response.json();
  } catch (error) {
    console.error('Error loading grid data:', error);
    alert('Error loading game data. Please refresh the page.');
  }
}

function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.style.display = ''; modal.classList.add('active'); }
}

function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
}

function calculateStreakBonus(streak) {
  if (streak >= 10) return POINTS.STREAK_10;
  if (streak >= 7)  return POINTS.STREAK_7;
  if (streak >= 5)  return POINTS.STREAK_5;
  if (streak >= 3)  return POINTS.STREAK_3;
  return 0;
}

function updateScoreDisplay() {
  let scoreDisplay = document.getElementById('currentScore');
  if (!scoreDisplay) {
    addScoreDisplay();
    scoreDisplay = document.getElementById('currentScore');
  }
  if (!scoreDisplay) return;
  scoreDisplay.innerHTML = `
    <div style="font-size: 1.5em; font-weight: 900; color: #ffd700;">💰 ${totalScore} pts</div>
    <div style="font-size: 0.9em; color: rgba(255,255,255,0.8); margin-top: 5px;">
      ${currentStreak > 0 ? `🔥 ${currentStreak} Streak` : ''}
    </div>
  `;
}

async function initGame() {
  await loadData();

  if (urlParams.get('tournament') !== 'true') localStorage.removeItem('inTournamentGame');
  showRulesModal();
  if (isInTournament) showTournamentInfo();

  if (isInTournament) {
    const restartBtn = document.querySelector('.controls .btn-restart');
    const backBtn    = document.querySelector('.controls .btn-back');
    if (restartBtn) restartBtn.style.display = 'none';
    if (backBtn)    backBtn.style.display    = 'none';
    const puzzleBar = document.querySelector('.puzzle-bar');
    if (puzzleBar) puzzleBar.style.display = 'none';
  }

  // ===== TOURNAMENT SEED LOGIC =====
  if (isInTournament) {
    const tournamentCode = localStorage.getItem('tournamentCode');
    const seedPath = `tournaments/${tournamentCode}/gameData/rivalry_key`;
    try {
      const snapshot = await get(ref(db, seedPath));
      if (snapshot.exists()) {
        const storedKey = snapshot.val();
        currentGame = gridData[storedKey];
      } else {
        const availableGames = Object.keys(gridData).filter(k => k.startsWith('rivalry'));
        const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
        currentGame = gridData[randomKey];
        await set(ref(db, seedPath), randomKey);
      }
    } catch (err) {
      console.error('Firebase error, using random fallback:', err);
      const availableGames = Object.keys(gridData).filter(k => k.startsWith('rivalry'));
      const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
      currentGame = gridData[randomKey];
    }
  } else {
    const dateKey  = getDateFromURL();
    const gameKey  = `rivalry-${dateKey}`;
    const availableKeys = Object.keys(gridData).filter(k => k.startsWith('rivalry')).sort();
    currentGame = gridData[gameKey] || gridData[availableKeys[availableKeys.length - 1]];
    if (!gridData[gameKey]) console.log('No data for today, using latest:', availableKeys[availableKeys.length - 1]);
    console.log('Normal mode:', gameKey);
  }
  // ===== END SEED LOGIC =====

  if (!currentGame) {
    alert('No Rivalry Grid available. Returning to menu.');
    backToMenu();
    return;
  }

  currentIndex = 0; correctCount = 0; totalScore = 0;
  currentStreak = 0; wrongAnswers = 0; skippedPlayers = 0;
  streakBonusEarned = 0; lastFilledCellIndex = 0;
  gameActive = true;

  const gridSubtitleEl = document.getElementById('gridSubtitle');
  if (gridSubtitleEl) gridSubtitleEl.innerText = currentGame.subtitle;

  const searchWrapper = document.querySelector('.search-wrapper');
  if (searchWrapper) searchWrapper.style.display = 'none';

  addScoreDisplay();
  renderGrid();
  showPlayer();
  updateScoreDisplay();

  if (typeof window.updateLiveScore === 'function') window.updateLiveScore(0, 0, 0, 0);
  if (typeof window.updatePlayerProgress === 'function') window.updatePlayerProgress(0, currentGame.players.length);

  initDashboard();
}

function addScoreDisplay() {
  const playerBox = document.querySelector('.player-box');
  if (playerBox && !document.getElementById('currentScore')) {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'currentScore';
    scoreDiv.style.cssText = `
      margin: 15px 0; padding: 15px;
      background: linear-gradient(135deg, rgba(255,193,7,0.2) 0%, rgba(255,152,0,0.2) 100%);
      border: 2px solid rgba(255,193,7,0.4); border-radius: 15px; text-align: center;
    `;
    playerBox.insertBefore(scoreDiv, playerBox.querySelector('.controls'));
  }
}

function renderGrid() {
  const grid = document.getElementById('gameGrid');
  grid.innerHTML = '';
  const categoriesToShow = currentGame.categories.slice(0, 15);
  categoriesToShow.forEach((cat, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = idx;
    if (cat.image) {
      const img = document.createElement('img');
      img.src = cat.image; img.className = 'cell-image'; img.alt = cat.title;
      img.onerror = () => { img.style.display = 'none'; };
      cell.appendChild(img);
    }
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = cat.title;
    cell.appendChild(text);
    cell.addEventListener('click', () => assignPlayerToCell(cell));
    grid.appendChild(cell);
  });
}

function showPlayer() {
  if (currentIndex >= currentGame.players.length) { endGame(); return; }
  document.getElementById('currentPlayer').innerText = currentGame.players[currentIndex];
  document.getElementById('playerCount').innerText   = `Player ${currentIndex + 1} / ${currentGame.players.length}`;
  if (typeof window.updatePlayerProgress === 'function') window.updatePlayerProgress(currentIndex, currentGame.players.length);
}

function assignPlayerToCell(cell) {
  if (cell.dataset.filled === "true" || !gameActive) return;
  if (currentIndex >= currentGame.players.length) return;

  const category = currentGame.categories[cell.dataset.index];
  const player   = currentGame.players[currentIndex];
  cell.innerHTML = '';

  if (category.validPlayers.includes(player)) {
    if (category.image) {
      const img = document.createElement('img');
      img.src = category.image; img.className = 'cell-image'; img.alt = category.title;
      img.onerror = () => { img.style.display = 'none'; };
      cell.appendChild(img);
    }
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = player + " ✅";
    cell.appendChild(text);
    const check = document.createElement('div');
    check.className = 'cell-check'; check.textContent = '✓';
    cell.appendChild(check);
    cell.classList.add('correct');
    correctCount++; currentStreak++;
    totalScore += POINTS.CORRECT;
    const streakBonus = calculateStreakBonus(currentStreak);
    if (streakBonus > 0) {
      totalScore += streakBonus; streakBonusEarned += streakBonus;
      showStreakNotification(currentStreak, streakBonus);
    }
    currentIndex++;
  } else {
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = player + " ❌";
    cell.appendChild(text);
    const check = document.createElement('div');
    check.className = 'cell-check'; check.textContent = '✗';
    cell.appendChild(check);
    cell.classList.add('wrong');
    totalScore += POINTS.WRONG; wrongAnswers++; currentStreak = 0;
    currentIndex += 2;
  }

  cell.dataset.filled = "true";
  lastFilledCellIndex = parseInt(cell.dataset.index, 10);

  updateScoreDisplay();

  const filledCount = Array.from(document.querySelectorAll('#gameGrid .cell')).filter(c => c.dataset.filled === 'true').length;
  if (typeof window.updateLiveScore === 'function') window.updateLiveScore(totalScore, correctCount, filledCount, currentStreak);
  if (typeof window.updatePlayerProgress === 'function') window.updatePlayerProgress(currentIndex, currentGame.players.length);

  // ── Live dot update on every answer (mirrors wordle) ──
  if (!isInTournament) updateTodayDot(totalScore);

  const allFilled = Array.from(document.querySelectorAll('#gameGrid .cell')).every(c => c.dataset.filled === "true");
  if (allFilled) endGame(); else showPlayer();
}

function showStreakNotification(streak, bonus) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #ff6b9d 0%, #ffa400 100%);
    color: white; padding: 30px 40px; border-radius: 20px;
    font-size: 1.8em; font-weight: 900; z-index: 2000;
    box-shadow: 0 10px 40px rgba(255,107,157,0.6); text-align: center;
  `;
  let message = '';
  if (streak >= 10)     message = '🔥🔥🔥 LEGENDARY STREAK! 🔥🔥🔥';
  else if (streak >= 7) message = '🔥🔥 AMAZING STREAK! 🔥🔥';
  else if (streak >= 5) message = '🔥 HOT STREAK! 🔥';
  else if (streak >= 3) message = '⚡ STREAK BONUS! ⚡';
  notification.innerHTML = `${message}<br><div style="font-size: 1.2em; margin-top: 10px;">+${bonus} Points!</div>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 1500);
}

function skipPlayer() {
  if (gameActive && currentIndex < currentGame.players.length) {
    skippedPlayers++; currentStreak = 0; currentIndex++;
    updateScoreDisplay();
    const filledCount = Array.from(document.querySelectorAll('#gameGrid .cell')).filter(c => c.dataset.filled === 'true').length;
    if (typeof window.updateLiveScore === 'function') window.updateLiveScore(totalScore, correctCount, filledCount, currentStreak);
    if (typeof window.updatePlayerProgress === 'function') window.updatePlayerProgress(currentIndex, currentGame.players.length);
    showPlayer();
  }
}

function endGame() {
  gameActive = false;
  const skipBtn = document.getElementById('skipBtn');
  if (skipBtn) skipBtn.disabled = true;
  if (typeof window.triggerVictoryRipple === 'function') window.triggerVictoryRipple(lastFilledCellIndex);
  setTimeout(() => _showEndScreen(), 800);
}

function _showEndScreen() {
  const total    = Math.min(currentGame.categories.length, 15);
  const accuracy = (correctCount / total) * 100;

  let accuracyBonus = 0;
  if (accuracy === 100)    { accuracyBonus = POINTS.ACCURACY_100; totalScore += accuracyBonus; }
  else if (accuracy >= 90) { accuracyBonus = POINTS.ACCURACY_90;  totalScore += accuracyBonus; }
  else if (accuracy >= 75) { accuracyBonus = POINTS.ACCURACY_75;  totalScore += accuracyBonus; }

  let perfectBonus = 0;
  if (correctCount === 15 && wrongAnswers === 0 && skippedPlayers === 0) {
    perfectBonus = POINTS.PERFECT_ROUND; totalScore += perfectBonus;
  }
  if (totalScore < 0) totalScore = 0;

  const finalScore = totalScore;

  const scoreBreakdown = `
    <div style="text-align:left;margin:20px auto;max-width:400px;background:rgba(255,255,255,0.1);padding:20px;border-radius:15px;">
      <div style="font-size:1.1em;font-weight:700;margin-bottom:15px;text-align:center;">📊 Score Breakdown</div>
      <div style="margin:8px 0;">✅ Correct (${correctCount}): <span style="float:right;color:#4caf50;">+${correctCount * 50}</span></div>
      <div style="margin:8px 0;">❌ Wrong (${wrongAnswers}): <span style="float:right;color:#f44336;">${wrongAnswers * POINTS.WRONG}</span></div>
      <div style="margin:8px 0;">⏭️ Skipped: <span style="float:right;color:#9e9e9e;">${skippedPlayers}</span></div>
      <div style="margin:8px 0;">🔥 Streak Bonuses: <span style="float:right;color:#ff9800;">+${streakBonusEarned}</span></div>
      ${accuracyBonus > 0 ? `<div style="margin:8px 0;">🎯 Accuracy Bonus: <span style="float:right;color:#2196f3;">+${accuracyBonus}</span></div>` : ''}
      ${perfectBonus  > 0 ? `<div style="margin:8px 0;">⚡ Perfect Round: <span style="float:right;color:#9c27b0;">+${perfectBonus}</span></div>` : ''}
      <hr style="border:1px solid rgba(255,255,255,0.2);margin:15px 0;">
      <div style="font-size:1.3em;font-weight:900;margin-top:10px;">Total: <span style="float:right;color:#ffd700;">${finalScore}</span></div>
    </div>
  `;

  document.getElementById('scoreText').innerText = `${finalScore} / 1000`;

  const puzzleDateShare = getDateFromURL();
  const dTomorrowShare  = new Date(puzzleDateShare + 'T00:00:00');
  dTomorrowShare.setDate(dTomorrowShare.getDate() + 1);
  const tomorrowShareStr = dTomorrowShare.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const bkd = [];
  bkd.push({ label: `✅ Correct (${correctCount})`,   value: `+${correctCount * 50}`,          color: '#4caf50' });
  bkd.push({ label: `❌ Wrong (${wrongAnswers})`,      value: `${wrongAnswers * POINTS.WRONG}`,  color: '#f44336' });
  bkd.push({ label: `⏭️ Skipped`,                     value: String(skippedPlayers),            color: '#9e9e9e' });
  bkd.push({ label: `🔥 Streak Bonuses`,               value: `+${streakBonusEarned}`,           color: '#ff9800' });
  if (accuracyBonus > 0) bkd.push({ label: '🎯 Accuracy Bonus', value: `+${accuracyBonus}`, color: '#2196f3' });
  if (perfectBonus  > 0) bkd.push({ label: '⚡ Perfect Round',  value: `+${perfectBonus}`,  color: '#9c27b0' });
  window._shareData = {
    score: `${finalScore} / 1000`, phrase: getResultPhrase(accuracy),
    breakdown: bkd, tomorrow: tomorrowShareStr, gold: true
  };
  document.getElementById('resultPhrase').innerHTML = getResultPhrase(accuracy) + scoreBreakdown + getTomorrowMessage();

  const resultArea = document.getElementById('resultArea');
  document.getElementById('gameGrid').style.display  = 'none';
  document.querySelector('.game-info').style.display = 'none';

  const existingBtns = document.getElementById('tournamentButtons');
  if (existingBtns) existingBtns.remove();

  if (isInTournament) { finishGame(finalScore); return; }

  const filledCount = Array.from(document.querySelectorAll('#gameGrid .cell')).filter(c => c.dataset.filled === 'true').length;
  if (typeof window.updateLiveScore === 'function') window.updateLiveScore(finalScore, correctCount, filledCount, currentStreak);

  const actionsRow2 = resultArea.querySelector('.result-actions');
  if (actionsRow2) actionsRow2.style.display = 'flex';
  resultArea.style.display = 'block';

  const rbCorrect = document.getElementById('rbCorrect');
  const rbWrong   = document.getElementById('rbWrong');
  const rbStreak  = document.getElementById('rbStreak');
  const rbFilled  = document.getElementById('rbFilled');
  if (rbCorrect) rbCorrect.textContent = correctCount;
  if (rbWrong)   rbWrong.textContent   = wrongAnswers;
  if (rbStreak)  rbStreak.textContent  = streakBonusEarned > 0 ? `+${streakBonusEarned} pts` : '0';
  if (rbFilled)  rbFilled.textContent  = filledCount + '/15';

  // ── Save final result (mirrors wordle) ──
  saveGameResult(finalScore, correctCount, wrongAnswers);

  const dashboard = document.getElementById('bottomDashboard');
  if (dashboard && resultArea) {
    resultArea.parentNode.insertBefore(dashboard, resultArea.nextSibling);
    setTimeout(() => dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  }
}

function getTomorrowMessage() {
  const puzzleDate = getDateFromURL();
  const d = new Date(puzzleDate + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const tomorrow = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `<div style="margin-top:20px;padding:14px 18px;background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.25);border-radius:12px;text-align:center;">
    <div style="font-size:0.85rem;color:rgba(242,242,242,0.6);margin-bottom:4px;">📅 Next Puzzle</div>
    <div style="font-size:1rem;font-weight:700;color:#4F8EF7;">Come back tomorrow · ${tomorrow}</div>
  </div>`;
}

function getResultPhrase(accuracy) {
  if (accuracy >= 90) return "🔥 Absolute Legend! You're a cricket genius!";
  if (accuracy >= 75) return "🏆 Outstanding! You really know your cricket!";
  if (accuracy >= 60) return "👏 Great job! Solid cricket knowledge!";
  if (accuracy >= 45) return "👍 Not bad! Keep watching more cricket!";
  return "📺 Twitter expert! Time to watch some actual matches!";
}

function restartGame() { location.reload(); }
function backToMenu()  { window.location.href = 'index.html'; }

function finishGame(finalScore) {
  const gameIndex = localStorage.getItem('currentGameIndex') || '1';
  localStorage.removeItem('inTournamentGame');
  window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

window.skipPlayer      = skipPlayer;
window.restartGame     = restartGame;
window.backToMenu      = backToMenu;
window.finishGame      = finishGame;
window.closeRulesModal = closeRulesModal;

window.addEventListener('DOMContentLoaded', initGame);