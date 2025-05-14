# Notion Avatar Svelte

[![Built with Svelte](https://img.shields.io/badge/Built%20With-Svelte-FF3E00?style=flat&logo=svelte)](https://svelte.dev/)
[![UI Components: shadcn-svelte](https://img.shields.io/badge/UI-shadcn--svelte-black?style=flat)](https://next.shadcn-svelte.com/)
[![State Management: Runed](https://img.shields.io/badge/State-Runed-7149EB?style=flat)](https://runed.dev/)

A customizable Notion-style avatar creator built with Svelte 5, featuring a clean, responsive UI and modern state management.

![CleanShot 2025-05-13 at 02 15 03@2x](https://github.com/user-attachments/assets/6ef9f94b-8801-4997-8ba9-e3ac6f59030d)

**Live Demo:** [notion-avatar-svelte.vercel.app](https://notion-avatar-svelte.vercel.app/)

## 📋 Features

- **Intuitive Avatar Creator**: Customize faces, hair, accessories, and more
- **Modern State Management**: Built with Svelte 5 Runes and Runed for powerful, reactive state
- **Undo/Redo Support**: Full history tracking with Runed StateHistory
- **Import/Export**: Save and load avatar configurations as JSON
- **Mobile-Friendly**: Responsive design works on all screen sizes
- **Accessible UI**: Built with shadcn-svelte components for accessibility

## 🔧 Installation

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

### Component Structure

The UI is built with [shadcn-svelte](https://next.shadcn-svelte.com/) components:

- **Avatar Creator**: Main component for customizing avatars
- **Category Selector**: Interface for selecting different avatar parts
- **Color Selector**: UI for choosing avatar background colors
- **Animated Dice Button**: Interactive randomizer with animation

## 🎨 Customization

### Theming

The project uses Tailwind CSS with customizable themes via shadcn-svelte:

1. Visit [shadcn-svelte themes](https://next.shadcn-svelte.com/themes) to explore and customize the color palette
2. Edit the `src/app.css` file to apply your custom theme variables
3. Update the `tailwind.config.ts` file to extend or modify the theme further

### Adding New Avatar Parts

To add new avatar parts:

1. Add SVG files to `static/avatar-creator/part/[category]/[category]-[index].svg`
2. Add preview images to `static/avatar-creator/preview/[category]/[index].svg`
3. Update the `DEFAULT_CATEGORIES` array in `src/lib/components/ui/avatar-creator/types.ts`

## 📦 Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

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