/* Still Speeding — video carousel widget
   Usage on the site:
     <div class="ss-videos"></div>
     <script src="https://<user>.github.io/stillspeeding-widgets/embed/videos.js"></script>
   Optional per-block overrides: data-theme="dark", data-per-view="2", data-loop="false"
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
    /* phones: one card at a time, centred on the screen, with the neighbouring videos peeking in
       equally on both sides. The side padding is half of the space left over by the card, so every
       card (the first one too) lands in the middle when it snaps into place. */
    "@media (max-width:640px){.ssv-root{--ssv-per:1!important;--ssv-gap:12px;--ssv-radius:14px;--ssv-side:7%}.ssv-viewport{padding-left:var(--ssv-side);padding-right:var(--ssv-side);scroll-padding-left:var(--ssv-side);scroll-padding-right:var(--ssv-side)}.ssv-controls{padding:0 var(--ssv-side)}}",
    "@media (max-width:640px){.ssv-root.ssv-bleed{--ssv-side:8vw}.ssv-root.ssv-bleed .ssv-viewport{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}.ssv-root.ssv-bleed .ssv-controls{padding:0}}",
    ".ssv-viewport{overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;outline:none}",
    ".ssv-viewport::-webkit-scrollbar{display:none}",
    ".ssv-viewport:focus-visible{outline:2px solid var(--ssv-ink);outline-offset:6px;border-radius:var(--ssv-radius)}",
    ".ssv-track{display:flex;gap:var(--ssv-gap)}",
    ".ssv-card{flex:0 0 calc((100% - var(--ssv-gap) * (var(--ssv-per) - 1)) / var(--ssv-per));min-width:0;scroll-snap-align:start}",
    ".ssv-media{position:relative;aspect-ratio:16/9;border-radius:var(--ssv-radius);overflow:hidden;background:#111;isolation:isolate}",
    ".ssv-media img,.ssv-media iframe,.ssv-media video{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;margin:0;max-width:none}",
    ".ssv-media img,.ssv-media video{object-fit:cover}",
    ".ssv-media img{opacity:0;object-position:var(--ssv-pos,50% 50%);transform-origin:var(--ssv-pos,50% 50%);transform:scale(calc(var(--ssv-z,1) * 1.02));transition:opacity .6s ease,transform .9s cubic-bezier(.2,.7,.2,1),filter .5s ease}",
    ".ssv-media img.is-loaded{opacity:1}",
    ".ssv-root.ssv-soft .ssv-media img{filter:grayscale(.35)}",
    ".ssv-root .ssv-play{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:100%;margin:0;border:0;border-radius:0;background:linear-gradient(to top,rgba(0,0,0,.35),rgba(0,0,0,0) 45%);cursor:pointer;display:flex;align-items:flex-end;justify-content:flex-start;padding:14px}",
    ".ssv-pill{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px 0 12px;border-radius:300px;background:#fafafa;color:#000;font-family:var(--ssv-head);font-size:15px;line-height:1;letter-spacing:.02em;text-transform:uppercase;transition:background .3s ease,color .3s ease,transform .4s cubic-bezier(.2,.7,.2,1)}",
    ".ssv-pill svg{width:12px;height:12px;fill:currentColor}",
    ".ssv-pill span{transform:translateY(1px)}",
    "@media (hover:hover){.ssv-card:hover .ssv-media img{transform:scale(calc(var(--ssv-z,1) * 1.06));filter:grayscale(0)}.ssv-card:hover .ssv-pill{background:#000;color:#fafafa;transform:translateY(-2px)}}",
    ".ssv-play:focus-visible{outline:3px solid #fafafa;outline-offset:-6px;border-radius:var(--ssv-radius)}",
    ".ssv-info{padding:16px 4px 0}",
    ".ssv-root .ssv-title{margin:0;padding:0;color:var(--ssv-ink);font-family:var(--ssv-head);font-weight:400;font-style:normal;font-size:clamp(17px,1.5vw,21px);line-height:1.15;letter-spacing:-.01em;text-transform:uppercase;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".ssv-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:6px;font-size:13px;font-weight:500;line-height:1.4;color:var(--ssv-muted)}",
    ".ssv-meta-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ssv-root .ssv-link{flex-shrink:0;color:var(--ssv-ink);font-weight:600;text-decoration:none!important;border-bottom:1px solid var(--ssv-line);padding-bottom:1px;transition:border-color .25s ease}",
    ".ssv-root .ssv-link:hover{border-color:var(--ssv-ink)}",
    ".ssv-controls{display:flex;align-items:center;gap:24px;margin-top:28px}",
    ".ssv-progress{position:relative;flex:1;height:2px;background:var(--ssv-line);border-radius:2px;overflow:hidden}",
    ".ssv-progress-bar{position:absolute;top:0;bottom:0;left:0;background:var(--ssv-ink);border-radius:2px;will-change:transform}",
    ".ssv-arrows{display:flex;gap:10px}",
    ".ssv-root .ssv-arrow{-webkit-appearance:none;appearance:none;width:48px;height:48px;margin:0;padding:0;border:1.5px solid var(--ssv-ink);border-radius:300px;background:transparent;color:var(--ssv-ink);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .25s ease,color .25s ease,opacity .25s ease}",
    ".ssv-arrow svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}",
    "@media (hover:hover){.ssv-root .ssv-arrow:hover:not(:disabled){background:var(--ssv-ink);color:var(--ssv-paper)}}",
    ".ssv-root .ssv-arrow:active:not(:disabled){background:var(--ssv-ink);color:var(--ssv-paper)}",
    ".ssv-root .ssv-arrow:disabled{opacity:.25;cursor:default}",
    ".ssv-root .ssv-arrow:focus-visible{outline:2px solid var(--ssv-ink);outline-offset:3px}",
    ".ssv-root.ssv-fits .ssv-controls{display:none}",
    ".ssv-ig-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(120% 90% at 50% 0%,#2a2a2a 0%,#0c0c0c 70%);color:#fafafa;font-family:var(--ssv-head);font-size:14px;letter-spacing:.08em;text-transform:uppercase}",
    ".ssv-ig-cover svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.6;opacity:.9}",
    ".ssv-ig-cover svg .dot{fill:currentColor;stroke:none}",
    ".ssv-ig-cover span{opacity:.75;transform:translateY(1px)}",
    ".ssv-modal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.84);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transition:opacity .35s ease;font-family:'Space Grotesk',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}",
    ".ssv-modal[hidden]{display:none}",
    ".ssv-modal.is-open{opacity:1}",
    ".ssv-modal *{box-sizing:border-box}",
    ".ssv-modal-box{width:min(440px,100%);max-height:calc(100vh - 48px);max-height:calc(100dvh - 48px);display:flex;flex-direction:column;gap:12px;transform:translateY(16px) scale(.985);transition:transform .5s cubic-bezier(.2,.7,.2,1)}",
    ".ssv-modal.is-open .ssv-modal-box{transform:none}",
    ".ssv-modal-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#fafafa}",
    ".ssv-modal-title{font-family:'Dangrek','Arial Narrow',sans-serif;font-size:17px;line-height:1.1;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transform:translateY(1px)}",
    ".ssv-modal .ssv-modal-close{-webkit-appearance:none;appearance:none;flex-shrink:0;display:inline-flex;align-items:center;gap:8px;height:38px;margin:0;padding:0 14px 0 16px;border:1.5px solid rgba(250,250,250,.9);border-radius:300px;background:transparent;color:#fafafa;cursor:pointer;font-family:'Dangrek','Arial Narrow',sans-serif;font-size:14px;letter-spacing:.03em;text-transform:uppercase;transition:background .25s ease,color .25s ease}",
    ".ssv-modal-close span{transform:translateY(1px)}",
    ".ssv-modal-close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}",
    "@media (hover:hover){.ssv-modal .ssv-modal-close:hover{background:#fafafa;color:#000}}",
    ".ssv-modal .ssv-modal-close:focus-visible{outline:2px solid #fafafa;outline-offset:3px}",
    ".ssv-modal-frame{position:relative;flex:1 1 auto;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#fff;border-radius:20px}",
    ".ssv-modal-frame::before{content:'Loading…';position:absolute;top:50%;left:0;right:0;text-align:center;transform:translateY(-50%);color:rgba(0,0,0,.4);font-size:13px;font-weight:500;letter-spacing:.04em}",
    ".ssv-modal-frame iframe{position:relative;display:block;width:100%;height:640px;height:min(720px,calc(100dvh - 140px));border:0;background:transparent}",
    ".ssv-modal .ssv-modal-link{align-self:center;color:rgba(250,250,250,.75);font-size:13px;font-weight:500;text-decoration:none;border-bottom:1px solid rgba(250,250,250,.3);padding-bottom:1px}",
    ".ssv-modal .ssv-modal-link:hover{color:#fafafa;border-color:#fafafa}",
    ".ssv-modal[data-kind=video] .ssv-modal-box{width:min(1120px,100%,calc((100vh - 130px) * 16 / 9));width:min(1120px,100%,calc((100dvh - 130px) * 16 / 9))}",
    ".ssv-modal[data-kind=video] .ssv-modal-frame{flex:none;aspect-ratio:16/9;overflow:hidden;background:#000}",
    ".ssv-modal[data-kind=video] .ssv-modal-frame::before{color:rgba(255,255,255,.45)}",
    ".ssv-modal[data-kind=video] .ssv-modal-frame iframe,.ssv-modal[data-kind=video] .ssv-modal-frame video{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}",
    ".ssv-modal-link[hidden]{display:none}",
    "@media (max-width:640px){.ssv-modal{padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom))}.ssv-modal-box{max-height:calc(100dvh - 24px);gap:10px}.ssv-modal-frame{border-radius:16px}.ssv-modal-title{font-size:15px}}",
    "@media (prefers-reduced-motion:reduce){.ssv-modal,.ssv-modal-box{transition:none}}",
    ".ssv-empty{padding:40px 0;text-align:center;color:var(--ssv-muted);font-size:14px}",
    "@media (max-width:640px){.ssv-info{padding:12px 2px 0}.ssv-root .ssv-title{font-size:18px;-webkit-line-clamp:2}.ssv-meta{font-size:12.5px;margin-top:4px}.ssv-controls{margin-top:20px;gap:16px}.ssv-arrows{gap:8px}.ssv-root .ssv-arrow{width:42px;height:42px}.ssv-arrow svg{width:18px;height:18px}.ssv-root .ssv-play{padding:10px}.ssv-pill{height:30px;padding:0 13px 0 10px;gap:7px;font-size:13px}.ssv-pill svg{width:10px;height:10px}}",
    "@media (max-width:360px){.ssv-root .ssv-title{font-size:16px}.ssv-root .ssv-arrow{width:38px;height:38px}}",
    "@media (prefers-reduced-motion:reduce){.ssv-viewport{scroll-behavior:auto}.ssv-root *,.ssv-root *::before,.ssv-root *::after{transition:none!important}}"
  ].join("\n");

  /* Only download the font weights the page doesn't already have (the Squarespace site
     already carries Dangrek and some Space Grotesk weights). */
  function fontsHref() {
    var have = [];
    try {
      document.fonts.forEach(function (f) {
        var w = String(f.weight).replace("normal", "400").replace("bold", "700").split(" ");
        have.push({ family: f.family.replace(/["']/g, ""), lo: +w[0], hi: +(w[1] || w[0]) });
      });
    } catch (e) {}
    function missing(family, weight) {
      return !have.some(function (h) { return h.family === family && h.lo <= weight && weight <= h.hi; });
    }
    var q = [];
    if (missing("Dangrek", 400)) q.push("family=Dangrek");
    var w = [400, 500, 600].filter(function (x) { return missing("Space Grotesk", x); });
    if (w.length) q.push("family=Space+Grotesk:wght@" + w.join(";"));
    return q.length ? "https://fonts.googleapis.com/css2?" + q.join("&") + "&display=swap" : null;
  }
  function ensureAssets() {
    var fonts = fontsHref();
    if (fonts && !document.getElementById("ssw-fonts")) {
      var l = document.createElement("link");
      l.id = "ssw-fonts";
      l.rel = "stylesheet";
      l.href = fonts;
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
    m = url.match(/instagram\.com\/(?:[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/);
    if (m) return { type: "instagram", code: m[2], kind: m[1] === "p" ? "post" : "reel" };
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return { type: "file", src: url };
    return { type: "iframe", src: url };
  }
  W.parseVideo = parseVideo;

  // uploaded covers are stored in the repo as "covers/….jpg"
  function resolveSrc(src) {
    if (!src || /^(https?:|data:|blob:|\/\/)/i.test(src)) return src;
    return BASE + src.replace(/^\.?\//, "");
  }

  function makePlayer(item, info) {
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
    return player;
  }

  /* ---------- pop-up player: widescreen for videos, tall for Instagram ---------- */
  var modal = null, modalFrame = null, modalReturn = null, savedOverflow = "";
  var IG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" class="dot"/></svg>';
  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    document.documentElement.style.overflow = savedOverflow;
    if (modal.getAttribute("data-kind") === "video") modalFrame.innerHTML = ""; // stop the sound straight away
    setTimeout(function () { if (!modal.classList.contains("is-open")) { modal.hidden = true; modalFrame.innerHTML = ""; } }, 350);
    if (modalReturn && modalReturn.focus) modalReturn.focus();
  }
  function openModal(item, info, trigger) {
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "ssv-modal";
      modal.hidden = true;
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML =
        '<div class="ssv-modal-box">' +
          '<div class="ssv-modal-bar"><span class="ssv-modal-title"></span>' +
          '<button type="button" class="ssv-modal-close" aria-label="Close"><span>Close</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
          '<div class="ssv-modal-frame"></div>' +
          '<a class="ssv-modal-link" target="_blank" rel="noopener"></a>' +
        '</div>';
      document.body.appendChild(modal);
      modalFrame = modal.querySelector(".ssv-modal-frame");
      modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
      modal.querySelector(".ssv-modal-close").addEventListener("click", closeModal);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
      // Instagram's embed tells the page how tall it wants to be
      window.addEventListener("message", function (e) {
        if (!/^https:\/\/www\.instagram\.com$/.test(e.origin)) return;
        var f = modalFrame && modalFrame.querySelector("iframe");
        if (!f || e.source !== f.contentWindow) return;
        try {
          var d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
          if (d && d.type === "MEASURE" && d.details && d.details.height) f.style.height = Math.ceil(d.details.height) + "px";
        } catch (x) {}
      });
    }
    var ig = info.type === "instagram";
    var link = modal.querySelector(".ssv-modal-link"), content;
    modal.setAttribute("data-kind", ig ? "instagram" : "video");
    modal.querySelector(".ssv-modal-title").textContent = item.title || (ig ? (info.kind === "reel" ? "Instagram reel" : "Instagram post") : "");
    modal.setAttribute("aria-label", item.title || (ig ? "Instagram post" : "Video"));
    if (ig) {
      content = document.createElement("iframe");
      content.src = "https://www.instagram.com/p/" + info.code + "/embed/";
      content.title = item.title || "Instagram post";
      content.allow = "autoplay; encrypted-media; picture-in-picture; clipboard-write";
      content.setAttribute("scrolling", "no");
      link.href = "https://www.instagram.com/" + (info.kind === "reel" ? "reel" : "p") + "/" + info.code + "/";
      link.textContent = "Open on Instagram ↗";
    } else {
      content = makePlayer(item, info);
      var site = info.type === "youtube" ? "YouTube" : info.type === "vimeo" ? "Vimeo" : "";
      link.href = site ? item.video : "";
      link.textContent = site ? "Watch on " + site + " ↗" : "";
    }
    link.hidden = !link.textContent;
    modalFrame.innerHTML = "";
    modalFrame.appendChild(content);
    modalReturn = trigger;
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    modal.hidden = false;
    void modal.offsetWidth; // apply the closed state first so the fade-in runs
    modal.classList.add("is-open");
    modal.querySelector(".ssv-modal-close").focus();
  }

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
    img.onerror = function () {
      // a smaller copy isn't there yet (a brand-new cover is still being resized) — use the original
      if (img.srcset) { img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.src = src; return; }
      if (fallback) { var f = fallback; fallback = null; img.src = f; }
    };
    // our own covers have 480px and 960px WebP copies in covers/sizes/ (see scripts/cover-sizes.mjs);
    // the browser picks the smallest one that is sharp at the card's size
    var own = src && !/^(data|blob):/i.test(src) && src.match(/^(.*\/)?covers\/([^\/?#]+)\.(jpe?g|png|webp)$/i);
    if (own) {
      var dir = (own[1] || "") + "covers/sizes/" + own[2];
      img.sizes = cardSizes;
      img.srcset = dir + "-480.webp 480w, " + dir + "-960.webp 960w, " + src + " 1280w";
    }
    if (src) img.src = src;
    return img;
  }
  var cardSizes = "(max-width:640px) 86vw, (max-width:991px) 45vw, 33vw";

  W.renderVideos = function (root, data) {
    ensureAssets();
    if (root._ssCleanup) root._ssCleanup();
    var cleanups = [];
    root._ssCleanup = function () { cleanups.forEach(function (f) { f(); }); };

    var settings = Object.assign({ theme: "light", perViewDesktop: 3, softThumbnails: false, openLinksInNewTab: true, loop: true, playIn: "popup" }, (data && data.settings) || {});
    if (root.dataset.theme) settings.theme = root.dataset.theme;
    if (root.dataset.perView) settings.perViewDesktop = +root.dataset.perView;
    var videos = ((data && data.videos) || []).filter(function (v) { return v && v.video && !v.hidden; });

    root.innerHTML = "";
    var wrap = el("div", "ssv-root");
    if (settings.theme === "dark") wrap.classList.add("ssv-dark");
    if (settings.softThumbnails) wrap.classList.add("ssv-soft");
    if (settings.edgeToEdge !== false && root.dataset.bleed !== "false") wrap.classList.add("ssv-bleed");
    wrap.style.setProperty("--ssv-per", settings.perViewDesktop || 3);
    root.appendChild(wrap);
    // how wide a card shows, so covers load at the right size (matches the --ssv-per breakpoints)
    var boxW = Math.round(wrap.getBoundingClientRect().width) || 0;
    cardSizes = "(max-width:640px) 86vw, (max-width:991px) 45vw, " +
      (boxW ? Math.ceil(boxW / (settings.perViewDesktop || 3)) + "px" : Math.ceil(100 / (settings.perViewDesktop || 3)) + "vw");

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
      media.innerHTML = "";
      media.appendChild(makePlayer(item, info));
      playing = { media: media, saved: saved };
    }

    function buildCard(item, isClone) {
      var info = parseVideo(item.video);
      var card = el("article", "ssv-card");
      var media = el("div", "ssv-media");

      // framing chosen in the app's cover editor (which part of the picture shows, and zoom)
      if (item.coverPos) media.style.setProperty("--ssv-pos", item.coverPos);
      if (item.coverZoom) media.style.setProperty("--ssv-z", item.coverZoom);

      if (item.thumbnail) {
        media.appendChild(thumb(resolveSrc(item.thumbnail)));
      } else if (info.type === "instagram") {
        var ph = el("div", "ssv-ig-cover");
        ph.innerHTML = IG_ICON + "<span>" + (info.kind === "reel" ? "Instagram reel" : "Instagram post") + "</span>";
        media.appendChild(ph);
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
      btn.innerHTML = '<span class="ssv-pill"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.2v9.6a.6.6 0 0 0 .9.5l7.8-4.8a.6.6 0 0 0 0-1L3.4.7a.6.6 0 0 0-.9.5z"/></svg><span>' + (info.type === "instagram" && info.kind === "post" ? "View" : "Play") + '</span></span>';
      btn.addEventListener("click", function () {
        if (info.type === "instagram" || settings.playIn !== "card") openModal(item, info, btn);
        else play(item, info, media);
      });
      media.appendChild(btn);
      card.appendChild(media);

      if (item.title || item.meta || item.link) {
        var infoEl = el("div", "ssv-info");
        if (item.title) infoEl.appendChild(el("h4", "ssv-title", item.title));
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
      if (isClone) {
        // copies used for the endless loop: clickable, but hidden from screen readers / tabbing
        card.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(card.querySelectorAll("button, a"), function (n) { n.tabIndex = -1; });
      }
      return card;
    }
    videos.forEach(function (item) { track.appendChild(buildCard(item, false)); });

    var n = videos.length;
    var loop = settings.loop !== false && root.dataset.loop !== "false";
    var looping = false;
    var bar2 = bar.cloneNode();
    bar.parentNode.appendChild(bar2);

    function maxScroll() { return viewport.scrollWidth - viewport.clientWidth; }
    function step() {
      var c = track.children;
      return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : (c[0] ? c[0].offsetWidth : 1);
    }
    function jumpTo(x) {
      viewport.style.scrollBehavior = "auto";
      viewport.scrollLeft = x;
      viewport.style.scrollBehavior = "";
    }

    /* Endless loop: three copies of the list side by side. We always settle in the middle
       copy — whenever scrolling stops in the first or last copy, we silently jump by exactly
       one copy's width, which looks identical, so the carousel never runs out. */
    function enableLoop() {
      if (looping || !loop || n < 2 || maxScroll() <= 2) return;
      looping = true;
      var before = document.createDocumentFragment(), after = document.createDocumentFragment();
      videos.forEach(function (item) {
        before.appendChild(buildCard(item, true));
        after.appendChild(buildCard(item, true));
      });
      track.insertBefore(before, track.firstChild);
      track.appendChild(after);
      jumpTo(step() * n);
    }
    var touching = false, settleTimer;
    function recentre() {
      if (!looping || touching || playing) return;
      var W = step() * n, x = viewport.scrollLeft;
      if (x < W - 2) jumpTo(x + W);
      else if (x >= 2 * W - 2) jumpTo(x - W);
    }

    var cards = track.children;
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
      if (looping) {
        recentre();
        var s = step();
        viewport.scrollTo({ left: (Math.round(viewport.scrollLeft / s) + dir) * s, behavior: "smooth" });
        return;
      }
      var list = stops();
      var i = Math.max(0, Math.min(list.length - 1, currentStop(list) + dir));
      viewport.scrollTo({ left: list[i], behavior: "smooth" });
    }
    function update() {
      var max = maxScroll();
      var fits = max <= 2 && !looping;
      wrap.classList.toggle("ssv-fits", fits);
      if (looping) {
        // a segment that slides along and wraps around the line
        var s = step(), rel = ((viewport.scrollLeft - s * n) / s) % n;
        if (rel < 0) rel += n;
        bar.style.width = bar2.style.width = 100 / n + "%";
        bar.style.transform = "translateX(" + rel * 100 + "%)";
        bar2.style.transform = "translateX(" + (rel - n) * 100 + "%)";
        prevBtn.disabled = nextBtn.disabled = false;
      } else {
        var visible = viewport.clientWidth / viewport.scrollWidth;
        var pos = fits ? 0 : viewport.scrollLeft / max;
        bar.style.width = visible * 100 + "%";
        bar.style.transform = "translateX(" + pos * (1 / visible - 1) * 100 + "%)";
        bar2.style.width = "0";
        prevBtn.disabled = viewport.scrollLeft <= 2;
        nextBtn.disabled = viewport.scrollLeft >= max - 2;
      }
      if (playing) {
        var r = playing.media.getBoundingClientRect(), v = viewport.getBoundingClientRect();
        if (r.right < v.left + 20 || r.left > v.right - 20) stopPlaying();
      }
    }

    var ticking = false;
    viewport.addEventListener("scroll", function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(recentre, 160);
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    viewport.addEventListener("touchstart", function () { touching = true; }, { passive: true });
    function touchEnd() { touching = false; clearTimeout(settleTimer); settleTimer = setTimeout(recentre, 160); }
    viewport.addEventListener("touchend", touchEnd, { passive: true });
    viewport.addEventListener("touchcancel", touchEnd, { passive: true });
    cleanups.push(function () { clearTimeout(settleTimer); });
    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });
    viewport.addEventListener("keydown", function (e) {
      if (e.target !== viewport) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    // keep the same video in place when the screen size changes
    var lastStep = 0;
    function onResize() {
      var s = step();
      if (looping && lastStep && Math.abs(s - lastStep) > 0.5) jumpTo(Math.round(viewport.scrollLeft / lastStep) * s);
      lastStep = s;
      enableLoop();
      update();
    }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(onResize);
      ro.observe(viewport);
      cleanups.push(function () { ro.disconnect(); });
    } else {
      window.addEventListener("resize", onResize);
      cleanups.push(function () { window.removeEventListener("resize", onResize); });
    }
    viewport.scrollLeft = 0;
    enableLoop();
    lastStep = step();
    update();
  };

  function boot() {
    var els = document.querySelectorAll(".ss-videos:not([data-ready])");
    if (!els.length) return;
    // "no-cache": always check for a newer list, but reuse the saved copy when nothing changed
    var req = fetch(BASE + "data/videos.json", { cache: "no-cache" }).then(function (r) { return r.json(); });
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
