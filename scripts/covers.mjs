// Gets the biggest cover picture for a YouTube, Vimeo or Instagram link and saves it to disk.
// The sites' own full-size pictures are tried first (fast, and the same sizes yt-dlp picks:
// YouTube maxresdefault 1280×720, Vimeo 1920px, Instagram full size). yt-dlp is the last resort —
// from GitHub's servers YouTube and Vimeo ask it to sign in, and Instagram needs a login.
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { instagramCode, findImageUrl, download } from "./instagram.mjs";

const run = promisify(execFile);

// "yt-<id>", "vimeo-<id>" or "ig-<code>" — the file name (without extension) for a link's cover
export function coverName(url) {
  url = String(url || "");
  let m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  if (m) return { type: "youtube", id: m[1], name: `yt-${m[1]}` };
  m = url.match(/vimeo\.com\/(?:[^?#]*?\/)?(\d{5,})/);
  if (m) return { type: "vimeo", id: m[1], name: `vimeo-${m[1]}` };
  const code = instagramCode(url);
  if (code) return { type: "instagram", id: code, name: `ig-${code}` };
  return null;
}

async function findSaved(dir, name) {
  try {
    const f = (await readdir(dir)).find((n) => n.startsWith(name + ".") && /\.(jpe?g|png|webp)$/i.test(n));
    return f ? `${dir}/${f}` : null;
  } catch { return null; }
}

// the site's own picture, largest size first
async function direct(info, url) {
  if (info.type === "youtube") {
    for (const size of ["maxresdefault", "sddefault", "hqdefault"]) {
      try { return await download(`https://i.ytimg.com/vi/${info.id}/${size}.jpg`); } catch {}
    }
    return null;
  }
  let img = null;
  if (info.type === "vimeo") {
    const d = await (await fetch("https://vimeo.com/api/oembed.json?url=" + encodeURIComponent(url))).json();
    if (d.thumbnail_url) {
      try { return await download(d.thumbnail_url.replace(/_\d+(x\d+)?(?=\?|$)/, "_1920")); } catch {}
      img = d.thumbnail_url;
    }
  } else {
    img = await findImageUrl(info.id);
  }
  return img ? download(img) : null;
}

async function viaYtDlp(url, dir, name) {
  await run("yt-dlp", ["--skip-download", "--write-thumbnail", "--no-playlist", "--quiet", "--no-warnings",
    // keep jpg/png/webp as they are (no re-compression); anything else becomes jpg
    "--convert-thumbnails", "png>png/webp>webp/jpg",
    "-o", `${dir}/${name}.%(ext)s`, url], { timeout: 2 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
  return findSaved(dir, name);
}

// Returns the saved path, e.g. "covers/yt-abc123def45.jpg". Reuses a cover that's already there.
export async function saveCover(url, dir = "covers") {
  const info = coverName(url);
  if (!info) throw new Error("Only YouTube, Vimeo and Instagram links get automatic covers.");
  const saved = await findSaved(dir, info.name);
  if (saved) return saved;
  await mkdir(dir, { recursive: true });

  const buf = await direct(info, url).catch(() => null);
  if (buf) {
    const path = `${dir}/${info.name}.jpg`;
    await writeFile(path, buf);
    return path;
  }
  try {
    const p = await viaYtDlp(url, dir, info.name);
    if (p) { console.log(`  ${info.name}: got the cover with yt-dlp`); return p; }
  } catch (e) {
    console.log(`  ${info.name}: yt-dlp couldn't get it either (${String(e.stderr || e.message).trim().split("\n").pop().slice(0, 200)})`);
  }
  if (info.type === "instagram") throw new Error("Instagram didn't share a picture — is the post public?");
  throw new Error("Couldn't get a cover picture for that link.");
}
