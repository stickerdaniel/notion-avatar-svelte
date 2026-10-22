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

In VS Code and its forks like Cursor, press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux) to run the default build task, which starts the server and opens it in a browser.

## Deploy

The site is fully prerendered and deploys to Cloudflare Pages, configured in `wrangler.jsonc`:

```bash
bunx wrangler login
bun run deploy
```

## Before You Commit

```bash
# Format, lint, and type check
bun run pre-commit
```
