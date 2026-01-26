import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, update, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

// CONFIGURE YOUR GAME URLS HERE
const GAMES = [
  { name: "Higher Or Lower", url: "https://crickingo.vercel.app/hl.html" },
  { name: "Cricket Bingo", url: "https://crickingo.vercel.app/rivalry.html" },/*
  { name: "Transfer History", url: "https://crickingo.vercel.app/transfer.html" },
  { name: "Build Your Team", url: "https://crickingo.vercel.app/builder.html" },
  { name: "Wordle", url: "https://crickingo.vercel.app/wordle.html" }*/
];

let currentTournament = null;
let currentPlayer = null;
let currentGameIndex = 0;

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
      players: {
        [currentPlayer.id]: currentPlayer
      },
      currentGame: 0,
      scores: {},
      status: 'waiting',
      host: currentPlayer.id,
      createdAt: Date.now()
    };

    await set(ref(db, `tournaments/${code}`), tournament);
    currentTournament = code;
    
    // Store tournament data in localStorage for game pages
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
  
  // Store tournament data in localStorage
  localStorage.setItem('tournamentCode', code);
  localStorage.setItem('playerId', currentPlayer.id);
  localStorage.setItem('playerName', name);
  
  showLobby(code);
  listenToTournament(code);
}

function listenToTournament(code) {
  const tournamentRef = ref(db, `tournaments/${code}`);
  onValue(tournamentRef, (snapshot) => {
    if (!snapshot.exists()) return;
    
    const tournament = snapshot.val();
    
    console.log('🔔 Listener triggered - Tournament status:', tournament.status);
    
    if (tournament.status === 'waiting') {
      updateLobby(tournament);
    } else if (tournament.status === 'playing') {
      handlePlayingState(tournament);
    } else if (tournament.status === 'finished') {
      console.log('🏆 Status is FINISHED! Redirecting to results...');
      // Redirect ALL players to results page
      window.location.href = 'tour-result.html';
    }
  });
}

function handlePlayingState(tournament) {
  document.getElementById('lobbyScreen').classList.remove('active');
  
  const scores = tournament.scores || {};
  const playerScores = scores[currentPlayer.id] || {};
  
  // Find which game this player should play next
  let nextGameIndex = -1;
  for (let i = 0; i < GAMES.length; i++) {
    const gameKey = `game${i}`;
    if (playerScores[gameKey] === undefined) {
      nextGameIndex = i;
      break;
    }
  }
  
  // If player has finished all games, show waiting screen
  if (nextGameIndex === -1) {
    showWaitingForOthers(tournament);
    return;
  }
  
  // Redirect to the next game the player needs to play
  currentGameIndex = nextGameIndex;
  redirectToGame(nextGameIndex);
}

