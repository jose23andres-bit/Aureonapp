(function () {
  'use strict';

  var doc = document;
  doc.getElementById('year').textContent = new Date().getFullYear();

  // Cabecera: borde y fondo al hacer scroll
  var topbar = doc.getElementById('topbar');
  function onScroll() {
    topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Aparición suave de bloques
  var items = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Barra inferior: marca la sección visible
  var tabs = doc.querySelectorAll('.tabbar a[data-tab]');
  var map = {};
  tabs.forEach(function (a) { map[a.dataset.tab] = a; });
  var ids = ['inicio', 'explora', 'sobre', 'servicios', 'afiliacion', 'contacto'];
  var tabFor = { inicio: 'inicio', explora: 'explora', sobre: 'explora', servicios: 'servicios', afiliacion: 'servicios', contacto: 'contacto' };

  if ('IntersectionObserver' in window) {
    var current = null;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var key = tabFor[e.target.id];
        if (!key || key === current) return;
        current = key;
        tabs.forEach(function (a) { a.classList.toggle('is-active', a === map[key]); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) so.observe(el);
    });
  }
})();
