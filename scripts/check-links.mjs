// Link check. Run with: pnpm links:check [base-url] [--skip-external]
// Crawls every page reachable from "/" and "/app" on a running site (default http://127.0.0.1:3000; start
// it with `pnpm build && pnpm start` first) and checks each link found:
//   - internal pages return 200 (redirects are reported too),
//   - "#anchor" links point at an id on the target page,
//   - tel: and mailto: links are well formed,
//   - external URLs answer below 400 (skipped with --skip-external, e.g. when offline).
// Exits 1 when anything fails, so it can gate a release. External checks read status codes only: some
// sites (Facebook, X) answer 200 with a login page.
const args = process.argv.slice(2);
const base = (args.find((arg) => !arg.startsWith("--")) ?? process.env.LINKS_BASE ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const skipExternal = args.includes("--skip-external");
const fileLink = /\.(webp|png|jpe?g|svg|pdf|ico|xml|txt|webmanifest|js|css)$/i;
const skipCrawl = (path) => path.startsWith("/admin") || path.startsWith("/api");

const decode = (value) => value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const where = (from) => [...from].slice(0, 3).join(", ") + (from.size > 3 ? ` +${from.size - 3} more` : "");

const pages = new Map(); // path -> { status, location, ids }
const links = new Map(); // href -> Set of pages linking to it
const queue = ["/", "/app"];

async function load(path) {
  const response = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const html = response.headers.get("content-type")?.includes("text/html") ? await response.text() : "";
  return { status: response.status, location: response.headers.get("location"), ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])), html };
}

try {
  await fetch(base, { signal: AbortSignal.timeout(10000) });
} catch {
  console.error(`No site answers at ${base}. Start it first (pnpm build && pnpm start), or pass the base URL.`);
  process.exit(1);
}

while (queue.length > 0) {
  const path = queue.shift();
  if (pages.has(path)) continue;
  const { html, ...page } = await load(path);
  pages.set(path, page);

  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!links.has(href)) links.set(href, new Set());
    links.get(href).add(path);

    if (href.startsWith("/") && !href.startsWith("//")) {
      const target = new URL(href, base).pathname;
      if (!fileLink.test(target) && !skipCrawl(target) && !pages.has(target)) queue.push(target);
    }
  }
}

const problems = [];
const external = [];

for (const [href, from] of links) {
  if (href.startsWith("#")) {
    for (const path of from) if (href.length > 1 && !pages.get(path).ids.has(decodeURIComponent(href.slice(1)))) problems.push(`missing anchor ${href} on ${path}`);
  } else if (/^(mailto|tel):/i.test(href)) {
    if (!/^(mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}|tel:\+?\d{6,})$/i.test(href.split("?")[0])) problems.push(`malformed ${href} (from ${where(from)})`);
  } else if (/^https?:\/\//i.test(href)) {
    external.push([href, from]);
  } else if (!href.startsWith("/")) {
    problems.push(`unexpected link ${href} (from ${where(from)})`);
  } else {
    const url = new URL(href, base);
    const page = pages.get(url.pathname) ?? (await load(url.pathname));
    if (page.status >= 400) problems.push(`${page.status} ${href} (from ${where(from)})`);
    else if (page.status >= 300) problems.push(`redirect ${page.status} ${href} -> ${page.location} (from ${where(from)})`);
    if (url.hash && page.status === 200 && !page.ids.has(decodeURIComponent(url.hash.slice(1)))) problems.push(`missing anchor ${href} (from ${where(from)})`);
  }
}

if (!skipExternal) {
  const results = await Promise.all(
    external.map(async ([href, from]) => {
      try {
        const response = await fetch(href, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 (DK LAO link check)" } });
        return response.status < 400 ? null : `${response.status} ${href} (from ${where(from)})`;
      } catch (error) {
        return `unreachable ${href}: ${error.cause?.code ?? error.name} (from ${where(from)})`;
      }
    }),
  );
  problems.push(...results.filter(Boolean));
}

console.log(`${base}: ${pages.size} pages, ${links.size} unique links, ${external.length} external${skipExternal ? " (not checked)" : ""}.`);
if (problems.length === 0) {
  console.log("All links work.");
} else {
  console.log(`${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exit(1);
}
