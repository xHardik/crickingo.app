// ── EMBEDDED DATA (no fetch needed, works on file://) ──
const PLAYER_DB = [{"name":"Virat Kohli","country":"India","role":"Batter","format":"All","debutYear":2008,"age":35,"bat":"Right"},{"name":"Rohit Sharma","country":"India","role":"Batter","format":"All","debutYear":2007,"age":37,"bat":"Right"},{"name":"Jasprit Bumrah","country":"India","role":"Bowler","format":"All","debutYear":2016,"age":30,"bat":"Right"},{"name":"Ravindra Jadeja","country":"India","role":"All-rounder","format":"All","debutYear":2009,"age":35,"bat":"Left"},{"name":"Ravichandran Ashwin","country":"India","role":"All-rounder","format":"All","debutYear":2010,"age":37,"bat":"Right"},{"name":"Rishabh Pant","country":"India","role":"WK-Batter","format":"All","debutYear":2017,"age":26,"bat":"Left"},{"name":"Shubman Gill","country":"India","role":"Batter","format":"All","debutYear":2019,"age":24,"bat":"Right"},{"name":"Hardik Pandya","country":"India","role":"All-rounder","format":"All","debutYear":2016,"age":30,"bat":"Right"},{"name":"Mohammed Shami","country":"India","role":"Bowler","format":"All","debutYear":2013,"age":33,"bat":"Right"},{"name":"Suryakumar Yadav","country":"India","role":"Batter","format":"T20","debutYear":2021,"age":33,"bat":"Right"},{"name":"Yashasvi Jaiswal","country":"India","role":"Batter","format":"All","debutYear":2023,"age":22,"bat":"Left"},{"name":"KL Rahul","country":"India","role":"WK-Batter","format":"All","debutYear":2015,"age":32,"bat":"Right"},{"name":"Yuzvendra Chahal","country":"India","role":"Bowler","format":"All","debutYear":2016,"age":33,"bat":"Right"},{"name":"Kuldeep Yadav","country":"India","role":"Bowler","format":"All","debutYear":2017,"age":29,"bat":"Left"},{"name":"Arshdeep Singh","country":"India","role":"Bowler","format":"All","debutYear":2022,"age":25,"bat":"Left"},{"name":"Mohammed Siraj","country":"India","role":"Bowler","format":"All","debutYear":2017,"age":30,"bat":"Right"},{"name":"Shreyas Iyer","country":"India","role":"Batter","format":"All","debutYear":2019,"age":29,"bat":"Right"},{"name":"Tilak Varma","country":"India","role":"Batter","format":"T20","debutYear":2023,"age":21,"bat":"Left"},{"name":"Rinku Singh","country":"India","role":"Batter","format":"T20","debutYear":2023,"age":26,"bat":"Left"},{"name":"Axar Patel","country":"India","role":"All-rounder","format":"All","debutYear":2017,"age":30,"bat":"Left"},{"name":"Washington Sundar","country":"India","role":"All-rounder","format":"All","debutYear":2019,"age":24,"bat":"Right"},{"name":"Ishan Kishan","country":"India","role":"WK-Batter","format":"All","debutYear":2021,"age":26,"bat":"Left"},{"name":"Ruturaj Gaikwad","country":"India","role":"Batter","format":"All","debutYear":2021,"age":27,"bat":"Right"},{"name":"Sanju Samson","country":"India","role":"WK-Batter","format":"All","debutYear":2015,"age":29,"bat":"Right"},{"name":"Sachin Tendulkar","country":"India","role":"Batter","format":"All","debutYear":1989,"age":50,"bat":"Right"},{"name":"MS Dhoni","country":"India","role":"WK-Batter","format":"All","debutYear":2004,"age":43,"bat":"Right"},{"name":"Rahul Dravid","country":"India","role":"Batter","format":"All","debutYear":1996,"age":51,"bat":"Right"},{"name":"Sourav Ganguly","country":"India","role":"All-rounder","format":"All","debutYear":1992,"age":52,"bat":"Left"},{"name":"Anil Kumble","country":"India","role":"Bowler","format":"All","debutYear":1990,"age":53,"bat":"Right"},{"name":"Yuvraj Singh","country":"India","role":"All-rounder","format":"All","debutYear":2000,"age":42,"bat":"Left"},{"name":"Harbhajan Singh","country":"India","role":"Bowler","format":"All","debutYear":1998,"age":44,"bat":"Right"},{"name":"Joe Root","country":"England","role":"Batter","format":"All","debutYear":2012,"age":33,"bat":"Right"},{"name":"Ben Stokes","country":"England","role":"All-rounder","format":"All","debutYear":2011,"age":33,"bat":"Left"},{"name":"James Anderson","country":"England","role":"Bowler","format":"Test","debutYear":2003,"age":41,"bat":"Right"},{"name":"Jofra Archer","country":"England","role":"Bowler","format":"All","debutYear":2019,"age":29,"bat":"Right"},{"name":"Stuart Broad","country":"England","role":"Bowler","format":"Test","debutYear":2006,"age":37,"bat":"Right"},{"name":"Jos Buttler","country":"England","role":"WK-Batter","format":"All","debutYear":2011,"age":33,"bat":"Right"},{"name":"Jonny Bairstow","country":"England","role":"WK-Batter","format":"All","debutYear":2011,"age":34,"bat":"Right"},{"name":"Liam Livingstone","country":"England","role":"All-rounder","format":"All","debutYear":2017,"age":30,"bat":"Right"},{"name":"Sam Curran","country":"England","role":"All-rounder","format":"All","debutYear":2018,"age":26,"bat":"Left"},{"name":"Mark Wood","country":"England","role":"Bowler","format":"All","debutYear":2015,"age":34,"bat":"Right"},{"name":"Zak Crawley","country":"England","role":"Batter","format":"Test","debutYear":2020,"age":26,"bat":"Right"},{"name":"Kevin Pietersen","country":"England","role":"Batter","format":"All","debutYear":2004,"age":44,"bat":"Right"},{"name":"Andrew Flintoff","country":"England","role":"All-rounder","format":"All","debutYear":1998,"age":46,"bat":"Right"},{"name":"Steve Smith","country":"Australia","role":"Batter","format":"All","debutYear":2010,"age":35,"bat":"Right"},{"name":"Pat Cummins","country":"Australia","role":"Bowler","format":"All","debutYear":2011,"age":31,"bat":"Right"},{"name":"David Warner","country":"Australia","role":"Batter","format":"All","debutYear":2009,"age":37,"bat":"Left"},{"name":"Mitchell Starc","country":"Australia","role":"Bowler","format":"All","debutYear":2010,"age":34,"bat":"Left"},{"name":"Travis Head","country":"Australia","role":"Batter","format":"All","debutYear":2016,"age":30,"bat":"Left"},{"name":"Nathan Lyon","country":"Australia","role":"Bowler","format":"Test","debutYear":2011,"age":36,"bat":"Right"},{"name":"Glenn Maxwell","country":"Australia","role":"All-rounder","format":"All","debutYear":2012,"age":35,"bat":"Right"},{"name":"Josh Hazlewood","country":"Australia","role":"Bowler","format":"All","debutYear":2014,"age":33,"bat":"Right"},{"name":"Marnus Labuschagne","country":"Australia","role":"Batter","format":"Test","debutYear":2018,"age":30,"bat":"Right"},{"name":"Mitchell Marsh","country":"Australia","role":"All-rounder","format":"All","debutYear":2013,"age":32,"bat":"Right"},{"name":"Adam Gilchrist","country":"Australia","role":"WK-Batter","format":"All","debutYear":1996,"age":52,"bat":"Left"},{"name":"Ricky Ponting","country":"Australia","role":"Batter","format":"All","debutYear":1995,"age":49,"bat":"Right"},{"name":"Shane Warne","country":"Australia","role":"Bowler","format":"All","debutYear":1992,"age":52,"bat":"Right"},{"name":"Matthew Hayden","country":"Australia","role":"Batter","format":"All","debutYear":1994,"age":52,"bat":"Left"},{"name":"Glenn McGrath","country":"Australia","role":"Bowler","format":"All","debutYear":1993,"age":54,"bat":"Right"},{"name":"Brett Lee","country":"Australia","role":"Bowler","format":"All","debutYear":1999,"age":47,"bat":"Right"},{"name":"Kane Williamson","country":"New Zealand","role":"Batter","format":"All","debutYear":2010,"age":33,"bat":"Right"},{"name":"Trent Boult","country":"New Zealand","role":"Bowler","format":"All","debutYear":2011,"age":34,"bat":"Right"},{"name":"Tim Southee","country":"New Zealand","role":"Bowler","format":"All","debutYear":2008,"age":35,"bat":"Right"},{"name":"Devon Conway","country":"New Zealand","role":"WK-Batter","format":"All","debutYear":2021,"age":32,"bat":"Left"},{"name":"Martin Guptill","country":"New Zealand","role":"Batter","format":"All","debutYear":2009,"age":37,"bat":"Right"},{"name":"Brendon McCullum","country":"New Zealand","role":"WK-Batter","format":"All","debutYear":2002,"age":42,"bat":"Right"},{"name":"Ross Taylor","country":"New Zealand","role":"Batter","format":"All","debutYear":2006,"age":40,"bat":"Right"},{"name":"Kyle Jamieson","country":"New Zealand","role":"Bowler","format":"All","debutYear":2020,"age":29,"bat":"Right"},{"name":"Neil Wagner","country":"New Zealand","role":"Bowler","format":"Test","debutYear":2012,"age":38,"bat":"Right"},{"name":"Babar Azam","country":"Pakistan","role":"Batter","format":"All","debutYear":2015,"age":29,"bat":"Right"},{"name":"Shaheen Afridi","country":"Pakistan","role":"Bowler","format":"All","debutYear":2018,"age":24,"bat":"Left"},{"name":"Mohammad Rizwan","country":"Pakistan","role":"WK-Batter","format":"All","debutYear":2015,"age":31,"bat":"Right"},{"name":"Shadab Khan","country":"Pakistan","role":"All-rounder","format":"All","debutYear":2017,"age":25,"bat":"Right"},{"name":"Naseem Shah","country":"Pakistan","role":"Bowler","format":"All","debutYear":2020,"age":21,"bat":"Right"},{"name":"Fakhar Zaman","country":"Pakistan","role":"Batter","format":"All","debutYear":2017,"age":33,"bat":"Left"},{"name":"Wasim Akram","country":"Pakistan","role":"Bowler","format":"All","debutYear":1984,"age":58,"bat":"Left"},{"name":"Shoaib Akhtar","country":"Pakistan","role":"Bowler","format":"All","debutYear":1997,"age":49,"bat":"Right"},{"name":"Imran Khan","country":"Pakistan","role":"All-rounder","format":"All","debutYear":1971,"age":72,"bat":"Right"},{"name":"Kagiso Rabada","country":"South Africa","role":"Bowler","format":"All","debutYear":2014,"age":29,"bat":"Right"},{"name":"Quinton de Kock","country":"South Africa","role":"WK-Batter","format":"All","debutYear":2012,"age":31,"bat":"Left"},{"name":"Aiden Markram","country":"South Africa","role":"Batter","format":"All","debutYear":2017,"age":29,"bat":"Right"},{"name":"Anrich Nortje","country":"South Africa","role":"Bowler","format":"All","debutYear":2019,"age":30,"bat":"Right"},{"name":"Heinrich Klaasen","country":"South Africa","role":"WK-Batter","format":"All","debutYear":2017,"age":32,"bat":"Right"},{"name":"David Miller","country":"South Africa","role":"Batter","format":"All","debutYear":2010,"age":34,"bat":"Left"},{"name":"Faf du Plessis","country":"South Africa","role":"Batter","format":"All","debutYear":2010,"age":40,"bat":"Right"},{"name":"Hashim Amla","country":"South Africa","role":"Batter","format":"All","debutYear":2004,"age":41,"bat":"Right"},{"name":"Dale Steyn","country":"South Africa","role":"Bowler","format":"All","debutYear":2004,"age":41,"bat":"Right"},{"name":"AB de Villiers","country":"South Africa","role":"WK-Batter","format":"All","debutYear":2004,"age":40,"bat":"Right"},{"name":"Graeme Smith","country":"South Africa","role":"Batter","format":"All","debutYear":2002,"age":43,"bat":"Left"},{"name":"Jacques Kallis","country":"South Africa","role":"All-rounder","format":"All","debutYear":1995,"age":49,"bat":"Right"},{"name":"Shaun Pollock","country":"South Africa","role":"All-rounder","format":"All","debutYear":1995,"age":50,"bat":"Right"},{"name":"Shakib Al Hasan","country":"Bangladesh","role":"All-rounder","format":"All","debutYear":2006,"age":36,"bat":"Left"},{"name":"Mustafizur Rahman","country":"Bangladesh","role":"Bowler","format":"All","debutYear":2015,"age":28,"bat":"Right"},{"name":"Mushfiqur Rahim","country":"Bangladesh","role":"WK-Batter","format":"All","debutYear":2005,"age":36,"bat":"Right"},{"name":"Kumar Sangakkara","country":"Sri Lanka","role":"WK-Batter","format":"All","debutYear":2000,"age":46,"bat":"Left"},{"name":"Lasith Malinga","country":"Sri Lanka","role":"Bowler","format":"All","debutYear":2004,"age":40,"bat":"Right"},{"name":"Mahela Jayawardene","country":"Sri Lanka","role":"Batter","format":"All","debutYear":1997,"age":47,"bat":"Right"},{"name":"Muttiah Muralitharan","country":"Sri Lanka","role":"Bowler","format":"All","debutYear":1992,"age":52,"bat":"Right"},{"name":"Angelo Mathews","country":"Sri Lanka","role":"All-rounder","format":"All","debutYear":2008,"age":36,"bat":"Right"},{"name":"Wanindu Hasaranga","country":"Sri Lanka","role":"All-rounder","format":"All","debutYear":2017,"age":26,"bat":"Right"},{"name":"Kusal Mendis","country":"Sri Lanka","role":"WK-Batter","format":"All","debutYear":2015,"age":29,"bat":"Right"},{"name":"Rashid Khan","country":"Afghanistan","role":"Bowler","format":"All","debutYear":2015,"age":25,"bat":"Right"},{"name":"Mohammad Nabi","country":"Afghanistan","role":"All-rounder","format":"All","debutYear":2009,"age":39,"bat":"Right"},{"name":"Mujeeb Ur Rahman","country":"Afghanistan","role":"Bowler","format":"All","debutYear":2017,"age":22,"bat":"Right"},{"name":"Chris Gayle","country":"West Indies","role":"Batter","format":"All","debutYear":1999,"age":45,"bat":"Left"},{"name":"Brian Lara","country":"West Indies","role":"Batter","format":"All","debutYear":1990,"age":55,"bat":"Left"},{"name":"Kieron Pollard","country":"West Indies","role":"All-rounder","format":"T20","debutYear":2007,"age":36,"bat":"Right"},{"name":"Andre Russell","country":"West Indies","role":"All-rounder","format":"All","debutYear":2011,"age":36,"bat":"Right"},{"name":"Sunil Narine","country":"West Indies","role":"All-rounder","format":"All","debutYear":2011,"age":35,"bat":"Right"},{"name":"Nicholas Pooran","country":"West Indies","role":"WK-Batter","format":"All","debutYear":2017,"age":28,"bat":"Left"},{"name":"Jason Holder","country":"West Indies","role":"All-rounder","format":"All","debutYear":2013,"age":32,"bat":"Right"},{"name":"Shai Hope","country":"West Indies","role":"WK-Batter","format":"All","debutYear":2015,"age":30,"bat":"Right"},{"name":"Dwayne Bravo","country":"West Indies","role":"All-rounder","format":"All","debutYear":2004,"age":40,"bat":"Right"},{"name":"Carlos Brathwaite","country":"West Indies","role":"All-rounder","format":"All","debutYear":2011,"age":35,"bat":"Right"},{"name":"Darren Sammy","country":"West Indies","role":"All-rounder","format":"All","debutYear":2007,"age":40,"bat":"Right"},{"name":"Paul Stirling","country":"Ireland","role":"All-rounder","format":"All","debutYear":2008,"age":33,"bat":"Right"},{"name":"Sikandar Raza","country":"Zimbabwe","role":"All-rounder","format":"All","debutYear":2013,"age":37,"bat":"Right"},{"name":"Tim David","country":"Singapore","role":"Batter","format":"T20","debutYear":2019,"age":28,"bat":"Right"},{"name":"Imran Tahir","country":"South Africa","role":"Bowler","format":"All","debutYear":2011,"age":45,"bat":"Right"},{"name":"Garfield Sobers","country":"West Indies","role":"All-rounder","format":"All","debutYear":1954,"age":88,"bat":"Left"},{"name":"Richard Hadlee","country":"New Zealand","role":"All-rounder","format":"All","debutYear":1973,"age":73,"bat":"Left"},{"name":"Kapil Dev","country":"India","role":"All-rounder","format":"All","debutYear":1978,"age":65,"bat":"Right"},{"name":"Ian Botham","country":"England","role":"All-rounder","format":"All","debutYear":1977,"age":68,"bat":"Right"},{"name":"VVS Laxman","country":"India","role":"Batter","format":"All","debutYear":1996,"age":50,"bat":"Right"},{"name":"Shikhar Dhawan","country":"India","role":"Batter","format":"All","debutYear":2010,"age":38,"bat":"Left"}];
const PUZZLE_DB = {"2026-03-01":{"name":"Virat Kohli","country":"India","role":"Batter","format":"All","debutYear":2008,"age":35,"bat":"Right"},"2026-03-02":{"name":"Jasprit Bumrah","country":"India","role":"Bowler","format":"All","debutYear":2016,"age":30,"bat":"Right"},"2026-03-03":{"name":"Ben Stokes","country":"England","role":"All-rounder","format":"All","debutYear":2011,"age":33,"bat":"Left"},"2026-03-04":{"name":"Steve Smith","country":"Australia","role":"Batter","format":"All","debutYear":2010,"age":35,"bat":"Right"},"2026-03-05":{"name":"Kane Williamson","country":"New Zealand","role":"Batter","format":"All","debutYear":2010,"age":33,"bat":"Right"},"2026-03-06":{"name":"Rashid Khan","country":"Afghanistan","role":"Bowler","format":"All","debutYear":2015,"age":25,"bat":"Right"},"2026-03-07":{"name":"MS Dhoni","country":"India","role":"WK-Batter","format":"All","debutYear":2004,"age":43,"bat":"Right"},"2026-03-08":{"name":"AB de Villiers","country":"South Africa","role":"WK-Batter","format":"All","debutYear":2004,"age":40,"bat":"Right"},"2026-03-09":{"name":"Shaheen Afridi","country":"Pakistan","role":"Bowler","format":"All","debutYear":2018,"age":24,"bat":"Left"},"2026-03-10":{"name":"Kumar Sangakkara","country":"Sri Lanka","role":"WK-Batter","format":"All","debutYear":2000,"age":46,"bat":"Left"},"2026-03-11":{"name":"Rohit Sharma","country":"India","role":"Batter","format":"All","debutYear":2007,"age":37,"bat":"Right"},"2026-03-12":{"name":"Pat Cummins","country":"Australia","role":"Bowler","format":"All","debutYear":2011,"age":31,"bat":"Right"},"2026-03-13":{"name":"Babar Azam","country":"Pakistan","role":"Batter","format":"All","debutYear":2015,"age":29,"bat":"Right"},"2026-03-14":{"name":"Andre Russell","country":"West Indies","role":"All-rounder","format":"All","debutYear":2011,"age":36,"bat":"Right"},"2026-03-15":{"name":"Joe Root","country":"England","role":"Batter","format":"All","debutYear":2012,"age":33,"bat":"Right"},"2026-03-16":{"name":"Sachin Tendulkar","country":"India","role":"Batter","format":"All","debutYear":1989,"age":50,"bat":"Right"},"2026-03-17":{"name":"Rishabh Pant","country":"India","role":"WK-Batter","format":"All","debutYear":2017,"age":26,"bat":"Left"},"2026-03-18":{"name":"David Warner","country":"Australia","role":"Batter","format":"All","debutYear":2009,"age":37,"bat":"Left"},"2026-03-19":{"name":"Shakib Al Hasan","country":"Bangladesh","role":"All-rounder","format":"All","debutYear":2006,"age":36,"bat":"Left"},"2026-03-20":{"name":"Yashasvi Jaiswal","country":"India","role":"Batter","format":"All","debutYear":2023,"age":22,"bat":"Left"},"2026-03-21":{"name":"Ravindra Jadeja","country":"India","role":"All-rounder","format":"All","debutYear":2009,"age":35,"bat":"Left"}};

