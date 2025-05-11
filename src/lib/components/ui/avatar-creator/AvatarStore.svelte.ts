import {
	DEFAULT_CATEGORIES,
	LAYER_ORDER,
	getPreviewImagePath,
	createDefaultSelectedItems,
	type Category,
	type SelectedItems
} from './types';

// Centralized Color Definitions
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

// Renamed from COLOR_SELECTOR_CLASSES to AVATAR_COLOR_STYLES
export const AVATAR_COLOR_STYLES: Record<
	ColorName,
	{ base: string; hover: string; selected: string }
> = {
	rose: {
		base: 'bg-rose-400',
		hover: 'hover:bg-rose-300',
		selected:
			'data-[state=checked]:bg-rose-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-rose-600'
	},
	pink: {
		base: 'bg-pink-400',
		hover: 'hover:bg-pink-300',
		selected:
			'data-[state=checked]:bg-pink-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-pink-600'
	},
	purple: {
		base: 'bg-purple-400',
		hover: 'hover:bg-purple-300',
		selected:
			'data-[state=checked]:bg-purple-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-purple-600'
	},
	blue: {
		base: 'bg-blue-400',
		hover: 'hover:bg-blue-300',
		selected:
			'data-[state=checked]:bg-blue-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-blue-600'
	},
	teal: {
		base: 'bg-teal-400',
		hover: 'hover:bg-teal-300',
		selected:
			'data-[state=checked]:bg-teal-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-teal-600'
	},
	green: {
		base: 'bg-green-400',
		hover: 'hover:bg-green-300',
		selected:
			'data-[state=checked]:bg-green-400 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-green-600'
	},
	yellow: {
		base: 'bg-yellow-300',
		hover: 'hover:bg-yellow-200',
		selected:
			'data-[state=checked]:bg-yellow-300 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-yellow-500'
	},
	orange: {
		base: 'bg-orange-300',
		hover: 'hover:bg-orange-200',
		selected:
			'data-[state=checked]:bg-orange-300 data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-background data-[state=checked]:ring-2 data-[state=checked]:ring-orange-500'
	}
};

// Interface for the Avatar store
export interface IAvatar {
	selectedItems: SelectedItems;
	username: string;
	selectedAvatarColorName: ColorName;
	readonly categories: Category[]; // categories are not meant to be changed from outside
	readonly avatarLayers: string[]; // Derived, so readonly from an external perspective
	readonly avatarPreviewBgClass: string; // Derived, so readonly

	generateRandomAvatar: () => void;
	saveAvatar: () => void;
}

export class Avatar implements IAvatar {
	selectedItems = $state<SelectedItems>(createDefaultSelectedItems());
	username = $state('');
	selectedAvatarColorName = $state<ColorName>(COLORS[0]);
	categories: Category[] = DEFAULT_CATEGORIES;

	constructor() {
		//this.generateRandomAvatar();
	}

	avatarLayers = $derived(this._generateAvatarLayers());
	avatarPreviewBgClass = $derived.by(() => {
		// Ensure selectedAvatarColorName is a valid key, otherwise fallback to the first color
		const colorKey = COLORS.includes(this.selectedAvatarColorName)
			? this.selectedAvatarColorName
			: COLORS[0];
		const newClass = AVATAR_COLOR_STYLES[colorKey].base;
		return newClass;
	});

	private _generateAvatarLayers(): string[] {
		return LAYER_ORDER.map((categoryId) => {
			const selectedIndex = this.selectedItems[categoryId];
			if (selectedIndex !== null && selectedIndex >= 0) {
				// This uses getPreviewImagePath, consistent with original generateAvatarLayers for avatar-creator
				return getPreviewImagePath(categoryId, selectedIndex);
			}
			return null;
		}).filter((path): path is string => path !== null);
	}

	generateRandomAvatar = () => {
		const newSelectedItems: SelectedItems = {};
		const INCLUDE_GLASSES_PROBABILITY = 0.4;

		for (const category of this.categories) {
			let selectedItemIndex: number;
			switch (category.id) {
				case 'beard':
				case 'accessories':
				case 'details':
					selectedItemIndex = 0; // Default to 'none' (index 0)
					break;
				case 'glasses':
					if (Math.random() < INCLUDE_GLASSES_PROBABILITY && category.maxItems > 1) {
						selectedItemIndex = Math.floor(Math.random() * (category.maxItems - 1)) + 1; // Other than 'none'
					} else {
						selectedItemIndex = 0; // 'none'
					}
					break;
				default:
					selectedItemIndex =
						category.maxItems > 0 ? Math.floor(Math.random() * category.maxItems) : 0;
					break;
			}
			newSelectedItems[category.id] = selectedItemIndex;
		}
		this.selectedItems = newSelectedItems;

		const randomColorIndex = Math.floor(Math.random() * COLORS.length);
		this.selectedAvatarColorName = COLORS[randomColorIndex];
	};

	saveAvatar = () => {
		console.log('Saving avatar configuration:', {
			username: this.username,
			selectedItems: this.selectedItems,
			color: this.selectedAvatarColorName
		});
		// Future: Add logic to save the configuration (e.g., API call, localStorage)
	};
}
