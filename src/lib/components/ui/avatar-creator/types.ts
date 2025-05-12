/**
 * Avatar creator type definitions
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
 * Default categories for the avatar creator
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

/**
 * Gets the path to a preview image for a category item
 */
export function getPreviewImagePath(category: string, index: number): string {
	return `/avatar-creator/preview/${category}/${index}.svg`;
}

/**
 * Gets the path to a part image for the avatar preview
 */
export function getPartImagePath(category: string, index: number): string {
	return `/avatar-creator/part/${category}/${category}-${index}.svg`;
}

/**
 * Creates a default selected items configuration
 */
export function createDefaultSelectedItems(): SelectedItems {
	const selectedItems: SelectedItems = {};

	for (const category of DEFAULT_CATEGORIES) {
		selectedItems[category.id] = 0;
	}

	return selectedItems;
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
	items: SelectedItems; // Reuses the existing SelectedItems type
	colorName: ColorName; // Now uses ColorName defined in this file
	// Removed 'flipped' and 'userId' as per user request
	// lastModified: string; // ISO date string, can be added if needed by save logic
}
