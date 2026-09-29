// MAGIC Lab — 交互脚本
// 全站仅三处动效：① 首屏多层无限视差 ② 跑马灯(纯CSS) ③ 一次性入场
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // —— 移动端菜单 ——
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('open');
    });
  }

  // —— 入场动画（IntersectionObserver，一次性） ——
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // —— 首屏多层无限视差 ——
  // 每层带 data-speed（滚动速度系数）与 data-tile（背景瓦片高度）。
  // 位移对瓦片高度取模，背景 repeat 无限循环，永远滚不出边界。
  var layers = Array.prototype.map.call(document.querySelectorAll('.hero-layer'), function (el) {
    return {
      el: el,
      speed: parseFloat(el.getAttribute('data-speed')) || 0.2,
      tile: parseFloat(el.getAttribute('data-tile')) || 520
    };
  });
  if (!reduceMotion && layers.length && window.matchMedia('(min-width: 721px)').matches) {
    var target = window.scrollY || 0;
    var current = target;
    var ticking = false;

    var apply = function () {
      for (var i = 0; i < layers.length; i++) {
        var l = layers[i];
        var offset = -((current * l.speed) % l.tile);
        l.el.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      }
    };
    var tick = function () {
      current += (target - current) * 0.12;               // 缓动追赶，层有“重量感”
      if (Math.abs(target - current) < 0.05) current = target;
      apply();
      ticking = false;
      if (current !== target) requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', function () {
      target = window.scrollY;
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }, { passive: true });
    apply();
  }

  // —— 新闻分页 + 详情弹层 ——
  var newsSection = document.getElementById('news');
  var newsList = newsSection ? newsSection.querySelector('.row-list') : null;
  var pager = document.getElementById('newsPager');
  var modal = document.getElementById('newsModal');
  if (newsList && pager && modal) {
    var rows = Array.prototype.slice.call(newsList.children);
    var PER_PAGE = 6;
    var pageCount = Math.ceil(rows.length / PER_PAGE);

    var renderPage = function (p) {
      rows.forEach(function (li, i) {
        li.style.display = (i >= p * PER_PAGE && i < (p + 1) * PER_PAGE) ? '' : 'none';
      });
      pager.innerHTML = '';
      var mkBtn = function (label, target, state) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        if (state === 'on') { b.className = 'on'; b.disabled = true; }
        else if (state === 'off') { b.disabled = true; }
        else { b.addEventListener('click', function () { renderPage(target); }); }
        pager.appendChild(b);
      };
      mkBtn('‹ 上一页', p - 1, p === 0 ? 'off' : 'go');
      for (var i = 0; i < pageCount; i++) mkBtn(String(i + 1), i, i === p ? 'on' : 'go');
      mkBtn('下一页 ›', p + 1, p === pageCount - 1 ? 'off' : 'go');

      if (newsList.getBoundingClientRect().top < 0) {
        newsSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    };
    renderPage(0);

    // 详情弹层
    var lastFocus = null;
    var openModal = function (li) {
      lastFocus = document.activeElement;
      var t = li.querySelector('time');
      var s = li.querySelector('strong');
      var src = li.querySelector('span');
      document.getElementById('nmTime').textContent = t ? t.textContent : '';
      document.getElementById('nmTitle').textContent = s ? s.textContent : '';
      var body = document.getElementById('nmBody');
      body.innerHTML = '';
      var paras = (li.getAttribute('data-detail') || '').split('\n');
      for (var k = 0; k < paras.length; k++) {
        if (paras[k].trim()) {
          var pEl = document.createElement('p');
          pEl.textContent = paras[k].trim();
          body.appendChild(pEl);
        }
      }
      document.getElementById('nmSrc').textContent = src ? src.textContent : '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.getElementById('nmClose').focus();
    };
    var closeModal = function () {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    rows.forEach(function (li) {
      li.addEventListener('click', function () { openModal(li); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(li); }
      });
    });
    document.getElementById('nmClose').addEventListener('click', closeModal);
    modal.querySelector('.news-modal-mask').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
})();
