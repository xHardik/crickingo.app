// ==== FIREBASE IMPORT ====
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

function showRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.style.display = 'flex';
}

function closeRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.style.display = 'none';
}

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

const SCORING = {
    ATTEMPT_1: 1000, ATTEMPT_2: 800, ATTEMPT_3: 600,
    ATTEMPT_4: 400, ATTEMPT_5: 200, FAILED: 0
};

async function loadData() {
    try {
        const response = await fetch('./wordle.json');
        if (!response.ok) throw new Error('Failed to load wordle.json');
        wordleData = await response.json();
    } catch (error) {
        console.error('Error loading wordle data:', error);
        alert('Error loading game data. Please refresh the page.');
    }
}

function getDateFromURL() {
    return urlParams.get('date') || new Date().toISOString().split('T')[0];
}

function backToMenu() {
    window.location.href = 'index.html';
}

async function initGame() {
    await loadData();

    if (urlParams.get('tournament') !== 'true') {
        localStorage.removeItem('inTournamentGame');
    }

    if (!isInTournament) showRulesModal();
    if (isInTournament && !document.getElementById('tournamentInfo')) showTournamentInfo();

    let dailyGame = null;

    // ===== TOURNAMENT SEED LOGIC =====
    if (isInTournament) {
        const tournamentCode = localStorage.getItem('tournamentCode');
        const seedPath = `tournaments/${tournamentCode}/gameData/wordle_key`;

        try {
            const snapshot = await get(ref(db, seedPath));

            if (snapshot.exists()) {
                const storedKey = snapshot.val();
                dailyGame = wordleData[storedKey];
                console.log('✅ Read existing wordle seed:', storedKey);
            } else {
                const availableGames = Object.keys(wordleData).filter(k => k.startsWith('wordle'));
                const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
                dailyGame = wordleData[randomKey];
                await set(ref(db, seedPath), randomKey);
                console.log('🎲 Wrote new wordle seed:', randomKey);
            }
        } catch (err) {
            console.error('Firebase error, using random fallback:', err);
            const availableGames = Object.keys(wordleData).filter(k => k.startsWith('wordle'));
            const randomKey = availableGames[Math.floor(Math.random() * availableGames.length)];
            dailyGame = wordleData[randomKey];
        }
    } else {
        selectedDate = getDateFromURL();
        const gameKey = `wordle-${selectedDate}`;
        dailyGame = wordleData[gameKey];
        console.log('Normal mode:', gameKey);
    }
    // ===== END SEED LOGIC =====

    if (dailyGame) {
        targetPlayer = dailyGame.player;
        hintCountry = dailyGame.hint_country || '';
        hintPosition = dailyGame.hint_position || '';
    } else {
        const firstKey = Object.keys(wordleData)[0];
        if (firstKey && wordleData[firstKey]) {
            targetPlayer = wordleData[firstKey].player;
            hintCountry = wordleData[firstKey].hint_country || '';
            hintPosition = wordleData[firstKey].hint_position || '';
        } else {
            targetPlayer = "KOHLI";
            hintCountry = "🇮🇳 India";
            hintPosition = "🏏 Batsman";
        }
    }

    currentAttempt = 0; gameOver = false; guesses = []; currentScore = 0;

    createBoard();
    updateStats();
    updateScoreDisplay();
    hideMessage();

    const hintDisplay = document.getElementById('hintDisplay');
    if (hintDisplay) hintDisplay.style.display = 'none';

    document.getElementById('guessInput').disabled = false;
    document.getElementById('submitBtn').disabled = false;

    updateButtonsForMode();
}

function updateButtonsForMode() {
    const resetBtn = document.querySelector('.btn-restart');
    const backBtn  = document.querySelector('.btn-back');
    if (isInTournament) {
        if (resetBtn) resetBtn.style.display = 'none';
        if (backBtn)  backBtn.style.display  = 'none';
    } else {
        if (resetBtn) resetBtn.style.display = '';
        if (backBtn)  backBtn.style.display  = '';
    }
}

