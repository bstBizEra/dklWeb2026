import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**", "src/payload/migrations/**", "src/payload-types.ts"],
  },
];

export default eslintConfig;
