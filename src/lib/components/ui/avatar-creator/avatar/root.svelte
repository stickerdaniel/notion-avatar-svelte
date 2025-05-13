<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarRootProps } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { avatarContext } from '$lib/contexts/avatarContext.js';
	import { setAvatarDisplayContext, type AvatarDisplayContext } from './context.js';
	import type { Snippet } from 'svelte';

	interface $$Props extends AvatarRootProps {
		usePreview?: boolean;
		children?: Snippet;
	}

	let { usePreview = false, children, class: className, ...restProps }: $$Props = $props();

	const mainAvatarStore = avatarContext.get();

	// Calculate the background class based on usePreview and the main store
	const bgClass = $derived(usePreview ? mainAvatarStore.previewBgClass : mainAvatarStore.bgClass);

	// Set the context for child components
	setAvatarDisplayContext({
		store: mainAvatarStore,
		usePreview
	});
</script>

{#if mainAvatarStore}
	<AvatarPrimitive.Root
		class={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', bgClass, className)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</AvatarPrimitive.Root>
{:else}
	<!-- Fallback if main store not found -->
	<div
		class={cn(
			'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
			className
		)}
	>
		??
	</div>
{/if}
