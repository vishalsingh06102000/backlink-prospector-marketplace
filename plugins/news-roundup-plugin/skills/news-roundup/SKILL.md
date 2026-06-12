---
name: news-roundup
description: >-
  Monitor the chat, messaging, voice/video, and AI-developer space and hand back a review-ready news
  roundup — written into a Google Doc (the readable artifact) plus a companion Google Sheet (a
  trackable item log). One run serves three audiences at once: a developer-facing external roundup
  draft, an internal competitive-intelligence watch (what competitors shipped, funding, M&A, standards
  moves, CometChat mentions), and ready-to-post social hooks. Use this skill whenever the user wants a
  "news roundup", "industry news", "what happened this week/month in chat / messaging / video / WebRTC",
  "competitor news", "competitive intelligence", a "CI digest", "what did Sendbird / Stream / Twilio /
  PubNub ship", "this week in chat SDKs", newsletter or blog roundup fodder, or social post ideas from
  recent news. Pulls live news via web search and (optionally) competitor / AI-mention / social signals
  from the Ahrefs MCP when connected. Recommend/draft-only — it never publishes a post and never sends
  an email; a human reviews and ships. Trigger it even if the user doesn't say "roundup" but clearly
  wants a digest of recent industry or competitor news for CometChat.
---

# News Roundup Agent

Watch the chat / messaging / voice-and-video / AI-developer space and turn the past week's (or month's)
moves into **one roundup a human can act on three ways**: a developer-facing **external draft** for the
blog or newsletter, an internal **competitive-intelligence (CI) watch**, and **social hooks** the social
team can post. The roundup is written into a **Google Doc** (to read/edit) plus a companion **Google
Sheet** (to track each item with a Status column).

It runs entirely inside the current Claude session. It uses **`WebSearch` + `WebFetch`** as the news
spine, and — when connected and the depth preset allows — the **Ahrefs MCP** for competitor, AI-mention
(brand-radar), and social signals, then the **Google Drive connector** to write the Doc + Sheet. It is
**recommend/draft-only** — it never publishes, posts, or emails. A human reviews and ships.

## The pipeline (run these stages in order)

