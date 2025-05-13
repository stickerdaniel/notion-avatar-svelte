<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CategorySelector from './category-selector.svelte';
	import ColorSelector from './color-selector.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedDiceButton from './animated-dice-button.svelte';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { DEFAULT_CATEGORIES, type Category, type SelectedItems, type ColorName } from './types';
	import { Undo2, Redo2 } from '@lucide/svelte';
	import * as Avatar from './avatar/index.js';

	// Get the Avatar store instance from context
	const avatarStore = avatarContext.get();
	// Ensure avatarStore is not undefined, though context.get() should throw if not set.
	if (!avatarStore) {
		// This case should ideally not happen if context is set in layout
		throw new Error('AvatarStore not found in context. Make sure it is set in a parent layout.');
	}

	const categories: Category[] = DEFAULT_CATEGORIES;
	let activeTab = $state(categories[0]?.id ?? '');

	// Local copies of state that we'll sync with the store
	let selectedItems = $state<SelectedItems>({ ...avatarStore.previewConfig.items });
	let selectedColor = $state<ColorName>(avatarStore.previewConfig.colorName);
	let username = $state<string>(avatarStore.previewConfig.username);

	// Watch for changes in our local state and update the store
	$effect(() => {
		// Skip updates if an undo/redo operation is in progress
		if (avatarStore.isUndoRedoOperation) return;

		avatarStore.updateConfig((config) => {
			config.items = selectedItems;
		});
	});

	$effect(() => {
		// Skip updates if an undo/redo operation is in progress
		if (avatarStore.isUndoRedoOperation) return;

		avatarStore.updateConfig((config) => {
			config.colorName = selectedColor;
		});
	});

	$effect(() => {
		// Skip updates if an undo/redo operation is in progress
		if (avatarStore.isUndoRedoOperation) return;

		avatarStore.updateConfig((config) => {
			config.username = username;
		});
	});

	// Watch for changes in the store and update our local state
	$effect(() => {
		selectedItems = { ...avatarStore.previewConfig.items };
		selectedColor = avatarStore.previewConfig.colorName;
		username = avatarStore.previewConfig.username;
	});

	// Optional: Example of reacting to the save event from the store
	$effect(() => {
		if (avatarStore.lastSaveTimestamp) {
			console.log(
				'Avatar saved at:',
				new Date(avatarStore.lastSaveTimestamp).toLocaleTimeString(),
				'Data:',
				avatarStore.lastSaveData
			);
			// Here you could trigger a toast notification, etc.
		}
	});
</script>

<Card.Root class="w-full max-w-2xl">
	<Card.Header>
		<Card.Title>Hello, stranger! Let's fix that.</Card.Title>
		<Card.Description>Put a face to your username.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex w-full flex-col-reverse justify-center gap-4 lg:flex-row">
			<CategorySelector bind:activeTab bind:selectedItems {categories} />
			<div class="flex grow flex-col items-center gap-4">
				<div class="flex grow items-center">
					<Avatar.Root usePreview={true} class="h-36 w-36">
						<Avatar.Image />
						<Avatar.Fallback />
					</Avatar.Root>
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
					<ColorSelector bind:selectedColor></ColorSelector>
				</div>
				<div class="grid w-full flex-col items-start gap-1.5">
					<Label for="username">Your Username</Label>
					<Input type="text" class="w-full" id="username" bind:value={username} />
				</div>
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end space-x-2">
		<Button onclick={avatarStore.saveAvatar}>Save</Button>
	</Card.Footer>
</Card.Root>
