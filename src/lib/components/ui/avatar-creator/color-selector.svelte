<script lang="ts">
	import * as RadioToggleGroup from '$lib/components/ui/radio-toggle-group/index.js';
	import { Check } from '@lucide/svelte';
	import { COLORS, type ColorName } from './types';
	import { AVATAR_COLOR_STYLES } from './AvatarStore.svelte';
	import { cn } from '$lib/utils';

	let {
		selectedColor = $bindable<ColorName | undefined>()
	}: {
		selectedColor?: ColorName;
	} = $props();
</script>

<RadioToggleGroup.Root bind:value={selectedColor} class="flex flex-row items-center -space-x-3">
	{#each COLORS as color (color)}
		<RadioToggleGroup.Item
			value={color}
			aria-label={`Select color ${color}`}
			class={cn(
				'transform rounded-full ring-2 ring-background transition-transform duration-75 ease-in-out',
				'active:scale-95',
				selectedColor === color ? '' : 'hover:scale-105 ',
				AVATAR_COLOR_STYLES[color as ColorName].base,
				AVATAR_COLOR_STYLES[color as ColorName].hover,
				AVATAR_COLOR_STYLES[color as ColorName].selected
			)}
		>
			{#if selectedColor === color}<Check color="" />{/if}
		</RadioToggleGroup.Item>
	{/each}
</RadioToggleGroup.Root>
