# Data sources

All data comes from the **Ahrefs MCP** (server id `7df801b8-…`), which carries the site's Google
Search Console history *and* Ahrefs' own ranking/traffic data. There is **no Google Analytics (GA4)**
and **no Ahrefs Web Analytics data** connected (the Web Analytics project returns empty), so there is
no live "users/sessions" signal — and that's fine: **search clicks are the better decay signal anyway.**

## Project discovery

Call `management-projects` (free). Pick the project whose `url`/`mode` matches the requested scope:

| Scope | Project | project_id | mode |
|---|---|---|---|
| Whole site (default) | Cometchat All Domains | `3292255` | subdomains |
| Blog only | Cometchat Blog | `3702971` | prefix |
| Tutorials only | Cometchat Tutorials | `3702974` | prefix |

(Re-check `management-projects` each run in case projects change. GSC tools require a `project_id`.)

## The tools (in pipeline order)

### Stage 2 — discover pages: `gsc-pages` (cheap)
Per-page snapshot over a date window: `page, clicks, impressions, ctr, position, keywords_count,
top_keyword, traffic_value`. Use `where` to filter (e.g. `clicks gt <floor>`) and `limit` to cap.
`traffic_value` (USD) is what we use to **prioritize** flagged pages. Requires `date_from` (+ optional
`date_to`). In testing this returned **0 units**.

### Stage 3 — per-page history: `gsc-page-history` ⭐ (cheap — the backbone)
Input: `pages` (comma-separated URLs), `project_id`, `date_from`, `history_grouping: monthly`.
Returns, per page per month: `clicks, impressions, ctr, position`. This is the time series we compute
peak + recent + decay from. Returned **0 units** in testing. Batch multiple URLs per call via `pages`.

> **⚠️ Data-freshness caveat (important).** GSC data here lags. In testing, monthly data ran cleanly
> from 2024 through **December 2025**, but the current calendar month returned "No GSC data available".
> So **always auto-detect the latest month that actually has data** and treat that (and the 1–2 months
> before it) as "recent" — never assume the current month. Report the data "as of <latest month>".

### Stage 5 — current cross-check + diagnosis signals: `site-explorer-top-pages` (costs units)
Ahrefs' own, up-to-date crawl. Use **only for flagged pages**. Required: `select`, `target`, `date`;
add `date_compared` for change-over-time. Useful `select` fields: `url, sum_traffic, value,
traffic_diff_percent, top_keyword, top_keyword_best_position, top_keyword_best_position_diff,
referring_domains, status` (`status` = `right` means the page *dropped out* of ranking — a strong decay
signal). `mode=subdomains` for a domain. Cost: ~10 units per page-row for traffic/value, ~5 for
referring_domains — so query a handful of flagged pages, not the whole site.

### Diagnosis support (flagged pages only)
- **Cannibalization:** `gsc-keywords` (or `site-explorer-organic-keywords`) — does one query map to 2+
  of the site's URLs?
- **Lost backlinks:** `site-explorer-broken-backlinks` / `site-explorer-refdomains-history` /
  `referring_domains` change — did the page lose links around when it started slipping?
- **Site-wide context:** `gsc-performance-history` (site-level clicks/impressions trend) to tell a
  page-specific decline from a whole-site one.

## Units budget

GSC tools (`gsc-pages`, `gsc-page-history`, `gsc-performance-history`) were **free** in testing — use
them freely for discovery + history across all candidate pages. **Site Explorer costs units** — reserve
it for flagged pages in stage 5. Check `subscription-info-limits-and-usage` (free) before a big run.

## GA4 — future upgrade (not connected today)

When a GA4 MCP is connected, it adds real **users/sessions/engagement and conversions/revenue per
page** — which sharpens **prioritization** (fix the decayed pages that lose the most *business value*,
not just clicks). It is **not** needed to *detect* decay. To slot it in later: add the GA4 tool calls
to stage 3 (users history) and stage 4 priority (revenue), and record the GA4 tool names/params here.
Until then, prioritize by GSC `traffic_value`.
