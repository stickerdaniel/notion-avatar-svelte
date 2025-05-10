<script lang="ts">
	import AvatarCreator from '$lib/components/ui/avatar-creator/avatar-creator.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { GithubIcon, SquareArrowOutUpRight } from '@lucide/svelte';
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
		</div>
	</div>
</div>
