// main.js - Script for index.html (landing page)

window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('gameDate');
  const today = new Date().toISOString().split('T')[0];

  dateInput.value = today;
  dateInput.max   = today;

  const savedDate = localStorage.getItem('selectedDate');
  if (savedDate && savedDate <= today) {
    dateInput.value = savedDate;
  }

  dateInput.addEventListener('change', function () {
    localStorage.setItem('selectedDate', this.value);
  });

  // Intercept all game card <a> clicks and append ?date= to the URL
  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (!href) return;
      const selectedDate = dateInput.value || today;
      window.location.href = href + '?date=' + selectedDate;
    });
  });
});