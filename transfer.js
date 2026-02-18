// transfer.js - Transfer History Game with Tournament Integration

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
const db = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' && 
                       urlParams.get('tournament') === 'true';

function showTournamentInfo() {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'tournamentInfo';
    infoDiv.style.cssText = `
        position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; padding: 12px 25px; border-radius: 25px;
        font-weight: 700; z-index: 1000;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        text-align: center; font-size: 0.9em;
    `;
    infoDiv.innerHTML = '🏆 Tournament Mode - Play Your Best!';
    document.body.insertBefore(infoDiv, document.body.firstChild);
}

let gameData = {};
let currentGame = null;
let currentPlayerIndex = 0;
let currentSelectedPlayer = null;
let totalScore = 0;
let correctAnswers = 0;
let currentStreak = 0;
let gameActive = false;

const POINTS = { FIRST: 250, SECOND: 300, THIRD: 350, COMPLETION: 100 };

async function loadData() {
  try {
    const response = await fetch('./transfers.json');
    if (!response.ok) throw new Error('HTTP error: ' + response.status);
    gameData = await response.json();
    if (!gameData.allPlayers) throw new Error('Missing allPlayers');
    console.log('Data loaded, players:', gameData.allPlayers.length);
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error loading game data: ' + error.message);
  }
}

function getDateFromURL() {
  return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) modal.style.display = 'flex';
}

function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) modal.style.display = 'none';
}

async function initGame() {
  await loadData();

  if (urlParams.get('tournament') !== 'true') localStorage.removeItem('inTournamentGame');
  if (!gameData || !gameData.allPlayers) return;

  showRulesModal();
  if (isInTournament) showTournamentInfo();

  // ===== TOURNAMENT SEED LOGIC =====
  if (isInTournament) {
    const tournamentCode = localStorage.getItem('tournamentCode');
    const seedPath = 'tournaments/' + tournamentCode + '/gameData/transfer_key';

    try {
      const snapshot = await get(ref(db, seedPath));
      if (snapshot.exists()) {
        const storedKey = snapshot.val();
        currentGame = gameData[storedKey];
        console.log('✅ Read existing transfer seed:', storedKey);
      } else {
        const availableGames = Object.keys(gameData).filter(k => k.startsWith('transfer'));
        const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
        currentGame = gameData[randomKey];
        await set(ref(db, seedPath), randomKey);
        console.log('🎲 Wrote new transfer seed:', randomKey);
      }
    } catch (err) {
      console.error('Firebase error:', err);
      const availableGames = Object.keys(gameData).filter(k => k.startsWith('transfer'));
      currentGame = gameData[availableGames[Math.floor(Math.random() * availableGames.length)]];
    }
  } else {
    const selectedDate = getDateFromURL();
    const gameKey = 'transfer-' + selectedDate;
    currentGame = gameData[gameKey] || gameData['transfer'];
    console.log('Normal mode:', gameKey);
  }
  // ===== END SEED LOGIC =====

  if (!currentGame || !currentGame.players) {
    alert('No transfer history available.');
    backToMenu();
    return;
  }

  currentPlayerIndex = 0;
  currentSelectedPlayer = null;
  totalScore = 0;
  correctAnswers = 0;
  currentStreak = 0;
  gameActive = true;

  document.querySelector('.game-info h2').innerText = currentGame.title;
  document.querySelector('.game-info .subtitle').innerText = currentGame.subtitle;

  addScoreDisplay();
  showCurrentPlayer();
  setupSearchInput();
  updateScoreDisplay();
}

function addScoreDisplay() {
  const playerBox = document.querySelector('.player-box');
  if (playerBox && !document.getElementById('currentScore')) {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'currentScore';
    scoreDiv.style.cssText = 'margin-top: 15px; padding: 15px; background: linear-gradient(135deg, rgba(255,193,7,0.2) 0%, rgba(255,152,0,0.2) 100%); border: 2px solid rgba(255,193,7,0.4); border-radius: 15px; text-align: center;';
    playerBox.appendChild(scoreDiv);
  }
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('currentScore');
  if (scoreDisplay) {
    scoreDisplay.innerHTML =
      '<div style="font-size: 1.5em; font-weight: 900; color: #ffd700;">💰 ' + totalScore + ' pts</div>' +
      '<div style="font-size: 0.9em; color: rgba(255,255,255,0.8); margin-top: 5px;">' +
      (currentStreak > 0 ? '🔥 ' + currentStreak + ' Streak' : 'Build a streak!') + '</div>';
  }
}

