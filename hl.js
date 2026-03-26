
// ==== FIREBASE IMPORT =====
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

const STATS_KEY   = 'crickingo_hl_stats';
const HISTORY_KEY = 'crickingo_hl_history';

// ✅ FIX: local date (not UTC toISOString) — avoids off-by-one for IST/UTC+ timezones
function getRealTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getDateFromURL() {
  return urlParams.get('date') || getRealTodayKey();
}

function saveAndRenderResult(score) {
  if (isInTournament) return;
  const today = getRealTodayKey();
  let stats = {}, history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { stats   = {}; }
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { history = {}; }
  if (!history[today] || score > history[today].score) history[today] = { score };
  const allEntries = Object.values(history);
  stats.played = allEntries.length;
  stats.best   = Math.max(...allEntries.map(e => e.score));
  stats.avg    = Math.round(allEntries.reduce((s, e) => s + e.score, 0) / allEntries.length);
  let streak = 0;
  const check = new Date(today + 'T00:00:00');
  while (true) {
    // ✅ FIX: local date parts for streak key
    const k = `${check.getFullYear()}-${String(check.getMonth()+1).padStart(2,'0')}-${String(check.getDate()).padStart(2,'0')}`;
    if (history[k]) { streak++; check.setDate(check.getDate() - 1); } else break;
  }
  stats.streak = streak;
  localStorage.setItem(STATS_KEY,   JSON.stringify(stats));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  console.log('✅ [HL] Saved under key:', today, '→', history[today]);
  renderDashboard(stats, history, today);
}

function saveLiveScore(score) {
  if (isInTournament) return;
  const puzzleDate = getDateFromURL();
  let history = {};
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { history = {}; }
  if (!history[puzzleDate] || score > history[puzzleDate].score) {
    history[puzzleDate] = { score, live: true };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  updateTodayDot(score);
}

function updateTodayDot(score) {
  if (isInTournament) return;
  const puzzleDate = getDateFromURL();
  const dotsEl = document.getElementById('streakDots');
  if (!dotsEl) return;
  let targetDot = null;
  dotsEl.querySelectorAll('.streak-dot').forEach(dot => {
    if (dot.dataset.dotDate === puzzleDate) targetDot = dot;
  });
  if (!targetDot) targetDot = dotsEl.querySelector('.streak-dot:last-child');
  if (!targetDot) return;
  targetDot.className = 'streak-dot today-played';
  targetDot.title = `${puzzleDate} · ${score} pts`;
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
  const highScoreEl = document.getElementById('highScore');
  if (highScoreEl) highScoreEl.textContent = (stats.best !== undefined ? stats.best : '—') + ' pts';
  const dotsEl = document.getElementById('streakDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  const base = new Date(today + 'T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    // ✅ FIX: local date parts for dot key
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const entry = history[key];
    const isToday = key === today;
    const dot = document.createElement('div');
    dot.dataset.dotDate = key;
    if (isToday && entry)      { dot.className = 'streak-dot today-played'; dot.title = `Today · ${entry.score} pts`; }
    else if (isToday)          { dot.className = 'streak-dot today-pending'; dot.title = 'Today — not played yet'; }
    else if (entry)            { dot.className = 'streak-dot win'; dot.title = `${key} · ${entry.score} pts`; }
    else                       { dot.className = 'streak-dot miss'; dot.title = `${key} — missed`; }
    if (entry) {
      const sc = document.createElement('div');
      sc.className = 'dot-score-val'; sc.textContent = entry.score;
      dot.appendChild(sc);
    }
    dotsEl.appendChild(dot);
  }
}

function populatePuzzleBar() {
  if (isInTournament) {
    const puzzleBar = document.querySelector('.puzzle-bar');
    if (puzzleBar) puzzleBar.style.display = 'none';
  }
}

function showTournamentInfo() {
  if (document.getElementById('tournamentInfo')) return;
  const infoDiv = document.createElement('div');
  infoDiv.id = 'tournamentInfo';
  infoDiv.style.cssText = `
    position: fixed; top: 74px; left: 50%; transform: translateX(-50%);
    background: rgba(232,64,64,0.12); color: #E84040;
    padding: 8px 22px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 700;
    font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase;
    z-index: 999; border: 1px solid rgba(232,64,64,0.3);
    backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(232,64,64,0.15);
    white-space: nowrap;
  `;
  infoDiv.innerHTML = '🏆 Tournament Mode — Play Your Best!';
  document.body.appendChild(infoDiv);
}

function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.style.display = ''; modal.classList.add('active'); }
}

