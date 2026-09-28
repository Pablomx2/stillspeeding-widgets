// Pulls a cover picture (via yt-dlp, highest quality available) for every YouTube, Vimeo and
// Instagram item in data/videos.json that doesn't have one. Runs in GitHub Actions after the
// admin app publishes. The picture is saved into covers/ and the video points at that copy.
//
// Dry run for one link (nothing saved):  TEST_URL=https://youtu.be/XXXX node scripts/video-covers.mjs
import { readFile, writeFile, rm, stat } from "node:fs/promises";
import { coverName, saveCover } from "./covers.mjs";

const DATA = "data/videos.json";

if (process.env.TEST_URL) {
  try {
    const path = await saveCover(process.env.TEST_URL);
    console.log(`✓ found a ${Math.round((await stat(path)).size / 1024)} KB picture: ${path} (dry run, nothing saved)`);
    await rm(path, { force: true });
    process.exit(0);
  } catch (e) {
    console.log(`✗ ${e.message}`);
    process.exit(1);
  }
}

const data = JSON.parse(await readFile(DATA, "utf8"));
let changed = 0;
for (const v of data.videos || []) {
  if (v.thumbnail || !coverName(v.video)) continue;
  try {
    v.thumbnail = await saveCover(v.video);
    changed++;
    console.log(`✓ ${v.video}: cover saved to ${v.thumbnail}`);
  } catch (e) {
    console.log(`✗ ${v.video}: ${e.message}`);
  }
}
if (changed) await writeFile(DATA, JSON.stringify(data, null, 2) + "\n");
console.log(changed ? `Added ${changed} cover(s).` : "Nothing to do.");
