/*
 * Best-effort cookie / consent / newsletter-popup dismissal so the recorded
 * site looks clean behind the widget. Everything here is best-effort — failing
 * to find a banner is normal and non-fatal.
 */

// CSS selectors for common "accept / close" controls.
const SELECTORS = [
  "#onetrust-accept-btn-handler",
  ".onetrust-close-btn-handler",
  "#truste-consent-button",
  "button[aria-label='Accept all']",
  "button[aria-label='Accept cookies']",
  "button[aria-label='Close']",
  ".cc-allow",
  ".cookie-accept",
  "#cookie-accept",
  "#accept-cookies",
  "[data-testid='cookie-accept']",
  "[data-cookiebanner='accept_button']",
  ".osano-cm-accept-all",
  "#hs-eu-confirmation-button",
];

// Visible button text (lowercased, matched as a substring) to click.
const TEXTS = [
  "accept all",
  "accept all cookies",
  "allow all",
  "accept cookies",
  "i accept",
  "i agree",
  "agree",
  "got it",
  "ok, got it",
  "accept",
];

/**
 * Runs inside the page. Returns the number of things it dismissed.
 * Takes its selector/text lists as arguments so it can be serialized
 * and injected without leaving unresolved placeholders.
 */
function dismissBanners(SELECTORS, TEXTS) {
  let hits = 0;

  const clickable = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    return true;
  };

  // Collect all elements, descending into open shadow roots (custom-element
  // consent widgets are common), matching a set of CSS selectors.
  const deepQuery = (selectors) => {
    const out = [];
    const walk = (rootNode) => {
      for (const sel of selectors) {
        try {
          rootNode.querySelectorAll(sel).forEach((el) => out.push(el));
        } catch (e) {
          /* ignore */
        }
      }
      const all = rootNode.querySelectorAll("*");
      for (const el of all) {
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    return out;
  };

  const deepAll = (sel) => {
    const out = [];
    const walk = (rootNode) => {
      rootNode.querySelectorAll(sel).forEach((el) => out.push(el));
      rootNode.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) walk(el.shadowRoot);
      });
    };
    walk(document);
    return out;
  };

  for (const el of deepQuery(SELECTORS)) {
    if (clickable(el)) {
      try {
        el.click();
        hits++;
      } catch (e) {
        /* ignore */
      }
    }
  }

  const buttons = deepAll("button, a, [role='button']");
  for (const b of buttons) {
    const txt = (b.textContent || "").trim().toLowerCase();
    if (!txt || txt.length > 24) continue;
    if (TEXTS.some((t) => txt === t || txt.includes(t))) {
      if (clickable(b)) {
        try {
          b.click();
          hits++;
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  return hits;
}

/**
 * Returns a self-contained JS expression string that, when evaluated in the
 * page, runs the dismissal and returns the hit count.
 */
function buildDismissFn() {
  return `(${dismissBanners.toString()})(${JSON.stringify(
    SELECTORS
  )}, ${JSON.stringify(TEXTS)})`;
}

module.exports = { buildDismissFn };
