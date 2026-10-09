// Bundles the compiled API into one ESM file for Lambda: build/lambda/index.mjs
// (handler "index.handler"). Run after `nest build`; `npm run bundle` does both.
//
// It bundles tsc's output in dist/, not the TypeScript source, because
// esbuild can't emit the decorator metadata Nest's dependency injection
// reads. tsc already has.
import { build } from 'esbuild';

await build({
  entryPoints: ['dist/lambda.js'],
  outfile: 'build/lambda/index.mjs',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: true,
  minify: true,
  // Nest reads class names in logs and errors.
  keepNames: true,
  legalComments: 'none',
  // Bundled CommonJS packages (Express, class-validator) call require();
  // ESM has no require, so give them one.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  // Optional Nest integrations this API doesn't use. Nest only loads them
  // if they're installed, so leaving them out of the bundle is safe.
  external: [
    '@nestjs/microservices',
    '@nestjs/microservices/*',
    '@nestjs/websockets',
    '@nestjs/websockets/*',
    'class-transformer/storage',
    // Local SMTP only; Lambda always sends through Mailgun.
    'nodemailer',
  ],
  logLevel: 'info',
});
