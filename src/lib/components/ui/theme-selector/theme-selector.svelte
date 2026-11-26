<script lang="ts">
	import { SunIcon, MoonIcon } from '@lucide/svelte';
	import { theme } from '$lib/theme.svelte';
	import * as DropdownMenu from '../dropdown-menu/index.js';
	import { buttonVariants } from '../button/index.js';

	type Props = {
		variant?: 'outline' | 'ghost';
	};

	let { variant = 'outline' }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant, size: 'icon' })}>
		<SunIcon class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
		<MoonIcon class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		<span class="sr-only">Toggle theme</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => (theme.mode = 'light')}>Light</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (theme.mode = 'dark')}>Dark</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (theme.mode = 'system')}>System</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