function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
}

let currentScore    = 0;
let roundsCompleted = 0;
let leftPlayer      = null;
let rightPlayer     = null;
let PLAYERS         = [];
let playerSequence  = [];
let sequenceIndex   = 0;
let puzzleDateStr   = null;

const POINTS_PER_ROUND = 100;
const MAX_ROUNDS       = 10;
const MAX_SCORE        = 1000;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadPlayers() {
  try {
    const response = await fetch('hl.json');
    const data     = await response.json();
    let selectedDay = null, selectedDayKey = null;

    if (isInTournament) {
      const tournamentCode = localStorage.getItem('tournamentCode');
      const dayPath = `tournaments/${tournamentCode}/gameData/hl_day`;
      const seqPath = `tournaments/${tournamentCode}/gameData/hl_sequence`;
      const [daySnap, seqSnap] = await Promise.all([get(ref(db, dayPath)), get(ref(db, seqPath))]);
      if (daySnap.exists()) {
        selectedDayKey = daySnap.val(); selectedDay = data[selectedDayKey]; playerSequence = seqSnap.val();
      } else {
        const availableDays = Object.keys(data).filter(k => k.startsWith('day'));
        selectedDayKey = availableDays[Math.floor(Math.random() * availableDays.length)];
        selectedDay = data[selectedDayKey];
        const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
        let seq = shuffleArray(indices);
        while (seq.length < MAX_ROUNDS + 1) seq = seq.concat(shuffleArray(indices));
        playerSequence = seq.slice(0, MAX_ROUNDS + 1);
        await Promise.all([set(ref(db, dayPath), selectedDayKey), set(ref(db, seqPath), playerSequence)]);
      }
      puzzleDateStr = selectedDay?.date || getRealTodayKey();
    } else {
      localStorage.removeItem('inTournamentGame');
      const requestedDate = getDateFromURL();
      const sortedKeys = Object.keys(data).filter(k => data[k].date).sort((a, b) => data[a].date.localeCompare(data[b].date));
      for (const key of sortedKeys) {
        if (data[key].date === requestedDate) { selectedDayKey = key; selectedDay = data[key]; break; }
      }
      if (!selectedDay) {
        for (let i = sortedKeys.length - 1; i >= 0; i--) {
          if (data[sortedKeys[i]].date <= requestedDate) { selectedDayKey = sortedKeys[i]; selectedDay = data[sortedKeys[i]]; break; }
        }
      }
      if (!selectedDay && sortedKeys.length) { selectedDayKey = sortedKeys[sortedKeys.length - 1]; selectedDay = data[selectedDayKey]; }
      puzzleDateStr = selectedDay.date;
      const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
      let seq = shuffleArray(indices);
      while (seq.length < MAX_ROUNDS + 1) seq = seq.concat(shuffleArray(indices));
      playerSequence = seq.slice(0, MAX_ROUNDS + 1);
    }

    PLAYERS = selectedDay.players;
    sequenceIndex = 0;
    populatePuzzleBar();
    init();
  } catch (error) {
    console.error('Fatal error loading players:', error);
    alert('Error loading game data!');
  }
}

