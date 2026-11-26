import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";

const vendored = ["components/ui/**", "components/reui/**"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    ignores: vendored,
    plugins: { sonarjs },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "sonarjs/no-commented-code": "error",
      "no-warning-comments": ["error", { terms: ["todo", "fixme"], location: "start" }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "nuqs",
              importNames: [
                "createSerializer",
                "parseAsArrayOf",
                "parseAsBoolean",
                "parseAsFloat",
                "parseAsInteger",
                "parseAsJson",
                "parseAsString",
                "parseAsStringEnum",
                "parseAsStringLiteral",
              ],
              message:
                "Define URL search params (key, parser, default) once in config/search-params.ts and import them from there.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["config/search-params.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    ignores: [...vendored, "hooks/use-persisted-state.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: "Use usePersistedState from hooks/use-persisted-state.ts." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: "Use usePersistedState from hooks/use-persisted-state.ts." },
      ],
    },
  },
  {
    files: ["components/**", "context/**", "hooks/**", "app/**"],
    ignores: ["app/api/**", ...vendored],
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
]);

export default eslintConfig;
