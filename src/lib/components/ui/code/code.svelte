<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { tv, type VariantProps } from 'tailwind-variants';
	import type { SupportedLanguage } from './shiki';
	import { onMount } from 'svelte';
	import type { HighlighterCore } from 'shiki';
	import { CopyButton } from '../copy-button';

	const style = tv({
		base: 'relative h-full max-h-[650px] overflow-auto rounded-lg border',
		variants: {
			variant: {
				default: 'border-border bg-card',
				secondary: 'bg-secondary/50 border-transparent'
			}
		}
	});

	type Variant = VariantProps<typeof style>['variant'];

	type Props = {
		variant?: Variant;
		lang?: SupportedLanguage;
		code: string;
		class?: string;
		copyButtonContainerClass?: string;
		hideLines?: boolean;
		hideCopy?: boolean;
		highlight?: (number | [number, number])[];
	};

	const within = (num: number, range: Props['highlight']) => {
		if (!range) return false;

		let within = false;

		for (const r of range) {
			if (typeof r === 'number') {
				if (num === r) {
					within = true;
					break;
				}
				continue;
			}

			if (r[0] <= num && num <= r[1]) {
				within = true;
				break;
			}
		}

		return within;
	};

	let {
		variant = 'default',
		lang = 'typescript',
		code,
		copyButtonContainerClass = undefined,
		class: className = undefined,
		hideLines = false,
		hideCopy = false,
		highlight = []
	}: Props = $props();

	let hl = $state<HighlighterCore>();
	let sanitize: ((html: string) => string) | undefined = $state();

	const highlighted = $derived(
		hl &&
			sanitize?.(
				hl.codeToHtml(code, {
					lang: lang,
					themes: {
						light: 'github-light-default',
						dark: 'github-dark-default'
					},
					transformers: [
						{
							pre: (el) => {
								el.properties.style = '';

								if (!hideLines) {
									el.properties.class += ' line-numbers';
								}

								return el;
							},
							line: (node, line) => {
								if (within(line, highlight)) {
									node.properties.class = node.properties.class + ' line--highlighted';
								}

								return node;
							}
						}
					]
				})
			)
	);

	onMount(async () => {
		const [highlighterMod, DOMPurify] = await Promise.all([
			import('./shiki').then((shiki) => shiki.highlighter),
			import('dompurify')
		]);
		hl = highlighterMod;
		sanitize = (html: string) => DOMPurify.default.sanitize(html);
	});
</script>

<div class={cn(style({ variant }), className)}>
	{#if highlighted}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki escapes the code and DOMPurify sanitises its output -->
		{@html highlighted}
	{:else}
		<pre class={cn('shiki', !hideLines && 'line-numbers')}><code
				>{#each code.split('\n') as line, index (index)}{#if index > 0}{'\n'}{/if}<span class="line"
						>{line}</span
					>{/each}</code
			></pre>
	{/if}
	{#if !hideCopy}
		<div
			class={cn(
				'absolute top-2 right-2 flex place-items-center justify-center',
				copyButtonContainerClass
			)}
		>
			<CopyButton text={code} />
		</div>
	{/if}
</div>
