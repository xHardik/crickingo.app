// UI Manager - Handles all UI rendering and interactions
const UIManager = {
    showCodeModal(code, tournamentName, duration) {
        // Fixed to show 10 minutes
        const durationText = 'Active for 10 minutes';
        
        const modal = document.createElement('div');
        modal.id = 'codeModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.9); z-index: 2000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px; animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
                        backdrop-filter: blur(20px); border: 2px solid rgba(102, 126, 234, 0.5);
                        border-radius: 20px; padding: 40px; max-width: 500px; width: 100%;
                        text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        animation: slideUp 0.4s ease-out;">
                <div style="font-size: 3em; margin-bottom: 20px;">🎉</div>
                <h2 style="color: white; font-size: 2em; margin-bottom: 15px;">Tournament Created!</h2>
                <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px; font-size: 1.1em;">"${tournamentName}"</p>
                <p style="color: rgba(255, 215, 0, 0.9); margin-bottom: 25px; font-size: 0.9em;">⏱️ ${durationText}</p>
                
                <div style="background: rgba(0, 0, 0, 0.4); padding: 25px; border-radius: 15px;
                            margin-bottom: 25px; border: 2px solid #667eea;">
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 10px;">Share this code:</p>
                    <div style="font-size: 3em; font-weight: 800; color: #ffd700; letter-spacing: 8px;
                                font-family: monospace; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                                margin: 15px 0;">${code}</div>
                </div>
                
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button onclick="UIManager.copyCode('${code}')" class="btn small-btn">📋 Copy Code</button>
                    <button onclick="UIManager.shareCode('${code}', '${tournamentName}')" class="btn small-btn btn-success">📤 Share</button>
                    <button onclick="UIManager.closeModal()" class="btn small-btn btn-secondary">View Tournaments</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    copyCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            alert(`✅ Code copied: ${code}\n\nShare it with your friends!`);
        }).catch(() => {
            alert(`Tournament Code: ${code}`);
        });
    },

    shareCode(code, name) {
        const text = `🏏 Join "${name}"!\n\nCode: ${code}\n\nCompete in real-time Cricket matches!`;
        
        if (navigator.share) {
            navigator.share({ title: name, text }).catch(() => {
                navigator.clipboard.writeText(text);
                alert(`✅ Share text copied!\n\n${text}`);
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert(`✅ Share text copied!\n\n${text}`);
            }).catch(() => {
                alert(text);
            });
        }
    },

    closeModal() {
        const modal = document.getElementById('codeModal');
        if (modal) modal.remove();
        switchTab('my-tournaments');
    },

    renderTournamentCard(tournament, isMyTournament) {
        const gameNames = {
            'hl': '📈 Higher or Lower',
            'transfer': '🔄 Transfer History',
            'rivalry': '🎯 Cricket Bingo',
            'wordle': '🔤 Cricket Wordle',
            'builder': '👥 Build Your Team'
        };

        const isExpired = tournament.expiresAt && new Date(tournament.expiresAt) < new Date();
        const actualStatus = isExpired ? 'expired' : tournament.status;
        
        let timeRemaining = '';
        if (tournament.expiresAt && !isExpired) {
            const diffMs = new Date(tournament.expiresAt) - new Date();
            const diffSeconds = Math.ceil(diffMs / 1000);
            const diffMinutes = Math.ceil(diffMs / (1000 * 60));
            
            // Show seconds if less than 1 minute remaining
            if (diffSeconds < 60) {
                timeRemaining = `${diffSeconds} sec left`;
            } else {
                timeRemaining = `${diffMinutes} min left`;
            }
        } else if (!tournament.expiresAt) {
            timeRemaining = 'No expiration';
        }

        const leaderboard = TournamentManager.calculateLeaderboard(tournament);
        const hasActiveMatches = tournament.activeMatches && tournament.activeMatches.length > 0;

        return `
            <div class="tournament-card">
                <div class="tournament-header">
                    <div>
                        <div class="tournament-title">
                            ${tournament.name}
                            <span class="status-badge status-${actualStatus}">
                                ${actualStatus === 'active' ? '✅ Active' : actualStatus === 'expired' ? '⏰ Expired' : '✓ Completed'}
                            </span>
                            ${hasActiveMatches ? '<span class="live-badge">🔴 LIVE MATCH</span>' : ''}
                        </div>
                        ${tournament.description ? `<p style="color:rgba(255,255,255,0.7);margin-top:8px;">${tournament.description}</p>` : ''}
                        ${timeRemaining ? `<p style="color:${isExpired ? '#ff6b9d' : '#ffd700'};margin-top:8px;font-weight:600;font-size:0.9em;">⏱️ ${timeRemaining}</p>` : ''}
                    </div>
                    <div class="tournament-code">${tournament.code}</div>
                </div>

                <div class="tournament-info">
                    <strong>Creator:</strong> ${tournament.creator} | 
                    <strong>Players:</strong> ${tournament.participants.length}
                </div>

                <div class="games-list">
                    ${tournament.games.map(g => `<span class="game-badge">${gameNames[g]}</span>`).join('')}
                </div>

                <div class="participants">
                    <h4>🏆 Leaderboard</h4>
                    ${leaderboard.map((p, i) => `
                        <div class="participant-item">
                            <div style="display:flex;align-items:center;gap:15px;">
                                <span class="rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">
                                    ${i + 1}${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}
                                </span>
                                <span class="participant-name">${p.name}${p.name === TournamentManager.currentPlayerName ? ' (You)' : ''}</span>
                            </div>
                            <strong class="total-score">${p.totalScore}</strong>
                        </div>
                    `).join('')}
                </div>

                ${isMyTournament && !isExpired ? `
                    <div class="action-buttons">
                        <button class="btn small-btn btn-success" onclick="MatchManager.viewTournamentLobby('${tournament.code}')">
                            ${hasActiveMatches ? '🔴 View Live Matches' : '🎮 Start New Match'}
                        </button>
                        ${tournament.creator === TournamentManager.currentPlayerName ? `
                            <button class="btn small-btn btn-secondary" onclick="UIManager.shareTournament('${tournament.code}', '${tournament.name}')">
                                📤 Share Tournament
                            </button>
                        ` : ''}
                    </div>
                ` : isExpired ? `
                    <div style="padding:15px;background:rgba(255,107,157,0.2);border-radius:12px;margin-top:15px;text-align:center;color:#ff6b9d;border:2px solid rgba(255,107,157,0.4);">
                        <strong>⏰ Tournament has ended</strong>
                        <p style="font-size:0.9em;margin-top:5px;opacity:0.9;">Final standings above</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    shareTournament(code, name) {
        const text = `🏏 Join "${name}"!\n\nCode: ${code}\n\nCompete in synchronized Cricket matches!`;
        
        if (navigator.share) {
            navigator.share({ title: name, text }).catch(() => {
                navigator.clipboard.writeText(text);
                alert(`✅ Share text copied!\n\n${text}`);
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert(`✅ Share text copied!\n\n${text}`);
            }).catch(() => {
                alert(text);
            });
        }
    }
};