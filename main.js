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

  // Navigate to game with selected date as URL param
  document.getElementById('rivalryBtn').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'rivalry.html?date=' + dateInput.value;
  });

  document.getElementById('transferBtn').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'transfer.html?date=' + dateInput.value;
  });

});