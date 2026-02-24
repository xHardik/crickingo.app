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

  function bindGameBtn(id, page) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = page + '?date=' + dateInput.value;
    });
  }

  bindGameBtn('rivalryBtn',  'rivalry.html');
  bindGameBtn('transferBtn', 'transfer.html');
  bindGameBtn('wordleBtn',   'wordle.html');
  bindGameBtn('hlBtn',       'hl.html');
  bindGameBtn('builderBtn',  'builder.html');
});