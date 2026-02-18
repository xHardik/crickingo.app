// ==== FIREBASE IMPORT =====
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

// ===== TOURNAMENT INTEGRATION =====
const urlParams = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' &&
                       urlParams.get('tournament') === 'true';

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

// ===== RULES MODAL =====
function showRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.style.display = 'flex';
}

function closeRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.style.display = 'none';
}

// ===== GAME VARIABLES =====
let currentScore = 0;
let roundsCompleted = 0;
let highScore = localStorage.getItem('cricketHigherLowerHighScore') || 0;
let leftPlayer = null;
let rightPlayer = null;
let PLAYERS = [];

// *** NEW: shared sequence for tournament mode ***
let playerSequence = [];   // pre-shuffled indices, used in tournament
let sequenceIndex = 0;     // pointer into the sequence

const POINTS_PER_ROUND = 100;
const MAX_ROUNDS = 10;
const MAX_SCORE = 1000;

// ===== Fisher-Yates shuffle (seeded via stored array, not Math.random) =====
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ===== LOAD PLAYERS =====
async function loadPlayers() {
    console.log('🚀 loadPlayers() - isInTournament:', isInTournament);

    try {
        const response = await fetch('hl.json');
        const data = await response.json();

        let selectedDay = null;
        let selectedDayKey = null;

        if (isInTournament) {
            const tournamentCode = localStorage.getItem('tournamentCode');
            const dayPath = `tournaments/${tournamentCode}/gameData/hl_day`;
            const seqPath = `tournaments/${tournamentCode}/gameData/hl_sequence`;

            const [daySnap, seqSnap] = await Promise.all([
                get(ref(db, dayPath)),
                get(ref(db, seqPath))
            ]);

            if (daySnap.exists()) {
                // ✅ Player 2+ : read existing day AND sequence
                selectedDayKey = daySnap.val();
                selectedDay = data[selectedDayKey];
                playerSequence = seqSnap.val(); // array of indices already stored

                console.log('✅ Read existing seed - day:', selectedDayKey, '| sequence:', playerSequence);
            } else {
                // 🎲 Player 1 (host): pick day, build sequence, write both to Firebase
                const availableDays = Object.keys(data).filter(k => k.startsWith('day'));
                selectedDayKey = availableDays[Math.floor(Math.random() * availableDays.length)];
                selectedDay = data[selectedDayKey];

                // Build a long enough sequence for MAX_ROUNDS + 1 slots
                // Each round needs 2 players; generate indices with no adjacent repeats
                const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
                // Shuffle twice to get a long sequence (repeat if needed)
                let seq = shuffleArray(indices);
                while (seq.length < MAX_ROUNDS + 1) {
                    seq = seq.concat(shuffleArray(indices));
                }
                playerSequence = seq.slice(0, MAX_ROUNDS + 1);

                await Promise.all([
                    set(ref(db, dayPath), selectedDayKey),
                    set(ref(db, seqPath), playerSequence)
                ]);

                console.log('🎲 Wrote new seed - day:', selectedDayKey, '| sequence:', playerSequence);
            }

        } else {
            // Normal solo mode
            localStorage.removeItem('inTournamentGame');
            const dateParam = urlParams.get('date');

            if (dateParam) {
                for (const [key, value] of Object.entries(data)) {
                    if (value.date === dateParam) {
                        selectedDayKey = key;
                        selectedDay = value;
                        break;
                    }
                }
            }

            if (!selectedDay) {
                selectedDayKey = 'day1';
                selectedDay = data.day1;
            }

            // In solo mode, just shuffle randomly — no Firebase needed
            const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
            let seq = shuffleArray(indices);
            while (seq.length < MAX_ROUNDS + 1) seq = seq.concat(shuffleArray(indices));
            playerSequence = seq.slice(0, MAX_ROUNDS + 1);

            console.log('Solo mode - day:', selectedDayKey);
        }

        PLAYERS = selectedDay.players;
        sequenceIndex = 0;

        console.log('Players loaded:', PLAYERS.length, '| Sequence:', playerSequence);
        init();

    } catch (error) {
        console.error('💥 Fatal error loading players:', error);
        alert('Error loading game data!');
    }
}

// ===== INIT =====
function init() {
    if (!sessionStorage.getItem('hlRulesShown')) {
        showRulesModal();
        sessionStorage.setItem('hlRulesShown', 'true');
    }

    document.getElementById('highScore').textContent = highScore;

    if (isInTournament) showTournamentInfo();

    loadNewRound();
}

