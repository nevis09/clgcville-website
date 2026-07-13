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

  /* ---------- Gallery filter tabs ---------- */
  var filterPills = document.querySelectorAll('.filter-pill[data-filter]');
  var galleryItems = document.querySelectorAll('[data-category]');
  if (filterPills.length && galleryItems.length) {
    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        filterPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var filter = pill.getAttribute('data-filter');
        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

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

  /* ---------- Lightbox ---------- */
  var galleryFigures = Array.prototype.slice.call(document.querySelectorAll('.gallery-grid figure img'));
  var lightbox = document.querySelector('.lightbox');
  if (galleryFigures.length && lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var currentIndex = 0;

    function showImage(index) {
      if (index < 0) index = galleryFigures.length - 1;
      if (index >= galleryFigures.length) index = 0;
      currentIndex = index;
      var img = galleryFigures[currentIndex];
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      if (lbCaption) lbCaption.textContent = img.alt;
    }

    galleryFigures.forEach(function (img, index) {
      img.addEventListener('click', function () {
        showImage(index);
        lightbox.classList.add('open');
        document.body.classList.add('nav-open');
      });
    });

    var closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    var prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    var nextBtn = lightbox.querySelector('.lightbox-nav.next');
    if (prevBtn) prevBtn.addEventListener('click', function () { showImage(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showImage(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('nav-open');
    }

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    });
  }

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
          if (excerpt.length > 160) excerpt = excerpt.slice(0, 157) + '…';
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

  /* ---------- Announcement banner ---------- */
  (function () {
    if (window.location.pathname.indexOf('/announcements') !== -1) return;
    fetch('/api/content?section=announcements')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.items || !data.items.length) return;
        var sorted = data.items.slice().sort(function (a, b) {
          return (b.date || '') > (a.date || '') ? 1 : -1;
        });
        var ann = sorted[0];
        if (!ann || !ann.title) return;
        var key = 'ann-dismissed-' + ann.title.slice(0, 60);
        if (localStorage.getItem(key)) return;

        var banner = document.createElement('div');
        banner.className = 'announcement-banner';
        banner.innerHTML =
          '<div class="container">' +
            '<i class="fa-solid fa-bullhorn"></i>' +
            '<span class="ann-text">' + ann.title.replace(/[<>&"]/g, function(c){return{'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}) + '</span>' +
            '<a href="/announcements/index.html" class="ann-link">Read More</a>' +
            '<button class="ann-close" aria-label="Dismiss announcement"><i class="fa-solid fa-xmark"></i></button>' +
          '</div>';

        var main = document.querySelector('main');
        if (main) main.insertBefore(banner, main.firstChild);

        banner.querySelector('.ann-close').addEventListener('click', function () {
          localStorage.setItem(key, '1');
          banner.remove();
        });
      })
      .catch(function () {});
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
