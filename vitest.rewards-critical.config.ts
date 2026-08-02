import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: [
      "tests/security/**/*.test.ts",
      "tests/rewards-critical/**/*.test.ts",
      "tests/integrations/**/*.test.ts",
    ],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "src/features/integrations/**/*.ts",
        "src/lib/**/*reward*.ts",
        "src/lib/**/*ledger*.ts",
      ],
      exclude: ["**/*.d.ts", "**/*.server.ts", "**/types.ts", "**/index.ts"],
      thresholds: { lines: 60, functions: 60, statements: 60, branches: 50 },
    },
  },
});
