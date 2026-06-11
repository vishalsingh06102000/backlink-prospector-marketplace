# Keyword research — expand, cluster, pick, guard

Goal: turn a seed topic (or an existing page's content) into **one primary keyword + 3–6
secondary/supporting terms**, chosen to be winnable, on-intent, and not already owned by another
CometChat page. Tools, params, unit costs, and depth presets are in `data-sources.md`.

## 1. Seed

- **Full run:** the seed is the user's topic/brief (e.g. "react native video call tutorial"). Pull
  2–4 head phrasings from it.
- **Short run:** read the page (`WebFetch` / pasted), and seed from its H1 + recurring noun phrases
  **and** from `gsc-keywords` filtered to that URL (what it *already* ranks for — the truest signal
  of best-fit). The page's existing rankings usually reveal the primary better than the title does.

## 2. Expand (cheap)

`keywords-explorer-matching-terms`, `select=keyword,volume`, country set, modest `limit`:
- once with `terms=all` (variations),
- once with `terms=questions` (these become the PAA / FAQ outline in `serp-and-onpage.md`).
On **Deep**, add `keywords-explorer-related-terms` for adjacent topics.

De-dupe, drop obviously irrelevant or off-brand terms (judge against `brand-context.md`), and keep a
shortlist sized to the depth preset (~15 / ~40 / ~80).

## 3. Enrich (costed — shortlist only)

`keywords-explorer-overview` selecting `keyword,volume,difficulty,intents,parent_topic,
traffic_potential,serp_features`. Now each candidate has: search volume, ranking difficulty (0–100),
intent flags, its parent topic, the traffic the #1 page gets, and which SERP features show.

## 4. Cluster & pick the primary

- **Cluster** by `parent_topic` + dominant intent. Terms sharing a parent topic belong on **one**
  page, not several.
- **Parent-topic consolidation:** if the seed term's `parent_topic` is broader and higher-value,
  recommend targeting the parent (one strong page) rather than a narrow sub-term. Note it explicitly.
- **Pick one primary** by balancing:
  - **Volume / traffic_potential** — prefer `traffic_potential` (whole-topic upside) over raw volume.
  - **Winnability** — see `serp-and-onpage.md` (difficulty + live SERP competitor DR/refdomains vs
    CometChat's DR). Don't pick a "Hard" term as primary for a brand-new page unless the user insists.
  - **Intent fit** — the term's intent must match the page type (see below).
- **Pick 3–6 secondary/supporting** terms from the same cluster (synonyms, long-tail, and questions)
  to weave into H2/H3s and the body.

## 5. Intent ↔ page-type check

Map `intents` to the planned page and **warn on a mismatch**:
- `informational` / `questions` → blog / tutorial / guide.
- `commercial` (comparisons, "best", "alternatives", "pricing") → comparison / listicle / product /
  vs-page.
- `transactional` / `navigational` → product, pricing, signup, or docs.
A commercial term pointed at a thin blog post (or an informational term at a product page) will
under-convert or fail to rank — say so and suggest the right page type.

## 6. Cannibalization guard (free, run every time)

Before locking a target, check `gsc-keywords` (project `3292255`) for the primary + secondary terms:
- If `urls_count > 1`, or a `top_url` other than the intended page already ranks for the term, the
  site **already targets it**. Creating another page splits equity.
- **Recommendation in that case:** don't build a competitor — **update the existing page** (hand off
  to the `seo-content-reviver` skill), or differentiate the new page to a distinct sub-intent. Record
  the conflicting URL + its current position in the Doc's "Cannibalization & risks" section.
- If GSC is stale (see `data-sources.md` freshness note), confirm with
  `site-explorer-organic-keywords` on `cometchat.com` before declaring a term free.

## Output of this stage

A primary keyword (with volume, difficulty, intent, parent topic, SERP features, winnability) and a
secondary list — handed to `serp-and-onpage.md` for the SERP read, outline, and on-page guidance.
Keep it plain in the Doc: the metrics live in a table; the prose says *why* this is the target.
