// Copies data/logos.json, plus every SVG logo it shows, into embed/logos.js (between the
// INLINE-DATA and INLINE-SVG markers), so the banner draws from the script alone: no separate
// list download for Google's renderer to skip, and ~20 fewer image requests on phones.
// WebP/PNG logos stay as files (inlining them would make them a third bigger).
// Run by the Inline logos workflow after every publish:  node scripts/inline-logos.mjs
import { readFile, writeFile } from "node:fs/promises";

const FILE = "embed/logos.js";
const data = JSON.parse(await readFile("data/logos.json", "utf8"));

// compact "data:" form of an SVG — far smaller than base64, and it still compresses well
function svgUri(svg) {
  svg = svg.replace(/<\?xml[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<!--[\s\S]*?-->/gi, "").replace(/\s+/g, " ").trim();
  if (!svg.includes("'")) svg = svg.replace(/"/g, "'");
  return "data:image/svg+xml," + svg.replace(/[%#<>"\r\n]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
}

const svgs = {};
for (const logo of data.logos || []) {
  if (!logo || logo.hidden || logo.preview || !/^logos\/[^\/]+\.svg$/i.test(logo.src || "")) continue;
  // a logo that isn't uploaded yet simply loads from its file
  const svg = await readFile(logo.src, "utf8").catch(() => null);
  if (svg && /<svg[\s>]/i.test(svg)) svgs[logo.src] = svgUri(svg);
}

let src = await readFile(FILE, "utf8");
const old = src;
for (const [mark, value] of [["INLINE-DATA", data], ["INLINE-SVG", svgs]]) {
  const re = new RegExp(`/\\*${mark}\\*/[\\s\\S]*?/\\*END-${mark}\\*/`);
  if (!re.test(src)) throw new Error(mark + " markers not found in " + FILE);
  src = src.replace(re, () => `/*${mark}*/` + JSON.stringify(value) + `/*END-${mark}*/`);
}
if (src === old) console.log("Inline logo list already up to date.");
else { await writeFile(FILE, src); console.log(`Inlined ${(data.logos || []).length} logos (${Object.keys(svgs).length} SVGs) into ${FILE}`); }
