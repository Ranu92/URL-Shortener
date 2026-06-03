import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

config({ path: '.env' });

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    // Integration tests share a single Postgres database and TRUNCATE it in
    // beforeEach. Run test files serially so one file's reset cannot wipe
    // another file's rows mid-test.
    fileParallelism: false,
  },
});
