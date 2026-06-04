// Regenerates public/CNAME from CANONICAL_DOMAIN in src/config.ts so the custom
// domain has exactly one source of truth. Runs automatically before each build.
// Reads the config as text (rather than importing TS) so plain `node` can run it.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const config = await readFile(new URL("src/config.ts", root), "utf8");

const match = config.match(/CANONICAL_DOMAIN\s*=\s*["'`]([^"'`]+)["'`]/);
if (!match) {
  console.error("Could not find CANONICAL_DOMAIN in src/config.ts");
  process.exit(1);
}

const cnamePath = new URL("public/CNAME", root);
await writeFile(cnamePath, match[1] + "\n");
console.log(`public/CNAME -> ${match[1]}`);
