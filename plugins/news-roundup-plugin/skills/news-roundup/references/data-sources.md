# Data sources, tools & unit budget

The news spine is **free web search** (`WebSearch` + `WebFetch`). Optional enrichment comes from the
**Ahrefs MCP** (server `7df801b8-…`, which also carries the site's GSC history) and the **Google Drive
connector** for writing the Doc + Sheet. A **Gmail connector** is an optional Deep-only press scan.

**Always check `subscription-info-limits-and-usage` (free) before a run** and tell the user the rough
unit cost for the chosen depth. Use the Ahrefs `doc` tool to confirm a tool's exact input schema before
its first call in a session.

## The tools (by pipeline stage)

### Stage 3 — collect candidates (FREE)
- **`WebSearch`** — the primary discovery tool. Run the per-beat queries from `beats-and-sources.md`.
- **`WebFetch`** — open a hit to confirm its **publish date** and extract a 1–2 line summary + the
  primary-source URL. Both are free — search and fetch broadly.

### Stage 4 — enrichment (COSTS UNITS — Balanced/Deep only)
- **Competitor activity** — `site-explorer-crawled-pages` / `site-explorer-top-pages` on a competitor
  domain (`mode=subdomains`) to catch newly published pages in the window. Site Explorer costs units
  (~5–10 units/row) — query a couple of competitors, not all ten.
- **AI-mention / share-of-voice** — `brand-radar-mentions-overview`, `brand-radar-sov-history`,
  `brand-radar-cited-domains` for how CometChat/competitors appear in AI answers and which new domains
  cite them. Use the Ahrefs `doc` tool for exact params; these are costed.
- **Social announcements** — `social-media-posts`, `social-media-post-metrics`, `social-media-channels`
  for competitor launch posts and engagement (a spike validates a story).
- **Deep only, optional** — Gmail `search_threads` / `get_thread` (server `9a568968-…`) to scan inbox
  press releases / analyst notes / newsletters. **Read-only** — never send or modify mail.

### Output (Stage 7)
- Google Drive connector (server `54e21008-…`) `create_file`:
  - **Doc:** `contentMimeType: "text/plain"` (markdown body) → auto-converts to a native Google Doc.
  - **Sheet:** `contentMimeType: "text/csv"` → auto-converts to a native Google Sheet.
  - `parentId: <driveFolderId>` (see `output-config.json`), title from the configured pattern.
  - ⚠️ `text/html` does **NOT** convert (stays a raw file) — do not use it. CSV-escape every field.
  - Fallback if the connector is unavailable: write a local `.md` (Doc) + `.csv` (Sheet).

## Depth presets

| | **Lean** | **Balanced** (default) | **Deep** |
|---|---|---|---|
| Web search (free) | top query per beat | full query set per beat | widened query set + more competitors |
| Ahrefs enrichment | none | light: 1–2 competitors' new pages + brand-radar overview | full: competitor crawl + brand-radar SoV + social posts |
| Gmail press scan | no | no | optional |
| Rough unit spend | **~0** | **~300–800** | **~1.5k+** |

If units are tight (check `subscription-info-limits-and-usage`), drop a level and say so. If the Ahrefs
MCP isn't connected at all, run **Lean** automatically and note that enrichment was skipped.

## Freshness caveats

- **Web items:** trust the `WebFetch`-confirmed publish date, not the search snippet. See the recency
  rules in `beats-and-sources.md`.
- **Ahrefs brand-radar / social / Site Explorer:** fresh (independent of the GSC link).
- **GSC feed:** lags (~Dec 2025; the Google link in Ahrefs was revoked). This skill doesn't rely on GSC,
  so the lag doesn't affect the roundup — noted only so it isn't mistakenly used as a "recent news"
  source. Ahrefs project for the workspace, if ever needed: `3292255`.
