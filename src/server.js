const http = require('node:http');

const homepage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Codex Test</title>
    <script>
      (() => {
        const preference = window.matchMedia('(prefers-color-scheme: dark)');
        let savedTheme;

        try {
          savedTheme = localStorage.getItem('theme');
        } catch {}

        const theme = savedTheme === 'light' || savedTheme === 'dark'
          ? savedTheme
          : preference.matches ? 'dark' : 'light';

        document.documentElement.dataset.theme = theme;
      })();
    </script>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        --background: #f4f7fb;
        --glow: #dce8ff;
        --surface: rgba(255, 255, 255, 0.86);
        --text: #172033;
        --muted: #5e6a7d;
        --border: rgba(23, 32, 51, 0.11);
        --accent: #375dfb;
        --accent-soft: #e8edff;
        --shadow: 0 24px 70px rgba(55, 93, 251, 0.13);
      }

      :root[data-theme="dark"] {
        color-scheme: dark;
        --background: #0c1220;
        --glow: #17254b;
        --surface: rgba(21, 29, 48, 0.88);
        --text: #f4f7ff;
        --muted: #abb6ca;
        --border: rgba(226, 232, 255, 0.13);
        --accent: #8da2ff;
        --accent-soft: #26345f;
        --shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
      }

      * { box-sizing: border-box; }

      body {
        display: grid;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
        place-items: center;
        color: var(--text);
        background:
          radial-gradient(circle at 50% 15%, var(--glow), transparent 38rem),
          var(--background);
        transition: color 180ms ease, background-color 180ms ease;
      }

      main {
        width: min(100%, 42rem);
        padding: clamp(2rem, 8vw, 4.5rem);
        text-align: center;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 1.75rem;
        box-shadow: var(--shadow);
        backdrop-filter: blur(16px);
      }

      .eyebrow {
        margin: 0 0 1rem;
        color: var(--accent);
        font-size: 0.78rem;
        font-weight: 750;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      h1 { margin: 0; font-size: clamp(2.35rem, 8vw, 4.5rem); line-height: 1.05; letter-spacing: -0.055em; }
      main > p:last-of-type { margin: 1.25rem auto 2rem; color: var(--muted); font-size: 1.1rem; line-height: 1.7; }

      .theme-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        min-height: 2.8rem;
        padding: 0.5rem 0.8rem 0.5rem 0.65rem;
        color: var(--text);
        font: inherit;
        font-weight: 700;
        background: var(--accent-soft);
        border: 1px solid var(--border);
        border-radius: 999px;
        cursor: pointer;
      }

      .theme-toggle:hover { transform: translateY(-1px); }
      .theme-toggle:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
      .theme-toggle__icon { display: grid; width: 1.8rem; height: 1.8rem; place-items: center; font-size: 1.05rem; }

      @media (prefers-reduced-motion: no-preference) {
        .theme-toggle { transition: transform 150ms ease, background-color 180ms ease; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Your workspace is ready</p>
      <h1>Hello from Node.js</h1>
      <p>This small web app is up and running.</p>
      <button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false">
        <span class="theme-toggle__icon" aria-hidden="true"></span>
        <span class="theme-toggle__label"></span>
      </button>
    </main>
    <script>
      (() => {
        const toggle = document.querySelector('#theme-toggle');
        const icon = toggle.querySelector('.theme-toggle__icon');
        const label = toggle.querySelector('.theme-toggle__label');

        function render(theme) {
          const isDark = theme === 'dark';
          document.documentElement.dataset.theme = theme;
          toggle.setAttribute('aria-pressed', String(isDark));
          toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
          icon.textContent = isDark ? '☀' : '☾';
          label.textContent = isDark ? 'Light' : 'Dark';
        }

        toggle.addEventListener('click', () => {
          const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
          render(theme);

          try {
            localStorage.setItem('theme', theme);
          } catch {}
        });

        render(document.documentElement.dataset.theme);
      })();
    </script>
  </body>
</html>`;

function createServer() {
  return http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(homepage);
      return;
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = { createServer };
