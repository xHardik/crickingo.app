let currentScore = 0;
let highScore = localStorage.getItem('cricketHigherLowerHighScore') || 0;
let leftPlayer = null;
let rightPlayer = null;
let usedPlayers = [];
let PLAYERS = [];

// Check if in tournament mode - only if explicitly set
const isInTournament = localStorage.getItem('inTournamentGame') === 'true';

// Load player data from JSON file
async function loadPlayers() {
    try {
        const response = await fetch('hl.json');
        const data = await response.json();
        PLAYERS = data.players;
        init();
    } catch (error) {
        console.error('Error loading player data:', error);
    }
}

function init() {
    document.getElementById('highScore').textContent = highScore;
    
    // Show tournament info if in tournament mode
    if (isInTournament) {
        showTournamentInfo();
    }
    
    loadNewRound();
}

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

function loadNewRound() {
    if (usedPlayers.length >= PLAYERS.length - 1) {
        usedPlayers = [];
    }

    if (!leftPlayer) {
        leftPlayer = getRandomPlayer();
        usedPlayers.push(leftPlayer);
    }

    rightPlayer = getRandomPlayer();
    while (rightPlayer === leftPlayer || usedPlayers.includes(rightPlayer) || !areComparable(leftPlayer, rightPlayer)) {
        rightPlayer = getRandomPlayer();
    }

    displayPlayers();
    document.getElementById('higherBtn').disabled = false;
    document.getElementById('lowerBtn').disabled = false;
    document.getElementById('resultMessage').classList.remove('show');
}

function areComparable(player1, player2) {
    const statType1 = getStatCategory(player1.stat);
    const statType2 = getStatCategory(player2.stat);
    return statType1 === statType2;
}

function getStatCategory(stat) {
    if (stat.includes('Runs') || stat.includes('IPL')) return 'runs';
    if (stat.includes('Wickets')) return 'wickets';
    if (stat.includes('Sixes')) return 'sixes';
    if (stat.includes('Average')) return 'average';
    return 'other';
}

function getRandomPlayer() {
    return PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
}

function displayPlayers() {
    document.getElementById('leftEmoji').textContent = leftPlayer.image;
    document.getElementById('leftName').textContent = leftPlayer.name;
    document.getElementById('leftStat').textContent = leftPlayer.stat;
    document.getElementById('leftValue').textContent = formatValue(leftPlayer.value);

    document.getElementById('rightEmoji').textContent = rightPlayer.image;
    document.getElementById('rightName').textContent = rightPlayer.name;
    document.getElementById('rightStat').textContent = rightPlayer.stat;
    document.getElementById('rightValue').textContent = '???';
}

function formatValue(value) {
    if (value >= 1000) {
        return value.toLocaleString();
    }
    return value;
}

function guess(choice) {
    document.getElementById('higherBtn').disabled = true;
    document.getElementById('lowerBtn').disabled = true;

    const isHigher = rightPlayer.value > leftPlayer.value;
    const isCorrect = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    document.getElementById('rightValue').textContent = formatValue(rightPlayer.value);
    document.getElementById('rightValue').className = 'player-value';

    const resultMsg = document.getElementById('resultMessage');
    
    if (isCorrect) {
        currentScore++;
        document.getElementById('currentScore').textContent = currentScore;
        resultMsg.textContent = '✅ Correct! Keep going!';
        resultMsg.className = 'result-message show correct';
        
        document.querySelector('.player-card:not(.left)').classList.add('pulse');
        
        setTimeout(() => {
            document.querySelector('.player-card:not(.left)').classList.remove('pulse');
            leftPlayer = rightPlayer;
            usedPlayers.push(leftPlayer);
            loadNewRound();
        }, 1500);

        if (currentScore > highScore) {
            highScore = currentScore;
            localStorage.setItem('cricketHigherLowerHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
    } else {
        resultMsg.textContent = `❌ Wrong! It was ${rightPlayer.value > leftPlayer.value ? 'HIGHER' : 'LOWER'}`;
        resultMsg.className = 'result-message show wrong';
        
        document.querySelector('.player-card:not(.left)').classList.add('shake');
        
        setTimeout(() => {
            endGame();
        }, 2000);
    }
}

function endGame() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('finalScore').textContent = currentScore;
    
    let message = '';
    if (currentScore === 0) {
        message = 'Better luck next time!';
    } else if (currentScore < 5) {
        message = 'Not bad! Keep practicing!';
    } else if (currentScore < 10) {
        message = 'Great job! You know your cricket!';
    } else if (currentScore < 20) {
        message = 'Amazing! Cricket expert! 🔥';
    } else {
        message = 'LEGENDARY! Are you a cricket encyclopedia? 🏆';
    }
    
    document.getElementById('gameOverMessage').textContent = message;
    
    const gameOverDiv = document.getElementById('gameOver');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    
    if (isInTournament) {
        // TOURNAMENT MODE
        // Hide try again button
        if (tryAgainBtn) {
            tryAgainBtn.style.display = 'none';
        }
        
        // Remove any existing tournament message
        const existingMsg = gameOverDiv.querySelector('#tournamentCompletionMsg');
        if (existingMsg) existingMsg.remove();
        
        // Show tournament completion message
        const tournamentMsg = document.createElement('div');
        tournamentMsg.id = 'tournamentCompletionMsg';
        tournamentMsg.style.cssText = `
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            color: white;
        `;
        tournamentMsg.innerHTML = `
            <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">
                ✅ Score Submitted!
            </p>
            <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">
                ${currentScore} Points
            </p>
            <p style="font-size: 0.9em; opacity: 0.9;">
                Returning to tournament...
            </p>
        `;
        gameOverDiv.appendChild(tournamentMsg);
        
        // Auto-return to tournament after 2 seconds
        setTimeout(() => {
            finishGame(currentScore);
        }, 2000);
        
    } else {
        // NORMAL MODE - standalone play
        // Show try again button
        if (tryAgainBtn) {
            tryAgainBtn.style.display = 'block';
        }
        
        // Remove tournament message if exists
        const tournamentMsg = gameOverDiv.querySelector('#tournamentCompletionMsg');
        if (tournamentMsg) tournamentMsg.remove();
    }
    
    gameOverDiv.classList.add('show');
}

function resetGame() {
    currentScore = 0;
    leftPlayer = null;
    rightPlayer = null;
    usedPlayers = [];
    
    document.getElementById('currentScore').textContent = 0;
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameOver').classList.remove('show');
    
    init();
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

// Make functions globally accessible for HTML onclick attributes
window.guess = guess;
window.resetGame = resetGame;
window.finishGame = finishGame;

// Load players when the page loads
loadPlayers();