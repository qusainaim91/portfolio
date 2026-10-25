/* px-intro.js — typed intro text with the sarcastic cursor pause + wink.
   Markup:
   <h1 class="intro-title">I turn pixels into experiences</h1>
   <p class="intro-sub">Front-end developer ... craft, <span class="intro-sarcastic">occasionally sarcastic about everything else</span></p>
   Style fonts/colors with your own CSS. Cursor color: --intro-cursor (default #14B97D).
   Optional on the title: data-delay="4.7" (seconds before typing starts).
   If a .px-logo-blocks logo is on the page, it starts large in the center of the screen, then glides up to its
   place above the text (like the video). Turn off with data-logo-intro="off" on the title. */
(function () {
  var HEAD_DUR = 1.5, SUB_A_DUR = 2.45, SUB_B_DUR = 1.3, GAP = 0.3, PAUSE = 1.3, HOP_AT = 0.8, HOP_DUR = 0.35, BLINK = 0.45;
  var c01 = function (v) { return Math.max(0, Math.min(1, v)); };

  var css = '.pxi-rest{color:transparent}.pxi-cur{position:relative;display:inline}' +
    '.pxi-cur i{position:absolute;left:.06em;bottom:-.12em;width:.55em;height:.13em;background:var(--intro-cursor,#14B97D);transform-origin:0 100%}' +
    '.pxi-sub{transition:opacity .2s}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function part(parent, text) {
    var typed = document.createElement('span'), cur = document.createElement('span'), rest = document.createElement('span');
    cur.className = 'pxi-cur'; cur.setAttribute('aria-hidden', 'true');
    var bar = document.createElement('i'); cur.appendChild(bar);
    rest.className = 'pxi-rest';
    parent.appendChild(typed); parent.appendChild(cur); parent.appendChild(rest);
    return {
      set: function (n) { typed.textContent = text.slice(0, n); rest.textContent = text.slice(n); },
      cursor: function (on, hop) {
        bar.style.visibility = on ? 'visible' : 'hidden';
        var l = Math.sin(Math.PI * (hop || 0));
        bar.style.transform = 'translateY(' + (-0.35 * l) + 'em) rotate(' + (-18 * l) + 'deg)';
      },
      len: text.length
    };
  }

  function mount(title, sub) {
    var delay = parseFloat(title.dataset.delay || '4.7');
    var logo = title.dataset.logoIntro === 'off' ? null : document.querySelector('.px-logo-blocks');
    var lspeed = logo ? (parseFloat(logo.dataset.speed) || 1) : 1;
    if (!title.dataset.delay) delay = 3.7 / lspeed + 1.0;
    var RISE = delay - 1.0, RISE_DUR = 1.0, fx = null;
    function measure() {
      if (!logo) return;
      var prev = logo.style.transform; logo.style.transform = 'none';
      var r = logo.getBoundingClientRect(); logo.style.transform = prev;
      var vw = window.innerWidth, vh = window.innerHeight;
      var s = Math.min(vw * 0.75 / r.width, vh * 0.45 / r.height, 2.2); if (s < 1) s = 1;
      fx = { s: s, dx: vw / 2 - (r.left + r.width / 2), dy: vh / 2 - (r.top + r.height / 2) };
    }
    if (logo) { logo.style.transformOrigin = '50% 50%'; logo.style.willChange = 'transform'; }
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    function placeLogo(T) {
      if (!logo || !fx) return;
      var k = ease(c01((T - RISE) / RISE_DUR));
      if (k >= 1) { logo.style.transform = 'none'; return; }
      var s = fx.s + (1 - fx.s) * k;
      logo.style.transform = 'translate(' + fx.dx * (1 - k) + 'px,' + fx.dy * (1 - k) + 'px) scale(' + s + ')';
    }
    var headText = title.textContent.trim();
    var sarc = sub && sub.querySelector('.intro-sarcastic');
    var aText = '', bText = '';
    if (sub) {
      if (sarc) { bText = sarc.textContent; sarc.remove(); }
      aText = sub.textContent.replace(/\s+/g, ' ').replace(/^\s/, '');
    }
    title.setAttribute('aria-label', headText);
    title.textContent = '';
    var H = part(title, headText), A, B;
    if (sub) {
      sub.setAttribute('aria-label', (aText + bText).trim());
      sub.textContent = '';
      sub.classList.add('pxi-sub');
      A = part(sub, aText);
      if (bText) {
        var bWrap = document.createElement('span'); bWrap.className = 'intro-sarcastic'; sub.appendChild(bWrap);
        B = part(bWrap, bText);
      }
    }

    var tH = delay, tA = tH + HEAD_DUR + GAP, tP = tA + SUB_A_DUR + 0.15, tB = tP + PAUSE, END = tB + SUB_B_DUR + 3;
    var blink = function (T, from) { return Math.floor(Math.max(0, T - from) / BLINK) % 2 === 0; };

    function render(T) {
      placeLogo(T);
      var nH = Math.floor(c01((T - tH) / HEAD_DUR) * H.len);
      H.set(nH);
      var headTyping = T >= tH && nH < H.len;
      H.cursor(T >= tH - 0.3 && (!sub || T < tA) && (headTyping || blink(T, tH - 0.3)));
      if (!sub) return;
      sub.style.opacity = c01((T - (tA - 0.2)) / 0.2);
      var nA = Math.floor(c01((T - tA) / SUB_A_DUR) * A.len);
      A.set(nA);
      var onB = B && T >= tB, inPause = B && T >= tP && T < tB;
      var typingA = T >= tA && nA < A.len;
      var hop = inPause ? c01((T - (tP + HOP_AT)) / HOP_DUR) : 0;
      var on;
      if (typingA) on = true;
      else if (inPause) on = T < tP + HOP_AT ? blink(T, tP) : true;
      else on = blink(T, tA);
      A.cursor(T >= tA && !onB && on, hop);
      if (B) {
        var nB = Math.floor(c01((T - tB) / SUB_B_DUR) * B.len);
        B.set(nB);
        B.cursor(onB && (nB < B.len || blink(T, tB + SUB_B_DUR)));
      }
    }

    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      render(END); H.cursor(false); A && A.cursor(false); B && B.cursor(false); return;
    }
    measure();
    window.addEventListener('resize', function () { measure(); });
    render(0);
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      render((now - start) / 1000);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function init() {
    var title = document.querySelector('.intro-title');
    if (title) mount(title, document.querySelector('.intro-sub'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
