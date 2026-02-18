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

let PLAYERS = [];
const TARGET_RATING = 1850;
const TOTAL_BUDGET = 100;
const MAX_PLAYERS = 11;

let selectedTeam = [];
let currentFilter = 'All';
let currentSessionScore = null;

function showRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal && rulesModal.style.display === 'flex') closeRulesModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeRulesModal(); });
});

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
    infoDiv.innerHTML = `🏆 Tournament Mode`;
    document.body.insertBefore(infoDiv, document.body.firstChild);
}

async function loadPlayersByDate(selectedDate) {
    try {
        const response = await fetch('builder.json');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (!data.datasets || !data.datasets[selectedDate]) throw new Error(`No data for date: ${selectedDate}`);
        return data.datasets[selectedDate].players || [];
    } catch (error) {
        console.error('Error loading players:', error);
        alert(`Failed to load player data: ${error.message}`);
        return [];
    }
}

function getDateFromURL() {
    return urlParams.get('date') || '2026-01-15';
}

async function init() {
    if (urlParams.get('tournament') !== 'true') {
        localStorage.removeItem('inTournamentGame');
    }

    if (!isInTournament) showRulesModal();
    if (isInTournament) showTournamentInfo();

    let selectedDate;

    // ===== TOURNAMENT SEED LOGIC =====
    if (isInTournament) {
        const tournamentCode = localStorage.getItem('tournamentCode');
        const seedPath = `tournaments/${tournamentCode}/gameData/builder_date`;

        try {
            const response = await fetch('builder.json');
            const data = await response.json();
            const availableDates = Object.keys(data.datasets);

            const snapshot = await get(ref(db, seedPath));

            if (snapshot.exists()) {
                // Player 2+: read stored date
                selectedDate = snapshot.val();
                console.log('✅ Read existing builder seed:', selectedDate);
            } else {
                // Player 1: pick random and store
                selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
                await set(ref(db, seedPath), selectedDate);
                console.log('🎲 Wrote new builder seed:', selectedDate);
            }
        } catch (error) {
            console.error('Firebase error, using random fallback:', error);
            try {
                const response = await fetch('builder.json');
                const data = await response.json();
                const availableDates = Object.keys(data.datasets);
                selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
            } catch (e) {
                alert('Failed to load game data.');
                return;
            }
        }
    } else {
        selectedDate = getDateFromURL();
        console.log('Normal mode:', selectedDate);
    }
    // ===== END SEED LOGIC =====

    PLAYERS = await loadPlayersByDate(selectedDate);

    if (PLAYERS.length === 0) {
        document.getElementById('playersGrid').innerHTML = '<p>Failed to load players. Please refresh.</p>';
        return;
    }

    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    const filtered = currentFilter === 'All' ? PLAYERS : PLAYERS.filter(p => p.role === currentFilter);

    grid.innerHTML = filtered.map(player => {
        const isSelected = selectedTeam.some(p => p.name === player.name);
        return `
            <div class="player-card ${isSelected ? 'selected' : ''}" onclick="togglePlayer('${player.name}')">
                <div class="player-header">
                    <div class="player-name">${player.name}</div>
                    <div class="player-price">$${player.price}</div>
                </div>
                <div class="player-role role-${player.role.toLowerCase().replace('-', '-')}">${player.role}</div>
                <div class="player-stats">
                    <div class="stat-item"><div class="stat-item-label">BAT</div><div class="stat-item-value">${player.batting}</div></div>
                    <div class="stat-item"><div class="stat-item-label">BOWL</div><div class="stat-item-value">${player.bowling}</div></div>
                    <div class="stat-item"><div class="stat-item-label">FIELD</div><div class="stat-item-value">${player.fielding}</div></div>
                </div>
            </div>
        `;
    }).join('');
}

function filterPlayers(role, event) {
    currentFilter = role;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    renderPlayers();
}

