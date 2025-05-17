<script lang="ts">
	import '../app.css';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-creator/AvatarStore.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	// Vercel Speed Insights for performance monitoring and analytics
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	injectSpeedInsights();
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

<Toaster />

{@render children()}
