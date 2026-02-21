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
        position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; padding: 12px 25px; border-radius: 25px;
        font-weight: 700; z-index: 1000;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        text-align: center; font-size: 0.9em;
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
let leftPlayer = null;
let rightPlayer = null;
let PLAYERS = [];

let playerSequence = [];
let sequenceIndex = 0;

const POINTS_PER_ROUND = 100;
const MAX_ROUNDS = 10;
const MAX_SCORE = 1000;

// ===== Fisher-Yates shuffle =====
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
                selectedDayKey = daySnap.val();
                selectedDay = data[selectedDayKey];
                playerSequence = seqSnap.val();
            } else {
                const availableDays = Object.keys(data).filter(k => k.startsWith('day'));
                selectedDayKey = availableDays[Math.floor(Math.random() * availableDays.length)];
                selectedDay = data[selectedDayKey];

                const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
                let seq = shuffleArray(indices);
                while (seq.length < MAX_ROUNDS + 1) seq = seq.concat(shuffleArray(indices));
                playerSequence = seq.slice(0, MAX_ROUNDS + 1);

                await Promise.all([
                    set(ref(db, dayPath), selectedDayKey),
                    set(ref(db, seqPath), playerSequence)
                ]);
            }
        } else {
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

            const indices = Array.from({ length: selectedDay.players.length }, (_, i) => i);
            let seq = shuffleArray(indices);
            while (seq.length < MAX_ROUNDS + 1) seq = seq.concat(shuffleArray(indices));
            playerSequence = seq.slice(0, MAX_ROUNDS + 1);
        }

        PLAYERS = selectedDay.players;
        sequenceIndex = 0;

        init();

    } catch (error) {
        console.error('Fatal error loading players:', error);
        alert('Error loading game data!');
    }
}

// ===== INIT =====
function init() {
    if (!sessionStorage.getItem('hlRulesShown')) {
        showRulesModal();
        sessionStorage.setItem('hlRulesShown', 'true');
    }

    if (isInTournament) showTournamentInfo();

    updateScoreDisplay();
    loadNewRound();
}

// ===== UPDATE SCORE DISPLAY =====
function updateScoreDisplay() {
    const el = document.getElementById('currentScore');
    if (el) el.textContent = currentScore + ' pts';
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

    let attempts = 0;
    do {
        rightPlayer = getNextPlayer();
        attempts++;
        if (attempts > 5) {
            const others = PLAYERS.filter(p => p !== leftPlayer);
            rightPlayer = others[Math.floor(Math.random() * others.length)];
            break;
        }
    } while (rightPlayer === leftPlayer || !areComparable(leftPlayer, rightPlayer));

    displayPlayers();
    document.getElementById('higherBtn').disabled = false;
    document.getElementById('lowerBtn').disabled  = false;

    const resultMsg = document.getElementById('resultMessage');
    if (resultMsg) { resultMsg.classList.remove('show'); resultMsg.className = 'result-message'; }

    // Remove card state classes
    document.getElementById('leftCard')?.classList.remove('correct', 'wrong');
    document.getElementById('rightCard')?.classList.remove('correct', 'wrong');
}

function getNextPlayer() {
    if (sequenceIndex >= playerSequence.length) sequenceIndex = 0;
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
    document.getElementById('leftEmoji').textContent  = leftPlayer.image;
    document.getElementById('leftName').textContent   = leftPlayer.name;
    document.getElementById('leftStat').textContent   = leftPlayer.stat;
    document.getElementById('leftValue').textContent  = formatValue(leftPlayer.value);
    document.getElementById('leftValue').className    = 'player-value';

    document.getElementById('rightEmoji').textContent = rightPlayer.image;
    document.getElementById('rightName').textContent  = rightPlayer.name;
    document.getElementById('rightStat').textContent  = rightPlayer.stat;
    document.getElementById('rightValue').textContent = '???';
    document.getElementById('rightValue').className   = 'hidden-value';
}

function formatValue(value) {
    return value >= 1000 ? value.toLocaleString() : value;
}

