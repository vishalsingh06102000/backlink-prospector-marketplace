#!/usr/bin/env python3
"""
validate_schema.py — self-contained JSON-LD schema.org validator for the
schema-markup-generator skill. Zero third-party dependencies (Python stdlib only),
so it runs anywhere the team runs the skill.

The skill MUST run this on generated markup and fix every ERROR before returning it.

Usage:
    python3 validate_schema.py path/to/markup.json
    cat markup.json | python3 validate_schema.py          # reads stdin if no path
    python3 validate_schema.py markup.json --json          # machine-readable report

Exit code: 0 if no errors (warnings allowed), 1 if any error.

Five layers:
  1. JSON syntax
  2. JSON-LD structure  (@context, @graph, every node @type'd, @id unique, @id refs resolve)
  3. Dates are ISO-8601
  4. URLs are well-formed absolute http(s)
  5. Per-type required properties (+ price/currency sanity, deprecated-type warnings)
"""
import sys, json, re

ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$")
ABS_URL = re.compile(r"^https?://[^\s]+$", re.I)
CURRENCY = re.compile(r"^[A-Z]{3}$")

DATE_KEYS = {"datePublished", "dateModified", "startDate", "endDate", "foundingDate",
             "priceValidUntil", "uploadDate", "dateCreated"}
URL_KEYS = {"url", "target", "item", "contentUrl", "thumbnailUrl"}  # plain-string URL fields
# Required properties per @type (schema.org / Google essentials)
REQUIRED = {
    "Organization": ["name", "url"],
    "WebSite": ["url", "name"],
    "WebPage": ["url", "name"], "AboutPage": ["url", "name"],
    "ContactPage": ["url", "name"], "CollectionPage": ["url", "name"],
    "Article": ["headline", "datePublished", "author", "publisher"],
    "BlogPosting": ["headline", "datePublished", "author", "publisher"],
    "NewsArticle": ["headline", "datePublished", "author", "publisher"],
    "TechArticle": ["headline", "datePublished", "author", "publisher"],
    "Person": ["name"],
    "Offer": [],
    "AggregateOffer": [],
    "ListItem": ["position", "name"],
    "BreadcrumbList": ["itemListElement"],
    "ItemList": ["itemListElement"],
    "Service": ["name"],
    "SoftwareApplication": ["name", "applicationCategory"],
    "ImageObject": ["url"],
    "ContactPoint": ["contactType"],
    "Product": ["name"],
}
DEPRECATED = {"FAQPage": "Google dropped FAQ rich results (May 2026)",
              "HowTo": "Google dropped HowTo rich results (2023)",
              "SearchAction": "sitelinks searchbox deprecated by Google (May 2026)"}

errors, warnings = [], []
def err(m): errors.append(m)
def warn(m): warnings.append(m)

def is_ref(d):
    return isinstance(d, dict) and set(d.keys()) == {"@id"}

def types_of(node):
    t = node.get("@type")
    return t if isinstance(t, list) else ([t] if t else [])

