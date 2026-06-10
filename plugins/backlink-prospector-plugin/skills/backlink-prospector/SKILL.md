---
name: backlink-prospector
description: >-
  Find websites that could realistically link back to a product, then hand back a review-ready
  prospect queue with quality metrics, contact details, and a drafted personalized outreach email
  per site — written into a Google Sheet. Use this skill whenever the user wants to do backlink
  outreach, link building, blogger/PR outreach, or "find sites to get backlinks from", "find guest
  post opportunities", "find sites that could link to us", "build a prospect list for outreach", or
  mentions finding link/SEO opportunities for given keywords and competitors. Pulls SERP rankings
  and domain metrics from the Ahrefs MCP when connected. Trigger it even if the user doesn't say the
  word "backlink" but clearly wants to find sites to pitch for links/mentions.
---

# Backlink Prospector

Turn a set of target keywords into a **review-ready queue of qualified backlink prospects** —
each row a real site that could plausibly link to the user's product, with its quality metrics, a
plain-English reason it matched, a contact, and a ready-to-edit outreach email. The output lands in
a **Google Sheet** the user (or their marketing team) reviews and sends from.

This runs entirely inside the current Claude session — no paid API. It uses the **Ahrefs MCP** for
ranking + authority data (the user has this connected) and the user's existing Claude reasoning for
relevance scoring and email drafting.

## The pipeline (run these stages in order)

