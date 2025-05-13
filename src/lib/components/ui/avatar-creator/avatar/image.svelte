<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import type { AvatarImageProps } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { getAvatarDisplayContext } from './context.js';

	// Get context from parent Root
	const { store, usePreview } = getAvatarDisplayContext();

	// Props allow overriding context-derived values
	interface $$Props extends AvatarImageProps {
		src?: string;
		alt?: string;
		class?: string;
	}

	let { src: srcProp, alt: altProp, class: className, ...restProps }: $$Props = $props();

	// Derive values from context
	const config = $derived(usePreview ? store.previewConfig : store.config);
	const contextSvgDataUrl = $derived(usePreview ? store.previewSvgDataUrl : store.svgDataUrl);
	const contextAltText = $derived(config?.username || 'User Avatar');

	// Use prop if provided, otherwise use context-derived value
	const src = $derived(srcProp !== undefined ? srcProp : contextSvgDataUrl);
	const alt = $derived(altProp !== undefined ? altProp : contextAltText);
</script>

{#if src}
	<AvatarPrimitive.Image
		{src}
		{alt}
		class={cn('aspect-square size-full', className)}
		{...restProps}
	/>
{/if}
