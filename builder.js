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

let PLAYERS = [];
const TARGET_RATING = 2000;
const TOTAL_BUDGET  = 100;
const MAX_PLAYERS   = 11;

let selectedTeam        = [];
let currentFilter       = 'All';
let currentSessionScore = null;

// ── Storage keys ──
const STATS_KEY   = 'crickingo_builder_stats';
const HISTORY_KEY = 'crickingo_builder_history';

function getRealTodayKey() {
  return new Date().toISOString().split('T')[0];
}
function getDateKey() {
  return urlParams.get('date') || getRealTodayKey();
}

function saveAndRenderResult(rating, won) {
  // ✅ Never save in tournament mode
  if (isInTournament) return;

  const today = getRealTodayKey();
  let stats   = {};
  let history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { stats   = {}; }
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { history = {}; }

  if (!history[today] || rating > (history[today].rating || 0)) {
    history[today] = { rating, won: !!won };
  }

  const entries = Object.values(history);
  stats.played  = entries.length;
  stats.wins    = entries.filter(e => e.won).length;
  stats.avg     = Math.round(entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length);

  let streak = 0;
  const check = new Date(today + 'T00:00:00');
  while (true) {
    const k = check.toISOString().split('T')[0];
    if (history[k]) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }
  stats.streak = streak;

  localStorage.setItem(STATS_KEY,   JSON.stringify(stats));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  console.log('✅ [Builder] Saved:', today, '→', history[today]);
  renderDashboard(stats, history, today);
}

function updateTodayDot(rating) {
  // ✅ Never update dots in tournament mode
  if (isInTournament) return;

  const puzzleDate = getDateKey();
  const dotsEl     = document.getElementById('streakDots');
  if (!dotsEl) return;

  let targetDot = null;
  dotsEl.querySelectorAll('.streak-dot').forEach(dot => {
    if (dot.dataset.dotDate === puzzleDate) targetDot = dot;
  });
  if (!targetDot) targetDot = dotsEl.querySelectorAll('.streak-dot')[29];
  if (!targetDot) return;

  targetDot.className = 'streak-dot today-played';
  targetDot.title     = `${puzzleDate} · Rating ${rating}`;

  let sc = targetDot.querySelector('.dot-score-val');
  if (!sc) {
    sc           = document.createElement('div');
    sc.className = 'dot-score-val';
    targetDot.appendChild(sc);
  }
  sc.textContent = rating;
}

function renderDashboard(stats, history, today) {
  // ✅ In tournament mode, hide the entire dashboard
  if (isInTournament) {
    const dashboard = document.querySelector('.left-dashboard');
    if (dashboard) dashboard.style.display = 'none';
    return;
  }

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = (val != null) ? val : '—'; };
  setEl('statPlayed', stats.played);
  setEl('statWins',   stats.wins);
  setEl('statAvg',    stats.avg);
  setEl('statStreak', stats.streak != null
    ? stats.streak + (stats.streak === 1 ? ' day' : ' days') : null);

  const dotsEl = document.getElementById('streakDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';

  const base = new Date(today + 'T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d       = new Date(base);
    d.setDate(d.getDate() - i);
    const key     = d.toISOString().split('T')[0];
    const entry   = history[key];
    const isToday = key === today;

    const dot           = document.createElement('div');
    dot.dataset.dotDate = key;

    if (isToday && entry) {
      dot.className = 'streak-dot today-played';
      dot.title     = `Today · Rating ${entry.rating}`;
    } else if (isToday) {
      dot.className = 'streak-dot today-pending';
      dot.title     = 'Today — not played yet';
    } else if (entry) {
      dot.className = 'streak-dot win';
      dot.title     = `${key} · Rating ${entry.rating}`;
    } else {
      dot.className = 'streak-dot miss';
      dot.title     = `${key} — missed`;
    }

    if (entry) {
      const sc       = document.createElement('div');
      sc.className   = 'dot-score-val';
      sc.textContent = entry.rating;
      dot.appendChild(sc);
    }

    dotsEl.appendChild(dot);
  }
}

// ── MODAL ──
function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
}

function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRulesModal(); });

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('rulesModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeRulesModal(); });
  // Initial render with whatever history exists (auto-hides if tournament)
  const today = getRealTodayKey();
  let stats   = {};
  let history = {};
  try { stats   = JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch {}
  try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch {}
  renderDashboard(stats, history, today);
});

