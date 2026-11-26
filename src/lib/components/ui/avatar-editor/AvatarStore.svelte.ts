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
import { AvatarConfigValidationError, parseAvatarConfig } from './config';
import { StateHistory, PersistedState } from 'runed';

export { AvatarConfigValidationError };

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

const BASE_CLASS_HEX: Record<string, string> = {
	'bg-rose-400': '#FB7185',
	'bg-pink-400': '#F472B6',
	'bg-purple-400': '#C084FC',
	'bg-blue-400': '#60A5FA',
	'bg-teal-400': '#2DD4BF',
	'bg-green-400': '#4ADE80',
	'bg-yellow-300': '#FDE047',
	'bg-orange-300': '#FDBA74'
};

export interface IAvatar {
	readonly config: AvatarConfiguration;

	readonly svgDataUrl: string;
	readonly bgClass: string;

	readonly lastSaveTimestamp: number | null;
	readonly lastSaveData: AvatarConfiguration | null;

	readonly canUndo: boolean;
	readonly canRedo: boolean;

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
	private _configPersistedState: PersistedState<string>;

	private readonly _fallbackConfigJSON: string;
	private _usingFallback = $state(false);

	get configJSON(): string {
		if (this._usingFallback) return this._fallbackConfigJSON;
		return this._readStoredJSON() ?? this._fallbackConfigJSON;
	}
	set configJSON(value: string) {
		this._configPersistedState.current = value;
		this._usingFallback = false;
	}

	config = $derived<AvatarConfiguration>(this._parseConfigJSON());

	lastSaveTimestamp = $state<number | null>(null);
	lastSaveData = $state<AvatarConfiguration | null>(null);

	readonly categories: Category[] = DEFAULT_CATEGORIES;

	private readonly _history: StateHistory<string>;

	canUndo = $derived.by(() => this._history.canUndo);
	canRedo = $derived.by(() => this._history.canRedo);

	private _avatarLayers = $derived(this._generateLayersFromItems(this.config.items));
	svgDataUrl = $state('');
	private _renderGeneration = 0;
	bgClass = $derived(AVATAR_COLOR_STYLES[this.config.colorName].base);

	constructor() {
		this._fallbackConfigJSON = JSON.stringify(this._generateInitialRandomConfig());

		this._configPersistedState = new PersistedState<string>(
			AVATAR_CONFIG_STORAGE_KEY,
			this._fallbackConfigJSON
		);

		try {
			parseAvatarConfig(JSON.parse(this._readStoredJSON() ?? ''));
		} catch (error) {
			console.error(
				'Stored avatar config is invalid, using a random one until the next edit:',
				error
			);
			this._usingFallback = true;
		}

		this._history = new StateHistory<string>(
			() => this.configJSON,
			(jsonString) => {
				this.configJSON = jsonString;
			}
		);

		$effect(() => {
			const layers = this._avatarLayers;
			const generation = ++this._renderGeneration;
			if (layers.length === 0) {
				this.svgDataUrl = '';
				return;
			}
			generateSvgDataUrl(layers)
				.then((svgDataUrl) => {
					if (generation === this._renderGeneration) this.svgDataUrl = svgDataUrl;
				})
				.catch((error: unknown) => {
					console.error('Failed to render avatar:', error);
				});
		});
	}

