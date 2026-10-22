# Notion Avatar Svelte

[![Built with Svelte](https://img.shields.io/badge/Built%20With-Svelte-d43106?style=flat&logo=svelte)](https://svelte.dev/)
[![UI Components: shadcn-svelte](https://img.shields.io/badge/UI-shadcn--svelte-black?style=flat)](https://shadcn-svelte.com/)
[![State Management: Runed](https://img.shields.io/badge/State-Runed-f64a00?style=flat)](https://runed.dev/)
[![Available on JSrepo](https://img.shields.io/badge/JSrepo-@stickerdaniel%2Fnotion--avatar--svelte-f7dd1e?style=flat)](https://jsrepo.com/@stickerdaniel/notion-avatar-svelte)

A customizable Notion-style avatar editor built with Svelte 5

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/55d409b2-42f0-4a4d-b221-4935db36f013">
  <img src="https://github.com/user-attachments/assets/87f2c43c-e07a-4870-8641-1d86765101a5" alt="Notion Avatar Editor with an orange avatar and the hair category open" width="100%">
</picture>

https://avatar.daniel.sticker.name/

**Undo/Redo Support**: History tracking with [Runed](https://runed.dev/) StateHistory

**State Management**: Built with Svelte 5 Runes and Runed

**Import/Export**: Save and load avatar configurations as JSON

**Accessible UI**: Built with [shadcn-svelte](https://shadcn-svelte.com/) components

## Quick Start with jsrepo

The easiest way to add the Notion Avatar Editor to your Svelte 5 project:

### Prerequisites

- Svelte 5 project
- A `$lib` alias pointing at `src/lib`. SvelteKit 3 no longer creates it, so add `alias: { $lib: 'src/lib' }` to the `sveltekit()` options in `vite.config.ts`
- [bun](https://bun.sh/) (recommended, this guide uses [bun](https://bun.sh/) but you can use npm or pnpm if you prefer)

### Installation

```bash
# Install jsrepo CLI (if not already installed)
bun add -g jsrepo

# Initialize shadcn-svelte in your project (if not already done)
bunx shadcn-svelte@latest init

# Add the avatar editor component
jsrepo add @stickerdaniel/notion-avatar-svelte/avatar-editor
```

### Usage

add to your `+layout.svelte`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	let { children } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

{@render children()}
```

and then render the Avatar Editor:

```svelte
<script lang="ts">
	import AvatarCreator from '$lib/components/ui/avatar-editor/avatar-editor.svelte';
</script>

<AvatarCreator />
```

You can access the avatar context in any component:

```svelte
<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	// Get the shared avatar store
	const avatar = avatarContext.get();
</script>

<pre class="text-xs">{JSON.stringify(JSON.parse(avatar.configJSON), null, 2)}</pre>
<Avatar.Root>
	<Avatar.Image src={avatar.svgDataUrl} />
	<Avatar.Fallback>Avatar</Avatar.Fallback>
</Avatar.Root>
```

## Customization

### Theming

The project uses Tailwind CSS with customizable themes via shadcn-svelte:

1. Visit [shadcn-svelte themes](https://shadcn-svelte.com/themes) to explore and customize the color palette
2. Edit the `src/app.css` file to apply your custom theme variables

### Adding New Avatar Parts

To add new avatar parts:

1. Add the selector thumbnail to `src/lib/components/ui/avatar-editor/assets/part/[category]/[category]-[index].svg`
2. Add the layer composed into the avatar to `src/lib/components/ui/avatar-editor/assets/preview/[category]/[index].svg`
3. Update the `DEFAULT_CATEGORIES` array in `src/lib/components/ui/avatar-editor/types.ts`

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, scripts and tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Graphics from [Mayandev/notion-avatar](https://github.com/Mayandev/notion-avatar)

---

This project is not affiliated with Notion. The avatar style is inspired by Notion's UI.
