import {
	DEFAULT_CATEGORIES,
	LAYER_ORDER,
	getPreviewImagePath,
	type Category,
	type SelectedItems,
	type AvatarConfiguration,
	COLORS,
	type ColorName
} from './types';
import {
	generateSvgDataUrl,
	generateSvgWithoutOutlineDataUrl,
	generateSvgWithOutlineDataUrl,
	generateSvgWithColoredBackgroundDataUrl
} from './avatar-svg-utils';
import { StateHistory, PersistedState } from 'runed';

// localStorage key
const AVATAR_CONFIG_STORAGE_KEY = 'notionAvatarConfig';

// Custom error class for avatar configuration validation errors
export class AvatarConfigValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AvatarConfigValidationError';
	}
}

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

// Map Tailwind base classes from AVATAR_COLOR_STYLES to HEX codes for svg download generation
const TAILWIND_CLASS_TO_HEX_MAP: Record<string, string> = {
	'bg-rose-400': '#FB7185',
	'bg-pink-400': '#F472B6',
	'bg-purple-400': '#C084FC',
	'bg-blue-400': '#60A5FA',
	'bg-teal-400': '#2DD4BF',
	'bg-green-400': '#4ADE80',
	'bg-yellow-300': '#FDE047',
	'bg-orange-300': '#FDBA74'
};

// Interface for the Avatar store
export interface IAvatar {
	// Live editing state - parsed from configJSON (which is PersistedState.current)
	readonly config: AvatarConfiguration;

	// Derived from live state
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
	undo: () => void;
	redo: () => void;
	importConfig: (configJsonString: string) => void;
	validateAndParseConfig: (config: unknown) => AvatarConfiguration;
	downloadAvatarWithoutOutline: () => void;
	downloadAvatarWithOutline: () => void;
	downloadAvatarWithBackground: () => void;
}

export class AvatarStoreClass implements IAvatar {
	// --- The single source of truth: config as JSON string, now managed by PersistedState ---
	private _configPersistedState: PersistedState<string>;

	// Getter to maintain the configJSON property for StateHistory and internal logic
	get configJSON(): string {
		const current = this._configPersistedState.current;
		// If current is somehow not a string (possible during initialization or hydration),
		// ensure we return a string for consistent behavior
		return typeof current === 'string' ? current : JSON.stringify(current);
	}
	// Setter to allow StateHistory and other methods to update the persisted state
	set configJSON(value: string) {
		this._configPersistedState.current = value;
	}

	// Parsed version of the JSON string (derived from PersistedState's current value)
	config = $derived<AvatarConfiguration>(this._parseConfigJSON());

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
	private _avatarLayers = $derived(this._generateLayersFromItems(this.config.items));
	svgDataUrl = $state('');
	bgClass = $derived(
		AVATAR_COLOR_STYLES[this.config.colorName as ColorName]?.base ||
			AVATAR_COLOR_STYLES[COLORS[0]].base
	);

