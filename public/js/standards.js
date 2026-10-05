/* Standardy – přepínání sad (byty / dvojdomy / řadové domy), rozbalování položek, hledání, scrollspy */
(function () {
  var root = document.querySelector('[data-stdx]'); if (!root) return;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var cur = 'byty';
  function setSet(id, keepHash) {
    cur = id;
    $$('[data-set]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.set === id)); });
    $$('[data-set-panel]').forEach(function (p) { p.hidden = p.dataset.setPanel !== id; });
    var u = new URL(location.href); u.searchParams.set('sada', id); if (!keepHash) u.hash = ''; history.replaceState(null, '', u);
    filter();
  }
  $$('[data-set]').forEach(function (b) { b.addEventListener('click', function () { setSet(b.dataset.set); }); });
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-std-toggle]'); if (!t) return;
    t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'));
  });
  var q = root.querySelector('[data-std-search]'), photos = root.querySelector('[data-std-photos]');
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function filter() {
    var term = norm(q.value.trim()), onlyPh = photos.checked;
    var panel = root.querySelector('[data-set-panel="' + cur + '"]');
    $$('[data-std-item]', panel).forEach(function (it) {
      var ok = (!term || norm(it.textContent).indexOf(term) > -1) && (!onlyPh || it.dataset.photo === '1');
      it.classList.toggle('is-hidden', !ok);
      if (term && ok) it.querySelector('[data-std-toggle]').setAttribute('aria-expanded', 'true');
    });
    $$('.stdcat', panel).forEach(function (c) { c.hidden = !c.querySelector('[data-std-item]:not(.is-hidden)') && (term || onlyPh); });
  }
  q.addEventListener('input', filter); photos.addEventListener('change', filter);
  // scrollspy
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { $$('[data-cat-link]').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id); }); } });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.stdcat').forEach(function (c) { io.observe(c); });
  }
  // init: ?sada= + #polozka
  var p = new URLSearchParams(location.search).get('sada');
  if (p && root.querySelector('[data-set="' + p + '"]')) setSet(p, true);
  if (location.hash) {
    var panel = root.querySelector('[data-set-panel="' + cur + '"]');
    var el = panel.querySelector(location.hash.replace(/[^#\w-]/g, ''));
    if (el) { var tg = el.querySelector('[data-std-toggle]'); if (tg) tg.setAttribute('aria-expanded', 'true'); setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 60); }
  }
})();
