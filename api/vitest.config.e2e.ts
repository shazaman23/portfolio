import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// End-to-end tests against LocalStack and Mailhog; see test/support.ts for how
// to run them.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // One file at a time: they share LocalStack and Mailhog.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
