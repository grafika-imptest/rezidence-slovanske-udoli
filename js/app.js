/* Globální chování: hlavička, menu, reveal, videa, lightbox, oblíbené/porovnání, formuláře. Vanilla JS, progressive enhancement. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var base = window.SU.base;
  var fmt = new Intl.NumberFormat('cs-CZ');
  window.SUfmt = { czk: function (n) { return n ? fmt.format(n) + ' Kč' : ''; }, m2: function (n) { return n ? new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 }).format(n) + ' m²' : '—'; } };

  /* --- Hlavička ---------------------------------------------------------- */
  var hdr = $('[data-hdr]');
  var onScroll = function () { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* --- Mobilní menu ------------------------------------------------------ */
  var menu = $('[data-menu]'), opener = $('[data-menu-open]');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
    if (opener) opener.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = $('a', menu); if (f) f.focus(); } else if (opener) opener.focus();
  }
  if (opener) opener.addEventListener('click', function () { setMenu(true); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLightbox(); window.SUSheet && window.SUSheet.close(); } });

  /* --- Reveal ------------------------------------------------------------ */
  var rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rev.forEach(function (el) { el.classList.add('is-in'); }); }, 4000);
  } else rev.forEach(function (el) { el.classList.add('is-in'); });

  /* --- Hero video: mobilní 9:16 verze + pauza ----------------------------- */
  var hv = $('.hero__video');
  if (hv) {
    if (window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches && hv.dataset.mobileSrc) {
      hv.poster = hv.dataset.mobilePoster;
    }
    if (reduced) { hv.removeAttribute('autoplay'); hv.pause(); }
    var vt = $('[data-video-toggle]');
    var sync = function () { if (vt) vt.innerHTML = '<svg class="i" aria-hidden="true"><use href="' + base + 'img/icons.svg#' + (hv.paused ? 'play' : 'pause') + '"/></svg>'; };
    if (vt) vt.addEventListener('click', function () { if (hv.paused) hv.play(); else hv.pause(); sync(); });
    hv.addEventListener('play', sync); hv.addEventListener('pause', sync);
    document.addEventListener('visibilitychange', function () { if (document.hidden) hv.pause(); else if (!reduced) hv.play().catch(function () {}); });
  }

  /* --- Lazy videa (banner, typologie) – přehrát jen ve viewportu --------- */
  var lazyV = $$('video[data-lazy-video]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } if (!reduced && !v.dataset.userPaused) v.play().catch(function () {}); }
        else v.pause();
      });
    }, { threshold: .25 });
    lazyV.forEach(function (v) { vio.observe(v); });
  }
  $$('[data-vband-toggle]').forEach(function (b) {
    var v = b.parentNode.querySelector('video');
    var s = function () { b.innerHTML = '<svg class="i" aria-hidden="true"><use href="' + base + 'img/icons.svg#' + (v.paused ? 'play' : 'pause') + '"/></svg>'; };
    b.addEventListener('click', function () { if (v.paused) { delete v.dataset.userPaused; v.play(); } else { v.dataset.userPaused = 1; v.pause(); } s(); });
    v.addEventListener('play', s); v.addEventListener('pause', s);
  });

  /* --- Toast ------------------------------------------------------------- */
  var toastEl = $('[data-toast]'), toastT;
  window.SUToast = function (html) { if (!toastEl) return; toastEl.innerHTML = html; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200); };

  /* --- Lightbox ---------------------------------------------------------- */
  var lb = null, lbItems = [], lbIdx = 0;
  function openLightbox(trigger) {
    var group = trigger.getAttribute('data-group');
    lbItems = group ? $$('[data-lightbox][data-group="' + group + '"]').filter(function (x) { return x.offsetParent !== null; }) : [trigger];
    lbIdx = Math.max(0, lbItems.indexOf(trigger));
    if (!lb) {
      lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = '<div class="lb__bar"><span class="small" data-lb-n></span><button class="tool" style="color:#fff" type="button" aria-label="Zavřít" data-lb-close><svg class="i"><use href="' + base + 'img/icons.svg#close"/></svg></button></div><div class="lb__stage"><img alt=""><button class="lb__nav lb__prev" type="button" aria-label="Předchozí" data-lb-prev><svg class="i"><use href="' + base + 'img/icons.svg#arrow-l"/></svg></button><button class="lb__nav lb__next" type="button" aria-label="Další" data-lb-next><svg class="i"><use href="' + base + 'img/icons.svg#arrow"/></svg></button></div><p class="lb__cap" data-lb-cap></p>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) {
        if (e.target.closest('[data-lb-close]') || e.target === lb.querySelector('.lb__stage')) closeLightbox();
        if (e.target.closest('[data-lb-prev]')) showLb(lbIdx - 1);
        if (e.target.closest('[data-lb-next]')) showLb(lbIdx + 1);
      });
      document.addEventListener('keydown', function (e) { if (!lb || lb.hidden) return; if (e.key === 'ArrowLeft') showLb(lbIdx - 1); if (e.key === 'ArrowRight') showLb(lbIdx + 1); });
      var sx = 0; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1)); });
    }
    lb.hidden = false; document.body.style.overflow = 'hidden'; showLb(lbIdx);
    lb.querySelector('[data-lb-close]').focus();
  }
  function showLb(i) {
    if (!lbItems.length) return;
    lbIdx = (i + lbItems.length) % lbItems.length;
    var t = lbItems[lbIdx], img = lb.querySelector('img');
    img.src = t.getAttribute('data-lightbox'); img.alt = t.getAttribute('data-caption') || '';
    img.classList.toggle('is-photo', t.hasAttribute('data-photo') || /\/viz\//.test(img.src));
    lb.querySelector('[data-lb-cap]').textContent = t.getAttribute('data-caption') || '';
    lb.querySelector('[data-lb-n]').textContent = lbItems.length > 1 ? (lbIdx + 1) + ' / ' + lbItems.length : '';
    $$('.lb__nav', lb).forEach(function (n) { n.hidden = lbItems.length < 2; });
  }
  function closeLightbox() { if (lb && !lb.hidden) { lb.hidden = true; document.body.style.overflow = ''; } }
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-lightbox]'); if (t) { e.preventDefault(); openLightbox(t); } });

  /* --- Bottom/side sheet --------------------------------------------------- */
  var scrim = $('[data-scrim]'), openSheet = null;
  window.SUSheet = {
    open: function (el) { if (openSheet && openSheet !== el) openSheet.classList.remove('is-open'); openSheet = el; el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); scrim.classList.add('is-on'); },
    close: function () { if (!openSheet) return; openSheet.classList.remove('is-open'); openSheet.setAttribute('aria-hidden', 'true'); openSheet = null; scrim.classList.remove('is-on'); document.dispatchEvent(new Event('su:sheetclose')); }
  };
  if (scrim) scrim.addEventListener('click', function () { window.SUSheet.close(); });

  /* --- Oblíbené / porovnání: tlačítka + počítadla + lišta ------------------ */
  function syncButtons() {
    var S = window.SUStore;
    $$('[data-fav]').forEach(function (b) { var on = S.has('fav', b.dataset.fav); b.setAttribute('aria-pressed', String(on)); var l = b.querySelector('[data-fav-label]'); if (l) l.textContent = on ? 'Uloženo' : 'Uložit'; });
    $$('[data-cmp]').forEach(function (b) { var on = S.has('cmp', b.dataset.cmp); b.setAttribute('aria-pressed', String(on)); var l = b.querySelector('[data-cmp-label]'); if (l) l.textContent = on ? 'V porovnání' : 'Porovnat'; });
    $$('[data-fav-count]').forEach(function (n) { var c = S.get('fav').length; n.textContent = c || ''; n.dataset.n = c; });
    $$('[data-cmp-count]').forEach(function (n) { var c = S.get('cmp').length; n.textContent = c || ''; n.dataset.n = c; });
    renderCmpBar();
  }
  var bar = $('[data-cmpbar]');
  function renderCmpBar() {
    if (!bar) return;
    var ids = window.SUStore.get('cmp');
    var onCmpPage = !!$('[data-cmp-page]');
    var show = ids.length > 0 && !onCmpPage;
    bar.hidden = !show; requestAnimationFrame(function () { bar.classList.toggle('is-on', show); });
    document.body.classList.toggle('has-cmpbar', show);
    if (!show) return;
    window.SUStore.units().then(function (us) {
      var by = {}; us.forEach(function (u) { by[u.id] = u; });
      $('[data-cmpbar-items]', bar).innerHTML = ids.map(function (id) { var u = by[id]; return u ? '<span class="cmpbar__chip">' + u.label + (u.type === 'byt' ? ' ' + u.b : '') + ' · ' + u.layout + '<button type="button" aria-label="Odebrat" data-cmp-rm="' + id + '">×</button></span>' : ''; }).join('');
    });
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-fav]'), c = e.target.closest('[data-cmp]'), rm = e.target.closest('[data-cmp-rm]'), clr = e.target.closest('[data-cmp-clear]');
    if (f) { e.preventDefault(); var a = window.SUStore.toggle('fav', f.dataset.fav); window.SUToast(a ? 'Uloženo do oblíbených · <a href="' + base + 'oblibene/">Zobrazit</a>' : 'Odebráno z oblíbených'); }
    if (c) { e.preventDefault(); var r = window.SUStore.toggle('cmp', c.dataset.cmp); window.SUToast(r === 'full' ? 'Porovnat lze nejvýše ' + window.SUStore.MAX_CMP + ' jednotky.' : r ? 'Přidáno k porovnání · <a href="' + base + 'porovnani/">Porovnat</a>' : 'Odebráno z porovnání'); }
    if (rm) { window.SUStore.remove('cmp', rm.dataset.cmpRm); }
    if (clr) { window.SUStore.clear('cmp'); }
  });
  document.addEventListener('su:store', syncButtons);
  document.addEventListener('su:rendered', syncButtons);
  syncButtons();

  /* --- Sdílení ------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-share]'); if (!s) return;
    var data = { title: document.title, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { window.SUToast('Odkaz zkopírován do schránky'); });
  });

  /* --- Formuláře (validace; prototyp neodesílá) ------------------------------ */
  $$('[data-form]').forEach(function (form) {
    var favs = window.SUStore.get('fav'), attach = $('[data-fav-attach]', form);
    if (attach && favs.length) { attach.hidden = false; $('[data-fav-list]', attach).textContent = favs.join(', '); }
    var params = new URLSearchParams(location.search);
    if (params.get('jednotka')) { var msg = $('textarea', form); if (msg && !msg.value) msg.value = 'Dobrý den, mám zájem o jednotku ' + params.get('jednotka') + '.'; }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true;
      $$('[required]', form).forEach(function (inp) {
        var field = inp.closest('.field') || inp.parentNode;
        var valid = inp.type === 'checkbox' ? inp.checked : inp.type === 'email' ? /^\S+@\S+\.\S+$/.test(inp.value) : inp.value.trim().length > 0;
        field.classList.toggle('is-invalid', !valid); if (!valid && ok) { inp.focus(); ok = false; }
      });
      if (ok) { form.classList.add('is-sent'); form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    });
  });

  /* --- Galerie – filtr ------------------------------------------------------- */
  $$('[data-gal-f]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-gal-f]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('[data-gallery] .gal__i').forEach(function (i) { i.classList.toggle('is-hidden', b.dataset.galF !== 'vse' && (' ' + i.dataset.tags + ' ').indexOf(' ' + b.dataset.galF + ' ') < 0); });
    });
  });

  /* --- Skrytí značek K OVĚŘENÍ / CHYBÍ (prezentační režim) ------------------- */
  try { if (localStorage.getItem('su:hidegaps') === '1') document.body.classList.add('hide-gaps'); } catch (e) {}
  $$('[data-toggle-gaps]').forEach(function (t) {
    t.checked = document.body.classList.contains('hide-gaps');
    t.addEventListener('change', function () { document.body.classList.toggle('hide-gaps', t.checked); try { localStorage.setItem('su:hidegaps', t.checked ? '1' : '0'); } catch (e) {} });
  });
})();
