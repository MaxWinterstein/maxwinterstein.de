// The interactive terminal on the homepage.
//
// Bundled by Astro (never `is:inline`) for two reasons: `security.csp` can only
// hash scripts it processes, and a real module gets type-checked and keeps its
// names off `window`. Its data arrives via `#screen[data-shell]`, which
// index.astro fills from src/config.ts.

interface Contact {
  label: string;
  href: string;
  display: string;
}

interface FileEntry {
  text: string;
  cls: string;
}

interface ShellData {
  host: string;
  siteName: string;
  tagline: string;
  contacts: Contact[];
  files: Record<string, FileEntry>;
}

interface Command {
  run: (args: string[]) => void;
  desc?: string;
  usage?: string;
  /** Hidden from `help` and from tab completion: aliases and easter eggs. */
  hidden?: boolean;
}

type Row = [string, string];

const byId = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`shell: missing #${id}`);
  return node as T;
};

/** Like querySelector, but non-nullable — narrowing wouldn't survive into the
 *  event handlers below, and the page can't work without these elements. */
const must = <T extends Element>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`shell: missing ${selector}`);
  return node;
};

const screenEl = byId("screen");
const output = byId("output");
const inputline = byId("inputline");
const input = byId<HTMLInputElement>("cmd");
const typed = byId("typed");
const terminal = must<HTMLElement>(".terminal");

const rawData = screenEl.dataset.shell;
if (!rawData) throw new Error("shell: missing #screen[data-shell]");
const { host, siteName, tagline, contacts, files } = JSON.parse(
  rawData,
) as ShellData;

// The prompt and hint are hidden until now (see `.no-js` in global.css):
// without this script they can't do anything, so they aren't advertised.
document.documentElement.classList.remove("no-js");

const startedAt = Date.now();
const cmdHistory: string[] = [];
let hidx = 0; // points one past the last entry

// Own-property lookups only: `cat constructor` must not find Object.prototype.
const lookup = <T>(obj: Record<string, T>, key: string): T | undefined =>
  Object.hasOwn(obj, key) ? obj[key] : undefined;

const pad = (s: string, n: number) => s + " ".repeat(Math.max(0, n - s.length));
const scrollBottom = () => (screenEl.scrollTop = screenEl.scrollHeight);
const sync = () => (typed.textContent = input.value);

// Mirrors components/Prompt.astro, non-breaking space included: a plain
// space in the .astro template is collapsed away by compressHTML.
const promptHTML = () =>
  `<span class="u">guest@${host}</span><span class="p">:~</span><span class="sym">$\u00a0</span>`;

function echoCommand(cmd: string) {
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = promptHTML();
  const c = document.createElement("span");
  c.className = "cmd";
  c.textContent = cmd;
  line.appendChild(c);
  output.appendChild(line);
}

// `.pre` keeps the column padding in `help` / `neofetch`. Only command
// output needs it, so the templates stay whitespace-insensitive.
function print(text: string, cls?: string) {
  for (const t of String(text).split("\n")) {
    const div = document.createElement("div");
    div.className = "line pre" + (cls ? " " + cls : "");
    div.textContent = t;
    output.appendChild(div);
  }
}

function gap() {
  const g = document.createElement("span");
  g.className = "gap";
  output.appendChild(g);
}

const removeHint = () => document.getElementById("hint")?.remove();

// ── commands ──────────────────────────────────────────────────────────────
function uptimeStr() {
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
}

function openLink(c: Contact) {
  print("opening " + c.href + " …", "dim");
  if (c.href.startsWith("mailto:")) window.location.href = c.href;
  else window.open(c.href, "_blank", "noopener");
}

function listContacts() {
  const w = Math.max(...contacts.map((c) => c.label.length));
  print(
    contacts.map((c) => pad(c.label, w) + "  " + c.display).join("\n"),
    "out",
  );
}

function goPrivacy() {
  print("opening /datenschutz …", "dim");
  window.location.href = "/datenschutz/";
}

function clear() {
  output.replaceChildren();
}

function help() {
  const rows: Row[] = Object.entries(commands)
    .filter(([, c]) => !c.hidden)
    .map(([k, c]) => [c.usage ?? k, c.desc ?? ""]);
  const contactRows: Row[] = contacts.map((c) => [
    c.label,
    `open ${c.display}`,
  ]);
  const keyRows: Row[] = [
    ["tab", "complete a command or filename"],
    ["↑ ↓", "walk through history"],
    ["ctrl+c", "cancel the current line"],
    ["ctrl+u", "clear the current line"],
    ["ctrl+l", "clear the screen"],
    ["click ● ● ●", "the window controls actually work"],
  ];
  const w = Math.max(
    ...[...rows, ...contactRows, ...keyRows].map(([u]) => u.length),
  );
  const block = (list: Row[]) =>
    list.map(([u, d]) => "  " + pad(u, w) + "   " + d).join("\n");

  print("commands", "dim");
  print(block(rows), "out");
  gap();
  print("contacts", "dim");
  print(block(contactRows), "out");
  gap();
  print("keys", "dim");
  print(block(keyRows), "out");
  gap();
  print(`plain text version: curl ${host}/card.txt`, "dim");
}

