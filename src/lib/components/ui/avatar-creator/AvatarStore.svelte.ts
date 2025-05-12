import {
	DEFAULT_CATEGORIES,
	LAYER_ORDER,
	getPreviewImagePath,
	createDefaultSelectedItems,
	type Category,
	type SelectedItems,
	type AvatarConfiguration,
	COLORS,
	type ColorName
} from './types';
import { generateAvatarSvgDataUrl } from './avatar-svg-utils';

// localStorage key
const AVATAR_CONFIG_STORAGE_KEY = 'notionAvatarConfig';

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
	// Live editing state
	previewUsername: string;
	selectedItems: SelectedItems;
	selectedAvatarColorName: ColorName;

	// Derived from live state (for preview inside creator)
	readonly previewAvatarSvgDataUrl: string;
	readonly previewAvatarBgClass: string;

	// Saved state
	readonly savedAvatarConfiguration: AvatarConfiguration | null;
	readonly username: string;
	readonly savedSelectedItems: SelectedItems | null;
	readonly savedSelectedAvatarColorName: ColorName | null;

	// Derived from saved state (for display elsewhere)
	readonly avatarSvgDataUrl: string;
	readonly avatarBgClass: string;

	// Eventing
	readonly lastSaveTimestamp: number | null;
	readonly lastSaveData: AvatarConfiguration | null;

	// Actions
	generateRandomAvatar: (clearSaveData?: boolean) => void;
	saveAvatar: () => void;
	loadSavedConfig: (isInitialLoad?: boolean) => void;
}

export class AvatarStoreClass implements IAvatar {
	// --- Live Editing State ---
	previewUsername = $state('');
	selectedItems = $state<SelectedItems>(createDefaultSelectedItems());
	selectedAvatarColorName = $state<ColorName>(COLORS[0]);

	// --- Saved State ---
	savedAvatarConfiguration = $state<AvatarConfiguration | null>(null);

	// --- Eventing State ---
	lastSaveTimestamp = $state<number | null>(null);
	lastSaveData = $state<AvatarConfiguration | null>(null);

	// --- Categories (static) ---
	readonly categories: Category[] = DEFAULT_CATEGORIES;

