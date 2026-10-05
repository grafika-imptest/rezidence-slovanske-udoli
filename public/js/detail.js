/* Detail jednotky – přepínání Půdorys / Umístění / Prodejní list */
(function () {
  var tabs = document.querySelectorAll('[data-ud-tab]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      document.querySelectorAll('[data-ud-panel]').forEach(function (p) { p.hidden = p.dataset.udPanel !== t.dataset.udTab; });
    });
  });
})();
