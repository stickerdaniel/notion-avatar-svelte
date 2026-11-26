import { defineConfig, type RegistryItem } from 'jsrepo';
import { repository } from 'jsrepo/outputs';
import prettier from '@jsrepo/transform-prettier';

const uiDependencies = [
	'avatar',
	'button',
	'card',
	'dropdown-menu',
	'input',
	'label',
	'scroll-area',
	'tabs',
	'toggle',
	'tooltip'
];

export default defineConfig({
	registry: {
		name: '@stickerdaniel/notion-avatar-svelte',
		version: '0.4.0',
		description:
			'Notion-style avatar editor for Svelte 5 with customizable features and download options.',
		homepage: 'https://avatar.daniel.sticker.name',
		repository: 'https://github.com/stickerdaniel/notion-avatar-svelte',
		bugs: 'https://github.com/stickerdaniel/notion-avatar-svelte/issues',
		authors: ['Daniel Sticker'],
		tags: [
			'svelte',
			'sveltejs',
			'sveltekit',
			'avatar',
			'notion',
			'editor',
			'avatar-editor',
			'avatar-generator',
			'shadcn-svelte',
			'shadcn',
			'component'
		],
		defaultPaths: {
			'*': '$lib/blocks',
			ui: '$lib/components/ui',
			hooks: '$lib/hooks',
			actions: '$lib/actions',
			utils: '$lib/utils'
		},
		excludeDeps: ['svelte', '@sveltejs/kit', 'tailwind-variants'],
		outputs: [repository()],
		items: [
			{
				name: 'avatar-editor',
				type: 'ui',
				files: [{ path: 'src/lib/components/ui/avatar-editor' }]
			},
			{
				name: 'radio-toggle-group',
				type: 'ui',
				files: [{ path: 'src/lib/components/ui/radio-toggle-group' }]
			},
			...uiDependencies.map((name): RegistryItem => ({
				name,
				type: 'ui',
				add: 'when-needed',
				files: [{ path: `src/lib/components/ui/${name}` }]
			})),
			{
				name: 'utils',
				type: 'utils',
				add: 'when-needed',
				files: [{ path: 'src/lib/utils/utils.ts' }]
			}
		]
	},
	registries: ['@ieedan/shadcn-svelte-extras'],
	paths: {
		'*': './src/lib/components',
		ui: './src/lib/components/ui',
		util: './src/lib/utils',
		hook: './src/lib/hooks',
		action: './src/lib/actions'
	},
	transforms: [prettier()]
});
