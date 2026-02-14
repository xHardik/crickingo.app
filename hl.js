// ===== TOURNAMENT INTEGRATION =====

// Check both localStorage flag AND URL parameter for tournament mode
const urlParams = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' && 
                       urlParams.get('tournament') === 'true';

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

// ===== END TOURNAMENT INTEGRATION =====

// ===== RULES MODAL =====
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
// ===== END RULES MODAL =====

// Game variables
let currentScore = 0;
let roundsCompleted = 0; // Track number of rounds completed
let highScore = localStorage.getItem('cricketHigherLowerHighScore') || 0;
let leftPlayer = null;
let rightPlayer = null;
let usedPlayers = [];
let PLAYERS = [];

// Scoring constants
const POINTS_PER_ROUND = 100;
const MAX_ROUNDS = 10;
const MAX_SCORE = 1000;

// Load player data from JSON file
// Load player data from JSON file
async function loadPlayers() {
    try {
        const response = await fetch('hl.json');
        const data = await response.json();
        
        console.log('=== LOAD PLAYERS DEBUG ===');
        console.log('Is in tournament:', isInTournament);
        
        let selectedDay = null;
        let selectedDayKey = null;
        
        if (isInTournament) {
            // TOURNAMENT MODE - use SHARED STORAGE for both players
            const gameIndex = localStorage.getItem('currentGameIndex') || '0';
            const storageKey = `tournament_hl_day_game${gameIndex}`;
            
            console.log('Game Index:', gameIndex);
            console.log('Shared Storage Key:', storageKey);
            
            let storedDayKey = null;
            
            try {
                // Try to get the stored day from shared storage
                const storedData = await window.storage.get(storageKey, true);
                storedDayKey = storedData?.value || null;
                console.log('Storage read result:', storedDayKey);
            } catch (error) {
                // Key doesn't exist yet - this is Player 1
                console.log('No stored data found (Player 1):', error.message);
                storedDayKey = null;
            }
            
            if (storedDayKey) {
                // Player 2 (or later) - Use the previously selected day
                selectedDayKey = storedDayKey;
                selectedDay = data[selectedDayKey];
                console.log('✅ PLAYER 2+: Using shared stored game key:', selectedDayKey);
                console.log('✅ Theme:', selectedDay.theme);
                console.log('✅ Date:', selectedDay.date);
            } else {
                // Player 1 - Randomly select and store in SHARED storage
                const availableDays = Object.keys(data).filter(key => key.startsWith('day'));
                
                console.log('Available days:', availableDays);
                
                if (availableDays.length === 0) {
                    alert('No game data available. Returning to menu.');
                    backToMenu();
                    return;
                }
                
                // Pick a random day
                selectedDayKey = availableDays[Math.floor(Math.random() * availableDays.length)];
                selectedDay = data[selectedDayKey];
                
                // Store it in SHARED storage for other players
                try {
                    const setResult = await window.storage.set(storageKey, selectedDayKey, true);
                    console.log('💾 PLAYER 1: Stored in SHARED storage:', storageKey, '=', selectedDayKey);
                    console.log('Set result:', setResult);
                    
                    // Verify it was stored
                    try {
                        const verification = await window.storage.get(storageKey, true);
                        console.log('✓ Verification - Read back from shared storage:', verification?.value);
                    } catch (verifyError) {
                        console.error('❌ Verification failed:', verifyError);
                    }
                } catch (setError) {
                    console.error('❌ Failed to store in shared storage:', setError);
                }
                
                console.log('🎲 PLAYER 1: Randomly selected game key:', selectedDayKey);
                console.log('🎲 Theme:', selectedDay.theme);
                console.log('🎲 Date:', selectedDay.date);
            }
        } else {
            // NORMAL MODE - use date from URL
            localStorage.removeItem('inTournamentGame');
            
            const dateParam = urlParams.get('date');
            console.log('Normal mode - Date param:', dateParam);
            
            // Try to find matching day
            if (dateParam) {
                for (const [key, value] of Object.entries(data)) {
                    if (value.date === dateParam) {
                        selectedDayKey = key;
                        selectedDay = value;
                        console.log('Found matching day:', key, 'for date:', dateParam);
                        break;
                    }
                }
            }
            
            // If no match, use day1 as default
            if (!selectedDay) {
                selectedDayKey = 'day1';
                selectedDay = data.day1;
                console.log('Using default day1');
            }
        }
        
        PLAYERS = selectedDay.players;
        
        console.log('=== FINAL SELECTION ===');
        console.log('Selected Day Key:', selectedDayKey);
        console.log('Theme:', selectedDay.theme);
        console.log('Date:', selectedDay.date);
        console.log('Total Players:', PLAYERS.length);
        console.log('First 3 players:', PLAYERS.slice(0, 3).map(p => `${p.name} (${p.stat}: ${p.value})`));
        console.log('======================');
        
        init();
    } catch (error) {
        console.error('Error loading player data:', error);
        alert('Error loading game data. Please make sure hl.json is in the same folder!');
    }
}



