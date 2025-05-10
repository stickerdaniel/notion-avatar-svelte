<script lang="ts">
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { Check } from '@lucide/svelte';
	import { COLORS, AVATAR_COLOR_STYLES, type ColorName } from './AvatarStore.svelte';

	let {
		selectedColor = $bindable<ColorName | undefined>()
	}: {
		selectedColor?: ColorName;
	} = $props();
</script>

<ToggleGroup.Root
	type="single"
	bind:value={selectedColor}
	class="flex items-center data-[orientation='horizontal']:flex-row data-[orientation='vertical']:flex-col data-[orientation='horizontal']:-space-x-3 data-[orientation='vertical']:-space-y-2"
>
	{#each COLORS as color (color)}
		<ToggleGroup.Item
			value={color}
			aria-label={`Select color ${color}`}
			class={`transform rounded-full ring-2 ring-background transition-transform duration-75 ease-in-out ${AVATAR_COLOR_STYLES[color].base} ${AVATAR_COLOR_STYLES[color].hover} ${AVATAR_COLOR_STYLES[color].selected} active:scale-95 ${selectedColor !== color ? 'hover:scale-105' : ''}`}
		>
			{#if selectedColor === color}<Check color="" />{/if}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