function neofetch() {
  const logo = [
    "┌───────────────┐",
    "│ ● ● ●         │",
    "│               │",
    "│  > _          │",
    "│               │",
    "└───────────────┘",
  ];
  const title = `guest@${host}`;
  const info = [
    title,
    "─".repeat(title.length),
    "OS:         maxOS (terminal edition)",
    `host:       ${host}`,
    "shell:      max-sh 1.0",
    `role:       ${tagline}`,
    `uptime:     ${uptimeStr()}`,
    `resolution: ${window.innerWidth}×${window.innerHeight}`,
    `locale:     ${navigator.language}`,
    "theme:      dark",
    "packages:   1 (astro)",
    `contact:    ${contacts.map((c) => c.label).join(" · ")}`,
  ];
  const w = Math.max(...logo.map((l) => l.length));
  const out: string[] = [];
  for (let i = 0; i < Math.max(logo.length, info.length); i++) {
    out.push(pad(logo[i] ?? "", w) + "   " + (info[i] ?? ""));
  }
  print(out.join("\n"), "out");
}

function ls(args: string[]) {
  const arg = args[0] ?? "";
  const target = arg.toLowerCase().replace(/\/$/, "");
  if (!target)
    return print([...Object.keys(files), "contact/"].join("  "), "out");
  if (target === "contact")
    return print(contacts.map((c) => c.label).join("  "), "out");
  if (lookup(files, target) || lookup(files, target + ".txt"))
    return print(arg, "out");
  print(`ls: cannot access '${arg}': No such file or directory`, "err");
}

function cat(args: string[]) {
  if (!args.length) return print("cat: missing file operand", "err");
  for (const raw of args) {
    const key = raw.toLowerCase();
    const f = lookup(files, key) ?? lookup(files, key + ".txt");
    if (f) print(f.text, f.cls);
    else print(`cat: ${raw}: No such file or directory`, "err");
  }
}

function openCmd(args: string[]) {
  const arg = args[0] ?? "";
  const c = contacts.find((x) => x.label === arg.toLowerCase());
  if (c) openLink(c);
  else print(`open: unknown target: ${arg} — try \`ls contact/\``, "err");
}

function showHistory() {
  if (!cmdHistory.length) return print("no history yet", "dim");
  print(
    // right-aligned indices, the way bash prints them
    cmdHistory.map((h, i) => String(i + 1).padStart(4) + "  " + h).join("\n"),
    "out",
  );
}

const noEscape = () => print("there is no escape from the terminal 🌀", "dim");

const commands: Record<string, Command> = {
  help: { desc: "show this message", run: help },
  whoami: { desc: "print my name", run: () => print(siteName, "out") },
  ls: { usage: "ls [contact/]", desc: "list files", run: ls },
  cat: { usage: "cat <file>", desc: "print a file", run: cat },
  open: { usage: "open <name>", desc: "open a contact link", run: openCmd },
  neofetch: { desc: "system info", run: neofetch },
  history: { desc: "show command history", run: showHistory },
  uptime: {
    desc: "how long this session has been up",
    run: () =>
      print(
        ` up ${uptimeStr()},  1 user,  load average: 0.00, 0.00, 0.00`,
        "out",
      ),
  },
  date: {
    desc: "current date/time",
    run: () => print(new Date().toString(), "out"),
  },
  echo: {
    usage: "echo <text>",
    desc: "print text",
    run: (a) => print(a.join(" "), "out"),
  },
  clear: { desc: "clear the screen", run: clear },
  datenschutz: { desc: "open the privacy notice", run: goPrivacy },

  // aliases and easter eggs — hidden from `help` and from completion
  "?": { hidden: true, run: help },
  cls: { hidden: true, run: clear },
  uname: { hidden: true, run: neofetch },
  pwd: { hidden: true, run: () => print("/home/guest", "out") },
  privacy: { hidden: true, run: goPrivacy },
  contact: { hidden: true, run: listContacts },
  contacts: { hidden: true, run: listContacts },
  sudo: {
    hidden: true,
    run: () =>
      print(
        "we trust you have received the usual lecture. permission denied 😏",
        "out",
      ),
  },
  exit: { hidden: true, run: noEscape },
  quit: { hidden: true, run: noEscape },
};