// ── FIREBASE (compat SDK loaded via script tags in HTML) ──
const firebaseConfig = {
  apiKey: "AIzaSyC5nqnzG2jGtDcZlL6x9mg7r1xRrldyfpg",
  authDomain: "ogcrickingo.firebaseapp.com",
  databaseURL: "https://ogcrickingo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ogcrickingo",
  storageBucket: "ogcrickingo.firebasestorage.app",
  messagingSenderId: "672434440025",
  appId: "1:672434440025:web:ba51a4b85b7cb78bfeee48",
  measurementId: "G-LYH8BMVBFE"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
} catch(e) { console.warn('Firebase init skipped:', e.message); }

// ── TOURNAMENT DETECTION ──
const urlParams      = new URLSearchParams(window.location.search);
const isInTournament = localStorage.getItem('inTournamentGame') === 'true' &&
                       urlParams.get('tournament') === 'true';

// ── CONSTANTS ──
const MAX_ATTEMPTS = 8;
const STATS_KEY    = 'crickingo_wordle_stats';
const HISTORY_KEY  = 'crickingo_wordle_history';
const SCORES       = [1000, 850, 700, 600, 500, 400, 300, 200];

// ── STATE ──
let players      = [];
let target       = null;
let attempts     = 0;
let gameOver     = false;
let selectedPlayer = null;
let guessedNames = [];
let won          = false;

