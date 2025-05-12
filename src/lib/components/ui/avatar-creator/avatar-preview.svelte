<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	// Accept pre-generated SVG data URL and other props from parent component
	let {
		svgDataUrl = '', // Expecting a base64 data URL
		alt = 'Avatar',
		previewBgClass = 'bg-green-400' // Default background color
	}: {
		svgDataUrl: string;
		alt?: string;
		previewBgClass?: string;
	} = $props();

	// All SVG generation logic has been moved to AvatarStore and avatar-svg-utils.ts
	// This component is now only responsible for displaying the provided SVG.
</script>

<Avatar.Root class="h-36 w-36 {previewBgClass}">
	{#if svgDataUrl}
		<Avatar.Image src={svgDataUrl} {alt} />
	{:else}
		<Avatar.Fallback>...</Avatar.Fallback> // Fallback if URL is empty or loading
	{/if}
</Avatar.Root>