// ── Tournament banner ──
function showTournamentInfo() {
  if (document.getElementById('tournamentInfo')) return;
  const infoDiv = document.createElement('div');
  infoDiv.id = 'tournamentInfo';
  infoDiv.style.cssText = `
    position: fixed; top: 74px; left: 50%; transform: translateX(-50%);
    background: rgba(45,212,191,0.12); color: #2DD4BF;
    padding: 8px 22px; border-radius: 100px;
    font-family: 'DM Sans', sans-serif; font-weight: 700;
    font-size: 0.78rem; letter-spacing: 1px; text-transform: uppercase;
    z-index: 999; border: 1px solid rgba(45,212,191,0.3);
    backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(45,212,191,0.15);
    white-space: nowrap;
  `;
  infoDiv.innerHTML = '🏆 Tournament Mode — Play Your Best!';
  document.body.appendChild(infoDiv);
}

// ── Load data ──
async function loadPlayersByDate(selectedDate) {
  try {
    const response = await fetch('builder.json');
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    if (!data.datasets || !data.datasets[selectedDate]) throw new Error('No data for date: ' + selectedDate);
    return data.datasets[selectedDate].players || [];
  } catch (error) {
    console.error('Error loading players:', error);
    alert('Failed to load player data: ' + error.message);
    return [];
  }
}

function populatePuzzleBar(dateStr) {
  // ✅ Hide puzzle bar in tournament mode only — date/number set by inline HTML script
  if (isInTournament) {
    const puzzleBar = document.querySelector('.puzzle-bar');
    if (puzzleBar) puzzleBar.style.display = 'none';
  }
}

function getDateFromURL() {
  return urlParams.get('date') || '2026-01-15';
}

async function init() {
  if (urlParams.get('tournament') !== 'true') localStorage.removeItem('inTournamentGame');
  if (!isInTournament) showRulesModal();
  if (isInTournament)  showTournamentInfo();

  let selectedDate;

  if (isInTournament) {
    const tournamentCode = localStorage.getItem('tournamentCode');
    const seedPath       = `tournaments/${tournamentCode}/gameData/builder_date`;
    try {
      const response       = await fetch('builder.json');
      const data           = await response.json();
      const availableDates = Object.keys(data.datasets);
      const snapshot       = await get(ref(db, seedPath));
      if (snapshot.exists()) {
        selectedDate = snapshot.val();
      } else {
        selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
        await set(ref(db, seedPath), selectedDate);
      }
    } catch (error) {
      console.error('Firebase error, using fallback:', error);
      try {
        const response       = await fetch('builder.json');
        const data           = await response.json();
        const availableDates = Object.keys(data.datasets);
        selectedDate         = availableDates[Math.floor(Math.random() * availableDates.length)];
      } catch (e) { alert('Failed to load game data.'); return; }
    }
  } else {
    selectedDate = getDateFromURL();
  }

  PLAYERS = await loadPlayersByDate(selectedDate);

  if (PLAYERS.length === 0) {
    const grid = document.getElementById('playersGrid');
    if (grid) grid.innerHTML = '<p style="color:var(--muted);padding:20px;">Failed to load players. Please refresh.</p>';
    return;
  }

  populatePuzzleBar(selectedDate);
  renderPlayers();
  updateStats();
  updateSelectedTeam();
}

// ── Stat bars ──
function makeStatBars(bat, bowl, field) {
  const allVals = PLAYERS.flatMap(p => [Number(p.batting)||0, Number(p.bowling)||0, Number(p.fielding)||0]);
  const max     = allVals.length ? Math.max(...allVals) : 100;
  const pct     = v => Math.min(100, Math.round((v / max) * 100));
  return `
    <div class="player-stats">
      <div class="stat-bar-row">
        <span class="stat-bar-label">Bat</span>
        <div class="stat-bar-track"><div class="stat-bar-fill bat" style="width:${pct(bat)}%"></div></div>
        <span class="stat-bar-val">${bat}</span>
      </div>
      <div class="stat-bar-row">
        <span class="stat-bar-label">Bowl</span>
        <div class="stat-bar-track"><div class="stat-bar-fill bowl" style="width:${pct(bowl)}%"></div></div>
        <span class="stat-bar-val">${bowl}</span>
      </div>
      <div class="stat-bar-row">
        <span class="stat-bar-label">Field</span>
        <div class="stat-bar-track"><div class="stat-bar-fill field" style="width:${pct(field)}%"></div></div>
        <span class="stat-bar-val">${field}</span>
      </div>
    </div>`;
}

