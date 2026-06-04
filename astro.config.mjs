import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/config.ts";

// Custom domain serves from the site root, so no `base` is needed.
// `site` is used for canonical URLs, Open Graph, and sitemaps.
export default defineConfig({
  site: SITE_URL,
});
