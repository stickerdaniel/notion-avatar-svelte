// src/lib/components/ui/avatar-editor/types.ts
/**
 * Avatar editor type definitions
 */

// Color Definitions
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

/**
 * Represents a category of customizable avatar parts
 */
export type Category = {
	id: string;
	name: string;
	maxItems: number;
};

/**
 * Selected items configuration for the avatar
 * Keys are category IDs, values are the selected item index (or null if none selected)
 */
export type SelectedItems = {
	[key: string]: number | null;
};

/**
 * Default categories for the avatar editor
 */
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

// Eagerly load all assets using import.meta.glob
const previewAssets = import.meta.glob('./assets/preview/**/*.svg', {
	query: '?url',
	import: 'default',
	eager: true
}) as Record<string, string>;
const partAssets = import.meta.glob('./assets/part/**/*.svg', {
	query: '?url',
	import: 'default',
	eager: true
}) as Record<string, string>;

/**
 * Gets the path to a preview image for a category item
 * Note: Uses import.meta.glob for proper Vite asset processing and SSR compatibility
 */
export function getPreviewImagePath(category: string, index: number): string {
	const key = `./assets/preview/${category}/${index}.svg`;
	const url = previewAssets[key];
	if (!url) {
		console.warn(`Preview asset not found: ${key}`);
		return '';
	}
	return url;
}

/**
 * Gets the path to a part image for the avatar preview
 * Note: Uses import.meta.glob for proper Vite asset processing and SSR compatibility
 */
export function getPartImagePath(category: string, index: number): string {
	const key = `./assets/part/${category}/${category}-${index}.svg`;
	const url = partAssets[key];
	if (!url) {
		console.warn(`Part asset not found: ${key}`);
		return '';
	}
	return url;
}

/**
 * The order in which to render avatar layers (bottom to top)
 */
export const LAYER_ORDER: string[] = [
	'face',
	'details', // e.g., freckles
	'mouth',
	'nose',
	'eyes',
	'eyebrows',
	'beard',
	'hair',
	'accessories', // e.g., earrings
	'glasses'
];

export interface AvatarConfiguration {
	version: number; // For potential future migrations
	username: string;
	items: SelectedItems;
	colorName: ColorName;
	lastModified: string;
}
