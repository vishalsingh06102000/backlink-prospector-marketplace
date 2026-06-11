# Data sources, tools, and unit budget

All data comes from the **Ahrefs MCP** (server carrying Ahrefs' keyword/SERP database *and* the
site's Google Search Console history), plus `WebFetch` for reading an existing page and the **Google
Drive connector** for writing the Doc. There is no GA4.

**Always check `subscription-info-limits-and-usage` (free) before a run** and tell the user the rough
unit cost for the chosen depth. Use the `doc` tool to confirm a tool's exact input schema before its
first call in a session.

## Project / scope

| Need | Value |
|---|---|
| GSC project (whole site, for cannibalization + existing-rank) | `project_id = 3292255` ("Cometchat All Domains", subdomains) |
| Domain for Ahrefs Site Explorer fallbacks | `cometchat.com`, `mode = subdomains` |
| Default country | `us` (override per request; volumes + SERPs are country-specific) |

## The tools (by pipeline stage)

### Keyword research (Stage 2) — **costs units**
- `keywords-explorer-matching-terms` — expand a seed into ideas. Params: `keywords` (seed, comma
  list), `country`, `select`, `match_mode` (`terms`|`phrase`), `terms` (`all`|`questions`), `limit`.
  Run once with `terms=all` and once with `terms=questions` (the questions list seeds the PAA/FAQ
  outline). Pull a cheap `select` here (e.g. `keyword,volume`) and a modest `limit`.
- `keywords-explorer-related-terms` — broader "also rank for" ideas. **Deep depth only.**
- `keywords-explorer-overview` — enrich the **shortlist**. `select`:
  `keyword,volume,difficulty,intents,parent_topic,traffic_potential,serp_features`. `keywords` =
  comma list of the shortlist, `country` required.

### Existing-rank + cannibalization (Stage 3) — **free**
- `gsc-keywords` — what the site already ranks for. Params: `project_id=3292255`, `date_from`
  (recent window), optional `where` on `keyword`/`url`. Output per row: `keyword, urls_count,
  top_url, clicks, impressions, ctr, position`. `urls_count > 1` or an existing `top_url` = a
  cannibalization signal. For a **short run**, filter `where` to the page's URL to see what *that*
  page already ranks for.
- Fallback when GSC is stale (it currently lags — see freshness note): `site-explorer-organic-keywords`
  on `cometchat.com` (costs units) to see which URL ranks for a term.

### Competitive SERP (Stage 4) — **costs units**
- `serp-overview` — the live SERP for one keyword. Params: `keyword`, `country`, `select`
  (`position,url,title,domain_rating,url_rating,refdomains,page_type,traffic,value,type`),
  `top_positions` (~10). The `type` array surfaces SERP features — watch for `ai_overview`,
  `snippet`, `video`, `question`(PAA), `knowledge_panel`.
- `site-explorer-domain-rating` — CometChat's own DR for the winnability comparison (cache it; one
  call per run).
- `site-explorer-pages-by-traffic` / `gsc-keywords` — find related CometChat URLs for internal-link
  suggestions (Stage 6).

### Read an existing page (Short run S1)
- `WebFetch` the URL → current title, H1, headings, body, existing meta. If the page won't fetch, ask
  the user to paste the content or point to a local file.

### Output (Stage 9)
- Drive connector `create_file` — `contentMimeType: "text/html"`, `parentId: <driveFolderId>`,
  `title` from `docTitlePattern`. HTML converts to a formatted Google Doc. Fallbacks: `text/plain`
  markdown → Doc; last resort a local `.md`.

## Unit cost — read this before enriching

In `keywords-explorer-*`, several fields cost **10 units each, per keyword**: `volume`, `difficulty`,
`intents`, `parent_volume`, `traffic_potential`, `global_volume`. Measured (2026-06-10):
- `matching-terms` with `select=keyword,volume` ≈ **11 units/row** (volume is *not* free).
  The cheapest possible expansion is `select=keyword` alone (~1/row); add volume only if you need it
  to size the shortlist.
- `keywords-explorer-overview` with `select=keyword,volume,difficulty,intents,parent_topic,
  traffic_potential,serp_features` ≈ **43 units/row**.
- `serp-overview` ≈ **21 units/row** (so ~10 positions ≈ 210–300 units/keyword).
- `site-explorer-domain-rating` ≈ **50 units** (cache it — one call per run).

**Rule: expand wide (cheap), enrich narrow (costed).** Never enrich the full expansion — only the
shortlist. `gsc-keywords` is free; lead with it. A **Lean full run** in testing cost ~1.1k units total.

## Depth presets

| | **Lean** | **Balanced** (default) | **Deep** |
|---|---|---|---|
| Expansion calls | `matching-terms` (all) | `matching-terms` all + questions | + `related-terms` |
| Keywords enriched (`overview`) | ~15 | ~40 | ~80 |
| `serp-overview` calls | 1 (primary) | 2–3 (primary + key secondary) | ~5 (+ competitor gap) |
| Rough unit spend | ~1k | ~2.5k | ~6k+ |
| Cannibalization (`gsc-keywords`) | always (free) | always (free) | always (free) |

If units are tight (check `subscription-info-limits-and-usage`), drop a level and say so.

## Freshness caveat (important)

The site's **GSC feed via Ahrefs currently lags / is frozen around Dec 2025** (the Google account
link in Ahrefs was revoked). Two consequences:
- `gsc-keywords` still works for the cannibalization guard (existing rankings change slowly), but
  label its data "as of <latest month>" and don't treat absence of a recent rank as proof a term is
  free — cross-check with `site-explorer-organic-keywords` when it matters.
- Ahrefs Keyword Explorer / SERP / Site Explorer data is **fresh** (independent of the Google link),
  so keyword and SERP stages are current.
