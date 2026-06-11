# Meta title + description (shared tail — both runs)

Produce **2–3 title variants** and **2–3 description variants**, mark a recommended pick, and show the
character count next to each. This stage is identical for the full run and the short run; in the short
run it's the main deliverable.

## Meta title rules

- **≤ 60 characters** (~575px) so it isn't truncated in Google.
- **Front-load the primary keyword** — as close to the start as reads naturally.
- **Append ` | CometChat`** when it fits inside 60 chars; drop the suffix rather than truncate the
  value. (For a non-CometChat property, use that brand — see `brand-context.md`.)
- One title should be plain/literal (best for ranking); one can be slightly more compelling for CTR.
- Match search intent and the page type; no clickbait, no ALL CAPS, no keyword stuffing.
- Don't duplicate an existing CometChat page's title (check against `gsc-keywords` / known pages).

## Meta description rules

- **≤ 155 characters** (~920px).
- Include the **primary** and at least **one secondary** term, naturally.
- **Active voice + one soft CTA** ("Learn how…", "Compare…", "Build…") that matches intent.
- Accurately describe the page (Google may rewrite it, but a good one still helps CTR); no clickbait.
- If the SERP has an AI Overview / snippet (from `serp-and-onpage.md`), make the description a crisp
  standalone answer — it competes for the click against the feature.
- Don't reuse a sibling page's description verbatim.

## Worked example (full run — "react native video call tutorial")

**Titles**
- `React Native Video Call Tutorial: Step-by-Step Guide | CometChat` — 60 ✓ *(recommended — literal,
  primary first, suffix fits)*
- `Build a Video Call App in React Native | CometChat` — 50 ✓
- `How to Add Video Calling to a React Native App` — 47 ✓ *(no suffix; benefit-led)*

**Descriptions**
- `Learn how to build a React Native video call app step by step — set up the SDK, handle calls, and
  add group video. Free tutorial with code.` — 142 ✓ *(recommended)*
- `Add video calling to your React Native app in minutes. Follow this tutorial covering SDK setup,
  one-to-one and group calls, and UI.` — 134 ✓

## Output

In the Sheet, write one row per variant under Section `Meta title` / `Meta description`: the variant
text in `Item`, its character count in `Metrics`, `recommended` in `Detail` on the chosen pick, and
`Recommended` in `Status` on that pick. Recommend-only — the team pastes the chosen pair into the CMS.
