/* Financování – orientační rozpočet splátek z kupní ceny (jen procenta z Postupu financování) */
(function () {
  var inp = document.querySelector('[data-paycalc-in]'); if (!inp) return;
  var F = window.SUfmt;
  function calc() {
    var v = +inp.value.replace(/\D/g, '');
    document.querySelectorAll('[data-pct]').forEach(function (el) { el.textContent = v ? F.czk(Math.round(v * el.dataset.pct / 100)) : ''; });
  }
  inp.addEventListener('input', function () {
    var digits = inp.value.replace(/\D/g, '');
    inp.value = digits ? new Intl.NumberFormat('cs-CZ').format(+digits) : '';
    calc();
  });
  calc();
})();
