# Type mapping — page → schema.org @types (the smart core)

How to classify a page and choose the right `@type`s. Goal: the richest *accurate* graph, current with
2026 Google guidance, in CometChat's house style (one `@graph`, shared `@id`s).

## Always on every page

1. **Organization** — verbatim from `canonical-entities.json` (`#organization`).
2. **WebSite** — verbatim from `canonical-entities.json` (`#website`).
3. **A page node** — `WebPage` or a subtype (below), `@id = <page-url>#webpage`, with
   `url`, `name` (the `<title>`), `description` (meta description), `isPartOf` → `#website`,
   `inLanguage`, and `about`/`mainEntity` → the page's primary entity when there is one.

The page node references the canonical entities; never duplicate or alter Organization/WebSite.

## Page kind → nodes

Detect the kind from URL path + page content, then add these page-specific nodes:

| Page kind | How to detect | Page node | Add these nodes |
|---|---|---|---|
| **Home / brand** | root `/` | `WebPage` | `Service` (the platform) + `OfferCatalog` of products (as in the home reference) |
| **Product / feature landing** | `/chat-and-messaging`, `/voice-and-video-calls`, `/ai-agents` | `WebPage` | **Service** *or* **SoftwareApplication** — see hybrid rule; `offers` only if real pricing is on the page |
| **SDK / UI-kit / app page** | `/chat-sdks/*`, `/*-ui-kit`, app/download pages | `WebPage` | **SoftwareApplication** (`applicationCategory: "DeveloperApplication"`, `operatingSystem` if specific) |
| **Pricing** | `/pricing` | `WebPage` | `Service` or `SoftwareApplication` with `offers` → `Offer`/`AggregateOffer` (numeric `price` + ISO-4217 `priceCurrency`); **no fabricated `aggregateRating`** |
| **Blog post** | `/blog/<slug>` | `BlogPosting` | `author` → `Person`, `publisher` → `#organization`, `headline`, `image`, `datePublished` (+ `dateModified`); `BreadcrumbList` |
| **Tutorial / docs** | `/tutorials/*`, `/docs/*` | `TechArticle` | `keywords`, `about` → `Thing`(s); `author`/`publisher`; `BreadcrumbList`. **Not** `HowTo`. |
| **Comparison / "vs" / listing** | `/compare`, `/*-alternatives`, `/vs/*`, category lists | `CollectionPage` | `ItemList` of `ListItem`s (each `position` + `name` + `url`); `BreadcrumbList` |
| **About** | `/about*` | `AboutPage` | `mainEntity` → `#organization` |
| **Contact** | `/contact*` | `ContactPage` | `mainEntity` → `#organization`; reuse Organization `contactPoint` |

Add **`BreadcrumbList`** on every non-home, hierarchical page (`@id = <page-url>#breadcrumb`), positions
sequential from Home (1) to the current page. Always build everything inside the single `@graph`.

## Hybrid rule — Service vs SoftwareApplication

- **Service** — for broad, capability-level pages describing the platform or a capability area
  ("Chat & Messaging", "Voice and Video Calls", the home platform node). Matches the team's home schema.
  Use `provider` → `#organization`, `serviceType`, `areaServed`, optional `hasOfferCatalog`.
- **SoftwareApplication** — for pages about a concrete, installable/integratable piece of software: an
  SDK, a UI kit, a widget, a platform app. Required `name` + `applicationCategory` (usually
  `"DeveloperApplication"`); add `operatingSystem` when platform-specific (iOS, Android), `url`,
  `offers` only if priced. (The home reference already uses SoftwareApplication for the UI kits it
  mentions — follow that precedent.)
- When a page is genuinely both (a capability page that is also "the SDK"), prefer the one the page
  leads with; don't emit two competing primary entities for the same thing.

## Deprecated — never emit

- **FAQPage** — Google dropped FAQ rich results (May 2026). If the page has FAQs, leave them as page
  content; do not wrap them in FAQPage. *(Override only if the user explicitly insists for non-Google
  engines.)*
- **HowTo** — Google dropped HowTo rich results (2023). Use `TechArticle` for step-by-step content.
- **WebSite `SearchAction` / sitelinks searchbox** — deprecated (May 2026); the canonical WebSite node
  intentionally omits it.

## @id conventions

- One absolute `@id` per node, unique within the page graph: `https://www.cometchat.com/<path>#<frag>`
  where `<frag>` is `webpage`, `breadcrumb`, `service`, `app`, `article`, etc.
- Reuse the canonical ids for cross-references: `#organization`, `#website`, `#logo`,
  founders `#anuj-garg` / `#anant-garg`. References to the home `#webpage` from the canonical
  Organization/WebSite are valid cross-page links (the validator flags them only as a benign warning).

## Required properties cheat-sheet (validator enforces these)

Organization → name, url · WebSite → name, url · WebPage/About/Contact/CollectionPage → name, url ·
BlogPosting/Article/TechArticle → headline, datePublished, author, publisher · Person → name ·
Offer → price, priceCurrency · AggregateOffer → priceCurrency, lowPrice · ListItem → position, name ·
BreadcrumbList/ItemList → itemListElement · Service → name · SoftwareApplication → name,
applicationCategory · ImageObject → url · ContactPoint → contactType.
