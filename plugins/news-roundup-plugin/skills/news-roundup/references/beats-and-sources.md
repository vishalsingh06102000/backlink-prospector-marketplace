# Beats, queries & sources

Turn the beats (`brand-context.md`) into concrete searches, and judge sources for quality. The goal of
Stage 2–3 is a broad, deduped candidate list of **recent, primary-sourced** items in CometChat's space.

## Beats → query templates

Run a handful of `WebSearch` queries per beat. Always bias to recency (add the current year, "this
week", or a month) and to announcement language. `{competitor}` iterates over the competitor set.

| Beat | Example queries |
|---|---|
| **Competitor moves** | `{competitor} (launch OR release OR announces OR funding OR acquires)`; `{competitor} changelog {month} {year}`; `{competitor} pricing change` |
| **Chat & messaging SDKs** | `in-app chat SDK {year} new`; `messaging API launch`; `chat SDK release notes {month}` |
| **Voice/video & WebRTC** | `WebRTC update {year}`; `video calling API launch`; `real-time media SDK announcement` |
| **AI & moderation** | `"AI moderation" chat {year}`; `AI agent in-app chat launch`; `trust and safety API news`; `chat summarization SDK` |
| **Platform SDKs** | `Flutter {version} release chat`; `React Native new architecture messaging`; `iOS/Android SDK update real-time` |
| **Industry & standards** | `messaging interoperability {year}`; `communications API market funding`; `CPaaS acquisition {year}` |

Adapt phrasing to what the user narrowed to. On **Deep**, widen with extra long-tail queries and more
competitors; on **Lean**, run the highest-signal query per beat only.

## Source quality (allow / down-weight)

**Prefer (primary / credible):**
- Competitor **official** blogs, changelogs, release notes, newsrooms, docs.
- Standards bodies and platform owners (W3C/IETF for WebRTC, Flutter/React/Apple/Google dev blogs).
- Reputable tech/dev press (e.g. TechCrunch, The Verge, InfoQ, official engineering blogs) and funding
  databases for rounds/M&A.

**Down-weight / verify before trusting:**
- SEO-spam aggregators, content farms, AI-generated listicles, and "top 10 chat apps" affiliate pages.
- Undated pages, or pages that merely *re-report* another outlet — trace to and link the **primary**
  source instead.
- Vendor pages positioning themselves (fine as a *signal* of what they shipped, not as neutral news).

When two sources cover the same story, keep the most primary one and note the others only if they add
real detail (e.g. analyst commentary).

## Recency rules

- Default window = **last 7 days**; honor whatever the user set.
- Confirm the **publish/update date** via `WebFetch` before including an item — search engines surface
  stale pages. Discard anything outside the window **unless** it's genuinely breaking or essential
  context, in which case label it "(context, outside window)".
- For changelogs/release notes, use the **version's release date**, not the page's last-modified date.

## Dedupe

- Drop exact-URL duplicates and near-duplicate titles (same story, different outlet).
- Collapse a single launch covered by press + the vendor's own post into **one** item with the primary
  source linked and the others as "also covered by".