def walk(node, defined_ids, path="$"):
    """Recurse: collect nodes, check @type presence, dates, urls, required props."""
    if isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, defined_ids, f"{path}[{i}]")
        return
    if not isinstance(node, dict):
        return
    if is_ref(node):
        return  # pure reference; resolution checked separately

    # A dict that isn't a pure ref and isn't the top wrapper should be a typed node
    is_wrapper = "@context" in node or "@graph" in node
    tys = types_of(node)
    if not is_wrapper and not tys:
        err(f"{path}: object has no @type (every schema.org node needs one)")

    # dates
    for k in DATE_KEYS:
        if k in node and isinstance(node[k], str) and not ISO_DATE.match(node[k]):
            err(f"{path}.{k}: '{node[k]}' is not ISO-8601 (use YYYY-MM-DD or full datetime)")

    # plain-string URL fields
    for k in URL_KEYS:
        v = node.get(k)
        if isinstance(v, str) and not ABS_URL.match(v):
            err(f"{path}.{k}: '{v}' is not an absolute http(s) URL")
    # sameAs = list of URLs
    sa = node.get("sameAs")
    if isinstance(sa, str): sa = [sa]
    if isinstance(sa, list):
        for u in sa:
            if isinstance(u, str) and not ABS_URL.match(u):
                err(f"{path}.sameAs: '{u}' is not an absolute http(s) URL")

    # required props per type
    for t in tys:
        for req in REQUIRED.get(t, []):
            if req not in node:
                err(f"{path} ({t}): missing required property '{req}'")
        if t in DEPRECATED:
            warn(f"{path}: @type '{t}' — {DEPRECATED[t]}; skill should not emit it")

    # price sanity — a stated price must be numeric AND carry a currency (catalog Offers may have neither)
    if "price" in node and isinstance(node["price"], str):
        if not re.match(r"^\d+(\.\d+)?$", node["price"]):
            err(f"{path}.price: '{node['price']}' must be a numeric string with no symbol (e.g. \"99\" or \"0\")")
    if any(k in node for k in ("price", "lowPrice", "highPrice")) and "priceCurrency" not in node:
        err(f"{path}: a stated price (price/lowPrice/highPrice) requires 'priceCurrency'")
    if "priceCurrency" in node and isinstance(node["priceCurrency"], str):
        if not CURRENCY.match(node["priceCurrency"]):
            warn(f"{path}.priceCurrency: '{node['priceCurrency']}' should be a 3-letter ISO-4217 code (USD, EUR, ...)")
    if "aggregateRating" in node or "review" in node:
        warn(f"{path}: aggregateRating/review present — include ONLY if genuine reviews exist on the page (fake ratings risk a Google penalty)")

    for k, v in node.items():
        if k in ("@id", "@type", "@context"):
            continue
        walk(v, defined_ids, f"{path}.{k}")

def collect_defined_ids(node, ids):
    if isinstance(node, list):
        for v in node: collect_defined_ids(v, ids)
    elif isinstance(node, dict):
        if not is_ref(node) and "@id" in node and ("@type" in node):
            ids.setdefault(node["@id"], 0)
            ids[node["@id"]] += 1
        for k, v in node.items():
            if k != "@id":
                collect_defined_ids(v, ids)

def check_refs(node, defined, path="$"):
    if isinstance(node, list):
        for i, v in enumerate(node): check_refs(v, defined, f"{path}[{i}]")
    elif isinstance(node, dict):
        if is_ref(node):
            rid = node["@id"]
            if rid not in defined:
                if ABS_URL.match(str(rid)):
                    warn(f"{path}: @id reference '{rid}' is not defined in this graph — OK only if it's defined on another page")
                else:
                    err(f"{path}: @id reference '{rid}' is unresolved and not a valid URL")
            return
        for k, v in node.items():
            if k != "@id": check_refs(v, defined, f"{path}.{k}")

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    raw = open(args[0]).read() if args else sys.stdin.read()

    # Layer 1: JSON syntax
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        report = {"passed": False, "errors": [f"JSON syntax error: {e}"], "warnings": []}
        print(json.dumps(report, indent=2) if as_json else f"FAIL — JSON syntax error: {e}")
        sys.exit(1)

    # Layer 2 prelim: @context / @graph
    if isinstance(data, dict):
        if "@context" not in data:
            warn("$: top-level @context missing (expected \"https://schema.org\")")
        graph = data.get("@graph")
        if graph is None:
            warn("$: no @graph — single-node document; @graph is recommended for multi-entity pages")
    # defined ids + duplicates
    ids = {}
    collect_defined_ids(data, ids)
    for k, c in ids.items():
        if c > 1:
            err(f"@id '{k}' is defined {c} times — every defining @id must be unique")

    # Layers 2-5
    walk(data, ids)
    check_refs(data, set(ids.keys()))

    passed = len(errors) == 0
    if as_json:
        print(json.dumps({"passed": passed, "errors": errors, "warnings": warnings}, indent=2))
    else:
        print(f"{'PASS' if passed else 'FAIL'} — {len(errors)} error(s), {len(warnings)} warning(s)")
        for e in errors:   print(f"  ERROR  {e}")
        for w in warnings: print(f"  warn   {w}")
    sys.exit(0 if passed else 1)

if __name__ == "__main__":
    main()
