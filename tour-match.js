
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getDatabase, ref, set, onValue, update, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

    // REPLACE WITH YOUR FIREBASE CONFIG
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

console.log('Firebase initialized successfully');

// Add this to test the connection
window.testFirebase = async function() {
  try {
    const testRef = ref(db, 'test');
    await set(testRef, { test: 'working', timestamp: Date.now() });
    console.log('Firebase connection test: SUCCESS');
    alert('Firebase is working!');
  } catch (error) {
    console.error('Firebase connection test FAILED:', error);
    alert('Firebase Error: ' + error.message);
  }
};

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

    window.createTournament = async function() {
  console.log('===== CREATE TOURNAMENT BUTTON CLICKED =====');
  
  const name = document.getElementById('tournamentName').value.trim();
  const playerCount = parseInt(document.getElementById('playerCount').value);
  const hostName = document.getElementById('hostName').value.trim();

  console.log('Name:', name);
  console.log('Player Count:', playerCount);
  console.log('Host Name:', hostName);

  if (!name || !hostName) {
    console.log('ERROR: Missing fields');
    alert('Please fill in all fields');
    return;
  }

  try {
    console.log('Step 1: Generating code...');
    const code = generateCode();
    console.log('Generated code:', code);
    
    console.log('Step 2: Creating player object...');
    currentPlayer = { name: hostName, id: Date.now().toString() };
    console.log('Current player:', currentPlayer);

    console.log('Step 3: Creating tournament object...');
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
    console.log('Tournament object:', tournament);

    console.log('Step 4: Saving to Firebase...');
    await set(ref(db, `tournaments/${code}`), tournament);
    console.log('✅ Tournament saved successfully!');
    
    currentTournament = code;
    
    console.log('Step 5: Showing lobby...');
    showLobby(code);
    
    console.log('Step 6: Setting up listener...');
    listenToTournament(code);
    
    console.log('===== TOURNAMENT CREATED SUCCESSFULLY =====');
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    alert('Error creating tournament: ' + error.message);
  }
};

    window.joinTournament = async function() {
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
      showLobby(code);
      listenToTournament(code);
    };

    function listenToTournament(code) {
      const tournamentRef = ref(db, `tournaments/${code}`);
      onValue(tournamentRef, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const tournament = snapshot.val();
        updateLobby(tournament);

        if (tournament.status === 'playing') {
          currentGameIndex = tournament.currentGame;
          showGame(tournament);
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

      const startBtn = document.getElementById('startBtn');
      if (tournament.host === currentPlayer.id && players.length === tournament.maxPlayers) {
        startBtn.style.display = 'block';
      }
    }

    window.startTournament = async function() {
      if (!currentTournament) return;
      
      await update(ref(db, `tournaments/${currentTournament}`), {
        status: 'playing',
        currentGame: 0
      });
    };

    function showGame(tournament) {
      document.getElementById('lobbyScreen').classList.remove('active');
      document.getElementById('resultsScreen').classList.remove('active');
      document.getElementById('gameScreen').classList.add('active');

      const gameIndex = tournament.currentGame;
      document.getElementById('gameFrame').src = GAMES[gameIndex].url;

      updateGameProgress(tournament);
      document.getElementById('scoreInput').value = '';
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

    window.submitScore = async function() {
      const score = parseInt(document.getElementById('scoreInput').value);
      
      if (isNaN(score) || score < 0) {
        alert('Please enter a valid score');
        return;
      }

      const gameKey = `game${currentGameIndex}`;
      await update(ref(db, `tournaments/${currentTournament}/scores/${currentPlayer.id}`), {
        [gameKey]: score
      });

      const tournamentRef = ref(db, `tournaments/${currentTournament}`);
      const snapshot = await get(tournamentRef);
      const tournament = snapshot.val();
      
      const allScores = tournament.scores || {};
      const players = Object.keys(tournament.players);
      let allSubmitted = true;

      for (let playerId of players) {
        if (!allScores[playerId] || allScores[playerId][gameKey] === undefined) {
          allSubmitted = false;
          break;
        }
      }

      if (allSubmitted) {
        if (currentGameIndex < GAMES.length - 1) {
          await update(ref(db, `tournaments/${currentTournament}`), {
            currentGame: currentGameIndex + 1
          });
        } else {
          await update(ref(db, `tournaments/${currentTournament}`), {
            status: 'finished'
          });
        }
      } else {
        alert('Score submitted! Waiting for other players...');
      }
    };

    function showResults(tournament) {
      document.getElementById('gameScreen').classList.remove('active');
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

    window.resetTournament = function() {
      currentTournament = null;
      currentPlayer = null;
      currentGameIndex = 0;
      
      document.getElementById('resultsScreen').classList.remove('active');
      document.getElementById('setupScreen').classList.add('active');
      
      document.getElementById('tournamentName').value = 'Epic Tournament';
      document.getElementById('hostName').value = '';
      document.getElementById('joinCode').value = '';
      document.getElementById('joinName').value = '';
    };

    function generateCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
