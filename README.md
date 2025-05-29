# Notion Avatar Svelte

[![Built with Svelte](https://img.shields.io/badge/Built%20With-Svelte-FF3E00?style=flat&logo=svelte)](https://svelte.dev/)
[![UI Components: shadcn-svelte](https://img.shields.io/badge/UI-shadcn--svelte-black?style=flat)](https://next.shadcn-svelte.com/)
[![State Management: Runed](https://img.shields.io/badge/State-Runed-orange?style=flat)](https://runed.dev/)
[![Available on JSrepo](https://img.shields.io/badge/JSrepo-@stickerdaniel%2Fnotion--avatar--svelte-yellow?style=flat)](https://jsrepo.com/@stickerdaniel/notion-avatar-svelte)

A customizable Notion-style avatar editor built with Svelte 5, featuring a clean, responsive UI and modern state management.

![CleanShot 2025-05-13 at 02 15 03@2x](https://github.com/user-attachments/assets/6ef9f94b-8801-4997-8ba9-e3ac6f59030d)

**Live Demo:** https://avatar.daniel.sticker.name/

## 📋 Features

- **Intuitive Avatar Editor**: Customize faces, hair, accessories, and more
- **Modern State Management**: Built with Svelte 5 Runes and Runed for powerful, reactive state
- **Undo/Redo Support**: Full history tracking with Runed StateHistory
- **Import/Export**: Save and load avatar configurations as JSON
- **Mobile-Friendly**: Responsive design works on all screen sizes
- **Accessible UI**: Built with shadcn-svelte components for accessibility

## ⚡ Quick Start with jsrepo

The easiest way to add the Notion Avatar Editor to your Svelte 5 project:

### Prerequisites

- Svelte 5 project with shadcn-svelte@next configured
- [jsrepo](https://jsrepo.com/) CLI installed

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

To render the Avatar Editor:

```svelte
<script lang="ts">
	import AvatarCreator from '$lib/components/ui/avatar-editor/avatar-editor.svelte';
</script>

<AvatarCreator />
```

### Advanced: Accessing Avatar Context

To access the avatar context anywhere in your app, add to your `+layout.svelte`:

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

Then you can use in any component:

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

## 🔧 Manual Installation

### Prerequisites

- [Bun](https://bun.sh/) (recommended)
- Git

#### Installing Bun

**macOS and Linux**

> **Linux users** — The `unzip` package is required to install Bun. Use `sudo apt install unzip` to install `unzip` package. Kernel version 5.6 or higher is strongly recommended, but the minimum is 5.1. Use `uname -r` to check Kernel version.

```bash
# macOS, Linux, and WSL
curl -fsSL https://bun.sh/install | bash

# To install a specific version
curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.13"
```

**Windows**

```powershell
# PowerShell/cmd.exe
powershell -c "irm bun.sh/install.ps1|iex"
```

> Bun requires a minimum of Windows 10 version 1809. For support and discussion, please join the **#windows channel on the Bun Discord**.

### Step 1: Clone the Repository

```bash
git clone https://github.com/stickerdaniel/notion-avatar-svelte
cd notion-avatar-svelte
```

Or download and extract the zip file.

### Step 2: Install Dependencies

```bash
# Install dependencies
bun install
```

## 🚀 Running the Application

### Using VSCode

The project includes VSCode tasks for common operations:

1. Press `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux) to run the default build task
2. Select "bun dev (run dev server)" from the task list

Alternatively, open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and type "Run Task", then select "bun dev (run dev server)".

### Using Command Line

```bash
# Start the development server
bun run dev

# Or start the server and open in a browser
bun run dev -- --open
```

The application will be available at `http://localhost:5173/`.

## 🏗️ Architecture

### State Management

The application uses a modern state management approach with Svelte 5 Runes and the Runed library:

```typescript
// Class-based store with Svelte 5 Runes
export class AvatarStoreClass implements IAvatar {
	// Reactive state with $state rune
	configJSON = $state<string>('');

	// Derived state with $derived rune
	previewConfig = $derived<AvatarConfiguration>(this._parseConfigJSON());

	// History tracking with Runed
	private _history: StateHistory<string>;
}
```

Key aspects of the state management:

- **Single Source of Truth**: The `configJSON` string is the core state that drives everything
- **Derived Values**: Computed properties using `$derived` reactively update when dependencies change
- **History Management**: The `StateHistory` class from Runed provides undo/redo functionality
- **Context API**: The store is made available app-wide using Runed's `Context` system

## 🎨 Customization

### Theming

The project uses Tailwind CSS with customizable themes via shadcn-svelte:

1. Visit [shadcn-svelte themes](https://next.shadcn-svelte.com/themes) to explore and customize the color palette
2. Edit the `src/app.css` file to apply your custom theme variables

### Adding New Avatar Parts

To add new avatar parts:

1. Add SVG files to `static/avatar-editor/part/[category]/[category]-[index].svg`
2. Add preview images to `static/avatar-editor/preview/[category]/[index].svg`
3. Update the `DEFAULT_CATEGORIES` array in `src/lib/components/ui/avatar-editor/types.ts`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgements

- Inspired by [Mayandev/notion-avatar](https://github.com/Mayandev/notion-avatar)
- Built with [Svelte 5](https://svelte.dev/)
- UI components from [next.shadcn-svelte.com](https://next.shadcn-svelte.com/)
- State management with [Runed](https://runed.dev/)

---

**Note**: This project is not affiliated with Notion. The avatar style is inspired by Notion's UI.
