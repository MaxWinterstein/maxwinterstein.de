# maxwinterstein.de

My personal landing page — an interactive terminal. Type `help` once it loads.

## Stack

[Astro](https://astro.build) static site, auto-deployed to GitHub Pages via GitHub
Actions on every push to `main`. No cookies, no trackers, and nothing loaded
cross-origin: the CSS is inlined into each page, the shell is one bundled
same-origin module, and a `Content-Security-Policy` with no `unsafe-inline`
is emitted at build time.

## Running it

The toolchain is pinned in `aqua.yaml`, so [aqua](https://aquaproj.github.io) is
the only prerequisite — no nvm, no global Node:

```bash
aqua i          # installs the pinned Node + task, checksum-verified
task            # lists every task
task versions   # confirms which Node the tasks will use
task preview    # build + serve on :4321  <- use this one
```

You do **not** need aqua's shim directory on your `PATH`: the tasks call
`aqua exec` directly, so the pinned Node is used either way.

`task dev` is the fast-reload dev server, but Vite doesn't emit the CSP meta tag
in dev mode, so **`task preview` is the only way to see the real thing**. Check
the browser console there for policy violations.

| task           | what it does                                        |
| -------------- | --------------------------------------------------- |
| `task preview` | build, then serve `dist/` on :4321 (CSP active)     |
| `task dev`     | dev server on :4321, fast reload, no CSP            |
| `task check`   | what CI runs: types, formatting, build              |
| `task fmt`     | prettier over the repo                              |
| `task images`  | regenerate `public/og.png` + `apple-touch-icon.png` |

Prefer plain npm? The underlying scripts are unchanged: `npm ci`, `npm run dev`,
`npm run build`, `npm run preview`, `npm run check`, `npm run images`. You'll need
Node ≥ 22.18 yourself (see `.nvmrc`).

Edit `src/config.ts` (name, role, links, domain) — it drives the page content, the
`<head>` metadata, the shell's built-in commands and `/card.txt`.

## The shell

`help` lists everything. Tab completes commands and filenames, `↑`/`↓` walk the
history, and `ctrl+c` / `ctrl+u` / `ctrl+l` do what they do in a real shell. A
`#command` fragment runs an output-only command on load, e.g.
[`/#neofetch`](https://maxwinterstein.de/#neofetch).

There's a plain-text version of the same session for people already in a terminal:

```bash
curl maxwinterstein.de/card.txt
```

## DNS

`public/CNAME` holds the canonical domain and must match `CANONICAL_DOMAIN` in
`src/config.ts`. Point the apex at GitHub Pages' A records, and `www` at
`<user>.github.io`:

```
185.199.108.153   185.199.109.153   185.199.110.153   185.199.111.153
```

`redirects/` scaffolds a separate redirect-only Pages repo for any extra domain
that should forward here — run `redirects/generate.sh <domain>` and push the
result.

<br>

<sub><sub>⚠️ this might be vibe coded.</sub></sub>
