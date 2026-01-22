// transfer.js - Script for Transfer History Game with Tournament Integration

// Tournament Detection - Check if being played in tournament mode
const tournamentCode = localStorage.getItem('tournamentCode');
const inTournamentGame = localStorage.getItem('inTournamentGame') === 'true';

const allIPLPlayers = [
  "Virat Kohli", "MS Dhoni", "Rohit Sharma", "David Warner", "Ravindra Jadeja",
  "KL Rahul", "Shreyas Iyer", "Rishabh Pant", "Hardik Pandya", "Jasprit Bumrah",
  "Suresh Raina", "AB de Villiers", "Chris Gayle", "Kieron Pollard", "Andre Russell",
  "Dwayne Bravo", "Lasith Malinga", "Yuzvendra Chahal", "Rashid Khan", "Shikhar Dhawan",
  "Dinesh Karthik", "Gautam Gambhir", "Yusuf Pathan", "Shane Watson", "Faf du Plessis",
  "Jos Buttler", "Ben Stokes", "Glenn Maxwell", "Kagiso Rabada", "Pat Cummins",
  "Sunil Narine", "Mitchell Starc", "Trent Boult", "Mohammed Shami", "Bhuvneshwar Kumar",
  "Shubman Gill", "Ishan Kishan", "Sanju Samson", "Quinton de Kock", "Ajinkya Rahane"
].sort();

let transfersData = {};
let currentGame = null;
let currentIndex = 0;
let correctCount = 0;
let gameActive = false;
let transferAttempts = 0;
let maxAttempts = 3;
let selectedPlayer = '';
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
  infoDiv.innerHTML = `🎮 Tournament Mode`;
  document.body.insertBefore(infoDiv, document.body.firstChild);
}

// Load transfer data from JSON
async function loadData() {
  try {
    const response = await fetch('./transfers.json');
    if (!response.ok) {
      throw new Error('Failed to load transfers.json');
    }
    transfersData = await response.json();
  } catch (error) {
    console.error('Error loading transfer data:', error);
    alert('Error loading game data. Please refresh the page.');
  }
}

// Get date from URL parameter (only for non-tournament mode)
function getDateFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

// Get random date key from available dates in transfersData
function getRandomDateKey() {
  const availableDates = Object.keys(transfersData);
  if (availableDates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableDates.length);
  return availableDates[randomIndex];
}

// Setup search dropdown
function setupSearchDropdown() {
  const searchInput = document.getElementById('searchInput');
  const dropdownList = document.getElementById('dropdownList');

  if (!searchInput || !dropdownList) return;

  searchInput.addEventListener('focus', () => {
    showDropdownResults(allIPLPlayers);
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm === '') {
      showDropdownResults(allIPLPlayers);
    } else {
      const filtered = allIPLPlayers.filter(player => 
        player.toLowerCase().includes(searchTerm)
      );
      showDropdownResults(filtered);
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = searchInput.value.trim();
      if (value) {
        submitGuess();
      } else {
        const firstItem = dropdownList.querySelector('.dropdown-item');
        if (firstItem) {
          firstItem.click();
        }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdownList.contains(e.target)) {
      dropdownList.classList.remove('active');
    }
  });
}

function showDropdownResults(players) {
  const dropdownList = document.getElementById('dropdownList');
  if (!dropdownList) return;

  dropdownList.innerHTML = '';

  if (players.length === 0) {
    dropdownList.innerHTML = '<div class="no-results">No players found</div>';
    dropdownList.classList.add('active');
    return;
  }

  players.forEach(player => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = player;
    item.addEventListener('click', () => {
      document.getElementById('searchInput').value = player;
      selectedPlayer = player;
      dropdownList.classList.remove('active');
    });
    dropdownList.appendChild(item);
  });

  dropdownList.classList.add('active');
}

// Initialize the game
async function initGame() {
  await loadData();
  
  // Show tournament banner if in tournament mode
  if (inTournamentGame) {
    showTournamentInfo();
  }
  
  // TOURNAMENT MODE: Use random date, ignore URL parameter
  if (inTournamentGame) {
    selectedDate = getRandomDateKey();
    
    if (!selectedDate || !transfersData[selectedDate]) {
      alert('No Transfer History puzzle available. Returning to tournament.');
      finishGame(0);
      return;
    }
  } else {
    // NORMAL MODE: Use date from URL parameter
    selectedDate = getDateFromURL();
    
    if (!transfersData[selectedDate]) {
      alert(`No Transfer History puzzle available for ${selectedDate}. Returning to menu.`);
      backToMenu();
      return;
    }
  }
  
  currentGame = {
    title: "🔄 Transfer History",
    subtitle: "Guess the player from their IPL journey",
    players: transfersData[selectedDate]
  };
  
  currentIndex = 0;
  correctCount = 0;
  gameActive = true;
  
  setupSearchDropdown();
  showTransferPlayer();
}

