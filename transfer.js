// transfer.js - Transfer History Game with Tournament Integration

// ===== TOURNAMENT INTEGRATION =====
const isInTournament = localStorage.getItem('inTournamentGame') === 'true';

function showTournamentInfo() {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'tournamentInfo';
    infoDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 25px;
        border-radius: 25px;
        font-weight: 700;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        text-align: center;
        font-size: 0.9em;
    `;
    infoDiv.innerHTML = `🏆 Tournament Mode - Play Your Best!`;
    document.body.insertBefore(infoDiv, document.body.firstChild);
}
// ===== END TOURNAMENT INTEGRATION =====

// Game variables
let gameData = {};
let currentGame = null;
let currentPlayerIndex = 0;
let currentSelectedPlayer = null;
let totalScore = 0;
let correctAnswers = 0;
let currentStreak = 0;
let gameActive = false;

// Scoring constants (Max 1000 points)
const POINTS = {
  FIRST: 250,      // 1st correct
  SECOND: 300,     // 2nd correct (250 + 50 streak bonus)
  THIRD: 350,      // 3rd correct (250 + 100 streak bonus)
  COMPLETION: 100  // All 3 correct in order
};

// Load game data from JSON
async function loadData() {
  try {
    console.log('Loading transfers.json...');
    const response = await fetch('./transfers.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    gameData = await response.json();
    console.log('✅ Game data loaded successfully');
    
    if (!gameData.allPlayers) {
      throw new Error('Missing allPlayers in game data');
    }
    
    console.log(`📋 ${gameData.allPlayers.length} players available`);
    
  } catch (error) {
    console.error('❌ Error loading game data:', error);
    alert(`Error loading game data: ${error.message}\n\nMake sure transfer.json is in the same folder!`);
  }
}

// Get date from URL parameter
function getDateFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

// Show rules modal
function showRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close rules modal
function closeRulesModal() {
  const modal = document.getElementById('rulesModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Initialize game
async function initGame() {
  await loadData();
  
  // Validate data
  if (!gameData || !gameData.allPlayers) {
    console.error('Invalid game data');
    return;
  }
  
  // Show rules modal first
  showRulesModal();
  
  // Show tournament banner if in tournament mode
  if (isInTournament) {
    showTournamentInfo();
  }
  
  // Select game based on mode
  if (isInTournament) {
    // TOURNAMENT MODE - randomly select from available games
    const availableGames = Object.keys(gameData).filter(key => key.startsWith('transfer'));
    if (availableGames.length === 0) {
      alert('No transfer history available. Returning to menu.');
      backToMenu();
      return;
    }
    
    // Pick a random game
    const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
    currentGame = gameData[randomKey];
    
    console.log(`Tournament mode: Selected random game "${randomKey}"`);
  } else {
    // NORMAL MODE - use date from URL
    const selectedDate = getDateFromURL();
    console.log('📅 Date:', selectedDate);
    
    const gameKey = `transfer-${selectedDate}`;
    currentGame = gameData[gameKey] || gameData['transfer'];
    
    console.log(`Normal mode: Using date-based game "${gameKey}"`);
  }
  
  if (!currentGame || !currentGame.players) {
    alert('No transfer history available. Returning to menu.');
    backToMenu();
    return;
  }
  
  console.log(`🎮 Loaded: ${currentGame.title}`);
  console.log(`👥 ${currentGame.players.length} players to guess`);
  
  // Reset game state
  currentPlayerIndex = 0;
  currentSelectedPlayer = null;
  totalScore = 0;
  correctAnswers = 0;
  currentStreak = 0;
  gameActive = true;
  
  // Update UI
  document.querySelector('.game-info h2').innerText = currentGame.title;
  document.querySelector('.game-info .subtitle').innerText = currentGame.subtitle;
  
  // Add score display
  addScoreDisplay();
  
  showCurrentPlayer();
  setupSearchInput();
  updateScoreDisplay();
}

// Add score display to UI
function addScoreDisplay() {
  const playerBox = document.querySelector('.player-box');
  if (playerBox && !document.getElementById('currentScore')) {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'currentScore';
    scoreDiv.style.cssText = `
      margin-top: 15px;
      padding: 15px;
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
      border: 2px solid rgba(255, 193, 7, 0.4);
      border-radius: 15px;
      text-align: center;
    `;
    playerBox.appendChild(scoreDiv);
  }
}

// Update score display
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('currentScore');
  if (scoreDisplay) {
    scoreDisplay.innerHTML = `
      <div style="font-size: 1.5em; font-weight: 900; color: #ffd700;">
        💰 ${totalScore} pts
      </div>
      <div style="font-size: 0.9em; color: rgba(255,255,255,0.8); margin-top: 5px;">
        ${currentStreak > 0 ? `🔥 ${currentStreak} Streak` : 'Build a streak!'}
      </div>
    `;
  }
}

// Show current player's transfer history
function showCurrentPlayer() {
  if (currentPlayerIndex >= currentGame.players.length) {
    endGame();
    return;
  }
  
  const player = currentGame.players[currentPlayerIndex];
  
  // Update player counter
  document.getElementById('currentPlayer').innerText = `Player ${currentPlayerIndex + 1}`;
  document.getElementById('playerCount').innerText = `Player ${currentPlayerIndex + 1} of ${currentGame.players.length}`;
  
  // Display transfer history
  const transferList = document.getElementById('transferList');
  transferList.innerHTML = '';
  
  player.transfers.forEach(transfer => {
    const item = document.createElement('div');
    item.className = 'transfer-item';
    item.innerHTML = `
      <div class="year">${transfer.year}</div>
      <div class="team">${transfer.team}</div>
    `;
    transferList.appendChild(item);
  });
  
  // Reset feedback
  const feedback = document.getElementById('feedback');
  feedback.className = 'feedback';
  feedback.style.display = 'none';
  
  // Reset search input
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  currentSelectedPlayer = null;
  
  // Update attempts display
  updateAttemptsDisplay();
}

// Update attempts display
function updateAttemptsDisplay() {
  const attemptsDiv = document.getElementById('attempts');
  attemptsDiv.innerHTML = `Correct: ${correctAnswers} / ${currentGame.players.length}`;
}

// Setup search input and dropdown
function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const dropdownList = document.getElementById('dropdownList');
  
  // Use shared allPlayers list
  const allPlayers = gameData.allPlayers || [];
  
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    
    if (query.length === 0) {
      dropdownList.classList.remove('active');
      return;
    }
    
    const matches = allPlayers.filter(player => 
      player.toLowerCase().includes(query)
    );
    
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
  
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length > 0) {
      dropdownList.classList.add('active');
    }
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      dropdownList.classList.remove('active');
    }, 200);
  });
}

// Submit guess
function submitGuess() {
  if (!gameActive) return;
  if (!currentSelectedPlayer) {
    alert('Please select a player first!');
    return;
  }
  
  const currentPlayer = currentGame.players[currentPlayerIndex];
  const feedback = document.getElementById('feedback');
  
  if (currentSelectedPlayer === currentPlayer.name) {
    // CORRECT ANSWER
    correctAnswers++;
    currentStreak++;
    
    // Calculate points based on streak
    let pointsEarned = 0;
    if (currentStreak === 1) {
      pointsEarned = POINTS.FIRST;
    } else if (currentStreak === 2) {
      pointsEarned = POINTS.SECOND;
    } else if (currentStreak === 3) {
      pointsEarned = POINTS.THIRD;
    }
    
    totalScore += pointsEarned;
    
    feedback.className = 'feedback correct';
    feedback.innerText = `✅ Correct! +${pointsEarned} points`;
    feedback.style.display = 'block';
    
    // Show streak notification
    if (currentStreak === 2) {
      showStreakNotification('🔥 Streak Started! +50 Bonus!');
    } else if (currentStreak === 3) {
      showStreakNotification('🔥🔥 Amazing Streak! +100 Bonus!');
    }
    
    updateScoreDisplay();
    
    setTimeout(() => {
      currentPlayerIndex++;
      showCurrentPlayer();
    }, 1500);
    
  } else {
    // WRONG ANSWER
    currentStreak = 0;
    
    feedback.className = 'feedback wrong';
    feedback.innerText = `❌ Wrong! It was ${currentPlayer.name}`;
    feedback.style.display = 'block';
    
    updateScoreDisplay();
    
    setTimeout(() => {
      currentPlayerIndex++;
      showCurrentPlayer();
    }, 2000);
  }
}

// Show streak notification
function showStreakNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #ff6b9d 0%, #ffa400 100%);
    color: white;
    padding: 30px 40px;
    border-radius: 20px;
    font-size: 1.5em;
    font-weight: 900;
    z-index: 2000;
    box-shadow: 0 10px 40px rgba(255, 107, 157, 0.6);
    text-align: center;
    animation: pulse 0.5s ease;
  `;
  
  notification.innerText = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 1500);
}

