/* Aktuality – filtr podle typu */
(function () {
  var btns = document.querySelectorAll('[data-news-f]');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('[data-ntype]').forEach(function (n) { n.classList.toggle('is-hidden', b.dataset.newsF !== 'vse' && n.dataset.ntype !== b.dataset.newsF); });
    });
  });
})();
