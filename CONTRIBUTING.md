# Contributing

Contributions are welcome! Open an issue or submit a Pull Request.

## Local Setup

### Prerequisites

- [Bun](https://bun.sh/)
- Git

### Clone the Repository

```bash
git clone https://github.com/stickerdaniel/notion-avatar-svelte
cd notion-avatar-svelte
bun install
```

### Run the Development Server

```bash
# Start the development server
bun run dev

# Or start the server and open in a browser
bun run dev -- --open
```

In VS Code, press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux) to run the default build task, which starts the server and opens it in a browser.

## Scripts

Run each with `bun run <script>`.

| Script             | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `dev`              | Start the development server                            |
| `build`            | Prerender the site into `build/`                        |
| `preview`          | Serve the production build                              |
| `check`            | Type-check with svelte-check; warnings fail             |
| `lint`             | Check Prettier formatting and run ESLint; warnings fail |
| `format`           | Format every file with Prettier                         |
| `test:unit`        | Run the Vitest unit tests in `src/`                     |
| `test:e2e`         | Build, serve and run the Playwright tests in `e2e/`     |
| `test`             | Run `test:unit`, then `test:e2e`                        |
| `deploy`           | Build and deploy to Cloudflare Pages                    |
| `release:registry` | Publish the components to the jsrepo registry           |

## Tests

The end-to-end tests need Chromium, installed once with `bunx playwright install chromium`. They serve the build on port 4173; set `PLAYWRIGHT_PORT` to run them in several checkouts at once:

```bash
PLAYWRIGHT_PORT=4180 bun run test:e2e
```

## Deploy

The site is fully prerendered and deploys to Cloudflare Pages, configured in `wrangler.jsonc`. Pushes to `main` run the [CI workflow](.github/workflows/ci.yml), which deploys the newest `main` commit to production once its checks pass. `static/_headers` sets long-lived caching for hashed assets and denies framing on Cloudflare Pages. To deploy manually:

```bash
bunx wrangler login
bun run deploy
```

Umami analytics is optional. To enable it, set `PUBLIC_UMAMI_SRC` and `PUBLIC_UMAMI_WEBSITE_ID` (see `.env.example`) when building; without both, the build has no analytics script. CI builds without them.

## Before You Commit

```bash
bun run format
bun run lint
bun run check
```