// ── HELPERS ──
function getTodayKey()  { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function getPuzzleKey() { return urlParams.get('date') || getTodayKey(); }
function loadStats()    { try { return JSON.parse(localStorage.getItem(STATS_KEY))   || {}; } catch { return {}; } }
function loadHistory()  { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { return {}; } }

// ── REGIONS / FLAGS / SHORTS ──
const REGIONS = {
  'India':'SouthAsia','Pakistan':'SouthAsia','Sri Lanka':'SouthAsia',
  'Bangladesh':'SouthAsia','Afghanistan':'SouthAsia','Nepal':'SouthAsia',
  'Australia':'Oceania','New Zealand':'Oceania','PNG':'Oceania',
  'England':'Europe','Ireland':'Europe','Scotland':'Europe','Netherlands':'Europe',
  'South Africa':'Africa','Zimbabwe':'Africa','Kenya':'Africa','Namibia':'Africa',
  'West Indies':'Caribbean','USA':'Americas','Canada':'Americas',
};
function getRegion(c) { return REGIONS[c] || 'Other'; }

const FLAGS = {
  'India':'🇮🇳','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Australia':'🇦🇺','New Zealand':'🇳🇿','Pakistan':'🇵🇰',
  'South Africa':'🇿🇦','Bangladesh':'🇧🇩','Sri Lanka':'🇱🇰','Afghanistan':'🇦🇫',
  'West Indies':'🏝️','Ireland':'🇮🇪','Zimbabwe':'🇿🇼','Singapore':'🇸🇬',
  'Netherlands':'🇳🇱','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','USA':'🇺🇸','Namibia':'🇳🇦',
  'Nepal':'🇳🇵','Canada':'🇨🇦','PNG':'🇵🇬','Kenya':'🇰🇪',
};
function getFlag(c) { return FLAGS[c] || '🌍'; }

const SHORT = {
  'India':'IND','England':'ENG','Australia':'AUS','New Zealand':'NZL',
  'Pakistan':'PAK','South Africa':'RSA','Bangladesh':'BAN','Sri Lanka':'SL',
  'Afghanistan':'AFG','West Indies':'WI','Ireland':'IRE','Zimbabwe':'ZIM',
  'Singapore':'SGP','Netherlands':'NED','Scotland':'SCO','USA':'USA',
  'Namibia':'NAM','Nepal':'NEP','Canada':'CAN','PNG':'PNG','Kenya':'KEN',
};
function shortCountry(c) { return SHORT[c] || c.substring(0,3).toUpperCase(); }

function roleClass(r) {
  if (!r) return 'batter';
  const x = r.toLowerCase();
  if (x.includes('wk'))   return 'wk';
  if (x.includes('all'))  return 'allround';
  if (x.includes('bowl')) return 'bowler';
  return 'batter';
}
function roleLabel(r) {
  if (!r) return 'Batter';
  const x = r.toLowerCase();
  if (x.includes('wk'))   return 'WK-Bat';
  if (x.includes('all'))  return 'All-rnd';
  if (x.includes('bowl')) return 'Bowler';
  return 'Batter';
}

// ── TOURNAMENT BANNER ──
function showTournamentBanner() {
  if (document.getElementById('tournamentBanner')) return;
  const div = document.createElement('div');
  div.id = 'tournamentBanner';
  div.style.cssText = `
    position:fixed;top:70px;left:50%;transform:translateX(-50%);
    background:rgba(249,115,22,.12);color:#F97316;
    padding:8px 22px;border-radius:100px;
    font-family:'DM Sans',sans-serif;font-weight:700;
    font-size:.78rem;letter-spacing:1px;text-transform:uppercase;
    z-index:999;border:1px solid rgba(249,115,22,.3);
    backdrop-filter:blur(12px);box-shadow:0 4px 20px rgba(249,115,22,.15);
    white-space:nowrap;
  `;
  div.textContent = '🏆 Tournament Mode — Play Your Best!';
  document.body.appendChild(div);
}

// ── INIT GAME (no fetch — uses embedded data) ──
async function loadData() {
  // Build player pool from embedded PLAYER_DB
  const seen = new Set();
  for (const p of PLAYER_DB) {
    if (!seen.has(p.name)) { players.push(p); seen.add(p.name); }
  }

  // ── TOURNAMENT SEED LOGIC (mirrors rivalry.js exactly) ──
  if (isInTournament) {
    const tournamentCode = localStorage.getItem('tournamentCode');
    const seedPath = `tournaments/${tournamentCode}/gameData/whoareya_key`;
    try {
      const snapshot = await db.ref(seedPath).once('value');
      if (snapshot.exists()) {
        target = PUZZLE_DB[snapshot.val()];
      } else {
        const availableKeys = Object.keys(PUZZLE_DB);
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        target = PUZZLE_DB[randomKey];
        await db.ref(seedPath).set(randomKey);
      }
    } catch (err) {
      console.error('Firebase error, random fallback:', err);
      const keys = Object.keys(PUZZLE_DB);
      target = PUZZLE_DB[keys[Math.floor(Math.random() * keys.length)]];
    }
  } else if (!db && isInTournament) {
    // Firebase not available, random fallback
    const keys = Object.keys(PUZZLE_DB);
    target = PUZZLE_DB[keys[Math.floor(Math.random() * keys.length)]];
  } else {
    // ── NORMAL DAILY PUZZLE ──
    const puzzleDate = getPuzzleKey();
    const launch  = new Date('2026-03-01T00:00:00');
    const thisDay = new Date(puzzleDate + 'T00:00:00');
    const dayNum  = Math.floor((thisDay - launch) / 86400000);

    if (PUZZLE_DB[puzzleDate]) {
      target = PUZZLE_DB[puzzleDate];
    } else {
      const keys = Object.keys(PUZZLE_DB).sort();
      target = PUZZLE_DB[keys[Math.abs(dayNum) % keys.length]];
    }

    // Puzzle bar
    const dt = new Date(puzzleDate + 'T00:00:00');
    const el = document.getElementById('puzzleDate');
    if (el) el.textContent = dt.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
    const pn = document.getElementById('puzzleNumber');
    if (pn) pn.textContent = '#' + (dayNum + 1);
  }

  // ── TOURNAMENT UI ADJUSTMENTS ──
  if (isInTournament) {
    showTournamentBanner();
    ['puzzle-bar','bottomDashboard'].forEach(id => {
      const el = document.getElementById(id) || document.querySelector('.' + id);
      if (el) el.style.display = 'none';
    });
    document.querySelector('.puzzle-bar') && (document.querySelector('.puzzle-bar').style.display = 'none');
    document.getElementById('bottomDashboard') && (document.getElementById('bottomDashboard').style.display = 'none');
    document.getElementById('playAgainBtn') && (document.getElementById('playAgainBtn').style.display = 'none');
    document.getElementById('homeBtn')      && (document.getElementById('homeBtn').style.display      = 'none');
  } else {
    initDots();
    renderDashboard();
    const history = loadHistory();
    if (!history[getPuzzleKey()]) openModal();
  }
}

// ── CHECK ALREADY PLAYED ──
// ── SEARCH ──
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', function() {
    const q        = this.value.toLowerCase().trim();
    const dd       = document.getElementById('dropdownList');
    
    const sw       = document.getElementById('searchWrapper');
    selectedPlayer = null;
    document.getElementById('btnGuess').disabled = true;

    if (!q) {
      dd.classList.remove('active');
      
      return;
    }

    const matches = players.filter(p =>
      p.name.toLowerCase().includes(q) && !guessedNames.includes(p.name)
    ).slice(0, 8);

    dd.innerHTML = matches.length
      ? matches.map(p => `
          <div class="dropdown-item" data-name="${p.name.replace(/"/g,'&quot;')}">
            <div class="di-flag">${getFlag(p.country)}</div>
            <div class="di-info">
              <div class="di-name">${p.name}</div>
              <div class="di-meta">${p.country} · ${p.debutYear} debut · ${p.bat}-hand</div>
            </div>
            <div class="di-role-badge ${roleClass(p.role)}">${roleLabel(p.role)}</div>
          </div>`).join('')
      : '<div class="no-results">No players found</div>';

    dd.querySelectorAll('.dropdown-item[data-name]').forEach(item => {
      item.addEventListener('click', () => selectPlayer(item.dataset.name));
    });

    dd.classList.add('active');
    
  });

  document.addEventListener('click', e => {
    const sw = document.getElementById('searchWrapper');
    if (!sw?.contains(e.target)) closeDropdown();
  });
}

