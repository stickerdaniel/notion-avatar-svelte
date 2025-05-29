<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { getRadioToggleGroupCtx } from './radio-toggle-group.svelte';
	import { cn } from '$lib/utils/utils';
	import { type ToggleVariants, toggleVariants } from '$lib/components/ui/toggle/index.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size,
		variant,
		...restProps
	}: RadioGroupPrimitive.ItemProps & ToggleVariants = $props();

	const ctx = getRadioToggleGroupCtx();
</script>

<RadioGroupPrimitive.Item
	bind:ref
	class={cn(
		toggleVariants({
			variant: ctx.variant || variant,
			size: ctx.size || size
		}),
		ctx.variant === 'outline' || variant === 'outline' ? 'data-[state=checked]:bg-accent' : '',
		className
	)}
	{value}
	{...restProps}
/>