	constructor() {
		const initialRandomConfig = this._generateInitialRandomConfig();
		const initialRandomConfigJSON = JSON.stringify(initialRandomConfig);

		this._configPersistedState = new PersistedState<string>(
			AVATAR_CONFIG_STORAGE_KEY,
			initialRandomConfigJSON
		);

		this._history = new StateHistory<string>(
			() => this.configJSON,
			(jsonString) => {
				this.configJSON = jsonString;
			}
		);

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
	 * Generates a random set of avatar items and a color name.
	 * This is the core randomization logic used by both initial generation and user-triggered randomization.
	 */
	private _getRandomItemsAndColor(): { items: SelectedItems; colorName: ColorName } {
		const items: SelectedItems = {};
		const INCLUDE_GLASSES_PROBABILITY = 0.4;

		for (const category of this.categories) {
			let selectedItemIndex: number;
			switch (category.id) {
				case 'beard':
				case 'accessories':
				case 'details':
					selectedItemIndex = 0; // Default to none for these categories
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
			items[category.id] = selectedItemIndex;
		}
		const colorName = COLORS[Math.floor(Math.random() * COLORS.length)];
		return { items, colorName };
	}

	/**
	 * Creates a new, fully randomized AvatarConfiguration object.
	 * This is used for the initial state if nothing is in localStorage.
	 */
	private _generateInitialRandomConfig(): AvatarConfiguration {
		const { items, colorName } = this._getRandomItemsAndColor();
		return {
			version: 1,
			username: '', // Initial random avatars can have an empty username
			items,
			colorName,
			lastModified: new Date().toISOString()
		};
	}

	/**
	 * Parse the JSON string to an AvatarConfiguration object
	 */
	private _parseConfigJSON(): AvatarConfiguration {
		try {
			// Use the getter for configJSON which reads from PersistedState
			const currentJson = this.configJSON;
			if (!currentJson) {
				// This case should ideally be handled by PersistedState's initial value
				return this._generateInitialRandomConfig();
			}
			return this.validateAndParseConfig(JSON.parse(currentJson));
		} catch (error) {
			console.error('Error parsing config JSON:', error);
			// Fallback to default if parsing PersistedState's content fails
			return this._generateInitialRandomConfig();
		}
	}

	/**
	 * Validate and parse a config object into a valid AvatarConfiguration
	 * @throws AvatarConfigValidationError if validation fails
	 */
	validateAndParseConfig(config: unknown): AvatarConfiguration {
		// Check if it has the basic required properties
		if (!config || typeof config !== 'object') {
			throw new AvatarConfigValidationError('Config must be an object');
		}

		// Safe type assertion after basic validation
		const avatarConfig = config as Partial<AvatarConfiguration>;

		if (typeof avatarConfig.version !== 'number') {
			throw new AvatarConfigValidationError('Config must have a numeric version');
		}
		if (typeof avatarConfig.username !== 'string') {
			throw new AvatarConfigValidationError('Config must have a string username');
		}
		if (typeof avatarConfig.lastModified !== 'string') {
			throw new AvatarConfigValidationError('Config must have a lastModified date string');
		}
		if (!avatarConfig.items || typeof avatarConfig.items !== 'object') {
			throw new AvatarConfigValidationError('Config must have an items object');
		}
		if (typeof avatarConfig.colorName !== 'string') {
			throw new AvatarConfigValidationError('Config must have a colorName string');
		}

		// Validate colorName is in available colors, or default it
		if (!COLORS.includes(avatarConfig.colorName as ColorName)) {
			avatarConfig.colorName = COLORS[0];
		}

		// At this point we've validated all required fields
		return avatarConfig as AvatarConfiguration;
	}

	/**
	 * Update the configuration with a callback function
	 */
	updateConfig = (updater: (config: AvatarConfiguration) => void): void => {
		const currentParsedConfig = this._parseConfigJSON();
		updater(currentParsedConfig);
		currentParsedConfig.lastModified = new Date().toISOString(); // Centralized timestamp update
		this.configJSON = JSON.stringify(currentParsedConfig); // Updates PersistedState via setter, StateHistory logs this
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
	 * Generate random avatar configuration (affects live editing state only)
	 */
	generateRandomAvatar = () => {
		const { items, colorName } = this._getRandomItemsAndColor();
		this.updateConfig((config) => {
			config.items = items;
			config.colorName = colorName;
			// username is not changed here, only items and color
		});
	};

	/**
	 * Save the current live editing state to localStorage and update saved state
	 */
	saveAvatar = () => {
		const previewConfig = this._parseConfigJSON(); // This is the live editing state from PersistedState
		const configToSave = {
			...previewConfig,
			lastModified: new Date().toISOString() // re-stamp on save
		};

		// PersistedState handles saving to localStorage automatically when its '.current' is set.		// We just need to ensure our internal representation of "saved" data for eventing is updated.
		this.configJSON = JSON.stringify(configToSave); // This updates PersistedState & triggers StateHistory.

		this.lastSaveData = configToSave; // Update for eventing/UI feedback
		this.lastSaveTimestamp = Date.now(); // Update for eventing/UI feedback
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

	/**
	 * Import an avatar configuration from an external source into the live editing state.
	 * @throws AvatarConfigValidationError if the config is invalid or JSON is malformed
	 */
	importConfig = (configJsonString: string): void => {
		let parsedConfig: unknown;
		try {
			parsedConfig = JSON.parse(configJsonString);
		} catch {
			// If JSON parsing fails, throw a specific error
			throw new AvatarConfigValidationError('Invalid JSON format');
		}

		// Will throw AvatarConfigValidationError if validation fails
		const validConfig = this.validateAndParseConfig(parsedConfig);

		// Update ONLY the live editing state (configJSON drives previewConfig)
		// History will automatically track this change to configJSON (which updates PersistedState).
		this.configJSON = JSON.stringify(validConfig);
	};

	/**
	 * Downloads the avatar SVG without an outline (completely transparent background)
	 */
	downloadAvatarWithoutOutline = async () => {
		const layers = this._avatarLayers;
		if (layers.length === 0) {
			console.error('No avatar to download');
			return;
		}

		try {
			const svgDataUrl = await generateSvgWithoutOutlineDataUrl(layers);
			this._downloadSvg(
				svgDataUrl,
				`avatar-${this.config.username || 'unnamed'}-no-outline`,
				'no-outline'
			);
		} catch (error) {
			console.error('Failed to download avatar:', error);
		}
	};

	/**
	 * Downloads the avatar SVG with outline but transparent background
	 */
	downloadAvatarWithOutline = async () => {
		const layers = this._avatarLayers;
		if (layers.length === 0) {
			console.error('No avatar to download');
			return;
		}

		try {
			const svgDataUrl = await generateSvgWithOutlineDataUrl(layers);
			this._downloadSvg(
				svgDataUrl,
				`avatar-${this.config.username || 'unnamed'}-with-outline`,
				'with-outline'
			);
		} catch (error) {
			console.error('Failed to download avatar with outline:', error);
		}
	};

	/**
	 * Downloads the avatar SVG with the current background color
	 */
	downloadAvatarWithBackground = async () => {
		const layers = this._avatarLayers;
		if (layers.length === 0) {
			console.error('No avatar to download');
			return;
		}

		try {
			// Get the hex color for the current color name
			const colorName = this.config.colorName as ColorName;
			const tailwindClass =
				AVATAR_COLOR_STYLES[colorName]?.base || AVATAR_COLOR_STYLES[COLORS[0]].base;
			const backgroundColor = TAILWIND_CLASS_TO_HEX_MAP[tailwindClass] || '#FFFFFF';

			const svgDataUrl = await generateSvgWithColoredBackgroundDataUrl(layers, backgroundColor);
			this._downloadSvg(
				svgDataUrl,
				`avatar-${this.config.username || 'unnamed'}-with-bg`,
				'with-background'
			);
		} catch (error) {
			console.error('Failed to download avatar with background:', error);
		}
	};

	/**
	 * Helper method to trigger the browser download of an SVG file
	 * @param svgDataUrl The SVG data URL
	 * @param filename The name of the file without extension
	 * @param downloadType The type of download for analytics tracking
	 */
	private _downloadSvg(svgDataUrl: string, filename: string, downloadType: string): void {
		if (typeof window === 'undefined') return;

		try {
			// Convert data URL to blob - force download approach for Vercel compatibility
			const [header, base64Data] = svgDataUrl.split(',');
			const binaryString = atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const blob = new Blob([bytes], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.style.display = 'none'; // Hide the link completely
			a.href = url;
			a.download = `${filename}.svg`;
			a.setAttribute('aria-label', `Download ${filename}.svg`);

			// Force download behavior
			a.setAttribute('target', '_blank');
			a.setAttribute('rel', 'noopener noreferrer');

			// Add Umami analytics tracking data attributes
			a.setAttribute('data-umami-event', 'avatar-download');
			a.setAttribute('data-umami-event-type', downloadType);
			a.setAttribute('data-umami-event-config', JSON.stringify(this.config));

			document.body.appendChild(a);

			// Use dispatchEvent for more reliable clicking
			const clickEvent = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			});
			a.dispatchEvent(clickEvent);

			// Clean up with longer delay for Vercel
			setTimeout(() => {
				if (document.body.contains(a)) {
					document.body.removeChild(a);
				}
				URL.revokeObjectURL(url);
			}, 1000);
		} catch (error) {
			console.error('Failed to download SVG:', error);
		}
	}
}
