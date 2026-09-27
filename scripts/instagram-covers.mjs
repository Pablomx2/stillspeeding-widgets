// Pulls a cover picture for every Instagram item in data/videos.json that doesn't have one.
// Runs in GitHub Actions after the admin app publishes. Instagram's image links expire,
// so the picture is downloaded into covers/ and the video points at that copy.
//
// Dry run for one link (nothing saved):  TEST_URL=https://www.instagram.com/reel/XXXX/ node scripts/instagram-covers.mjs
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { instagramCode, findImageUrl, download } from "./instagram.mjs";

const DATA = "data/videos.json";
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
