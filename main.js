/* ============================================================
   Church Of The Living God — Charlottesville
   Shared behaviors
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hamburger menu ---------- */
  var hamburger = document.querySelector('.hamburger');
  var navOverlay = document.querySelector('.nav-overlay');
  var navClose = document.querySelector('.nav-close');
  function closeNav() {
    if (!hamburger || !navOverlay) return;
    hamburger.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  function openNav() {
    if (!hamburger || !navOverlay) return;
    hamburger.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('open');
    document.body.classList.add('nav-open');
  }
  if (hamburger && navOverlay) {
    hamburger.addEventListener('click', function () {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeNav(); else openNav();
    });
    navOverlay.addEventListener('click', function (e) {
      if (e.target === navOverlay) closeNav();
    });
    if (navClose) navClose.addEventListener('click', closeNav);
    document.addEventListener('click', function (e) {
      if (!navOverlay.classList.contains('open')) return;
      if (navOverlay.contains(e.target) || hamburger.contains(e.target)) return;
      closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    navOverlay.querySelectorAll('.nav-item > a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
  }

  /* ---------- Nav submenu (About Us) toggle ---------- */
  document.querySelectorAll('.nav-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var submenu = toggle.parentElement.querySelector('.nav-submenu');
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      if (submenu) submenu.classList.toggle('open');
    });
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- Scroll fade-in animations ---------- */
  var faders = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window && faders.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    faders.forEach(function (el) { io.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Generic static form submission ---------- */
  document.querySelectorAll('form[data-static-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var successEl = form.parentElement.querySelector('.form-success') || form.querySelector('.form-success');
      form.reset();
      form.style.display = 'none';
      if (successEl) successEl.classList.add('show');
    });
  });

  /* ---------- Newsletter forms ---------- */
  document.querySelectorAll('form[data-newsletter-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Subscribed!'; btn.disabled = true; }
      form.reset();
      setTimeout(function () {
        if (btn) { btn.textContent = original; btn.disabled = false; }
      }, 3000);
    });
  });

  /* ---------- Form tabs (e.g. prayer request / testimony) ---------- */
  var formTabButtons = document.querySelectorAll('[data-form-tab]');
  var formPanels = document.querySelectorAll('[data-form-panel]');
  if (formTabButtons.length && formPanels.length) {
    formTabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        formTabButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tab = btn.getAttribute('data-form-tab');
        formPanels.forEach(function (panel) {
          panel.style.display = (panel.getAttribute('data-form-panel') === tab) ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Sermon date filter ---------- */
  var sermonDateFilter = document.querySelector('[data-sermon-date-filter]');
  var sermonCards = document.querySelectorAll('.sermon-card[data-month]');
  if (sermonDateFilter && sermonCards.length) {
    sermonDateFilter.addEventListener('change', function () {
      var month = sermonDateFilter.value;
      sermonCards.forEach(function (card) {
        card.style.display = (month === 'all' || card.getAttribute('data-month') === month) ? '' : 'none';
      });
    });
  }

  /* ---------- Lightbox (event delegation — works with dynamic galleries) ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var lbIndex = 0;

    function getLbImgs() {
      return Array.prototype.slice.call(document.querySelectorAll('.gallery-grid figure img'));
    }

    function showLbImage(idx) {
      var imgs = getLbImgs();
      if (idx < 0) idx = imgs.length - 1;
      if (idx >= imgs.length) idx = 0;
      lbIndex = idx;
      if (imgs[lbIndex]) {
        lbImg.src = imgs[lbIndex].src;
        lbImg.alt = imgs[lbIndex].alt;
        if (lbCaption) lbCaption.textContent = imgs[lbIndex].alt;
      }
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('nav-open');
    }

    document.addEventListener('click', function (e) {
      var fig = e.target.closest && e.target.closest('.gallery-grid figure img');
      if (!fig) return;
      var parentFigure = fig.closest('figure');
      var link = parentFigure && parentFigure.getAttribute('data-link');
      if (link) { window.location.href = link; return; }
      var idx = getLbImgs().indexOf(fig);
      showLbImage(idx);
      lightbox.classList.add('open');
      document.body.classList.add('nav-open');
    });

    var lbCloseBtn = lightbox.querySelector('.lightbox-close');
    if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);
    var lbPrev = lightbox.querySelector('.lightbox-nav.prev');
    var lbNext = lightbox.querySelector('.lightbox-nav.next');
    if (lbPrev) lbPrev.addEventListener('click', function () { showLbImage(lbIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { showLbImage(lbIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showLbImage(lbIndex + 1);
      if (e.key === 'ArrowLeft') showLbImage(lbIndex - 1);
    });
  }

  /* ---------- Gallery page renderer ---------- */
  (function () {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;

    var activeCat = 'all';

    function gesc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    fetch('/api/content?section=gallery')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var items = ((data && data.items) || []).filter(function(i) { return i.visibility !== 'private'; });
        if (!items.length) {
          grid.innerHTML = '<p style="text-align:center;opacity:0.6;padding:var(--space-xl) 0;grid-column:1/-1;">No photos yet.</p>';
          return;
        }

        items.sort(function (a, b) {
          var ka = (a._path || '').toLowerCase();
          var kb = (b._path || '').toLowerCase();
          return ka < kb ? -1 : ka > kb ? 1 : 0;
        });

        function render() {
          var filtered = activeCat === 'all'
            ? items
            : items.filter(function (i) { return i.category === activeCat; });

          grid.innerHTML = filtered.map(function (item) {
            var linkAttr = item.link ? ' data-link="' + gesc(item.link) + '"' : '';
            var posStyle = 'object-position:' + (item.x_pos || 50) + '% ' + (item.y_pos || 50) + '%';
            return '<figure data-category="' + gesc(item.category || 'all') + '"' + linkAttr + '>' +
              '<img src="' + gesc(item.url || '') + '" alt="' + gesc(item.alt || '') + '" loading="lazy" style="' + posStyle + '">' +
              '</figure>';
          }).join('');
        }

        render();

        document.querySelectorAll('.filter-pill[data-filter]').forEach(function (pill) {
          pill.addEventListener('click', function () {
            document.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            activeCat = pill.getAttribute('data-filter');
            render();
          });
        });
      })
      .catch(function () {});
  }());

  /* ---------- Generic content hydration ---------- */
  (function () {
    var contentEls = document.querySelectorAll('[data-content]');
    if (!contentEls.length) return;

    var sections = {};
    contentEls.forEach(function (el) {
      var attr = el.getAttribute('data-content');
      var dot = attr.indexOf('.');
      if (dot > 0) sections[attr.slice(0, dot)] = true;
    });

    function deepGet(obj, path) {
      return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
    }

    Object.keys(sections).forEach(function (section) {
      fetch('/api/content?section=' + section)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data) return;
          contentEls.forEach(function (el) {
            var attr = el.getAttribute('data-content');
            if (attr.indexOf(section + '.') !== 0) return;
            var key = attr.slice(section.length + 1);
            var val = deepGet(data, key);
            if (val !== undefined && val !== null && String(val).trim() !== '') {
              el.textContent = val;
            }
          });
          /* Also update hrefs for social/link elements */
          document.querySelectorAll('[data-href^="' + section + '."]').forEach(function (el) {
            var key = el.getAttribute('data-href').slice(section.length + 1);
            var val = deepGet(data, key);
            if (val && String(val).trim() !== '') el.href = val;
          });
        })
        .catch(function () {});
    });
  }());

  /* ---------- Homepage announcements feed ---------- */
  (function () {
    var list = document.getElementById('home-ann-list');
    if (!list) return;

    function fmtDate(d) {
      if (!d) return '';
      try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
      catch (e) { return d; }
    }

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    fetch('/api/content?section=announcements')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var items = ((data && data.items) || []).slice()
          .sort(function (a, b) { return (b.date || '') > (a.date || '') ? 1 : -1; })
          .slice(0, 3);

        if (!items.length) {
          list.innerHTML =
            '<p style="text-align:center;opacity:0.6;padding:var(--space-md) 0;">No announcements at this time — check back soon.</p>';
          return;
        }

        list.innerHTML = items.map(function (ann) {
          var excerpt = (ann.body || '').replace(/\n/g, ' ').trim();
          if (excerpt.length > 200) excerpt = excerpt.slice(0, 197) + '…';
          return '<div class="home-ann-card">' +
            '<div class="home-ann-date">' + esc(fmtDate(ann.date)) + '</div>' +
            '<h3 class="home-ann-title">' + esc(ann.title || '') + '</h3>' +
            (excerpt ? '<p class="home-ann-body">' + esc(excerpt) + '</p>' : '') +
            '</div>';
        }).join('');
      })
      .catch(function () {
        list.innerHTML =
          '<p style="text-align:center;opacity:0.5;padding:var(--space-md) 0;">Unable to load announcements right now.</p>';
      });
  }());

  /* ---------- Calendar ---------- */
  var calGrid = document.querySelector('.calendar-grid');
  if (calGrid) {
    var monthLabel = document.querySelector('.cal-month-label');
    var today = new Date(2026, 6, 10); // fixed reference date: July 10, 2026
    var viewDate = new Date(today.getFullYear(), today.getMonth(), 1);

    var placeholderEvents = {
      2: [{ label: 'Bible Study', cat: 'worship' }],
      5: [{ label: 'Sunday Worship', cat: 'worship' }],
      9: [{ label: 'Youth Night', cat: 'youth' }],
      10: [{ label: 'Prayer Meeting', cat: 'worship' }],
      12: [{ label: 'Sunday Worship', cat: 'worship' }],
      15: [{ label: 'Community Outreach', cat: 'community' }],
      17: [{ label: 'Bible Study', cat: 'worship' }],
      19: [{ label: 'Sunday Worship', cat: 'worship' }],
      23: [{ label: 'Men\'s Fellowship', cat: 'community' }],
      24: [{ label: 'Bible Study', cat: 'worship' }],
      26: [{ label: 'Sunday Worship', cat: 'worship' }],
      30: [{ label: 'Women\'s Fellowship', cat: 'community' }]
    };

    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    function renderCalendar() {
      calGrid.querySelectorAll('.day').forEach(function (d) { d.remove(); });
      if (monthLabel) monthLabel.textContent = monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear();

      var firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
      var daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

      for (var i = 0; i < firstDay; i++) {
        var empty = document.createElement('div');
        empty.className = 'day empty';
        calGrid.appendChild(empty);
      }
      for (var day = 1; day <= daysInMonth; day++) {
        var cell = document.createElement('div');
        cell.className = 'day';
        var isToday = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth() && day === today.getDate();
        if (isToday) cell.classList.add('today');
        var num = document.createElement('span');
        num.className = 'num';
        num.textContent = day;
        cell.appendChild(num);
        var events = (viewDate.getMonth() === today.getMonth()) ? placeholderEvents[day] : null;
        if (events) {
          events.forEach(function (evt) {
            var evtEl = document.createElement('span');
            evtEl.className = 'evt ' + evt.cat;
            evtEl.textContent = evt.label;
            cell.appendChild(evtEl);
          });
        }
        calGrid.appendChild(cell);
      }
    }

    var prevBtn = document.querySelector('.cal-prev');
    var nextBtn = document.querySelector('.cal-next');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCalendar();
    });

    renderCalendar();

    /* View toggle: month grid vs list */
    var viewButtons = document.querySelectorAll('.view-toggle button');
    var monthView = document.querySelector('.calendar-grid-wrap');
    var listView = document.querySelector('.list-view');
    viewButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var view = btn.getAttribute('data-view');
        if (view === 'list') {
          if (monthView) monthView.style.display = 'none';
          if (listView) listView.classList.add('show');
        } else {
          if (monthView) monthView.style.display = '';
          if (listView) listView.classList.remove('show');
        }
      });
    });
  }
})();
