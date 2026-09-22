import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['verbose'],
    fileParallelism: false,
    setupFiles: ['./src/tests/setup.ts'],
  },
});