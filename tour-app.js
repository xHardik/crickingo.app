// Main Application - Initializes and coordinates all modules (NO FLICKERING VERSION)
let autoRefreshInterval = null;
let lastMyTournamentsData = null;
let lastActiveTournamentsData = null;

// Tab switching function
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab
    const clickedTab = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))
    );
    if (clickedTab) clickedTab.classList.add('active');
    
    // Show the selected content
    document.getElementById(tabName).classList.add('active');

    // Clear previous auto-refresh
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    // Load data and set up auto-refresh for tournament tabs
    if (tabName === 'my-tournaments') {
        TournamentManager.loadMyTournaments();
        // Use Firebase listeners instead of polling to prevent flickering
        setupMyTournamentsListener();
    } else if (tabName === 'active') {
        TournamentManager.loadActiveTournaments();
        // Use Firebase listeners instead of polling to prevent flickering
        setupActiveTournamentsListener();
    }
}

// NEW: Use Firebase listeners with debouncing for My Tournaments
function setupMyTournamentsListener() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    // Set up interval but with smart comparison to prevent flickering
    autoRefreshInterval = setInterval(async () => {
        try {
            const result = await StorageManager.list('tournament_');
            const currentData = JSON.stringify(result.keys);
            
            // Only reload if data actually changed
            if (currentData !== lastMyTournamentsData) {
                lastMyTournamentsData = currentData;
                TournamentManager.loadMyTournaments();
            }
        } catch (error) {
            console.error('Error checking tournaments:', error);
        }
    }, 3000);
}

// NEW: Use Firebase listeners with debouncing for Active Tournaments
function setupActiveTournamentsListener() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    // Set up interval but with smart comparison to prevent flickering
    autoRefreshInterval = setInterval(async () => {
        try {
            const result = await StorageManager.list('tournament_');
            const currentData = JSON.stringify(result.keys);
            
            // Only reload if data actually changed
            if (currentData !== lastActiveTournamentsData) {
                lastActiveTournamentsData = currentData;
                TournamentManager.loadActiveTournaments();
            }
        } catch (error) {
            console.error('Error checking tournaments:', error);
        }
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tournament manager
    TournamentManager.init();
    
    // Set up game checkbox interactions
    document.querySelectorAll('.game-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.closest('.game-checkbox').classList.toggle('checked', this.checked);
        });
        
        // Initialize checked state
        if (checkbox.checked) {
            checkbox.closest('.game-checkbox').classList.add('checked');
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Esc to close modals/overlays
        if (e.key === 'Escape') {
            const modal = document.getElementById('codeModal');
            const lobby = document.getElementById('lobbyOverlay');
            
            if (modal) UIManager.closeModal();
            if (lobby) MatchManager.closeLobby();
        }
    });

    // Check if returning from a game with a match score
    checkForMatchCompletion();
});

// Check if user just completed a match and needs to submit score
async function checkForMatchCompletion() {
    const matchId = localStorage.getItem('activeMatchId');
    const gameType = localStorage.getItem('currentGame');
    
    if (matchId && gameType) {
        // Check if there's a score to submit
        const scoreKey = `${gameType}_lastScore`;
        const lastScore = localStorage.getItem(scoreKey);
        
        if (lastScore) {
            const playerName = StorageManager.getPlayerName();
            await MatchManager.submitMatchScore(matchId, playerName, parseInt(lastScore));
            
            // Clear the score
            localStorage.removeItem(scoreKey);
            
            // Show notification
            showMatchCompletionNotification(parseInt(lastScore));
        }
    }
}

function showMatchCompletionNotification(score) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        z-index: 3000;
        animation: slideUp 0.4s ease-out;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 10px; text-align: center;">🎯</div>
        <h3 style="margin-bottom: 10px; text-align: center;">Match Score Submitted!</h3>
        <p style="text-align: center; font-size: 1.2em; font-weight: 700;">Score: ${score}</p>
        <p style="text-align: center; font-size: 0.9em; margin-top: 10px; opacity: 0.9;">
            Check the leaderboard to see results!
        </p>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    if (MatchManager.matchCheckInterval) {
        clearInterval(MatchManager.matchCheckInterval);
    }
});

// Make functions available globally
window.switchTab = switchTab;