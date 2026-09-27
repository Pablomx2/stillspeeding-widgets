/* Still Speeding — clients logo banner widget
   Usage on the site:
     <div class="ss-logos"></div>
     <script src="https://<user>.github.io/stillspeeding-widgets/embed/logos.js"></script>
   Optional per-block overrides: data-theme="dark", data-style="mono", data-heading="Clients",
   data-animation="glide | step | fade | still"
   Content comes from data/logos.json (edited with the admin app). */
(function () {
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/embed\/[^\/?#]*([?#].*)?$/, "") : "";
  var W = (window.SSWidgets = window.SSWidgets || {});

  var CSS = [
    ".ssl-root{--ssl-ink:#000;--ssl-height:40px;--ssl-max-width:140px;--ssl-gap:80px;--ssl-gray:100%;--ssl-opacity:.55;--ssl-fade:14%;width:100%;color:var(--ssl-ink);-webkit-tap-highlight-color:transparent}",
    ".ssl-root.ssl-dark{--ssl-ink:#fafafa}",
    ".ssl-root *,.ssl-root *::before,.ssl-root *::after{box-sizing:border-box}",
    ".ssl-heading{display:flex;align-items:center;gap:18px;margin:0 0 30px;font-family:'Dangrek','Arial Narrow',sans-serif;font-size:15px;line-height:1;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}",
    ".ssl-heading::before,.ssl-heading::after{content:'';flex:1;height:1px;background:currentColor;opacity:.18}",
    ".ssl-heading span{transform:translateY(1px)}",
    ".ssl-viewport{overflow:hidden;padding:8px 0;-webkit-mask-image:linear-gradient(to right,transparent,#000 var(--ssl-fade),#000 calc(100% - var(--ssl-fade)),transparent);mask-image:linear-gradient(to right,transparent,#000 var(--ssl-fade),#000 calc(100% - var(--ssl-fade)),transparent)}",
    ".ssl-root.ssl-no-fade .ssl-viewport{-webkit-mask-image:none;mask-image:none}",
    ".ssl-track{display:flex;align-items:center;width:max-content;will-change:transform}",
    ".ssl-set{display:flex;align-items:center;flex-shrink:0}",
    ".ssl-root .ssl-item{display:flex;align-items:center;justify-content:center;align-self:center;line-height:0;padding:0 calc(var(--ssl-gap) / 2);flex-shrink:0;text-decoration:none!important;border:0}",
    ".ssl-root .ssl-item img{display:block;height:var(--ssl-h,var(--ssl-height));width:auto;max-width:var(--ssl-max-width);margin:0;object-fit:contain;filter:grayscale(var(--ssl-gray)) contrast(1.05);opacity:var(--ssl-opacity);transition:filter .5s ease,opacity .5s ease;-webkit-user-drag:none;user-select:none}",
    ".ssl-root.ssl-mono .ssl-item img{filter:grayscale(1) brightness(0)}",
    ".ssl-root.ssl-mono.ssl-dark .ssl-item img{filter:grayscale(1) brightness(0) invert(1)}",
    "@media (hover:hover){.ssl-root.ssl-hover .ssl-item:hover img{filter:none;opacity:1}}",
    ".ssl-root .ssl-item:focus-visible{outline:2px solid var(--ssl-ink);outline-offset:8px;border-radius:6px}",
    ".ssl-root .ssl-item:focus-visible img{filter:none;opacity:1}",
    ".ssl-root.ssl-static .ssl-track{width:100%}",
    ".ssl-root.ssl-static .ssl-set{flex-wrap:wrap;justify-content:center;row-gap:32px;width:100%;flex-shrink:1}",
    ".ssl-root.ssl-static .ssl-viewport{-webkit-mask-image:none;mask-image:none}",
    ".ssl-root.ssl-fading .ssl-viewport{-webkit-mask-image:none;mask-image:none}",
    ".ssl-fade-row{display:grid;align-items:center;justify-items:center;min-height:calc(var(--ssl-height) + 4px)}",
    ".ssl-slot{display:flex;align-items:center;justify-content:center;min-width:0;transition:opacity .55s ease,transform .7s cubic-bezier(.2,.7,.2,1),filter .55s ease}",
    ".ssl-slot.is-out{opacity:0;transform:translateY(6px);filter:blur(3px)}",
    ".ssl-root .ssl-slot .ssl-item{padding:0 8px}",
    ".ssl-empty{padding:30px 0;text-align:center;opacity:.5;font-size:14px}",
    "@media (max-width:640px){.ssl-root{--ssl-gap:48px!important;--ssl-fade:10%}.ssl-root .ssl-item img{height:calc(var(--ssl-h,var(--ssl-height)) * .78);max-width:calc(var(--ssl-max-width) * .8)}.ssl-heading{font-size:13px;gap:12px;margin-bottom:22px}}"
  ].join("\n");

  function ensureAssets() {
    if (!document.getElementById("ssw-fonts")) {
      var l = document.createElement("link");
      l.id = "ssw-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Dangrek&family=Space+Grotesk:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("ssl-css")) {
      var s = document.createElement("style");
      s.id = "ssl-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }

  // logo paths in logos.json are relative to the repo ("logos/netflix.svg")
  function resolve(src, base) {
    if (!src) return "";
    if (/^(https?:|data:|blob:|\/\/)/i.test(src)) return src;
    return (base || BASE) + src.replace(/^\.?\//, "");
  }

  /* opts.base: where relative logo paths live; opts.srcFor(logo): preview override */
  W.renderLogos = function (root, data, opts) {
    opts = opts || {};
    ensureAssets();
    if (root._ssCleanup) root._ssCleanup();
    var cleanups = [];
    root._ssCleanup = function () { cleanups.forEach(function (f) { f(); }); };

    var S = Object.assign({
      heading: "Clients", theme: "light", style: "grey", greyscale: 100, opacity: 0.55,
      colorOnHover: true, speed: 32, direction: "left", logoHeight: 40, logoMaxWidth: 140,
      gap: 80, pauseOnHover: true, fadeEdges: true, animation: "glide", interval: 3, autoSize: true
    }, (data && data.settings) || {});
    if (root.dataset.theme) S.theme = root.dataset.theme;
    if (root.dataset.style) S.style = root.dataset.style;
    if (root.dataset.heading !== undefined) S.heading = root.dataset.heading;
    var logos = ((data && data.logos) || []).filter(function (l) { return l && (l.src || l.preview); });

    root.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "ssl-root";
    var st = wrap.style;
    st.setProperty("--ssl-height", S.logoHeight + "px");
    st.setProperty("--ssl-max-width", S.logoMaxWidth + "px");
    st.setProperty("--ssl-gap", S.gap + "px");
    st.setProperty("--ssl-gray", S.greyscale + "%");
    st.setProperty("--ssl-opacity", S.opacity);
    wrap.classList.toggle("ssl-dark", S.theme === "dark");
    wrap.classList.toggle("ssl-mono", S.style === "mono");
    wrap.classList.toggle("ssl-hover", !!S.colorOnHover);
    wrap.classList.toggle("ssl-no-fade", !S.fadeEdges);
    root.appendChild(wrap);

    if (S.heading) {
      var h = document.createElement("div");
      h.className = "ssl-heading";
      var hs = document.createElement("span");
      hs.textContent = S.heading;
      h.appendChild(hs);
      wrap.appendChild(h);
    }
    if (!logos.length) {
      var em = document.createElement("div");
      em.className = "ssl-empty";
      em.textContent = "No logos yet.";
      wrap.appendChild(em);
      return;
    }

    var viewport = document.createElement("div");
    viewport.className = "ssl-viewport";
    var track = document.createElement("div");
    track.className = "ssl-track";
    viewport.appendChild(track);
    wrap.appendChild(viewport);

    var original = document.createElement("div");
    original.className = "ssl-set";
    logos.forEach(function (logo) {
      var item = document.createElement(logo.link ? "a" : "div");
      item.className = "ssl-item";
      if (logo.link) {
        item.href = logo.link;
        item.target = "_blank";
        item.rel = "noopener";
        item.setAttribute("aria-label", logo.name || "Client");
      }
      var img = document.createElement("img");
      var src = logo.preview || resolve(logo.src, opts.base);
      // ask for permission to read the pixels (needed for trimming); if the host refuses, load it plainly
      if (!/^data:/.test(src)) {
        img.crossOrigin = "anonymous";
        img.setAttribute("data-cors", "1");
        img.addEventListener("error", function retry() {
          img.removeEventListener("error", retry);
          img.removeAttribute("crossorigin");
          img.setAttribute("data-no-trim", "1");
          img.src = src + (src.indexOf("?") > -1 ? "&" : "?") + "plain";
        });
      }
      img.src = src;
      img.alt = logo.name || "";
      img.decoding = "async";
      img.draggable = false;
      if (logo.ink) img.setAttribute("data-ink", logo.ink);
      item.appendChild(img);
      original.appendChild(item);
    });
    track.appendChild(original);

    /* Auto-size: logos come in every shape, so one fixed height makes square icons look
       huge and long wordmarks look tiny. Each logo's height is adjusted by its shape (and,
       when known, how bold it is) so they all carry the same visual weight. */
    function balance() {
      if (!S.autoSize) return;
      Array.prototype.forEach.call(original.querySelectorAll("img"), function (img) {
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) return;
        var k = Math.pow(2.5 / (w / h), 0.4);                   // wider → a bit shorter, squarer → a bit taller
        var ink = +img.getAttribute("data-ink");
        if (ink > 0) k *= Math.min(1.2, Math.max(0.85, Math.pow(0.35 / ink, 0.2))); // heavy solid marks → a touch smaller
        k = Math.min(1.5, Math.max(0.55, k));
        img.style.setProperty("--ssl-h", (S.logoHeight * k).toFixed(1) + "px");
      });
    }
    /* Trim: many logo files have empty space baked in around the artwork, which makes them
       look off-centre and unevenly spaced. Crop every logo to its visible pixels so the
       spacing between logos is truly even and they all centre on the same line. */
    function loaded(img) {
      return img.complete && img.naturalWidth ? Promise.resolve() : new Promise(function (res) {
        function done() { img.removeEventListener("load", done); img.removeEventListener("error", fail); res(); }
        var errors = 0;
        // a CORS-refused image gets one plain retry (see makeSet) — wait for that before giving up
        function fail() { if (++errors >= 2 || !img.hasAttribute("data-cors")) done(); }
        img.addEventListener("load", done);
        img.addEventListener("error", fail);
      });
    }
    function tidy(img) {
      if (img.hasAttribute("data-no-trim") || img.hasAttribute("data-trimmed")) return Promise.resolve();
      var w = img.naturalWidth || 300, h = img.naturalHeight || 150;
      var k = Math.min(1, 1200 / w, 480 / h);
      if (/\.svg|image\/svg/i.test(img.src)) k = Math.min(1200 / w, 480 / h); // vectors: render crisply
      var cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      try {
        var c = document.createElement("canvas");
        c.width = cw; c.height = ch;
        var ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);
        var d = ctx.getImageData(0, 0, cw, ch).data;
        var x0 = cw, y0 = ch, x1 = -1, y1 = -1;
        for (var y = 0; y < ch; y++) for (var x = 0; x < cw; x++) {
          if (d[(y * cw + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        img.setAttribute("data-trimmed", "1");
        if (x1 < 0) return Promise.resolve();
        var tw = x1 - x0 + 1, th = y1 - y0 + 1;
        if (tw * th > cw * ch * 0.97) return Promise.resolve(); // already tight
        var out = document.createElement("canvas");
        out.width = tw; out.height = th;
        out.getContext("2d").drawImage(c, x0, y0, tw, th, 0, 0, tw, th);
        img.removeAttribute("crossorigin");
        img.src = out.toDataURL("image/png");
        return loaded(img);
      } catch (e) {
        return Promise.resolve(); // pixels not readable — show as is
      }
    }
    var imagesSettled = Promise.all(Array.prototype.map.call(original.querySelectorAll("img"), function (img) {
      return loaded(img).then(function () { return tidy(img); });
    })).then(balance);

    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mode = root.dataset.animation || S.animation || "glide";
    if (["glide", "step", "fade", "still"].indexOf(mode) < 0) mode = "glide";
    if (reduced || !track.animate) mode = "still";
    if (mode === "still") { wrap.classList.add("ssl-static"); return; }

    var dead = false, onScreen = true, hovered = false;
    var right = S.direction === "right";
    var interval = Math.max(1, +S.interval || 3) * 1000;
    cleanups.push(function () { dead = true; });

    /* ---------- shared helpers ---------- */
    function whenImagesReady(cb) { imagesSettled.then(function () { if (!dead) cb(); }); }
    function watchResize(cb) {
      var t;
      function later() { clearTimeout(t); t = setTimeout(function () { if (!dead) cb(); }, 120); }
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(later);
        ro.observe(viewport);
        cleanups.push(function () { ro.disconnect(); });
      } else {
        window.addEventListener("resize", later);
        cleanups.push(function () { window.removeEventListener("resize", later); });
      }
      cleanups.push(function () { clearTimeout(t); });
    }
    function watchScreen(cb) {
      if (!window.IntersectionObserver) return;
      var io = new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; if (cb) cb(); });
      io.observe(viewport);
      cleanups.push(function () { io.disconnect(); });
    }
    function watchHover(onIn, onOut) {
      if (!S.pauseOnHover) return;
      viewport.addEventListener("mouseenter", function () { hovered = true; if (onIn) onIn(); });
      viewport.addEventListener("mouseleave", function () { hovered = false; if (onOut) onOut(); });
      viewport.addEventListener("focusin", function () { hovered = true; if (onIn) onIn(); });
      viewport.addEventListener("focusout", function () { hovered = false; if (onOut) onOut(); });
    }
    // repeat the logo set enough times to fill the strip; returns the width of one set
    function fillClones() {
      while (track.children.length > 1) track.removeChild(track.lastChild);
      var setWidth = original.getBoundingClientRect().width, viewWidth = viewport.clientWidth;
      if (!setWidth || !viewWidth) return 0;
      var copies = Math.ceil(viewWidth / setWidth) + 1;
      for (var i = 0; i < copies; i++) {
        var clone = original.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(clone.querySelectorAll("a"), function (a) { a.tabIndex = -1; });
        track.appendChild(clone);
      }
      return setWidth;
    }

    if (mode === "step") startStep();
    else if (mode === "fade") startFade();
    else startGlide();

    /* ---------- GLIDE: continuous drift; hover glides to a soft stop ---------- */
    function startGlide() {
      var anim = null, lastWidth = 0, lastSet = 0, rate = 1, rafId = 0, driving = false;
      var STOP_MS = 1700, GO_MS = 1800, BOUNCE = 2.2; // BOUNCE: 0 = none, ~2 = very subtle

      function layout() {
        var viewWidth = viewport.clientWidth, setNow = original.getBoundingClientRect().width;
        if (!setNow || !viewWidth) return;
        if (viewWidth === lastWidth && Math.abs(setNow - lastSet) < 1) return;
        var setWidth = fillClones();
        lastWidth = viewWidth;
        lastSet = setWidth;
        var progress = anim ? (anim.currentTime || 0) / anim.effect.getTiming().duration : 0;
        if (anim) anim.cancel();
        var duration = (setWidth / Math.max(1, S.speed)) * 1000;
        anim = track.animate(
          [{ transform: "translate3d(" + (right ? -setWidth : 0) + "px,0,0)" },
           { transform: "translate3d(" + (right ? 0 : -setWidth) + "px,0,0)" }],
          { duration: duration, iterations: Infinity, easing: "linear" }
        );
        anim.currentTime = (progress % 1) * duration;
        if (driving) { cancelGlide(); rate = 0; }
        anim.playbackRate = rate;
        if (!onScreen) anim.pause();
      }

      function backOut(p) { var x = p - 1; return 1 + (BOUNCE + 1) * x * x * x + BOUNCE * x * x; }
      function easeInOut(p) { return -(Math.cos(Math.PI * p) - 1) / 2; }
      function cancelGlide() { cancelAnimationFrame(rafId); driving = false; }
      cleanups.push(function () { cancelGlide(); if (anim) anim.cancel(); });

      function glideToStop() {
        cancelGlide();
        if (!anim) { rate = 0; return; }
        var v0 = rate, t0 = anim.currentTime || 0;
        // distance chosen so the glide starts at exactly the current speed (no jolt)
        var dist = STOP_MS * v0 / (3 + BOUNCE);
        if (dist < 1) { rate = 0; anim.playbackRate = 0; return; }
        anim.pause();
        driving = true;
        var start = performance.now(), last = start, lastPos = t0;
        (function step(now) {
          if (dead) return;
          var p = Math.min(1, (now - start) / STOP_MS);
          var pos = t0 + dist * backOut(p);
          anim.currentTime = pos;
          if (now > last) rate = Math.max(0, (pos - lastPos) / (now - last));
          last = now; lastPos = pos;
          if (p < 1) { rafId = requestAnimationFrame(step); return; }
          driving = false;
          rate = 0;
          anim.playbackRate = 0;
          if (onScreen) anim.play();
        })(start);
      }
      function glideToSpeed() {
        cancelGlide();
        if (!anim) { rate = 1; return; }
        var from = rate, start = performance.now();
        anim.playbackRate = from;
        if (onScreen) anim.play();
        (function step(now) {
          if (dead) return;
          var p = Math.min(1, (now - start) / GO_MS);
          rate = from + (1 - from) * easeInOut(p);
          anim.playbackRate = rate;
          if (p < 1) rafId = requestAnimationFrame(step);
        })(start);
      }

      whenImagesReady(layout);
      watchResize(layout);
      watchHover(glideToStop, glideToSpeed);
      watchScreen(function () { if (anim && !driving) onScreen ? anim.play() : anim.pause(); });
    }

    /* ---------- STEP: moves one logo along, rests, repeats ---------- */
    function startStep() {
      var n = logos.length, offsets = [], idx = 0, anim = null, timer = null;
      var EASE = "cubic-bezier(.3, 1.06, .45, 1)"; // soft landing with a barely-there settle
      function tx(x) { return "translate3d(" + x + "px,0,0)"; }
      function measure() {
        if (anim) { anim.cancel(); anim = null; }
        if (!fillClones()) return;
        offsets = [];
        var acc = 0;
        Array.prototype.forEach.call(original.children, function (it) { offsets.push(acc); acc += it.getBoundingClientRect().width; });
        offsets.push(acc);
        if (right && idx === 0) idx = n;
        track.style.transform = tx(-offsets[idx]);
      }
      function move() {
        if (dead) return;
        if (hovered || !onScreen || !offsets.length) { timer = setTimeout(move, 400); return; }
        var next = right ? idx - 1 : idx + 1;
        var ms = Math.min(1300, Math.max(600, interval * 0.4));
        anim = track.animate([{ transform: tx(-offsets[idx]) }, { transform: tx(-offsets[next]) }],
                             { duration: ms, easing: EASE, fill: "forwards" });
        anim.onfinish = function () {
          idx = next;
          if (!right && idx >= n) idx = 0;
          if (right && idx <= 0) idx = n;
          track.style.transform = tx(-offsets[idx]);
          if (anim) anim.cancel();
          anim = null;
          timer = setTimeout(move, interval);
        };
      }
      cleanups.push(function () { clearTimeout(timer); if (anim) anim.cancel(); });
      whenImagesReady(function () { measure(); timer = setTimeout(move, interval); });
      watchResize(measure);
      watchHover();
      watchScreen();
    }

    /* ---------- FADE: a still row whose logos softly swap to the next group ---------- */
    function startFade() {
      wrap.classList.add("ssl-fading");
      viewport.removeChild(track);
      var row = document.createElement("div");
      row.className = "ssl-fade-row";
      viewport.appendChild(row);
      var n = logos.length, perRow = 0, first = 0, timer = null, slots = [];
      function itemAt(i) { return original.children[((i % n) + n) % n].cloneNode(true); }
      function build() {
        var mobile = window.matchMedia && matchMedia("(max-width: 640px)").matches;
        var gap = parseFloat(getComputedStyle(wrap).getPropertyValue("--ssl-gap")) || S.gap;
        var slotMin = S.logoMaxWidth * (mobile ? 0.8 : 1) + gap * 0.75;
        var k = Math.max(1, Math.min(n, Math.floor(viewport.clientWidth / slotMin)));
        if (k === perRow && slots.length) return;
        perRow = k;
        row.innerHTML = "";
        row.style.gridTemplateColumns = "repeat(" + k + ", minmax(0, 1fr))";
        slots = [];
        for (var j = 0; j < k; j++) {
          var slot = document.createElement("div");
          slot.className = "ssl-slot";
          slot.appendChild(itemAt(first + j));
          row.appendChild(slot);
          slots.push(slot);
        }
      }
      var OUT_MS = 550, STAGGER = 120;
      function cycle() {
        if (dead) return;
        if (perRow >= n) { timer = setTimeout(cycle, interval); return; } // everything already shows
        if (hovered || !onScreen) { timer = setTimeout(cycle, 400); return; }
        first = (first + perRow) % n;
        var group = first;
        slots.forEach(function (slot, j) {
          setTimeout(function () {
            if (dead) return;
            slot.classList.add("is-out");
            setTimeout(function () {
              if (dead) return;
              slot.innerHTML = "";
              slot.appendChild(itemAt(group + j));
              slot.classList.remove("is-out");
            }, OUT_MS);
          }, j * STAGGER);
        });
        timer = setTimeout(cycle, interval + slots.length * STAGGER + OUT_MS);
      }
      cleanups.push(function () { clearTimeout(timer); });
      build();
      whenImagesReady(function () { slots = []; perRow = 0; build(); });
      timer = setTimeout(cycle, interval);
      watchResize(build);
      watchHover();
      watchScreen();
    }
  };

  function boot() {
    var els = document.querySelectorAll(".ss-logos:not([data-ready])");
    if (!els.length) return;
    var req = fetch(BASE + "data/logos.json?t=" + Date.now()).then(function (r) { return r.json(); });
    Array.prototype.forEach.call(els, function (el) {
      el.setAttribute("data-ready", "1");
      req.then(function (d) { W.renderLogos(el, d); }).catch(function (e) { console.warn("[ss-logos]", e); });
    });
  }
  if (!script || !script.hasAttribute("data-no-boot")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})();
