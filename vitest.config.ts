import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // Agent worktrees under .claude/ hold other branches' copies of the tests.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
  resolve: {
    alias: {
      "@payload-config": new URL("./src/payload.config.ts", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
