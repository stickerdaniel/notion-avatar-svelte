<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';

	// Avatar Editor
	import { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	// Vercel Speed Insights and Web Analytics, injected once in the browser.
	// Page views and routes are reported on every navigation, like the old
	// /sveltekit wrappers did; unmatched routes (404s) are skipped.
	import { injectSpeedInsights } from '@vercel/speed-insights';
	import { inject as injectAnalytics, pageview } from '@vercel/analytics';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { dev, browser } from '$app/env';
	if (browser) {
		// Vercel sets these at build time to serve the scripts from a custom path
		const basePath = import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH;
		const config = import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG;
		const speedInsights = injectSpeedInsights(
			{ route: page.route.id, framework: 'sveltekit', basePath },
			config
		);
		injectAnalytics(
			{
				mode: dev ? 'development' : 'production',
				framework: 'sveltekit',
				basePath,
				disableAutoTrack: true
			},
			config
		);
		// Read the route from page state: on the initial hydration `to.route.id` is still null
		afterNavigate(() => {
			const route = page.route.id;
			if (!route) return;
			speedInsights?.setRoute(route);
			pageview({ route, path: page.url.pathname });
		});
	}

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
