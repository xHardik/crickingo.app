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
const TARGET_RATING = 1850;
const TOTAL_BUDGET  = 100;
const MAX_PLAYERS   = 11;

let selectedTeam       = [];
let currentFilter      = 'All';
let currentSessionScore = null;

// ============================================================
// ── DASHBOARD — localStorage helpers
// ============================================================
const STATS_KEY   = 'crickingo_builder_stats';
const HISTORY_KEY = 'crickingo_builder_history';

function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function loadStats()   { try { return JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { return {}; } }
function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { return {}; } }

function saveGameResult(rating, won) {
    const key     = getTodayKey();
    const stats   = loadStats();
    const history = loadHistory();

    if (!history[key] || rating > (history[key].rating || 0)) {
        history[key] = { rating, won: !!won };
    }

    const entries = Object.values(history);
    stats.played  = entries.length;
    stats.wins    = entries.filter(e => e.won).length;
    stats.avg     = Math.round(entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length);

    let streak = 0;
    const check = new Date();
    while (true) {
        const k = check.toISOString().split('T')[0];
        if (history[k]) { streak++; check.setDate(check.getDate() - 1); }
        else break;
    }
    stats.streak = streak;

    localStorage.setItem(STATS_KEY,   JSON.stringify(stats));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderDashboard();
}

function renderDashboard() {
    const stats   = loadStats();
    const history = loadHistory();
    const today   = getTodayKey();

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    set('statPlayed', stats.played ?? '—');
    set('statWins',   stats.wins   ?? '—');
    set('statAvg',    stats.avg    ?? '—');
    set('statStreak', stats.streak != null
        ? stats.streak + (stats.streak === 1 ? ' day' : ' days')
        : '—');

    const dotsEl = document.getElementById('streakDots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';

    const now = new Date(today + 'T00:00:00');
    for (let i = 29; i >= 0; i--) {
        const d       = new Date(now);
        d.setDate(d.getDate() - i);
        const key     = d.toISOString().split('T')[0];
        const entry   = history[key];
        const isToday = key === today;

        const dot = document.createElement('div');
        if (isToday && entry) {
            dot.className = 'streak-dot today-played';
            dot.title = `Today · Rating ${entry.rating}`;
        } else if (isToday) {
            dot.className = 'streak-dot today-pending';
            dot.title = 'Today — not played yet';
        } else if (entry) {
            dot.className = 'streak-dot win';
            dot.title = `${key} · Rating ${entry.rating}`;
        } else {
            dot.className = 'streak-dot miss';
            dot.title = `${key} — missed`;
        }

        if (entry) {
            const pip = document.createElement('div');
            pip.className = 'dot-pip';
            dot.appendChild(pip);
        }
        dotsEl.appendChild(dot);
    }
}

// ============================================================
// ── MODAL
// ============================================================
function showRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
}

function closeRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRulesModal();
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeRulesModal(); });

    // Render dashboard on page load with existing data
    renderDashboard();
});

// ============================================================
// ── TOURNAMENT INFO — Crickingo design system
// ============================================================
function showTournamentInfo() {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'tournamentInfo';
    // ── Crickingo design system styles ──
    infoDiv.style.cssText = `
        position: fixed;
        top: 74px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(247,195,68,0.12);
        color: #F7C344;
        padding: 10px 24px;
        border-radius: 100px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 700;
        font-size: 0.82rem;
        letter-spacing: 1px;
        text-transform: uppercase;
        z-index: 999;
        border: 1px solid rgba(247,195,68,0.3);
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 20px rgba(247,195,68,0.15);
        white-space: nowrap;
    `;
    infoDiv.innerHTML = `🏆 Tournament Mode — Play Your Best!`;
    document.body.appendChild(infoDiv);
}

// ============================================================
// ── LOAD DATA
// ============================================================
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

function getDateFromURL() {
    return urlParams.get('date') || '2026-01-15';
}