function showTransferPlayer() {
  if (currentIndex >= currentGame.players.length) {
    endGame();
    return;
  }

  transferAttempts = 0;
  selectedPlayer = '';
  const player = currentGame.players[currentIndex];
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

  document.getElementById('searchInput').value = '';
  document.getElementById('searchInput').focus();
  document.getElementById('dropdownList').classList.remove('active');
  
  const feedback = document.getElementById('feedback');
  feedback.style.display = 'none';
  feedback.className = 'feedback';
  
  document.getElementById('currentPlayer').innerText = `Player ${currentIndex + 1}`;
  document.getElementById('playerCount').innerText = `Player ${currentIndex + 1} of ${currentGame.players.length}`;
  document.getElementById('attempts').textContent = `Attempts: ${transferAttempts} / ${maxAttempts}`;
}

function submitGuess() {
  const guess = document.getElementById('searchInput').value.trim();
  const correctAnswer = currentGame.players[currentIndex].name;
  const feedback = document.getElementById('feedback');
  const attemptsDiv = document.getElementById('attempts');

  if (!guess) {
    feedback.className = 'feedback wrong';
    feedback.textContent = '⚠️ Please select a player';
    feedback.style.display = 'block';
    return;
  }

  transferAttempts++;
  attemptsDiv.textContent = `Attempts: ${transferAttempts} / ${maxAttempts}`;

  if (guess === correctAnswer) {
    feedback.className = 'feedback correct';
    feedback.textContent = `✅ Correct! It's ${correctAnswer}!`;
    feedback.style.display = 'block';
    correctCount++;
    
    setTimeout(() => {
      currentIndex++;
      showTransferPlayer();
    }, 2000);
  } else {
    if (transferAttempts >= maxAttempts) {
      feedback.className = 'feedback wrong';
      feedback.textContent = `❌ Wrong! The answer was ${correctAnswer}`;
      feedback.style.display = 'block';
      
      setTimeout(() => {
        currentIndex++;
        showTransferPlayer();
      }, 3000);
    } else {
      feedback.className = 'feedback wrong';
      feedback.textContent = `❌ Wrong! You have ${maxAttempts - transferAttempts} attempts left`;
      feedback.style.display = 'block';
      
      document.getElementById('searchInput').value = '';
      document.getElementById('searchInput').focus();
    }
  }
}

function skipTransferPlayer() {
  if (!gameActive) return;
  
  const correctAnswer = currentGame.players[currentIndex].name;
  const feedback = document.getElementById('feedback');
  
  feedback.className = 'feedback wrong';
  feedback.textContent = `⏭️ Skipped! The answer was ${correctAnswer}`;
  feedback.style.display = 'block';
  
  setTimeout(() => {
    currentIndex++;
    showTransferPlayer();
  }, 2000);
}

function endGame() {
  gameActive = false;
  
  const total = currentGame.players.length;
  const phrase = getResultPhrase(correctCount, total);
  
  document.getElementById('scoreText').innerText = `${correctCount} / ${total}`;
  document.getElementById('resultPhrase').innerText = phrase;
  
  const resultArea = document.getElementById('resultArea');
  
  // Hide game elements
  document.querySelector('.transfer-layout').style.display = 'none';
  document.querySelector('.button-controls').style.display = 'none';
  document.querySelector('.game-info').style.display = 'none';
  
  // Modify result area for tournament mode
  if (inTournamentGame) {
    // Hide normal buttons
    const restartBtn = resultArea.querySelector('.btn-restart');
    const backBtn = resultArea.querySelector('.btn-back');
    if (restartBtn) restartBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    
    // Add tournament button
    const tournamentBtnContainer = document.createElement('div');
    tournamentBtnContainer.id = 'tournamentButtons';
    tournamentBtnContainer.innerHTML = `
      <button class="btn btn-restart" onclick="returnToTournament()" 
              style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); margin-top: 20px;">
        📊 Return to Tournament
      </button>
      <p style="color: #667eea; margin-top: 15px; font-weight: 600;">
        ✅ Score: ${correctCount} / ${total}
      </p>
    `;
    resultArea.appendChild(tournamentBtnContainer);
    
    resultArea.style.display = 'block';
    
    // Auto-submit score and return after 3 seconds
    setTimeout(() => {
      finishGame(correctCount);
    }, 3000);
  } else {
    // Normal mode - show regular buttons
    resultArea.style.display = 'block';
  }
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

function returnToTournament() {
  const tournamentCode = localStorage.getItem('tournamentCode');
  if (tournamentCode) {
    finishGame(correctCount);
  } else {
    window.close();
  }
}

// Tournament Integration - Finish game and return score
function finishGame(finalScore) {
  const tournamentCode = localStorage.getItem('tournamentCode');
  
  if (tournamentCode && inTournamentGame) {
    // Clear the tournament game flag
    localStorage.removeItem('inTournamentGame');
    
    // Return to tournament with score
    window.location.href = `tournament.html?score=${finalScore}`;
  } else {
    // Normal game end (not in tournament)
    alert(`Game Over! Score: ${finalScore}`);
  }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', initGame);