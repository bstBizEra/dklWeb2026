import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    // Build output is matched at any depth: a leftover worktree under .claude/worktrees/ keeps its own
    // .next and node_modules, and a root-relative pattern misses those, so `pnpm lint` reported tens of
    // thousands of problems in generated files.
    ignores: ["**/.next/**", ".ua/**", ".claude/**", "**/node_modules/**", "**/dist/**", "coverage/**", "src/payload/migrations/**", "src/payload-types.ts"],
  },
];

export default eslintConfig;
