import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['verbose'],
    fileParallelism: false,
    exclude: [
      'dist/**',
      'node_modules/**',
    ],
  },
});