<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { avatarContext } from '$lib/contexts/avatarContext';
	import { AvatarStoreClass } from '$lib/components/ui/avatar-creator/AvatarStore.svelte';

	let { children }: { children: Snippet } = $props();

	// Instantiate and set the AvatarStore in the context
	// This makes it available to all child components within this layout.
	avatarContext.set(new AvatarStoreClass());
</script>

{@render children()}
