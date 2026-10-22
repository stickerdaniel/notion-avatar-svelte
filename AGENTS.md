# AGENTS.md

Notion-style avatar editor, also published as the jsrepo registry `@stickerdaniel/notion-avatar-svelte`. Scripts, tests and the pre-commit checks are in `package.json` and `CONTRIBUTING.md`.

## Registry contract

- jsrepo ships the whole `src/lib/components/ui/avatar-editor/` and `src/lib/components/ui/radio-toggle-group/` folders. Every name they export is consumer API, so renaming or removing one is a breaking change.
- Tests live outside those folders (`src/lib/*.test.ts`, `e2e/`), so they stay out of consumer projects.
- Shipped files import `$lib/...`, and consumers configure `$lib` themselves. The `$lib` alias in `vite.config.ts` stays despite its SvelteKit 3 deprecation; moving to `#lib` would break every consumer at once.
- Bump `registry.version` in `jsrepo.config.ts` before `bun run release:registry`. Version 0.2.0 is already published.

## Avatar editor

- `assets/part/` holds the selector thumbnails and `assets/preview/` the layers composed into the avatar. The folder names stay as they are.
- `AvatarStoreClass` keeps the config as a JSON string in Runed `PersistedState`, which JSON-encodes it again. The `notionAvatarConfig` localStorage entry is therefore double-encoded.

## End-to-end tests

- Seed state from `e2e/storage.ts`: `seedConfig` double-encodes a config object, `seedRawConfig` writes the given bytes as they are, for malformed-storage tests. Both run in an init script before the app loads and write only while the key is absent, so reloads keep what the app stored.

## Pull requests

- End PR bodies with `<Job> with <model> (<effort>) in <tool> via <host>.`
  Repeat `<job> with <model> (<effort>)` joined by `and` for each model that did a job.
  Example: `Implemented with Claude Opus 5.5 (xhigh) and reviewed with GPT-6 Pro (max) in Claude Code via T3 Code.`
  Effort is the run's reasoning setting, or `effort unknown` if nothing states it. Humans are `Human`. Ask for other unknown values.