	private _getRandomItemsAndColor(): { items: SelectedItems; colorName: ColorName } {
		const items: SelectedItems = {};
		const INCLUDE_GLASSES_PROBABILITY = 0.4;

		for (const category of this.categories) {
			let selectedItemIndex: number;
			switch (category.id) {
				case 'beard':
				case 'accessories':
				case 'details':
					selectedItemIndex = 0;
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

	private _generateInitialRandomConfig(): AvatarConfiguration {
		const { items, colorName } = this._getRandomItemsAndColor();
		return {
			version: 1,
			username: '',
			items,
			colorName,
			lastModified: new Date().toISOString()
		};
	}

	private _readStoredJSON(): string | undefined {
		const stored: unknown = this._configPersistedState.current;
		if (stored === undefined) return undefined;
		return typeof stored === 'string' ? stored : JSON.stringify(stored);
	}

	private _parseConfigJSON(): AvatarConfiguration {
		try {
			return this.validateAndParseConfig(JSON.parse(this.configJSON));
		} catch (error) {
			console.error('Error parsing config JSON:', error);
			return parseAvatarConfig(JSON.parse(this._fallbackConfigJSON));
		}
	}

	validateAndParseConfig(config: unknown): AvatarConfiguration {
		return parseAvatarConfig(config);
	}

	updateConfig = (updater: (config: AvatarConfiguration) => void): void => {
		const currentParsedConfig = this._parseConfigJSON();
		updater(currentParsedConfig);
		currentParsedConfig.lastModified = new Date().toISOString();
		this.configJSON = JSON.stringify(currentParsedConfig);
	};

	private _generateLayersFromItems(items: SelectedItems | null): string[] {
		if (!items) return [];
		return LAYER_ORDER.flatMap((categoryId) => {
			const selectedIndex = items[categoryId];
			if (selectedIndex === null || selectedIndex < 0) return [];
			const path = getPreviewImagePath(categoryId, selectedIndex);
			return path ? [path] : [];
		});
	}

	generateRandomAvatar = () => {
		const { items, colorName } = this._getRandomItemsAndColor();
		this.updateConfig((config) => {
			config.items = items;
			config.colorName = colorName;
		});
	};

	saveAvatar = () => {
		const previewConfig = this._parseConfigJSON();
		const configToSave = {
			...previewConfig,
			lastModified: new Date().toISOString()
		};

		this.configJSON = JSON.stringify(configToSave);

		this.lastSaveData = configToSave;
		this.lastSaveTimestamp = Date.now();
	};

	undo = () => {
		this._history.undo();
	};

	redo = () => {
		this._history.redo();
	};

	importConfig = (configJsonString: string): void => {
		let parsedConfig: unknown;
		try {
			parsedConfig = JSON.parse(configJsonString);
		} catch {
			throw new AvatarConfigValidationError('Invalid JSON format');
		}

		const validConfig = this.validateAndParseConfig(parsedConfig);

		this.configJSON = JSON.stringify(validConfig);
	};

	downloadAvatarWithoutOutline = () =>
		this._downloadAvatar('no-outline', 'no-outline', generateSvgWithoutOutlineDataUrl);

	downloadAvatarWithOutline = () =>
		this._downloadAvatar('with-outline', 'with-outline', generateSvgWithOutlineDataUrl);

	downloadAvatarWithBackground = () =>
		this._downloadAvatar('with-bg', 'with-background', (layers) =>
			generateSvgWithColoredBackgroundDataUrl(layers, BASE_CLASS_HEX[this.bgClass] ?? '#FFFFFF')
		);

	private async _downloadAvatar(
		fileSuffix: string,
		downloadType: string,
		generate: (layers: string[]) => Promise<string>
	): Promise<void> {
		const layers = this._avatarLayers;
		if (layers.length === 0) {
			console.error('No avatar to download');
			return;
		}

		try {
			const svgDataUrl = await generate(layers);
			const bytes = Uint8Array.from(atob(svgDataUrl.split(',')[1]), (char) => char.charCodeAt(0));
			const url = URL.createObjectURL(new Blob([bytes], { type: 'image/svg+xml' }));

			const a = document.createElement('a');
			a.href = url;
			a.download = `avatar-${this.config.username || 'unnamed'}-${fileSuffix}.svg`;
			a.style.display = 'none';
			a.target = '_blank';

			a.setAttribute('data-umami-event', 'avatar-download');
			a.setAttribute('data-umami-event-type', downloadType);
			a.setAttribute('data-umami-event-color', this.config.colorName);

			document.body.appendChild(a);
			a.click();

			setTimeout(() => {
				a.remove();
				URL.revokeObjectURL(url);
			}, 1000);
		} catch (error) {
			console.error('Failed to download avatar:', error);
		}
	}
}
