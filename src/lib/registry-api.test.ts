import type { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
import type { Context } from 'runed';
import type { Component } from 'svelte';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ButtonProps } from '$lib/components/ui/button/index.js';
import type { ToggleVariants } from '$lib/components/ui/toggle/index.js';
import type AnimatedDiceButton from '$lib/components/ui/avatar-editor/animated-dice-button.svelte';
import type AvatarEditor from '$lib/components/ui/avatar-editor/avatar-editor.svelte';
import type CategorySelector from '$lib/components/ui/avatar-editor/category-selector.svelte';
import type ColorSelector from '$lib/components/ui/avatar-editor/color-selector.svelte';
import type RadioToggleGroup from '$lib/components/ui/radio-toggle-group/radio-toggle-group.svelte';
import type RadioToggleGroupItem from '$lib/components/ui/radio-toggle-group/radio-toggle-group-item.svelte';
import type {
	getRadioToggleGroupCtx,
	setRadioToggleGroupCtx
} from '$lib/components/ui/radio-toggle-group/radio-toggle-group.svelte';
import type {
	AVATAR_COLOR_STYLES,
	AvatarStoreClass,
	IAvatar
} from '$lib/components/ui/avatar-editor/AvatarStore.svelte';
import type { avatarContext } from '$lib/components/ui/avatar-editor/avatarContext';
import type { parseAvatarConfig } from '$lib/components/ui/avatar-editor/config';
import type {
	AvatarConfiguration,
	Category,
	COLORS,
	ColorName,
	DEFAULT_CATEGORIES,
	getPartImagePath,
	getPreviewImagePath,
	LAYER_ORDER,
	SelectedItems
} from '$lib/components/ui/avatar-editor/types';
import type {
	generateSvgDataUrl,
	generateSvgWithColoredBackgroundDataUrl,
	generateSvgWithOutlineDataUrl,
	generateSvgWithoutOutlineDataUrl,
	SvgGenerationOptions
} from '$lib/components/ui/avatar-editor/avatar-svg-utils';
import * as editorIndex from '$lib/components/ui/avatar-editor/index';
import * as radioIndex from '$lib/components/ui/radio-toggle-group/index';
import * as avatarStore from '$lib/components/ui/avatar-editor/AvatarStore.svelte';
import * as avatarContextModule from '$lib/components/ui/avatar-editor/avatarContext';
import * as configModule from '$lib/components/ui/avatar-editor/config';
import * as typesModule from '$lib/components/ui/avatar-editor/types';
import * as svgUtils from '$lib/components/ui/avatar-editor/avatar-svg-utils';
import * as radioToggleGroupModule from '$lib/components/ui/radio-toggle-group/radio-toggle-group.svelte';
import * as avatarEditorModule from '$lib/components/ui/avatar-editor/avatar-editor.svelte';

type ComponentApi<C> =
	C extends Component<infer Props, infer _Exports, infer Bindings>
		? { props: Props; bindings: Bindings }
		: never;

type Colour = 'rose' | 'pink' | 'purple' | 'blue' | 'teal' | 'green' | 'yellow' | 'orange';

type Items = { [key: string]: number | null };

type CategoryShape = { id: string; name: string; maxItems: number };

type Config = {
	version: number;
	username: string;
	items: Items;
	colorName: Colour;
	lastModified: string;
};

function exportNames(module: object): string[] {
	return Object.keys(module).sort();
}

