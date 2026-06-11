---
name: seo-pipeline
description: >-
  Carry a piece of content through the full SEO lifecycle and hand back a review-ready brief — target
  keywords (auto-detected), a SERP-derived outline, an on-page checklist, internal-link suggestions,
  and an optimized meta title + description — written into a Google Sheet. Runs full-length (topic →
  publish-ready brief) or can be entered at the tail for a quick "just tag this new page" pass that
  only detects keywords and writes the meta tags. Use this skill whenever the user wants "keyword
  research", a "content brief", an "SEO brief / outline", to "optimize this page for SEO", "what
  keywords should this page target", "on-page SEO", "write the meta title and description", "tag this
  new page", or to take a topic/draft and make it "publish-ready". Pulls keyword, SERP, and Search
  Console data from the Ahrefs MCP when connected. Recommend-only — it never publishes or writes the
  article body. Trigger it even if the user doesn't say "SEO" but clearly wants targets, a brief, or
  meta tags for a page.
---

# SEO Pipeline (End-to-End)

Take a topic (or an existing page) and hand back a **publish-ready package a human can act on**:
the keyword it should target, the secondary terms around it, a SERP-derived outline, an on-page
checklist, internal-link suggestions, and an optimized **meta title + description** — all written
into a **Google Sheet** staged for review. It can run the whole lifecycle (topic → brief) or just the
tail ("this page is new, give me its keywords + meta").

This runs entirely inside the current Claude session. It uses the **Ahrefs MCP** for keyword metrics,
live SERPs, and Search Console data, `WebFetch` to read an existing page, and the **Google Drive
connector** to write the Sheet. It is **recommend-only** — it never edits the CMS, publishes, or drafts
the article body. A human writes and ships.

## Detect the run mode (do this first)

- **Full run** — the input is a *topic, brief, or unpublished draft* with no live URL to optimize.
  Run all stages (keyword research → publish-ready brief).
- **Short run** — the input is an *existing/new page that "just needs tagging"* (a URL or pasted
  page). Run the short track: read → detect keywords → meta.
- If it's ambiguous (e.g. a URL plus "rework this"), ask once which they want. Both tracks share the
  same **meta-generation tail** (Stage 8).

## Full run — the pipeline (run these stages in order)

1. **Gather inputs & detect mode** — ask only for gaps (see *Inputs*); check units first.
2. **Keyword research** — expand the seed topic into candidates. See `references/keyword-research.md`.
3. **Cluster & pick targets** — group, pick one primary + secondary, run the cannibalization guard.
4. **Competitive SERP analysis** — read the live SERP for the primary. See `references/serp-and-onpage.md`.
5. **Outline / brief** — derive the H1/H2/H3 structure + format-to-win from the SERP.
6. **On-page optimization guidance** — placement rules + internal links. See `references/serp-and-onpage.md`.
7. **Pre-publish checks** — the review checklist.
8. **Meta title + description** — the shared tail. See `references/meta-generation.md`.
9. **Write the Sheet & summarize.** See `references/output-config.json`.

## Short run — the pipeline

- **S1. Read the page** — `WebFetch` the URL (or use pasted text / a local file); extract the current
  title, H1, headings, body, and any existing meta.
- **S2. Detect best-fit keywords** — what it already ranks for + what it *should* target; run the
  cannibalization guard. See `references/keyword-research.md`.
- **S3. SERP-feature check** — one `serp-overview` call on the detected primary, so the meta + quick
  wins account for snippets / AI Overviews.
- **S4. Meta title + description** — the shared tail (Stage 8).
- **S5. Write the trimmed Sheet & summarize** — detected keywords + meta variants + 2–3 on-page quick wins.

## Inputs

Collect these up front; reuse anything already given, only ask for gaps. This is usually a
non-technical marketer — keep it plain.

- **Topic or page** — for a full run: the topic/brief/draft. For a short run: the page URL (the skill
  fetches it) **or** pasted content. The skill auto-detects which run from this.
- **Target country** — keyword volumes and SERPs are country-specific (default **us**).
- **Research depth** — *Lean* / *Balanced* / *Deep* (default **Balanced**). Sets how much paid
  Keyword-Explorer/SERP work runs — see the unit table in `references/data-sources.md`. Don't make the
  user reason about units.
- **Brand context** — defaults to CometChat (product, competitors, internal-link hubs, meta suffix)
  from `references/brand-context.md`. Override if the page is for a different property.

If the user is vague, use these defaults (CometChat, country `us`, Balanced) and let them correct you.

## Stage 2 — Keyword research

Seed from the topic and expand into candidates, then enrich **only a shortlist** (Keyword Explorer
costs units — see `references/data-sources.md`). Tools and the depth presets are in
`references/keyword-research.md`: in short, expand with `keywords-explorer-matching-terms`
(`terms=all`, then `terms=questions` for People-Also-Ask-style queries), add
`keywords-explorer-related-terms` on Deep, then enrich the shortlist with `keywords-explorer-overview`
selecting `volume, difficulty, intents, parent_topic, traffic_potential, serp_features`. Keep
`serp_features` — it tells us which SERPs have an AI Overview / snippet, which shapes the brief.