function updateScoreDisplay() {
    // Support both old (.score-value) and new (#scoreValue) HTML
    const byId  = document.getElementById('scoreValue');
    const byClass = document.querySelector('.score-value');
    const text = `${currentScore} pts`;
    if (byId)    byId.textContent    = text;
    if (byClass) byClass.textContent = `💰 ${text}`;
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
    if (!guess) { showMessage('Please enter a player name!', 'error'); return; }
    if (guess.length !== targetPlayer.length) { showMessage(`Player name must be ${targetPlayer.length} letters!`, 'error'); return; }
    if (guesses.includes(guess)) { showMessage('You already guessed that name!', 'error'); return; }

    guesses.push(guess);
    displayGuess(guess);
    input.value = '';
    currentAttempt++;
    updateStats();

    if (!gameOver) setTimeout(() => showHint(currentAttempt), 500);

    if (guess === targetPlayer) {
        gameOver = true;
        currentScore = calculateScore(currentAttempt);
        updateScoreDisplay();

        // ── Save to localStorage so dashboard & stats update ──
        if (!isInTournament && typeof window.saveGameResult === 'function') {
            window.saveGameResult(currentScore);
        }

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
            setTimeout(() => finishGame(currentScore), 2000);
        }

    } else if (currentAttempt >= maxAttempts) {
        gameOver = true;
        currentScore = SCORING.FAILED;
        updateScoreDisplay();

        // ── Save 0 pts so the day still gets marked as played ──
        if (!isInTournament && typeof window.saveGameResult === 'function') {
            window.saveGameResult(0);
        }

        showMessage(`😞 Game Over! The answer was ${targetPlayer}`, 'error');
        document.getElementById('guessInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;

        if (isInTournament) {
            showTournamentEndScreen(0, false);
            setTimeout(() => finishGame(0), 2000);
        }
    }
}

function showTournamentEndScreen(score, isWin) {
    const resetBtn = document.querySelector('.btn-restart');
    const backBtn  = document.querySelector('.btn-back');
    if (resetBtn) resetBtn.style.display = 'none';
    if (backBtn)  backBtn.style.display  = 'none';

    const existing = document.getElementById('tournamentButtons');
    if (existing) existing.remove();

    const container = document.querySelector('.page') || document.querySelector('.container');
    const tournamentDiv = document.createElement('div');
    tournamentDiv.id = 'tournamentButtons';
    tournamentDiv.style.cssText = `margin-top: 30px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;`;
    tournamentDiv.innerHTML = `
        <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">✅ Score Submitted!</p>
        <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">${score} Points</p>
        <p style="font-size: 0.9em; opacity: 0.9;">${isWin ? '🎉 Well done!' : '📊 Better luck next time!'}</p>
        <p style="font-size: 0.9em; opacity: 0.9; margin-top: 10px;">Returning to tournament...</p>
    `;
    container.appendChild(tournamentDiv);
}

function displayGuess(guess) {
    const targetLetters = targetPlayer.split('');
    const guessLetters  = guess.split('');
    const letterCount   = {};
    targetLetters.forEach(letter => { letterCount[letter] = (letterCount[letter] || 0) + 1; });

    const results = new Array(guess.length).fill('absent');
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) { results[i] = 'correct'; letterCount[letter]--; }
    });
    guessLetters.forEach((letter, i) => {
        if (results[i] !== 'correct' && targetLetters.includes(letter) && letterCount[letter] > 0) {
            results[i] = 'present'; letterCount[letter]--;
        }
    });

    guessLetters.forEach((letter, i) => {
        const tile = document.getElementById(`tile-${currentAttempt}-${i}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        setTimeout(() => { tile.classList.add(results[i]); }, 100 * i);
    });
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.innerHTML = text;
    msg.className = `message show ${type}`;
    setTimeout(() => { if (type === 'error' || type === 'info') hideMessage(); }, 3000);
}

function hideMessage() {
    const msg = document.getElementById('message');
    msg.className = 'message';
}

function updateStats() {
    const el = document.getElementById('stats');
    if (el) el.textContent = `Attempts: ${currentAttempt} / ${maxAttempts}`;
}

function showHint(attemptNumber) {
    const hintDisplay = document.getElementById('hintDisplay');
    const hintText    = document.getElementById('hintText');
    if (!hintDisplay || !hintText) return;
    if (attemptNumber === 3 && hintCountry) {
        hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry}`;
        hintDisplay.classList.add('show');
    } else if (attemptNumber === 4 && hintPosition) {
        hintText.innerHTML = `<strong>Hint:</strong> ${hintCountry} | ${hintPosition}`;
        hintDisplay.classList.add('show');
    }
}

function resetGame() {
    initGame();
    const input = document.getElementById('guessInput');
    if (input) { input.value = ''; input.focus(); }
}

function finishGame(finalScore) {
    const gameIndex = localStorage.getItem('currentGameIndex') || '3';
    localStorage.removeItem('inTournamentGame');
    window.location.href = `tournament.html?score=${finalScore}&game=${gameIndex}`;
}

window.submitGuess  = submitGuess;
window.resetGame    = resetGame;
window.finishGame   = finishGame;
window.closeRulesModal = closeRulesModal;
window.backToMenu   = backToMenu;

document.addEventListener('DOMContentLoaded', function() {
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitGuess();
        });
    }
});

initGame();