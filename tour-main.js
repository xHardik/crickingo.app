// OLD:
// localStorage.setItem(...)

// NEW:
const TournamentManager = {
    
    async createTournament() {
        const name = document.getElementById('tournamentName').value.trim();
        const creatorName = document.getElementById('creatorName').value.trim();
        const desc = document.getElementById('tournamentDesc').value.trim();
        const duration = document.getElementById('tournamentDuration').value;
        
        if (!name || !creatorName) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Get selected games
        const selectedGames = [];
        document.querySelectorAll('.game-checkbox input:checked').forEach(cb => {
            selectedGames.push(cb.value);
        });
        
        if (selectedGames.length === 0) {
            alert('Please select at least one game');
            return;
        }
        
        // Generate code
        const code = this.generateCode();
        
        const tournamentData = {
            code: code,
            name: name,
            creator: creatorName,
            description: desc,
            duration: parseFloat(duration),
            games: selectedGames,
            participants: {},
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        try {
            await TournamentStorage.createTournament(tournamentData);
            alert(`✅ Tournament Created!\n\nCode: ${code}\n\nShare this code with your friends!`);
            
            // Switch to active tab to see it
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
            await TournamentStorage.addParticipant(code, playerName);
            alert(`✅ Successfully joined tournament: ${code}`);
            
            // Save player name for later use
            localStorage.setItem('currentPlayerName', playerName);
            
            // Switch to my tournaments
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
            const tournaments = await TournamentStorage.getActiveTournaments();
            
            if (tournaments.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Active Tournaments</h3>
                        <p>Create one to get started!</p>
                    </div>
                `;
                return;
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
        const playerName = localStorage.getItem('currentPlayerName');
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
            const tournaments = await TournamentStorage.getMyTournaments(playerName);
            
            if (tournaments.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Tournaments Yet</h3>
                        <p>Join a tournament to get started!</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            tournaments.forEach(tournament => {
                container.innerHTML += this.renderTournamentCard(tournament, true);
            });
            
        } catch (error) {
            console.error('Error loading my tournaments:', error);
            container.innerHTML = '<p style="color:red;">Error loading tournaments</p>';
        }
    },
    
    renderTournamentCard(tournament, showPlayButton = false) {
        const participants = tournament.participants || {};
        const participantCount = Object.keys(participants).length;
        
        // Sort participants by score
        const sortedParticipants = Object.values(participants).sort((a, b) => b.totalScore - a.totalScore);
        
        let participantsHTML = '';
        if (participantCount > 0) {
            participantsHTML = '<div class="participants"><h4>Leaderboard</h4>';
            sortedParticipants.slice(0, 5).forEach((p, idx) => {
                const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
                participantsHTML += `
                    <div class="participant-item">
                        <span class="rank ${rankClass}">#${idx + 1}</span>
                        <span class="participant-name">${p.name}</span>
                        <span class="total-score">${p.totalScore} pts</span>
                    </div>
                `;
            });
            participantsHTML += '</div>';
        }
        
        const playButton = showPlayButton ? 
            `<button class="btn btn-success small-btn" onclick="TournamentManager.startPlaying('${tournament.code}')">🎮 Play Games</button>` : '';
        
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
                    <button class="btn btn-secondary small-btn" onclick="TournamentManager.viewDetails('${tournament.code}')">View Details</button>
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
    
    startPlaying(code) {
        // This will be used later for sequential game flow
        alert('Game flow coming soon!');
    },
    
    viewDetails(code) {
        // Show detailed view
        alert('Details view coming soon!');
    }
};