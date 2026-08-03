#!/usr/bin/env node
/*
 * render.js — record a screen-recording-style GIF of a live website with the
 * CometChat Concierge (Crossword) AI widget overlaid, mid-conversation.
 *
 * Produces one GIF per layout (desktop + mobile).
 *
 * Usage:
 *   node render.js --url https://example.com \
 *                  --script convo.json \
 *                  --out ./output \
 *                  [--layouts desktop,mobile] \
 *                  [--fps 14] [--desktop-width 1100] [--keep-webm] [--mp4]
 *
 * convo.json shape — see references/conversation.md.
 *
 * Requires: playwright (chromium installed), ffmpeg on PATH.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { chromium, devices } = require("playwright");
const { buildDismissFn } = require("./banners");

// ---------- args ----------
function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const key = k.slice(2);
      const next = argv[i + 1];
      if (next == null || next.startsWith("--")) {
        a[key] = true;
      } else {
        a[key] = next;
        i++;
      }
    }
  }
  return a;
}

const args = parseArgs(process.argv);

if (!args.url || !args.script) {
  console.error(
    "Usage: node render.js --url <URL> --script <convo.json> [--out ./output] [--layouts desktop,mobile] [--fps 14] [--desktop-width 1100] [--keep-webm] [--mp4]"
  );
  process.exit(1);
}

const URL = args.url;
const OUT_DIR = path.resolve(args.out || "./output");
const FPS = parseInt(args.fps || "13", 10);
const DESKTOP_WIDTH = parseInt(args["desktop-width"] || "1000", 10);
const MAX_COLORS = parseInt(args["max-colors"] || "160", 10);
const LAYOUTS = String(args.layouts || "desktop,mobile")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const KEEP_WEBM = !!args["keep-webm"];
const MAKE_MP4 = !!args.mp4;

const WIDGET_DIR = path.join(__dirname, "widget");
const WIDGET_JS = fs.readFileSync(path.join(WIDGET_DIR, "crossword-widget.js"), "utf8");
const WIDGET_CSS = fs.readFileSync(path.join(WIDGET_DIR, "crossword-widget.css"), "utf8");
const SCRIPT = JSON.parse(fs.readFileSync(path.resolve(args.script), "utf8"));
const DISMISS_FN = buildDismissFn();

fs.mkdirSync(OUT_DIR, { recursive: true });

function slugFromUrl(u) {
  try {
    return new global.URL(u).hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-");
  } catch (e) {
    return "site";
  }
}
const SLUG = slugFromUrl(URL);

// ---------- layout definitions ----------
const LAYOUT_DEFS = {
  desktop: {
    contextOpts: {
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    },
    recordSize: { width: 1280, height: 800 },
    gifWidth: DESKTOP_WIDTH,
  },
  mobile: {
    contextOpts: {
      ...devices["iPhone 13"],
      // Override the descriptor's chrome-reduced viewport (≈390×664) with the
      // full logical phone screen so the recorded video height matches the
      // viewport exactly — otherwise the video gets a gray strip at the bottom.
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
    },
    recordSize: { width: 390, height: 844 },
    gifWidth: 390,
  },
};

function ff(argsArr) {
  execFileSync("ffmpeg", argsArr, { stdio: ["ignore", "ignore", "inherit"] });
}

async function recordLayout(browser, name) {
  const def = LAYOUT_DEFS[name];
  if (!def) throw new Error("Unknown layout: " + name);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `cc-${name}-`));

  const context = await browser.newContext({
    ...def.contextOpts,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    reducedMotion: "no-preference",
    recordVideo: { dir: tmpDir, size: def.recordSize },
  });

  const page = await context.newPage();

  console.log(`[${name}] loading ${URL} ...`);
  try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.log(`[${name}] networkidle timed out — continuing with loaded content`);
    try {
      await page.waitForLoadState("load", { timeout: 8000 });
    } catch (e2) {
      /* ignore */
    }
  }

  // Dismiss cookie/consent banners across every frame (many live in iframes).
  async function dismissAllFrames() {
    let hits = 0;
    for (const f of page.frames()) {
      try {
        hits += (await f.evaluate(DISMISS_FN)) || 0;
      } catch (e) {
        /* cross-origin or detached frame — ignore */
      }
    }
    return hits;
  }

  // give lazy content a moment, then dismiss; some sites inject the banner
  // late, so run a couple of passes.
  await page.waitForTimeout(1200);
  let dismissed = await dismissAllFrames();
  await page.waitForTimeout(700);
  dismissed += await dismissAllFrames();
  if (dismissed) console.log(`[${name}] dismissed ${dismissed} banner element(s)`);
  await page.waitForTimeout(400);

  // inject the widget (page.evaluate bypasses CSP) and start playback
  await page.evaluate(WIDGET_JS);
  const totalMs = await page.evaluate(
    ({ script, css }) => {
      window.CrosswordWidget.mount(script, css);
      return window.__CC_TOTAL_MS__;
    },
    { script: SCRIPT, css: WIDGET_CSS }
  );
  console.log(`[${name}] recording ~${Math.round(totalMs / 1000)}s of conversation ...`);

  await page.waitForTimeout(totalMs + 600);

  // flush the video
  const video = page.video();
  await context.close();
  const webmPath = await video.path();

  // ---------- webm -> gif (two-pass palette) ----------
  // Playwright records the whole page lifetime (load time included), so keep
  // only the tail — the scripted conversation is always the last totalMs of
  // the recording, regardless of how long the site took to load.
  const trimSec = ((totalMs + 500) / 1000).toFixed(2);
  const outGif = path.join(OUT_DIR, `${SLUG}-${name}.gif`);
  const palette = path.join(tmpDir, "palette.png");
  const scaleExpr = `fps=${FPS},scale=${def.gifWidth}:-1:flags=lanczos`;

  console.log(`[${name}] encoding GIF (last ${trimSec}s) ...`);
  ff([
    "-y",
    "-sseof",
    `-${trimSec}`,
    "-i",
    webmPath,
    "-vf",
    `${scaleExpr},palettegen=max_colors=${MAX_COLORS}:stats_mode=diff`,
    palette,
  ]);
  ff([
    "-y",
    "-sseof",
    `-${trimSec}`,
    "-i",
    webmPath,
    "-i",
    palette,
    "-lavfi",
    `${scaleExpr}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    outGif,
  ]);

  let outMp4 = null;
  if (MAKE_MP4) {
    outMp4 = path.join(OUT_DIR, `${SLUG}-${name}.mp4`);
    ff([
      "-y",
      "-sseof",
      `-${trimSec}`,
      "-i",
      webmPath,
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      outMp4,
    ]);
  }

  const savedWebm = KEEP_WEBM
    ? path.join(OUT_DIR, `${SLUG}-${name}.webm`)
    : null;
  if (savedWebm) fs.copyFileSync(webmPath, savedWebm);

  // cleanup tmp
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {
    /* ignore */
  }

  const bytes = fs.statSync(outGif).size;
  return { layout: name, gif: outGif, mp4: outMp4, webm: savedWebm, bytes };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const name of LAYOUTS) {
      results.push(await recordLayout(browser, name));
    }
  } finally {
    await browser.close();
  }

  console.log("\n=== Done ===");
  for (const r of results) {
    console.log(
      `${r.layout}: ${r.gif} (${(r.bytes / 1024 / 1024).toFixed(2)} MB)` +
        (r.mp4 ? `  |  ${r.mp4}` : "")
    );
  }
  // machine-readable summary on the last line
  console.log("RESULT_JSON " + JSON.stringify(results));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
