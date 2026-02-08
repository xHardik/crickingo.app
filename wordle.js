// Simple tournament detection - just check the flag
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

// ===== END TOURNAMENT INTEGRATION =====

// Game data
let wordleData = {};
let targetPlayer = '';
let currentAttempt = 0;
let maxAttempts = 5;
let gameOver = false;
let guesses = [];
let currentScore = 0;
let selectedDate = null;
let hintCountry = '';
let hintPosition = '';

// Scoring constants
const SCORING = {
    ATTEMPT_1: 100,
    ATTEMPT_2: 80,
    ATTEMPT_3: 60,
    ATTEMPT_4: 40,
    ATTEMPT_5: 20,
    FAILED: 0
};

// Load wordle data from JSON
async function loadData() {
    try {
        const response = await fetch('./wordle.json');
        if (!response.ok) {
            throw new Error('Failed to load wordle.json');
        }
        wordleData = await response.json();
    } catch (error) {
        console.error('Error loading wordle data:', error);
        alert('Error loading game data. Please refresh the page.');
    }
}

// Get date from URL parameter or use current date
function getDateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

async function initGame() {
    // Load data first
    await loadData();
    
    // Show rules modal first (only in non-tournament mode)
    if (!isInTournament) {
        showRulesModal();
    }
    
    // Show tournament banner if in tournament mode
    if (isInTournament && !document.getElementById('tournamentInfo')) {
        showTournamentInfo();
    }
    
    // Get date and select player
    selectedDate = getDateFromURL();
    const gameKey = `wordle-${selectedDate}`;
    const dailyGame = wordleData[gameKey];
    
    if (dailyGame) {
        // Use date-specific player
        targetPlayer = dailyGame.player;
        hintCountry = dailyGame.hint_country || '';
        hintPosition = dailyGame.hint_position || '';
    } else {
        // Fallback to first available player if no date match
        const firstKey = Object.keys(wordleData)[0];
        if (firstKey && wordleData[firstKey]) {
            targetPlayer = wordleData[firstKey].player;
            hintCountry = wordleData[firstKey].hint_country || '';
            hintPosition = wordleData[firstKey].hint_position || '';
        } else {
            // Ultimate fallback
            targetPlayer = "KOHLI";
            hintCountry = "🇮🇳 India";
            hintPosition = "🏏 Batsman";
        }
    }
    
    currentAttempt = 0;
    gameOver = false;
    guesses = [];
    currentScore = 0;
    
    createBoard();
    updateStats();
    updateScoreDisplay();
    hideMessage();
    
    // Hide hint display
    const hintDisplay = document.getElementById('hintDisplay');
    if (hintDisplay) {
        hintDisplay.style.display = 'none';
    }
    
    document.getElementById('guessInput').disabled = false;
    document.getElementById('submitBtn').disabled = false;
    
    // Hide/show buttons based on mode
    updateButtonsForMode();
}

function updateButtonsForMode() {
    const resetBtn = document.querySelector('.reset-btn');
    const backBtn = document.querySelector('.back-btn');
    
    if (isInTournament) {
        // In tournament mode, hide these buttons initially
        if (resetBtn) resetBtn.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
    } else {
        // In normal mode, show these buttons
        if (resetBtn) resetBtn.style.display = 'inline-block';
        if (backBtn) backBtn.style.display = 'inline-block';
    }
}

function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
        const scoreValue = scoreDisplay.querySelector('.score-value');
        if (scoreValue) {
            scoreValue.textContent = `💰 ${currentScore} pts`;
        }
    }
}

function calculateScore(attemptNumber) {
    switch(attemptNumber) {
        case 1: return SCORING.ATTEMPT_1;
        case 2: return SCORING.ATTEMPT_2;
        case 3: return SCORING.ATTEMPT_3;
        case 4: return SCORING.ATTEMPT_4;
        case 5: return SCORING.ATTEMPT_5;
        default: return SCORING.FAILED;
    }
}

function createBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < targetPlayer.length; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        
        board.appendChild(row);
    }
}

