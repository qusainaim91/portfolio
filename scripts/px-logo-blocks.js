/* px-logo-blocks.js — building-block logo, plays once. Usage: <div class="px-logo-blocks"></div> + this script. Options: data-ink, data-accent, data-speed (1 = normal, 2 = twice as fast, 0.5 = half speed), data-loop="true" to loop (default plays once) */
(function () {
  var NS = 'http://www.w3.org/2000/svg', U = 44.5806, END = 3.8, TOTAL = 6.4;
  var C = { slots: 0, stack: 0.9, hold: 3.7 };
  var FALL = 0.42, SETTLE = 0.45, H = 260;
  var c01 = function (v) { return Math.max(0, Math.min(1, v)); };
  var PIECES = [
    { px: 1, x: 0, y: 222.903, w: U, h: U, drop: 1.95, lift: 0.45 },
    { px: 1, x: 59.4409, y: 222.903, w: U, h: U, drop: 1.8, lift: 0.5 },
    { x: 0, y: 163.462, w: 222.903, h: U, drop: 1.3, lift: 0.35 },
    { x: 252.624, y: 74.3013, w: 222.903, h: 133.742, drop: 0.9, lift: 0.25, d: 'M475.527 208.043H252.624V74.3013H475.527V208.043ZM430.946 163.462V118.882H297.205V163.462H430.946Z' },
    { x: 505.247, y: 74.3013, w: 133.743, h: 133.742, drop: 0.45, lift: 0.15, d: 'M638.99 208.043H505.247V74.3013H638.99V208.043ZM549.828 163.462H594.409V118.882H549.828V163.462Z' },
    { px: 1, x: 520.108, y: 0, w: U, h: U, drop: 0.12, lift: 0.06 },
    { px: 1, x: 579.548, y: 14.8604, w: U, h: U, drop: 0, lift: 0 }
  ];

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function shape(p, attrs, parent) {
    if (p.d) { attrs.d = p.d; return el('path', attrs, parent); }
    attrs.x = p.x; attrs.y = p.y; attrs.width = p.w; attrs.height = p.h;
    return el('rect', attrs, parent);
  }

  function mount(host) {
    var ink = host.dataset.ink || '#FEFEFE', accent = host.dataset.accent || '#14B97D';
    var speed = parseFloat(host.dataset.speed) || 1, loop = host.dataset.loop === 'true';
    var LIFT = loop ? 5.3 : Infinity;
    var svg = el('svg', { viewBox: '-12 -12 663 292', width: '100%', role: 'img', 'aria-label': host.getAttribute('aria-label') || 'Logo' });
    svg.style.display = 'block'; svg.style.overflow = 'visible';
    var items = PIECES.map(function (p) {
      var col = p.px ? accent : ink;
      return {
        p: p, cx: p.x + p.w / 2, by: p.y + p.h,
        slot: shape(p, { fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, svg),
        body: shape(p, { fill: col }, svg),
        flash: el('rect', { fill: 'none', stroke: accent, 'stroke-width': 2 }, svg)
      };
    });
    host.innerHTML = ''; host.appendChild(svg);

    function render(T) {
      items.forEach(function (it) {
        var p = it.p, t0 = C.stack + p.drop, t1 = LIFT + p.lift, land = t0 + FALL;
        var shown = T >= t0, landed = false, dy = 0, sx = 1, sy = 1, op = 1, fl = 0;
        if (T >= t1) { var q = c01((T - t1) / 0.4); dy = -H * q * q * q; op = 1 - q; shown = q < 1; }
        else if (T >= t0 && T < land) { var f = (T - t0) / FALL; dy = -H * (1 - f * f); sx = 0.94; sy = 1.08; op = c01(f * 2); }
        else if (T >= land) {
          var k = c01((T - land) / SETTLE); sy = 1 - 0.2 * Math.exp(-5 * k) * Math.cos(12 * k); sx = 1 + (1 - sy) * 0.5;
          landed = true; fl = 1 - c01((T - land) / 0.35);
        }
        var slotO = landed ? 0 : c01((T - p.drop * 0.3) / 0.4) * (1 - c01((T - (LIFT + 0.6)) / 0.4)) * 0.45;
        it.slot.setAttribute('opacity', slotO);
        it.body.setAttribute('visibility', shown ? 'visible' : 'hidden');
        it.body.setAttribute('opacity', op);
        it.body.setAttribute('transform', 'translate(0 ' + dy + ') translate(' + it.cx + ' ' + it.by + ') scale(' + sx + ' ' + sy + ') translate(' + -it.cx + ' ' + -it.by + ')');
        var g = 6 * (1 - fl) + 3;
        it.flash.setAttribute('opacity', fl);
        it.flash.setAttribute('x', p.x - g); it.flash.setAttribute('y', p.y - g);
        it.flash.setAttribute('width', p.w + 2 * g); it.flash.setAttribute('height', p.h + 2 * g);
      });
    }

    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { render(C.hold + 0.5); return; }
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var T = (now - start) / 1000 * speed;
      if (loop) { render(T % TOTAL); requestAnimationFrame(frame); }
      else { render(Math.min(T, END)); if (T < END) requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  function init() { document.querySelectorAll('.px-logo-blocks').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
