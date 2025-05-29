<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Download, GithubIcon, Redo, SquareArrowOutUpRight, Undo, Upload } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { AvatarConfigValidationError } from '$lib/components/ui/avatar-editor/AvatarStore.svelte';

	// Import the new Avatar components and the context
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Card from '$lib/components/ui/card/index.js';
	import { avatarContext } from '$lib/contexts/avatarContext.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import AvatarCreator from '$lib/components/ui/avatar-editor/avatar-editor.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import AnimatedDiceButton from '$lib/components/ui/avatar-editor/animated-dice-button.svelte';

	const avatarStore = avatarContext.get();

	// Download avatar config as JSON file
	const downloadConfig = () => {
		const config = avatarStore.configJSON;
		const blob = new Blob([config], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		// Get username from config and sanitize it for filename
		const configObj = JSON.parse(config);
		const username = configObj.username?.trim() || 'user';
		const sanitizedUsername = username.replace(/[^a-z0-9]/gi, '-').toLowerCase();

		const a = document.createElement('a');
		a.href = url;
		a.download = `${sanitizedUsername}-notion-avatar-config.json`;
		document.body.appendChild(a);
		a.click();

		// Clean up
		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 0);

		// Show success toast
		toast.success('Avatar configuration downloaded', {
			description: `${sanitizedUsername}-notion-avatar-config.json`
		});
	};

	// Upload avatar config from JSON file
	const uploadConfig = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';

		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			if (!target.files?.length) return;

			const file = target.files[0];
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const content = event.target?.result as string;

					// Pass the JSON string to the store's importConfig method to validate and parse
					avatarStore.importConfig(content);

					// Show success toast
					toast.success('Avatar configuration loaded', {
						description: file.name
					});
				} catch (error) {
					let errorMessage = 'Unknown error';
					if (error instanceof AvatarConfigValidationError || error instanceof Error) {
						errorMessage = error.message;
					}

					toast.error('Invalid avatar configuration', {
						description: errorMessage
					});
				}
			};

			reader.readAsText(file);
		};

		input.click();
	};
</script>

<svelte:head>
	<title>Notion Avatar Editor</title>
	<meta name="description" content="Create Notion-style avatars with ease." />
</svelte:head>

<div class="flex min-h-[100svh] w-full flex-col items-center justify-center">
	<div class="mx-auto w-full max-w-2xl px-4 py-10">
		<div class="flex flex-col gap-10">
			<div class="flex flex-col gap-1">
				<h1 class="text-4xl font-bold">Notion Avatar Editor</h1>
				<p class="text-lg text-muted-foreground">Custom avatars for your next Svelte project.</p>
				<div class="flex flex-col gap-2 sm:flex-row">
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
					<!-- Divider only if larger than sm -->
					<Separator orientation="vertical" class="hidden md:block" />
					<div class="flex gap-2">
						<!-- Link to runed -->
						<Badge
							href="https://runed.dev"
							variant="secondary"
							target="_blank"
							class="flex w-fit place-items-center gap-2 rounded-md"
						>
							<span class="font-semibold">Runed</span>
							<SquareArrowOutUpRight class="size-3.5" />
						</Badge>
						<!-- link to next.shadcn-svelte 	-->
						<Badge
							href="https://next.shadcn-svelte.com"
							variant="secondary"
							target="_blank"
							class="flex w-fit place-items-center gap-2 rounded-md"
						>
							<span class="font-semibold">Shadcn Svelte</span>
							<SquareArrowOutUpRight class="size-3.5" />
						</Badge>
					</div>
				</div>
			</div>
			<AvatarCreator />

			{#if avatarStore}
				<div class="flex flex-col gap-5">
					<!-- Example 1: Live State Example -->
					<Card.Root>
						<Card.Header class="p-4 sm:p-6">
							<Card.Title>Live State Example</Card.Title>
							<Card.Description>
								Shows what's currently being edited. This state is persisted in localStorage.
							</Card.Description>
						</Card.Header>
						<Card.Content class="flex flex-col gap-4 p-4 sm:p-6">
							<!-- Avatar Preview -->
							<div class="flex gap-2 text-left text-sm">
								<Avatar.Root class="h-16 w-16 rounded-xl {avatarStore.bgClass}">
									<Avatar.Image src={avatarStore.svgDataUrl} />
									<Avatar.Fallback />
								</Avatar.Root>
								<div class="flex h-full flex-col justify-between gap-1">
									<div class="grid flex-1 text-left text-sm leading-tight">
										<span class="truncate font-semibold">{avatarStore.config.username} </span>
										<span class="truncate text-xs">{avatarStore.config.lastModified}</span>
									</div>
									<Badge class="w-fit bg-secondary" variant="outline"
										>{avatarStore.config.colorName}
									</Badge>
								</div>
							</div>

							<!-- How to access -->
							<div class="mt-2 w-full truncate">
								<p class="text-xs font-semibold">How to access:</p>
								<p class="font-mono text-xs text-muted-foreground">avatarStore.svgDataUrl</p>
								<p class="font-mono text-xs text-muted-foreground">avatarStore.bgClass</p>
								<p class="font-mono text-xs text-muted-foreground">avatarStore.config.username</p>
								<p class="font-mono text-xs text-muted-foreground">avatarStore.config.colorName</p>
								<p class="font-mono text-xs text-muted-foreground">
									avatarStore.config.lastModified
								</p>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- JSON Debug Display -->
					<Card.Root>
						<Card.Header class="p-4 sm:p-6">
							<Card.Title>avatarStore.configJSON (Persisted State)</Card.Title>
							<Card.Description
								>Primary JSON string for the avatar's settings. This serialized data is the main
								shared datapoint that drives the editor, previews and history. It is managed by
								PersistedState and reflects the content of localStorage.</Card.Description
							>
						</Card.Header>
						<Card.Content class="p-4 sm:p-6">
							<pre class="text-xs">{JSON.stringify(
									JSON.parse(avatarStore.configJSON),
									null,
									2
								)}</pre>
						</Card.Content>
						<Card.Footer class="flex justify-end gap-2 p-4 sm:p-6">
							<Button size="icon" variant="secondary" onclick={downloadConfig}>
								<Download />
							</Button>
							<Button size="icon" variant="secondary" onclick={uploadConfig}>
								<Upload />
							</Button>
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
							<AnimatedDiceButton
								onDicethrow={avatarStore.generateRandomAvatar}
								ariaLabel="Generate random avatar"
								variant="secondary"
								size="icon"
							/>
						</Card.Footer>
					</Card.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