function showCurrentPlayer() {
  if (currentPlayerIndex >= currentGame.players.length) { endGame(); return; }

  const player = currentGame.players[currentPlayerIndex];
  document.getElementById('currentPlayer').innerText = 'Player ' + (currentPlayerIndex + 1);
  document.getElementById('playerCount').innerText = 'Player ' + (currentPlayerIndex + 1) + ' of ' + currentGame.players.length;

  const transferList = document.getElementById('transferList');
  transferList.innerHTML = '';
  player.transfers.forEach(transfer => {
    const item = document.createElement('div');
    item.className = 'transfer-item';
    item.innerHTML = '<div class="year">' + transfer.year + '</div><div class="team">' + transfer.team + '</div>';
    transferList.appendChild(item);
  });

  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback';
  feedback.style.display = 'none';

  document.getElementById('searchInput').value = '';
  currentSelectedPlayer = null;
  updateAttemptsDisplay();
}

function updateAttemptsDisplay() {
  document.getElementById('attempts').innerHTML = 'Correct: ' + correctAnswers + ' / ' + currentGame.players.length;
}

function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const dropdownList = document.getElementById('dropdownList');
  const allPlayers = gameData.allPlayers || [];

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    if (query.length === 0) { dropdownList.classList.remove('active'); return; }

    const matches = allPlayers.filter(p => p.toLowerCase().includes(query));
    dropdownList.innerHTML = '';

    if (matches.length === 0) {
      dropdownList.innerHTML = '<div class="no-results">No players found</div>';
    } else {
      matches.forEach(player => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerText = player;
        item.addEventListener('click', () => {
          searchInput.value = player;
          currentSelectedPlayer = player;
          dropdownList.classList.remove('active');
        });
        dropdownList.appendChild(item);
      });
    }
    dropdownList.classList.add('active');
  });

  searchInput.addEventListener('focus', () => { if (searchInput.value.length > 0) dropdownList.classList.add('active'); });
  searchInput.addEventListener('blur', () => { setTimeout(() => dropdownList.classList.remove('active'), 200); });
}

function submitGuess() {
  if (!gameActive) return;
  if (!currentSelectedPlayer) { alert('Please select a player first!'); return; }

  const currentPlayer = currentGame.players[currentPlayerIndex];
  const feedback = document.getElementById('feedback');

  if (currentSelectedPlayer === currentPlayer.name) {
    correctAnswers++;
    currentStreak++;

    let pointsEarned = 0;
    if (currentStreak === 1) pointsEarned = POINTS.FIRST;
    else if (currentStreak === 2) pointsEarned = POINTS.SECOND;
    else if (currentStreak === 3) pointsEarned = POINTS.THIRD;

    totalScore += pointsEarned;
    feedback.className = 'feedback correct';
    feedback.innerText = '✅ Correct! +' + pointsEarned + ' points';
    feedback.style.display = 'block';

    if (currentStreak === 2) showStreakNotification('🔥 Streak Started! +50 Bonus!');
    else if (currentStreak === 3) showStreakNotification('🔥🔥 Amazing Streak! +100 Bonus!');

    updateScoreDisplay();
    setTimeout(() => { currentPlayerIndex++; showCurrentPlayer(); }, 1500);
  } else {
    currentStreak = 0;
    feedback.className = 'feedback wrong';
    feedback.innerText = '❌ Wrong! It was ' + currentPlayer.name;
    feedback.style.display = 'block';
    updateScoreDisplay();
    setTimeout(() => { currentPlayerIndex++; showCurrentPlayer(); }, 2000);
  }
}

function showStreakNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #ff6b9d 0%, #ffa400 100%); color: white; padding: 30px 40px; border-radius: 20px; font-size: 1.5em; font-weight: 900; z-index: 2000; box-shadow: 0 10px 40px rgba(255,107,157,0.6); text-align: center;';
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 1500);
}

