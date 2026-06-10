# CometChat Marketing — Claude Code plugins

A Claude Code plugin marketplace for the CometChat marketing team.

## Plugins

### backlink-prospector-plugin
Find realistic backlink prospects from a set of keywords + competitors, score them with **live Ahrefs
metrics**, find a contact per site, draft a personalized outreach email, and append the review-ready
queue to a **shared Google Sheet**. Nothing is ever sent — every email is a draft for human review.

## Install (teammates)

```
/plugin marketplace add vishal-cometchat/backlink-prospector-marketplace
/plugin install backlink-prospector-plugin@cometchat-marketing
/reload-plugins
```

Then run it with:

```
/backlink-prospector-plugin:backlink-prospector
```

…and describe your campaign (keywords, competitors, own site, offer, sender, quality level).

## Prerequisites per teammate

- **Ahrefs MCP** connected (for SERP + Domain Rating + traffic). Without it the skill falls back to
  web search with estimated metrics.
- Output goes to the team's shared master sheet via a hosted Apps Script web app — no per-person
  Google connector needed for output. (A Google Drive connector is only used by the new-sheet
  fallback.)

## Updating

Bump `version` in `plugins/backlink-prospector-plugin/.claude-plugin/plugin.json`, commit, push.
Teammates run `/plugin marketplace update cometchat-marketing`.

## Output configuration

`plugins/backlink-prospector-plugin/skills/backlink-prospector/references/output-config.json` controls
where results land. `mode: "append-webapp"` appends every run into one shared sheet via a bound Apps
Script web app (`webAppUrl` + `token`). Set `webAppUrl` after deploying the web app. If it's unset or
fails, the skill falls back to creating a new sheet, then to a local CSV.
