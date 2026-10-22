<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	// Avatar Editor
	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	// Umami analytics, declared in src/env.ts; the script loads only when both are set.
	import { PUBLIC_UMAMI_SRC, PUBLIC_UMAMI_WEBSITE_ID } from '$app/env/public';

	let { children } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

<svelte:head>
	{#if PUBLIC_UMAMI_SRC && PUBLIC_UMAMI_WEBSITE_ID}
		<script defer src={PUBLIC_UMAMI_SRC} data-website-id={PUBLIC_UMAMI_WEBSITE_ID}></script>
	{/if}
</svelte:head>

<ModeWatcher />
<Toaster />

{@render children()}
