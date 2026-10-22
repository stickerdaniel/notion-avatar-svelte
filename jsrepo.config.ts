import { defineConfig, type RegistryItem } from 'jsrepo';
import { repository } from 'jsrepo/outputs';
import prettier from '@jsrepo/transform-prettier';

// shadcn-svelte components the listed items import. Installed only as their dependencies.
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
	// Registry published to jsrepo.com as @stickerdaniel/notion-avatar-svelte
	registry: {
		name: '@stickerdaniel/notion-avatar-svelte',
		version: '0.2.0',
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
		excludeDeps: ['svelte', '@sveltejs/kit'],
		outputs: [repository()],
		items: [
			{
				name: 'avatar-editor',
				type: 'ui',
				// The whole folder, so the sources and every SVG under assets/ ship together
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
	// Settings for adding items from other registries to this app
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
