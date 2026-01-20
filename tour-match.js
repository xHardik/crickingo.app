// Match Manager - Streamlined Tournament Series
const MatchManager = {
    currentTournamentCode: null,
    firebaseUnsubscribe: null,
    currentPlayerName: null,

    generateMatchId() {
        return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get current player name from storage
    getCurrentPlayerName() {
        if (!this.currentPlayerName) {
            this.currentPlayerName = StorageManager.getPlayerName() || 
                                    localStorage.getItem('tournamentPlayerName') || 
                                    'Player';
        }
        return this.currentPlayerName;
    },

    async viewTournamentLobby(code) {
        try {
            console.log('🔍 Looking for tournament with code:', code);
            console.log('🔍 Searching key:', `tournament_${code}`);
            
            // Make sure we have player name
            this.getCurrentPlayerName();
            console.log('👤 Current player:', this.currentPlayerName);
            
            const result = await StorageManager.get(`tournament_${code}`);
            
            console.log('📥 Result received:', result);
            
            if (!result?.value) {
                console.error('❌ Tournament not found!');
                console.log('Checking all stored tournaments...');
                
                const allKeys = await StorageManager.list('tournament_');
                console.log('Available tournament keys:', allKeys);
                
                alert(`❌ Tournament not found!\n\nCode: ${code}\n\nDebug Info:\n- Looking for: tournament_${code}\n- Available tournaments: ${allKeys.keys.length}\n\nCheck console for details.`);
                return;
            }

            const tournament = JSON.parse(result.value);
            console.log('✅ Tournament loaded:', tournament);
            
            this.currentTournamentCode = code;
            this.showMatchLobby(tournament);
        } catch (error) {
            console.error('💥 Error loading tournament:', error);
            alert(`Error loading tournament: ${error.message}\n\nCheck browser console (F12) for details.`);
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
        const playerName = this.getCurrentPlayerName();

        overlay.innerHTML = `
            <div class="details-container">
                <h2>${tournament.name} - Match Lobby</h2>
                <p style="color:rgba(255,255,255,0.7);margin-bottom:5px;">Code: <strong>${tournament.code}</strong></p>
                <p style="color:rgba(255,255,255,0.7);margin-bottom:5px;">You: <strong>${playerName}</strong></p>
                <p style="color:rgba(255,255,255,0.7);margin-bottom:30px;">All players compete together in a synchronized 5-game series!</p>

                <div class="waiting-room">
                    ${!activeSeries ? `
                        <h3 style="color:white;margin-bottom:20px;">🎯 Start Tournament Series</h3>
                        <p style="color:rgba(255,255,255,0.8);margin-bottom:20px;">
                            All ${tournament.participants.length} players will play all 5 games together!
                        </p>
                        <button class="btn" onclick="MatchManager.createTournamentSeries('${tournament.code}')">
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
                                ${this.renderPlayerProgress(activeSeries, tournament.participants, playerName)}
                            </div>

                            <button class="btn" onclick="MatchManager.playCurrentGame('${tournament.code}', '${activeSeries.id}')" 
                                    style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);font-size:1.1em;">
                                ${activeSeries.playerScores[playerName]?.games[activeSeries.currentGameIndex] !== undefined
                                    ? '✅ Waiting for Others...' 
                                    : '🎮 Play Current Game'}
                            </button>
                        </div>
                    `}
                </div>

                ${activeSeries ? `
                    <div style="margin-top:30px;background:rgba(255,255,255,0.1);padding:25px;border-radius:16px;">
                        <h3 style="color:white;margin-bottom:20px;">🏆 Live Leaderboard</h3>
                        ${this.renderLiveLeaderboard(activeSeries, playerName)}
                    </div>
                ` : ''}

                <button class="btn btn-secondary" onclick="MatchManager.closeLobby()" style="margin-top:20px;">Close Lobby</button>
            </div>
        `;

        document.body.appendChild(overlay);
        this.startFirebaseListener(tournament.code);
    },

    renderPlayerProgress(series, participants, currentPlayerName) {
        const currentGameIndex = series.currentGameIndex;
        let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
        
        participants.forEach(participant => {
            const hasCompleted = series.playerScores[participant.name]?.games[currentGameIndex] !== undefined;
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;
                            background:rgba(255,255,255,0.05);border-radius:8px;
                            border:2px solid ${hasCompleted ? '#28a745' : 'rgba(255,255,255,0.2)'};">
                    <span style="color:white;font-weight:600;">
                        ${participant.name}${participant.name === currentPlayerName ? ' (You)' : ''}
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

    renderLiveLeaderboard(series, currentPlayerName) {
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
                        ${player.name}${player.name === currentPlayerName ? ' (You)' : ''}
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
            console.log('🚀 Starting tournament series for code:', tournamentCode);
            
            const result = await StorageManager.get(`tournament_${tournamentCode}`);
            if (!result?.value) {
                alert('❌ Could not load tournament data!');
                return;
            }
            
            const tournament = JSON.parse(result.value);
            console.log('📋 Tournament data:', tournament);

            if (tournament.participants.length < 1) {
                alert('⚠️ Need at least 1 player to start a series!');
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

            console.log('📦 Created series:', series);

            tournament.activeMatches = [series];

            await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
            await StorageManager.set(`match_${matchId}`, JSON.stringify(series));

            console.log('✅ Series saved to storage!');

            alert(`🚀 5-Game Series Started!\n\n${tournament.participants.length} player(s) ready!\n\nAll players can now start Game 1!`);
            
            this.closeLobby();
            this.viewTournamentLobby(tournamentCode);
        } catch (error) {
            console.error('💥 Error creating series:', error);
            alert(`Failed to create series: ${error.message}\n\nCheck console for details.`);
        }
    },

    async playCurrentGame(tournamentCode, matchId) {
        try {
            console.log('🎮 Playing game - Match ID:', matchId);
            
            const playerName = this.getCurrentPlayerName();
            console.log('👤 Player:', playerName);
            
            const matchResult = await StorageManager.get(`match_${matchId}`);
            if (!matchResult?.value) {
                alert('❌ Could not load match data!');
                return;
            }
            
            const series = JSON.parse(matchResult.value);
            console.log('📦 Series data:', series);

            // Check if player already completed this game
            if (series.playerScores[playerName]?.games[series.currentGameIndex] !== undefined) {
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

            console.log('🎯 Opening game:', currentGame);

            alert(`🎮 Game ${series.currentGameIndex + 1}/5: ${gameNames[currentGame]}\n\n✨ Your score will be recorded automatically.\n📊 Return to lobby after finishing!`);
            
            const gameUrl = gameUrls[currentGame];
            if (gameUrl) {
                window.open(gameUrl, '_blank');
            } else {
                alert('Game not available: ' + currentGame);
            }
        } catch (error) {
            console.error('💥 Error starting game:', error);
            alert(`Error: ${error.message}`);
        }
    },

    async submitMatchScore(matchId, playerName, score) {
        try {
            console.log('📊 Submitting score - Match:', matchId, 'Player:', playerName, 'Score:', score);
            
            const result = await StorageManager.get(`match_${matchId}`);
            if (!result?.value) {
                console.error('❌ Match not found!');
                return;
            }

            const series = JSON.parse(result.value);
            const currentGameIndex = series.currentGameIndex;
            
            console.log('Current game index:', currentGameIndex);
            
            // Record player's score for this game
            if (!series.playerScores[playerName]) {
                series.playerScores[playerName] = { total: 0, games: {} };
            }
            
            series.playerScores[playerName].games[currentGameIndex] = score;
            series.playerScores[playerName].total += score;

            console.log('Updated player scores:', series.playerScores);

            // Check if ALL players have completed this game
            const allPlayersCompleted = series.players.every(player => 
                series.playerScores[player]?.games[currentGameIndex] !== undefined
            );

            console.log('All players completed?', allPlayersCompleted);

            if (allPlayersCompleted) {
                // Move to next game
                series.currentGameIndex++;
                
                if (series.currentGameIndex >= series.games.length) {
                    // Series complete!
                    console.log('🏆 Series complete!');
                    await this.completeTournamentSeries(localStorage.getItem('activeTournamentCode'), matchId, series);
                } else {
                    // Save updated series with new game index
                    await StorageManager.set(`match_${matchId}`, JSON.stringify(series));
                    
                    // Update tournament
                    const tournamentCode = localStorage.getItem('activeTournamentCode');
                    if (tournamentCode) {
                        const tournamentResult = await StorageManager.get(`tournament_${tournamentCode}`);
                        if (tournamentResult?.value) {
                            const tournament = JSON.parse(tournamentResult.value);
                            tournament.activeMatches = [series];
                            await StorageManager.set(`tournament_${tournamentCode}`, JSON.stringify(tournament));
                        }
                    }
                    
                    console.log('✅ Moving to next game:', series.currentGameIndex + 1);
                    
                    alert(`✅ Score submitted: ${score} points!\n\n🎉 All players finished! Ready for next game...`);
                }
            } else {
                // Save score and wait for others
                await StorageManager.set(`match_${matchId}`, JSON.stringify(series));
                
                // Update tournament
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
            console.error('💥 Error submitting match score:', error);
            alert(`Error submitting score: ${error.message}`);
        }
    },

    async completeTournamentSeries(tournamentCode, matchId, series) {
        series.status = 'completed';
        series.completedAt = new Date().toISOString();

        // Find winner
        const sortedPlayers = Object.entries(series.playerScores)
            .map(([name, data]) => ({ name, total: data.total }))
            .sort((a, b) => b.total - a.total);
        
        series.winner = sortedPlayers[0].name;

        await StorageManager.set(`match_${matchId}`, JSON.stringify(series));

        // Update tournament with final scores
        const tournamentResult = await StorageManager.get(`tournament_${tournamentCode}`);
        if (tournamentResult?.value) {
            const tournament = JSON.parse(tournamentResult.value);
            tournament.activeMatches = [];
            
            // Add all game scores to tournament participants
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
            console.log('🔔 Tournament updated via Firebase');
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

// Make functions available globally
window.MatchManager = MatchManager;
window.submitMatchScore = MatchManager.submitMatchScore.bind(MatchManager);