import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

const GAMES = [
  { name: 'Higher Or Lower',  emoji: '📈' },
  { name: 'Cricket Bingo',    emoji: '🏏' },
  { name: 'Transfer History', emoji: '🔄' },
  { name: 'Build Your Team',  emoji: '🏗️' },
  { name: 'Wordle',           emoji: '🟨' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

// ── LOAD ───
async function loadResults() {
  const code = localStorage.getItem('tournamentCode');
  if (!code) {
    alert('No tournament data found!');
    window.location.href = 'tournament.html';
    return;
  }

  try {
    const snapshot = await get(ref(db, `tournaments/${code}`));
    if (!snapshot.exists()) {
      alert('Tournament not found!');
      window.location.href = 'tournament.html';
      return;
    }
    displayResults(snapshot.val());

    // ✅ Auto-delete tournament from Firebase 5 mins after results load
    // Gives everyone enough time to see results, then cleans up automatically
    setTimeout(async () => {
      try {
        await remove(ref(db, `tournaments/${code}`));
        localStorage.removeItem('tournamentCode');
        localStorage.removeItem('playerId');
        localStorage.removeItem('playerName');
        console.log('🗑️ Tournament cleaned up:', code);
      } catch (e) {
        console.log('Cleanup skipped (already deleted):', e.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } catch (err) {
    console.error('Error loading results:', err);
    alert('Failed to load results. Please try again.');
  }
}

// ── DISPLAY ───────────────────────────────────────────
function displayResults(tournament) {
  document.getElementById('tournamentName').textContent = tournament.name || 'Tournament';

  const players = Object.values(tournament.players || {});
  const scores  = tournament.scores || {};

  const results = players.map(player => {
    let total = 0;
    const gameScores = {};
    const playerScores = scores[player.id] || {};

    GAMES.forEach((_, i) => {
      const s = playerScores[`game${i}`] || 0;
      gameScores[`game${i}`] = s;
      total += s;
    });

    return { player, total, gameScores };
  });

  results.sort((a, b) => b.total - a.total);

  displayPodium(results.slice(0, 3));
  displayLeaderboard(results);
}

// ── PODIUM ────────────────────────────────────────────
function displayPodium(top3) {
  const podium = document.getElementById('podium');
  podium.innerHTML = '';

  // Visual order: 2nd left, 1st centre, 3rd right
  const visualOrder = [
    top3[1] ? { ...top3[1], rank: 1, cls: 'second' } : null,
    top3[0] ? { ...top3[0], rank: 0, cls: 'first'  } : null,
    top3[2] ? { ...top3[2], rank: 2, cls: 'third'  } : null,
  ].filter(Boolean);

  visualOrder.forEach(({ player, total, rank, cls }) => {
    const place = document.createElement('div');
    place.className = `podium-place ${cls}`;
    place.innerHTML = `
      <div class="podium-player">
        <span class="podium-medal">${MEDALS[rank]}</span>
        <div class="podium-player-name">${esc(player.name)}</div>
        <div class="podium-score">${total.toLocaleString()}</div>
        <div class="podium-pts">points</div>
      </div>
      <div class="podium-block">#${rank + 1}</div>
    `;
    podium.appendChild(place);
  });
}

// ── LEADERBOARD ───────────────────────────────────────
function displayLeaderboard(results) {
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = '';

  results.forEach((result, index) => {
    const isTop3   = index < 3;
    const rankDisp = index < 3 ? MEDALS[index] : `#${index + 1}`;
    const initials = result.player.name.trim().slice(0, 2).toUpperCase();

    const bRows = GAMES.map((game, i) => {
      const score = result.gameScores[`game${i}`] || 0;
      return `
        <div class="breakdown-item">
          <span class="game-name">${game.emoji} ${game.name}</span>
          <span class="game-score ${score > 0 ? 'positive' : 'zero'}">${score > 0 ? score.toLocaleString() + ' pts' : '—'}</span>
        </div>
      `;
    }).join('');

    const row = document.createElement('div');
    row.className = `player-row ${isTop3 ? 'top-3' : ''}`;
    row.innerHTML = `
      <div class="rank">${rankDisp}</div>
      <div class="player-info">
        <div class="player-avatar">${initials}</div>
        <div class="name">${esc(result.player.name)}</div>
      </div>
      <div class="total-score">${result.total.toLocaleString()}</div>
      <button class="breakdown-btn" onclick="event.stopPropagation(); window.toggleBreakdown(this)">Details</button>
      <div class="breakdown-wrap">
        <div class="breakdown">
          <div class="breakdown-header">📊 Score Breakdown</div>
          ${bRows}
          <div class="breakdown-total">
            <span>Total Score</span>
            <span class="breakdown-total-score">${result.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;

    lb.appendChild(row);
  });
}

// ── TOGGLE ────────────────────────────────────────────
window.toggleBreakdown = function(btn) {
  const row  = btn.closest('.player-row');
  const wrap = row.querySelector('.breakdown-wrap');
  const isOpen = wrap.classList.contains('show');

  // Close all open panels
  document.querySelectorAll('.breakdown-wrap.show').forEach(w => {
    w.classList.remove('show');
    const b = w.closest('.player-row')?.querySelector('.breakdown-btn');
    if (b) { b.classList.remove('open'); b.textContent = 'Details'; }
  });

  // Open this one if it was closed
  if (!isOpen) {
    wrap.classList.add('show');
    btn.classList.add('open');
    btn.textContent = 'Hide';
    setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
};

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadResults();