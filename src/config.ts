// ────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE — it's the single source of truth for your site.
// Everything below flows into the page content, <head> metadata, and build.
// ────────────────────────────────────────────────────────────────────────────

/** The canonical domain (no protocol, no trailing slash). All other domains
 *  redirect here. This also becomes `public/CNAME` and Astro's `site`. */
export const CANONICAL_DOMAIN = "maxwinterstein.de";

/** Your GitHub username/org — used in DNS/deploy docs and the www CNAME target. */
export const GITHUB_USER = "MaxWinterstein";

export const site = {
  /** Brand / personal name shown in the hero and the browser tab. */
  name: "Max Winterstein",
  /** One-line tagline under the name. */
  tagline: "Software engineer.",
  /** Short sentence(s) for the intro paragraph + the <meta description>. */
  intro:
    "Hi — I'm Max Winterstein. I build and run software. " +
    "You can reach me at the links below.",
  /** Locale for <html lang>. */
  lang: "en",
};

/** Links rendered as buttons on the page. Add/remove freely.
 *  `icon` is a key into the inline SVG set in Base.astro (mail, github, x,
 *  linkedin, link). Unknown keys fall back to a generic link icon. */
export const links: { label: string; href: string; icon: string }[] = [
  { label: "Email", href: "mailto:hello@maxwinterstein.de", icon: "mail" },
  { label: "GitHub", href: "https://github.com/MaxWinterstein", icon: "github" },
  { label: "LinkedIn", href: "https://linkedin.com/in/maxwinterstein", icon: "linkedin" },
];

export const SITE_URL = `https://${CANONICAL_DOMAIN}`;
