// Unit tests for the CloudFront Functions in this folder. Terraform renders
// each .js file with templatefile(), so the tests render them the same way.
//
//   docker run --rm -v "$PWD/terraform/modules/site/functions:/f:ro" -w /f node:22-alpine node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function load(file, vars = {}) {
  let src = readFileSync(new URL(file, import.meta.url), 'utf8');
  for (const [name, value] of Object.entries(vars)) {
    src = src.replaceAll('${' + name + '}', String(value));
  }
  return new Function(src + '\nreturn handler;')();
}

function viewerRequest({ uri, host = 'qa.jakekillpack.com', querystring = {} }) {
  return { request: { method: 'GET', uri, querystring, headers: { host: { value: host } }, cookies: {} } };
}

const qa = load('viewer-request.js', { noindex: true });
const prod = load('viewer-request.js', { noindex: false });

// ---- client-side routes ----
for (const uri of ['/', '/experience/1', '/experience/', '/v1.2/page']) {
  test(`extensionless ${uri} serves /index.html`, () => {
    assert.equal(prod(viewerRequest({ uri })).uri, '/index.html');
  });
}

for (const uri of ['/index.html', '/favicon.ico', '/static/index-3f9a1c.js']) {
  test(`file ${uri} passes through`, () => {
    assert.equal(prod(viewerRequest({ uri })).uri, uri);
  });
}

// ---- www -> apex ----
test('www redirects to the apex with a 301, keeping the path', () => {
  const res = prod(viewerRequest({ uri: '/experience/1', host: 'www.jakekillpack.com' }));
  assert.equal(res.statusCode, 301);
  assert.equal(res.headers.location.value, 'https://jakekillpack.com/experience/1');
});

test('www redirect keeps the query string, including repeats and bare keys', () => {
  const res = prod(viewerRequest({
    uri: '/',
    host: 'www.jakekillpack.com',
    querystring: {
      utm_source: { value: 'linkedin' },
      tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] },
      preview: { value: '' },
    },
  }));
  assert.equal(res.headers.location.value, 'https://jakekillpack.com/?utm_source=linkedin&tag=a&tag=b&preview');
});

test('a non-www host is not redirected', () => {
  const res = qa(viewerRequest({ uri: '/experience/1', host: 'qa.jakekillpack.com' }));
  assert.equal(res.statusCode, undefined);
  assert.equal(res.uri, '/index.html');
});

// ---- robots.txt ----
test('noindex: /robots.txt disallows all crawling', () => {
  const res = qa(viewerRequest({ uri: '/robots.txt' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data, 'User-agent: *\nDisallow: /\n');
  assert.equal(res.body.encoding, 'text');
  assert.match(res.headers['content-type'].value, /^text\/plain/);
  assert.equal(res.headers['x-robots-tag'].value, 'noindex, nofollow');
});

test('without noindex, /robots.txt comes from the bucket', () => {
  assert.equal(prod(viewerRequest({ uri: '/robots.txt' })).uri, '/robots.txt');
});

// ---- noindex header (viewer response) ----
test('noindex response function adds X-Robots-Tag and keeps other headers', () => {
  const noindex = load('noindex.js');
  const res = noindex({
    request: { uri: '/' },
    response: { statusCode: 200, headers: { 'content-type': { value: 'text/html' } } },
  });
  assert.equal(res.headers['x-robots-tag'].value, 'noindex, nofollow');
  assert.equal(res.headers['content-type'].value, 'text/html');
});
