<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js';
	import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Spring } from 'svelte/motion';

	// Props for the button, allowing customization from the parent
	// We use $$restProps to pass any other HTML attributes to the Button component.
	let {
		class: className = '',
		variant = 'secondary' as ButtonProps['variant'],
		size = 'icon' as ButtonProps['size'],
		ariaLabel = 'Generate random',
		onDicethrow
	}: {
		class?: string;
		variant?: ButtonProps['variant'];
		size?: ButtonProps['size'];
		ariaLabel?: string;
		onDicethrow?: () => void;
	} = $props();

	// State for the dice number
	let diceNumber = $state(5);

	// Spring store for dice animation
	const diceTransform = new Spring<{ scale: number; rotate: number }>(
		{ scale: 1, rotate: 0 },
		{
			stiffness: 0.18,
			damping: 0.25
		}
	);

	let diceAnimationTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
	let targetBaseRotation = 0;

	onMount(() => {
		// Set an initial random dice number on mount
		diceNumber = Math.floor(Math.random() * 6) + 1;
		// Initialize targetBaseRotation based on the spring's initial state
		targetBaseRotation = Math.floor(diceTransform.current.rotate / 360) * 360;
	});

	async function handleDiceClick() {
		onDicethrow?.();
		const newDiceNumber = Math.floor(Math.random() * 6) + 1;

		if (diceAnimationTimeoutId) {
			clearTimeout(diceAnimationTimeoutId);
		}

		const peakRotation = targetBaseRotation + 180;

		diceTransform.set({ scale: 1.25, rotate: peakRotation });

		diceAnimationTimeoutId = setTimeout(() => {
			diceNumber = newDiceNumber;

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

<Button
	{variant}
	{size}
	onclick={handleDiceClick}
	aria-label={ariaLabel}
	class={`transform transition-transform duration-75 ease-in-out hover:scale-105 active:scale-95 ${className}`}
>
	<div
		class="flex h-full w-full items-center justify-center"
		style="transform: scale({diceTransform.current.scale}) rotate({diceTransform.current
			.rotate}deg); transform-origin: center;"
	>
		{#if diceNumber === 1}<Dice1 />
		{:else if diceNumber === 2}<Dice2 />
		{:else if diceNumber === 3}<Dice3 />
		{:else if diceNumber === 4}<Dice4 />
		{:else if diceNumber === 5}<Dice5 />
		{:else if diceNumber === 6}<Dice6 />
		{/if}
	</div>
</Button>
