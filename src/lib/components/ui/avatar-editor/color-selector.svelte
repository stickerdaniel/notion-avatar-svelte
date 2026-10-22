<script lang="ts">
	import * as RadioToggleGroup from '$lib/components/ui/radio-toggle-group/index.js';
	import { Check } from '@lucide/svelte';
	import { COLORS, type ColorName } from './types';
	import { AVATAR_COLOR_STYLES } from './AvatarStore.svelte';
	import { cn } from '$lib/utils/utils';

	let {
		selectedValue,
		onColorSelect
	}: {
		selectedValue: ColorName | undefined;
		onColorSelect: (color: ColorName) => void;
	} = $props();

	// bits-ui reports plain strings; only known colours reach the store
	function handleValueChange(value: string) {
		const color = COLORS.find((candidate) => candidate === value);
		if (color) onColorSelect(color);
	}
</script>

<RadioToggleGroup.Root
	value={selectedValue}
	onValueChange={handleValueChange}
	class="flex flex-row items-center -space-x-3"
	aria-label="Color Selector"
>
	{#each COLORS as color (color)}
		<RadioToggleGroup.Item
			value={color}
			aria-label={`Select color ${color}`}
			class={cn(
				'ring-background transform rounded-full ring-2 transition-transform duration-75 ease-in-out',
				'z-0 active:scale-95',
				selectedValue === color ? '' : 'hover:scale-105 ',
				AVATAR_COLOR_STYLES[color as ColorName].base,
				AVATAR_COLOR_STYLES[color as ColorName].hover,
				AVATAR_COLOR_STYLES[color as ColorName].selected
			)}
			data-umami-event="color-selected-{color}"
		>
			{#if selectedValue === color}<Check color="" />{/if}
		</RadioToggleGroup.Item>
	{/each}
</RadioToggleGroup.Root>
