<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { GithubIcon, Redo, SquareArrowOutUpRight, Undo } from '@lucide/svelte';

	// Import the new Avatar components and the context
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card/index.js';
	import { avatarContext } from '$lib/contexts/avatarContext.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import AvatarCreator from '$lib/components/ui/avatar-creator/avatar-creator.svelte';

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
				<div class="flex flex-col gap-5">
					<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
						<!-- Example 1: Live Preview (Current Editing State) -->
						<Card.Root>
							<Card.Header>
								<Card.Title>Live Preview Example</Card.Title>
								<Card.Description>
									Shows what's currently being edited, before saving.
								</Card.Description>
							</Card.Header>
							<Card.Content class="flex flex-col gap-4">
								<!-- Avatar Preview -->
								<div class="flex gap-2 text-left text-sm">
									<Avatar.Root class="h-16 w-16	 rounded-xl {avatarStore.previewBgClass}">
										<Avatar.Image src={avatarStore.previewSvgDataUrl} />
										<Avatar.Fallback />
									</Avatar.Root>
									<div class="flex h-full flex-col justify-between gap-1">
										<div class="grid flex-1 text-left text-sm leading-tight">
											<span class="truncate font-semibold"
												>{avatarStore.previewConfig.username}
											</span>
											<span class="truncate text-xs">{avatarStore.previewConfig.lastModified}</span>
										</div>
										<Badge class="w-fit bg-secondary" variant="outline"
											>{avatarStore.previewConfig.colorName}
										</Badge>
									</div>
								</div>

								<!-- How to access -->
								<div class="mt-2 w-full truncate">
									<p class="text-xs font-semibold">How to access:</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.previewSvgDataUrl
									</p>
									<p class="font-mono text-xs text-muted-foreground">avatarStore.previewBgClass</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.previewConfig.username
									</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.previewConfig.colorName
									</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.previewConfig.lastModified
									</p>
								</div>
							</Card.Content>
						</Card.Root>

						<!-- Example 2: Saved Avatar (Persisted State) -->
						<Card.Root>
							<Card.Header>
								<Card.Title>Saved Avatar Example</Card.Title>
								<Card.Description>
									Shows the last explicitly saved version (persisted in localStorage).
								</Card.Description>
							</Card.Header>
							<Card.Content class="flex flex-col gap-4">
								<!-- Avatar Preview -->
								<div class="flex gap-2 text-left text-sm">
									<Avatar.Root class="h-16 w-16 rounded-xl {avatarStore.bgClass}">
										<Avatar.Image src={avatarStore.svgDataUrl} />
										<Avatar.Fallback />
									</Avatar.Root>
									<div class="flex h-full flex-col justify-between gap-1">
										<div class="grid flex-1 text-left text-sm leading-tight">
											<span class="truncate font-semibold"
												>{avatarStore.config?.username ?? '...'}</span
											>
											<span class="truncate text-xs"
												>{avatarStore.config?.lastModified ?? '...'}</span
											>
										</div>
										<Badge class="w-fit bg-secondary" variant="outline"
											>{avatarStore.config?.colorName ?? '...'}</Badge
										>
									</div>
								</div>

								<!-- How to access -->
								<div class="mt-2 w-full truncate">
									<p class="text-xs font-semibold">How to access:</p>
									<p class="font-mono text-xs text-muted-foreground">avatarStore.svgDataUrl</p>
									<p class="font-mono text-xs text-muted-foreground">avatarStore.bgClass</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.config?.username
									</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.config?.colorName
									</p>
									<p class="font-mono text-xs text-muted-foreground">
										avatarStore.config?.lastModified
									</p>
								</div>
							</Card.Content>
						</Card.Root>
					</div>

					<!-- JSON Debug Display -->
					<Card.Root>
						<Card.Header>
							<Card.Title>avatarStore.configJSON</Card.Title>
							<Card.Description
								>Svelte State variable that contains the current avatar configuration.</Card.Description
							>
						</Card.Header>
						<Card.Content>
							<pre class="text-xs">{JSON.stringify(
									JSON.parse(avatarStore.configJSON),
									null,
									2
								)}</pre>
						</Card.Content>
						<Card.Footer class="flex justify-end gap-2">
							<Button
								size="icon"
								variant="secondary"
								disabled={!avatarStore.canUndo}
								onclick={avatarStore.undo}
							>
								<Undo />
							</Button>
							<Button
								size="icon"
								variant="secondary"
								disabled={!avatarStore.canRedo}
								onclick={avatarStore.redo}
							>
								<Redo />
							</Button>
						</Card.Footer>
					</Card.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