function skipTransferPlayer() {
  if (!gameActive) return;
  const currentPlayer = currentGame.players[currentPlayerIndex];
  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback wrong';
  feedback.innerText = '⏭️ Skipped! It was ' + currentPlayer.name;
  feedback.style.display = 'block';
  currentStreak = 0;
  updateScoreDisplay();
  setTimeout(() => { currentPlayerIndex++; showCurrentPlayer(); }, 1500);
}

function endGame() {
  gameActive = false;

  let completionBonus = 0;
  if (correctAnswers === 3 && currentStreak === 3) {
    completionBonus = POINTS.COMPLETION;
    totalScore += completionBonus;
  }

  const finalScore = totalScore;
  const scoreBreakdown =
    '<div style="text-align: left; margin: 20px auto; max-width: 400px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">' +
    '<div style="font-size: 1.1em; font-weight: 700; margin-bottom: 15px; text-align: center;">📊 Score Breakdown</div>' +
    '<div style="margin: 8px 0;">✅ Correct Answers: <span style="float: right; color: #4caf50;">' + correctAnswers + ' / 3</span></div>' +
    (correctAnswers >= 1 ? '<div style="margin: 8px 0;">1st Correct: <span style="float: right; color: #ffd700;">+250</span></div>' : '') +
    (correctAnswers >= 2 ? '<div style="margin: 8px 0;">2nd Correct (Streak): <span style="float: right; color: #ff9800;">+300</span></div>' : '') +
    (correctAnswers >= 3 ? '<div style="margin: 8px 0;">3rd Correct (Streak): <span style="float: right; color: #ff6b9d;">+350</span></div>' : '') +
    (completionBonus > 0 ? '<div style="margin: 8px 0;">🎯 Perfect Completion: <span style="float: right; color: #9c27b0;">+' + completionBonus + '</span></div>' : '') +
    '<hr style="border: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">' +
    '<div style="font-size: 1.3em; font-weight: 900; margin-top: 10px;">Total: <span style="float: right; color: #ffd700;">' + finalScore + '</span></div></div>';

  document.getElementById('scoreText').innerText = finalScore + ' / 1000';
  document.getElementById('resultPhrase').innerHTML = getResultPhrase(correctAnswers) + scoreBreakdown;

  document.querySelector('.transfer-layout').style.display = 'none';
  document.querySelector('.game-info').style.display = 'none';
  document.querySelector('.button-controls').style.display = 'none';

  const resultArea = document.getElementById('resultArea');
  const existingBtns = document.getElementById('tournamentButtons');
  if (existingBtns) existingBtns.remove();

  if (isInTournament) {
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelectorAll('.btn-back')[1];
    if (restartBtn) restartBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';

    const tournamentDiv = document.createElement('div');
    tournamentDiv.id = 'tournamentButtons';
    tournamentDiv.style.cssText = 'text-align: center; margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;';
    tournamentDiv.innerHTML =
      '<p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">✅ Score Submitted!</p>' +
      '<p style="font-size: 2em; font-weight: 900; margin: 10px 0;">' + finalScore + ' Points</p>' +
      '<p style="font-size: 0.9em; opacity: 0.9;">Returning to tournament...</p>';
    resultArea.appendChild(tournamentDiv);
    setTimeout(() => finishGame(finalScore), 2000);
  } else {
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelectorAll('.btn-back')[1];
    if (restartBtn) restartBtn.style.display = 'inline-block';
    if (backBtn) backBtn.style.display = 'inline-block';
  }

  resultArea.style.display = 'block';
}

function getResultPhrase(correct) {
  if (correct === 3) return '🏆 Perfect! You know your IPL transfers!';
  if (correct === 2) return '👏 Great job! Solid knowledge!';
  if (correct === 1) return '👍 Not bad! Keep learning!';
  return '📚 Time to study more transfers!';
}

function restartGame() { location.reload(); }
function backToMenu() { window.location.href = 'index.html'; }

function finishGame(finalScore) {
  const gameIndex = localStorage.getItem('currentGameIndex') || '2';
  localStorage.removeItem('inTournamentGame');
  window.location.href = 'tournament.html?score=' + finalScore + '&game=' + gameIndex;
}

window.submitGuess = submitGuess;
window.skipTransferPlayer = skipTransferPlayer;
window.restartGame = restartGame;
window.backToMenu = backToMenu;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;

window.addEventListener('DOMContentLoaded', initGame);