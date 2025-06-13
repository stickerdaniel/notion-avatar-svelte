# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run Svelte type checking
- `bun run lint` - Run linting and formatting checks
- `bun run pre-commit` - Run format, lint, and type check (use before committing)
- `bun run release:registry` - Publish to JSRepo registry

## Architecture Overview

This is a Notion-style avatar editor built with **Svelte 5**, **SvelteKit**, **shadcn-svelte** components, and **Runed** for state management.

### Core Architecture Components

1. **AvatarStoreClass** (`src/lib/components/ui/avatar-editor/AvatarStore.svelte.ts`)

   - Central state management using Svelte 5 runes
   - Uses Runed's `PersistedState` for localStorage persistence
   - Uses Runed's `StateHistory` for undo/redo functionality
   - Manages avatar configuration, randomization, and SVG generation

2. **Avatar Context** (`src/lib/components/ui/avatar-editor/avatarContext.ts`)

   - Runed Context for sharing AvatarStoreClass across components
   - Set in `+layout.svelte`, accessible in child components via `avatarContext.get()`

3. **Asset Management**

   - SVG assets organized in `src/lib/components/ui/avatar-editor/assets/`
   - Two directories: `part/` (for composing final avatar) and `preview/` (for UI thumbnails)
   - Uses Vite's `import.meta.glob` for efficient asset loading

4. **Layer Rendering System**
   - Defined layer order in `LAYER_ORDER` constant (`types.ts`)
   - Renders from bottom to top: face → details → mouth → nose → eyes → eyebrows → beard → hair → accessories → glasses

### Key Technical Details

- **State Management**: Uses Svelte 5 runes (`$state`, `$derived`, `$effect`) with Runed utilities
- **UI Components**: Built with shadcn-svelte components and Tailwind CSS
- **Asset Handling**: SVG files loaded via Vite glob imports for SSR compatibility
- **Configuration**: Avatar configs are versioned JSON objects with validation
- **JSRepo Integration**: Published as reusable components via JSRepo registry

### Component Distribution

The project is structured for distribution via JSRepo:

- Main avatar editor at `ui/avatar-editor`
- Individual UI components in `ui/` subdirectories
- Utilities and hooks in respective directories

### Adding New Avatar Parts

1. Add SVG files to `assets/part/[category]/[category]-[index].svg`
2. Add preview images to `assets/preview/[category]/[index].svg`
3. Update `maxItems` in `DEFAULT_CATEGORIES` array in `types.ts`

### State Persistence

- Avatar configurations auto-save to localStorage via PersistedState
- Manual save functionality updates timestamps and triggers events
- Full undo/redo history maintained via StateHistory