## Stage 3 — Cluster & pick targets

Group candidates by `parent_topic` + intent, then pick **one primary** (best balance of volume,
winnability, and intent-fit) plus 3–6 secondary/supporting terms. The scoring, the **parent-topic
consolidation** rule (don't build a thin page — target the parent when it's broader), and the
**cannibalization guard** are in `references/keyword-research.md`. The guard is free and important:
check `gsc-keywords` (project `3292255`) for the chosen terms — if an existing CometChat page already
ranks for them, **flag it and recommend updating that page** (hand off to the `seo-content-reviver`
skill) instead of creating a competing page. If GSC is stale, fall back to
`site-explorer-organic-keywords` on `cometchat.com`.

## Stage 4 — Competitive SERP analysis

Read the live SERP for the primary (and 1–2 key secondary on Deep) with `serp-overview` — who ranks,
their Domain Rating / referring domains, the dominant `page_type`, and the **SERP features present**
(AI Overview, featured snippet, video, PAA). Turn competitor DR/refdomains vs CometChat's own DR into
a plain **winnability** label (*Winnable / Needs links / Hard*). Details in
`references/serp-and-onpage.md`.

## Stage 5 — Outline / brief

Derive the H1 and H2/H3 structure from the top-ranking pages and the `questions` keywords (PAA), list
the entities/subtopics to cover, set a target word count from the SERP norm, and — crucially —
**recommend the format that wins the detected SERP feature** (a snippet/FAQ block, comparison table,
video, or step list). See `references/serp-and-onpage.md`.

## Stage 6 — On-page optimization guidance

Where the primary goes (title, H1, URL slug, first 100 words, one H2), how to distribute secondary
terms, the schema type, image/alt guidance, and a soft CTA — plus **internal links**: existing
CometChat pages that should link *in* to this page, and the pages it should link *out* to, with
suggested anchors. See `references/serp-and-onpage.md`.

## Stage 7 — Pre-publish checks

A checklist the writer can tick off: primary in title/H1/slug/intro/meta; intent matches the page
type; cannibalization clear; outline covers the PAA questions; internal links resolve; schema +
image alt present; meta within limits; not duplicative of an existing page.

## Stage 8 — Meta title + description (shared tail, both runs)

Generate 2–3 **title** variants (≤60 chars, primary front-loaded, ` | CometChat` appended when it
fits) and 2–3 **description** variants (≤155 chars, primary + a secondary, active voice + soft CTA,
no clickbait, not duplicated from a sibling page), and mark a recommended pick. Full rules and worked
examples in `references/meta-generation.md`.

## Stage 9 — Write the Sheet & summarize

Read `references/output-config.json` and follow its `mode` (default `new-sheet-in-folder`): build the
brief as CSV rows in the configured `columns` order, then create a **native Google Sheet** with the
Drive connector's `create_file` (`contentMimeType: "text/csv"`, which Drive auto-converts to a Sheet —
proven by the sibling skills; do **not** use `text/html`, it stays a raw file), `parentId:
<driveFolderId>`, titled from `sheetTitlePattern`. Last resort if the connector is unavailable: write a
local `.csv`.

The brief is **one grouped sheet** with columns `Section | Item | Detail | Metrics | Status` — each
part of the brief is a block of rows under a `Section` value (`Run summary`, `Target keyword`, `SERP`,
`Winnability`, `Cannibalization`, `Outline`, `Checklist`, `Internal link`, `Meta title`, `Meta
description`, `Risks`). This keeps it filterable and gives the reviewer a `Status` column to work
(`To use`, `To do`, `Recommended`, `Action`, blank). Row layout details are in
`references/output-config.json` and `references/serp-and-onpage.md`.

After writing, give the user a short summary: run mode, the **primary target + its winnability**, any
**SERP-feature warning** (e.g. "this SERP has an AI Overview — lead with a snippet block"), any
**cannibalization flags**, the unit spend, and the Sheet link. Remind them it's recommend-only — they
write and publish.

## Style notes

- Lead with plain language and the *why*: "target *react native video call* — winnable (competitors
  are low-DR), but the SERP has an AI Overview, so open with a 40-word definition it can quote." The
  numbers live in their own table.
- Recommend, don't publish. Never edit the CMS, never write the article body — only the brief + meta.
- Be unit-aware: free Search Console first, enrich only the shortlist, let the depth preset cap the
  paid calls. Tell the user roughly what a run cost.
- Be honest about freshness and confidence: if Search Console data is stale, say so and note the
  Ahrefs fallback; if a winnability or cause call is a judgement, label it *likely*, not certain.
- Degrade gracefully: if a page won't fetch or a metric is missing, note it and keep going rather than
  stalling the whole run.
