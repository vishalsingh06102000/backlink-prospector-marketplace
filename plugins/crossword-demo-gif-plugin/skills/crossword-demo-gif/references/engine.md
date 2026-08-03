# Engine: `render.js`

Records a real screen recording of a live website with the Crossword /
CometChat Concierge widget injected on top, then encodes it to GIF. One GIF per
layout.

## Requirements

- **Node** (v18+) and **Playwright** with Chromium. `npm install` in this
  `references/` folder installs both (a `postinstall` runs
  `playwright install chromium`).
- **ffmpeg** on `PATH` (used for the webm → GIF palette conversion).

## Command

```bash
node render.js \
  --url https://example.com \
  --script /path/to/convo.json \
  --out ./crossword-demos \
  [--layouts desktop,mobile] \
  [--fps 13] [--desktop-width 1000] [--max-colors 160] \
  [--keep-webm] [--mp4]
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--url` | (required) | Website to record behind the widget |
| `--script` | (required) | Path to the tailored `convo.json` |
| `--out` | `./output` | Output directory (created if missing) |
| `--layouts` | `desktop,mobile` | Comma list: `desktop`, `mobile`, or both |
| `--fps` | `13` | GIF frame rate (lower = smaller file) |
| `--desktop-width` | `1000` | Desktop GIF width in px (height auto) |
| `--max-colors` | `160` | GIF palette size (lower = smaller file) |
| `--keep-webm` | off | Also keep the raw `.webm` recording |
| `--mp4` | off | Also emit an `.mp4` alongside the GIF |

Output files: `<slug>-<layout>.gif` in `--out`, where `<slug>` is the hostname
(`www.` stripped). The last line of stdout is `RESULT_JSON [...]` with absolute
paths + byte sizes for programmatic use.

## How it works

1. Launches headless Chromium. For each layout it opens a context:
   - **desktop** — 1280×800 viewport, records at 1280×800.
   - **mobile** — Playwright's `iPhone 13` device descriptor (390×844).
2. Navigates to the URL (`networkidle`, 30s cap, falls back to `load`).
3. Dismisses cookie/consent banners — across **all frames** and **piercing open
   shadow DOMs** — in two passes (some sites inject the banner late).
4. Injects `widget/crossword-widget.js` via `page.evaluate` (bypasses CSP; the
   context is also created with `bypassCSP: true`) and calls
   `CrosswordWidget.mount(convo, css)`. The widget lives in a Shadow DOM so the
   host page's styles can't affect it.
5. Waits `window.__CC_TOTAL_MS__` (the widget's self-estimated runtime) + buffer,
   then closes the context to flush the `.webm`.
6. **Trim + encode:** Playwright records the *entire* page lifetime (page-load
   time included), so we keep only the **last `totalMs`** of the recording via
   ffmpeg `-sseof` — the scripted conversation is always the tail, regardless of
   how long the site took to load. Two-pass palette (`palettegen` +
   `paletteuse`, Bayer dither) produces the GIF.

## Tuning file size

Typical desktop GIF ≈ 8–12 MB, mobile ≈ 2–4 MB at defaults. To shrink:
lower `--fps` (e.g. 10), lower `--desktop-width` (e.g. 900), or lower
`--max-colors` (e.g. 128). To sharpen mobile, nothing to do — it records at the
device's CSS resolution.

## Known limitations

- Sites with aggressive bot-detection may block headless Chromium or serve a
  challenge; the script records whatever rendered and logs a note.
- A few exotic consent banners (cross-origin iframes, closed shadow roots) can
  survive dismissal. Add their selector to `banners.js` `SELECTORS` if needed.
- The recording is real-time, so total runtime ≈ (load time + ~16s) per layout.
