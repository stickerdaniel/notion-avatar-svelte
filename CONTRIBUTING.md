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

## Tests

```bash
# Unit tests (Vitest)
bun run test:unit

# End-to-end tests (Playwright); install Chromium once first
bunx playwright install chromium
bun run test:e2e

# Both
bun run test
```

## Deploy

The site is fully prerendered and deploys to Cloudflare Pages, configured in `wrangler.jsonc`. Pushes to `main` run the [CI workflow](.github/workflows/ci.yml), which deploys the newest `main` commit to production once its checks pass. To deploy manually:

```bash
bunx wrangler login
bun run deploy
```

## Before You Commit

```bash
bun run format
bun run lint
bun run check
```