async function init() {
    if (urlParams.get('tournament') !== 'true') {
        localStorage.removeItem('inTournamentGame');
    }

    if (!isInTournament) showRulesModal();
    if (isInTournament)  showTournamentInfo();

    let selectedDate;

    if (isInTournament) {
        const tournamentCode = localStorage.getItem('tournamentCode');
        const seedPath = `tournaments/${tournamentCode}/gameData/builder_date`;
        try {
            const response = await fetch('builder.json');
            const data = await response.json();
            const availableDates = Object.keys(data.datasets);
            const snapshot = await get(ref(db, seedPath));
            if (snapshot.exists()) {
                selectedDate = snapshot.val();
            } else {
                selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
                await set(ref(db, seedPath), selectedDate);
            }
        } catch (error) {
            console.error('Firebase error, using fallback:', error);
            try {
                const response = await fetch('builder.json');
                const data = await response.json();
                const availableDates = Object.keys(data.datasets);
                selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
            } catch (e) {
                alert('Failed to load game data.');
                return;
            }
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

    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

// ============================================================
// ── STAT BAR RENDERER — outputs HTML for the .player-stats div
// Max is derived from the highest stat in the loaded player pool
// ============================================================
function makeStatBars(bat, bowl, field) {
    // Derive max from the actual player data so bars are proportional
    const allVals = PLAYERS.flatMap(p => [Number(p.batting)||0, Number(p.bowling)||0, Number(p.fielding)||0]);
    const max = allVals.length ? Math.max(...allVals) : 100;
    const pct = v => Math.min(100, Math.round((v / max) * 100));
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

// ============================================================
// ── RENDER PLAYERS
// ============================================================
function getRoleClass(role) {
    const map = {
        'Batsman':       'role-batsman',
        'Bowler':        'role-bowler',
        'All-Rounder':   'role-all-rounder',
        'Wicket-Keeper': 'role-wicket-keeper'
    };
    return map[role] || 'role-batsman';
}

function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    if (!grid) return;

    const filtered = currentFilter === 'All'
        ? PLAYERS
        : PLAYERS.filter(p => p.role === currentFilter);

    const counts     = getRoleCounts();
    const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);

    grid.innerHTML = filtered.map(player => {
        const isSelected  = selectedTeam.some(p => p.name === player.name);
        const canAfford   = TOTAL_BUDGET - budgetUsed >= player.price;
        const req         = ROLE_REQUIREMENTS[player.role];
        const roleAtMax   = req && counts[player.role] >= req.max;
        const teamFull    = selectedTeam.length >= MAX_PLAYERS;
        const isDisabled  = !isSelected && (teamFull || !canAfford || roleAtMax);
        const safeName    = player.name.replace(/'/g, "\\'");

        // Tooltip hint for why it's disabled
        let disabledReason = '';
        if (!isSelected) {
            if (roleAtMax)  disabledReason = `Max ${req.max} ${req.label} reached`;
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
            </div>
        `;
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
        // Block if role is already at max
        const counts = getRoleCounts();
        const req = ROLE_REQUIREMENTS[player.role];
        if (req && counts[player.role] >= req.max) return;
        selectedTeam.push(player);
    }

    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

// ============================================================
// ── ROLE REQUIREMENTS
// ============================================================
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
    const counts  = getRoleCounts();
    const errors  = [];
    for (const [role, req] of Object.entries(ROLE_REQUIREMENTS)) {
        const n = counts[role];
        if (n < req.min) errors.push(`Need ${req.min}–${req.max} ${req.label} (have ${n})`);
        if (n > req.max) errors.push(`Max ${req.max} ${req.label} (have ${n})`);
    }
    return errors;
}

// ============================================================
// ── STATS BAR + PROGRESS
// ============================================================
function updateStats() {
    const budgetUsed = selectedTeam.reduce((s, p) => s + (Number(p.price) || 0), 0);
    const budgetLeft = TOTAL_BUDGET - budgetUsed;
    const rating     = calculateTeamRating();

    const budgetEl = document.getElementById('budgetLeft');
    if (budgetEl) {
        budgetEl.textContent = '$' + budgetLeft;
        budgetEl.classList.toggle('over-budget', budgetLeft < 0);
    }

    const countEl = document.getElementById('playerCount');
    if (countEl) countEl.textContent = `${selectedTeam.length} / 11`;

    const ratingEl = document.getElementById('teamRating');
    if (ratingEl) ratingEl.textContent = rating;

    const pct  = Math.min((rating / TARGET_RATING) * 100, 100);
    const fill = document.getElementById('ratingProgress');
    if (fill) {
        fill.style.width = pct + '%';
        fill.classList.toggle('complete', pct >= 100);
    }

    // Enable Check Team only when 11 players AND role requirements met
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        const ready = selectedTeam.length === MAX_PLAYERS && validateRoles().length === 0;
        checkBtn.disabled = !ready;
    }

    // Live role requirement indicators
    updateRoleRequirements();
}

function updateRoleRequirements() {
    const counts = getRoleCounts();
    const el = document.getElementById('roleRequirements');
    if (!el) return;

    el.innerHTML = Object.entries(ROLE_REQUIREMENTS).map(([role, req]) => {
        const n    = counts[role];
        const ok   = n >= req.min && n <= req.max;
        const over = n > req.max;
        const cls  = ok ? 'req-ok' : over ? 'req-over' : 'req-pending';
        const icon = ok ? '✓' : over ? '✕' : '·';
        return `<span class="role-req ${cls}">${icon} ${req.label}: ${n}/${req.min}–${req.max}</span>`;
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
        </div>
    `).join('');

    const remaining = MAX_PLAYERS - selectedTeam.length;
    for (let i = 0; i < remaining; i++) {
        container.innerHTML += `<div class="empty-slot">Slot ${selectedTeam.length + i + 1}</div>`;
    }
}

function calculateTeamRating() {
    return selectedTeam.reduce((total, p) =>
        total + (Number(p.batting) || 0) + (Number(p.bowling) || 0) + (Number(p.fielding) || 0), 0);
}

// ============================================================
// ── CHECK TEAM
// ============================================================
function checkTeam() {
    const resultEl = document.getElementById('result');
    if (!resultEl) return;

    // Role validation
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
    const score  = isWin ? rating : 0;

    // Save to dashboard
    if (!isInTournament) {
        saveGameResult(rating, isWin);
    }

    currentSessionScore = score;

    if (isWin) {
        resultEl.innerHTML = `
            <div class="result-box success">
                <div class="result-box-title">🎉 Champions!</div>
                <div class="result-box-msg">Team rating: <strong style="color:var(--teal)">${rating}</strong> — you built a winning XI!</div>
            </div>`;
    } else {
        const deficit = TARGET_RATING - rating;
        resultEl.innerHTML = `
            <div class="result-box failure">
                <div class="result-box-title">Not Quite!</div>
                <div class="result-box-msg">Rating: <strong style="color:var(--accent2)">${rating}</strong> — need ${deficit} more to reach 1850. Try again!</div>
            </div>`;
    }

    if (isInTournament) {
        const checkBtn = document.getElementById('checkBtn');
        if (checkBtn) checkBtn.style.display = 'none';
        const resetBtn = document.querySelector('.btn-reset');
        if (resetBtn) resetBtn.style.display = 'none';

        // ── Crickingo design system tournament completion block ──
        const tourneyMsg = document.createElement('div');
        tourneyMsg.style.cssText = `
            margin-top: 14px;
            padding: 20px;
            background: rgba(247,195,68,0.08);
            border: 1px solid rgba(247,195,68,0.25);
            border-radius: 14px;
            font-family: 'DM Sans', sans-serif;
            text-align: center;
        `;
        tourneyMsg.innerHTML = `
            <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(242,242,242,0.5);margin-bottom:10px;">✅ Score Submitted!</p>
            <p style="font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:2px;background:linear-gradient(135deg,#F7C344,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:6px 0;">${score}</p>
            <p style="font-size:0.82rem;color:rgba(242,242,242,0.5);margin-top:6px;">Team rating ${rating} · Returning to tournament…</p>
        `;
        resultEl.appendChild(tourneyMsg);
        setTimeout(() => returnToTournament(), 2000);
    }
}

// ============================================================
// ── RESET
// ============================================================
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
    const gameIndex = localStorage.getItem('currentGameIndex') || '4';
    localStorage.removeItem('inTournamentGame');
    window.location.href = `tournament.html?score=${currentSessionScore || 0}&game=${gameIndex}`;
}

// ============================================================
// ── EXPORTS
// ============================================================
window.filterPlayers      = filterPlayers;
window.togglePlayer       = togglePlayer;
window.checkTeam          = checkTeam;
window.resetTeam          = resetTeam;
window.returnToTournament = returnToTournament;
window.backToMenu         = backToMenu;
window.showRulesModal     = showRulesModal;
window.closeRulesModal    = closeRulesModal;

// ============================================================
// ── BOOT
// ============================================================
init();