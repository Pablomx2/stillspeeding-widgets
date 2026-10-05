# Still Speeding widgets

Video carousel + clients logo banner for stillspeeding.net (Squarespace).

- **Admin app:** https://pablomx2.github.io/stillspeeding-widgets/ — edit videos & logos, preview, press **Publish**.
- **Content:** `data/videos.json`, `data/logos.json`, uploaded images in `logos/`.
- **Embeds:** `embed/videos.js`, `embed/logos.js` — edit these. The Squarespace code blocks load the
  minified copies `embed/*.min.js`, rebuilt automatically by the Minify embeds workflow (`scripts/minify.mjs`).

## Squarespace code blocks (paste once)

```html
<div class="ss-videos"></div>
<script src="https://pablomx2.github.io/stillspeeding-widgets/embed/videos.min.js" defer></script>
```

```html
<div class="ss-logos" data-theme="light"></div>
<script src="https://pablomx2.github.io/stillspeeding-widgets/embed/logos.min.js" defer></script>
```

Per-block options: `data-theme="dark"` (black sections), `data-style="mono"` (logos only),
`data-heading="Select clients"` (logos only), `data-per-view="2"` (videos only).

Changes published from the admin go live about a minute later (GitHub Pages rebuild).

Covers get small WebP copies in `covers/sizes/` automatically (Cover sizes workflow, `scripts/cover-sizes.mjs`);
the carousel picks the size that fits the screen. Logos are saved already cropped (`"t": 1` in `data/logos.json`),
so the banner shows them without processing them in the visitor's browser.
