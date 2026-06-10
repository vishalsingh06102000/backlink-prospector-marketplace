# Detecting decay

The goal is a defensible flag: a page is "decaying" when its recent performance is **meaningfully and
durably below its own peak** — not just noisy or seasonal. Everything is measured per page against the
page's own history (its peak is the baseline), never against other pages.

## The metric

Use **clicks** (from `gsc-page-history`) as the primary decay metric — it's the truest measure of lost
search value. Keep **impressions** and **average position** alongside, because their pattern is what
later tells us *why* (see `diagnosis.md`).

## Baseline = the page's peak

- **Peak** = the highest **3-month rolling average** of clicks within the lookback window (default ~16
  months). A rolling average, not a single best month, so one lucky spike doesn't set an unbeatable bar.
- **Recent** = the average of the **latest 2–3 months that actually have data** (remember GSC data can
  lag — auto-detect the latest available month; don't use the calendar month).

## Decay rule

Flag a page when **both** hold:
1. **Magnitude:** recent is below peak by at least the sensitivity threshold (below), and
2. **Sustained:** the drop has held for at least N consecutive recent periods (not a one-month blip).

Ignore pages whose peak is below the **traffic floor** (too small to matter), and discount obvious
**seasonality** (e.g. a yearly dip that recovers) — if the same dip appears one year earlier in the
series, treat it as seasonal, not decay.

## Sensitivity presets

The user picks one by name; it sets the gates (don't make them reason about percentages):

| Preset | Drop vs peak | Sustained for | Traffic floor (peak clicks/mo) |
|---|---|---|---|
| **Conservative** | ≥ 40% | 3 months | ~200 |
| **Balanced** (default) | ≥ 25% | 2 months | ~50 |
| **Sensitive** | ≥ 15% | 1–2 months | ~20 |

## Ranking flagged pages — priority

Rank by **lost value**, so the biggest business losses surface first:

```
lost_clicks_per_month = peak_clicks − recent_clicks
priority = lost_clicks_per_month × page_value_weight
```

Use the page's GSC `traffic_value` (USD) as the value weight (fall back to peak clicks if value is
missing). When GA4 is connected later, swap in revenue/conversions for a sharper priority.

## Severity label (what the user reads first)

Translate the number into a plain word:
- **Sharp drop** — recent ≤ 50% of peak.
- **Slow slide** — recent 50–75% of peak, trending down over several months.
- **Early warning** — recent 75–85% of peak, just started slipping.

## "How far it fell" (one human line)

State it in words, e.g. *"Down ~60% from its peak of ~390 clicks/mo (spring 2024) to ~150/mo now,"* and
note the data "as of" month. Keep it to the one or two numbers that matter.
