# Filter, score & cluster

After collection (Stage 3) and any enrichment (Stage 4), score each candidate, drop the weak ones, and
group the survivors into themes. Keep it judgement-based and fast — this is editorial triage, not a
precise model.

## Score each item on three axes

Rate each 0–3, then sum (max 9). Include items scoring **≥ 5**; the top few become the roundup's lead.

### 1. Relevance — does it hit a CometChat beat?
- **3** — squarely on a core beat (a competitor's launch/funding, AI-in-chat, messaging/video SDK news).
- **2** — adjacent and useful (a platform SDK release devs will feel; a standards move).
- **1** — tangential (general CPaaS or big-tech news that only lightly touches the space).
- **0** — off-beat (generic consumer-app gossip, unrelated tech) → **drop**.

### 2. Significance — how big is the move?
- **3** — launch of a competing capability, funding round, M&A, pricing overhaul, standards shift.
- **2** — notable feature/version with real developer impact.
- **1** — minor update, incremental release, opinion/explainer.
- **0** — non-news / rehash → **drop**.

### 3. Recency — how fresh, inside the window?
- **3** — within the last 2–3 days (or clearly breaking).
- **2** — earlier in the window.
- **1** — just outside the window but important context.
- **0** — stale → **drop** unless essential context.

## Worked examples (CometChat lens)

- *"Sendbird launches built-in AI moderation"* — relevance 3, significance 3, recency 3 = **9**. Lead
  item; clear CometChat angle (our moderation/AI story + a `/vs/sendbird` refresh).
- *"Stream raises Series C, pushing video"* — 3 / 3 / 2 = **8**. CI watch + refresh `/vs/stream`.
- *"Flutter 3.x ships with X"* — relevance 2, significance 2, recency 3 = **7**. Platform beat; blog
  angle (does our Flutter SDK/tutorial need an update?).
- *"Top 10 chat apps of 2026" affiliate listicle* — relevance 1, significance 0 = **drop** (low-quality
  source, non-news).
- *"WhatsApp adds a consumer sticker pack"* — relevance 0 = **drop** (consumer gossip, not dev-facing).

## Cluster into themes

Group the kept items into **3–6 themes** that will become the roundup's sections, e.g.:
- "AI moderation & agents heat up"
- "Competitor funding & M&A"
- "WebRTC / video platform updates"
- "Platform SDK releases (Flutter / RN / iOS)"

Order themes by the strength of their strongest item. Within a theme, lead with the highest total score.
Tag each item's **suggested use** — `blog`, `social`, or `internal` — for Stage 6 / the Sheet.

## Guardrails

- Prefer fewer, stronger items over a long thin list — a tight roundup beats an exhaustive one.
- Never inflate a minor release into a headline; label rumors/unconfirmed as such.
- If a beat produced nothing this window, say so rather than padding.
