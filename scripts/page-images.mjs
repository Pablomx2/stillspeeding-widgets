// Finds logo, merch and other pictures on a web page (an artist's or brand's site, a merch store,
// Bandcamp…) for the admin app's logo search. Follows one link to the site's store/shop/merch page
// and reads Shopify stores' product list, where most artist merch lives.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MAX = 40;

const decode = (s) => String(s || "").replace(/&amp;/g, "&").replace(/&#0?38;/g, "&").replace(/&quot;/g, '"').replace(/&#x2F;/gi, "/").trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])([^"']*)\\1`, "i")); return m ? decode(m[2]) : ""; };
const LOGOISH = /logo|wordmark|brand|masthead|site-title|header__heading/i;
const JUNK = /\.gif(\?|$)|spacer|pixel|tracking|badge|payment|paypal|visa|mastercard|amex|klarna|afterpay|apple-pay|google-pay|flag|avatar|emoji|spinner|loader|placeholder|1x1/i;

async function get(url, accept) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: accept || "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${new URL(url).host} answered ${r.status}`);
  return r;
}

// biggest candidate from a srcset
function fromSrcset(s) {
  let best = "", bw = 0;
  for (const part of decode(s).split(",")) {
    const [u, d] = part.trim().split(/\s+/);
    const w = parseFloat(d) || 1;
    if (u && w >= bw) { best = u; bw = w; }
  }
  return best;
}
// Shopify's CDN serves any size: ask for a big one
const bigger = (u) => u.replace(/%7Bwidth%7D|{width}/gi, "1600").replace(/_(\d+x\d*|\d*x\d+|small|medium|large|grande|compact|thumb)(?=\.\w+(\?|$))/i, "").replace(/([?&])width=\d+/, "$1width=1600");

export async function pageImages(pageUrl) {
  const out = [], seen = new Set();
  const add = (u, kind, base, alt) => {
    if (out.length >= MAX * 2) return;
    try { u = new URL(u, base).href; } catch { return; }
    if (!/^https?:/.test(u) || JUNK.test(u)) return;
    u = bigger(u);
    const key = u.replace(/[?#].*$/, "");
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ url: u, kind, alt: String(alt || "").slice(0, 80) });
  };
  const addSvg = (svg) => {
    if (svg.length > 60000 || seen.has(svg)) return;
    seen.add(svg);
    if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    out.push({ svgText: svg, kind: "logo", alt: "" });
  };

  async function shopify(origin) {
    try {
      const d = await (await get(origin + "/products.json?limit=60", "application/json")).json();
      for (const p of d.products || []) if (p.images && p.images[0]) add(p.images[0].src, "merch", origin, p.title);
      return (d.products || []).length > 0;
    } catch { return false; }
  }

  async function scan(url, depth) {
    const r = await get(url);
    const base = r.url;
    // a direct image link
    if (/^image\//.test(r.headers.get("content-type") || "")) { add(base, "image", base); return; }
    const html = await r.text();
    const origin = new URL(base).origin;
    const store = /store|shop|merch/i.test(base);

    for (const m of html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi)) {
      const before = html.slice(Math.max(0, m.index - 300), m.index);
      if (LOGOISH.test(m[0].slice(0, 300)) || /<a[^>]*(logo|home|brand)[^>]*>\s*$/i.test(before) || /class=["'][^"']*logo[^"']*["'][^>]*>\s*(<a[^>]*>)?\s*$/i.test(before)) addSvg(m[0]);
    }
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const src = fromSrcset(attr(tag, "data-srcset") || attr(tag, "srcset")) || attr(tag, "data-src") || attr(tag, "src");
      if (!src || /^data:/.test(src)) continue;
      const before = html.slice(Math.max(0, m.index - 200), m.index);
      const kind = LOGOISH.test(tag) || LOGOISH.test(src) || /class=["'][^"']*logo[^"']*["'][^>]*>\s*(<a[^>]*>)?\s*$/i.test(before) ? "logo" : store ? "merch" : "image";
      add(src, kind, base, attr(tag, "alt"));
    }
    for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
      if (/(property|name)=["'](og:image|twitter:image)(:src)?["']/i.test(m[0])) add(attr(m[0], "content"), "image", base);
    }
    for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
      if (/rel=["'][^"']*(apple-touch-icon|mask-icon)/i.test(m[0])) add(attr(m[0], "href"), "icon", base);
    }
    await shopify(origin);

    // follow the site's store / shop / merch link once
    if (depth === 0) {
      const links = [];
      for (const m of html.matchAll(/<a\b[^>]*href=(["'])([^"'#]+)\1[^>]*>([\s\S]{0,200}?)<\/a>/gi)) {
        const text = m[3].replace(/<[^>]+>/g, " ");
        if (/\b(store|shop|merch)\b/i.test(m[2] + " " + text) && !/cart|account|login|policy|faq|help/i.test(m[2])) {
          try { const u = new URL(decode(m[2]), base).href; if (u !== base && !links.includes(u)) links.push(u); } catch {}
        }
      }
      for (const u of links.slice(0, 2)) { try { await scan(u, 1); } catch { /* skip */ } }
    }
  }

  await scan(pageUrl, 0);
  const rank = { logo: 0, merch: 1, image: 2, icon: 3 };
  return out.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, MAX);
}
