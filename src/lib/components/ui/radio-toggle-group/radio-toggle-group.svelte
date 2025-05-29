<script lang="ts" module>
	import { getContext, setContext } from 'svelte';
	import type { ToggleVariants } from '$lib/components/ui/toggle/index.js';
	export function setRadioToggleGroupCtx(props: ToggleVariants) {
		setContext('radioToggleGroup', props);
	}

	export function getRadioToggleGroupCtx() {
		return getContext<ToggleVariants>('radioToggleGroup');
	}
</script>

<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/utils';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = 'default',
		variant = 'default',
		...restProps
	}: RadioGroupPrimitive.RootProps & ToggleVariants = $props();

	setRadioToggleGroupCtx({
		variant,
		size
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<RadioGroupPrimitive.Root
	bind:value={value as never}
	bind:ref
	class={cn('flex items-center justify-center gap-1', className)}
	{...restProps}
/>
