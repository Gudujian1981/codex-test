const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const vm = require('node:vm');
const { createServer } = require('../src/server');

let baseUrl;
let server;

function runHomepageScripts(html, { savedTheme = null, prefersDark = false } = {}) {
  const storage = new Map(savedTheme === null ? [] : [['theme', savedTheme]]);
  const icon = { textContent: '' };
  const label = { textContent: '' };
  const attributes = new Map();
  const listeners = new Map();
  const toggle = {
    querySelector(selector) {
      return selector === '.theme-toggle__icon' ? icon : label;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    click() {
      listeners.get('click')();
    },
  };
  const document = {
    documentElement: { dataset: {} },
    querySelector() {
      return toggle;
    },
  };
  const localStorage = {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
  };
  const context = {
    document,
    localStorage,
    window: { matchMedia: () => ({ matches: prefersDark }) },
  };

  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    vm.runInNewContext(match[1], context);
  }

  return { attributes, document, storage, toggle };
}

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

test('saved theme takes precedence over the system preference', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();
  const browser = runHomepageScripts(body, { savedTheme: 'light', prefersDark: true });

  assert.equal(browser.document.documentElement.dataset.theme, 'light');
  assert.equal(browser.attributes.get('aria-pressed'), 'false');
});

test('system preference is used when no saved theme exists', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();
  const browser = runHomepageScripts(body, { prefersDark: true });

  assert.equal(browser.document.documentElement.dataset.theme, 'dark');
  assert.equal(browser.attributes.get('aria-pressed'), 'true');
});

test('clicking the toggle changes and persists the selected theme', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();
  const browser = runHomepageScripts(body);

  browser.toggle.click();

  assert.equal(browser.document.documentElement.dataset.theme, 'dark');
  assert.equal(browser.attributes.get('aria-pressed'), 'true');
  assert.equal(browser.attributes.get('aria-label'), 'Switch to light mode');
  assert.equal(browser.storage.get('theme'), 'dark');
});

test('unknown paths return 404', async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not found');
});