function closeDropdown() {
  document.getElementById('dropdownList')?.classList.remove('active');
  
}

function selectPlayer(name) {
  selectedPlayer = players.find(p => p.name === name);
  document.getElementById('searchInput').value = name;
  closeDropdown();
  document.getElementById('btnGuess').disabled = false;
}

// ── SUBMIT GUESS ──
function submitGuess() {
  if (gameOver || !selectedPlayer || !target) return;

  const guess = selectedPlayer;
  guessedNames.push(guess.name);
  attempts++;

  renderRow(evaluateGuess(guess));

  document.getElementById('liveAttempts').textContent = attempts + '/8';
  renderAttemptDots();

  if (attempts >= 2) revealHint('hint-role',    'Role: '    + target.role);
  if (attempts >= 5) revealHint('hint-country', 'Country: ' + target.country);
  if (attempts >= 7) revealHint('hint-debut',   'Debut: '   + target.debutYear);

  selectedPlayer = null;
  document.getElementById('searchInput').value = '';
  document.getElementById('btnGuess').disabled = true;

  if (guess.name === target.name) { won = true; endGame(true); }
  else if (attempts >= MAX_ATTEMPTS) { endGame(false); }
}

// ── EVALUATE ──
function evaluateGuess(guess) {
  const t = target;
  const sameCountry = guess.country === t.country;
  const sameRegion  = !sameCountry && getRegion(guess.country) === getRegion(t.country);
  const dy = guess.debutYear, ty = t.debutYear;
  const ag = guess.age,       ta = t.age;

  return [
    { type:'name',    name: guess.name, sub: guess.country,
       cls: guess.name === t.name ? 'correct' : 'wrong', tick: guess.name === t.name },
    { type:'country', flag: getFlag(guess.country), short: shortCountry(guess.country),
       cls: sameCountry ? 'correct' : sameRegion ? 'partial' : 'wrong' },
    { type:'text', val: roleLabel(guess.role),
       cls: guess.role === t.role ? 'correct' : 'wrong' },
    { type:'num', val: dy,
       cls: dy === ty ? 'correct' : Math.abs(dy - ty) <= 3 ? 'partial' : 'wrong',
       arrow: dy < ty ? '↑' : dy > ty ? '↓' : '' },
    { type:'num', val: ag,
       cls: ag === ta ? 'correct' : Math.abs(ag - ta) <= 3 ? 'partial' : 'wrong',
       arrow: ag < ta ? '↑' : ag > ta ? '↓' : '' },
    { type:'text', val: guess.bat,
       cls: guess.bat === t.bat ? 'correct' : 'wrong' },
  ];
}