function submitGuess() {
    if (gameOver) return;
    
    const input = document.getElementById('guessInput');
    const guess = input.value.toUpperCase().trim();
    
    if (!guess) {
        showMessage('Please enter a player name!', 'error');
        return;
    }
    
    if (guess.length !== targetPlayer.length) {
        showMessage(`Player name must be ${targetPlayer.length} letters!`, 'error');
        return;
    }
    
    if (guesses.includes(guess)) {
        showMessage('You already guessed that name!', 'error');
        return;
    }
    
    guesses.push(guess);
    displayGuess(guess);
    input.value = '';
    currentAttempt++;
    updateStats();
    
    // Show hints after 3rd and 4th attempts
    if (!gameOver) {
        setTimeout(() => {
            showHint(currentAttempt);
        }, 500);
    }
    
    if (guess === targetPlayer) {
        gameOver = true;
        currentScore = calculateScore(currentAttempt);
        updateScoreDisplay();
        
        const scoreBreakdown = `
            <div style="text-align: center; margin: 20px auto; max-width: 400px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                <div style="font-size: 1.3em; font-weight: 900; color: #ffd700; margin-bottom: 10px;">🎉 Score: ${currentScore} Points!</div>
                <div style="font-size: 1em; color: rgba(255,255,255,0.9);">Guessed in ${currentAttempt} ${currentAttempt === 1 ? 'try' : 'tries'}</div>
            </div>
        `;
        
        showMessage(`🎉 Correct! You guessed ${targetPlayer}!${scoreBreakdown}`, 'success');
        document.getElementById('guessInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        
        if (isInTournament) {
            showTournamentEndScreen(currentScore, true);
            setTimeout(() => {
                finishGame(currentScore);
            }, 2000);
        }
    } else if (currentAttempt >= maxAttempts) {
        gameOver = true;
        currentScore = SCORING.FAILED;
        updateScoreDisplay();
        
        showMessage(`😞 Game Over! The answer was ${targetPlayer}`, 'error');
        document.getElementById('guessInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        
        if (isInTournament) {
            showTournamentEndScreen(0, false);
            setTimeout(() => {
                finishGame(0);
            }, 2000);
        }
    }
}

function showTournamentEndScreen(score, isWin) {
    // Hide normal buttons
    const resetBtn = document.querySelector('.reset-btn');
    const backBtn = document.querySelector('.back-btn');
    if (resetBtn) resetBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    
    // Remove any existing tournament div
    const existing = document.getElementById('tournamentButtons');
    if (existing) existing.remove();
    
    // Create tournament end screen
    const container = document.querySelector('.container');
    const tournamentDiv = document.createElement('div');
    tournamentDiv.id = 'tournamentButtons';
    tournamentDiv.style.cssText = `
        margin-top: 30px;
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
    `;
    tournamentDiv.innerHTML = `
        <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">
            ✅ Score Submitted!
        </p>
        <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">
            ${score} Points
        </p>
        <p style="font-size: 0.9em; opacity: 0.9;">
            ${isWin ? '🎉 Well done!' : '📊 Better luck next time!'}
        </p>
        <p style="font-size: 0.9em; opacity: 0.9; margin-top: 10px;">
            Returning to tournament...
        </p>
    `;
    container.appendChild(tournamentDiv);
}

function displayGuess(guess) {
    const targetLetters = targetPlayer.split('');
    const guessLetters = guess.split('');
    const letterCount = {};
    
    // Count letters in target
    targetLetters.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    });
    
    const results = new Array(guess.length).fill('absent');
    
    // First pass: mark correct positions
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            results[i] = 'correct';
            letterCount[letter]--;
        }
    });
    
    // Second pass: mark present letters
    guessLetters.forEach((letter, i) => {
        if (results[i] !== 'correct' && targetLetters.includes(letter) && letterCount[letter] > 0) {
            results[i] = 'present';
            letterCount[letter]--;
        }
    });
    
    // Animate tiles
    guessLetters.forEach((letter, i) => {
        const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        
        setTimeout(() => {
            tile.classList.add(results[i]);
        }, 100 * i);
    });
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.innerHTML = text;
    msg.className = `message show ${type}`;
    
    setTimeout(() => {
        if (type === 'error' || type === 'info') {
            hideMessage();
        }
    }, 3000);
}

function hideMessage() {
    const msg = document.getElementById('message');
    msg.className = 'message';
}

function updateStats() {
    document.getElementById('stats').textContent = `Attempts: ${currentAttempt}/${maxAttempts}`;
}

function showHint(attemptNumber) {
    const hintDisplay = document.getElementById('hintDisplay');
    const hintText = document.getElementById('hintText');
    
    if (!hintDisplay || !hintText) return;
    
    if (attemptNumber === 3 && hintCountry) {
        // Show country hint after 3rd attempt
        hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry}`;
        hintDisplay.style.display = 'block';
        hintDisplay.style.animation = 'slideIn 0.4s ease';
    } else if (attemptNumber === 4 && hintPosition) {
        // Show position hint after 4th attempt
        hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry} | ${hintPosition}`;
        hintDisplay.style.display = 'block';
        hintDisplay.style.animation = 'slideIn 0.4s ease';
    }
}

function resetGame() {
    initGame();
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

function finishGame(finalScore) {
    // Clear the tournament flag
    localStorage.removeItem('inTournamentGame');
    
    // Redirect back to tournament with score - game 4 is Wordle (last game)
    // This will trigger the final results display in tournament.js
    window.location.href = `tournament.html?score=${finalScore}&game=4`;
}

// Make functions globally accessible
window.submitGuess = submitGuess;
window.resetGame = resetGame;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitGuess();
            }
        });
    }
});

// Initialize game
initGame();