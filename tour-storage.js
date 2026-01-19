const TournamentStorage = {
    
    // Create Tournament
    async createTournament(tournamentData) {
        const tournamentRef = database.ref('tournaments/' + tournamentData.code);
        await tournamentRef.set(tournamentData);
        console.log('✅ Tournament created:', tournamentData.code);
        return tournamentData;
    },
    
    // Get Tournament by Code
    async getTournament(code) {
        const snapshot = await database.ref('tournaments/' + code).once('value');
        return snapshot.val();
    },
    
    // Get All Active Tournaments
    async getActiveTournaments() {
        const snapshot = await database.ref('tournaments').once('value');
        const tournaments = snapshot.val() || {};
        
        const now = Date.now();
        const active = [];
        
        for (let code in tournaments) {
            const tournament = tournaments[code];
            const expiresAt = new Date(tournament.createdAt).getTime() + (tournament.duration * 24 * 60 * 60 * 1000);
            
            if (now < expiresAt) {
                active.push(tournament);
            }
        }
        
        return active;
    },
    
    // Add Participant
    async addParticipant(code, playerName) {
        const tournamentRef = database.ref('tournaments/' + code);
        const snapshot = await tournamentRef.once('value');
        const tournament = snapshot.val();
        
        if (!tournament) {
            throw new Error('Tournament not found');
        }
        
        if (!tournament.participants) {
            tournament.participants = {};
        }
        
        // Check if player already joined
        if (tournament.participants[playerName]) {
            throw new Error('You have already joined this tournament');
        }
        
        tournament.participants[playerName] = {
            name: playerName,
            totalScore: 0,
            gamesCompleted: 0,
            joinedAt: new Date().toISOString()
        };
        
        await tournamentRef.update({ participants: tournament.participants });
        return tournament;
    },
    
    // Submit Match Score
    async submitScore(code, playerName, score) {
        const participantRef = database.ref(`tournaments/${code}/participants/${playerName}`);
        const snapshot = await participantRef.once('value');
        const participant = snapshot.val();
        
        if (!participant) {
            throw new Error('Participant not found');
        }
        
        await participantRef.update({
            totalScore: (participant.totalScore || 0) + score,
            gamesCompleted: (participant.gamesCompleted || 0) + 1,
            lastUpdated: new Date().toISOString()
        });
        
        console.log('✅ Score submitted for', playerName);
    },
    
    // Listen for Tournament Updates (Real-time)
    listenToTournament(code, callback) {
        const tournamentRef = database.ref('tournaments/' + code);
        tournamentRef.on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },
    
    // Stop Listening
    stopListening(code) {
        database.ref('tournaments/' + code).off();
    },
    
    // Get My Tournaments (tournaments where I'm a participant)
    async getMyTournaments(playerName) {
        const snapshot = await database.ref('tournaments').once('value');
        const tournaments = snapshot.val() || {};
        
        const myTournaments = [];
        
        for (let code in tournaments) {
            const tournament = tournaments[code];
            if (tournament.participants && tournament.participants[playerName]) {
                myTournaments.push(tournament);
            }
        }
        
        return myTournaments;
    }
};