// ── RENDER ROW ──
function renderRow(cells) {
  const row = document.createElement('div');
  row.className = 'guess-row';
  cells.forEach(c => {
    const cell = document.createElement('div');
    cell.className = 'g-cell ' + c.cls;
    if (c.type === 'name') {
      cell.style.cssText = 'text-align:left;align-items:flex-start';
      cell.innerHTML = `<div class="g-cell-name">${c.name}</div><div class="g-cell-name-sub">${c.sub}</div>`;
      if (c.tick) cell.innerHTML += '<div class="cell-tick">✓</div>';
    } else if (c.type === 'country') {
      cell.innerHTML = `<div class="g-cell-flag-wrap"><div class="g-cell-flag">${c.flag}</div><div class="g-cell-ctry">${c.short}</div></div>`;
      if (c.cls === 'correct') cell.innerHTML += '<div class="cell-tick">✓</div>';
    } else if (c.type === 'num') {
      cell.innerHTML = `<div style="font-size:.85rem;font-weight:800">${c.val}</div>`;
      if (c.arrow) cell.innerHTML += `<div class="arrow">${c.arrow}</div>`;
    } else {
      cell.innerHTML = `<div>${c.val}</div>`;
      if (c.cls === 'correct') cell.innerHTML += '<div class="cell-tick">✓</div>';
    }
    row.appendChild(cell);
  });
  document.getElementById('guessesWrap').prepend(row);
}