1. **Gather inputs & set scope** — window (default last 7 days), beats (default = CometChat's space),
   depth (*Lean* / *Balanced* / *Deep*, default Balanced), audiences (all three by default). Check
   `subscription-info-limits-and-usage` (free) first and tell the user the rough unit cost.
2. **Define beats & queries** — expand the beats into concrete search queries. See
   `references/beats-and-sources.md`.
3. **Collect candidates (web)** — `WebSearch` across the queries, `WebFetch` the strongest hits to
   confirm the date is inside the window and pull a 1–2 line summary; dedupe.
4. **Enrich with Ahrefs signals** (depth-gated, costs units) — competitor activity, AI-mention
   share-of-voice, and social announcements. See `references/data-sources.md`. Skipped on *Lean*.
5. **Filter, score & cluster** — keep the recent, relevant, significant items; group them into 3–6
   themes. See `references/scoring.md`.
6. **Angle for CometChat** — per top item, a one-line *why it matters to CometChat / our developers* and
   a *suggested use* (blog angle / social hook / internal-only).
7. **Assemble the Doc + Sheet.** See `references/output-config.json`.
8. **Summarize to the user** — counts, top stories, themes, unit spend, the Doc + Sheet links, and the
   recommend-only reminder.

## Inputs

Collect these up front; reuse anything already given, only ask for gaps. This is usually a marketer —
keep it plain.

- **Window** — the lookback period (default **last 7 days**). Accept "this week", "past month", or
  explicit dates. The window is country-agnostic; news is global.
- **Beats / focus** — what to cover (default = CometChat's beats from `references/brand-context.md`:
  the competitor set, chat/messaging SDKs, voice/video & WebRTC, AI & moderation, the platform SDKs,
  and industry/funding/standards). The user can narrow it ("just competitors", "only AI moderation").
- **Depth** — *Lean* (web only, fastest, ~0 units) / *Balanced* (web + light Ahrefs enrichment) /
  *Deep* (web + full Ahrefs brand-radar/social/competitor-crawl + optional Gmail press scan). Default
  **Balanced**. Sets how much paid Ahrefs work runs — see `references/data-sources.md`.
- **Brand context** — defaults to CometChat (product, competitors, beats) from
  `references/brand-context.md`. Override if the roundup is for a different property.

If the user is vague, use the defaults (CometChat beats, last 7 days, Balanced) and let them correct you.

## Stage 2 — Define beats & queries

Turn each beat into concrete, dated search queries (e.g. `"Sendbird" (launch OR release OR funding)`,
`WebRTC 2026 update`, `"AI moderation" chat API`). Cover competitor announcements, product/feature
launches, funding/M&A, and standards/platform news. The beat list, per-beat query templates, the source
allow/deny list (prefer primary sources — competitor blogs, changelogs, official docs, reputable
dev/tech press — and down-weight low-quality aggregators/SEO spam), and the recency rules are in
`references/beats-and-sources.md`.

## Stage 3 — Collect candidates (web)

Run `WebSearch` across the query set. For each promising hit, `WebFetch` the page to (a) confirm the
**publish date is inside the window** — discard older items unless they're genuinely breaking — and (b)
extract a 1–2 sentence factual summary and the primary source URL. Dedupe by URL and near-duplicate
title (the same story often appears on several outlets — keep the most primary source). `WebSearch` and
`WebFetch` are free, so search broadly here.

## Stage 4 — Enrich with Ahrefs signals (depth-gated)

On *Balanced* and *Deep* only, add signals the open web misses (these **cost units** — see
`references/data-sources.md`):
- **Competitor activity** — `site-explorer-crawled-pages` / `site-explorer-top-pages` on competitor
  domains to catch newly published pages/announcements in the window.
- **AI-mention / share-of-voice** — `brand-radar-mentions-overview` / `brand-radar-sov-history` /
  `brand-radar-cited-domains` for how CometChat and competitors are showing up in AI answers, and which
  new domains are citing them (an emerging-story signal).
- **Social announcements** — `social-media-posts` / `social-media-post-metrics` for competitor launch
  posts and the community reaction (engagement spikes validate a story).
- **Deep only, optional** — a Gmail press/newsletter scan (`search_threads`) for analyst notes and
  press releases in the inbox. Read-only; never act on mail.

Keep enrichment proportionate to depth and report the unit spend. If the Ahrefs MCP isn't connected,
skip this stage and say so — the web roundup still stands.

## Stage 5 — Filter, score & cluster

Score each candidate on **relevance** (does it hit a beat?), **significance** (a launch / funding /
M&A / standards shift outranks a minor version bump), and **recency** (inside the window, freshest
first). Drop off-topic or stale items. Cluster the survivors into **3–6 themes** (e.g. "AI moderation
heats up", "Competitor funding", "WebRTC / platform updates"). Scoring bands, dedupe rules, and worked
CometChat examples are in `references/scoring.md`.

## Stage 6 — Angle for CometChat

For each top item, write:
- **Why it matters to CometChat / our developers** — one plain sentence (e.g. "Sendbird shipping
  built-in AI moderation raises the bar — our moderation story needs a comparison page").
- **Suggested use** — `blog` (feeds an external roundup/post), `social` (a ready hook), or `internal`
  (CI-only, don't publish). Keep the brand voice: clear, technical, developer-credible, no hype.

## Stage 7 — Assemble the Doc + Sheet

Read `references/output-config.json` and follow its `mode` (`new-doc-and-sheet-in-folder`):

- **Google Doc (narrative)** — build the roundup as markdown and create a **native Google Doc** with
  the Drive connector's `create_file` (`contentMimeType: "text/plain"`, which Drive auto-converts to a
  Doc — `text/html` does **not** convert, don't use it), `parentId: <driveFolderId>`, titled from
  `docTitlePattern`. Sections in `docSectionOrder`: **TL;DR** (3–5 bullets of the biggest moves),
  **External roundup draft** (developer-facing, grouped by theme, link-rich), **Competitive / CI watch**
  (internal: who shipped what, funding, positioning, CometChat mentions/share-of-voice), **Social hooks**
  (2–5 ready-to-post lines, each with a link), **Sources & methodology** (every item with URL + date,
  what was searched, unit spend, freshness).
- **Companion Sheet (item log)** — build the items as CSV rows in the `sheetColumns` order and create a
  **native Google Sheet** with `create_file` (`contentMimeType: "text/csv"`, `parentId:
  <driveFolderId>`, titled from `sheetTitlePattern`). One row per item; `Status` defaults to `To use`.
  **CSV-escape every field** — wrap each in double quotes and double any internal quotes — because
  headlines and "why it matters" routinely contain commas.

Last resort if the connector is unavailable: write a local `.md` (the Doc) and `.csv` (the Sheet) to the
working directory and tell the user.

## Stage 8 — Summarize

Give the user a short summary: window covered, how many items made the cut, the **top 3 stories** and
the **themes**, any notable CometChat angle (e.g. "two competitors shipped AI moderation — worth a
comparison page"), the unit spend, and the **Doc + Sheet links**. Remind them it's recommend/draft-only —
nothing was published or sent.

## Style notes

- Lead with plain language and the *so-what*: "Stream raised a round and is pushing video hard — expect
  more head-to-head content; we should refresh our /vs/stream page." The metrics live in the Sheet.
- **Draft-only.** Never publish a post, never send an email, never auto-post to social — only write the
  Doc + Sheet (and a Gmail *draft* at most, if ever asked).
- Be honest about sourcing and freshness: link the **primary** source, label rumors/unconfirmed as
  such, and note when a story is outside the window but included for context. If a page won't fetch,
  note it and keep going.
- Be unit-aware: web search is free and is the spine; Ahrefs enrichment is costed and gated by depth.
  Tell the user roughly what a run cost. If units are tight, drop a depth level and say so.
- Stay on-beat and on-brand: developer-credible, no hype, no clickbait; skip generic consumer-app news
  that doesn't touch CometChat's space.
