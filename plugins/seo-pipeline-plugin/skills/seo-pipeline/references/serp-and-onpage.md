# Competitive SERP analysis → outline → on-page guidance

Once the primary + secondary are chosen (`keyword-research.md`), read the live SERP and turn it into
an outline, a format recommendation, an on-page checklist, and internal-link suggestions.

## 1. Read the SERP

`serp-overview` for the primary (and 1–2 key secondary on Deep), `top_positions` ~10, `select=
position,url,title,domain_rating,url_rating,refdomains,page_type,traffic,value,type`. Capture:
- **Who ranks** — the top ~10 URLs with their `domain_rating`, `refdomains`, `page_type`, and
  estimated `traffic`. (Competitor list in `brand-context.md` helps read the field.)
- **Dominant `page_type`** — what format Google rewards here (e.g. `/Article/How_to`, listicle,
  product). The new page should generally match it.
- **SERP features present** (`type` array) — `ai_overview`, `snippet`, `video`, `question` (PAA),
  `shopping`, `knowledge_panel`, etc.

## 2. Winnability label

Compare the SERP's competition to CometChat's own DR (`site-explorer-domain-rating`, cache once):
- **Winnable** — several top results are at or below CometChat's DR, or have few referring domains;
  difficulty modest. A good page can rank without a link campaign.
- **Needs links** — top results are high-DR with many refdomains; ranking will need backlinks (hand
  off to `backlink-prospector`).
- **Hard** — dominated by very high-DR pages and/or the SERP is mostly features (AI Overview +
  shopping + knowledge panel) leaving little organic room.
State the label and the one-line reason. Don't make a brand-new page's primary a "Hard" term unless
the user insists.

## 3. SERP-feature → format to win

The SERP features dictate the format that actually earns the click (this is the lesson from the
content-decay work: you can rank and still lose the click to a feature). Recommend:
- **AI Overview present** → open with a tight, quotable 40–60-word definition/answer the model can
  lift; use clear headings and factual, citable statements.
- **Featured snippet** → add a snippet-shaped block: a direct one-paragraph answer, a definition, an
  ordered list (for "how to"), or a comparison table (for "vs"/"best").
- **People Also Ask (`question`)** → add an FAQ section answering the `terms=questions` keywords.
- **Video** → recommend embedding/creating a short video; note it in the brief.
- **Shopping / knowledge panel heavy** → flag low organic upside (ties back to winnability).

## 4. Outline / brief

Build the recommended structure:
- **H1** — contains the primary, reads naturally.
- **H2/H3** — derived from the top results' section patterns + the PAA `questions`. Each H2 notes the
  entities/subtopics or the question it should cover.
- **Target word count** — from the SERP norm (roughly the median of the ranking pages), not a fixed
  number.
- **Format-to-win note** — from step 3, placed up top so the writer can't miss it.

## 5. On-page optimization guidance

- **Primary placement:** title tag, H1, URL slug, first 100 words, and at least one H2.
- **Secondary:** distribute naturally across H2/H3s and body — no stuffing.
- **Schema:** recommend a type (Article / HowTo / FAQPage / Product / SoftwareApplication) matching
  the page.
- **Media:** descriptive `alt` text containing relevant terms where natural; the video if the SERP
  rewards it.
- **CTA:** one soft, relevant CometChat CTA (e.g. link to /tutorials, a product page, or signup) that
  fits the intent.

## 6. Internal links

- **Link-in (authority to the new page):** find existing CometChat pages on related terms via
  `gsc-keywords` (free) or `site-explorer-pages-by-traffic`, and suggest 3–5 that should link to the
  new page, each with a natural anchor.
- **Link-out (from the new page):** suggest relevant CometChat hubs/products to link to (see
  `brand-context.md` for hubs), with anchors.
- If a strong existing page already targets the primary, this is the cannibalization case
  (`keyword-research.md`) — prefer updating that page over building a new one.

## 7. Pre-publish checklist (goes in the Sheet — one row each, Section = `Checklist`, Status = `To do`)

- [ ] Primary in title, H1, URL slug, first 100 words, and one H2
- [ ] Intent matches the page type
- [ ] No cannibalization (or the conflict is noted + resolved)
- [ ] Outline covers the PAA questions
- [ ] Format-to-win block present (snippet/FAQ/table/video as flagged)
- [ ] 3–5 internal links in, relevant links out, all resolve
- [ ] Schema type chosen; images have descriptive alt
- [ ] Meta title ≤60 chars and description ≤155 chars (see `meta-generation.md`)
- [ ] Not duplicative of an existing CometChat page
