// Handles requests the admin app drops into requests/*.json (runs in GitHub Actions):
//   { rid, kind: "cover", url }     → gets the link's biggest cover picture (see covers.mjs); the app
//                                     reads it from media-cache and uploads it with the next Publish
//                                     ("ig-cover" is the older name for the same thing)
//   { rid, kind: "video", url }     → downloads a copy of the video so the app's frame picker can scrub it
// Results go to the "media-cache" branch (status/<rid>.json, media/<rid>.mp4, covers/…), which is
// rebuilt on every run and only keeps the last couple of hours — so big files don't pile up.
import { readdir, readFile, writeFile, mkdir, rm, copyFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { saveCover } from "./covers.mjs";

const run = promisify(execFile);
const OUT = "out", OLD = "out-old", KEEP_MS = 2 * 60 * 60 * 1000;
const ALLOWED = /^https:\/\/([\w-]+\.)*(youtube\.com|youtu\.be|vimeo\.com|instagram\.com)\//i;
const FORMAT = [
  "bv*[ext=mp4][vcodec^=avc1][height<=1080]",   // video-only H.264 — plays everywhere, no audio needed
  "b[ext=mp4][vcodec^=avc1][height<=1080]",
  "bv*[ext=mp4][height<=1080]",
  "b[ext=mp4]",
  "b"
].join("/");

const exists = (p) => access(p).then(() => true, () => false);
const shortError = (e) => String((e && (e.stderr || e.message)) || e).split("\n").map((l) => l.trim()).filter(Boolean)
  .filter((l) => !/^\[debug\]|^WARNING/.test(l)).slice(-2).join(" ").slice(0, 300);

await mkdir(`${OUT}/status`, { recursive: true });
await mkdir(`${OUT}/media`, { recursive: true });
await mkdir(`${OUT}/covers`, { recursive: true });

// keep recent results from the previous cache
if (await exists(`${OLD}/status`)) {
  for (const f of await readdir(`${OLD}/status`)) {
    try {
      const st = JSON.parse(await readFile(`${OLD}/status/${f}`, "utf8"));
      if (Date.now() - (st.at || 0) > KEEP_MS) continue;
      await copyFile(`${OLD}/status/${f}`, `${OUT}/status/${f}`);
      if (st.file && (await exists(`${OLD}/${st.file}`))) await copyFile(`${OLD}/${st.file}`, `${OUT}/${st.file}`);
    } catch { /* skip broken entries */ }
  }
}

const files = (await exists("requests")) ? (await readdir("requests")).filter((f) => f.endsWith(".json")) : [];
for (const f of files) {
  let req = {};
  try { req = JSON.parse(await readFile(`requests/${f}`, "utf8")); } catch {}
  const rid = String(req.rid || f.replace(/\.json$/, ""));
  await rm(`requests/${f}`, { force: true });
  if (!/^[\w-]{6,64}$/.test(rid)) { console.log(`skip ${f}: bad id`); continue; }
  const status = { rid, kind: req.kind, url: req.url, ok: false, at: Date.now() };
  try {
    if (!ALLOWED.test(String(req.url || ""))) throw new Error("Only YouTube, Vimeo and Instagram links are supported.");
    if (req.kind === "cover" || req.kind === "ig-cover") {
      const file = (await saveCover(req.url, `${OUT}/covers`)).slice(OUT.length + 1);
      Object.assign(status, { ok: true, file, path: file });
    } else if (req.kind === "video") {
      await run("yt-dlp", ["-f", FORMAT, "--no-playlist", "--max-filesize", "90M", "--no-part", "--quiet", "--no-warnings",
        "-o", `${OUT}/media/${rid}.%(ext)s`, req.url], { timeout: 5 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
      const made = (await readdir(`${OUT}/media`)).find((n) => n.startsWith(rid + "."));
      if (!made) throw new Error("The download didn't produce a video file.");
      Object.assign(status, { ok: true, file: `media/${made}` });
    } else {
      throw new Error(`Unknown request kind "${req.kind}".`);
    }
    console.log(`✓ ${rid} ${req.kind}`);
  } catch (e) {
    status.error = shortError(e);
    console.log(`✗ ${rid} ${req.kind}: ${status.error}`);
  }
  await writeFile(`${OUT}/status/${rid}.json`, JSON.stringify(status, null, 2) + "\n");
}
console.log(`Handled ${files.length} request(s).`);