const HINT_META = {
  'hint-role':    { icon: '🧢', label: 'Role' },
  'hint-country': { icon: '🌍', label: 'Country' },
  'hint-debut':   { icon: '📅', label: 'Debut' },
};

function revealHint(id, text) {
  const el = document.getElementById(id);
  if (!el || el.classList.contains('revealed')) return;
  const m = HINT_META[id] || {};
  // Extract just the value (strip "Role: " prefix etc)
  const val = text.includes(': ') ? text.split(': ').slice(1).join(': ') : text;
  el.innerHTML = `
    <span class="hp-icon">${m.icon || '💡'}</span>
    <span class="hp-label">${m.label || ''}</span>
    <span class="hp-val">${val}</span>
  `;
  el.classList.remove('locked');
  el.classList.add('revealed');
}

function renderAttemptDots() {
  const el = document.getElementById('attemptsDots');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const d = document.createElement('div');
    d.className = 'att-dot' + (i < attempts
      ? (won && i === attempts - 1 ? ' correct' : ' used') : '');
    el.appendChild(d);
  }
}

// ── END GAME ──
function endGame(didWin) {
  gameOver = true;
  won = didWin;

  revealHint('hint-role',    'Role: '    + target.role);
  revealHint('hint-country', 'Country: ' + target.country);
  revealHint('hint-debut',   'Debut: '   + target.debutYear);

  renderAttemptDots();

  const liveResult = document.getElementById('liveResult');
  if (liveResult) {
    liveResult.textContent = didWin ? '✅ Won!' : '❌ Lost';
    liveResult.style.color = didWin ? 'var(--green)' : 'var(--accent2)';
  }

  const score = didWin ? (SCORES[attempts - 1] ?? 100) : 0;

  document.getElementById('searchWrapper').style.display = 'none';

  if (isInTournament) {
    setTimeout(() => finishGame(score), 800);
    return;
  }

  setTimeout(() => showResult(didWin, attempts, score), 700);
  saveResult(didWin, attempts, score);
}

// ── TOURNAMENT FINISH ──
function finishGame(score) {
  localStorage.removeItem('inTournamentGame');
  const gameIndex = localStorage.getItem('currentGameIndex') || '1';
  window.location.href = `tournament.html?score=${score}&game=${gameIndex}`;
}

// ── SHOW RESULT ──
function showResult(didWin, att, score) {
  const card = document.getElementById('resultCard');
  if (!card) return;
  card.style.display = 'block';

  const badge = document.getElementById('resultBadge');
  badge.textContent = didWin ? '✓ Correct!' : '✗ Not Quite';
  badge.className   = 'result-badge ' + (didWin ? 'win' : 'lose');

  document.getElementById('resultTitle').textContent  = didWin ? '🎉 Got it!' : '😔 Game Over';
  document.getElementById('resultPlayer').textContent = target.name;
  document.getElementById('resultPhrase').textContent = didWin
    ? `You identified ${target.name} in ${att} ${att === 1 ? 'guess' : 'guesses'}! ${target.country} · ${target.role} · Debut ${target.debutYear}`
    : `The mystery cricketer was ${target.name} — ${target.country} ${target.role}, debuted in ${target.debutYear}.`;

  document.getElementById('rbAttempts').textContent = att + '/8';
  document.getElementById('rbResult').textContent   = didWin ? 'WIN 🏆' : 'LOSS';
  document.getElementById('rbResult').className     = 'rb-val ' + (didWin ? 'green' : '');
  document.getElementById('rbScore').textContent    = score;

  window._shareData = { didWin, att, score, name: target.name };
  renderDashboard();
  setTimeout(() => card.scrollIntoView({ behavior:'smooth', block:'center' }), 300);
}