function execute(raw: string) {
  echoCommand(raw);
  const line = raw.trim();
  if (!line) return;
  const parts = line.split(/\s+/);
  const name = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1);

  const entry = lookup(commands, name);
  if (entry) return void entry.run(args);

  const c = contacts.find((x) => x.label === name);
  if (c) return void openLink(c);

  print(`command not found: ${name} — type \`help\``, "err");
}

// ── tab completion ────────────────────────────────────────────────────────
function completions(value: string): [string[], string] {
  const parts = value.split(/\s+/);
  const last = (parts.at(-1) ?? "").toLowerCase();
  if (parts.length === 1) {
    const names = Object.keys(commands)
      .filter((k) => !lookup(commands, k)?.hidden)
      .concat(contacts.map((c) => c.label));
    return [names.filter((n) => n.startsWith(last)).sort(), last];
  }
  const head = (parts[0] ?? "").toLowerCase();
  const pool =
    head === "cat"
      ? Object.keys(files)
      : head === "open"
        ? contacts.map((c) => c.label)
        : head === "ls"
          ? ["contact/"]
          : [];
  return [pool.filter((n) => n.startsWith(last)).sort(), last];
}

function commonPrefix(list: string[]) {
  let p = list[0] ?? "";
  for (const s of list) while (!s.startsWith(p)) p = p.slice(0, -1);
  return p;
}

function complete() {
  const [hits, last] = completions(input.value);
  if (!hits.length) return;
  const prefix = commonPrefix(hits);
  if (prefix.length > last.length) {
    input.value =
      input.value.slice(0, input.value.length - last.length) +
      prefix +
      (hits.length === 1 ? " " : "");
    sync();
  } else if (hits.length > 1) {
    echoCommand(input.value);
    print(hits.join("  "), "out");
    scrollBottom();
  }
}

// ── self-playing boot sequence ────────────────────────────────────────────
const T = {
  beforeType: 200,
  char: 28,
  jitter: 20,
  beforeEnter: 140,
  afterOutput: 220,
};

let booting = true;
let skipped = false;
let wake: (() => void) | null = null;
let bootDone: Promise<unknown> = Promise.resolve();

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    if (skipped) return resolve();
    const t = setTimeout(() => ((wake = null), resolve()), ms);
    wake = () => ((clearTimeout(t), (wake = null)), resolve());
  });

// Fast-forward, and wake the sleep already in flight instead of waiting it out.
const skip = () => {
  skipped = true;
  wake?.();
};

async function typeText(el: HTMLElement, text: string) {
  for (const ch of text) {
    if (skipped) {
      el.textContent = text;
      return;
    }
    el.textContent += ch;
    await sleep(T.char + Math.random() * T.jitter);
  }
}

/** Commands a `#hash` may run — output-only, so a shared link can't navigate. */
const HASH_SAFE = new Set([
  "help",
  "whoami",
  "ls",
  "cat",
  "neofetch",
  "uname",
  "date",
  "uptime",
  "echo",
  "pwd",
  "history",
  "sudo",
]);

function runHash() {
  let raw: string;
  try {
    raw = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
  } catch {
    return; // malformed percent-escape, e.g. /#50%
  }
  if (!raw) return;
  if (!HASH_SAFE.has((raw.split(/\s+/)[0] ?? "").toLowerCase())) return;
  removeHint();
  execute(raw);
  scrollBottom();
}

async function boot() {
  try {
    const blocks = [...output.querySelectorAll<HTMLElement>(".cmdblock")];
    const hint = document.getElementById("hint");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      input.focus({ preventScroll: true });
      return;
    }

    // Visually hidden but still focused, so keystrokes during the intro land
    // in the prompt instead of being dropped on the floor.
    inputline.classList.add("booting");
    input.focus({ preventScroll: true });
    output.setAttribute("aria-busy", "true");

    hint?.classList.add("pending");
    for (const b of blocks) {
      b.classList.add("pending");
      b.querySelector(".blockout")?.classList.add("pending");
    }

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");

    for (const b of blocks) {
      const cmdEl = b.querySelector<HTMLElement>(".cmd");
      if (!cmdEl) continue;
      const text = b.dataset.cmd ?? cmdEl.textContent ?? "";
      cmdEl.textContent = "";
      b.classList.remove("pending");
      cmdEl.after(cursor);
      scrollBottom();

      await sleep(T.beforeType);
      await typeText(cmdEl, text);
      await sleep(T.beforeEnter);

      cursor.remove();
      b.querySelector(".blockout")?.classList.remove("pending");
      scrollBottom();
      await sleep(T.afterOutput);
    }

    output.removeAttribute("aria-busy");
    hint?.classList.remove("pending");
    inputline.classList.remove("booting");
    input.focus({ preventScroll: true });
    scrollBottom();
  } finally {
    booting = false;
  }
}

