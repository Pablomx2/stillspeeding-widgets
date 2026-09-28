// Gets the best cover picture for a YouTube, Vimeo or Instagram link and saves it in covers/.
// yt-dlp picks the highest-resolution thumbnail the site offers; if it can't get one
// (bot checks, login walls), each site has a plain fallback so a cover still turns up.
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { instagramCode, findImageUrl, download } from "./instagram.mjs";

const run = promisify(execFile);
const DIR = "covers";

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

async function findSaved(name) {
  try {
    const f = (await readdir(DIR)).find((n) => n.startsWith(name + ".") && /\.(jpe?g|png|webp)$/i.test(n));
    return f ? `${DIR}/${f}` : null;
  } catch { return null; }
}

async function viaYtDlp(url, name) {
  await run("yt-dlp", ["--skip-download", "--write-thumbnail", "--no-playlist", "--quiet", "--no-warnings",
    // keep jpg/png/webp as they are (no re-compression); anything else becomes jpg
    "--convert-thumbnails", "png>png/webp>webp/jpg",
    "-o", `${DIR}/${name}.%(ext)s`, url], { timeout: 2 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
  return findSaved(name);
}

async function fallbackUrl(info, url) {
  if (info.type === "instagram") return findImageUrl(info.id);
  if (info.type === "vimeo") {
    const d = await (await fetch("https://vimeo.com/api/oembed.json?width=3840&url=" + encodeURIComponent(url))).json();
    return d.thumbnail_url || null;
  }
  return null; // YouTube is handled in saveCover (tries sizes largest first)
}

// Returns the saved path, e.g. "covers/yt-abc123def45.webp". Reuses a cover that's already there.
export async function saveCover(url) {
  const info = coverName(url);
  if (!info) throw new Error("Only YouTube, Vimeo and Instagram links get automatic covers.");
  const saved = await findSaved(info.name);
  if (saved) return saved;
  await mkdir(DIR, { recursive: true });

  let ytErr = null;
  try {
    const p = await viaYtDlp(url, info.name);
    if (p) return p;
  } catch (e) { ytErr = e; }

  const path = `${DIR}/${info.name}.jpg`;
  if (info.type === "youtube") {
    for (const size of ["maxresdefault", "sddefault", "hqdefault"]) {
      try { await writeFile(path, await download(`https://i.ytimg.com/vi/${info.id}/${size}.jpg`)); return path; } catch {}
    }
  } else {
    const img = await fallbackUrl(info, url).catch(() => null);
    if (img) { await writeFile(path, await download(img)); return path; }
  }
  if (info.type === "instagram") throw new Error("Instagram didn't share a picture — is the post public?");
  throw ytErr || new Error("Couldn't get a cover picture for that link.");
}