1. **Gather the campaign inputs** (ask only for what's missing — see *Inputs*).
2. **Crawl the SERP** for each keyword → collect ranking domains (+ DR/traffic when available).
3. **Filter** out competitors, the user's own sites, and non-prospects. See `references/filtering.md`.
4. **Score** each remaining site on relevance + authority + linkability. See `references/scoring.md`.
5. **Enrich** the qualified sites with a contact (email + the right person).
6. **Draft** a personalized outreach email per prospect. See `references/outreach.md`.
7. **Write** the queue to a Google Sheet and summarize.

Process sites concurrently where you can, but be polite to external sites (don't hammer one domain).

## Inputs

Collect these before starting. If the user already gave some in conversation, reuse them — only ask
for the gaps. Keep the questions plain and grouped; this is often a non-technical marketer.

- **Keywords** — the search terms to find ranking sites for (e.g. "in-app chat sdk", "chat api").
- **What the product does** — one or two plain sentences. Used to judge relevance.
- **Competitors** — domains to exclude (so we never pitch a rival's site).
- **Own sites** — the user's own domains to exclude.
- **The offer** — what we want them to link to / cover, and why their readers would care (plus an
  optional asset URL).
- **Sender** — name + company for the email signature.
- **Quality level** — *High quality* / *Balanced* / *Wide net* (default **Balanced**). This sets how
  picky the scoring gates are — see `references/scoring.md`. Don't make the user think in DR numbers.
- **How many prospects** to aim for (default ~50). Caps the work in stages 5–6.

If the user is vague, propose sensible defaults from any context you have (e.g. CometChat → chat/SDK
keywords, competitors like sendbird/pubnub/getstream) and let them correct you.

## Stage 2 — Crawl the SERP (Ahrefs MCP preferred)

For each keyword, get the organic ranking results. **Prefer the Ahrefs MCP** because it returns the
ranking pages *with* Domain Rating and traffic in one call:

- Discover the connected Ahrefs tools first (use ToolSearch for "ahrefs serp" / "ahrefs domain
  rating" / "ahrefs metrics", or list connected MCP tools). Tool names vary by MCP version, so match
  by purpose: a **SERP overview** tool (input: keyword + country) and a **domain rating / metrics**
  tool (input: a domain).
- Call the SERP-overview tool per keyword (use the user's country, default `us`, and ~top 30 results).
- Collect every ranking URL, reduce each to its **root domain**, and keep the best (highest) position
  per domain. Capture DR + monthly traffic if the tool returns them.

**Fallback if Ahrefs MCP isn't connected:** use `web_search` per keyword to gather ranking URLs, then
proceed without measured DR/traffic (the scoring section explains how to handle missing metrics).
Tell the user you're running without Ahrefs data so they can connect it for sharper results.

Be mindful of Ahrefs units: one SERP-overview call per keyword, and one metrics call per *qualified*
domain at most — don't fetch metrics for domains you've already filtered out.

## Stage 3 — Filter

Drop competitors, the user's own properties, and obvious non-prospects (search engines, social,
marketplaces, Wikipedia, etc.) before spending any effort on them. Full rules + the blocklist are in
`references/filtering.md`. Keep a short note of *why* each dropped domain was dropped — the user
likes seeing that competitors were actually removed.

## Stage 4 — Score

For each kept domain: fetch its ranking page (`web_fetch`), judge how relevant it is to the product's
niche, classify the page type (blog / resource / listicle / guest-post / product), and combine that
with DR + traffic into a 0–100 score, a plain-English quality label, and a one-line "why it matched".
Apply the quality gates for the chosen level. The exact rubric, weights, gates, and label wording are
in `references/scoring.md`. Sort by score and keep the top *N* (the requested prospect count).

## Stage 5 — Enrich (find a contact)

For each qualified prospect, find the best contact:

1. Look at the ranking page for an author byline / author email.
2. Fetch the site's likely contact pages — `/contact`, `/contact-us`, `/about`, `/write-for-us` — and
   pull `mailto:` links and visible emails. Prefer an email on the prospect's own domain.
3. Prefer a *relevant human* (the author/editor of the matching content) over a generic
   `info@`/`hello@` inbox; keep the generic one as a fallback.

Record the email, the person's name/role if known, and the page you found it on (evidence). If no
email is found, still keep the prospect but mark the contact as "none found".

## Stage 6 — Draft outreach

Write one short, genuinely personalized email per prospect. Rules, tone handling, and a worked
example are in `references/outreach.md`. Never send anything — these are drafts for human review.

## Stage 7 — Output to a Google Sheet

Write the queue to a **Google Sheet** so the team can review and send. First read
`references/output-config.json` and follow its `mode`:

**`mode: "append-webapp"` (default — one shared, ever-growing sheet).** Every run appends into the
single master sheet at `masterSheetUrl` via a bound Apps Script web app, so all campaigns live in one
place and stay auto-formatted.

1. Build the prospect rows as a JSON array of arrays — one inner array per qualified prospect, values
   in the exact `columns` order from the config, `Status` = `Draft`. (Do **not** send a header row;
   the master sheet already has one.)
2. POST them to the web app with Bash `curl` (it follows the Apps Script redirect with `-L`):
   ```
   curl -sL -X POST "<webAppUrl>" -H "Content-Type: application/json" \
     -d '{"token":"<token>","rows":[[...],[...]]}'
   ```
   A success response looks like `{"ok":true,"appended":N,"total":M}`. Give the user the
   `masterSheetUrl` so they can open it.
3. **If `webAppUrl` is still the placeholder, empty, or the POST fails** (non-`ok` or curl error),
   fall back to the create-new-sheet path below and tell the user the pipeline isn't wired up yet
   (point them at `references/output-config.json` + the Apps Script web-app setup).

**`mode: "new-sheet"` (or any fallback).** If a Google Drive/Sheets MCP connector is available,
create a new spreadsheet titled `Backlink Prospects — <campaign or date>` (upload CSV content with
`contentMimeType: text/csv` so it converts to a native Sheet) and write a header row + one row per
prospect.

**Last-resort fallback:** if no connector is available, write a `prospects.csv` to the working
directory with the same columns and tell the user they can import it into Google Sheets
(File → Import).

Use these columns, in this order:

```
Domain | Ranking URL | Keyword | Quality label | Score | Why it matched | Domain Rating |
Monthly Traffic | Contact name | Contact email | Contact role | Evidence URL |
Draft subject | Draft email | Status
```

Set **Status** to `Draft` for every row. Put rejected-but-notable domains (e.g. removed competitors)
out of the main sheet — or on a second tab labelled "Skipped" with the reason — so the main queue
stays clean and scannable.

After writing, give the user a short summary: how many keywords searched, how many domains found,
how many qualified, how many have emails, and the Sheet link (or CSV path). Remind them nothing is
sent — they review and send each email themselves.

## Style notes

- Keep everything the user sees in plain language. Lead with the quality label and the human "why it
  matched", not raw numbers — the numbers live in their own columns for those who want them.
- This is research + drafting only. You never contact anyone; the user owns the send decision.
- If a stage partially fails (a page won't load, a metric is missing), degrade gracefully and note it
  rather than dropping the prospect silently.
