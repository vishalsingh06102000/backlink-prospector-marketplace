---
name: seo-content-reviver
description: >-
  Watch a site's published pages for decaying SEO performance — falling clicks, impressions, and
  rankings versus each page's own historical peak — flag the pages slipping the most, diagnose the
  likely cause, and recommend a specific fix per page, written into a Google Sheet. Use this skill
  whenever the user wants to find "content decay", pages "losing traffic / rankings / clicks", "which
  pages are slipping", "stale content to refresh", a "content refresh / decay audit", or a recurring
  "SEO health / decay report". Pulls per-page Search Console history and Ahrefs Site Explorer data
  from the Ahrefs MCP. Recommend-only — a human acts on the report. Trigger it even if the user
  doesn't say "decay" but clearly wants to find declining pages to fix.
---

# SEO Content Reviver

Catch published pages **before** their decline becomes a big loss. This skill tracks each page against
its **own historical peak**, flags the ones in sustained decline, works out the **likely cause** (lost
rankings, stale content, SERP shift, cannibalization, lost backlinks), and prescribes a **specific
fix** — delivered as a ranked, review-ready **Google Sheet**. "Self-healing" SEO: detect early,
prescribe the fix, let a human act.

This runs inside the current Claude session using the **Ahrefs MCP** (which carries the site's Google
Search Console history + Ahrefs' own ranking/traffic data) plus Claude's reasoning for diagnosis. It
**never edits content** — it only recommends.

## The pipeline (run these stages in order)

1. **Gather inputs** — ask only for what's missing (see *Inputs*).
2. **Discover pages** — find the Ahrefs project + pull the page list, apply a traffic floor. See `references/data-sources.md`.
3. **Pull history** — per page, get the metric time series (clicks/impressions/position). See `references/data-sources.md`.
4. **Detect decay** — compare each page's recent level to its peak; flag sustained drops. See `references/decay-detection.md`.
5. **Diagnose cause** — match each decayed page's signal pattern to a likely cause. See `references/diagnosis.md`.
6. **Recommend action** — turn the cause into one specific fix.
7. **Write the report** — a Google Sheet ranked by lost value; summarize. See `references/output-config.json`.

Be mindful of Ahrefs units: GSC calls are cheap/free; Site Explorer calls cost units — only run them
for *flagged* pages (stage 5), not the whole site.

## Inputs

Collect these up front; reuse anything already given, only ask for gaps. This is usually a
non-technical marketer — keep it plain.

- **Site** — the domain to audit (default `cometchat.com`).
- **Scope** — whole site, or a section like `/blog` or `/tutorials` (default: whole site).
- **Sensitivity** — *Conservative* / *Balanced* / *Sensitive* (default **Balanced**). Sets how big and
  sustained a drop must be to count as decay — see `references/decay-detection.md`. Don't make the
  user think in percentages.
- **Lookback** — how far back to measure the peak (default ~16 months, monthly).
- **Minimum traffic floor** — ignore tiny pages (default: skip pages under ~50 clicks/mo at peak).
- **How many pages** to report (default ~50, ranked by lost value).

If the user is vague, propose sensible defaults from context (CometChat → whole site, Balanced) and let
them correct you.

## Stage 2 — Discover pages

Resolve the Ahrefs **project** and pull the candidate page list. Full tool details, params, and the
known data-freshness caveat are in `references/data-sources.md`. In short: list projects
(`management-projects`), pick the one matching the site/scope, pull the per-page snapshot
(`gsc-pages`) over the most recent available window, keep pages above the traffic floor, and cap to a
sensible top-N by traffic value to bound the work.

## Stage 3 — Pull history

For each kept page, pull its **monthly metric history** (`gsc-page-history`): clicks, impressions,
average position, CTR. **Auto-detect the latest available month** — GSC data here can lag several
months, so "recent" means the latest months that actually have data, not the calendar month. Record
the page's full series for the lookback window.

## Stage 4 — Detect decay

Apply `references/decay-detection.md`: compute each page's **peak baseline** and its **recent level**,
and flag a page only when the recent level is below peak by the sensitivity threshold **and** the drop
is sustained (not a one-month blip or obvious seasonality). Rank flagged pages by **lost value** (lost
clicks/mo × the page's value) so the biggest losses surface first.

## Stage 5 — Diagnose cause

For each flagged page, match its signal pattern to the single best-fit cause using
`references/diagnosis.md`. Pull the supporting Ahrefs signal **only for flagged pages** to save units
(e.g. `site-explorer-top-pages` with a compare date for ranking/traffic change and lost-page status,
referring-domains for lost links, `gsc-keywords` for cannibalization).

## Stage 6 — Recommend action

Translate the cause into one concrete, specific action (refresh, re-optimize, consolidate, rebuild
links, fix title/meta for CTR) per `references/diagnosis.md`, plus a one-line plain-English "why".

## Stage 7 — Write the report

Read `references/output-config.json` and follow its `mode` (default `new-sheet-in-folder`): build the
report rows (one per flagged page, in the configured `columns` order, `Status` = `To review`), then
create a new Google Sheet with the Drive connector's `create_file` (`contentMimeType: "text/csv"`,
`parentId: <driveFolderId>`), titled from `sheetTitlePattern`. Rank rows by lost value.

After writing, give the user a short summary: pages scanned, how many flagged, total estimated
clicks/value lost, the top 3 pages to fix first, **the data "as of" month** (because GSC data may lag),
and the Sheet link. Remind them this is recommend-only — they decide what to act on.

## Style notes

- Lead with plain language: "this page lost ~40% of its clicks since its peak last spring, likely
  because it slipped in rankings — refresh and re-target it." The numbers live in their own columns.
- Detect, don't fix. Never edit pages or content — only recommend.
- Be honest about freshness and confidence: if GSC data lags, say "as of <month>"; if a cause is a
  guess, label it likely, not certain.
- Degrade gracefully: if a metric or a page's history is missing, note it and keep going rather than
  dropping the page silently.