// ===== GUESS =====
function guess(choice) {
    document.getElementById('higherBtn').disabled = true;
    document.getElementById('lowerBtn').disabled  = true;

    const isHigher  = rightPlayer.value > leftPlayer.value;
    const isCorrect = (choice === 'higher' && isHigher) || (choice === 'lower' && !isHigher);

    // Reveal right value
    document.getElementById('rightValue').textContent = formatValue(rightPlayer.value);
    document.getElementById('rightValue').className   = 'player-value';

    const resultMsg = document.getElementById('resultMessage');
    const rightCard = document.getElementById('rightCard');

    if (isCorrect) {
        currentScore += POINTS_PER_ROUND;
        roundsCompleted++;
        updateScoreDisplay();

        rightCard?.classList.add('correct');

        const roundsLeft = MAX_ROUNDS - roundsCompleted;
        const progressText = roundsLeft > 0 ? ` (${roundsLeft} left)` : ' 🎉 Perfect!';
        if (resultMsg) {
            resultMsg.textContent = `✅ Correct! +${POINTS_PER_ROUND} pts${progressText}`;
            resultMsg.className = 'result-message show correct';
        }

        setTimeout(() => {
            leftPlayer = rightPlayer;
            loadNewRound();
        }, 1500);

    } else {
        rightCard?.classList.add('wrong');

        if (resultMsg) {
            resultMsg.textContent = `❌ Wrong! It was ${rightPlayer.value > leftPlayer.value ? 'HIGHER' : 'LOWER'}`;
            resultMsg.className = 'result-message show wrong';
        }

        setTimeout(() => { endGame(false); }, 2000);
    }
}

// ===== END GAME =====
function endGame(isPerfect = false) {
    document.getElementById('gameArea').style.display = 'none';

    // ── Persist to localStorage so dashboard updates ──
    if (!isInTournament && typeof window.saveGameResult === 'function') {
        window.saveGameResult(currentScore);
    }

    const scoreTextEl = document.getElementById('scoreText');
    if (scoreTextEl) scoreTextEl.textContent = currentScore + ' pts';

    let message = '';
    if (isPerfect && currentScore === MAX_SCORE) message = '🏆 Perfect Score! You got all 10 rounds!';
    else if (currentScore >= 800) message = '🔥 Amazing! Cricket expert!';
    else if (currentScore >= 500) message = '👏 Great job! You know your cricket!';
    else if (currentScore >= 300) message = 'Not bad! Keep practicing!';
    else message = 'Better luck next time!';

    const phraseEl = document.getElementById('resultPhrase');
    if (phraseEl) phraseEl.textContent = message;

    const resultArea = document.getElementById('resultArea');
    const tryAgainBtn = document.getElementById('tryAgainBtn');

    if (isInTournament) {
        if (tryAgainBtn) tryAgainBtn.style.display = 'none';

        const tournamentDiv = document.getElementById('tournamentButtons');
        if (tournamentDiv) {
            tournamentDiv.innerHTML = `
                <div style="margin-top:20px;padding:20px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;color:white;text-align:center;">
                    <p style="font-size:1.1em;font-weight:700;margin-bottom:8px;">✅ Score Submitted!</p>
                    <p style="font-size:2em;font-weight:900;margin:8px 0;">${currentScore} pts</p>
                    <p style="font-size:0.85em;opacity:0.9;">${roundsCompleted} / ${MAX_ROUNDS} rounds · Returning…</p>
                </div>
            `;
        }
        setTimeout(() => finishGame(currentScore), 2000);
    } else {
        if (tryAgainBtn) tryAgainBtn.style.display = '';
    }

    if (resultArea) resultArea.style.display = 'block';
}

// ===== RESET =====
function resetGame() {
    sessionStorage.removeItem('hlRulesShown');
    currentScore = 0;
    roundsCompleted = 0;
    leftPlayer = null;
    rightPlayer = null;
    sequenceIndex = 0;

    const resultArea = document.getElementById('resultArea');
    if (resultArea) resultArea.style.display = 'none';

    const gameArea = document.getElementById('gameArea');
    if (gameArea) gameArea.style.display = 'block';

    updateScoreDisplay();
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
window.guess           = guess;
window.resetGame       = resetGame;
window.finishGame      = finishGame;
window.closeRulesModal = closeRulesModal;
window.backToMenu      = backToMenu;

// ===== BOOT =====
loadPlayers();