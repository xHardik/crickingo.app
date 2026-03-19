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
const db  = getDatabase(app);

const urlParams      = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' &&
                       urlParams.get('tournament') === 'true';

const STATS_KEY   = 'crickingo_wordle_stats';
const HISTORY_KEY = 'crickingo_wordle_history';

function getRealTodayKey() { return new Date().toISOString().split('T')[0]; }
function getDateFromURL()  { return urlParams.get('date') || new Date().toISOString().split('T')[0]; }

function populatePuzzleBar() {
  if (isInTournament) {
    const puzzleBar = document.querySelector('.puzzle-bar');
    if (puzzleBar) puzzleBar.style.display = 'none';
  }
}

function saveGameResult(score) {
  if (isInTournament) return;
  const puzzleDate = getDateFromURL();
  const today      = getRealTodayKey();
  let stats = {}, history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { stats   = {}; }
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { history = {}; }
  if (!history[puzzleDate] || score > history[puzzleDate].score) history[puzzleDate] = { score };
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
  console.log('✅ [Wordle] Saved:', puzzleDate, '→', history[puzzleDate]);
  renderDashboard(stats, history, today);
}

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
    const key = d.toISOString().split('T')[0];
    const entry = history[key];
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
    background: rgba(168,85,247,0.12); color: #A855F7;
    padding: 8px 22px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 700;
    font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase;
    z-index: 999; border: 1px solid rgba(168,85,247,0.3);
    backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(168,85,247,0.15);
    white-space: nowrap;
  `;
  infoDiv.innerHTML = '🏆 Tournament Mode — Play Your Best!';
  document.body.appendChild(infoDiv);
}

// ── PATCHED: use .active class to match new wordle.html modal ──
function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.style.display = ''; modal.classList.add('active'); }
}

function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
}

function backToMenu() { window.location.href = 'index.html'; }

// ── GAME STATE ──
let wordleData     = {};
let targetPlayer   = '';
let currentAttempt = 0;
let maxAttempts    = 5;
let gameOver       = false;
let guesses        = [];
let currentScore   = 0;
let selectedDate   = null;
let hintCountry    = '';
let hintPosition   = '';
let puzzleDateStr  = null;

async function loadData() {
  try {
    const response = await fetch('./wordle.json');
    if (!response.ok) throw new Error('Failed to load wordle.json');
    wordleData = await response.json();
  } catch (error) {
    console.error('Error loading wordle data:', error);
    alert('Error loading game data. Please refresh the page.');
  }
}

async function initGame() {
  await loadData();
  if (urlParams.get('tournament') !== 'true') localStorage.removeItem('inTournamentGame');
  if (!isInTournament) showRulesModal();
  if (isInTournament)  showTournamentInfo();

  let dailyGame = null;

  if (isInTournament) {
    const tournamentCode = localStorage.getItem('tournamentCode');
    const seedPath       = `tournaments/${tournamentCode}/gameData/wordle_key`;
    try {
      const snapshot = await get(ref(db, seedPath));
      if (snapshot.exists()) {
        dailyGame = wordleData[snapshot.val()];
      } else {
        const keys      = Object.keys(wordleData).filter(k => k.startsWith('wordle'));
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        dailyGame       = wordleData[randomKey];
        await set(ref(db, seedPath), randomKey);
      }
    } catch (err) {
      console.error('Firebase error:', err);
      const keys = Object.keys(wordleData).filter(k => k.startsWith('wordle'));
      dailyGame  = wordleData[keys[Math.floor(Math.random() * keys.length)]];
    }
  } else {
    selectedDate  = getDateFromURL();
    const gameKey = `wordle-${selectedDate}`;
    dailyGame     = wordleData[gameKey];
  }

  if (!dailyGame) {
    const firstKey = Object.keys(wordleData)[0];
    dailyGame      = firstKey ? wordleData[firstKey] : null;
  }

  if (dailyGame) {
    targetPlayer  = dailyGame.player;
    hintCountry   = dailyGame.hint_country  || '';
    hintPosition  = dailyGame.hint_position || '';
    puzzleDateStr = dailyGame.date           || getDateFromURL();
  } else {
    targetPlayer  = 'KOHLI';
    hintCountry   = '🇮🇳 India';
    hintPosition  = '🏏 Batsman';
    puzzleDateStr = getDateFromURL();
  }

  currentAttempt = 0; gameOver = false; guesses = []; currentScore = 0;

  document.getElementById('resultArea').style.display = 'none';
  document.getElementById('guessInput').disabled      = false;
  document.getElementById('submitBtn').disabled        = false;
  const hintDisplay = document.getElementById('hintDisplay');
  if (hintDisplay) hintDisplay.classList.remove('show');
  hideMessage();

  populatePuzzleBar();
  createBoard();
  updateStats();
  updateScoreDisplay();
  initDashboard();
  updateButtonsForMode();
}

function updateButtonsForMode() {
  const resetBtn = document.querySelector('.controls .btn-restart');
  const backBtn  = document.querySelector('.controls .btn-back');
  if (isInTournament) {
    if (resetBtn) resetBtn.style.display = 'none';
    if (backBtn)  backBtn.style.display  = 'none';
  } else {
    if (resetBtn) resetBtn.style.display = '';
    if (backBtn)  backBtn.style.display  = '';
  }
}

function updateScoreDisplay() {
  const el = document.getElementById('scoreValue');
  if (el) el.textContent = `${currentScore} pts`;
}

function calculateScore(attemptNumber) {
  return { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 200 }[attemptNumber] ?? 0;
}

function createBoard() {
  const board = document.getElementById('gameBoard');
  board.innerHTML = '';
  for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < targetPlayer.length; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile'; tile.id = `tile-${i}-${j}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function submitGuess() {
  if (gameOver) return;
  const input = document.getElementById('guessInput');
  const guess = input.value.toUpperCase().trim();
  if (!guess) { showMessage('Please enter a player name!', 'error'); return; }
  if (guess.length !== targetPlayer.length) { showMessage(`Player name must be ${targetPlayer.length} letters!`, 'error'); return; }
  if (guesses.includes(guess)) { showMessage('You already guessed that name!', 'error'); return; }

  guesses.push(guess);
  displayGuess(guess);
  input.value = '';
  currentAttempt++;
  updateStats();
  setTimeout(() => showHint(currentAttempt), 500);

  if (guess === targetPlayer) {
    gameOver     = true;
    currentScore = calculateScore(currentAttempt);
    updateScoreDisplay();
    updateTodayDot(currentScore);
    if (!isInTournament) saveGameResult(currentScore);
    document.getElementById('guessInput').disabled = true;
    document.getElementById('submitBtn').disabled  = true;
    window._shareData = buildShareData(currentScore, true);
    if (isInTournament) { finishGame(currentScore); }
    else { showResultCard(`🎉 ${targetPlayer}!`, currentScore + ' pts', `Guessed correctly in ${currentAttempt} ${currentAttempt === 1 ? 'try' : 'tries'}!`); }
  } else if (currentAttempt >= maxAttempts) {
    gameOver     = true;
    currentScore = 0;
    updateScoreDisplay();
    updateTodayDot(0);
    if (!isInTournament) saveGameResult(0);
    document.getElementById('guessInput').disabled = true;
    document.getElementById('submitBtn').disabled  = true;
    window._shareData = buildShareData(0, false);
    if (isInTournament) { finishGame(0); }
    else { showResultCard(`😞 Game Over!`, '0 pts', `The answer was ${targetPlayer}`); }
  }
}

