import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

const GAMES = [
  { name: "Higher Or Lower", url: "https://crickingo.vercel.app/hl.html" },
  { name: "Cricket Bingo", url: "https://crickingo.vercel.app/rivalry.html" },
  { name: "Transfer History", url: "https://crickingo.vercel.app/transfer.html" },
  { name: "Build Your Team", url: "https://crickingo.vercel.app/builder.html" },
  { name: "Wordle", url: "https://crickingo.vercel.app/wordle.html" }
];

async function loadResults() {
    const code = localStorage.getItem('tournamentCode');
    
    if (!code) {
        alert('No tournament data found!');
        window.location.href = 'tournament.html';
        return;
    }

    const tournamentRef = ref(db, `tournaments/${code}`);
    const snapshot = await get(tournamentRef);

    if (!snapshot.exists()) {
        alert('Tournament not found!');
        window.location.href = 'tournament.html';
        return;
    }

    const tournament = snapshot.val();
    displayResults(tournament);
    createConfetti();
}

function displayResults(tournament) {
    // Set tournament name
    document.getElementById('tournamentName').textContent = tournament.name;

    // Calculate totals
    const players = Object.values(tournament.players);
    const scores = tournament.scores || {};

    const results = players.map(player => {
        let total = 0;
        const gameScores = {};
        
        const playerScores = scores[player.id] || {};
        for (let i = 0; i < GAMES.length; i++) {
            const score = playerScores[`game${i}`] || 0;
            gameScores[`game${i}`] = score;
            total += score;
        }

        return { 
            player, 
            total, 
            gameScores 
        };
    });

    // Sort by total score
    results.sort((a, b) => b.total - a.total);

    // Display podium (top 3)
    displayPodium(results.slice(0, 3));

    // Display full leaderboard
    displayLeaderboard(results);
}

function displayPodium(top3) {
    const podium = document.getElementById('podium');
    podium.innerHTML = '';

    const medals = ['🥇', '🥈', '🥉'];
    const classes = ['first', 'second', 'third'];

    top3.forEach((result, index) => {
        const place = document.createElement('div');
        place.className = `podium-place ${classes[index]}`;
        place.innerHTML = `
            <div class="podium-box">
                <div class="medal">${medals[index]}</div>
                <div class="player-name">${result.player.name}</div>
                <div class="player-score">${result.total}</div>
                <div class="rank-label">${index === 0 ? 'Champion!' : index === 1 ? '2nd Place' : '3rd Place'}</div>
            </div>
        `;
        podium.appendChild(place);
    });
}

function displayLeaderboard(results) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    results.forEach((result, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        
        const row = document.createElement('div');
        row.className = `player-row ${isTop3 ? 'top-3' : ''}`;
        
        const breakdownId = `breakdown-${index}`;
        
        row.innerHTML = `
            <div class="player-info">
                <div class="rank">#${rank}</div>
                <div class="name">${result.player.name}</div>
            </div>
            <div class="total-score">${result.total} pts</div>
            <button class="breakdown-btn" onclick="toggleBreakdown('${breakdownId}')">
                📊 Breakdown
            </button>
        `;
        
        const breakdown = document.createElement('div');
        breakdown.id = breakdownId;
        breakdown.className = 'breakdown';
        
        let breakdownHTML = '';
        GAMES.forEach((game, i) => {
            const score = result.gameScores[`game${i}`] || 0;
            breakdownHTML += `
                <div class="breakdown-item">
                    <span class="game-name">${game.name}</span>
                    <span class="game-score">${score} pts</span>
                </div>
            `;
        });
        
        breakdown.innerHTML = breakdownHTML;
        row.appendChild(breakdown);
        leaderboard.appendChild(row);
    });
}

function toggleBreakdown(id) {
    const breakdown = document.getElementById(id);
    breakdown.classList.toggle('show');
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#FFD700', '#FFA500'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 100);
    }
}

window.toggleBreakdown = toggleBreakdown;

loadResults();