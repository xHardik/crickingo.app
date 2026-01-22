// rivalry.js - Script for Rivalry Grid Game with Tournament Integration

// Check if in tournament mode - SIMPLIFIED
const isInTournament = localStorage.getItem('inTournamentGame') === 'true';

let gridData = {};
let currentGame = null;
let currentIndex = 0;
let correctCount = 0;
let gameActive = false;
let selectedDate = null;

// Show Tournament Banner
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

// Initialize the game
async function initGame() {
  await loadData();
  
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
  
  currentIndex = 0;
  correctCount = 0;
  gameActive = true;
  
  document.getElementById('gridTitle').innerText = currentGame.title;
  document.getElementById('gridSubtitle').innerText = currentGame.subtitle;
  
  // Hide search wrapper since we don't need it
  const searchWrapper = document.querySelector('.search-wrapper');
  if (searchWrapper) {
    searchWrapper.style.display = 'none';
  }
  
  renderGrid();
  showPlayer();
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
    currentIndex++;
  } else {
    const text = document.createElement('div');
    text.className = 'cell-text';
    text.innerText = player + " ❌";
    cell.appendChild(text);
    
    cell.classList.add('wrong');
    currentIndex += 2; // Skip next player as penalty
  }

  cell.dataset.filled = "true";
  
  const allCellsFilled = Array.from(document.querySelectorAll('.cell')).every(
    c => c.dataset.filled === "true"
  );
  
  if (allCellsFilled) {
    endGame();
  } else {
    showPlayer();
  }
}

function skipPlayer() {
  if (gameActive && currentIndex < currentGame.players.length) {
    currentIndex++;
    showPlayer();
  }
}

function endGame() {
  gameActive = false;
  const skipBtn = document.getElementById('skipBtn');
  if (skipBtn) skipBtn.disabled = true;
  
  // Use actual number of cells shown (16 for 4x4 grid)
  const total = Math.min(currentGame.categories.length, 16);
  const finalScore = correctCount;
  const phrase = getResultPhrase(correctCount, total);
  
  document.getElementById('scoreText').innerText = `${correctCount} / ${total}`;
  document.getElementById('resultPhrase').innerText = phrase;
  
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
        ${finalScore} / ${total} Points
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

function getResultPhrase(score, total) {
  const percentage = (score / total) * 100;
  
  if (percentage >= 90) return "🔥 Absolute Legend! You're a cricket genius!";
  if (percentage >= 75) return "🏆 Outstanding! You really know your cricket!";
  if (percentage >= 60) return "👏 Great job! Solid cricket knowledge!";
  if (percentage >= 45) return "👍 Not bad! Keep watching more cricket!";
  return "📺 Twitter expert! Time to watch some actual matches!";
}

function restartGame() {
  location.reload();
}

function backToMenu() {
  window.location.href = 'index.html';
}

function finishGame(finalScore) {
  const isInTournament = localStorage.getItem('inTournamentGame') === 'true';
  
  if (isInTournament) {
    // Clear the tournament game flag
    localStorage.removeItem('inTournamentGame');
    
    // Return to tournament with score
    window.location.href = `tournament.html?score=${finalScore}`;
  } else {
    // Normal game end (should not happen, but safety fallback)
    alert(`Game Over! Score: ${finalScore}`);
  }
}

// Make functions globally accessible
window.skipPlayer = skipPlayer;
window.restartGame = restartGame;
window.backToMenu = backToMenu;
window.finishGame = finishGame;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initGame);