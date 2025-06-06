<script lang="ts">
	import { Button, type ButtonProps } from '../button';
	import { UseClipboard } from '../../../hooks/use-clipboard.svelte';
	import { cn } from '$lib/utils/utils';
	import { CheckIcon, CopyIcon, XIcon } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { scale } from 'svelte/transition';

	// omit href so you can't create a link
	interface Props extends Omit<ButtonProps, 'href'> {
		text: string;
		icon?: Snippet<[]>;
		animationDuration?: number;
		onCopy?: (status: UseClipboard['status']) => void;
	}

	let {
		text,
		icon,
		animationDuration = 500,
		variant = 'ghost',
		size = 'icon',
		onCopy,
		class: className,
		children,
		...rest
	}: Props = $props();

	// this way if the user passes text then the button will be the default size
	if (size === 'icon' && children) {
		size = 'default';
	}

	const clipboard = new UseClipboard();
</script>

<Button
	{...rest}
	{variant}
	{size}
	class={cn('flex items-center gap-2', className)}
	type="button"
	name="copy"
	tabindex={-1}
	onclick={async () => {
		const status = await clipboard.copy(text);

		onCopy?.(status);
	}}
>
	{#if clipboard.status === 'success'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			<CheckIcon />
			<span class="sr-only">Copied</span>
		</div>
	{:else if clipboard.status === 'failure'}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			<XIcon />
			<span class="sr-only">Failed to copy</span>
		</div>
	{:else}
		<div in:scale={{ duration: animationDuration, start: 0.85 }}>
			{#if icon}
				{@render icon()}
			{:else}
				<CopyIcon />
			{/if}
			<span class="sr-only">Copy</span>
		</div>
	{/if}
	{@render children?.()}
</Button>
