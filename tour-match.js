import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, update, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

const GAMES = [
  { name: "Higher Or Lower", url: "https://crickingo.vercel.app/hl.html" },
  { name: "Cricket Bingo",   url: "https://crickingo.vercel.app/rivalry.html" },
  { name: "Transfer History",url: "https://crickingo.vercel.app/transfer.html" },
  { name: "Wordle",          url: "https://crickingo.vercel.app/wordle.html" },
  { name: "Build Your Team", url: "https://crickingo.vercel.app/builder.html" },
];

let currentTournament = null;
let currentPlayer     = null;
let currentGameIndex  = 0;

// ===== CREATE TOURNAMENT =====
async function createTournament() {
  const name        = document.getElementById('tournamentName').value.trim();
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const hostName    = document.getElementById('hostName').value.trim();

  if (!name || !hostName) { alert('Please fill in all fields'); return; }

  try {
    const code    = generateCode();
    currentPlayer = { name: hostName, id: Date.now().toString() };

    const tournament = {
      name, code,
      maxPlayers: playerCount,
      players:    { [currentPlayer.id]: currentPlayer },
      currentGame: 0,
      scores:      {},
      status:      'waiting',
      host:        currentPlayer.id,
      createdAt:   Date.now()
    };

    await set(ref(db, `tournaments/${code}`), tournament);
    currentTournament = code;

    localStorage.setItem('tournamentCode', code);
    localStorage.setItem('playerId',       currentPlayer.id);
    localStorage.setItem('playerName',     currentPlayer.name);

    showLobby(code);
    listenToTournament(code);
  } catch (error) {
    console.error('Error:', error);
    alert('Error creating tournament: ' + error.message);
  }
}

// ===== JOIN TOURNAMENT =====
async function joinTournament() {
  const code = document.getElementById('joinCode').value.trim().toUpperCase();
  const name = document.getElementById('joinName').value.trim();

  if (!code || !name) { alert('Please fill in all fields'); return; }

  const snapshot = await get(ref(db, `tournaments/${code}`));
  if (!snapshot.exists()) { alert('Tournament not found'); return; }

  const tournament  = snapshot.val();
  const playerCount = Object.keys(tournament.players || {}).length;
  if (playerCount >= tournament.maxPlayers) { alert('Tournament is full'); return; }

  currentPlayer = { name, id: Date.now().toString() };
  await update(ref(db, `tournaments/${code}/players/${currentPlayer.id}`), currentPlayer);

  currentTournament = code;
  localStorage.setItem('tournamentCode', code);
  localStorage.setItem('playerId',       currentPlayer.id);
  localStorage.setItem('playerName',     name);

  showLobby(code);
  listenToTournament(code);
}

// ===== LISTENER =====
function listenToTournament(code) {
  onValue(ref(db, `tournaments/${code}`), (snapshot) => {
    if (!snapshot.exists()) return;
    const tournament = snapshot.val();

    if (tournament.status === 'waiting') {
      updateLobby(tournament);
    } else if (tournament.status === 'playing') {
      const lobbyScreen = document.getElementById('lobbyScreen');
      if (lobbyScreen && lobbyScreen.classList.contains('active')) {
        handlePlayingState(tournament);
      }
    } else if (tournament.status === 'finished') {
      window.location.href = 'tour-result.html';
    }
  });
}

// ===== HANDLE PLAYING STATE =====
function handlePlayingState(tournament) {
  document.getElementById('lobbyScreen').classList.remove('active');

  const scores       = tournament.scores || {};
  const playerScores = scores[currentPlayer.id] || {};

  let nextGameIndex = -1;
  for (let i = 0; i < GAMES.length; i++) {
    if (playerScores[`game${i}`] === undefined) { nextGameIndex = i; break; }
  }

  if (nextGameIndex === -1) { showWaitingForOthers(tournament); return; }

  currentGameIndex = nextGameIndex;
  redirectToGame(nextGameIndex);
}

