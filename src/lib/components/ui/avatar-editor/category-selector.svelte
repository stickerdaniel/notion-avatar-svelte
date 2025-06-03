<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as RadioToggleGroup from '$lib/components/ui/radio-toggle-group/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronsDown, ChevronsUp } from '@lucide/svelte';
	import { mode } from 'mode-watcher';
	import { type Category, type SelectedItems, getPartImagePath } from './types';

	let {
		activeTab = $bindable<string>(''),
		categories,
		currentSelectedItems,
		onItemSelect
	}: {
		activeTab?: string;
		categories: Category[];
		currentSelectedItems: SelectedItems;
		onItemSelect: (categoryId: string, itemIndex: number) => void;
	} = $props();

	if (!activeTab && categories.length > 0) {
		activeTab = categories[0].id;
	}

	// Track loaded images to prevent showing broken placeholders
	let loadedImages = $state<Set<string>>(new Set());

	function handleImageLoad(imageSrc: string) {
		loadedImages.add(imageSrc);
		loadedImages = new Set(loadedImages); // Trigger reactivity
	}

	function handleImageError(imageSrc: string) {
		// Don't add to loaded set if there's an error
		console.warn('Failed to load image:', imageSrc);
	}

	function scrollTabs(direction: 'up' | 'down') {
		const categoryIds = categories.map((category) => category.id);
		const currentIdx = categoryIds.indexOf(activeTab);
		const currentIndex = currentIdx === -1 ? 0 : currentIdx;

		const n = categoryIds.length;
		if (n === 0) return;
		const delta = direction === 'up' ? -1 : 1;
		const newIndex = (currentIndex + delta + n) % n;

		activeTab = categoryIds[newIndex];
	}
</script>

<Tabs.Root bind:value={activeTab} class="flex items-start gap-2">
	<!-- Tab list with scroll buttons -->
	<div class="flex h-fit flex-col gap-2">
		<Button
			class="w-full transform transition-transform duration-75 ease-in-out active:scale-95"
			variant="secondary"
			size="icon"
			aria-label="Scroll Up"
			onclick={() => scrollTabs('up')}
		>
			<div
				class="flex h-full w-full transform items-center justify-center transition-transform duration-150 ease-in-out hover:scale-125"
			>
				<ChevronsUp class="size-4" />
			</div>
		</Button>

		<!-- Tab list -->
		<Tabs.List class="h-fit flex-col items-stretch">
			{#each categories as category (category.id)}
				<Tabs.Trigger
					value={category.id}
					class={`transform transition-transform duration-75 ease-in-out active:scale-95 ${category.id !== activeTab ? 'hover:scale-105' : ''}`}
					>{category.name}</Tabs.Trigger
				>
			{/each}
		</Tabs.List>

		<Button
			class="w-full transform transition-transform duration-75 ease-in-out active:scale-95"
			variant="secondary"
			size="icon"
			aria-label="Scroll Down"
			onclick={() => scrollTabs('down')}
		>
			<div
				class="flex h-full w-full transform items-center justify-center transition-transform duration-150 ease-in-out hover:scale-125"
			>
				<ChevronsDown class="size-4" />
			</div>
		</Button>
	</div>

	<!-- Tab content -->
	{#each categories as category (category.id)}
		{@const currentCategoryItemIndex = currentSelectedItems[category.id] ?? 0}
		{@const radioGroupValueForDisplay = category.id + currentCategoryItemIndex.toString()}
		<Tabs.Content value={category.id} class="mt-0 h-fit lg:w-[12.2rem]">
			<ScrollArea class="h-106 w-full rounded-md border">
				<RadioToggleGroup.Root
					variant="outline"
					value={radioGroupValueForDisplay}
					class="flex flex-wrap justify-start gap-1 p-2"
					role="radiogroup"
					aria-label={`${category.name} items`}
				>
					{#each Array(category.maxItems) as _, index (index)}
						{@const imageSrc = getPartImagePath(category.id, index)}
						{@const itemValueForComparison = category.id + index.toString()}
						{@const isImageLoaded = loadedImages.has(imageSrc)}
						<RadioToggleGroup.Item
							value={itemValueForComparison}
							aria-label={`Select ${category.name} ${index + 1}`}
							class="size-14 p-0 transition-transform duration-75 ease-in-out active:scale-95"
							onclick={() => onItemSelect(category.id, index)}
							aria-checked={radioGroupValueForDisplay === itemValueForComparison}
						>
							<div
								class={`flex h-full w-full transform items-center justify-center transition-transform duration-5 ease-in-out ${radioGroupValueForDisplay !== itemValueForComparison ? 'hover:scale-110' : ''} active:scale-100 active:duration-0`}
							>
								{#if isImageLoaded}
									<img
										src={imageSrc}
										alt={`${category.name} Preview ${index + 1}`}
										class="h-full w-full scale-50 object-contain"
										style={$mode === 'dark'
											? radioGroupValueForDisplay === itemValueForComparison
												? 'filter: invert(1); opacity: 1;'
												: 'filter: invert(1); opacity: 0.65;'
											: radioGroupValueForDisplay === itemValueForComparison
												? 'opacity: 1;'
												: 'opacity: 0.65;'}
										loading="lazy"
									/>
								{:else}
									<!-- Hidden image to trigger loading -->
									<img
										src={imageSrc}
										alt=""
										class="pointer-events-none absolute opacity-0"
										loading="lazy"
										onload={() => handleImageLoad(imageSrc)}
										onerror={() => handleImageError(imageSrc)}
									/>
									<!-- Empty placeholder while loading -->
									<div class="h-full w-full"></div>
								{/if}
							</div>
						</RadioToggleGroup.Item>
					{/each}
				</RadioToggleGroup.Root>
			</ScrollArea>
		</Tabs.Content>
	{/each}
</Tabs.Root>
