import { NextResponse, type NextRequest } from "next/server";

// Language from the URL only (the host's nginx cache keys on the URL, so no cookie or Accept-Language is
// read and nothing redirects by browser language):
//   /lo, /lo/...   Lao pages, served as they are.
//   /en, /en/...   308 to the unprefixed address, so English has one URL per page.
//   anything else  English: rewritten internally to /en/... (the address bar keeps /about).
// API, admin, the phone app (/app), share images (/og), Next internals and files never reach the site routes.
const notSite = /^\/(api|admin|app|og|_next)(\/|$)/;

// Marks our own rewrite. Under a custom server (server.mjs, used by cPanel Passenger) Next runs the proxy
// again on the rewritten /en/... path; without the mark that pass would redirect back and loop. A visitor
// who sends the header on /en/... just gets the English page instead of the redirect.
const rewritten = "x-dklao-locale-rewrite";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (notSite.test(pathname)) return NextResponse.next();

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    if (request.headers.get(rewritten) === "1") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/lo" || pathname.startsWith("/lo/")) return NextResponse.next();

  // Built from request.url, the address the request arrived on, never from request.nextUrl. Next rewrites
  // internally only while the destination keeps that same origin; nextUrl follows X-Forwarded-Proto, so
  // behind the server's nginx and Apache it reads https while the app itself listens on plain http. A
  // destination built from it looked like another site, so Next fetched the page from itself over HTTPS,
  // the handshake failed against the plain-http port, and every English page answered 500 while /lo was
  // fine (preview.dklao.com, 2026-11-02).
  const target = new URL(`/en${pathname === "/" ? "" : pathname}${request.nextUrl.search}`, request.url);
  // The app itself always listens on plain http (127.0.0.1, behind the server's nginx and Apache), and Next
  // compares this destination with the address the request arrived on to decide whether the rewrite stays
  // inside the app. Both request.url and request.nextUrl follow X-Forwarded-Proto, so without this line the
  // destination read https, Next treated it as another site and fetched the page from itself over HTTPS, and
  // every English page answered 500. Revisit only if the app is ever given its own certificate.
  target.protocol = "http:";
  const headers = new Headers(request.headers);
  headers.set(rewritten, "1");
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  // Everything except Next internals and files with an extension (robots.txt, sitemap.xml, favicon.ico,
  // app-sw.js, *.webmanifest, images). The rest of the exclusions are checked above.
  matcher: ["/((?!_next/|.*\\.[^/]+$).*)"],
};
