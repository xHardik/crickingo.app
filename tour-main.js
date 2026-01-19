// Tournament Manager - Handles tournament creation and management
const TournamentManager = {
    currentPlayerName: '',

    init() {
        this.currentPlayerName = StorageManager.getPlayerName();
        if (this.currentPlayerName) {
            document.getElementById('creatorName').value = this.currentPlayerName;
            document.getElementById('joinPlayerName').value = this.currentPlayerName;
        }
    },

    generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    },

    async createTournament() {
        const creatorName = document.getElementById('creatorName').value.trim();
        const name = document.getElementById('tournamentName').value.trim();
        const desc = document.getElementById('tournamentDesc').value.trim();
        const duration = parseFloat(document.getElementById('tournamentDuration').value);
        
        if (!creatorName || !name) {
            alert('⚠️ Please enter your name and tournament name!');
            return;
        }

        const selectedGames = Array.from(document.querySelectorAll('.game-checkbox input:checked'))
            .map(cb => cb.value);

        if (selectedGames.length === 0) {
            alert('⚠️ Please select at least one game!');
            return;
        }

        this.currentPlayerName = creatorName;
        StorageManager.setPlayerName(creatorName);

        const code = this.generateCode();
        const createdDate = new Date();
        // Changed to 10 minutes instead of days
        const expiresDate = new Date(createdDate.getTime() + 10 * 60 * 1000);
        
        const tournament = {
            code: code,
            name: name,
            description: desc,
            creator: creatorName,
            games: selectedGames,
            participants: [{ name: creatorName, scores: {} }],
            status: 'active',
            createdAt: createdDate.toISOString(),
            expiresAt: expiresDate.toISOString(),
            durationDays: duration,
            activeMatches: []
        };

        try {
            await StorageManager.set(`tournament_${code}`, JSON.stringify(tournament));
            UIManager.showCodeModal(code, name, duration);
            
            // Clear form
            document.getElementById('tournamentName').value = '';
            document.getElementById('tournamentDesc').value = '';
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert(`❌ Failed to create tournament: ${error.message}`);
        }
    },

    async joinTournament() {
        const playerName = document.getElementById('joinPlayerName').value.trim();
        const code = document.getElementById('tournamentCode').value.trim().toUpperCase();

        if (!playerName || !code) {
            alert('Please enter your name and code!');
            return;
        }

        this.currentPlayerName = playerName;
        StorageManager.setPlayerName(playerName);

        try {
            const result = await StorageManager.get(`tournament_${code}`);
            if (!result?.value) {
                alert('❌ Tournament not found! Please check the code.');
                return;
            }

            const tournament = JSON.parse(result.value);

            if (tournament.participants.some(p => p.name === playerName)) {
                alert('You have already joined this tournament!');
                return;
            }

            tournament.participants.push({ name: playerName, scores: {} });
            await StorageManager.set(`tournament_${code}`, JSON.stringify(tournament));
            
            alert(`✅ Successfully joined "${tournament.name}"!`);
            document.getElementById('tournamentCode').value = '';
            
            // Switch to My Tournaments tab
            switchTab('my-tournaments');
        } catch (error) {
            console.error('Error joining tournament:', error);
            alert('Failed to join tournament. Please try again.');
        }
    },

    async loadMyTournaments() {
        const container = document.getElementById('myTournamentsContainer');
        
        if (!container.dataset.loaded) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:white;">Loading...</div>';
        }

        try {
            const result = await StorageManager.list('tournament_');
            
            if (!result?.keys?.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No tournaments yet!</h3>
                        <p>Create or join a tournament to get started.</p>
                    </div>
                `;
                container.dataset.loaded = 'true';
                return;
            }

            const tournaments = [];
            for (let key of result.keys) {
                try {
                    const data = await StorageManager.get(key);
                    if (data?.value) {
                        const t = JSON.parse(data.value);
                        if (t.participants.some(p => p.name === this.currentPlayerName)) {
                            tournaments.push(t);
                        }
                    }
                } catch (e) {
                    console.error('Error loading tournament:', e);
                }
            }

            if (!tournaments.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>You haven't joined any tournaments yet!</h3>
                        <p>Join or create a tournament to compete with friends.</p>
                    </div>
                `;
                container.dataset.loaded = 'true';
                return;
            }

            tournaments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = tournaments.map(t => UIManager.renderTournamentCard(t, true)).join('');
            container.dataset.loaded = 'true';
        } catch (error) {
            console.error('Error loading tournaments:', error);
            container.innerHTML = '<div class="empty-state"><h3>Error loading tournaments</h3></div>';
        }
    },

    async loadActiveTournaments() {
        const container = document.getElementById('activeTournamentsContainer');
        
        if (!container.dataset.loaded) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:white;">Loading...</div>';
        }

        try {
            const result = await StorageManager.list('tournament_');
            
            if (!result?.keys?.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No tournaments yet!</h3>
                        <p>Be the first to create one!</p>
                    </div>
                `;
                container.dataset.loaded = 'true';
                return;
            }

            const tournaments = [];
            const now = new Date();
            
            for (let key of result.keys) {
                try {
                    const data = await StorageManager.get(key);
                    if (data?.value) {
                        const tournament = JSON.parse(data.value);
                        // Only show tournaments that haven't expired
                        const isExpired = tournament.expiresAt && new Date(tournament.expiresAt) < now;
                        if (!isExpired) {
                            tournaments.push(tournament);
                        }
                    }
                } catch (e) {
                    console.error('Error loading tournament:', e);
                }
            }

            if (!tournaments.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No active tournaments!</h3>
                        <p>Create a new tournament to get started.</p>
                    </div>
                `;
                container.dataset.loaded = 'true';
                return;
            }

            tournaments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = tournaments.map(t => UIManager.renderTournamentCard(t, false)).join('');
            container.dataset.loaded = 'true';
        } catch (error) {
            console.error('Error loading tournaments:', error);
            container.innerHTML = '<div class="empty-state"><h3>Error loading tournaments</h3></div>';
        }
    },

    calculateLeaderboard(tournament) {
        return tournament.participants.map(p => ({
            ...p,
            totalScore: Object.values(p.scores).reduce((sum, score) => sum + (score || 0), 0)
        })).sort((a, b) => b.totalScore - a.totalScore);
    }
};