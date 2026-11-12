
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['verbose'],
    fileParallelism: false,
    exclude: [
      'dist/**',
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/generated/**',
        'src/tests/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/vitest.config.ts',
        '**/*.d.ts',
      ],
    },
  },
});