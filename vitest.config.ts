/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    globals: true,
    setupFiles: [], // optional: e.g. for Pinia or global mocks
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['tests/', 'node_modules/'],
    },
  },
})
