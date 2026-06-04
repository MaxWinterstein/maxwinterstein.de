# Personal site — one Astro site, many domains, on GitHub Pages

A simple, good-looking landing page built with [Astro](https://astro.build), hosted on
GitHub Pages on your **canonical** domain. Every other domain you own redirects to it.

```
website/                 ← this repo: the real site (canonical domain)
└── redirects/out/<dom>/  ← generated one-file repos: each extra domain → canonical
```

## 1. Edit your details (one file)

Open **`src/config.ts`** and set:

- `CANONICAL_DOMAIN` — your primary domain, e.g. `example.com`
- `GITHUB_USER` — your GitHub username/org
- `site.name`, `site.tagline`, `site.intro`
- `links` — your email / social links

That's it — the page content, `<head>` metadata, `public/CNAME`, and Astro's `site`
all derive from this file.

## 2. Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into dist/ (also regenerates public/CNAME)
npm run preview    # serve the built site
```

## 3. Publish the canonical site

1. Create a GitHub repo (e.g. `website`) and push this folder to the `main` branch.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every
   push to `main`.
4. After the first deploy, GitHub reads `public/CNAME` and sets the custom domain.
   Tick **Enforce HTTPS** once the certificate provisions (a few minutes).

### DNS for the canonical domain

At your registrar / DNS provider:

| Record | Host  | Value                                                              |
| ------ | ----- | ----------------------------------------------------------------- |
| A      | `@`   | `185.199.108.153`                                                 |
| A      | `@`   | `185.199.109.153`                                                 |
| A      | `@`   | `185.199.110.153`                                                 |
| A      | `@`   | `185.199.111.153`                                                 |
| AAAA   | `@`   | `2606:50c0:8000::153` (optional IPv6; also `8001/8002/8003::153`) |
| CNAME  | `www` | `<GITHUB_USER>.github.io`                                          |

## 4. Point every other domain at the canonical one

For each additional domain, generate a tiny redirect repo:

```bash
cd redirects
./generate.sh example.net          # canonical read from ../public/CNAME
# or be explicit:
./generate.sh example.net example.com
```

This writes `redirects/out/example.net/` with `CNAME`, `index.html`, `404.html`.
Then:

1. Create a new GitHub repo (e.g. `redirect-example-net`) and push those three files.
2. Repo **Settings → Pages → Source: Deploy from a branch** (`main` / `/root`). No build needed.
3. Tick **Enforce HTTPS**.
4. Add the **same DNS records as the table above** for that domain (A/AAAA on `@`,
   CNAME on `www` → `<GITHUB_USER>.github.io`).

> GitHub Pages can't emit a real server-side 301, so each redirect repo uses
> `<link rel="canonical">` + `<meta http-equiv="refresh">` + a JS `location.replace`
> (which preserves the path). Browsers and search engines treat this as the canonical
> equivalent. If your registrar offers native "URL forwarding / 301", that also works and
> skips the redirect repo entirely.

## 5. Verify

```bash
curl -sI  https://example.com          # 200, valid HTTPS
curl -sL  https://example.net          # forwards to canonical content
```

Then open each domain in a browser: the address bar should end on the canonical domain
with a valid padlock (HTTPS) for every domain.
