/* px-hero.js — fades the hero text in while the logo builds.
   Add class "hero-fade" to elements to fade (hidden by style.css until then).
   Delay: data-delay="1.3" on .hero (seconds). */
(function () {
  var hero = document.querySelector('.hero');
  var delay = hero && hero.dataset.delay ? parseFloat(hero.dataset.delay) : 1.3;
  setTimeout(function () {
    document.querySelectorAll('.hero-fade').forEach(function (el) { el.classList.add('is-in'); });
  }, delay * 1000);
})();
