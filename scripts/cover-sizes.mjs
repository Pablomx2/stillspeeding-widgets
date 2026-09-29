// Makes small WebP copies of every picture in covers/ so the carousel can load a size that
// fits the screen instead of the full 1280px JPEG:  covers/x.jpg → covers/sizes/x-480.webp,
// covers/sizes/x-960.webp  (never upscaled). The widget falls back to the original if a copy
// is missing, so a brand-new cover still shows while this runs. Copies whose cover is gone
// are removed. Needs sharp:  npm install --no-save sharp && node scripts/cover-sizes.mjs
import { readdir, stat, rm, mkdir } from "node:fs/promises";
import sharp from "sharp";

const DIR = "covers", OUT = "covers/sizes", WIDTHS = [480, 960];

await mkdir(OUT, { recursive: true });
const covers = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const wanted = new Set();
let made = 0;
for (const f of covers) {
  const base = f.replace(/\.[^.]+$/, "");
  const src = `${DIR}/${f}`, srcTime = (await stat(src)).mtimeMs;
  for (const w of WIDTHS) {
    const out = `${OUT}/${base}-${w}.webp`;
    wanted.add(out);
    const old = await stat(out).catch(() => null);
    if (old && old.mtimeMs >= srcTime) continue;
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(out);
    made++;
    console.log(`✓ ${out}  ${Math.round((await stat(out)).size / 1024)} KB`);
  }
}
let removed = 0;
for (const f of await readdir(OUT)) {
  if (!wanted.has(`${OUT}/${f}`) && f !== ".gitkeep") { await rm(`${OUT}/${f}`); removed++; }
}
console.log(`${made} made, ${removed} removed.`);
