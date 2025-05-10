<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronsDown, ChevronsUp } from '@lucide/svelte';
	import { type Category, type SelectedItems, getPartImagePath } from './types';

	let {
		selectedItems = $bindable<SelectedItems>(),
		activeTab = $bindable<string>(),
		categories
	}: {
		selectedItems?: SelectedItems;
		activeTab?: string;
		categories: Category[];
	} = $props();

	// Initialize selectedValues for each category using $state
	let selectedValues = $state<Record<string, string>>({});

	// Watch for changes in selectedValues and update selectedItems
	$effect(() => {
		const newSelectedItems: SelectedItems = {};

		for (const [categoryId, value] of Object.entries(selectedValues)) {
			if (value) {
				// Extract the index from the value and ensure it's a valid number
				const indexStr = value.replace(categoryId, '');
				const parsedIndex = parseInt(indexStr, 10);

				// Only add if it's a valid number
				if (!isNaN(parsedIndex)) {
					newSelectedItems[categoryId] = parsedIndex;
				}
			}
		}

		selectedItems = newSelectedItems;
	});

	// Initialize selectedValues from selectedItems prop
	$effect(() => {
		if (selectedItems) {
			for (const [categoryId, indexValue] of Object.entries(selectedItems)) {
				if (indexValue !== undefined && indexValue !== null) {
					selectedValues[categoryId] = categoryId + indexValue.toString();
				}
			}
		}
	});

	// Navigation between tabs
	function scrollTabs(direction: 'up' | 'down') {
		const categoryIds = categories.map((category) => category.id);
		const currentIndex = categoryIds.indexOf(activeTab);

		const n = categoryIds.length;
		const delta = direction === 'up' ? -1 : 1;
		const newIndex = (currentIndex + delta + n) % n;

		// Update active tab
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
				<ChevronsUp class="h-4 w-4" />
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
				<ChevronsDown class="h-4 w-4" />
			</div>
		</Button>
	</div>

	<!-- Tab content -->
	{#each categories as category (category.id)}
		<Tabs.Content value={category.id} class="mt-0 h-fit lg:w-[12.2rem]">
			<ScrollArea class="h-[26.5rem] w-full rounded-md border">
				<ToggleGroup.Root
					type="single"
					variant="outline"
					bind:value={selectedValues[category.id]}
					class="flex flex-wrap justify-start gap-1 p-2"
				>
					{#each Array(category.maxItems) as _, index (index)}
						{@const imageSrc = getPartImagePath(category.id, index)}
						<ToggleGroup.Item
							value={category.id + index.toString()}
							aria-label={`Select ${category.name} ${index + 1}`}
							class="h-14 w-14 p-0 transition-transform duration-75 ease-in-out active:scale-95"
						>
							<div
								class={`duration-5 flex h-full w-full transform items-center justify-center transition-transform ease-in-out ${selectedValues[category.id] !== category.id + index.toString() ? 'hover:scale-110' : ''} active:scale-100 active:duration-0`}
							>
								<img
									src={imageSrc}
									alt={`${category.name} Preview ${index + 1}`}
									class="h-full w-full scale-50 object-contain"
									loading="lazy"
								/>
							</div>
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</ScrollArea>
		</Tabs.Content>
	{/each}
</Tabs.Root>
