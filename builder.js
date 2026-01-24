// ===== REPLACE checkTeam() with this dual-mode version =====
function checkTeam() {
    const rating = calculateTeamRating();
    const resultDiv = document.getElementById('result');
    
    // Hide check button and reset button initially
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.querySelector('.reset-btn');
    
    if (rating >= TARGET_RATING) {
        currentSessionScore = rating;
        
        if (isInTournament) {
            // ===== TOURNAMENT MODE =====
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
            
            // Hide buttons in tournament mode
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return after 2 seconds
            setTimeout(() => {
                finishGame(rating);
            }, 2000);
            
        } else {
            // ===== STANDALONE MODE =====
            resultDiv.innerHTML = `
                <div class="result-section success">
                    <div class="result-title">🎉 Congratulations!</div>
                    <div class="result-message">
                        Your team rating is ${rating}!<br>
                        You've successfully built a winning team!
                    </div>
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                        <button onclick="resetTeam()" 
                                style="background: #667eea; color: white; border: none; 
                                       padding: 12px 24px; border-radius: 8px; font-size: 1em; 
                                       font-weight: 600; cursor: pointer;">
                            🔄 Try Again
                        </button>
                        <button onclick="submitScore()" 
                                style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); 
                                       color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                                       font-size: 1em; font-weight: 600; cursor: pointer;">
                            📊 Submit Score
                        </button>
                    </div>
                </div>
            `;
            
            // Keep buttons visible in standalone mode (or hide them as you prefer)
            if (checkBtn) checkBtn.style.display = 'none';
        }
        
    } else {
        // ===== FAILED TO REACH TARGET =====
        const deficit = TARGET_RATING - rating;
        currentSessionScore = 0;
        
        if (isInTournament) {
            // ===== TOURNAMENT MODE - FAILURE =====
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
            
            // Hide buttons
            if (checkBtn) checkBtn.style.display = 'none';
            if (resetBtn) resetBtn.style.display = 'none';
            
            // Auto-return after 2 seconds
            setTimeout(() => {
                finishGame(0);
            }, 2000);
            
        } else {
            // ===== STANDALONE MODE - FAILURE =====
            resultDiv.innerHTML = `
                <div class="result-section failure">
                    <div class="result-title">Not Quite There!</div>
                    <div class="result-message">
                        Your team rating is ${rating}<br>
                        You need ${deficit} more points to win!<br>
                        Try selecting stronger players.
                    </div>
                    <div style="margin-top: 20px;">
                        <button onclick="resetTeam()" 
                                style="background: #667eea; color: white; border: none; 
                                       padding: 12px 24px; border-radius: 8px; font-size: 1em; 
                                       font-weight: 600; cursor: pointer;">
                            🔄 Try Again
                        </button>
                    </div>
                </div>
            `;
            
            // Keep reset button visible
        }
    }
}

// ===== KEEP resetTeam() as is =====
function resetTeam() {
    selectedTeam = [];
    document.getElementById('result').innerHTML = '';
    currentSessionScore = null;
    
    // Show buttons again
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.querySelector('.reset-btn');
    if (checkBtn) checkBtn.style.display = 'block';
    if (resetBtn) resetBtn.style.display = 'block';
    
    renderPlayers();
    updateStats();
    updateSelectedTeam();
}

// ===== KEEP finishGame() exactly as shown earlier =====
function finishGame(finalScore) {
    const isInTournament = localStorage.getItem('inTournamentGame') === 'true';
    
    if (isInTournament) {
        // DON'T clear the flag - let tournament.html clear it
        // Return to tournament with score
        window.location.href = `tournament.html?score=${finalScore}`;
    } else {
        // Normal game end (shouldn't happen, but safety)
        alert(`Game Over! Rating: ${finalScore}`);
    }
}

// ===== DELETE these old functions =====
// Remove: returnToTournament()
// Remove: submitTournamentScore() 
// Remove: The duplicate finishGame() at bottom