function getRoleClass(role) {
  return { 'Batsman': 'role-batsman', 'Bowler': 'role-bowler', 'All-Rounder': 'role-all-rounder', 'Wicket-Keeper': 'role-wicket-keeper' }[role] || 'role-batsman';
}

function renderPlayers() {
  const grid = document.getElementById('playersGrid');
  if (!grid) return;

  const filtered   = currentFilter === 'All' ? PLAYERS : PLAYERS.filter(p => p.role === currentFilter);
  const counts     = getRoleCounts();
  const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);

  grid.innerHTML = filtered.map(player => {
    const isSelected = selectedTeam.some(p => p.name === player.name);
    const canAfford  = TOTAL_BUDGET - budgetUsed >= player.price;
    const req        = ROLE_REQUIREMENTS[player.role];
    const roleAtMax  = req && counts[player.role] >= req.max;
    const teamFull   = selectedTeam.length >= MAX_PLAYERS;
    const isDisabled = !isSelected && (teamFull || !canAfford || roleAtMax);
    const safeName   = player.name.replace(/'/g, "\\'");

    let disabledReason = '';
    if (!isSelected) {
      if (roleAtMax)       disabledReason = `Max ${req.max} ${req.label} reached`;
      else if (teamFull)   disabledReason = 'Team is full';
      else if (!canAfford) disabledReason = 'Not enough budget';
    }

    return `
      <div class="player-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
           onclick="${isDisabled ? '' : `togglePlayer('${safeName}')`}"
           ${disabledReason ? `title="${disabledReason}"` : ''}>
        <div class="player-header">
          <div class="player-name">${player.name}</div>
          <div class="player-price">$${player.price}</div>
        </div>
        <div class="player-role ${getRoleClass(player.role)}">${player.role}</div>
        ${makeStatBars(Number(player.batting)||0, Number(player.bowling)||0, Number(player.fielding)||0)}
        ${disabledReason ? `<div class="disabled-reason">${disabledReason}</div>` : ''}
      </div>`;
  }).join('');
}

function filterPlayers(role, event) {
  currentFilter = role;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (event?.target) event.target.classList.add('active');
  renderPlayers();
}

function togglePlayer(playerName) {
  const player = PLAYERS.find(p => p.name === playerName);
  if (!player) return;

  const index = selectedTeam.findIndex(p => p.name === playerName);
  if (index > -1) {
    selectedTeam.splice(index, 1);
  } else {
    if (selectedTeam.length >= MAX_PLAYERS) return;
    const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);
    if (budgetUsed + player.price > TOTAL_BUDGET) return;
    const counts = getRoleCounts();
    const req    = ROLE_REQUIREMENTS[player.role];
    if (req && counts[player.role] >= req.max) return;
    selectedTeam.push(player);
  }

  renderPlayers();
  updateStats();
  updateSelectedTeam();
}

const ROLE_REQUIREMENTS = {
  'Batsman':       { min: 3, max: 5, label: 'Batsmen' },
  'Bowler':        { min: 3, max: 5, label: 'Bowlers' },
  'All-Rounder':   { min: 3, max: 5, label: 'All-Rounders' },
  'Wicket-Keeper': { min: 1, max: 2, label: 'Keeper' }
};

function getRoleCounts() {
  const counts = { 'Batsman': 0, 'Bowler': 0, 'All-Rounder': 0, 'Wicket-Keeper': 0 };
  selectedTeam.forEach(p => { if (counts[p.role] !== undefined) counts[p.role]++; });
  return counts;
}

function validateRoles() {
  const counts = getRoleCounts();
  const errors = [];
  for (const [role, req] of Object.entries(ROLE_REQUIREMENTS)) {
    const n = counts[role];
    if (n < req.min) errors.push(`Need ${req.min}–${req.max} ${req.label} (have ${n})`);
    if (n > req.max) errors.push(`Max ${req.max} ${req.label} (have ${n})`);
  }
  return errors;
}