function init() {
  if (!sessionStorage.getItem('hlRulesShown')) {
    showRulesModal();
    sessionStorage.setItem('hlRulesShown', 'true');
  }
  if (isInTournament) {
    showTournamentInfo();
    document.querySelectorAll('.buttons .btn-back').forEach(b => b.style.display = 'none');
  }
  const today = getRealTodayKey();
  let stats = {}, history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch {}
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch {}
  renderDashboard(stats, history, today);
  updateScoreDisplay();
  loadNewRound();
}

function updateScoreDisplay() {
  const el = document.getElementById('currentScore');
  if (el) el.textContent = currentScore + ' pts';
}

function loadNewRound() {
  if (roundsCompleted >= MAX_ROUNDS) { endGame(true); return; }
  if (!leftPlayer) leftPlayer = getNextPlayer();
  let attempts = 0;
  do {
    rightPlayer = getNextPlayer(); attempts++;
    if (attempts > 5) {
      const others = PLAYERS.filter(p => p !== leftPlayer);
      rightPlayer = others[Math.floor(Math.random() * others.length)]; break;
    }
  } while (rightPlayer === leftPlayer || !areComparable(leftPlayer, rightPlayer));
  displayPlayers();
  document.getElementById('higherBtn').disabled = false;
  document.getElementById('lowerBtn').disabled  = false;
  const resultMsg = document.getElementById('resultMessage');
  if (resultMsg) { resultMsg.classList.remove('show'); resultMsg.className = 'result-message'; }
  document.getElementById('leftCard')?.classList.remove('correct', 'wrong');
  document.getElementById('rightCard')?.classList.remove('correct', 'wrong');
}

function getNextPlayer() {
  if (sequenceIndex >= playerSequence.length) sequenceIndex = 0;
  const player = PLAYERS[playerSequence[sequenceIndex]]; sequenceIndex++;
  return player;
}

function areComparable(p1, p2) { return getStatCategory(p1.stat) === getStatCategory(p2.stat); }

function getStatCategory(stat) {
  if (stat.includes('Runs') || stat.includes('IPL')) return 'runs';
  if (stat.includes('Wickets'))                       return 'wickets';
  if (stat.includes('Sixes'))                         return 'sixes';
  if (stat.includes('Average'))                       return 'average';
  return 'other';
}

function displayPlayers() {
  document.getElementById('leftEmoji').textContent  = leftPlayer.image;
  document.getElementById('leftName').textContent   = leftPlayer.name;
  document.getElementById('leftStat').textContent   = leftPlayer.stat;
  document.getElementById('leftValue').textContent  = formatValue(leftPlayer.value);
  document.getElementById('leftValue').className    = 'player-value';
  document.getElementById('rightEmoji').textContent = rightPlayer.image;
  document.getElementById('rightName').textContent  = rightPlayer.name;
  document.getElementById('rightStat').textContent  = rightPlayer.stat;
  document.getElementById('rightValue').textContent = '???';
  document.getElementById('rightValue').className   = 'hidden-value';
}

function formatValue(value) { return value >= 1000 ? value.toLocaleString() : value; }

function guess(choice) {
  document.getElementById('higherBtn').disabled = true;
  document.getElementById('lowerBtn').disabled  = true;
  const isHigher  = rightPlayer.value > leftPlayer.value;
  const isCorrect = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);
  document.getElementById('rightValue').textContent = formatValue(rightPlayer.value);
  document.getElementById('rightValue').className   = 'player-value';
  const resultMsg = document.getElementById('resultMessage');
  const rightCard = document.getElementById('rightCard');
  if (isCorrect) {
    currentScore += POINTS_PER_ROUND; roundsCompleted++;
    updateScoreDisplay(); saveLiveScore(currentScore);
    rightCard?.classList.add('correct');
    const roundsLeft = MAX_ROUNDS - roundsCompleted;
    const progressText = roundsLeft > 0 ? ` (${roundsLeft} left)` : ' 🎉 Perfect!';
    if (resultMsg) { resultMsg.textContent = `✅ Correct! +${POINTS_PER_ROUND} pts${progressText}`; resultMsg.className = 'result-message show correct'; }
    setTimeout(() => { leftPlayer = rightPlayer; loadNewRound(); }, 1500);
  } else {
    rightCard?.classList.add('wrong');
    if (resultMsg) { resultMsg.textContent = `❌ Wrong! It was ${rightPlayer.value > leftPlayer.value ? 'HIGHER' : 'LOWER'}`; resultMsg.className = 'result-message show wrong'; }
    saveLiveScore(currentScore);
    setTimeout(() => { endGame(false); }, 2000);
  }
}

