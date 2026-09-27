/* Still Speeding — clients logo banner widget
   Usage on the site:
     <div class="ss-logos"></div>
     <script src="https://<user>.github.io/stillspeeding-widgets/embed/logos.js"></script>
   Optional per-block overrides: data-theme="dark", data-style="mono", data-heading="Clients"
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
    ".ssl-track{display:flex;width:max-content;will-change:transform}",
    ".ssl-set{display:flex;align-items:center;flex-shrink:0}",
    ".ssl-root .ssl-item{display:flex;align-items:center;justify-content:center;padding:0 calc(var(--ssl-gap) / 2);flex-shrink:0;text-decoration:none!important;border:0}",
    ".ssl-root .ssl-item img{display:block;height:var(--ssl-height);width:auto;max-width:var(--ssl-max-width);margin:0;object-fit:contain;filter:grayscale(var(--ssl-gray)) contrast(1.05);opacity:var(--ssl-opacity);transition:filter .5s ease,opacity .5s ease;-webkit-user-drag:none;user-select:none}",
    ".ssl-root.ssl-mono .ssl-item img{filter:grayscale(1) brightness(0)}",
    ".ssl-root.ssl-mono.ssl-dark .ssl-item img{filter:grayscale(1) brightness(0) invert(1)}",
    "@media (hover:hover){.ssl-root.ssl-hover .ssl-item:hover img{filter:none;opacity:1}}",
    ".ssl-root .ssl-item:focus-visible{outline:2px solid var(--ssl-ink);outline-offset:8px;border-radius:6px}",
    ".ssl-root .ssl-item:focus-visible img{filter:none;opacity:1}",
    ".ssl-root.ssl-static .ssl-track{width:100%}",
    ".ssl-root.ssl-static .ssl-set{flex-wrap:wrap;justify-content:center;row-gap:32px;width:100%;flex-shrink:1}",
    ".ssl-root.ssl-static .ssl-viewport{-webkit-mask-image:none;mask-image:none}",
    ".ssl-empty{padding:30px 0;text-align:center;opacity:.5;font-size:14px}",
    "@media (max-width:640px){.ssl-root{--ssl-gap:48px!important;--ssl-fade:10%}.ssl-root .ssl-item img{height:calc(var(--ssl-height) * .78);max-width:calc(var(--ssl-max-width) * .8)}.ssl-heading{font-size:13px;gap:12px;margin-bottom:22px}}"
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
      gap: 80, pauseOnHover: true, fadeEdges: true
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
      img.src = logo.preview || resolve(logo.src, opts.base);
      img.alt = logo.name || "";
      img.decoding = "async";
      img.draggable = false;
      item.appendChild(img);
      original.appendChild(item);
    });
    track.appendChild(original);

    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !track.animate) { wrap.classList.add("ssl-static"); return; }

    var anim = null, lastWidth = 0, lastSet = 0, dead = false;
    cleanups.push(function () { dead = true; if (anim) anim.cancel(); });

    function layout() {
      if (dead) return;
      var setWidth = original.getBoundingClientRect().width;
      var viewWidth = viewport.clientWidth;
      if (!setWidth || !viewWidth) return;
      if (viewWidth === lastWidth && Math.abs(setWidth - lastSet) < 1) return;
      lastWidth = viewWidth;
      lastSet = setWidth;

      while (track.children.length > 1) track.removeChild(track.lastChild);
      var copies = Math.ceil(viewWidth / setWidth) + 1;
      for (var i = 0; i < copies; i++) {
        var clone = original.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(clone.querySelectorAll("a"), function (a) { a.tabIndex = -1; });
        track.appendChild(clone);
      }

      var right = S.direction === "right";
      var wasPaused = anim && anim.playState === "paused";
      var progress = anim ? (anim.currentTime || 0) / anim.effect.getTiming().duration : 0;
      if (anim) anim.cancel();
      var duration = (setWidth / Math.max(1, S.speed)) * 1000;
      anim = track.animate(
        [{ transform: "translate3d(" + (right ? -setWidth : 0) + "px,0,0)" },
         { transform: "translate3d(" + (right ? 0 : -setWidth) + "px,0,0)" }],
        { duration: duration, iterations: Infinity, easing: "linear" }
      );
      anim.currentTime = (progress % 1) * duration;
      if (wasPaused) anim.pause();
    }

    var imgs = Array.prototype.slice.call(original.querySelectorAll("img"));
    Promise.all(imgs.map(function (img) {
      return img.complete ? null : new Promise(function (res) { img.onload = img.onerror = res; });
    })).then(layout);

    var t;
    function relayout() { clearTimeout(t); t = setTimeout(layout, 120); }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(relayout);
      ro.observe(viewport);
      cleanups.push(function () { ro.disconnect(); });
    } else {
      window.addEventListener("resize", relayout);
      cleanups.push(function () { window.removeEventListener("resize", relayout); });
    }

    var hovering = false, onScreen = true;
    function sync() { if (anim) (hovering || !onScreen) ? anim.pause() : anim.play(); }
    if (S.pauseOnHover) {
      viewport.addEventListener("mouseenter", function () { hovering = true; sync(); });
      viewport.addEventListener("mouseleave", function () { hovering = false; sync(); });
      viewport.addEventListener("focusin", function () { hovering = true; sync(); });
      viewport.addEventListener("focusout", function () { hovering = false; sync(); });
    }
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; sync(); });
      io.observe(viewport);
      cleanups.push(function () { io.disconnect(); });
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
