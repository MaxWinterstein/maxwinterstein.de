import type { APIRoute } from "astro";
import { site, links, CANONICAL_DOMAIN } from "../config";

// `curl maxwinterstein.de/card.txt` — the same session as the homepage, in
// ANSI colour, generated from src/config.ts so the two can never drift apart.

const E = "\x1b[";
const RESET = `${E}0m`;
const GREEN = `${E}32m`;
const BLUE = `${E}34m`;
const CYAN = `${E}36m`;
const BOLD = `${E}1;37m`;
const DIM = `${E}90m`;

const display = (href: string) =>
  href
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

export const GET: APIRoute = () => {
  const prompt = `${GREEN}guest@${CANONICAL_DOMAIN}${RESET}${BLUE}:~${RESET}${DIM}$${RESET} `;
  const width = Math.max(...links.map((l) => l.label.length));

  const body = [
    "",
    `${prompt}whoami`,
    `${BOLD}${site.name}${RESET}`,
    "",
    `${prompt}cat role.txt`,
    `${CYAN}${site.tagline}${RESET}`,
    "",
    `${prompt}cat about.txt`,
    ...site.about,
    "",
    `${prompt}ls contact/`,
    ...links.map(
      (l) =>
        `${GREEN}${l.label.padEnd(width)}${RESET}  ${BLUE}${display(l.href)}${RESET}`,
    ),
    "",
    `${DIM}https://${CANONICAL_DOMAIN}${RESET}`,
    "",
  ];

  return new Response(body.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
