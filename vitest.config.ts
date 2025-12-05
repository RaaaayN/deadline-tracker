import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  projects: [
    {
      test: {
        name: 'node',
        environment: 'node',
        include: ['apps/api/**/*.test.ts', 'packages/**/*.test.ts'],
      },
    },
    {
      test: {
        name: 'web',
        environment: 'jsdom',
        setupFiles: ['./apps/web/vitest.setup.ts'],
        include: ['apps/web/**/*.test.ts', 'apps/web/**/*.test.tsx'],
      },
    },
  ],
});

