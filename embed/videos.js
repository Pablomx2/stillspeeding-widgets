/* Still Speeding — video carousel widget
   Usage on the site:
     <div class="ss-videos"></div>
     <script src="https://<user>.github.io/stillspeeding-widgets/embed/videos.js"></script>
   Optional per-block overrides: data-theme="dark", data-per-view="2"
   Content comes from data/videos.json (edited with the admin app). */
(function () {
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/embed\/[^\/?#]*([?#].*)?$/, "") : "";
  var W = (window.SSWidgets = window.SSWidgets || {});

  var CSS = [
    ".ssv-root{--ssv-ink:#000;--ssv-paper:#fafafa;--ssv-muted:rgba(0,0,0,.55);--ssv-line:rgba(0,0,0,.14);--ssv-radius:20px;--ssv-gap:28px;--ssv-per:3;--ssv-head:'Dangrek','Arial Narrow',sans-serif;--ssv-body:'Space Grotesk',system-ui,sans-serif;position:relative;width:100%;color:var(--ssv-ink);font-family:var(--ssv-body);-webkit-tap-highlight-color:transparent}",
    ".ssv-root.ssv-dark{--ssv-ink:#fafafa;--ssv-paper:#000;--ssv-muted:rgba(250,250,250,.6);--ssv-line:rgba(250,250,250,.2)}",
    ".ssv-root *,.ssv-root *::before,.ssv-root *::after{box-sizing:border-box}",
    "@media (max-width:991px){.ssv-root{--ssv-per:2.15!important;--ssv-gap:20px}}",
    "@media (max-width:640px){.ssv-root{--ssv-per:1.1!important;--ssv-gap:12px;--ssv-radius:14px}}",
    /* phones: let the strip run edge-to-edge so the next video peeks in from the screen edge,
       while the first card still lines up with the rest of the page content */
    "@media (max-width:640px){.ssv-root.ssv-bleed .ssv-viewport{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);padding-left:calc(50vw - 50%);padding-right:calc(50vw - 50%);scroll-padding-left:calc(50vw - 50%);scroll-padding-right:calc(50vw - 50%)}}",
    ".ssv-viewport{overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;outline:none}",
    ".ssv-viewport::-webkit-scrollbar{display:none}",
    ".ssv-viewport:focus-visible{outline:2px solid var(--ssv-ink);outline-offset:6px;border-radius:var(--ssv-radius)}",
    ".ssv-track{display:flex;gap:var(--ssv-gap)}",
    ".ssv-card{flex:0 0 calc((100% - var(--ssv-gap) * (var(--ssv-per) - 1)) / var(--ssv-per));min-width:0;scroll-snap-align:start}",
    ".ssv-media{position:relative;aspect-ratio:16/9;border-radius:var(--ssv-radius);overflow:hidden;background:#111;isolation:isolate}",
    ".ssv-media img,.ssv-media iframe,.ssv-media video{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;margin:0;max-width:none}",
    ".ssv-media img,.ssv-media video{object-fit:cover}",
    ".ssv-media img{opacity:0;transform:scale(1.02);transition:opacity .6s ease,transform .9s cubic-bezier(.2,.7,.2,1),filter .5s ease}",
    ".ssv-media img.is-loaded{opacity:1}",
    ".ssv-root.ssv-soft .ssv-media img{filter:grayscale(.35)}",
    ".ssv-root .ssv-play{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:100%;margin:0;border:0;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.35),rgba(0,0,0,0) 45%);cursor:pointer;display:flex;align-items:flex-end;justify-content:flex-start;padding:14px}",
    ".ssv-pill{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px 0 12px;border-radius:300px;background:#fafafa;color:#000;font-family:var(--ssv-head);font-size:15px;line-height:1;letter-spacing:.02em;text-transform:uppercase;transition:background .3s ease,color .3s ease,transform .4s cubic-bezier(.2,.7,.2,1)}",
    ".ssv-pill svg{width:12px;height:12px;fill:currentColor}",
    ".ssv-pill span{transform:translateY(1px)}",
    "@media (hover:hover){.ssv-card:hover .ssv-media img{transform:scale(1.06);filter:grayscale(0)}.ssv-card:hover .ssv-pill{background:#000;color:#fafafa;transform:translateY(-2px)}}",
    ".ssv-play:focus-visible{outline:3px solid #fafafa;outline-offset:-6px;border-radius:var(--ssv-radius)}",
    ".ssv-info{padding:16px 4px 0}",
    ".ssv-root .ssv-title{margin:0;padding:0;color:var(--ssv-ink);font-family:var(--ssv-head);font-weight:400;font-size:clamp(17px,1.5vw,21px);line-height:1.15;letter-spacing:-.01em;text-transform:uppercase;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".ssv-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:6px;font-size:13px;font-weight:500;line-height:1.4;color:var(--ssv-muted)}",
    ".ssv-meta-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ssv-root .ssv-link{flex-shrink:0;color:var(--ssv-ink);font-weight:600;text-decoration:none!important;border-bottom:1px solid var(--ssv-line);padding-bottom:1px;transition:border-color .25s ease}",
    ".ssv-root .ssv-link:hover{border-color:var(--ssv-ink)}",
    ".ssv-controls{display:flex;align-items:center;gap:24px;margin-top:28px}",
    ".ssv-progress{position:relative;flex:1;height:2px;background:var(--ssv-line);border-radius:2px;overflow:hidden}",
    ".ssv-progress-bar{position:absolute;top:0;bottom:0;left:0;background:var(--ssv-ink);border-radius:2px;transition:transform .15s linear;will-change:transform}",
    ".ssv-arrows{display:flex;gap:10px}",
    ".ssv-root .ssv-arrow{-webkit-appearance:none;appearance:none;width:48px;height:48px;margin:0;padding:0;border:1.5px solid var(--ssv-ink);border-radius:300px;background:transparent;color:var(--ssv-ink);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .25s ease,color .25s ease,opacity .25s ease}",
    ".ssv-arrow svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    "@media (hover:hover){.ssv-root .ssv-arrow:hover:not(:disabled){background:var(--ssv-ink);color:var(--ssv-paper)}}",
    ".ssv-root .ssv-arrow:active:not(:disabled){background:var(--ssv-ink);color:var(--ssv-paper)}",
    ".ssv-root .ssv-arrow:disabled{opacity:.25;cursor:default}",
    ".ssv-root .ssv-arrow:focus-visible{outline:2px solid var(--ssv-ink);outline-offset:3px}",
    ".ssv-root.ssv-fits .ssv-controls{display:none}",
    ".ssv-empty{padding:40px 0;text-align:center;color:var(--ssv-muted);font-size:14px}",
    "@media (max-width:640px){.ssv-info{padding:12px 2px 0}.ssv-root .ssv-title{font-size:18px;-webkit-line-clamp:2}.ssv-meta{font-size:12.5px;margin-top:4px}.ssv-controls{margin-top:20px;gap:16px}.ssv-arrows{gap:8px}.ssv-root .ssv-arrow{width:42px;height:42px}.ssv-arrow svg{width:18px;height:18px}.ssv-root .ssv-play{padding:10px}.ssv-pill{height:30px;padding:0 13px 0 10px;gap:7px;font-size:13px}.ssv-pill svg{width:10px;height:10px}}",
    "@media (max-width:360px){.ssv-root{--ssv-per:1.06!important}.ssv-root .ssv-title{font-size:16px}.ssv-root .ssv-arrow{width:38px;height:38px}}",
    "@media (prefers-reduced-motion:reduce){.ssv-viewport{scroll-behavior:auto}.ssv-root *,.ssv-root *::before,.ssv-root *::after{transition:none!important}}"
  ].join("\n");

  function ensureAssets() {
    if (!document.getElementById("ssw-fonts")) {
      var l = document.createElement("link");
      l.id = "ssw-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Dangrek&family=Space+Grotesk:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("ssv-css")) {
      var s = document.createElement("style");
      s.id = "ssv-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }

  function parseVideo(url) {
    url = (url || "").trim();
    var m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
    if (m) return { type: "youtube", id: m[1] };
    m = url.match(/vimeo\.com\/(?:[^?#]*?\/)?(\d{5,})(?:\/([0-9a-f]{6,}))?/);
    if (m) return { type: "vimeo", id: m[1], hash: m[2] || (url.match(/[?&]h=([0-9a-f]+)/) || [])[1] };
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return { type: "file", src: url };
    return { type: "iframe", src: url };
  }
  W.parseVideo = parseVideo;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function thumb(src, fallback) {
    var img = el("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onload = function () {
      // YouTube serves a tiny grey placeholder when the HD cover doesn't exist
      if (fallback && img.naturalWidth <= 120) { var f = fallback; fallback = null; img.src = f; return; }
      img.classList.add("is-loaded");
    };
    img.onerror = function () { if (fallback) { var f = fallback; fallback = null; img.src = f; } };
    if (src) img.src = src;
    return img;
  }

  W.renderVideos = function (root, data) {
    ensureAssets();
    if (root._ssCleanup) root._ssCleanup();
    var cleanups = [];
    root._ssCleanup = function () { cleanups.forEach(function (f) { f(); }); };

    var settings = Object.assign({ theme: "light", perViewDesktop: 3, softThumbnails: false, openLinksInNewTab: true }, (data && data.settings) || {});
    if (root.dataset.theme) settings.theme = root.dataset.theme;
    if (root.dataset.perView) settings.perViewDesktop = +root.dataset.perView;
    var videos = ((data && data.videos) || []).filter(function (v) { return v && v.video; });

    root.innerHTML = "";
    var wrap = el("div", "ssv-root");
    if (settings.theme === "dark") wrap.classList.add("ssv-dark");
    if (settings.softThumbnails) wrap.classList.add("ssv-soft");
    if (settings.edgeToEdge !== false && root.dataset.bleed !== "false") wrap.classList.add("ssv-bleed");
    wrap.style.setProperty("--ssv-per", settings.perViewDesktop || 3);
    root.appendChild(wrap);

    if (!videos.length) {
      wrap.appendChild(el("div", "ssv-empty", "No videos yet."));
      return;
    }

    wrap.innerHTML =
      '<div class="ssv-viewport" tabindex="0" aria-label="Videos — swipe or use arrow keys"><div class="ssv-track"></div></div>' +
      '<div class="ssv-controls"><div class="ssv-progress" aria-hidden="true"><span class="ssv-progress-bar"></span></div>' +
      '<div class="ssv-arrows"><button type="button" class="ssv-arrow ssv-prev" aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg></button>' +
      '<button type="button" class="ssv-arrow ssv-next" aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg></button></div></div>';

    var viewport = wrap.querySelector(".ssv-viewport");
    var track = wrap.querySelector(".ssv-track");
    var bar = wrap.querySelector(".ssv-progress-bar");
    var prevBtn = wrap.querySelector(".ssv-prev");
    var nextBtn = wrap.querySelector(".ssv-next");

    var playing = null;
    function stopPlaying() {
      if (!playing) return;
      playing.media.innerHTML = "";
      playing.saved.forEach(function (n) { playing.media.appendChild(n); });
      playing = null;
    }
    function play(item, info, media) {
      stopPlaying();
      var saved = Array.prototype.slice.call(media.childNodes);
      var player;
      if (info.type === "file") {
        player = document.createElement("video");
        player.src = info.src;
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
      } else {
        player = document.createElement("iframe");
        player.src = info.type === "youtube"
          ? "https://www.youtube-nocookie.com/embed/" + info.id + "?autoplay=1&rel=0&playsinline=1&modestbranding=1"
          : info.type === "vimeo"
            ? "https://player.vimeo.com/video/" + info.id + "?autoplay=1&dnt=1&byline=0&portrait=0&title=0" + (info.hash ? "&h=" + info.hash : "")
            : info.src;
        player.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
        player.allowFullscreen = true;
        player.title = item.title || "Video";
      }
      media.innerHTML = "";
      media.appendChild(player);
      playing = { media: media, saved: saved };
    }

    videos.forEach(function (item) {
      var info = parseVideo(item.video);
      var card = el("article", "ssv-card");
      var media = el("div", "ssv-media");

      if (item.thumbnail) {
        media.appendChild(thumb(item.thumbnail));
      } else if (info.type === "youtube") {
        media.appendChild(thumb("https://i.ytimg.com/vi/" + info.id + "/maxresdefault.jpg",
                                "https://i.ytimg.com/vi/" + info.id + "/hqdefault.jpg"));
      } else if (info.type === "vimeo") {
        var vimg = thumb(null);
        media.appendChild(vimg);
        var vurl = "https://vimeo.com/" + info.id + (info.hash ? "/" + info.hash : "");
        fetch("https://vimeo.com/api/oembed.json?width=1280&url=" + encodeURIComponent(vurl))
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.thumbnail_url) vimg.src = d.thumbnail_url; })
          .catch(function () {});
      } else if (info.type === "file") {
        var pv = document.createElement("video");
        pv.src = info.src + "#t=0.5";
        pv.muted = true;
        pv.playsInline = true;
        pv.preload = "metadata";
        pv.setAttribute("aria-hidden", "true");
        media.appendChild(pv);
      }

      var btn = el("button", "ssv-play");
      btn.type = "button";
      btn.setAttribute("aria-label", "Play" + (item.title ? ": " + item.title : " video"));
      btn.innerHTML = '<span class="ssv-pill"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.2v9.6a.6.6 0 0 0 .9.5l7.8-4.8a.6.6 0 0 0 0-1L3.4.7a.6.6 0 0 0-.9.5z"/></svg><span>Play</span></span>';
      btn.addEventListener("click", function () { play(item, info, media); });
      media.appendChild(btn);
      card.appendChild(media);

      if (item.title || item.meta || item.link) {
        var infoEl = el("div", "ssv-info");
        if (item.title) infoEl.appendChild(el("h3", "ssv-title", item.title));
        if (item.meta || item.link) {
          var meta = el("div", "ssv-meta");
          meta.appendChild(el("span", "ssv-meta-text", item.meta || ""));
          if (item.link) {
            var a = el("a", "ssv-link", item.linkText || "View");
            a.href = item.link;
            if (settings.openLinksInNewTab) { a.target = "_blank"; a.rel = "noopener"; }
            meta.appendChild(a);
          }
          infoEl.appendChild(meta);
        }
        card.appendChild(infoEl);
      }
      track.appendChild(card);
    });

    var cards = track.children;
    function maxScroll() { return viewport.scrollWidth - viewport.clientWidth; }
    function stops() {
      var max = maxScroll(), out = [];
      for (var i = 0; i < cards.length; i++) {
        var x = Math.min(cards[i].offsetLeft - track.offsetLeft, max);
        if (!out.length || x - out[out.length - 1] > 2) out.push(x);
      }
      return out;
    }
    function currentStop(list) {
      var x = viewport.scrollLeft, best = 0;
      for (var i = 1; i < list.length; i++) if (Math.abs(list[i] - x) < Math.abs(list[best] - x)) best = i;
      return best;
    }
    function go(dir) {
      var list = stops();
      var i = Math.max(0, Math.min(list.length - 1, currentStop(list) + dir));
      viewport.scrollTo({ left: list[i], behavior: "smooth" });
    }
    function update() {
      var max = maxScroll();
      var fits = max <= 2;
      wrap.classList.toggle("ssv-fits", fits);
      var visible = viewport.clientWidth / viewport.scrollWidth;
      var pos = fits ? 0 : viewport.scrollLeft / max;
      bar.style.width = visible * 100 + "%";
      bar.style.transform = "translateX(" + pos * (1 / visible - 1) * 100 + "%)";
      prevBtn.disabled = viewport.scrollLeft <= 2;
      nextBtn.disabled = viewport.scrollLeft >= max - 2;
      if (playing) {
        var r = playing.media.getBoundingClientRect(), v = viewport.getBoundingClientRect();
        if (r.right < v.left + 20 || r.left > v.right - 20) stopPlaying();
      }
    }

    var ticking = false;
    viewport.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });
    viewport.addEventListener("keydown", function (e) {
      if (e.target !== viewport) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(update);
      ro.observe(viewport);
      cleanups.push(function () { ro.disconnect(); });
    } else {
      window.addEventListener("resize", update);
      cleanups.push(function () { window.removeEventListener("resize", update); });
    }
    viewport.scrollLeft = 0;
    update();
  };

  function boot() {
    var els = document.querySelectorAll(".ss-videos:not([data-ready])");
    if (!els.length) return;
    var req = fetch(BASE + "data/videos.json?t=" + Date.now()).then(function (r) { return r.json(); });
    Array.prototype.forEach.call(els, function (el) {
      el.setAttribute("data-ready", "1");
      req.then(function (d) { W.renderVideos(el, d); }).catch(function (e) { console.warn("[ss-videos]", e); });
    });
  }
  if (!script || !script.hasAttribute("data-no-boot")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})();
