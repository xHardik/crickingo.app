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
  { name: "Cricket Bingo", url: "https://crickingo.vercel.app/rivalry.html" },
  { name: "Transfer History", url: "https://crickingo.vercel.app/transfer.html" },
  { name: "Build Your Team", url: "https://crickingo.vercel.app/builder.html" },
  { name: "Wordle", url: "https://crickingo.vercel.app/wordle.html" }
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
    updateLobby(tournament);

    if (tournament.status === 'playing') {
      currentGameIndex = tournament.currentGame;
      
      // Check if current player has submitted score for current game
      const gameKey = `game${currentGameIndex}`;
      const playerScore = tournament.scores?.[currentPlayer.id]?.[gameKey];
      
      if (playerScore === undefined) {
        // Redirect to game
        redirectToGame(tournament);
      } else {
        // Show waiting screen
        showWaitingScreen(tournament);
      }
    } else if (tournament.status === 'finished') {
      showResults(tournament);
    }
  });
}

function showLobby(code) {
  document.getElementById('setupScreen').classList.remove('active');
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

function redirectToGame(tournament) {
  const gameIndex = tournament.currentGame;
  const gameUrl = GAMES[gameIndex].url;
  
  // Set tournament mode flag BEFORE redirecting
  localStorage.setItem('inTournamentGame', 'true');
  
  // Redirect to game page - it will return here after completion
  window.location.href = gameUrl;
}

function showWaitingScreen(tournament) {
  document.getElementById('lobbyScreen').classList.remove('active');
  document.getElementById('resultsScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  const gameIndex = tournament.currentGame;
  updateGameProgress(tournament);
  
  // Show waiting message
  document.getElementById('gameFrame').style.display = 'none';
  document.getElementById('scoreInputSection').style.display = 'none';
  
  const waitingDiv = document.getElementById('waitingMessage');
  waitingDiv.style.display = 'block';
  
  const players = Object.values(tournament.players);
  const scores = tournament.scores || {};
  const gameKey = `game${gameIndex}`;
  
  let waitingFor = [];
  players.forEach(player => {
    if (!scores[player.id] || scores[player.id][gameKey] === undefined) {
      waitingFor.push(player.name);
    }
  });
  
  waitingDiv.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <h2 style="color: #667eea; margin-bottom: 20px;">✓ Score Submitted!</h2>
      <p style="font-size: 18px; color: #666;">Waiting for other players to finish...</p>
      <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
        <p style="font-weight: 600; margin-bottom: 10px;">Waiting for:</p>
        ${waitingFor.map(name => `<p style="color: #667eea;">• ${name}</p>`).join('')}
      </div>
    </div>
  `;
}

function updateGameProgress(tournament) {
  const progressDiv = document.getElementById('gameProgress');
  progressDiv.innerHTML = '<h3 style="margin-bottom: 15px;">Tournament Progress:</h3>';

  GAMES.forEach((game, index) => {
    let status = 'pending';
    let statusText = 'Pending';

    if (index < tournament.currentGame) {
      status = 'completed';
      statusText = 'Completed';
    } else if (index === tournament.currentGame) {
      status = 'active';
      statusText = 'Playing Now';
    }

    progressDiv.innerHTML += `
      <div class="game-item ${status}">
        <div class="game-number">${index + 1}</div>
        <div class="game-info">
          <div class="game-name">${game.name}</div>
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

// Check if returning from a game
window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const returnScore = urlParams.get('score');
  
  if (returnScore) {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    const code = localStorage.getItem('tournamentCode');
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');
    
    if (code && playerId) {
      // Restore tournament state
      currentTournament = code;
      currentPlayer = { name: playerName, id: playerId };
      
      // Get current game index
      const tournamentRef = ref(db, `tournaments/${code}`);
      const snapshot = await get(tournamentRef);
      
      if (snapshot.exists()) {
        const tournament = snapshot.val();
        currentGameIndex = tournament.currentGame;
        
        // Submit the score
        const gameKey = `game${currentGameIndex}`;
        await update(ref(db, `tournaments/${code}/scores/${playerId}`), {
          [gameKey]: parseInt(returnScore)
        });
        
        // Check if all players submitted
        const allScores = tournament.scores || {};
        const players = Object.keys(tournament.players);
        let allSubmitted = true;

        for (let pId of players) {
          if (!allScores[pId] || allScores[pId][gameKey] === undefined) {
            if (pId !== playerId) {
              allSubmitted = false;
              break;
            }
          }
        }

        if (allSubmitted) {
          if (currentGameIndex < GAMES.length - 1) {
            await update(ref(db, `tournaments/${code}`), {
              currentGame: currentGameIndex + 1
            });
          } else {
            await update(ref(db, `tournaments/${code}`), {
              status: 'finished'
            });
          }
        }
        
        // Start listening to tournament updates
        listenToTournament(code);
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