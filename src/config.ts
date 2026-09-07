// ────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE — it's the single source of truth for your site.
// Everything below flows into the page content, the <head> metadata, the
// shell's built-in commands, and /card.txt.
// ────────────────────────────────────────────────────────────────────────────

/** The canonical domain (no protocol, no trailing slash). All other domains
 *  redirect here. Must match `public/CNAME`. */
export const CANONICAL_DOMAIN = "maxwinterstein.de";

export const site = {
  /** Brand / personal name shown in the hero and the browser tab. */
  name: "Max Winterstein",
  /** One-line tagline — the contents of `role.txt`. */
  tagline: "DevOps engineer.",
  /** One line, ~150 chars max. This is only the <meta description> and the
   *  social-preview blurb — keep it short, and put the real text in `about`. */
  intro:
    "DevOps engineer at WePlan Software GmbH — dad, compulsive tinkerer, and a committed advocate of the midlife crisis.",
  /** The contents of `about.txt`: one entry per rendered line. Unlike `intro`
   *  this isn't load-bearing for SEO, so it can say something. */
  about: [
    "DevOps engineer at WePlan Software GmbH.",
    "Dad, and a committed advocate of the midlife crisis.",
    "Compulsive tinkerer: whatever technology I can find, I take apart.",
    "Have been doing that for as long as I can remember.",
  ],
  /** Default locale for <html lang>. Pages may override it (see datenschutz). */
  lang: "en",
  /** Browser-chrome colour. Keep in sync with `--bg` in styles/global.css. */
  themeColor: "#161c2e",
};

/** Contact links. `label` doubles as the shell command that opens it
 *  (`github`, `email`, …) and as the key shown by `ls contact/`, so keep it
 *  lowercase and shell-safe. Add/remove freely — the shell follows. */
export const links: { label: string; href: string }[] = [
  { label: "email", href: "mailto:hello@maxwinterstein.de" },
  { label: "github", href: "https://github.com/MaxWinterstein" },
  { label: "linkedin", href: "https://linkedin.com/in/maxwinterstein" },
];

export const SITE_URL = `https://${CANONICAL_DOMAIN}`;

/** Bare email address (no `mailto:`), derived from `links`. */
const mailto = links.find((l) => l.href.startsWith("mailto:"));
export const EMAIL = mailto ? mailto.href.slice("mailto:".length) : "";
