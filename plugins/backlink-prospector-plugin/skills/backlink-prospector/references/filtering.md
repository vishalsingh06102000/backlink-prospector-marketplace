# Filtering candidates

Apply this to every crawled domain *before* scoring, so we don't waste effort (or Ahrefs units) on
sites that can never be prospects. Compare on the **root domain** (e.g. `blog.example.com` →
`example.com`), and treat subdomains of a listed domain as matches.

Drop a domain — with a recorded reason — if any of these hold:

1. **Own property.** Matches (or is a subdomain of) one of the user's own domains. Reason: *"Your own
   property."*
2. **Competitor.** Matches one of the user's competitor domains. Reason: *"Competitor."* If a domain
   looks competitor-ish but isn't on the list (its name contains chat/messaging/sdk/api/comms-type
   terms for a chat product), make a quick judgment call on whether it's a direct commercial rival;
   if yes, drop it as *"Looks like a competitor."*
3. **Global non-prospect.** Search engines, social networks, marketplaces, encyclopedias, and code
   hosts never make good editorial backlink targets. Reason: *"Not a linkable site."* Blocklist
   (match on root domain, including subdomains):

   ```
   google.* bing.com duckduckgo.com
   youtube.com youtu.be facebook.com instagram.com twitter.com x.com linkedin.com
   pinterest.com reddit.com tiktok.com
   wikipedia.org wikimedia.org quora.com medium.com
   amazon.com apple.com play.google.com apps.apple.com github.com
   ```

4. **User exclusions.** Any extra domains or simple wildcard patterns the user gave (e.g. `*.gov`,
   `pinterest.*`). Reason: *"Excluded by your rule."*
5. **Non-HTML / unreadable.** PDFs and other non-web-page results aren't prospects.

After filtering, dedupe so each root domain appears once (keep the instance with the best SERP
position). Everything that survives goes to scoring.

Keep the dropped list — the user likes confirming that competitors and their own sites were removed.
Put it on the "Skipped" tab of the output, not in the main queue.