function updateStats() {
  const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);
  const budgetLeft = TOTAL_BUDGET - budgetUsed;
  const rating     = calculateTeamRating();

  const budgetEl = document.getElementById('budgetLeft');
  if (budgetEl) { budgetEl.textContent = '$' + budgetLeft; budgetEl.classList.toggle('over-budget', budgetLeft < 0); }

  const countEl = document.getElementById('playerCount');
  if (countEl) countEl.textContent = `${selectedTeam.length} / 11`;

  const ratingEl = document.getElementById('teamRating');
  if (ratingEl) ratingEl.textContent = rating;

  const pct  = Math.min((rating / TARGET_RATING) * 100, 100);
  const fill = document.getElementById('ratingProgress');
  if (fill) { fill.style.width = pct + '%'; fill.classList.toggle('complete', pct >= 100); }

  const checkBtn = document.getElementById('checkBtn');
  if (checkBtn) checkBtn.disabled = !(selectedTeam.length === MAX_PLAYERS && validateRoles().length === 0);

  updateRoleRequirements();
}

function updateRoleRequirements() {
  const counts = getRoleCounts();
  const el     = document.getElementById('roleRequirements');
  if (!el) return;
  el.innerHTML = Object.entries(ROLE_REQUIREMENTS).map(([role, req]) => {
    const n   = counts[role];
    const ok  = n >= req.min && n <= req.max;
    const over = n > req.max;
    const cls = ok ? 'req-ok' : over ? 'req-over' : 'req-pending';
    return `<span class="role-req ${cls}">${ok ? '✓' : over ? '✕' : '·'} ${req.label}: ${n}/${req.min}–${req.max}</span>`;
  }).join('');
}

function updateSelectedTeam() {
  const container = document.getElementById('selectedPlayers');
  if (!container) return;

  if (selectedTeam.length === 0) {
    container.innerHTML = '<div class="empty-slot">Select 11 players to build your team</div>';
    return;
  }

  container.innerHTML = selectedTeam.map(p => `
    <div class="selected-player">
      <div class="selected-player-info">
        <div class="selected-player-name">${p.name}</div>
        <div class="selected-player-role">${p.role}</div>
      </div>
      <div class="selected-player-price">$${p.price}</div>
      <button class="remove-btn" onclick="togglePlayer('${p.name.replace(/'/g, "\\'")}')">✕</button>
    </div>`).join('');

  const remaining = MAX_PLAYERS - selectedTeam.length;
  for (let i = 0; i < remaining; i++) {
    container.innerHTML += `<div class="empty-slot">Slot ${selectedTeam.length + i + 1}</div>`;
  }
}

function calculateTeamRating() {
  return selectedTeam.reduce((total, p) =>
    total + (Number(p.batting)||0) + (Number(p.bowling)||0) + (Number(p.fielding)||0), 0);
}

