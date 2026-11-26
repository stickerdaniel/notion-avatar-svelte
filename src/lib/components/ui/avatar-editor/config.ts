import { COLORS, DEFAULT_CATEGORIES, type AvatarConfiguration, type ColorName } from './types';

export class AvatarConfigValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AvatarConfigValidationError';
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isColorName(value: string): value is ColorName {
	return COLORS.some((color) => color === value);
}

export function parseAvatarConfig(input: unknown): AvatarConfiguration {
	if (!isRecord(input)) {
		throw new AvatarConfigValidationError('Config must be an object');
	}
	const { version, username, lastModified, items, colorName } = input;
	if (typeof version !== 'number') {
		throw new AvatarConfigValidationError('Config must have a numeric version');
	}
	if (typeof username !== 'string') {
		throw new AvatarConfigValidationError('Config must have a string username');
	}
	if (typeof lastModified !== 'string') {
		throw new AvatarConfigValidationError('Config must have a lastModified date string');
	}
	if (!isRecord(items)) {
		throw new AvatarConfigValidationError('Config must have an items object');
	}
	if (typeof colorName !== 'string') {
		throw new AvatarConfigValidationError('Config must have a colorName string');
	}

	const copy: Record<string, unknown> = JSON.parse(JSON.stringify(input));
	const parsedItems: AvatarConfiguration['items'] = { ...JSON.parse(JSON.stringify(items)) };

	for (const { id, maxItems } of DEFAULT_CATEGORIES) {
		const value = items[id];
		if (value === undefined) {
			parsedItems[id] = 0;
		} else if (
			value === null ||
			(typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < maxItems)
		) {
			parsedItems[id] = value;
		} else {
			const shown = typeof value === 'number' ? String(value) : JSON.stringify(value);
			throw new AvatarConfigValidationError(
				`Config item "${id}" must be null or an integer from 0 to ${maxItems - 1}, got ${shown}`
			);
		}
	}

	return {
		...copy,
		version,
		username,
		lastModified,
		items: parsedItems,
		colorName: isColorName(colorName) ? colorName : COLORS[0]
	};
}