function showWaitingForOthers(tournament) {
  console.log('⏳ Player finished all games, showing waiting screen...');
  
  // Show a simple waiting screen
  document.getElementById('lobbyScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.remove('active');
  
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui;
    ">
      <div style="text-align: center; max-width: 500px; padding: 40px;">
        <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
        <h1 style="font-size: 2.5em; margin-bottom: 20px;">All Games Complete!</h1>
        <p style="font-size: 1.3em; margin-bottom: 30px; opacity: 0.9;">
          You've finished all ${GAMES.length} games!
        </p>
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 30px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        ">
          <p style="font-size: 1.1em; margin-bottom: 15px;">⏳ Waiting for other players to finish...</p>
          <div class="spinner" style="
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto 0;
          "></div>
          <p style="font-size: 0.9em; margin-top: 20px; opacity: 0.8;">
            You'll be automatically redirected to results when everyone is done!
          </p>
        </div>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  // The listener is still active and will redirect when status changes to 'finished'
}

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

async function startTournament() {
  if (!currentTournament) return;
  
  await update(ref(db, `tournaments/${currentTournament}`), {
    status: 'playing',
    currentGame: 0
  });
}

function redirectToGame(gameIndex) {
  const gameUrl = GAMES[gameIndex].url;
  localStorage.setItem('inTournamentGame', 'true');
  window.location.href = gameUrl;
}

function updateGameProgress(tournament) {
  const progressDiv = document.getElementById('gameProgress');
  progressDiv.innerHTML = '<h3 style="margin-bottom: 15px;">Tournament Progress:</h3>';

  const playerScores = tournament.scores?.[currentPlayer.id] || {};

  GAMES.forEach((game, index) => {
    const gameKey = `game${index}`;
    let status = 'pending';
    let statusText = 'Pending';
    let score = '';

    if (playerScores[gameKey] !== undefined) {
      status = 'completed';
      statusText = 'Completed';
      score = ` - ${playerScores[gameKey]} pts`;
    } else if (index === currentGameIndex) {
      status = 'active';
      statusText = 'Playing Now';
    }

    progressDiv.innerHTML += `
      <div class="game-item ${status}">
        <div class="game-number">${index + 1}</div>
        <div class="game-info">
          <div class="game-name">${game.name}${score}</div>
          <div class="game-status">${statusText}</div>
        </div>
      </div>
    `;
  });
}

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

async function resetTournament() {
  currentTournament = null;
  currentPlayer = null;
  currentGameIndex = 0;
  
  localStorage.removeItem('tournamentCode');
  localStorage.removeItem('playerId');
  localStorage.removeItem('playerName');
  localStorage.removeItem('inTournamentGame');
  
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

// Helper function to check if all players finished
async function checkAndFinishTournament(code, playerId) {
  console.log('🔍 Checking if all players finished...');
  
  const tournamentRef = ref(db, `tournaments/${code}`);
  const snapshot = await get(tournamentRef);
  
  if (!snapshot.exists()) {
    console.error('❌ Tournament not found!');
    return false;
  }
  
  const tournament = snapshot.val();
  const players = Object.keys(tournament.players);
  const allScores = tournament.scores || {};
  
  console.log('👥 Total players:', players.length);
  console.log('📊 Scores data:', allScores);
  
  // Check if ALL players have completed ALL games
  let allPlayersFinished = true;
  for (let pId of players) {
    const pScores = allScores[pId] || {};
    console.log(`Player ${pId} scores:`, pScores);
    
    for (let i = 0; i < GAMES.length; i++) {
      const gameKey = `game${i}`;
      if (pScores[gameKey] === undefined) {
        console.log(`❌ Player ${pId} missing ${gameKey}`);
        allPlayersFinished = false;
        break;
      }
    }
    if (!allPlayersFinished) break;
  }
  
  if (allPlayersFinished) {
    console.log('✅ ALL PLAYERS FINISHED ALL GAMES!');
    
    // Mark tournament as finished
    await update(ref(db, `tournaments/${code}`), {
      status: 'finished'
    });
    
    console.log('✅ Tournament status updated to FINISHED');
    return true;
  } else {
    console.log('⏳ Some players still playing...');
    return false;
  }
}

// Check if returning from a game
window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const returnScore = urlParams.get('score');
  const gameId = urlParams.get('game');
  
  if (returnScore !== null && gameId !== null) {
    console.log(`🎮 Returning from game ${gameId} with score ${returnScore}`);
    
    window.history.replaceState({}, document.title, window.location.pathname);
    
    const code = localStorage.getItem('tournamentCode');
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');
    
    if (code && playerId) {
      currentTournament = code;
      currentPlayer = { name: playerName, id: playerId };
      
      const tournamentRef = ref(db, `tournaments/${code}`);
      
      // Submit score
      const gameKey = `game${gameId}`;
      await update(ref(db, `tournaments/${code}/scores/${playerId}`), {
        [gameKey]: parseInt(returnScore)
      });
      
      console.log(`✅ Score ${returnScore} submitted for ${gameKey}`);
      
      // Wait a moment for Firebase to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get FRESH tournament data
      const updatedSnapshot = await get(tournamentRef);
      const updatedTournament = updatedSnapshot.val();
      const scores = updatedTournament.scores || {};
      const playerScores = scores[playerId] || {};
      
      // Find next game for THIS player
      let nextGameIndex = -1;
      for (let i = 0; i < GAMES.length; i++) {
        const nextGameKey = `game${i}`;
        if (playerScores[nextGameKey] === undefined) {
          nextGameIndex = i;
          break;
        }
      }
      
      if (nextGameIndex !== -1) {
        // More games to play - show transition and redirect
        console.log(`➡️ Next game: ${GAMES[nextGameIndex].name}`);
        
        document.body.innerHTML = `
          <div style="
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: system-ui;
          ">
            <div style="text-align: center;">
              <div style="font-size: 3em; margin-bottom: 20px;">✅</div>
              <h2 style="font-size: 2em; margin-bottom: 10px;">Score Saved!</h2>
              <p style="font-size: 1.3em; margin-bottom: 5px;">${returnScore} points</p>
              <p style="font-size: 1.1em; opacity: 0.9; margin-top: 20px;">
                Next: <strong>${GAMES[nextGameIndex].name}</strong>
              </p>
              <div style="margin-top: 30px;">
                <div class="spinner" style="
                  border: 4px solid rgba(255,255,255,0.3);
                  border-top: 4px solid white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  margin: 0 auto;
                "></div>
              </div>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        
        setTimeout(() => {
          redirectToGame(nextGameIndex);
        }, 1500);
        
      } else {
        // This player finished all games!
        console.log('🎉 This player finished all games!');
        
        // Check if tournament should be marked as finished
        const tournamentFinished = await checkAndFinishTournament(code, playerId);
        
        if (tournamentFinished) {
          console.log('🏆 Tournament complete! Redirecting to results...');
          // Give Firebase a moment to propagate the status change
          setTimeout(() => {
            window.location.href = 'tour-result.html';
          }, 1000);
        } else {
          console.log('⏳ Starting listener for tournament updates...');
          // Show waiting screen and start listener
          showWaitingForOthers(updatedTournament);
          listenToTournament(code);
        }
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('createTournamentBtn').addEventListener('click', createTournament);
  document.getElementById('joinTournamentBtn').addEventListener('click', joinTournament);
  document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
  document.getElementById('resetTournamentBtn').addEventListener('click', resetTournament);
});

window.startTournament = startTournament;