// ── CHECK TEAM ──
function checkTeam() {
  const resultEl = document.getElementById('result');
  if (!resultEl) return;

  const roleErrors = validateRoles();
  if (roleErrors.length > 0) {
    resultEl.innerHTML = `
      <div class="result-box failure">
        <div class="result-box-title">Invalid Team!</div>
        <div class="result-box-msg">${roleErrors.map(e => `• ${e}`).join('<br>')}</div>
      </div>`;
    return;
  }

  const rating = calculateTeamRating();
  const isWin  = rating >= TARGET_RATING;

  const today     = getRealTodayKey();
  const dTomorrow = new Date(today + 'T00:00:00');
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = dTomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const counts     = getRoleCounts();
  const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);

  window._shareData = {
    score:     rating + ' rating',
    phrase:    isWin
      ? `Built a winning XI! 🏆 Team rated ${rating}`
      : `Team rated ${rating} — need ${TARGET_RATING - rating} more`,
    breakdown: [
      { label: `${isWin ? '🏆' : '📊'} Team Rating`,  value: String(rating),           color: isWin ? '#3DD68C' : '#ff8080' },
      { label: '💰 Budget Used',                        value: `$${budgetUsed} / $${TOTAL_BUDGET}`, color: '#F7C344' },
      { label: '🏏 Batsmen',                            value: String(counts['Batsman']),       color: '#4F8EF7'  },
      { label: '🎯 Bowlers',                            value: String(counts['Bowler']),        color: '#E84040'  },
      { label: '⚡ All-Rounders',                       value: String(counts['All-Rounder']),   color: '#F7C344'  },
      { label: '🧤 Keeper',                             value: String(counts['Wicket-Keeper']), color: '#A855F7'  },
    ],
    tomorrow: tomorrowStr
  };

  // ✅ Only save and update dot in normal mode
  if (!isInTournament) {
    saveAndRenderResult(rating, isWin);
    updateTodayDot(rating);
  }

  currentSessionScore = rating;

  if (isWin) {
    resultEl.innerHTML = `
      <div class="result-box success">
        <div class="result-box-title">🎉 Champions!</div>
        <div class="result-box-msg">Team rating: <strong style="color:var(--teal)">${rating}</strong> — you built a winning XI!</div>
        <button id="shareBtn" onclick="shareScore()" style="
          margin-top:14px; display:inline-flex; align-items:center; gap:6px;
          padding:10px 22px; border-radius:10px;
          border:1px solid rgba(45,212,191,0.35); background:rgba(45,212,191,0.12); color:#2DD4BF;
          font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:700;
          cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;
          transition:all 0.2s; position:relative; overflow:hidden;">
          📤 Share Score
          <span id="shareCopied" style="
            position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
            background:rgba(61,214,140,0.9); color:#000; font-weight:800; font-size:0.8rem;
            border-radius:10px; opacity:0; pointer-events:none; transition:opacity 0.2s;">✓ Saved!</span>
        </button>
      </div>`;
  } else {
    const deficit = TARGET_RATING - rating;
    resultEl.innerHTML = `
      <div class="result-box failure">
        <div class="result-box-title">Not Quite!</div>
        <div class="result-box-msg">Rating: <strong style="color:var(--accent2)">${rating}</strong> — need ${deficit} more to reach 2000. Try again!</div>
        <button id="shareBtn" onclick="shareScore()" style="
          margin-top:14px; display:inline-flex; align-items:center; gap:6px;
          padding:10px 22px; border-radius:10px;
          border:1px solid rgba(232,64,64,0.35); background:rgba(232,64,64,0.1); color:#ff8080;
          font-family:'DM Sans',sans-serif; font-size:0.85rem; font-weight:700;
          cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;
          transition:all 0.2s; position:relative; overflow:hidden;">
          📤 Share Score
          <span id="shareCopied" style="
            position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
            background:rgba(61,214,140,0.9); color:#000; font-weight:800; font-size:0.8rem;
            border-radius:10px; opacity:0; pointer-events:none; transition:opacity 0.2s;">✓ Saved!</span>
        </button>
      </div>`;
  }

  if (isInTournament) {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) checkBtn.style.display = 'none';
    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) resetBtn.style.display = 'none';

    // ✅ Skip result card entirely in tournament mode
    returnToTournament();
  }
}

function resetTeam() {
  selectedTeam        = [];
  currentSessionScore = null;

  const resultEl = document.getElementById('result');
  if (resultEl) resultEl.innerHTML = '';

  const checkBtn = document.getElementById('checkBtn');
  if (checkBtn) { checkBtn.style.display = ''; checkBtn.disabled = true; }

  const resetBtn = document.querySelector('.btn-reset');
  if (resetBtn) resetBtn.style.display = '';

  renderPlayers();
  updateStats();
  updateSelectedTeam();
}

function backToMenu() { window.location.href = 'index.html'; }

function returnToTournament() {
  const gameIndex = localStorage.getItem('currentGameIndex') || '5';
  localStorage.removeItem('inTournamentGame');
  window.location.href = `tournament.html?score=${currentSessionScore || 0}&game=${gameIndex}`;
}

// ── CANVAS SHARE CARD ──
window._shareData = {};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill();
}