function showResultCard(title, score, phrase) {
  const resultArea  = document.getElementById('resultArea');
  const titleEl     = resultArea.querySelector('.result-title');
  const scoreEl     = document.getElementById('scoreText');
  const phraseEl    = document.getElementById('resultPhrase');
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  if (titleEl)     titleEl.textContent  = title;
  if (scoreEl)     scoreEl.textContent  = score;
  if (phraseEl)    phraseEl.textContent = phrase;
  if (tryAgainBtn) tryAgainBtn.style.display = '';
  resultArea.style.display = 'block';
  const dashboard = document.getElementById('bottomDashboard');
  if (dashboard && resultArea) {
    resultArea.parentNode.insertBefore(dashboard, resultArea.nextSibling);
    setTimeout(() => dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  }
}

function displayGuess(guess) {
  const targetLetters = targetPlayer.split('');
  const guessLetters  = guess.split('');
  const letterCount   = {};
  targetLetters.forEach(l => { letterCount[l] = (letterCount[l] || 0) + 1; });
  const results = new Array(guess.length).fill('absent');
  guessLetters.forEach((l, i) => {
    if (l === targetLetters[i]) { results[i] = 'correct'; letterCount[l]--; }
  });
  guessLetters.forEach((l, i) => {
    if (results[i] !== 'correct' && targetLetters.includes(l) && letterCount[l] > 0) {
      results[i] = 'present'; letterCount[l]--;
    }
  });
  guessLetters.forEach((l, i) => {
    const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
    tile.textContent = l;
    tile.classList.add('filled');
    setTimeout(() => tile.classList.add(results[i]), 100 * i);
  });
}

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.innerHTML = text; msg.className = `message show ${type}`;
  if (type === 'error' || type === 'info') setTimeout(() => hideMessage(), 3000);
}
function hideMessage() { document.getElementById('message').className = 'message'; }
function updateStats() { const el = document.getElementById('stats'); if (el) el.textContent = `Attempts: ${currentAttempt} / ${maxAttempts}`; }