	// --- Derived State Values ---
	private _liveAvatarLayers = $derived(this._generateLayersFromItems(this.selectedItems));
	previewAvatarSvgDataUrl = $state('');
	previewAvatarBgClass = $derived(
		AVATAR_COLOR_STYLES[this.selectedAvatarColorName]?.base || AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	private _savedAvatarLayers = $derived(
		this._generateLayersFromItems(this.savedAvatarConfiguration?.items ?? null)
	);
	avatarSvgDataUrl = $state('');
	avatarBgClass = $derived(
		AVATAR_COLOR_STYLES[this.savedAvatarConfiguration?.colorName ?? COLORS[0]]?.base ||
			AVATAR_COLOR_STYLES[COLORS[0]].base
	);
	username = $derived(this.savedAvatarConfiguration?.username || '');
	savedSelectedItems = $derived(this.savedAvatarConfiguration?.items ?? null);
	savedSelectedAvatarColorName = $derived(this.savedAvatarConfiguration?.colorName ?? null);

	constructor() {
		// Initialize from saved configuration
		this.loadSavedConfig(true);

		// Setup effects to update SVG URLs when their respective layers change
		$effect(() => {
			const layers = this._liveAvatarLayers;
			if (layers.length === 0) {
				this.previewAvatarSvgDataUrl = '';
				return;
			}

			// Use IIFE for the async operation
			(async () => {
				this.previewAvatarSvgDataUrl = await generateAvatarSvgDataUrl(layers);
			})();
		});

		$effect(() => {
			const layers = this._savedAvatarLayers;
			if (layers.length === 0) {
				this.avatarSvgDataUrl = '';
				return;
			}

			// Use IIFE for the async operation
			(async () => {
				this.avatarSvgDataUrl = await generateAvatarSvgDataUrl(layers);
			})();
		});
	}

	/**
	 * Generate layer paths from a set of selected items
	 */
	private _generateLayersFromItems(items: SelectedItems | null): string[] {
		if (!items) return [];

		return LAYER_ORDER.map((categoryId) => {
			const selectedIndex = items[categoryId];
			if (selectedIndex !== null && selectedIndex >= 0) {
				return getPreviewImagePath(categoryId, selectedIndex);
			}
			return null;
		}).filter((path): path is string => path !== null);
	}

	/**
	 * Load saved avatar configuration from localStorage
	 */
	loadSavedConfig = (isInitialLoad = false) => {
		if (typeof window !== 'undefined') {
			try {
				const storedConfigJson = localStorage.getItem(AVATAR_CONFIG_STORAGE_KEY);
				if (storedConfigJson) {
					const loadedConfig = JSON.parse(storedConfigJson) as AvatarConfiguration;

					// Validate colorName
					if (!COLORS.includes(loadedConfig.colorName as ColorName)) {
						loadedConfig.colorName = COLORS[0];
					}

					// Update saved configuration
					this.savedAvatarConfiguration = loadedConfig;

					// Initialize live editing state from saved config
					this.previewUsername = loadedConfig.username;
					this.selectedItems = { ...loadedConfig.items };
					this.selectedAvatarColorName = loadedConfig.colorName;
				} else if (isInitialLoad) {
					// Generate random if no saved config exists and it's the initial load
					this.generateRandomAvatar(false);
				}
			} catch (error) {
				console.error('Failed to load avatar configuration:', error);
				if (isInitialLoad) this.generateRandomAvatar(false);
			}
		} else if (isInitialLoad) {
			// Handle SSR case
			this.generateRandomAvatar(false);
		}
	};

	/**
	 * Generate random avatar configuration (affects live editing state only)
	 */
	generateRandomAvatar = (clearSaveData = true) => {
		const newSelectedItems: SelectedItems = {};
		const INCLUDE_GLASSES_PROBABILITY = 0.4;

		for (const category of this.categories) {
			let selectedItemIndex: number;

			switch (category.id) {
				case 'beard':
				case 'accessories':
				case 'details':
					selectedItemIndex = 0; // Default to none
					break;

				case 'glasses':
					if (Math.random() < INCLUDE_GLASSES_PROBABILITY && category.maxItems > 1) {
						selectedItemIndex = Math.floor(Math.random() * (category.maxItems - 1)) + 1;
					} else {
						selectedItemIndex = 0;
					}
					break;

				default:
					selectedItemIndex =
						category.maxItems > 0 ? Math.floor(Math.random() * category.maxItems) : 0;
					break;
			}

			newSelectedItems[category.id] = selectedItemIndex;
		}

		// Update live state
		this.selectedItems = newSelectedItems;
		this.selectedAvatarColorName = COLORS[Math.floor(Math.random() * COLORS.length)];

		// Optionally clear save event data
		if (clearSaveData) {
			this.lastSaveTimestamp = null;
			this.lastSaveData = null;
		}
	};

	/**
	 * Save the current live editing state to localStorage and update saved state
	 */
	saveAvatar = () => {
		const currentLiveConfiguration: AvatarConfiguration = {
			version: 1,
			username: this.previewUsername,
			items: { ...this.selectedItems },
			colorName: this.selectedAvatarColorName
		};

		if (typeof window !== 'undefined') {
			try {
				// Save to localStorage
				localStorage.setItem(AVATAR_CONFIG_STORAGE_KEY, JSON.stringify(currentLiveConfiguration));

				// Update in-memory saved state
				this.savedAvatarConfiguration = currentLiveConfiguration;

				// Update save event state
				this.lastSaveData = currentLiveConfiguration;
				this.lastSaveTimestamp = Date.now();

				console.log('Avatar configuration saved:', currentLiveConfiguration);
			} catch (error) {
				console.error('Failed to save avatar configuration:', error);
			}
		} else {
			console.warn('localStorage not available. Avatar configuration not saved.');
		}
	};
}
