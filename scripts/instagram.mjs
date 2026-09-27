// Shared helpers for getting a public Instagram post's picture from a server
// (browsers aren't allowed to read it directly).
const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const CRAWLER_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

export function instagramCode(url) {
  const m = String(url || "").match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}
const unescape = (s) => s.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/");

export async function findImageUrl(code) {
  const attempts = [
    // 1. full-size picture via Instagram's media redirect
    async () => {
      const r = await fetch(`https://www.instagram.com/p/${code}/media/?size=l`, { redirect: "manual", headers: { "User-Agent": BROWSER_UA } });
      const loc = r.headers.get("location");
      return loc && /cdninstagram|fbcdn/.test(loc) ? loc : null;
    },
    // 2. the share picture Instagram gives to link previews
    async () => {
      const html = await (await fetch(`https://www.instagram.com/p/${code}/`, { headers: { "User-Agent": CRAWLER_UA } })).text();
      const m = html.match(/<meta property="og:image" content="([^"]+)"/);
      return m ? unescape(m[1]) : null;
    },
    // 3. the picture inside Instagram's own embed
    async () => {
      const html = await (await fetch(`https://www.instagram.com/p/${code}/embed/captioned/`, { headers: { "User-Agent": BROWSER_UA } })).text();
      const m = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/) || html.match(/"display_url":"([^"]+)"/);
      return m ? unescape(m[1]) : null;
    }
  ];
  for (const attempt of attempts) {
    try { const url = await attempt(); if (url) return url; } catch { /* try the next way */ }
  }
  return null;
}

export async function download(url) {
  const r = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
  const type = r.headers.get("content-type") || "";
  if (!r.ok || !type.startsWith("image/")) throw new Error(`got ${r.status} ${type}`);
  return Buffer.from(await r.arrayBuffer());
}

