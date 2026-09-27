# Still Speeding widgets

Video carousel + clients logo banner for stillspeeding.net (Squarespace).

- **Admin app:** https://pablomx2.github.io/stillspeeding-widgets/ — edit videos & logos, preview, press **Publish**.
- **Content:** `data/videos.json`, `data/logos.json`, uploaded images in `logos/`.
- **Embeds:** `embed/videos.js`, `embed/logos.js` (loaded by the Squarespace code blocks).

## Squarespace code blocks (paste once)

```html
<div class="ss-videos"></div>
<script src="https://pablomx2.github.io/stillspeeding-widgets/embed/videos.js"></script>
```

```html
<div class="ss-logos" data-theme="light"></div>
<script src="https://pablomx2.github.io/stillspeeding-widgets/embed/logos.js"></script>
```

Per-block options: `data-theme="dark"` (black sections), `data-style="mono"` (logos only),
`data-heading="Select clients"` (logos only), `data-per-view="2"` (videos only).

Changes published from the admin go live about a minute later (GitHub Pages rebuild).