describe('registry consumer API', () => {
	it('avatar-editor/index', () => {
		expect(exportNames(editorIndex)).toEqual([
			'AnimatedDiceButton',
			'AvatarEditor',
			'AvatarStoreClass',
			'COLORS',
			'CategorySelector',
			'ColorSelector',
			'DEFAULT_CATEGORIES',
			'LAYER_ORDER',
			'avatarContext',
			'default',
			'generateSvgDataUrl',
			'generateSvgWithColoredBackgroundDataUrl',
			'generateSvgWithOutlineDataUrl',
			'generateSvgWithoutOutlineDataUrl',
			'getPartImagePath',
			'getPreviewImagePath'
		]);

		expectTypeOf<ComponentApi<typeof AvatarEditor>>().toEqualTypeOf<{
			props: Record<string, never>;
			bindings: '';
		}>();
		expectTypeOf<ComponentApi<typeof AnimatedDiceButton>>().toEqualTypeOf<{
			props: {
				class?: string;
				variant?: ButtonProps['variant'];
				size?: ButtonProps['size'];
				tooltipText?: string;
				onDicethrow?: () => void;
				disabled?: boolean;
			};
			bindings: '';
		}>();
		expectTypeOf<ComponentApi<typeof CategorySelector>>().toEqualTypeOf<{
			props: {
				activeTab?: string;
				categories: CategoryShape[];
				currentSelectedItems: Items;
				onItemSelect: (categoryId: string, itemIndex: number) => void;
			};
			bindings: 'activeTab';
		}>();
		expectTypeOf<ComponentApi<typeof ColorSelector>>().toEqualTypeOf<{
			props: {
				selectedValue: Colour | undefined;
				onColorSelect: (color: Colour) => void;
			};
			bindings: '';
		}>();
	});

	it('radio-toggle-group/index', () => {
		expect(exportNames(radioIndex)).toEqual([
			'Item',
			'RadioToggleGroup',
			'RadioToggleGroupItem',
			'Root'
		]);

		expectTypeOf<ComponentApi<typeof RadioToggleGroup>>().toEqualTypeOf<{
			props: RadioGroupPrimitive.RootProps & ToggleVariants;
			bindings: 'ref' | 'value';
		}>();
		expectTypeOf<ComponentApi<typeof RadioToggleGroupItem>>().toEqualTypeOf<{
			props: RadioGroupPrimitive.ItemProps & ToggleVariants;
			bindings: 'ref' | 'value';
		}>();
	});

	it('AvatarStore.svelte', () => {
		expect(exportNames(avatarStore)).toEqual([
			'AVATAR_COLOR_STYLES',
			'AvatarConfigValidationError',
			'AvatarStoreClass'
		]);

		expectTypeOf<ConstructorParameters<typeof AvatarStoreClass>>().toEqualTypeOf<[]>();
		expectTypeOf<Pick<AvatarStoreClass, keyof AvatarStoreClass>>().toEqualTypeOf<{
			configJSON: string;
			config: Config;
			lastSaveTimestamp: number | null;
			lastSaveData: Config | null;
			readonly categories: CategoryShape[];
			canUndo: boolean;
			canRedo: boolean;
			svgDataUrl: string;
			bgClass: string;
			validateAndParseConfig(config: unknown): Config;
			updateConfig: (updater: (config: Config) => void) => void;
			generateRandomAvatar: () => void;
			saveAvatar: () => void;
			undo: () => void;
			redo: () => void;
			importConfig: (configJsonString: string) => void;
			downloadAvatarWithoutOutline: () => Promise<void>;
			downloadAvatarWithOutline: () => Promise<void>;
			downloadAvatarWithBackground: () => Promise<void>;
		}>();
		expectTypeOf<IAvatar>().toEqualTypeOf<{
			readonly config: Config;
			readonly svgDataUrl: string;
			readonly bgClass: string;
			readonly lastSaveTimestamp: number | null;
			readonly lastSaveData: Config | null;
			readonly canUndo: boolean;
			readonly canRedo: boolean;
			updateConfig: (updater: (config: Config) => void) => void;
			generateRandomAvatar: (clearSaveData?: boolean) => void;
			saveAvatar: () => void;
			undo: () => void;
			redo: () => void;
			importConfig: (configJsonString: string) => void;
			validateAndParseConfig: (config: unknown) => Config;
			downloadAvatarWithoutOutline: () => void;
			downloadAvatarWithOutline: () => void;
			downloadAvatarWithBackground: () => void;
		}>();
		expectTypeOf<typeof AVATAR_COLOR_STYLES>().toEqualTypeOf<
			Record<Colour, { base: string; hover: string; selected: string }>
		>();
	});

	it('avatarContext', () => {
		expect(exportNames(avatarContextModule)).toEqual(['avatarContext']);

		expectTypeOf<typeof avatarContext>().toEqualTypeOf<Context<AvatarStoreClass>>();
	});

	it('config', () => {
		expect(exportNames(configModule)).toEqual(['AvatarConfigValidationError', 'parseAvatarConfig']);

		expectTypeOf<typeof parseAvatarConfig>().toEqualTypeOf<(input: unknown) => Config>();
	});

	it('types', () => {
		expect(exportNames(typesModule)).toEqual([
			'COLORS',
			'DEFAULT_CATEGORIES',
			'LAYER_ORDER',
			'getPartImagePath',
			'getPreviewImagePath'
		]);

		expectTypeOf<AvatarConfiguration>().toEqualTypeOf<Config>();
		expectTypeOf<Category>().toEqualTypeOf<CategoryShape>();
		expectTypeOf<SelectedItems>().toEqualTypeOf<Items>();
		expectTypeOf<ColorName>().toEqualTypeOf<Colour>();
		expectTypeOf<typeof COLORS>().toEqualTypeOf<
			readonly ['rose', 'pink', 'purple', 'blue', 'teal', 'green', 'yellow', 'orange']
		>();
		expectTypeOf<typeof DEFAULT_CATEGORIES>().toEqualTypeOf<CategoryShape[]>();
		expectTypeOf<typeof LAYER_ORDER>().toEqualTypeOf<string[]>();
		expectTypeOf<typeof getPreviewImagePath>().toEqualTypeOf<
			(category: string, index: number) => string
		>();
		expectTypeOf<typeof getPartImagePath>().toEqualTypeOf<
			(category: string, index: number) => string
		>();
	});

	it('avatar-svg-utils', () => {
		expect(exportNames(svgUtils)).toEqual([
			'generateSvgDataUrl',
			'generateSvgWithColoredBackgroundDataUrl',
			'generateSvgWithOutlineDataUrl',
			'generateSvgWithoutOutlineDataUrl'
		]);

		expectTypeOf<SvgGenerationOptions>().toEqualTypeOf<{
			includeOutlineFilter?: boolean;
			backgroundColor?: string | null;
		}>();
		expectTypeOf<typeof generateSvgDataUrl>().toEqualTypeOf<
			(layers: string[], flipped?: boolean) => Promise<string>
		>();
		expectTypeOf<typeof generateSvgWithoutOutlineDataUrl>().toEqualTypeOf<
			(layers: string[], flipped?: boolean) => Promise<string>
		>();
		expectTypeOf<typeof generateSvgWithOutlineDataUrl>().toEqualTypeOf<
			(layers: string[], flipped?: boolean) => Promise<string>
		>();
		expectTypeOf<typeof generateSvgWithColoredBackgroundDataUrl>().toEqualTypeOf<
			(layers: string[], backgroundColor: string, flipped?: boolean) => Promise<string>
		>();
	});

	it('radio-toggle-group.svelte', () => {
		expect(exportNames(radioToggleGroupModule)).toEqual([
			'default',
			'getRadioToggleGroupCtx',
			'setRadioToggleGroupCtx'
		]);

		expectTypeOf<typeof setRadioToggleGroupCtx>().toEqualTypeOf<(props: ToggleVariants) => void>();
		expectTypeOf<typeof getRadioToggleGroupCtx>().toEqualTypeOf<() => ToggleVariants>();
	});

	it('avatar-editor.svelte', () => {
		expect(exportNames(avatarEditorModule)).toEqual(['default']);
	});
});