// ===== WAITING SCREEN =====
function showWaitingForOthers(tournament) {
  document.body.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',sans-serif;background:#060810;color:#F2F2F2;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
      body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(61,214,140,0.13) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 80%,rgba(79,142,247,0.07) 0%,transparent 60%);pointer-events:none;z-index:0}
      .card{position:relative;z-index:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 40px;max-width:460px;width:100%;text-align:center;overflow:hidden;animation:riseIn .5s cubic-bezier(.4,0,.2,1) both}
      .card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#3DD68C,#4F8EF7,#3DD68C);border-radius:24px 24px 0 0}
      @keyframes riseIn{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
      .emoji{font-size:3.8rem;display:block;margin-bottom:18px;animation:float 2.6s ease-in-out infinite;filter:drop-shadow(0 0 24px rgba(61,214,140,.5))}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      h1{font-family:'Bebas Neue',sans-serif;font-size:2.6rem;letter-spacing:3px;background:linear-gradient(135deg,#3DD68C,#fff 60%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px}
      .sub{color:rgba(242,242,242,.45);font-size:.86rem;margin-bottom:28px}
      .games-list{display:flex;flex-direction:column;gap:8px;margin-bottom:28px;text-align:left}
      .game-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(61,214,140,.07);border:1px solid rgba(61,214,140,.2);border-radius:10px;font-size:.84rem;color:rgba(242,242,242,.8);font-weight:500;animation:fadeUp .4s ease both}
      .game-row:nth-child(1){animation-delay:.05s}.game-row:nth-child(2){animation-delay:.10s}.game-row:nth-child(3){animation-delay:.15s}.game-row:nth-child(4){animation-delay:.20s}.game-row:nth-child(5){animation-delay:.25s}
      @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .check{width:26px;height:26px;border-radius:50%;background:rgba(61,214,140,.15);border:1px solid rgba(61,214,140,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.9rem}
      .status-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px}
      .status-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(242,242,242,.35);margin-bottom:14px}
      .dots{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:12px}
      .dot{width:8px;height:8px;border-radius:50%;animation:blink 1.2s ease-in-out infinite}
      .dot:nth-child(1){background:#3DD68C}.dot:nth-child(2){background:#4F8EF7;animation-delay:.2s}.dot:nth-child(3){background:#F7C344;animation-delay:.4s}
      @keyframes blink{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
      .hint{font-size:.72rem;color:rgba(242,242,242,.3);font-weight:500}
    </style>
    <div class="card">
      <span class="emoji">🎉</span>
      <h1>All Done!</h1>
      <p class="sub">You've completed all ${GAMES.length} games</p>
      <div class="games-list">
        ${GAMES.map(g => `<div class="game-row"><div class="check">✓</div>${g.name}</div>`).join('')}
      </div>
      <div class="status-box">
        <div class="status-label">Waiting for other players</div>
        <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
        <div class="hint">You'll be redirected automatically when everyone finishes</div>
      </div>
    </div>
  `;
}

// ===== TRANSITION SCREEN — shown between games, replaces the tournament page flash =====
function showTransitionScreen(score, nextGameIndex) {
  document.documentElement.style.visibility = 'visible';
  document.body.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',sans-serif;background:#060810;color:#F2F2F2;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
      body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(247,195,68,0.12) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 80%,rgba(79,142,247,0.07) 0%,transparent 60%);pointer-events:none;z-index:0}
      body::after{content:'';position:fixed;inset:0;background-image:repeating-linear-gradient(-45deg,transparent,transparent 40px,rgba(255,255,255,0.009) 40px,rgba(255,255,255,0.009) 41px);pointer-events:none;z-index:0}
      .card{position:relative;z-index:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 40px;max-width:420px;width:100%;text-align:center;overflow:hidden;animation:riseIn .4s cubic-bezier(.4,0,.2,1) both}
      .card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#F7C344,#E84040,#4F8EF7);border-radius:24px 24px 0 0}
      @keyframes riseIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      .check{font-size:3.2rem;display:block;margin-bottom:18px;animation:popIn .4s cubic-bezier(.4,0,.2,1) .15s both;filter:drop-shadow(0 0 20px rgba(61,214,140,.5))}
      @keyframes popIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
      h2{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:3px;background:linear-gradient(135deg,#3DD68C,#fff 60%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px}
      .score-pill{display:inline-flex;align-items:baseline;gap:5px;background:rgba(247,195,68,.10);border:1px solid rgba(247,195,68,.25);border-radius:100px;padding:6px 20px;margin-bottom:28px}
      .score-val{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:2px;color:#F7C344}
      .score-lbl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(242,242,242,.45)}
      .divider{height:1px;background:rgba(255,255,255,.07);margin-bottom:22px}
      .next-lbl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(242,242,242,.35);margin-bottom:8px}
      .next-name{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2px;color:#F2F2F2;margin-bottom:22px}
      .bar{height:3px;background:rgba(255,255,255,.07);border-radius:100px;overflow:hidden}
      .bar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#F7C344,#4F8EF7);animation:fillBar 2.2s linear both}
      @keyframes fillBar{from{width:0%}to{width:100%}}
      .game-num{font-size:.72rem;color:rgba(242,242,242,.3);margin-top:10px;letter-spacing:1px}
    </style>
    <div class="card">
      <span class="check">✅</span>
      <h2>Score Saved!</h2>
      <div class="score-pill">
        <span class="score-val">${score}</span>
        <span class="score-lbl">pts</span>
      </div>
      <div class="divider"></div>
      <div class="next-lbl">Up next</div>
      <div class="next-name">${GAMES[nextGameIndex].name}</div>
      <div class="bar"><div class="bar-fill"></div></div>
      <div class="game-num">Game ${nextGameIndex + 1} of ${GAMES.length}</div>
    </div>
  `;
}

// ===== LOBBY =====
function showLobby(code) {
  document.getElementById('setupScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('lobbyScreen').classList.add('active');
  document.getElementById('displayCode').textContent = code;
}

function updateLobby(tournament) {
  const playerList = document.getElementById('playerList');
  const players    = Object.values(tournament.players || {});

  playerList.innerHTML = '<h3 style="margin-bottom:15px;">Players Joined:</h3>';
  players.forEach(player => {
    playerList.innerHTML += `
      <div class="player-item">
        <span class="player-name">${player.name}</span>
        <span class="player-status">✓ Ready</span>
      </div>
    `;
  });

  const startBtn = document.getElementById('startTournamentBtn');
  const infoText = document.querySelector('.info-text');

  if (tournament.host === currentPlayer.id && players.length >= 2) {
    startBtn.style.display = 'block';
    infoText.textContent   = `${players.length}/${tournament.maxPlayers} players ready. You can start now!`;
    infoText.style.color      = '#28a745';
    infoText.style.fontWeight = '600';
  } else if (players.length >= 2) {
    infoText.textContent = `${players.length}/${tournament.maxPlayers} players ready. Waiting for host to start...`;
    infoText.style.color = '#667eea';
  } else {
    startBtn.style.display = 'none';
    infoText.textContent   = `Waiting for players... (${players.length}/${tournament.maxPlayers})`;
    infoText.style.color   = '#666';
  }
}

// ===== START TOURNAMENT =====
async function startTournament() {
  if (!currentTournament) return;

  try {
    const shuffle = arr => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const seeds = {};

    const hlResponse = await fetch('https://crickingo.vercel.app/hl.json');
    const hlData     = await hlResponse.json();
    const hlDays     = Object.keys(hlData).filter(k => k.startsWith('day'));
    const hlDayKey   = hlDays[Math.floor(Math.random() * hlDays.length)];
    const hlIndices  = Array.from({ length: hlData[hlDayKey].players.length }, (_, i) => i);
    let   hlSeq      = shuffle(hlIndices);
    while (hlSeq.length < 11) hlSeq = hlSeq.concat(shuffle(hlIndices));
    seeds['hl_day']      = hlDayKey;
    seeds['hl_sequence'] = hlSeq.slice(0, 11);

    await update(ref(db, `tournaments/${currentTournament}/gameData`), seeds);
    await update(ref(db, `tournaments/${currentTournament}`), {
      status:      'playing',
      currentGame: 0
    });

    console.log('✅ Tournament started with seeds:', seeds);
  } catch (error) {
    console.error('Error starting tournament:', error);
    alert('Error starting tournament: ' + error.message);
  }
}

// ===== REDIRECT TO GAME =====
function redirectToGame(gameIndex) {
  localStorage.setItem('currentGameIndex', gameIndex.toString());
  localStorage.setItem('inTournamentGame', 'true');
  window.location.href = `${GAMES[gameIndex].url}?tournament=true`;
}

// ===== CHECK AND FINISH TOURNAMENT =====
async function checkAndFinishTournament(code, playerId) {
  try {
    const snapshot = await get(ref(db, `tournaments/${code}`));
    if (!snapshot.exists()) return false;

    const tournament = snapshot.val();
    const players    = Object.keys(tournament.players || {});
    const scores     = tournament.scores || {};

    const allPlayersFinished = players.every(pid => {
      const playerScores = scores[pid] || {};
      return GAMES.every((_, i) => playerScores[`game${i}`] !== undefined);
    });

    if (allPlayersFinished) {
      await remove(ref(db, `tournaments/${code}/gameData`));
      await update(ref(db, `tournaments/${code}`), { status: 'finished' });
      window.location.href = 'tour-result.html';
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in checkAndFinishTournament:', error);
    return false;
  }
}

// ===== RESULTS =====
function showResults(tournament) {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('lobbyScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.add('active');

  const players = Object.values(tournament.players);
  const scores  = tournament.scores || {};

  const totals = players.map(player => {
    let total = 0;
    const playerScores = scores[player.id] || {};
    for (let i = 0; i < GAMES.length; i++) total += playerScores[`game${i}`] || 0;
    return { player, total };
  });

  totals.sort((a, b) => b.total - a.total);

  const scoreboard = document.getElementById('finalScoreboard');
  scoreboard.innerHTML = '';

  totals.forEach((item, index) => {
    const isWinner = index === 0;
    scoreboard.innerHTML += `
      <div class="score-item ${isWinner ? 'winner' : ''}">
        <div>
          <span class="rank">#${index + 1}</span>
          <span>${item.player.name}</span>
          ${isWinner ? ' 👑' : ''}
        </div>
        <span class="score">${item.total} points</span>
      </div>
    `;
  });
}

// ===== RESET =====
async function resetTournament() {
  currentTournament = null;
  currentPlayer     = null;
  currentGameIndex  = 0;

  localStorage.removeItem('tournamentCode');
  localStorage.removeItem('playerId');
  localStorage.removeItem('playerName');
  localStorage.removeItem('inTournamentGame');
  localStorage.removeItem('currentGameIndex');

  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('setupScreen').classList.add('active');

  document.getElementById('tournamentName').value = 'Epic Tournament';
  document.getElementById('hostName').value  = '';
  document.getElementById('joinCode').value  = '';
  document.getElementById('joinName').value  = '';
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===== HANDLE RETURN FROM GAME =====
window.addEventListener('load', async () => {
  const urlParams   = new URLSearchParams(window.location.search);
  const returnScore = urlParams.get('score');
  const gameId      = urlParams.get('game');

  if (returnScore !== null && gameId !== null) {
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);

    const code       = localStorage.getItem('tournamentCode');
    const playerId   = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    if (!code || !playerId) {
      console.error('Missing tournament data in localStorage');
      document.documentElement.style.visibility = 'visible';
      return;
    }

    currentTournament = code;
    currentPlayer     = { name: playerName, id: playerId };

    // Submit score
    const gameKey = `game${gameId}`;
    await update(ref(db, `tournaments/${code}/scores/${playerId}`), {
      [gameKey]: parseInt(returnScore)
    });

    // Wait for Firebase to sync
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get fresh tournament data
    const snapshot        = await get(ref(db, `tournaments/${code}`));
    const tournament      = snapshot.val();
    const scores          = tournament.scores || {};
    const playerScores    = scores[playerId] || {};

    // Find next game
    let nextGameIndex = -1;
    for (let i = 0; i < GAMES.length; i++) {
      if (playerScores[`game${i}`] === undefined) { nextGameIndex = i; break; }
    }

    if (nextGameIndex !== -1) {
      // Show transition screen (no tournament page flash)
      showTransitionScreen(returnScore, nextGameIndex);
      setTimeout(() => redirectToGame(nextGameIndex), 2200);

    } else {
      // All games done — show waiting screen
      document.documentElement.style.visibility = 'visible';
      showWaitingForOthers(tournament);
      listenToTournament(code);
      setTimeout(async () => {
        await checkAndFinishTournament(code, playerId);
      }, 1000);
    }

    return; // skip normal DOMContentLoaded setup
  }

  // Normal page load — show the tournament setup UI
  document.documentElement.style.visibility = 'visible';
});

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  // Only attach if we're NOT returning from a game
  const params = new URLSearchParams(window.location.search);
  if (params.get('score') !== null) return;

  document.getElementById('createTournamentBtn').addEventListener('click', createTournament);
  document.getElementById('joinTournamentBtn').addEventListener('click', joinTournament);
  document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
  document.getElementById('resetTournamentBtn').addEventListener('click', resetTournament);
});

window.startTournament = startTournament;