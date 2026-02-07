// Simple tournament detection 
const isInTournament = localStorage.getItem('inTournamentGame') === 'true';

// Show tournament banner
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

// Game variables
let gridData = {};
let currentGame = null;
let currentIndex = 0;
let correctCount = 0;
let gameActive = false;
let selectedDate = null;

// Tournament scoring variables (Option A - Max 1000 points)
let totalScore = 0;
let currentStreak = 0;
let wrongAnswers = 0;
let skippedPlayers = 0;
let streakBonusEarned = 0;

// Scoring constants
const POINTS = {
  CORRECT: 50,
  WRONG: -10,
  SKIP: 0,
  STREAK_3: 20,
  STREAK_5: 50,
  STREAK_7: 100,
  STREAK_10: 200,
  PERFECT_ROUND: 200,
  ACCURACY_100: 150,
  ACCURACY_90: 100,
  ACCURACY_75: 50
};

// Load grid data from JSON
async function loadData() {
  try {
    const response = await fetch('./rivalry.json');
    if (!response.ok) {
      throw new Error('Failed to load rivalry.json');
    }
    gridData = await response.json();
  } catch (error) {
    console.error('Error loading grid data:', error);
    alert('Error loading game data. Please refresh the page.');
  }
}

// Get date from URL parameter
function getDateFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

// Show rules modal on page load
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