// ===== ROUND LOGIC =====
function loadNewRound() {
    if (roundsCompleted >= MAX_ROUNDS) {
        endGame(true);
        return;
    }

    if (!leftPlayer) {
        leftPlayer = getNextPlayer();
    }

    // Get a right player that's different from left
    let attempts = 0;
    do {
        rightPlayer = getNextPlayer();
        attempts++;
        // Safety: if sequence is exhausted or stuck, just pick any different player
        if (attempts > 5) {
            const others = PLAYERS.filter(p => p !== leftPlayer);
            rightPlayer = others[Math.floor(Math.random() * others.length)];
            break;
        }
    } while (rightPlayer === leftPlayer || !areComparable(leftPlayer, rightPlayer));

    displayPlayers();
    document.getElementById('higherBtn').disabled = false;
    document.getElementById('lowerBtn').disabled = false;
    document.getElementById('resultMessage').classList.remove('show');
}

// *** KEY CHANGE: use sequence index instead of Math.random() ***
function getNextPlayer() {
    if (sequenceIndex >= playerSequence.length) {
        sequenceIndex = 0; // wrap around (shouldn't happen with MAX_ROUNDS limit)
    }
    const player = PLAYERS[playerSequence[sequenceIndex]];
    sequenceIndex++;
    return player;
}

function areComparable(player1, player2) {
    return getStatCategory(player1.stat) === getStatCategory(player2.stat);
}

function getStatCategory(stat) {
    if (stat.includes('Runs') || stat.includes('IPL')) return 'runs';
    if (stat.includes('Wickets')) return 'wickets';
    if (stat.includes('Sixes')) return 'sixes';
    if (stat.includes('Average')) return 'average';
    return 'other';
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
    return value >= 1000 ? value.toLocaleString() : value;
}

// ===== GUESS =====
function guess(choice) {
    document.getElementById('higherBtn').disabled = true;
    document.getElementById('lowerBtn').disabled = true;

    const isHigher = rightPlayer.value > leftPlayer.value;
    const isCorrect = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    document.getElementById('rightValue').textContent = formatValue(rightPlayer.value);
    document.getElementById('rightValue').className = 'player-value';

    const resultMsg = document.getElementById('resultMessage');

    if (isCorrect) {
        currentScore += POINTS_PER_ROUND;
        roundsCompleted++;

        document.getElementById('currentScore').textContent = currentScore;

        const roundsLeft = MAX_ROUNDS - roundsCompleted;
        const progressText = roundsLeft > 0 ? ` (${roundsLeft} rounds left!)` : ' 🎉 PERFECT!';
        resultMsg.textContent = `✅ Correct! +${POINTS_PER_ROUND} points${progressText}`;
        resultMsg.className = 'result-message show correct';

        document.querySelector('.player-card:not(.left)').classList.add('pulse');

        setTimeout(() => {
            document.querySelector('.player-card:not(.left)').classList.remove('pulse');
            leftPlayer = rightPlayer; // carry right → left (same for all players)
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
            endGame(false);
        }, 2000);
    }
}

// ===== END GAME =====
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
        if (tryAgainBtn) tryAgainBtn.style.display = 'none';

        const existingMsg = gameOverDiv.querySelector('#tournamentCompletionMsg');
        if (existingMsg) existingMsg.remove();

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
            <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">✅ Score Submitted!</p>
            <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">${currentScore} Points</p>
            <p style="font-size: 0.9em; opacity: 0.9;">${roundsCompleted} / ${MAX_ROUNDS} rounds completed</p>
            <p style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">Returning to tournament...</p>
        `;
        gameOverDiv.appendChild(tournamentMsg);

        setTimeout(() => finishGame(currentScore), 2000);
    } else {
        if (tryAgainBtn) tryAgainBtn.style.display = 'block';
        const tournamentMsg = gameOverDiv.querySelector('#tournamentCompletionMsg');
        if (tournamentMsg) tournamentMsg.remove();
    }

    gameOverDiv.classList.add('show');
}

// ===== RESET =====
function resetGame() {
    sessionStorage.removeItem('hlRulesShown');
    currentScore = 0;
    roundsCompleted = 0;
    leftPlayer = null;
    rightPlayer = null;
    sequenceIndex = 0;

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
    localStorage.removeItem('inTournamentGame');
    window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

// ===== GLOBAL EXPORTS =====
window.guess = guess;
window.resetGame = resetGame;
window.finishGame = finishGame;
window.closeRulesModal = closeRulesModal;
window.backToMenu = backToMenu;

// ===== BOOT =====
loadPlayers();