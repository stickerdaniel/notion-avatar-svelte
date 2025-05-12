<script lang="ts">
	import '../app.css';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-creator/AvatarStore.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

<Toaster />

{@render children()}
