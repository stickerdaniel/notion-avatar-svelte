<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CategorySelector from './category-selector.svelte';
	import ColorSelector from './color-selector.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedDiceButton from './animated-dice-button.svelte';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { DEFAULT_CATEGORIES, type Category, type ColorName } from './types';
	import { Undo, Redo, Download } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

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
	<Card.Header class="p-4 sm:p-6">
		<Card.Title>Hello, stranger! Let's fix that.</Card.Title>
		<Card.Description>Put a face to your name.</Card.Description>
	</Card.Header>
	<Card.Content class="p-4 sm:p-6">
		<div class="flex w-full flex-col-reverse justify-center gap-4 lg:flex-row">
			<CategorySelector
				bind:activeTab
				{categories}
				currentSelectedItems={avatarStore.config.items}
				onItemSelect={handleItemSelect}
			/>
			<div class="flex w-full grow flex-col-reverse items-center gap-4 lg:flex-col">
				<div class="flex w-full grow flex-col items-center justify-end gap-6 lg:gap-0">
					<div class="flex h-full flex-col items-center justify-center gap-2">
						<Avatar.Root class="h-36 w-36 {avatarStore.bgClass}">
							<Avatar.Image src={avatarStore.svgDataUrl} />
							<Avatar.Fallback />
						</Avatar.Root>
						<span class="h-4 text-lg font-medium">{avatarStore.config.username}</span>
					</div>
					<div
						class="flex w-full flex-col items-end gap-4 sm:flex-row-reverse sm:justify-between lg:flex-col lg:items-end"
					>
						<Tooltip.Provider>
							<div class="flex gap-2">
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Button
											variant="secondary"
											size="icon"
											disabled={!avatarStore.canUndo}
											aria-label="Undo"
											onclick={avatarStore.undo}
											class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
										>
											<Undo />
										</Button>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Undo</p>
									</Tooltip.Content>
								</Tooltip.Root>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Button
											variant="secondary"
											size="icon"
											disabled={!avatarStore.canRedo}
											aria-label="Redo"
											onclick={avatarStore.redo}
											class="transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95"
										>
											<Redo />
										</Button>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Redo</p>
									</Tooltip.Content>
								</Tooltip.Root>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<AnimatedDiceButton
											onDicethrow={avatarStore.generateRandomAvatar}
											ariaLabel="Generate random avatar"
											variant="secondary"
											size="icon"
										/>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Generate random avatar</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</div>
						</Tooltip.Provider>
						<ColorSelector
							selectedValue={avatarStore.config.colorName}
							onColorSelect={handleColorSelect}
						/>
					</div>
				</div>
				<div class="grid w-full flex-col items-start gap-1.5">
					<Label for="username">Your Name</Label>
					<Input
						type="text"
						class="w-full"
						id="username"
						value={avatarStore.config.username}
						oninput={handleUsernameInput}
					/>
				</div>
			</div>
		</div></Card.Content
	>
	<Card.Footer class="flex justify-end space-x-2 p-4 sm:p-6">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="ghost" class="gap-2">
					<Download size={16} />
					Download
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item onclick={avatarStore.downloadAvatarWithoutOutline}>
					Transparent Background
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={avatarStore.downloadAvatarWithOutline}>
					Transparent with Outline
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={avatarStore.downloadAvatarWithBackground}>
					Colored Background
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Button onclick={avatarStore.saveAvatar}>Save</Button>
	</Card.Footer>
</Card.Root>
