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
import { generateSvgDataUrl } from './avatar-svg-utils';
import { StateHistory } from 'runed';

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
	// Live editing state - parsed from configJSON
	readonly previewConfig: AvatarConfiguration;

	// Derived from live state (for preview inside creator)
	readonly previewSvgDataUrl: string;
	readonly previewBgClass: string;

	// Saved state
	readonly config: AvatarConfiguration | null;

	// Derived from saved state (for display elsewhere)
	readonly svgDataUrl: string;
	readonly bgClass: string;

	// Eventing
	readonly lastSaveTimestamp: number | null;
	readonly lastSaveData: AvatarConfiguration | null;

	// History state
	readonly canUndo: boolean;
	readonly canRedo: boolean;

	// Actions for modifying state
	updateConfig: (updater: (config: AvatarConfiguration) => void) => void;
	generateRandomAvatar: (clearSaveData?: boolean) => void;
	saveAvatar: () => void;
	loadconfig: (isInitialLoad?: boolean) => void;
	undo: () => void;
	redo: () => void;
}

export class AvatarStoreClass implements IAvatar {
	// --- The single source of truth: config as JSON string ---
	configJSON = $state<string>('');

	// Parsed version of the JSON string (derived)
	previewConfig = $derived<AvatarConfiguration>(this._parseConfigJSON());

	// --- Saved State ---
	config = $state<AvatarConfiguration | null>(null);

	// --- Eventing State ---
	lastSaveTimestamp = $state<number | null>(null);
	lastSaveData = $state<AvatarConfiguration | null>(null);

	// --- Categories (static) ---
	readonly categories: Category[] = DEFAULT_CATEGORIES;

	// --- History Tracking ---
	private _history: StateHistory<string> = null!;

	// Initialize properties with computed getters that depend on _history
	private _getCanUndo = () => this._history?.canUndo ?? false;
	private _getCanRedo = () => this._history?.canRedo ?? false;

	canUndo = $derived(this._getCanUndo());
	canRedo = $derived(this._getCanRedo());

