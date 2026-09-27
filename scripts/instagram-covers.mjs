// Pulls a cover picture for every Instagram item in data/videos.json that doesn't have one.
// Runs in GitHub Actions after the admin app publishes. Instagram's image links expire,
// so the picture is downloaded into covers/ and the video points at that copy.
//
// Dry run for one link (nothing saved):  TEST_URL=https://www.instagram.com/reel/XXXX/ node scripts/instagram-covers.mjs
import { readFile, writeFile, mkdir, access } from "node:fs/promises";

const DATA = "data/videos.json";
const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const CRAWLER_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

function instagramCode(url) {
  const m = String(url || "").match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}
const unescape = (s) => s.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/");

async function findImageUrl(code) {
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

async function download(url) {
  const r = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
  const type = r.headers.get("content-type") || "";
  if (!r.ok || !type.startsWith("image/")) throw new Error(`got ${r.status} ${type}`);
  return Buffer.from(await r.arrayBuffer());
}

async function exists(p) { try { await access(p); return true; } catch { return false; } }

if (process.env.TEST_URL) {
  const code = instagramCode(process.env.TEST_URL);
  if (!code) { console.log("Not an Instagram post/reel link."); process.exit(1); }
  const url = await findImageUrl(code);
  if (!url) { console.log(`✗ Couldn't get a picture for ${code}`); process.exit(1); }
  const buf = await download(url);
  console.log(`✓ ${code}: found a ${Math.round(buf.length / 1024)} KB picture (dry run, nothing saved)`);
  process.exit(0);
}

const data = JSON.parse(await readFile(DATA, "utf8"));
let changed = 0;
for (const v of data.videos || []) {
  const code = instagramCode(v.video);
  if (!code || v.thumbnail) continue;
  const path = `covers/ig-${code}.jpg`;
  try {
    if (!(await exists(path))) {
      const url = await findImageUrl(code);
      if (!url) { console.log(`✗ ${code}: Instagram didn't share a picture (is the post public?)`); continue; }
      await mkdir("covers", { recursive: true });
      await writeFile(path, await download(url));
    }
    v.thumbnail = path;
    changed++;
    console.log(`✓ ${code}: cover saved to ${path}`);
  } catch (e) {
    console.log(`✗ ${code}: ${e.message}`);
  }
}
if (changed) await writeFile(DATA, JSON.stringify(data, null, 2) + "\n");
console.log(changed ? `Added ${changed} cover(s).` : "Nothing to do.");
