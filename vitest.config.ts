import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/hooks/useOptions.ts",
        "src/hooks/useStatistics.ts",
        "src/i18n/createI18n.ts",
        "src/lib/{AccuracyUtil,ClassificationUtil,DateUtil,InstallUtil,LearnModelUtil,MailAddressUtil,MessageBodyUtil,MessageUtil,StatisticsUtil,StorageUtil,TagUtil}.ts",
        "src/models/LogEntry.ts",
        "src/options/pages/OptionsPage.tsx",
      ],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
})
