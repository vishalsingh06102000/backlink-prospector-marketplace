# Validation — run the test before returning anything

Never hand back markup that hasn't passed the bundled validator. The validator is dependency-free
(Python stdlib only), so it runs anywhere the team runs the skill.

## How to run

Write the generated JSON-LD to a temp file, then:

```
python3 references/validate_schema.py /tmp/markup.json
# or pipe it:
echo "$MARKUP" | python3 references/validate_schema.py
# machine-readable:
python3 references/validate_schema.py /tmp/markup.json --json
```

Exit code `0` = no errors (warnings allowed); `1` = at least one error. **Fix every ERROR and re-run
until it passes.** Then address warnings with judgment.

## The five layers

1. **JSON syntax** — must parse. Catches the classic hand-built bugs: missing/trailing commas, smart
   quotes, comments (JSON-LD has none).
2. **JSON-LD structure** — `@context` present (`https://schema.org`); `@graph` recommended for
   multi-entity pages; **every node has `@type`**; **every defining `@id` is unique**; every
   `{"@id": …}` reference either resolves in-graph or is a valid absolute URL (cross-page refs are a
   benign warning, not an error).
3. **Dates** — `datePublished`, `dateModified`, `foundingDate`, `priceValidUntil`, etc. are ISO-8601
   (`YYYY-MM-DD` or full datetime).
4. **URLs** — `url`, `target`, `item`, `contentUrl`, `sameAs`, and string `logo`/`image` are absolute
   `http(s)` URLs.
5. **Per-type required properties** — e.g. Organization→name+url, BlogPosting→headline+datePublished+
   author+publisher, Offer→price+priceCurrency, ListItem→position+name, SoftwareApplication→name+
   applicationCategory. Also: `price` must be a numeric string with no currency symbol; `priceCurrency`
   should be ISO-4217; `aggregateRating`/`review` raises a warning to confirm the reviews are real;
   deprecated types (FAQPage/HowTo/SearchAction) raise a warning (the skill shouldn't emit them at all).

## Interpreting results

- **ERROR** → must fix before returning. Re-generate the offending field (or omit it if the value isn't
  truly on the page) and re-run.
- **warn: cross-page `@id` reference** → expected and fine (e.g. canonical Organization pointing at the
  home `#webpage`). No action.
- **warn: aggregateRating/review present** → confirm genuine on-page reviews; if not, remove it.
- **warn: priceCurrency not ISO-4217** → fix to USD/EUR/etc.

## The last 5% — human final check

The in-session validator covers JSON-LD correctness and schema.org essentials (~95% of issues). It
**cannot** judge Google rich-result *eligibility* (no public API exists for the Rich Results Test or
validator.schema.org). So always give the user a prefilled **Google Rich Results Test** link
(`https://search.google.com/test/rich-results?url=<page>`), or tell them to paste the markup into
`https://validator.schema.org/`, for the final eligibility confirmation before publishing.
