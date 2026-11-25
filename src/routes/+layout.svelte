<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { theme } from '$lib/theme.svelte';

	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	import { PUBLIC_UMAMI_SRC, PUBLIC_UMAMI_WEBSITE_ID } from '$app/env/public';

	let { children } = $props();

	avatarContext.set(new AvatarStoreClass());
	theme.watch();
</script>

<svelte:head>
	{#if PUBLIC_UMAMI_SRC && PUBLIC_UMAMI_WEBSITE_ID}
		<script defer src={PUBLIC_UMAMI_SRC} data-website-id={PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>

<Toaster />

{@render children()}
