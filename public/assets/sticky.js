// Sticky section pills highlighting based on scroll
(function() {
  function initStickyPills() {
    try {
      var pills = Array.from(document.querySelectorAll('.section-nav .pill'));
      var targets = pills.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
      if ('IntersectionObserver' in window && targets.length) {
        var observer = new IntersectionObserver(function(entries){
          var visible = entries.filter(function(e){ return e.isIntersecting; }).sort(function(a,b){ return b.intersectionRatio - a.intersectionRatio; });
          if (visible[0]) {
            var id = '#' + visible[0].target.id;
            pills.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === id); });
          }
        }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
        targets.forEach(function(t){ observer.observe(t); });
      }
    } catch (e) { /* no-op */ }
  }
  window.addEventListener('load', initStickyPills);
})();

