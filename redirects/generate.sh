#!/usr/bin/env bash
# Scaffold a redirect-only GitHub Pages repo for one extra domain.
#
# Usage:
#   ./generate.sh <redirect-domain> [canonical-domain]
#
# Examples:
#   ./generate.sh example.net example.com
#   ./generate.sh example.net          # canonical taken from ../public/CNAME
#
# Output: a folder ./out/<redirect-domain>/ containing CNAME, index.html, 404.html.
# Push that folder to a new GitHub repo and set Pages -> "Deploy from a branch".
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

redirect_domain="${1:-}"
if [[ -z "$redirect_domain" ]]; then
  echo "error: redirect domain required" >&2
  echo "usage: $0 <redirect-domain> [canonical-domain]" >&2
  exit 1
fi

canonical="${2:-}"
if [[ -z "$canonical" ]]; then
  canonical="$(tr -d '[:space:]' < "$here/../public/CNAME")"
fi
if [[ -z "$canonical" ]]; then
  echo "error: could not determine canonical domain" >&2
  exit 1
fi

out="$here/out/$redirect_domain"
mkdir -p "$out"

printf '%s\n' "$redirect_domain" > "$out/CNAME"
sed "s/__CANONICAL__/$canonical/g" "$here/template/index.html" > "$out/index.html"
cp "$out/index.html" "$out/404.html"

echo "Created $out"
echo "  CNAME      -> $redirect_domain"
echo "  redirects  -> https://$canonical/"
echo
echo "Next: create a new GitHub repo, push these files, then in repo Settings -> Pages"
echo "      set Source = 'Deploy from a branch' (main / root), and point $redirect_domain DNS"
echo "      at GitHub Pages (see ../README.md)."
