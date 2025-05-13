<script lang="ts">
	import AvatarCreator from '$lib/components/ui/avatar-creator/avatar-creator.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { GithubIcon, SquareArrowOutUpRight } from '@lucide/svelte';

	// Import the new Avatar components and the context
	import * as Avatar from '$lib/components/ui/avatar-creator/avatar/index.js'; // Updated import
	import { avatarContext } from '$lib/contexts/avatarContext.js';

	const avatarStore = avatarContext.get();
</script>

<svelte:head>
	<title>Notion Avatar Creator</title>
	<meta name="description" content="Create Notion-style avatars with ease." />
</svelte:head>

<div class="flex min-h-[100svh] w-full flex-col items-center justify-center">
	<div class="mx-auto w-full max-w-2xl px-4 py-10">
		<div class="flex flex-col gap-10">
			<div class="flex flex-col gap-1">
				<h1 class="text-4xl font-bold">Notion Avatar Creator</h1>
				<p class="text-lg text-muted-foreground">Custom avatars for your next Svelte project.</p>
				<div class="flex gap-2">
					<!-- GitHub repo link -->
					<Badge
						href="https://github.com/stickerdaniel/notion-avatar-svelte"
						variant="secondary"
						target="_blank"
						class="flex w-fit place-items-center gap-2 rounded-md"
					>
						<span class="font-semibold">Star on GitHub</span>
						<GithubIcon class="size-3.5" />
					</Badge>
					<!-- Link to the original project below -->
					<Badge
						href="https://github.com/Mayandev/notion-avatar"
						variant="secondary"
						target="_blank"
						class="flex w-fit place-items-center gap-2 rounded-md"
					>
						<span class="font-semibold">Inspired by</span>
						<SquareArrowOutUpRight class="size-3.5" />
					</Badge>
				</div>
			</div>
			<AvatarCreator />

			{#if avatarStore}
				<!-- JSON Debug Display -->
				<div class="mb-4 mt-6 overflow-hidden rounded-lg border bg-secondary/10 p-4">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold">Current Configuration JSON</h3>
						<span class="text-xs text-muted-foreground">For debugging</span>
					</div>
					<div class="mt-2 max-h-36 overflow-auto">
						<pre class="text-xs">{JSON.stringify(JSON.parse(avatarStore.configJSON), null, 2)}</pre>
					</div>
					<!-- Add Undo/Redo buttons -->
					<div class="mt-2 flex justify-end gap-2">
						<button
							class="rounded border px-2 py-1 text-xs disabled:opacity-50"
							disabled={!avatarStore.canUndo}
							onclick={avatarStore.undo}
						>
							Undo
						</button>
						<button
							class="rounded border px-2 py-1 text-xs disabled:opacity-50"
							disabled={!avatarStore.canRedo}
							onclick={avatarStore.redo}
						>
							Redo
						</button>
					</div>
				</div>

				<div class="mt-10 flex flex-col gap-8">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<!-- Example 1: Live Preview (Current Editing State) -->
						<div class="flex h-full flex-col items-center gap-4 rounded-lg border p-6">
							<h2 class="text-xl font-semibold">Live Preview Example</h2>
							<p class="text-center text-sm text-muted-foreground">
								Shows what's currently being edited, before saving.
							</p>
							<Avatar.Root usePreview={true} class="h-24 w-24 border-2">
								<Avatar.Image />
								<Avatar.Fallback class="text-2xl" />
							</Avatar.Root>

							<p class="mt-2 text-lg font-medium">
								{avatarStore.previewConfig.username ?? '...'}
							</p>
							<p class="text-xs text-muted-foreground">
								Background: {avatarStore.previewConfig.colorName ?? '...'}
							</p>
							<p class="text-[10px] text-muted-foreground/80">
								Last Edit: {avatarStore.previewConfig.lastModified ?? '...'}
							</p>
							<div class="mt-2 w-full rounded-md bg-secondary/50 p-1.5 text-xs">
								<p class="font-semibold">How to access:</p>
								<p class="mt-1 font-mono text-[10px]">avatarStore.previewSvgDataUrl</p>
								<p class="font-mono text-[10px]">avatarStore.previewBgClass</p>
								<p class="font-mono text-[10px]">avatarStore.previewConfig.username</p>
								<p class="font-mono text-[10px]">avatarStore.previewConfig.colorName</p>
								<p class="font-mono text-[10px]">avatarStore.previewConfig.lastModified</p>
							</div>
						</div>

						<!-- Example 2: Saved Avatar (Persisted State) -->
						<div class="flex h-full flex-col items-center gap-4 rounded-lg border p-6">
							<h2 class="text-xl font-semibold">Saved Avatar Example</h2>
							<p class="text-center text-sm text-muted-foreground">
								Shows the last explicitly saved version (persisted in localStorage).
							</p>
							<Avatar.Root class="h-24 w-24 border-2">
								<Avatar.Image />
								<Avatar.Fallback class="text-2xl" />
							</Avatar.Root>

							<p class="mt-2 text-lg font-medium">
								{avatarStore.config?.username ?? '...'}
							</p>
							<p class="text-xs text-muted-foreground">
								Background: {avatarStore.config?.colorName ?? '...'}
							</p>
							<p class="text-[10px] text-muted-foreground/80">
								Last Saved: {avatarStore.config?.lastModified ?? '...'}
							</p>
							<div class="mt-2 w-full rounded-md bg-secondary/50 p-1.5 text-xs">
								<p class="font-semibold">How to access:</p>
								<p class="mt-1 font-mono text-[10px]">avatarStore.svgDataUrl</p>
								<p class="font-mono text-[10px]">avatarStore.bgClass</p>
								<p class="font-mono text-[10px]">avatarStore.config?.username</p>
								<p class="font-mono text-[10px]">avatarStore.config?.colorName</p>
								<p class="font-mono text-[10px]">avatarStore.config?.lastModified</p>
							</div>
						</div>
					</div>

					<div class="rounded-lg border bg-secondary/20 p-4">
						<h3 class="mb-2 text-lg font-semibold">Usage Notes</h3>
						<ul class="ml-5 list-disc space-y-1 text-sm">
							<li>
								The <span class="font-semibold">Live Preview</span> shows the current editing state from
								the AvatarCreator component.
							</li>
							<li>
								The <span class="font-semibold">Saved Avatar</span> only updates when the "Save" button
								is pressed and persists across page reloads.
							</li>
							<li>
								To display the avatar elsewhere in your app, choose the appropriate state based on
								your needs.
							</li>
						</ul>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
