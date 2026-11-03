/* px-logo-wireframe.js — outlines draw with anchor points, then a scan line fills the logo (right to left).
   Usage: <div class="px-logo-wireframe"></div> + this script.
   Options: data-ink, data-accent, data-speed (1 = normal), data-loop="false" to play once. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', U = 44.5806;
  var C = { draw: 0, fill: 1.6, polish: 2.8, hold: 3.8, out: 5.4 }, TOTAL = 6.4, END = 5.4;
  var c01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var oC = function (t) { return 1 - Math.pow(1 - t, 3); };
  var iC = function (t) { return t * t * t; };
  var oB = function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  var r = function (x, y, w, h) { return 'M' + x + ' ' + y + 'H' + (x + w) + 'V' + (y + h) + 'H' + x + 'Z'; };
  var SHAPES = [
    { px: 1, d: r(579.548, 14.8604, U, U), pts: [] },
    { px: 1, d: r(520.108, 0, U, U), pts: [] },
    { d: 'M638.99 208.043H505.247V74.3013H638.99V208.043ZM549.828 163.462H594.409V118.882H549.828V163.462Z',
      pts: [[505.247, 74.3013], [638.99, 74.3013], [638.99, 208.043], [505.247, 208.043], [549.828, 118.882], [594.409, 118.882], [594.409, 163.462], [549.828, 163.462]] },
    { d: 'M475.527 208.043H252.624V74.3013H475.527V208.043ZM430.946 163.462V118.882H297.205V163.462H430.946Z',
      pts: [[252.624, 74.3013], [475.527, 74.3013], [475.527, 208.043], [252.624, 208.043], [297.205, 118.882], [430.946, 118.882], [430.946, 163.462], [297.205, 163.462]] },
    { d: r(0, 163.462, 222.903, U), pts: [[0, 163.462], [222.903, 163.462], [222.903, 208.043], [0, 208.043]] },
    { px: 1, d: r(59.4409, 222.903, U, U), pts: [] },
    { px: 1, d: r(0, 222.903, U, U), pts: [] }
  ];
  var uid = 0;
  function el(tag, a, p) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; }

  function mount(host) {
    var ink = host.dataset.ink || '#f2f2f2', accent = host.dataset.accent || '#14B97D';
    var bg = host.dataset.bg || 'transparent';
    var speed = parseFloat(host.dataset.speed) || 1, loop = host.dataset.loop !== 'false';
    var id = 'pxw-clip-' + (uid++);
    var svg = el('svg', { viewBox: '-12 -12 663 292', width: '100%', role: 'img', 'aria-label': host.getAttribute('aria-label') || 'Logo' });
    svg.style.display = 'block'; svg.style.overflow = 'visible';
    var clip = el('rect', { y: -20, height: 310 }, el('clipPath', { id: id }, el('defs', {}, svg)));
    var items = SHAPES.map(function (s) {
      var col = s.px ? accent : ink;
      return {
        s: s,
        line: el('path', { d: s.d, fill: 'none', stroke: col, 'stroke-width': 1.5, pathLength: 1, opacity: 0.9 }, svg),
        anchors: s.pts.map(function () { return el('rect', { fill: bg === 'transparent' ? '#0a0a0a' : bg, stroke: accent, 'stroke-width': 1.5 }, svg); }),
        fill: el('path', { d: s.d, fill: col, 'clip-path': 'url(#' + id + ')' }, svg)
      };
    });
    var scan = el('rect', { y: -20, width: 2, height: 310, fill: accent }, svg);
    host.innerHTML = ''; host.appendChild(svg);

    function render(T) {
      items.forEach(function (it, i) {
        var dIn = C.draw + i * 0.12, dOut = C.out + 0.35 + (6 - i) * 0.05;
        var draw = T < dOut ? oC(c01((T - dIn) / 0.7)) : 1 - iC(c01((T - dOut) / 0.4));
        var lineO = Math.min(1, 1 - c01((T - (C.polish + 0.1)) / 0.4) + c01((T - C.out) / 0.2));
        it.line.setAttribute('stroke-dasharray', draw + ' 1');
        it.line.setAttribute('opacity', draw > 0.001 ? lineO * 0.9 : 0);
        var aOut = 1 - c01((T - C.polish) / 0.35);
        it.anchors.forEach(function (a, k) {
          var v = Math.max(0, oB(c01((T - (dIn + 0.25 + k * 0.04)) / 0.3)) * aOut), z = 9 * v, p = it.s.pts[k];
          a.setAttribute('x', p[0] - z / 2); a.setAttribute('y', p[1] - z / 2);
          a.setAttribute('width', z); a.setAttribute('height', z);
          a.setAttribute('visibility', v > 0.01 ? 'visible' : 'hidden');
        });
      });
      var fIn = oC(c01((T - C.fill) / 1.0)), fOut = iC(c01((T - C.out) / 0.5));
      var x0 = 659 - 680 * fIn, x1 = 659 - 680 * fOut;
      clip.setAttribute('x', x0); clip.setAttribute('width', Math.max(0, x1 - x0));
      var before = T < C.out, sx = before ? x0 : x1, act = before ? (fIn > 0 && fIn < 1) : (fOut > 0 && fOut < 1);
      scan.setAttribute('x', sx - 1); scan.setAttribute('visibility', act ? 'visible' : 'hidden');
    }

    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { render(C.hold + 0.5); return; }
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var T = (now - start) / 1000 * speed;
      if (loop) { render(T % TOTAL); requestAnimationFrame(frame); }
      else { render(Math.min(T, END - 0.01)); if (T < END) requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll('.px-logo-wireframe').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
