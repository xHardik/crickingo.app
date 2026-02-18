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
  { name: "Cricket Bingo", url: "https://crickingo.vercel.app/rivalry.html" },
  { name: "Transfer History", url: "https://crickingo.vercel.app/transfer.html" },
  { name: "Wordle", url: "https://crickingo.vercel.app/wordle.html" },
  { name: "Build Your Team", url: "https://crickingo.vercel.app/builder.html" },
];

let currentTournament = null;
let currentPlayer = null;
let currentGameIndex = 0;

// ===== CREATE TOURNAMENT =====
async function createTournament() {
  const name = document.getElementById('tournamentName').value.trim();
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const hostName = document.getElementById('hostName').value.trim();

  if (!name || !hostName) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const code = generateCode();
    currentPlayer = { name: hostName, id: Date.now().toString() };

    const tournament = {
      name,
      code,
      maxPlayers: playerCount,
      players: { [currentPlayer.id]: currentPlayer },
      currentGame: 0,
      scores: {},
      status: 'waiting',
      host: currentPlayer.id,
      createdAt: Date.now()
    };

    await set(ref(db, `tournaments/${code}`), tournament);
    currentTournament = code;

    localStorage.setItem('tournamentCode', code);
    localStorage.setItem('playerId', currentPlayer.id);
    localStorage.setItem('playerName', currentPlayer.name);

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

  if (!code || !name) {
    alert('Please fill in all fields');
    return;
  }

  const tournamentRef = ref(db, `tournaments/${code}`);
  const snapshot = await get(tournamentRef);

  if (!snapshot.exists()) {
    alert('Tournament not found');
    return;
  }

  const tournament = snapshot.val();
  const playerCount = Object.keys(tournament.players || {}).length;

  if (playerCount >= tournament.maxPlayers) {
    alert('Tournament is full');
    return;
  }

  currentPlayer = { name, id: Date.now().toString() };
  await update(ref(db, `tournaments/${code}/players/${currentPlayer.id}`), currentPlayer);

  currentTournament = code;

  localStorage.setItem('tournamentCode', code);
  localStorage.setItem('playerId', currentPlayer.id);
  localStorage.setItem('playerName', name);

  showLobby(code);
  listenToTournament(code);
}

// ===== LISTENER =====
function listenToTournament(code) {
  const tournamentRef = ref(db, `tournaments/${code}`);
  onValue(tournamentRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const tournament = snapshot.val();
    console.log('🔔 Tournament status:', tournament.status);

    if (tournament.status === 'waiting') {
      updateLobby(tournament);
    } else if (tournament.status === 'playing') {
      const lobbyScreen = document.getElementById('lobbyScreen');
      if (lobbyScreen && lobbyScreen.classList.contains('active')) {
        handlePlayingState(tournament);
      }
    } else if (tournament.status === 'finished') {
      console.log('🏆 Tournament finished! Redirecting...');
      window.location.href = 'tour-result.html';
    }
  });
}

// ===== HANDLE PLAYING STATE =====
function handlePlayingState(tournament) {
  document.getElementById('lobbyScreen').classList.remove('active');

  const scores = tournament.scores || {};
  const playerScores = scores[currentPlayer.id] || {};

  let nextGameIndex = -1;
  for (let i = 0; i < GAMES.length; i++) {
    if (playerScores[`game${i}`] === undefined) {
      nextGameIndex = i;
      break;
    }
  }

  if (nextGameIndex === -1) {
    showWaitingForOthers(tournament);
    return;
  }

  currentGameIndex = nextGameIndex;
  redirectToGame(nextGameIndex);
}