	// --- Derived State Values ---
	private _previewAvatarLayers = $derived(this._generateLayersFromItems(this.previewConfig.items));
	previewSvgDataUrl = $state('');
	previewBgClass = $derived(
		AVATAR_COLOR_STYLES[this.previewConfig.colorName]?.base || AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	private _avatarLayers = $derived(this._generateLayersFromItems(this.config?.items ?? null));
	svgDataUrl = $state('');
	bgClass = $derived(
		AVATAR_COLOR_STYLES[this.config?.colorName ?? COLORS[0]]?.base ||
			AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	constructor() {
		this._initializeDefaultConfig(); // Sets initial configJSON

		// Initialize history AFTER initial configJSON is set
		this._history = new StateHistory<string>(
			() => this.configJSON, // Getter for StateHistory
			(jsonString) => {
				// Setter for StateHistory (when undo/redo applies a state)
				this.configJSON = jsonString;
			}
		);
		// Load config after history is initialized.
		// loadconfig will manage isUndoRedoOperation for initial load.
		this.loadconfig(true);

		// Setup effects to update SVG URLs when their respective layers change
		// we can't use $effect here because generateSvgDataUrl is async
		$effect(() => {
			const layers = this._previewAvatarLayers;
			if (layers.length === 0) {
				this.previewSvgDataUrl = '';
				return;
			}
			(async () => {
				this.previewSvgDataUrl = await generateSvgDataUrl(layers);
			})();
		});

		$effect(() => {
			const layers = this._avatarLayers;
			if (layers.length === 0) {
				this.svgDataUrl = '';
				return;
			}
			(async () => {
				this.svgDataUrl = await generateSvgDataUrl(layers);
			})();
		});
	}

	/**
	 * Initialize with default configuration
	 */
	private _initializeDefaultConfig(): void {
		const defaultConfig: AvatarConfiguration = {
			version: 1,
			username: '',
			items: createDefaultSelectedItems(),
			colorName: COLORS[0],
			lastModified: new Date().toISOString()
		};
		this.configJSON = JSON.stringify(defaultConfig);
	}

	/**
	 * Parse the JSON string to an AvatarConfiguration object
	 */
	private _parseConfigJSON(): AvatarConfiguration {
		try {
			if (!this.configJSON) {
				return this._createDefaultConfig();
			}
			return JSON.parse(this.configJSON) as AvatarConfiguration;
		} catch (error) {
			console.error('Error parsing config JSON:', error);
			return this._createDefaultConfig();
		}
	}

	/**
	 * Create a default config object
	 */
	private _createDefaultConfig(): AvatarConfiguration {
		return {
			version: 1,
			username: '',
			items: createDefaultSelectedItems(),
			colorName: COLORS[0],
			lastModified: new Date().toISOString()
		};
	}

	/**
	 * Update the configuration with a callback function
	 */
	updateConfig = (updater: (config: AvatarConfiguration) => void): void => {
		const currentParsedConfig = this._parseConfigJSON();
		updater(currentParsedConfig);
		currentParsedConfig.lastModified = new Date().toISOString(); // Centralized timestamp update
		this.configJSON = JSON.stringify(currentParsedConfig); // StateHistory will automatically log this change
	};

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
	loadconfig = (isInitialLoad = false) => {
		if (typeof window !== 'undefined') {
			try {
				const storedConfigJson = localStorage.getItem(AVATAR_CONFIG_STORAGE_KEY);
				if (storedConfigJson) {
					const loadedConfig = JSON.parse(storedConfigJson) as AvatarConfiguration;

					// Validate colorName
					if (!COLORS.includes(loadedConfig.colorName as ColorName)) {
						loadedConfig.colorName = COLORS[0];
					}
					this.config = loadedConfig; // Update saved state (for display elsewhere)
					this.configJSON = JSON.stringify(loadedConfig); // StateHistory will log this initial load
				} else if (isInitialLoad) {
					// Generate random if no saved config exists and it's the initial load
					this.generateRandomAvatar();
				}
			} catch (error) {
				console.error('Failed to load avatar configuration:', error);
				if (isInitialLoad) this.generateRandomAvatar();
			}
		} else if (isInitialLoad) {
			// Handle SSR case
			this.generateRandomAvatar();
		}
	};

	/**
	 * Generate random avatar configuration (affects live editing state only)
	 */
	generateRandomAvatar = () => {
		// updateConfig will handle history push.
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

		this.updateConfig((config) => {
			config.items = newSelectedItems;
			config.colorName = COLORS[Math.floor(Math.random() * COLORS.length)];
		});
	};

	/**
	 * Save the current live editing state to localStorage and update saved state
	 */
	saveAvatar = () => {
		const previewConfig = this._parseConfigJSON(); // This is the live editing state
		const configToSave = {
			...previewConfig,
			lastModified: new Date().toISOString() // re-stamp on save
		};

		if (typeof window !== 'undefined') {
			try {
				const configJSONToSave = JSON.stringify(configToSave);
				localStorage.setItem(AVATAR_CONFIG_STORAGE_KEY, configJSONToSave);
				this.config = configToSave; // Update in-memory 'saved' state
				this.lastSaveData = configToSave;
				this.lastSaveTimestamp = Date.now();
			} catch (error) {
				console.error('Failed to save avatar configuration:', error);
			}
		} else {
			console.warn('localStorage not available. Avatar configuration not saved.');
		}
	};

	/**
	 * Undo the last change to the avatar
	 */
	undo = () => {
		this._history.undo(); // StateHistory setter changes configJSON, which is logged by StateHistory
	};

	/**
	 * Redo a previously undone change
	 */
	redo = () => {
		this._history.redo(); // StateHistory setter changes configJSON, which is logged by StateHistory
	};
}