function init() {
    // Show rules modal first (only if not already shown)
    if (!sessionStorage.getItem('hlRulesShown')) {
        showRulesModal();
        sessionStorage.setItem('hlRulesShown', 'true');
    }
    
    document.getElementById('highScore').textContent = highScore;
    
    // Show tournament info if in tournament mode
    if (isInTournament) {
        showTournamentInfo();
    }
    
    loadNewRound();
}

function loadNewRound() {
    // Check if max rounds reached
    if (roundsCompleted >= MAX_ROUNDS) {
        endGame(true); // Pass true to indicate perfect completion
        return;
    }
    
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
        // Add 100 points per correct answer
        currentScore += POINTS_PER_ROUND;
        roundsCompleted++;
        
        document.getElementById('currentScore').textContent = currentScore;
        
        // Show progress
        const roundsLeft = MAX_ROUNDS - roundsCompleted;
        const progressText = roundsLeft > 0 ? ` (${roundsLeft} rounds left!)` : ' 🎉 PERFECT!';
        resultMsg.textContent = `✅ Correct! +${POINTS_PER_ROUND} points${progressText}`;
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
            endGame(false); // Pass false for wrong answer
        }, 2000);
    }
}

function endGame(isPerfect = false) {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('finalScore').textContent = currentScore;
    
    let message = '';
    if (isPerfect && currentScore === MAX_SCORE) {
        message = 'PERFECT SCORE! 🏆 You got all 10 rounds correct!';
    } else if (currentScore >= 800) {
        message = 'AMAZING! Cricket expert! 🔥';
    } else if (currentScore >= 500) {
        message = 'Great job! You know your cricket!';
    } else if (currentScore >= 300) {
        message = 'Not bad! Keep practicing!';
    } else {
        message = 'Better luck next time!';
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
                ${roundsCompleted} / ${MAX_ROUNDS} rounds completed
            </p>
            <p style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">
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
    sessionStorage.removeItem('hlRulesShown'); // Allow rules to show again
    currentScore = 0;
    roundsCompleted = 0;
    leftPlayer = null;
    rightPlayer = null;
    usedPlayers = [];
    
    document.getElementById('currentScore').textContent = 0;
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameOver').classList.remove('show');
    
    init();
}

function backToMenu() {
    window.location.href = 'index.html';
}
async function finishGame(finalScore) {
    const gameIndex = localStorage.getItem('currentGameIndex') || '0';
    
    // Clean up the shared storage for this game
    const storageKey = `tournament_hl_day_game${gameIndex}`;
    try {
        await window.storage.delete(storageKey, true);
        console.log('🧹 Cleaned up shared storage:', storageKey);
    } catch (error) {
        console.error('Error cleaning storage:', error);
    }
    
    // Clear tournament flags
    localStorage.removeItem('inTournamentGame');
    
    window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

// Make functions globally accessible for HTML onclick attributes
window.guess = guess;
window.resetGame = resetGame;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;
window.backToMenu = backToMenu;

// Load players when the page loads
loadPlayers();