function togglePlayer(playerName) {
    const player = PLAYERS.find(p => p.name === playerName);
    if (!player) return;

    const index = selectedTeam.findIndex(p => p.name === playerName);
    if (index > -1) {
        selectedTeam.splice(index, 1);
    } else {
        if (selectedTeam.length >= MAX_PLAYERS) { alert('You can only select 11 players!'); return; }
        const budgetUsed = selectedTeam.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
        if (budgetUsed + player.price > TOTAL_BUDGET) { alert('Not enough budget!'); return; }
        selectedTeam.push(player);
    }

    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

function updateStats() {
    const budgetUsed = selectedTeam.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const budgetLeft = TOTAL_BUDGET - budgetUsed;
    const teamRating = calculateTeamRating();

    const budgetElement = document.getElementById('budgetLeft');
    budgetElement.textContent = budgetLeft;
    budgetElement.classList.toggle('over-budget', budgetLeft < 0);

    document.getElementById('playerCount').textContent = `${selectedTeam.length}/${MAX_PLAYERS}`;
    document.getElementById('teamRating').textContent = teamRating;

    const progress = (teamRating / TARGET_RATING) * 100;
    const progressBar = document.getElementById('ratingProgress');
    progressBar.style.width = Math.min(progress, 100) + '%';
    progressBar.classList.toggle('over', progress >= 100);

    document.getElementById('checkBtn').disabled = selectedTeam.length !== MAX_PLAYERS;
}

function updateSelectedTeam() {
    const container = document.getElementById('selectedPlayers');
    if (selectedTeam.length === 0) {
        container.innerHTML = `
            <div class="empty-slot">No players selected</div>
            <div class="empty-slot">Select 11 players to build your team</div>
        `;
        return;
    }
    container.innerHTML = selectedTeam.map(player => `
        <div class="selected-player">
            <div class="selected-player-info">
                <div class="selected-player-name">${player.name}</div>
                <div class="selected-player-role">${player.role}</div>
            </div>
            <div class="selected-player-price">$${player.price}</div>
            <button class="remove-btn" onclick="togglePlayer('${player.name}')">✕</button>
        </div>
    `).join('');

    const remaining = MAX_PLAYERS - selectedTeam.length;
    for (let i = 0; i < remaining; i++) {
        container.innerHTML += `<div class="empty-slot">Empty Slot ${selectedTeam.length + i + 1}</div>`;
    }
}

function calculateTeamRating() {
    return selectedTeam.reduce((total, player) => {
        return total + (Number(player.batting) || 0) + (Number(player.bowling) || 0) + (Number(player.fielding) || 0);
    }, 0);
}

function checkTeam() {
    const rating = calculateTeamRating();
    const resultDiv = document.getElementById('result');

    if (rating >= TARGET_RATING) {
        currentSessionScore = rating;
        if (isInTournament) {
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">Your team rating is ${rating}!<br>You've successfully built a winning team!</div>
                </div>
                <div style="margin-top: 20px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">✅ Score Submitted!</p>
                    <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">${rating} Points</p>
                    <p style="font-size: 0.9em; opacity: 0.9;">Returning to tournament...</p>
                </div>
            `;
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            setTimeout(() => returnToTournament(), 2000);
        } else {
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">Your team rating is ${rating}!<br>You've successfully built a winning team!</div>
                </div>
            `;
        }
    } else {
        const deficit = TARGET_RATING - rating;
        if (isInTournament) {
            currentSessionScore = 0;
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">Your team rating is ${rating}<br>You need ${deficit} more points to win!</div>
                </div>
                <div style="margin-top: 20px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">✅ Score Submitted!</p>
                    <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">0 Points</p>
                    <p style="font-size: 0.9em; opacity: 0.9;">Returning to tournament...</p>
                </div>
            `;
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            setTimeout(() => returnToTournament(), 2000);
        } else {
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">Your team rating is ${rating}<br>You need ${deficit} more points to win!<br>Try selecting stronger players.</div>
                </div>
            `;
        }
    }
}

function resetTeam() {
    selectedTeam = [];
    document.getElementById('result').innerHTML = '';
    currentSessionScore = null;
    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

function backToMenu() { window.location.href = 'index.html'; }

function returnToTournament() {
    const gameIndex = localStorage.getItem('currentGameIndex') || '4';
    localStorage.removeItem('inTournamentGame');
    const score = currentSessionScore || 0;
    window.location.href = `tournament.html?score=${score}&game=${gameIndex}`;
}

window.filterPlayers = filterPlayers;
window.togglePlayer = togglePlayer;
window.checkTeam = checkTeam;
window.resetTeam = resetTeam;
window.returnToTournament = returnToTournament;
window.backToMenu = backToMenu;
window.showRulesModal = showRulesModal;
window.closeRulesModal = closeRulesModal;

init();