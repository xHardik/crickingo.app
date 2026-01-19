// Storage Module - Handles all data persistence with Firebase
const StorageManager = (function() {
    // We'll load Firebase dynamically
    let database = null;
    let firebaseLoaded = false;

    // Initialize Firebase
    async function initFirebase() {
        if (firebaseLoaded) return;

        try {
            // Load Firebase scripts dynamically
            await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js');

            const firebaseConfig = {
                apiKey: "AIzaSyDde0bljA1h09JgmHFdntCpWnPc3_99NIk",
                authDomain: "crickingo.firebaseapp.com",
                databaseURL: "https://crickingo-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "crickingo",
                storageBucket: "crickingo.firebasestorage.app",
                messagingSenderId: "104616154921",
                appId: "1:104616154921:web:074ee6ac25198164aac938"
            };

            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            firebaseLoaded = true;
            console.log('Firebase initialized successfully!');
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    return {
        data: {},
        listeners: {},

        async init() {
            await initFirebase();
        },

        async set(key, value) {
            this.data[key] = value;
            localStorage.setItem(key, value);
            
            if (firebaseLoaded && database) {
                try {
                    await database.ref(key).set(value);
                } catch (error) {
                    console.error('Firebase set error:', error);
                }
            }
            
            return { key, value };
        },

        async get(key) {
            if (firebaseLoaded && database) {
                try {
                    const snapshot = await database.ref(key).once('value');
                    if (snapshot.exists()) {
                        const value = snapshot.val();
                        this.data[key] = value;
                        localStorage.setItem(key, value);
                        return { key, value };
                    }
                } catch (error) {
                    console.error('Firebase get error:', error);
                }
            }
            
            // Fallback to localStorage
            const localValue = localStorage.getItem(key);
            if (localValue) {
                this.data[key] = localValue;
                return { key, value: localValue };
            }
            
            return null;
        },

        async list(prefix = '') {
            const keys = [];
            
            if (firebaseLoaded && database) {
                try {
                    const snapshot = await database.ref().once('value');
                    if (snapshot.exists()) {
                        const allData = snapshot.val();
                        Object.keys(allData).forEach(key => {
                            if (key.startsWith(prefix)) {
                                keys.push(key);
                                this.data[key] = allData[key];
                                localStorage.setItem(key, allData[key]);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Firebase list error:', error);
                }
            }
            
            // Also check localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix) && !keys.includes(key)) {
                    keys.push(key);
                    this.data[key] = localStorage.getItem(key);
                }
            }
            
            return { keys };
        },

        async delete(key) {
            delete this.data[key];
            localStorage.removeItem(key);
            
            if (firebaseLoaded && database) {
                try {
                    await database.ref(key).remove();
                } catch (error) {
                    console.error('Firebase delete error:', error);
                }
            }
            
            return { key, deleted: true };
        },

        listen(key, callback) {
            if (!firebaseLoaded || !database) {
                console.warn('Firebase not loaded, cannot listen');
                return;
            }
            
            const dbRef = database.ref(key);
            const listener = dbRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const value = snapshot.val();
                    this.data[key] = value;
                    localStorage.setItem(key, value);
                    callback({ key, value });
                }
            });
            
            this.listeners[key] = () => dbRef.off('value', listener);
            return this.listeners[key];
        },

        unlisten(key) {
            if (this.listeners[key]) {
                this.listeners[key]();
                delete this.listeners[key];
            }
        },

        getPlayerName() {
            return localStorage.getItem('tournamentPlayerName') || '';
        },

        setPlayerName(name) {
            localStorage.setItem('tournamentPlayerName', name);
        }
    };
})();

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
});