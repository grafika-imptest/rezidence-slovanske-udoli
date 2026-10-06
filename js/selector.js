/* Výběr jednotek: situace → bytový dům → podlaží → jednotka; filtry, řazení, náhled, URL stav.
   Řádky jednotek jsou vyrenderované na serveru (SEO, no-JS); skript je jen filtruje a řadí. */
(function () {
  var root = document.querySelector('[data-selector]'); if (!root) return;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var base = window.SU.base, F = window.SUfmt;
  var FL = { '1.PP': '1. PP', '1.NP': '1. NP', '2.NP': '2. NP', '3.NP': '3. NP' };
  var STATUS = { volne: 'Volné', rezervovano: 'Rezervováno', prodano: 'Prodáno' };
  var TYPE1 = { byt: 'Byt', 'radovy-dum': 'Řadový dům', dvojdum: 'Dvojdům' };
  var list = $('[data-list]'), rows = $$('.urow', list), units = {};
  var st = { type: 'vse', view: 'site', b: null, f: null, layouts: [], floors: [], out: [], area: 0, price: 0, free: false, sort: 'default' };
  var PRICE_MAX = +$('[data-f-price]').max;

  /* ---------- URL <-> stav */
  function fromURL() {
    var p = new URLSearchParams(location.search);
    if (p.get('typ')) st.type = p.get('typ');
    if (p.get('budova')) { st.b = p.get('budova'); st.view = 'floor'; st.type = 'byt'; }
    if (p.get('podlazi')) st.f = p.get('podlazi');
    if (p.get('dispozice')) st.layouts = p.get('dispozice').replace(/ /g, '+').split(',');
    if (p.get('stav') === 'volne') st.free = true;
  }
  function toURL() {
    var p = new URLSearchParams();
    if (st.type !== 'vse') p.set('typ', st.type);
    if (st.view === 'floor' && st.b) { p.set('budova', st.b); if (st.f) p.set('podlazi', st.f); }
    if (st.layouts.length) p.set('dispozice', st.layouts.join(','));
    if (st.free) p.set('stav', 'volne');
    var q = p.toString(); history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
  }

  /* ---------- filtrování */
  function matches(r, ignoreScope) {
    var d = r.dataset;
    if (st.type !== 'vse' && d.type !== st.type) return false;
    if (!ignoreScope && st.view === 'floor' && st.b) { if (d.b !== st.b) return false; if (st.f && d.floor !== st.f) return false; }
    if (st.free && d.status !== 'volne') return false;
    if (d.type === 'byt') {
      if (st.layouts.length && st.layouts.indexOf(d.layout) < 0) return false;
      if (st.floors.length && st.floors.indexOf(d.floor) < 0) return false;
    }
    if (st.out.length && !st.out.every(function (o) { return (' ' + d.out + ' ').indexOf(' ' + o + ' ') > -1; })) return false;
    if (st.area && +d.area < st.area) return false;
    if (st.price && st.price < PRICE_MAX && (!d.price || +d.price > st.price)) return false;
    return true;
  }
  function sortRows(vis) {
    var key = st.sort, fo = { '1.PP': -1, '1.NP': 1, '2.NP': 2, '3.NP': 3 };
    var ord = { byt: 0, 'radovy-dum': 1, dvojdum: 2 };
    rows.sort(function (a, b) {
      var A = a.dataset, B = b.dataset;
      if (key === 'price-asc' || key === 'price-desc') { var pa = +A.price || Infinity, pb = +B.price || Infinity; if (key === 'price-desc') { pa = +A.price || -1; pb = +B.price || -1; return pb - pa; } return pa - pb; }
      if (key === 'area-asc') return A.area - B.area;
      if (key === 'area-desc') return B.area - A.area;
      if (key === 'floor') return (fo[A.floor] || 0) - (fo[B.floor] || 0) || A.b.localeCompare(B.b) || A.n - B.n;
      return ord[A.type] - ord[B.type] || A.b.localeCompare(B.b) || A.n - B.n;
    });
    var frag = document.createDocumentFragment(); rows.forEach(function (r) { frag.appendChild(r); }); list.appendChild(frag);
  }
  function apply() {
    var n = 0;
    rows.forEach(function (r) { var ok = matches(r); r.classList.toggle('is-hidden', !ok); if (ok) n++; });
    sortRows();
    $('[data-count]').textContent = n;
    $('[data-count-l]').textContent = n === 1 ? 'jednotka' : n > 1 && n < 5 ? 'jednotky' : 'jednotek';
    $('[data-empty]').hidden = n > 0;
    // rozsah (scope) – zobrazen jen jeden dům/podlaží
    var scope = $('[data-scope]');
    if (st.view === 'floor' && st.b) { scope.hidden = false; scope.innerHTML = 'Zobrazeno: ' + st.b + (st.f ? ' · ' + FL[st.f] : '') + ' <button type="button" data-scope-clear>zobrazit vše</button>'; }
    else scope.hidden = true;
    // tlačítka filtru – aktivní počet
    var fc = st.layouts.length + st.floors.length + st.out.length + (st.area ? 1 : 0) + (st.price && st.price < PRICE_MAX ? 1 : 0) + (st.free ? 1 : 0);
    var fcn = $('[data-fcount]'); fcn.textContent = fc || ''; fcn.dataset.n = fc;
    $$('[data-reset]').forEach(function (b) { if (b.closest('[data-empty]')) return; b.hidden = !fc; });
    // filtry jen pro byty
    $$('[data-only=byt]').forEach(function (g) { g.classList.toggle('is-off', st.type !== 'vse' && st.type !== 'byt'); });
    // půdorys – zašednout nevyhovující
    $$('.fplan__u[data-unit]').forEach(function (g) { var r = rowById[g.dataset.unit]; g.classList.toggle('is-filtered', !!r && !matches(r, true)); });
    // situace – ztlumit objekty jiného typu
    $$('.splan__obj[data-obj]').forEach(function (g) {
      var id = g.dataset.obj, t = id.indexOf('BD') === 0 ? 'byt' : id.indexOf('RDD') === 0 ? 'dvojdum' : 'radovy-dum';
      g.classList.toggle('is-dim', st.type !== 'vse' && st.type !== t);
    });
    toURL();
  }
  var rowById = {}; rows.forEach(function (r) { rowById[r.dataset.u] = r; });

  /* ---------- pohledy: situace / podlaží */
  var visual = $('[data-visual]'), pathB = $('[data-path-b]'), pathF = $('[data-path-f]');
  function floorsOf(b) { return ['1.PP', '1.NP', '2.NP', '3.NP'].filter(function (f) { return !!$('[data-floorkey="' + b + '_' + f.replace('.', '') + '"]'); }); }
  function showView() {
    $('[data-view=site]').hidden = st.view !== 'site';
    $('[data-view=floor]').hidden = st.view !== 'floor';
    visual.dataset.visual = st.view;
    if (st.view === 'floor') {
      var fls = floorsOf(st.b);
      if (!st.f || fls.indexOf(st.f) < 0) {
        // výchozí: první podlaží s volnou jednotkou, jinak 1.NP
        st.f = fls.filter(function (f) { return rows.some(function (r) { return r.dataset.b === st.b && r.dataset.floor === f && r.dataset.status === 'volne'; }); })[0] || '1.NP';
      }
      $$('[data-bd]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.bd === st.b)); });
      $$('[data-fl]').forEach(function (b) {
        var exists = fls.indexOf(b.dataset.fl) > -1; b.disabled = !exists;
        var free = rows.filter(function (r) { return r.dataset.b === st.b && r.dataset.floor === b.dataset.fl && r.dataset.status === 'volne'; }).length;
        b.innerHTML = FL[b.dataset.fl] + '<small>' + (exists ? free + ' volných' : '—') + '</small>';
        b.setAttribute('aria-selected', String(b.dataset.fl === st.f));
      });
      $$('[data-floorkey]').forEach(function (d) { d.hidden = d.dataset.floorkey !== st.b + '_' + st.f.replace('.', ''); });
      pathB.hidden = false; pathB.textContent = st.b === 'BD1' ? 'Bytový dům 1' : 'Bytový dům 2';
      pathF.hidden = false; pathF.textContent = FL[st.f];
      var sc = $('[data-floors-scroll]'); if (sc) sc.scrollLeft = 0;
    } else { pathB.hidden = pathF.hidden = true; }
  }
  function goFloor(b, f) { st.view = 'floor'; st.b = b; st.f = f || null; if (st.type !== 'byt') setType('byt', true); showView(); apply(); }
  function goSite() { st.view = 'site'; st.b = null; st.f = null; showView(); apply(); }

  /* ---------- typ (záložky) */
  function setType(t, silent) {
    st.type = t;
    $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === t)); });
    if (t !== 'byt' && t !== 'vse' && st.view === 'floor') { st.view = 'site'; st.b = st.f = null; showView(); }
    if (!silent) apply();
  }
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { setType(b.dataset.tab); }); });

  /* ---------- interakce situace */
  root.addEventListener('click', function (e) {
    var o = e.target.closest('.splan__obj[data-obj]');
    if (o) { var id = o.dataset.obj; if (id.indexOf('BD') === 0) goFloor(id); else preview(id); return; }
    var u = e.target.closest('.fplan__u[data-unit]'); if (u) { preview(u.dataset.unit); return; }
    if (e.target.closest('[data-go=site]')) goSite();
    var bd = e.target.closest('[data-bd]'); if (bd) { st.b = bd.dataset.bd; showView(); apply(); }
    var fl = e.target.closest('[data-fl]'); if (fl && !fl.disabled) { st.f = fl.dataset.fl; showView(); apply(); }
    if (e.target.closest('[data-scope-clear]')) goSite();
    if (e.target.closest('[data-reset]')) reset();
    if (e.target.closest('[data-filters-open]')) openFilters(true);
    if (e.target.closest('[data-filters-done]')) openFilters(false);
    if (e.target.closest('[data-preview-close]')) window.SUSheet.close();
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest('[data-obj],[data-unit]'); if (!t) return; e.preventDefault(); t.click ? t.dispatchEvent(new MouseEvent('click', { bubbles: true })) : 0;
  });

  /* ---------- tooltip nad půdorysem (myš) */
  var tip = document.createElement('div'); tip.className = 'ftip'; document.body.appendChild(tip);
  root.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var g = e.target.closest('.fplan__u[data-unit], .splan__obj[data-obj]'); if (!g) return;
    var id = g.dataset.unit || g.dataset.obj, u = units[id];
    if (id.indexOf('BD') === 0 && !u) {
      var rs = rows.filter(function (r) { return r.dataset.b === id; });
      var fr = rs.filter(function (r) { return r.dataset.status === 'volne'; }).length;
      tip.innerHTML = '<b>' + (id === 'BD1' ? 'Bytový dům 1' : 'Bytový dům 2') + '</b><div class="ftip__row"><span>Volné byty</span><b>' + fr + ' / ' + rs.length + '</b></div><div class="ftip__row"><span>Klikněte pro podlaží</span></div>';
    } else if (u) {
      tip.innerHTML = '<b>' + u.label + (u.type === 'byt' ? ' · ' + u.b : '') + '</b><div class="ftip__row"><span>' + u.layout + ' · ' + F.m2(u.area) + '</span><span class="badge badge--' + u.status + '">' + STATUS[u.status] + '</span></div><div class="ftip__row"><span>Cena</span><span class="price">' + (u.status === 'prodano' ? '—' : F.czk(u.price)) + '</span></div>';
    } else return;
    tip.classList.add('is-on');
    var rr = rowById[id]; if (rr) rr.classList.add('is-active');
  });
  root.addEventListener('pointermove', function (e) { if (tip.classList.contains('is-on')) { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; } });
  root.addEventListener('pointerout', function (e) {
    var g = e.target.closest('.fplan__u[data-unit], .splan__obj[data-obj]'); if (!g) return;
    tip.classList.remove('is-on'); var rr = rowById[g.dataset.unit || g.dataset.obj]; if (rr) rr.classList.remove('is-active');
  });
  // řádek → zvýraznění v plánu
  list.addEventListener('pointerover', function (e) { var r = e.target.closest('.urow'); if (!r) return; var g = root.querySelector('.fplan__u[data-unit="' + r.dataset.u + '"], .splan__obj[data-obj="' + r.dataset.u + '"]'); if (g) g.classList.add('is-active'); });
  list.addEventListener('pointerout', function (e) { var r = e.target.closest('.urow'); if (!r) return; $$('.is-active', visual).forEach(function (g) { g.classList.remove('is-active'); }); });

  /* ---------- náhled jednotky (side sheet / bottom sheet) */
  var pv = $('[data-preview]'), pvBody = $('[data-preview-body]');
  function kv(l, v) { return '<div><dt>' + l + '</dt><dd>' + (v || '—') + '</dd></div>'; }
  function outd(u) { var o = []; if (u.loggia) o.push('lodžie ' + F.m2(u.loggia)); if (u.balcony) o.push('balkon ' + F.m2(u.balcony)); if (u.terrace) o.push('terasa ' + F.m2(u.terrace)); if (u.porch) o.push('závětří ' + F.m2(u.porch)); return o.join(', '); }
  function preview(id) {
    var u = units[id]; if (!u) return;
    var href = base + 'nabidka/' + u.slug + '/';
    pvBody.innerHTML = '<div class="upv__top"><div><p class="eyebrow">' + (u.type === 'byt' ? u.b + ' · ' + FL[u.floor] : TYPE1[u.type]) + '</p><h2 class="h2" style="margin-top:.5rem">' + u.label + ' <span style="color:var(--brand)">' + u.layout + '</span></h2></div><button class="upv__close" type="button" aria-label="Zavřít" data-preview-close><svg class="i"><use href="' + base + 'img/icons.svg#close"/></svg></button></div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem"><span class="badge badge--' + u.status + '">' + STATUS[u.status] + '</span><span class="price price--lg">' + (u.status === 'prodano' ? 'Prodáno' : F.czk(u.price)) + '</span></div>'
      + '<a class="upv__plan" href="' + href + '"><img src="' + base + u.plan + '" alt="Půdorys ' + u.label + '"></a>'
      + '<dl class="upv__kv">' + kv(u.type === 'byt' ? 'Podlahová plocha' : 'Obytná plocha', F.m2(u.area)) + kv('Venkovní prostor', outd(u)) + (u.type === 'byt' ? kv('Sklep', F.m2(u.cellar)) + kv('Orientace', u.orient) : kv('Pozemek', F.m2(u.plot)) + kv('Garáž', F.m2(u.garage))) + '</dl>'
      + (u.type === 'byt' && u.parkingPrice ? '<p class="small muted">Garážové stání: ' + F.czk(u.parkingPrice) + ' s DPH</p>' : '')
      + '<div class="upv__act"><a class="btn" href="' + href + '">Detail jednotky <svg class="i i--arrow"><use href="' + base + 'img/icons.svg#arrow"/></svg></a><button class="iconbtn" type="button" data-fav="' + u.id + '" aria-label="Oblíbené"><svg class="i"><use href="' + base + 'img/icons.svg#heart"/></svg></button><button class="iconbtn" type="button" data-cmp="' + u.id + '" aria-label="Porovnat"><svg class="i"><use href="' + base + 'img/icons.svg#compare"/></svg></button></div>';
    window.SUSheet.open(pv);
    document.dispatchEvent(new Event('su:rendered'));
    $$('.is-sel', visual).forEach(function (g) { g.classList.remove('is-sel'); });
  }

  /* ---------- filtry */
  function toggleArr(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }
  $$('[data-f-layout]').forEach(function (b) { b.addEventListener('click', function () { toggleArr(st.layouts, b.dataset.fLayout); b.setAttribute('aria-pressed', String(st.layouts.indexOf(b.dataset.fLayout) > -1)); apply(); }); });
  $$('[data-f-floor]').forEach(function (b) { b.addEventListener('click', function () { toggleArr(st.floors, b.dataset.fFloor); b.setAttribute('aria-pressed', String(st.floors.indexOf(b.dataset.fFloor) > -1)); apply(); }); });
  $$('[data-f-out]').forEach(function (b) { b.addEventListener('click', function () { toggleArr(st.out, b.dataset.fOut); b.setAttribute('aria-pressed', String(st.out.indexOf(b.dataset.fOut) > -1)); apply(); }); });
  var fa = $('[data-f-area]'), fp = $('[data-f-price]'), ff = $('[data-f-free]'), so = $('[data-sort]');
  fa.addEventListener('input', function () { st.area = +fa.value; $('[data-out-area]').textContent = fa.value; apply(); });
  fp.addEventListener('input', function () { st.price = +fp.value; $('[data-out-price]').textContent = st.price >= PRICE_MAX ? 'bez omezení' : F.czk(st.price); apply(); });
  ff.addEventListener('change', function () { st.free = ff.checked; apply(); });
  so.addEventListener('change', function () { st.sort = so.value; apply(); });
  function reset() {
    st.layouts = []; st.floors = []; st.out = []; st.area = 0; st.price = 0; st.free = false;
    $$('[data-f-layout],[data-f-floor],[data-f-out]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    fa.value = 0; $('[data-out-area]').textContent = '0'; fp.value = PRICE_MAX; $('[data-out-price]').textContent = 'bez omezení'; ff.checked = false; apply();
  }
  // mobilní panel filtrů
  var fpanel = $('[data-filters]');
  var done = document.createElement('button'); done.type = 'button'; done.className = 'btn btn--lg fdone'; done.setAttribute('data-filters-done', ''); done.textContent = 'Zobrazit výsledky'; fpanel.appendChild(done);
  function openFilters(on) { fpanel.classList.toggle('is-open', on); document.querySelector('[data-scrim]').classList.toggle('is-on', on); if (on) done.textContent = 'Zobrazit ' + $('[data-count]').textContent + ' výsledků'; }
  document.querySelector('[data-scrim]').addEventListener('click', function () { openFilters(false); });
  root.addEventListener('click', function (e) { if (e.target.closest('[data-filters] .chip, [data-f-free]')) setTimeout(function () { done.textContent = 'Zobrazit ' + $('[data-count]').textContent + ' výsledků'; }); });

  /* ---------- init */
  fromURL();
  $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === st.type)); });
  st.layouts.forEach(function (l) { var b = $('[data-f-layout="' + l + '"]'); if (b) b.setAttribute('aria-pressed', 'true'); });
  ff.checked = st.free;
  window.SUStore.units().then(function (us) { us.forEach(function (u) { units[u.id] = u; }); });
  showView(); apply();
})();
