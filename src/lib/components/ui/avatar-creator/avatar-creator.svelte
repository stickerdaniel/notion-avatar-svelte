<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import AvatarPreview from './avatar-preview.svelte';
	import CategorySelector from './category-selector.svelte';
	import ColorSelector from './color-selector.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedDiceButton from './animated-dice-button.svelte';
	import { onMount } from 'svelte';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { DEFAULT_CATEGORIES, type Category } from './types';
	import { Undo2, Redo2 } from '@lucide/svelte';

	// Get the Avatar store instance from context
	const avatarStore = avatarContext.get();
	// Ensure avatarStore is not undefined, though context.get() should throw if not set.
	if (!avatarStore) {
		// This case should ideally not happen if context is set in layout
		throw new Error('AvatarStore not found in context. Make sure it is set in a parent layout.');
	}

	const categories: Category[] = DEFAULT_CATEGORIES;
	let activeTab = $state(categories[0]?.id ?? '');

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
		<Card.Title>Hello! Stranger? Let's fix that.</Card.Title>
		<Card.Description>Put a face to your username.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex w-full flex-col-reverse justify-center gap-4 lg:flex-row">
			<CategorySelector
				bind:activeTab
				bind:selectedItems={avatarStore.selectedItems}
				{categories}
			/>
			<div class="flex grow flex-col items-center gap-4">
				<div class="flex grow items-center">
					<AvatarPreview
						svgDataUrl={avatarStore.previewAvatarSvgDataUrl}
						previewBgClass={avatarStore.previewAvatarBgClass}
					/>
				</div>
				<div
					class="flex w-full flex-col items-end justify-between gap-4 sm:flex-row-reverse md:flex-row-reverse lg:flex-col lg:items-end"
				>
					<div class="flex w-full justify-between gap-2">
						<div class="flex gap-2">
							<Button
								variant="secondary"
								size="icon"
								disabled={!avatarStore.canUndo}
								aria-label="Undo"
								onclick={avatarStore.undo}
								class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
							>
								<div class="flex h-full w-full items-center justify-center">
									<Undo2 class="h-4 w-4" />
								</div>
							</Button>
							<Button
								variant="secondary"
								size="icon"
								disabled={!avatarStore.canRedo}
								aria-label="Redo"
								onclick={avatarStore.redo}
								class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
							>
								<div class="flex h-full w-full items-center justify-center">
									<Redo2 class="h-4 w-4" />
								</div>
							</Button>
						</div>
						<AnimatedDiceButton
							onDicethrow={avatarStore.generateRandomAvatar}
							ariaLabel="Generate random avatar"
							variant="secondary"
							size="icon"
						/>
					</div>
					<ColorSelector bind:selectedColor={avatarStore.selectedAvatarColorName}></ColorSelector>
				</div>
				<div class="grid w-full flex-col items-start gap-1.5">
					<Label for="username">Your Username</Label>
					<Input
						type="text"
						class="w-full"
						id="username"
						bind:value={avatarStore.previewUsername}
					/>
				</div>
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex justify-end space-x-2">
		<Button onclick={avatarStore.saveAvatar}>Save</Button>
	</Card.Footer>
</Card.Root>
