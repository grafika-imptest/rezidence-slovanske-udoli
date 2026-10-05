/* Oblíbené + Porovnání – vykreslení ze sdílených dat jednotek (data/units.json) */
(function () {
  var base = window.SU.base, F = window.SUfmt, S = window.SUStore;
  var FL = { '1.PP': '1. PP', '1.NP': '1. NP', '2.NP': '2. NP', '3.NP': '3. NP' };
  var STATUS = { volne: 'Volné', rezervovano: 'Rezervováno', prodano: 'Prodáno' };
  var TYPE1 = { byt: 'Byt', 'radovy-dum': 'Řadový dům', dvojdum: 'Dvojdům' };
  var ico = function (n, c) { return '<svg class="i ' + (c || '') + '" aria-hidden="true"><use href="' + base + 'img/icons.svg#' + n + '"/></svg>'; };
  var outd = function (u) { var o = []; if (u.loggia) o.push('lodžie ' + F.m2(u.loggia)); if (u.balcony) o.push('balkon ' + F.m2(u.balcony)); if (u.terrace) o.push('terasa ' + F.m2(u.terrace)); if (u.porch) o.push('závětří ' + F.m2(u.porch)); return o.join(' + '); };
  var href = function (u) { return base + 'nabidka/' + u.slug + '/'; };
  var price = function (u) { return u.status === 'prodano' ? '<span class="price price--sold">Prodáno</span>' : '<span class="price">' + F.czk(u.price) + '</span>'; };

  function row(u) {
    return '<article class="urow st-' + u.status + '"><a class="urow__plan" href="' + href(u) + '" tabindex="-1"><img src="' + base + u.thumb + '" alt=""></a>'
      + '<div class="urow__id"><a class="urow__title" href="' + href(u) + '"><span class="urow__type">' + TYPE1[u.type] + '</span> ' + (u.type === 'byt' ? 'č. ' + u.n + ' <small>' + u.b + '</small>' : 'č. ' + String(u.n).padStart(2, '0')) + '</a><span class="badge badge--' + u.status + '">' + STATUS[u.status] + '</span></div>'
      + '<dl class="urow__kv"><div><dt>Dispozice</dt><dd>' + u.layout + '</dd></div><div><dt>' + (u.type === 'byt' ? 'Podlaží' : 'Pozemek') + '</dt><dd>' + (u.type === 'byt' ? FL[u.floor] : F.m2(u.plot)) + '</dd></div><div><dt>Plocha</dt><dd>' + F.m2(u.area) + '</dd></div><div class="urow__out"><dt>Venkovní</dt><dd>' + (outd(u) || '—') + '</dd></div></dl>'
      + '<div class="urow__price">' + price(u) + '</div>'
      + '<div class="urow__act"><button class="iconbtn" type="button" data-fav="' + u.id + '" aria-label="Oblíbené">' + ico('heart') + '</button><button class="iconbtn" type="button" data-cmp="' + u.id + '" aria-label="Porovnat">' + ico('compare') + '</button><a class="iconbtn iconbtn--go" href="' + href(u) + '" aria-label="Detail">' + ico('arrow') + '</a></div></article>';
  }

  /* ---------- Oblíbené */
  var fp = document.querySelector('[data-favs-page]');
  function renderFavs(by) {
    var ids = S.get('fav').filter(function (id) { return by[id]; });
    fp.querySelector('[data-favs-empty]').hidden = ids.length > 0;
    fp.querySelector('[data-favs-list]').hidden = !ids.length;
    fp.querySelector('[data-favs-n]').textContent = ids.length;
    fp.querySelector('[data-favs-rows]').innerHTML = ids.map(function (id) { return row(by[id]); }).join('');
    document.dispatchEvent(new Event('su:rendered'));
  }
  if (fp) {
    S.units().then(function (us) {
      var by = {}; us.forEach(function (u) { by[u.id] = u; });
      renderFavs(by); document.addEventListener('su:store', function () { renderFavs(by); });
      fp.querySelector('[data-favs-cmp]').addEventListener('click', function () {
        S.clear('cmp'); S.get('fav').slice(0, S.MAX_CMP).forEach(function (id) { S.toggle('cmp', id); }); location.href = base + 'porovnani/';
      });
      fp.querySelector('[data-favs-share]').addEventListener('click', function () {
        var u = location.origin + base + 'oblibene/?seznam=' + S.get('fav').join(',');
        if (navigator.share) navigator.share({ title: 'Moje oblíbené jednotky – Slovanské údolí', url: u }).catch(function () {});
        else if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { window.SUToast('Odkaz na seznam zkopírován'); });
      });
    });
  }

  /* ---------- Porovnání */
  var cp = document.querySelector('[data-cmp-page]');
  var ROWS = [
    ['Typ', function (u) { return TYPE1[u.type]; }],
    ['Stav', function (u) { return '<span class="badge badge--' + u.status + '">' + STATUS[u.status] + '</span>'; }, function (u) { return u.status; }],
    ['Cena s DPH', function (u) { return price(u); }, function (u) { return u.status === 'prodano' ? null : u.price; }, 'min'],
    ['Cena za m²', function (u) { return u.status !== 'prodano' && u.price ? F.czk(Math.round(u.price / u.area)) + '<br><small class="muted">vypočteno</small>' : '—'; }, function (u) { return u.status !== 'prodano' && u.price ? u.price / u.area : null; }, 'min'],
    ['Dispozice', function (u) { return u.layout; }],
    ['Objekt / podlaží', function (u) { return u.type === 'byt' ? u.b + ' · ' + FL[u.floor] : '1. NP + 1. PP'; }],
    ['Plocha', function (u) { return F.m2(u.area) + '<br><small class="muted">' + (u.type === 'byt' ? 'podlahová' : 'obytná') + '</small>'; }, function (u) { return u.area; }, 'max'],
    ['Venkovní prostor', function (u) { return outd(u) || '—'; }, function (u) { return (u.loggia || 0) + (u.balcony || 0) + (u.terrace || 0) + (u.porch || 0) || null; }, 'max'],
    ['Pozemek', function (u) { return u.plot ? F.m2(u.plot) : '—'; }, function (u) { return u.plot; }, 'max'],
    ['Sklep', function (u) { return u.cellar ? F.m2(u.cellar) : '—'; }],
    ['Parkování', function (u) { return u.type === 'byt' ? (u.parking ? 'garážové stání' + (u.parkingPrice ? '<br><small class="muted">+ ' + F.czk(u.parkingPrice) + '</small>' : '') : '—') : 'garáž ' + F.m2(u.garage); }],
    ['Orientace', function (u) { return u.orient || '—'; }],
  ];
  function renderCmp(by) {
    var ids = S.get('cmp').filter(function (id) { return by[id]; }), list = ids.map(function (id) { return by[id]; });
    cp.querySelector('[data-cmp-empty]').hidden = list.length > 0;
    cp.querySelector('[data-cmp-wrap]').hidden = !list.length;
    cp.querySelector('[data-cmp-n]').textContent = list.length;
    var diffOn = cp.querySelector('[data-cmp-diff]').checked;
    var t = '<table style="--n:' + list.length + '"><thead><tr><th></th>' + list.map(function (u) {
      return '<td><div class="cmpt__h"><a href="' + href(u) + '"><img src="' + base + u.plan + '" alt="Půdorys ' + u.label + '"></a><a class="cmpt__t" href="' + href(u) + '">' + u.label + (u.type === 'byt' ? ' · ' + u.b : '') + '</a><button class="cmpt__x" type="button" data-cmp-rm="' + u.id + '">Odebrat</button></div></td>';
    }).join('') + '</tr></thead><tbody>' + ROWS.map(function (r) {
      var vals = list.map(function (u) { return r[2] ? r[2](u) : r[1](u); });
      var differs = vals.some(function (v) { return String(v) !== String(vals[0]); });
      var best = null;
      if (r[3] && list.length > 1) { var nums = vals.filter(function (v) { return v != null; }); if (nums.length > 1) best = r[3] === 'min' ? Math.min.apply(null, nums) : Math.max.apply(null, nums); }
      return '<tr class="' + (diffOn && differs ? 'is-diff' : '') + '"><th scope="row">' + r[0] + '</th>' + list.map(function (u, i) { return '<td class="' + (best != null && vals[i] === best ? 'is-best' : '') + '">' + r[1](u) + '</td>'; }).join('') + '</tr>';
    }).join('') + '<tr><th scope="row"></th>' + list.map(function (u) { return '<td><a class="btn btn--sm" href="' + href(u) + '#poptavka">Poptat ' + ico('arrow', 'i--arrow') + '</a></td>'; }).join('') + '</tr></tbody></table>';
    cp.querySelector('[data-cmp-table]').innerHTML = t;
  }
  if (cp) {
    S.units().then(function (us) {
      var by = {}; us.forEach(function (u) { by[u.id] = u; });
      renderCmp(by); document.addEventListener('su:store', function () { renderCmp(by); });
      cp.querySelector('[data-cmp-diff]').addEventListener('change', function () { renderCmp(by); });
    });
  }
})();