// ── input handling ────────────────────────────────────────────────────────
input.addEventListener("input", sync);

input.addEventListener("keydown", async (e: KeyboardEvent) => {
  // !shiftKey leaves ctrl+shift+… alone — notably ctrl+shift+c for devtools.
  if (e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
    const k = e.key.toLowerCase();
    // Never take ctrl+c when there is actually something selected to copy.
    if (k === "c" && window.getSelection()?.toString()) return;
    if (k === "l") return (e.preventDefault(), clear());
    if (k === "u") return (e.preventDefault(), (input.value = ""), sync());
    if (k === "a") return (e.preventDefault(), input.setSelectionRange(0, 0));
    if (k === "e")
      return (
        e.preventDefault(),
        input.setSelectionRange(input.value.length, input.value.length)
      );
    if (k === "c") {
      e.preventDefault();
      echoCommand(input.value + "^C");
      input.value = "";
      sync();
      return void scrollBottom();
    }
    if (k === "d") {
      e.preventDefault();
      if (!input.value) (noEscape(), scrollBottom());
      return;
    }
  }

  if (e.key === "Tab") {
    // An empty prompt lets Tab do its normal job and move focus onward.
    if (!input.value) return;
    e.preventDefault();
    return void complete();
  }

  if (e.key === "Enter") {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    sync();
    // Enter during the intro fast-forwards it, then runs in the right order.
    if (booting) {
      skip();
      await bootDone;
    }
    if (v.trim()) {
      if (cmdHistory.at(-1) !== v) cmdHistory.push(v);
      removeHint();
    }
    hidx = cmdHistory.length;
    execute(v);
    scrollBottom();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (hidx > 0) {
      hidx--;
      input.value = cmdHistory[hidx] ?? "";
      sync();
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (hidx < cmdHistory.length) {
      hidx++;
      input.value = cmdHistory[hidx] ?? "";
      sync();
    }
  }
});

// Keep the prompt focused; don't steal focus while selecting text, clicking
// links, or operating the window controls.
terminal.addEventListener("click", (e: MouseEvent) => {
  if ((e.target as Element).closest("a, button")) return;
  // Don't pull focus (and the mobile keyboard) into a collapsed window.
  if (terminal.classList.contains("minimized")) return;
  if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
});

// ── window controls ───────────────────────────────────────────────────────
// Yellow and green do the real thing, which is the surprise. Red is the only
// one that refuses — and it points at the `exit` joke.
function windowAction(action: string, btn: HTMLButtonElement) {
  if (action === "close") {
    // Un-minimize first, or the refusal would be printed out of sight.
    terminal.classList.remove("minimized");
    screenEl.inert = false;
    const min = document.querySelector<HTMLButtonElement>(
      '[data-window="minimize"]',
    );
    // setAttribute, not .ariaPressed: property reflection is missing before
    // Firefox 119, where the assignment would silently become an expando.
    if (min) min.setAttribute("aria-pressed", "false");

    terminal.classList.remove("shake");
    void terminal.offsetWidth; // reflow, so a second click replays it
    terminal.classList.add("shake");
    print("close: cannot close terminal: resource busy — try `exit`", "err");
    scrollBottom();
    return;
  }

  const on = terminal.classList.toggle(
    action === "minimize" ? "minimized" : "zoomed",
  );
  btn.setAttribute("aria-pressed", String(on));
  if (action === "minimize") {
    // max-height:0 hides it visually only — inert takes the collapsed content
    // out of the tab order and the accessibility tree too.
    screenEl.inert = on;
    if (on) input.blur();
  }
  if (!(action === "minimize" && on)) input.focus({ preventScroll: true });
}

terminal.addEventListener("animationend", (e: AnimationEvent) => {
  if (e.animationName === "shake") terminal.classList.remove("shake");
});

for (const btn of document.querySelectorAll<HTMLButtonElement>(
  "[data-window]",
)) {
  btn.disabled = false; // inert until the shell is running
  const action = btn.dataset.window;
  if (action) btn.addEventListener("click", () => windowAction(action, btn));
}

// Any key or click fast-forwards; the keystroke itself still reaches the input.
window.addEventListener("keydown", skip, { once: true });
screenEl.addEventListener("click", skip, { once: true });

// The catch matters: `await bootDone` in the Enter handler must never reject,
// or a failure here would silently swallow the visitor's first command.
bootDone = boot()
  .then(runHash)
  .catch((err) => console.error("shell:", err));

// Changing the fragment on the same page never reloads, so `/#neofetch`
// followed from this page (the README links it) would otherwise do nothing.
// Deferred behind bootDone so output can't interleave with the intro.
window.addEventListener("hashchange", () => void bootDone.then(runHash));
