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
	readonly currentConfig: AvatarConfiguration;

	// Derived from live state (for preview inside creator)
	readonly previewAvatarSvgDataUrl: string;
	readonly previewAvatarBgClass: string;

	// Saved state
	readonly savedAvatarConfiguration: AvatarConfiguration | null;

	// Derived from saved state (for display elsewhere)
	readonly avatarSvgDataUrl: string;
	readonly avatarBgClass: string;

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
	loadSavedConfig: (isInitialLoad?: boolean) => void;
	undo: () => void;
	redo: () => void;
}

export class AvatarStoreClass implements IAvatar {
	// --- The single source of truth: config as JSON string ---
	configJSON = $state<string>('');

	// Flag to indicate if changes are coming from undo/redo
	isUndoRedoOperation = $state(false);

	// Parsed version of the JSON string (derived)
	currentConfig = $derived<AvatarConfiguration>(this._parseConfigJSON());

	// --- Saved State ---
	savedAvatarConfiguration = $state<AvatarConfiguration | null>(null);

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
	private _liveAvatarLayers = $derived(this._generateLayersFromItems(this.currentConfig.items));
	previewAvatarSvgDataUrl = $state('');
	previewAvatarBgClass = $derived(
		AVATAR_COLOR_STYLES[this.currentConfig.colorName]?.base || AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	private _savedAvatarLayers = $derived(
		this._generateLayersFromItems(this.savedAvatarConfiguration?.items ?? null)
	);
	avatarSvgDataUrl = $state('');
	avatarBgClass = $derived(
		AVATAR_COLOR_STYLES[this.savedAvatarConfiguration?.colorName ?? COLORS[0]]?.base ||
			AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	constructor() {
		// Initialize with default configuration
		this._initializeDefaultConfig();

		// Initialize from saved configuration
		this.loadSavedConfig(true);

		// Setup the history tracker - must be after config initialization
		this._history = new StateHistory(
			// Getter for the current state - just return the JSON string
			() => this.configJSON,
			// Setter for restoring a state - set the JSON string
			(jsonString) => {
				console.log('StateHistory setter called with:', jsonString);
				this.configJSON = jsonString;
			}
		);

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
		const currentConfig = this._parseConfigJSON();
		updater(currentConfig);

		// Get the previous config JSON for comparison
		const oldConfigJSON = this.configJSON;

		// Update the config JSON
		const newConfigJSON = JSON.stringify(currentConfig);
		this.configJSON = newConfigJSON;

		// Log the change for debugging
		if (oldConfigJSON !== newConfigJSON) {
			console.log('Config updated from:', oldConfigJSON);
			console.log('Config updated to:', newConfigJSON);
		}
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
					this.configJSON = JSON.stringify(loadedConfig);
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
		// Set the flag to prevent circular updates - we'll reuse the same flag
		this.isUndoRedoOperation = true;

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

		// Update live state through the updateConfig method
		this.updateConfig((config) => {
			config.items = newSelectedItems;
			config.colorName = COLORS[Math.floor(Math.random() * COLORS.length)];
			config.lastModified = new Date().toISOString();
		});

		// Optionally clear save event data
		if (clearSaveData) {
			this.lastSaveTimestamp = null;
			this.lastSaveData = null;
		}

		// Reset the flag after a short delay to allow derived values to update
		setTimeout(() => {
			this.isUndoRedoOperation = false;
		}, 0);
	};

	/**
	 * Save the current live editing state to localStorage and update saved state
	 */
	saveAvatar = () => {
		const currentConfig = this._parseConfigJSON();
		const configToSave = {
			...currentConfig,
			lastModified: new Date().toISOString()
		};

		if (typeof window !== 'undefined') {
			try {
				const configJSON = JSON.stringify(configToSave);

				// Save to localStorage
				localStorage.setItem(AVATAR_CONFIG_STORAGE_KEY, configJSON);

				// Update in-memory saved state
				this.savedAvatarConfiguration = configToSave;

				// Update save event state
				this.lastSaveData = configToSave;
				this.lastSaveTimestamp = Date.now();

				console.log('Avatar configuration saved:', configToSave);
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
		if (this.canUndo) {
			console.log('Before undo, configJSON:', this.configJSON);
			// Set the flag to prevent circular updates
			this.isUndoRedoOperation = true;

			// Perform the undo
			this._history.undo();
			console.log('After undo, configJSON:', this.configJSON);

			// Reset the flag after a short delay to allow derived values to update
			setTimeout(() => {
				this.isUndoRedoOperation = false;
			}, 0);
		}
	};

	/**
	 * Redo a previously undone change
	 */
	redo = () => {
		if (this.canRedo) {
			console.log('Before redo, configJSON:', this.configJSON);
			// Set the flag to prevent circular updates
			this.isUndoRedoOperation = true;

			// Perform the redo
			this._history.redo();
			console.log('After redo, configJSON:', this.configJSON);

			// Reset the flag after a short delay to allow derived values to update
			setTimeout(() => {
				this.isUndoRedoOperation = false;
			}, 0);
		}
	};
}
