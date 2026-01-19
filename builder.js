// Build Your XI with Tournament Integration

// Tournament Detection
const isTournamentMode = localStorage.getItem('activeMatchId') !== null;
const isSeriesMatch = localStorage.getItem('isSeriesMatch') === 'true';

// Global variables
let PLAYERS = [];
const TARGET_RATING = 1850;
const TOTAL_BUDGET = 100;
const MAX_PLAYERS = 11;

let selectedTeam = [];
let currentFilter = 'All';
let playerName = localStorage.getItem('buildXIPlayerName') || '';
let currentSessionScore = null;

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

// Load players data from JSON
async function loadPlayersByDate(selectedDate) {
    try {
        const response = await fetch('builder.json');
        const data = await response.json();
        return data.datasets[selectedDate].players;
    } catch (error) {
        console.error('Error loading players:', error);
        alert('Failed to load player data. Please refresh the page.');
        return [];
    }
}

// Initialize the app
async function init() {
    // Show tournament banner if in series mode
    if (isSeriesMatch) {
        showTournamentInfo();
    }
    
    // Load players for the current date
    PLAYERS = await loadPlayersByDate('2026-01-15');
    
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
    const filtered = currentFilter === 'All' 
        ? PLAYERS 
        : PLAYERS.filter(p => p.role === currentFilter);
    
    grid.innerHTML = filtered.map(player => {
        const isSelected = selectedTeam.some(p => p.name === player.name);
        const roleClass = player.role.toLowerCase().replace('-', '-');
        
        return `
            <div class="player-card ${isSelected ? 'selected' : ''}" 
                 onclick="togglePlayer('${player.name}')">
                <div class="player-header">
                    <div class="player-name">${player.name}</div>
                    <div class="player-price">$${player.price}</div>
                </div>
                <div class="player-role role-${roleClass}">${player.role}</div>
                <div class="player-stats">
                    <div class="stat-item">
                        <div class="stat-item-label">BAT</div>
                        <div class="stat-item-value">${player.batting}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-label">BOWL</div>
                        <div class="stat-item-value">${player.bowling}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-item-label">FIELD</div>
                        <div class="stat-item-value">${player.fielding}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterPlayers(role) {
    currentFilter = role;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderPlayers();
}

function togglePlayer(playerName) {
    const player = PLAYERS.find(p => p.name === playerName);
    const index = selectedTeam.findIndex(p => p.name === playerName);
    
    if (index > -1) {
        selectedTeam.splice(index, 1);
    } else {
        if (selectedTeam.length >= MAX_PLAYERS) {
            alert('You can only select 11 players!');
            return;
        }
        
        const budgetUsed = selectedTeam.reduce((sum, p) => sum + p.price, 0);
        if (budgetUsed + player.price > TOTAL_BUDGET) {
            alert('Not enough budget!');
            return;
        }
        
        selectedTeam.push(player);
    }
    
    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

function updateStats() {
    const budgetUsed = selectedTeam.reduce((sum, p) => sum + p.price, 0);
    const budgetLeft = TOTAL_BUDGET - budgetUsed;
    const teamRating = calculateTeamRating();
    
    document.getElementById('budgetLeft').textContent = budgetLeft;
    document.getElementById('budgetLeft').classList.toggle('over-budget', budgetLeft < 0);
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
        return total + player.batting + player.bowling + player.fielding;
    }, 0);
}

function checkTeam() {
    const rating = calculateTeamRating();
    const resultDiv = document.getElementById('result');
    
    if (rating >= TARGET_RATING) {
        currentSessionScore = rating;
        submitTournamentScore(rating);
        
        if (isSeriesMatch) {
            // Tournament mode - show tournament end screen
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">
                        Your team rating is ${rating}!<br>
                        You've successfully built a winning team!
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button onclick="returnToTournament()" 
                            style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                                   color: white; border: none; padding: 15px 30px; border-radius: 12px;
                                   font-size: 1.1em; font-weight: 700; cursor: pointer;
                                   box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
                        📊 Return to Tournament Lobby
                    </button>
                    <p style="color: #667eea; margin-top: 15px; font-weight: 600; font-size: 1.1em;">
                        ✅ Score Submitted: ${rating} points
                    </p>
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
        } else {
            // Normal mode - show regular results
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">
                        Your team rating is ${rating}!<br>
                        You've successfully built a winning team!
                    </div>
                </div>
                ${!playerName ? `
                <div class="name-input-section">
                    <h3>Save your score to the leaderboard!</h3>
                    <div class="name-input-group">
                        <input type="text" class="name-input" id="nameInput" placeholder="Enter your name" maxlength="20">
                        <button class="submit-score-btn" onclick="submitScore()">Submit Score</button>
                    </div>
                </div>
                ` : `
                <div class="name-input-section">
                    <h3>Want to save this score?</h3>
                    <button class="submit-score-btn" onclick="submitScore()">Submit as ${playerName}</button>
                    <button class="submit-score-btn" onclick="playerName=''; checkTeam();" style="background:#6c757d; margin-left:10px;">Different Name</button>
                </div>
                `}
            `;
        }
    } else {
        const deficit = TARGET_RATING - rating;
        submitTournamentScore(0);
        
        if (isSeriesMatch) {
            // Tournament mode - show tournament end screen
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">
                        Your team rating is ${rating}<br>
                        You need ${deficit} more points to win!
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <button onclick="returnToTournament()" 
                            style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                                   color: white; border: none; padding: 15px 30px; border-radius: 12px;
                                   font-size: 1.1em; font-weight: 700; cursor: pointer;
                                   box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);">
                        📊 Return to Tournament Lobby
                    </button>
                    <p style="color: #667eea; margin-top: 15px; font-weight: 600; font-size: 1.1em;">
                        ✅ Score Submitted: 0 points
                    </p>
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
        } else {
            // Normal mode
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">
                        Your team rating is ${rating}<br>
                        You need ${deficit} more points to win!<br>
                        Try selecting stronger players.
                    </div>
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

function returnToTournament() {
    window.close();
}

async function submitTournamentScore(finalScore) {
    if (!isSeriesMatch) return; // Only submit for tournament games
    
    const matchId = localStorage.getItem('activeMatchId');
    const tournamentCode = localStorage.getItem('activeTournamentCode');
    
    if (!window.opener || !window.opener.TournamentManager) {
        console.error('Cannot access tournament - window.opener not available');
        return;
    }
    
    const playerName = window.opener.TournamentManager.currentPlayerName;
    
    if (matchId && playerName && window.opener && window.opener.MatchManager) {
        try {
            await window.opener.MatchManager.submitMatchScore(matchId, playerName, finalScore);
            console.log('✅ Score submitted successfully:', finalScore);
        } catch (error) {
            console.error('❌ Error submitting score:', error);
        }
    }
}

async function submitScore() {
    const name = playerName || document.getElementById('nameInput')?.value.trim();
    
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    
    if (!currentSessionScore) {
        alert('No score to submit!');
        return;
    }
    
    playerName = name;
    localStorage.setItem('buildXIPlayerName', name);
    
    try {
        const scoreId = `buildxi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await window.storage.set(scoreId, JSON.stringify({
            name: name,
            score: currentSessionScore,
            date: new Date().toISOString(),
            timestamp: Date.now()
        }), true);
        
        alert(`Score saved! Your rating of ${currentSessionScore} is now on the leaderboard!`);
        currentSessionScore = null;
        showLeaderboard();
    } catch (error) {
        console.error('Error saving score:', error);
        alert('Failed to save score. Please try again.');
    }
}

async function showLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    const content = document.getElementById('leaderboardContent');
    modal.classList.add('show');
    
    content.innerHTML = '<div class="loading">Loading scores...</div>';
    
    try {
        const result = await window.storage.list('buildxi_', true);
        
        if (!result || !result.keys || result.keys.length === 0) {
            content.innerHTML = `
                <div class="empty-leaderboard">
                    <h3>No scores yet!</h3>
                    <p>Be the first to make the leaderboard!</p>
                </div>
            `;
            return;
        }
        
        const scores = [];
        for (let key of result.keys) {
            try {
                const data = await window.storage.get(key, true);
                if (data && data.value) {
                    scores.push(JSON.parse(data.value));
                }
            } catch (e) {
                console.error('Error loading score:', e);
            }
        }
        
        scores.sort((a, b) => b.score - a.score);
        const top20 = scores.slice(0, 20);
        
        let html = '<div class="leaderboard-table">';
        
        top20.forEach((entry, index) => {
            const rank = index + 1;
            const isCurrentPlayer = entry.name === playerName;
            const isTop3 = rank <= 3;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            const date = new Date(entry.date).toLocaleDateString();
            
            html += `
                <div class="leaderboard-row ${isTop3 ? 'top-3' : ''} ${isCurrentPlayer ? 'you' : ''}">
                    <div class="leaderboard-rank">
                        ${medal ? `<span class="medal">${medal}</span>` : `#${rank}`}
                    </div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.name}${isCurrentPlayer ? ' (You)' : ''}</div>
                        <div class="leaderboard-date">${date}</div>
                    </div>
                    <div class="leaderboard-score">${entry.score}</div>
                </div>
            `;
        });
        
        html += '</div>';
        content.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        content.innerHTML = `
            <div class="empty-leaderboard">
                <h3>Error loading leaderboard</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.remove('show');
}

// Start the app when page loads
init();