window.shareScore = async function () {
  const shareBtn    = document.getElementById('shareBtn');
  const shareCopied = document.getElementById('shareCopied');
  if (shareBtn) shareBtn.style.opacity = '0.6';

  const d         = window._shareData || {};
  const score     = d.score     || '0 rating';
  const phrase    = d.phrase    || '';
  const breakdown = d.breakdown || [];
  const tomorrow  = d.tomorrow  || '';

  const W = 600, pad = 44;
  const H = 560 + breakdown.length * 36 + (tomorrow ? 80 : 0);

  const canvas  = document.createElement('canvas');
  canvas.width  = W * 2; canvas.height = H * 2;
  const ctx     = canvas.getContext('2d');
  ctx.scale(2, 2);

  ctx.fillStyle = '#0d1120';
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,   '#2DD4BF');
  grad.addColorStop(0.5, '#F7C344');
  grad.addColorStop(1,   '#E84040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 3);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 0, 3, W, H - 3, 0);

  let y = pad + 16;

  ctx.font = 'bold 28px "Arial Black", Arial';
  ctx.fillStyle = 'rgba(242,242,242,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('BUILD YOUR XI', W / 2, y);
  y += 36;

  ctx.fillStyle = 'rgba(45,212,191,0.25)';
  roundRect(ctx, pad, y, W - pad * 2, 64, 12);
  ctx.fillStyle = '#2DD4BF';
  ctx.font      = 'bold 40px "Arial Black", Arial';
  ctx.fillText(score, W / 2, y + 44);
  y += 80;

  ctx.font      = '16px Arial';
  ctx.fillStyle = 'rgba(242,242,242,0.6)';
  ctx.fillText(phrase, W / 2, y);
  y += 36;

  const bH = 40 + breakdown.length * 34 + 54;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, pad, y, W - pad * 2, bH, 12);
  ctx.font      = 'bold 15px Arial';
  ctx.fillStyle = '#F2F2F2';
  ctx.fillText('📊 Team Breakdown', W / 2, y + 28);
  y += 44;

  breakdown.forEach(row => {
    ctx.textAlign = 'left';
    ctx.font      = '14px Arial';
    ctx.fillStyle = 'rgba(242,242,242,0.8)';
    ctx.fillText(row.label, pad + 16, y + 16);
    if (row.value) {
      ctx.textAlign = 'right';
      ctx.fillStyle = row.color || '#F7C344';
      ctx.fillText(row.value, W - pad - 16, y + 16);
    }
    y += 34;
  });

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(pad + 16, y); ctx.lineTo(W - pad - 16, y); ctx.stroke();
  y += 20;
  ctx.textAlign = 'left';  ctx.font = 'bold 18px Arial'; ctx.fillStyle = '#F2F2F2';
  ctx.fillText('Total Rating:', pad + 16, y + 4);
  ctx.textAlign = 'right'; ctx.fillStyle = '#2DD4BF';
  ctx.fillText(d.score || '0', W - pad - 16, y + 4);
  y += 40;

  if (tomorrow) {
    ctx.fillStyle = 'rgba(45,212,191,0.1)';
    roundRect(ctx, pad, y, W - pad * 2, 58, 12);
    ctx.textAlign = 'center';
    ctx.font      = '12px Arial'; ctx.fillStyle = 'rgba(242,242,242,0.5)';
    ctx.fillText('📅 Next Puzzle', W / 2, y + 20);
    ctx.font      = 'bold 15px Arial'; ctx.fillStyle = '#2DD4BF';
    ctx.fillText('Come back tomorrow · ' + tomorrow, W / 2, y + 42);
    y += 66;
  }

  ctx.fillStyle = 'rgba(45,212,191,0.12)';
  roundRect(ctx, pad, y, W - pad * 2, 58, 12);
  ctx.textAlign = 'center';
  ctx.font      = 'bold 16px Arial'; ctx.fillStyle = '#2DD4BF';
  ctx.fillText('🏏 Can you beat me at Crickingo?', W / 2, y + 24);
  ctx.font      = '13px Arial'; ctx.fillStyle = 'rgba(242,242,242,0.5)';
  ctx.fillText('crickingo.vercel.app', W / 2, y + 44);

  if (shareBtn) shareBtn.style.opacity = '1';

  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'crickingo-builder.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: 'Can you beat me at Crickingo? 🏏\ncrickingo.vercel.app' });
        return;
      } catch (e) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = 'crickingo-builder.png';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    if (shareCopied) {
      shareCopied.style.opacity = '1';
      setTimeout(() => { shareCopied.style.opacity = '0'; }, 2000);
    }
  }, 'image/png');
};

// ── Exports ──
window.filterPlayers      = filterPlayers;
window.togglePlayer       = togglePlayer;
window.checkTeam          = checkTeam;
window.resetTeam          = resetTeam;
window.returnToTournament = returnToTournament;
window.backToMenu         = backToMenu;
window.showRulesModal     = showRulesModal;
window.closeRulesModal    = closeRulesModal;

init();