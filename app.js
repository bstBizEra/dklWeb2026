// Entry file for cPanel's Application Manager. Phusion Passenger starts "app.js" in the application folder
// and may load it with require(), which cannot load a module that uses top-level await. So this file has
// none: it loads the real server, server.mjs, with a dynamic import.
import("./server.mjs").catch((error) => {
  console.error("[app] could not start the DK LAO server:", error);
  process.exit(1);
});
