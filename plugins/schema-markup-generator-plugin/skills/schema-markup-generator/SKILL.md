---
name: schema-markup-generator
description: >-
  Generate production-ready JSON-LD schema.org structured-data markup for any web page. Give it a page
  URL (or pasted HTML/content) and it understands the page, picks the right schema.org types, always
  includes CometChat's team-approved Organization + WebSite blocks, custom-builds the rest as a linked
  @graph, validates the markup before returning it, and hands back paste-ready raw JSON-LD (for
  Storyblok's Structured Data Markup field). Use this skill whenever the user wants "schema markup",
  "structured data", "JSON-LD", "rich results / rich snippets markup", "schema for this page", "add
  schema.org", "Organization/Article/Product/Breadcrumb schema", or to mark up a page for Google.
  Fetches the page via web fetch and returns the validated JSON-LD in chat only — it does not save
  anything to Google Drive. It validates but does not deploy — a human pastes the JSON-LD into the CMS
  (Storyblok Structured Data Markup field). Trigger it even if the user doesn't say
  "schema" but clearly wants structured data / rich-result markup for a page.
---

# Schema Markup Generator

Turn a page URL into **professional, validated JSON-LD schema.org markup** — built to CometChat's
hand-approved house standard: a single `@graph` with shared `@id`s, the mandatory **Organization +
WebSite** entities on every page, and page-specific entities (WebPage, Service/SoftwareApplication,
Article, BreadcrumbList, …) chosen to fit the page. Every output is **run through a validator before it
is returned** — no broken or guessed markup ever leaves the skill.

It runs inside the current Claude session: **`WebFetch`** to read the page (free) and the bundled
**`references/validate_schema.py`** to test the markup. **Output is chat-only — it does NOT save to
Google Drive and does NOT write a tracking log.** It **does not deploy** — a human pastes the raw
JSON-LD into Storyblok's Structured Data Markup field (or wraps it in `<script type="application/ld+json">`
for a direct `<head>` embed) and runs Google's Rich Results Test for the final eligibility check.

## The pipeline (run these stages in order)

1. **Gather input** — a page URL (default), or pasted HTML/content for an unpublished page. Optional
   page-type hint. Brand defaults to CometChat.
2. **Fetch & understand the page** — `WebFetch` it; extract the real facts (see Stage 2).
3. **Select schema types** — apply `references/type-mapping.md` (the smart core).
4. **Build the `@graph`** — inject the canonical Organization + WebSite verbatim; add page-specific
   nodes with shared `@id` links. **Only real data — never invent values** (see the hard rule below).
5. **Validate (run the test)** — run `references/validate_schema.py`; fix every error; re-run until it
   passes. See `references/validation.md`.
6. **Output** — print the validated **raw JSON-LD** (paste-ready for the CMS field) in chat. Chat-only —
   no Drive save, no tracking log. See `references/output-config.json`.
7. **Summarize** — what types were emitted and why, validation result, the Rich Results Test link, and
   the next steps.

## Inputs

Collect these up front; reuse anything already given, only ask for gaps.

- **Page** — the URL to mark up (e.g. `https://www.cometchat.com/voice-and-video-calls`). Or paste the
  page's HTML / content if it isn't live yet.
- **Page-type hint** *(optional)* — if the user knows it ("this is a blog post", "pricing page"). The
  skill auto-detects otherwise.
- **Brand** *(optional)* — defaults to CometChat (`references/canonical-entities.json`). Override only
  if marking up a different property.

If the user just gives a URL, proceed with all defaults.

## Stage 2 — Fetch & understand the page

`WebFetch` the page and pull the **real, on-page facts** the markup will be built from:
- Canonical URL, `<title>`, meta description, primary `<h1>` and the `<h2>` outline.
- Page purpose / what it's about; the product or feature it describes.
- Breadcrumb / nav trail (for `BreadcrumbList`).
- Blog/article: author name(s), publish + modified dates, hero image, article section.
- Pricing: plan names + prices + currency (only if actually shown).
- Listing/comparison: the items listed.
- Author/contact entities, FAQs (content only — see the deprecated rule).

If a page won't fetch, ask the user to paste its content and continue. Capture only what's verifiably on
the page — gaps are handled by the anti-fabrication rule, not by guessing.

## Stage 3 — Select schema types

Classify the page and choose the `@type`s using `references/type-mapping.md`. Every page gets
**Organization + WebSite** (from `references/canonical-entities.json`) plus a **WebPage** node (or a
subtype: AboutPage / ContactPage / CollectionPage). Then add the page-specific nodes per the mapping —
including the **hybrid Service-vs-SoftwareApplication** decision for feature pages and a
**BreadcrumbList** on any hierarchical page. **Never emit deprecated types** (FAQPage, HowTo, WebSite
SearchAction).

## Stage 4 — Build the @graph

