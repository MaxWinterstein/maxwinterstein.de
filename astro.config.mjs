import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/config.ts";

// Custom domain serves from the site root, so no `base` is needed.
// `site` is used for canonical URLs, Open Graph, and sitemaps.
export default defineConfig({
  site: SITE_URL,
  // Emits <meta http-equiv="content-security-policy"> with hashes for the
  // styles Astro inlines and `self` for the scripts it bundles. GitHub Pages
  // can't send real headers, so a meta policy is the only option here.
  // Note: no `is:inline` scripts/styles anywhere — Astro can't hash those.
  build: {
    // global.css grew past Astro's 4kB auto-inline threshold, which quietly
    // turned it into a second request. For three pages sharing ~4kB, saving
    // the round trip beats caching it separately.
    inlineStylesheets: "always",
  },
  security: {
    csp: {
      // Astro fills in script-src/style-src; these two cost nothing extra.
      // (frame-ancestors is ignored in a meta policy, so it's not worth listing.)
      directives: ["object-src 'none'", "base-uri 'none'"],
    },
  },
});
