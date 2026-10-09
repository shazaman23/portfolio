import { defineConfig } from 'vitest/config';

// End-to-end tests against LocalStack and Mailhog; see test/support.ts for how
// to run them.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // One file at a time: they share LocalStack and Mailhog.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
