document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
  const nextSection = document.querySelector('.homepage-projects'); // Or your next section class
  nextSection?.scrollIntoView({ behavior: 'smooth' });
});

// The markup ships with the current year already in it, so the footer still
// reads correctly with JS off — this only takes over once the year rolls.
document.querySelectorAll('[data-current-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

