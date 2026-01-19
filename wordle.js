// Cricket Wordle with Tournament Integration

// Tournament Detection
const isTournamentMode = localStorage.getItem('activeMatchId') !== null;
const isSeriesMatch = localStorage.getItem('isSeriesMatch') === 'true';

const PLAYERS = [
    "KOHLI", "ROHIT", "DHONI", "BUMRAH", "SMITH", "ROOT", "STOKES",
    "WARNER", "RAHUL", "PANT", "JADEJA", "ASHWIN", "SHAMI", "GAYLE",
    "BUTLER", "BABAR", "WILLIAMSON", "BOULT", "STARC", "CUMMINS",
    "RABADA", "ARCHER", "RASHID", "NARINE", "POLLARD", "RUSSELL",
    "MAXWELL"
];

let targetPlayer = '';
let currentAttempt = 0;
let maxAttempts = 5;
let gameOver = false;
let guesses = [];

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
    infoDiv.innerHTML = `🎮 Tournament Series Mode`;
    document.body.insertBefore(infoDiv, document.body.firstChild);
}

function initGame() {
    // Show tournament banner if in series mode
    if (isSeriesMatch && !document.getElementById('tournamentInfo')) {
        showTournamentInfo();
    }
    
    targetPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    currentAttempt = 0;
    gameOver = false;
    guesses = [];
    createBoard();
    updateStats();
    hideMessage();
    document.getElementById('guessInput').disabled = false;
    document.getElementById('submitBtn').disabled = false;
    
    // Hide/show buttons based on mode
    updateButtonsForMode();
}

function updateButtonsForMode() {
    const resetBtn = document.querySelector('.reset-btn');
    const backBtn = document.querySelector('.back-btn');
    
    if (isSeriesMatch) {
        // In tournament mode, hide these buttons initially
        if (resetBtn) resetBtn.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
    } else {
        // In normal mode, show these buttons
        if (resetBtn) resetBtn.style.display = 'inline-block';
        if (backBtn) backBtn.style.display = 'inline-block';
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
    
    if (guess === targetPlayer) {
        gameOver = true;
        const score = (maxAttempts - currentAttempt + 1) * 20; // 100 for 1st try, 80 for 2nd, etc.
        showMessage(`🎉 Correct! You guessed ${targetPlayer} in ${currentAttempt} ${currentAttempt === 1 ? 'try' : 'tries'}!`, 'success');
        document.getElementById('guessInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        
        if (isSeriesMatch) {
            showTournamentEndScreen(score);
        }
        
        finishGame(score);
    } else if (currentAttempt >= maxAttempts) {
        gameOver = true;
        showMessage(`😞 Game Over! The answer was ${targetPlayer}`, 'error');
        document.getElementById('guessInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        
        if (isSeriesMatch) {
            showTournamentEndScreen(0);
        }
        
        finishGame(0);
    }
}

function showTournamentEndScreen(score) {
    // Hide normal buttons
    const resetBtn = document.querySelector('.reset-btn');
    const backBtn = document.querySelector('.back-btn');
    if (resetBtn) resetBtn.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    
    // Create tournament end screen
    const container = document.querySelector('.container');
    const tournamentDiv = document.createElement('div');
    tournamentDiv.id = 'tournamentButtons';
    tournamentDiv.style.cssText = `
        margin-top: 30px;
        text-align: center;
        padding: 20px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 15px;
        border: 2px solid rgba(102, 126, 234, 0.3);
    `;
    tournamentDiv.innerHTML = `
        <button onclick="returnToTournament()" 
                style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                       color: white; border: none; padding: 15px 30px; border-radius: 12px;
                       font-size: 1.1em; font-weight: 700; cursor: pointer;
                       box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
            📊 Return to Tournament Lobby
        </button>
        <p style="color: #667eea; margin-top: 15px; font-weight: 600; font-size: 1.1em;">
            ✅ Score Submitted: ${score} points
        </p>
    `;
    container.appendChild(tournamentDiv);
}

function displayGuess(guess) {
    const targetLetters = targetPlayer.split('');
    const guessLetters = guess.split('');
    const letterCount = {};
    
    targetLetters.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    });
    
    const results = new Array(guess.length).fill('absent');
    
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            results[i] = 'correct';
            letterCount[letter]--;
        }
    });
    
    guessLetters.forEach((letter, i) => {
        if (results[i] !== 'correct' && targetLetters.includes(letter) && letterCount[letter] > 0) {
            results[i] = 'present';
            letterCount[letter]--;
        }
    });
    
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
    msg.textContent = text;
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

function resetGame() {
    initGame();
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

function returnToTournament() {
    window.close();
}

async function finishGame(finalScore) {
    const matchId = localStorage.getItem('activeMatchId');
    const tournamentCode = localStorage.getItem('activeTournamentCode');
    
    if (!isSeriesMatch) return; // Only submit for tournament games
    
    if (!window.opener || !window.opener.TournamentManager) {
        console.error('Cannot access tournament - window.opener not available');
        alert('⚠️ Score saved locally. Please return to tournament manually.');
        return;
    }
    
    const playerName = window.opener.TournamentManager.currentPlayerName;
    
    if (matchId && playerName && window.opener && window.opener.MatchManager) {
        try {
            await window.opener.MatchManager.submitMatchScore(matchId, playerName, finalScore);
            console.log('✅ Score submitted successfully:', finalScore);
        } catch (error) {
            console.error('❌ Error submitting score:', error);
            alert('⚠️ Could not submit score. Please check tournament connection.');
        }
    } else {
        console.error('Missing tournament data:', { matchId, playerName });
    }
}

document.getElementById('guessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitGuess();
    }
});

initGame();