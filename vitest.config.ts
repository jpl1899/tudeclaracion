import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Minimal Vitest config — this repo has no React component tests yet, only
 * pure-function unit tests (see src/lib/validation/*.test.ts), so no
 * @vitejs/plugin-react / jsdom environment is configured. Add those when the
 * first component test lands.
 */
export default defineConfig({
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
