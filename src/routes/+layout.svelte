<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	// Avatar Editor
	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	import { browser } from '$app/env';

	// Umami Analytics - dynamically imported to avoid SSR issues
	// (svelte-umami accesses localStorage at module load time, which breaks on Node.js 22+).
	// Its PUBLIC_UMAMI_* env vars are declared in src/env.ts.
	let UmamiAnalyticsEnv:
		(typeof import('@lukulent/svelte-umami'))['UmamiAnalyticsEnv'] | undefined = $state(undefined);
	if (browser) {
		import('@lukulent/svelte-umami').then((mod) => {
			UmamiAnalyticsEnv = mod.UmamiAnalyticsEnv;
		});
	}

	let { children } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

<ModeWatcher />
<Toaster />
{#if UmamiAnalyticsEnv}
	<UmamiAnalyticsEnv />
{/if}

{@render children()}
