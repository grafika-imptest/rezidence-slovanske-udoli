/* Oblíbené + porovnání: localStorage (per prohlížeč). V CMS lze napojit na uživatelský účet / sdílený odkaz. */
(function () {
  var KEY = { fav: 'su:fav', cmp: 'su:cmp' };
  var MAX_CMP = 4;
  function read(k) { try { var v = JSON.parse(localStorage.getItem(KEY[k]) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function write(k, v) { try { localStorage.setItem(KEY[k], JSON.stringify(v)); } catch (e) {} }
  var mem = { fav: read('fav'), cmp: read('cmp') };
  // ?oblibene=BD1-02,BD1-05 – sdílený seznam
  try {
    var q = new URLSearchParams(location.search).get('seznam');
    if (q) { q.split(',').forEach(function (id) { if (id && mem.fav.indexOf(id) < 0) mem.fav.push(id); }); write('fav', mem.fav); }
  } catch (e) {}
  function emit() { document.dispatchEvent(new CustomEvent('su:store', { detail: { fav: mem.fav.slice(), cmp: mem.cmp.slice() } })); }
  var unitsPromise = null;
  window.SUStore = {
    MAX_CMP: MAX_CMP,
    get: function (k) { return mem[k].slice(); },
    has: function (k, id) { return mem[k].indexOf(id) > -1; },
    toggle: function (k, id) {
      var i = mem[k].indexOf(id), added;
      if (i > -1) { mem[k].splice(i, 1); added = false; }
      else {
        if (k === 'cmp' && mem.cmp.length >= MAX_CMP) return 'full';
        mem[k].push(id); added = true;
      }
      write(k, mem[k]); emit(); return added;
    },
    remove: function (k, id) { var i = mem[k].indexOf(id); if (i > -1) { mem[k].splice(i, 1); write(k, mem[k]); emit(); } },
    clear: function (k) { mem[k] = []; write(k, []); emit(); },
    units: function () {
      if (!unitsPromise) unitsPromise = fetch(window.SU.base + 'data/units.json').then(function (r) { return r.json(); });
      return unitsPromise;
    },
    emit: emit
  };
})();