// Calculate streak bonus
function calculateStreakBonus(streak) {
  if (streak >= 10) return POINTS.STREAK_10;
  if (streak >= 7) return POINTS.STREAK_7;
  if (streak >= 5) return POINTS.STREAK_5;
  if (streak >= 3) return POINTS.STREAK_3;
  return 0;
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
        ${currentStreak > 0 ? `🔥 ${currentStreak} Streak` : ''}
      </div>
    `;
  }
}

// Initialize the game
async function initGame() {
  await loadData();
  
  // Show rules modal first
  showRulesModal();
  
  // Show tournament banner if in tournament mode
  if (isInTournament) {
    showTournamentInfo();
  }
  
  selectedDate = getDateFromURL();
  
  // Try to load date-specific game, fall back to default
  const gameKey = `rivalry-${selectedDate}`;
  currentGame = gridData[gameKey] || gridData['rivalry'];
  
  if (!currentGame) {
    alert(`No Rivalry Grid available. Returning to menu.`);
    backToMenu();
    return;
  }
  
  // Reset all scoring variables
  currentIndex = 0;
  correctCount = 0;
  totalScore = 0;
  currentStreak = 0;
  wrongAnswers = 0;
  skippedPlayers = 0;
  streakBonusEarned = 0;
  gameActive = true;
  
  document.getElementById('gridTitle').innerText = currentGame.title;
  document.getElementById('gridSubtitle').innerText = currentGame.subtitle;
  
  // Hide search wrapper since we don't need it
  const searchWrapper = document.querySelector('.search-wrapper');
  if (searchWrapper) {
    searchWrapper.style.display = 'none';
  }
  
  // Add score display to player box
  addScoreDisplay();
  
  renderGrid();
  showPlayer();
  updateScoreDisplay();
}

// Add score display to the UI
function addScoreDisplay() {
  const playerBox = document.querySelector('.player-box');
  if (playerBox && !document.getElementById('currentScore')) {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'currentScore';
    scoreDiv.style.cssText = `
      margin: 15px 0;
      padding: 15px;
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
      border: 2px solid rgba(255, 193, 7, 0.4);
      border-radius: 15px;
      text-align: center;
    `;
    playerBox.insertBefore(scoreDiv, playerBox.querySelector('.controls'));
  }
}

function renderGrid() {
  const grid = document.getElementById('gameGrid');
  grid.innerHTML = '';

  // Only show first 16 categories for 4x4 grid
  const categoriesToShow = currentGame.categories.slice(0, 16);

  categoriesToShow.forEach((cat, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = idx;
    
    // Add image if available with error handling
    if (cat.image) {
      const img = document.createElement('img');
      img.src = cat.image;
      img.className = 'cell-image';
      img.alt = cat.title;
      img.onerror = () => {
        img.style.display = 'none';
      };
      cell.appendChild(img);
    }
    
    // Add text
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = cat.title;
    cell.appendChild(text);
    
    cell.addEventListener('click', () => assignPlayerToCell(cell));
    grid.appendChild(cell);
  });
}

function showPlayer() {
  if (currentIndex >= currentGame.players.length) {
    endGame();
    return;
  }

  document.getElementById('currentPlayer').innerText = currentGame.players[currentIndex];
  document.getElementById('playerCount').innerText = `Player ${currentIndex + 1} / ${currentGame.players.length}`;
}

function assignPlayerToCell(cell) {
  if (cell.dataset.filled === "true" || !gameActive) return;
  if (currentIndex >= currentGame.players.length) return;

  const categoryIndex = cell.dataset.index;
  const category = currentGame.categories[categoryIndex];
  const player = currentGame.players[currentIndex];

  // Clear cell content
  cell.innerHTML = '';

  if (category.validPlayers.includes(player)) {
    // CORRECT ANSWER
    // Keep image if it exists
    if (category.image) {
      const img = document.createElement('img');
      img.src = category.image;
      img.className = 'cell-image';
      img.alt = category.title;
      img.onerror = () => {
        img.style.display = 'none';
      };
      cell.appendChild(img);
    }
    
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = player + " ✅";
    cell.appendChild(text);
    
    cell.classList.add('correct');
    correctCount++;
    currentStreak++;
    
    // Add base points
    totalScore += POINTS.CORRECT;
    
    // Check for streak bonuses
    const streakBonus = calculateStreakBonus(currentStreak);
    if (streakBonus > 0) {
      totalScore += streakBonus;
      streakBonusEarned += streakBonus;
      showStreakNotification(currentStreak, streakBonus);
    }
    
    currentIndex++;
  } else {
    // WRONG ANSWER
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = player + " ❌";
    cell.appendChild(text);
    
    cell.classList.add('wrong');
    
    // Apply penalty
    totalScore += POINTS.WRONG;
    wrongAnswers++;
    currentStreak = 0; // Reset streak
    currentIndex += 2; // Skip next player as penalty
  }

  cell.dataset.filled = "true";
  updateScoreDisplay();
  
  const allCellsFilled = Array.from(document.querySelectorAll('.cell')).every(
    c => c.dataset.filled === "true"
  );
  
  if (allCellsFilled) {
    endGame();
  } else {
    showPlayer();
  }
}

// Show streak notification
function showStreakNotification(streak, bonus) {
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
    font-size: 1.8em;
    font-weight: 900;
    z-index: 2000;
    box-shadow: 0 10px 40px rgba(255, 107, 157, 0.6);
    animation: streakPop 0.5s ease;
    text-align: center;
  `;
  
  let message = '';
  if (streak >= 10) message = '🔥🔥🔥 LEGENDARY STREAK! 🔥🔥🔥';
  else if (streak >= 7) message = '🔥🔥 AMAZING STREAK! 🔥🔥';
  else if (streak >= 5) message = '🔥 HOT STREAK! 🔥';
  else if (streak >= 3) message = '⚡ STREAK BONUS! ⚡';
  
  notification.innerHTML = `
    ${message}<br>
    <div style="font-size: 1.2em; margin-top: 10px;">+${bonus} Points!</div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 1500);
}

function skipPlayer() {
  if (gameActive && currentIndex < currentGame.players.length) {
    skippedPlayers++;
    currentStreak = 0; // Reset streak on skip
    currentIndex++;
    updateScoreDisplay();
    showPlayer();
  }
}

function endGame() {
  gameActive = false;
  const skipBtn = document.getElementById('skipBtn');
  if (skipBtn) skipBtn.disabled = true;
  
  // Calculate final bonuses
  const total = Math.min(currentGame.categories.length, 16);
  const accuracy = (correctCount / total) * 100;
  
  let accuracyBonus = 0;
  if (accuracy === 100) {
    accuracyBonus = POINTS.ACCURACY_100;
    totalScore += accuracyBonus;
  } else if (accuracy >= 90) {
    accuracyBonus = POINTS.ACCURACY_90;
    totalScore += accuracyBonus;
  } else if (accuracy >= 75) {
    accuracyBonus = POINTS.ACCURACY_75;
    totalScore += accuracyBonus;
  }
  
  // Perfect round bonus (all correct, no skips/wrongs)
  let perfectBonus = 0;
  if (correctCount === 16 && wrongAnswers === 0 && skippedPlayers === 0) {
    perfectBonus = POINTS.PERFECT_ROUND;
    totalScore += perfectBonus;
  }
  
  // Ensure score doesn't go negative
  if (totalScore < 0) totalScore = 0;
  
  const finalScore = totalScore;
  const phrase = getResultPhrase(accuracy);
  
  // Build score breakdown
  const scoreBreakdown = `
    <div style="text-align: left; margin: 20px auto; max-width: 400px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-size: 1.1em; font-weight: 700; margin-bottom: 15px; text-align: center;">📊 Score Breakdown</div>
      <div style="margin: 8px 0;">✅ Correct (${correctCount} ): <span style="float: right; color: #4caf50;">+${correctCount * 50}</span></div>
      <div style="margin: 8px 0;">❌ Wrong (${wrongAnswers} ): <span style="float: right; color: #f44336;">${wrongAnswers * POINTS.WRONG}</span></div>
      <div style="margin: 8px 0;">⏭️ Skipped: <span style="float: right; color: #9e9e9e;">${skippedPlayers}</span></div>
      <div style="margin: 8px 0;">🔥 Streak Bonuses: <span style="float: right; color: #ff9800;">+${streakBonusEarned}</span></div>
      ${accuracyBonus > 0 ? `<div style="margin: 8px 0;">🎯 Accuracy Bonus: <span style="float: right; color: #2196f3;">+${accuracyBonus}</span></div>` : ''}
      ${perfectBonus > 0 ? `<div style="margin: 8px 0;">⚡ Perfect Round: <span style="float: right; color: #9c27b0;">+${perfectBonus}</span></div>` : ''}
      <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">
      <div style="font-size: 1.3em; font-weight: 900; margin-top: 10px;">Total: <span style="float: right; color: #ffd700;">${finalScore}</span></div>
    </div>
  `;
  
  document.getElementById('scoreText').innerText = `${finalScore} / 1000`;
  document.getElementById('resultPhrase').innerHTML = phrase + scoreBreakdown;
  
  const resultArea = document.getElementById('resultArea');
  
  // Hide grid and player box
  document.getElementById('gameGrid').style.display = 'none';
  document.querySelector('.game-info').style.display = 'none';
  
  // Clear any existing tournament buttons
  const existingTournamentBtns = document.getElementById('tournamentButtons');
  if (existingTournamentBtns) {
    existingTournamentBtns.remove();
  }
  
  if (isInTournament) {
    // TOURNAMENT MODE
    // Hide normal buttons
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelector('.btn-back');
    if (restartBtn) restartBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    
    // Add tournament completion message
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
    
    // Auto-return to tournament after 2 seconds
    setTimeout(() => {
      finishGame(finalScore);
    }, 2000);
    
  } else {
    // NORMAL MODE - standalone play
    // Show normal buttons
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelector('.btn-back');
    if (restartBtn) restartBtn.style.display = 'inline-block';
    if (backBtn) backBtn.style.display = 'inline-block';
  }
  
  resultArea.style.display = 'block';
}

function getResultPhrase(accuracy) {
  if (accuracy >= 90) return "🔥 Absolute Legend! You're a cricket genius!";
  if (accuracy >= 75) return "🏆 Outstanding! You really know your cricket!";
  if (accuracy >= 60) return "👏 Great job! Solid cricket knowledge!";
  if (accuracy >= 45) return "👍 Not bad! Keep watching more cricket!";
  return "📺 Twitter expert! Time to watch some actual matches!";
}

function restartGame() {
  location.reload();
}

function backToMenu() {
  window.location.href = 'index.html';
}

function finishGame(finalScore) {
    // Clear the tournament flag
    localStorage.removeItem('inTournamentGame');
    
    // Redirect back to tournament with score - game 1 is Cricket Bingo/Rivalry
    window.location.href = `tournament.html?score=${finalScore}&game=1`;
}

// Make functions globally accessible
window.skipPlayer = skipPlayer;
window.restartGame = restartGame;
window.backToMenu = backToMenu;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initGame);