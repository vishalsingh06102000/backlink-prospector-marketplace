# Scoring a prospect

The goal is a transparent, defensible score the user can trust — not a black box. Every prospect
gets a 0–100 score, a plain-English quality label, and a one-sentence "why it matched", plus a
pass/fail against the chosen quality level's gates.

## Quality levels (presets)

The user picks one of these by name. They set the gates; don't make the user reason about DR numbers.

| Level | Min Domain Rating | Min monthly traffic | Min relevance (0–1) | Feel |
|---|---|---|---|---|
| **High quality** | 50 | 5,000 | 0.55 | Fewer prospects, strongest sites |
| **Balanced** (default) | 30 | 1,000 | 0.45 | Healthy mix of authority + reach |
| **Wide net** | 15 | 200 | 0.35 | More opportunities to review |

## The four signals

Judge each prospect on these, then blend with the weights shown:

1. **Relevance — weight 0.40 (most important).** Read the ranking page and judge, 0–1, how topically
   aligned it is with the product's niche *and* how likely its audience would value a link to the
   product. A tutorial on "adding chat to your app" for a chat-SDK product is ~0.9; a generic
   marketing blog that mentions chat once is ~0.3.
2. **Domain Rating — weight 0.25.** Normalize DR/100. If DR is unknown (no Ahrefs data), treat it as a
   neutral 0.4 rather than zero — don't punish a site just because we couldn't measure it.
3. **Traffic — weight 0.15.** More monthly organic traffic = more reach. Scale it gently (log-ish):
   ~200/mo is low, ~10k is solid, ~1M is excellent. Unknown traffic → neutral 0.4.
4. **Linkability — weight 0.20.** How likely is this *type* of page to link out?
   - Guest-post / "write for us" page → ~1.0 (they invite contributions)
   - Listicle / roundup ("best chat APIs") → ~0.85 (natural place to be added)
   - Resource / guide page → ~0.9
   - Editorial blog post → ~0.8
   - Product / pricing / commercial page → ~0.15 (won't link out)

**Score = round(100 × weighted average of the four signals).**

## Quality gates (pass/fail)

A prospect **qualifies** only if it clears the chosen level's gates:

- Relevance ≥ the level's minimum — this is the one hard gate that always applies. Below it, reject
  with a reason like *"Not relevant enough to your niche."*
- Domain Rating ≥ the minimum — **only enforce this when DR was actually measured** (Ahrefs data
  present). If DR is estimated or unknown, don't hard-reject on it; let relevance + linkability decide.
- Traffic ≥ the minimum — only enforce when traffic was measured.

Keep rejected sites visible (a "Skipped" tab) with their reason, so the user trusts the filtering.

## Quality label (what the user reads first)

Compose a short, human label instead of showing a bare number:

- Strength word by score: **Strong match** (≥75), **Good match** (≥55), **Worth a look** (≥40).
- Plus the page kind: "accepts guest posts" / "roundup/listicle" / "resource page" / "industry blog".
- Add "high-traffic " before the kind when monthly traffic ≥ ~10,000.

Examples: `Strong match — high-traffic industry blog`, `Good match — roundup/listicle`.

## "Why it matched" (one or two human sentences)

Explain in words, not scores. Pull from the strongest signals, e.g.:
- "In-depth article about building real-time chat features — directly on-topic."
- "High-authority site (DR 91) that gets ~4.2M visits a month."
- "A 'best chat APIs' roundup — a natural place to be added."

Keep it to the 2–3 most compelling reasons.
