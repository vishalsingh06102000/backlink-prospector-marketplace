# Building the tailored conversation (`convo.json`)

The GIF's whole selling point is that the AI conversation looks **specific to the
prospect's website**. Generate it fresh for each URL — never reuse a generic
script verbatim.

## How to generate it

1. **Read the site.** `WebFetch` the input URL (fall back to the homepage if a
   deep link is thin). Pull out: what the company does, who their users are, the
   product/service names, and the primary call-to-action (book a demo, start
   free, contact sales, etc.).
2. **Infer a realistic visitor.** Imagine a real visitor on *that* site with a
   real question the business would get. Not about CometChat — about **their**
   product/service.
3. **Write the exchange.** The AI persona is **Aster**, the site's own
   "CometChat Concierge" assistant. Aster answers the visitor helpfully *as if it
   were that company's support/sales agent*, and naturally lands on the site's
   CTA (demo, signup, pricing). Keep it warm, concise, and on-brand for the site.

## Schema (`convo.json`)

```json
{
  "title": "CometChat Concierge",
  "agentName": "Aster",
  "welcome": "Welcome to <Company>. I'm Aster. How can I help you today?",
  "messages": [
    { "role": "visitor", "text": "..." },
    { "role": "ai",      "text": "..." },
    { "role": "visitor", "text": "..." },
    { "role": "ai",      "text": "..." }
  ],
  "startDelayMs": 600,
  "endHoldMs": 1500
}
```

- `role` is `"visitor"` (typed into the bar, shown as a dark right-aligned
  bubble) or `"ai"` (Aster, white left-aligned bubble, preceded by a typing
  indicator).
- **Timing is automatic** — the widget derives per-message delays from text
  length (typing speed, think time) so the whole thing lands at ~12–16s. You do
  **not** set per-message delays. Only `startDelayMs` / `endHoldMs` are optional
  knobs.

## Length & tone rules (important for it to look real)

- **2 exchanges (4 messages)** is the sweet spot for a 12–16s GIF. 3 exchanges
  (6 messages) only if the lines are short.
- Keep each message to **≤ ~110 characters** (about two lines in the bubble).
  Long paragraphs overflow and look fake.
- First visitor line = the highest-intent question a real prospect would ask on
  that site. Last Aster line = a soft nudge to the site's real CTA.
- Match the site's vocabulary (their product names, their audience). No CometChat
  sales pitch unless the site *is* about chat/messaging.
- `welcome` should name the company (e.g. "Welcome to Acme. I'm Aster…").

## Example (for an analytics product)

```json
{
  "title": "CometChat Concierge",
  "agentName": "Aster",
  "welcome": "Welcome to Acme Analytics. I'm Aster. How can I help you today?",
  "messages": [
    { "role": "visitor", "text": "Do you support real-time funnel analytics?" },
    { "role": "ai", "text": "Yes — funnels update live as events stream in, so you can watch drop-off in real time." },
    { "role": "visitor", "text": "Can I get a quick demo?" },
    { "role": "ai", "text": "Absolutely! I can book you a 15-min walkthrough — what's your work email?" }
  ],
  "startDelayMs": 600,
  "endHoldMs": 1500
}
```

Write the finished object to a temp file and pass it to `render.js --script`.
