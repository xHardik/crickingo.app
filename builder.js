// Build Your XI with Tournament Integration

// Check both localStorage flag AND URL parameter for tournament mode
const urlParams = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' && 
                       urlParams.get('tournament') === 'true';

// Global variables
let PLAYERS = [];
const TARGET_RATING = 1850;
const TOTAL_BUDGET = 100;
const MAX_PLAYERS = 11;

let selectedTeam = [];
let currentFilter = 'All';
let currentSessionScore = null;

// ===== MODAL FUNCTIONS =====

// Show rules modal on page load
function showRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

// Close rules modal
function closeRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}

// ESC key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const rulesModal = document.getElementById('rulesModal');
        if (rulesModal && rulesModal.style.display === 'flex') {
            closeRulesModal();
        }
    }
});

// Click outside to close
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('rulesModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeRulesModal();
            }
        });
    }
});

// ===== END MODAL FUNCTIONS =====

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
    infoDiv.innerHTML = `🏆 Tournament Mode`;
    document.body.insertBefore(infoDiv, document.body.firstChild);
}

// Load players data from JSON
async function loadPlayersByDate(selectedDate) {
    try {
        const response = await fetch('builder.json');
        if (!response.ok) {
            throw new Error('Network error');
        }
        
        const data = await response.json();
        
        if (!data.datasets || !data.datasets[selectedDate]) {
            throw new Error(`No data for date: ${selectedDate}`);
        }
        
        return data.datasets[selectedDate].players || [];
    } catch (error) {
        console.error('Error loading players:', error);
        alert(`Failed to load player data: ${error.message}`);
        return [];
    }
}

// Get date from URL parameter
function getDateFromURL() {
    return urlParams.get('date') || '2026-01-15';
}

// Initialize the app
async function init() {
    // Clear tournament flag if NOT coming from tournament mode
    if (urlParams.get('tournament') !== 'true') {
        localStorage.removeItem('inTournamentGame');
    }
    
    // Show rules modal first (only in non-tournament mode)
    if (!isInTournament) {
        showRulesModal();
    }
    
    // Show tournament banner if in tournament mode
    if (isInTournament) {
        showTournamentInfo();
    }
    
    let selectedDate;
    
    if (isInTournament) {
        // TOURNAMENT MODE - randomly select from available datasets
        try {
            const response = await fetch('builder.json');
            const data = await response.json();
            const availableDates = Object.keys(data.datasets);
            
            if (availableDates.length === 0) {
                alert('No game data available. Returning to menu.');
                backToMenu();
                return;
            }
            
            // Pick a random date
            selectedDate = availableDates[Math.floor(Math.random() * availableDates.length)];
            console.log(`Tournament mode: Selected random dataset "${selectedDate}"`);
            
        } catch (error) {
            console.error('Error loading datasets:', error);
            alert('Failed to load game data.');
            return;
        }
    } else {
        // NORMAL MODE - use date from URL
        selectedDate = getDateFromURL();
        console.log(`Normal mode: Using date-based dataset "${selectedDate}"`);
    }
    
    // Load players for the selected date
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

function filterPlayers(role, event) {
    currentFilter = role;
    
    // Remove active from all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    renderPlayers();
}

function togglePlayer(playerName) {
    const player = PLAYERS.find(p => p.name === playerName);
    
    if (!player) {
        console.error('Player not found:', playerName);
        return;
    }
    
    const index = selectedTeam.findIndex(p => p.name === playerName);
    
    if (index > -1) {
        selectedTeam.splice(index, 1);
    } else {
        if (selectedTeam.length >= MAX_PLAYERS) {
            alert('You can only select 11 players!');
            return;
        }
        
        const budgetUsed = selectedTeam.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
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
        const batting = Number(player.batting) || 0;
        const bowling = Number(player.bowling) || 0;
        const fielding = Number(player.fielding) || 0;
        return total + batting + bowling + fielding;
    }, 0);
}

function checkTeam() {
    const rating = calculateTeamRating();
    const resultDiv = document.getElementById('result');
    
    if (rating >= TARGET_RATING) {
        currentSessionScore = rating;
        
        if (isInTournament) {
            // Tournament mode - show tournament end screen
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">
                        Your team rating is ${rating}!<br>
                        You've successfully built a winning team!
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">
                        ✅ Score Submitted!
                    </p>
                    <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">
                        ${rating} Points
                    </p>
                    <p style="font-size: 0.9em; opacity: 0.9;">
                        Returning to tournament...
                    </p>
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return to tournament after 2 seconds
            setTimeout(() => {
                returnToTournament();
            }, 2000);
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
            `;
        }
        
    } else {
        const deficit = TARGET_RATING - rating;
        
        if (isInTournament) {
            // Tournament mode - submit 0 score
            currentSessionScore = 0;
            
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">
                        Your team rating is ${rating}<br>
                        You need ${deficit} more points to win!
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
                    <p style="font-size: 1.2em; font-weight: 700; margin-bottom: 10px;">
                        ✅ Score Submitted!
                    </p>
                    <p style="font-size: 2em; font-weight: 900; margin: 10px 0;">
                        0 Points
                    </p>
                    <p style="font-size: 0.9em; opacity: 0.9;">
                        Returning to tournament...
                    </p>
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return to tournament after 2 seconds
            setTimeout(() => {
                returnToTournament();
            }, 2000);
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

function backToMenu() {
    window.location.href = 'index.html';
}

function returnToTournament() {
    // Get the current game index from localStorage
    const gameIndex = localStorage.getItem('currentGameIndex') || '4';
    
    // Clear the tournament flag
    localStorage.removeItem('inTournamentGame');
    
    // Get the final score (rating if passed, 0 if failed)
    const score = currentSessionScore || 0;
    
    // Redirect back to tournament with score and correct game index
    window.location.href = `tournament.html?score=${score}&game=${gameIndex}`;
}

// Make functions globally accessible
window.filterPlayers = filterPlayers;
window.togglePlayer = togglePlayer;
window.checkTeam = checkTeam;
window.resetTeam = resetTeam;
window.returnToTournament = returnToTournament;
window.backToMenu = backToMenu;
window.showRulesModal = showRulesModal;
window.closeRulesModal = closeRulesModal;

// Start the app when page loads
init();