// Combined Tournament & Match Manager
const TournamentManager = {
    currentPlayerName: null,
    firebaseUnsubscribe: null,
    
    // Initialize - call this on page load
    init() {
        this.currentPlayerName = localStorage.getItem('currentPlayerName');
    },
    
    async createTournament() {
        const name = document.getElementById('tournamentName').value.trim();
        const creatorName = document.getElementById('creatorName').value.trim();
        const desc = document.getElementById('tournamentDesc').value.trim();
        const duration = document.getElementById('tournamentDuration').value;
        
        if (!name || !creatorName) {
            alert('Please fill in all required fields');
            return;
        }
        
        const selectedGames = [];
        document.querySelectorAll('.game-checkbox input:checked').forEach(cb => {
            selectedGames.push(cb.value);
        });
        
        if (selectedGames.length === 0) {
            alert('Please select at least one game');
            return;
        }
        
        const code = this.generateCode();
        
        const tournamentData = {
            code: code,
            name: name,
            creator: creatorName,
            description: desc,
            duration: parseFloat(duration),
            games: selectedGames,
            participants: [],
            activeMatches: [],
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        try {
            await StorageManager.set(`tournament_${code}`, JSON.stringify(tournamentData));
            alert(`✅ Tournament Created!\n\nCode: ${code}\n\nShare this code with your friends!`);
            
            switchTab('active');
            this.loadActiveTournaments();
            
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Failed to create tournament. Please try again.');
        }
    },
    
    async joinTournament() {
        const code = document.getElementById('tournamentCode').value.trim().toUpperCase();
        const playerName = document.getElementById('joinPlayerName').value.trim();
        
        if (!code || !playerName) {
            alert('Please enter both code and your name');
            return;
        }
        
        try {
            const result = await StorageManager.get(`tournament_${code}`);
            if (!result?.value) {
                alert('Tournament not found!');
                return;
            }
            
            const tournament = JSON.parse(result.value);
            
            // Check if already joined
            if (tournament.participants.find(p => p.name === playerName)) {
                alert('You have already joined this tournament!');
                return;
            }
            
            // Add participant
            tournament.participants.push({
                name: playerName,
                joinedAt: new Date().toISOString(),
                scores: {}
            });
            
            await StorageManager.set(`tournament_${code}`, JSON.stringify(tournament));
            
            // Save player name
            localStorage.setItem('currentPlayerName', playerName);
            this.currentPlayerName = playerName;
            
            alert(`✅ Successfully joined tournament: ${code}`);
            
            switchTab('my-tournaments');
            this.loadMyTournaments();
            
        } catch (error) {
            console.error('Error joining tournament:', error);
            alert(error.message || 'Failed to join tournament');
        }
    },
    
    async loadActiveTournaments() {
        const container = document.getElementById('activeTournamentsContainer');
        container.innerHTML = '<p style="color:white; text-align:center;">Loading...</p>';
        
        try {
            const result = await StorageManager.list('tournament_');
            
            if (!result?.keys || result.keys.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Active Tournaments</h3>
                        <p>Create one to get started!</p>
                    </div>
                `;
                return;
            }
            
            const tournaments = [];
            for (const key of result.keys) {
                const tournamentResult = await StorageManager.get(key);
                if (tournamentResult?.value) {
                    tournaments.push(JSON.parse(tournamentResult.value));
                }
            }
            
            container.innerHTML = '';
            tournaments.forEach(tournament => {
                container.innerHTML += this.renderTournamentCard(tournament);
            });
            
        } catch (error) {
            console.error('Error loading tournaments:', error);
            container.innerHTML = '<p style="color:red;">Error loading tournaments</p>';
        }
    },
    
    async loadMyTournaments() {
        const playerName = this.currentPlayerName || localStorage.getItem('currentPlayerName');
        const container = document.getElementById('myTournamentsContainer');
        
        if (!playerName) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Tournaments Yet</h3>
                    <p>Join a tournament to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '<p style="color:white; text-align:center;">Loading...</p>';
        
        try {
            const result = await StorageManager.list('tournament_');
            
            if (!result?.keys || result.keys.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Tournaments Yet</h3>
                        <p>Join a tournament to get started!</p>
                    </div>
                `;
                return;
            }
            
            const myTournaments = [];
            for (const key of result.keys) {
                const tournamentResult = await StorageManager.get(key);
                if (tournamentResult?.value) {
                    const tournament = JSON.parse(tournamentResult.value);
                    if (tournament.participants.find(p => p.name === playerName)) {
                        myTournaments.push(tournament);
                    }
                }
            }
            
            if (myTournaments.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Tournaments Yet</h3>
                        <p>Join a tournament to get started!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            myTournaments.forEach(tournament => {
                container.innerHTML += this.renderTournamentCard(tournament, true);
            });
            
        } catch (error) {
            console.error('Error loading my tournaments:', error);
            container.innerHTML = '<p style="color:red;">Error loading tournaments</p>';
        }
    },
    
    renderTournamentCard(tournament, showPlayButton = false) {
        const participantCount = tournament.participants.length;
        
        const sortedParticipants = [...tournament.participants].sort((a, b) => {
            const aTotal = Object.values(a.scores).reduce((sum, score) => sum + score, 0);
            const bTotal = Object.values(b.scores).reduce((sum, score) => sum + score, 0);
            return bTotal - aTotal;
        });
        
        let participantsHTML = '';
        if (participantCount > 0) {
            participantsHTML = '<div class="participants"><h4>Leaderboard</h4>';
            sortedParticipants.slice(0, 5).forEach((p, idx) => {
                const totalScore = Object.values(p.scores).reduce((sum, score) => sum + score, 0);
                const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
                participantsHTML += `
                    <div class="participant-item">
                        <span class="rank ${rankClass}">#${idx + 1}</span>
                        <span class="participant-name">${p.name}</span>
                        <span class="total-score">${totalScore} pts</span>
                    </div>
                `;
            });
            participantsHTML += '</div>';
        }
        
        const playButton = showPlayButton ? 
            `<button class="btn btn-success small-btn" onclick="TournamentManager.viewTournamentLobby('${tournament.code}')">🎮 View Lobby</button>` : '';
        
        return `
            <div class="tournament-card">
                <div class="tournament-header">
                    <div>
                        <div class="tournament-title">${tournament.name}</div>
                        <div class="tournament-info">Created by ${tournament.creator}</div>
                    </div>
                    <div class="tournament-code">${tournament.code}</div>
                </div>
                
                <div class="tournament-info">${tournament.description || 'No description'}</div>
                
                <div class="games-list">
                    ${tournament.games.map(g => `<span class="game-badge">${this.getGameName(g)}</span>`).join('')}
                </div>
                
                <div class="tournament-info">
                    👥 ${participantCount} participant${participantCount !== 1 ? 's' : ''}
                </div>
                
                ${participantsHTML}
                
                <div class="action-buttons">
                    ${playButton}
                </div>
            </div>
        `;
    },
    
    getGameName(gameCode) {
        const names = {
            'hl': '📈 Higher/Lower',
            'transfer': '🔄 Transfer',
            'rivalry': '🎯 Bingo',
            'wordle': '🔤 Wordle',
            'builder': '👥 Builder'
        };
        return names[gameCode] || gameCode;
    },
    
    generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
    
    generateMatchId() {
        return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // MATCH LOBBY FUNCTIONS
    async viewTournamentLobby(code) {
        try {
            const result = await StorageManager.get(`tournament_${code}`);
            if (!result?.value) {
                alert('Tournament not found!');
                return;
            }

            const tournament = JSON.parse(result.value);
            this.showMatchLobby(tournament);
        } catch (error) {
            console.error('Error loading tournament:', error);
            alert('Error loading tournament.');
        }
    },

    showMatchLobby(tournament) {
        const overlay = document.createElement('div');
        overlay.id = 'lobbyOverlay';
        overlay.className = 'overlay';

        const gameNames = {
            'hl': 'Higher or Lower',
            'transfer': 'Transfer History',
            'rivalry': 'Cricket Bingo',
            'wordle': 'Cricket Wordle',
            'builder': 'Build Your Team'
        };

        const activeSeries = tournament.activeMatches?.[0] || null;

        overlay.innerHTML = `
            <div class="details-container">
                <h2>${tournament.name} - Match Lobby</h2>
                <p style="color:rgba(255,255,255,0.7);margin-bottom:30px;">All players compete together in a synchronized 5-game series!</p>

                <div class="waiting-room">
                    ${!activeSeries ? `
                        <h3 style="color:white;margin-bottom:20px;">🎯 Start Tournament Series</h3>
                        <p style="color:rgba(255,255,255,0.8);margin-bottom:20px;">
                            All ${tournament.participants.length} players will play all 5 games together!
                        </p>
                        <button class="btn" onclick="TournamentManager.createTournamentSeries('${tournament.code}')">
                            🚀 Start 5-Game Series for Everyone
                        </button>
                    ` : `
                        <div style="background:linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);padding:30px;border-radius:16px;border:2px solid rgba(102, 126, 234, 0.6);">
                            <h3 style="color:white;margin-bottom:15px;">🔥 Series In Progress</h3>
                            <div style="background:rgba(0,0,0,0.4);padding:20px;border-radius:12px;margin-bottom:20px;">
                                <p style="color:#ffd700;font-size:1.3em;font-weight:700;margin-bottom:10px;">
                                    Game ${activeSeries.currentGameIndex + 1} of 5
                                </p>
                                <p style="color:white;font-size:1.1em;margin-bottom:15px;">
                                    📌 ${gameNames[activeSeries.games[activeSeries.currentGameIndex]]}
                                </p>
                                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;">
                                    ${activeSeries.games.map((game, idx) => `
                                        <div style="flex:1;min-width:80px;padding:10px;border-radius:8px;text-align:center;
                                                    background:${idx < activeSeries.currentGameIndex ? 'rgba(40, 167, 69, 0.3)' : 
                                                               idx === activeSeries.currentGameIndex ? 'rgba(255, 215, 0, 0.3)' : 
                                                               'rgba(255, 255, 255, 0.1)'};
                                                    border:2px solid ${idx < activeSeries.currentGameIndex ? '#28a745' : 
                                                                      idx === activeSeries.currentGameIndex ? '#ffd700' : 
                                                                      'rgba(255, 255, 255, 0.2)'};">
                                            <div style="font-size:0.8em;color:rgba(255,255,255,0.7);">Game ${idx + 1}</div>
                                            <div style="font-size:1.2em;margin-top:5px;">
                                                ${idx < activeSeries.currentGameIndex ? '✅' : 
                                                  idx === activeSeries.currentGameIndex ? '▶️' : '⏳'}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div style="background:rgba(0,0,0,0.4);padding:20px;border-radius:12px;margin-bottom:20px;">
                                <h4 style="color:white;margin-bottom:15px;">👥 Player Progress</h4>
                                ${this.renderPlayerProgress(activeSeries, tournament.participants)}
                            </div>

                            <button class="btn" onclick="TournamentManager.playCurrentGame('${tournament.code}', '${activeSeries.id}')" 
                                    style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);font-size:1.1em;">
                                ${activeSeries.playerScores[this.currentPlayerName]?.games[activeSeries.currentGameIndex] !== undefined
                                    ? '✅ Waiting for Others...' 
                                    : '🎮 Play Current Game'}
                            </button>
                        </div>
                    `}
                </div>

                ${activeSeries ? `
                    <div style="margin-top:30px;background:rgba(255,255,255,0.1);padding:25px;border-radius:16px;">
                        <h3 style="color:white;margin-bottom:20px;">🏆 Live Leaderboard</h3>
                        ${this.renderLiveLeaderboard(activeSeries)}
                    </div>
                ` : ''}

                <button class="btn btn-secondary" onclick="TournamentManager.closeLobby()" style="margin-top:20px;">Close Lobby</button>
            </div>
        `;

        document.body.appendChild(overlay);
        this.startFirebaseListener(tournament.code);
    },

    renderPlayerProgress(series, participants) {
        const currentGameIndex = series.currentGameIndex;
        let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
        
        participants.forEach(participant => {
            const hasCompleted = series.playerScores[participant.name]?.games[currentGameIndex] !== undefined;
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;
                            background:rgba(255,255,255,0.05);border-radius:8px;
                            border:2px solid ${hasCompleted ? '#28a745' : 'rgba(255,255,255,0.2)'};">
                    <span style="color:white;font-weight:600;">
                        ${participant.name}${participant.name === this.currentPlayerName ? ' (You)' : ''}
                    </span>
                    <span style="color:${hasCompleted ? '#28a745' : '#ffd700'};font-weight:700;font-size:1.1em;">
                        ${hasCompleted ? '✅ Done' : '⏳ Playing...'}
                    </span>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },

    renderLiveLeaderboard(series) {
        const scores = Object.entries(series.playerScores).map(([name, data]) => ({
            name,
            total: data.total
        })).sort((a, b) => b.total - a.total);

        return scores.map((player, idx) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;
                        background:rgba(255,255,255,0.08);border-radius:12px;margin-bottom:10px;
                        border:2px solid ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'rgba(255,255,255,0.2)'};">
                <div style="display:flex;align-items:center;gap:15px;">
                    <span style="font-size:1.5em;font-weight:700;min-width:50px;text-align:center;
                                 color:${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#667eea'};">
                        ${idx + 1}${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                    </span>
                    <span style="color:white;font-weight:600;font-size:1.1em;">
                        ${player.name}${player.name === this.currentPlayerName ? ' (You)' : ''}
                    </span>
                </div>
                <span style="color:#ffd700;font-weight:700;font-size:1.3em;">
                    ${player.total}
                </span>
            </div>
        `).join('');
    },

    async createTournamentSeries(tournamentCode) {
        try {
            const result = await StorageManager.get(`tournament_${tournamentCode}`);
            const tournament = JSON.parse(result.value);

            if (tournament.participants.length < 2) {
                alert('⚠️ Need at least 2 players to start a series!');
                return;
            }

            const matchId = this.generateMatchId();
            const playerScores = {};
            tournament.participants.forEach(p => {
                playerScores[p.name] = { total: 0, games: {} };
            });

            const series = {
                id: matchId,
                games: tournament.games,
                currentGameIndex: 0,
                players: tournament.participants.map(p => p.name),
                status: 'active',
                createdAt: new Date().toISOString(),
                playerScores: playerScores
            };

            tournament.activeMatches = [series];

            await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
            await StorageManager.set(`match_${matchId}`, JSON.stringify(series));

            alert(`🚀 5-Game Series Started!\n\n${tournament.participants.length} players ready!\n\nAll players can now start Game 1!`);
            
            this.closeLobby();
            this.viewTournamentLobby(tournamentCode);
        } catch (error) {
            console.error('Error creating series:', error);
            alert('Failed to create series. Please try again.');
        }
    },

    async playCurrentGame(tournamentCode, matchId) {
        try {
            const matchResult = await StorageManager.get(`match_${matchId}`);
            const series = JSON.parse(matchResult.value);

            if (series.playerScores[this.currentPlayerName]?.games[series.currentGameIndex] !== undefined) {
                alert('⏳ You\'ve already completed this game!\n\nWaiting for other players to finish...');
                return;
            }

            if (series.currentGameIndex >= series.games.length) {
                alert('🎉 All games completed! Check the final leaderboard!');
                return;
            }

            const currentGame = series.games[series.currentGameIndex];
            
            localStorage.setItem('activeTournamentCode', tournamentCode);
            localStorage.setItem('activeMatchId', matchId);
            localStorage.setItem('currentGame', currentGame);
            localStorage.setItem('isSeriesMatch', 'true');

            const gameUrls = {
                'hl': 'hl.html',
                'transfer': 'transfer.html',
                'rivalry': 'rivalry.html',
                'wordle': 'wordle.html',
                'builder': 'builder.html'
            };

            const gameNames = {
                'hl': 'Higher or Lower',
                'transfer': 'Transfer History',
                'rivalry': 'Cricket Bingo',
                'wordle': 'Cricket Wordle',
                'builder': 'Build Your Team'
            };

            alert(`🎮 Game ${series.currentGameIndex + 1}/5: ${gameNames[currentGame]}\n\n✨ Your score will be recorded automatically.\n📊 Return to lobby after finishing!`);
            
            const gameUrl = gameUrls[currentGame];
            if (gameUrl) {
                window.open(gameUrl, '_blank');
            }
        } catch (error) {
            console.error('Error starting game:', error);
        }
    },

    async submitMatchScore(matchId, playerName, score) {
        try {
            const result = await StorageManager.get(`match_${matchId}`);
            if (!result?.value) return;

            const series = JSON.parse(result.value);
            const currentGameIndex = series.currentGameIndex;
            
            if (!series.playerScores[playerName]) {
                series.playerScores[playerName] = { total: 0, games: {} };
            }
            
            series.playerScores[playerName].games[currentGameIndex] = score;
            series.playerScores[playerName].total += score;

            const allPlayersCompleted = series.players.every(player => 
                series.playerScores[player]?.games[currentGameIndex] !== undefined
            );

            if (allPlayersCompleted) {
                series.currentGameIndex++;
                
                if (series.currentGameIndex >= series.games.length) {
                    await this.completeTournamentSeries(localStorage.getItem('activeTournamentCode'), matchId, series);
                } else {
                    await StorageManager.set(`match_${matchId}`, JSON.stringify(series));
                    
                    const tournamentCode = localStorage.getItem('activeTournamentCode');
                    if (tournamentCode) {
                        const tournamentResult = await StorageManager.get(`tournament_${tournamentCode}`);
                        if (tournamentResult?.value) {
                            const tournament = JSON.parse(tournamentResult.value);
                            tournament.activeMatches = [series];
                            await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
                        }
                    }
                    
                    alert(`✅ Score submitted: ${score} points!\n\n🎉 All players finished! Starting next game...`);
                    this.openNextGame(tournamentCode, matchId, series);
                }
            } else {
                await StorageManager.set(`match_${matchId}`, JSON.stringify(series));
                
                const tournamentCode = localStorage.getItem('activeTournamentCode');
                if (tournamentCode) {
                    const tournamentResult = await StorageManager.get(`tournament_${tournamentCode}`);
                    if (tournamentResult?.value) {
                        const tournament = JSON.parse(tournamentResult.value);
                        tournament.activeMatches = [series];
                        await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
                    }
                }
                
                alert(`✅ Score submitted: ${score} points!\n\nWaiting for other players to finish Game ${currentGameIndex + 1}...`);
            }

        } catch (error) {
            console.error('Error submitting match score:', error);
        }
    },

    openNextGame(tournamentCode, matchId, series) {
        const currentGame = series.games[series.currentGameIndex];
        
        const gameUrls = {
            'hl': 'hl.html',
            'transfer': 'transfer.html',
            'rivalry': 'rivalry.html',
            'wordle': 'wordle.html',
            'builder': 'builder.html'
        };

        const gameNames = {
            'hl': 'Higher or Lower',
            'transfer': 'Transfer History',
            'rivalry': 'Cricket Bingo',
            'wordle': 'Cricket Wordle',
            'builder': 'Build Your Team'
        };
        
        localStorage.setItem('activeTournamentCode', tournamentCode);
        localStorage.setItem('activeMatchId', matchId);
        localStorage.setItem('currentGame', currentGame);
        localStorage.setItem('isSeriesMatch', 'true');
        
        const gameUrl = gameUrls[currentGame];
        if (gameUrl) {
            window.open(gameUrl, '_blank');
        }
    },

    async completeTournamentSeries(tournamentCode, matchId, series) {
        series.status = 'completed';
        series.completedAt = new Date().toISOString();

        const sortedPlayers = Object.entries(series.playerScores)
            .map(([name, data]) => ({ name, total: data.total }))
            .sort((a, b) => b.total - a.total);
        
        series.winner = sortedPlayers[0].name;

        await StorageManager.set(`match_${matchId}`, JSON.stringify(series));

        const tournamentResult = await StorageManager.get(`tournament_${tournamentCode}`);
        if (tournamentResult?.value) {
            const tournament = JSON.parse(tournamentResult.value);
            tournament.activeMatches = [];
            
            Object.entries(series.playerScores).forEach(([playerName, data]) => {
                const participant = tournament.participants.find(p => p.name === playerName);
                if (participant) {
                    series.games.forEach((game, idx) => {
                        if (!participant.scores[game]) participant.scores[game] = 0;
                        participant.scores[game] += data.games[idx] || 0;
                    });
                }
            });
            
            await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
        }

        let resultsText = `🏆 5-Game Series Complete!\n\n`;
        sortedPlayers.forEach((player, idx) => {
            resultsText += `${idx + 1}. ${player.name}: ${player.total} points\n`;
        });
        resultsText += `\n🥇 Winner: ${series.winner}!`;

        alert(resultsText);
    },

    startFirebaseListener(tournamentCode) {
        if (this.firebaseUnsubscribe) {
            this.firebaseUnsubscribe();
        }

        this.firebaseUnsubscribe = StorageManager.listen(`tournament_${tournamentCode}`, (data) => {
            const tournament = JSON.parse(data.value);
            this.closeLobby();
            this.showMatchLobby(tournament);
        });
    },

    closeLobby() {
        const overlay = document.getElementById('lobbyOverlay');
        if (overlay) overlay.remove();
        
        if (this.firebaseUnsubscribe) {
            this.firebaseUnsubscribe();
            this.firebaseUnsubscribe = null;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    TournamentManager.init();
});

// Make submitMatchScore available globally for game pages
window.submitMatchScore = TournamentManager.submitMatchScore.bind(TournamentManager);