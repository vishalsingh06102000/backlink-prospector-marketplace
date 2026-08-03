# CometChat Marketing — Claude Code plugins

A Claude Code plugin marketplace for the CometChat marketing team.

## Plugins

### backlink-prospector-plugin
Find realistic backlink prospects from a set of keywords + competitors, score them with **live Ahrefs
metrics**, find a contact per site, draft a personalized outreach email, and write the review-ready
queue to a **shared Google Sheet**. Nothing is ever sent — every email is a draft for human review.

### seo-content-reviver-plugin
Watch published pages for **SEO decay** — clicks, impressions, and rankings falling versus each page's
own historical peak — flag the biggest slippers, diagnose the **likely cause** (lost rankings, stale
content, SERP shift, cannibalization, lost backlinks), and recommend a **specific fix** per page,
written into a **Google Sheet**. Recommend-only — a human acts on the report.

### seo-pipeline-plugin
Take a **topic or an existing page** and hand back a **publish-ready brief** — auto-detected **target
keywords**, a **SERP-derived outline**, an **on-page checklist**, **internal-link** suggestions, and an
optimized **meta title + description** — written into a **Google Sheet**. Runs full-length (topic →
brief) or just the tail ("this page is new, give me its keywords + meta"). It runs a free
**cannibalization guard** first, so if CometChat already ranks for the term it tells you to refresh the
existing page instead of publishing a competitor. Recommend-only — it never writes the article body or
publishes.

### news-roundup-plugin
Monitor the **chat / messaging / voice-and-video / AI-developer** space and turn the past week's (or
month's) moves into **one roundup** — a narrative **Google Doc** plus a companion item-log **Sheet** —
that serves three audiences at once: a developer-facing **external draft**, an internal
**competitive-intelligence watch** (what competitors shipped, funding, M&A, standards, CometChat
mentions), and ready-to-post **social hooks**. Web search is the free spine; Ahrefs brand-radar / social
/ competitor-crawl signals enrich it on Balanced/Deep. **Recommend/draft-only** — it never publishes,
posts, or sends.

### schema-markup-generator-plugin
Give it a **page URL** (or pasted HTML) and get **production-ready JSON-LD schema.org markup**: it
understands the page, picks the right schema types, always includes the team-approved **Organization +
WebSite** blocks, custom-builds the rest as a linked `@graph`, **validates the markup before returning
it** (bundled 5-layer validator), and hands back a paste-ready `<script type="application/ld+json">`
block — plus a saved `.json` in the Schema Markup Drive folder. **Validate-only** — a human pastes it
into the page `<head>` and runs Google's Rich Results Test.

### crossword-demo-gif-plugin
Give it a **website URL** and get two **screen-recording-style GIFs** — a **desktop** and a **mobile**
layout — of that live site with CometChat's **Crossword** AI widget (the "CometChat Concierge"
assistant, **Aster**) floating on top and running a short conversation **auto-tailored to the site's
business**. It looks like someone recorded their screen to show how Crossword would look embedded on the
prospect's site — perfect for personalized outreach. Uses **Playwright** to record the real site with the
widget injected, then **ffmpeg** to encode the GIFs, saved locally. **Demo asset only** — nothing is
deployed or changed on the target site.

## Install (teammates)

Add the marketplace once, then install whichever plugin(s) you want:

```
/plugin marketplace add vishalsingh06102000/backlink-prospector-marketplace
/plugin install backlink-prospector-plugin@cometchat-marketing
/plugin install seo-content-reviver-plugin@cometchat-marketing
/plugin install seo-pipeline-plugin@cometchat-marketing
/plugin install news-roundup-plugin@cometchat-marketing
/plugin install schema-markup-generator-plugin@cometchat-marketing
/plugin install crossword-demo-gif-plugin@cometchat-marketing
/reload-plugins
```

Run them with:

```
/backlink-prospector-plugin:backlink-prospector      # find backlink prospects
/seo-content-reviver-plugin:seo-content-reviver       # find decaying pages to fix
/seo-pipeline-plugin:seo-pipeline                     # topic/page -> publish-ready brief + meta
/news-roundup-plugin:news-roundup                     # weekly industry/competitor news roundup
/schema-markup-generator-plugin:schema-markup-generator  # page URL -> validated JSON-LD schema markup
/crossword-demo-gif-plugin:crossword-demo-gif            # website URL -> desktop+mobile demo GIFs with the Crossword widget
```

## Prerequisites per teammate

- **Ahrefs MCP** connected.
  - *backlink-prospector* uses it for SERP rankings + Domain Rating + traffic (falls back to web search).
  - *seo-content-reviver* uses its **Google Search Console** history + **Site Explorer** data; the
    Ahrefs project must have GSC connected.
  - *seo-pipeline* uses Keyword Explorer + live SERPs for the brief, and GSC (free) for the
    cannibalization guard; the GSC feed only needs to be fresh enough for that check.
  - *news-roundup* runs on free **web search** alone (Lean); on Balanced/Deep it adds Ahrefs
    brand-radar (AI mentions), social-media (competitor posts), and Site Explorer (competitor crawl).
    Optional Deep-only Gmail scan for inbox press/newsletters.
  - *schema-markup-generator* needs **no Ahrefs** — it reads the page with free **web fetch** and
    validates with a bundled Python script (stdlib only).
  - *crossword-demo-gif* needs **no Ahrefs and no Google Drive**. It needs **Node.js** + **ffmpeg** on
    the machine; on first use run `npm install` inside
    `crossword-demo-gif/references/` (installs Playwright + Chromium). Output GIFs are saved locally.
- **Google Drive connector** for writing the output Sheet (and, for *news-roundup*, the Doc; for
  *schema-markup-generator*, the `.json`) into the shared folder. *news-roundup* needs a "News Roundup"
  folder ID and *schema-markup-generator* a "Schema Markup" folder ID set in their `output-config.json`.
- *(Optional, future)* a **GA4** connector sharpens the decay report's prioritization (revenue per
  page); not required to run it.

## Updating

Bump `version` in the relevant `plugins/<plugin>/.claude-plugin/plugin.json`, commit, push.
Teammates run `/plugin marketplace update cometchat-marketing`.

## Output configuration

Each skill has `…/references/output-config.json` with `mode: "new-sheet-in-folder"` — every run creates
a new dated Google Sheet inside that skill's shared Drive folder (`driveFolderId`). CometChat's Google
Workspace blocks anonymous Apps Script web apps, so results are not appended into a single sheet; each
run gets its own dated sheet. If the Drive connector is unavailable, the skill falls back to a local CSV.
