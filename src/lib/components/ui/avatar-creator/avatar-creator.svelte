<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CategorySelector from './category-selector.svelte';
	import ColorSelector from './color-selector.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedDiceButton from './animated-dice-button.svelte';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { DEFAULT_CATEGORIES, type Category, type ColorName, type SelectedItems } from './types';
	import { Undo2, Redo2 } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';

	// Get the Avatar store instance from context
	const avatarStore = avatarContext.get();
	// Ensure avatarStore is not undefined, though context.get() should throw if not set.
	if (!avatarStore) {
		// This case should ideally not happen if context is set in layout
		throw new Error('AvatarStore not found in context. Make sure it is set in a parent layout.');
	}

	const categories: Category[] = DEFAULT_CATEGORIES;
	let activeTab = $state(categories[0]?.id ?? ''); // For CategorySelector UI

	// Event handler for username input
	function handleUsernameInput(event: Event) {
		const newUsername = (event.currentTarget as HTMLInputElement).value;
		avatarStore.updateConfig((config) => {
			config.username = newUsername;
		});
	}

	// Event handler for color selection
	function handleColorSelect(color: ColorName) {
		avatarStore.updateConfig((config) => {
			config.colorName = color;
		});
	}

	// Event handler for item selection in CategorySelector
	function handleItemSelect(categoryId: string, itemIndex: number) {
		avatarStore.updateConfig((config) => {
			config.items[categoryId] = itemIndex;
		});
	}
</script>

<Card.Root class="w-full max-w-2xl">
	<Card.Header>
		<Card.Title>Hello, stranger! Let's fix that.</Card.Title>
		<Card.Description>Put a face to your name.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex w-full flex-col-reverse justify-center gap-4 lg:flex-row">
			<CategorySelector
				bind:activeTab
				{categories}
				currentSelectedItems={avatarStore.previewConfig.items}
				onItemSelect={handleItemSelect}
			/>
			<div class="flex grow flex-col items-center gap-4">
				<div class="flex grow flex-col items-center justify-center gap-3">
					<Avatar.Root class="h-36 w-36 {avatarStore.previewBgClass}">
						<Avatar.Image src={avatarStore.previewSvgDataUrl} />
						<Avatar.Fallback />
					</Avatar.Root>
					<span class="h-4 text-lg font-medium">{avatarStore.previewConfig.username}</span>
				</div>
				<div
					class="flex w-full flex-col items-end justify-between gap-4 sm:flex-row-reverse md:flex-row-reverse lg:flex-col lg:items-end"
				>
					<div class="flex gap-2">
						<Button
							variant="secondary"
							size="icon"
							disabled={!avatarStore.canUndo}
							aria-label="Undo"
							onclick={avatarStore.undo}
							class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
						>
							<Undo2 />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							disabled={!avatarStore.canRedo}
							aria-label="Redo"
							onclick={avatarStore.redo}
							class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
						>
							<Redo2 />
						</Button>
						<AnimatedDiceButton
							onDicethrow={avatarStore.generateRandomAvatar}
							ariaLabel="Generate random avatar"
							variant="secondary"
							size="icon"
						/>
					</div>
					<ColorSelector
						selectedValue={avatarStore.previewConfig.colorName}
						onColorSelect={handleColorSelect}
					/>
				</div>
				<div class="grid w-full flex-col items-start gap-1.5">
					<Label for="username">Your Name</Label>
					<Input
						type="text"
						class="w-full"
						id="username"
						value={avatarStore.previewConfig.username}
						oninput={handleUsernameInput}
					/>
				</div>
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end space-x-2">
		<Button onclick={avatarStore.saveAvatar}>Save</Button>
	</Card.Footer>
</Card.Root>
