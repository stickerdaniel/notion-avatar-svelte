<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarFallbackProps } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { getAvatarDisplayContext } from './context.js';
	import type { Snippet } from 'svelte';

	// Get context from parent Root
	const { store, usePreview } = getAvatarDisplayContext();

	// Props allow overriding context-derived values or providing children
	interface $$Props extends AvatarFallbackProps {
		children?: Snippet;
		class?: string;
	}

	let { children, class: className, ...restProps }: $$Props = $props();

	// Derive fallback text from context
	const config = $derived(usePreview ? store.previewConfig : store.config);
	const contextFallbackText = $derived(
		config?.username ? config.username.substring(0, 2).toUpperCase() : 'AV'
	);
</script>

<AvatarPrimitive.Fallback
	class={cn('flex size-full items-center justify-center bg-muted', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{contextFallbackText}
	{/if}
</AvatarPrimitive.Fallback>
