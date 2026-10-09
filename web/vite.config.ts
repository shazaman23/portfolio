import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// In QA and production, CloudFront sends /api/* to the API and /assets/* to
// the media bucket. Locally, the dev server's proxies do the same; Compose
// points them at the api and localstack containers.
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';
const assetsBucket = new URL(
  process.env.ASSETS_BUCKET_URL ??
    'http://localhost:4566/jakekillpack-assets-local',
);

export default defineConfig({
  plugins: [react()],
  build: {
    // Vite's default, assets/, would put the built JS and CSS under /assets/,
    // which CloudFront routes to the media bucket.
    assetsDir: 'static',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 4 and the ported partials use @import, global functions,
        // and darken()/lighten(), all deprecated in Dart Sass 1.x.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // `vite preview` reuses these, so a production build can be tried locally.
    proxy: {
      '/api': apiUrl,
      '/assets': {
        target: assetsBucket.origin,
        changeOrigin: true,
        // The bucket's keys start with assets/, so /assets/img/x.webp reads
        // <bucket>/assets/img/x.webp, as it does through CloudFront.
        rewrite: (path) => assetsBucket.pathname + path,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
