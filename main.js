// main.js - Script for index.html (landing page)

window.addEventListener('DOMContentLoaded', () => {
  // Set today's date as default
  const dateInput = document.getElementById('gameDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  dateInput.max = today;

  // Load previously selected date from localStorage if exists
  const savedDate = localStorage.getItem('selectedDate');
  if (savedDate && savedDate <= today) {
    dateInput.value = savedDate;
  }

  // Store selected date in localStorage when changed
  dateInput.addEventListener('change', function() {
    localStorage.setItem('selectedDate', this.value);
  });

  // Add date parameter to game links
  document.getElementById('rivalryBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const date = dateInput.value;
    localStorage.setItem('selectedDate', date);
    window.location.href = `rivalry.html?date=${date}`;
  });

  document.getElementById('transferBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const date = dateInput.value;
    localStorage.setItem('selectedDate', date);
    window.location.href = `transfer.html?date=${date}`;

   // Create Supabase client
const supabaseUrl = 'https://hpmnpvwteqrtrcudflyf.supabase.co'  // paste from Supabase dashboard
const supabaseKey = 'sb_publishable_RgqM7ZgUJ9rR_ek_rVXSeQ_SubOJzC-'  // paste from Supabase dashboard

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Now you can use it!
// Example: Save a score
async function saveScore(playerName, score) {
  const { data, error } = await supabase
    .from('scores')  // your table name
    .insert([
      { player: playerName, score: score }
    ])
  
  if (error) console.error('Error:', error)
  else console.log('Saved!', data)
}

// Example: Get all scores
async function getScores() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
  
  if (error) console.error('Error:', error)
  else console.log('Scores:', data)
} 
  });
});