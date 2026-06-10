# Diagnosing the cause + prescribing the fix

Once a page is flagged as decaying (see `decay-detection.md`), work out the **single most likely
cause** from its signal pattern, then map it to one specific action. The clues come from how clicks,
impressions, and position moved *together* over the decline — plus one confirming Ahrefs lookup per
flagged page (see `data-sources.md`, stage 5). Always say "likely", not "certain".

## Cause → signal → action matrix

| Likely cause | Signal pattern (from gsc-page-history) | Confirm with | Recommended action |
|---|---|---|---|
| **Lost rankings** | Clicks down **and** average `position` got worse (number went up); impressions often down too | `site-explorer-top-pages` compare → `top_keyword_best_position_diff` worse, `traffic_diff_percent` down, or `status = right` (dropped out) | **Re-optimize & refresh** the page for its target keyword; rebuild internal links to it |
| **Content stale / outdated** | Impressions roughly flat or slightly down, but **clicks & CTR** falling; page is old | Page publish/update date is old; `top_keyword_best_position` still decent | **Refresh the content** (update facts, year, examples) and **rewrite title/meta** to lift CTR |
| **SERP shift / intent change** | **Impressions drop sharply** while `position` stays roughly stable | New SERP features for the query (AI overview, video, shopping) in `site-explorer` `serp_features` | **Rework the format** to match the new SERP (add FAQ/snippet block, video, comparison) |
| **Cannibalization** | Clicks slide as another of your pages starts ranking for the same query | `gsc-keywords` / `organic-keywords`: one query → 2+ of your URLs | **Consolidate / canonicalize** — merge or differentiate the competing pages by intent |
| **Lost backlinks** | Clicks/position decline lines up in time with a drop in links | `referring_domains` down vs compare date; `site-explorer-broken-backlinks` | **Reclaim/rebuild links** — fix broken ones, re-earn lost ones, add fresh internal links |

## How to choose when more than one fits

- Prefer the cause whose confirming signal is strongest and best lines up **in time** with the decline.
- If clicks fell but **position improved** (like a page ranking #5 yet getting fewer clicks), it's
  usually **SERP shift** (a feature is eating clicks) or **stale/CTR** — check impressions: sharp
  impressions drop → SERP shift; flat impressions + low CTR → stale title/meta.
- If nothing clearly fits, label cause **"Unclear — needs manual review"** and recommend a content +
  SERP audit. Don't force a cause.

## Output per flagged page

For each page the report carries: the **likely cause**, the **recommended action**, and a one-line
**why** in plain English, e.g. *"Impressions held but CTR fell from 4.5% to 1.5% — title/meta look
stale; refresh and rewrite the snippet."* Recommend-only — never make the change.