function endGame(isPerfect = false) {
  document.getElementById('gameArea').style.display = 'none';
  const scoreTextEl = document.getElementById('scoreText');
  if (scoreTextEl) scoreTextEl.textContent = currentScore + ' pts';
  let message = '';
  if (isPerfect && currentScore === MAX_SCORE) message = '🏆 Perfect Score! You got all 10 rounds!';
  else if (currentScore >= 800)                message = '🔥 Amazing! Cricket expert!';
  else if (currentScore >= 500)                message = '👏 Great job! You know your cricket!';
  else if (currentScore >= 300)                message = 'Not bad! Keep practicing!';
  else                                          message = 'Better luck next time!';
  const phraseEl = document.getElementById('resultPhrase');
  if (phraseEl) phraseEl.textContent = message;
  const pDate = puzzleDateStr || getDateFromURL();
  const dTomorrow = new Date(pDate + 'T00:00:00');
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = dTomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const bkd = [];
  bkd.push({ label: `✅ Correct Rounds`,   value: `${roundsCompleted} / ${MAX_ROUNDS}`, color: '#3DD68C' });
  bkd.push({ label: `💯 Points per Round`, value: `+${POINTS_PER_ROUND}`,               color: '#F7C344' });
  if (!isPerfect) bkd.push({ label: `❌ Game Ended Early`, value: '', color: '#ff8080' });
  window._shareData = { score: currentScore + ' pts', phrase: message, breakdown: bkd, tomorrow: tomorrowStr };
  const resultArea  = document.getElementById('resultArea');
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  if (isInTournament) { finishGame(currentScore); return; }
  if (tryAgainBtn) tryAgainBtn.style.display = '';
  saveAndRenderResult(currentScore);
  if (resultArea) resultArea.style.display = 'block';
  const dashboard = document.getElementById('bottomDashboard');
  if (dashboard && resultArea) {
    resultArea.parentNode.insertBefore(dashboard, resultArea.nextSibling);
    setTimeout(() => dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
  }
}

function resetGame() {
  sessionStorage.removeItem('hlRulesShown');
  currentScore = 0; roundsCompleted = 0; leftPlayer = null; rightPlayer = null; sequenceIndex = 0;
  document.getElementById('resultArea').style.display = 'none';
  document.getElementById('gameArea').style.display   = 'block';
  updateScoreDisplay(); init();
}

function backToMenu() { window.location.href = 'index.html'; }

async function finishGame(finalScore) {
  const gameIndex = localStorage.getItem('currentGameIndex') || '0';
  localStorage.removeItem('inTournamentGame');
  window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

window._shareData = {};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath(); ctx.fill();
}

window.shareScore = async function () {
  const shareBtn    = document.getElementById('shareBtn');
  const shareCopied = document.getElementById('shareCopied');
  if (shareBtn) shareBtn.style.opacity = '0.6';
  const d = window._shareData || {};
  const score = d.score || document.getElementById('scoreText')?.innerText || '0 pts';
  const phrase = d.phrase || '', breakdown = d.breakdown || [], tomorrow = d.tomorrow || '';
  const W = 600, pad = 44;
  let H = 560 + breakdown.length * 36 + (tomorrow ? 80 : 0);
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d'); ctx.scale(2, 2);
  ctx.fillStyle = '#0d1120'; ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,'#E84040'); grad.addColorStop(0.5,'#F7C344'); grad.addColorStop(1,'#4F8EF7');
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,3);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; roundRect(ctx,0,3,W,H-3,0);
  let y = pad + 16;
  ctx.font='bold 36px "Arial Black",Arial'; ctx.fillStyle='#F2F2F2'; ctx.textAlign='center';
  ctx.fillText('GAME OVER!',W/2,y); y+=44;
  ctx.fillStyle='rgba(232,64,64,0.25)'; roundRect(ctx,pad,y,W-pad*2,64,12);
  ctx.fillStyle='#E84040'; ctx.font='bold 40px "Arial Black",Arial'; ctx.fillText(score,W/2,y+44); y+=80;
  ctx.font='16px Arial'; ctx.fillStyle='rgba(242,242,242,0.6)'; ctx.fillText(phrase,W/2,y); y+=36;
  const bH=40+breakdown.length*34+54;
  ctx.fillStyle='rgba(255,255,255,0.06)'; roundRect(ctx,pad,y,W-pad*2,bH,12);
  ctx.font='bold 15px Arial'; ctx.fillStyle='#F2F2F2'; ctx.fillText('📊 Score Breakdown',W/2,y+28); y+=44;
  breakdown.forEach(row=>{
    ctx.textAlign='left'; ctx.font='14px Arial'; ctx.fillStyle='rgba(242,242,242,0.8)'; ctx.fillText(row.label,pad+16,y+16);
    if(row.value){ctx.textAlign='right'; ctx.fillStyle=row.color||'#F7C344'; ctx.fillText(row.value,W-pad-16,y+16);}
    y+=34;
  });
  ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad+16,y); ctx.lineTo(W-pad-16,y); ctx.stroke(); y+=20;
  ctx.textAlign='left'; ctx.font='bold 18px Arial'; ctx.fillStyle='#F2F2F2'; ctx.fillText('Total:',pad+16,y+4);
  ctx.textAlign='right'; ctx.fillStyle='#F7C344'; ctx.fillText(d.score||'0',W-pad-16,y+4); y+=40;
  if(tomorrow){
    ctx.fillStyle='rgba(79,142,247,0.1)'; roundRect(ctx,pad,y,W-pad*2,58,12);
    ctx.textAlign='center'; ctx.font='12px Arial'; ctx.fillStyle='rgba(242,242,242,0.5)'; ctx.fillText('📅 Next Puzzle',W/2,y+20);
    ctx.font='bold 15px Arial'; ctx.fillStyle='#4F8EF7'; ctx.fillText('Come back tomorrow · '+tomorrow,W/2,y+42); y+=66;
  }
  ctx.fillStyle='rgba(232,64,64,0.12)'; roundRect(ctx,pad,y,W-pad*2,58,12);
  ctx.textAlign='center'; ctx.font='bold 16px Arial'; ctx.fillStyle='#E84040';
  ctx.fillText('🏏 Can you beat me at Crickingo?',W/2,y+24);
  ctx.font='13px Arial'; ctx.fillStyle='rgba(242,242,242,0.5)'; ctx.fillText('crickingo.vercel.app',W/2,y+44);
  if(shareBtn) shareBtn.style.opacity='1';
  canvas.toBlob(async(blob)=>{
    const file=new File([blob],'crickingo-hl.png',{type:'image/png'});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],text:'Can you beat me at Crickingo? 🏏\ncrickingo.vercel.app'});return;}
      catch(e){if(e.name==='AbortError')return;}
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='crickingo-hl.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    if(shareCopied){shareCopied.classList.add('show');setTimeout(()=>shareCopied.classList.remove('show'),2000);}
  },'image/png');
};

window.guess           = guess;
window.resetGame       = resetGame;
window.finishGame      = finishGame;
window.showRulesModal  = showRulesModal;
window.closeRulesModal = closeRulesModal;
window.backToMenu      = backToMenu;
window.saveGameResult  = saveAndRenderResult;

loadPlayers();