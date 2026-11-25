<script lang="ts">
	import { type ButtonProps, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Spring } from 'svelte/motion';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils/utils.js';

	let {
		class: className = '',
		variant = 'default' as ButtonProps['variant'],
		size = 'default' as ButtonProps['size'],
		tooltipText = 'Generate random',
		onDicethrow,
		disabled = false
	}: {
		class?: string;
		variant?: ButtonProps['variant'];
		size?: ButtonProps['size'];
		tooltipText?: string;
		onDicethrow?: () => void;
		disabled?: boolean;
	} = $props();

	const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

	let diceIndex = $state(0);
	const DiceIcon = $derived(diceIcons[diceIndex]);

	const diceTransform = new Spring<{ scale: number; rotate: number }>(
		{ scale: 1, rotate: 0 },
		{
			stiffness: 0.18,
			damping: 0.25
		}
	);

	let diceAnimationTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
	let targetBaseRotation = 0;
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		targetBaseRotation = Math.floor(diceTransform.current.rotate / 360) * 360;
	});

	async function handleDiceClick() {
		if (disabled) return;
		onDicethrow?.();
		const newDiceIndex = Math.floor(Math.random() * diceIcons.length);

		if (diceAnimationTimeoutId) {
			clearTimeout(diceAnimationTimeoutId);
		}

		const peakRotation = targetBaseRotation + 180;

		diceTransform.set({ scale: 1.25, rotate: peakRotation });

		diceAnimationTimeoutId = setTimeout(() => {
			diceIndex = newDiceIndex;

			const finalRotation = targetBaseRotation + 360;
			diceTransform.set({ scale: 1, rotate: finalRotation });

			targetBaseRotation = finalRotation;
			diceAnimationTimeoutId = undefined;
		}, 100);
	}

	onDestroy(() => {
		if (diceAnimationTimeoutId) {
			clearTimeout(diceAnimationTimeoutId);
		}
	});
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger
			{disabled}
			onclick={handleDiceClick}
			aria-label={tooltipText}
			class={cn(
				buttonVariants({ variant, size }),
				'transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95',
				className
			)}
			data-umami-event="avatar-randomize"
		>
			<div
				class="flex h-full w-full items-center justify-center"
				style={mounted
					? `transform: scale(${diceTransform.current.scale}) rotate(${diceTransform.current.rotate}deg); transform-origin: center;`
					: ''}
			>
				<DiceIcon />
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tooltipText}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