function showHint(attemptNumber) {
  const hintDisplay = document.getElementById('hintDisplay');
  const hintText    = document.getElementById('hintText');
  if (!hintDisplay || !hintText) return;
  if (attemptNumber === 3 && hintCountry) { hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry}`; hintDisplay.classList.add('show'); }
  if (attemptNumber === 4 && hintPosition) { hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry} | ${hintPosition}`; hintDisplay.classList.add('show'); }
}

function resetGame() {
  initGame();
  const input = document.getElementById('guessInput');
  if (input) { input.value = ''; input.focus(); }
}

function finishGame(finalScore) {
  const gameIndex = localStorage.getItem('currentGameIndex') || '3';
  localStorage.removeItem('inTournamentGame');
  window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

window._shareData = {};

function buildShareData(score, isWin) {
  const pDate = puzzleDateStr || getDateFromURL();
  const dTomorrow = new Date(pDate + 'T00:00:00');
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = dTomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const bkd = [];
  if (isWin) {
    bkd.push({ label: `✅ Guessed in ${currentAttempt} ${currentAttempt === 1 ? 'try' : 'tries'}`, value: `${score} pts`, color: '#3DD68C' });
    const scoreMap = { 1: '1st try (+1000)', 2: '2nd try (+800)', 3: '3rd try (+600)', 4: '4th try (+400)', 5: '5th try (+200)' };
    if (scoreMap[currentAttempt]) bkd.push({ label: scoreMap[currentAttempt], value: '', color: '#F7C344' });
  } else {
    bkd.push({ label: `❌ Not guessed — answer: ${targetPlayer}`, value: '0 pts', color: '#ff8080' });
  }
  return {
    score: score + ' pts',
    phrase: isWin ? `Guessed ${targetPlayer} in ${currentAttempt} ${currentAttempt === 1 ? 'try' : 'tries'}!` : `Couldn't get ${targetPlayer} today`,
    breakdown: bkd, tomorrow: tomorrowStr
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath(); ctx.fill();
}

window.shareScore = async function () {
  const shareBtn = document.getElementById('shareBtn');
  const shareCopied = document.getElementById('shareCopied');
  if (shareBtn) shareBtn.style.opacity = '0.6';
  const d = window._shareData || {};
  const score = d.score || '0 pts', phrase = d.phrase || '', breakdown = d.breakdown || [], tomorrow = d.tomorrow || '';
  const W = 600, pad = 44;
  let H = 560 + breakdown.length * 36 + (tomorrow ? 80 : 0);
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d'); ctx.scale(2, 2);
  ctx.fillStyle = '#0d1120'; ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,'#A855F7'); grad.addColorStop(0.5,'#F7C344'); grad.addColorStop(1,'#E84040');
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,3);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; roundRect(ctx,0,3,W,H-3,0);
  let y = pad + 16;
  ctx.font='bold 28px "Arial Black",Arial'; ctx.fillStyle='rgba(242,242,242,0.5)'; ctx.textAlign='center';
  ctx.fillText('CRICKET WORDLE',W/2,y); y+=36;
  ctx.fillStyle='rgba(168,85,247,0.25)'; roundRect(ctx,pad,y,W-pad*2,64,12);
  ctx.fillStyle='#A855F7'; ctx.font='bold 40px "Arial Black",Arial'; ctx.fillText(score,W/2,y+44); y+=80;
  ctx.font='16px Arial'; ctx.fillStyle='rgba(242,242,242,0.6)'; ctx.fillText(phrase,W/2,y); y+=36;
  const bH=40+breakdown.length*34+54;
  ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,pad,y,W-pad*2,bH,12);
  ctx.font='bold 15px Arial'; ctx.fillStyle='#F2F2F2'; ctx.fillText('📊 Score Breakdown',W/2,y+28); y+=44;
  breakdown.forEach(row=>{
    ctx.textAlign='left'; ctx.font='14px Arial'; ctx.fillStyle='rgba(242,242,242,0.8)'; ctx.fillText(row.label,pad+16,y+16);
    if(row.value){ctx.textAlign='right'; ctx.fillStyle=row.color||'#A855F7'; ctx.fillText(row.value,W-pad-16,y+16);}
    y+=34;
  });
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad+16,y); ctx.lineTo(W-pad-16,y); ctx.stroke(); y+=20;
  ctx.textAlign='left'; ctx.font='bold 18px Arial'; ctx.fillStyle='#F2F2F2'; ctx.fillText('Total:',pad+16,y+4);
  ctx.textAlign='right'; ctx.fillStyle='#A855F7'; ctx.fillText(d.score||'0 pts',W-pad-16,y+4); y+=40;
  if(tomorrow){
    ctx.fillStyle='rgba(168,85,247,0.1)'; roundRect(ctx,pad,y,W-pad*2,58,12);
    ctx.textAlign='center'; ctx.font='12px Arial'; ctx.fillStyle='rgba(242,242,242,0.5)'; ctx.fillText('📅 Next Puzzle',W/2,y+20);
    ctx.font='bold 15px Arial'; ctx.fillStyle='#A855F7'; ctx.fillText('Come back tomorrow · '+tomorrow,W/2,y+42); y+=66;
  }
  ctx.fillStyle='rgba(168,85,247,0.12)'; roundRect(ctx,pad,y,W-pad*2,58,12);
  ctx.textAlign='center'; ctx.font='bold 16px Arial'; ctx.fillStyle='#A855F7';
  ctx.fillText('🏏 Can you beat me at Crickingo?',W/2,y+24);
  ctx.font='13px Arial'; ctx.fillStyle='rgba(242,242,242,0.5)'; ctx.fillText('crickingo.vercel.app',W/2,y+44);
  if(shareBtn) shareBtn.style.opacity='1';
  canvas.toBlob(async(blob)=>{
    const file=new File([blob],'crickingo-wordle.png',{type:'image/png'});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],text:'Can you beat me at Crickingo? 🏏\ncrickingo.vercel.app'});return;}
      catch(e){if(e.name==='AbortError')return;}
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='crickingo-wordle.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    if(shareCopied){shareCopied.classList.add('show');setTimeout(()=>shareCopied.classList.remove('show'),2000);}
  },'image/png');
};

// ── GLOBAL EXPORTS ──
window.submitGuess     = submitGuess;
window.resetGame       = resetGame;
window.finishGame      = finishGame;
window.showRulesModal  = showRulesModal;
window.closeRulesModal = closeRulesModal;
window.backToMenu      = backToMenu;
window.saveGameResult  = saveGameResult;

document.addEventListener('DOMContentLoaded', () => {
  const guessInput = document.getElementById('guessInput');
  if (guessInput) { guessInput.addEventListener('keypress', e => { if (e.key === 'Enter') submitGuess(); }); }
  initGame();
});