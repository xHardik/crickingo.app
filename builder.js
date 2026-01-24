// BUILD YOUR XI - TOURNAMENT INTEGRATION (Simplified to match Higher/Lower)

// ===== AT THE TOP OF THE FILE =====
// Simple tournament detection (matches Higher/Lower pattern)
const isInTournament = localStorage.getItem('inTournamentGame') === 'true';

// Remove these lines:
// const isTournamentMode = localStorage.getItem('activeMatchId') !== null;
// const isSeriesMatch = localStorage.getItem('isSeriesMatch') === 'true';

// ===== REPLACE showTournamentInfo() =====
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

// ===== UPDATE init() =====
async function init() {
    // Show tournament banner if in tournament mode
    if (isInTournament) {
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

// ===== REPLACE checkTeam() entirely =====
function checkTeam() {
    const rating = calculateTeamRating();
    const resultDiv = document.getElementById('result');
    
    if (rating >= TARGET_RATING) {
        currentSessionScore = rating;
        
        if (isInTournament) {
            // TOURNAMENT MODE - Auto-redirect like Higher/Lower
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">
                        Your team rating is ${rating}!<br>
                        You've successfully built a winning team!
                    </div>
                    <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white; text-align: center;">
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
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return after 2 seconds (SAME AS HIGHER/LOWER)
            setTimeout(() => {
                finishGame(rating);
            }, 2000);
            
        } else {
            // NORMAL MODE - Regular play
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
        currentSessionScore = 0;
        
        if (isInTournament) {
            // TOURNAMENT MODE - Auto-redirect
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">
                        Your team rating is ${rating}<br>
                        You need ${deficit} more points to win!
                    </div>
                    <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white; text-align: center;">
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
                </div>
            `;
            
            // Hide normal buttons
            const checkBtn = document.getElementById('checkBtn');
            const resetBtn = document.querySelector('.reset-btn');
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return after 2 seconds
            setTimeout(() => {
                finishGame(0);
            }, 2000);
            
        } else {
            // NORMAL MODE
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

// ===== ADD finishGame() function (SAME AS HIGHER/LOWER) =====
function finishGame(finalScore) {
    const isInTournament = localStorage.getItem('inTournamentGame') === 'true';
    
    if (isInTournament) {
        // DON'T clear the flag - let tournament.html clear it
        // Return to tournament with score
        window.location.href = `tournament.html?score=${finalScore}`;
    } else {
        // Normal game end
        alert(`Game Over! Rating: ${finalScore}`);
    }
}

// ===== REMOVE THESE FUNCTIONS ENTIRELY =====
// Delete: returnToTournament()
// Delete: submitTournamentScore()
// Delete: The duplicate finishGame() at the bottom of the file