// Makes embed/videos.min.js and embed/logos.min.js — the smaller copies the Squarespace code
// blocks load. Edit the readable embed/*.js files; the Minify embeds workflow (and the Video
// covers workflow, after it inlines the video list) re-runs this.
// Needs terser:  npm install --no-save terser@5.51.2 && node scripts/minify.mjs
import { readFile, writeFile } from "node:fs/promises";
import { minify } from "terser";

for (const name of ["videos", "logos"]) {
  const src = await readFile(`embed/${name}.js`, "utf8");
  const out = await minify(src, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  const code = `/* Still Speeding ${name} widget — minified from embed/${name}.js */\n` + out.code + "\n";
  const old = await readFile(`embed/${name}.min.js`, "utf8").catch(() => "");
  if (code === old) console.log(`embed/${name}.min.js already up to date.`);
  else { await writeFile(`embed/${name}.min.js`, code); console.log(`embed/${name}.min.js: ${src.length} → ${code.length} bytes`); }
}
