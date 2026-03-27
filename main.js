// main.js - Script for index.html (landing page)

window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('gameDate');

  // Get today's date in IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
  const now = new Date(Date.now() + istOffset);
  const today = now.toISOString().split('T')[0];

  dateInput.value = today;
  dateInput.max   = today;

  const savedDate = localStorage.getItem('selectedDate');
  if (savedDate && savedDate <= today) {
    dateInput.value = savedDate;
  }

  dateInput.addEventListener('change', function () {
    localStorage.setItem('selectedDate', this.value);
  });

  // Keep archive browsing consistent only for daily archive-enabled links.
  const datedLinks = document.querySelectorAll('[data-date-link]');
  datedLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (!href) return;
      const selectedDate = dateInput.value || today;
      window.location.href = href + '?date=' + selectedDate;
    });
  });
});