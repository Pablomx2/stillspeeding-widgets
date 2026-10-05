// Copies data/videos.json into embed/videos.js (between the INLINE-DATA markers), so the
// carousel can draw from the script alone. Google's renderer often skips the separate
// videos.json download, which left "Recent work" empty in its copy of the page.
// Run by the Video covers workflow after every publish:  node scripts/inline-videos.mjs
import { readFile, writeFile } from "node:fs/promises";

const FILE = "embed/videos.js";
const data = JSON.parse(await readFile("data/videos.json", "utf8"));
const src = await readFile(FILE, "utf8");
const re = /\/\*INLINE-DATA\*\/[\s\S]*?\/\*END-INLINE-DATA\*\//;
if (!re.test(src)) throw new Error("INLINE-DATA markers not found in " + FILE);
const out = src.replace(re, () => "/*INLINE-DATA*/" + JSON.stringify(data) + "/*END-INLINE-DATA*/");
if (out === src) console.log("Inline video list already up to date.");
else { await writeFile(FILE, out); console.log("Inlined " + (data.videos || []).length + " videos into " + FILE); }
