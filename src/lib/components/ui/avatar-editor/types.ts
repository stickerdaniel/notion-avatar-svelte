export const COLORS = [
	'rose',
	'pink',
	'purple',
	'blue',
	'teal',
	'green',
	'yellow',
	'orange'
] as const;
export type ColorName = (typeof COLORS)[number];

export type Category = {
	id: string;
	name: string;
	maxItems: number;
};

export type SelectedItems = {
	[key: string]: number | null;
};

export const DEFAULT_CATEGORIES: Category[] = [
	{ id: 'face', name: 'Face', maxItems: 16 },
	{ id: 'nose', name: 'Nose', maxItems: 14 },
	{ id: 'mouth', name: 'Mouth', maxItems: 20 },
	{ id: 'eyes', name: 'Eyes', maxItems: 14 },
	{ id: 'eyebrows', name: 'Eyebrows', maxItems: 16 },
	{ id: 'glasses', name: 'Glasses', maxItems: 15 },
	{ id: 'hair', name: 'Hair', maxItems: 59 },
	{ id: 'accessories', name: 'Accessories', maxItems: 15 },
	{ id: 'details', name: 'Details', maxItems: 14 },
	{ id: 'beard', name: 'Beard', maxItems: 17 }
];

const previewAssets = import.meta.glob<string>('./assets/preview/**/*.svg', {
	query: '?url&no-inline',
	import: 'default',
	eager: true
});
const partAssets = import.meta.glob<string>('./assets/part/**/*.svg', {
	query: '?url&no-inline',
	import: 'default',
	eager: true
});

export function getPreviewImagePath(category: string, index: number): string {
	const key = `./assets/preview/${category}/${index}.svg`;
	const url = previewAssets[key];
	if (!url) {
		console.warn(`Preview asset not found: ${key}`);
		return '';
	}
	return url;
}

export function getPartImagePath(category: string, index: number): string {
	const key = `./assets/part/${category}/${category}-${index}.svg`;
	const url = partAssets[key];
	if (!url) {
		console.warn(`Part asset not found: ${key}`);
		return '';
	}
	return url;
}

export const LAYER_ORDER: string[] = [
	'face',
	'details',
	'mouth',
	'nose',
	'eyes',
	'eyebrows',
	'beard',
	'hair',
	'accessories',
	'glasses'
];

export interface AvatarConfiguration {
	version: number;
	username: string;
	items: SelectedItems;
	colorName: ColorName;
	lastModified: string;
}
