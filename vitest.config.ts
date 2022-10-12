import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'miniflare',
    environmentOptions: {
      modules: true,
      // Miniflare doesn't support the main option in wrangler.toml yet, so we need this
      buildCommand: 'wrangler publish --dry-run --outdir dist',
      scriptPath: 'dist/index.js',
    },
    coverage: {
      enabled: true,
      clean: false,
      // Istanbul comes up with much more accurate coverage reports than c8 here
      provider: 'istanbul',
      reporter: ['text', 'html', 'clover', 'json', 'json-summary', 'lcov'],
    },
  },
})
