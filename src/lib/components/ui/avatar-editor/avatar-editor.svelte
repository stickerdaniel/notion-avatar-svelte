<!-- src/lib/components/ui/avatar-editor/avatar-editor.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CategorySelector from './category-selector.svelte';
	import ColorSelector from './color-selector.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedDiceButton from './animated-dice-button.svelte';
	import { avatarContext } from './avatarContext';
	import {
		DEFAULT_CATEGORIES,
		type Category,
		type ColorName,
		type AvatarConfiguration
	} from './types';
	import { Undo, Redo, Download } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/utils.js';

	// Get the Avatar store instance from context
	const avatarStore = avatarContext.get();

	const categories: Category[] = DEFAULT_CATEGORIES;
	let activeTab = $state(categories[0]?.id ?? ''); // For CategorySelector UI

	// Event handler for username input
	function handleUsernameInput(event: Event) {
		const newUsername = (event.currentTarget as HTMLInputElement).value;
		avatarStore.updateConfig((config: AvatarConfiguration) => {
			config.username = newUsername;
		});
	}

	// Event handler for color selection
	function handleColorSelect(color: ColorName) {
		avatarStore.updateConfig((config: AvatarConfiguration) => {
			config.colorName = color;
		});
	}

	// Event handler for item selection in CategorySelector
	function handleItemSelect(categoryId: string, itemIndex: number) {
		avatarStore.updateConfig((config: AvatarConfiguration) => {
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
				currentSelectedItems={avatarStore.config.items}
				onItemSelect={handleItemSelect}
			/>
			<div class="flex w-full grow flex-col-reverse items-center gap-4 lg:flex-col">
				<div class="flex w-full grow flex-col items-center justify-end gap-6 lg:gap-0">
					<div class="flex h-full flex-col items-center justify-center gap-2">
						<Avatar.Root class="size-36 {avatarStore.bgClass}">
							<Avatar.Image
								src={avatarStore.svgDataUrl}
								alt="Avatar for {avatarStore.config.username} with {avatarStore.config
									.colorName} background"
							/>
							<Avatar.Fallback />
						</Avatar.Root>
						<p class="h-4 text-lg font-medium">{avatarStore.config.username}</p>
					</div>
					<div
						class="flex w-full flex-col items-end gap-4 sm:flex-row-reverse sm:justify-between lg:flex-col lg:items-end"
					>
						<Tooltip.Provider>
							<div class="flex gap-2">
								<Tooltip.Root>
									<Tooltip.Trigger
										disabled={!avatarStore.canUndo}
										aria-label="Undo"
										onclick={avatarStore.undo}
										class={cn(
											buttonVariants({ variant: 'secondary', size: 'icon' }),
											'transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95'
										)}
										data-umami-event="avatar-undo"
									>
										<Undo />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Undo</p>
									</Tooltip.Content>
								</Tooltip.Root>
								<Tooltip.Root>
									<Tooltip.Trigger
										disabled={!avatarStore.canRedo}
										aria-label="Redo"
										onclick={avatarStore.redo}
										class={cn(
											buttonVariants({ variant: 'secondary', size: 'icon' }),
											'transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95'
										)}
										data-umami-event="avatar-redo"
									>
										<Redo />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Redo</p>
									</Tooltip.Content>
								</Tooltip.Root>
								<AnimatedDiceButton
									onDicethrow={avatarStore.generateRandomAvatar}
									tooltipText="Generate random avatar"
									variant="secondary"
									size="icon"
								/>
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
			<DropdownMenu.Trigger class={cn(buttonVariants({ variant: 'ghost' }), 'gap-2')}>
				<Download size={16} />
				Download
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item
					onclick={avatarStore.downloadAvatarWithoutOutline}
					data-umami-event="avatar-download-transparent"
				>
					Transparent Background
				</DropdownMenu.Item>
				<DropdownMenu.Item
					onclick={avatarStore.downloadAvatarWithOutline}
					data-umami-event="avatar-download-outlined"
				>
					Transparent with Outline
				</DropdownMenu.Item>
				<DropdownMenu.Item
					onclick={avatarStore.downloadAvatarWithBackground}
					data-umami-event="avatar-download-background"
				>
					Colored Background
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Button onclick={avatarStore.saveAvatar} data-umami-event="avatar-save">Save</Button>
	</Card.Footer>
</Card.Root>