Assemble one document: `{"@context": "https://schema.org", "@graph": [ ... ]}`.
- Start with the **Organization** and **WebSite** nodes copied **verbatim** from
  `references/canonical-entities.json` — do not alter them.
- Add the page node(s), wiring them with shared `@id`s exactly like the home reference:
  WebPage `isPartOf` → `#website`; `about` / `mainEntity` → `#organization` or the page's Service/app
  node; Article `publisher` → `#organization`, `author` → a Person node; BreadcrumbList items in order.
- Use absolute `https` URLs, ISO-8601 dates, numeric price strings + ISO-4217 `priceCurrency`, and a
  unique absolute `@id` per node (e.g. `https://www.cometchat.com/<path>#webpage`).

**HARD RULE — only real data, never invent.** Use only values present on the page (or in
canonical-entities). Do **not** fabricate prices, ratings, review counts, dates, author names, images,
or descriptions. If a recommended field's value isn't on the page, **omit the field** — an accurate
smaller graph beats an invented richer one. Emit `aggregateRating`/`review` **only** if genuine reviews
are shown on the page (fake ratings risk a Google manual action).

## Stage 5 — Validate (run the test)

Write the generated JSON to a temp file and run the bundled validator:

```
python3 references/validate_schema.py <tmpfile>
```

It checks five layers (JSON syntax → JSON-LD structure / `@id` integrity → ISO dates → URLs → per-type
required properties) and exits non-zero on any error. **Fix every ERROR and re-run until it passes** —
never return markup that fails. Review warnings too (e.g. cross-page `@id` references are fine;
`aggregateRating` warnings mean "confirm the reviews are real"). Full rules: `references/validation.md`.
Then give the user a **Google Rich Results Test** link (from `output-config.json`'s
`richResultsTestUrlPattern`) for the human final eligibility check — no programmatic API exists for that.

## Stage 6 — Output (chat-only)

Print the validated markup as **raw JSON-LD** (just the `{"@context": …, "@graph": […]}` document —
**no `<script>` wrapper**) inside a copy-paste block. This is the paste-ready form for CometChat's CMS:
it goes straight into Storyblok's **Structured Data Markup** field, which supplies the `<script>` wrapper
itself. Directly below the block, add one short note for the head-paste case: *"Pasting into a page
`<head>` instead of the Storyblok field? Wrap this in `<script type="application/ld+json"> … </script>`."*
Do **not** wrap the primary block — leaving the tags in breaks the Storyblok field (invalid JSON /
double-wrapped `<script>`), the recurring error this is designed to prevent.

**Do NOT save anything to Google Drive and do NOT write/update any tracking log or Sheet.** The chat
block is the sole deliverable. (This is deliberate: the old "recreate the whole log Sheet every run"
workaround was a token sink and left duplicate sheets behind. `references/output-config.json` is kept
only for the `richResultsTestUrlPattern` used in Stage 5/7 — ignore any Drive/log fields in it.)

## Stage 7 — Summarize

Tell the user: the page type detected, which `@type`s were emitted and a one-line why for each,
the **validation result** (passed + any warnings to eyeball), the **Rich Results Test link**, and the
reminder: paste the raw JSON-LD into Storyblok's **Structured Data Markup** field (or, for a direct
`<head>` embed, wrap it in `<script type="application/ld+json"> … </script>`), then run the Rich Results
Test before publishing. **Do not mention a Drive file or tracking log — this skill no longer writes
either.**

## Style notes

- **Validated, not vibes.** Never hand back markup you haven't run through the validator. "It looks
  right" is not enough — run the test.
- **Truthful markup only.** Structured data must reflect what's actually on the page. No invented prices,
  ratings, dates, or authors. Omit over guess.
- **Consistency is the point.** Organization + WebSite are identical on every page (from
  canonical-entities) so CometChat presents one coherent entity graph to Google.
- **Current best practice.** Skip deprecated types (FAQPage, HowTo, SearchAction). Prefer
  SoftwareApplication for concrete software/SDK pages, Service for the broad platform — per
  `references/type-mapping.md`.
- **Generate, don't deploy.** The skill writes and validates the markup; a human pastes it live and runs
  the Rich Results Test.
- **Raw JSON-LD is the deliverable, not the `<script>` wrapper.** The chat block contains only the
  `{"@context": …, "@graph": […]}` document, because it's pasted into Storyblok's Structured Data Markup
  field (which adds the `<script>` tags itself). The `<script type="application/ld+json">…</script>`
  wrapper is mentioned only as an optional note for a direct `<head>` embed — never put it around the
  primary block, or the Storyblok field breaks with validation errors.
- **Chat-only, no Drive.** Never call the Google Drive connector, never create a `.json` file, and never
  create/read/recreate the "Schema Markup Log" Sheet. The validated JSON-LD printed in chat is the only
  output.
