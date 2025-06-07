# Notion Avatar Svelte

[![Built with Svelte](https://img.shields.io/badge/Built%20With-Svelte-d43106?style=flat&logo=svelte)](https://svelte.dev/)
[![UI Components: shadcn-svelte](https://img.shields.io/badge/UI-shadcn--svelte-black?style=flat)](https://next.shadcn-svelte.com/)
[![State Management: Runed](https://img.shields.io/badge/State-Runed-f64a00?style=flat)](https://runed.dev/)
[![Available on JSrepo](https://img.shields.io/badge/JSrepo-@stickerdaniel%2Fnotion--avatar--svelte-f7dd1e?style=flat)](https://jsrepo.com/@stickerdaniel/notion-avatar-svelte)

A customizable Notion-style avatar editor built with Svelte 5

![CleanShot 2025-06-07 at 14 18 44@2x](https://github.com/user-attachments/assets/1a49979c-6053-4f45-9862-afbc128ceaba)

https://avatar.daniel.sticker.name/

**Undo/Redo Support**: History tracking with [Runed](https://runed.dev/) StateHistory

**State Management**: Built with Svelte 5 Runes and Runed

**Import/Export**: Save and load avatar configurations as JSON

**Accessible UI**: Built with [shadcn-svelte](https://next.shadcn-svelte.com/) components

## Quick Start with jsrepo

The easiest way to add the Notion Avatar Editor to your Svelte 5 project:

### Prerequisites

- Svelte 5 project
- [jsrepo](https://jsrepo.com/) CLI
- [bun](https://bun.sh/) (recommended, this guide uses [bun](https://bun.sh/) but you can use npm or pnpm if you prefer)

### Installation

```bash
# Install jsrepo CLI (if not already installed)
bun add -g jsrepo

# Initialize shadcn-svelte in your project (if not already done)
bunx shadcn-svelte@next init

# Add the avatar editor component
jsrepo add @stickerdaniel/notion-avatar-svelte/ui/avatar-editor
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

## Manual Installation

### Prerequisites

- [Bun](https://bun.sh/)
- Git

### Clone the Repository

```bash
git clone https://github.com/stickerdaniel/notion-avatar-svelte
cd notion-avatar-svelte
```

Or download and extract the zip file.

### Install Dependencies

```bash
# Install dependencies
bun install
```

### Lets run the development server

The project includes tasks for common operations. They work for VSCode and all forked editors like Cursor.

1. Press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux) to run the default build task
2. Select "bun dev (run dev server)" from the task list

Or, open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and type "Run Task", then select "bun dev (run dev server)".

### Command Line

```bash
# Start the development server
bun run dev

# Or start the server and open in a browser
bun run dev -- --open
```

The application will be available at `http://localhost:5173/`.

## Architecture Overview

### State Management

The application uses a modern state management approach with Svelte 5 Runes and the Runed library:

```typescript
// Class-based store with Svelte 5 Runes
export class AvatarStoreClass implements IAvatar {
	// Reactive state with $state rune
	configJSON = $state<string>('');

	// Undo/Redo History tracking with Runed
	private _history: StateHistory<string>;
}
```

Key aspects of the state management:

- **Single Source of Truth**: The `configJSON` string is the core state that drives everything
- **Derived Values**: Computed properties using `$derived` reactively update when dependencies change
- **History Management**: The `StateHistory` class from Runed provides undo/redo functionality
- **Context API**: The store is made available app-wide using Runed's `Context` system

## Customization

### Theming

The project uses Tailwind CSS with customizable themes via shadcn-svelte:

1. Visit [shadcn-svelte themes](https://next.shadcn-svelte.com/themes) to explore and customize the color palette
2. Edit the `src/app.css` file to apply your custom theme variables

### Adding New Avatar Parts

To add new avatar parts:

1. Add SVG files to `src/lib/components/ui/avatar-editor/assets/parts/[category]/[category]-[index].svg`
2. Add preview images to `src/lib/components/ui/avatar-editor/assets/preview/[category]/[index].svg`
3. Update the `DEFAULT_CATEGORIES` array in `src/lib/components/ui/avatar-editor/types.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Graphics from [Mayandev/notion-avatar](https://github.com/Mayandev/notion-avatar)

---

This project is not affiliated with Notion. The avatar style is inspired by Notion's UI.
