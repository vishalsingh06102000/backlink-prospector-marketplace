---
name: crossword-demo-gif
description: >-
  Turn any website URL into a short screen-recording-style GIF that shows that
  website with CometChat's Crossword AI chat widget (the "CometChat Concierge"
  assistant, Aster) floating on top and running a live conversation — so it looks
  like someone recorded their screen to demo how Crossword would look embedded on
  the prospect's site. Produces two GIFs, a desktop layout and a mobile layout,
  each ~12–16 seconds, with an AI conversation auto-tailored to that website's
  business. Use this skill whenever the user wants a "Crossword demo GIF", a
  "chat widget demo/mockup", to "show the AI bot on this website", "put our
  chatbot on their site", a "personalized outreach GIF/video", "record a website
  with our widget", a "concierge demo", or to "generate a GIF of a site with the
  chat widget". Saves the GIFs locally and returns the file paths. It renders a
  synthetic/illustrative widget over a real site for sales/marketing demos — it
  does not modify or deploy anything to the target site. Trigger it even if the
  user doesn't say "Crossword" but clearly wants a demo GIF/recording of a
  website with the CometChat chat/AI widget overlaid.
---

# Crossword Demo GIF Generator

Generate a screen-recording-style **GIF** of any website with CometChat's
**Crossword** AI widget (the "CometChat Concierge" assistant, **Aster**)
overlaid and mid-conversation. Two layouts per run — **desktop** and **mobile** —
each ~12–16s, with the AI conversation **auto-tailored to the target site's
business**. Output is saved locally and the paths are returned.

This is a **demo/marketing** asset: the widget is an illustrative overlay
composited onto a real screen recording of the site. It does **not** change or
deploy anything to the target website.

## Inputs

- **URL** (required) — the website to record behind the widget.
- Optional: output directory, `--layouts` (default both), duration/quality knobs
  (see `references/engine.md`), or a hand-written conversation to skip
  auto-tailoring.

## Pipeline

### 1. Tailor the conversation to the site
`WebFetch` the URL, understand the business, and generate a `convo.json`
following **`references/conversation.md`** (Aster acts as *that company's*
concierge; 2 short exchanges landing on the site's real CTA; ~12–16s). Write it
to a temp file. Show the user the conversation lines before rendering if they
want to review/edit.

### 2. Ensure dependencies (first run only)
In `references/`, run `npm install` (installs Playwright + Chromium via its
`postinstall`). `ffmpeg` must be on `PATH`. This is a one-time setup.

### 3. Render both layouts
From `references/`:

```bash
node render.js --url "<URL>" --script "<convo.json>" --out "<outputDir>" --layouts desktop,mobile
```

`render.js` loads the live site, dismisses cookie banners, injects the widget
(isolated in a Shadow DOM), records a real-time screen recording per layout, and
encodes each to GIF (trimming to just the conversation window). Details and all
flags are in **`references/engine.md`**. Defaults come from
**`references/output-config.json`**.

### 4. Return the results
Parse the final `RESULT_JSON` line for the absolute GIF paths and sizes. Report
them to the user and surface both GIFs with **`SendUserFile`** so they render
inline. Mention the file sizes; if a GIF is too large for the user's channel,
re-run with lower `--fps` / `--desktop-width` / `--max-colors`.

## Reference files

- `references/conversation.md` — how to write the tailored `convo.json` (schema,
  length/tone rules, example).
- `references/engine.md` — `render.js` usage, flags, how capture + trim + GIF
  encoding work, tuning, limitations.
- `references/output-config.json` — output mode, default dir, filename pattern,
  encoding defaults.
- `references/render.js` — the Playwright + ffmpeg recorder.
- `references/banners.js` — cookie/consent-banner dismissal list (extend as
  needed).
- `references/widget/` — the Crossword / CometChat Concierge widget
  (`crossword-widget.js` + `.css`) and a `test.html` harness for iterating the
  widget without a live site.

## Notes & guardrails

- **Widget fidelity:** `widget/crossword-widget.css` reproduces the real
  Concierge UI (light theme, "CometChat Concierge" header, Aster, "Powered by
  Crossword" footer, "Ask anything…" input pill). If the real widget's styling
  changes, update that CSS — the `test.html` harness is the fastest way to
  iterate.
- **Keep messages short** so bubbles don't overflow (see `conversation.md`).
- **Real-time cost:** each layout takes roughly (page load + ~16s) to record.
- Some heavily bot-protected sites may block headless capture; `render.js` logs a
  note and records whatever rendered.
