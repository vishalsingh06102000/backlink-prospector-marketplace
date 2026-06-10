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

## Install (teammates)

Add the marketplace once, then install whichever plugin(s) you want:

```
/plugin marketplace add vishalsingh06102000/backlink-prospector-marketplace
/plugin install backlink-prospector-plugin@cometchat-marketing
/plugin install seo-content-reviver-plugin@cometchat-marketing
/reload-plugins
```

Run them with:

```
/backlink-prospector-plugin:backlink-prospector      # find backlink prospects
/seo-content-reviver-plugin:seo-content-reviver       # find decaying pages to fix
```

## Prerequisites per teammate

- **Ahrefs MCP** connected.
  - *backlink-prospector* uses it for SERP rankings + Domain Rating + traffic (falls back to web search).
  - *seo-content-reviver* uses its **Google Search Console** history + **Site Explorer** data; the
    Ahrefs project must have GSC connected.
- **Google Drive connector** for writing the output Sheet into the shared folder.
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
