const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createServer } = require('../src/server');

let baseUrl;
let server;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET / serves the homepage', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(body, /<h1>Hello from Node\.js<\/h1>/);
});

test('homepage includes an accessible theme toggle', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.match(body, /<button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false">/);
  assert.match(body, /toggle\.setAttribute\('aria-label', isDark \? 'Switch to light mode' : 'Switch to dark mode'\)/);
});

test('homepage restores a saved theme and falls back to the system preference', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.match(body, /localStorage\.getItem\('theme'\)/);
  assert.match(body, /window\.matchMedia\('\(prefers-color-scheme: dark\)'\)/);
  assert.match(body, /localStorage\.setItem\('theme', theme\)/);
  assert.match(body, /document\.documentElement\.dataset\.theme = theme/);
});

test('unknown paths return 404', async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not found');
});
