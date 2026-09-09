// MAGIC Lab 主页交互：导航状态、移动端菜单、滚动入场动画
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');

  // 滚动后给导航加边框
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 移动端菜单
  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') menu.classList.remove('open');
  });

  // 滚动入场动画
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
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
})();
