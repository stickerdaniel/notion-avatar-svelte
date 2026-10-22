<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as RadioToggleGroup from '$lib/components/ui/radio-toggle-group/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronsDown, ChevronsUp } from '@lucide/svelte';
	import { untrack } from 'svelte';
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

	// Open the first category once on creation; the tabs own `activeTab` afterwards
	untrack(() => {
		if (!activeTab && categories.length > 0) {
			activeTab = categories[0].id;
		}
	});

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
			data-umami-event="category-scroll-up"
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
			data-umami-event="category-scroll-down"
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
		{@const selectedIndex = currentSelectedItems[category.id]}
		<!-- A null item selects no radio; bits-ui treats '' as an empty group -->
		{@const selectedValue = selectedIndex === null ? '' : String(selectedIndex)}
		<Tabs.Content value={category.id} class="mt-0 h-fit lg:w-[12.2rem]">
			<ScrollArea class="h-104 w-full rounded-md border">
				<RadioToggleGroup.Root
					variant="outline"
					value={selectedValue}
					onValueChange={(value) => onItemSelect(category.id, Number(value))}
					class="flex flex-wrap justify-start gap-1 p-2"
					aria-label={`${category.name} items`}
				>
					{#each Array(category.maxItems) as _, index (index)}
						{@const imageSrc = getPartImagePath(category.id, index)}
						{@const itemValue = String(index)}
						<RadioToggleGroup.Item
							value={itemValue}
							aria-label={`Select ${category.name} ${index + 1}`}
							class="size-14 p-0 transition-transform duration-75 ease-in-out active:scale-95"
							data-umami-event="part-selected-{category.id}-{index}"
						>
							<div
								class={`flex h-full w-full transform items-center justify-center transition-transform duration-5 ease-in-out ${selectedValue !== itemValue ? 'hover:scale-110' : ''} active:scale-100 active:duration-0`}
							>
								<img
									src={imageSrc}
									alt={`${category.name} Preview ${index + 1}`}
									class={[
										'h-full w-full scale-50 object-contain dark:invert',
										selectedValue !== itemValue && 'opacity-65'
									]}
									loading="lazy"
									decoding="async"
								/>
							</div>
						</RadioToggleGroup.Item>
					{/each}
				</RadioToggleGroup.Root>
			</ScrollArea>
		</Tabs.Content>
	{/each}
</Tabs.Root>