// Skip current player
function skipTransferPlayer() {
  if (!gameActive) return;
  
  const currentPlayer = currentGame.players[currentPlayerIndex];
  const feedback = document.getElementById('feedback');
  
  feedback.className = 'feedback wrong';
  feedback.innerText = `⏭️ Skipped! It was ${currentPlayer.name}`;
  feedback.style.display = 'block';
  
  currentStreak = 0;
  updateScoreDisplay();
  
  setTimeout(() => {
    currentPlayerIndex++;
    showCurrentPlayer();
  }, 1500);
}

// End game
function endGame() {
  gameActive = false;
  
  // Add completion bonus if all 3 correct
  let completionBonus = 0;
  if (correctAnswers === 3 && currentStreak === 3) {
    completionBonus = POINTS.COMPLETION;
    totalScore += completionBonus;
  }
  
  const finalScore = totalScore;
  const phrase = getResultPhrase(correctAnswers);
  
  // Build score breakdown
  const scoreBreakdown = `
    <div style="text-align: left; margin: 20px auto; max-width: 400px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-size: 1.1em; font-weight: 700; margin-bottom: 15px; text-align: center;">📊 Score Breakdown</div>
      <div style="margin: 8px 0;">✅ Correct Answers: <span style="float: right; color: #4caf50;">${correctAnswers} / 3</span></div>
      ${correctAnswers >= 1 ? `<div style="margin: 8px 0;">1st Correct: <span style="float: right; color: #ffd700;">+250</span></div>` : ''}
      ${correctAnswers >= 2 ? `<div style="margin: 8px 0;">2nd Correct (Streak): <span style="float: right; color: #ff9800;">+300</span></div>` : ''}
      ${correctAnswers >= 3 ? `<div style="margin: 8px 0;">3rd Correct (Streak): <span style="float: right; color: #ff6b9d;">+350</span></div>` : ''}
      ${completionBonus > 0 ? `<div style="margin: 8px 0;">🎯 Perfect Completion: <span style="float: right; color: #9c27b0;">+${completionBonus}</span></div>` : ''}
      <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">
      <div style="font-size: 1.3em; font-weight: 900; margin-top: 10px;">Total: <span style="float: right; color: #ffd700;">${finalScore}</span></div>
    </div>
  `;
  
  document.getElementById('scoreText').innerText = `${finalScore} / 1000`;
  document.getElementById('resultPhrase').innerHTML = phrase + scoreBreakdown;
  
  // Hide game area
  document.querySelector('.transfer-layout').style.display = 'none';
  document.querySelector('.game-info').style.display = 'none';
  document.querySelector('.button-controls').style.display = 'none';
  
  const resultArea = document.getElementById('resultArea');
  
  // Clear existing tournament buttons
  const existingTournamentBtns = document.getElementById('tournamentButtons');
  if (existingTournamentBtns) {
    existingTournamentBtns.remove();
  }
  
  if (isInTournament) {
    // TOURNAMENT MODE
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelectorAll('.btn-back')[1];
    if (restartBtn) restartBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    
    const tournamentBtnContainer = document.createElement('div');
    tournamentBtnContainer.id = 'tournamentButtons';
    tournamentBtnContainer.style.cssText = `
      text-align: center;
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      color: white;
    `;
    tournamentBtnContainer.innerHTML = `
      <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">
        ✅ Score Submitted!
      </p>
      <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">
        ${finalScore} Points
      </p>
      <p style="font-size: 0.9em; opacity: 0.9;">
        Returning to tournament...
      </p>
    `;
    resultArea.appendChild(tournamentBtnContainer);
    
    setTimeout(() => {
      finishGame(finalScore);
    }, 2000);
    
  } else {
    // NORMAL MODE
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelectorAll('.btn-back')[1];
    if (restartBtn) restartBtn.style.display = 'inline-block';
    if (backBtn) backBtn.style.display = 'inline-block';
  }
  
  resultArea.style.display = 'block';
}

// Get result phrase
function getResultPhrase(correct) {
  if (correct === 3) return "🏆 Perfect! You know your IPL transfers!";
  if (correct === 2) return "👏 Great job! Solid knowledge!";
  if (correct === 1) return "👍 Not bad! Keep learning!";
  return "📚 Time to study more transfers!";
}

// Restart game
function restartGame() {
  location.reload();
}

// Back to menu
function backToMenu() {
  window.location.href = 'index.html';
}

// Finish game (tournament mode)
function finishGame(finalScore) {
  // Get the current game index from localStorage
  const gameIndex = localStorage.getItem('currentGameIndex') || '1';
  
  // Clear the tournament flag
  localStorage.removeItem('inTournamentGame');
  
  // Redirect back to tournament with score and correct game index
  window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

// Make functions globally accessible
window.submitGuess = submitGuess;
window.skipTransferPlayer = skipTransferPlayer;
window.restartGame = restartGame;
window.backToMenu = backToMenu;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initGame);