// ── SAVE RESULT ──
function saveResult(didWin, att, score) {
  if (isInTournament) return;
  const key     = getPuzzleKey();
  const today   = getTodayKey();
  const history = loadHistory();
  const stats   = loadStats();
  history[key] = { won: didWin, attempts: att, score };
  const all  = Object.values(history);
  const wins = all.filter(e => e.won);
  stats.played      = all.length;
  stats.won         = wins.length;
  stats.avgPoints = wins.length
    ? Math.round(wins.reduce((s, e) => s + (e.score ?? 0), 0) / wins.length) : '—';
  let streak = 0;
  const check = new Date(today + 'T00:00:00');
  while (true) {
    const k = `${check.getFullYear()}-${String(check.getMonth()+1).padStart(2,'0')}-${String(check.getDate()).padStart(2,'0')}`;
    if (history[k]) { streak++; check.setDate(check.getDate() - 1); } else break;
  }
  stats.streak = streak;
  localStorage.setItem(STATS_KEY,   JSON.stringify(stats));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ── DASHBOARD ──
function renderDashboard() {
  if (isInTournament) return;
  const stats   = loadStats();
  const history = loadHistory();
  const today   = getTodayKey();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
  set('statPlayed',      stats.played      ?? '—');
  set('statWon',         stats.won         ?? '—');
  set('statAvgAttempts', stats.avgPoints ?? '—');
  set('statStreak',      stats.streak != null ? stats.streak + (stats.streak === 1 ? ' day' : ' days') : '—');
  renderDots(history, today);
}

function renderDots(history, today) {
  const dotsEl = document.getElementById('streakDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  const base = new Date(today + 'T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d   = new Date(base); d.setDate(d.getDate() - i);
    const key     = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const entry   = history[key];
    const isToday = key === today;
    const dot     = document.createElement('div');
    dot.dataset.dotDate = key;
    if (isToday && entry) { dot.className = 'streak-dot today-played'; dot.title = `Today · ${entry.score ?? 0} pts`; }
    else if (isToday)     { dot.className = 'streak-dot today-pending'; dot.title = 'Today — not played yet'; }
    else if (entry)       { dot.className = 'streak-dot win';  dot.title = `${key} · ${entry.score ?? 0} pts`; }
    else                  { dot.className = 'streak-dot miss'; dot.title = `${key} — missed`; }
    if (entry) {
      const sc = document.createElement('div');
      sc.className   = 'dot-score-val';
      sc.textContent = entry.won ? (entry.score ?? 0) : '✗';
      dot.appendChild(sc);
    }
    dotsEl.appendChild(dot);
  }
}

function initDots() {
  renderDots(loadHistory(), getTodayKey());
  renderAttemptDots();
}

// ── SHARE (canvas image like rivalry.js) ──
function shareResult() {
  const d      = window._shareData || {};
  const didWin = d.didWin ?? won;
  const score  = d.score  ?? 0;
  const att    = d.att    || attempts;
  const name   = d.name   || (target ? target.name : '?');

  const W = 600, pad = 44;
  // build breakdown rows
  const bkd = [];
  bkd.push({ label: `🎯 Player`, value: name, color: '#F7C344' });
  bkd.push({ label: `${didWin ? '✅' : '❌'} Result`, value: didWin ? `Got it in ${att}/8!` : `Failed in ${att}/8`, color: didWin ? '#3DD68C' : '#E84040' });
  bkd.push({ label: `🏅 Score`, value: `${score} / 1000`, color: '#F97316' });

  // tomorrow date
  const puzzleDate = getPuzzleKey();
  const dTomorrow = new Date(puzzleDate + 'T00:00:00');
  dTomorrow.setDate(dTomorrow.getDate() + 1);
  const tomorrowStr = dTomorrow.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  let H = 420 + bkd.length * 38 + 80;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, W, H);

  // Top gradient bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#F97316');
  grad.addColorStop(0.5, '#F7C344');
  grad.addColorStop(1, '#F97316');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 3);

  let y = pad + 16;

  // Title
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#F2F2F2';
  ctx.textAlign = 'center';
  ctx.fillText('🏏 WHO ARE YA?', W / 2, y);
  y += 44;

  // Score big
  ctx.fillStyle = didWin ? 'rgba(249,115,22,.2)' : 'rgba(232,64,64,.15)';
  rr(ctx, pad, y, W - pad * 2, 66, 12);
  ctx.fillStyle = didWin ? '#F97316' : '#E84040';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(`${score} / 1000`, W / 2, y + 46);
  y += 82;

  // Subtitle
  ctx.font = '15px Arial';
  ctx.fillStyle = 'rgba(242,242,242,0.6)';
  ctx.fillText(didWin ? `Identified in ${att} ${att === 1 ? 'guess' : 'guesses'}! 🎉` : `Couldn't get it in ${att}/8 😔`, W / 2, y);
  y += 38;

  // Breakdown box
  const bH = 40 + bkd.length * 36 + 20;
  ctx.fillStyle = 'rgba(255,255,255,.04)';
  rr(ctx, pad, y, W - pad * 2, bH, 12);
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#F2F2F2';
  ctx.fillText('📊 Game Summary', W / 2, y + 26);
  y += 44;
  bkd.forEach(row => {
    ctx.textAlign = 'left';
    ctx.font = '13px Arial';
    ctx.fillStyle = 'rgba(242,242,242,.8)';
    ctx.fillText(row.label, pad + 16, y + 14);
    ctx.textAlign = 'right';
    ctx.fillStyle = row.color || '#F97316';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(row.value, W - pad - 16, y + 14);
    y += 36;
  });
  y += 20;

  // Tomorrow
  ctx.fillStyle = 'rgba(79,142,247,.1)';
  rr(ctx, pad, y, W - pad * 2, 58, 12);
  ctx.textAlign = 'center';
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(242,242,242,.5)';
  ctx.fillText('📅 Next Puzzle', W / 2, y + 20);
  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#4F8EF7';
  ctx.fillText('Come back tomorrow · ' + tomorrowStr, W / 2, y + 42);
  y += 66;

  // Footer CTA
  ctx.fillStyle = 'rgba(249,115,22,.1)';
  rr(ctx, pad, y, W - pad * 2, 58, 12);
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#F97316';
  ctx.fillText('🏏 Can you beat me at Crickingo?', W / 2, y + 24);
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(242,242,242,.4)';
  ctx.fillText('crickingo.vercel.app', W / 2, y + 44);

  // Share / download
  canvas.toBlob(async blob => {
    const file = new File([blob], 'crickingo-whoareya.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: 'Can you beat me at Crickingo? 🏏\ncrickingo.vercel.app' });
        return;
      } catch(e) { if (e.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'crickingo-whoareya.png';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, 'image/png');
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill();
}

// ── CRICKET CORNER ──
const CC_QUIZ = [
  { q:'Which IPL franchise was first to have its contract terminated by BCCI?', opts:['Kochi Tuskers Kerala','Deccan Chargers','Pune Warriors India','Rising Pune Supergiant'], ans:0 },
  { q:'Who holds the record for the fastest century in IPL history?', opts:['Chris Gayle','AB de Villiers','Yusuf Pathan','David Miller'], ans:1 },
  { q:'Which team has won the most IPL titles?', opts:['Chennai Super Kings','Mumbai Indians','KKR','Rajasthan Royals'], ans:1 },
  { q:'Sachin Tendulkar scored how many total international centuries?', opts:['95','100','105','110'], ans:1 },
  { q:'Who was the first bowler to take 800 Test wickets?', opts:['Shane Warne','Glenn McGrath','Muttiah Muralitharan','Anil Kumble'], ans:2 },
  { q:'Which country won the inaugural ICC T20 World Cup in 2007?', opts:['Australia','Pakistan','India','Sri Lanka'], ans:2 },
  { q:'Who scored 264 in a single ODI innings — the highest ever?', opts:['Sachin Tendulkar','Chris Gayle','Rohit Sharma','Martin Guptill'], ans:2 },
  { q:'Which ground is known as the "Home of Cricket"?', opts:['Eden Gardens','The Oval',"Lord's",'MCG'], ans:2 },
  { q:'Who captained India to the 2011 ODI World Cup victory?', opts:['Sourav Ganguly','Rahul Dravid','Virat Kohli','MS Dhoni'], ans:3 },
  { q:'What does the "Purple Cap" represent in IPL?', opts:['Best batter','Best fielder','Best bowler','Best all-rounder'], ans:2 },
  { q:'Which cricketer is nicknamed "The Wall"?', opts:['VVS Laxman','Virat Kohli','Rahul Dravid','Sachin Tendulkar'], ans:2 },
  { q:'How many players are on each side in a cricket match?', opts:['9','10','11','12'], ans:2 },
  { q:'Who hit 6 sixes in a single over at the 2007 T20 World Cup?', opts:['Virender Sehwag','MS Dhoni','Yuvraj Singh','Rohit Sharma'], ans:2 },
  { q:'What is the maximum number of overs in an ODI innings?', opts:['40','45','50','55'], ans:2 },
  { q:'Which country invented the game of cricket?', opts:['Australia','India','West Indies','England'], ans:3 },
];

const CC_DYK = [
  { ico:'🏏', txt:'<strong>Sachin Tendulkar</strong> scored 100 international centuries — a record that may never be broken. He played international cricket for 24 years.' },
  { ico:'⚡', txt:'<strong>Shoaib Akhtar</strong> bowled the fastest delivery ever recorded — 161.3 km/h against England at the 2003 Cricket World Cup.' },
  { ico:'🔥', txt:'<strong>Yuvraj Singh</strong> hit 6 sixes in a single over off Stuart Broad during the 2007 T20 World Cup, scoring 36 runs in 6 balls.' },
  { ico:'🧤', txt:"<strong>MS Dhoni's</strong> stumping speed was timed at just 0.08 seconds — faster than the average human blink (0.1–0.4 seconds)." },
  { ico:'🌀', txt:'<strong>Muttiah Muralitharan</strong> took his 800th and final Test wicket on the very last ball of his Test career against India in 2010.' },
  { ico:'💥', txt:'<strong>Rohit Sharma</strong> holds the record for the highest individual ODI score — 264 runs against Sri Lanka in Kolkata, 2014.' },
  { ico:'🏆', txt:'The <strong>IPL</strong> is the world\'s most-watched cricket league and one of the highest-earning sporting leagues globally, valued over $10 billion.' },
  { ico:'📅', txt:'<strong>Sachin Tendulkar</strong> made his Test debut aged just 16 years and 205 days against Pakistan in Karachi in November 1989.' },
  { ico:'🎯', txt:'<strong>James Anderson</strong> became the first fast bowler in history to claim 700 Test wickets, achieving the feat in 2024.' },
  { ico:'🌍', txt:'Cricket is played professionally in over <strong>100 countries</strong>, but only 12 nations currently hold Full Member status with the ICC.' },
];

const CC_GLOSS = [
  { term:'Duck', def:'When a batter is dismissed without scoring any runs. A "Golden Duck" means dismissed on the very first ball faced.' },
  { term:'Maiden Over', def:'An over in which no runs are scored off the bat. The bowler bowls all 6 balls without conceding a run.' },
  { term:'LBW', def:'Leg Before Wicket — a dismissal where the ball hits the batter\'s leg and would have hit the stumps if the leg wasn\'t in the way.' },
  { term:'No Ball', def:'An illegal delivery by the bowler — usually from overstepping the crease. The batting side gets a free hit in limited-overs cricket.' },
  { term:'DRS', def:'Decision Review System — technology used to review on-field umpiring decisions, including ball-tracking and edge detection.' },
  { term:'Powerplay', def:'Fielding restrictions in limited-overs cricket where only 2 fielders are allowed outside the 30-yard circle.' },
  { term:'Hat-trick', def:'When a bowler takes three wickets with three consecutive deliveries. One of the rarest achievements in cricket.' },
  { term:'Googly', def:'A deceptive delivery by a leg-spin bowler that turns the opposite way to a standard leg-break, surprising the batter.' },
  { term:'Yorker', def:'A delivery aimed at the batter\'s feet, landing near the popping crease. One of the hardest deliveries to play.' },
  { term:'Economy Rate', def:'The average number of runs conceded by a bowler per over. Lower is better — great T20 bowlers average under 7.' },
];

let ccQuizIdx = 0;
let ccQuizAnswered = false;

function renderCricketCorner() {
  const el = document.getElementById('cricket-corner');
  if (!el || isInTournament) return;

  // shuffle quiz order once
  const shuffledQuiz = [...CC_QUIZ].sort(() => Math.random() - .5);
  ccQuizIdx = 0;
  ccQuizAnswered = false;

  el.innerHTML = `
    <div class="cc-wrap">
      <div class="cc-nav">
        <button class="cc-tab active" data-tab="quiz">Quiz</button>
        <button class="cc-tab" data-tab="dyk">Did You Know</button>
        <button class="cc-tab" data-tab="gloss">Glossary</button>
      </div>
      <div class="cc-body">
        <div class="cc-pane active" id="cc-quiz"></div>
        <div class="cc-pane" id="cc-dyk"></div>
        <div class="cc-pane" id="cc-gloss"></div>
      </div>
    </div>`;

  // Tab switching
  el.querySelectorAll('.cc-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
      el.querySelectorAll('.cc-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector('#cc-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Render quiz
  function renderQuiz() {
    const q = shuffledQuiz[ccQuizIdx % shuffledQuiz.length];
    ccQuizAnswered = false;
    document.getElementById('cc-quiz').innerHTML = `
      <div class="cc-question">${q.q}</div>
      <div class="cc-options">
        ${q.opts.map((o, i) => `<button class="cc-opt" data-idx="${i}">${o}</button>`).join('')}
      </div>
      <div class="cc-result" id="cc-qresult"></div>
      <button class="cc-next" id="cc-qnext">Next Question →</button>`;

    document.querySelectorAll('.cc-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (ccQuizAnswered) return;
        ccQuizAnswered = true;
        const chosen = parseInt(btn.dataset.idx);
        document.querySelectorAll('.cc-opt').forEach((b, i) => {
          if (i === q.ans) b.classList.add('correct');
          else if (i === chosen && chosen !== q.ans) b.classList.add('wrong');
          else b.classList.add('reveal');
        });
        const res = document.getElementById('cc-qresult');
        res.className = 'cc-result show ' + (chosen === q.ans ? 'win' : 'lose');
        res.textContent = chosen === q.ans ? '🎉 Correct!' : `❌ The answer was: ${q.opts[q.ans]}`;
        document.getElementById('cc-qnext').classList.add('show');
      });
    });

    document.getElementById('cc-qnext').addEventListener('click', () => {
      ccQuizIdx++;
      renderQuiz();
    });
  }
  renderQuiz();

  // Render Did You Know
  const dykItems = [...CC_DYK].sort(() => Math.random() - .5).slice(0, 4);
  document.getElementById('cc-dyk').innerHTML = `
    <div class="cc-dyk">
      ${dykItems.map(d => `
        <div class="cc-dyk-item">
          <span class="cc-dyk-ico">${d.ico}</span>
          <span class="cc-dyk-txt">${d.txt}</span>
        </div>`).join('')}
    </div>`;

  // Render Glossary
  const glossItems = [...CC_GLOSS].sort(() => Math.random() - .5).slice(0, 5);
  document.getElementById('cc-gloss').innerHTML = `
    <div class="cc-gloss">
      ${glossItems.map(g => `
        <div class="cc-gloss-item">
          <div class="cc-gloss-term">${g.term}</div>
          <div class="cc-gloss-def">${g.def}</div>
        </div>`).join('')}
    </div>`;
}

// ── MODAL ──
function openModal() {
  const m = document.getElementById('rulesModal');
  if (m) { m.style.display = ''; m.classList.add('active'); }
}
function closeModal() {
  const m = document.getElementById('rulesModal');
  if (m) { m.classList.remove('active'); m.style.display = 'none'; }
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  if (urlParams.get('tournament') !== 'true') {
    localStorage.removeItem('inTournamentGame');
  }

  // Modal
  document.getElementById('helpBtn')?.addEventListener('click', openModal);
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
  document.getElementById('rulesModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Result buttons
  document.getElementById('playAgainBtn')?.addEventListener('click', () => location.reload());
  document.getElementById('homeBtn')?.addEventListener('click', () => window.location.href = 'index.html');
  document.getElementById('shareBtn')?.addEventListener('click', shareResult);

  // Guess button
  document.getElementById('btnGuess')?.addEventListener('click', submitGuess);

  // Search
  initSearch();

  // Cricket corner
  renderCricketCorner();

  // Load game (now synchronous — no fetch!)
  try {
    loadData();
  } catch(err) {
    console.error('Who Are Ya init failed:', err);
  }
});