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
})();
