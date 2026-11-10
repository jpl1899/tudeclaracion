import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Minimal Vitest config — mostly pure-function unit tests. Server-rendered
 * component tests (renderToStaticMarkup, node environment) need Vite's Oxc
 * transform to compile JSX, because tsconfig keeps `jsx: preserve` for
 * Next.js. No jsdom / @vitejs/plugin-react: add them when an interactive
 * component test lands.
 */
export default defineConfig({
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Scoped to app source only — .claude/skills/**/*.test.ts files use
    // Bun's own bun:test runner (skill tooling, not app code) and must not
    // be picked up by Vitest's default repo-wide glob.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