// ===== WAITING SCREEN =====
function showWaitingForOthers(tournament) {
  document.body.innerHTML = `
    <div style="
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; align-items: center; justify-content: center;
      color: white; font-family: system-ui;
    ">
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
        <h1 style="font-size: 2.5em; margin-bottom: 20px;">All Games Complete!</h1>
        <p style="font-size: 1.3em; margin-bottom: 30px; opacity: 0.9;">
          You've finished all ${GAMES.length} games!
        </p>
        <div style="background: rgba(255,255,255,0.2); padding: 30px; border-radius: 16px;">
          <p style="font-size: 1.1em; margin-bottom: 15px;">⏳ Waiting for other players to finish...</p>
          <div style="
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%; width: 50px; height: 50px;
            animation: spin 1s linear infinite; margin: 20px auto 0;
          "></div>
          <p style="font-size: 0.9em; margin-top: 20px; opacity: 0.8;">
            You'll be automatically redirected when everyone is done!
          </p>
        </div>
      </div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
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
  const players = Object.values(tournament.players || {});

  playerList.innerHTML = '<h3 style="margin-bottom: 15px;">Players Joined:</h3>';
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
    infoText.textContent = `${players.length}/${tournament.maxPlayers} players ready. You can start now!`;
    infoText.style.color = '#28a745';
    infoText.style.fontWeight = '600';
  } else if (players.length >= 2) {
    infoText.textContent = `${players.length}/${tournament.maxPlayers} players ready. Waiting for host to start...`;
    infoText.style.color = '#667eea';
  } else {
    startBtn.style.display = 'none';
    infoText.textContent = `Waiting for players... (${players.length}/${tournament.maxPlayers})`;
    infoText.style.color = '#666';
  }
}

// ===== START TOURNAMENT =====
async function startTournament() {
  if (!currentTournament) return;

  try {
    // Pre-generate seeds for all games upfront
    const seeds = {};
    const shuffle = arr => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Game 0: Higher or Lower
    const hlResponse = await fetch('https://crickingo.vercel.app/hl.json');
    const hlData = await hlResponse.json();
    const hlDays = Object.keys(hlData).filter(k => k.startsWith('day'));
    const hlDayKey = hlDays[Math.floor(Math.random() * hlDays.length)];
    const hlIndices = Array.from({ length: hlData[hlDayKey].players.length }, (_, i) => i);
    let hlSeq = shuffle(hlIndices);
    while (hlSeq.length < 11) hlSeq = hlSeq.concat(shuffle(hlIndices));
    seeds['hl_day'] = hlDayKey;
    seeds['hl_sequence'] = hlSeq.slice(0, 11);

    // Add seeds for other games here as you fix them
    // seeds['wordle_word'] = ...
    // seeds['transfer_sequence'] = ...

    await update(ref(db, `tournaments/${currentTournament}/gameData`), seeds);
    await update(ref(db, `tournaments/${currentTournament}`), {
      status: 'playing',
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
  const gameUrl = GAMES[gameIndex].url;

  localStorage.setItem('currentGameIndex', gameIndex.toString());
  localStorage.setItem('inTournamentGame', 'true');

  console.log('🎮 Redirecting to game', gameIndex, ':', gameUrl);
  window.location.href = `${gameUrl}?tournament=true`;
}

// ===== CHECK AND FINISH TOURNAMENT =====
async function checkAndFinishTournament(code, playerId) {
  try {
    const snapshot = await get(ref(db, `tournaments/${code}`));
    if (!snapshot.exists()) return false;

    const tournament = snapshot.val();
    const players = Object.keys(tournament.players || {});
    const scores = tournament.scores || {};

    // Check if EVERY player has a score for EVERY game
    const allPlayersFinished = players.every(pid => {
      const playerScores = scores[pid] || {};
      return GAMES.every((_, i) => playerScores[`game${i}`] !== undefined);
    });

    console.log('🔍 All players finished?', allPlayersFinished);
    console.log('Players:', players);
    console.log('Scores:', scores);

    if (allPlayersFinished) {
      console.log('✅ ALL PLAYERS FINISHED! Ending tournament...');

      // Clean up game seed data
      await remove(ref(db, `tournaments/${code}/gameData`));

      // Mark tournament as finished — this triggers all listeners to redirect
      await update(ref(db, `tournaments/${code}`), { status: 'finished' });

      console.log('✅ Tournament marked as finished');
      window.location.href = 'tour-result.html';
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error in checkAndFinishTournament:', error);
    return false;
  }
}

// ===== RESULTS =====
function showResults(tournament) {
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('lobbyScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.add('active');

  const players = Object.values(tournament.players);
  const scores = tournament.scores || {};

  const totals = players.map(player => {
    let total = 0;
    const playerScores = scores[player.id] || {};
    for (let i = 0; i < GAMES.length; i++) {
      total += playerScores[`game${i}`] || 0;
    }
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
  currentPlayer = null;
  currentGameIndex = 0;

  localStorage.removeItem('tournamentCode');
  localStorage.removeItem('playerId');
  localStorage.removeItem('playerName');
  localStorage.removeItem('inTournamentGame');
  localStorage.removeItem('currentGameIndex');

  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('setupScreen').classList.add('active');

  document.getElementById('tournamentName').value = 'Epic Tournament';
  document.getElementById('hostName').value = '';
  document.getElementById('joinCode').value = '';
  document.getElementById('joinName').value = '';
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===== HANDLE RETURN FROM GAME =====
window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const returnScore = urlParams.get('score');
  const gameId = urlParams.get('game');

  console.log('🌐 Page loaded. Score:', returnScore, 'Game:', gameId);

  if (returnScore !== null && gameId !== null) {
    console.log(`🎮 Returning from game ${gameId} with score ${returnScore}`);

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    const code = localStorage.getItem('tournamentCode');
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    console.log('💾 localStorage:', { code, playerId, playerName });

    if (!code || !playerId) {
      console.error('❌ Missing tournament data in localStorage!');
      return;
    }

    currentTournament = code;
    currentPlayer = { name: playerName, id: playerId };

    // Submit score
    const gameKey = `game${gameId}`;
    console.log(`💾 Submitting score for ${gameKey}:`, returnScore);

    await update(ref(db, `tournaments/${code}/scores/${playerId}`), {
      [gameKey]: parseInt(returnScore)
    });

    console.log(`✅ Score submitted`);

    // Wait for Firebase to sync
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get fresh tournament data
    const updatedSnapshot = await get(ref(db, `tournaments/${code}`));
    const updatedTournament = updatedSnapshot.val();
    const scores = updatedTournament.scores || {};
    const playerScores = scores[playerId] || {};

    console.log('📊 My scores so far:', playerScores);

    // Find next game for this player
    let nextGameIndex = -1;
    for (let i = 0; i < GAMES.length; i++) {
      if (playerScores[`game${i}`] === undefined) {
        nextGameIndex = i;
        break;
      }
    }

    console.log('🎯 Next game index:', nextGameIndex);

    if (nextGameIndex !== -1) {
      // Show transition screen then go to next game
      console.log(`➡️ Next: ${GAMES[nextGameIndex].name}`);

      document.body.innerHTML = `
        <div style="
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: system-ui;
        ">
          <div style="text-align: center;">
            <div style="font-size: 3em; margin-bottom: 20px;">✅</div>
            <h2 style="font-size: 2em; margin-bottom: 10px;">Score Saved!</h2>
            <p style="font-size: 1.3em; margin-bottom: 5px;">${returnScore} points</p>
            <p style="font-size: 1.1em; opacity: 0.9; margin-top: 20px;">
              Next: <strong>${GAMES[nextGameIndex].name}</strong>
            </p>
            <div style="margin-top: 30px;">
              <div style="
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid white;
                border-radius: 50%; width: 40px; height: 40px;
                animation: spin 1s linear infinite; margin: 0 auto;
              "></div>
            </div>
          </div>
        </div>
        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `;

      setTimeout(() => redirectToGame(nextGameIndex), 2000);

    } else {
      // This player finished all games
      console.log('🎉 THIS PLAYER FINISHED ALL GAMES!');

      showWaitingForOthers(updatedTournament);

      // Keep listening for tournament to finish
      listenToTournament(code);

      // Check if everyone is done
      setTimeout(async () => {
        await checkAndFinishTournament(code, playerId);
      }, 1000);
    }
  }
});

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('createTournamentBtn').addEventListener('click', createTournament);
  document.getElementById('joinTournamentBtn').addEventListener('click', joinTournament);
  document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
  document.getElementById('resetTournamentBtn').addEventListener('click', resetTournament);
});

window.startTournament = startTournament;